#!/usr/bin/env node
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const readline = require('readline');

const argv = yargs(hideBin(process.argv)).option('model', {
    alias: 'm',
    type: 'string',
    description: 'The Gemini model to use',
    default: 'gemini-1.5-flash-latest'
}).option('apiKey', {
    alias: 'k',
    type: 'string',
    description: 'Your Gemini API key'
}).argv;

const apiKey = argv.apiKey || process.env.GEMINI_API_KEY;
if (!apiKey) {
  // Writing to stderr to avoid polluting stdout for the MCP host
  console.error('Missing GEMINI_API_KEY environment variable or --apiKey flag.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: argv.model,
  tools: [{ googleSearchRetrieval: {} }],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result) {
    const response = {
        jsonrpc: '2.0',
        id,
        result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
    const response = {
        jsonrpc: '2.0',
        id,
        error: { code, message }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  let request;
  try {
    request = JSON.parse(line);
    const { method, params, id } = request;

    if (method === 'initialize') {
        sendResponse(id, {
            name: "Google-AI-Search-MCP",
            tools: [{
                name: "search",
                description: "Get answers from Google Search using the Gemini API."
            }]
        });
    } else if (method === 'search') {
        const query = params.q;
        if (!query) {
            sendError(id, -32602, 'Missing q parameter.');
            return;
        }

        try {
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: query }] }],
            });

            const candidate = result.response.candidates?.[0];
            const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
            const metadata = candidate?.groundingMetadata;

            sendResponse(id, { answer: text, metadata });
        } catch (err) {
            sendError(id, -32000, err.message);
        }
    } else {
        sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    const id = request ? request.id : null;
    // Writing to stderr to avoid polluting stdout for the MCP host
    console.error(`Parse error: ${err.message}`);
    sendError(id, -32700, 'Parse error');
  }
});

