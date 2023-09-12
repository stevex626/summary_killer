require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const OpenAI = require('openai');
const { exec } = require("child_process");

const app = express();
const openaiInstance = new OpenAI();

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
    res.sendFile('path_to_your/webscrape.html');
});

app.post('/fetch-article', (req, res) => {
    const url = req.body.url;

    if (!url) return res.status(400).json({ error: "URL is missing" });

    exec(`python3 fetch_article.py "${url}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: "Failed to fetch article content" });
        }

        const articleContent = stdout;
        // Now you can further process this content or directly send it as a response
        res.json({ content: articleContent });
    });
});

app.post('/summarize', async (req, res) => {
    const text = req.body.text;

    if (!text) return res.status(400).json({ error: "Content is missing" });

    const truncatedText = truncateAtSentence(text, 4096);

    if (!truncatedText) return res.status(400).json({ error: "Failed to extract meaningful content" });

    try {
        // const openaiResponse = await openaiInstance.completions.create({
        //     model: 'text-davinci-003',
        //     prompt: `Please summarize the following content: ${truncatedText}`,
        //     max_tokens: 200,
        //   });

        //const summary = openaiResponse.choices[0].text;
        const summary = text;
        console.log(summary);
        res.json({ summary });

    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            res.status(error.status).json({ error: `OpenAI error: ${error.name}` });
        } else {
            res.status(500).json({ error: `Failed due to: ${error.message}` });
        }
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
