document.addEventListener('DOMContentLoaded', () => {
    console.log('Comic Finder loaded!');
    
    const searchForm = document.getElementById('searchForm');
    const uploadBtn = document.getElementById('uploadBtn');
    
    const settingInput = document.getElementById('setting');
    const genresInput = document.getElementById('genres');
    const settingDropdown = document.getElementById('settingDropdown');
    const genresDropdown = document.getElementById('genresDropdown');
    const settingTagsContainer = document.getElementById('settingTags');
    const genresTagsContainer = document.getElementById('genresTags');
    
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
        'Isekai', 'Time Regression', 'Reincarnation', 'Medieval', 'Fantasy', 
        'Modern', 'Post-Apocalyptic', 'Sci-Fi', 'Historical', 'School', 
        'Dungeon/Tower', 'Cultivation', 'Game World', 'Virtual Reality'
    ];
    
    const genreOptions = [
        'Action', 'Adventure', 'Romance', 'Comedy', 'Drama', 'Fantasy',
        'Sci-Fi', 'Horror', 'Mystery', 'Thriller', 'Slice of Life',
        'Supernatural', 'Martial Arts', 'Psychological', 'Tragedy',
        'Seinen', 'Shounen', 'Shoujo', 'Josei'
    ];
    
    let selectedSettings = [];
    let selectedGenres = [];
    
    function createTag(text, container, selectedArray, input, dropdown, allOptions) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        
        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = text;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'tag-remove';
        removeBtn.innerHTML = '×';
        removeBtn.type = 'button';
        
        removeBtn.addEventListener('click', () => {
            tag.remove();
            const index = selectedArray.indexOf(text);
            if (index > -1) {
                selectedArray.splice(index, 1);
            }
            updateDropdown(input, dropdown, allOptions, selectedArray);
        });
        
        tag.appendChild(tagText);
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    }
    
    function addTag(text, container, selectedArray, input, dropdown, allOptions) {
        if (!text || selectedArray.includes(text)) return;
        
        selectedArray.push(text);
        createTag(text, container, selectedArray, input, dropdown, allOptions);
        input.value = '';
        updateDropdown(input, dropdown, allOptions, selectedArray);
    }
    
    function updateDropdown(input, dropdown, allOptions, selectedArray) {
        const filter = input.value.toLowerCase();
        const available = allOptions.filter(opt => !selectedArray.includes(opt));
        const filtered = available.filter(opt => 
            opt.toLowerCase().includes(filter)
        );
        
        showDropdown(dropdown, filtered, input, selectedArray);
    }
    
    function showDropdown(dropdown, options, input, selectedArray) {
        dropdown.innerHTML = '';
        
        if (options.length === 0) {
            dropdown.classList.remove('show');
            return;
        }
        
        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = option;
            
            item.addEventListener('click', () => {
                const container = input.id === 'setting' ? settingTagsContainer : genresTagsContainer;
                const allOptions = input.id === 'setting' ? settingOptions : genreOptions;
                addTag(option, container, selectedArray, input, dropdown, allOptions);
            });
            
            dropdown.appendChild(item);
        });
        
        dropdown.classList.add('show');
    }
    
    function setupTagInput(input, dropdown, container, allOptions, selectedArray) {
        input.addEventListener('focus', () => {
            updateDropdown(input, dropdown, allOptions, selectedArray);
        });
        
        input.addEventListener('input', () => {
            updateDropdown(input, dropdown, allOptions, selectedArray);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                e.preventDefault();
                const value = input.value.trim();
                const match = allOptions.find(opt => 
                    opt.toLowerCase() === value.toLowerCase()
                );
                if (match) {
                    addTag(match, container, selectedArray, input, dropdown, allOptions);
                }
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    setupTagInput(settingInput, settingDropdown, settingTagsContainer, settingOptions, selectedSettings);
    setupTagInput(genresInput, genresDropdown, genresTagsContainer, genreOptions, selectedGenres);
    
    // Search form handler
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
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
            const response = await fetch('http://localhost:3000/api/verify-admin', {
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
                document.getElementById('comicName').value = '';
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
        
        const comicName = document.getElementById('comicName').value.trim();
        
        // Show loading state
        researchStatus.textContent = 'Agent A is researching "' + comicName + '"... This may take 30-60 seconds.';
        researchStatus.className = 'research-status loading';
        researchBtn.disabled = true;
        researchBtn.textContent = 'Researching...';
        
        try {
            const response = await fetch('http://localhost:3000/api/research-comic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comicName })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Success! Show result
                researchStatus.textContent = `✓ Successfully added "${data.comic.primary_name}" to database!\n\nFound ${data.comic.genres?.length || 0} genres, ${data.comic.settings?.length || 0} settings.`;
                researchStatus.className = 'research-status success';
                
                // Reset form for next entry
                document.getElementById('comicName').value = '';
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