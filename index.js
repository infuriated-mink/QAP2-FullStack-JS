const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Instantiate an event emitter
const myEmitter = new EventEmitter();

// Create a multi-route HTTP server
const server = http.createServer();

// Function to log events to disk
function logEvent(route) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const fileName = `${year}-${month}-${day}.log`;
    const filePath = path.join(__dirname, 'logs', fileName);
    const logMessage = `[${today.toISOString()}] Route accessed: ${route}\n`;

    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

server.on('request', (request, response) => {
    // Use the request.url to determine the URL entered
    const { url } = request;
    let filePath = '';

    // Determine action based on the route requested
    switch(url) {
        case '/about':
            console.log("About page requested"); 
            filePath = './views/about.html';
            break;
        case '/contact':
            console.log("Contact page requested");
            filePath = './views/contact.html';
            break;
        case '/products':
            console.log("Products page requested");
            filePath = './views/products.html';
            break;
        case '/subscribe':
            console.log("Subscribe page requested");
            filePath = './views/subscribe.html';
            break;
        case '/services':
            console.log("Services page requested");
            filePath = './views/services.html';
            break;
        case '/faq':
            console.log("FAQ page requested");
            filePath = './views/faq.html';
            break;
        default:
            console.log("Home page requested");
            filePath = './views/home.html';
    }

    // Log the route access
    myEmitter.emit('routeAccess', url);

    // Read HTML files from disk
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('404 Not Found');
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(data);
        }
    });
});

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Listen on the correct port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Implement event scenarios
myEmitter.on('routeAccess', (route) => {
    console.log(`Route accessed: ${route}`);
    logEvent(route);
});
