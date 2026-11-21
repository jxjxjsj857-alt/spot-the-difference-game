// input.js — mouse/touch clicks on either panel and keyboard shortcuts.
// Click coordinates are converted from screen space into scene space
// (600 x 450) so the hit test in state.js sees the same numbers the
// scene drawing code used.

import { SCENE_W, SCENE_H } from './config.js';

export function sceneCoords(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * SCENE_W,
    y: ((event.clientY - rect.top) / rect.height) * SCENE_H,
  };
}

export function bindInput(deps) {
  const { canvasA, canvasB, state, sound, onPauseToggle, onMenu, onRestart, onLevel } = deps;

  const click = (canvas) => (event) => {
    sound.ensure();
    const { x, y } = sceneCoords(canvas, event);
    state.clickAt(x, y);
  };
  canvasA.addEventListener('click', click(canvasA));
  canvasB.addEventListener('click', click(canvasB));

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') {
      sound.ensure();
      state.useHint();
    } else if (key === 'm') {
      sound.ensure();
      sound.setMuted(!sound.muted);
      deps.onMuteToggle && deps.onMuteToggle(sound.muted);
    } else if (key === 'r') {
      onRestart();
    } else if (key === 'escape' || key === 'p') {
      if (state.status === 'playing' || state.status === 'paused') onPauseToggle();
      else if (state.status === 'won' || state.status === 'lost') onMenu();
    } else if (key === '1' || key === '2' || key === '3') {
      onLevel(Number(key) - 1);
    }
  });
}
