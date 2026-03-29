# Sample MCP Apps Chatflow

Sample MCP server that renders interactive sales analytics UIs inside an MCP Apps-compatible chat client. It includes a sales metric selector, chart-based visualization, and PDF report generation.

## Articles

This project is part of the MCP Apps article series published on dev.to:

- [Part 1](https://dev.to/ashita/a-practical-guide-to-building-mcp-apps-1bfm)
- [Part 2]()

## Demo

![Full Demo of Sample MCP Apps Chatflow](images/full-run.gif)

## Run locally

Run the MCP server locally by executing:

```bash
cd /path/to/sample-mcp-apps-chatflow

# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev
```

which successfully displays

```bash
> sample-mcp-apps-chatflow@1.0.0 dev
> tsx src/index.ts

🚀 MCP Apps Chatflow server running at http://localhost:3000
📡 MCP endpoint: http://localhost:3000/mcp
```

To connect to this endpoint from VS Code Insiders, add the following config to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sample-mcp-apps-chatflow": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```
