import sys
import nltk
import re
from newspaper import Article
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
import tiktoken
 

def trim_content(content, max_tokens=1250, model="gpt-3.5-turbo-0301"):
    encoding = tiktoken.encoding_for_model(model)
    num_tokens = len(encoding.encode(content))
    
    while num_tokens > max_tokens:
        cut_length = int(0.2 * len(content))
        content = content[:-cut_length]  # Trim from the end
        num_tokens = len(encoding.encode(content))
    
    return content


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

    # Adjust sentence scores based on position
    total_sentences = len(sentences)
    for i, sentence in enumerate(sentences):
        positional_multiplier = 1 + 0.5 * (1 - abs(i - total_sentences/2) / (total_sentences/2))
        sentenceValue[sentence] *= positional_multiplier

    # Recompute the average after adjusting scores
    sumValues = 0
    for sentence in sentenceValue:
        sumValues += sentenceValue[sentence]
    average = int(sumValues / len(sentenceValue))
    
    # Store sentences into the summary
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
    final_content = trim_content(summarized_content)

    return final_content

if __name__ == "__main__":
    url = sys.argv[1]
    print(extract_content(url))
