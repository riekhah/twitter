from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import re
import preprocess_kgptalkie as ps
import pickle
import os
import emoji
from deep_translator import GoogleTranslator
import nltk
from nltk.corpus import stopwords



# Initialize Flask app
app = Flask(__name__)

# Function to translate text to English
def translate_to_english(text):
    """
    Translates text to English using deep-translator (auto-detect source language).
    
    Args:
        text (str): The input text.
    
    Returns:
        str: The translated text in English, or the original text if translation fails.
    """
    try:
        # GoogleTranslator with auto-detect
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        
        if translated and translated != text:
            print(f"Translated '{text}' to '{translated}'")
            return translated
        
        print(f"No translation needed for: '{text}'")
        return text
    except Exception as e:
        print(f"Translation error: {e}. Using original text.")
        return text








# ----------------------------
# TEXT CLEANING WITH EMOJI SUPPORT
# ----------------------------
def get_clean(x):
    """Clean tweet text and convert emojis to readable tokens (e.g., 😢 → crying_face)."""
    if pd.isna(x) or str(x).strip() == "":
        return ""
    x = str(x).lower().replace('\\', '').replace('_', ' ')
    x = ps.remove_emails(x)
    x = ps.remove_urls(x)
    x = ps.remove_html_tags(x)
    x = ps.remove_rt(x)
    x = ps.remove_accented_chars(x)

    # Convert emojis to text: 😢 → :crying_face: → crying_face
    x = emoji.demojize(x, language='en')
    x = x.replace(':', ' ')  # Remove colons

    # Keep only letters, digits, spaces (emojis are now words like 'crying_face')
    x = re.sub(r'[^a-z0-9\s]', ' ', x)
    x = re.sub(r'\s+', ' ', x).strip()
    x = re.sub(r"(.)\1{2,}", r"\1", x)  # Reduce repeated chars (e.g., 'sooo' → 'so')
    return x



def get_clean_topic_modeling_v2(x):
    """
    Clean tweet text for topic modeling, keeping emoji tokens with colons and removing custom stopwords.
    Args:
        x (str): The input text.
    Returns:
        str: The cleaned text.
    """

    


    # Download stopwords if not already downloaded
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords')

    # Define custom stopwords
    custom_stopwords = set(stopwords.words('english') + ['dont', 'wanna', 'im', 'ive', 'gonna', 'idk', 'like', 'just', 'really'])

    if pd.isna(x) or str(x).strip() == "":
        return ""
    x = str(x).lower()
    x = ps.remove_urls(x)
    x = ps.remove_html_tags(x)
    x = ps.remove_accented_chars(x)

    # Convert emojis to text, keeping colons
    x = emoji.demojize(x, language='en')

    # Remove punctuation, but keep colons for emoji tokens
    # This regex keeps letters, numbers, whitespace, and colons
    x = re.sub(r'[^\w\s:]', ' ', x)


    x = re.sub(r'\s+', ' ', x).strip()

    # Remove custom stopwords
    x = ' '.join([word for word in x.split() if word not in custom_stopwords])

    return x


# Load pre-trained models
def load_models():
    """Load pre-trained models from .pkl files."""
    print("Loading pre-trained models...")
    
    # Define the path to the trained_model directory
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'trained_model')
    
    try:
        # Load LinearSVC model
        with open(os.path.join(model_dir, 'linear_svc_model.pkl'), 'rb') as f:
            model = pickle.load(f)
        print("✅ LinearSVC model loaded successfully.")
        
        # Load TF-IDF vectorizer (for LinearSVC)
        with open(os.path.join(model_dir, 'tfidf_vectorizer_original.pkl'), 'rb') as f:
            vectorizer = pickle.load(f)
        print("✅ TF-IDF vectorizer loaded successfully.")

        # Load NMF model
        with open(os.path.join(model_dir, 'nmf_suicidal_model.pkl'), 'rb') as f:
            nmf_model = pickle.load(f)
        print("✅ NMF suicidal model loaded successfully.")

        # Load TF-IDF vectorizer for NMF (combined)
        with open(os.path.join(model_dir, 'tfidf_vectorizer_combined.pkl'), 'rb') as f:
            tfidf_combined = pickle.load(f)
        print("✅ TF-IDF combined vectorizer loaded successfully.")
        
        # Get feature names for NMF interpretation
        feature_names_combined = tfidf_combined.get_feature_names_out()
        
        return model, vectorizer, nmf_model, tfidf_combined, feature_names_combined
    except FileNotFoundError as e:
        print(f"❌ Error: Model files not found in '{model_dir}'")
        print(f"Details: {e}")
        raise
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        raise

# Initialize all models and vectorizers
model, vectorizer, nmf_model, tfidf_combined, feature_names_combined = load_models()


def get_support_message_for_topic(topic_index):
    """
    Returns a customized support message based on the NMF topic.
    
    Topic interpretations:
    #0: Help-seeking & social connection - Protective factor
    #1: Active suicidal desire + fear - Classic indicators of intent
    #2: Emotional pain + family conflict - Interpersonal distress
    #3: Depressive affect & isolation - Core symptom of major depression
    #4: Hopelessness & burdensomeness - Key predictors
    #5: Anger, frustration, dysregulation - Acute crisis states
    """
    topic_messages = {
        0: {
            "title": "We hear you reaching out",
            "message": "It takes courage to express what you're feeling. Talking to someone you trust can help. You don't have to face this alone.",
            "emphasis": "Reaching out is a sign of strength, not weakness."
        },
        1: {
            "title": "You deserve immediate support",
            "message": "These feelings are overwhelming, but they can pass with help. Please reach out to a crisis counselor who understands what you're going through.",
            "emphasis": "Your life matters. Help is available right now."
        },
        2: {
            "title": "Pain can feel unbearable",
            "message": "Relationship struggles and emotional pain are real and valid. A trained counselor can help you work through these feelings and find healthier ways to cope.",
            "emphasis": "Healing is possible, even when it doesn't feel like it."
        },
        3: {
            "title": "You're not alone in feeling this way",
            "message": "Loneliness and sadness can feel endless, but they're not permanent. Depression is treatable, and connecting with others can help lift the weight.",
            "emphasis": "Many people have felt this way and found their way forward."
        },
        4: {
            "title": "Your life has value",
            "message": "When everything feels pointless, it's hard to see a way forward. But feelings of hopelessness can change with proper support and treatment.",
            "emphasis": "You matter more than you know, even when you can't see it."
        },
        5: {
            "title": "These intense emotions are valid",
            "message": "Anger and frustration can be overwhelming in a crisis. Talking to someone can help you process these feelings safely without acting on them.",
            "emphasis": "It's okay to be angry. Let's find a safe way to express it."
        }
    }
    
    # Default message if topic not found
    default_message = {
        "title": "Help is available",
        "message": "We're concerned about what you're going through. Please speak with a mental health professional who can provide support.",
        "emphasis": "You don't have to go through this alone."
    }
    
    return topic_messages.get(topic_index, default_message)


def predict_tweet_intention_with_confidence(tweet, model, vectorizer, nmf_suicidal_model=None, 
                                           tfidf_combined=None, feature_names_combined=None, 
                                           n_top_words=5, threshold=0.3):
    """
    Predicts the intention of a given tweet and provides a confidence score.
    If classified as suicidal based on the confidence threshold, it also interprets
    the most relevant suicidal topic using the NMF model (if provided).

    Args:
        tweet (str): The tweet text to predict on.
        model: The trained LinearSVC model (trained on original TF-IDF).
        vectorizer: The fitted TfidfVectorizer (fitted on original data).
        nmf_suicidal_model: The trained NMF model for suicidal tweets (optional, for interpretation).
        tfidf_combined: The combined TF-IDF vectorizer for NMF.
        feature_names_combined (list): List of feature names (words) from the combined TF-IDF (optional, for interpretation).
        n_top_words (int): Number of top words to display for the dominant topic in interpretation.
        threshold (float): The probability threshold for classifying as 'suicide'.

    Returns:
        tuple: A tuple containing the predicted intention ('suicide' or 'not suicide'),
               the confidence score (probability of 'suicide'), and a dictionary
               with dominant topic information if classified as 'suicide', otherwise None.
    """
    try:
        english_tweet = translate_to_english(tweet)
    except Exception as e:
        print(f"Translation failed: {e}. Using original text.")
        english_tweet = tweet

    # Use the original preprocessing function for the primary classifier
    cleaned_tweet_original = get_clean(english_tweet)

    if not cleaned_tweet_original:
        return "not suicide", 0.0, None

    tweet_vector_original = vectorizer.transform([cleaned_tweet_original])
    proba = model.predict_proba(tweet_vector_original)[0]

    classes = model.classes_
    # Handle both label formats: [0,1] or ['not suicide', 'suicide']
    # Determine the index of the 'suicide' class
    suicide_class_index = None
    for i, class_label in enumerate(classes):
        if class_label == 1 or str(class_label).lower() == 'suicide':
            suicide_class_index = i
            break

    if suicide_class_index is None:
        suicide_class_index = 1 if len(classes) > 1 else 0

    confidence = proba[suicide_class_index]
    prediction = 'suicide' if confidence >= threshold else 'not suicide'

    interpretation = None
    # Only perform topic interpretation if the tweet is classified as suicidal and NMF models are provided
    if prediction == 'suicide' and nmf_suicidal_model is not None and feature_names_combined is not None and tfidf_combined is not None:
        # Use the topic modeling preprocessing function for NMF interpretation
        cleaned_tweet_topic_modeling = get_clean_topic_modeling_v2(english_tweet)

        if cleaned_tweet_topic_modeling:
            # Transform the cleaned tweet using the combined TF-IDF vectorizer for NMF
            tweet_tfidf_vector_combined = tfidf_combined.transform([cleaned_tweet_topic_modeling])

            # Transform the cleaned tweet using the suicidal NMF model
            tweet_topic_vector = nmf_suicidal_model.transform(tweet_tfidf_vector_combined)

            # Find the dominant topic
            dominant_topic_idx = tweet_topic_vector[0].argmax()
            dominant_topic_probability = tweet_topic_vector[0][dominant_topic_idx]

            # Get the top words for the dominant topic from the suicidal NMF model
            topic_words_indices = nmf_suicidal_model.components_[dominant_topic_idx].argsort()[-n_top_words:][::-1]
            top_words = [feature_names_combined[i] for i in topic_words_indices]

            interpretation = {
                'dominant_topic_index': int(dominant_topic_idx),
                'dominant_topic_probability': float(dominant_topic_probability),
                'top_words': top_words.tolist() if hasattr(top_words, 'tolist') else list(top_words)
            }

    return prediction, confidence, interpretation


@app.route('/')
def index():
    """Render the frontend."""
    return render_template('index.html')

@app.route('/submitTweet', methods=['POST'])
def submit_tweet():
    """Handle tweet submission and prediction."""
    threshold = 0.4
    n_top_words = 15
    
    try:
        # Retrieve tweet from request
        data = request.get_json()
        tweet_text = data.get('tweetText', '')

        if not tweet_text:
            return jsonify({"error": "Tweet text is empty"}), 400

        print(f"\n{'='*60}")
        print(f"New Tweet Received: {tweet_text}")
        print(f"{'='*60}")

        # Use the prediction function with confidence and interpretation
        prediction, confidence, interpretation = predict_tweet_intention_with_confidence(
            tweet_text, 
            model, 
            vectorizer, 
            nmf_model, 
            tfidf_combined, 
            feature_names_combined,
            n_top_words=n_top_words,
            threshold=threshold
        )

        # Print results to console
        print(f"Classification: {prediction}")
        print(f"Confidence: {confidence:.3f} (threshold={threshold})")
        
        if interpretation:
            print(f"Dominant Suicidal Topic: Topic #{interpretation['dominant_topic_index']} "
                  f"(Probability: {interpretation['dominant_topic_probability']:.3f})")
            print(f"Top words for this topic: {', '.join(interpretation['top_words'])}")
        else:
            print("No suicidal topic interpretation available.")
        
        print(f"{'='*60}\n")

        # Prepare response
        response_data = {
            "message": "Tweet received",
            "tweet": tweet_text,
            "prediction": prediction,
            "confidence": float(round(confidence, 3)),
            "threshold": threshold
        }
        
        # Add interpretation and custom support message if available
        if interpretation:
            response_data["interpretation"] = interpretation
            
            # Get custom support message based on topic
            topic_idx = interpretation['dominant_topic_index']
            response_data["support_message"] = get_support_message_for_topic(topic_idx)

        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)
