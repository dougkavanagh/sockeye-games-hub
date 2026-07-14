# Agent Notes — Sockeye Games Hub

- Use `bun` for installs and script runs.
- Run `bun run check` (Biome fix) after each change.
- Vite build output is `dist` (Cloudflare Pages + Functions).
- D1 database: `sockeye-games` (binding `DB`).
- Apex: `sockeyegames.org` — games on subdomains (`final-quest.sockeyegames.org`, etc.).
- Auth: parent magic-link + `.sockeyegames.org` session cookie. OIDC deferred for external domains.

## Scripts

```bash
bun run dev              # Vite UI only (no Functions)
bun run db:migrate:local # Apply D1 migrations locally
bun run dev:pages        # Build + wrangler pages dev (UI + Functions + local D1)
bun run deploy           # Build + Pages deploy
bun run db:migrate:remote
```

## Secrets (production)

```bash
bunx wrangler pages secret put RESEND_API_KEY --project-name sockeye-games-hub
bunx wrangler pages secret put MAGIC_LINK_FROM --project-name sockeye-games-hub
bunx wrangler pages secret put HUB_ORIGIN --project-name sockeye-games-hub
```

Without `RESEND_API_KEY`, `/api/auth/send` returns `devVerifyUrl` for local testing.
