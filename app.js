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
const userModel=require("./models/user");
const chatModel = require("./models/chat")
const urlencoded = require("body-parser/lib/types/urlencoded");
const json = require("body-parser/lib/types/json");
app.set("view engine","ejs")
app.use(express.static('public'))
app.use(express.json());
const public= ""
const private =""


app.post("/signup",async(req,res)=>
    {
     const fname= req.body.fname
     const lname= req.body.lname
     const password= req.body.password
     const email=req.body.email
    
     
     if(!(fname && lname && email && password))
     {
         res.status(400).send("all field are required")
     }
     const exist = await userModel.findOne({Email:email})
     if(exist){
         res.status(401).send("user already exist")
     }
     else{
        const encpass= await bcrypt.hash(password,10)
        const user = await userModel.create({
            firstname:fname,
            lastname:lname,
            password:encpass,
            email:email
        })
      
     }
        
    
     res.redirect("/")
    })

app.post("/login/api",(req,res)=>
    {
        const token = req.cookies.token
        if(token)
        {   
            const isvalid = jwt.verify(token, secret_key);
            const id =isvalid.id
            return res.status(200).json({ token,id });
        }
        else{
            return res.status(200).json({undefined})    
        }
        
    })

app.post("/login",async(req,res)=>
    {
        const email= req.body.email
        const password= req.body.password
        const user = await userModel.findOne({email:email})
        
        if(user)
        {
            const passverify= await bcrypt.compare(password,user.password)
            if(passverify){
                const token = jwt.sign(
                    {id:user._id,name:user.firstname},
                    secret_key,
                    {
                     expiresIn:'24h'
                    }
                )
                const options={
                    expires:new Date(Date.now()+24*60*60*1000),
                    httpOnly:true
                };
                res.status(200).cookie("token",token,options)
                res.redirect("/")
            }
            else{
                res.status(400).send("password incorrect")
            }
        }
        else{
            res.status(400).send("user not  Available")
        }
    })
        

const checkLoginState = (req, res, next) => {
    const token = req.cookies.token;
    let loggedIn = false;

    if (token) {
        try {
            jwt.verify(token, secret_key); 
            loggedIn = true; 
        } catch (err) {
            res.redirect("/login"); 
        }
    }
    res.locals.loggedIn = loggedIn;

    next();
};

app.get("/",(req,res)=>
{
    res.render("landingPage")
})

// app.get("/chat",(req,res)=>
// {
//     res.render("/chat")
// })
app.get("/signup",(req,res)=>
{
    res.render("signup")
})

app.get("/login",(req,res)=>
{
    res.render("login")
})
server.listen(8000)