// render.js — draws the two scene panels (from cached offscreen canvases),
// found-difference rings, sparkles, hint pulse and miss marks.

import { SCENE_W, SCENE_H } from './config.js';
import { drawScene } from './scenes.js';

export class Renderer {
  constructor(canvasA, canvasB) {
    this.ca = canvasA;
    this.cb = canvasB;
    this.offA = document.createElement('canvas');
    this.offB = document.createElement('canvas');
    this.offA.width = this.offB.width = SCENE_W;
    this.offA.height = this.offB.height = SCENE_H;
    this.levelId = null;
  }

  build(level) {
    if (this.levelId === level.id) return;
    this.levelId = level.id;
    drawScene(this.offA.getContext('2d'), level, 'A');
    drawScene(this.offB.getContext('2d'), level, 'B');
  }

  draw(state) {
    const level = state.level;
    this.build(level);
    for (const [canvas, off] of [[this.ca, this.offA], [this.cb, this.offB]]) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, SCENE_W, SCENE_H);
      ctx.drawImage(off, 0, 0);
      this.drawOverlays(ctx, state);
    }
  }

  drawOverlays(ctx, state) {
    const now = performance.now();
    // found rings
    state.level.diffs.forEach((d, i) => {
      if (!state.found.has(i)) return;
      const pulse = 1 + 0.06 * Math.sin(now / 300);
      ctx.save();
      ctx.strokeStyle = '#ffd94d';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff9d00';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 6) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // check mark
      ctx.save();
      ctx.strokeStyle = '#ffd94d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(d.x - 8, d.y);
      ctx.lineTo(d.x - 2, d.y + 7);
      ctx.lineTo(d.x + 10, d.y - 7);
      ctx.stroke();
      ctx.restore();
    });
    // hint pulse
    if (state.hintTarget) {
      const t = (now % 600) / 600;
      const r = state.level.diffs[0].r + 8 + t * 18;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = '#7ef0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(state.hintTarget.x, state.hintTarget.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // sparkles
    for (const s of state.sparkles) {
      const age = (now - s.born) / s.life;
      if (age >= 1) continue;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.fillStyle = '#fff3a0';
      const r = 3.5 * (1 - age) + 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // miss marks
    for (const m of state.missMarks) {
      const age = (now - m.born) / 700;
      if (age >= 1) continue;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.strokeStyle = '#ff5a4d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(m.x - s, m.y - s); ctx.lineTo(m.x + s, m.y + s);
      ctx.moveTo(m.x + s, m.y - s); ctx.lineTo(m.x - s, m.y + s);
      ctx.stroke();
      ctx.restore();
    }
  }
}
