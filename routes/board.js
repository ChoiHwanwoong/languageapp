var express = require('express');
var router = express.Router();
var path = require('path');

var nowDate = Date.now();

//날짜포맷 지원 moment팩키지 참조 
var moment = require('moment');

//ORM DB객체 참조 
var db = require('../models/index');

// 파일 업로드
var multer = require('multer');
var fs=  require('fs');

// 파일 다운로드
var mime = require('mime');

const { response } = require('express');
var storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, 'upload');
    },
    filename: (request, file, callback) => {
        // console.log("file!!!!", file)
        const basename = file.originalname;
        console.log("file?", file)
        // const date = Date.now();
        nowDate = Date.now();
        const myfilename = nowDate + "_" + basename;

        console.log(myfilename);

        callback(null, myfilename);
    }
});

var upload = multer({
    storage: storage,
    dest: 'uploads/'
})

router.get('/list', async(req, res, next) => {

    
    if(req.session.isLogined != undefined){
        console.log("서버 로그인 여부 확인 세션값:",req.session.isLogined);
        console.log("서버 로그인 사용자 세션 데이터:",req.session.loginUser);
    }

    //DB에서 게시글 목록 데이터를 조회
    var boardList = await db.Article.findAll();
    res.render('boards/list.ejs',{boardList,moment});
  });


//게시글 등록 웹페이지 반환-GET/
router.get('/create',async(req,res)=>{
    res.render('boards/create');
});

//게시글 등록- 게시글 등록 데이터 처리-POST
//호출주소가 같더라도 호출방식이 다르면 개별적으로 호출가능
router.post('/create',upload.single('file'), async(req,res)=>{

    //웹브라우저에서 form태그내 전달되는 데이터 추출
    var title = req.body.title; //사용자가 입력한 게시글 제목값을 추출
    var contents =req.body.contents;
    var regist_userid = req.body.userId;


    if (req.file != undefined) {
        var myfilename = req.file.originalname;
        var path = nowDate + "_"
        var file_name = path + myfilename
    } else {
        var file_name = "없음";
    }
    

    //추출된 사용자 입력값을 DB에 저장
    var articleData ={
        board_idx:1,
        title,
        contents,
        file_name,
        view_cnt:0,
        ip_address:req.ip,
        display_yn:'Y',
        regist_date:Date.now(),
        regist_userid,
    };

    //orm model를 이용해 데이터를 등록처리
    var registArticleData = await db.Article.create(articleData);

    //특정 화면(뷰)를 전달하거나 또는 특정 페이지로 이동
    //게시글 목록 페이지(URL주소)로 이동
    res.redirect('/boards/list');
});

router.get('/download/:file_name', function(req, res, next) {
    var file = "upload/" + req.params.file_name;

    try {
      if (fs.existsSync(file)) { // 파일이 존재하는지 체크
        var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
        var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴

        console.log(filename)
        console.log(mimetype)

        res.setHeader('Content-disposition', 'attachment; filename=' + filename); // 다운받아질 파일명 설정
        res.setHeader('Content-type', mimetype); // 파일 형식 지정
    
        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
    } else {
        res.send('해당 파일이 없습니다.');  
        return;
    }
    } catch (e) { // 에러 발생시
    console.log(e);
    res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    return;
    }
});


//게시글 수정 데이터 처리 -PUT-사용자 입력한 데이터를 기반으로 DB데이터를 수정하고 목록페이지로 이동
router.post('/modify',async(req,res)=>{

    //사용자가 form태그내에서 입려한 수정데이터를 추출
    const articleIdx = req.body.articleIdx; //히든필드의 게시글 고유번호 받아오기
    const title = req.body.title;
    const contents = req.body.contents;

    console.log("사용자가 수정한 게시글제목 데이터: ",title);

    //수정할 데이터 준비 및 DB에 데이터 수정처리
    var updateArticle = {
        title,
        contents,
        modify_date:Date.now(),
    }

    var updatedCnt = await db.Article.update(updateArticle,{where:{article_idx:articleIdx}});


    //데이터 수정이 완료되면 게시글 목록 페이지로 이동처리
    res.redirect('/boards/list');

});


//게시글 삭제 요청 처리
router.get('/delete',async(req,res)=>{

    //삭제하고자 하는 게시글 고유번호를 추출
    const articleIdx = req.query.idx;
    console.log("삭제하고자 하는 게시글 번호:",articleIdx);

    //해당 게시글 번호 기준으로 해당 게시글 DB에서 삭제처리하기
    var deletedCnt = await db.Article.destroy({where:{article_idx:articleIdx}});

    //해당 게시글이 삭제가 완료되면 게시글 목록 페이지로 이동하기
    res.redirect('/boards/list');

});




//게시글 수정 웹페이지 호출
router.get('/modify/:idx',async(req,res)=>{

    //파라메터로 전달되는 값을 추출하기
    //URL파라메터 로 전달되는 값은 와일드카드에서 지정한 키값으로 req.params.키값 으로 추출이 가능합니다.
    const articleIdx = req.params.idx;

    //해당 게시글 고유번호에 해당하는 단일게시글 정보를 DB에서 조회
    var article = await db.Article.findOne({where:{article_idx:articleIdx}});

    //단일게시글 조회수 증가 수정처리 
    var updateArticle ={
        view_cnt:article.view_cnt +1,
        modify_date:Date.now(),
    }

    //조회수 DB 수정 처리 
    await db.Article.update(updateArticle,{where:{article_idx:articleIdx}});

    //조회 게시글의 조회수 갱신
    article.view_cnt +=1;

    res.render('boards/modify',{article});
});




  module.exports = router;
  