const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1,  //겹치는게 없음
    },
    password:{
        type:String,
        minlength:5,
    },
    lastname: {
        type: String,
        maxlength:50,
    },
    role:{
        type: Number,
        default: 0,
    },
    image : String,
    token:{
        type: String
    },
    tokenExp:{
        //토큰의 사용기한
        type: Number,
    }
})
//save전에 비밀번호 암호화
userSchema.pre("save", function(next){
    var user = this; // User스키마를 가리킨다.
    //password에 변동이 있을때만 실행
    if(user.isModified('password')){
        //next로 가기전에 비밀번호를 암호화
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err)

            bcrypt.hash(user.password, salt, (err, hash) =>{
                if(err) return next(err)
                console.log(hash);
                user.password = hash; // 패스워드를 hash 값으로 바꿔준다.
                next(); 
            })
        })
    }else{
        // else next() 없으면 다음 것을 실행안한다! 필수 확인!!
        next();
    }
    

})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword : 1234567(사람이 입력) djfklhdsjklhaag(암호화된 비밀번호)
    bcrypt.compare(plainPassword, this.password, (err, isMatch) =>{
        if(err) return cb(err);

        cb(null, isMatch); //isMatch는 true
    })
}

userSchema.methods.generateToken = function(cb) {
    // jsonwebtoken을 이용해서 token을 생성하기.
    var user = this;
    var token = jwt.sign(user._id.toHexString(), "secretToken");
    
    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err)

        cb(null, user);
    })
}
userSchema.statics.findByToken = function(token, cb){
    var user = this;
    // 토큰을 decode한다.
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트의 token과 일치하는지 확인
        user.findOne({"_id":decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user); //user정보 전달
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = {User}