const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');

// Instantiate an event emitter
const myEmitter = new EventEmitter();

// Create a multi-route HTTP server
const server = new http.Server();

server.on('request', (request, response) => {
    // Use the request.url to determine the URL entered
    const { url } = request;
    let filePath = '';

    // Determine action based on the route requested
    switch(url) {
        case '/about':
            console.log("About page requested"); 
            filePath = './views/about.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        case '/contact':
            console.log("Contact page requested");
            filePath = './views/contact.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        case '/products':
            console.log("Products page requested");
            filePath = './views/products.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        case '/subscribe':
            console.log("Subscribe page requested");
            filePath = './views/subscribe.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        case '/services':
            console.log("Services page requested");
            filePath = './views/services.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        case '/faq':
            console.log("FAQ page requested");
            filePath = './views/faq.html';
            myEmitter.emit('routeAccess', url); // Event capture
            break;
        default:
            console.log("Home page requested");
            filePath = './views/home.html';
            myEmitter.emit('routeAccess', '/'); // Event capture
    }

    // Read HTML files from disk
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('404 Not Found');
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(data); 
        }
    });
});

// Listen on the correct port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Implement event scenarios
// Instantiate an event emitter
myEmitter.on('routeAccess', (route) => {
    console.log(`Route accessed: ${route}`);
});
