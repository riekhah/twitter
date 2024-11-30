# twitter_suicidal_ideation.py

import pandas as pd
import numpy as np
import re
import preprocess_kgptalkie as ps
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report

# Download the dataset
dataset_url = 'https://raw.githubusercontent.com/laxmimerit/twitter-suicidal-intention-dataset/refs/heads/master/twitter-suicidal_data.csv'
df = pd.read_csv(dataset_url)

# Display first few rows
print(df.head())

# Count values in 'intention' column
print(df['intention'].value_counts())

# Function for cleaning tweets
def get_clean(x):
    x = str(x).lower().replace('\\', '').replace('_', ' ')
    x = ps.remove_emails(x)
    x = ps.remove_urls(x)
    x = ps.remove_html_tags(x)
    x = ps.remove_rt(x)
    x = ps.remove_accented_chars(x)
    x = ps.remove_special_chars(x)
    x = re.sub(r"(.)\1{2,}", r"\1", x)
    return x

# Clean the tweets in the dataset
df['tweet'] = df['tweet'].apply(lambda x: get_clean(x))
print(df.head())

# Training
tfidf = TfidfVectorizer(max_features=20000, ngram_range=(1, 3), analyzer='char')
X = tfidf.fit_transform(df['tweet'])
y = df['intention']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

clf = LinearSVC()
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

# Prediction examples
examples = [
    'I want to eat hotdog. I will cook',
    'I want to die',
    'How to tie a rope',
    'How to tie a rope around my neck',
    'alone',
    'I failed. I want to kill myself',
    'I want to hang myself',
    'How to overdose myself',
    'I am drinking medicine',
    'My life is not worth living'
]

for x in examples:
    x_clean = get_clean(x)
    vec = tfidf.transform([x_clean])
    prediction = clf.predict(vec)
    print(f"Text: {x} => Prediction: {prediction}")
