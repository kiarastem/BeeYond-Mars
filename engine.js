// BeeYond Mars — rules and data (no DOM here, so it can be tested with Node).
// Labels: VERIFIED = cited source · TEAM = team model · SIMPLIFIED = adjusted for play.
// Bilingual strings are [English, Spanish].

import { ROUTE_DATA } from './route-data.js';

export const CFG = {
  budget: 2000,          // TEAM: starting grant from Aurelia (fictional agency)
  grants: [150, 200],    // fictional stage funding, CML-inspired (JPL)
  dvPerKg: 0.008,        // TEAM: delta-v penalty per kg (90 kg -> 0.72 km/s)
  // solar power follows 1/r² along the route (route-data.js)
  batteryWh: 1600,       // SIMPLIFIED
  stageDays: 30,
  baseTemp: 2.5,         // Yoon et al. 2010 (single lab study)
  baseHum: 70,
  criticalRisk: 80,
  decisionSeconds: 0
};

// role: 0 Engineering, 1 Biology, 2 Communications, 3 Mission Lead
export const ROLES = [['Engineering', 'Ingeniería'], ['Biology', 'Biología'], ['Communications', 'Comunicaciones'], ['Mission Lead', 'Dirección']];

export const ITEMS = [
  { id: 'chamberA', role: 1, kind: 'chamber', cost: 150, kg: 135, w: 200, gen: 0, icon: 'chamber_b', name: ['Chamber A · Economy', 'Cámara A · Económica'],
    desc: ['Fits the base power. Heavy, and weak at holding temperature: expect at least two heat alarms.', 'Cabe en la energía base. Pesada y débil para mantener la temperatura: espera al menos dos alarmas de calor.'] },
  { id: 'chamberB', role: 1, kind: 'chamber', cost: 300, kg: 90, w: 500, gen: 0, icon: 'chamber_a', name: ['Chamber B · Vanguard', 'Cámara B · Vanguardia'],
    desc: ['Active control at 2.5 °C and 70% humidity. No heat trouble, but it uses almost all the base power.', 'Control activo a 2,5 °C y 70 % de humedad. Sin problemas de calor, pero usa casi toda la energía base.'] },
  { id: 'panels', role: 0, kind: 'power', cost: 400, kg: 70, w: 0, gen: 400, icon: 'solar_panels', name: ['Extra solar panels', 'Paneles solares extra'],
    desc: ['+400 W. Needed when your systems use more than the rocket gives.', '+400 W. Necesarios cuando tus sistemas usan más de lo que da el cohete.'] },
  { id: 'thermal', role: 0, kind: 'sensor', cost: 150, kg: 0.3, w: 20, gen: 0, icon: 'backup_sensors', name: ['Redundant thermal sensor', 'Sensor térmico redundante'],
    desc: ['Catches heat alarms in time and self-regulates (+10 W while it works).', 'Detecta a tiempo las alarmas de calor y se autorregula (+10 W mientras actúa).'] },
  { id: 'toolkit', role: 0, kind: 'tools', cost: 150, kg: 20, w: 5, gen: 0, icon: 'tools', name: ['Repair toolkit', 'Kit de reparación'],
    desc: ['Two repair actions for impacts or heat alarms.', 'Dos acciones de reparación para impactos o alarmas de calor.'] },
  { id: 'antenna', role: 2, kind: 'comms', cost: 300, kg: 60, w: 80, gen: 0, icon: 'antenna', name: ['High-gain antenna', 'Antena de alta ganancia'],
    desc: ["Keeps the link with NASA's Deep Space Network. Heavy.", 'Mantiene el enlace con la Deep Space Network de la NASA. Pesada.'] },
  { id: 'backup', role: 2, kind: 'comms', cost: 150, kg: 25, w: 40, gen: 0, icon: 'radio', name: ['Backup comms', 'Comunicaciones de respaldo'],
    desc: ['Takes over by itself if a solar storm cuts the main link.', 'Toma el control sola si una tormenta solar corta el enlace principal.'] },
  { id: 'dosimeter', role: 2, kind: 'science', cost: 50, kg: 0.3, w: 10, gen: 0, icon: 'dosimeter', name: ['Radiation dosimeter', 'Dosímetro de radiación'],
    desc: ['Measures cosmic radiation: extra science and an early storm warning. It does not shield.', 'Mide la radiación cósmica: ciencia extra y aviso temprano de tormentas. No protege.'] }
];

// TEAM model: three fictional launchers that differ in payload, power and delta-v.
export const LAUNCHERS = [
  { id: 'scout', name: ['Scout', 'Scout'], cost: 0, cap: 190, power: 520, own: 10, dv: 6.8,
    desc: ['Free. Small payload and little power: every watt and kilo counts.', 'Gratis. Poca carga y poca energía: cada watt y cada kilo cuentan.'] },
  { id: 'aurelia', name: ['Aurelia', 'Aurelia'], cost: 200, cap: 250, power: 600, own: 0, dv: 7.0,
    desc: ['The middle option: 250 kg and 600 W at Earth distance.', 'La opción intermedia: 250 kg y 600 W a la distancia de la Tierra.'] },
  { id: 'atlas', name: ['Atlaswing', 'Atlaswing'], cost: 600, cap: 400, power: 1000, own: 50, dv: 9.2,
    desc: ['Carries everything with power to spare, but costs 600 credits and uses 50 W itself.', 'Lleva de todo y con energía de sobra, pero cuesta 600 créditos y consume 50 W propios.'] }
];
export const sunFactor = (routeId, day) => { const a = ROUTE_DATA[routeId].f; return a[Math.max(0, Math.min(a.length - 1, Math.round(day)))]; };
export const routeSample = (routeId, day) => { const d = ROUTE_DATA[routeId], i = Math.max(0, Math.min(d.f.length - 1, Math.round(day))); return { f: d.f[i], s: d.s[i], km: d.km[i] }; };

// VERIFIED: NASA Ames Trajectory Browser (team query, 2030–2031 window).
export const ROUTES = [
  { id: 'standard', name: ['Route 1 · Standard transfer', 'Ruta 1 · Transferencia estándar'], days: 288, dv: 4.79, inj: 3.68, post: 1.11, depart: '2030-12-21', arrive: '2031-10-05',
    note: ['Easier manoeuvre, 16 more days of exposure.', 'Maniobra más fácil, 16 días más de exposición.'] },
  { id: 'fast', name: ['Route 2 · Fast transfer', 'Ruta 2 · Transferencia rápida'], days: 272, dv: 4.84, inj: 3.71, post: 1.13, depart: '2030-12-21', arrive: '2031-09-19',
    note: ['Shorter trip, a bit more delta-v.', 'Viaje más corto, un poco más de delta-v.'] }
];

export const SOURCES = [
  { tag: 'NASA', title: 'NASA Ames Trajectory Browser', url: 'https://trajbrowser.arc.nasa.gov/traj_browser.php', use: ['Dates, days and delta-v of both routes. Launch is blocked if your delta-v is too low.', 'Fechas, días y delta-v de ambas rutas. El despegue se bloquea si tu delta-v no alcanza.'] },
  { tag: 'NASA', title: 'NASA Science · How long does it take to get to Mars?', url: 'https://www.nasa.gov/directorates/smd/how-long-does-it-take-to-get-to-the-moon-mars-jupiter-we-asked-a-nasa-expert-episode-51/', use: ['A trip of about 7 to 10 months.', 'Un viaje de unos 7 a 10 meses.'] },
  { tag: 'NASA', title: 'NASA Mars Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html', use: ['Mars gets ~43% of the sunlight Earth gets. Simplified to ×0.85 in the game.', 'Marte recibe ~43 % de la luz que recibe la Tierra. Simplificado a ×0,85 en el juego.'] },
  { tag: 'NASA/JPL', title: 'JPL · Concept Maturity Levels', url: 'https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299', use: ['Design milestones CML 1–4. The funding per milestone is a game rule.', 'Hitos de diseño CML 1–4. Los fondos por hito son una regla del juego.'] },
  { tag: 'ESA', title: 'ESA Mars Express · signal delay', url: 'https://blogs.esa.int/mex/?p=257', use: ['A signal takes about 4 to 24 minutes one way.', 'Una señal tarda entre 4 y 24 minutos en un sentido.'] },
  { tag: 'NASA/NASM', title: 'Smithsonian · Bee Enclosure Module, STS-41-C (1984)', url: 'https://airandspace.si.edu/collection-objects/bee-enclosure-module-sts-41-c/nasm_A19880031000', use: ['3,300 honeybees built comb in orbit. Inspiration, not proof for bumblebees.', '3.300 abejas construyeron panal en órbita. Inspiración, no prueba para abejorros.'] },
  { tag: 'PAPER', title: 'Velthuis & van Doorn (2006), Apidologie', url: 'https://typeset.io/pdf/a-century-of-advances-in-bumblebee-domestication-and-the-3ycj51myxa.pdf', use: ['Bombus terrestris is the standard greenhouse pollinator (tomatoes).', 'Bombus terrestris es el polinizador estándar de invernadero (tomates).'] },
  { tag: 'PAPER', title: 'Alford (1969), cited in Apidologie', url: 'https://link.springer.com/article/10.1007%2Fs13592-017-0529-z', use: ['Queens stay in diapause about 6–9 months on Earth.', 'Las reinas pasan unos 6–9 meses en diapausa en la Tierra.'] },
  { tag: 'PAPER', title: 'Yoon et al. (2010)', url: 'https://koreascience.kr/article/JAKO201028542317554.pdf', use: ['Cold storage at 2.5 °C and ~70% humidity. A lab value, not a space standard.', 'Almacenamiento a 2,5 °C y ~70 % de humedad. Valor de laboratorio, no un estándar espacial.'] },
  { tag: 'PAPER', title: 'Beekman et al. (1998)', url: 'https://conservationevidencejournal.com/individual-study/1690', use: ['Longer diapause lowers survival on Earth. Never used as a space probability.', 'Más diapausa reduce la supervivencia en la Tierra. Nunca se usa como probabilidad espacial.'] },
  { tag: 'TEAM', title: 'Daily route samples (team GMAT run, preliminary)', url: 'https://sourceforge.net/projects/gmat/', use: ['Sun distance, solar power factor (1/r²) and one-way signal delay for every day of both routes. Heliocentric leg only; arrival and landing are not modelled.', 'Distancia al Sol, factor de potencia solar (1/r²) y retardo de señal de ida para cada día de ambas rutas. Solo el tramo heliocéntrico; llegada y aterrizaje no están modelados.'] },
  { tag: 'TEAM', title: 'BeeYond Mars team model', url: '', use: ['Rockets, credits, masses, 0.008 km/s per kg, events and scores are simplified game rules.', 'Cohetes, créditos, masas, 0,008 km/s por kg, eventos y puntajes son reglas simplificadas del juego.'] },
  { tag: 'OPEN', title: 'Open question', url: '', use: ['No study has flown dormant bumblebee queens beyond Earth. Their survival on the way to Mars is unknown.', 'Ningún estudio ha llevado reinas de abejorro en diapausa fuera de la Tierra. Su supervivencia rumbo a Marte es desconocida.'] }
];

// Science album (collectable cards, kept between attempts).
export const CARDS = [
  { id: 'diapause', name: ['Diapause', 'Diapausa'], text: ['Queens sleep through winter for 6–9 months with a very slow metabolism (Alford 1969).', 'Las reinas duermen el invierno 6–9 meses con un metabolismo muy lento (Alford 1969).'] },
  { id: 'cml', name: ['Design reviews', 'Revisiones de diseño'], text: ['JPL teams grow an idea through Concept Maturity Levels before building.', 'Los equipos del JPL maduran una idea por niveles (CML) antes de construir.'] },
  { id: 'dv', name: ['Delta-v', 'Delta-v'], text: ['The speed change a rocket can give. More mass, less delta-v.', 'El cambio de velocidad que puede dar un cohete. Más masa, menos delta-v.'] },
  { id: 'route', name: ['Launch windows', 'Ventanas de lanzamiento'], text: ['The NASA Trajectory Browser finds routes for real planet positions.', 'El Trajectory Browser de la NASA busca rutas para posiciones reales de los planetas.'] },
  { id: 'sun', name: ['Fading sunlight', 'Luz que se apaga'], text: ['Mars gets about 43% of the sunlight Earth gets (NASA).', 'Marte recibe cerca del 43 % de la luz que recibe la Tierra (NASA).'] },
  { id: 'delay', name: ['Signal delay', 'Retraso de señal'], text: ['A message takes 4–24 minutes to reach Mars, so the ship must often decide alone (ESA).', 'Un mensaje tarda 4–24 minutos en llegar a Marte; la nave suele decidir sola (ESA).'] },
  { id: 'dsn', name: ['Deep Space Network', 'Red de Espacio Profundo'], text: ['Three NASA antenna sites around Earth listen to deep-space missions.', 'Tres complejos de antenas de la NASA alrededor de la Tierra escuchan las misiones lejanas.'] },
  { id: 'storm', name: ['Solar storms', 'Tormentas solares'], text: ['Bursts from the Sun can cut radio links and raise radiation.', 'Las erupciones del Sol pueden cortar la radio y subir la radiación.'] },
  { id: 'sts', name: ['Bees in orbit', 'Abejas en órbita'], text: ['In 1984, 3,300 honeybees built comb on the Space Shuttle (STS-41-C).', 'En 1984, 3.300 abejas construyeron panal en el transbordador (STS-41-C).'] },
  { id: 'buzz', name: ['Buzz pollination', 'Polinización por zumbido'], text: ['Bumblebees shake tomato flowers to release pollen (Velthuis & van Doorn 2006).', 'Los abejorros hacen vibrar la flor del tomate para soltar el polen (Velthuis y van Doorn 2006).'] },
  { id: 'protect', name: ['Planetary protection', 'Protección planetaria'], text: ['Earth life stays inside sealed habitats. Nothing is released on Mars.', 'La vida terrestre se queda en hábitats sellados. Nada se libera en Marte.'] },
  { id: 'open', name: ['The open question', 'La pregunta abierta'], text: ['Nobody knows yet if dormant queens can survive the trip. That is why it is research.', 'Nadie sabe aún si las reinas dormidas sobreviven el viaje. Por eso es investigación.'] }
];

const has = (a, v) => a.includes(v);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const item = id => ITEMS.find(i => i.id === id);
export const launcher = g => LAUNCHERS.find(l => l.id === g.launcher);
export const route = g => ROUTES.find(r => r.id === g.route);

export function fresh(players = 1, seed = 1234, name = 'Alex', queen = 'Miel') {
  return { phase: 'lab', players: clamp(players, 1, 4), name, queen, parts: [], launcher: 'scout', route: 'standard', grants: [], compared: [],
    day: 0, log: [], flight: null, green: null, attempt: 1, seed, rng: seed };
}
function rnd(g) { g.rng = (g.rng * 9301 + 49297) % 233280; return g.rng / 233280; }
function log(g, en, es) { g.log.push({ day: g.day, en, es }); }

export function stats(g) {
  const l = launcher(g); let cost = l.cost, kg = 0, use = l.own, power = l.power;
  for (const id of g.parts) { const it = item(id); cost += it.cost; kg += it.kg; use += it.w; power += it.gen; }
  if (g.flight) use += g.flight.extraW;
  const budget = CFG.budget - cost + g.grants.reduce((a, i) => a + CFG.grants[i], 0);
  return { cost, kg: Math.round(kg * 10) / 10, use, power, af: sunFactor(g.route, route(g).days), arrival: power * sunFactor(g.route, route(g).days), dv: l.dv - kg * CFG.dvPerKg, budget, cap: l.cap };
}
export const hasChamber = g => has(g.parts, 'chamberA') || has(g.parts, 'chamberB');

export function errors(g) {
  const t = stats(g), r = route(g), e = [];
  if (!hasChamber(g)) e.push(['Choose a chamber for the queens.', 'Elige una cámara para las reinas.']);
  if (t.kg > t.cap) e.push([`Mass ${t.kg} kg is over the ${t.cap} kg this rocket lifts.`, `La masa de ${t.kg} kg supera los ${t.cap} kg que levanta este cohete.`]);
  if (t.use > t.power) e.push([`You use ${t.use} W but generate ${t.power} W: add solar panels.`, `Usas ${t.use} W pero generas ${t.power} W: agrega paneles solares.`]);
  else if (t.use > t.arrival) e.push([`Near Mars you will generate only ${Math.round(t.arrival)} W (×${t.af.toFixed(2)}) for ${t.use} W of use.`, `Cerca de Marte generarás solo ${Math.round(t.arrival)} W (×${t.af.toFixed(2)}) para ${t.use} W de consumo.`]);
  if (hasChamber(g) && !has(g.parts, 'antenna') && !has(g.parts, 'backup')) e.push(['The ship needs a link with Earth: fit the antenna or the backup link.', 'La nave necesita un enlace con la Tierra: instala la antena o el enlace de respaldo.']);
  if (t.dv < r.dv) e.push([`Delta-v ${t.dv.toFixed(2)} km/s is below the ${r.dv} km/s of this NASA route.`, `El delta-v de ${t.dv.toFixed(2)} km/s no alcanza los ${r.dv} km/s de esta ruta de la NASA.`]);
  if (t.budget < 0) e.push(['The design costs more than your funds.', 'El diseño cuesta más que tus fondos.']);
  return e;
}

export function hints(g) {
  const t = stats(g), r = route(g), h = [];
  if (!hasChamber(g)) h.push(['Start with Biology: the queens need a home. Economy is cheap and heavy; Vanguard holds 2.5 °C on its own.', 'Parte por Biología: las reinas necesitan un hogar. La Económica es barata y pesada; la Vanguardia mantiene 2,5 °C sola.']);
  if (t.use > t.arrival) h.push([`Route data: sunlight falls to ×${t.af.toFixed(2)} by arrival. You need ${t.use} W near Mars; panels add 400 W, or pick a rocket with more power.`, `Datos de la ruta: la luz solar baja a ×${t.af.toFixed(2)} al llegar. Necesitas ${t.use} W cerca de Marte; los paneles suman 400 W, o elige un cohete con más energía.`]);
  if (t.kg > t.cap) h.push([`Too heavy by ${(t.kg - t.cap).toFixed(1)} kg. The antenna (60 kg) and panels (70 kg) weigh the most. A bigger rocket also helps.`, `Sobran ${(t.kg - t.cap).toFixed(1)} kg. La antena (60 kg) y los paneles (70 kg) son lo más pesado. Un cohete más grande también ayuda.`]);
  if (t.dv < r.dv) h.push([`NASA Trajectory Browser: this route needs ${r.dv} km/s. Each kg costs 0.008 km/s.`, `NASA Trajectory Browser: esta ruta pide ${r.dv} km/s. Cada kg cuesta 0,008 km/s.`]);
  if (hasChamber(g) && !has(g.parts, 'antenna') && !has(g.parts, 'backup')) h.push(['With no antenna and no backup, one solar storm ends the mission. Ask Communications.', 'Sin antena ni respaldo, una tormenta solar termina la misión. Pregunta a Comunicaciones.']);
  if (has(g.parts, 'chamberA') && !has(g.parts, 'thermal') && !has(g.parts, 'toolkit')) h.push(['The Economy chamber will raise heat alarms. A thermal sensor or a toolkit protects the queens.', 'La cámara Económica dará alarmas de calor. Un sensor térmico o un kit protegen a las reinas.']);
  if (hasChamber(g) && !has(g.parts, 'toolkit')) h.push(['Micrometeorites happen. Without a toolkit the damage keeps growing.', 'Los micrometeoritos existen. Sin kit, el daño sigue creciendo.']);
  if (!h.length) h.push(['Solid design. Keep some credits: unspent funds count at the end.', 'Diseño sólido. Guarda algunos créditos: los fondos sin gastar cuentan al final.']);
  return h;
}

export function milestone(g) {
  if (!errors(g).length && g.grants.length === 2) return 4;
  if (has(g.grants, 1)) return 3;
  if (has(g.grants, 0)) return 2;
  return 1;
}
export function claim(g, i) {
  if (g.phase !== 'lab' || has(g.grants, i)) return false;
  const t = stats(g);
  const ok = i === 0 ? hasChamber(g) && t.use <= t.power && t.kg <= t.cap : has(g.grants, 0) && g.compared.length >= 2;
  if (!ok) return false;
  g.grants.push(i);
  log(g, `Design review CML ${i + 2} passed: Aurelia releases ${CFG.grants[i]} credits.`, `Revisión de diseño CML ${i + 2} aprobada: Aurelia libera ${CFG.grants[i]} créditos.`);
  return true;
}
export function toggle(g, id) {
  if (g.phase !== 'lab') return ['Not in the lab.', 'No estás en el laboratorio.'];
  const p = item(id), old = g.parts.slice();
  if (has(g.parts, id)) g.parts = g.parts.filter(x => x !== id);
  else { if (p.kind === 'chamber') g.parts = g.parts.filter(x => item(x).kind !== 'chamber'); g.parts.push(id); }
  if (stats(g).budget < 0) { g.parts = old; return ['Not enough credits. Pass a design review or remove something.', 'No alcanzan los créditos. Aprueba una revisión de diseño o quita algo.']; }
  return null;
}
export function setLauncher(g, id) {
  const old = g.launcher; g.launcher = id;
  if (stats(g).budget < 0) { g.launcher = old; return false; }
  return true;
}
export function setRoute(g, id) { g.route = id; if (!has(g.compared, id)) g.compared.push(id); }

export const totalDays = g => route(g).days + (g.flight ? g.flight.delay : 0);
export const delayMin = g => Math.round(routeSample(g.route, g.day).s / 6) / 10;

export function launch(g) {
  if (errors(g).length || milestone(g) < 4) return false;
  const r = route(g); g.phase = 'voyage'; g.day = 0; g.rng = g.seed;
  const ev = [];
  if (has(g.parts, 'chamberA')) ev.push({ kind: 'thermal', day: Math.round(r.days * 0.35) }, { kind: 'thermal', day: Math.round(r.days * 0.7) });
  else ev.push({ kind: 'thermal', day: Math.round(r.days * 0.5) });
  ev.push({ kind: 'comms', day: Math.round(r.days * (0.45 + rnd(g) * 0.2)) });
  ev.push({ kind: 'mech', day: Math.round(r.days * (0.2 + rnd(g) * 0.6)) });
  g.flight = { charge: CFG.batteryWh, temp: CFG.baseTemp, hum: CFG.baseHum, risk: 0, data: 0, lost: 0, integrity: 100, damage: 0,
    repairs: has(g.parts, 'toolkit') ? 2 : 0, extraW: 0, delay: 0, lowData: false, commsLost: false, heat: 0, pending: null, pendingI: -1,
    events: ev, done: [], choices: [], stages: [], gen: stats(g).power };
  const t = stats(g);
  log(g, `Launch on ${r.name[0]}. Payload ${t.kg} kg, delta-v ${t.dv.toFixed(2)} km/s. Seed ${g.seed}.`, `Despegue por la ${r.name[1]}. Carga de ${t.kg} kg, delta-v ${t.dv.toFixed(2)} km/s. Semilla ${g.seed}.`);
  return true;
}

function checkEvents(g) {
  const f = g.flight;
  for (let i = 0; i < f.events.length; i++) {
    const e = f.events[i];
    if (has(f.done, i) || e.day > g.day) continue;
    if (e.kind === 'thermal') {
      if (has(g.parts, 'chamberB')) { f.done.push(i); f.choices.push('thermal:vanguard'); f.risk = clamp(f.risk + 1, 0, 100); log(g, 'Heat alarm: the Vanguard chamber corrected it in minutes.', 'Alarma de calor: la cámara Vanguardia la corrigió en minutos.'); continue; }
      if (has(g.parts, 'thermal')) { f.done.push(i); f.choices.push('thermal:sensor'); f.extraW += 10; f.risk = clamp(f.risk + 3, 0, 100); log(g, 'Heat alarm caught in time by the redundant sensor (+10 W).', 'Alarma de calor detectada a tiempo por el sensor redundante (+10 W).'); continue; }
    }
    if (e.kind === 'comms') {
      if (has(g.parts, 'backup')) { f.done.push(i); f.choices.push('comms:backup'); const p = f.data * 0.1; f.data -= p; f.lost += p; log(g, 'Solar storm: signal lost with the Deep Space Network. The backup link took over.', 'Tormenta solar: se perdió la señal con la Deep Space Network. El enlace de respaldo tomó el control.'); continue; }
      if (!has(g.parts, 'antenna')) { f.done.push(i); f.choices.push('comms:none'); f.commsLost = true; log(g, 'Solar storm: no antenna and no backup. Only static. Contact lost for good.', 'Tormenta solar: sin antena ni respaldo. Solo estática. Contacto perdido para siempre.'); g.phase = 'report'; return; }
    }
    f.pending = e.kind; f.pendingI = i; return;
  }
  if (g.day >= totalDays(g)) g.phase = 'report';
}

export function advance(g) {
  const f = g.flight; if (g.phase !== 'voyage' || f.pending) return;
  const t = stats(g), days = Math.min(CFG.stageDays, totalDays(g) - g.day); g.day += days;
  const ratio = Math.min(1, g.day / route(g).days), gen = t.power * sunFactor(g.route, g.day), hours = days * 24;
  f.gen = gen;
  const raw = f.charge + (gen - t.use) * hours; f.charge = clamp(raw, 0, CFG.batteryWh);
  const out = raw < 0; if (out) f.integrity = clamp(f.integrity - 30, 0, 100);
  const vg = has(g.parts, 'chamberB'), drift = vg ? 0.05 : has(g.parts, 'thermal') ? 0.16 : 0.4;
  f.temp = CFG.baseTemp + (f.temp - CFG.baseTemp) * (vg ? 0.18 : 0.65) + drift + (out ? 5 : 0) + f.heat;
  f.hum = clamp(CFG.baseHum + (f.hum - CFG.baseHum) * 0.65 - drift * 2 - (out ? 10 : 0) - f.heat * 2, 0, 100);
  f.risk = clamp(f.risk + (Math.max(0, f.temp - 4) * 5 + Math.max(0, 60 - f.hum) * 0.5 + (vg ? 0 : 1.5)) * days / 30, 0, 100);
  f.integrity = clamp(f.integrity - f.damage, 0, 100);
  const link = has(g.parts, 'antenna') ? 64 : has(g.parts, 'backup') ? 16 : 0;
  const prod = (has(g.parts, 'dosimeter') ? 32 : 24) * (f.lowData ? 0.5 : 1) * days / 30, sent = Math.min(prod, link * days / 30);
  f.data += sent; f.lost += prod - sent;
  f.stages.push({ day: g.day, gen: Math.round(gen), use: t.use, charge: Math.round(f.charge), temp: f.temp, hum: Math.round(f.hum), risk: Math.round(f.risk), data: Math.round(f.data), integ: Math.round(f.integrity) });
  log(g, `Day ${g.day}: ${Math.round(gen)} W made, ${t.use} W used. Chamber ${f.temp.toFixed(1)} °C, ${Math.round(f.hum)}% RH. Risk ${Math.round(f.risk)}.`, `Día ${g.day}: ${Math.round(gen)} W generados, ${t.use} W usados. Cámara a ${f.temp.toFixed(1)} °C, ${Math.round(f.hum)} % HR. Riesgo ${Math.round(f.risk)}.`);
  if (f.risk >= CFG.criticalRisk || f.integrity <= 0) { g.phase = 'report'; return; }
  checkEvents(g);
}

export function options(g) {
  const f = g.flight; if (!f || !f.pending) return [];
  if (f.pending === 'thermal') return [
    { id: 'repair', ok: f.repairs > 0, name: ['Repair with the toolkit', 'Reparar con el kit'], desc: [`Uses 1 repair action (${f.repairs} left). Back in range.`, `Usa 1 acción de reparación (quedan ${f.repairs}). Vuelve al rango.`] },
    { id: 'battery', ok: f.charge >= 600, name: ['Emergency cooling', 'Enfriamiento de emergencia'], desc: ['Spends 600 Wh of battery. Some stress remains (+12 risk).', 'Gasta 600 Wh de batería. Queda algo de estrés (+12 de riesgo).'] },
    { id: 'wait', ok: true, worst: true, name: ['Ride it out', 'Aguantar'], desc: ['Do nothing. The hive overheats: +6 °C and +35 risk.', 'No hacer nada. La colmena se recalienta: +6 °C y +35 de riesgo.'] }];
  if (f.pending === 'comms') { const d = 12; return [
    { id: 'realign', ok: true, name: ['Realign the antenna', 'Realinear la antena'], desc: [`Keeps all the data. The trip takes ${d} more days.`, `Conserva todos los datos. El viaje dura ${d} días más.`] },
    { id: 'essentials', ok: true, worst: true, name: ['Send essentials only', 'Enviar solo lo esencial'], desc: ['No delay, but future science is halved.', 'Sin retraso, pero la ciencia futura se reduce a la mitad.'] }]; }
  return [
    { id: 'fix', ok: f.repairs > 0, name: ['Repair the hull', 'Reparar el casco'], desc: [`Uses 1 repair action (${f.repairs} left). Good as new.`, `Usa 1 acción de reparación (quedan ${f.repairs}). Queda como nuevo.`] },
    { id: 'power', ok: f.charge >= 500, name: ['Divert power to life support', 'Desviar energía al soporte vital'], desc: ['Spends 500 Wh. The ship loses 20% integrity.', 'Gasta 500 Wh. La nave pierde 20 % de integridad.'] },
    { id: 'continue', ok: true, worst: true, name: ['Keep going', 'Seguir igual'], desc: ['Damage grows every month (−10% integrity).', 'El daño crece cada mes (−10 % de integridad).'] }];
}
// Autonomous answer when the decision timer runs out: the middle option if resources allow it.
export function autoOption(g) { const o = options(g); return (o.length === 3 && o[1].ok ? o[1] : o[o.length - 1]).id; }
export function resolve(g, id) {
  const f = g.flight, o = options(g).find(x => x.id === id); if (!o || !o.ok) return false;
  const k = f.pending; f.choices.push(k + ':' + id);
  if (k === 'thermal') { if (id === 'repair') { f.repairs--; f.risk += 3; } if (id === 'battery') { f.charge -= 600; f.risk += 12; } if (id === 'wait') { f.temp += 6; f.hum -= 12; f.risk += 35; f.heat = 1; } }
  if (k === 'comms') { if (id === 'realign') f.delay += 12; else f.lowData = true; }
  if (k === 'mech') { if (id === 'fix') f.repairs--; if (id === 'power') { f.charge -= 500; f.integrity -= 20; } if (id === 'continue') { f.integrity -= 15; f.damage = 10; } }
  f.risk = clamp(f.risk, 0, 100); f.integrity = clamp(f.integrity, 0, 100);
  const nm = { thermal: ['Heat alarm', 'Alarma de calor'], comms: ['Signal loss', 'Pérdida de señal'], mech: ['Micrometeorite', 'Micrometeorito'] }[k];
  log(g, `${nm[0]}: ${o.name[0]}.`, `${nm[1]}: ${o.name[1]}.`);
  f.done.push(f.pendingI); f.pending = null;
  if (f.risk >= CFG.criticalRisk || f.integrity <= 0) { g.phase = 'report'; return true; }
  checkEvents(g); return true;
}

// ---------------------------------------------------------------- greenhouse (hypothetical extension, sealed habitat)
export const arrived = g => !!g.flight && g.day >= totalDays(g) && g.flight.integrity > 0 && !g.flight.commsLost && g.flight.risk < CFG.criticalRisk;
export function greenStart(g) {
  const f = g.flight, c = clamp(100 - f.risk, 0, 100);
  g.green = { step: 0, cells: 2 + (f.charge >= 800 ? 1 : 0) + (f.integrity >= 80 ? 1 : 0), colony: c, start: c, lights: false, science: 0, picks: [], done: false };
}
export const GREEN = [
  { role: 1, title: ['Wake the queens', 'Despertar a las reinas'], text: ['They slept the whole way. Diapause should end gently.', 'Durmieron todo el camino. La diapausa debe terminar con suavidad.'],
    a: ['Warm up slowly, over 7 days', 'Calentar lento, en 7 días'], b: ['Warm up fast, in 1 day', 'Calentar rápido, en 1 día'], da: 15, db: -15, card: 'diapause' },
  { role: 0, title: ['Greenhouse climate', 'Clima del invernadero'], text: ['Mars nights are far below freezing. The sealed dome needs heating.', 'Las noches de Marte están muy bajo cero. El domo sellado necesita calefacción.'],
    a: ['Hold a steady 22–25 °C', 'Mantener 22–25 °C estables'], b: ['Let it swing at night', 'Dejar que varíe de noche'], da: 15, db: -20, card: 'protect' },
  { role: 3, title: ['Tomato flowers', 'Flores de tomate'], text: ['A colony needs pollen and nectar. With weak sunlight, plants need help.', 'Una colonia necesita polen y néctar. Con poca luz, las plantas necesitan ayuda.'],
    a: ['Turn on the grow lights', 'Encender las luces de cultivo'], b: ['Natural light only', 'Solo luz natural'], da: 10, db: -10, card: 'buzz' },
  { role: 2, title: ['Tell the world', 'Contarle al mundo'], text: ['A result counts in science when others can check the data.', 'Un resultado cuenta en ciencia cuando otros pueden revisar los datos.'],
    a: ['Send the full dataset', 'Enviar todos los datos'], b: ['Send a short summary', 'Enviar un resumen'], da: 0, db: 0, card: 'dsn' }
];
export function greenChoose(g, careful) {
  const gr = g.green; if (!gr || gr.done || (careful && gr.cells <= 0)) return false;
  const s = GREEN[gr.step]; if (careful) gr.cells--;
  gr.colony = clamp(gr.colony + (careful ? s.da : s.db), 0, 100);
  if (gr.step === 2) gr.lights = careful;
  if (gr.step === 3) gr.science = careful ? 50 : 10;
  gr.picks.push(careful); log(g, `Greenhouse · ${s.title[0]}: ${(careful ? s.a : s.b)[0]}.`, `Invernadero · ${s.title[1]}: ${(careful ? s.a : s.b)[1]}.`);
  if (++gr.step >= 4) gr.done = true;
  return true;
}
export function greenResult(g) {
  const gr = g.green, c = Math.round(gr.colony);
  return { colony: c, founded: c >= 60, awake: c >= 35, pollinated: c >= 60 && gr.lights, science: gr.science };
}

// ---------------------------------------------------------------- final evaluation (0–100, as in the design document)
export function report(g) {
  const f = g.flight, t = stats(g), ok = arrived(g), ch = f.choices;
  // 1. equipment, up to 40
  let eq = 0; const eqL = [];
  const addE = (cond, pts, en, es) => { if (cond) { eq += pts; eqL.push([pts, en, es]); } };
  addE(has(g.parts, 'chamberB'), 12, 'Vanguard chamber', 'Cámara Vanguardia'); addE(has(g.parts, 'chamberA'), 6, 'Economy chamber', 'Cámara Económica');
  addE(has(g.parts, 'antenna'), 8, 'High-gain antenna', 'Antena de alta ganancia'); addE(has(g.parts, 'backup'), 6, 'Backup comms', 'Comunicaciones de respaldo');
  addE(has(g.parts, 'toolkit'), 6, 'Repair toolkit', 'Kit de reparación'); addE(has(g.parts, 'thermal') || has(g.parts, 'chamberB'), 4, 'Thermal control', 'Control térmico'); addE(has(g.parts, 'dosimeter'), 4, 'Dosimeter', 'Dosímetro');
  // 2. reactions, up to 40
  const pts = { 'thermal:vanguard': 14, 'thermal:sensor': 14, 'thermal:repair': 12, 'thermal:battery': 7, 'thermal:wait': 0, 'comms:backup': 13, 'comms:realign': 10, 'comms:essentials': 5, 'comms:none': 0, 'mech:fix': 13, 'mech:power': 6, 'mech:continue': 1 };
  const kinds = { thermal: [], comms: [], mech: [] }; for (const c of ch) kinds[c.split(':')[0]].push(pts[c]);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const evP = { thermal: Math.round(avg(kinds.thermal)), comms: Math.round(avg(kinds.comms)), mech: Math.round(avg(kinds.mech)) };
  const ev = evP.thermal + evP.comms + evP.mech;
  // 3. resources, up to 20
  const energyOk = f.charge >= CFG.batteryWh * 0.15, res = (energyOk ? 10 : 0) + (t.budget >= 200 ? 10 : t.budget >= 100 ? 6 : t.budget >= 0 ? 2 : 0);
  let score = Math.min(40, eq) + ev + res;
  const status = f.risk >= CFG.criticalRisk ? 'bad' : f.risk > 35 ? 'risk' : 'good';
  if (!ok) score = Math.min(score, 49); else if (status !== 'good') score = Math.min(score, 79);
  const gr = g.green && g.green.done ? greenResult(g) : null;
  let ending = !ok || score < 50 ? 'C' : score >= 80 && (!gr || gr.founded) ? 'A' : 'B';
  const reason = f.commsLost ? 'comms' : f.integrity <= 0 ? 'systems' : f.risk >= CFG.criticalRisk ? 'climate' : f.risk > 35 ? 'climate' : 'balanced';
  return { score: Math.round(score), eq: Math.min(40, eq), eqL, ev, evP, res, energyOk, ok, status, ending, reason, gr, budget: t.budget };
}

// Feedback built from what the team did (shown as the paper's conclusions and peer review).
export function feedback(g) {
  const f = g.flight, t = stats(g), r = route(g), rep = report(g), ch = f.choices, good = [], fix = [], find = [];
  const G = (en, es) => good.push([en, es]), X = (en, es) => fix.push([en, es]), F = (en, es) => find.push([en, es]);
  if (rep.status === 'good') F(`The chamber kept the queens in good condition (risk index ${Math.round(f.risk)}/100, final ${f.temp.toFixed(1)} °C, ${Math.round(f.hum)}% RH).`, `La cámara mantuvo a las reinas en buen estado (índice de riesgo ${Math.round(f.risk)}/100, final ${f.temp.toFixed(1)} °C, ${Math.round(f.hum)} % HR).`);
  else F(`The chamber drifted away from 2.5 °C and 70% RH (risk index ${Math.round(f.risk)}/100).`, `La cámara se alejó de 2,5 °C y 70 % HR (índice de riesgo ${Math.round(f.risk)}/100).`);
  F(`On ${r.name[0]} (NASA Trajectory Browser) the ship had ${t.dv.toFixed(2)} km/s for the ${r.dv} km/s needed, carrying ${t.kg} kg.`, `En la ${r.name[1]} (NASA Trajectory Browser) la nave tuvo ${t.dv.toFixed(2)} km/s para los ${r.dv} km/s necesarios, con ${t.kg} kg.`);
  if (f.commsLost) F("Contact with NASA's Deep Space Network was lost for good: there is no data to publish.", 'Se perdió para siempre el contacto con la Deep Space Network de la NASA: no hay datos que publicar.');
  else F(`${Math.round(f.data)} MB of science reached Earth; ${Math.round(f.lost)} MB were lost.`, `Llegaron ${Math.round(f.data)} MB de ciencia a la Tierra; se perdieron ${Math.round(f.lost)} MB.`);
  if (rep.gr) F(rep.gr.founded ? `In the sealed greenhouse (hypothetical model) the queens founded a colony (index ${rep.gr.colony}/100)${rep.gr.pollinated ? ' and tomato flowers were pollinated.' : '.'}` : `In the sealed greenhouse (hypothetical model) no colony was founded (index ${rep.gr.colony}/100).`,
    rep.gr.founded ? `En el invernadero sellado (modelo hipotético) las reinas fundaron una colonia (índice ${rep.gr.colony}/100)${rep.gr.pollinated ? ' y se polinizaron flores de tomate.' : '.'}` : `En el invernadero sellado (modelo hipotético) no se fundó una colonia (índice ${rep.gr.colony}/100).`);
  if (has(g.parts, 'chamberB')) G('The Vanguard chamber removed the heat alarms: active control paid off.', 'La cámara Vanguardia eliminó las alarmas de calor: el control activo valió la pena.');
  if (has(ch, 'thermal:sensor')) G('The thermal sensor caught the alarms before the queens felt them.', 'El sensor térmico detectó las alarmas antes de que las reinas las sintieran.');
  if (has(ch, 'thermal:repair')) G('The toolkit fixed the heat alarm on board, without waiting for Earth.', 'El kit arregló la alarma de calor a bordo, sin esperar a la Tierra.');
  if (has(ch, 'thermal:wait')) X('Riding out a heat alarm cost +35 risk. A thermal sensor (150 credits, 0.3 kg) prevents it.', 'Aguantar una alarma de calor costó +35 de riesgo. Un sensor térmico (150 créditos, 0,3 kg) lo evita.');
  if (has(ch, 'thermal:battery')) X('Emergency cooling spent 600 Wh. A sensor would have cost only 10 W.', 'El enfriamiento de emergencia gastó 600 Wh. Un sensor habría costado solo 10 W.');
  if (has(ch, 'comms:backup')) G('Backup comms saved the link during the solar storm.', 'Las comunicaciones de respaldo salvaron el enlace durante la tormenta solar.');
  if (has(ch, 'comms:realign')) G('Realigning the antenna protected every observation.', 'Realinear la antena protegió todas las observaciones.');
  if (has(ch, 'comms:essentials')) X('Sending only essentials halved the science for the rest of the trip.', 'Enviar solo lo esencial redujo la ciencia a la mitad por el resto del viaje.');
  if (has(ch, 'comms:none')) X('Communications are not optional: one storm ended the mission.', 'Las comunicaciones no son opcionales: una tormenta terminó la misión.');
  if (has(ch, 'mech:fix')) G('The micrometeorite damage was repaired with one action.', 'El daño del micrometeorito se reparó con una acción.');
  if (has(ch, 'mech:continue')) X(`Ignoring the impact let damage grow (ship integrity ${Math.round(f.integrity)}%). Pack a toolkit.`, `Ignorar el impacto dejó crecer el daño (integridad ${Math.round(f.integrity)} %). Lleva un kit.`);
  if (has(ch, 'mech:power')) X('Diverting power cost 20% integrity. A toolkit (150 credits) avoids it.', 'Desviar energía costó 20 % de integridad. Un kit (150 créditos) lo evita.');
  if (!has(g.parts, 'dosimeter')) X('A dosimeter (50 credits) adds radiation data and an early storm warning.', 'Un dosímetro (50 créditos) suma datos de radiación y un aviso temprano de tormentas.');
  if (t.budget >= 200) G(`You kept ${t.budget} credits in reserve.`, `Guardaste ${t.budget} créditos de reserva.`); else X('Keep at least 200 credits in reserve for full resource points.', 'Guarda al menos 200 créditos de reserva para el puntaje completo de recursos.');
  if (!rep.energyOk) X('The battery ended below 15%. Plan repairs so you do not need emergency power.', 'La batería terminó bajo 15 %. Planifica las reparaciones para no necesitar energía de emergencia.');
  if (rep.gr && !rep.gr.founded) X('In the greenhouse, spend energy cells on the wake-up and the climate first.', 'En el invernadero, gasta primero las celdas de energía en el despertar y el clima.');
  if (!good.length) G('You completed a full design cycle and wrote down every decision.', 'Completaste un ciclo de diseño entero y anotaste cada decisión.');
  if (!fix.length) X('Try the other NASA route or another rocket and compare.', 'Prueba la otra ruta de la NASA u otro cohete y compara.');
  return { find, good, fix };
}

export function redesign(g) {
  g.phase = 'lab'; g.day = 0; g.flight = null; g.green = null; g.attempt++; g.log = []; // same seed: the same incidents, so designs can be compared
}
