const fs = require('fs');
const path = require('path');

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

module.exports = { logEvent };
