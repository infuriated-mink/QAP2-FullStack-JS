const fs = require('fs');
const path = require('path');
const weather = require('weather-js');
const NewsAPI = require('newsapi');

// News API key
const NEWS_API_KEY = '854eee0cd7c14a6fbe6f6635696189e4';

function handleRoutes(url, callback) {
    let filePath = '';
    let statusCode = 200;

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
        case '/badrequest':
            console.log("Bad Request");
            statusCode = 400;
            filePath = './views/error.html';
            break;
        case '/unauthorized':
            console.log("Unauthorized");
            statusCode = 401;
            filePath = './views/error.html';
            break;
        case '/forbidden':
            console.log("Forbidden");
            statusCode = 403;
            filePath = './views/error.html';
            break;
        default:
            console.log("Home page requested");
            filePath = './views/home.html';
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            callback(404, 'text/html', '404 Not Found');
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

                callback(statusCode, 'text/html', html);
            }).catch(error => {
                console.error(error);
                callback(500, 'text/plain', 'Internal Server Error');
            });
        }
    });
}

module.exports = { handleRoutes };