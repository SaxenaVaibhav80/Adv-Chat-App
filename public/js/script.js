

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
                document.getElementsByClassName("send-msg")[0].classList.add("visible-flex")
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
                    console.log(messageBox)
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

const profile_option_element = document.getElementsByClassName("profile-option")[0]
const profile_element = document.getElementsByClassName("profilepic")[0]
const setting = document.getElementById("setting")
console.log(setting)
const setting_option= document.getElementsByClassName("setting-option")[0]
console.log(setting_option)

profile_element.addEventListener("click",()=>
{
    profile_option_element.classList.add("visible")
   
})

setting.addEventListener("click",()=>
{
    setting_option.classList.add("visible")
})


const touch_element_to_remove=document.getElementById("msg-box")

touch_element_to_remove.addEventListener("click",()=>
{
    profile_option_element.classList.remove("visible")
    setting_option.classList.remove("visible")
})

const searchInput = document.getElementById("searchbar");
const userdiv = document.getElementById("user-list");


async function getFriends() {
    const response = await fetch("/frds", { method: "POST" });
    const friends = await response.json();
    return friends.map(friend => friend.userid); 
}


async function showuser(items) {
    const friendIds = await getFriends();

    if (!items.length) {
        userdiv.classList.remove("show");
        userdiv.classList.add("hidden");
    } else {
        userdiv.classList.add("show");
        userdiv.innerHTML = "";

        items.forEach(user => {
            const div = document.createElement("div");
            const p = document.createElement("p");
            const addOrRemove = document.createElement("div");

            addOrRemove.textContent = friendIds.includes(user._id) ? "Remove" : "Add user"; 
            addOrRemove.classList.add("request");
            p.classList.add("margin-left");

            const divImg = document.createElement("div");
            divImg.classList.add("profile-picture");

            const img = document.createElement("img");
            img.setAttribute("src", "/img/user (1).png");
            divImg.appendChild(img);

            div.classList.add("decor-div");
            p.textContent = user.username;

            userdiv.appendChild(div);
            div.appendChild(divImg);
            div.appendChild(p);
            div.append(addOrRemove);

           addOrRemove.addEventListener("click", () => {
                const isFriend = friendIds.includes(user._id);
                fetch(isFriend ? "/removeFriend" : "/addasfrd", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ friendId: user._id })
                }).then(() => {
                    addOrRemove.textContent = isFriend ? "Add user" : "Remove"; 
                    if (isFriend) {
                        friendIds.splice(friendIds.indexOf(user._id), 1); 
                    } else {
                        friendIds.push(user._id);
                    }
                });
                //reload the page
                location.reload();
            });
        });
    }
}


async function filtersuggest() {
    const response = await fetch("/alluser", { method: "POST" });
    const users = await response.json();
    const value = searchInput.value;

    if (value.length === 0) {
        userdiv.innerHTML = "";
        showuser([]);
    } else {
        const res = users.filter(user => user.username.toLowerCase().includes(value.toLowerCase()));
        showuser(res);
    }
}

searchInput.addEventListener("keyup", filtersuggest);
