//게시글 정보 관리 모델 모듈파일 정의 
module.exports = (sequelize, DataTypes) => {

    return sequelize.define('article', 
    {
        article_idx: {
            type: DataTypes.INTEGER,//숫자형
            autoIncrement:true,//자동채번
            primaryKey:true,//PK컬럼으로 설정
            allowNull: false,
            comment:'게시글 고유번호'
        },
        board_idx: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment:'게시판고유번호-FK'
        },
        title: {
            type: DataTypes.STRING(300),
            allowNull: false,
            comment:'글제목'
        },
        contents: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment:'글내용'
        },
        file_name: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment:'첨부파일'
        },
        view_cnt: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment:'조회수'
        },
        ip_address: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment:'등록자/수정자 아이피주소'
        },
        display_yn: {
            type: DataTypes.STRING(5),
            allowNull: true,
            comment:'게시여부-Y or N'
        },
        regist_date: {
            type: DataTypes.DATE,
            allowNull:false,
            comment:'등록일시'
        },
        regist_userid: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment:'등록자 아이디'
        },
        modify_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment:'수정일시'
        },
        modify_userid: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment:'수정자아이디'
        },
    }, 
    {
        timestamps: false,
        paranoid: false
    });
 };
 