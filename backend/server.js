require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const openAI = require('openai');
const { exec } = require("child_process");

const app = express();
const openai = new openAI();

app.use(cors());
app.use(express.json());

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
            // Further cleans up the summarization using OpenAI
            // try {
            //     const completion = await openai.chat.completions.create({
            //         messages: [{ role: 'user', content: `Please correct any grammar and punctuation errors, enhance its readability, and try to maintain the existing information as closely as possible for the following content: ${articleContent}` }],
            //         model: 'gpt-3.5-turbo-0301',
            //         max_tokens: 750,
            //       });
            //     const summary = completion.choices[0].message.content;
            try{
                summary = articleContent
                console.log(summary);
                res.json({ summary: summary });
            } catch (summaryError) {
                if (summaryError instanceof openAI.APIError) {
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