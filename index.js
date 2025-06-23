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

// Refactored search logic
async function performSearch(query, options = {}) {
    const { language = 'en-US', limit = 10, model: requestedModel } = options;
    
    // Use requested model or fall back to global model
    const searchModel = requestedModel ? 
        genAI.getGenerativeModel({
            model: requestedModel,
            tools: [{ googleSearchRetrieval: {} }],
        }) : model;
    
    const result = await searchModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
    });

    const candidate = result.response.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
    const metadata = candidate?.groundingMetadata;

    // Return full detailed response including all metadata
    return { 
        answer: text, 
        metadata,
        fullResponse: {
            candidates: result.response.candidates,
            usageMetadata: result.response.usageMetadata
        }
    };
}


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
            protocolVersion: "0.1.0",
            capabilities: {
                tools: {}
            },            serverInfo: {
                name: "Google-AI-Search-MCP",
                version: "1.0.21"
            }
        });
    } else if (method === 'tools/list') {        sendResponse(id, {
            tools: [{
                name: "search",
                description: "Search Google for relevant information and answers using Gemini AI",                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query string"
                        },
                        language: {
                            type: "string",
                            description: "The language for search results (e.g., en-US, zh-CN, es-ES, fr-FR, de-DE, ja-JP, ko-KR, pt-BR, it-IT, ru-RU, ar-SA, hi-IN, th-TH, vi-VN, nl-NL, sv-SE, no-NO, da-DK, fi-FI, pl-PL, tr-TR, he-IL, fa-IR, uk-UA, cs-CZ, sk-SK, hu-HU, ro-RO, bg-BG, hr-HR, sl-SI, et-EE, lv-LV, lt-LT, mt-MT, ga-IE, cy-GB, is-IS, mk-MK, sq-AL, sr-RS, bs-BA, me-ME, az-AZ, kk-KZ, ky-KG, uz-UZ, tg-TJ, mn-MN, my-MM, km-KH, lo-LA, si-LK, ne-NP, bn-BD, ta-LK, ml-IN, te-IN, kn-IN, gu-IN, pa-IN, or-IN, as-IN, mr-IN, sa-IN, kok-IN, mni-IN, sd-IN, mai-IN, bho-IN, ks-IN, ur-PK, ps-AF, fa-AF, uz-AF, tk-TM, ky-CN, ug-CN, bo-CN, ii-CN, za-CN, yo-NG, ig-NG, ha-NG, ff-SN, wo-SN, sw-KE, so-SO, am-ET, ti-ET, om-ET, rw-RW, rn-BI, lg-UG, ak-GH, tw-GH, ee-GH, bm-ML, dyo-SN, ses-ML, sg-CF, ln-CD, kg-CD, lua-CD, zu-ZA, xh-ZA, af-ZA, nso-ZA, tn-ZA, st-ZA, ts-ZA, ss-ZA, ve-ZA, nr-ZA). Defaults to 'en-US'.",
                            "default": "en-US"
                        },
                        limit: {
                            type: "integer",
                            description: "Maximum number of search results to process. Affects the comprehensiveness of the response. Range: 1-20, defaults to 10.",
                            minimum: 1,
                            maximum: 20,
                            "default": 10
                        },
                        model: {
                            type: "string",
                            description: "Gemini model to use for search and response generation. Only models with free Google Search grounding are recommended: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash. Defaults to 'gemini-2.5-flash'.",
                            "enum": ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-flash-latest"],
                            "default": "gemini-1.5-flash-latest"
                        }
                    },
                    required: ["query"]
                }
            }]
        });
    } else if (method === 'tools/call') {
        console.error(`Received tool call with params: ${JSON.stringify(params)}`);
        if (params.name === 'search') {
            let query, language, limit, model;
            const toolParams = params.arguments;

            if (toolParams) {
                if (typeof toolParams === 'object' && toolParams !== null) {
                    query = toolParams.query || toolParams.q;
                    language = toolParams.language;
                    limit = toolParams.limit;
                    model = toolParams.model;
                } else if (typeof toolParams === 'string') {
                    try {
                        const parsedParams = JSON.parse(toolParams);
                        if (typeof parsedParams === 'object' && parsedParams !== null) {
                            query = parsedParams.query || parsedParams.q;
                            language = parsedParams.language;
                            limit = parsedParams.limit;
                            model = parsedParams.model;
                        } else {
                           // Treat as a plain string if parsed result is not an object
                           query = toolParams;
                        }
                    } catch (e) {
                        // If JSON.parse fails, it's likely a plain string query
                        query = toolParams;
                    }
                }
            }

            if (query) {
                try {
                    const searchOptions = { language, limit, model };
                    const searchResult = await performSearch(query, searchOptions);
                    // Remove searchEntryPoint from metadata to reduce clutter
                    const cleanMetadata = { ...searchResult.metadata };
                    if (cleanMetadata.searchEntryPoint) {
                        delete cleanMetadata.searchEntryPoint;
                    }
                    
                    // Also clean the fullResponse to remove searchEntryPoint
                    const cleanFullResponse = JSON.parse(JSON.stringify(searchResult.fullResponse));
                    if (cleanFullResponse.candidates) {
                        cleanFullResponse.candidates.forEach(candidate => {
                            if (candidate.groundingMetadata && candidate.groundingMetadata.searchEntryPoint) {
                                delete candidate.groundingMetadata.searchEntryPoint;
                            }
                        });
                    }
                    
                    // Create detailed response with original JSON format
                    const detailedResponse = {
                        content: [
                            {
                                type: "text",
                                text: searchResult.answer
                            },
                            {
                                type: "text",
                                text: JSON.stringify(cleanMetadata, null, 2)
                            },
                            {
                                type: "text", 
                                text: JSON.stringify(cleanFullResponse, null, 2)
                            }
                        ],
                        isError: false
                    };

                    // Also include metadata in response for programmatic access
                    if (searchResult.metadata) {
                        detailedResponse.metadata = cleanMetadata;
                        detailedResponse.fullResponse = cleanFullResponse;
                        detailedResponse.groundingInfo = {
                            webSearchQueries: searchResult.metadata.webSearchQueries || [],
                            groundingChunks: searchResult.metadata.groundingChunks || [],
                            groundingSupports: searchResult.metadata.groundingSupports || []
                        };
                    }

                    sendResponse(id, detailedResponse);
                } catch (error) {
                    console.error(`Search error: ${error.message}`);
                    sendError(id, -32603, `Search failed: ${error.message}`);
                }
            } else {
                sendError(id, -32602, 'Missing query parameter.');
            }
        } else {
            sendError(id, -32600, 'Invalid tool name.');
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

