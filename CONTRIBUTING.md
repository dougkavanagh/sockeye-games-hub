# Contributing a game to Sockeye

Default path: your game is an **independent repo** deployed as a Cloudflare Pages project on a Sockeye subdomain.

## Checklist

1. Build your game (Vite/React recommended; match Final Quest conventions if helpful).
2. Keep play working **without** an account (`localStorage` is fine).
3. Optional: sync progress via the hub API when a parent session cookie is present.
4. Request a subdomain (`your-game.sockeyegames.org`) and catalogue listing.
5. No ads, no behavioural trackers, no open stranger chat.

## Progress API (cookie session)

Games on `*.sockeyegames.org` can call the hub with credentials:

```ts
// GET /api/progress/:gameId
const res = await fetch("https://sockeyegames.org/api/progress/your-game-id", {
  credentials: "include",
});

// PUT /api/progress/:gameId
await fetch("https://sockeyegames.org/api/progress/your-game-id", {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ blob: yourSaveObject }),
});
```

Parents sign in on the hub Account page and select an active kid profile first.

## External domains

If you must host off `*.sockeyegames.org`, cross-domain OIDC may be added later. Prefer a Sockeye subdomain for v1.
