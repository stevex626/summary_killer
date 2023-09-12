import sys
from newspaper import Article
import nltk
import re
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

def extract_content(url):
    nltk.download('punkt')
    article = Article(url)
    article.download()
    article.parse()
    cleaned_text = re.sub(r'[^A-Za-z0-9.,?! ]+', ' ', article.text)
    return cleaned_text

def lsa_summarize(content, num_sentences=2):
    parser = PlaintextParser.from_string(content, Tokenizer("english"))
    summarizer_lsa = LsaSummarizer()
    summary = summarizer_lsa(parser.document, num_sentences)
    lsa_summary = " ".join([str(sentence) for sentence in summary])
    return lsa_summary

if __name__ == "__main__":
    url = sys.argv[1]
    content = extract_content(url)
    summarized_content = lsa_summarize(content)
    print(summarized_content)
