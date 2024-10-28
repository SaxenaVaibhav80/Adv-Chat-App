const express= require("express")
const http=require('http')
const { createServer } = require("http2")
const app= express()
const webpush=require('web-push')
require('dotenv').config();
const secret_key=process.env.SECRET_KEY
const bodyParser= require("body-parser")
const jwt= require("jsonwebtoken")
const cookieparser = require("cookie-parser")
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}))
// const chatModel = require("./models/chat")
const server = http.createServer(app)
const socketio=require('socket.io');
const io=socketio(server)
const bcrypt= require('bcrypt')
const ejs= require("ejs")
const db = require("./config/config")
// const userModel=require("./models/user");
const urlencoded = require("body-parser/lib/types/urlencoded");
const json = require("body-parser/lib/types/json");
app.set("view engine","ejs")
app.use(express.static('public'))
app.use(express.json());


app.get("/",(req,res)=>
{
    res.render("landingPage")
})
app.get("/signup",(req,res)=>
{
    res.render("signup")
})

app.get("/login",(req,res)=>
{
    res.render("login")
})
server.listen(8000)