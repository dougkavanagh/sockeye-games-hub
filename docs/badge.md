# Sockeye Games badge — embed in game sites

Affiliate/backlink badge for the individual game sites (`*.sockeyegames.org`)
to link back to the hub at `https://sockeyegames.org`. Plain PNG + `<a>` tag,
no JS, no build step — drop it in a game's footer.

Assets live in this repo at `public/badge/` and deploy as static files:

- `https://sockeyegames.org/badge/sockeye-games-badge-dark.png` — circular
  seal on a dark teal face, for placing on light game backgrounds.
- `https://sockeyegames.org/badge/sockeye-games-badge-light.png` — circular
  seal on a cream face, for placing on dark game backgrounds.

Both are 312×320 transparent-background PNGs (the seal circle only, no
canvas) — a "trust seal" style badge with the wordmark, salmon mark, and a
checkmark built into the design. Curated assets, not part of the
`generate:brand-images` fal.ai pipeline — replace the files directly in
`public/badge/` if the design changes.

## Embed snippet

```html
<a
  href="https://sockeyegames.org"
  target="_blank"
  rel="noopener"
  aria-label="Sockeye Games — free educational games"
>
  <img
    src="https://sockeyegames.org/badge/sockeye-games-badge-dark.png"
    alt="Sockeye Games"
    width="120"
    height="123"
  />
</a>
```

Swap `-dark.png` for `-light.png` on dark game backgrounds. Scale
width/height together (aspect ratio 312:320) — 100–160px wide reads well in
a footer.
