text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split

# Initialize Flask app
app = Flask(__name__)

# Function to clean tweets
def get_clean(x):