const express= require("express")
const http=require('http')
const { createServer } = require("http2")
const app= express()
const webpush=require('web-push')
const mongoose = require('mongoose')
require('dotenv').config();
const secret_key=process.env.SECRET_KEY
const bodyParser= require("body-parser")
const jwt= require("jsonwebtoken")
const multer = require("multer");
const grid = require("gridfs-stream")
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");
const crypto = require("crypto");
const { MongoClient, ObjectId } = require("mongodb");
const cookieparser = require("cookie-parser")
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}))
const server = http.createServer(app)
const socketio=require('socket.io');
const io=socketio(server)
const bcrypt= require('bcrypt')
const ejs= require("ejs")
const userModel=require("./models/user");
const chatModel = require("./models/chat")
const urlencoded = require("body-parser/lib/types/urlencoded");
const json = require("body-parser/lib/types/json");
app.set("view engine","ejs")
app.use(express.static('public'))
app.use(express.json());
const mongouri= process.env.URL
const public= "BBXq7Er9eQirt4Q5UAoOT6jlbGe1coPPTSARDeOBur_CMV_pgn095iyHhmSvbZsNqfeN4vK-sum2bQ8jAIwY3oU"
const private ="ZbndEMVQv8KKtr0vPFNyxvhQsIU7r4G3XSZBsbu5uyA"

mongoose.connect(mongouri).then(() => {
    console.log("MongoDB connected successfully");
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    console.log("GridFSBucket initialized");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

let bucket;

// making store for uploading the files---->

const storage = new GridFsStorage({
    url: mongouri,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                console.log("storage")
                if (err) {
                    return reject(err);
                }

                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    metadata:{user_id:req.user.id,type:req.user.type},
                    filename: filename,
                    bucketName: "uploads",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

// signup handler----->

app.post("/signup",async(req,res)=>
    {
     const fname= req.body.fname
     const lname= req.body.lname
     const password= req.body.password
     const email=req.body.email
    
    console.log(fname,lname,password,email)
     if(!(fname && lname && email && password))
     {
         res.status(400).send("all field are required")
     }
     const exist = await userModel.findOne({email:email})
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

// sending token to the client so that it will be store in the localstorage--->

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


// AUTH middleware-->
const  auth =(req,res,next)=>
  {
      const tokenFromCookie= req.cookies.token
      try{
          if(tokenFromCookie)
          {
              const verification =jwt.verify(tokenFromCookie,secret_key)
              next()
          }
          else{
              res.redirect("/")
          }
      }catch(err){
          res.redirect("/")
      }
  
  }
// longin handler----->

app.post("/login",async(req,res)=>
    {
        const email= req.body.email
        const password= req.body.password
        const user = await userModel.findOne({email:email})
        console.log(email,password)
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
                res.redirect("/chats")
            }
            else{
                res.status(400).send("password incorrect")
            }
        }
        else{
            res.status(400).send("user not  Available")
        }
    })

// checking for login---->

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

// uploading handler---->

app.post("/chats", async(req, res) => {
  const token = req.cookies.token;
  if (token) {
      const verify = jwt.verify(token, secret_key);
      const id = verify.id;
      req.user = { id: id, type: "profile" }; 

      upload.single("file")(req, res, (err) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }

          console.log(req.user.id);
          res.redirect("/chats");
      });
  } else {
      res.redirect("/login");
  }
});


// handling subscribe post request--->

app.post("/subscribe", async (req, res) => {
 
    const subscription=req.body.sub
    const token=req.body.token
  
    try {
    
      const verification = jwt.verify(token, secret_key);
      const id = verification.id;
  
      const user = await userModel.findOne({ _id: id });
  
      if (user) {
        const users=await userModel.findOneAndUpdate(
          { _id: id },
          { subscription: subscription },
          { new: true }
        );
      } else {
        res.status(404).send("User not found.");
      }
    } catch (error) {
      console.error("Error in subscription:", error);
      res.status(400).send("Invalid token or server error.");
    }
  });

// socket handler--->

io.on("connection", (socket) => {
    socket.on("token", async (token) => {
      try {
        if (token !== "undefined") {
          const isvalid = jwt.verify(token, secret_key);
  
          if (isvalid) {
            const id = isvalid.id;
            const status = "online";
            socket.join(id);
            socket.emit("online", status);
   
            
            socket.on("sendMessageToUser", async ({ userId, message }) => {
              console.log(userId)
              if (userId && message) {
                console.log(userId)
                app.post("/getNotification",async(req,res)=>
                {
                  const uid = req.body.uid
                  const user = await userModel.findOne({_id:uid})
                  const subofuser= user.subscription
                  console.log(uid)
                  payload=JSON.stringify({
                      data:user
                  })
                  await webpush.sendNotification(subofuser, payload)
                  .then(() => console.log("Push notification sent successfully."))
                  .catch(err => console.error("Error sending push notification:", err));
                })
                  
                socket.to(userId).emit("message", [message,id]);

                
                let chat = await chatModel.findOne({
                  $or: [
                    { senderId: id, receiverId: userId },
                    { senderId: userId, receiverId: id }
                  ]
                });
  
                if (chat) {
                  chat.message.push({
                    senderId: id,
                    receiverId: userId,
                    text: message,
                    timestamp: Date.now()
                  });
                  await chat.save();
                } else {
                  chat = await chatModel.create({
                    senderId: id,
                    receiverId: userId,
                    message: [
                      {
                        senderId: id,
                        receiverId: userId,
                        text: message,
                        timestamp: Date.now()
                      }
                    ]
                  });
                }
              }
            });

            socket.on('load chat', async (uid) => {   
                let loadchat = await chatModel.findOne({
                    $or: [
                      { senderId: id, receiverId: uid },
                      { senderId: uid, receiverId: id }
                    ]
                });
                if (loadchat) {
                    socket.emit("Load msg", loadchat.message);
                } else {
                    socket.emit("Load msg", "start chat");
                }
            });
            
          }
        }
      } catch (err) {
        socket.emit("offline", "offline");
      }
    });
});

// landing page Route-->

app.get("/",checkLoginState,(req,res)=>
{
    res.render("landingPage")
})

// chat route page---->

  app.get("/chats", auth, async (req, res) => {
    const token = req.cookies.token;
  
    try {
      if (token) {
        
        const verification = jwt.verify(token, secret_key);
  
        if (verification) {
          const user = await userModel.findOne({ _id: verification.id });
          
          if (user && user.friends.length > 0) {
          
            const friendIds = user.friends.map(friend => friend.userid);
  
            const friends = await userModel.find({ _id: { $in: friendIds } });
  
            res.render("chat", { user: friends, id: verification.id });
          } else {
            res.render("chat", { user: 0, id: verification.id });
          }
        }
      } else {
        res.render("chat", { user: 0, id: null });
      }
    } catch (err) {
      console.error(err);
      res.render("chat", { user: 0, id: null });
    }
  });


// signup route--->

app.get("/signup",(req,res)=>
{
    res.render("signup")
})

// login  route ---->

app.get("/login",(req,res)=>
{
    res.render("login")
})

app.get("/logout",async(req,res)=>
  {
      const token=req.cookies.token
      if(token)
      { 
        const verification = jwt.verify(token, secret_key);
        const id = verification.id;
        const user = await userModel.findOne({ _id: id });
    
        if (user) {
          const users=await userModel.findOneAndUpdate(
            { _id: id },
            { subscription: null },
            { new: true }
          );
          res.cookie('token', token, { expires: new Date(0), httpOnly: true });
      }
      res.cookie('token', token, { expires: new Date(0), httpOnly: true });
      res.redirect("/")
  }
  })
  
server.listen(8000)