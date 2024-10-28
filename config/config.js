const mongoose= require("mongoose")
require('dotenv').config(); 
const URL = process.env.URL

async function connection(){
   await mongoose.connect(URL)
   console.log("connected")
}

connection()