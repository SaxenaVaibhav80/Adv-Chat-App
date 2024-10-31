
self.addEventListener("push", (event) => {
    
    const data = event.data ? event.data.json() : {};
    self.registration.showNotification(data.title || "New Message", {
        body: data.self_id,
        icon: "https://image.ibb.co/frYOFd/tmlogo.png",
        data: { url: data.url || "/" }
    });
});

