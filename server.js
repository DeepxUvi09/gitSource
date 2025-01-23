const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(express.json());

const CONFIG = {
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  API_KEY: 'AIzaSyBOne70LWP0NqTyX2QrmtEfXh2BkQMkscU'
};

app.post('/generate-response', async (req, res) => {
  const { message } = req.body;

  if (!message || message.length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const aiResponse = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': CONFIG.API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    const data = await aiResponse.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: 'AI response not available' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
