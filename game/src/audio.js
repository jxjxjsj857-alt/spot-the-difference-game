// audio.js — synthesized WebAudio sounds only. No audio files, no network.
// Everything starts on the first user gesture (browser autoplay policy).

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.padNodes = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  tone(freq, dur, type = 'sine', vol = 0.25, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  chime() {
    // bright two-note find chime
    this.tone(880, 0.28, 'sine', 0.3);
    this.tone(1318.5, 0.4, 'sine', 0.22, 0.07);
    this.tone(1760, 0.3, 'triangle', 0.1, 0.07);
  }

  thud() {
    this.tone(140, 0.18, 'triangle', 0.3, 0, 70);
  }

  blip() {
    this.tone(660, 0.07, 'sine', 0.15);
  }

  hintSound() {
    this.tone(523.25, 0.15, 'sine', 0.18);
    this.tone(783.99, 0.2, 'sine', 0.15, 0.08);
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => this.tone(f, 0.5, 'sine', 0.25, i * 0.11));
    this.tone(261.6, 1.0, 'triangle', 0.12, 0);
  }

  lose() {
    this.tone(392, 0.4, 'sine', 0.2, 0, 196);
    this.tone(311, 0.6, 'sine', 0.18, 0.25, 155);
  }

  startPad() {
    if (!this.ctx || this.padNodes || this.muted) return;
    const g = this.ctx.createGain();
    g.gain.value = 0.045;
    g.connect(this.master);
    const oscs = [110, 164.81, 220].map((f) => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * 6;
      o.connect(g);
      o.start();
      return o;
    });
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();
    this.padNodes = { oscs, lfo, g };
  }

  stopPad() {
    if (!this.padNodes) return;
    try {
      this.padNodes.oscs.forEach((o) => o.stop());
      this.padNodes.lfo.stop();
      this.padNodes.g.disconnect();
    } catch (e) { /* already stopped */ }
    this.padNodes = null;
  }
}
