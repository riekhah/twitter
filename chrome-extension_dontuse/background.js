// Background service worker
console.log('Mental Health Guardian background service worker loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeTweet') {
        // Forward to Flask API
        fetch('http://localhost:5000/submitTweet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tweetText: request.tweetText })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({ success: true, data: data });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ success: false, error: error.message });
        });
        
        return true; // Keep the message channel open for async response
    }
});

// Set up badge when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('Mental Health Guardian extension installed');
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#1da1f2' });
});
