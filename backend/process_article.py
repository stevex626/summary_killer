import sys
from newspaper import Article

def extract_content(url):
    article = Article(url)
    article.download()
    article.parse()
    return article.text

if __name__ == "__main__":
    url = sys.argv[1]
    print(extract_content(url))
