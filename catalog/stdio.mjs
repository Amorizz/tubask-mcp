#!/usr/bin/env node
/**
 * Stdio catalog adapter for Glama and other MCP directories.
 * Production Tubask runs at https://tubask.app/mcp (Streamable HTTP + OAuth).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const root = dirname(fileURLToPath(import.meta.url));
const card = JSON.parse(
  readFileSync(join(root, "..", "server-card.json"), "utf8"),
);

const HOSTED_MESSAGE =
  "Tubask is a hosted Streamable HTTP MCP server. Connect clients to https://tubask.app/mcp and complete OAuth on first use.";

const server = new Server(
  {
    name: "tubask-mcp-catalog",
    version: card.serverInfo.version,
  },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: card.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async () => ({
  content: [{ type: "text", text: HOSTED_MESSAGE }],
  isError: true,
}));

const transport = new StdioServerTransport();
await server.connect(transport);
