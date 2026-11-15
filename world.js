// BeeYond Mars — walkable world: rooms, movement, collisions, path-finding and pixel drawing.
// Everything here is drawn with code on a 480×270 canvas (no image files), so it carries no AI art.
export const VW = 480, VH = 270, TS = 16;
const C = { ink: '#141b2d', wall: '#3b3558', wall2: '#2a2540', wood: '#b98a5a', wood2: '#8f6238', cream: '#f4e9d6', gold: '#ffd666', honey: '#e8a53a', green: '#7fd09a', dgreen: '#3f8f5f',
  blue: '#8ab8f0', purple: '#c4aaeb', red: '#c2453c', gray: '#8b90a6', dark: '#1c1c28', teal: '#6fd1c8', mars: '#c7653c', soil: '#6b4a32' };
export const LOOK = { lum: { color: C.purple, acc: 'scarf' }, pip: { color: C.gold, acc: 'glasses' }, nim: { color: C.green, acc: 'sprout' }, eko: { color: C.blue, acc: 'phones' } };

// object: { id, x, y, w, h, kind, solid (default true), name:[en,es], show(st) }  — coordinates in pixels
const o = (id, x, y, w, h, kind, name, extra = {}) => ({ id, x, y, w, h, kind, name, solid: true, ...extra });
const door = (id, x, y, name, extra) => o(id, x, y, 16, 22, 'door', name, extra);
export const ROOMS = {
  room: { w: 22, h: 14, floor: 'wood', spawn: [176, 150], name: ["Lum's room", 'Habitación de Lum'], objs: [
    o('bed', 20, 40, 34, 52, 'bed', ['Bed', 'Cama']), o('desk', 150, 34, 60, 22, 'desk', ['Desk', 'Escritorio']), o('box', 90, 120, 26, 20, 'box', ['Moving box', 'Caja sin cerrar']),
    o('plant', 300, 36, 16, 22, 'plant', ['Last plant', 'La última planta']), o('cup', 222, 40, 8, 8, 'cup', ['Cold cup', 'Taza fría'], { solid: false }),
    o('bills', 250, 130, 30, 18, 'papers', ['Receipts and drafts', 'Recibos y borradores'], { solid: false }),
    o('letter', 170, 186, 14, 10, 'letter', ['Letter', 'Carta'], { solid: false, show: s => s.knock && !s.letter }), door('exit', 168, 200, ['Door to town', 'Puerta al pueblo'])] },
  town: { w: 44, h: 26, floor: 'grass', spawn: [120, 150], name: ['Town · The Garden of Orbits', 'Pueblo · El jardín de las órbitas'], objs: [
    o('h_home', 80, 60, 80, 56, 'house', null, { color: C.purple }), door('d_home', 112, 100, ["Lum's home", 'Casa de Lum']),
    o('h_pip', 280, 50, 88, 60, 'house', null, { color: C.gold }), door('d_pip', 316, 94, ["Pip's workshop", 'Taller de Pip']),
    o('h_eko', 540, 60, 80, 62, 'house', null, { color: C.blue, dish: true }), door('d_eko', 572, 106, ["Eko's station", 'Estación de Eko']),
    o('fence', 60, 300, 120, 8, 'fence', null), door('d_nim', 112, 292, ["Nim's garden", 'Jardín de Nim'], { kind: 'gate' }),
    o('h_lab', 400, 250, 150, 80, 'lab', null), door('d_lab', 467, 314, ['Aurelia Laboratory', 'Laboratorio Aurelia']),
    o('bench', 300, 200, 44, 12, 'bench', ['Town bench', 'Banco del pueblo']), o('pond', 190, 210, 60, 36, 'pond', null), o('sign', 240, 150, 10, 14, 'sign', ['Signpost', 'Letrero']),
    ...[[30, 30], [200, 40], [430, 40], [660, 90], [640, 200], [30, 200], [230, 330], [600, 330], [380, 150], [20, 370], [330, 370], [660, 380]].map((p, i) => o('tree' + i, p[0], p[1] + 18, 14, 10, 'tree', null))] },
  pip: { w: 22, h: 14, floor: 'tile', spawn: [176, 180], name: ["Pip's workshop", 'Taller de Pip'], objs: [
    o('wbench', 40, 34, 110, 22, 'wbench', null), o('radio', 86, 30, 24, 20, 'radio', ['Broken radio', 'Radio averiada']), o('switch', 240, 20, 10, 12, 'switch', ['Power switch', 'Interruptor'], { solid: false }),
    o('pip', 170, 70, 12, 10, 'npc', ['Pip', 'Pip'], { who: 'pip' }), o('shelf', 280, 34, 50, 20, 'shelf', null), door('exit', 168, 200, ['Back to town', 'Volver al pueblo'])] },
  nim: { w: 22, h: 14, floor: 'grass', spawn: [176, 180], name: ["Nim's garden", 'Jardín de Nim'], objs: [
    o('seedbed', 50, 60, 70, 34, 'seedbed', ['Seedbed', 'Semillero']), o('flowers', 220, 60, 80, 30, 'flowers', ['Bumblebees on the flowers', 'Abejorros en las flores'], { solid: false }),
    o('nim', 170, 110, 12, 10, 'npc', ['Nim', 'Nim'], { who: 'nim' }), o('can', 130, 70, 10, 10, 'can', null, { solid: false }), door('exit', 168, 200, ['Back to town', 'Volver al pueblo'], { kind: 'gate' })] },
  eko: { w: 22, h: 14, floor: 'tile', spawn: [176, 180], name: ["Eko's station", 'Estación de Eko'], objs: [
    o('console', 120, 34, 90, 22, 'console', ['Radio console', 'Consola de radio']), o('eko', 240, 80, 12, 10, 'npc', ['Eko', 'Eko'], { who: 'eko' }),
    o('dishin', 40, 40, 30, 30, 'dish', null), o('maps', 270, 22, 50, 14, 'starmap', null, { solid: false }), door('exit', 168, 200, ['Back to town', 'Volver al pueblo'])] },
  lab: { w: 30, h: 16, floor: 'lab', spawn: [240, 210], name: ['Aurelia Laboratory', 'Laboratorio Aurelia'], objs: [
    o('st_bio', 40, 36, 60, 26, 'chamber', ['Biological chamber', 'Cámara biológica']), o('st_eng', 140, 36, 70, 22, 'wbench', ['Engineering bench', 'Banco de ingeniería']),
    o('st_com', 250, 36, 60, 24, 'console', ['Instruments and comms', 'Instrumentos y comunicaciones']), o('st_map', 350, 24, 80, 20, 'trajmap', ['Trajectory map', 'Mapa de trayectorias'], { solid: false }),
    o('st_rev', 200, 120, 80, 28, 'table', ['Review table', 'Mesa de revisión']), o('to_rocket', 440, 110, 16, 30, 'rocketdoor', ['Path to the rocket', 'Camino al cohete']),
    o('pip', 228, 70, 12, 10, 'npc', ['Pip', 'Pip'], { who: 'pip', show: s => s.pip.in }), o('nim', 110, 78, 12, 10, 'npc', ['Nim', 'Nim'], { who: 'nim', show: s => s.nim.in }),
    o('eko', 326, 78, 12, 10, 'npc', ['Eko', 'Eko'], { who: 'eko', show: s => s.eko.in }), door('exit', 232, 232, ['Back to town', 'Volver al pueblo'])] },
  ship: { w: 26, h: 13, floor: 'ship', spawn: [208, 150], name: ['Inside the ship', 'Interior de la nave'], objs: [
    o('command', 170, 34, 76, 22, 'console', ['Command post', 'Puesto de mando']), o('hive', 40, 36, 50, 26, 'chamber', ['Queen chamber', 'Cámara de las reinas']),
    o('systems', 320, 34, 50, 22, 'panel', ['Ship systems', 'Sistemas de la nave']), o('window', 270, 20, 34, 16, 'window', ['Window', 'Ventana'], { solid: false }),
    o('pip', 330, 90, 12, 10, 'npc', ['Pip', 'Pip'], { who: 'pip' }), o('nim', 70, 96, 12, 10, 'npc', ['Nim', 'Nim'], { who: 'nim' }), o('eko', 250, 130, 12, 10, 'npc', ['Eko', 'Eko'], { who: 'eko' })] },
  green: { w: 26, h: 14, floor: 'green', spawn: [208, 180], name: ['Mars greenhouse (hypothetical)', 'Invernadero marciano (hipotético)'], objs: [
    o('g0', 40, 40, 50, 26, 'chamber', ['Wake the colony', 'Despertar la colonia']), o('g1', 130, 36, 40, 22, 'panel', ['Greenhouse climate', 'Clima del invernadero']),
    o('g2', 220, 44, 80, 30, 'planter', ['Flower beds', 'Camas de flores']), o('g3', 330, 36, 50, 22, 'console', ['Share the results', 'Compartir resultados']),
    o('pip', 150, 110, 12, 10, 'npc', ['Pip', 'Pip'], { who: 'pip' }), o('nim', 250, 110, 12, 10, 'npc', ['Nim', 'Nim'], { who: 'nim' }), o('eko', 340, 110, 12, 10, 'npc', ['Eko', 'Eko'], { who: 'eko' }),
    o('finish', 200, 196, 16, 22, 'door', ['Write the paper', 'Escribir el paper'], { show: s => s.greenDone })] }
};

export class World {
  constructor(hooks) {
    this.h = hooks; this.cv = document.createElement('canvas'); this.cv.width = VW; this.cv.height = VH; this.cv.className = 'world'; this.cx = this.cv.getContext('2d');
    this.keys = new Set(); this.p = { x: 0, y: 0, dir: 1, walk: 0 }; this.room = null; this.path = null; this.target = null; this.near = null; this.t = 0; this.speed = 74; this.fade = 0; this.cam = { x: 0, y: 0 };
    this.cv.addEventListener('pointerdown', e => this.click(e));
    let last = performance.now(); const loop = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (this.h.active()) this.update(dt); if (this.h.visible() && this.room) this.draw(); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  }
  get R() { return ROOMS[this.room]; }
  objs() { const s = this.h.state(); return this.R.objs.filter(q => !q.show || q.show(s)); }
  enter(room, x, y) { this.room = room; const r = ROOMS[room]; this.p.x = x ?? r.spawn[0]; this.p.y = y ?? r.spawn[1]; this.path = null; this.target = null; this.fade = 1; this.keys.clear(); this.h.onRoom(room); }
  // ---- collisions (player box 10×6 around the feet)
  solidAt(x, y) {
    const r = this.R, tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (tx < 1 || ty < 2 || tx >= r.w - 1 || ty >= r.h - 1) return true;
    for (const q of this.objs()) if (q.solid && x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h) return true;
    return false;
  }
  blocked(x, y) { return this.solidAt(x - 5, y - 5) || this.solidAt(x + 4, y - 5) || this.solidAt(x - 5, y) || this.solidAt(x + 4, y); }
  tileFree(tx, ty) { const x = tx * TS + 8, y = ty * TS + 11; return !this.blocked(x, y); }
  // ---- path-finding: breadth-first search on the tile grid, to the free tile closest to the object
  findPath(q) {
    const r = this.R, sx = Math.floor(this.p.x / TS), sy = Math.floor((this.p.y - 3) / TS), key = (a, b) => a + b * r.w, prev = new Map([[key(sx, sy), -1]]), queue = [[sx, sy]];
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2; let best = null, bd = 1e9;
    while (queue.length) {
      const [x, y] = queue.shift(), px = x * TS + 8, py = y * TS + 11, dx = Math.max(q.x - px, 0, px - (q.x + q.w)), dy = Math.max(q.y - py, 0, py - (q.y + q.h)), d = Math.hypot(dx, dy) + Math.hypot(px - cx, py - cy) * 0.01;
      if (d < bd) { bd = d; best = [x, y]; }
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay, k = key(nx, ny); if (nx < 0 || ny < 0 || nx >= r.w || ny >= r.h || prev.has(k) || !this.tileFree(nx, ny)) continue; prev.set(k, key(x, y)); queue.push([nx, ny]); }
    }
    if (!best) return null; const out = []; let k = key(best[0], best[1]);
    while (k !== -1 && k !== undefined) { out.unshift([(k % r.w) * TS + 8, Math.floor(k / r.w) * TS + 11]); k = prev.get(k); }
    out.shift(); return out;
  }
  goTo(id) { const q = this.objs().find(z => z.id === id); if (!q) return false; this.target = id; this.path = this.findPath(q) || []; return true; }
  click(e) {
    if (!this.h.active()) return; const b = this.cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * VW + this.cam.x, y = (e.clientY - b.top) / b.height * VH + this.cam.y;
    const q = this.objs().filter(z => z.name).find(z => x >= z.x - 4 && x < z.x + z.w + 4 && y >= z.y - 14 && y < z.y + z.h + 4);
    if (q) this.goTo(q.id); else { this.target = null; this.path = this.findPath({ x: x - 1, y: y - 1, w: 2, h: 2 }); }
  }
  dist(q) { const px = this.p.x, py = this.p.y - 3; return Math.hypot(Math.max(q.x - px, 0, px - (q.x + q.w)), Math.max(q.y - py, 0, py - (q.y + q.h))); }
  update(dt) {
    this.t += dt; if (this.fade > 0) this.fade = Math.max(0, this.fade - dt * 3);
    const k = this.keys; let dx = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0), dy = (k.has('down') ? 1 : 0) - (k.has('up') ? 1 : 0);
    if (dx || dy) { this.path = null; this.target = null; }
    else if (this.path && this.path.length) { const [wx, wy] = this.path[0], ex = wx - this.p.x, ey = wy - this.p.y, d = Math.hypot(ex, ey); if (d < 2) { this.path.shift(); this.stuck = 0; } else { dx = ex / d; dy = ey / d; } }
    else if (this.path) { this.path = null; if (this.target) { const id = this.target; this.target = null; const q = this.objs().find(z => z.id === id); if (q && this.dist(q) < 26) this.h.interact(id); } }
    const ox = this.p.x, oy = this.p.y;
    if (dx || dy) { const n = Math.hypot(dx, dy), s = this.speed * dt; dx = dx / n * s; dy = dy / n * s;   // same speed on diagonals
      if (!this.blocked(this.p.x + dx, this.p.y)) this.p.x += dx; if (!this.blocked(this.p.x, this.p.y + dy)) this.p.y += dy;   // slide along the free axis
      if (Math.abs(dx) > 0.01) this.p.dir = dx > 0 ? 1 : -1; this.p.walk += dt * 9; } else this.p.walk = 0;
    if (this.path && this.path.length && Math.hypot(this.p.x - ox, this.p.y - oy) < 0.05) { this.stuck = (this.stuck || 0) + dt; if (this.stuck > 0.5) { this.path = []; this.stuck = 0; } }
    let near = null, nd = 20; for (const q of this.objs()) if (q.name) { const d = this.dist(q); if (d < nd) { nd = d; near = q; } }
    if ((near && near.id) !== (this.near && this.near.id)) { this.near = near; this.h.onNear(near); }
    const r = this.R, W = r.w * TS, H = r.h * TS; this.cam.x = W <= VW ? (W - VW) / 2 : Math.max(0, Math.min(W - VW, this.p.x - VW / 2)); this.cam.y = H <= VH ? (H - VH) / 2 : Math.max(0, Math.min(H - VH, this.p.y - VH / 2));
  }
  // ---- drawing
  draw() {
    const c = this.cx, r = this.R, st = this.h.state(), t = this.t, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    c.setTransform(1, 0, 0, 1, 0, 0); R(0, 0, VW, VH, '#0b0f1a'); c.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));
    const F = { wood: ['#a67c52', '#9a7149'], tile: ['#5d6a8a', '#566283'], grass: ['#4f9a5e', '#478f56'], lab: ['#d8c9e6', '#cbbbdc'], ship: ['#39456b', '#334064'], green: ['#b9764c', '#ad6c44'] }[r.floor];
    const out = r.floor === 'grass';
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const edge = x < 1 || x >= r.w - 1 || y >= r.h - 1, top = y < 2;
      if (out) { R(x * TS, y * TS, TS, TS, F[(x + y) % 2]); if (edge || top) { R(x * TS, y * TS, TS, TS, '#2f6f45'); R(x * TS + 3, y * TS + 3, 10, 9, '#3c8553'); } else if ((x * 7 + y * 13) % 11 === 0) R(x * TS + 5, y * TS + 6, 2, 2, '#ffe9a8'); }
      else if (top) { R(x * TS, y * TS, TS, TS, y === 0 ? C.wall2 : C.wall); if (y === 1) R(x * TS, y * TS + 13, TS, 3, C.wall2); }
      else if (edge) R(x * TS, y * TS, TS, TS, C.wall2);
      else { R(x * TS, y * TS, TS, TS, F[(x + y) % 2]); if (r.floor === 'wood') R(x * TS, y * TS + 15, TS, 1, '#8a6440'); }
    }
    if (this.room === 'town') { R(110, 124, 16, 190, '#d9c28f'); R(110, 180, 370, 14, '#d9c28f'); R(316, 118, 16, 70, '#d9c28f'); R(572, 130, 16, 60, '#d9c28f'); R(466, 180, 16, 140, '#d9c28f'); R(466, 180, 122, 14, '#d9c28f'); }
    if (r.floor === 'green') { for (let i = 0; i < 26; i++) R(i * 16, 26, 1, 6, '#ffffff33'); R(16, 30, (r.w - 2) * TS, 2, '#ffffff55'); }
    const list = this.objs().map(q => ({ q, z: q.y + q.h })); list.push({ me: true, z: this.p.y });
    list.sort((a, b) => a.z - b.z);
    for (const it of list) { if (it.me) this.person(this.p.x, this.p.y, 'lum', this.p.dir, this.p.walk, st.carry); else this.obj(it.q, st, R, t); }
    if (this.near) { const q = this.near, bx = q.x + q.w / 2, by = q.y - 12 + Math.sin(t * 5) * 1.5; R(bx - 5, by - 5, 10, 10, C.ink); R(bx - 4, by - 4, 8, 8, C.gold); c.fillStyle = C.ink; c.font = '8px monospace'; c.fillText('E', bx - 2.5, by + 3); }
    if (this.path && this.path.length) { const w = this.path[this.path.length - 1]; R(w[0] - 2, w[1] - 1, 4, 2, '#ffffff88'); }
    c.setTransform(1, 0, 0, 1, 0, 0); if (st.dim) R(0, 0, VW, VH, `rgba(10,12,30,${st.dim})`); if (st.alarm) R(0, 0, VW, VH, `rgba(194,69,60,${0.12 + Math.sin(t * 8) * 0.08})`); if (this.fade > 0) R(0, 0, VW, VH, `rgba(0,0,0,${this.fade})`);
  }
  person(x, y, who, dir = 1, walk = 0, carry) {
    const c = this.cx, L = LOOK[who], R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), w, h); }, s = walk ? Math.round(Math.sin(walk)) : 0, bob = walk ? Math.abs(s) : 0;
    c.fillStyle = '#00000044'; c.fillRect(Math.round(x - 5), Math.round(y - 1), 10, 3);
    R(-3, -4 + (s > 0 ? -1 : 0), 2, 4, C.dark); R(1, -4 + (s < 0 ? -1 : 0), 2, 4, C.dark);
    R(-5, -12 - bob, 10, 9, C.ink); R(-4, -11 - bob, 8, 7, C.cream);                       // body
    R(-6, -22 - bob, 12, 11, C.ink); R(-5, -21 - bob, 10, 9, C.cream);                     // head
    R(dir > 0 ? 0 : -3, -17 - bob, 1, 2, C.dark); R(dir > 0 ? 3 : 0, -17 - bob, 1, 2, C.dark);  // eyes
    if (L.acc === 'scarf') { R(-5, -12 - bob, 10, 2, L.color); R(dir > 0 ? -6 : 4, -11 - bob, 2, 5, L.color); }
    if (L.acc === 'glasses') { R(-4, -18 - bob, 9, 1, C.dark); R(dir > 0 ? -1 : -4, -18 - bob, 3, 3, L.color); R(dir > 0 ? 2 : -1, -18 - bob, 3, 3, L.color); R(-4, -9 - bob, 8, 2, L.color); }
    if (L.acc === 'sprout') { R(-1, -25 - bob, 1, 3, C.dgreen); R(-4, -26 - bob, 3, 2, L.color); R(0, -27 - bob, 3, 2, L.color); R(-4, -9 - bob, 8, 2, L.color); }
    if (L.acc === 'phones') { R(-6, -23 - bob, 12, 1, C.dark); R(-7, -19 - bob, 2, 5, L.color); R(5, -19 - bob, 2, 5, L.color); R(-4, -9 - bob, 8, 2, L.color); }
    if (carry) { R(dir > 0 ? 4 : -9, -11 - bob, 5, 6, C.honey); R(dir > 0 ? 5 : -8, -10 - bob, 3, 1, C.cream); }
  }
  portrait(cv, who) { const old = this.cx; this.cx = cv.getContext('2d'); this.cx.imageSmoothingEnabled = false; this.cx.clearRect(0, 0, cv.width, cv.height); if (who === 'queen') this.bee(10, 14, 0, true); else this.person(10, 26, who === 'you' ? 'lum' : who, 1, 0); this.cx = old; }
  bee(x, y, t, sleep) { const c = this.cx, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), w, h); }; const f = sleep ? 0 : Math.round(Math.sin(t * 30)); R(-4, -3, 8, 6, C.ink); R(-3, -2, 6, 4, C.gold); R(-1, -2, 1, 4, C.ink); R(1, -2, 1, 4, C.ink); R(-3, -5 + f, 3, 2, '#ffffffcc'); R(0, -5 - f, 3, 2, '#ffffffcc'); if (sleep) R(-3, -1, 1, 1, C.ink); }
  obj(q, st, R, t) {
    const { x, y, w, h } = q, c = this.cx, k = q.kind, B = (col, col2) => { R(x, y, w, h, C.ink); R(x + 1, y + 1, w - 2, h - 2, col); if (col2) R(x + 1, y + h - 5, w - 2, 4, col2); };
    if (k === 'npc') return this.person(x + 6, y + 9, q.who, this.p.x > x ? 1 : -1, 0);
    if (k === 'door' || k === 'gate') { if (k === 'gate') { R(x, y + 6, w, 16, C.wood2); R(x + 2, y + 8, 3, 12, C.wood); R(x + 7, y + 8, 3, 12, C.wood); R(x + 12, y + 8, 2, 12, C.wood); } else { R(x - 1, y - 1, w + 2, h + 1, C.ink); R(x, y, w, h, C.wood2); R(x + 2, y + 2, w - 4, h - 4, C.wood); R(x + w - 5, y + 11, 2, 2, C.gold); } return; }
    if (k === 'bed') { B('#6d7fb0'); R(x + 3, y + 3, w - 6, 12, C.cream); return; }
    if (k === 'desk') { B(C.wood, C.wood2); R(x + 44, y + 3, 10, 8, '#33405e'); if (st.nb === 2) { R(x + 12, y + 4, 12, 9, C.ink); R(x + 13, y + 5, 10, 7, C.honey); R(x + 15, y + 7, 6, 1, C.cream); } else R(x + 12, y + 4, 12, 9, '#c9a57a'); return; }
    if (k === 'box') { B('#c9a57a', '#a8845c'); R(x + 2, y - 3, 9, 4, '#b8946a'); R(x + 15, y - 3, 9, 4, '#b8946a'); if (!st.nb) { R(x + 9, y - 5, 9, 8, C.ink); R(x + 10, y - 4, 7, 6, C.honey); } return; }
    if (k === 'plant') { R(x + 3, y + 12, 10, 10, C.ink); R(x + 4, y + 13, 8, 8, '#b5654a'); const g = st.plant ? C.green : '#8a8f5a', d = st.plant ? 0 : 4; R(x + 7, y + 3 + d, 2, 10 - d, C.dgreen); R(x + 2, y + 2 + d, 5, 4, g); R(x + 9, y + d, 5, 5, g); if (st.plant) R(x + 5, y - 3, 5, 4, g); return; }
    if (k === 'cup') { R(x, y, 7, 7, C.ink); R(x + 1, y + 1, 5, 5, C.cream); R(x + 2, y + 2, 3, 2, '#5a4634'); return; }
    if (k === 'papers') { for (let i = 0; i < 4; i++) { R(x + i * 7, y + (i % 2) * 5, 9, 11, C.cream); R(x + i * 7, y + (i % 2) * 5, 9, 2, C.red); } return; }
    if (k === 'letter') { const b = Math.sin(t * 4); R(x - 1, y - 1 + b, w + 2, h + 2, C.gold); R(x, y + b, w, h, C.cream); R(x + 5, y + 3 + b, 4, 4, C.honey); return; }
    if (k === 'house' || k === 'lab') { R(x, y + 14, w, h - 14, C.ink); R(x + 1, y + 15, w - 2, h - 16, k === 'lab' ? '#e6dcf2' : C.cream); R(x - 4, y, w + 8, 18, C.ink); R(x - 3, y + 1, w + 6, 16, q.color || C.purple);
      R(x + 10, y + 26, 14, 12, '#33405e'); R(x + w - 24, y + 26, 14, 12, '#33405e'); if (q.dish) { R(x + w - 16, y - 12, 12, 8, C.gray); R(x + w - 11, y - 4, 2, 6, C.dark); }
      if (k === 'lab') { R(x + 50, y + 4, 50, 10, C.ink); c.fillStyle = C.gold; c.font = '8px monospace'; c.fillText('AURELIA', x + 56, y + 12); R(x + w - 30, y - 30, 10, 32, C.cream); R(x + w - 28, y - 36, 6, 8, C.honey); } return; }
    if (k === 'tree') { R(x + 4, y - 4, 6, 14, '#6b4a32'); R(x - 6, y - 26, 26, 22, C.ink); R(x - 5, y - 25, 24, 20, '#2f7a4a'); R(x - 1, y - 22, 9, 7, '#3f9a5f'); return; }
    if (k === 'fence') { for (let i = 0; i < w; i += 10) if (i < 46 || i > 68) R(x + i, y, 6, 10, C.wood); return; }
    if (k === 'bench') { B(C.wood, C.wood2); if (st.bench) { ['pip', 'nim', 'eko'].forEach((n, i) => this.person(x + 8 + i * 12, y + 8, n, 1, 0)); } return; }
    if (k === 'pond') { R(x, y, w, h, '#2c5d8a'); R(x + 2, y + 2, w - 4, h - 4, '#4f8fc0'); R(x + 10 + Math.sin(t) * 4, y + 10, 12, 2, '#9cc8ea'); return; }
    if (k === 'sign') { R(x + 4, y + 4, 2, 10, C.wood2); R(x, y, 10, 7, C.ink); R(x + 1, y + 1, 8, 5, C.cream); return; }
    if (k === 'wbench') { B(C.wood, C.wood2); R(x + 6, y + 4, 10, 3, C.gray); R(x + w - 20, y + 3, 4, 8, C.red); R(x + w - 14, y + 3, 4, 8, C.blue); return; }
    if (k === 'shelf') { B('#7a5a3a'); for (let i = 0; i < 4; i++) R(x + 4 + i * 11, y + 4, 8, 10, [C.red, C.blue, C.gold, C.green][i]); return; }
    if (k === 'radio') { R(x + 18, y - 10, 1, 10, C.gray); B('#4a5578'); R(x + 3, y + 4, 8, 8, C.dark); R(x + 14, y + 5, 6, 3, st.pip.on === 2 ? C.green : st.pip.off ? '#333' : (Math.sin(t * 20) > 0 ? C.red : C.gold)); if (st.pip.on === 2 && Math.sin(t * 6) > 0) R(x + 22, y - 12, 3, 2, C.teal); return; }
    if (k === 'switch') { R(x, y, w, h, C.ink); R(x + 1, y + 1, w - 2, h - 2, C.gray); R(x + 3, st.pip.off && st.pip.on !== 2 ? y + 7 : y + 2, 4, 4, st.pip.off && st.pip.on !== 2 ? C.red : C.green); return; }
    if (k === 'seedbed') { B(C.soil); for (let i = 0; i < 5; i++) { R(x + 8 + i * 12, y + 8, 6, 2, '#4d3524'); R(x + 8 + i * 12, y + 20, 6, 2, '#4d3524'); if (st.nim.water) { R(x + 10 + i * 12, y + 4, 2, 5, C.green); R(x + 10 + i * 12, y + 16, 2, 5, C.green); R(x + 8 + i * 12, y + 4, 2, 2, C.green); } } return; }
    if (k === 'flowers') { for (let i = 0; i < 8; i++) { const fx = x + 5 + i * 10, fy = y + 8 + (i % 3) * 7; R(fx + 1, fy + 3, 1, 6, C.dgreen); R(fx, fy, 4, 4, i % 2 ? C.purple : C.gold); } for (let i = 0; i < 3; i++) this.bee(x + 20 + i * 22 + Math.sin(t * 1.3 + i * 2) * 10, y + 6 + Math.cos(t * 1.7 + i) * 6, t); return; }
    if (k === 'can') { R(x, y + 2, 8, 7, C.ink); R(x + 1, y + 3, 6, 5, C.teal); R(x + 7, y + 3, 3, 2, C.teal); return; }
    if (k === 'console') { B('#4a5578', '#333d5c'); R(x + 6, y + 3, w - 30, 9, C.dark); R(x + 8, y + 5, 8 + Math.abs(Math.sin(t * 2)) * (w - 48), 2, C.teal); R(x + w - 18, y + 4, 4, 4, C.red); R(x + w - 10, y + 4, 4, 4, C.gold); return; }
    if (k === 'dish') { R(x + 13, y + 14, 4, 16, C.dark); R(x, y, 30, 14, C.ink); R(x + 1, y + 1, 28, 12, C.gray); R(x + 12, y + 4, 6, 4, C.cream); return; }
    if (k === 'starmap' || k === 'trajmap') { R(x, y, w, h, C.ink); R(x + 1, y + 1, w - 2, h - 2, '#22305a'); R(x + 8, y + h / 2, 3, 3, C.blue); R(x + w - 12, y + 4, 3, 3, C.mars); c.strokeStyle = C.gold; c.beginPath(); c.arc(x + w / 2, y + h + 6, w / 2 - 8, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); return; }
    if (k === 'chamber') { B('#6c7aa6', '#4a5578'); R(x + 6, y + 3, w - 12, h - 10, '#bfe6ee'); R(x + 6, y + 3, w - 12, 2, '#ffffffaa'); const n = Math.max(1, Math.min(3, Math.floor((w - 12) / 12))); for (let i = 0; i < n; i++) this.bee(x + 14 + i * 12, y + h / 2, t, !st.awake); return; }
    if (k === 'table') { B(C.wood, C.wood2); R(x + 8, y + 5, 14, 10, C.cream); R(x + 30, y + 4, 18, 12, '#22305a'); R(x + 56, y + 6, 12, 9, C.cream); return; }
    if (k === 'rocketdoor') { R(x, y, w, h, C.ink); R(x + 1, y + 1, w - 2, h - 2, '#2a2540'); R(x + 6, y + 6, 4, 14, C.cream); R(x + 5, y + 3, 6, 4, C.honey); R(x + 4, y + 20, 8, 3, C.red); return; }
    if (k === 'panel') { B('#4a5578', '#333d5c'); for (let i = 0; i < 4; i++) R(x + 5 + i * 10, y + 4, 6, 6, [C.green, C.gold, C.teal, st.alarm ? C.red : C.green][i]); return; }
    if (k === 'window') { R(x, y, w, h, C.ink); R(x + 1, y + 1, w - 2, h - 2, '#0b0f1a'); for (let i = 0; i < 6; i++) R(x + 3 + (i * 11 + Math.floor(t * 3)) % (w - 6), y + 3 + (i * 5) % (h - 6), 1, 1, '#fff'); const m = (st.prog || 0) * 8; R(x + w - 10 - m / 2, y + h / 2 - m / 2, 2 + m, 2 + m, C.mars); return; }
    if (k === 'planter') { B(C.soil); const lit = st.gstep > 2; for (let i = 0; i < 6; i++) { R(x + 8 + i * 12, y + 8, 2, 12, C.dgreen); R(x + 6 + i * 12, y + 6, 6, 5, lit ? C.gold : '#7d8a55'); } if (lit) { R(x, y - 8, w, 2, '#fff7c2'); if (st.awake) this.bee(x + 20 + Math.sin(t * 1.5) * 16, y + 4 + Math.cos(t * 2) * 3, t); } return; }
    B(C.gray);
  }
}
