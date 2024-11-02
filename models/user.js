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
    },
    friends:[{
      userid:{
        type: String
      }
    }],
    profilePictureId: { type: String } 
})

const User = mongoose.model("User", userModel);

module.exports = User;