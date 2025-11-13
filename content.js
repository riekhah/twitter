// Content script that runs on Twitter/X pages
console.log('🛡️ Mental Health Guardian Extension Loaded');

/* 

PSEUDO FLOW:
1: Initialize global click handler (runs on page load via manifest.json)
2: If Twitter "POST" button is clicked, intercept the request BEFORE it reaches Twitter's servers
3: Analyze tweet text through Flask API
4: If suicidal content detected → show intervention modal
5: User decides → cancel (clear text) or post anyway (allow through)
6: For safe content → post normally without interruption

*/



const API_URL = 'http://localhost:5000/submitTweet';

// Track if we've already attached listeners to avoid duplicates
let listenerAttached = false;  // Flag to prevent multiple listener attachments
let clickHandler = null;        // Reference to the event handler function (allows removal)
let isProcessing = false;       // Prevents multiple simultaneous analyses (race condition guard)

/* 
===============================================================
FUNCTION: analyzeTweet(tweetText)
===============================================================
PURPOSE: Send tweet text to Flask backend for ML analysis

PARAMETERS:
- tweetText (string): The text content from the tweet composition box

API REQUEST:
- Method: POST
- Endpoint: http://localhost:5000/submitTweet
- Body: { "tweetText": "..." }

API RESPONSE STRUCTURE:
{
    "message": "Tweet received",
    "tweet": "original tweet text",
    "prediction": "suicide" | "non-suicide",
    "confidence": 0.853,  // float (0-1)
    "threshold": 0.4,
    "interpretation": {
        "dominant_topic_index": 4,
        "topic_probability": 0.069,
        "top_words": ["life", "end", "tired", "pain", ...]
    },
    "support_message": {
        "title": "Your life has value",
        "message": "...",
        "emphasis": "..."
    }
}

RETURNS: 
- Object: Full analysis data from backend
- null: If API call fails (network error, backend down, etc.)

ERROR HANDLING:
- Catches fetch errors and logs to console
- Returns null on failure (caller must check)
===============================================================
*/
async function analyzeTweet(tweetText) {
    try {
        console.log('📤 Sending tweet for analysis:', tweetText);
        
        // POST request to Flask backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tweetText: tweetText })
        });

        const data = await response.json();
// { SAMPLE OUTPUT data
//     "message": "Tweet received",
//     "tweet": "original tweet text",
//     "prediction": "suicide" | "non-suicide",
//     "confidence": 0.853,  // float (0-1)
//     "threshold": 0.4,
//     "interpretation": {
//         "dominant_topic_index": 4,
//         "topic_probability": 0.069,
//         "top_words": ["life", "end", "tired", "pain", ...]
//     },
//     "support_message": {
//         "title": "Your life has value",
//         "message": "...",
//         "emphasis": "..."
//     }
// }

        console.log('📥 Received analysis:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Error analyzing tweet:', error);
        return null;  // Graceful failure - caller must handle null
    }
}















    /*  HELPER FUNCTION ONLY
    1: create element div that covers 100% of screen (opacity)
    2: another div white with custom text
    2: have 2 buttons (y/n) then stores in let userChoice string variable (YES/NO)
    3: return Promise(userChoice) since this is API... await.
    */
   
// Function to show intervention alert (actually used on interceptTweetPost())
function showInterventionAlert(supportMessage, confidence, topWords) {
    // Remove any existing alerts
    const existingAlert = document.getElementById('mh-guardian-alert');
    if (existingAlert) {
        existingAlert.remove();
    }


    // Create alert overlay
    const overlay = document.createElement('div');
    overlay.id = 'mh-guardian-alert';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    // Create alert box
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    let topWordsHtml = '';
    if (topWords && topWords.length > 0) {
        topWordsHtml = `
            <div style="margin: 15px 0; padding: 10px; background: #f0f8ff; border-radius: 8px;">
                <p style="margin: 0; font-size: 0.85em; color: #555;">
                    <strong>Key themes detected:</strong> ${topWords.slice(0, 5).join(', ')}
                </p>
            </div>
        `;
    }

    alertBox.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🛡️</div>
        <div style="background: #fff3cd; padding: 10px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-weight: bold; font-size: 0.9em;">
                ⚠️ BEFORE YOU POST: We detected concerning content
            </p>
        </div>
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 1.5em;">
            ${supportMessage.title}
        </h2>
        <p style="margin: 15px 0; color: #555; line-height: 1.6; font-size: 1em;">
            ${supportMessage.message}
        </p>
        <p style="margin: 15px 0; color: #1da1f2; font-weight: bold; font-style: italic; font-size: 0.95em;">
            ${supportMessage.emphasis}
        </p>
        ${topWordsHtml}
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
        <div style="margin: 15px 0;">
            <p style="margin: 5px 0; font-size: 0.95em; color: #555;">
                <strong>National Center for Mental Health Crisis Hotline</strong>
            </p>
            <p style="margin: 5px 0; font-size: 0.85em; color: #555;">
                Languages: English, Filipino
            </p>
            <p style="margin: 10px 0; font-size: 1.2em; color: #e74c3c; font-weight: bold;">
                📞 Call: <a href="tel:09663514518" style="color: #e74c3c; text-decoration: none;">0966-351-4518</a>
            </p>
            <p style="margin: 5px 0; font-size: 0.85em; color: #555;">
                Hopeline PH: <a href="tel:09175584673" style="color: #1da1f2; text-decoration: none;">0917 558 4673</a>
            </p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 0.9em; color: #333; font-weight: bold;">
                Are you sure you want to post this?
            </p>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button id="mh-cancel-btn" style="
                padding: 12px 24px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 20px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.95em;
            ">❌ Cancel & Get Help</button>
            <button id="mh-continue-btn" style="
                padding: 12px 24px;
                background: #ffc107;
                color: #000;
                border: none;
                border-radius: 20px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.95em;
            ">⚠️ I understand, post anyway</button>
        </div>
        <p style="margin-top: 15px; font-size: 0.75em; color: #999;">
            Detection confidence: ${(confidence * 100).toFixed(1)}%
        </p>
    `;

    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    // Add button listeners
    let userChoice = null;

    document.getElementById('mh-continue-btn').addEventListener('click', () => {
        userChoice = 'continue';
        overlay.remove();
    });

    document.getElementById('mh-cancel-btn').addEventListener('click', () => {
        userChoice = 'cancel';
        overlay.remove();
        // Clear the tweet text
        clearTweetBox();
    });

    return new Promise((resolve) => {
        const checkChoice = setInterval(() => {
            if (userChoice) {
                clearInterval(checkChoice);
                resolve(userChoice);
            }
        }, 100);
    });
}



function clearTweetBox() {
    const tweetBox = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (tweetBox) {
        tweetBox.textContent = '';
        tweetBox.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

//HELPER FUNCTION
// Function to get tweet text
function getTweetText() { 
    // data-testid="tweetTextarea_0 == YUNG BOX NG "POST" sa twitter home
    const tweetBox = document.querySelector('[data-testid="tweetTextarea_0"]');
    return tweetBox ? tweetBox.textContent.trim() : '';
}


// Function to intercept tweet posting
/* 
1: create handler ... autoamticallr runs when PAGE LOADED
2: fetch the "post" button ng twitter
3: if postButton is true and not processing then GetTweet() function where it fetches the TEXTBOX of twitter only. no magic
4: const analysis = await analyzeTweet(tweetText); returns 

*/

//create handler ... autoamticallr runs when PAGE LOADED
function interceptTweetPost() {
    // Remove existing listener if present
    if (clickHandler) {
        document.removeEventListener('click', clickHandler, true);
        clickHandler = null;
    }
    
    console.log('🔍 Setting up tweet interception...');
    
    // Create the click handler
    clickHandler = async (event) => {
        // Check if the clicked element is the "Post" button
        const postButton = event.target.closest('[data-testid="tweetButtonInline"]') || 
                          event.target.closest('[data-testid="tweetButton"]');
        

        // KAPAG POST BUTTON THEN INTERCEPT

        if (postButton && !isProcessing) { //processing is handler
            const tweetText = getTweetText();
                        //getTweetText() => document.querySelector('[data-testid="tweetTextarea_0"]');

            if (!tweetText) {
                return; // Empty tweet, let it fail naturally
            }

            console.log('🚨 Post button clicked! Tweet text:', tweetText);
            
            // MAGIC: STOP THE REQUEST HERE
            // MAGIC: STOP THE REQUEST HERE

            // MAGIC: STOP THE REQUEST HERE



            // CRITICAL: Stop the event immediately
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            
            isProcessing = true;
            
            // Analyze the tweet
            console.log('📊 Analyzing tweet...');


            const analysis = await analyzeTweet(tweetText); //send the txt tweet to BACKEND then
            /* 
            response_data = {
                "message": "Tweet received",
                "tweet": tweet_text,
                "prediction": prediction, getTweetTextwWithConfidene
                "confidence": float(round(confidence, 3)),
                "threshold": threshold
            }
            */
            
            if (analysis && analysis.prediction === 'suicide') {
                console.log('⚠️ SUICIDAL CONTENT DETECTED!');
                console.log('Analysis:', analysis);
                
                const supportMessage = analysis.support_message || {
                    title: "Help is available",
                    message: "We're concerned about what you're going through.",
                    emphasis: "You don't have to go through this alone."
                };
                
                const topWords = analysis.interpretation?.top_words || [];
                const confidence = analysis.confidence || 0;
                
                // Show intervention alert and wait for user choice
                console.log('🛡️ Showing intervention alert...');
                const choice = await showInterventionAlert(supportMessage, confidence, topWords);
                
                if (choice === 'continue') {
                    console.log('✅ User chose to continue posting - allowing post to proceed');
                    isProcessing = false;
                    
                    // Remove listener, click the button, then re-attach
                    document.removeEventListener('click', clickHandler, true);
                    

                    //TO POST THE ACTUAL TWEET, recall the post button
                    setTimeout(() => {
                        postButton.click();
                        
                        // Re-attach listener after post completes
                        setTimeout(() => {
                            interceptTweetPost();
                        }, 1000);
                    }, 100);
                } else {
                    console.log('❌ User cancelled the post');
                    clearTweetBox();
                    isProcessing = false;
                }
            } else {
                console.log('✅ No concerning content detected, posting normally');
                isProcessing = false;
                
                // Remove listener, click the button, then re-attach
                document.removeEventListener('click', clickHandler, true);
                
                setTimeout(() => {
                    postButton.click();
                    
                    // Re-attach listener after post completes
                    setTimeout(() => {
                        interceptTweetPost();
                    }, 1000);
                }, 100);
            }
            
            return false;
        }
    };
    
    // Add event listener to document with capture phase
    document.addEventListener('click', clickHandler, true);
    
    listenerAttached = true;
    console.log('✅ Tweet interception active');
}







// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptTweetPost);
} else {
    interceptTweetPost();
}
// REACT REQS idk why
// Re-initialize on navigation (Twitter is a SPA) react singlepage
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('🔄 Page navigation detected, reinitializing...');
        listenerAttached = false;
        interceptTweetPost();
    }
}).observe(document, { subtree: true, childList: true });

console.log('✅ Mental Health Guardian is active and monitoring');
