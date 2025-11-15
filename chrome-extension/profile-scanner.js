// Profile Scanner - Analyzes all tweets on profile pages
// Wrapped in IIFE to avoid variable conflicts with content.js
(function() {
'use strict';





/* PSEUDOCODE
1 Initialization (initializeProfileScanner): When a user navigates to a Twitter/X profile page, the script waits 2 seconds for the page to load, then triggers the main scanning process.

2 Initial Scan (scanAllTweets): The script queries the page for all visible tweet elements (using the selector [data-testid="tweet"]).

3 Individual Tweet Processing (scanTweet): It iterates through each found tweet.

4 Highlighting (addWarningLabel): If the backend's analysis returns a "prediction": "suicide", this function is called. It dynamically injects HTML and CSS

5. Summary Report: just sum the sensitivity/recall

*/







console.log('🔍 Profile Scanner Module Loaded');

const SCANNER_API_URL = 'http://localhost:5000/submitTweet';

let isScanning = false;
let scannedTweets = new Set(); // Track which tweets already scanned since Set requires unique iD

// Function to get topic name from topic index
function getTopicName(topicIndex) {
    const topics = {
        0: "Self-Harm & Methods",
        1: "Active Intent",
        2: "Isolation & Abandonment", 
        3: "Depression & Loneliness",
        4: "Hopelessness & Despair",
        5: "Goodbye Messages"
    };
    return topics[topicIndex] || `Topic #${topicIndex}`;
}

// Function to analyze tweet text
async function analyzeTweetForScanner(tweetText) {
    try {
        console.log('📤 [Scanner] Sending tweet for analysis:', tweetText.substring(0, 50) + '...');
        
        const response = await fetch(SCANNER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tweetText: tweetText })
        });

        const data = await response.json();
        console.log('📥 [Scanner] Received analysis');
        
        return data;
    } catch (error) {
        console.error('❌ [Scanner] Error analyzing tweet:', error);
        return null;
    }
}

// Function to add warning label to a tweet
function addWarningLabel(tweetElement, analysis) {
    // Check if already labeled
    if (tweetElement.querySelector('.mh-warning-label')) {
        return;
    }

    const topicIndex = analysis.interpretation?.dominant_topic_index;
    const topicName = topicIndex !== undefined ? getTopicName(topicIndex) : 'Unknown';
    
    // Create warning label
    const label = document.createElement('div');
    label.className = 'mh-warning-label';
    label.style.cssText = `
        background: none;
        color: white;
        padding: 12px 15px;
        margin: 10px 0;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        border-left: 4px solid #c92a2a;
        animation: pulseWarning 2s infinite;
    `;
    
    label.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 1.2em;">⚠️</span>
            <span style="font-size: 1em;">SUICIDE RISK DETECTED</span>
        </div>
        <div style="font-size: 0.9em; opacity: 0.95; margin-left: 24px;">
            📈 Confidence: <strong>${(analysis.confidence * 100).toFixed(1)}%</strong>
        </div>
        <div style="font-size: 0.9em; opacity: 0.95; margin-left: 24px;">
            🎯 ${topicName}
        </div>
    `;
    
    // Add animation
    if (!document.getElementById('mh-warning-animation')) {
        const style = document.createElement('style');
        style.id = 'mh-warning-animation';
        style.textContent = `
            @keyframes pulseWarning {
                0%, 100% { box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3); }
                50% { box-shadow: 0 4px 20px rgba(255, 107, 107, 0.6); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add red border to the tweet
    const article = tweetElement.closest('article');
    if (article) {
        article.style.border = '3px solid #ff6b6b';
        article.style.borderRadius = '12px';
        article.style.background = '#000000ff';
    }
    
    // Insert label after the tweet text
    const tweetTextContainer = tweetElement.querySelector('[data-testid="tweetText"]');
    if (tweetTextContainer && tweetTextContainer.parentElement) {
        tweetTextContainer.parentElement.insertBefore(label, tweetTextContainer.nextSibling);
    }
}

// Function to show scanning summary
function showScanningSummary(totalScanned, suicidalCount) {
    // Remove existing summary
    const existing = document.getElementById('mh-scan-summary');
    if (existing) {
        existing.remove();
    }
    
    if (suicidalCount === 0) {
        return; // Don't show summary if no concerning posts
    }
    
    const summary = document.createElement('div');
    summary.id = 'mh-scan-summary';
    summary.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: #000000ff;
        border: 3px solid #ff6b6b;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 280px;
        animation: slideInRight 0.4s ease-out;
    `;
    
    summary.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #c92a2a; font-size: 1.1em;">
                🛡️ Profile Scan Results
            </h3>
            <button id="mh-close-summary" style="
                background: #000000ff;
                border: none;
                font-size: 1.3em;
                cursor: pointer;
                color: #999;
                padding: 0;
                line-height: 1;
            ">×</button>
        </div>
        <div style="margin: 10px 0;">
            <p style="margin: 8px 0; color: #ffffffff; font-size: 0.95em;">
                📊 Tweets scanned: <strong>${totalScanned}</strong>
            </p>
            <p style="margin: 8px 0; color: #c92a2a; font-size: 1em; font-weight: bold;">
                ⚠️ Concerning posts: <strong>${suicidalCount}</strong>
            </p>
        </div>
        <div style="background: #000000ff; padding: 12px; border-radius: 8px; margin-top: 12px;">
            <p style="margin: 0; font-size: 0.85em; color: #555; line-height: 1.4;">
                Highlighted posts show potential suicide risk. 
                ${suicidalCount > 0 ? 'Please consider reaching out for support.' : ''}
            </p>
        </div>
    `;
    
    // Add animation
    if (!document.getElementById('mh-slide-animation')) {
        const style = document.createElement('style');
        style.id = 'mh-slide-animation';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(summary);
    
    // Close button
    document.getElementById('mh-close-summary').addEventListener('click', () => {
        summary.remove();
    });
}

// USED FOR LOOPS  Individual Tweet Processing
async function scanTweet(tweetElement) {
    // Get tweet ID to avoid duplicate scans
    const article = tweetElement.closest('article');
    if (!article) return;
    

    //GET THE BOX ITSELF
    const tweetTextElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (!tweetTextElement) return;
    


    const tweetText = tweetTextElement.textContent.trim();
    if (!tweetText) return;
    


    // Use tweet text + timestamp as unique ID (more reliable than data attributes)
    const timeElement = article.querySelector('time');
    const timestamp = timeElement ? timeElement.getAttribute('datetime') : '';
    const tweetId = `${tweetText.substring(0, 100)}_${timestamp}`;
    
    if (scannedTweets.has(tweetId)) {
        return; // Already scanned
    }
    
    console.log('🔍 [Scanner] Scanning tweet:', tweetText.substring(0, 50) + '...');
    
    // Mark as scanned
    scannedTweets.add(tweetId);
    
    // Analyze the tweet
    const analysis = await analyzeTweetForScanner(tweetText);
    
    if (analysis && analysis.prediction === 'suicide') {
        console.log('⚠️ [Scanner] Found concerning post:', tweetText.substring(0, 50));
        addWarningLabel(tweetElement, analysis);
        return true; // Return true if suicidal
    }
    
    return false;
}

// Function to scan all tweets on the page
async function scanAllTweets() {
    if (isScanning) {
        console.log('⏳ [Scanner] Already scanning...');
        return;
    }
    
    // Check if we're on a profile page
    const isProfilePage = window.location.pathname.match(/^\/[^\/]+\/?$/);
    if (!isProfilePage) {
        console.log('ℹ️ [Scanner] Not on a profile page, skipping scan');
        return;
    }
    
    isScanning = true;
    console.log('🔍 [Scanner] Starting profile scan...');
    
    // Find all tweets on the page
    const tweets = document.querySelectorAll('[data-testid="tweet"]'); // array
    console.log(`📊 [Scanner] Found ${tweets.length} tweets to scan`);
    
    let suicidalCount = 0;
    let scannedCount = 0;
    
    // Scan each tweet
    for (const tweet of tweets) { //loop the array
        const isSuicidal = await scanTweet(tweet);
        if (isSuicidal) {
            suicidalCount++;
        }
        scannedCount++;
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`✅ [Scanner] Scan complete! Scanned: ${scannedCount}, Concerning: ${suicidalCount}`);
    
    // Show summary
    showScanningSummary(scannedCount, suicidalCount);
    
    isScanning = false;
}


// REACT COMPONENT SPA's
// Function to observe new tweets being loaded (for infinite scroll)
function observeNewTweets() {
    const observer = new MutationObserver((mutations) => {
        // Check if we're on a profile page
        const isProfilePage = window.location.pathname.match(/^\/[^\/]+\/?$/);
        if (!isProfilePage) return;
        
        // Look for new tweets
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    const newTweets = node.querySelectorAll ? node.querySelectorAll('[data-testid="tweet"]') : [];
                    
                    // Scan new tweets
                    for (const tweet of newTweets) {
                        scanTweet(tweet);
                    }
                }
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize scanner
function initializeProfileScanner() {
    console.log('🛡️ [Scanner] Initializing Profile Scanner...');
    

    // 2 second pause since API wait
    // Scan tweets when page loads
    setTimeout(() => {
        scanAllTweets();
        observeNewTweets();
    }, 2000); // Wait 2 seconds for page to load
    
    // Re-scan when navigating to profile
    let lastProfileUrl = '';
    setInterval(() => {
        const currentUrl = window.location.href;
        const isProfilePage = window.location.pathname.match(/^\/[^\/]+\/?$/);
        
        if (isProfilePage && currentUrl !== lastProfileUrl) {
            lastProfileUrl = currentUrl;
            console.log('🔄 [Scanner] Profile page detected, starting scan...');
            scannedTweets.clear(); // Clear cache for new profile
            setTimeout(() => scanAllTweets(), 2000);
        }
    }, 1000);
    
    console.log('✅ [Scanner] Profile scanner initialized');
}

// Auto-initialize
initializeProfileScanner();

})(); // End of IIFE
