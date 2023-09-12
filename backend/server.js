require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { exec } = require("child_process");

const app = express();

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

app.post('/summarize', async (req, res) => {
    const url = req.body.url;

    if (!url) return res.status(400).json({ error: "URL is missing" });

    // Preprocessing article text
    exec(`python process_article.py "${url}"`, { maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: "Failed to fetch article content" });
        }

        const articleContent = stdout;
            // Further summarize using OpenAI
            try {
                console.log(articleContent)
                res.json({ summary: articleContent });
            } catch (summaryError) {
                if (summaryError instanceof OpenAI.APIError) {
                    res.status(summaryError.status).json({ error: `OpenAI error: ${summaryError.name}` });
                } else {
                    res.status(500).json({ error: `Failed to summarize due to: ${summaryError.message}` });
                }
            }
        });
    });



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});