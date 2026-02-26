document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat page loaded!');
    
    const backBtn = document.getElementById('backBtn');
    const userQueryElement = document.getElementById('userQuery');
    const chatMessages = document.getElementById('chatMessages');
    
    const query = sessionStorage.getItem('comicQuery');
    
    if (query) {
        const formData = JSON.parse(query);
            
        const formattedQuery = `Story: ${formData.storyDescription || 'Not specified'}
        
Character(s): ${formData.characterDescription || 'Not specified'}

Setting(s): ${formData.settings && formData.settings.length > 0 ? formData.settings.join(', ') : 'Not specified'}

Genre(s): ${formData.genres && formData.genres.length > 0 ? formData.genres.join(', ') : 'Not specified'}

Comic Type(s): ${formData.comicTypes && formData.comicTypes.length > 0 ? formData.comicTypes.join(', ') : 'Not specified'}`.trim();
            
        userQueryElement.textContent = formattedQuery;
        
        // Call Agent B after short delay
        setTimeout(() => {
            searchComics(formData);
        }, 1500);
    } else {
        window.location.href = 'index.html';
    }
    
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

async function searchComics(formData) {
    const chatMessages = document.getElementById('chatMessages');
    const loadingMessage = chatMessages.querySelector('.ai-message');
    
    try {
        const response = await fetch('/api/search-comics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storyDescription: formData.storyDescription || '',
                characterDescription: formData.characterDescription || '',
                genres: formData.genres || [],
                settings: formData.settings || [],
                comicTypes: formData.comicTypes || []
            })
        });
        
        const data = await response.json();
        
        // Remove loading message
        loadingMessage.remove();
        
        if (!data.success) {
            const errorResponse = document.createElement('div');
            errorResponse.className = 'message ai-message';
            errorResponse.innerHTML = `
                <div class="message-content">
                    <p><strong>Error:</strong></p>
                    <p>${data.error}</p>
                </div>
            `;
            chatMessages.appendChild(errorResponse);
            return;
        }
        
        // Display results
        if (data.matches.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'message ai-message';
            noResults.innerHTML = `
                <div class="message-content">
                    <p><strong>No comics found 😔</strong></p>
                    <p>${data.message || 'No comics match your description.'}</p>
                    <p>Try:</p>
                    <ul>
                        <li>Removing some genre/setting filters</li>
                        <li>Being less specific in your description</li>
                        <li>Using different keywords</li>
                    </ul>
                </div>
            `;
            chatMessages.appendChild(noResults);
            return;
        }
        
        // Display matched comics
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'message ai-message';
        
        let html = `
            <div class="message-content">
                <p><strong>Found ${data.matches.length} comic(s):</strong></p>
        `;
        
        data.matches.forEach((match, index) => {
            html += `
                <div class="comic-result">
                    <h3>${index + 1}. <a href="${match.source_url}" target="_blank">${match.primary_name}</a></h3>
                    <p>${match.match_reason}</p>
                </div>
            `;
        });
        
        html += '</div>';
        resultsDiv.innerHTML = html;
        chatMessages.appendChild(resultsDiv);
        
    } catch (error) {
        loadingMessage.remove();
        
        const errorResponse = document.createElement('div');
        errorResponse.className = 'message ai-message';
        errorResponse.innerHTML = `
            <div class="message-content">
                <p><strong>Error:</strong></p>
                <p>Could not connect to backend: ${error.message}</p>
            </div>
        `;
        
        chatMessages.appendChild(errorResponse);
    }
}


