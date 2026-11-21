# spot-the-difference-game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jxjxjsj857-alt/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/jxjxjsj857-alt/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Spot the Difference — three hand-drawn scenes, eight tiny changes each. Two pictures side by side, one quietly altered: find every difference before the timer runs out. All art is drawn procedurally on canvas by the game's own code — no images, no network requests, no copied assets. Sounds are synthesized with WebAudio.

## Run it

```sh
# serve the static files (any static server works), then open http://localhost:8080
python3 -m http.server 8080 --directory game
# or: npx serve game
```

## The levels

1. **Lantern Night Market** (Easy, 3:00) — warm lanterns, busy stalls, a cat on the ground.
2. **Koi Pond Garden** (Medium, 2:30) — still water, drifting koi, a stone lantern.
3. **Midnight Observatory** (Hard, 2:00) — dark glass, a ringed planet, glowing mushrooms.

## How to play

- Click a difference on **either** picture. Found ones get a gold ring, a sparkle and a chime.
- A wrong click costs 5 seconds and resets your combo. Every find earns points (combo multiplier up to x5) and +5 seconds.
- **H** — hint (3 per level, 8s cooldown, pulses on an unfound difference).
- **1 / 2 / 3** — jump to a level · **R** — restart · **Esc / P** — pause · **M** — mute.
- Run out of time and the level fails — retry keeps the differences you already found.

## Files

- `game/index.html`, `game/styles.css` — page and styling
- `game/src/main.js` — bootstrap, HUD, overlays, main loop
- `game/src/config.js` — levels and difference data
- `game/src/scenes.js` — procedural scene drawing (all the art)
- `game/src/render.js` — panels, rings, sparkles, hint pulse
- `game/src/state.js` — game state, timer, score, hints
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/shots.js` — deterministic screenshot states (`?shot=start|play|play2|end`)
- `main.ts` — entry program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the game (cover first)

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
