import sys
from newspaper import Article
import nltk;
import re;

def extract_content(url):
    nltk.download('punkt')
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()
    cleaned_text = re.sub(r'[^A-Za-z0-9.,?! ]+', ' ', article.summary)
    return cleaned_text

if __name__ == "__main__":
    url = sys.argv[1]
    print(extract_content(url))
