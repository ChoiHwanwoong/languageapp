//로컬 로그인 전략 기능 정의
//회원가입시 입력한 아이디/암호 기반으로 패스포트 기능을 사용하는 경우의 인증전략
//passport-local 은 사용자아이디/암호를 직접 입력해서 로그인하는 방식을 제공한다.
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models');

//회원정보가 존재하는 모델 조회
const { Member } = require('../models');


module.exports = passport => {
  //req.body내 비교 아이디/암호 html요소이름을 지정
  //new LocalStrategy({로그인폼의 아이디요소네임,암호요소네임지정},로그인인증처리함수(사용자가 입력한 아이디값,사용자가 입력한 암호값))
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'userid', //로그인 페이지의 사용자아이디 UI INPUT 요소 name값
        passwordField: 'userpwd',//로그인 페이지의 사용자 암호 INPUT 요소 name값
      },
      async (userId, userPWD, done) => {

        //에러-Bug 
        //예외(Exception) : 예기치 못한 에러를 말함
        //예외처리: 
        //예외처리는 크게 두가지 방식으로 처리함
        //CASE1:해당 주요 기능에 try~catch() finally 구문을 통해 처리하거나
        //CASE2: 전역예외처리기를 통해 처리함

        try {
          //로그인 화면에서 전달된 아이디(userId)/암호(userPWD)를 이용 DB사용자와 검증
          //done함수는 passport.authenticate의 콜백함수임
          //사용자 정보조회
          const exUser = await db.Member.findOne({ where: { userid: userId } });

          //사용자 아이디 정보가 존재하면
          if (exUser) {

            //사용자 입력한 암호를 비교한다.
            const result = await bcrypt.compare(userPWD, exUser.userpwd);

            //사용자 입력 암호가 일치하면
            if (result) {

              var sessionUser = {
                userPSeq: exUser.id,
                userId: exUser.userid,
                userName: exUser.username,
                userPhone: exUser.userphone,
              };

              //사용자 정보 전달-사용자세션값이 로그인 처리 라우팅 페이지로 전달됨...
              done(null, sessionUser);
            } else {

              //사용자 암호가 일치하지 않은 경우
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {

            //사용자 아이디가 존재하지 않은경우
            done(null, false, { message: '아이디가 존재하지 않습니다.' });
          }
        } catch (error) {
            //수집된 에러내용을 전역예외처리기로 전송
            //throw error;
          console.error(error);
          done(error);
        }

      },
    ),
  );
};