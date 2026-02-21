document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat page loaded!');
    
    const backBtn = document.getElementById('backBtn');
    const userQueryElement = document.getElementById('userQuery');
    
    const query = sessionStorage.getItem('comicQuery');
    
    if (query) {
        const formData = JSON.parse(query);
            
        const formattedQuery = `Story: ${formData.storyDescription || 'Not specified'}
        
Character(s): ${formData.characterDescription || 'Not specified'}

Setting(s): ${formData.settings && formData.settings.length > 0 ? formData.settings.join(', ') : 'Not specified'}

Genre(s): ${formData.genres && formData.genres.length > 0 ? formData.genres.join(', ') : 'Not specified'}

Comic Type(s): ${formData.comicTypes && formData.comicTypes.length > 0 ? formData.comicTypes.join(', ') : 'Not specified'}`.trim();
            
        userQueryElement.textContent = formattedQuery;
        
        setTimeout(() => {
            callAI();
        }, 1500);
    } else {
        window.location.href = 'index.html';
    }
    
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

async function callAI() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingMessage = chatMessages.querySelector('.ai-message');
    
    try {
        const response = await fetch('http://localhost:3000/api/test-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
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
        
        const aiResponse = document.createElement('div');
        aiResponse.className = 'message ai-message';
        aiResponse.innerHTML = `
            <div class="message-content">
                <p><strong>AI Response:</strong></p>
                <p>${data.aiResponse}</p>
            </div>
        `;
        
        chatMessages.appendChild(aiResponse);
        
    } catch (error) {
        loadingMessage.remove();
        
        const errorResponse = document.createElement('div');
        errorResponse.className = 'message ai-message';
        errorResponse.innerHTML = `
            <div class="message-content">
                <p><strong>Error:</strong></p>
                <p>Could not connect to AI. Is the backend running?</p>
            </div>
        `;
        
        chatMessages.appendChild(errorResponse);
    }
}
