# Google-AI-Search-MCP

A minimal Node.js server that exposes a `/search` endpoint. It uses the
[Gemini API](https://ai.google.dev) with Google Search grounding to answer
queries.

## Setup

Ensure the `GEMINI_API_KEY` environment variable is set, then start the
server with a single command:

```bash
node index.js
```

## Run as an MCP

With the [Model Context Protocol](https://github.com/model-context-protocol) CLI, you can also run the server as an MCP:

```bash
mcp up
```

Alternatively, you can run the server directly from npm using `npx`:

```bash
npx -y @jxspam/google-ai-search-mcp@latest --apiKey YOUR_API_KEY --model gemini-1.5-pro-latest
```

The server accepts the following command-line flags:

- `--apiKey`, `-k`: Your Gemini API key. (Defaults to the `GEMINI_API_KEY` environment variable)
- `--model`, `-m`: The Gemini model to use. (Defaults to `gemini-1.5-flash-latest`)

The response includes the model's answer and optional search metadata.

### Configure in your AI Code Editor

To use this MCP server with your AI code editor, you can add the following to your settings file:

```json
{
  "mcpServers": {
    "google-search": {
      "command": "npx",
      "args": [
        "-y",
        "@jxspam/google-ai-search-mcp@latest",
        "--mcp",
        "--apiKey",
        "YOUR_API_KEY",
        "--model",
        "gemini-1.5-pro-latest"
      ]
    }
  }
}
```

Remember to replace `YOUR_API_KEY` with your actual Gemini API key. You can also change the model to any of the other available Gemini models.

## Gemini Models

The Gemini API currently offers a number of foundation models. The most common model names are:

- `gemini-pro` – general text model
- `gemini-pro-vision` – multimodal version that accepts images
- `gemini-1.5-pro` and `gemini-1.5-pro-latest`
- `gemini-1.5-flash` and `gemini-1.5-flash-latest`
- `gemini-2.0-pro` and `gemini-2.0-pro-latest`
- `gemini-2.0-flash`, `gemini-2.0-flash-lite`, and `gemini-2.0-flash-latest`

Refer to the [Gemini API docs](https://ai.google.dev/gemini-api/docs/models) for the most up-to-date list of models.
