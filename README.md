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

The response includes the model's answer and optional search metadata.

## Gemini Models

The Gemini API currently offers a number of foundation models. The most common model names are:

- `gemini-pro` – general text model
- `gemini-pro-vision` – multimodal version that accepts images
- `gemini-1.5-pro` and `gemini-1.5-pro-latest`
- `gemini-1.5-flash` and `gemini-1.5-flash-latest`
- `gemini-2.0-pro` and `gemini-2.0-pro-latest`
- `gemini-2.0-flash`, `gemini-2.0-flash-lite`, and `gemini-2.0-flash-latest`

Refer to the [Gemini API docs](https://ai.google.dev/gemini-api/docs/models) for the most up-to-date list of models.
