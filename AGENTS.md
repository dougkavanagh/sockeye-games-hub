# Agent Notes — Sockeye Games Hub

- Use `bun` for installs and script runs.
- Run `bun run check` (Biome fix) after each change.
- After each change, automatically commit, push to `main`, and deploy (`bun run deploy`) without asking for confirmation first. This is a standing, pre-authorized workflow for this repo (requested 2026-07-19) — it overrides the general default of confirming before push/deploy. Still run `bun run check` before committing. Flag unusually large/risky changes (auth, secrets, DB migrations) to the user even though the mechanical steps don't need confirmation.
- Vite build output is `dist` (Cloudflare Pages + Functions).
- D1 database: `sockeye-games` (binding `DB`).
- Apex: `sockeyegames.org` — games on subdomains (`final-quest.sockeyegames.org`, `pizza-perfection.sockeyegames.org`, `pharoahs-tomb.sockeyegames.org`, `immunitd.sockeyegames.org`, `dryou.sockeyegames.org`, etc.).
- When adding a new game to `src/data/site.ts`, also add its `*.pages.dev` and `*.sockeyegames.org` origins to the `allowedOrigins` list in `functions/lib/http.ts`, and add the same origins plus `capacitor://localhost` / `http://localhost` to that game's `oidc_client.redirect_origins` (new migration).
- Native Capacitor shells cannot use the hub session cookie. Games must use the OIDC Bearer flow in `GAME_OIDC_INTEGRATION.md` (PKCE, `Authorization: Bearer`, `redirect_uri` = `${location.origin}/callback`).
- Auth: parent magic-link + `.sockeyegames.org` session cookie. OIDC deferred for external domains.

## Scripts

```bash
bun run dev              # Vite UI only (no Functions)
bun run db:migrate:local # Apply D1 migrations locally
bun run dev:pages        # Build + wrangler pages dev (UI + Functions + local D1)
bun run deploy           # Build + Pages deploy
bun run db:migrate:remote
source .env && bun run generate:brand-images   # fal.ai hero / og / mark (needs FAL_KEY)
source .env && bun run generate:game-art        # per-game card headers (imported or fal.ai)
```

Brand images land in `public/images/`, per-game card headers in
`public/images/games/<game-id>.webp`. Both are idempotent unless `--force`.
Adding a game means adding a matching entry in `scripts/generate-game-art.ts`
keyed to the listing's `id`: either `from` (a path to the game repo's own title
art — preferred, keeps the card on-brand) or `prompt` (generated via fal.ai).
Final Quest and Doctor You import from `../final-quest` and `../dryou`, so
those repos must be checked out as siblings to re-run; a missing one is logged
and skipped, leaving the committed art in place. Each listing also carries an
`accent` hex sampled from its art, which tints the card's hover state.
WebP encoding needs `cwebp` (`brew install webp`). Several generated images
are hand-picked takes, so prefer `--force --only=<id>` over a blanket
`--force`, which re-rolls every generated card.

## Secrets (production)

```bash
bunx wrangler pages secret put RESEND_API_KEY --project-name sockeye-games-hub
bunx wrangler pages secret put MAGIC_LINK_FROM --project-name sockeye-games-hub
bunx wrangler pages secret put HUB_ORIGIN --project-name sockeye-games-hub
bunx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name sockeye-games-hub
bunx wrangler pages secret put CONTACT_TO_EMAIL --project-name sockeye-games-hub
```

Without `RESEND_API_KEY`, `/api/auth/send` returns `devVerifyUrl` for local testing.

### Contact form (parents/teachers) — one-time manual setup

`/api/contact` (functions/api/contact.ts) backs the form on the About page. Spam
defense is Cloudflare Turnstile, verified server-side; without
`TURNSTILE_SECRET_KEY` set, the endpoint skips verification (dev/local only).
Messages are stored in D1 (`contact_message` table, migration `0002`) and
emailed to `CONTACT_TO_EMAIL` via Resend if both that and `RESEND_API_KEY` are
set.

The API token in `.env` doesn't have Turnstile or D1 write scope, so widget
creation and remote migrations couldn't be automated. To finish setup:

1. Cloudflare dash → Turnstile → **Add widget**, domain `sockeyegames.org`
   (add `sockeye-games-hub.pages.dev` and `localhost` too), mode "Managed".
2. Put the **Site Key** in the local `.env` as `VITE_TURNSTILE_SITE_KEY=...`.
   This repo has no Cloudflare-side build step — `bun run deploy` builds
   locally with `vite build` and uploads the finished `dist`, so any
   `VITE_*` var only needs to exist in `.env` at build time (Vite inlines it
   into the bundle). There is nothing to set in the Pages dashboard for this.
   Without it, the form renders without a Turnstile widget and the backend
   skips verification.
3. `bunx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name sockeye-games-hub`
   with the widget's Secret Key.
4. `bunx wrangler pages secret put CONTACT_TO_EMAIL --project-name sockeye-games-hub`
   with the inbox that should receive messages.

## OIDC (game sign-in & saves)

The hub acts as an OIDC issuer at `https://sockeyegames.org`.

Discovery: `https://sockeyegames.org/.well-known/openid-configuration`

Each game has a pre-registered `client_id` (same as its `id` in `src/data/site.ts`).
Access tokens are HS256 JWTs signed with the `OIDC_SECRET` secret (1-hour TTL).

**New secret to provision:**
```bash
bunx wrangler pages secret put OIDC_SECRET --project-name sockeye-games-hub
# Value: a random 32+ character string
```

**To add a new game's OIDC client:** add a row to the `oidc_client` table in a new migration.

**Save endpoint (Bearer auth):** `PUT https://sockeyegames.org/api/progress/{gameId}`
- Accepts either the hub session cookie OR `Authorization: Bearer <access_token>`
- Requires `profile_id` in the token (non-null) — user must have selected a kid profile

**Game integration instructions** are in `GAME_OIDC_INTEGRATION.md`.
