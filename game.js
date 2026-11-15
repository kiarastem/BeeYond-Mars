// BeeYond Mars — screens, story and input. Rules live in engine.js.
import * as E from './engine.js';
import { CFG, ROLES, ITEMS, LAUNCHERS, ROUTES, SOURCES, CARDS, GREEN } from './engine.js';
import { Chip } from './audio.js';
import { World, ROOMS } from './world.js';

const $ = s => document.querySelector(s), app = $('#app'), audio = new Chip();
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const S = { screen: 'title', lang: store.get('bym-lang', (navigator.language || 'en').startsWith('es') ? 'es' : 'en'), relaxed: true, timerSec: store.get('bym-timer', 0), st: null, dlg: null, g: null, tab: 1, cut: null, modal: null,
  name: store.get('bym-name', ''), queen: store.get('bym-queen', ''), players: 1, album: store.get('bym-album', []), met: [], best: store.get('bym-best', 0), timer: null, left: 0, newCards: [] };
const T = (en, es) => S.lang === 'es' ? es : en, L = a => a[S.lang === 'es' ? 1 : 0];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (label, a, cls = '', dis = false) => `<button class="btn ${cls}" data-a="${a}" ${dis ? 'disabled' : ''}>${label}</button>`;
const doc = () => S.g ? S.g.name : (S.name || 'Lum');
const queen = () => S.g ? S.g.queen : (S.queen || 'Miel');
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString(S.lang === 'es' ? 'es-CL' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// The team: same gender-neutral base sprite, told apart by scarf colour and tool.
const CREW = [
  { id: 'pip', name: 'Pip', role: 0, color: '#ffd666', tool: 'wrench', what: ['round glasses, always carries a wrench', 'gafas redondas, siempre con una llave'] },
  { id: 'nim', name: 'Nim', role: 1, color: '#7fd09a', tool: 'microscope', what: ['a sprout on the head, never far from a microscope', 'un brote en la cabeza, nunca lejos de un microscopio'] },
  { id: 'eko', name: 'Eko', role: 2, color: '#8ab8f0', tool: 'radio', what: ['headphones, a radio always on', 'auriculares, una radio siempre encendida'] },
  { id: 'you', name: '', role: 3, color: '#c4aaeb', tool: 'clipboard', what: ['purple scarf, a clipboard full of bee notes', 'bufanda morada, una tablilla llena de notas de abejas'] }
];
const crewEl = (c, cls = '') => `<span class="crew ${cls}" title="${c.name || doc()}"><i class="scarf" style="background:${c.color}"></i><img class="tool" src="assets/eq/${c.tool}.png" alt=""></span>`;
const bee = (mood, cls = '') => `<span class="bee ${mood} ${cls}" role="img" aria-label="${T('bumblebee queen', 'reina de abejorro')}"></span>`;
const aiNote = () => `<p class="ainote">${T('Art: AI-assisted, marked “AI” · Aurelia is a fictional agency · No NASA logos · Educational model', 'Arte asistido por IA, marcado «AI» · Aurelia es una agencia ficticia · Sin logos de la NASA · Modelo educativo')}</p>`;

function unlock(id) { if (!S.album.includes(id)) { S.album.push(id); store.set('bym-album', S.album); S.newCards.push(id); toast(T('New science card: ', 'Nueva carta de ciencia: ') + L(CARDS.find(c => c.id === id).name)); audio.sfx('coin'); } }
let toastT; function toast(s) { const t = $('#toast'); t.textContent = s; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3200); }
function go(screen) { S.screen = screen; S.modal = null; stopTimer(); render(); window.scrollTo(0, 0); }

// ------------------------------------------------------------------ cutscenes
// frame: { bg, fx, who, text:[en,es], actors:html, sfx, music }
function cutscene(frames, done) { S.cut = { frames, i: 0, done }; S.screen = 'cut'; render(); }
function cutNext() { const c = S.cut; if (c.typing) { c.skipType = true; return; } if (++c.i >= c.frames.length) { const d = c.done; S.cut = null; d(); } else render(); }
function typeText(el, text) {
  const c = S.cut; c.typing = true; c.skipType = false; let i = 0; el.textContent = '';
  const tick = () => { if (S.cut !== c) return; if (c.skipType) i = text.length; else i += 2; el.textContent = text.slice(0, i); if (i % 6 === 0) audio.sfx('blip'); if (i < text.length) setTimeout(tick, 28); else c.typing = false; };
  tick();
}
const all4 = () => `<div class="actors">${CREW.map(c => crewEl(c)).join('')}</div>`;
const prologue = () => [
  { bg: 'office', music: 'sad', who: '', text: ['Three years. Forty-one proposals. Forty-one rejections.', 'Tres años. Cuarenta y una propuestas. Cuarenta y un rechazos.'], actors: `<div class="bills"><i></i><i></i><i></i></div><div class="actors">${crewEl(CREW[3], 'sad')}</div>` },
  { bg: 'office', who: doc(), text: ['Bumblebee queens can sleep through a whole winter. What if they could sleep all the way to Mars… and wake up to pollinate the first gardens there?', 'Las reinas de abejorro duermen un invierno entero. ¿Y si pudieran dormir hasta Marte… y despertar para polinizar los primeros huertos de allá?'], actors: `<div class="actors">${crewEl(CREW[3], 'sad')}${bee('sleep', 'jar')}</div>` },
  { bg: 'office', who: '', text: ['The academy laughed. The funding ran out. The bills turned red, and the lab went quiet.', 'La academia se rió. Los fondos se acabaron. Las cuentas se pusieron rojas y el laboratorio quedó en silencio.'], actors: `<div class="bills"><i></i><i></i><i></i><i></i><i></i></div><div class="actors">${crewEl(CREW[3], 'sad')}${bee('sleep', 'jar')}</div>` },
  { bg: 'office', who: doc(), text: [`I'm sorry, ${queen()}. I think it's time to turn off the lights.`, `Perdóname, ${queen()}. Creo que es hora de apagar las luces.`], actors: `<div class="actors">${crewEl(CREW[3], 'sad')}${bee('sleep', 'jar')}</div>` },
  { bg: 'office', sfx: 'knock', who: '', text: ['KNOCK! KNOCK!  …Something slides under the door.', '¡TOC! ¡TOC!  …Algo se desliza por debajo de la puerta.'], actors: `<div class="knock">${T('KNOCK! KNOCK!', '¡TOC! ¡TOC!')}</div><div class="envelope" data-a="cut-next" title="${T('Open the envelope', 'Abrir el sobre')}"><b>AURELIA</b></div><div class="actors">${crewEl(CREW[3])}${bee('', 'jar')}</div>`, cta: T('Open the envelope', 'Abrir el sobre') }
];
const labOpen = () => [
  { bg: 'lab', music: 'lab', who: '', text: ['That night, the lab lights came back on.', 'Esa noche, las luces del laboratorio volvieron a encenderse.'], actors: all4() },
  { bg: 'lab', who: 'Pip', text: ['Four friends, one budget, and a queen who trusts us. Let’s build her a ship.', 'Cuatro amigos, un presupuesto y una reina que confía en nosotros. Construyámosle una nave.'], actors: all4() + bee('sleep', 'jar') }
];
const liftoff = () => [
  { bg: 'pad', music: 'launch', who: 'Nim', text: [`Sleep well, ${queen()}. When you wake up, there will be flowers.`, `Duerme bien, ${queen()}. Cuando despiertes, habrá flores.`], actors: `<img class="rocket" src="assets/rocket.png" alt="">` + all4() },
  { bg: 'pad', who: 'Eko', text: ['Deep Space Network is listening. Three… two… one…', 'La Red de Espacio Profundo está escuchando. Tres… dos… uno…'], actors: `<div class="count">3 · 2 · 1</div><img class="rocket" src="assets/rocket.png" alt="">` + all4() },
  { bg: 'pad', fx: 'shake sky', who: '', text: ['IGNITION! The sky turns from blue to black, and the little ship is on its way.', '¡IGNICIÓN! El cielo pasa del azul al negro, y la pequeña nave ya va en camino.'], actors: `<div class="count">${T('IGNITION!', '¡IGNICIÓN!')}</div><img class="rocket fly" src="assets/rocket.png" alt=""><div class="smoke"></div>` }
];
const arrival = () => [
  { bg: 'mars', music: 'space', who: '', text: [`Day ${S.g.day}. After all those quiet months, Mars fills the window.`, `Día ${S.g.day}. Después de tantos meses en silencio, Marte llena la ventana.`], actors: bee('sleep', 'big') },
  { bg: 'mars', who: 'Eko', text: [`Signal confirmed, ${Math.round(E.delayMin(S.g))} minutes late and perfect. They made it. ${queen()} made it!`, `Señal confirmada, con ${Math.round(E.delayMin(S.g))} minutos de retraso y perfecta. Llegaron. ¡${queen()} llegó!`], actors: all4() },
  { bg: 'green', music: 'calm', who: doc(), text: ['One more step: the sealed greenhouse. Nothing leaves the dome. Now we find out if she wakes up.', 'Falta un paso: el invernadero sellado. Nada sale del domo. Ahora sabremos si despierta.'], actors: bee('sleep', 'big') }
];
const endings = {
  A: () => [
    { bg: 'lab gold', music: 'calm', who: '', text: ['Months later. The lab is full of light, plants and letters from children who want to study bees.', 'Meses después. El laboratorio está lleno de luz, plantas y cartas de niñas y niños que quieren estudiar abejas.'], actors: all4() },
    { bg: 'lab gold', sfx: 'ring', who: '', text: ['RING! RING!  The old red phone on the desk jumps.', '¡RING! ¡RING!  El viejo teléfono rojo del escritorio salta.'], actors: `<div class="knock">RING! RING!</div>` + all4() },
    { bg: 'lab gold', who: T('Voice from Stockholm', 'Voz desde Estocolmo'), text: [`“${doc()}? We are calling about your work with ${queen()} and her daughters…”`, `«¿${doc()}? Llamamos por su trabajo con ${queen()} y sus hijas…»`], actors: all4() },
    { bg: 'green gold', music: 'nobel', sfx: 'win', fx: 'confetti', who: doc(), text: ['We did it. Not me — us. And somewhere on Mars, a bumblebee is landing on a tomato flower.', 'Lo logramos. No yo: nosotros. Y en algún lugar de Marte, un abejorro se posa en una flor de tomate.'], actors: `<div class="banner">${T('THE CALL FROM STOCKHOLM', 'LA LLAMADA DE ESTOCOLMO')}</div>${bee('happy', 'big')}` + all4() }
  ],
  B: () => [
    { bg: 'lab', music: 'calm', who: '', text: ['The ship reached Mars, but the results were incomplete.', 'La nave llegó a Marte, pero los resultados quedaron incompletos.'], actors: all4() },
    { bg: 'lab', who: T('Aurelia agent', 'Agente de Aurelia'), text: ['No prize this year, Doctor. But we saw enough. Aurelia extends your contract: try again.', 'Este año no hay premio, doctor. Pero vimos suficiente. Aurelia extiende su contrato: inténtelo de nuevo.'], actors: all4() },
    { bg: 'lab', who: 'Nim', text: [`We keep the lab. And ${queen()} taught us what to fix.`, `Conservamos el laboratorio. Y ${queen()} nos enseñó qué corregir.`], actors: all4() + bee('', 'jar') }
  ],
  C: () => [
    { bg: 'office gray', music: 'ruin', sfx: 'lose', who: '', text: ['The mission was lost. Two agents put red “CLOSED” seals on the dark monitors.', 'La misión se perdió. Dos agentes ponen sellos rojos de «CLAUSURADO» sobre los monitores apagados.'], actors: `<div class="closed">${T('CLOSED', 'CLAUSURADO')}</div><div class="actors">${crewEl(CREW[3], 'sad')}</div>` },
    { bg: 'office gray', who: 'Pip', text: ['Hey. They took the furniture, not the notebooks. Every failed flight is data.', 'Oye. Se llevaron los muebles, no los cuadernos. Cada vuelo fallido es un dato.'], actors: all4() },
    { bg: 'office', music: 'sad', who: doc(), text: ['…You’re right. Science is trying again. Let’s read what went wrong.', '…Tienes razón. La ciencia es volver a intentarlo. Leamos qué salió mal.'], actors: all4() }
  ]
};

// ------------------------------------------------------------------ screens
function header() {
  const g = S.g, t = g ? E.stats(g) : null;
  return `<header class="hud"><b class="logo">BEEYOND MARS</b>${g ? `<span class="chip">◈ <b id="credits">${t.budget}</b> ${T('credits', 'créditos')}</span><span class="chip">${T('Attempt', 'Intento')} ${g.attempt}</span>` : ''}
  <span class="grow"></span>${btn('♪', 'music', 'sm ' + (audio.on ? 'on' : ''))}${btn(S.lang === 'en' ? 'ES' : 'EN', 'lang', 'sm')}${btn(T('Album', 'Álbum') + ` ${S.album.length}/${CARDS.length}`, 'm:album', 'sm')}${btn(T('Sources', 'Fuentes'), 'm:sources', 'sm')}</header>`;
}
function title() {
  audio.play('calm');
  return `<section class="scene title bg-hero"><div class="card center">
  <p class="eyebrow">${T('A SMALL LIFE · A HUGE JOURNEY', 'UNA VIDA PEQUEÑA · UN VIAJE ENORME')}</p>${bee('', 'float')}
  <h1>BEEYOND MARS</h1><p>${T('A scientist nobody believed. A sleeping bumblebee queen. One letter that changes everything.', 'Una persona de ciencia en la que nadie creyó. Una reina de abejorro dormida. Una carta que lo cambia todo.')}</p>
  <div class="form"><label>${T('Your scientist’s name', 'Nombre de tu científico/a')}<input id="in-name" maxlength="14" value="${esc(S.name)}" placeholder="Lum"></label>
  <label>${T('Name your queen', 'Nombra a tu reina')}<input id="in-queen" maxlength="14" value="${esc(S.queen)}" placeholder="Miel"></label></div>
  <div class="row"><span>${T('Players on this device', 'Personas en este dispositivo')}</span>${[1, 2, 3, 4].map(n => btn(n, 'players:' + n, 'sm ' + (S.players === n ? 'primary' : ''))).join('')}</div>
  <div class="row"><span>${T('Time limit for incidents', 'Tiempo límite para incidentes')}</span>${[0, 60, 120].map(n => btn(n ? n + ' s' : T('No limit', 'Sin límite'), 'timer:' + n, 'sm ' + (S.timerSec === n ? 'primary' : ''))).join('')}</div>
  <div class="row">${store.get('bym-save', null) ? btn(T('Continue', 'Continuar'), 'continue', 'primary big') : ''}${btn(T('New story', 'Nueva historia'), 'start', 'primary big')}</div>
  <div class="row">${btn(S.lang === 'en' ? 'Español' : 'English', 'lang', 'sm')}${btn(T('Music', 'Música') + (audio.on ? ' ♪' : ' ✕'), 'music', 'sm')}${btn(T('Science album', 'Álbum de ciencia') + ` ${S.album.length}/${CARDS.length}`, 'm:album', 'sm')}${btn(T('Sources', 'Fuentes'), 'm:sources', 'sm')}</div>
  ${S.best ? `<p class="small">${T('Best mission score', 'Mejor puntaje de misión')}: ${S.best}/100</p>` : ''}<p class="small">NASA Space Apps Challenge 2026 · Space Mission Design Game</p>${aiNote()}</div></section>`;
}
function cut() {
  const f = S.cut.frames[S.cut.i]; if (f.music) audio.play(f.music); if (f.sfx) audio.sfx(f.sfx);
  setTimeout(() => { const el = $('#dlg-text'); if (el) typeText(el, L(f.text)); }, 30);
  return `<section class="scene cut bg-${f.bg.split(' ').join(' ')} ${f.fx || ''}" data-a="${f.cta ? '' : 'cut-next'}">${f.actors || ''}
  <div class="dialog" data-a="cut-next">${f.who ? `<b class="who">${esc(f.who)}</b>` : ''}<p id="dlg-text"></p><span class="next">${f.cta ? '▶ ' + f.cta : '▼'}</span></div>
  ${btn(T('Skip', 'Saltar'), 'cut-skip', 'sm skip')}<span class="aimark">AI</span></section>`;
}
function letter() {
  audio.play('calm'); unlock('diapause');
  return `<section class="scene bg-office lit"><div class="paper"><h2>AURELIA FUNDS</h2><p class="small">${T('Office of Impossible Research · fictional agency', 'Oficina de Investigaciones Imposibles · agencia ficticia')}</p><hr>
  <p>${T('Dear', 'Estimado/a')} ${doc()}:</p>
  <p>${T('The academy closed its doors to your research on Martian pollinators. We read all forty-one of your proposals. We believe you.', 'La academia le cerró las puertas a su investigación sobre polinizadores marcianos. Leímos sus cuarenta y una propuestas. Nosotros le creemos.')}</p>
  <p>${T(`We grant you <b>${CFG.budget} credits</b> to carry out project <b>BeeYond Mars</b>. Each design review you pass releases more: <b>+${CFG.grants[0]}</b> and <b>+${CFG.grants[1]}</b> credits.`, `Le otorgamos <b>${CFG.budget} créditos</b> para realizar el proyecto <b>BeeYond Mars</b>. Cada revisión de diseño aprobada libera más: <b>+${CFG.grants[0]}</b> y <b>+${CFG.grants[1]}</b> créditos.`)}</p>
  <p>${T(`Take ${esc(queen())} and her sisters to Mars and show that life can travel between worlds. If you succeed, Stockholm may call. If you fail, we cannot stop the bank from closing your lab.`, `Lleve a ${esc(queen())} y a sus hermanas hasta Marte y demuestre que la vida puede viajar entre mundos. Si lo logra, puede que llamen de Estocolmo. Si falla, no podremos evitar que el banco cierre su laboratorio.`)}</p>
  <p>${T('Do not go alone. Find your friends.', 'No vaya solo/a. Busque a sus amigos.')}</p><div class="stamp">${T('FUNDED', 'FINANCIADO')}<small>${CFG.budget} ${T('CREDITS', 'CRÉDITOS')}</small></div>
  <p class="note">${T('This mission is hypothetical. Whether bumblebee queens can survive a trip to Mars is an open scientific question.', 'Esta misión es hipotética. Si las reinas de abejorro pueden sobrevivir un viaje a Marte es una pregunta científica abierta.')}</p>
  <div class="row">${btn(T('Keep the letter', 'Guardar la carta'), 'keep-letter', 'primary big')}</div></div></section>`;
}
const FRIEND_LINES = {
  pip: ['You kept the old rocket sketches? …I never threw mine away either. I’m in.', '¿Guardaste los bocetos del cohete? …Yo tampoco boté los míos. Cuenta conmigo.'],
  nim: ['I still feed the bumblebees in my garden every spring. Let’s take the queens somewhere new.', 'Todavía alimento a los abejorros de mi jardín cada primavera. Llevemos a las reinas a un lugar nuevo.'],
  eko: ['I listen to the sky every night. It would be nice to hear a friend out there. I’m coming.', 'Escucho el cielo todas las noches. Sería lindo oír a una amiga allá afuera. Voy contigo.']
};
function friends() {
  audio.play('calm'); const places = [T('The old workshop', 'El viejo taller'), T('The garden', 'El jardín'), T('The radio hill', 'El cerro de la radio')];
  return `<section class="scene bg-hero"><div class="card wide"><p class="eyebrow">${T('A SHORT TRIP ACROSS TOWN', 'UN VIAJE CORTO POR EL PUEBLO')}</p><h2>${T('Find your friends', 'Busca a tus amigos')}</h2>
  <p>${T('Letter in hand, you go looking for the three people who never laughed at your idea. Visit each one.', 'Con la carta en la mano, sales a buscar a las tres personas que nunca se rieron de tu idea. Visita a cada una.')}</p>
  <div class="friends">${CREW.slice(0, 3).map((c, i) => { const met = S.met.includes(c.id); return `<article class="friend ${met ? 'met' : ''}">${crewEl(c, met ? 'hop' : '')}<h3>${c.name} · ${L(ROLES[c.role])}</h3><p class="small">${places[i]} · ${L(c.what)}</p>
    ${met ? `<p class="say">“${L(FRIEND_LINES[c.id])}”</p>` : btn(T('Knock on the door', 'Tocar la puerta'), 'meet:' + c.id, 'primary')}</article>`; }).join('')}</div>
  <div class="row">${btn(T('Go to the lab together', 'Ir juntos al laboratorio'), 'to-lab', 'primary big', S.met.length < 3)}</div>
  ${S.players > 1 ? `<p class="small">${T('Each player takes one friend’s role. Pass the device when it is their turn.', 'Cada persona toma el rol de un amigo. Pasen el dispositivo cuando sea su turno.')}</p>` : ''}</div></section>`;
}
const playerOf = role => S.g.players > 1 ? ` · ${T('Player', 'Jugador/a')} ${(role % S.g.players) + 1}` : '';
const meter = (label, val, max, unit, bad) => `<div class="meter ${bad ? 'bad' : ''}"><span>${label}</span><b>${val} / ${max} ${unit}</b><i><u style="width:${Math.min(100, val / max * 100)}%"></u></i></div>`;
function lab() {
  const g = S.g, t = E.stats(g), r = E.route(g), errs = E.errors(g), ms = E.milestone(g), tab = S.tab, c = CREW.find(x => x.role === tab);
  audio.play(errs.length && E.hasChamber(g) && (t.kg > t.cap || t.use > t.power) ? 'lab' : 'lab');
  let cat = '';
  if (tab !== 3) cat = ITEMS.filter(i => i.role === tab).map(i => { const own = g.parts.includes(i.id); return `<article class="item ${own ? 'own' : ''}"><img src="assets/eq/${i.icon}.png" alt=""><div><h4>${L(i.name)}</h4><p>${L(i.desc)}</p>
    <p class="spec">◈ ${i.cost} · ${i.kg} kg · ${i.gen ? '+' + i.gen : '−' + i.w} W · Δv −${(i.kg * CFG.dvPerKg).toFixed(2)}</p></div>${btn(own ? T('Remove', 'Quitar') : T('Install', 'Instalar'), 'item:' + i.id, own ? '' : 'primary')}</article>`; }).join('');
  else cat = `<h4>${T('Rocket', 'Cohete')} <small>(${T('team model', 'modelo del equipo')})</small></h4>${LAUNCHERS.map(l => `<article class="item ${g.launcher === l.id ? 'own' : ''}"><img src="assets/eq/rocket.png" alt=""><div><h4>${L(l.name)}</h4><p>${L(l.desc)}</p><p class="spec">◈ ${l.cost} · ${l.cap} kg · ${l.power} W · −${l.own} W · Δv ${l.dv} km/s</p></div>${btn(g.launcher === l.id ? '✓' : T('Choose', 'Elegir'), 'launcher:' + l.id, g.launcher === l.id ? '' : 'primary', g.launcher === l.id)}</article>`).join('')}
    <h4>${T('Route to Mars', 'Ruta a Marte')} <small>(NASA Ames Trajectory Browser)</small></h4>${ROUTES.map(x => `<article class="item ${g.route === x.id ? 'own' : ''}"><img src="assets/eq/fuel.png" alt=""><div><h4>${L(x.name)}${g.compared.includes(x.id) ? ' ✓' : ''}</h4><p>${fmtDate(x.depart)} → ${fmtDate(x.arrive)} · ${x.days} ${T('days', 'días')} · ${L(x.note)}</p><p class="spec">Δv ${x.inj} + ${x.post} = ${x.dv} km/s</p></div>${btn(T('Examine', 'Examinar'), 'route:' + x.id, g.route === x.id ? '' : 'primary')}</article>`).join('')}`;
  const cml = [T('Idea', 'Idea'), T('Chamber, mass and power fit', 'Cámara, masa y energía calzan'), T('Both NASA routes compared', 'Ambas rutas de la NASA comparadas'), T('Ready to launch', 'Lista para despegar')];
  return `${header()}<section class="lab"><div class="panel cat"><div class="tabs">${[1, 0, 2, 3].map(i => `<button class="tab ${tab === i ? 'on' : ''}" data-a="tab:${i}" style="--c:${CREW.find(x => x.role === i).color}">${L(ROLES[i])}</button>`).join('')}</div>
    <p class="who-line">${crewEl(c, 'mini')}<b>${c.name || doc()}</b>${playerOf(tab)} — <i>${L([['“Every kilogram costs us speed.”', '«Cada kilo nos cuesta velocidad.»'], [`“${queen()} needs 2.5 °C and calm.”`, `«${queen()} necesita 2,5 °C y calma.»`], ['“No link, no science.”', '«Sin enlace no hay ciencia.»'], ['“Let’s check the numbers together.”', '«Revisemos los números en equipo.»']][tab])}</i></p>${cat}</div>
  <div class="panel ship bg-labimg"><p class="eyebrow">${T('SHIP · CUTAWAY', 'NAVE · CORTE')}</p><div class="shipbox"><img class="rk" src="assets/rocket.png" alt=""><div class="slots">${g.parts.map(id => `<img src="assets/eq/${E.item(id).icon}.png" title="${L(E.item(id).name)}" alt="">`).join('') || `<span class="small">${T('Empty ship', 'Nave vacía')}</span>`}</div></div>
    <div class="jarbox">${bee('sleep')}<span>${esc(queen())} · ${T('in diapause', 'en diapausa')}</span></div><div class="actors mini-row">${CREW.map(x => crewEl(x, 'mini')).join('')}</div><span class="aimark">AI</span></div>
  <div class="panel tel"><p class="eyebrow">${T('TELEMETRY', 'TELEMETRÍA')}</p>
    ${meter(T('Mass', 'Masa'), t.kg, t.cap, 'kg', t.kg > t.cap)}${meter(T('Power use', 'Consumo'), t.use, Math.round(t.arrival), 'W', t.use > t.arrival)}
    <p class="small">${T(`Generated ${t.power} W at Earth × ${t.af.toFixed(2)} near Mars (route data) = ${Math.round(t.arrival)} W`, `Generado ${t.power} W en la Tierra × ${t.af.toFixed(2)} cerca de Marte (datos de la ruta) = ${Math.round(t.arrival)} W`)}</p>
    <div class="meter ${t.dv < r.dv ? 'bad' : ''}"><span>Δv = ${E.launcher(g).dv} − ${CFG.dvPerKg} × ${t.kg}</span><b>${t.dv.toFixed(2)} ≥ ${r.dv} km/s</b><i><u style="width:${Math.min(100, t.dv / 9.2 * 100)}%"></u><em style="left:${r.dv / 9.2 * 100}%"></em></i></div>
    <h4>${T('Design reviews', 'Revisiones de diseño')} · CML ${ms}/4</h4><ol class="cml">${cml.map((x, i) => `<li class="${ms > i ? 'ok' : ''}">${ms > i ? '★' : '☆'} CML ${i + 1} · ${x}</li>`).join('')}</ol>
    <div class="row">${btn(g.grants.includes(0) ? '✓ CML 2' : `CML 2 · +${CFG.grants[0]}`, 'grant:0', 'sm', g.grants.includes(0))}${btn(g.grants.includes(1) ? '✓ CML 3' : `CML 3 · +${CFG.grants[1]}`, 'grant:1', 'sm', g.grants.includes(1))}</div>
    <div class="hint"><b>${T('TIP', 'PISTA')}</b> ${L(E.hints(g)[0])}</div>
    <div class="errs ${errs.length ? 'bad' : 'ok'}">${errs.length ? errs.map(e => '✕ ' + L(e)).join('<br>') : '✓ ' + T('Mass, power, delta-v and funds fit.', 'Masa, energía, delta-v y fondos calzan.')}</div>
    ${btn(T('← Back to the lab floor', '← Volver a caminar por el laboratorio'), 'world', 'big')}</div></section>${aiNote()}`;
}
const CREW_MSG = [
  ['Pip: “I can still see your engine glow from the hill. Okay, I can’t. But I like to think so.”', 'Pip: «Todavía veo el brillo del motor desde el cerro. Bueno, no. Pero me gusta pensarlo.»'],
  ['Nim: “I planted tomatoes today. For when she wakes up.”', 'Nim: «Hoy planté tomates. Para cuando despierte.»'],
  ['Eko: “Your signal now takes minutes to arrive. I wait for every single one.”', 'Eko: «Tu señal ya tarda minutos en llegar. Espero cada una.»'],
  ['Pip: “The whole school is following the mission. They drew bees with helmets.”', 'Pip: «Toda la escuela sigue la misión. Dibujaron abejas con casco.»'],
  ['Nim: “Queens survive winter alone, in the dark. She is braver than all of us.”', 'Nim: «Las reinas pasan el invierno solas, a oscuras. Es más valiente que todos nosotros.»'],
  ['Eko: “Halfway. The Earth is just a blue dot for her now.”', 'Eko: «Mitad de camino. La Tierra ya es solo un punto azul para ella.»'],
  ['Pip: “Whatever happens, we already went further than anyone said we could.”', 'Pip: «Pase lo que pase, ya llegamos más lejos de lo que todos decían.»'],
  ['Nim: “The first tomato flower opened today. I’m saving it a seat.”', 'Nim: «Hoy abrió la primera flor de tomate. Le estoy guardando un lugar.»'],
  ['Eko: “Mars is getting brighter in my telescope. Almost there.”', 'Eko: «Marte brilla más en mi telescopio. Ya casi.»'],
  ['Everyone: “We’re all in the lab tonight. Nobody wants to go home.”', 'Todos: «Estamos todos en el laboratorio esta noche. Nadie quiere irse a casa.»']
];
function voyage() {
  const g = S.g, f = g.flight, t = E.stats(g), tot = E.totalDays(g), p = g.day / tot, mood = f.risk > 35 ? 'risk' : 'sleep', month = Math.floor(g.day / 30);
  audio.play(f.pending ? 'alarm' : 'space');
  const via = f.risk >= CFG.criticalRisk ? T('COMPROMISED', 'COMPROMETIDA') : f.risk > 35 ? T('AT RISK', 'EN RIESGO') : T('GOOD', 'BUENA');
  return `${header()}<section class="voyage bg-transit"><div class="track"><span>${T('Earth', 'Tierra')}</span><div class="line"><i style="width:${p * 100}%"></i><img src="assets/rocket.png" style="left:${p * 100}%" alt=""></div><span>${T('Mars', 'Marte')}</span></div>
  <h2>${T('Month', 'Mes')} ${month} · ${T('day', 'día')} ${g.day} / ${tot}</h2>
  <div class="vgrid"><div class="panel hive ${mood}"><p class="eyebrow">${T('HIVE VIEWER', 'VISOR DE LA COLMENA')}</p>${bee(mood, 'big')}<b>${esc(queen())}</b>
    <p>${f.temp.toFixed(1)} °C <small>(${T('target', 'objetivo')} 2.5)</small> · ${Math.round(f.hum)}% ${T('RH', 'HR')} <small>(70)</small></p><p>${T('Simulated viability', 'Viabilidad simulada')}: <b class="${mood}">${via}</b></p><p class="small">${T('Risk index', 'Índice de riesgo')} ${Math.round(f.risk)}/100 · ${T('not a real survival chance', 'no es una probabilidad real')}</p><span class="aimark">AI</span></div>
  <div class="panel"><p class="eyebrow">${T('SHIP', 'NAVE')}</p>
    ${meter(T('Power', 'Energía'), t.use, Math.round(f.gen), 'W', t.use > f.gen)}${meter(T('Battery', 'Batería'), Math.round(f.charge), CFG.batteryWh, 'Wh')}${meter(T('Hull', 'Casco'), Math.round(f.integrity), 100, '%', f.integrity < 60)}
    <p>${T('Science received', 'Ciencia recibida')}: <b>${Math.round(f.data)} MB</b> · ${T('repairs left', 'reparaciones')}: <b>${f.repairs}</b></p>
    <p class="blink">◉ ${T('Signal delay', 'Retraso de señal')}: ${E.delayMin(g)} min <small>(${T('route data', 'datos de la ruta')})</small></p>
    <p class="msg">${month > 0 ? L(CREW_MSG[(month - 1) % CREW_MSG.length]) : T('The Earth shrinks behind the ship.', 'La Tierra se achica detrás de la nave.')}</p></div>
  <div class="panel term"><p class="eyebrow">${T('MISSION LOG', 'BITÁCORA DE MISIÓN')}</p><div class="termbox">${g.log.slice(-7).map(l => `<p>&gt; ${esc(S.lang === 'es' ? l.es : l.en)}</p>`).join('')}</div></div></div>
  <div class="row">${f.pending ? btn(T('! Respond to the alarm', '! Responder a la alarma'), 'event', 'primary big danger') : btn(T('← Back to the ship', '← Volver a la nave'), 'world', 'primary big')}</div></section>${aiNote()}`;
}
function eventModal() {
  const g = S.g, f = g.flight, k = f.pending, who = CREW.find(c => c.role === (k === 'thermal' ? 1 : k === 'comms' ? 2 : 0));
  const head = { thermal: [T('ALERT! Hive temperature out of range', '¡ALERTA! Temperatura de la colmena fuera de rango'), T(`${queen()}'s chamber is warming up. Nobody on Earth can help in time: the signal takes ${E.delayMin(g)} minutes.`, `La cámara de ${queen()} se está calentando. Nadie en la Tierra puede ayudar a tiempo: la señal tarda ${E.delayMin(g)} minutos.`)],
    comms: [T('Signal lost with NASA’s Deep Space Network!', '¡Pérdida de señal con la Deep Space Network de la NASA!'), T('A solar storm hit the ship. Science data cannot be sent.', 'Una tormenta solar golpeó la nave. No se pueden enviar los datos científicos.')],
    mech: [T('Minor impact detected!', '¡Impacto menor detectado!'), T('A micrometeorite hit the hull. Sparks near life support.', 'Un micrometeorito golpeó el casco. Hay chispas cerca del soporte vital.')] }[k];
  return `<div class="modal alarm"><div class="mbox"><p class="eyebrow">${T('DECISION FOR', 'DECIDE')} ${who.name} · ${L(ROLES[who.role])}${playerOf(who.role)}</p><h2>${head[0]}</h2><p>${head[1]}</p>
  ${S.relaxed ? '' : `<div class="timer"><i id="tbar"></i><span id="tnum">${S.left}</span></div>`}
  <div class="opts">${E.options(g).map(o => `<article class="opt ${o.ok ? '' : 'off'}"><h4>${L(o.name)}</h4><p>${L(o.desc)}</p>${btn(o.ok ? T('Choose', 'Elegir') : T('Not available', 'No disponible'), 'resolve:' + o.id, 'primary', !o.ok)}</article>`).join('')}</div>
  ${S.relaxed ? '' : `<p class="small">${T('If time runs out, the ship answers on its own.', 'Si se acaba el tiempo, la nave responde por su cuenta.')}</p>`}</div></div>`;
}
function green() {
  const g = S.g, gr = g.green; audio.play('calm');
  const cells = `<div class="cells">${[0, 1, 2, 3].map(i => `<i class="${i < gr.cells ? 'on' : ''}"></i>`).join('')}</div>`;
  let right;
  if (!gr.done) { const s = GREEN[gr.step], who = CREW.find(c => c.role === s.role);
    right = `<p class="eyebrow">${T('STEP', 'PASO')} ${gr.step + 1}/4 · ${who.name || doc()} · ${L(ROLES[s.role])}${playerOf(s.role)}</p><h2>${L(s.title)}</h2><p>${L(s.text)}</p>
    <div class="opts"><article class="opt"><h4>${L(s.a)}</h4><p>${T('Uses 1 energy cell.', 'Usa 1 celda de energía.')} ${s.da ? T(`Colony +${s.da}.`, `Colonia +${s.da}.`) : T('+50 science.', '+50 de ciencia.')}</p>${btn(gr.cells > 0 ? T('Choose', 'Elegir') : T('No cells left', 'Sin celdas'), 'green:1', 'primary', gr.cells <= 0)}</article>
    <article class="opt"><h4>${L(s.b)}</h4><p>${T('Free.', 'Gratis.')} ${s.db ? T(`Colony ${s.db}.`, `Colonia ${s.db}.`) : T('+10 science.', '+10 de ciencia.')}</p>${btn(T('Choose', 'Elegir'), 'green:0')}</article></div>`;
  } else { const r = E.greenResult(g);
    right = `<p class="eyebrow">${T('RESULT · HYPOTHETICAL MODEL', 'RESULTADO · MODELO HIPOTÉTICO')}</p><h2>${r.founded ? T(`${queen()} woke up. A colony is born.`, `${queen()} despertó. Nace una colonia.`) : r.awake ? T(`${queen()} woke up, but she is too weak to start a colony.`, `${queen()} despertó, pero está muy débil para fundar una colonia.`) : T(`${queen()} did not wake up.`, `${queen()} no despertó.`)}</h2>
    <p>${r.pollinated ? T('Her first daughters shake the tomato flowers. The first fruit of Mars is growing.', 'Sus primeras hijas hacen vibrar las flores de tomate. Crece el primer fruto de Marte.') : r.founded ? T('There were too few flowers for a pollination test.', 'Hubo muy pocas flores para una prueba de polinización.') : T('A calmer trip and a gentle wake-up would give her a better start.', 'Un viaje más tranquilo y un despertar suave le darían un mejor comienzo.')}</p>
    <div class="row">${btn(T('See how the story ends', 'Ver cómo termina la historia'), 'ending', 'primary big')}</div>`; }
  return `${header()}<section class="scene bg-green pad"><div class="ggrid"><div class="panel"><p class="eyebrow">${T('MARS GREENHOUSE · SEALED · HYPOTHETICAL', 'INVERNADERO EN MARTE · SELLADO · HIPOTÉTICO')}</p>${bee(gr.done ? (gr.colony >= 60 ? 'happy' : gr.colony >= 35 ? '' : 'risk') : 'sleep', 'big')}
  ${meter(T('Colony index', 'Índice de colonia'), Math.round(gr.colony), 100, '')}<p class="small">${T(`Started at ${Math.round(gr.start)}: 100 minus the trip risk.`, `Partió en ${Math.round(gr.start)}: 100 menos el riesgo del viaje.`)}</p><p>${T('Energy cells', 'Celdas de energía')}</p>${cells}
  <p class="small">${T('Cells come from your trip: 2, +1 for battery ≥ 800 Wh, +1 for hull ≥ 80%. Nothing is released on Mars (planetary protection).', 'Las celdas vienen del viaje: 2, +1 por batería ≥ 800 Wh, +1 por casco ≥ 80 %. Nada se libera en Marte (protección planetaria).')}</p></div><div class="panel">${right}</div></div><span class="aimark">AI</span></section>${aiNote()}`;
}
function reportScreen() {
  const g = S.g, rep = E.report(g), fb = E.feedback(g), f = g.flight, t = E.stats(g), r = E.route(g);
  audio.play(rep.ending === 'A' ? 'nobel' : rep.ending === 'B' ? 'calm' : 'sad'); unlock('open');
  const end = { A: [T('ENDING A · The call from Stockholm', 'FINAL A · La llamada de Estocolmo'), 'ACCEPTED', 'ACEPTADO'], B: [T('ENDING B · The lab survives', 'FINAL B · El laboratorio sobrevive'), 'MAJOR REVISIONS', 'REVISIÓN MAYOR'], C: [T('ENDING C · Closed… for now', 'FINAL C · Clausurado… por ahora'), 'REJECTED', 'RECHAZADO'] }[rep.ending];
  const li = a => a.map(x => `<li>${L(x)}</li>`).join('');
  return `${header()}<section class="report"><div class="paper wide"><div class="stamp v${rep.ending}">${T(end[1], end[2])}<small>${T('Journal of Pollinator Spaceflight (fictional)', 'Revista de Vuelo Espacial de Polinizadores (ficticia)')}</small></div>
  <p class="eyebrow">${end[0]}</p><h2>${T('Dormant <i>Bombus terrestris</i> queens on a transfer to Mars: a mission design study', 'Reinas de <i>Bombus terrestris</i> en diapausa en una transferencia a Marte: un estudio de diseño de misión')}</h2>
  <p class="small">${doc()}, Pip, Nim, Eko · ${T('Funded by Aurelia (fictional)', 'Financiado por Aurelia (ficticia)')} · ${T('Attempt', 'Intento')} ${g.attempt} · ${T('seed', 'semilla')} ${g.seed}</p>
  <div class="scorebox"><div class="big-score">${rep.score}<small>/100</small></div><div class="bars">
    <p>${T('Equipment and configuration', 'Equipos y configuración')} <b>${rep.eq}/40</b></p><i><u style="width:${rep.eq / 40 * 100}%"></u></i>
    <p>${T('Reactions to events', 'Reacción ante eventos')} <b>${rep.ev}/40</b> <small>(${T('heat', 'calor')} ${rep.evP.thermal} · ${T('signal', 'señal')} ${rep.evP.comms} · ${T('impact', 'impacto')} ${rep.evP.mech})</small></p><i><u style="width:${rep.ev / 40 * 100}%"></u></i>
    <p>${T('Resources left', 'Recursos restantes')} <b>${rep.res}/20</b> <small>(${T('battery', 'batería')} ${Math.round(f.charge / CFG.batteryWh * 100)}% · ◈ ${rep.budget})</small></p><i><u style="width:${rep.res / 20 * 100}%"></u></i></div></div>
  <p class="small">${T('80–100 with the queens in good condition: ending A. 50–79: ending B. Below 50 or a lost mission: ending C.', '80–100 con las reinas en buen estado: final A. 50–79: final B. Menos de 50 o misión perdida: final C.')}${!rep.ok ? ' ' + T('The mission did not arrive, so the score is capped at 49.', 'La misión no llegó, así que el puntaje tiene tope de 49.') : rep.status !== 'good' ? ' ' + T('The queens arrived at risk, so the score is capped at 79.', 'Las reinas llegaron en riesgo, así que el puntaje tiene tope de 79.') : ''}</p>
  <h3>${T('Abstract', 'Resumen')}</h3><p>${T(`We flew ${g.parts.map(id => E.item(id).name[0]).join(', ')} (${t.kg} kg) on the ${E.launcher(g).name[0]} rocket along ${r.name[0]}, a NASA Trajectory Browser transfer of ${r.days} days. The spacecraft ${rep.ok ? 'reached Mars' : 'did not complete the trip'}; simulated viability was ${rep.status === 'good' ? 'good' : rep.status === 'risk' ? 'at risk' : 'compromised'}.`,
    `Volamos ${g.parts.map(id => E.item(id).name[1]).join(', ')} (${t.kg} kg) en el cohete ${E.launcher(g).name[1]} por la ${r.name[1]}, una transferencia de ${r.days} días del NASA Trajectory Browser. La nave ${rep.ok ? 'llegó a Marte' : 'no completó el viaje'}; la viabilidad simulada fue ${rep.status === 'good' ? 'buena' : rep.status === 'risk' ? 'en riesgo' : 'comprometida'}.`)}</p>
  <h3>${T('Results by month', 'Resultados por mes')}</h3><div class="tablewrap"><table><tr><th>${T('Day', 'Día')}</th><th>W</th><th>Wh</th><th>°C</th><th>% ${T('RH', 'HR')}</th><th>${T('Risk', 'Riesgo')}</th><th>MB</th><th>${T('Hull', 'Casco')}</th></tr>${f.stages.map(s => `<tr><td>${s.day}</td><td>${s.gen}/${s.use}</td><td>${s.charge}</td><td>${s.temp.toFixed(1)}</td><td>${s.hum}</td><td>${s.risk}</td><td>${s.data}</td><td>${s.integ}</td></tr>`).join('')}</table></div>
  <h3>${T('Conclusions', 'Conclusiones')}</h3><ul>${li(fb.find)}</ul>
  <h3>${T('Peer review: what worked', 'Revisión de pares: lo que funcionó')}</h3><ul class="good">${li(fb.good)}</ul>
  <h3>${T('Peer review: what to improve', 'Revisión de pares: qué mejorar')}</h3><ul class="fix">${li(fb.fix)}</ul>
  <p class="note">${T('This simulator is a hypothetical educational model. Launch windows, transit times, signal delay and Earth diapause values come from NASA, ESA and peer-reviewed studies, but the survival of bumblebee queens on an interplanetary flight to Mars is an open scientific question, not a demonstrated capability.', 'Este simulador es un modelo educativo hipotético. Las ventanas orbitales, los tiempos de tránsito, el retraso de señal y los valores de diapausa terrestre vienen de la NASA, la ESA y estudios revisados por pares, pero la supervivencia de reinas de abejorro en un vuelo interplanetario a Marte es una pregunta científica abierta y no una capacidad demostrada.')}</p>
  <div class="row">${btn(T('Redesign the mission', 'Rediseñar la misión'), 'redesign', 'primary big')}${btn(T('Science album', 'Álbum de ciencia') + ` ${S.album.length}/${CARDS.length}`, 'm:album')}${btn(T('Sources', 'Fuentes'), 'm:sources')}${btn(T('Full logbook', 'Bitácora completa'), 'm:log')}${btn(T('Title', 'Título'), 'home')}</div></div></section>${aiNote()}`;
}
function modal() {
  const m = S.modal; if (!m) return ''; if (m === 'event') return eventModal();
  let h = worldModal(m) || '';
  if (m === 'album') h = `<h2>${T('Science album', 'Álbum de ciencia')} · ${S.album.length}/${CARDS.length}</h2><p>${S.album.length === CARDS.length ? T('★ Complete! You know what a mission designer knows.', '★ ¡Completo! Ya sabes lo que sabe quien diseña misiones.') : T('Play, fail and try other designs to find every card.', 'Juega, falla y prueba otros diseños para encontrar todas las cartas.')}</p><div class="album">${CARDS.map(c => S.album.includes(c.id) ? `<article class="cardc on"><img src="assets/eq/science_card.png" alt=""><h4>${L(c.name)}</h4><p>${L(c.text)}</p></article>` : `<article class="cardc"><h4>? ? ?</h4><p>${T('Not found yet', 'Aún sin descubrir')}</p></article>`).join('')}</div>`;
  if (m === 'sources') h = `<h2>${T('Sources and scientific support', 'Fuentes y respaldo científico')}</h2><p class="small">NASA / ESA = ${T('official data', 'datos oficiales')} · PAPER = ${T('peer-reviewed, Earth conditions', 'revisado por pares, condiciones terrestres')} · TEAM = ${T('simplified game model', 'modelo simplificado del juego')} · OPEN = ${T('unknown to science', 'la ciencia aún no lo sabe')}</p>${SOURCES.map(s => `<article class="src"><span class="tag t-${s.tag.split('/')[0]}">${s.tag}</span><div><h4>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>` : s.title}</h4><p>${L(s.use)}</p></div></article>`).join('')}
    <h3>${T('Credits', 'Créditos')}</h3><p class="small">${T('Idea, story and rules: BeeYond Mars team. Art is AI-assisted and marked “AI”. Music: original chiptune generated in the browser. Code written with AI assistance (OpenAI Codex, Claude) and reviewed by the team. Fonts: Press Start 2P and Pixelify Sans (OFL). No NASA logos; Aurelia and the journal are fictional.', 'Idea, historia y reglas: equipo BeeYond Mars. El arte es asistido por IA y lleva la marca «AI». Música: chiptune original generado en el navegador. Código escrito con ayuda de IA (OpenAI Codex, Claude) y revisado por el equipo. Fuentes tipográficas: Press Start 2P y Pixelify Sans (OFL). Sin logos de la NASA; Aurelia y la revista son ficticias.')}</p>
    <label class="row">${T('Volume', 'Volumen')} <input type="range" id="vol" min="0" max="1" step="0.05" value="${audio.vol}"></label>`;
  if (m === 'log') h = `<h2>${T('Logbook', 'Bitácora')}</h2><div class="termbox tall">${S.g.log.map(l => `<p>&gt; ${T('Day', 'Día')} ${l.day}: ${esc(S.lang === 'es' ? l.es : l.en)}</p>`).join('')}</div>`;
  return `<div class="modal"><div class="mbox">${h}<div class="row">${btn(T('Close', 'Cerrar'), 'm:', 'primary')}</div></div></div>`;
}
function render() {
  document.documentElement.lang = S.lang;
  const v = { title, cut, letter, friends, lab, voyage, green, report: reportScreen, world }[S.screen]();
  app.innerHTML = v + modal();
  if (S.modal === 'event' && !S.relaxed) drawTimer();
}

// ------------------------------------------------------------------ decision timer
function stopTimer() { clearInterval(S.timer); S.timer = null; }
function drawTimer() { const b = $('#tbar'), n = $('#tnum'); if (b) b.style.width = S.left / S.timerSec * 100 + '%'; if (n) n.textContent = S.left; }
function openEvent() {
  S.modal = 'event'; const k = S.g.flight.pending; unlock(k === 'comms' ? 'storm' : k === 'thermal' ? 'delay' : 'sts'); if (k === 'comms') unlock('dsn');
  stopTimer();
  S.relaxed = !S.timerSec;
  if (S.timerSec) { S.left = S.timerSec; S.timer = setInterval(() => { if (document.hidden || S.modal !== 'event') return; S.left--; drawTimer(); if (S.left <= 5 && S.left > 0) audio.sfx('blip'); if (S.left <= 0) { toast(T('Time ran out: autonomous response logged.', 'Se acabó el tiempo: respuesta autónoma registrada.')); act('resolve:' + E.autoOption(S.g)); } }, 1000); }
  render();
}
function afterFlightStep() {
  const g = S.g;
  if (g.phase === 'report') { stopTimer(); S.modal = null;
    if (E.arrived(g)) cutscene(arrival(), () => { E.greenStart(g); unlock('protect'); S.st.chapter = 'green'; toWorld('green'); });
    else finish();
  } else if (g.flight.pending) openEvent(); else { S.modal = null; render(); saveGame(); }
}
function finish() { const rep = E.report(S.g); if (rep.score > S.best) { S.best = rep.score; store.set('bym-best', S.best); } cutscene(endings[rep.ending](), () => { go('report'); saveGame(); }); }

// ------------------------------------------------------------------ walkable world (story, dialogs, notebook)
const newStory = () => ({ nb: 0, plant: 0, knock: 0, letter: 0, pip: { off: 0, cable: 0, on: 0, in: 0, ans: '' }, nim: { water: 0, watch: 0, in: 0 }, eko: { msg: '', in: 0, fixed: 0 }, bench: 0, mem: [], chapter: 'prologue', carry: false, awake: false, gstep: 0, greenDone: false });
const W = new World({
  active: () => S.screen === 'world' && !S.dlg && !S.modal,
  visible: () => S.screen === 'world',
  state: () => { const s = S.st, g = S.g; s.dim = W.room === 'room' && !s.letter ? 0.38 - 0.1 * (s.nb === 2) - 0.1 * s.plant : 0; s.alarm = W.room === 'ship' && g && g.flight && !!g.flight.pending; s.prog = g && g.flight ? g.day / E.totalDays(g) : 0; return s; },
  onNear: q => { const p = $('#prompt'); if (p) p.textContent = q ? 'E · ' + L(q.name) : ''; },
  onRoom: room => { audio.play({ room: S.st.letter ? 'calm' : 'sad', town: 'calm', pip: 'lab', nim: 'calm', eko: 'space', lab: 'lab', ship: 'space', green: 'calm' }[room]); },
  interact: id => interact(id)
});
const allIn = () => S.st.pip.in && S.st.nim.in && S.st.eko.in;
function mem(en, es) { const s = S.st; if (s.mem.some(m => m[0] === en)) return; s.mem.push([en, es]); toast(T('Memory kept: ', 'Recuerdo guardado: ') + T(en, es)); audio.sfx('coin'); }
function saveGame() { if (S.g && S.st) store.set('bym-save', { g: S.g, st: S.st, room: W.room, x: W.p.x, y: W.p.y, screen: S.screen === 'report' ? 'report' : 'world', players: S.players }); }
function toWorld(room, x, y) { if (room) W.enter(room, x, y); S.dlg = null; go('world'); saveGame(); }
// dialog: lines = [{ who, t:[en,es], ch:[{ t:[en,es], f }] }]
const ln = (who, en, es, ch) => ({ who, t: [en, es], ch });
function say(lines, done) { S.dlg = { lines: Array.isArray(lines) ? lines : [lines], i: 0, done }; W.keys.clear(); audio.sfx('blip'); render(); }
function dlgNext(force) {
  const d = S.dlg; if (!d) return; if (d.typing) { d.skip = true; return; } if (d.lines[d.i].ch && !force) return;
  if (++d.i >= d.lines.length) { S.dlg = null; render(); if (d.done) d.done(); saveGame(); } else render();
}
function dlgType() { const d = S.dlg, el = $('#wdlg-text'); if (!d || !el) return; const text = L(d.lines[d.i].t); let i = 0; d.typing = true; d.skip = false; const cur = d.i;
  const tick = () => { if (S.dlg !== d || d.i !== cur) return; i = d.skip ? text.length : i + 2; const e = $('#wdlg-text'); if (e) e.textContent = text.slice(0, i); if (i < text.length) setTimeout(tick, 22); else { d.typing = false; const c = $('#wdlg-ch'); if (c) c.hidden = false; } }; tick(); }
const portrait = who => who ? `<canvas class="pt" data-who="${who}" width="20" height="28"></canvas>` : '';
const whoName = who => who === 'you' ? doc() : who === 'queen' ? queen() : who === 'pip' ? 'Pip' : who === 'nim' ? 'Nim' : who === 'eko' ? 'Eko' : who || '';
function objective() {
  const s = S.st, g = S.g;
  if (!s.nb) return T('Go to the moving box.', 'Acércate a la caja.');
  if (s.nb === 1) return T('Take the notebook to the desk.', 'Lleva el cuaderno al escritorio.');
  if (!s.plant) return T('Water the last plant.', 'Riega la última planta.');
  if (!s.letter) return T('Someone knocked. Check the door.', 'Alguien llamó. Revisa la puerta.');
  if (!allIn()) return T('Find Pip, Nim and Eko in town', 'Busca a Pip, Nim y Eko en el pueblo') + ` (${[s.pip.in, s.nim.in, s.eko.in].filter(Boolean).length}/3)`;
  if (g.phase === 'lab') { const m = E.milestone(g); return m < 4 ? T(`Aurelia Laboratory: design the ship (CML ${m}/4) and use the review table.`, `Laboratorio Aurelia: diseña la nave (CML ${m}/4) y usa la mesa de revisión.`) : T('Ready: take the path to the rocket.', 'Todo listo: toma el camino al cohete.'); }
  if (g.phase === 'voyage') return g.flight.pending ? T('Alarm! Answer it at the command post.', '¡Alarma! Respóndela en el puesto de mando.') : T(`Day ${g.day}/${E.totalDays(g)}. Talk to the crew, check the chamber, advance at the command post.`, `Día ${g.day}/${E.totalDays(g)}. Habla con el equipo, revisa la cámara y avanza en el puesto de mando.`);
  if (g.green && !g.green.done) return T(`Greenhouse: step ${g.green.step + 1} of 4 — `, `Invernadero: paso ${g.green.step + 1} de 4 — `) + L(ROOMS.green.objs[g.green.step].name);
  return T('Leave through the door to write the paper.', 'Sal por la puerta para escribir el paper.');
}
function world() {
  const q = W.near, d = S.dlg, l = d && d.lines[d.i];
  setTimeout(() => { const st = $('#stage'); if (st && W.cv.parentNode !== st) st.appendChild(W.cv); if (d) dlgType(); document.querySelectorAll('canvas.pt').forEach(c => W.portrait(c, c.dataset.who)); }, 0);
  return `<section class="wwrap"><div class="whud"><b class="logo">BEEYOND MARS</b><span class="chip">${L(ROOMS[W.room].name)}</span>${S.g && S.st.letter ? `<span class="chip">◈ ${E.stats(S.g).budget}</span>` : ''}<span class="grow"></span>
    ${btn(T('Notebook', 'Cuaderno'), 'm:notebook', 'sm')}${btn(T('Go to…', 'Accesos'), 'm:access', 'sm')}${btn('♪', 'music', 'sm ' + (audio.on ? 'on' : ''))}${btn('II', 'm:pause', 'sm')}</div>
  <p class="wobj">▸ ${objective()}</p>
  <div id="stage" class="stage"></div><p id="prompt" class="prompt">${q && !d ? 'E · ' + L(q.name) : ''}</p>
  <div class="pad"><button data-k="up">▲</button><button data-k="left">◀</button><button data-k="down">▼</button><button data-k="right">▶</button><button data-k="act" class="pe">E</button></div>
  ${d ? `<div class="dialog wdlg" data-a="dlg">${portrait(l.who)}<div class="wd">${l.who ? `<b class="who">${esc(whoName(l.who))}</b>` : ''}<p id="wdlg-text"></p>
    ${l.ch ? `<div id="wdlg-ch" class="row" hidden>${l.ch.map((c, i) => btn(L(c.t), 'pick:' + i, 'primary sm', c.off)).join('')}</div>` : '<span class="next">▼</span>'}</div></div>` : ''}
  <p class="ainote">${T('WASD / arrows: walk · E or space: interact · click: walk there · Esc: pause · world art drawn by code', 'WASD / flechas: caminar · E o espacio: interactuar · clic: caminar hasta ahí · Esc: pausa · mundo dibujado por código')}</p></section>`;
}
const CH = (en, es, f, off) => ({ t: [en, es], f, off });
function interact(id) {
  const s = S.st, g = S.g, room = W.room, q = queen(); audio.sfx('click');
  if (room === 'room') {
    if (id === 'box') { if (!s.nb) { s.nb = 1; s.carry = true; mem('The notebook, out of the box', 'El cuaderno fuera de la caja'); return say([ln('', 'A box that never got taped shut. On top: the research notebook.', 'Una caja que nunca se cerró con cinta. Encima: el cuaderno de investigación.'), ln('you', 'Forty-one proposals. It weighs less than I remembered.', 'Cuarenta y una propuestas. Pesa menos de lo que recordaba.')]); } return say(ln('', 'The rest can stay in the box for now.', 'El resto puede quedarse en la caja por ahora.')); }
    if (id === 'desk') { if (s.nb === 1) { s.nb = 2; s.carry = false; say(ln('you', 'A clean rectangle in the dust, exactly its size. It goes back where it used to be.', 'Un rectángulo limpio en el polvo, justo de su tamaño. Vuelve al lugar que antes ocupaba.'), knockCheck); return; } return say(ln('', s.nb ? `The notebook is open on the first page: “Can a queen sleep all the way to Mars?”` : 'A desk with an empty space where the work used to be.', s.nb ? 'El cuaderno está abierto en la primera página: «¿Puede una reina dormir hasta Marte?»' : 'Un escritorio con un espacio vacío donde antes estaba el trabajo.')); }
    if (id === 'plant') { if (!s.plant) { s.plant = 1; mem('The last plant is still here', 'La última planta sigue aquí'); return say([ln('', 'You pour what is left in the glass. The soil drinks it at once.', 'Viertes lo que queda del vaso. La tierra lo bebe de inmediato.'), ln('you', 'The plant does not know I was going to give up today.', 'La planta no sabe que hoy pensaba rendirme.')], knockCheck); } return say(ln('', 'One leaf already looks a little straighter.', 'Una hoja ya se ve un poco más derecha.')); }
    if (id === 'cup') return say(ln('', 'Cold tea, from this morning. Or from yesterday.', 'Té frío, de esta mañana. O de ayer.'));
    if (id === 'bills') return say(ln('', 'Receipts in red, and drafts with one sentence crossed out many times: “Bumblebee queens in diapause…”', 'Recibos en rojo y borradores con una frase tachada muchas veces: «Reinas de abejorro en diapausa…»'));
    if (id === 'bed') return say(ln('you', 'Not yet.', 'Todavía no.'));
    if (id === 'letter') { audio.sfx('coin'); return go('letter'); }
    if (id === 'exit') { if (!s.letter) return say(ln('you', s.knock ? 'There is an envelope on the floor.' : 'There is nothing out there for me today.', s.knock ? 'Hay un sobre en el suelo.' : 'Hoy no hay nada para mí allá afuera.')); return toWorld('town', 118, 136); }
  }
  if (room === 'town') {
    if (id === 'd_home') return toWorld('room', 176, 190); if (id === 'd_pip') return toWorld('pip'); if (id === 'd_nim') return toWorld('nim'); if (id === 'd_eko') return toWorld('eko');
    if (id === 'd_lab') { if (g.phase !== 'lab') return; return toWorld('lab'); }
    if (id === 'sign') return say(ln('', '“The Garden of Orbits.” North: Pip’s workshop and Eko’s station. South: Nim’s garden and the Aurelia Laboratory.', '«El jardín de las órbitas». Al norte: el taller de Pip y la estación de Eko. Al sur: el jardín de Nim y el Laboratorio Aurelia.'));
    if (id === 'bench') { if (allIn()) { s.bench = 1; mem('Four seats on the bench', 'Cuatro lugares en el banco'); return say([ln('', 'The four of you sit down. Nobody talks about the mission for a while.', 'Se sientan los cuatro. Por un rato, nadie habla de la misión.'), ln('nim', 'It was always a bench for four.', 'Siempre fue un banco para cuatro.')]); } return say(ln('', 'A bench with room for four. Today it feels very long.', 'Un banco con espacio para cuatro. Hoy se siente muy largo.')); }
  }
  if (room === 'pip') { const p = s.pip;
    if (id === 'exit') return toWorld('town', 324, 132);
    if (id === 'switch') { if (!p.off) { p.off = 1; return say(ln('pip', 'Oh! Power off. Now we can touch it without fireworks.', '¡Oh! Corriente cortada. Ahora sí se puede tocar sin fuegos artificiales.')); } if (p.cable && p.on !== 2) { p.on = 2; audio.sfx('win'); mem('A radio, fixed by two', 'Una radio, arreglada entre dos'); return say(ln('', 'Static… then a clear voice reading the weather. The radio works.', 'Estática… y luego una voz clara leyendo el clima. La radio funciona.')); } return say(ln('', p.on === 2 ? 'The switch is on. The radio hums.' : 'It is off. The radio is waiting.', p.on === 2 ? 'El interruptor está encendido. La radio zumba.' : 'Está apagado. La radio espera.')); }
    if (id === 'radio') { if (!p.off) return say(ln('', 'It spits sparks. Better to cut the power first: the switch is on the wall.', 'Escupe chispas. Mejor cortar la corriente primero: el interruptor está en la pared.')); if (!p.cable) { p.cable = 1; return say([ln('pip', 'Hold this cable. Steady… steady…', 'Sostén este cable. Firme… firme…'), ln('', 'You hold it while Pip solders the old connector. It takes two hands and two people.', 'Lo sostienes mientras Pip suelda el conector viejo. Hacen falta dos manos y dos personas.'), ln('pip', 'Done. Turn the power back on.', 'Listo. Vuelve a dar la corriente.')]); } return say(ln('', p.on === 2 ? 'It works. The solder is still warm.' : 'Repaired. It only needs power.', p.on === 2 ? 'Funciona. La soldadura sigue tibia.' : 'Reparada. Solo le falta corriente.')); }
    if (id === 'pip') { if (p.in) return say(ln('pip', 'I’m packing my tools. See you at the lab.', 'Estoy guardando mis herramientas. Nos vemos en el laboratorio.')); if (p.on !== 2) return say(ln('pip', 'Lum! Three years… Wait, help me with this radio first. I can’t hold the cable and solder at the same time.', '¡Lum! Tres años… Espera, ayúdame antes con esta radio. No puedo sostener el cable y soldar a la vez.'));
      const join = a => () => { p.in = 1; p.ans = a; say([ln('pip', a === 'fear' ? 'Me too. We’ll fail smaller if we fail together. Every kilogram, we check it twice.' : 'That is all you had to say. Every kilogram, we check it twice.', a === 'fear' ? 'A mí también. Si fallamos juntos, fallamos más chico. Cada kilo lo revisamos dos veces.' : 'Era todo lo que tenías que decir. Cada kilo lo revisamos dos veces.'), ln('', 'Pip joins the team: engineering.', 'Pip se une al equipo: ingeniería.')]); };
      return say([ln('pip', 'You don’t have to fix everything without help.', 'No hace falta que lo arregles todo sin ayuda.'), ln('you', '…', '…', [CH('I’m afraid of failing again.', 'Me da miedo volver a fallar.', join('fear')), CH('I need your help.', 'Necesito tu ayuda.', join('help'))])]); }
  }
  if (room === 'nim') { const n = s.nim;
    if (id === 'exit') return toWorld('town', 120, 284);
    if (id === 'seedbed') { if (!n.water) { n.water = 1; mem('Waiting by the seedbed', 'Esperar junto al semillero'); return say(ln('', 'You water row by row. Small green hooks are already pushing through.', 'Riegas fila por fila. Unos ganchitos verdes ya asoman.')); } return say(ln('', 'The soil is dark and damp. Nothing to do but wait.', 'La tierra está oscura y húmeda. No queda más que esperar.')); }
    if (id === 'flowers') { n.watch = 1; unlock('buzz'); return say([ln('', 'A bumblebee grabs a flower and shakes it with its whole body. You stay and watch.', 'Un abejorro se agarra de una flor y la sacude con todo el cuerpo. Te quedas mirando.'), ln('', 'Nothing happens. No points, no progress. It is enough.', 'No pasa nada. Ni puntos ni avance. Es suficiente.')]); }
    if (id === 'nim') { if (n.in) return say(ln('nim', 'I’ll bring the queens myself. Slowly.', 'Yo misma llevo a las reinas. Despacio.')); if (!n.water || !n.watch) return say(ln('nim', !n.water ? 'Lum. The seedbed is thirsty. Would you?' : 'Have you looked at them today? Really looked? Go and watch the bumblebees for a moment.', !n.water ? 'Lum. El semillero tiene sed. ¿Me ayudas?' : '¿Las miraste hoy? ¿De verdad? Ve a observar a los abejorros un momento.'));
      n.in = 1; return say([ln('nim', 'Observing is also caring. I’ll come, on one condition.', 'Observar también es cuidar. Voy, con una condición.'), ln('nim', 'If we don’t know something, we write it down. That is caring too.', 'Si no sabemos algo, lo escribimos. También eso es cuidar.'), ln('', 'Nim joins the team: biology.', 'Nim se une al equipo: biología.')]); }
  }
  if (room === 'eko') { const e = s.eko;
    if (id === 'exit') return toWorld('town', 580, 144);
    if (id === 'console') { if (e.in && e.msg) return say(ln('', 'The message to Aurelia has been sent.', 'El mensaje para Aurelia ya fue enviado.')); const set = m => () => { e.msg = m; audio.sfx('blip'); say(ln('', m === 'honest' ? 'Sent: “We do not know if the queens survive the trip. We want to find out, and we will report what fails.”' : 'Sent: “We guarantee the queens will arrive alive.”', m === 'honest' ? 'Enviado: «No sabemos si las reinas sobreviven el viaje. Queremos averiguarlo y contaremos lo que falle».' : 'Enviado: «Garantizamos que las reinas llegarán vivas».')); };
      return say([ln('eko', 'Aurelia is listening on this frequency. What do we tell them?', 'Aurelia escucha en esta frecuencia. ¿Qué les decimos?'), ln('you', '…', '…', [CH('A question, with what we don’t know', 'Una pregunta, con lo que no sabemos', set('honest')), CH('A guaranteed result', 'Un resultado garantizado', set('promise'))])]); }
    if (id === 'eko') { if (e.in) return say(ln('eko', 'I’ll keep one ear on the sky and one on you.', 'Tendré un oído en el cielo y otro en ti.')); if (!e.msg) return say(ln('eko', 'Lum! Before anything else: help me write to Aurelia. The console is ready.', '¡Lum! Antes que nada: ayúdame a escribirle a Aurelia. La consola está lista.'));
      e.in = 1; unlock('dsn'); return say([ln('eko', e.msg === 'honest' ? 'You told them what we don’t know. I can work with someone like that.' : 'A guarantee… Nobody can promise that, Lum. It worries me. But I’m coming, and we can fix that message later.', e.msg === 'honest' ? 'Les dijiste lo que no sabemos. Con alguien así puedo trabajar.' : 'Una garantía… Nadie puede prometer eso, Lum. Me preocupa. Pero voy, y ese mensaje se puede corregir después.'), ln('', 'Eko joins the team: communications.', 'Eko se une al equipo: comunicaciones.')]); }
  }
  if (room === 'lab') {
    if (id === 'exit') return toWorld('town', 474, 344);
    const tab = { st_bio: 1, st_eng: 0, st_com: 2, st_map: 3 }[id]; if (tab !== undefined) { S.tab = tab; return go('lab'); }
    if (id === 'st_rev') { const got = []; for (const i of [0, 1]) if (E.claim(g, i)) { got.push(i); unlock('cml'); } if (got.length) audio.sfx('coin'); const m = E.milestone(g), er = E.errors(g);
      const lines = got.map(i => ln('', `Design review passed. Aurelia releases ${CFG.grants[i]} credits.`, `Revisión de diseño aprobada. Aurelia libera ${CFG.grants[i]} créditos.`));
      lines.push(ln('', `Design maturity: CML ${m}/4. ` + (m === 1 ? 'Next: fit a chamber within mass and starting power (+150).' : m === 2 ? 'Next: compare both routes on the trajectory map (+200).' : m === 3 ? 'Next: ' + (er[0] ? er[0][0] : 'ready.') : 'The design fits every constraint.'), `Madurez del diseño: CML ${m}/4. ` + (m === 1 ? 'Sigue: instala una cámara que calce en masa y potencia inicial (+150).' : m === 2 ? 'Sigue: compara las dos rutas en el mapa de trayectorias (+200).' : m === 3 ? 'Sigue: ' + (er[0] ? er[0][1] : 'listo.') : 'El diseño cumple todas las restricciones.')));
      if (m >= 3) lines.push(ln('', E.hints(g)[0][0], E.hints(g)[0][1])); return say(lines); }
    if (id === 'to_rocket') return act('launch');
    if (id === 'pip') return say(ln('pip', 'Each kilogram costs 0.008 km/s of delta-v. The engineering bench is mine.', 'Cada kilo cuesta 0,008 km/s de delta-v. El banco de ingeniería es el mío.'));
    if (id === 'nim') return say(ln('nim', `${q} needs 2.5 °C and 70% humidity. The Economy chamber will need help halfway.`, `${q} necesita 2,5 °C y 70 % de humedad. La cámara económica va a necesitar ayuda a mitad de camino.`));
    if (id === 'eko') return say(ln('eko', 'Near Mars the panels give about half the power, and my voice takes ten minutes to reach you. Plan for both.', 'Cerca de Marte los paneles dan cerca de la mitad de la potencia, y mi voz tarda diez minutos en llegarte. Planifica para las dos cosas.'));
  }
  if (room === 'ship') { const f = g.flight, sm = E.routeSample(g.route, g.day), month = Math.floor(g.day / 30);
    if (id === 'command') { if (f.pending) return openEvent(); E.advance(g); if (g.day >= 90) unlock('delay'); const l = g.log[g.log.length - 1]; return say(ln('', l.en, l.es), afterFlightStep); }
    if (id === 'hive') { unlock('diapause'); const v = f.risk >= CFG.criticalRisk ? ['COMPROMISED', 'COMPROMETIDA'] : f.risk > 35 ? ['AT RISK', 'EN RIESGO'] : ['GOOD', 'BUENA']; return say([ln('queen', `Chamber: ${f.temp.toFixed(1)} °C (target 2.5), ${Math.round(f.hum)}% humidity (target 70). Risk index ${Math.round(f.risk)}/100: ${v[0]}.`, `Cámara: ${f.temp.toFixed(1)} °C (objetivo 2,5), ${Math.round(f.hum)} % de humedad (objetivo 70). Índice de riesgo ${Math.round(f.risk)}/100: ${v[1]}.`), ln('', 'The index is a game value, not a real survival probability.', 'El índice es un valor del juego, no una probabilidad real de supervivencia.')]); }
    if (id === 'systems') return go('voyage');
    if (id === 'window') { unlock('sun'); return say(ln('', `Earth is ${sm.km} million km behind. A message takes ${E.delayMin(g)} min one way, and the Sun gives the panels ×${sm.f.toFixed(2)} of what it gave at launch.`, `La Tierra quedó ${sm.km} millones de km atrás. Un mensaje tarda ${E.delayMin(g)} min de ida, y el Sol les da a los paneles ×${sm.f.toFixed(2)} de lo que daba al despegar.`)); }
    if (id === 'pip') return say(ln('pip', month < 2 ? 'See this connector? It is the one from the old radio. Fixed by two, remember?' : L(CREW_MSG[(month * 3) % CREW_MSG.length]).replace(/^[^:]+: /, ''), month < 2 ? '¿Ves este conector? Es el de la radio vieja. Arreglado entre dos, ¿te acuerdas?' : CREW_MSG[(month * 3) % CREW_MSG.length][1].replace(/^[^:]+: /, '')));
    if (id === 'nim') return say(ln('nim', month < 2 ? 'I wrote today’s numbers down. Also the ones we don’t understand.' : `Queens get through winter alone, in the dark. ${q} is braver than all of us.`, month < 2 ? 'Anoté los números de hoy. También los que no entendemos.' : `Las reinas pasan el invierno solas, a oscuras. ${q} es más valiente que todos nosotros.`));
    if (id === 'eko') { const e = s.eko; if (e.msg === 'promise' && !e.fixed) return say([ln('eko', 'That guarantee we sent still bothers me.', 'Esa garantía que enviamos me sigue molestando.'), ln('you', '…', '…', [CH('Correct it: admit the uncertainty', 'Corregirla: reconocer la incertidumbre', () => { e.fixed = 1; mem('We said what we don’t know', 'Dijimos lo que no sabemos'); say(ln('eko', 'Sent. It will take a few minutes to arrive, and it is true. Thank you.', 'Enviado. Tardará unos minutos en llegar, y es verdad. Gracias.')); }), CH('Leave it', 'Dejarla así', () => say(ln('eko', '…All right.', '…Está bien.')))])]);
      return say(ln('eko', `Signal delay: ${E.delayMin(g)} minutes. ` + (e.msg === 'honest' || e.fixed ? 'Aurelia knows what we don’t know. That lets me sleep.' : 'I am listening.'), `Retardo de señal: ${E.delayMin(g)} minutos. ` + (e.msg === 'honest' || e.fixed ? 'Aurelia sabe lo que no sabemos. Eso me deja dormir.' : 'Estoy escuchando.'))); }
  }
  if (room === 'green') { const gr = g.green;
    if (id === 'finish') return finish();
    if (id[0] === 'g') { const i = +id[1]; if (gr.done || i < gr.step) return say(ln('', 'This step is done.', 'Este paso ya está hecho.')); if (i > gr.step) return say(ln('', `First: ${ROOMS.green.objs[gr.step].name[0]}.`, `Primero: ${ROOMS.green.objs[gr.step].name[1]}.`));
      const st = GREEN[i], pick = c => () => { E.greenChoose(g, c); unlock(st.card); s.gstep = gr.step; if (i === 0) s.awake = gr.colony >= 35; if (gr.done) { s.greenDone = true; const r = E.greenResult(g); say(ln('', r.founded ? `${q} woke up. A colony begins (index ${r.colony}/100). This greenhouse is a hypothetical future.` : `The colony is weak (index ${r.colony}/100). This greenhouse is a hypothetical future.`, r.founded ? `${q} despertó. Nace una colonia (índice ${r.colony}/100). Este invernadero es un futuro hipotético.` : `La colonia está débil (índice ${r.colony}/100). Este invernadero es un futuro hipotético.`)); } else render(); saveGame(); };
      return say([ln(CREW.find(c => c.role === st.role).id, st.text[0] + ` Reserve cells: ${gr.cells}.`, st.text[1] + ` Celdas de reserva: ${gr.cells}.`), ln('you', '…', '…', [CH(st.a[0] + ' (1 cell)', st.a[1] + ' (1 celda)', pick(true), gr.cells <= 0), CH(st.b[0], st.b[1], pick(false))])]); }
    if (id === 'pip' || id === 'nim' || id === 'eko') return say(ln(id, { pip: 'The dome is sealed. Nothing from Earth gets out: planetary protection.', nim: 'Gently. They slept for months.', eko: 'Whatever happens here, we send all of it home.' }[id], { pip: 'El domo está sellado. Nada de la Tierra sale: protección planetaria.', nim: 'Con suavidad. Durmieron meses.', eko: 'Pase lo que pase aquí, lo enviamos todo a casa.' }[id]));
  }
}
function knockCheck() { const s = S.st; if (s.nb === 2 && s.plant && !s.knock) { s.knock = 1; audio.sfx('knock'); say(ln('', 'KNOCK! KNOCK! Someone is at the door. When you look, there is only an envelope on the floor.', '¡TOC! ¡TOC! Alguien llama a la puerta. Cuando miras, solo hay un sobre en el suelo.')); } }
function exportGame() { const g = S.g, data = { game: 'BeeYond Mars', exported: new Date().toISOString(), story: S.st, mission: g, report: g && g.flight ? E.report(g) : null }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'beeyond-mars-save.json'; a.click(); }
function worldModal(m) {
  if (m === 'notebook') return `<h2>${T('Notebook', 'Cuaderno')}</h2><p><b>${T('Now', 'Ahora')}:</b> ${objective()}</p><h3>${T('Memories', 'Recuerdos')}</h3>${S.st.mem.length ? `<ul>${S.st.mem.map(x => `<li>${L(x)}</li>`).join('')}</ul>` : `<p class="small">${T('Nothing yet.', 'Todavía nada.')}</p>`}
    ${S.g && S.g.log.length ? `<h3>${T('Mission log', 'Bitácora de misión')}</h3><div class="termbox">${S.g.log.slice(-8).map(l => `<p>&gt; ${esc(L([l.en, l.es]))}</p>`).join('')}</div>` : ''}
    <p class="note">${T('Model limits: mass penalty is linear, the risk index is not a survival probability, and the greenhouse, the crewed trip and the Nobel are fiction.', 'Límites del modelo: la penalización de masa es lineal, el índice de riesgo no es una probabilidad de supervivencia, y el invernadero, el viaje con personas y el Nobel son ficción.')}</p>
    <div class="row">${btn(T('Sources', 'Fuentes'), 'm:sources', 'sm')}${btn(T('Science album', 'Álbum de ciencia'), 'm:album', 'sm')}${btn(T('Export save file', 'Exportar partida'), 'export', 'sm')}</div>`;
  if (m === 'access') return `<h2>${T('Go to…', 'Accesos')}</h2><p class="small">${T('Lum walks there around the obstacles.', 'Lum camina hasta ahí rodeando los obstáculos.')}</p><div class="row wrap">${W.objs().filter(q => q.name).map(q => btn(L(q.name), 'goto:' + q.id, 'sm')).join('')}</div>`;
  if (m === 'pause') return `<h2>${T('Pause', 'Pausa')}</h2><div class="row wrap">${btn(S.lang === 'en' ? 'Español' : 'English', 'lang', 'sm')}${btn(T('Music', 'Música') + (audio.on ? ' ♪' : ' ✕'), 'music', 'sm')}${btn(T('Full screen', 'Pantalla completa'), 'full', 'sm')}${btn(T('Sources', 'Fuentes'), 'm:sources', 'sm')}</div>
    <p>${T('Time limit for incidents', 'Tiempo límite para incidentes')}</p><div class="row">${[0, 60, 120].map(n => btn(n ? n + ' s' : T('No limit', 'Sin límite'), 'timer:' + n, 'sm ' + (S.timerSec === n ? 'primary' : ''))).join('')}</div>
    <div class="row">${btn(T('Save and go to title', 'Guardar e ir al título'), 'home', 'sm')}</div>`;
  return null;
}

// ------------------------------------------------------------------ actions
function act(a) {
  const [k, v] = a.split(':'), g = S.g; audio.start();
  if (k === 'lang') { S.lang = S.lang === 'en' ? 'es' : 'en'; store.set('bym-lang', S.lang); return render(); }
  if (k === 'music') { audio.toggle(); return render(); }
  if (k === 'm') { S.modal = v || null; return render(); }
  if (k === 'players') { readForm(); S.players = +v; return render(); }
  if (k === 'home') { saveGame(); S.g = null; S.dlg = null; return go('title'); }
  if (k === 'timer') { S.timerSec = +v; store.set('bym-timer', S.timerSec); return render(); }
  if (k === 'full') { const d = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen().catch(() => {}); return; }
  if (k === 'export') return exportGame();
  if (k === 'world') return toWorld();
  if (k === 'dlg') return dlgNext();
  if (k === 'pick') { const d = S.dlg, c = d && d.lines[d.i].ch && d.lines[d.i].ch[+v]; if (!c) return; S.dlg = null; audio.sfx('click'); c.f(); if (!S.dlg) render(); return saveGame(); }
  if (k === 'goto') { S.modal = null; render(); W.goTo(v); return; }
  if (k === 'keep-letter') { S.st.letter = 1; S.st.chapter = 'town'; mem('Someone believed in the question', 'Alguien creyó en la pregunta'); toWorld(); return say([ln('you', 'Pip. Nim. Eko. I can’t build this alone.', 'Pip. Nim. Eko. No puedo construir esto sin ellos.'), ln('', 'The door is open now.', 'Ahora la puerta está abierta.')]); }
  if (k === 'continue') { const sv = store.get('bym-save', null); if (!sv) return; S.g = sv.g; S.st = Object.assign(newStory(), sv.st); S.players = sv.players || 1; W.enter(sv.room || 'room', sv.x, sv.y); return go(sv.screen === 'report' && S.g.flight ? 'report' : 'world'); }
  if (k === 'start') { readForm(); audio.sfx('click'); S.st = newStory(); S.g = E.fresh(S.players, 1000 + Math.floor(Math.random() * 8000), S.name || 'Lum', S.queen || 'Miel'); toWorld('room'); return say([ln('', 'Three years. Forty-one proposals. Forty-one rejections. The room has been half packed for weeks.', 'Tres años. Cuarenta y una propuestas. Cuarenta y un rechazos. La habitación lleva semanas a medio embalar.'), ln('you', 'One last look before I close the box.', 'Una última mirada antes de cerrar la caja.')]); }
  if (k === 'cut-next') return cutNext();
  if (k === 'cut-skip') { const d = S.cut.done; S.cut = null; return d(); }
  if (k === 'friends') return go('friends');
  if (k === 'meet') { S.met.push(v); audio.sfx('coin'); return render(); }
  if (k === 'to-lab') { S.g = E.fresh(S.players, 1000 + Math.floor(Math.random() * 8000), S.name || 'Alex', S.queen || 'Miel'); S.tab = 1; return cutscene(labOpen(), () => go('lab')); }
  if (k === 'tab') { S.tab = +v; audio.sfx('click'); return render(); }
  if (k === 'item') { const e = E.toggle(g, v); if (e) { toast(L(e)); audio.sfx('error'); } else { audio.sfx('click'); unlock('dv'); } return render(); }
  if (k === 'launcher') { if (!E.setLauncher(g, v)) { toast(T('Not enough credits for this rocket.', 'No alcanzan los créditos para este cohete.')); audio.sfx('error'); } else audio.sfx('click'); return render(); }
  if (k === 'route') { E.setRoute(g, v); unlock('route'); audio.sfx('click'); return render(); }
  if (k === 'grant') { if (E.claim(g, +v)) { audio.sfx('coin'); unlock('cml'); toast(T(`Aurelia releases ${CFG.grants[+v]} credits!`, `¡Aurelia libera ${CFG.grants[+v]} créditos!`)); } else { audio.sfx('error'); toast(+v === 0 ? T('First fit a chamber within mass and power.', 'Primero instala una cámara que calce en masa y energía.') : T('Pass CML 2 and examine both NASA routes (Mission Lead tab).', 'Aprueba el CML 2 y examina ambas rutas de la NASA (pestaña Dirección).')); } return render(); }
  if (k === 'launch') { if (!allIn()) { audio.sfx('error'); return say(ln('', 'The rocket waits. You are not going without Pip, Nim and Eko.', 'El cohete espera. No vas a ir sin Pip, Nim y Eko.')); } if (E.milestone(g) < 4) { audio.sfx('error'); const e = E.errors(g); return say(ln('', e.length ? e[0][0] : 'Pass both design reviews at the review table first.', e.length ? e[0][1] : 'Primero aprueba las dos revisiones en la mesa de revisión.')); } E.launch(g); unlock('sun'); S.st.chapter = 'ship'; return cutscene(liftoff(), () => toWorld('ship')); }
  if (k === 'advance') { E.advance(g); audio.sfx('click'); if (g.day >= 90) unlock('delay'); return afterFlightStep(); }
  if (k === 'event') return openEvent();
  if (k === 'resolve') { stopTimer(); if (!E.resolve(g, v)) return; audio.sfx('click'); return afterFlightStep(); }
  if (k === 'green') { if (E.greenChoose(g, v === '1')) { audio.sfx('click'); unlock(GREEN[g.green.step - 1].card); } return render(); }
  if (k === 'ending') return finish();
  if (k === 'redesign') { E.redesign(g); S.tab = 1; Object.assign(S.st, { chapter: 'lab', awake: false, gstep: 0, greenDone: false }); return toWorld('lab'); }
}
function readForm() { const n = $('#in-name'), q = $('#in-queen'), r = null; if (n) { S.name = n.value.trim(); store.set('bym-name', S.name); } if (q) { S.queen = q.value.trim(); store.set('bym-queen', S.queen); } if (r) { S.relaxed = r.checked; store.set('bym-relaxed', S.relaxed); } }
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (t && t.dataset.a && !t.disabled) { e.stopPropagation(); act(t.dataset.a); } });
document.addEventListener('input', e => { if (e.target.id === 'vol') audio.setVol(+e.target.value); });
const KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
function useKey() { if (S.dlg) return dlgNext(); if (W.near) interact(W.near.id); }
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (S.screen === 'cut' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); if (!S.cut.frames[S.cut.i].cta || e.key === 'Enter') cutNext(); return; }
  if (e.key === 'Escape') { if (S.modal && S.modal !== 'event') { S.modal = null; render(); } else if (S.dlg) dlgNext(); else if (S.screen === 'world' && !S.modal) { S.modal = 'pause'; render(); } return; }
  if (S.screen !== 'world' || S.modal) return;
  if (KEYS[e.key]) { e.preventDefault(); if (!S.dlg) W.keys.add(KEYS[e.key]); return; }
  if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) useKey(); }
});
document.addEventListener('keyup', e => { if (KEYS[e.key]) W.keys.delete(KEYS[e.key]); });
document.addEventListener('pointerdown', e => { const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); if (b.dataset.k === 'act') useKey(); else if (!S.dlg) W.keys.add(b.dataset.k); });
for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) document.addEventListener(ev, e => { const b = e.target.closest && e.target.closest('[data-k]'); if (b) W.keys.delete(b.dataset.k); else if (ev === 'pointerup') ['up', 'down', 'left', 'right'].forEach(k => W.keys.delete(k)); }, true);
window.addEventListener('blur', () => W.keys.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stop(); else if (audio.want) audio.play(audio.want, true); });
window.__S = S; window.__W = W; // for automated play tests
render();
