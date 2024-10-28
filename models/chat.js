const mongoose = require('mongoose');


const chatModel= new mongoose.Schema({
    senderId: String,       
    receiverId: String,     
    message: [
      {
        senderId: String,   
        receiverId: String, 
        text: String,       
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  });

// Export the Chat model
const Chat = mongoose.model('Chat',chatModel);
module.exports = Chat;