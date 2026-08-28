# Sockeye Games — Hub Link Guideline

Every game should include a small, secondary link back to the Sockeye Games hub so players can discover other games.

## Behavior

- **Destination:** `https://sockeyegames.org`
- **Open:** same tab on web. On Capacitor/native, use the system browser (or the same in-app browser pattern the game already uses for hub auth).
- **Where:** home / title screen only — not pause menus, HUD, or mid-level UI.
- **Placement:** quiet corner (bottom-left or bottom-right), visually below primary Play / Continue CTAs.
- **Scope:** one link only. No games carousel, footer nav, or marketing block.

## Copy

Pick one short label:

- Preferred: **More games** with accessible name / `aria-label`: `More Sockeye Games`
- Or wordmark-style: **Sockeye Games**

Do **not** use: “Store”, “Shop”, “Premium”, “Upgrade”, or anything that implies purchase.

## Visual

- Quiet secondary control: small text link, or tiny text + optional mark — not a primary button.
- Match the game’s existing UI (fonts, colors, hover/focus). Do not import hub chrome or a new design system.
- Optional: a small sockeye mark (~16–24px) beside the label if the game already has brand assets; text-only is fine otherwise.
- Keyboard-focusable with a visible focus state. Touch target ≥ ~40px even if the glyph/text is smaller.
- Must not compete with Play / Continue / Settings. Muted opacity/color is fine as long as it still reads as clickable.

## Constraints

- No tracking, UTM spam, or third-party embeds.
- Do not change auth, save, or OIDC flows for this link.
- Keep the change minimal: one component (or a few lines on the existing title screen) using existing link/button primitives.

## Acceptance

- From the home screen, one tap/click reaches `https://sockeyegames.org`.
- Primary game actions remain visually dominant.
- Works on the game’s main targets (web; native if the repo ships Capacitor).

## Agent prompt (copy into a game repo)

```
Add a small, secondary “Sockeye Games” link on this game’s home / title screen so players can jump to the rest of the catalog.

Follow GAME_HUB_LINK.md from the sockeye-games-hub repo (or the guidelines below).

Behavior:
- Destination: https://sockeyegames.org (same tab on web; system/in-app browser on Capacitor).
- Home / title screen only; quiet corner below Play / Continue.
- One link only — no carousel, footer nav, or marketing block.

Copy:
- Preferred label: “More games” with aria-label “More Sockeye Games”
- Or: “Sockeye Games”
- Do not use Store / Shop / Premium / Upgrade.

Visual:
- Secondary text link (optional ~16–24px mark). Match this game’s UI.
- Focusable, visible focus, ≥ ~40px touch target.
- Must not compete with primary CTAs.

Constraints:
- No tracking/UTMs. Don’t touch auth, saves, or OIDC.
- Minimal change only.

Acceptance:
- One tap from home reaches https://sockeyegames.org.
- Primary actions stay visually dominant.
- Works on web (and native if this repo ships Capacitor).
```
