<p align="center">
  <img src="assets/logo.svg" alt="Tubask" width="64" height="64" />
</p>

<h1 align="center">Tubask</h1>

<p align="center">
  <strong>YouTube, readable in chat.</strong><br />
  Hosted MCP server for Claude, Cursor, ChatGPT, and any Streamable HTTP client.
</p>

<p align="center">
  <a href="https://tubask.app"><img src="https://img.shields.io/badge/website-tubask.app-111110?style=flat-square" alt="Website" /></a>
  <a href="https://tubask.app/mcp"><img src="https://img.shields.io/badge/MCP-Streamable%20HTTP-111110?style=flat-square" alt="MCP transport" /></a>
  <a href="https://tubask.app/docs"><img src="https://img.shields.io/badge/docs-quick%20start-111110?style=flat-square" alt="Docs" /></a>
  <img src="https://img.shields.io/badge/tools-3-111110?style=flat-square" alt="3 tools" />
  <img src="https://img.shields.io/badge/auth-OAuth%202.0-111110?style=flat-square" alt="OAuth 2.0" />
</p>

<p align="center">
  <a href="https://tubask.app/signup"><strong>Try free →</strong></a>
  &nbsp;·&nbsp;
  <a href="#quick-start">Install</a>
  &nbsp;·&nbsp;
  <a href="#tools">Tools</a>
  &nbsp;·&nbsp;
  <a href="https://tubask.app/docs/examples">Example prompts</a>
</p>

---

**Tubask** is a hosted remote MCP server that lets your AI assistant **search YouTube, summarize videos, and pull timestamped quotes** — from inside Claude or Cursor, in one message. No local Python. No 15-tool chains. **Three tools**, smart routing, OAuth, and a **hosted trial** (25 searches + 3 summaries) — then upgrade to Pro (no Google key) or stay on Free with your own key.

| Without Tubask | With Tubask |
| --- | --- |
| Paste a link → “I can't access YouTube” | Paste a link → summary, chapters, quotes |
| Open 5 tabs to research a topic | Ranked results in chat |
| Chain search → transcript → summarize | One `summarize_video` or `goal=advice` call |

## MCP endpoint

```
https://tubask.app/mcp
```

Transport: **Streamable HTTP** · Auth: **OAuth 2.0** (browser signup on first tool call) · Read-only tools

## Quick start

```bash
npx @tubask/mcp
```

Interactive setup: pick your client, write config, optionally install the Cursor skill.  
No args needed.

```bash
npx @tubask/mcp init              # non-interactive config write
npx @tubask/mcp skill install     # Cursor routing skill
npx @tubask/mcp status            # check existing setup
```

Then **Settings → Tools & MCP → Connect** in Cursor and complete OAuth on first use.

1. **Create a free account** at [tubask.app/signup](https://tubask.app/signup) (no credit card).
2. **Add the MCP server** to your client (`npx` above, or snippets below).
3. **Send any YouTube URL** in chat — e.g. *“Summarize this talk and list the main argument.”*
4. On first use, **complete OAuth** in your browser.
5. *(Optional)* Add your [free YouTube Data API key](https://tubask.app/docs/api-key) in the Tubask dashboard after the hosted trial.

### npx CLI

| Command | What it does |
| --- | --- |
| `npx @tubask/mcp` | **Interactive onboarding** (recommended) |
| `npx @tubask/mcp init` | Write `.cursor/mcp.json` in the current project |
| `npx @tubask/mcp init --global` | Write `~/.cursor/mcp.json` for all projects |
| `npx @tubask/mcp init --client claude-code` | Write `.mcp.json` + print `claude mcp add` command |
| `npx @tubask/mcp skill install` | Copy `tubask-youtube` skill to `.cursor/skills/` |
| `npx @tubask/mcp status` | Check if Tubask is already configured |
| `npx @tubask/mcp init --dry-run` | Preview config without writing files |

The server runs at `https://tubask.app/mcp` — the CLI only writes client config.

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "tubask": {
      "url": "https://tubask.app/mcp"
    }
  }
}
```

Then **Settings → Tools & MCP → Connect** and authorize.

### Claude Code

```bash
claude mcp add --transport http tubask https://tubask.app/mcp
```

Or add to `.mcp.json`:

```json
{
  "mcpServers": {
    "tubask": {
      "type": "http",
      "url": "https://tubask.app/mcp"
    }
  }
}
```

### Claude Desktop / Claude.ai

**Settings → Connectors → Add custom connector** → paste:

```
https://tubask.app/mcp
```

### ChatGPT

**Settings → Apps & Connectors → Create app** → paste the same URL.

### Smithery

```bash
smithery mcp add https://tubask.app/mcp
```

No extra config — OAuth and API keys are handled in your Tubask account after connect.

### Other clients

Any MCP host with **remote HTTP** support: paste `https://tubask.app/mcp` and sign in on first tool call.  
Client-specific notes: [tubask.app/docs/connect](https://tubask.app/docs/connect)

## Tools

| Tool | Use when |
| --- | --- |
| **`youtube_query`** | Paste anything — URL, `@handle`, playlist, search text. Search, latest uploads, comments, creator advice across videos. |
| **`summarize_video`** | Understand one video — summary, `key_points`, `chapters`, `quotes` with timestamps. |
| **`get_transcript`** | Exact words — keyword search, time slices, pagination. |

Every response includes **`next_steps[]`** so the model doesn't guess the next tool.

### Example prompts

```
Summarize this and give me 3 quotable lines with timestamps:
https://youtube.com/watch?v=...

What's @Fireship published about AI agents in the last month? Skip shorts.

Find every time they say "product-market fit" and give timestamps:
https://youtu.be/VIDEO_ID
```

More: [tubask.app/docs/examples](https://tubask.app/docs/examples)

## Why three tools?

Most YouTube MCP servers expose **10–20 granular tools**. Models chain `search` → `get_video` → `get_transcript` → `summarize`, burning tokens, latency, and YouTube API quota.

Tubask collapses the surface:

```
Paste anything     → youtube_query (intent=auto)
One video          → summarize_video
Exact words        → get_transcript
```

**Creator advice across multiple videos** → `youtube_query(goal=advice)` in **one call** (up to 8 recent long-form uploads).

## Pricing

| Plan | Price | Includes |
| --- | --- | --- |
| **Trial** | Free | 25 searches + 3 summaries · hosted · no API key |
| **Free** | $0 | 100 credits/mo (~12 summaries or ~100 searches) · your Google API key |
| **Pro** | $8/mo | 800 credits/mo (~100 summaries) · hosted · 3 MCP clients |
| **Plus** | $19/mo | 2,500 credits/mo (~312 summaries) · hosted · unlimited clients |

Credits: 1 search = 1 credit · 1 summary/transcript = 8 credits · metadata-only summary = 1 credit · advice = 1 + 8×transcript-covered videos. Hard stop at zero.

Details: [tubask.app/docs/quota](https://tubask.app/docs/quota)

## Security

- OAuth 2.0 for every MCP connection
- Your YouTube API key encrypted at rest (Fernet)
- Argon2id password hashing
- Read-only tools — no writes to your YouTube account

[tubask.app/docs/security](https://tubask.app/docs/security) · [SECURITY.md](SECURITY.md)

## Comparison

| | Tubask | Local `uvx` YouTube MCPs |
| --- | --- | --- |
| Install | Paste URL | Python/uv, local deps |
| Summaries | Built-in (chapters, quotes) | Often transcript-only |
| Channel / search / advice | `youtube_query` | Varies; often many tools |
| Auth | OAuth + dashboard | Usually none |
| API key | Your key in Tubask dashboard | Optional / none |

## Discovery metadata

MCP scanners that cannot authenticate may read [`server-card.json`](server-card.json) or the live endpoint at [tubask.app/.well-known/mcp/server-card.json](https://tubask.app/.well-known/mcp/server-card.json).

## Support

- [Troubleshooting](https://tubask.app/docs/troubleshooting)
- [GitHub Issues](https://github.com/Amorizz/tubask-mcp/issues) — bugs, feature requests, and public discussion
- [support@tubask.app](mailto:support@tubask.app)
- [Privacy](https://tubask.app/legal/privacy) · [Terms](https://tubask.app/legal/terms)

## License

This repository contains **documentation and discovery metadata** for the Tubask hosted service. The Tubask service software is proprietary. See [LICENSE](LICENSE).

---

<p align="center">
  <sub>v0.6.4 · Model Context Protocol · Made for Claude, Cursor, and builders who live in chat.</sub>
</p>
