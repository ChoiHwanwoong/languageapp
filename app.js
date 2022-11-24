var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer');

const upload = multer({dest: './upload'})

var sequelize = require('./models/index.js').sequelize;

//일회성(휘발성) 데이터를 특정 페이지(뷰)에 전달하는 방식제공 플래시 팩키지참조하기
var flash = require('connect-flash');

//express기반 서버세션 관리 팩키지 참조하기 
var session = require('express-session');


//passport 팩키지 참조
const passport = require('passport');

//레이아웃 노드팩키지 참조
var expressLayouts = require('express-ejs-layouts');

//dontenv 환경설정추가 
require('dotenv').config();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//게시글 라우터 파일 참조
var boardRouter = require('./routes/board');

//회원정보 라우터파일
var memberRouter = require('./routes/member');

var app = express();

//flash 메시지 사용 활성화: cookie-parser와 express-session을 사용하므로 이들보다는 뒤로 위치
app.use(flash());

sequelize.sync();

//인증관련 패스포트 개발자 정의 모듈참조,로컬로그인전략적용
const passportConfig = require('./passport/index.js');

//패스포트 설정처리
passportConfig(passport);

//노드 어플리케이션의 세션 기본 설정값 세팅하기 
app.use(
  session({
    resave: false,//세션을 항상 저장할지여부
    saveUninitialized: true, //세션이 저장되기전 초기화 안된상태로 미리 저장공간을 만들지여부
    secret: "testsecret", //세션키값을 암호할때 사용할 키값
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge:1000 * 60 * 5 //5분동안 서버세션을 유지하겠다.(1000은 1초)
    },
  }),
);

//패스포트-세션 초기화 : express session 뒤에 설정
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//ejs-layouts setting
app.set('layout', 'layout'); //기본 레이아웃 페이지 뷰 설정하기 
app.set("layout extractScripts", true);
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





app.use('/', indexRouter);
app.use('/users', usersRouter);

//boardRouter의 기본 호출주소
app.use('/boards', boardRouter);

//회원관리 라우팅파일 기본경로 설정
app.use('/member', memberRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
