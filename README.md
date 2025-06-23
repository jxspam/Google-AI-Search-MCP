# Google AI Search MCP Server

A Model Context Protocol (MCP) server that provides Google Search capabilities using the Gemini API with Google Search grounding. This allows AI assistants to search Google and get real-time information.

## Features

- 🔍 Google Search integration via Gemini API
- 🤖 Full MCP protocol support
- 🌐 Real-time search results
- 📝 Structured responses
- ⚡ Fast and reliable

## Installation

### Global Installation

```bash
npm install -g @jxspam/google-ai-search-mcp
```

### Usage in MCP Settings

Add this to your MCP settings configuration:

```json
{
  "mcp": {
    "servers": {
      "google-search": {
        "command": "npx",
        "args": [
          "-y",
          "@jxspam/google-ai-search-mcp@latest",
          "--apiKey",
          "YOUR_GEMINI_API_KEY"
        ]
      }
    }
  }
}
```

## API Key Setup

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

You can provide the API key in two ways:

1. **Command line argument** (recommended for MCP):

   ```bash
   npx @jxspam/google-ai-search-mcp --apiKey YOUR_API_KEY
   ```

2. **Environment variable**:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   npx @jxspam/google-ai-search-mcp
   ```

## Gemini Models & Google Search Grounding

This MCP server defaults to **Gemini 1.5 Flash Latest** for optimal performance and grounding access. You can specify different models using the `model` parameter.

### Official Free Tier Google Search Grounding Support

According to [Google's official documentation](https://ai.google.dev/gemini-api/docs/pricing):

| Model                   | Free Tier Grounding with Google Search    |
| ----------------------- | ----------------------------------------- |
| Gemini 2.5 Flash        | ✅ Up to 500 RPD (shared with Flash-Lite) |
| Gemini 2.5 Flash-Lite   | ✅ Up to 500 RPD (shared with Flash)      |
| Gemini 2.0 Flash        | ✅ Up to 500 RPD                          |
| Gemini 1.5 family (all) | ❌ Not available in free tier             |
| Gemini 2.5 Pro          | ❌ Not available in free tier             |
| Gemini 2.0 Flash-Lite   | ❌ No support for grounding               |

**RPD**: Requests Per Day

### Actual Test Results (June 24, 2025)

| Model                         | Test Results   | Notes                              |
| ----------------------------- | -------------- | ---------------------------------- |
| Gemini 1.5 Flash Latest       | ✅ **Working** | Recommended default model          |
| Gemini 2.5 Flash Experimental | ✅ **Working** | Latest experimental model          |
| Gemini 2.0 Flash Experimental | ✅ **Working** | Good performance                   |
| Gemini 2.0 Flash Lite         | ✅ **Working** | Works despite official docs        |
| Gemini 1.5 Pro                | ✅ **Working** | May depend on API key access level |
| Gemini 2.5 Pro                | ✅ **Working** | May depend on API key access level |

**Note**: Test results may vary based on your API key's access level, billing status, or Google's current free tier policies.

### Recommended Models

- **Gemini 1.5 Flash Latest** (default) - Most reliable and well-tested
- **Gemini 2.5 Flash Experimental** - Latest features with grounding
- **Gemini 2.0 Flash Experimental** - Good balance of performance
- **Gemini 1.5 Flash** - Stable alternative
- **Gemini 1.5 Pro Latest** - Higher quality responses

## Search Parameters

The search tool supports the following parameters:

- **`query`** (required): The search query string
- **`language`** (optional): Language code for results (default: "en-US")
- **`limit`** (optional): Max results to process, 1-20 (default: 10)
- **`model`** (optional): Gemini model to use (default: "gemini-1.5-flash-latest")

Example with parameters:

```json
{
  "query": "latest AI developments",
  "language": "en-US",
  "limit": 15,
  "model": "gemini-1.5-flash-latest"
}
```

## Usage

Once configured, you can use the search tool through your MCP-compatible client:

```
search for "latest AI news"
search for "weather today in New York"
search for "stock market updates"
```

## MCP Protocol Support

This server implements the full MCP protocol with:

- `initialize` - Protocol initialization
- `tools/list` - List available tools
- `tools/call` - Execute search queries

### Tool Schema

```json
{
  "name": "search",
  "description": "Search Google for relevant information and answers using Gemini AI",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query string"
      },
      "language": {
        "type": "string",
        "description": "Language for search results (e.g., en-US, zh-CN, es-ES, fr-FR, de-DE, ja-JP, ko-KR, pt-BR, it-IT, ru-RU, ar-SA, hi-IN, th-TH, vi-VN, nl-NL, sv-SE, no-NO, da-DK, fi-FI, pl-PL, tr-TR, he-IL, fa-IR, uk-UA, cs-CZ, sk-SK, hu-HU, ro-RO, bg-BG, hr-HR, sl-SI, et-EE, lv-LV, lt-LT, mt-MT, ga-IE, cy-GB, is-IS, mk-MK, sq-AL, sr-RS, bs-BA, me-ME, az-AZ, kk-KZ, ky-KG, uz-UZ, tg-TJ, mn-MN, my-MM, km-KH, lo-LA, si-LK, ne-NP, bn-BD, ta-LK, ml-IN, te-IN, kn-IN, gu-IN, pa-IN, or-IN, as-IN, mr-IN, sa-IN, kok-IN, mni-IN, sd-IN, mai-IN, bho-IN, ks-IN, ur-PK, ps-AF, fa-AF, uz-AF, tk-TM, ky-CN, ug-CN, bo-CN, ii-CN, za-CN, yo-NG, ig-NG, ha-NG, ff-SN, wo-SN, sw-KE, so-SO, am-ET, ti-ET, om-ET, rw-RW, rn-BI, lg-UG, ak-GH, tw-GH, ee-GH, bm-ML, dyo-SN, ses-ML, sg-CF, ln-CD, kg-CD, lua-CD, zu-ZA, xh-ZA, af-ZA, nso-ZA, tn-ZA, st-ZA, ts-ZA, ss-ZA, ve-ZA, nr-ZA)",
        "default": "en-US"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of search results to process (1-20)",
        "minimum": 1,
        "maximum": 20,
        "default": 10
      },
      "model": {
        "type": "string",
        "description": "Gemini model to use for search and response generation",
        "enum": [
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-2.0-flash",
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-1.5-pro-latest",
          "gemini-1.5-flash-latest"
        ],
        "default": "gemini-1.5-flash-latest"
      }
    },
    "required": ["query"]
  }
}
```

## Testing

Run the test script to verify functionality:

```bash
node test_server.js
```

Or test manually with test requests:

```bash
cat test_requests.txt | node index.js --apiKey YOUR_API_KEY
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `node test_server.js`
4. Make your changes
5. Test thoroughly
6. Update version in package.json
7. Publish: `npm publish`

## Version History

### v1.0.15

- ✅ Fixed MCP protocol implementation
- ✅ Added proper `tools/list` support
- ✅ Improved error handling
- ✅ Fixed parameter parsing (`arguments` vs `parameters`)
- ✅ Enhanced response format
- ✅ Added comprehensive testing

### v1.0.14

- Initial working version
- Basic Google Search integration
- Gemini API integration

## License

ISC

## Contributing

Pull requests welcome! Please ensure tests pass and follow existing code style.
