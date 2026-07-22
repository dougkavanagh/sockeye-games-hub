# Sockeye Games badge — embed in game sites

Affiliate/backlink badge for the individual game sites (`*.sockeyegames.org`)
to link back to the hub at `https://sockeyegames.org`. Plain SVG + `<a>` tag,
no JS, no build step — drop it in a game's footer.

Assets live in this repo at `public/badge/` and deploy as static files:

- `https://sockeyegames.org/badge/sockeye-games-badge-dark.svg` — dark pill
  (deep-teal background), for placing on light game backgrounds.
- `https://sockeyegames.org/badge/sockeye-games-badge-light.svg` — light pill
  (ice background), for placing on dark game backgrounds.

Both are 248×56 (scales cleanly; height 40–72px looks good). The fish icon is
the `badge-mark` fal.ai generation (see below), baked in as a base64 data URI
— each SVG is fully self-contained, no external image request. (A relative
`<image href="mark.png">` was tried first but browsers don't reliably load
external subresources inside an SVG rendered via `<img>` — it silently
renders blank. Data URI avoids that.)

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
    width="248"
    height="56"
  />
</a>
```

Swap `-dark.svg` for `-light.svg` on dark game backgrounds.

To size it down in a footer, just override width/height (SVG scales without
distortion), e.g. `width="186" height="42"`.

## Regenerating the icon

The `badge-mark` task in `scripts/generate-brand-images.ts` (run via
`bun run generate:brand-images`) generates a fresh sockeye icon tuned for
small sizes — flat, sticker-style, high contrast — and saves it to
`public/images/badge-mark.png`. To rebuild the badges after regenerating:

```bash
magick public/images/badge-mark.png -trim +repage -resize 216x108 /tmp/icon.png
B64=$(base64 -i /tmp/icon.png | tr -d '\n')
# splice into the <image href="data:image/png;base64,$B64"> in both SVGs
```
