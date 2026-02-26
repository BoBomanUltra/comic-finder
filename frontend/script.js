document.addEventListener('DOMContentLoaded', () => {
    console.log('Comic Finder loaded!');
    
    const searchForm = document.getElementById('searchForm');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Admin modal elements
    const adminModal = document.getElementById('adminModal');
    const closeModal = document.getElementById('closeModal');
    const passwordForm = document.getElementById('passwordForm');
    const passwordError = document.getElementById('passwordError');
    
    // Admin panel elements
    const adminPanel = document.getElementById('adminPanel');
    const closeAdminPanel = document.getElementById('closeAdminPanel');
    const comicResearchForm = document.getElementById('comicResearchForm');
    const researchStatus = document.getElementById('researchStatus');
    const researchBtn = document.getElementById('researchBtn');
    
    const settingOptions = [
        // Time/Dimension
        'Isekai', 
        'Regression', 
        'Reincarnation', 
        'Time Travel',
        
        // Era
        'Medieval', 
        'Modern', 
        'Historical', 
        'Post-Apocalyptic', 
        'Futuristic',
        
        // World Type
        'Fantasy', 
        'Sci-Fi', 
        'Murim', 
        'Cultivation',
        'Virtual Reality',
        
        // Setting Location
        'School', 
        'Academy',
        'Dungeon', 
        'Tower',
        
        // Story Type
        'Villainess', 
        'Overpowered MC', 
        'Weak to Strong',
        'Revenge'
    ];
    
    const genreOptions = [
        // Core Genres
        'Action', 
        'Adventure', 
        'Romance', 
        'Comedy', 
        'Drama',
        
        // Tone
        'Fantasy',
        'Sci-Fi', 
        'Horror', 
        'Mystery', 
        'Thriller', 
        'Psychological',
        'Tragedy',
        
        // Style
        'Slice of Life',
        'Supernatural', 
        'Martial Arts',
        
        // Demographics
        'Seinen', 
        'Shounen', 
        'Shoujo', 
        'Josei',
        
        // Special
        'BL',
        'GL'
    ];
    
    // Generate grid checkboxes
    function generateCheckboxGrid(options, containerId) {
        const container = document.getElementById(containerId);
        
        options.forEach(option => {
            const label = document.createElement('label');
            label.className = 'grid-checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            checkbox.name = containerId;
            
            const span = document.createElement('span');
            span.textContent = option;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }
    
    // Initialize grids
    generateCheckboxGrid(settingOptions, 'settingGrid');
    generateCheckboxGrid(genreOptions, 'genresGrid');
    
    // Search form handler
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedSettings = Array.from(document.querySelectorAll('#settingGrid input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        const selectedGenres = Array.from(document.querySelectorAll('#genresGrid input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        const formData = {
            storyDescription: document.getElementById('storyDescription').value.trim(),
            characterDescription: document.getElementById('characterDescription').value.trim(),
            settings: selectedSettings,
            genres: selectedGenres,
            comicTypes: Array.from(document.querySelectorAll('input[name="comicType"]:checked'))
                .map(cb => cb.value)
        };
        
        sessionStorage.setItem('comicQuery', JSON.stringify(formData));
        window.location.href = 'chat.html';
    });
    
    // Upload button - opens password modal
    uploadBtn.addEventListener('click', () => {
        adminModal.classList.add('show');
        document.getElementById('adminPassword').value = '';
        passwordError.textContent = '';
    });

    // Close password modal
    closeModal.addEventListener('click', () => {
        adminModal.classList.remove('show');
    });

    // Click outside password modal to close
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('show');
        }
    });

    // Password form handler
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        passwordError.textContent = '';
        
        try {
            const response = await fetch('/api/verify-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Close password modal, open admin panel
                adminModal.classList.remove('show');
                adminPanel.classList.add('show');
                document.getElementById('comicUrl').value = '';
                researchStatus.textContent = '';
                researchStatus.className = 'research-status';
            } else {
                passwordError.textContent = 'Invalid password';
            }
        } catch (error) {
            passwordError.textContent = 'Connection error. Is the backend running?';
        }
    });

    // Close admin panel
    closeAdminPanel.addEventListener('click', () => {
        adminPanel.classList.remove('show');
    });

    // Click outside admin panel to close
    adminPanel.addEventListener('click', (e) => {
        if (e.target === adminPanel) {
            adminPanel.classList.remove('show');
        }
    });

    // Comic research form handler
    comicResearchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const comicUrl = document.getElementById('comicUrl').value.trim();
        
        const urlPattern = /^https:\/\/comix\.to\/title\/[a-z0-9]+-[a-z0-9-]+$/i;
        if (!urlPattern.test(comicUrl)) {
            researchStatus.textContent = '✗ Error: Please enter a valid comix.to URL in the format:\nhttps://comix.to/title/xxxxx-comic-name';
            researchStatus.className = 'research-status error';
            return;
        }

        // Show loading state
        researchStatus.textContent = 'Agent A is researching this comic. This may take 30-60 seconds';
        researchStatus.className = 'research-status loading';
        researchBtn.disabled = true;
        researchBtn.textContent = 'Researching...';
        
        try {
            const response = await fetch('/api/research-comic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comicUrl })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Success! Show result
                researchStatus.textContent = `✓ Successfully added "${data.comic.primary_name}" to database!\n\nFound ${data.comic.genres?.length || 0} genres, ${data.comic.settings?.length || 0} settings.`;
                researchStatus.className = 'research-status success';
                
                // Reset form for next entry
                document.getElementById('comicUrl').value = '';
            } else {
                // Error
                researchStatus.textContent = '✗ Error: ' + data.error;
                researchStatus.className = 'research-status error';
            }
        } catch (error) {
            researchStatus.textContent = '✗ Connection error: ' + error.message;
            researchStatus.className = 'research-status error';
        } finally {
            // Re-enable button
            researchBtn.disabled = false;
            researchBtn.textContent = 'Research & Add Comic';
        }
    });
});