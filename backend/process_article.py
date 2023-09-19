import sys
import tiktoken
from bs4 import BeautifulSoup
import requests

def trim_content(content, max_tokens=3845, model="gpt-3.5-turbo-0301"):
    encoding = tiktoken.encoding_for_model(model)
    content = content.replace('\n', ' ')
    num_tokens = len(encoding.encode(content))

    while num_tokens > max_tokens:
        cut_length = int(0.05 * len(content))
        content = content[cut_length:-cut_length]
        num_tokens = len(encoding.encode(content))

    return content

def extract_content(url):    
    headers = {
        "User-Agent": "Chrome/89.0.4389.82",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
    }
    

    r = requests.get(url, headers=headers)
    r.raise_for_status()
    
    r.encoding = 'utf-8'

    soup = BeautifulSoup(r.text, 'lxml')

    common_tags = ['p', 'div', 'article']
    common_classes = ['article-paragraph', 'content', 'post-body']

    text = ''

    for tag in common_tags:
        elements = soup.find_all(tag)
        text += " ".join(el.text for el in elements)

    for class_name in common_classes:
        elements = soup.find_all(class_=class_name)
        text += " ".join(el.text for el in elements)

    text = trim_content(text)
    return text

if __name__ == "__main__":
    url = sys.argv[1]
    sys.stdout.buffer.write(extract_content(url).encode('utf-8'))
