# 🧪 Testing the Extension - Step by Step

## ⚠️ IMPORTANT: How It Works Now

The extension will:
1. **INTERCEPT** the Post button click
2. **ANALYZE** the tweet text
3. **SHOW ALERT BEFORE POSTING** if suicidal content detected
4. **WAIT** for your choice:
   - ❌ "Cancel & Get Help" → Post is cancelled, text cleared
   - ⚠️ "I understand, post anyway" → Post goes through

## 🚀 Quick Test Steps

### 1. Make Sure Flask is Running

Open PowerShell and run:
```powershell
cd "c:\Users\Jaspher\Documents\JASPHERS NOTEBOOK\APPLIEDE TEXT"
.\env\Scripts\Activate.ps1
cd twitter
python app.py
```

Confirm you see:
```
✅ LinearSVC model loaded successfully.
✅ NMF suicidal model loaded successfully.
* Running on http://127.0.0.1:5000
```

### 2. Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Mental Health Guardian"
3. Click the **🔄 Reload** button

### 3. Open Browser Console (Important!)

1. Go to https://twitter.com or https://x.com
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for: `🛡️ Mental Health Guardian Extension Loaded`
5. Should also see: `✅ Tweet interception active`

### 4. Test with Suicidal Tweet

#### Test 1: English - Hopelessness (Topic #4)
```
Life is pointless. I'm so tired of everything.
```

**Expected:**
1. Type the tweet
2. Click "Post" button
3. **IMMEDIATELY** see alert popup with:
   - ⚠️ "BEFORE YOU POST: We detected concerning content"
   - Title: "Your life has value"
   - Custom message about hopelessness
   - Key themes detected
   - Crisis hotlines
   - "Are you sure you want to post this?"
   - Two buttons

**In Console, you should see:**
```
🚨 Post button clicked! Tweet text: Life is pointless...
📊 Analyzing tweet...
⚠️ SUICIDAL CONTENT DETECTED!
🛡️ Showing intervention alert...
```

#### Test 2: Filipino - Active Intent (Topic #1)
```
patayin ko na sarili ko
```

**Expected:**
- Alert with: "You deserve immediate support"
- Translated text shown in console

#### Test 3: Depression (Topic #3)
```
Feeling so lonely and sad. Nobody cares about me.
```

**Expected:**
- Alert with: "You're not alone in feeling this way"

#### Test 4: Safe Tweet (No Alert)
```
Having a great day with friends! ☀️
```

**Expected:**
- NO alert
- Posts normally
- Console shows: `✅ No concerning content detected`

### 5. Verify Alert Behavior

When alert appears:

**Option A: Click "❌ Cancel & Get Help"**
- Alert closes
- Tweet text is CLEARED
- Post is CANCELLED
- Console shows: `❌ User cancelled the post`

**Option B: Click "⚠️ I understand, post anyway"**
- Alert closes
- Tweet POSTS to Twitter
- Console shows: `✅ User chose to continue posting`

## 🐛 Troubleshooting

### Problem: No alert appears

**Check Console for errors:**
1. Press F12 → Console tab
2. Look for red error messages
3. Common issues:
   - `Failed to fetch` → Flask server not running
   - `CORS error` → Flask not configured with CORS
   - No "🛡️" messages → Extension not loaded

**Solutions:**
1. Make sure Flask server is running on port 5000
2. Reload extension at `chrome://extensions/`
3. Refresh Twitter page
4. Check if you see the 🛡️ icon in Chrome toolbar

### Problem: Tweet posts anyway (alert doesn't stop it)

**This means event interception failed:**
1. Clear browser cache
2. Reload extension
3. Close and reopen Twitter tab
4. Try incognito mode

### Problem: API connection errors

**Check Flask server:**
```powershell
# Test API manually
Invoke-RestMethod -Uri "http://localhost:5000/submitTweet" -Method POST -Body '{"tweetText":"test"}' -ContentType "application/json"
```

Should return JSON with prediction.

### Problem: Alert shows but buttons don't work

**Refresh the page:**
1. Reload Twitter/X
2. Try again
3. Check console for JavaScript errors

## 📊 What to Look For in Demo

### Console Output (Good Flow):
```
🛡️ Mental Health Guardian Extension Loaded
🔍 Setting up tweet interception...
✅ Tweet interception active
✅ Mental Health Guardian is active and monitoring
🚨 Post button clicked! Tweet text: I want to end it all
📤 Sending tweet for analysis: I want to end it all
📥 Received analysis: {prediction: "suicide", confidence: 0.XX...}
⚠️ SUICIDAL CONTENT DETECTED!
Analysis: {prediction: "suicide", ...}
🛡️ Showing intervention alert...
```

### Alert Should Show:
- ⚠️ Yellow warning banner
- Custom topic-specific message
- Key themes detected (top 5 words)
- Crisis hotline numbers (clickable)
- Clear question: "Are you sure you want to post this?"
- Two distinct buttons:
  - Green "Cancel & Get Help"
  - Yellow "I understand, post anyway"
- Confidence score at bottom

### After Clicking "Cancel":
- Alert disappears
- Tweet box is empty
- Console: `❌ User cancelled the post`
- Post was prevented ✅

### After Clicking "Post Anyway":
- Alert disappears
- Tweet actually posts to Twitter
- Console: `✅ User chose to continue posting`
- Post went through ✅

## 🎬 Demo Script

**Say this while demoing:**

1. "I've composed a tweet with concerning content"
2. "Watch what happens when I click Post..."
3. **[Click Post button]**
4. **[Alert appears immediately]**
5. "The extension intercepted the post BEFORE it went live"
6. "It analyzed the text using our ML model"
7. "It detected suicidal ideation with XX% confidence"
8. "It identified the topic as [topic name]"
9. "And now it's showing a personalized intervention message"
10. "The user has two choices..."
11. **[Show both buttons]**
12. "If they cancel, the post is deleted and they get help resources"
13. **[Click Cancel to show]**
14. "See? Tweet is gone and post was prevented"

## ✅ Success Criteria

The extension is working correctly if:
- ✅ Console shows extension loaded
- ✅ Suicidal tweets trigger alert BEFORE posting
- ✅ Alert shows custom message based on topic
- ✅ Alert shows top keywords detected
- ✅ "Cancel" button clears tweet and stops post
- ✅ "Post anyway" button allows tweet to go through
- ✅ Safe tweets post normally without alert
- ✅ No errors in console

## 🆘 If Nothing Works

1. **Restart everything:**
   ```powershell
   # Stop Flask (Ctrl+C)
   # Restart Flask
   python app.py
   ```

2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on your extension

3. **Clear Twitter cache:**
   - Close all Twitter tabs
   - Clear browser cache
   - Reopen Twitter

4. **Check file is saved:**
   - Make sure latest content.js is saved
   - Check file timestamp

5. **Try different browser:**
   - Edge Chromium also supports extensions
   - Firefox requires different manifest

---

Good luck! The extension should now show the alert **BEFORE** posting! 🛡️
