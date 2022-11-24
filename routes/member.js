var express = require('express');
var router = express.Router();

//passport 객체 참조
const passport = require('passport');

//bcryptjs참조
const bcrypt = require('bcryptjs');

//db객체 참조
const db = require('../models/index');

//권한 미들웨어 참조 
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');


//회원가입 페이지
router.get('/entry', async(req, res, next)=> {
  res.render('member/entry');
});

//회원가입 정보처리 라우팅 메소드
//localhost:3001/member/entry
router.post('/entry', async(req, res, next)=> {

    //회원정보를 수집하고
    var userid = req.body.userid;
    var userpwd = req.body.userpwd;
    var username = req.body.username;
    var userphone = req.body.userphone;
  //사용자 입력 암호를 해쉬암호화 기법 적용한 암호화된 문자열 생성하기
  var encryptPwd = await bcrypt.hash(userpwd,12);

  //회원정보를 member테이블에 저장처리하기
  var member ={
    userid,
    userpwd:encryptPwd,
    username,
    userphone
  };

  //member테이블에 회원정보 저장하기
  await db.Member.create(member);


  //회원가입 등록 처리 후 특정 페이지로 이동시키기
  res.redirect("/boards/list");

});

//회원로그인 페이지 로딩 라우팅 메소드
//localhost:3001/member/login
router.get('/login', async(req, res, next)=> {
    res.render('member/login',{loginResult:"",loginError:req.flash('loginError')});
  });

//Case1: 일반적인 방식으로 로그인 처리하기-ONLY EXPRESS-SESSION만 이용해 구현함.. 
router.post('/login1', async(req, res, next)=> {

  //사용자가 로그인시 입력한 아이디/암호를 수집
  var userid = req.body.userid;
  var userpwd = req.body.userpwd;
  
  //step1:동일한 아이디의 사용자 정보가 존재하는 체크
  var member = await db.Member.findOne({where:{userid:userid}});

  //로그인 처리 결과 메시지 변수
  var loginResult = "";

  if(member != null){
    //사용자 아이디가 존재하는경우 
    loginResult ="사용자 아이디가 존재합니다.";

    //암호가 동일하지 체크
    //DB의 암호화된 문자열과 로그인 사용자의 암호(텍스트)를 동일한지를 체크
    var isCorrectPwd = await bcrypt.compare(userpwd,member.userpwd);

      if(isCorrectPwd){
        loginResult ="동일한 암호입니다.";

        //아이디와 암호가 일치하면 해당 사용자의 주요정보만 서버 세션으로 저장하고 메인 페이지이동처리 
        //세션을 저장할 내용은 로그인여부 와 로그인한 사용자의 주요정보를 세션으로 보관
        req.session.isLogined = true;
        req.session.loginUser ={
          userSeq:member.id,
          userId:member.userid,
          userName:member.username,
          userPhone:member.userphone
        };
        
        //세션에 추가한 동적속성과 값을 최종 저장
        req.session.save(function(){
          //정상 로그인한경우 특정 페이지로 이동처리 
          res.redirect('/boards/list');
        });


      }else{
        loginResult ="사용자 암호가 동일하지 않습니다.";
        res.render('member/login',{loginResult:loginResult});
      }

  
  }else{
    //사용자 아이디가 존재하지 않은경우 
    loginResult ="사용자 아이디가 존재하지 않습니다.";
    res.render('member/login',{loginResult:loginResult});
  }

});

  
  

//패스포트+EXPRESS-SESSION 방식으로 로그인 처리
router.post('/login', async(req, res, next)=> {

    //패스포트 인증처리: 로컬로그인전략 적용
    passport.authenticate('local', (authError, user, info) => {
      //로컬 로그인 전략(localStrategy.js) 수행결과 값이 리턴됨
  
      //인증에러 발생시
      if (authError) {
        console.error(authError);
        return next(authError);
      }
  
      //사용자 세션 저장용 정보가 없으면 에러처리
      if (!user) {
        //localStrategy.js 파일내 DB로그인 검증결과 메시지 출력
        req.flash('loginError', info.message);
        return res.redirect('/member/login');
      }
  
      //req.login 메소드 호출 로그인 세션처리
      return req.login(user, (loginError) => {
        //로그인 에러발생시
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
  
        //정상 로그인시 메인페이지 이동
        return res.redirect('/boards/list');
      });
  
  
    })(req, res, next); 

  
});  

//로그인 후에 개인 프로필 정보를 보여주는 페이지
router.get('/profile',isLoggedIn, async(req, res, next)=> {

    var userData = req.session.passport.user;
    res.render('member/profile',{userData});
  });
  

module.exports = router;
