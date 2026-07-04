import * as p from "@clack/prompts";
import { cp, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOCS_URL, MCP_URL, SIGNUP_URL } from "./constants.mjs";
import { applySetup, findExistingSetup, readJson } from "./setup.mjs";
import {
  formatPath,
  isInteractive,
  pc,
  printBanner,
  printCliCommand,
  printConfigBlock,
  printNextSteps,
  printOutro,
} from "./ui.mjs";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundledSkill = join(packageRoot, "skills", "tubask-youtube");

const CLIENT_OPTIONS = [
  { value: "cursor", label: "Cursor", hint: "recommended" },
  { value: "claude-code", label: "Claude Code", hint: ".mcp.json" },
  { value: "claude-desktop", label: "Claude Desktop", hint: "Connectors" },
  { value: "chatgpt", label: "ChatGPT", hint: "Apps & Connectors" },
  { value: "gemini", label: "Gemini CLI", hint: "terminal" },
  { value: "windsurf", label: "Windsurf", hint: "mcp_config.json" },
];

function cancelIfNeeded(value) {
  if (p.isCancel(value)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }
  return value;
}

async function installSkill(global) {
  const targetRoot = global
    ? join(homedir(), ".cursor", "skills")
    : join(process.cwd(), ".cursor", "skills");
  const target = join(targetRoot, "tubask-youtube");
  await mkdir(targetRoot, { recursive: true });
  await cp(bundledSkill, target, { recursive: true, force: true });
  return target;
}

function buildOutroSteps(result, skillPath) {
  const { clientId, client, configPath, dryRun, written } = result;
  const steps = [];

  if (clientId === "cursor") {
    if (written && configPath) {
      steps.push(`Config saved to ${formatPath(configPath)}`);
    }
    steps.push("Open Cursor → Settings → Tools & MCP → Connect Tubask");
    steps.push("Complete OAuth in your browser on first tool call");
    if (skillPath) {
      steps.push("Skill installed — agent routes YouTube links automatically");
    }
    steps.push('Try: paste a YouTube URL and ask "summarize this talk"');
  } else if (clientId === "claude-code") {
    if (written && configPath) {
      steps.push(`Saved ${formatPath(configPath)}`);
    }
    steps.push(`Or run: ${client.cli}`);
    steps.push("Complete OAuth on first tool call");
  } else if (clientId === "claude-desktop" || clientId === "chatgpt") {
    steps.push(`Paste the URL in ${client.pasteTarget}`);
    steps.push("Sign in when OAuth opens");
  } else if (clientId === "gemini") {
    steps.push(`Run: ${client.cli}`);
    steps.push("Gemini JSON uses httpUrl, not url");
  } else if (clientId === "windsurf") {
    if (written && configPath) {
      steps.push(`Saved ${formatPath(configPath)}`);
    }
    steps.push("Restart Windsurf or refresh the MCP panel");
  }

  steps.push(`Free trial: ${SIGNUP_URL}`);
  steps.push(`Docs: ${DOCS_URL}/connect`);

  if (dryRun) {
    return steps.map((s) => `[preview] ${s}`);
  }
  return steps;
}

export async function runOnboarding({ dryRun = false } = {}) {
  if (!isInteractive()) {
    const result = await applySetup({ clientId: "cursor", global: false, dryRun });
    return finishNonInteractive(result);
  }

  printBanner();

  const existing = await findExistingSetup();
  if (existing.length > 0) {
    p.log.info(
      `Tubask already configured in ${existing.map((e) => e.label).join(", ")}`,
    );
  }

  p.intro(`${pc.bold("Welcome")} — let's connect YouTube to your AI editor.`);

  const clientId = cancelIfNeeded(
    await p.select({
      message: "Which client do you use?",
      options: CLIENT_OPTIONS,
      initialValue: "cursor",
    }),
  );

  let global = false;
  let merge = true;

  if (clientId === "cursor") {
    const scope = cancelIfNeeded(
      await p.select({
        message: "Install for this project or all projects?",
        options: [
          { value: "project", label: "This project only", hint: ".cursor/mcp.json" },
          { value: "global", label: "All projects", hint: "~/.cursor/mcp.json" },
        ],
      }),
    );
    global = scope === "global";

    const configPath = global
      ? join(homedir(), ".cursor", "mcp.json")
      : join(process.cwd(), ".cursor", "mcp.json");

    const current = await readJson(configPath);
    if (current?.mcpServers && Object.keys(current.mcpServers).length > 0) {
      merge = cancelIfNeeded(
        await p.confirm({
          message: "Merge Tubask into your existing MCP config?",
          initialValue: true,
        }),
      );
    }
  }

  const spinner = p.spinner();
  spinner.start("Writing configuration…");

  let result;
  try {
    result = await applySetup({ clientId, global, merge, dryRun });
    spinner.stop(
      result.written
        ? pc.green("Configuration saved")
        : result.client.printOnly
          ? pc.green("Ready to connect")
          : pc.yellow("Preview only"),
    );
  } catch (err) {
    spinner.stop(pc.red("Setup failed"));
    throw err;
  }

  if (result.client.cli) {
    printCliCommand(result.client.cli);
  }

  if (result.client.printOnly) {
    p.note(MCP_URL, result.client.pasteTarget);
  } else if (dryRun || !result.written) {
    printConfigBlock(result.json, { label: dryRun ? "Preview" : "Config" });
  } else if (result.configPath) {
    p.log.success(`Wrote ${formatPath(result.configPath)}`);
  }

  let skillPath = null;
  if (clientId === "cursor" && !dryRun) {
    const installSkillChoice = cancelIfNeeded(
      await p.confirm({
        message: "Install the tubask-youtube Cursor skill?",
        initialValue: true,
      }),
    );

    if (installSkillChoice) {
      const skillSpinner = p.spinner();
      skillSpinner.start("Installing skill…");
      skillPath = await installSkill(global);
      skillSpinner.stop(pc.green(`Skill → ${formatPath(skillPath)}`));
    }
  }

  const steps = buildOutroSteps(result, skillPath);
  p.note(steps.map((s, i) => `${i + 1}. ${s}`).join("\n"), "You're almost done");

  p.outro(
    dryRun
      ? "Dry run complete — re-run without --dry-run to apply."
      : "Tubask is configured. Open your client and connect.",
  );

  return 0;
}

async function finishNonInteractive(result) {
  const { client, configPath, json, written } = result;

  if (written && configPath) {
    console.log(`Wrote ${configPath}`);
  }
  if (client.cli) {
    printCliCommand(client.cli);
  }
  if (!written) {
    printConfigBlock(json);
  }
  printNextSteps(client.nextSteps);
  printOutro("Run npx @tubask/mcp for the full interactive setup.");
  return 0;
}

export async function runStatus() {
  printBanner();
  const found = await findExistingSetup();

  if (found.length === 0) {
    p.log.warn("Tubask is not configured in this project.");
    p.log.info(`Run ${pc.cyan("npx @tubask/mcp")} to set up.`);
    return 1;
  }

  p.log.success("Tubask MCP is configured:");
  for (const item of found) {
    console.log(`  ${pc.green("●")} ${item.label}`);
    console.log(`    ${pc.dim(formatPath(item.path))}`);
  }

  console.log(`\n${pc.dim("Server")} ${MCP_URL}`);
  console.log(`${pc.dim("Next")} Open your client → Connect → paste a YouTube URL\n`);
  return 0;
}
