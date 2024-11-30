@app.route('/submitTweet', methods=['POST'])
def submit_tweet():
    try:
        data = request.get_json()
        tweet_text = data.get('tweetText', '')
        print(f"New Tweet Received: {tweet_text}")
        return jsonify({"message": "Tweet received", "tweet": tweet_text}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to process tweet"}), 500
