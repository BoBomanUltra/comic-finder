# Comic Finder

An AI-powered comic discovery tool that helps you find manga/manhwa/manhua based on story description, character traits, and genre/setting preferences you remember.

## System Architecture Diagram

![System Architecture](SystemDiagram.png)

The Comic Finder uses a dual-agent system:
- **Agent A (Research)**: Extracts and stores comic data from comix.to URLs using Claude Sonnet 4.6 with web search
- **Agent B (Search)**: Matches user descriptions to comics using semantic similarity with Claude Sonnet 4.6
- **Database**: SQLite with normalized schema storing comics, genres, settings, and alternative names
- **Frontend**: Vanilla JavaScript with checkbox-grid interface for genre/setting selection

## Tech Stack

**Frontend:** HTML, CSS, Vanilla JavaScript  
**Backend:** Node.js, Express  
**Database:** SQLite  
**AI:** Claude Sonnet 4.6 (Anthropic)  
**Data Source:** comix.to

