if(process.env.NODE_ENV === "production"){
    console.log("prod에서 가져옴");
    module.exports = require('./prod');
}else{
    console.log("dev에서 가져옴");
    module.exports = require('./dev');
}