const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
//const wss = new WebSocket('ws://thekallective.com/ready');

function thkGenerateRandomValue(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

// Function to read and process the JSON file
function thkprocessJSONFile() {

    // Read the JSON file
    const rawData = fs.readFileSync('products.json');

    // Parse the JSON
    const jsonData = JSON.parse(rawData);

    // Process for the Random number
    for (const key in jsonData.dynamic_price_main) {
        const minPrice = parseFloat(jsonData.dynamic_price_main[key].min_price);
        const maxPrice = parseFloat(jsonData.dynamic_price_main[key].max_price);
        jsonData.dynamic_price_main[key] = thkGenerateRandomValue(minPrice, maxPrice);
    }

    return jsonData;
}

setInterval(() => {
    const updatedData = thkprocessJSONFile();
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(updatedData));
        }
    });
}, 2000);

wss.on('connection', (ws) => {

    console.log('Client connected...');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});