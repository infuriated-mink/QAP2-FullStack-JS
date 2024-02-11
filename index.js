const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const weather = require('weather-js');
const NewsAPI = require('newsapi');

// News API key
const NEWS_API_KEY = '854eee0cd7c14a6fbe6f6635696189e4';

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

server.on('request', async (request, response) => {
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
        case '/faqs':
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
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end('404 Not Found');
        } else {
            // Fetch weather and news information
            Promise.all([
                new Promise((resolve, reject) => {
                    weather.find({ search: 'St. John\'s, NL, Canada', degreeType: 'F' }, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }),
                new NewsAPI(NEWS_API_KEY).v2.topHeadlines({ country: 'ca' })
            ]).then(([weatherResult, newsResult]) => {
                // Replace placeholders in the HTML template with weather and news information
                const html = data
                    .replace('{{weather}}', JSON.stringify(weatherResult[0], null, 2))
                    .replace('{{news}}', JSON.stringify(newsResult.articles, null, 2));

                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(html);
            }).catch(error => {
                console.error(error);
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Internal Server Error');
            });
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
