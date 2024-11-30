const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your HTML, JS, etc.)
app.use(express.static('public'));

// Handle tweet submission
app.post('/submitTweet', (req, res) => {
    const tweetText = req.body.tweetText;
    console.log(tweetText); // This logs the tweet input to the VS Code terminal

    res.status(200).send('Tweet received');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});