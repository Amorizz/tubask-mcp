import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { CLIENT_CONFIGS, MCP_URL, SERVER_KEY } from "./constants.mjs";

export function getClientIds() {
  return Object.keys(CLIENT_CONFIGS);
}

export function getClient(clientId) {
  return CLIENT_CONFIGS[clientId] ?? null;
}

export function resolveConfigPath(clientId, { global = false } = {}) {
  const client = CLIENT_CONFIGS[clientId];
  if (!client) {
    throw new Error(`Unknown client "${clientId}".`);
  }

  if (client.printOnly) {
    return null;
  }

  if (client.globalOnly) {
    return join(homedir(), ".codeium", "windsurf", client.filename);
  }

  if (global && clientId === "cursor") {
    return join(homedir(), ".cursor", "mcp.json");
  }

  return join(process.cwd(), client.filename);
}

export async function readJson(path) {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export function mergeConfig(existing, clientId) {
  const client = CLIENT_CONFIGS[clientId];
  const base = existing && typeof existing === "object" ? existing : {};
  const mcpServers =
    base.mcpServers && typeof base.mcpServers === "object" ? { ...base.mcpServers } : {};
  mcpServers[SERVER_KEY] = client.entry;
  return { ...base, mcpServers };
}

export function hasTubaskConfig(existing) {
  return Boolean(
    existing?.mcpServers?.[SERVER_KEY]?.url === MCP_URL ||
      existing?.mcpServers?.[SERVER_KEY]?.httpUrl === MCP_URL ||
      existing?.mcpServers?.[SERVER_KEY]?.serverUrl === MCP_URL,
  );
}

export async function applySetup({
  clientId,
  global = false,
  merge = true,
  dryRun = false,
}) {
  const client = CLIENT_CONFIGS[clientId];
  if (!client) {
    throw new Error(`Unknown client "${clientId}".`);
  }

  const configPath = resolveConfigPath(clientId, { global });
  const existing = merge && configPath ? await readJson(configPath) : null;
  const config = mergeConfig(existing, clientId);
  const json = `${JSON.stringify(config, null, 2)}\n`;
  const alreadyConfigured = hasTubaskConfig(existing);

  let written = false;
  if (!dryRun && configPath) {
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, json, "utf8");
    written = true;
  }

  return {
    clientId,
    client,
    configPath,
    json,
    dryRun,
    written,
    alreadyConfigured,
    merged: Boolean(existing),
  };
}

export async function findExistingSetup() {
  const checks = [];

  const cursorProject = join(process.cwd(), ".cursor", "mcp.json");
  const cursorGlobal = join(homedir(), ".cursor", "mcp.json");
  const claudeProject = join(process.cwd(), ".mcp.json");

  for (const [label, path] of [
    ["Cursor (project)", cursorProject],
    ["Cursor (global)", cursorGlobal],
    ["Claude Code", claudeProject],
  ]) {
    const data = await readJson(path);
    if (data && hasTubaskConfig(data)) {
      checks.push({ label, path, data });
    }
  }

  return checks;
}
