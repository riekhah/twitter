from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import re
import preprocess_kgptalkie as ps
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split

# Initialize Flask app
app = Flask(__name__)

# Function to clean tweets
def get_clean(x):
    """Clean the tweet text."""
    x = str(x).lower().replace('\\', '').replace('_', ' ')
    x = ps.remove_emails(x)
    x = ps.remove_urls(x)
    x = ps.remove_html_tags(x)
    x = ps.remove_rt(x)
    x = ps.remove_accented_chars(x)
    x = ps.remove_special_chars(x)
    x = re.sub(r"(.)\1{2,}", r"\1", x)
    return x

# Train model function
def train_model():
    """Train the suicidal ideation detection model."""
    print("Training model...")
    dataset_url = 'https://raw.githubusercontent.com/laxmimerit/twitter-suicidal-intention-dataset/refs/heads/master/twitter-suicidal_data.csv'
    df = pd.read_csv(dataset_url)

    # Clean the tweets
    df['tweet'] = df['tweet'].apply(lambda x: get_clean(x))

    # Feature extraction and model training
    tfidf = TfidfVectorizer(max_features=20000, ngram_range=(1, 3), analyzer='char')
    X = tfidf.fit_transform(df['tweet'])
    y = df['intention']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

    clf = LinearSVC()
    clf.fit(X_train, y_train)

    print("Model training completed.")
    return clf, tfidf

# Initialize model and vectorizer
model, vectorizer = train_model()

@app.route('/')
def index():
    """Render the frontend."""
    return render_template('index.html')

@app.route('/submitTweet', methods=['POST'])
def submit_tweet():
    """Handle tweet submission and prediction."""
    try:
        # Retrieve tweet from request
        data = request.get_json()
        tweet_text = data.get('tweetText', '')

        if not tweet_text:
            return jsonify({"error": "Tweet text is empty"}), 400

        print(f"New Tweet Received: {tweet_text}")

        # Clean and predict
        clean_tweet = get_clean(tweet_text)
        vectorized_tweet = vectorizer.transform([clean_tweet])
        prediction = model.predict(vectorized_tweet)[0]

        # Convert prediction to a native Python type (int or str)
        prediction = int(prediction)  # Convert numpy.int64 to int

        # Log the prediction result
        print(f"Prediction for the tweet: {prediction} (0=Non-suicidal, 1=Suicidal)")

        # Return prediction
        return jsonify({
            "message": "Tweet received",
            "tweet": tweet_text,
            "prediction": prediction
        }), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)
