# 📂 Chrome Extension File Structure

## Files Overview

### Core Scripts

**content.js** - Tweet Posting Interception
- ✅ Intercepts the "Post" button click on Twitter/X
- ✅ Analyzes tweet text using ML API before posting
- ✅ Shows intervention alert with support resources
- ✅ Allows user to cancel or proceed with posting
- ✅ Clears tweet box if user cancels
- 🎯 **Use this file** for modifying the post interception behavior

**profile-scanner.js** - Profile Page Analyzer
- ✅ Automatically scans all tweets on profile pages
- ✅ Highlights concerning tweets with red borders
- ✅ Shows confidence scores and topic interpretations  
- ✅ Displays summary dashboard with scan results
- ✅ Works with infinite scroll (auto-scans new tweets)
- 🎯 **Use this file** for modifying profile scanning features

### Configuration & UI

**manifest.json** - Extension Configuration
- Defines permissions, content scripts, and background workers
- Both `content.js` and `profile-scanner.js` are loaded on Twitter/X pages

**popup.html / popup.js** - Extension Popup
- UI that appears when clicking the extension icon
- Test connection to Flask API
- Shows extension status

**background.js** - Background Service Worker
- Runs in the background
- Can handle messages between content scripts and popup

### Other Files

**generate-icons.html** - Icon Generator Tool
- Tool to create extension icons
- Open in browser, click "Download All" to generate icons

**icons/** - Extension Icons
- 16x16, 48x48, 128x128 PNG icons
- Used in toolbar, extension manager, etc.

## How They Work Together

1. **User loads Twitter/X** → Chrome loads both `content.js` and `profile-scanner.js`
2. **User types tweet** → `content.js` monitors for Post button clicks
3. **User clicks Post** → `content.js` intercepts, analyzes, shows alert
4. **User visits profile** → `profile-scanner.js` auto-scans all visible tweets
5. **User scrolls down** → `profile-scanner.js` scans newly loaded tweets

### Technical Note: IIFE Wrapper

The `profile-scanner.js` file is wrapped in an **IIFE (Immediately Invoked Function Expression)**:

```javascript
(function() {
    'use strict';
    // All code here...
})();
```

This prevents variable conflicts between the two scripts. Both files use `API_URL` and other variables, but the IIFE creates a separate scope so they don't interfere with each other.

## API Communication

Both scripts communicate with Flask backend at `http://localhost:5000/submitTweet`:

```javascript
POST /submitTweet
Body: { "tweetText": "..." }
Response: { 
  "prediction": "suicide",
  "confidence": 0.85,
  "interpretation": {...},
  "support_message": {...}
}
```

## Console Logging

**content.js** uses emojis:
- 🛡️ Extension loaded
- 🚨 Post button clicked
- 📊 Analyzing tweet
- ⚠️ Suicidal content detected
- ✅ User choice / Status updates

**profile-scanner.js** adds `[Scanner]` prefix:
- 🔍 [Scanner] Scanning tweet
- 📊 [Scanner] Found X tweets
- ⚠️ [Scanner] Found concerning post
- ✅ [Scanner] Scan complete

## Separation Benefits

✅ **Easier to maintain** - Each file has one clear responsibility
✅ **Easier to debug** - Console logs show which script is running
✅ **Easier to modify** - Change one feature without affecting the other
✅ **Easier to test** - Can disable one script by removing from manifest.json
✅ **Cleaner code** - No mixing of interception and scanning logic

## Quick Reference

| Task | File to Edit |
|------|--------------|
| Change alert design | `content.js` → `showInterventionAlert()` |
| Change button labels | `content.js` → `showInterventionAlert()` |
| Modify interception logic | `content.js` → `interceptTweetPost()` |
| Change label design | `profile-scanner.js` → `addWarningLabel()` |
| Modify scanning logic | `profile-scanner.js` → `scanAllTweets()` |
| Add topic names | `profile-scanner.js` → `getTopicName()` |
| Change scan timing | `profile-scanner.js` → `initializeProfileScanner()` |
| Add/remove permissions | `manifest.json` |
| Change API endpoint | Both files → `API_URL` constant |

---

**Last Updated:** November 6, 2025
