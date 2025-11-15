# Mental Health Guardian - Chrome Extension

## 🛡️ Setup Instructions

### Step 1: Update Flask App for CORS

Add this to the top of your `app.py`:

```python
from flask_cors import CORS

# After app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
```

Install flask-cors:
```bash
pip install flask-cors
```

### Step 2: Start Your Flask Server

```bash
cd "c:\Users\Jaspher\Documents\JASPHERS NOTEBOOK\APPLIEDE TEXT"
.\env\Scripts\Activate.ps1
cd twitter
python app.py
```

Make sure it's running on `http://localhost:5000`

### Step 3: Create Icon Files

You need to create three PNG icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick way:** Use an online tool like:
- https://www.favicon-generator.org/
- Upload any image with a shield emoji 🛡️

Or use the provided SVG and convert it to PNG.

### Step 4: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the folder: `c:\Users\Jaspher\Documents\JASPHERS NOTEBOOK\APPLIEDE TEXT\chrome-extension`
5. The extension should now appear in your extensions list!

### Step 5: Test It!

1. Go to https://twitter.com or https://x.com
2. Log in to your account
3. Try to compose a tweet with concerning content like:
   - "I want to end it all"
   - "patayin ko na sarili ko"
   - "Life is pointless, I'm so tired"
4. Click the **Post** button
5. The extension will intercept and show an intervention alert!

## 🧪 Features

- ✅ Intercepts tweet posts in real-time
- ✅ Analyzes content using your ML model
- ✅ Shows topic-specific intervention messages
- ✅ Provides crisis hotline information
- ✅ User can choose to continue or cancel post
- ✅ Works on both twitter.com and x.com

## 🔧 Troubleshooting

**Extension not working?**
- Check if Flask server is running
- Open Chrome DevTools (F12) → Console tab
- Look for messages starting with 🛡️

**CORS errors?**
- Make sure you installed flask-cors
- Restart your Flask server

**Post button not intercepted?**
- Twitter/X may have changed their UI
- Check console for errors
- Try refreshing the page

## 📝 Demo Script

1. Show the extension popup (click extension icon)
2. Click "Test Connection" to verify Flask API
3. Open Twitter/X
4. Compose a suicidal tweet
5. Click Post
6. Show the intervention alert with custom message
7. Show different topics trigger different messages

## 🚀 Next Steps

- Deploy Flask app to cloud (Render, Railway, etc.)
- Publish extension to Chrome Web Store
- Add settings for sensitivity adjustment
- Add analytics dashboard
- Support for other social media platforms
