const http = require('http');
const { logEvent } = require('./logevents');
const { handleRoutes } = require('./routes');

// Create a multi-route HTTP server
const server = http.createServer();

server.on('request', (request, response) => {
    const { url } = request;

    // Log the route access
    logEvent(url);

    // Handle routes
    handleRoutes(url, (statusCode, contentType, data) => {
        response.writeHead(statusCode, { 'Content-Type': contentType });
        response.end(data);
    });
});

// Listen on the correct port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
