import sys
import re
import tiktoken
from bs4 import BeautifulSoup
import requests

def trim_content(content, max_tokens=4096, model="gpt-3.5-turbo-0301"):
    encoding = tiktoken.encoding_for_model(model)
    num_tokens = len(encoding.encode(content))
    
    while num_tokens > max_tokens:
        cut_length = int(0.2 * len(content))
        content = content[:-cut_length]  # Trim from the end
        num_tokens = len(encoding.encode(content))
    
    return content



def extract_content(url):    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.3",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/",
    }

    r = requests.get(url, headers=headers)
    r.raise_for_status()

    # Using BeautifulSoup to parse HTML and extract text
    soup = BeautifulSoup(r.text, 'lxml')
    paragraphs = soup.find_all('p')
    text = " ".join(paragraph.text for paragraph in paragraphs)

    cleaned_text = re.sub(r'[^A-Za-z0-9.,?! ]+', ' ', text)
    final_text = trim_content(cleaned_text)

    return final_text

if __name__ == "__main__":
    url = sys.argv[1]
    print(extract_content(url))
