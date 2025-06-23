#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).option('model', {
    alias: 'm',
    type: 'string',
    description: 'The Gemini model to use',
    default: 'gemini-1.5-flash-latest'
}).option('apiKey', {
    alias: 'k',
    type: 'string',
    description: 'Your Gemini API key'
}).option('mcp', {
    type: 'boolean',
    description: 'Run in MCP mode',
    default: false
}).argv;

const apiKey = argv.apiKey || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY environment variable or --apiKey flag.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: argv.model,
  tools: [{ googleSearchRetrieval: {} }],
});

const app = express();
const port = process.env.PORT || 3000;

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing q parameter.' });
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
    });

    const candidate = result.response.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
    const metadata = candidate?.groundingMetadata;

    res.json({ answer: text, metadata });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  if (!argv.mcp) {
    console.log(`Server listening on port ${port}`)
  }
});

