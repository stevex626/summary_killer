import sys
import nltk
import re
from newspaper import Article
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

def nltk_summary(text):
    nltk.download('stopwords')
    nltk.download('punkt')
    
    # Tokenization
    stopWords = set(stopwords.words("english"))
    words = word_tokenize(text)

    # Create a frequency table for words
    freqTable = dict()
    for word in words:
        word = word.lower()
        if word in stopWords:
            continue
        if word in freqTable:
            freqTable[word] += 1
        else:
            freqTable[word] = 1

    # Score sentences based on frequency
    sentences = sent_tokenize(text)
    sentenceValue = dict()

    for sentence in sentences:
        for word, freq in freqTable.items():
            if word in sentence.lower():
                if sentence in sentenceValue:
                    sentenceValue[sentence] += freq
                else:
                    sentenceValue[sentence] = freq

    #Average score value
    sumValues = 0
    for sentence in sentenceValue:
        sumValues += sentenceValue[sentence]

    # Store sentences into the summary
    average = int(sumValues / len(sentenceValue))
    summary = ''

    for sentence in sentences:
        if (sentence in sentenceValue) and (sentenceValue[sentence] > (1.2 * average)):
            summary += " " + sentence     
    return summary

def extract_content(url):
    article = Article(url)
    article.download()
    article.parse()

    cleaned_text = re.sub(r'[^A-Za-z0-9.,?! ]+', ' ', article.text)
    summarized_content = nltk_summary(cleaned_text)
    
    return summarized_content

if __name__ == "__main__":
    url = sys.argv[1]
    print(extract_content(url))
