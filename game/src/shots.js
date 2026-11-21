// shots.js — deterministic states for screenshots, driven by URL query.
// ?shot=start        title screen
// ?shot=play         level 1 mid-game: 3 found with rings, 4 remaining
// ?shot=play2        level 3 (hard) mid-game: 4 found, 4 remaining
// ?shot=end          win screen with stats
// &seed=N is accepted for parity with the kit starter (scenes are seeded
// per level, so the seed is informational only).

export function applyShot(state, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  if (shot === 'start') {
    state.toMenu();
  } else if (shot === 'play') {
    state.startLevel(0);
    [0, 1, 4].forEach((i) => state.found.add(i));
    state.score = 700;
    state.levelScores[0] = 700;
    state.combo = 3;
    state.hits = 3;
    state.clicks = 4;
    state.timeLeft = 132;
    state.timeUsed = 48;
  } else if (shot === 'play2') {
    state.startLevel(2);
    [0, 2, 3, 6].forEach((i) => state.found.add(i));
    state.score = 1500;
    state.levelScores[2] = 1500;
    state.combo = 4;
    state.hits = 4;
    state.clicks = 6;
    state.timeLeft = 74;
    state.timeUsed = 46;
    state.hintsLeft = 2;
  } else if (shot === 'end') {
    state.startLevel(0);
    state.level.diffs.forEach((d, i) => state.found.add(i));
    state.score = 2400;
    state.levelScores[0] = 2400;
    state.hits = 8;
    state.clicks = 9;
    state.timeLeft = 61;
    state.timeUsed = 119;
    state.bestCombo = 5;
    state.status = 'won';
    state.emit('won', state.summary());
  } else {
    return false;
  }
  return true;
}
