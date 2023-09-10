const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const openai = require('openai');
require('dotenv').config();

const app = express();

// Load environment variables
openai.api_key = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

const truncateAtSentence = (text, charLimit) => {
    const truncatedText = text.slice(0, charLimit);
    const lastPeriod = truncatedText.lastIndexOf('.');
    const lastExclamation = truncatedText.lastIndexOf('!');
    const lastQuestion = truncatedText.lastIndexOf('?');

    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

    if (lastSentenceEnd === -1) return truncatedText;

    return truncatedText.slice(0, lastSentenceEnd + 1);
}

app.get('/', (req, res) => {
    // You can send your HTML file here
    res.sendFile('path_to_your/webscrape.html');
});

app.post('/summarize', async (req, res) => {
    const url = req.body.url;

    if (!url) return res.status(400).json({ error: "URL is missing" });

    const headers = {
        "User-Agent": "Mozilla/5.0 ...",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/"
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const paragraphs = $('p').toArray().map(p => $(p).text()).join(' ');

        const truncatedText = truncateAtSentence(paragraphs, 4096);

        if (!truncatedText) return res.status(400).json({ error: "Failed to extract meaningful content" });

        const openaiResponse = await openai.Completion.create({
            engine: "text-davinci-003",
            prompt: `Please summarize the following content:\n${truncatedText}`,
            max_tokens: 200
        });

        const summary = openaiResponse.choices[0].text.trim();

        res.json({ summary });

    } catch (error) {
        res.status(500).json({ error: `Failed due to: ${error.message}` });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
