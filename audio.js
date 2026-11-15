// Original 8-bit style music made with the Web Audio API (square + triangle + noise). No third-party music.
const N = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const freq = s => { if (s === '-') return 0; const m = /^([A-G])(#?)(\d)$/.exec(s); return 440 * 2 ** ((N[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12 - 9) / 12); };
const seq = s => s.trim().split(/\s+/);
// Each track: bpm, lead (square), bass (triangle). One token = half a beat.
const TRACKS = {
  sad:    { bpm: 66,  wave: 'triangle', lead: seq('A4 - C5 - E5 - D5 C5 A4 - - - G4 - - - F4 - A4 - C5 - B4 A4 E4 - - - - - - -'), bass: seq('A2 - - - - - - - F2 - - - - - - - D2 - - - - - - - E2 - - - - - - -') },
  lab:    { bpm: 100, wave: 'square',   lead: seq('E5 G5 A5 G5 E5 - D5 E5 C5 - E5 - G5 - - - A5 C6 B5 A5 G5 - E5 G5 F5 - A5 - G5 - - -'), bass: seq('C3 G3 C4 G3 C3 G3 C4 G3 A2 E3 A3 E3 A2 E3 A3 E3 F2 C3 F3 C3 F2 C3 F3 C3 G2 D3 G3 D3 G2 D3 G3 D3') },
  launch: { bpm: 150, wave: 'square',   lead: seq('C4 E4 G4 C5 E4 G4 C5 E5 G4 C5 E5 G5 C5 E5 G5 C6 D4 F4 A4 D5 F4 A4 D5 F5 G4 B4 D5 G5 B4 D5 G5 B5'), bass: seq('C2 C2 C3 C2 C2 C2 C3 C2 C2 C2 C3 C2 C2 C2 C3 C2 D2 D2 D3 D2 D2 D2 D3 D2 G2 G2 G3 G2 G2 G2 G3 G2') },
  space:  { bpm: 80,  wave: 'triangle', lead: seq('E5 - - - G5 - - - D5 - - - C5 - - - A4 - - - C5 - - - D5 - - - - - - - E5 - - - G5 - - - A5 - - - G5 - - - E5 - - - D5 - - - C5 - - - - - - -'), bass: seq('C3 G3 C4 E4 G3 C4 E4 G4 G2 D3 G3 B3 D3 G3 B3 D4 A2 E3 A3 C4 E3 A3 C4 E4 F2 C3 F3 A3 C3 F3 A3 C4') },
  alarm:  { bpm: 170, wave: 'square',   lead: seq('A5 E5 A5 E5 A5 E5 A5 E5 G5 D5 G5 D5 G5 D5 G5 D5'), bass: seq('A2 A2 A3 A2 A2 A2 A3 A2 G2 G2 G3 G2 G2 G2 G3 G2') },
  nobel:  { bpm: 132, wave: 'square',   lead: seq('C5 E5 G5 C6 - G5 C6 - E6 - D6 C6 B5 - G5 - A5 C6 F6 - E6 D6 C6 - D6 - G5 - C6 - - -'), bass: seq('C3 G3 C4 G3 C3 G3 C4 G3 E3 B3 E4 B3 G2 D3 G3 D3 F2 C3 F3 C3 F2 C3 F3 C3 G2 D3 G3 D3 C3 G3 C4 -') },
  calm:   { bpm: 88,  wave: 'triangle', lead: seq('G4 - C5 - E5 - D5 - C5 - A4 - G4 - - - F4 - A4 - C5 - B4 - G4 - - - - - - -'), bass: seq('C3 - G3 - C3 - G3 - A2 - E3 - A2 - E3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - - -') },
  ruin:   { bpm: 54,  wave: 'triangle', lead: seq('A4 - - - G4 - - - F4 - - - E4 - - - D4 - - - - - - - A3 - - - - - - -'), bass: seq('A2 - - - - - - - D2 - - - - - - - E2 - - - - - - - A1 - - - - - - -') }
};

export class Chip {
  constructor() { this.ctx = null; this.vol = 0.35; this.on = true; this.track = null; this.timer = null; try { const v = parseFloat(localStorage.getItem('bym-vol')); if (!isNaN(v)) this.vol = v; this.on = localStorage.getItem('bym-music') !== '0'; } catch {} }
  start() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; } try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = this.vol * 0.25; this.master.connect(this.ctx.destination); if (this.want) this.play(this.want); } catch {} }
  setVol(v) { this.vol = v; if (this.master) this.master.gain.value = v * 0.25; try { localStorage.setItem('bym-vol', v); } catch {} }
  toggle() { this.on = !this.on; try { localStorage.setItem('bym-music', this.on ? '1' : '0'); } catch {} if (!this.on) this.stop(); else if (this.want) this.play(this.want, true); }
  note(f, t, d, type, g) { if (!f) return; const o = this.ctx.createOscillator(), a = this.ctx.createGain(); o.type = type; o.frequency.value = f; a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(a); a.connect(this.master); o.start(t); o.stop(t + d + 0.02); }
  stop() { clearInterval(this.timer); this.timer = null; this.track = null; }
  play(name, force) {
    this.want = name; if (!this.ctx || !this.on) return; if (this.track === name && !force) return;
    this.stop(); this.track = name; const T = TRACKS[name], step = 60 / T.bpm / 2; let i = 0, next = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => { while (next < this.ctx.currentTime + 0.2) { this.note(freq(T.lead[i % T.lead.length]), next, step * 1.6, T.wave, 0.22); this.note(freq(T.bass[i % T.bass.length]), next, step * 0.95, 'triangle', 0.3); i++; next += step; } }, 60);
  }
  sfx(kind) {
    if (!this.ctx) return; const t = this.ctx.currentTime, n = (f, dt, d, w = 'square', g = 0.25) => this.note(f, t + dt, d, w, g);
    if (kind === 'blip') n(880, 0, 0.03, 'square', 0.08);
    if (kind === 'click') n(660, 0, 0.06);
    if (kind === 'coin') { n(988, 0, 0.07); n(1319, 0.07, 0.18); }
    if (kind === 'error') { n(140, 0, 0.18, 'sawtooth'); n(110, 0.1, 0.2, 'sawtooth'); }
    if (kind === 'knock') { n(90, 0, 0.09, 'triangle', 0.6); n(90, 0.25, 0.09, 'triangle', 0.6); }
    if (kind === 'ring') { for (let k = 0; k < 6; k++) n(k % 2 ? 1568 : 1319, k * 0.07, 0.06); }
    if (kind === 'win') { [523, 659, 784, 1047].forEach((f, k) => n(f, k * 0.11, 0.25)); }
    if (kind === 'lose') { [392, 370, 349, 262].forEach((f, k) => n(f, k * 0.22, 0.3, 'triangle', 0.35)); }
  }
}
