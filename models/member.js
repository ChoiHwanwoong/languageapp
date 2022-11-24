module.exports = (sequelize, DataTypes) => {

    return sequelize.define('member', 
    {
        userid: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment:'회원아이디'
        },
        userpwd: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment:'회원비밀번호'
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment:'회원이름'
        },
        userphone: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment:'회원핸드폰번호'
        },
    },
    {
        timestamps: false,
        paranoid: false
    });
 };