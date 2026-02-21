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
    
    uploadBtn.addEventListener('click', () => {
        alert('Upload feature coming soon! (Admin only)');
    });
});            