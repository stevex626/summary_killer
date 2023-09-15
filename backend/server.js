require('dotenv').config();
const express = require('express');
const cors = require('cors');
const openAI = require('openai');
const { exec } = require("child_process");
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();

const app = express();
const openai = new openAI();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('path_to_your/webscrape.html');
});

app.post('/verifyToken', async (req, res) => {
    console.log(req.body.idToken);
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.idToken,
            requiredAudience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        console.log("Verified user: " + email);
        console.log("Verified user: " + userid);

        res.json({message: 'Successfully authenticated'});
    } catch (error) {
        console.error("Detailed Error:", error);
        res.status(401).json({error: 'Authentication failed'});
    }
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

        const articleContent = stdout.toString('utf-8').trim();
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: `Please summarize the following content, and be as accurate and comprehensive as possible, and make sure to have a logical flow in your response
                    . If it is a different language, translate the context and return the summary in English. Here is the content to be summarized: ${articleContent}` }],
                    model: 'gpt-3.5-turbo-0301',
                    max_tokens: 250,
                  });
                const summary = completion.choices[0].message.content;
                res.json({ summary: summary });
            } catch (summaryError) {
                if (summaryError instanceof openAI.APIError) {
                    res.status(summaryError.status).json({ error: `OpenAI error: ${summaryError.name}, ${summaryError.message}` });
                } else {
                    res.status(500).json({ error: `Failed to summarize due to: ${summaryError.message}` });
                }
        }});
    });



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});