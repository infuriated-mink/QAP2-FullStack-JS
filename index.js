const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');
const path = require('path');
const weather = require('weather-js');
const NewsAPI = require('newsapi');

// News API key
const NEWS_API_KEY = '854eee0cd7c14a6fbe6f6635696189e4';

// Instantiate an event emitter
const myEmitter = new EventEmitter();

// Function to create daily log file
const createLogFile = () => {
    const currentDate = new Date();
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    const logFileName = `${currentDate.toISOString().slice(0, 10)}.log`;
    return path.join(logDir, logFileName);
}

// Function to fetch weather information for St. John's, Newfoundland and Labrador, Canada
const getWeatherInfo = (callback) => {
    weather.find({ search: 'St. John\'s, NL, Canada', degreeType: 'C' }, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result[0]);
        }
    });
}

// Function to fetch news headlines for Canada
const getNewsHeadlines = async () => {
    const newsapi = new NewsAPI(NEWS_API_KEY);
    try {
        const response = await newsapi.v2.topHeadlines({
            country: 'ca'
        });
        return response.articles;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Create a multi-route HTTP server
const server = http.createServer();

server.on('request', async (request, response) => {
    const { url } = request;
    let filePath = '';

    // Determine action based on the route requested
    switch (url) {
        case '/':
            // Fetch weather and news information
            const [weatherInfo, newsHeadlines] = await Promise.all([
                new Promise((resolve, reject) => {
                    getWeatherInfo((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                }),
                getNewsHeadlines()
            ]);

            // Read the home page HTML template
            fs.readFile('./views/home.html', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                    response.end('Internal Server Error');
                } else {
                    // Replace placeholders in the HTML template with weather and news information
                    const html = data
                        .replace('{{weather}}', JSON.stringify(weatherInfo, null, 2))
                        .replace('{{news}}', JSON.stringify(newsHeadlines, null, 2));

                    // Send the modified HTML response to the client
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(html);
                }
            });
            break;
        // Handle other routes as before
    }

    // Emit event for route access
    myEmitter.emit('routeAccess', url);
});

// Listen on the correct port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Implement event scenarios
// Log route access to console and disk
myEmitter.on('routeAccess', (route) => {
    console.log(`Route accessed: ${route}`);

    // Log to disk
    const logMessage = `${new Date().toISOString()} - Route accessed: ${route}\n`;
    const logFilePath = createLogFile();
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error(`Error writing to log file: ${err}`);
        }
    });
});
