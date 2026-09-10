# Zombie Canyon — prototype one-pager

**Status:** early preview at [zombie-canyon.sockeyegames.org](https://zombie-canyon.sockeyegames.org); repo `dougkavanagh/zombie-canyon`  
**Tone:** whimsical-spooky — Pharoah's Tomb neighbourhood, not horror; shambling comedy zombies, bloodless failure  
**Age:** ~8–13 core; Act 5 (rates → accumulation) extends to ~16 without a separate product  
**Source:** the classic bridge riddle — 4 crossers at 1/2/5/10, one lantern, bridge holds 2, pace of the slower. Intuitive escort schedule = 19; optimal = **17**.

---

## Where it went — the rebuild, 2026-09-09

Everything below the next divider is the record of the **first** build: a
trip-queue planner scored with stars. It played too easily and did not feel
enough like a game, so the loop was replaced. That build is frozen in
`../zombie-canyon-v1` at its `v1-planner` tag and is not published. The
sections that follow are kept because the measurements in them still hold —
the design they describe does not.

The loop now is:

| Piece | What it does |
| --- | --- |
| **Brains** | The dead stop to eat, so a brain buys a fixed block of minutes. Thrown up front, before anybody moves, and every one kept is a point. A deadline was a pass mark that could be cleared sloppily; a price has no "good enough". The block size makes it a division with a remainder, not a subtraction. |
| **One irreversible move, first** | No topping up. That is what licenses the rest being fluid — a player directing sprites with feedback would be trial and error, except the estimate has already been paid for. |
| **Concurrency** | The lantern and the wire are separate resources running at once, so a rider costs nothing extra while the bridge is busy. A schedule became a makespan rather than a sum; the wire level dropped from 12 minutes to 8 on that alone. |
| **A horde that crosses the bridge** | The span is a place, not a duration. Being a step from safety is survivable and being on the near ledge is not, so *fastest is no longer safest*. |
| **Play, pause, direct** | Time moves only while playing and the run pauses itself whenever something lands, so a decision is made at the moment it matters. Thinking stays free. |

### What the horde did to the answers

Giving the dead their own crossing time changed which schedule is correct, not
merely how it is scored. Both they and a crosser move at a steady rate, so the
gap between them is linear and can only close at an end — two comparisons,
exact:

- Leaving near→far is safe if you are off the ledge before they reach it *and*
  across before they would be.
- Walking back is safe only if it is over first.
- The wire is not the bridge, so a rider is out of reach.

On the canyon level this inverts the riddle's own lesson. Pairing the two
slowest crosses in **17 minutes and loses** — it leaves two people waiting on
the near ledge until minute 15, and the horde arrives at 14. The plodding
19-minute shuttle empties that side by minute 9 and lives.

Feasibility can no longer be written as a total, because a schedule can be
legal at one brain count and impossible at a lower one for reasons unrelated
to its length. The solver is asked directly, one brain at a time.

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
| Commit step | Player composes the whole schedule paused. The planner shows **no costs and no total** | Overturned 2026-09-08. A live readout means the player never performs the sum, and makes retrying free — a plan can be tuned against the number without ever being run. Hiding it makes every test cost a run |
| Scoring | **Margin**, not pass/fail — 3 stars requires optimal | Sufficient-but-sloppy must not feel like winning, or greedy-vs-optimal never lands |
| Calling the time | Predicting the total before committing is an **opt-in bonus**, never a gate | A required prediction is friction exactly where a maths-averse child bounces. It never subtracts, and is tracked apart from stars |
| Playback | **Real time and proportional** — one minute is a fixed span, so slow crossers take longer to watch | The cost of a bad pairing should be felt, not read. This is what carries the lesson now that the numbers are hidden |
| Thinking time | Always free; only in-fiction time counts | No timer on the planning screen, ever |
| Failure | Bloodless — lantern gutters out, bridge drops, someone stranded and waving | Protects the hub's safe / home-first positioning |
| Modifiers | One new modifier per act; combine only in the act finale | Lantern + zip line + jet pack at once is noise, not difficulty |

---

## Core loop

1. **Read the canyon.** Crossers with their times, the lantern, the bridge, and the horde bar.
2. **Plan.** Drag characters into trip slots. Each trip auto-costs at the slower crosser's pace.
3. **Optionally call it.** Say how long you think it will take, for a bonus. Skippable.
4. **Go.** Watch it run in real time: crossers walking at their own pace, the lantern dragging its light, the horde closing on the same clock. Each trip's cost is revealed only as it lands.
5. **Score on margin.** Minutes to spare → stars. Retry is cheap, but only optimal is three stars.

The countdown *is* the pedagogy. The horde is a physical position closing on the bridge, not a number in a corner.

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

| Act | Math | Mechanic | State |
| --- | --- | --- | --- |
| 1 | Addition, `≤`, then optimisation | Fixed times, one lantern, capacity 2, ending on the riddle itself. | **Built** |
| 2 | Constraints, and rates — `t = d ÷ v` | Weight limit, then the zip line, then both. | **Built** |
| 3 | Budgets / allocation | Jet pack with N fuel; cost = weight × distance. Kid-scale linear programming. | Next |
| 4 | Accumulation | Roller-skate ramp. The skater accelerates; the question is *when to release*. Velocity graph in the HUD — area under it is distance. Calculus done honestly, not as a label. | Later |

The riddle landed in Act 1 rather than Act 2, so everything after it moved up
one. Acts 1 and 2 are six levels total.

---

## Does it scale past the riddle? — measured, 2026-09-08

`scripts/level-gap.ts` in the game repo enumerates candidate levels and
compares the intuitive "fastest crosser ferries everyone" schedule against the
searched optimum. Across ~2,500 distinct configurations:

| Bridge capacity | Intuitive answer already optimal | Gap of 2+ minutes |
| --- | --- | --- |
| Holds 2 | 29% | **59%** |
| Holds 3 | 80% | **10%** |

Three conclusions:

1. **No shortage of material.** Hundreds of buildable capacity-2 levels have a
   real gap.
2. **But it is one idea, repeated.** Every widest-gap configuration has the
   same shape — two fast crossers, several slow — and the same insight. Levels
   multiply; the lesson does not. A player who pattern-matches at level 3 has
   finished every capacity-2 bridge that will ever be built.
3. **Widening the bridge is a dead lever.** At capacity 3 the intuitive answer
   is already optimal 80% of the time and the puzzle evaporates.

So Act 2 has to change the **cost function**, not the numbers. The two cheapest
tests are the zip line (cost becomes distance ÷ speed) and a bridge weight
limit, which forbids pairing the two heaviest and so attacks the memorised rule
directly. Both are small on top of the existing solver, which already
generalises.

A side finding worth keeping: 29% of casually-chosen capacity-2 levels teach
nothing at all. Every authored level gets checked against the solver first.

---

## Act 2 — what the measurement changed

Act 2 exists to stop Act 1's rule ("pair the two slowest") transferring, since
a player who pattern-matches has stopped doing arithmetic. Two mechanics, and
the solver decided how to use them.

### The weight limit is a constraint, not an optimisation

A binding weight limit makes the memorised pairing illegal — which is the
point — but it does not create a new puzzle in its place. Measured over the
levels where the limit actually costs time, the fallback shuttle is **already
optimal 74%** of the time. And with four crossers on a two-person bridge the
result is absolute: a search over 60,000 configurations found **no** level
where the slow-pairing is illegal *and* an optimisation gap survives. There are
only two families of good schedule at that size, so banning one settles it.

So `a2-l1` is deliberately a constraint beat with no gap — check before you
pair — and the gap returns at five crossers, where it does exist.

### The zip line is the one that scales

Ride time is `distance ÷ speed`, and speed comes from weight. That inverts the
whole of Act 1: on the bridge heavy-and-slow is what you dread, on the wire it
is what you want. Granny Vex walks in 10 minutes and rides in 4. A memorised
rule cannot survive a mechanic that reverses the sign of its own input, which
is exactly why this is the direction Act 3 should keep going: change the cost
function, never the numbers.

### The finale needs both

`a2-l3` — five crossers, a weight limit, one run on the wire:

| Plan | Minutes |
| --- | --- |
| Ignore the wire, shuttle with the fastest | 26 — **caught** |
| Zip the wrong person | 20 |
| Zip the heaviest, then shuttle | 21 |
| Zip the heaviest, then pair the slow remainder | **18 — three stars** |

The deadline is 24, so the only plan that actually fails is the one that
ignores both mechanics.

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
- **tagline:** Buy the time you need with brains, and not a minute more — then get everyone across before the dead do.
- **skills:** Optimization, scheduling, rates, division
- **status:** soon (no listing until a playtest says the loop holds a child)

## Repo

`dougkavanagh/zombie-canyon`, private, a peer of the other game repos.

```bash
cd ../zombie-canyon
bun install
bun run dev        # http://localhost:5182
bun test test/     # the solver — the load-bearing piece
```

The frozen first build is `../zombie-canyon-v1` (tag `v1-planner`), local only
and deliberately not pushed.

Still outstanding before this can be listed: the Workers project is named
`zombie-canyon-v2`, so the live URL does not match the family pattern, and
there is no `sockeyegames.org` subdomain. Both are a rename away and neither
is worth doing before a playtest.
