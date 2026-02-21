// Comic Finder - Chat Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat page loaded!');
    
    const backBtn = document.getElementById('backBtn');
    const userQueryElement = document.getElementById('userQuery');
    
    // Get the search query from sessionStorage
    const query = sessionStorage.getItem('comicQuery');
    
    if (query) {
        // Display user's original query
        userQueryElement.textContent = query;
        
        // TODO: Send query to backend Agent B
        // This will be implemented in Phase 5
        setTimeout(() => {
            simulateAIResponse();
        }, 1500);
    } else {
        // No query found, redirect back to home
        window.location.href = 'index.html';
    }
    
    // Back button functionality
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// Temporary function to simulate AI response
// We'll replace this in Phase 5 with actual backend call
function simulateAIResponse() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingMessage = chatMessages.querySelector('.ai-message');
    
    // Remove loading message
    loadingMessage.remove();
    
    // Add simulated AI response
    const aiResponse = document.createElement('div');
    aiResponse.className = 'message ai-message';
    aiResponse.innerHTML = `
        <div class="message-content">
            <p><strong>AI Response (Simulated - Coming in Phase 5!):</strong></p>
            <p>I'm still learning! Once we connect Agent B in Phase 5, I'll be able to search our database and find comics that match your description.</p>
            <p>For now, this is just a preview of how the chat will look.</p>
        </div>
    `;
    
    chatMessages.appendChild(aiResponse);
}
