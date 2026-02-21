# Comic Finder

An AI-powered manhwa/manga/manhua finder that helps you discover comics based on vague descriptions, plot details, and character traits you remember.

## What It Does

Can't remember the name of that manhwa where the MC levels up like a game? Just describe what you remember, and Comic Finder's AI will search through the database to find it for you.

## Features (Planned)

- **Agent A (Research Bot)**: Automatically gathers comic information from the web and populates the database
- **Agent B (Query Bot)**: Helps users find comics based on fuzzy descriptions
- Simple, clean search interface
- Admin upload system for manual comic additions
- Local JSON database (100-1000 comics)

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla - no frameworks!)
- **Backend**: Node.js + Express
- **Database**: JSON file (may upgrade to SQLite later)
- **AI API**: Google Gemini (free tier for development) → Claude (production)

## Color Palette

- `#222831` - Dark background
- `#393E46` - Card/section backgrounds
- `#00ADB5` - Teal accent (buttons, highlights)
- `#EEEEEE` - Light text

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## Project Structure

```
comic-finder/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   └── .env              # API keys (create from .env.example)
├── frontend/
│   ├── index.html        # Home/search page
│   ├── chat.html         # AI chat/results page
│   ├── style.css         # Styling
│   ├── script.js         # Home page logic
│   └── chat.js           # Chat page logic
└── README.md
```

## Development Phases

- ✅ **Phase 1**: Basic frontend/backend connection (COMPLETE)
- 🔄 **Phase 2**: Connect Gemini API (CURRENT)
- ⏳ **Phase 3**: Build Agent A (Research Bot)
- ⏳ **Phase 4**: Build Search Frontend
- ⏳ **Phase 5**: Build Agent B (Query Bot)
- ⏳ **Phase 6**: Polish & Deploy

## Project Status

🚧 Phase 1 Complete - Frontend redesigned with new color scheme and two-page flow
