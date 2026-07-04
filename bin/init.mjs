import * as p from "@clack/prompts";
import { applySetup } from "../lib/setup.mjs";
import { DOCS_URL, MCP_URL, SIGNUP_URL } from "../lib/constants.mjs";
import {
  formatPath,
  isInteractive,
  pc,
  printCliCommand,
  printConfigBlock,
  printHelp,
  printNextSteps,
  printOutro,
  printSuccess,
  printWarning,
} from "../lib/ui.mjs";

function parseArgs(argv) {
  const flags = {
    global: false,
    merge: true,
    dryRun: false,
    client: "cursor",
    help: false,
    yes: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--global" || arg === "-g") flags.global = true;
    else if (arg === "--no-merge") flags.merge = false;
    else if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--yes" || arg === "-y") flags.yes = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg === "--client" || arg === "-c") {
      flags.client = argv[++i] ?? "cursor";
    }
  }
  return flags;
}

export async function runInit(argv = []) {
  const flags = parseArgs(argv);

  if (flags.help) {
    printHelp();
    return 0;
  }

  const spinner = isInteractive() && !flags.dryRun ? p.spinner() : null;
  spinner?.start(`Setting up ${flags.client}…`);

  try {
    const result = await applySetup({
      clientId: flags.client,
      global: flags.global,
      merge: flags.merge,
      dryRun: flags.dryRun,
    });

    if (!result.client) {
      spinner?.stop(pc.red("Unknown client"));
      printWarning(`Unknown client "${flags.client}".`);
      printHelp();
      return 1;
    }

    if (result.alreadyConfigured && !flags.dryRun && !flags.yes) {
      spinner?.stop(pc.yellow("Already configured"));
      printWarning("Tubask entry already exists — merged and updated.");
    } else if (result.written) {
      spinner?.stop(pc.green("Done"));
      printSuccess(
        flags.dryRun
          ? "Dry run — no files written"
          : `Saved ${formatPath(result.configPath)}`,
      );
    } else if (result.client.printOnly) {
      spinner?.stop(pc.green("Ready"));
    } else {
      spinner?.stop(pc.yellow("Preview"));
    }

    if (result.client.cli) {
      printCliCommand(result.client.cli);
    }

    if (result.client.printOnly) {
      if (isInteractive()) {
        p.note(MCP_URL, result.client.pasteTarget);
      } else {
        console.log(`\nPaste in ${result.client.pasteTarget}:\n  ${MCP_URL}\n`);
      }
    } else if (flags.dryRun || !result.written) {
      printConfigBlock(result.json, {
        label: flags.dryRun ? "Would write" : "Config",
      });
    }

    const steps = [...result.client.nextSteps];
    if (!flags.dryRun) {
      steps.push(`Free trial: ${SIGNUP_URL}`);
    }
    steps.push(`Docs: ${DOCS_URL}/connect`);

    printNextSteps(steps);

    if (flags.client === "cursor" && !flags.dryRun && isInteractive()) {
      printOutro("Open Cursor → Settings → Tools & MCP → Connect, then paste a YouTube link.");
    }

    return 0;
  } catch (err) {
    spinner?.stop(pc.red("Failed"));
    throw err;
  }
}
