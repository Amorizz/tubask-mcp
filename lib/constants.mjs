export const MCP_URL = "https://tubask.app/mcp";
export const SERVER_KEY = "tubask";
export const DOCS_URL = "https://tubask.app/docs";
export const SIGNUP_URL = "https://tubask.app/signup";

export const CLIENT_CONFIGS = {
  cursor: {
    label: "Cursor",
    filename: ".cursor/mcp.json",
    entry: { url: MCP_URL },
    icon: "◆",
    nextSteps: [
      "Open Cursor → Settings → Tools & MCP → Connect",
      "Complete OAuth in your browser on first use",
      "Paste a YouTube URL in chat to try it",
    ],
  },
  "claude-code": {
    label: "Claude Code",
    filename: ".mcp.json",
    entry: { type: "http", url: MCP_URL },
    icon: "◇",
    cli: `claude mcp add --transport http ${SERVER_KEY} ${MCP_URL}`,
    nextSteps: [
      "Run the CLI command above, or use the JSON file in your project root",
      "Add --scope project to share .mcp.json with your team",
      "Complete OAuth on first tool call",
    ],
  },
  "claude-desktop": {
    label: "Claude Desktop",
    printOnly: true,
    pasteTarget: "Settings → Connectors → Add custom connector",
    entry: { url: MCP_URL },
    icon: "◇",
    nextSteps: [
      "Settings → Connectors → Add custom connector",
      `Paste ${MCP_URL}`,
      "Sign in when OAuth opens",
    ],
  },
  chatgpt: {
    label: "ChatGPT",
    printOnly: true,
    pasteTarget: "Settings → Apps & Connectors → Create app",
    entry: { url: MCP_URL },
    icon: "○",
    nextSteps: [
      "Settings → Apps & Connectors → Create app",
      `Paste ${MCP_URL}`,
      "Complete OAuth on first use",
    ],
  },
  gemini: {
    label: "Gemini CLI",
    filename: null,
    entry: { httpUrl: MCP_URL },
    icon: "○",
    cli: `gemini mcp add --transport http ${SERVER_KEY} ${MCP_URL}`,
    printOnly: true,
    nextSteps: [
      "Run the CLI command above, or add the JSON to Gemini settings.json",
      "Gemini uses httpUrl, not url",
    ],
  },
  windsurf: {
    label: "Windsurf",
    filename: "mcp_config.json",
    globalOnly: true,
    entry: { serverUrl: MCP_URL },
    icon: "◆",
    nextSteps: [
      "Paste the JSON into ~/.codeium/windsurf/mcp_config.json",
      "Restart Windsurf or refresh the MCP panel",
    ],
  },
};

export function buildMcpJson(clientId) {
  const client = CLIENT_CONFIGS[clientId];
  return JSON.stringify(
    { mcpServers: { [SERVER_KEY]: client.entry } },
    null,
    2,
  );
}
