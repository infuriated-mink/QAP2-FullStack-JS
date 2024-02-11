const http = require('http');
const fs = require('fs');
const path = require('path');
const { logEvent } = require('./logevents');
const { handleRoutes } = require('./routes');

// Create a multi-route HTTP server
const server = http.createServer();

server.on('request', (request, response) => {
    const { url } = request;

    // Log the route access
    logEvent(url);

    // Check if the request is for a static file
    if (url.startsWith('/public/')) {
        const filePath = path.join(__dirname, url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end('Not found');
            } else {
                response.writeHead(200);
                response.end(data);
            }
        });
    } else {
        // Handle routes
        handleRoutes(url, (statusCode, contentType, data) => {
            response.writeHead(statusCode, { 'Content-Type': contentType });
            response.end(data);
        });
    }
});

// Listen on the correct port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});