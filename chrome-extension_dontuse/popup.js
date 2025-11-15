// Popup functionality
document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const testBtn = document.getElementById('testBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    // Test Flask API connection
    testBtn.addEventListener('click', async () => {
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;
        
        try {
            const response = await fetch('http://localhost:5000/submitTweet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tweetText: 'test connection' })
            });
            
            if (response.ok) {
                statusDiv.className = 'status active';
                statusDiv.innerHTML = '✅ API Connected';
                alert('✅ Successfully connected to Flask API!');
            } else {
                throw new Error('API responded with error');
            }
        } catch (error) {
            statusDiv.className = 'status inactive';
            statusDiv.innerHTML = '❌ API Disconnected';
            alert('❌ Could not connect to Flask API.\n\nMake sure your Flask server is running on http://localhost:5000');
        } finally {
            testBtn.textContent = 'Test Connection';
            testBtn.disabled = false;
        }
    });
    
    // Settings button (placeholder)
    settingsBtn.addEventListener('click', () => {
        alert('Settings coming soon!\n\nFeatures:\n- Toggle on/off\n- Adjust sensitivity\n- Custom hotlines');
    });
    
    // Check initial status
    fetch('http://localhost:5000/submitTweet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetText: 'status check' })
    })
    .then(response => {
        if (response.ok) {
            statusDiv.className = 'status active';
            statusDiv.innerHTML = '✅ Extension is active';
        } else {
            throw new Error('API not responding');
        }
    })
    .catch(() => {
        statusDiv.className = 'status inactive';
        statusDiv.innerHTML = '⚠️ API not connected';
    });
});
