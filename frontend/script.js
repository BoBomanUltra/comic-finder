// Comic Finder - Home Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Comic Finder loaded!');
    
    const searchForm = document.getElementById('searchForm');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const description = document.getElementById('comicDescription').value.trim();
        
        if (description) {
            sessionStorage.setItem('comicQuery', description);
            window.location.href = 'chat.html';
        }
    });
    
    // Handle upload button (placeholder for now)
    uploadBtn.addEventListener('click', () => {
        alert('Upload feature coming soon! (Admin only)');
        // TODO: Implement admin authentication and upload functionality
    });
});
