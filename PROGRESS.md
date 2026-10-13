# SHATTERLINE — Progress Log

## How to work on it
* Edit `src/*` (sections, concatenated in name order), then `node tools/build.js` → regenerates `index.html` (the deliverable, committed).
* Tests (Playwright, headless Chromium; `NODE_PATH=$(npm root -g)`; screenshots go to `$OUT`, default `./shots`, git-ignored):
  * `node tools/test.js smoke 20` — load, start run, bot plays in real time, screenshots, console errors.
  * `node tools/test.js run N` — turbo bot full run (`GOD=1`, `CHAR=`, `SEED=`); logs room transitions, stalls (with enemy dump), death recap.
  * `node tools/test.js scene N` — real-time capture of a configured fight (`BIOME`, `NODE=boss|elite…`, `UPGS=a,b`, `WEAPON`, `CHAR`, `TAG`).
  * `node tools/test.js stress` — 300 enemies + 1000 bullets, timings.
  * `node tools/fuzz.js` — every weapon, character, active item, room type, all 5 bosses, all-upgrades builds per weapon, and all-pacts runs, bot-driven; reports exceptions.
* In-game debug: F3 FPS/timings + director stress graph, F4 AI action/role/token labels + A* paths, F5 flow field, F6 hitboxes. `window.SL` exposes test hooks.

## Milestones
| | Status | Notes |
|---|---|---|
| M1 loop/input/movement/dash/weapon/enemy/juice/SFX | ✅ | 120 Hz fixed step, interpolated render, hitstop, trauma shake, graze system |
| M2 AI framework + enemies | ✅ | 17 archetype brains, utility selection, flow field, A* service, tactician, director |
| M3 rooms/gen/map/biome 1 + boss | ✅ | 11 templates + boss arena, seeded variation, doors, hazards, branching map |
| M4 upgrades/synergies/characters/shop | ✅ | 97 upgrades, 24 synergies, 5 characters, 8 actives, shop/treasure/rest/events |
| M5 adaptive music, sound pass, post FX | ✅ | 4 themes × 5 stems, beat-quantised stingers, WebGL bloom/CA/CRT/low-HP grade |
| M6 remaining biomes/bosses, meta, UI | ✅ | 4 biomes/bosses, unlocks, boosts, achievements, codex, history, daily/custom seeds, heat 1–10 |
| M7 balance/perf/bugs | ✅ (first pass) | see below |
| M8 playtest feedback round 1 | ✅ | proc coefficients + adaptive threat (fixes flamer+missile steamroll), regen + heal sources, 35 new upgrades incl. 13 legendaries with fanfare, 13 rule-changing pacts, 5th biome + Hollow Choir boss, 11 new enemies in themed squads, art overhaul |

## Verification results (latest)
* Fuzz: 0 exceptions across all weapons/characters/actives/rooms/5 bosses/all-upgrade builds/all-pact runs.
* God-mode bot completes a full run (5 biomes + The Architect → victory summary in ~11 sim-minutes), 0 console errors.
* Balance harness (cluster of 6): Pyromancer flamer + missile pod + swarm 1072 → 429 DPS; flamer+static+capacitor+ball 1011 → 614.
* Non-god bot (crude dodging) reliably clears biome 1 rooms and sometimes boss 1; deaths come from dense boss patterns.
* Stress (256 enemies + ~1060 enemy bullets): sim ≈ 1.5 ms/tick (≈3 ms/frame at 60 fps). JS render ≈ 8 ms under
  SwiftShader software GL (dominated by rasterisation that is GPU-side on real hardware).
* Every SFX recipe offline-rendered: non-silent, no NaN, peaks within limiter range. Music sequencer + stem ramps verified.

## Accessibility: no audio-only cues
Every gameplay sound has a visual twin (wind-up glow + ground telegraphs, sniper laser sights, mortar circles, fuse rings,
blink markers, spawn portals, hazard flicker, PERFECT/OVERHEAT/EMPTY/RUSH!/PHASE text, ability-ready pulse, HP-bar heartbeat,
armor sparks). Settings → Video & Accessibility → **Visualize sound cues** adds directional captions for important sounds
(`CUE_LABEL` in `03_audio.js`); it switches on automatically when master/effects volume is 0 or audio is unavailable.

## Key design decisions
* Single file built from `src/` sections — keeps the required section order while staying editable.
* Canvas 2D scene + WebGL post pass (bloom threshold/blur, chromatic aberration, desaturation, vignette, CRT); falls back to 2D.
* Actors (enemies, player) are drawn *after* the lightmap so combatants stay crisp; environment stays moody.
* Enemy bullets are cached sprites with a dark rim (readability on any background); player bullets are batched streaks.
* Upgrade descriptions are generated from the same stat rows that are applied → tooltips are always exact.
* Synergies auto-activate (two families ≥2 picks) with a toast + stinger; build overview shows progress toward them.
* Gameplay timers run in sim time (`addTimer`), so slow-mo/hitstop/pause never desync logic.

## Tuning notes
* Explosions from barrels/Ticks hurt the player for at most `T.room.selfBlast` (18) — full damage to enemies.
* Hazards: electric floor / spikes 12 per hit; lava 11 per 0.8 s (i-frames).
* Enemy HP × `T.scale.hp` per biome [1, 1.5, 2.2, 3.1, 4.2] × adaptive `run.perf` (0.85–1.9); damage × [1 … 1.5].
* Rarity cap per sector `T.rarCap` (elite/challenge +1; boss and chests uncapped, boss guarantees a legendary choice).
* Boss bullet and laser damage scale with the biome factor. Prism Warden HP 2600, Hollow Choir 6200.
* Director budget: `17 + 3.2×layer`, ×1.42 per biome, ×1.5 elite rooms, spent as themed squads; waves ≈ 34 % of budget; BUILD→PEAK (stress > .72)→RELAX.
* Anti-stall: any walker without LOS on the player for 5 s switches to a flow-field hunt.
* Telegraphs (`TELE`) tick in sim time alongside the timers they warn about.

## Known issues / ideas for next session
* Balance is bot-informed; a human playtest pass on boss 2–4 pattern density and late-biome enemy HP is the next step.
* Gamepad UI navigation is spatial-nearest; works on all screens but the settings sliders need mouse/keyboard to adjust.
* Bot (tests only) does not use shops and plays bows/flamers conservatively.
