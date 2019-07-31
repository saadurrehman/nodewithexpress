let mongoose = require('mongoose');

//article schema
let articleschema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    }


});
module.exports=mongoose.model("Article",articleschema);