// scenes.js — every picture is drawn procedurally by this file's own code.
// drawScene(ctx, level, variant) paints one panel. Variant 'A' is the
// original, variant 'B' is the same scene with the level's differences
// applied. Decorative randomness comes from a seeded RNG so both panels
// are pixel-identical except for the differences.

import { SCENE_W, SCENE_H } from './config.js';

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function stars(ctx, rng, n, yMax, color) {
  for (let i = 0; i < n; i++) {
    const x = rng() * SCENE_W;
    const y = rng() * yMax;
    const r = 0.6 + rng() * 1.4;
    ctx.globalAlpha = 0.35 + rng() * 0.65;
    star(ctx, x, y, r, color);
  }
  ctx.globalAlpha = 1;
}

function lantern(ctx, x, y, r, color, lit) {
  // paper lantern: ribbed round body + caps
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.15);
  g.addColorStop(0, lit ? '#ffe9a8' : '#e8c98a');
  g.addColorStop(0.55, color);
  g.addColorStop(1, shade(color));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,20,10,0.55)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.55 * Math.abs(Math.cos(i * 0.5)) + r * 0.28, r * 0.86, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(x - r * 0.3, y - r * 0.86 - 5, r * 0.6, 6);
  ctx.fillRect(x - r * 0.3, y + r * 0.86 - 1, r * 0.6, 6);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.86 + 5);
  ctx.lineTo(x, y + r * 0.86 + 14);
  ctx.stroke();
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.86 + 17, 3, 0, Math.PI * 2);
  ctx.fill();
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 70);
  const g = Math.max(0, ((n >> 8) & 255) - 70);
  const b = Math.max(0, (n & 255) - 70);
  return `rgb(${r},${g},${b})`;
}

// ---------------------------------------------------------------- market
function drawMarket(ctx, v, rng) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, '#171238');
  sky.addColorStop(0.5, '#3a1e58');
  sky.addColorStop(1, '#7a2d4d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  stars(ctx, rng, 70, 200, '#fff6d8');

  // moon — diff 0: full in A, crescent in B
  if (v === 'A') {
    ctx.fillStyle = '#ffeeb0';
    ctx.beginPath(); ctx.arc(492, 62, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(214,178,90,0.7)';
    ctx.beginPath(); ctx.arc(484, 54, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(500, 70, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(496, 50, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#ffeeb0';
    ctx.beginPath(); ctx.arc(492, 62, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c1c50';
    ctx.beginPath(); ctx.arc(502, 56, 23, 0, Math.PI * 2); ctx.fill();
  }

  // distant rooftops
  ctx.fillStyle = '#241a3e';
  ctx.beginPath();
  ctx.moveTo(0, 330); ctx.lineTo(0, 300); ctx.lineTo(70, 282); ctx.lineTo(140, 300);
  ctx.lineTo(210, 284); ctx.lineTo(300, 302); ctx.lineTo(380, 282); ctx.lineTo(460, 300);
  ctx.lineTo(540, 284); ctx.lineTo(600, 300); ctx.lineTo(600, 330); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,214,120,0.85)';
  for (const wx of [95, 245, 415, 505]) {
    ctx.fillRect(wx, 296, 10, 12);
  }

  // carp windsock pole — diff 6: windsock present in A, gone in B
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(64, 330); ctx.lineTo(64, 140); ctx.stroke();
  if (v === 'A') {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(64, 150); ctx.quadraticCurveTo(96, 140, 112, 158);
    ctx.quadraticCurveTo(96, 176, 64, 178); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(76, 162, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(112, 158); ctx.lineTo(126, 150); ctx.lineTo(126, 168); ctx.closePath(); ctx.fill();
  }

  // lantern string wire + bulbs
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, 66); ctx.quadraticCurveTo(300, 92, 570, 66); ctx.stroke();
  const bulbXs = [120, 176, 232, 340, 420, 500];
  for (const bx of bulbXs) {
    const by = 66 + Math.sin((bx - 30) / 540 * Math.PI) * 22 + 8;
    const lit = !(v === 'B' && bx === 176); // diff 5: bulb dark in B
    ctx.fillStyle = lit ? '#ffd76a' : '#4a3a30';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255,215,106,0.25)';
      ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill();
    }
  }
  // hanging lanterns — diff 1: middle lantern red in A, gold in B
  const lx = [80, 180, 280, 380, 480];
  lx.forEach((x, i) => {
    const y = 66 + Math.sin((x - 30) / 540 * Math.PI) * 22 + 26;
    const color = (i === 2) ? (v === 'A' ? '#d63031' : '#e8a020') : '#d63031';
    lantern(ctx, x, y, 20, color, true);
  });

  // hanging sign — diff 4: red board in A, teal in B
  ctx.fillStyle = v === 'A' ? '#b03a2e' : '#1f7a6d';
  rr(ctx, 268, 150, 64, 52, 6); ctx.fill();
  ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 2; rr(ctx, 272, 154, 56, 44, 4); ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('夜', 300, 168);
  ctx.fillText('市', 300, 190);
  ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(292, 150); ctx.lineTo(292, 128); ctx.moveTo(308, 150); ctx.lineTo(308, 128); ctx.stroke();

  // ground
  ctx.fillStyle = '#4a2c33';
  ctx.fillRect(0, 330, SCENE_W, 120);
  ctx.fillStyle = 'rgba(255,200,120,0.10)';
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(rng() * SCENE_W, 335 + rng() * 110, 26 + rng() * 30, 8);
  }

  // left stall: fruit
  ctx.fillStyle = '#6e3b1f';
  ctx.fillRect(56, 296, 160, 14);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(62, 310, 10, 40); ctx.fillRect(200, 310, 10, 40);
  // awning
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.moveTo(48, 236); ctx.lineTo(224, 236); ctx.lineTo(216, 262); ctx.lineTo(56, 262); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f5d7a1';
  for (let i = 0; i < 4; i++) ctx.fillRect(66 + i * 44, 236, 18, 26);
  // basket of apples — diff 2: 3 apples in A, 2 in B
  ctx.fillStyle = '#a8642a';
  ctx.beginPath(); ctx.ellipse(132, 288, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
  const apples = v === 'A' ? [[118, 272], [132, 266], [146, 272]] : [[122, 270], [142, 270]];
  for (const [ax, ay] of apples) {
    ctx.fillStyle = '#e23b2e';
    ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay - 10); ctx.lineTo(ax + 3, ay - 15); ctx.stroke();
  }
  // pears beside
  ctx.fillStyle = '#e8c84a';
  ctx.beginPath(); ctx.arc(178, 276, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(192, 280, 9, 0, Math.PI * 2); ctx.fill();

  // right stall: toys + tanghulu — diff 7: 3 sticks in A, 2 in B
  ctx.fillStyle = '#6e3b1f';
  ctx.fillRect(392, 296, 160, 14);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(398, 310, 10, 40); ctx.fillRect(536, 310, 10, 40);
  ctx.fillStyle = '#2e6da4';
  ctx.beginPath(); ctx.moveTo(384, 236); ctx.lineTo(560, 236); ctx.lineTo(552, 262); ctx.lineTo(392, 262); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f5d7a1';
  for (let i = 0; i < 4; i++) ctx.fillRect(402 + i * 44, 236, 18, 26);
  // toy masks
  ctx.fillStyle = '#f2e6c9';
  ctx.beginPath(); ctx.arc(420, 276, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(415, 272, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(425, 272, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7ec8e3';
  ctx.beginPath(); ctx.arc(452, 278, 11, 0, Math.PI * 2); ctx.fill();
  // tanghulu sticks
  const sticks = v === 'A' ? [462, 476, 490] : [466, 484];
  for (const sx of sticks) {
    ctx.strokeStyle = '#d9b48a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, 276); ctx.lineTo(sx, 306); ctx.stroke();
    ctx.fillStyle = '#d63031';
    for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(sx, 280 + j * 8, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // cat — diff 3: present in A, gone in B
  if (v === 'A') {
    ctx.fillStyle = '#2f2a33';
    ctx.beginPath(); ctx.ellipse(528, 402, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(528, 380, 12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(520, 372); ctx.lineTo(518, 360); ctx.lineTo(526, 368); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(536, 372); ctx.lineTo(538, 360); ctx.lineTo(530, 368); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath(); ctx.arc(524, 379, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(532, 379, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2f2a33'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(546, 400); ctx.quadraticCurveTo(560, 392, 556, 378); ctx.stroke();
  }

  // paper scraps + glow
  ctx.fillStyle = 'rgba(255,215,106,0.16)';
  ctx.beginPath(); ctx.ellipse(300, 360, 240, 60, 0, 0, Math.PI * 2); ctx.fill();
}

// ---------------------------------------------------------------- koi pond
function koiFish(ctx, x, y, angle, scale, body, belly) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath(); ctx.ellipse(-6, 3, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-34, -9); ctx.lineTo(-34, 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(14, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawKoi(ctx, v, rng) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, '#bfe3c8');
  sky.addColorStop(0.45, '#8fc7a0');
  sky.addColorStop(1, '#5d9b7a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  // garden wall
  ctx.fillStyle = '#e8ddc4';
  ctx.fillRect(0, 0, SCENE_W, 60);
  ctx.fillStyle = '#c9b58e';
  for (let x = 0; x < SCENE_W; x += 24) ctx.fillRect(x, 56, 12, 6);
  ctx.fillStyle = '#7a5a34';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('· 锦 鲤 园 ·', 300, 30);

  // bamboo — diff 4: stalk at x=70 present in A, missing in B
  const stalks = v === 'A' ? [52, 70, 88] : [52, 88];
  for (const bx of stalks) {
    ctx.strokeStyle = '#3e7d4e'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(bx, 150); ctx.lineTo(bx + 4, 60); ctx.stroke();
    ctx.fillStyle = '#57a86a';
    for (let ly = 66; ly < 150; ly += 18) {
      ctx.beginPath(); ctx.ellipse(bx + 10, ly, 16, 5, -0.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // dragonfly — diff 6: present in A, gone in B
  if (v === 'A') {
    ctx.strokeStyle = 'rgba(40,80,120,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(380, 118); ctx.lineTo(380, 134); ctx.stroke();
    ctx.fillStyle = 'rgba(180,220,255,0.75)';
    ctx.beginPath(); ctx.ellipse(370, 114, 12, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(390, 114, 12, 4, 0.4, 0, Math.PI * 2); ctx.fill();
  }

  // pond
  const water = ctx.createRadialGradient(300, 280, 40, 300, 280, 280);
  water.addColorStop(0, '#3f9d8a');
  water.addColorStop(1, '#1f6a5c');
  ctx.fillStyle = water;
  ctx.beginPath(); ctx.ellipse(300, 290, 262, 132, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.ellipse(300, 290, 262, 132, 0, 0, Math.PI * 2); ctx.stroke();

  // ripples
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(120 + rng() * 360, 210 + rng() * 150, 14 + rng() * 26, 5 + rng() * 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // bridge — diff 3: middle plank brown in A, red in B
  ctx.fillStyle = '#8a5a2e';
  ctx.beginPath(); ctx.moveTo(180, 196); ctx.quadraticCurveTo(300, 128, 420, 196);
  ctx.lineTo(420, 210); ctx.quadraticCurveTo(300, 142, 180, 210); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = 190 + t * 220;
    const by = 196 - Math.sin(t * Math.PI) * 52;
    ctx.fillStyle = (i === 4) ? (v === 'A' ? '#a8642a' : '#c0392b') : '#c98f4e';
    ctx.fillRect(bx - 11, by - 8, 22, 10);
  }
  ctx.strokeStyle = '#6e3b1f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(180, 190); ctx.quadraticCurveTo(300, 118, 420, 190); ctx.stroke();

  // koi — diff 0: the fish at (200,262) is orange in A, white in B
  koiFish(ctx, 200, 262, -0.3, 1, v === 'A' ? '#e8722a' : '#f2ede0', v === 'A' ? '#f7c948' : '#d8d2c2');
  koiFish(ctx, 330, 320, 0.5, 0.85, '#e8e4d8', '#c9c2ae');
  koiFish(ctx, 420, 250, 2.6, 0.9, '#d63031', '#f7c948');
  koiFish(ctx, 260, 350, 3.4, 0.7, '#f2a541', '#f7e3a1');

  // lily pads
  const pads = [[150, 300], [250, 240], [360, 300], [420, 330], [480, 280]];
  for (const [px, py] of pads) {
    ctx.fillStyle = '#2e7d4f';
    ctx.beginPath(); ctx.ellipse(px, py, 26, 12, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9d63';
    ctx.beginPath(); ctx.ellipse(px - 4, py - 2, 20, 9, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // lily flower — diff 1: pink flower on pad (420,330) in A, none in B
  if (v === 'A') {
    ctx.fillStyle = '#f7a8c4';
    for (let p = 0; p < 6; p++) {
      const a = p * Math.PI / 3;
      ctx.beginPath(); ctx.ellipse(420 + Math.cos(a) * 8, 326 + Math.sin(a) * 6, 7, 4, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.arc(420, 326, 4, 0, Math.PI * 2); ctx.fill();
  }

  // rocks — diff 2: extra small rock at (150,362) only in B
  const rocks = [[110, 340, 26], [520, 340, 30], [560, 300, 20]];
  if (v === 'B') rocks.push([150, 362, 16]);
  for (const [rx, ry, rr2] of rocks) {
    ctx.fillStyle = '#8d8d8d';
    ctx.beginPath(); ctx.ellipse(rx, ry, rr2, rr2 * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a8a8a8';
    ctx.beginPath(); ctx.ellipse(rx - 4, ry - 4, rr2 * 0.6, rr2 * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  }

  // frog — diff 7: on the rock at (470,362) in A, gone in B
  if (v === 'A') {
    ctx.fillStyle = '#58a05c';
    ctx.beginPath(); ctx.ellipse(470, 360, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(462, 350, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(478, 350, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath(); ctx.arc(462, 349, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(478, 349, 2, 0, Math.PI * 2); ctx.fill();
  }

  // stone lantern — diff 5: warm glow on in A, dark in B
  ctx.fillStyle = '#9a9a92';
  ctx.fillRect(512, 196, 16, 34);
  ctx.fillStyle = '#b5b5aa';
  ctx.beginPath(); ctx.moveTo(504, 196); ctx.lineTo(536, 196); ctx.lineTo(528, 182); ctx.lineTo(512, 182); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8d8d84';
  ctx.beginPath(); ctx.moveTo(506, 182); ctx.lineTo(534, 182); ctx.lineTo(528, 168); ctx.lineTo(512, 168); ctx.closePath(); ctx.fill();
  if (v === 'A') {
    ctx.fillStyle = 'rgba(255,214,120,0.35)';
    ctx.beginPath(); ctx.arc(520, 189, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(514, 184, 12, 10);
  } else {
    ctx.fillStyle = '#5a5a52';
    ctx.fillRect(514, 184, 12, 10);
  }
}

// ---------------------------------------------------------------- observatory
function drawObservatory(ctx, v, rng) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, '#060a24');
  sky.addColorStop(0.6, '#101a3e');
  sky.addColorStop(1, '#1d2f52');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  stars(ctx, rng, 110, 260, '#dfe8ff');

  // milky way band
  ctx.fillStyle = 'rgba(160,180,255,0.07)';
  ctx.beginPath();
  ctx.moveTo(0, 60); ctx.quadraticCurveTo(300, 140, 600, 40);
  ctx.lineTo(600, 90); ctx.quadraticCurveTo(300, 180, 0, 110); ctx.closePath(); ctx.fill();

  // comet — diff 7: streaking in A, gone in B
  if (v === 'A') {
    const cg = ctx.createLinearGradient(60, 120, 120, 150);
    cg.addColorStop(0, 'rgba(255,255,255,0)');
    cg.addColorStop(1, 'rgba(255,255,255,0.9)');
    ctx.strokeStyle = cg; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(62, 122); ctx.lineTo(118, 152); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(120, 153, 4, 0, Math.PI * 2); ctx.fill();
  }

  // extra star — diff 4: an extra star at (120,80) only in B
  if (v === 'B') {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(120, 80, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(120, 80, 7, 0, Math.PI * 2); ctx.fill();
  }
  // constellation lines (dipper, top-left)
  ctx.strokeStyle = 'rgba(200,215,255,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 60); ctx.lineTo(95, 70); ctx.lineTo(120, 55); ctx.lineTo(150, 70); ctx.lineTo(175, 60);
  ctx.stroke();
  for (const [sx, sy] of [[60, 60], [95, 70], [120, 55], [150, 70], [175, 60]]) {
    ctx.fillStyle = '#eaf0ff';
    ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // ringed planet — diff 0: ring in A, bare in B
  ctx.fillStyle = '#e8a86a';
  ctx.beginPath(); ctx.arc(480, 90, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(232,168,106,0.5)';
  ctx.beginPath(); ctx.arc(474, 84, 8, 0, Math.PI * 2); ctx.fill();
  if (v === 'A') {
    ctx.strokeStyle = 'rgba(240,220,180,0.9)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(480, 90, 40, 10, -0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,220,180,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(480, 90, 46, 13, -0.35, 0, Math.PI * 2); ctx.stroke();
  }

  // ground
  ctx.fillStyle = '#0c1428';
  ctx.fillRect(0, 380, SCENE_W, 70);
  ctx.fillStyle = 'rgba(120,160,255,0.08)';
  ctx.fillRect(0, 380, SCENE_W, 4);

  // observatory dome
  ctx.fillStyle = '#2a3a5e';
  ctx.beginPath(); ctx.arc(220, 330, 110, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#35486e';
  ctx.beginPath(); ctx.arc(220, 330, 110, Math.PI * 1.15, Math.PI * 1.85); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1a2742';
  ctx.fillRect(110, 330, 220, 50);
  // dome slit
  ctx.fillStyle = '#060a24';
  ctx.beginPath(); ctx.moveTo(196, 232); ctx.lineTo(244, 232); ctx.lineTo(252, 330); ctx.lineTo(188, 330); ctx.closePath(); ctx.fill();
  // telescope — diff 1: steep angle in A, shallow in B
  ctx.save();
  ctx.translate(220, 300);
  ctx.rotate(v === 'A' ? -0.9 : -0.45);
  ctx.fillStyle = '#c8ccd4';
  ctx.fillRect(-8, -78, 16, 78);
  ctx.fillStyle = '#8a90a0';
  ctx.fillRect(-11, -86, 22, 12);
  ctx.fillStyle = '#e8ecf2';
  ctx.beginPath(); ctx.arc(0, -86, 11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#3a4a6e';
  ctx.beginPath(); ctx.arc(220, 306, 16, 0, Math.PI * 2); ctx.fill();
  // dome window — diff 6: round in A, square in B
  if (v === 'A') {
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath(); ctx.arc(150, 260, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0c1428'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(138, 260); ctx.lineTo(162, 260); ctx.moveTo(150, 248); ctx.lineTo(150, 272); ctx.stroke();
  } else {
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(138, 248, 24, 24);
    ctx.strokeStyle = '#0c1428'; ctx.lineWidth = 2;
    ctx.strokeRect(138, 248, 24, 24);
    ctx.beginPath(); ctx.moveTo(138, 260); ctx.lineTo(162, 260); ctx.moveTo(150, 248); ctx.lineTo(150, 272); ctx.stroke();
  }

  // greenhouse (right)
  ctx.fillStyle = 'rgba(120,200,160,0.14)';
  ctx.fillRect(380, 250, 180, 130);
  ctx.strokeStyle = '#7ec8a8'; ctx.lineWidth = 3;
  ctx.strokeRect(380, 250, 180, 130);
  ctx.beginPath(); ctx.moveTo(380, 250); ctx.lineTo(470, 210); ctx.lineTo(560, 250); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(470, 210); ctx.lineTo(470, 250); ctx.stroke();
  // plants
  ctx.strokeStyle = '#4fae7d'; ctx.lineWidth = 3;
  for (const px of [400, 430, 500, 540]) {
    ctx.beginPath(); ctx.moveTo(px, 380); ctx.quadraticCurveTo(px - 8, 340, px - 16, 322); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, 380); ctx.quadraticCurveTo(px + 10, 344, px + 18, 326); ctx.stroke();
  }
  // potted flower — diff 5: flower in pot at (520,320) in A, bare pot in B
  ctx.fillStyle = '#a8642a';
  ctx.beginPath(); ctx.moveTo(508, 320); ctx.lineTo(532, 320); ctx.lineTo(528, 336); ctx.lineTo(512, 336); ctx.closePath(); ctx.fill();
  if (v === 'A') {
    ctx.fillStyle = '#e88bb0';
    for (let p = 0; p < 5; p++) {
      const a = p * Math.PI * 2 / 5 - Math.PI / 2;
      ctx.beginPath(); ctx.ellipse(520 + Math.cos(a) * 7, 306 + Math.sin(a) * 7, 6, 4, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.arc(520, 306, 4, 0, Math.PI * 2); ctx.fill();
  }
  // glowing mushrooms — diff 2: teal glow in A, purple in B
  const mg = v === 'A' ? '#4fe3c1' : '#c07ef0';
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(440, 372, 14, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(436, 372, 8, 12);
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(462, 378, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(459, 378, 6, 9);
  ctx.fillStyle = v === 'A' ? 'rgba(79,227,193,0.25)' : 'rgba(192,126,240,0.25)';
  ctx.beginPath(); ctx.arc(448, 376, 30, 0, Math.PI * 2); ctx.fill();

  // control console — diff 3: light red in A, green in B
  ctx.fillStyle = '#1f2c4a';
  rr(ctx, 320, 356, 56, 30, 5); ctx.fill();
  ctx.fillStyle = '#0c1428';
  ctx.fillRect(326, 362, 30, 12);
  ctx.fillStyle = v === 'A' ? '#e74c3c' : '#2ecc71';
  ctx.beginPath(); ctx.arc(345, 368, 5, 0, Math.PI * 2); ctx.fill();
  if (v === 'A') {
    ctx.fillStyle = 'rgba(231,76,60,0.4)';
    ctx.beginPath(); ctx.arc(345, 368, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath(); ctx.arc(362, 368, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7c948';
  ctx.beginPath(); ctx.arc(370, 378, 3, 0, Math.PI * 2); ctx.fill();
}

export function drawScene(ctx, level, variant) {
  const rng = mulberry32(level.seed);
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  if (level.id === 'market') drawMarket(ctx, variant, rng);
  else if (level.id === 'koi') drawKoi(ctx, variant, rng);
  else drawObservatory(ctx, variant, rng);
}
