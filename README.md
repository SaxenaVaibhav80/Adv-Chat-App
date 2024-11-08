Real-Time Chat Application
This is a real-time chat application built with Socket.io for real-time communication, MongoDB with GridFS for media storage, Multer for handling file uploads, Express.js for the server, EJS for templating, and JWT tokens for secure authentication. It provides a seamless chatting experience with push notifications, a responsive user interface, and efficient data handling.

Table of Contents
Features
Tech Stack
Project Structure
Installation
Usage
File Upload with GridFS
Authentication
Socket.io Integration
Push Notifications
UI and UX
Future Enhancements

Features
Real-time Communication: Leveraging Socket.io for instant messaging and notifications.
Push Notifications: Notifications for new messages.
Secure Authentication: Users log in with JWT-based authentication, ensuring secure sessions.
Media Uploads: File upload capabilities with Multer and storage on MongoDB using GridFS.
Responsive Design: Built with a user-friendly and responsive interface using EJS templates.
Scalable Architecture: Designed to handle multiple chat rooms and users efficiently.

Tech Stack
Backend: Node.js, Express.js
Database: MongoDB (with GridFS for media storage)
Real-time Communication: Socket.io
Authentication: JSON Web Tokens (JWT)
File Handling: Multer, GridFS
Frontend Templating: EJS
Project Structure
plaintext


├── models           # Mongoose models (User, Message, etc.)
├── public           # Static files (CSS, images, etc.)
├── routes           # Express routes (auth, chat, file uploads)
├── views            # EJS templates for rendering pages
├── app.js           # Main application file
└── README.md        # Project documentation

Installation
Clone the repository:
bash
git clone https://github.com/yourusername/real-time-chat-app.git
cd real-time-chat-app
Install dependencies:

bash
npm install
npm install express http http2 web-push mongoose dotenv body-parser jsonwebtoken multer gridfs-stream multer-gridfs-storage path crypto mongodb cookie-parser socket.io bcrypt ejs --save-dev nodemon

Set up environment variables:
Create a .env file and add:
plaintext-->
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

Run the application:
bash
Copy code
npm run dev

Visit http://localhost:8000 to see the application in action.

Usage
User Registration and Login:

New users can register or log in.
Authentication is managed using JWT, which securely maintains session data.
Real-Time Messaging:

Once logged in, users can enter chat rooms and communicate with others.
Messages are instantly delivered via Socket.io.
Media Sharing:

Users can upload images/files to the chat. Media files are stored in MongoDB using GridFS, and file upload handling is managed by Multer.
File Upload with GridFS
GridFS is used for efficient media storage within MongoDB. Files uploaded through the chat app are streamed into the MongoDB database, ensuring high performance. Multer handles file uploads from the client side and passes them to GridFS for storage.

Authentication
JWT tokens are used to authenticate and manage user sessions securely:

Upon login, a JWT token is generated and stored in the user’s session.
This token is verified for each request to ensure that users can access chat rooms and upload media files securely.
Tokens are stored in HTTP-only cookies to prevent cross-site scripting (XSS) attacks.
Socket.io Integration
Socket.io is used for real-time, bidirectional communication between users in the chat:

When a user sends a message, it’s broadcast to all users in the chat room instantly.
Socket.io also enables user presence detection, showing online/offline status.
Message events are managed through dedicated channels, allowing multiple chat rooms to operate simultaneously.
Push Notifications
The app includes push notifications to alert users of new messages:

When a message is received, it triggers a notification.
Notifications are implemented using the native HTML5 Notification API (on supported browsers) to alert users even when they’re not actively viewing the chat.
UI and UX
The chat app’s user interface is designed with responsiveness and ease of use in mind:

The EJS templates render dynamic content, making the app responsive and fast.
A sidebar navigation allows easy switching between chat rooms.
User messages are styled to provide a clear and engaging chat experience.
Future Enhancements
Read Receipts: Show when messages are read by recipients.
User Status: Display active/inactive status in real time.
Search Functionality: Search for users or specific messages.
End-to-End Encryption: Encrypt messages for enhanced security.
Audio/Video Calls: Add voice and video call support within the chat app.
