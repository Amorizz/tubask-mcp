import pc from "picocolors";

export { pc };

const BRAND = pc.bold(pc.cyan("Tubask"));
const DIM = pc.dim;
const BOLD = pc.bold;

export function printBanner() {
  const lines = [
    "",
    pc.cyan("  ╭──────────────────────────────────────────╮"),
    pc.cyan("  │") + BOLD("  Tubask") + DIM("  ·  YouTube, readable in chat     ") + pc.cyan("│"),
    pc.cyan("  │") + DIM("  3 tools · Hosted MCP · OAuth             ") + pc.cyan("│"),
    pc.cyan("  ╰──────────────────────────────────────────╯"),
    "",
  ];
  console.log(lines.join("\n"));
}

export function printHelp() {
  printBanner();
  console.log(`${BOLD("Usage")}
  ${pc.cyan("npx @tubask/mcp")}              Interactive setup ${DIM("(recommended)")}
  ${pc.cyan("npx @tubask/mcp init")}         Write MCP client config
  ${pc.cyan("npx @tubask/mcp skill install")}  Install Cursor routing skill
  ${pc.cyan("npx @tubask/mcp status")}        Check if Tubask is configured
  ${pc.cyan("npx @tubask/mcp help")}          Show this help

${BOLD("Examples")}
  ${DIM("$")} npx @tubask/mcp
  ${DIM("$")} npx @tubask/mcp init --client claude-code
  ${DIM("$")} npx @tubask/mcp init --global --dry-run

${BOLD("Links")}
  Server  ${pc.underline("https://tubask.app/mcp")}
  Docs    ${pc.underline("https://tubask.app/docs/connect")}
  Trial   ${pc.underline("https://tubask.app/signup")} ${DIM("(3 summaries · 25 searches · no card)")}
`);
}

export function formatPath(path) {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
  if (home && path.startsWith(home)) {
    return pc.cyan("~") + path.slice(home.length);
  }
  return pc.cyan(path);
}

export function printSuccess(message) {
  console.log(`${pc.green("✔")} ${message}`);
}

export function printWarning(message) {
  console.log(`${pc.yellow("!")} ${message}`);
}

export function printError(message) {
  console.log(`${pc.red("✖")} ${message}`);
}

export function printStep(number, title) {
  console.log(`\n${pc.cyan(String(number))} ${BOLD(title)}`);
}

export function printConfigBlock(json, { label = "Config" } = {}) {
  console.log(`\n${DIM(label)}`);
  console.log(pc.dim("─".repeat(40)));
  console.log(pc.white(json.trimEnd()));
  console.log(pc.dim("─".repeat(40)));
}

export function printCliCommand(command) {
  console.log(`\n${DIM("Run in terminal")}`);
  console.log(pc.dim("─".repeat(40)));
  console.log(pc.yellow(`  ${command}`));
  console.log(pc.dim("─".repeat(40)));
}

export function printNextSteps(steps, { title = "Next steps" } = {}) {
  console.log(`\n${BOLD(title)}`);
  steps.forEach((step, i) => {
    console.log(`  ${pc.cyan(`${i + 1}.`)} ${step}`);
  });
}

export function printOutro(message) {
  console.log(`\n${pc.green("▸")} ${message}\n`);
}

export function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI);
}

export function brandLabel() {
  return BRAND;
}
