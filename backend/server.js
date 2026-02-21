const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { checkAndIncrement } = require('./rateLimiter');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/test-ai', async (req, res) => {
    const rateCheck = checkAndIncrement('agentB');
    
    if (!rateCheck.allowed) {
        return res.status(429).json({
            success: false,
            error: rateCheck.message,
            usage: rateCheck
        });
    }
    
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = "Say hello in a friendly way and confirm you're working!";
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        res.json({ 
            success: true,
            aiResponse: response,
            usage: rateCheck
        });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

app.post('/api/verify-admin', (req, res) => {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
        return res.json({ 
            success: true,
            message: 'Access granted'
        });
    }
    
    res.status(401).json({ 
        success: false,
        error: 'Invalid password'
    });
});

app.post('/api/research-comic', async (req, res) => {
    const { comicName } = req.body;
    
    // TODO: We'll build the real Agent A logic later
    // For now, simulate a delay and return mock data
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    res.json({
        success: true,
        comic: {
            primary_name: comicName,
            genres: ['Action', 'Fantasy'],
            settings: ['Isekai', 'Modern'],
            message: 'Mock data - real Agent A coming soon!'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
