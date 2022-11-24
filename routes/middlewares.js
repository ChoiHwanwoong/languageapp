
    //웹페이지 라우팅 관련 인증전략정의 

    //로그인 되어있는 경우만 호출되어야하는 페이지에서 사용 : 로그아웃,파일업로드,프로파일페이지
    //로그인 되어있는경우 요청 페이지를 계속 진행하고 그렇지 않으면 로그인 필요 서버에러 발생처리
    exports.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
        next();
        } else {
        //res.status(403).send('로그인 필요');
        res.redirect('/member/login');
        }
    };


    //로그인 하지 않아도  접근이 가능한 페이지에서 사용: 회원가입,로그인 페이지
    //로그인 안되어 있으면 요청 페이지로 이동하고 이미 로그인 된경우 메인 페이지로 이동처리
    exports.isNotLoggedIn = (req, res, next) => {
        if (!req.isAuthenticated()) {
        next();
        } else {
        res.redirect('/');
        }
    };
  