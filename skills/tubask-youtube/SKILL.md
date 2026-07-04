---
name: tubask-youtube
description: Route YouTube URLs and @handles to Tubask MCP (youtube_query, summarize_video, get_transcript). Use when the user pastes a YouTube link, asks to summarize a video, pull timestamped quotes, research a creator, or mentions Tubask. Requires Tubask MCP connected at https://tubask.app/mcp.
---

# Tubask YouTube

YouTube inside chat via Tubask MCP. Three tools. One call per job when possible.

## Connect (once)

If Tubask MCP is not connected:

```bash
npx @tubask/mcp init
```

Then Cursor → Settings → Tools & MCP → Connect. OAuth opens on first tool call.

Endpoint: `https://tubask.app/mcp`

## Routing

| User intent | Tool | Example |
|-------------|------|---------|
| Paste URL, @handle, playlist, or search text | `youtube_query` | `ref="https://youtube.com/watch?v=..."` |
| Summarize one video (chapters, thesis, takeaways) | `summarize_video` | `video_ref=URL, depth="detailed"` |
| Exact quote, keyword in captions, time range | `get_transcript` | `video_ref=URL, format="timestamped"` |
| What does @creator teach about X? | `youtube_query` | `goal="advice", channel_ref="@handle"` |
| Recent uploads from a channel | `youtube_query` | `goal="latest", channel_ref="@handle"` |
| Topic research with stats | `youtube_query` | `goal="research", query="..."` |

Default: paste anything → `youtube_query(ref=...)` with `intent=auto`.

## Response contract

After every Tubask call:

1. Read `next_steps[]` before another tool call
2. Obey `agent_directive` (no browser or metadata recap workarounds)
3. Paste `tell_user` to the human when set
4. Fill `response_template` placeholders only when blocked

## Prompts (server-side)

Tubask exposes MCP prompts for common workflows. Prefer them when the user picks a workflow by name:

- `handle_any_link` — route a pasted ref
- `summarize_video_prompt` — structured summary with coverage
- `quote_for_article` — verbatim caption + timestamp
- `creator_advice` — multi-video themes from a channel
- `research_topic` — ranked search with stats
- `triage_talk` — is this long video worth watching?

## Limits

- Captions required (auto-generated OK). No captions = hard fail.
- Trial: 3 summaries + 25 searches, no card. Details in `ai.usage` on responses.
- Docs: https://tubask.app/docs/examples

## Do not

- Chain search → transcript → summarize manually when one Tubask call covers the job
- Paraphrase quotes when the user asked for exact words (use `get_transcript`)
- Recap from video title when summarize is blocked (paste `tell_user`, fill `response_template`)
