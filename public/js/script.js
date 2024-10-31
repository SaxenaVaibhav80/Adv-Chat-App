const socket = io();
let extracted_token;
let subscription;

const publicVapidKey = "BBXq7Er9eQirt4Q5UAoOT6jlbGe1coPPTSARDeOBur_CMV_pgn095iyHhmSvbZsNqfeN4vK-sum2bQ8jAIwY3oU";

fetch('/login/api', {
    method: 'POST',
})
.then(response => response.json()) 
.then(data => {
    localStorage.setItem("token", data.token); 
    localStorage.setItem("id",data.id);
    extracted_token = localStorage.getItem('token');
    socket.emit("token", extracted_token);

       if(extracted_token!='undefined')
    {
        if ('serviceWorker' in navigator) {
            console.log("inititiation")
            send().catch(err => console.log(err));
        }
        if (navigator.serviceWorker) {    
            console.log("token send to worker")
            navigator.serviceWorker.ready.then((registration) => {
                const id =localStorage.getItem("id")
                registration.active.postMessage(id);
            });
        }
        async function send() {
            console.log("Registering service worker");
            const register = await navigator.serviceWorker.register('/worker.js', {
                scope: "/"
            });
            console.log("Registered");
        
            // Create a subscription only once
            subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
        
            console.log("Subscription object:", subscription);
            const payload={
                sub:subscription,
                token:extracted_token,
            }
            fetch("/subscribe", {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': "application/json"
                }
            })
        }
        
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');
        
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
        
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
    
        socket.on("online", (status) => {
            console.log("User is " + status);
        });
        
        socket.on("offline", (data) => {
            console.log("User is " + data);
        });
        
        const userListItems = document.querySelectorAll('div[data-id]');
        let selectedUserId;
        
        userListItems.forEach(item => {
            item.addEventListener('click', () => {
                selectedUserId = item.getAttribute('data-id'); 
                socket.emit("load chat", selectedUserId);
                console.log(`User selected: ${selectedUserId}`);
            });
        });
        
        const messageInput = document.getElementById('message-input');
        const sendMessageButton = document.getElementById('send-message-button');
        sendMessageButton.addEventListener('click', async () => {
            const message = messageInput.value;
        
            if (selectedUserId && message) {
                socket.emit('sendMessageToUser', { userId: selectedUserId, message });
                console.log("Sending message");
                
                const messageElement = document.createElement('div');
                const messageBox = document.getElementById("msg-box");
                messageElement.classList.add("yourtext");
                messageElement.textContent = `You: ${message}`;  
                messageBox.appendChild(messageElement); 
                
                const ele = document.getElementsByClassName("startchat")[0];
                if (ele) {
                    ele.remove();
                }
                
                messageInput.value = '';
        
                // Now use the existing subscription for fetc
                    const payload={
                        text:message,
                        uid:selectedUserId
                    }
                    console.log('.....send nitification')
                    await fetch("/getNotification",{
                        method:'POST',
                        body:JSON.stringify(payload),
                        headers:{
                           'Content-Type': "application/json"
                        }
                    });
            } else {
                alert('Please select a user and type a message');
            }
        });
        
        socket.on("message", (message) => {
            const messageBox = document.getElementById("msg-box");
            const messageElement = document.createElement('div');
            messageElement.classList.add("usertext");
            messageElement.textContent = `User: ${message[0]}`;
            
            if (selectedUserId === message[1]) {
                messageBox.appendChild(messageElement);
            } else {
                // notification will be added soon
            }
        });
        
        socket.on("Load msg", (msgs) => {
            console.log("Loading messages");
            const messageBox = document.getElementById("msg-box");
            messageBox.innerHTML = '';
        
            try {
                if (Array.isArray(msgs) && msgs.length > 0) {
                    msgs.forEach(msg => {
                        const messageElement = document.createElement('div');
                        if (msg.senderId === selectedUserId) {
                            messageElement.textContent = `User: ${msg.text}`;
                            messageElement.classList.add("usertext");
                        } else {
                            messageElement.textContent = `You: ${msg.text}`;
                            messageElement.classList.add("yourtext");
                        }
                        messageBox.appendChild(messageElement);
                    });
                } else {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add("startchat");
                    messageElement.textContent = "Start Conversations";
                    messageBox.appendChild(messageElement);
                }
            } catch (err) {
                console.error("Error loading chat", err);
            }
        });
    }
    
})
.catch(error => {
    console.error('Error fetching token:', error);
});


    





