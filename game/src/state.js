// state.js — game state, timer, score, hints. No DOM here except through
// the callbacks main.js wires up.

import {
  LEVELS, HINTS_PER_LEVEL, HINT_COOLDOWN_MS,
  TIME_BONUS_PER_FIND, MISS_TIME_PENALTY, POINTS_PER_FIND,
} from './config.js';

export class GameState {
  constructor() {
    this.levelIndex = 0;
    this.status = 'menu'; // menu | playing | paused | won | lost
    this.found = new Set();
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintCooldownUntil = 0;
    this.hintTarget = null; // {x, y, until}
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.timeLeft = 0;
    this.timeUsed = 0;
    this.clicks = 0;
    this.hits = 0;
    this.misses = 0;
    this.sparkles = []; // {x, y, born, life}
    this.missMarks = []; // {x, y, born}
    this.levelScores = [0, 0, 0];
    this.onEvent = null; // (type, data) => void
  }

  get level() { return LEVELS[this.levelIndex]; }
  get total() { return this.level.diffs.length; }
  get remaining() { return this.total - this.found.size; }

  startLevel(i, keepFound = false) {
    this.levelIndex = i;
    const prevFound = keepFound ? new Set(this.found) : new Set();
    this.found = prevFound;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.hintTarget = null;
    this.hintCooldownUntil = 0;
    this.combo = 0;
    this.timeLeft = this.level.time;
    this.timeUsed = 0;
    this.clicks = 0;
    this.hits = 0;
    this.misses = 0;
    this.sparkles = [];
    this.missMarks = [];
    this.status = 'playing';
    this.emit('level-start', { level: this.level });
  }

  toMenu() {
    this.status = 'menu';
    this.timeLeft = this.level.time;
    this.emit('menu');
  }

  pause() {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.emit('paused');
  }

  resume() {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    this.emit('resumed');
  }

  tick(dtMs) {
    if (this.status !== 'playing') return;
    this.timeLeft -= dtMs / 1000;
    this.timeUsed += dtMs / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.status = 'lost';
      this.emit('lost', { found: this.found.size, total: this.total });
    }
    if (this.hintTarget && performance.now() > this.hintTarget.until) this.hintTarget = null;
    const now = performance.now();
    this.sparkles = this.sparkles.filter((s) => now - s.born < s.life);
    this.missMarks = this.missMarks.filter((m) => now - m.born < 700);
  }

  clickAt(x, y) {
    if (this.status !== 'playing') return null;
    this.clicks++;
    const diffs = this.level.diffs;
    for (let i = 0; i < diffs.length; i++) {
      if (this.found.has(i)) continue;
      const d = diffs[i];
      const dx = x - d.x, dy = y - d.y;
      if (dx * dx + dy * dy <= (d.r + 6) * (d.r + 6)) {
        this.found.add(i);
        this.hits++;
        this.combo++;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        const mult = Math.min(this.combo, 5);
        const pts = POINTS_PER_FIND * mult;
        this.score += pts;
        this.levelScores[this.levelIndex] += pts;
        this.timeLeft = Math.min(this.level.time, this.timeLeft + TIME_BONUS_PER_FIND);
        for (let s = 0; s < 10; s++) {
          this.sparkles.push({
            x: d.x + (Math.random() - 0.5) * d.r * 1.6,
            y: d.y + (Math.random() - 0.5) * d.r * 1.6,
            born: performance.now(),
            life: 500 + Math.random() * 400,
          });
        }
        const won = this.found.size === diffs.length;
        if (won) {
          this.status = 'won';
          this.emit('won', this.summary());
        } else {
          this.emit('found', { index: i, diff: d, points: pts, combo: this.combo });
        }
        return { hit: true, index: i, won };
      }
    }
    // miss
    this.misses++;
    this.combo = 0;
    this.timeLeft = Math.max(0, this.timeLeft - MISS_TIME_PENALTY);
    this.missMarks.push({ x, y, born: performance.now() });
    this.emit('miss', { x, y });
    if (this.timeLeft <= 0) {
      this.status = 'lost';
      this.emit('lost', { found: this.found.size, total: this.total });
    }
    return { hit: false };
  }

  useHint() {
    if (this.status !== 'playing') return null;
    if (this.hintsLeft <= 0) return null;
    const now = performance.now();
    if (now < this.hintCooldownUntil) return null;
    const remaining = this.level.diffs.map((d, i) => i).filter((i) => !this.found.has(i));
    if (!remaining.length) return null;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft--;
    this.hintCooldownUntil = now + HINT_COOLDOWN_MS;
    this.hintTarget = { x: this.level.diffs[pick].x, y: this.level.diffs[pick].y, until: now + 2500 };
    this.emit('hint', { index: pick });
    return pick;
  }

  summary() {
    return {
      level: this.level,
      score: this.score,
      levelScore: this.levelScores[this.levelIndex],
      found: this.found.size,
      total: this.total,
      accuracy: this.clicks ? Math.round((this.hits / this.clicks) * 100) : 100,
      timeUsed: Math.round(this.timeUsed),
      timeLeft: Math.round(this.timeLeft),
      bestCombo: this.bestCombo,
      hintsUsed: HINTS_PER_LEVEL - this.hintsLeft,
    };
  }

  emit(type, data) {
    if (this.onEvent) this.onEvent(type, data);
  }
}
