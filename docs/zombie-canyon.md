# Zombie Canyon — prototype one-pager

**Status:** Act 1 slice built in `../zombie-canyon`; validate the planning loop before art or 3D  
**Tone:** whimsical-spooky — Pharoah's Tomb neighbourhood, not horror; shambling comedy zombies, bloodless failure  
**Age:** ~8–13 core; Act 5 (rates → accumulation) extends to ~16 without a separate product  
**Source:** the classic bridge riddle — 4 crossers at 1/2/5/10, one lantern, bridge holds 2, pace of the slower. Intuitive escort schedule = 19; optimal = **17**.

---

## Pitch

The horde is coming up the canyon. Your people are on the wrong side of a rope bridge, there is one lantern, and the bridge holds two. Work out the schedule before you commit to it — then watch it play out with the dead closing in.

**Hook:** *Do the math. Then run.*

**Subtitle options:** Count before you cross · One lantern, four friends, no time · The math is the only way out

---

## The real subject

Not "crossing a bridge" — **scheduling under a deadline**, and specifically the gap between the greedy answer and the optimal one. Sending the fastest crosser back as escort every time *feels* right and loses by two minutes. That gap is the whole lesson, and it is a domain that scales for years.

It also fills a genuine hole in the lineup: Pizza Perfection has measurement, Final Quest has broad STEM, nothing on the hub teaches **optimization**.

---

## Locked design defaults

| Choice | Lock | Why |
| --- | --- | --- |
| Time model | **Plan-then-run**, never real-time | Real-time converts a math puzzle into a reflex game; kids brute-force by retrying and the math evaporates |
| Commit step | Player composes the whole schedule paused, sees the predicted total **before** hitting Go | Makes it an inequality to solve, not a guess to resubmit |
| Scoring | **Margin**, not pass/fail — 3 stars requires optimal | Sufficient-but-sloppy must not feel like winning, or greedy-vs-optimal never lands |
| Thinking time | Always free; only in-fiction time counts | No timer on the planning screen, ever |
| Failure | Bloodless — lantern gutters out, bridge drops, someone stranded and waving | Protects the hub's safe / home-first positioning |
| Modifiers | One new modifier per act; combine only in the act finale | Lantern + zip line + jet pack at once is noise, not difficulty |

---

## Core loop

1. **Read the canyon.** Crossers with their times, the lantern, the bridge, and the horde bar.
2. **Plan.** Drag characters into trip slots. Each trip auto-costs at the slower crosser's pace.
3. **Check.** A predicted timeline bar renders directly against the horde arrival bar — the inequality, drawn.
4. **Go.** Watch it run: lantern swinging, boards creaking, zombies closing.
5. **Score on margin.** Seconds to spare → stars. Retry is cheap, but only optimal is three stars.

The countdown *is* the pedagogy. Draw the horde as a physical position on the same axis as the plan, not as a number in a corner.

---

## The cut-the-bridge mechanic

Better than it first looks. It adds a second term **and** an allocation cost:

```
T_cross + T_cut  ≤  T_horde
```

The cutter has to be on the far side, and is busy while others cross — so cutting trades directly against carrying capacity and against who is where. That turns pure addition into resource allocation. Worth introducing early (Act 2) and keeping.

---

## Curriculum spine: everything is `d = r × t`

One concept, escalating. This is what makes the game card's skills line honest rather than decorative.

| Act | Math | Mechanic |
| --- | --- | --- |
| 1 | Addition, `≤` | Fixed times, one lantern, capacity 2. Beat the clock. |
| 2 | Optimization — greedy vs. optimal | The actual riddle. Margin scoring and bridge-cutting introduced here. |
| 3 | Rates — `t = d / v` | Zip line. Weight changes speed, so speed stops being a given number and becomes something you compute. |
| 4 | Budgets / allocation | Jet pack with N fuel; cost = weight × distance. Kid-scale linear programming. |
| 5 | Accumulation | Roller-skate ramp. The skater accelerates; the question is *when to release*. Velocity graph in the HUD — area under it is distance. Calculus done honestly, not as a label. |

---

## Prototype: first 3 levels

Ship these flat, before art, before any 3D.

### 1. Two friends, one lantern

- **Setup:** 2 crossers (2, 5), horde in 8. Capacity 2.
- **Teaches:** A trip costs the *slower* crosser's time. Nothing else.
- **Win:** Any legal plan fits. Deliberately unloseable — this level teaches the UI.

### 2. Somebody has to come back

- **Setup:** 3 crossers (1, 3, 6), horde in 12.
- **Teaches:** The lantern must return, and the return trip costs time too. First level where a plan can fail arithmetic.
- **Win:** 1+3 over, 1 back, 1+6 over = 10, against a deadline of 12. Tight enough to feel, with just enough slack that a first attempt is not punished.

### 3. The canyon (the riddle)

- **Setup:** 4 crossers (1, 2, 5, 10), horde in 19.
- **Teaches:** The insight — pair the two slowest so 10 and 5 are spent *once, together*. Shuttling everyone with the fastest crosser gives 19.
- **Win:** 17. The intuitive 19 escapes with nothing to spare and scores two stars; only 17 scores three. The deadline is deliberately set so the intuitive schedule *survives* — a plan that simply lost would make this a wall rather than a lesson.
- **After win:** One line of plain language — "the slow ones should travel together, so you only pay for slow once." No formal notation.

If a tester beats level 3 by pattern-matching rather than reasoning, Act 3's zip line breaks the pattern on purpose: speeds are computed, so the memorized pairing no longer transfers.

---

## Shared systems (v1 vertical slice)

| System | Purpose |
| --- | --- |
| `trip_planner` | Drag crossers into ordered trip slots; validate capacity and lantern side |
| `schedule_solver` | Cost a plan; compute the optimal for the level to set star bands |
| `timeline_hud` | Predicted plan bar vs. horde bar on one shared axis |
| `runner` | Play the committed plan back as animation; no input during playback |
| `level_defs` | Data-driven crossers, capacity, deadline, modifiers |

The planner is HTML no matter what the scene is. Build it first.

---

## Tech call

A side-on orthographic camera over a fog-filled chasm is the right *look*, and react-three-fiber fits the hub's React 19 + Vite stack. But the game **is** the planner, and a 2D canvas/SVG scene with parallax gets ~90% of that look for ~10% of the work — and loads instantly on a school Chromebook.

**Decision:** prototype Acts 1–2 flat. Prove the loop is fun. Only then decide whether it has earned Three.js.

Save/progress follows `SAVE_STRATEGY.md` — vendored `store.ts`, keys declared in `saveKeys.ts` as `zombie-canyon.<area>.<name>`. Title screen carries the `More games` hub link per `GAME_HUB_LINK.md`.

---

## Riskiest assumption

**That an 8-year-old finds a planning screen fun.** Everything else in this doc is downstream of that. Build level 1 with no art and watch one child play it before writing another line.

---

## Out of scope for first prototype

- 3D, Three.js, any art pipeline
- Real-time movement or any dexterity input
- Acts 3–5 modifiers (zip line, jet pack, ramp)
- Lives, thinking timers, or any penalty on retry
- On-screen zombie contact — the dead never reach anyone

---

## Hub listing

- **id:** `zombie-canyon`
- **tagline:** One lantern, one bridge, and a horde on the clock — plan the crossing before you run it.
- **skills:** Optimization, rates, time budgets, logic
- **status:** soon (no listing until a playable slice exists)

## Prototype repo

Independent game repo (Sockeye convention). Act 1 is built; no Pages project
or hub listing yet.

```bash
cd ../zombie-canyon
bun install
bun run dev   # http://localhost:5181
```
