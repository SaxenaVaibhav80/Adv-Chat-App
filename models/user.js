const mongoose= require("mongoose")


const userModel= new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    subscription:{
        type:Object
    },
    email:{
        type:String,
    },
    password:{
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userModel);

module.exports = User;