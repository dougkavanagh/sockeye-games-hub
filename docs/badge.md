# Sockeye Games badge — embed in game sites

Affiliate/backlink badge for the individual game sites (`*.sockeyegames.org`)
to link back to the hub at `https://sockeyegames.org`. Plain SVG + `<a>` tag,
no JS, no build step — drop it in a game's footer.

Assets live in this repo at `public/badge/` and deploy as static files:

- `https://sockeyegames.org/badge/sockeye-games-badge-dark.svg` — dark pill
  (deep-teal background), for placing on light game backgrounds.
- `https://sockeyegames.org/badge/sockeye-games-badge-light.svg` — light pill
  (ice background), for placing on dark game backgrounds.

Both are 224×56 (scales cleanly; height 40–72px looks good).

## Embed snippet

```html
<a
  href="https://sockeyegames.org"
  target="_blank"
  rel="noopener"
  aria-label="Sockeye Games — free educational games"
>
  <img
    src="https://sockeyegames.org/badge/sockeye-games-badge-dark.svg"
    alt="Sockeye Games"
    width="224"
    height="56"
  />
</a>
```

Swap `-dark.svg` for `-light.svg` on dark game backgrounds.

To size it down in a footer, just override width/height (SVG scales without
distortion), e.g. `width="168" height="42"`.
