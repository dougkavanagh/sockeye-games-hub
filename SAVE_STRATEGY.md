# Sockeye Games — Save Strategy

Every game in the family persists the same way. This is what "the same way"
means, and why.

## The problem it solves

iOS evicts WKWebView `localStorage` under storage pressure. A game wrapped in
Capacitor that keeps saves in web storage will, on a full phone, silently lose
them — no error, no prompt, just three empty slots where a kid's progress was.
Capacitor Preferences is backed by `UserDefaults` and survives.

So: **no game may call `localStorage` directly.** Everything goes through
`store.ts`.

## `store.ts`

One file, meant to be **identical in every game**. Canonical copy:
`immunitd/src/game/store.ts`. It is vendored rather than published, so when you
change one, change them all.

- `localStorage` on the web, Capacitor Preferences on a device.
- Reads are **synchronous**. Preferences is not, so `initStore` pulls every
  declared key into an in-memory snapshot before the game boots, and callers
  never await a bridge round trip on a button press.
- Writes **coalesce per key** and drain in the background. A burst during a wave
  costs one bridge call per key, not one per write.
- `flushStore()` waits for the queue to actually empty, and is called on
  `visibilitychange`/`pagehide` so iOS cannot suspend the app on top of unwritten
  saves.
- On first native launch it **adopts whatever is already in web storage**, so an
  install that was played in the browser keeps its progress.

## `saveKeys.ts`

Each game declares its keys in one file. The list is not bookkeeping — it is
what `initStore` hydrates, so **a key missing from it is a key that does not
survive on a device**, and in a game with cloud sync it is a key that never
syncs.

```ts
export const SAVE_KEYS: StoreOptions = {
  keys: ["final-quest.progress.slot1", ...],
  renames: { "ninja-math-battle-progress:slot1": "final-quest.progress.slot1" },
};
```

## Key naming

`<game-id>.<area>.<name>` — `immunitd.saves.v1`, `doctor-you.audio.muted`,
`final-quest.progress.slot1`, `pharoahs-tomb.settings.readingMode`.

Areas in use: `progress`, `saves`, `campaign`, `audio`, `settings`.

Games written before this convention used their own shapes — a bare
`pizza-perfection-v2`, or a name the game no longer goes by. Those are handled
by `renames`, not by migration code in each game.

## Renames instead of migrations

`renames` maps an old key to a current one, applied once during hydration.
Several games had grown a hand-rolled fallback loop for this; they are now one
line of declaration each.

Two properties worth keeping:

- **The old key is left in place.** Rolling a build back does not strand a
  player.
- **A rename never overwrites a value already under the new key.** Applying
  twice is safe.

Where a rename crosses a schema version (`doctor-you.campaign.v1` →
`.v2`, `pizza-perfection-v1` → `.v2`), the game's own `normalize` function fills
in whatever the older payload is missing. Check that before adding one.

## Boot order is load-bearing

Modules that read persisted state **as they evaluate** — a mute flag at module
scope, a React component reading slots in its first render — must not be
imported before `initStore` resolves. The entry point does nothing but hydrate
and then hand off:

```ts
void initStore(SAVE_KEYS).then(async () => {
  const { boot } = await import("./boot");
  boot();
});
```

React games render inside the `.then` instead. Getting this wrong shows a
returning player empty slots for a frame on the web, and permanently on a device.

## Tokens are not saves

Access tokens do **not** go in the store. Preferences is `UserDefaults`, which is
unencrypted; tokens belong in the Keychain, behind the vault seam in
`authPlatform.ts`. See `GAME_OIDC_INTEGRATION.md`.

## Cloud sync

Games that sync to the hub walk their **declared key list**, never enumerating
storage. Enumeration finds nothing on a device, and a sync that finds nothing
will happily push an empty blob over a kid's cloud progress.

Merge slots by recency (`updatedAt`, last-write-wins) so a quest played offline
is not clobbered by a staler cloud copy. Map incoming blob keys through the
game's rename table — a blob written before a rename is keyed by the old names.

## Tests

`test/store.test.ts` is vendored alongside `store.ts`. The native path cannot be
exercised by hand without a device, and what it protects is a family's saves, so
it stays green. Note that Bun shares one module registry across test *files*: to
get an unhydrated store per case, import it with a query string
(`../src/game/store.ts?graph=1`) and do not import anything else that pins it.

## Adopting it in a new game

1. `bun add @capacitor/core @capacitor/preferences` (they report non-native in a
   browser, so this is safe before there is a shell).
2. Copy `store.ts` and `test/store.test.ts` from `immunitd`.
3. Write `saveKeys.ts`: current names, plus `renames` for whatever is on disk.
4. Replace every `localStorage` call with `getItem` / `setItem` / `removeItem`.
5. Split the entry so nothing is imported before `initStore` resolves.
6. If the repo has a `package-lock.json`, run `npm install --package-lock-only`
   — Cloudflare's auto-build uses `npm ci` and will fail on a drifted lockfile.
