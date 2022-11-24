const path = require('path');
const Sequelize = require('sequelize');


//개발모드 환경설정
const env = process.env.NODE_ENV || 'development';


//DB연결 환경설정정보 변경처리//관련정보 수정
const config = require(path.join(__dirname,'..','config','config.json'))[env];


//데이터 베이스 객체
const db= {};


//DB연결정보로 시퀄라이즈 ORM 객체 생성
const sequelize = new Sequelize(config.database,config.username,config.password,config);


//DB 처리 객체에 시퀄라이즈 정보 맵핑처리
//이후 DB객체를 통해 데이터 관리가능해짐
db.sequelize = sequelize; //DB연결정보를 포함한 DB제어 객체속성(CRUD)
db.Sequelize = Sequelize; //Sequelize팩키지에서 제공하는 각종 데이터 타입 및 관련 객체정보를 제공함


//게시글 정보관리 모델 모듈파일 참조하고 db속성정의하기
db.Article = require('./article.js')(sequelize,Sequelize);

//게시판 정보관리 모델 참조하고 db속성으로 정의하기
db.Board = require('./board.js')(sequelize,Sequelize);

//게시글 댓글 정보관리 모델 참조하고 db속성으로 정의하기
db.Comment = require('./comment.js')(sequelize,Sequelize);

db.Member = require('./member.js')(sequelize,Sequelize);


//게시판 모델과 게시글 모델간의 1:N 관계설정(게시판모델의 board_idx 기본키(PK)와 게시글모델의 board_idx참조키(FK) 설정하기)
//Board테이블의 PK키인 board_idx 컬럼이 BoardArticle테이블에 여러건이 존재할수 있다..
// db.Board.hasMany(db.BoardArticle,{foreignKey:'board_idx',sourceKey:'board_idx'});
// db.BoardArticle.belongsTo(db.Board,{foreignKey:'board_idx',targetKey:'board_idx'});


//게시글 모델과 게시글 코멘트 모델 1:N관계설정하기 
// db.BoardArticle.hasMany(db.ArticleComment,{foreignKey:'article_idx',sourceKey:'article_idx'});
// db.ArticleComment.belongsTo(db.BoardArticle,{foreignKey:'article_idx',targetKey:'article_idx'});



//db객체 외부로 노출하기
module.exports = db;