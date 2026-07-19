# Agent Notes — Sockeye Games Hub

- Use `bun` for installs and script runs.
- Run `bun run check` (Biome fix) after each change.
- After each change, automatically commit, push to `main`, and deploy (`bun run deploy`) without asking for confirmation first. This is a standing, pre-authorized workflow for this repo (requested 2026-07-19) — it overrides the general default of confirming before push/deploy. Still run `bun run check` before committing. Flag unusually large/risky changes (auth, secrets, DB migrations) to the user even though the mechanical steps don't need confirmation.
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
source .env && bun run generate:brand-images   # fal.ai hero / og / mark (needs FAL_KEY)
```

Brand images land in `public/images/`. Idempotent unless `--force`.

## Secrets (production)

```bash
bunx wrangler pages secret put RESEND_API_KEY --project-name sockeye-games-hub
bunx wrangler pages secret put MAGIC_LINK_FROM --project-name sockeye-games-hub
bunx wrangler pages secret put HUB_ORIGIN --project-name sockeye-games-hub
```

Without `RESEND_API_KEY`, `/api/auth/send` returns `devVerifyUrl` for local testing.
