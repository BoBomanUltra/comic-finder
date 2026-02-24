const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'comics.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    db.serialize(() => {
        // Main comics table
        db.run(`
            CREATE TABLE IF NOT EXISTS comics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                primary_name TEXT UNIQUE NOT NULL,
                story_description TEXT,
                character_description TEXT,
                comic_type TEXT,
                source_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Genres table
        db.run(`
            CREATE TABLE IF NOT EXISTS comic_genres (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                comic_id INTEGER NOT NULL,
                genre TEXT NOT NULL,
                FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
            )
        `);

        // Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS comic_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                comic_id INTEGER NOT NULL,
                setting TEXT NOT NULL,
                FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
            )
        `);

        // Alternative names table
        db.run(`
            CREATE TABLE IF NOT EXISTS comic_alternatives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                comic_id INTEGER NOT NULL,
                alternative_name TEXT NOT NULL,
                FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Database tables initialized');
    });
}

// Insert comic and related data
function insertComic(comicData, callback) {
    db.serialize(() => {
        // Insert main comic
        db.run(
            `INSERT INTO comics (primary_name, story_description, character_description, comic_type, source_url) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                comicData.primary_name,
                comicData.story_description,
                comicData.character_description,
                comicData.comic_type,
                comicData.source_url
            ],
            function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }

                const comicId = this.lastID;

                // Insert genres
                if (comicData.genres && comicData.genres.length > 0) {
                    const genreStmt = db.prepare(`INSERT INTO comic_genres (comic_id, genre) VALUES (?, ?)`);
                    comicData.genres.forEach(genre => {
                        genreStmt.run(comicId, genre);
                    });
                    genreStmt.finalize();
                }

                // Insert settings
                if (comicData.settings && comicData.settings.length > 0) {
                    const settingStmt = db.prepare(`INSERT INTO comic_settings (comic_id, setting) VALUES (?, ?)`);
                    comicData.settings.forEach(setting => {
                        settingStmt.run(comicId, setting);
                    });
                    settingStmt.finalize();
                }

                // Insert alternative names
                if (comicData.alternative_names && comicData.alternative_names.length > 0) {
                    const altStmt = db.prepare(`INSERT INTO comic_alternatives (comic_id, alternative_name) VALUES (?, ?)`);
                    comicData.alternative_names.forEach(altName => {
                        altStmt.run(comicId, altName);
                    });
                    altStmt.finalize();
                }

                callback(null, { id: comicId, ...comicData });
            }
        );
    });
}

// Check if comic exists by name or alternative name
function checkComicExists(comicName, callback) {
    const normalized = comicName.toLowerCase().trim();
    
    db.get(
        `SELECT c.id, c.primary_name 
         FROM comics c 
         WHERE LOWER(c.primary_name) = ?
         UNION
         SELECT c.id, c.primary_name 
         FROM comics c 
         JOIN comic_alternatives ca ON c.id = ca.comic_id 
         WHERE LOWER(ca.alternative_name) = ?`,
        [normalized, normalized],
        callback
    );
}

// Search comics based on filters
function searchComics(filters, callback) {
    const { genres, settings, comicTypes } = filters;
    
    // Build WHERE clauses
    const conditions = [];
    const params = [];
    
    // Genre filter (OR logic)
    if (genres && genres.length > 0) {
        const genrePlaceholders = genres.map(() => '?').join(',');
        conditions.push(`c.id IN (SELECT comic_id FROM comic_genres WHERE genre IN (${genrePlaceholders}))`);
        params.push(...genres);
    }
    
    // Setting filter (OR logic)
    if (settings && settings.length > 0) {
        const settingPlaceholders = settings.map(() => '?').join(',');
        conditions.push(`c.id IN (SELECT comic_id FROM comic_settings WHERE setting IN (${settingPlaceholders}))`);
        params.push(...settings);
    }
    
    // Comic type filter (OR logic)
    if (comicTypes && comicTypes.length > 0) {
        const typePlaceholders = comicTypes.map(() => '?').join(',');
        conditions.push(`c.comic_type IN (${typePlaceholders})`);
        params.push(...comicTypes);
    }
    
    // Build final query
    let query = `
        SELECT DISTINCT 
            c.id,
            c.primary_name,
            c.story_description,
            c.character_description,
            c.comic_type,
            c.source_url
        FROM comics c
    `;
    
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    db.all(query, params, (err, comics) => {
        if (err) {
            return callback(err, null);
        }
        
        // Get genres and settings for each comic
        const comicsWithDetails = [];
        let processed = 0;
        
        if (comics.length === 0) {
            return callback(null, []);
        }
        
        comics.forEach(comic => {
            // Get genres
            db.all('SELECT genre FROM comic_genres WHERE comic_id = ?', [comic.id], (err, genres) => {
                if (err) return callback(err, null);
                
                comic.genres = genres.map(g => g.genre);
                
                // Get settings
                db.all('SELECT setting FROM comic_settings WHERE comic_id = ?', [comic.id], (err, settings) => {
                    if (err) return callback(err, null);
                    
                    comic.settings = settings.map(s => s.setting);
                    
                    comicsWithDetails.push(comic);
                    processed++;
                    
                    if (processed === comics.length) {
                        callback(null, comicsWithDetails);
                    }
                });
            });
        });
    });
}

module.exports = { initializeDatabase, insertComic, checkComicExists, searchComics };