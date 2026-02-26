const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const { checkAndIncrement } = require('./rateLimiter');
const { insertComic, checkComicExists, searchComics } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

const genreOptions = [
    'Action', 'Adventure', 'Romance', 'Comedy', 'Drama',
    'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Thriller', 
    'Psychological', 'Tragedy', 'Slice of Life', 'Supernatural', 
    'Martial Arts', 'Seinen', 'Shounen', 'Shoujo', 'Josei', 'BL', 'GL'
];

const settingOptions = [
    'Isekai', 'Regression', 'Reincarnation', 'Time Travel',
    'Medieval', 'Modern', 'Historical', 'Post-Apocalyptic', 'Futuristic',
    'Fantasy', 'Sci-Fi', 'Murim', 'Cultivation', 'Virtual Reality',
    'School', 'Academy', 'Dungeon', 'Tower',
    'Villainess', 'Overpowered MC', 'Weak to Strong', 'Revenge'
];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

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

// Agent A - Research comic
app.post('/api/research-comic', async (req, res) => {
    const { comicUrl } = req.body;
    
    // Check rate limit
    const rateCheck = checkAndIncrement('agentA');
    if (!rateCheck.allowed) {
        return res.status(429).json({
            success: false,
            error: rateCheck.message
        });
    }

    // VALIDATE URL FORMAT
    const urlPattern = /^https:\/\/comix\.to\/title\/[a-z0-9]+-[a-z0-9-]+$/i;
    if (!urlPattern.test(comicUrl)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid comix.to URL format. Expected: https://comix.to/title/xxxxx-comic-name'
        });
    }
    
    try {
        // Extract comic name from URL for duplicate check
        const urlMatch = comicUrl.match(/\/title\/[^-]+-(.+)$/);
        const comicNameForCheck = urlMatch ? urlMatch[1].replace(/-/g, ' ') : comicUrl;
        
        // Check if comic already exists
        checkComicExists(comicNameForCheck, async (err, existing) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: 'Database error: ' + err.message
                });
            }
            
            if (existing) {
                return res.json({
                    success: false,
                    error: `Comic "${existing.primary_name}" already exists in database`
                });
            }
            
            // Call Claude API with web search
            console.log(`🔍 Agent A researching: ${comicUrl}`);
            
            const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 10000,
                thinking: {
                    type: 'enabled',
                    budget_tokens: 5000
                },
                system: `You are a comic database researcher. You will receive a comix.to URL. Extract information from that page and return ONLY a JSON object.
CRITICAL: Your response must be VALID JSON ONLY. No explanations, no preamble, no markdown code blocks. Start with { and end with }.

Use ONLY genres from this list: ${genreOptions.join(', ')}
Use ONLY settings from this list: ${settingOptions.join(', ')}

Return this exact JSON structure:
{
  "primary_name": "Official comic title from the page",
  "alternative_names": ["Alt name 1", "Alt name 2", ...],
  "comic_type": "manga" OR "manhwa" OR "manhua",
  "genres": ["Action", "Fantasy", ...],
  "settings": ["Isekai", "Overpowered MC", ...],
  "story_description": "100-150 words describing the plot",
  "character_description": "100-150 words describing key characters",
  "source_url": "The comix.to URL provided to you"
}

IMPORTANT:
- The source_url is already provided - just copy it exactly
- Get the comic_type, primary_name, and alternative_names directly from the comix.to page
- ONLY use genres and settings from the provided lists above

RESEARCH PROCESS:
1. First, extract basic info from the comix.to page
2. Then use web search to find detailed plot summaries, reviews, and wiki pages
3. Use these sources to write accurate story_description and character_description
4. Use these sources to identify matching genres and settings from the provided lists

GENRE/SETTING MATCHING:
- Search for "[comic name] plot summary" and "[comic name] genre" to find comprehensive descriptions
- Only include genres/settings that are core to the story, not minor elements
- If uncertain whether a genre/setting applies, do NOT include it
- Match based on what the story is actually about, not just what briefly appears
- Be precise and selective - quality over quantity

OTHER:
- Keep story_description and character_description within 100-150 words each
- Be descriptive but not redundant, include only important details`,
                tools: [{
                    type: 'web_search_20250305',
                    name: 'web_search'
                }],
                messages: [{
                    role: 'user',
                    content: `Extract information from this comix.to page: ${comicUrl}`
                }]
            });
            
            // Extract response
            const textBlock = response.content.find(block => block.type === 'text');
            if (!textBlock) {
                return res.status(500).json({
                    success: false,
                    error: 'No response from Claude API'
                });
            }
            
            // Parse JSON
            let comicData;
            try {
                let jsonText = textBlock.text.trim();
                
                // Remove markdown code blocks if present
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                
                // Try to find JSON object in the text
                const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonText = jsonMatch[0];
                }
                
                comicData = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', textBlock.text);
                return res.status(500).json({
                    success: false,
                    error: 'Invalid JSON response from AI. Raw response: ' + textBlock.text.substring(0, 200)
                });
            }
            
            // Save to database
            insertComic(comicData, (insertErr, savedComic) => {
                if (insertErr) {
                    return res.status(500).json({
                        success: false,
                        error: 'Database insert error: ' + insertErr.message
                    });
                }
                
                console.log(`✅ Saved comic: ${savedComic.primary_name}`);
                
                res.json({
                    success: true,
                    comic: savedComic
                });
            });
        });
        
    } catch (error) {
        console.error('Agent A Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Agent B - Search comics
app.post('/api/search-comics', async (req, res) => {
    const { storyDescription, characterDescription, genres, settings, comicTypes } = req.body;
    
    // Check rate limit
    const rateCheck = checkAndIncrement('agentB');
    if (!rateCheck.allowed) {
        return res.status(429).json({
            success: false,
            error: rateCheck.message
        });
    }
    
    try {
        
        // Search database with filters
        searchComics({ genres, settings, comicTypes }, async (err, comics) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: 'Database search error: ' + err.message
                });
            }
            
            // If no comics found
            if (comics.length === 0) {
                return res.json({
                    success: true,
                    matches: [],
                    message: 'No comics found matching your filters. Try removing some filters.'
                });
            }
            
            console.log(`🔍 Agent B searching through ${comics.length} filtered comics`);
            
            // Build context for Claude
            const comicsContext = comics.map(c => 
                `Title: ${c.primary_name}
Type: ${c.comic_type}
Genres: ${c.genres.join(', ')}
Settings: ${c.settings.join(', ')}
Story: ${c.story_description}
Characters: ${c.character_description}
URL: ${c.source_url}
---`
            ).join('\n\n');
            
            // Call Claude API
            const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 10000,
                thinking: {
                    type: 'enabled',
                    budget_tokens: 5000
                },
                system: `You are a comic recommendation assistant. Match the user's description to the most relevant comics.

You will receive:
1. User's story description (may be empty)
2. User's character description (may be empty)
3. A list of comics that match their genre/setting/type filters

Your task:
- Read each comic's story_description and character_description carefully
- Match them to what the user is looking for
- Return the top 5 most relevant comics (or fewer if less than 5 good matches)

Return ONLY a JSON array with NO explanations, preamble, or markdown:
[
  {
    "primary_name": "Comic Title",
    "source_url": "https://comix.to/...",
    "match_reason": "One sentence explaining why this matches (50-100 words)"
  }
]

If no good matches: return empty array []
Be precise - only include comics that truly match the user's description.
Do not include comics that only partially match or seem loosely related.`,
                messages: [{
                    role: 'user',
                    content: `Story Description: ${storyDescription || 'Not provided'}
Character Description: ${characterDescription || 'Not provided'}

Available Comics:
${comicsContext}`
                }]
            });
            
            // Extract response
            const textBlock = response.content.find(block => block.type === 'text');
            if (!textBlock) {
                return res.status(500).json({
                    success: false,
                    error: 'No response from Claude API'
                });
            }
            
            // Parse JSON
            let matches;
            try {
                let jsonText = textBlock.text.trim();
                
                // Remove markdown code blocks if present
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                
                // Try to find JSON array in the text
                const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    jsonText = jsonMatch[0];
                }
                
                matches = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', textBlock.text);
                return res.status(500).json({
                    success: false,
                    error: 'Invalid JSON response from AI'
                });
            }
            
            console.log(`✅ Agent B found ${matches.length} matches`);
            
            res.json({
                success: true,
                matches: matches,
                totalFiltered: comics.length
            });
        });
        
    } catch (error) {
        console.error('Agent B Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
