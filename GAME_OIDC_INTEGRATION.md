# Sockeye Games — OIDC Save Integration Guide

This guide explains how a Sockeye game integrates with the hub for authenticated game saves.

## Overview

The hub (`https://sockeyegames.org`) is the OIDC Identity Provider (IDP). Your game is a pre-registered public client. The flow is:

1. Your game initiates sign-in by redirecting the user to the hub's authorize endpoint.
2. The parent signs in on the hub (magic-link email).
3. The hub redirects back to your game with an authorization code.
4. Your game exchanges the code for an access token.
5. Your game calls the save endpoint with the access token.

## Your Client ID

Each game's `client_id` is its game ID (the `id` field in `src/data/site.ts` on the hub):

| Game | client_id |
|------|-----------|
| Final Quest | `final-quest` |
| Pizza Perfection | `pizza-perfection` |
| Pharoah's Tomb | `pharoahs-tomb` |
| ImmuniTD | `immunitd` |
| Doctor You | `dryou` |
| Temple of the Morning Star | `temple-of-the-morning-star` |

## Endpoints

| Endpoint | URL |
|----------|-----|
| OIDC Discovery | `https://sockeyegames.org/.well-known/openid-configuration` |
| Authorization | `https://sockeyegames.org/api/oidc/authorize` |
| Token | `https://sockeyegames.org/api/oidc/token` |
| UserInfo | `https://sockeyegames.org/api/oidc/userinfo` |
| Save (GET) | `https://sockeyegames.org/api/progress/{your-game-id}` |
| Save (PUT) | `https://sockeyegames.org/api/progress/{your-game-id}` |

## Authorization Code Flow with PKCE

### Step 1 — Generate PKCE parameters

```typescript
// Generate a random code_verifier (43-128 chars, URL-safe)
function generateCodeVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Compute code_challenge = BASE64URL(SHA256(code_verifier))
async function computeCodeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
```

### Step 2 — Redirect to authorize

```typescript
async function startSignIn(redirectUri: string) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await computeCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();

  // Persist these for the callback. Use localStorage as well as
  // sessionStorage: a Capacitor authorize step may leave the WebView, and
  // sessionStorage is gone on return.
  sessionStorage.setItem("oidc_code_verifier", codeVerifier);
  sessionStorage.setItem("oidc_state", state);
  localStorage.setItem("oidc_code_verifier", codeVerifier);
  localStorage.setItem("oidc_state", state);

  const params = new URLSearchParams({
    client_id: "your-game-id",        // ← replace with your game's client_id
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `https://sockeyegames.org/api/oidc/authorize?${params}`;
}
```

### Step 3 — Handle the callback

Your `redirect_uri` page receives `?code=...&state=...`:

```typescript
async function handleCallback(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  const savedState =
    sessionStorage.getItem("oidc_state") ?? localStorage.getItem("oidc_state");
  const codeVerifier =
    sessionStorage.getItem("oidc_code_verifier") ??
    localStorage.getItem("oidc_code_verifier");
  sessionStorage.removeItem("oidc_state");
  sessionStorage.removeItem("oidc_code_verifier");
  localStorage.removeItem("oidc_state");
  localStorage.removeItem("oidc_code_verifier");

  if (!code || state !== savedState || !codeVerifier) return null;

  const res = await fetch("https://sockeyegames.org/api/oidc/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "your-game-id",     // ← replace with your game's client_id
      code,
      redirect_uri: window.location.origin + "/callback",  // must match what you used in step 2
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json() as { access_token: string; expires_in: number };
  return data.access_token;
}
```

### Step 4 — Save and load game progress

Use `Authorization: Bearer <access_token>` on all progress API calls.

```typescript
const HUB = "https://sockeyegames.org";
const GAME_ID = "your-game-id"; // ← replace with your game's client_id

async function loadProgress(token: string): Promise<unknown | null> {
  const res = await fetch(`${HUB}/api/progress/${GAME_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json() as { blob: unknown };
  return data.blob;
}

async function saveProgress(token: string, blob: unknown): Promise<boolean> {
  const res = await fetch(`${HUB}/api/progress/${GAME_ID}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blob }),
  });
  return res.ok;
}
```

## When to Show Sign-In UI

On game load, check if you have a stored access token and it's not expired. If not:
- Show a "Save progress" button or banner — **do not** auto-redirect.
- When the user clicks it, call `startSignIn()`.
- After the callback and token exchange, store the token (e.g. `localStorage`).

**Token expiry:** access tokens are valid for 1 hour. Store the expiry time alongside the token. Re-authorize silently if the session cookie is still valid (the authorize endpoint will skip sign-in and redirect straight back with a new code).

```typescript
function storeToken(token: string, expiresIn: number) {
  localStorage.setItem("sockeye_token", token);
  localStorage.setItem("sockeye_token_exp", String(Date.now() + expiresIn * 1000));
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("sockeye_token");
  const exp = Number(localStorage.getItem("sockeye_token_exp") ?? 0);
  if (!token || exp < Date.now() + 60_000) return null; // expire 1 min early
  return token;
}
```

## Error Cases

- `400 { error: "Select a kid profile first" }` — The parent hasn't selected a kid profile on the hub. Show a message: "Please visit [sockeyegames.org](https://sockeyegames.org) to set up a kid profile, then try again."
- `401 { error: "Unauthorized" }` — Token is missing or expired. Re-authorize.
- `413 { error: "blob too large" }` — Save data exceeds 500KB. Compress or reduce save data.

## Local Development

For local development of a game (typically on `http://localhost:5177`; ImmuniTD uses `http://localhost:5190`):

1. Run the hub locally: `bun run dev:pages` (in the sockeye-games-hub directory) — API runs on `http://localhost:8788`.
2. Set `redirect_uri` to `{origin}/callback` (e.g. `http://localhost:5190/callback`). Those localhost ports are in the allowed list.
3. Point your OIDC calls at `http://localhost:8788` instead of `https://sockeyegames.org` (e.g. `VITE_SOCKEYE_HUB_URL`).
4. The hub in dev mode returns `devVerifyUrl` in the magic-link response — no email needed, just open the URL.

## Native (Capacitor / iOS)

Games wrapping in Capacitor run at `capacitor://localhost` (iOS) or `http://localhost` (Android). Session cookies on `sockeyegames.org` cannot be sent from those origins, so native **must** use this OIDC Bearer flow. Do not call `/api/progress` with `credentials: "include"` from a native shell.

- **Use a per-app redirect scheme**: `org.sockeyegames.{your-game-id}://callback`. Every client also allows `capacitor://localhost`, but that string is identical for every Capacitor app — routing a callback to it means registering `capacitor` in `Info.plist`, and two Sockeye games installed side by side would both claim it. Prefer the per-app scheme.
- **Open the authorize URL with `ASWebAuthenticationSession`**, not `@capacitor/browser`. Two reasons: it intercepts its `callbackURLScheme` without any `Info.plist` registration, and it shares Safari's cookie jar — which is what makes the hub's silent re-authorize work when the access token expires. `SFSafariViewController` (what `@capacitor/browser` opens) shares no cookies, so every expiry becomes another magic-link email.
- Do **not** set `prefersEphemeralWebBrowserSession`. It throws away the cookie that makes re-authorize silent.
- Persist PKCE `code_verifier` and `state` in `localStorage` or `@capacitor/preferences`, not sessionStorage alone: the authorize step may outlive the WebView's session storage.
- **Access tokens belong in the Keychain**, not `localStorage` and not `@capacitor/preferences` (which is `UserDefaults`, unencrypted).
- Token and progress calls stay `Authorization: Bearer`. CORS already allows `capacitor://localhost` and `http://localhost`.
- When Capacitor is not present, `location.assign` plus the web callback is enough.

### Reference implementation

Two games ship this today, and the files are vendored copies of each other —
copy them rather than writing a third version, and keep the copies in step:

| Piece | Doctor You | Final Quest |
| --- | --- | --- |
| Platform seam | `src/game/authPlatform.ts` | `src/auth/authPlatform.ts` |
| PKCE client | `src/game/account.ts` | `src/auth/account.ts` |
| Native half | `src/game/nativeAuth.ts` | `src/auth/nativeAuth.ts` |
| Swift plugin | `ios/App/App/NativeAuthPlugin.swift` | same path |
| Plugin registration | `ios/App/App/MainViewController.swift` | same path |

Only three things are game specific: the callback scheme, the storage-key
prefix, and the client id / save endpoint defaults. Everything else is
identical.

Two details that are easy to get wrong:

- **The plugin is registered by hand.** `capacitor.config.json` is generated by
  `cap sync` from installed npm plugins, and this one lives in the app target,
  so `MainViewController` calls `bridge?.registerPluginInstance(...)` in
  `capacitorDidLoad()`. `Main.storyboard` must point at `MainViewController`
  (custom module `App`), not `CAPBridgeViewController`.
- **The callback scheme is not the bundle id.** A bundle id may not contain a
  hyphen, so a game whose id has one — `final-quest` — has
  `appId: "org.sockeyegames.finalquest"` and
  `callbackURLScheme: "org.sockeyegames.final-quest"`. `callbackURLScheme` is a
  plain string matched literally, and the hyphenated form is what this hub
  allow-lists. Do not "fix" the mismatch.

### Switching kid profiles on native

`PUT /api/profiles` updates the **session row**, and a Bearer client has no session. The active profile is a claim baked into the access token at authorize time, so on native, switching profiles means running the authorize flow again rather than calling that endpoint. `GET /api/oidc/userinfo` returns `profile_id`, `profile_name`, and the full `profiles` list, so a game can still show who is signed in and who else exists.

**Re-authorizing on its own does not switch profiles.** `/api/oidc/authorize` reads `session.activeProfileId` from the hub session, there is no `prompt` parameter, and the shared Safari cookie jar makes the second authorize silent — so it hands back the same profile. The parent has to change who is playing **on the hub** first; the game's re-authorize then picks up the new claim.

So an in-app profile switcher does not belong on a Bearer session. Ask `canSwitchProfile()` rather than sniffing the platform (a web player who signs in through PKCE is in the same position), and when it is false, show who is playing and point at the hub. Both shipped games do exactly this.

## No-Auth Fallback

Games are not required to use OIDC. Local saves (e.g. `localStorage`) are always acceptable as a fallback when the user is not signed in. Show sign-in as an optional feature, not a gate.
