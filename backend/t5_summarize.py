import sys
from transformers import T5Tokenizer, T5ForConditionalGeneration

model = T5ForConditionalGeneration.from_pretrained('t5-large')
tokenizer = T5Tokenizer.from_pretrained('t5-large')

def summarize_content(content):
    input_text = "summarize: " + content
    input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512)
    summary_ids = model.generate(input_ids, max_length=300, min_length=100, length_penalty=3., num_beams=3)
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)

if __name__ == '__main__':
    content = sys.argv[1]
    summarized = summarize_content(content)
    print(summarized)
