# Sockeye Games Hub

Front door for [Sockeye Games](https://sockeyegames.org) — free educational games for Canadian students.

- Marketing site (home, games, privacy, about, account)
- Optional parent magic-link auth + kid profiles
- Opaque per-game progress sync API for titles on `*.sockeyegames.org`

See [AGENTS.md](./AGENTS.md) for develop / deploy notes.

## Quick start

```bash
bun install
bun run db:migrate:local
bun run build
bunx wrangler pages dev dist --d1=DB
```

UI-only: `bun run dev` (port 5180).
