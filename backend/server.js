require('dotenv').config();
const express = require('express');
const cors = require('cors');
const openAI = require('openai');
const { exec } = require("child_process");
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');

const app = express();
const openai = new openAI();

app.use(cors());
app.use(express.json());

const db_link = process.env.DATABASE_LINK;

mongoose.connect(`${db_link}/SummaryKillerDB`, { useNewUrlParser: true});


const Schema = mongoose.Schema;

const userSchema = new Schema({
  userid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

const User = mongoose.model('User', userSchema);

const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.summarykiller.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/www.summarykiller.com/fullchain.pem', 'utf8');


const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);


app.post('/verifyToken', async (req, res) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.idToken,
            requiredAudience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];

        let user = await User.findOne({ userid: userid });

        if (!user) {
            user = new User({
                userid: userid,
                email: email
            });
            await user.save();
        }

        res.json({message: 'Successfully authenticated'});
    } catch (error) {
        res.status(401).json({error: 'Authentication failed'});
    }
});

app.post('/summarize', async (req, res) => {
    const url = req.body.url;

    if (!url) return res.status(400).json({ error: "URL is missing" });

    exec(`python3 process_article.py "${url}"`, async (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: `Failed to fetch article content: ${stderr}` });
        }

        const articleContent = stdout.toString('utf-8').trim();
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: `Please summarize the following content, and be as accurate and comprehensive as possible, and make sure to have a logical flow in your response
                    . If it is a different language, translate the context and return the summary in English. Ignore any ads. Here is the content to be summarized: ${articleContent}` }],
                    model: 'gpt-3.5-turbo-0301',
                    max_tokens: 250,
                  });
                const summary = completion.choices[0].message.content;
                res.json({ summary: summary });
            } catch (summaryError) {
                if (summaryError instanceof openAI.APIError) {
                    let errorMessage = `OpenAI error: ${summaryError.name}, ${summaryError.message}`;
                    if (summaryError.message.includes("Content length")) { 
                        errorMessage = "Content is too long to summarize";
                    }
                    res.status(summaryError.status).json({ error: errorMessage });
                }
        }});
    });



const PORT = 443;
httpsServer.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});