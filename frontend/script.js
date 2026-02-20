// This is the "waiter" - it carries messages between the dining room (frontend) 
// and the kitchen (backend)

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frontend loaded successfully!');
    
    // Get the button and result paragraph
    const testBtn = document.getElementById('testBtn');
    const testResult = document.getElementById('testResult');
    
    // When button is clicked, test the connection
    testBtn.addEventListener('click', async () => {
        testResult.textContent = 'Testing connection...';
        testResult.className = '';
        
        try {
            // Make a request to our backend
            // fetch() is like sending a waiter to the kitchen with an order
            const response = await fetch('http://localhost:3000/api/test');
            
            // Get the response back (like the waiter bringing food)
            const data = await response.json();
            
            // Show success message
            testResult.textContent = `✅ ${data.message} (Time: ${data.timestamp})`;
            testResult.className = 'success';
            
        } catch (error) {
            // If something went wrong
            testResult.textContent = `❌ Error: ${error.message}. Is the backend running?`;
            testResult.className = 'error';
        }
    });
});
