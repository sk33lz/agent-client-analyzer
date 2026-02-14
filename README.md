# agent-client-analyzer

`agent-client-analyzer` is a static site for AI agents and automation tools to inspect browser client context.

## How It Works
1. A user or agent opens `/`.
2. The page fetches machine-readable profile metadata from `/api/info` (fallback `/api/info.json`).
3. The page fetches request-inspection data from `/api/client` (fallback `/api/client.json` on static-only hosts).
4. The page gathers live browser/client signals in-session (user agent, language, platform, viewport, capabilities, etc.).
5. The UI displays:
- Endpoint profile JSON
- Request inspection JSON
- Live client report JSON
6. The same report can be copied or downloaded as JSON from the page.
7. For machine parsing, `/` also embeds the live report as raw JSON in:
- `<script id="live-client-report" type="application/json">...</script>`

## Endpoints
- `/`: Human-facing analyzer UI
- `/` (embedded JSON): Live runtime report at DOM selector `#live-client-report`
- `/api/info`: Service profile for agents
- `/api/info.json`: Static JSON backing `/api/info`
- `/api/client`: Function endpoint with machine-readable request headers (primary)
- `/api/client.json`: Static fallback for `/api/client` on hosts without serverless runtime
- `/api/patterns`: Function endpoint for machine-readable request/header pattern analysis
- `/api/patterns.json`: Static fallback for `/api/patterns` on hosts without serverless runtime
- `/api/headers`: Machine-readable header guidance for agents
- `/api/headers.json`: Static JSON backing `/api/headers`
- `/api/client-schema`: JSON schema for the live report format
- `/api/client-schema.json`: Static JSON backing `/api/client-schema`

## No-JS Agents
- Agents that only make HTTP requests should use `GET /api/client`.
- Agents can call `GET /api/patterns` to get classification signals (browser/cli/library/bot, automation likelihood).
- The response is JSON and does not require JavaScript execution.
- `GET /api/info` can be used for endpoint discovery.
- On static hosts like Surge, `/api/client` is a static placeholder and cannot echo per-request headers.

## Project Files
- `index.html`: UI + client signal collection logic + background visuals
- `api/info.json`: Agent-facing service metadata
- `netlify/functions/client.js`: Netlify function for `/api/client`
- `netlify/functions/patterns.js`: Netlify function for `/api/patterns`
- `functions/api/client.js`: Cloudflare Pages function for `/api/client`
- `functions/api/patterns.js`: Cloudflare Pages function for `/api/patterns`
- `api/headers.json`: Header guidance for machine clients
- `api/client-schema.json`: Schema for the runtime report object
- `_redirects`: Clean endpoint aliases for static hosts
- `netlify.toml`: Netlify deploy config and redirects

## Local Run
Use any static server from the repo root, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Note: `python3 -m http.server` does not process `_redirects` or serverless functions. `/api/info` falls back to `/api/info.json` and `/api/client` falls back to `/api/client.json`.

## Deploy
### Netlify
1. Push this folder to a Git repo.
2. In Netlify, import the repo.
3. Deploy settings are read from `netlify.toml` (`publish = "."`).

### Cloudflare Pages
1. Push this folder to a Git repo.
2. In Cloudflare Pages, create a project from that repo.
3. Framework preset: `None`
4. Build command: *(empty)*
5. Build output directory: `/`
