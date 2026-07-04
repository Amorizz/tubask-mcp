import * as p from "@clack/prompts";
import { cp, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MCP_URL } from "../lib/constants.mjs";
import {
  formatPath,
  isInteractive,
  pc,
  printHelp,
  printOutro,
  printSuccess,
} from "../lib/ui.mjs";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundledSkill = join(packageRoot, "skills", "tubask-youtube");

function parseArgs(argv) {
  const flags = { global: false, help: false, command: argv[0] ?? "install" };
  for (const arg of argv.slice(1)) {
    if (arg === "--global" || arg === "-g") flags.global = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
  }
  return flags;
}

export async function runSkill(argv = []) {
  const flags = parseArgs(argv);

  if (flags.help) {
    printHelp();
    return 0;
  }

  if (flags.command !== "install") {
    console.error(`Unknown skill command: ${flags.command}`);
    console.error("Try: npx @tubask/mcp skill install");
    return 1;
  }

  const targetRoot = flags.global
    ? join(homedir(), ".cursor", "skills")
    : join(process.cwd(), ".cursor", "skills");
  const target = join(targetRoot, "tubask-youtube");

  const spinner = isInteractive() ? p.spinner() : null;
  spinner?.start("Installing tubask-youtube skill…");

  await mkdir(targetRoot, { recursive: true });
  await cp(bundledSkill, target, { recursive: true, force: true });

  spinner?.stop(pc.green("Skill installed"));

  if (isInteractive()) {
    p.note(
      [
        "The agent reads this when you paste YouTube links.",
        "Make sure MCP is connected first (npx @tubask/mcp).",
      ].join("\n"),
      formatPath(target),
    );
    printOutro("Paste a YouTube URL in chat to test routing.");
  } else {
    printSuccess(`Installed to ${target}`);
  }

  return 0;
}
