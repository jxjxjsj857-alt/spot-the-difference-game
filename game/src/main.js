// main.js — bootstrap: wires state, rendering, input, audio and the HUD,
// runs the animation loop, and shows/hides the menu, pause, win and lose
// overlays.

import { LEVELS, SCENE_W, SCENE_H, HINT_COOLDOWN_MS } from './config.js';
import { GameState } from './state.js';
import { Renderer } from './render.js';
import { SoundBank } from './audio.js';
import { bindInput } from './input.js';
import { applyShot } from './shots.js';

const $ = (id) => document.getElementById(id);

const state = new GameState();
const sound = new SoundBank();
const renderer = new Renderer($('panel-a'), $('panel-b'));

const hud = {
  levelName: $('hud-level'),
  counter: $('hud-counter'),
  timerText: $('hud-timer'),
  timerFill: $('hud-timer-fill'),
  score: $('hud-score'),
  combo: $('hud-combo'),
  hints: $('hud-hints'),
  hintBtn: $('btn-hint'),
  pauseBtn: $('btn-pause'),
  muteBtn: $('btn-mute'),
  menuBtn: $('btn-menu'),
  toast: $('toast'),
};

let toastTimer = null;
function toast(msg) {
  hud.toast.textContent = msg;
  hud.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hud.toast.classList.remove('show'), 2200);
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function updateHUD() {
  const level = state.level;
  hud.levelName.textContent = `${level.name} · ${level.tag}`;
  hud.counter.textContent = `${state.found.size} / ${state.total} found · ${state.remaining} left`;
  hud.timerText.textContent = fmtTime(Math.max(0, state.timeLeft));
  const frac = Math.max(0, Math.min(1, state.timeLeft / level.time));
  hud.timerFill.style.width = `${frac * 100}%`;
  hud.timerFill.classList.toggle('low', state.timeLeft <= 30);
  hud.timerFill.classList.toggle('mid', state.timeLeft > 30 && state.timeLeft <= 60);
  hud.score.textContent = `Score ${state.score}`;
  hud.combo.textContent = state.combo >= 2 ? `Combo x${Math.min(state.combo, 5)}` : '';
  hud.combo.classList.toggle('show', state.combo >= 2);
  hud.hints.textContent = `Hints ${state.hintsLeft}`;
  const cdLeft = Math.max(0, state.hintCooldownUntil - performance.now());
  hud.hintBtn.disabled = state.hintsLeft <= 0 || cdLeft > 0 || state.status !== 'playing';
  hud.hintBtn.textContent = cdLeft > 0
    ? `Hint (${Math.ceil(cdLeft / 1000)}s)`
    : `Hint (H) · ${state.hintsLeft} left`;
  hud.pauseBtn.textContent = state.status === 'paused' ? 'Resume' : 'Pause';
}

// ---- overlays -------------------------------------------------------------
const overlays = {
  menu: $('overlay-menu'),
  pause: $('overlay-pause'),
  end: $('overlay-end'),
};

function showOnly(name) {
  for (const [key, el] of Object.entries(overlays)) {
    el.classList.toggle('hidden', key !== name);
  }
  $('panels').classList.toggle('dim', name === 'menu');
}

function showMenu() {
  state.toMenu();
  $('menu-levels').innerHTML = LEVELS.map((l, i) =>
    `<button class="level-card" data-level="${i}">
       <span class="level-card-name">${i + 1}. ${l.name}</span>
       <span class="level-card-meta">${l.tag} · ${l.diffs.length} differences · ${fmtTime(l.time)}</span>
       <span class="level-card-blurb">${l.blurb}</span>
     </button>`).join('');
  showOnly('menu');
  updateHUD();
}

function showEnd(won, summary) {
  $('end-title').textContent = won ? 'You found them all!' : "Time's up!";
  $('end-sub').textContent = won
    ? `${summary.level.name} complete — every difference spotted.`
    : `You found ${summary.found} of ${summary.total} differences in ${summary.level.name}. Your found markers stay — retry to finish the rest.`;
  $('end-stats').innerHTML = `
    <div><span>Score</span><b>${summary.score}</b></div>
    <div><span>Found</span><b>${summary.found} / ${summary.total}</b></div>
    <div><span>Accuracy</span><b>${summary.accuracy}%</b></div>
    <div><span>Time</span><b>${fmtTime(summary.timeUsed)}</b></div>
    <div><span>Best combo</span><b>x${Math.max(1, summary.bestCombo)}</b></div>
    <div><span>Time left</span><b>${fmtTime(summary.timeLeft)}</b></div>`;
  $('btn-next').style.display = (won && state.levelIndex < LEVELS.length - 1) ? '' : 'none';
  $('btn-retry').textContent = won ? 'Play again' : 'Retry (keep found)';
  showOnly('end');
}

// ---- state events ---------------------------------------------------------
state.onEvent = (type, data) => {
  if (type === 'found') {
    sound.chime();
    toast(`+${data.points} · ${data.diff.label} found!`);
  } else if (type === 'miss') {
    sound.thud();
    toast('Not there — 5 seconds lost, combo reset.');
  } else if (type === 'hint') {
    sound.hintSound();
    toast('Hint: look where the ring pulses.');
  } else if (type === 'won') {
    sound.win();
    showEnd(true, data);
  } else if (type === 'lost') {
    sound.lose();
    showEnd(false, state.summary());
  } else if (type === 'level-start') {
    showOnly(null);
    toast(`${data.level.name} — find all ${data.level.diffs.length} differences!`);
  }
  updateHUD();
};

// ---- buttons --------------------------------------------------------------
hud.hintBtn.addEventListener('click', () => { sound.ensure(); state.useHint(); updateHUD(); });
hud.pauseBtn.addEventListener('click', togglePause);
hud.menuBtn.addEventListener('click', showMenu);
hud.muteBtn.addEventListener('click', () => {
  sound.ensure();
  sound.setMuted(!sound.muted);
  hud.muteBtn.textContent = sound.muted ? 'Unmute (M)' : 'Mute (M)';
});
$('btn-howto').addEventListener('click', () => $('howto').classList.toggle('hidden'));
$('btn-start').addEventListener('click', () => {
  sound.ensure();
  sound.startPad();
  state.startLevel(0);
});
$('menu-levels').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-level]');
  if (!btn) return;
  sound.ensure();
  sound.startPad();
  state.startLevel(Number(btn.dataset.level));
});
$('btn-resume').addEventListener('click', togglePause);
$('btn-quit-pause').addEventListener('click', showMenu);
$('btn-next').addEventListener('click', () => state.startLevel(state.levelIndex + 1));
$('btn-retry').addEventListener('click', () => {
  const keep = state.status === 'lost';
  state.startLevel(state.levelIndex, keep);
});
$('btn-end-menu').addEventListener('click', showMenu);

function togglePause() {
  if (state.status === 'playing') {
    state.pause();
    showOnly('pause');
  } else if (state.status === 'paused') {
    state.resume();
    showOnly(null);
  }
  updateHUD();
}

// ---- input ----------------------------------------------------------------
bindInput({
  canvasA: $('panel-a'),
  canvasB: $('panel-b'),
  state,
  sound,
  onPauseToggle: togglePause,
  onMenu: showMenu,
  onRestart: () => {
    if (state.status === 'playing' || state.status === 'paused' || state.status === 'won' || state.status === 'lost') {
      state.startLevel(state.levelIndex, state.status === 'lost');
    }
  },
  onLevel: (i) => {
    if (i >= 0 && i < LEVELS.length) {
      sound.ensure();
      sound.startPad();
      state.startLevel(i);
    }
  },
  onMuteToggle: (muted) => { hud.muteBtn.textContent = muted ? 'Unmute (M)' : 'Mute (M)'; },
});

// ---- main loop ------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  state.tick(dt);
  renderer.draw(state); // also paints the scene behind the menu overlay
  updateHUD();
  requestAnimationFrame(frame);
}

// ---- boot -----------------------------------------------------------------
const params = new URLSearchParams(location.search);
const shotMode = applyShot(state, params);
if (shotMode) {
  hud.toast.classList.remove('show');
  clearTimeout(toastTimer);
  if (state.status === 'won') showEnd(true, state.summary());
  else if (state.status === 'menu') showMenu();
  else showOnly(null);
  updateHUD();
  window.__shotReady = true;
} else {
  showMenu();
}
requestAnimationFrame(frame);
