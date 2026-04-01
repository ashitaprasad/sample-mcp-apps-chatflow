# Sample MCP Apps Chatflow

Sample MCP server that renders interactive sales analytics UIs inside an MCP Apps-compatible chat client. It includes a sales metric selector, chart-based visualization, and PDF report generation.

## Articles

This project is part of the MCP Apps article series published on dev.to:

- [Part 1: How I render interactive UI in my AI Agent chatflows using MCP Apps](https://dev.to/ashita/a-practical-guide-to-building-mcp-apps-1bfm) - Covers the core architectural patterns for declaring UI resources, practical design principles, and how to handle sandboxed host–server communication.
- [Part 2: How I built MCP Apps based Sales Analytics Agentic UI & deployed it on Amazon Bedrock AgentCore]() - Walks through a complete, production-style MCP Apps chatflow (chat + workflow) and build an interactive sales analytics UI where a user can select sales region, pick a metric like revenue or conversion rate, fetch live data, visualize it with charts, and create & download a PDF report - all without ever leaving the AI Agent chat window. It also covers, how you can deploy the developed TypeScript MCP server (powering the sales analytics MCP Apps) on Amazon Bedrock AgentCore Runtime.

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
