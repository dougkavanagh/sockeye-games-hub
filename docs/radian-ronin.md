# Radian Ronin — prototype one-pager

**Status:** concept lock for Babylon.js / TypeScript prototype  
**Tone:** Final Quest energy — adventure, stakes, mastery — kinetic blade/turn/snap loops  
**Age:** ~9–13 core; harder cuts extend older without a separate product  
**Sibling idea (later):** Angle Forge / kitchen craft as a spin-off or optional Hearth Road region — not v1

---

## Pitch

A wandering geometry ronin walks the Circle Path. Measure itself was shattered. Restore order by cutting, turning, and aligning. Formal vocabulary is earned lore, not HUD homework.

**Hook:** *The circle is broken. Cut it true.*

**Subtitle options:** Cut the circle true · Measure by the blade · The Circle Path

---

## Locked story defaults

| Choice | Lock |
| --- | --- |
| Exile sin | Refused to teach **false measure** — the Order wanted “close enough”; you wouldn’t lie about the cut |
| Blade | Silent tool that **hums** when a cut/turn is true (audio + subtle mesh vibrate) |
| “Ninja” in copy | Almost never — ronin, blade, path, oath, clan, Order of the Arc |
| Split games | **Ronin only for v1**; Forge/kitchen parked |

### Myth spine

- The **Measure Lords** broke the circle so nothing closes: roads don’t meet, stars won’t lock, turns never finish.
- You were cast out of the **Order of the Arc** for refusing false measure.
- Your blade doesn’t kill; it **cuts truth**. Wrong cuts scar the arena; true cuts restore a sector of the map.
- **Twin Pies** (lore name for 2π): two half-turn wedges that must reunite before the Fullturn Gate opens.

### Regions (curriculum as places)

| Region | Ideas |
| --- | --- |
| Cornerlands | Right angles, complementary pairs |
| Twin Paths | Parallel lines, transversals (light) |
| Fullturn Gate | 360°, one turn, π / 2π via Twin Pies |
| Starfall | Sectors, symmetry, equal opposite pieces |

---

## Core loop

1. Enter a shattered arena (Babylon scene).
2. Read the **oath** (win condition in plain language).
3. Act: slash / rotate / stack / align — physics + snap.
4. World repairs; optional lore scrap unlocks the formal name.
5. Short session; boss-lite later (timed multi-cut or unstable gate).

---

## Prototype: first 3 puzzles

Ship these before meta/map polish.

### 1. Cornerlands — Chop the pie

- **Scene:** Low stone courtyard; a large pizza (or flat disc) on a cutting block; blade cursor/plane.
- **Oath:** “Make a corner and two matching slices — leave the rest as one piece.” (90° + 45° + 45° + 180°)
- **Mechanic:** Click to place cut rays; wedges snap to discrete angle steps (e.g. 15°).
- **Win:** Sector angles match target multiset; disc reassembles with a clean right-angle mark.
- **Teach after win:** “Those two small slices are partners to the corner — complementary.”

### 2. Starfall — Split the star

- **Scene:** Floating shuriken / star polygon above a rift; pieces drift when wrong.
- **Oath:** “Split the star so opposite points match.”
- **Mechanic:** Choose cut lines through center; rotate a piece to test symmetry.
- **Win:** Opposite sectors equal (or sum pairs to 180° on the chosen difficulty).
- **Teach after win:** Sector / opposite angles as “matched blades.”

### 3. Fullturn Gate — Twin Pies

- **Scene:** Broken circular gate; two half-disc “pies” on pedestals; gate runes show a full ring outline.
- **Oath:** “Stack the twin pies. Close the turn.”
- **Mechanic:** Pick up / rotate half-discs; stack or join along diameters so they form one full disc; optional dial showing degrees → introduce “half turn” then “π” as lore glyph.
- **Win:** Full circle complete; gate opens; blade hums.
- **Teach after win:** One full turn = 360° = two half-turns = **2π** (Twin Pies reunited).

---

## Babylon scene list (v1 vertical slice)

| Scene ID | Purpose |
| --- | --- |
| `boot_dojo` | Title / “walk the path” start; load blade mesh |
| `cornerlands_pie` | Puzzle 1 |
| `starfall_shuriken` | Puzzle 2 |
| `fullturn_twin_pies` | Puzzle 3 |
| `path_map` (stub) | Simple node map unlocking the three; repair VFX between nodes |

**Shared systems:** cut-plane tool, snap-to-angle, win checker (angle multiset / symmetry / full turn), blade-hum feedback, oath UI, lore scrap modal.

---

## Difficulty stretch (same verbs)

| Band | Twist |
| --- | --- |
| ~9–11 | Degrees, corners, half/full turns |
| ~11–13 | Complementary language, light transversals on Twin Paths |
| ~13+ | Radians first-class; compose turns; sector constraints |

---

## Out of scope for first prototype

- Full open world, combat HP, multiplayer
- Kitchen / Angle Forge as separate app
- Heavy “ninja” branding or Fruit Ninja fruit-spam
- Worksheet-style multiple choice

---

## Hub listing

- **id:** `radian-ronin`
- **tagline:** Cut, turn, and align your way through a broken circle.
- **status:** soon (no public URL until subdomain exists)

## Prototype repo

Independent game repo (Sockeye convention):

```bash
cd ../radian-ronin
bun install
bun run dev   # http://localhost:5178
```

Vertical slice: boot → path map → three puzzles (Chop the pie, Split the star, Twin Pies), `localStorage` progress, blade-hum Web Audio.

**Status:** on hold while **Pizza Perfection** (`../pizza-perfection`) explores a clearer kitchen / order-ticket loop.
