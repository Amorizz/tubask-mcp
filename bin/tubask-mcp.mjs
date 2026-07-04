#!/usr/bin/env node
import { runInit } from "./init.mjs";
import { runSkill } from "./skill.mjs";
import { runOnboarding, runStatus } from "../lib/onboarding.mjs";
import { printError, printHelp, isInteractive } from "../lib/ui.mjs";

const argv = process.argv.slice(2);
const [command, ...rest] = argv;

async function main() {
  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    printHelp();
    return 0;
  }

  if (command === "init") {
    return runInit(rest);
  }

  if (command === "skill") {
    return runSkill(rest);
  }

  if (command === "status") {
    return runStatus();
  }

  if (command === "onboarding" || command === "setup") {
    const dryRun = rest.includes("--dry-run");
    return runOnboarding({ dryRun });
  }

  printError(`Unknown command: ${command}`);
  printHelp();
  return 1;
}

async function entry() {
  if (argv.length === 0) {
    if (isInteractive()) {
      return runOnboarding({});
    }
    printHelp();
    return 0;
  }
  return main();
}

entry()
  .then((code) => process.exit(code ?? 0))
  .catch((err) => {
    printError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
