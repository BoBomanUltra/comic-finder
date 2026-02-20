// This is our backend server - the "kitchen" of our restaurant
// It listens for requests and sends back responses

const express = require('express');
const cors = require('cors');
const path = require('path');

// Create our server
const app = express();
const PORT = 3000;

// Middleware - think of these as "rules" for how the server operates
app.use(cors()); // Allows frontend and backend to talk to each other
app.use(express.json()); // Lets us read JSON data from requests

// Serve the frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// TEST ROUTE - just to see if server is working
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Try visiting: http://localhost:${PORT}/api/test`);
});
