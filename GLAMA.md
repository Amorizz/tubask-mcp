# Glama release build

Repository: [Amorizz/tubask-mcp](https://github.com/Amorizz/tubask-mcp)

Admin: https://glama.ai/mcp/servers/Amorizz/tubask-mcp/admin/dockerfile

## Transport

- **Production:** Streamable HTTP at `https://tubask.app/mcp` (OAuth 2.0)
- **Catalog / Glama checks:** stdio adapter in `catalog/stdio.mjs` (tool schemas only; calls redirect to hosted endpoint)

## Dockerfile

Use the repository `Dockerfile` directly, or configure:

**Build steps:**

```json
["npm install --omit=dev"]
```

**CMD arguments:**

```json
["node", "catalog/stdio.mjs"]
```

**Environment variables schema:**

```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

**Placeholder parameters:**

```json
{}
```

## After checks pass

1. Claim the server on the score tab (requires `glama.json` maintainer).
2. Make release with version `0.6.1`.
3. Add the Glama badge to [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) PR #9122.
