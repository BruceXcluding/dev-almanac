// Built from hooks/art.ts by scripts/build-dsh.mjs. Do not edit.
// The drawn parts: an SVG banner (a season scene with a tear-off calendar
// on the right) and an SVG 签筒 whose sticks jostle and one pops out,
// for the surfaces that draw Svg; and their frame-by-frame text forms for
// the terminal. Every motion is CSS, plays once and honours
// prefers-reduced-motion; a new `run` in the markup replays it.
import { rng } from './seed.js';
const SEASON_TERMS = {
    spring: '立春雨水惊蛰春分清明谷雨',
    summer: '立夏小满芒种夏至小暑大暑',
    autumn: '立秋处暑白露秋分寒露霜降',
    winter: '立冬小雪大雪冬至小寒大寒',
};
/** The season of the 节气 in force. */
export const seasonOfTerm = (term) => Object.keys(SEASON_TERMS).find(s => SEASON_TERMS[s].includes(term)) ?? 'autumn';
const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONT = `font-family="-apple-system, 'PingFang SC', 'Noto Sans CJK SC', 'Segoe UI', sans-serif"`;
// Flat grounds, one hill colour, and text that keeps 4.5:1 against the ground.
const SCENE = {
    spring: { ground: '#fbeef2', hill: '#d6e9c2', ink: '#4a2a36', soft: '#7d4f5f' },
    summer: { ground: '#eaf6f3', hill: '#bfe3d8', ink: '#173f3a', soft: '#2f6b62' },
    autumn: { ground: '#faf0e2', hill: '#efd6b1', ink: '#4a2f14', soft: '#7a5228' },
    winter: { ground: '#eef4fa', hill: '#ffffff', ink: '#1d3047', soft: '#475f7a' },
};
const W = 640;
const H = 128;
/** The hill line: where things land. */
const groundY = (x) => H - 30 + 5 * Math.sin(x / 70) + 3 * Math.sin(x / 23 + 1);
function groundPath() {
    const pts = [];
    for (let x = 0; x <= W; x += 16)
        pts.push(`${x} ${groundY(x).toFixed(1)}`);
    return `M${pts.join(' L')} V ${H} H 0 Z`;
}
// Leaves: an oval leaf with a vein, and a small maple.
const LEAF_OVAL = 'M0 -8 C5 -5.5 5.5 2.5 0 8 C-5.5 2.5 -5 -5.5 0 -8 Z';
const LEAF_MAPLE = 'M0 -8 L1.6 -3.6 L5.8 -5 L4 -1 L7.4 1 L3 2 L3.6 5.6 L0 3.6 L-3.6 5.6 L-3 2 L-7.4 1 L-4 -1 L-5.8 -5 L-1.6 -3.6 Z';
const AUTUMN = ['#d9733a', '#c8553d', '#d4a32a', '#a8582e'];
const PETALS = ['#f2a7bd', '#f6c4d2', '#e98fab'];
/**
 * The season's pieces: each falls (or drifts) once, swaying, and rests where
 * it lands, so the still scene after the entrance is the same pieces at rest.
 * Under reduced motion they are drawn at rest from the start.
 */
function pieces(season, seed) {
    const next = rng(`scene:${seed}`);
    const out = [];
    const n = season === 'summer' ? 6 : season === 'winter' ? 22 : 14;
    for (let i = 0; i < n; i++) {
        // Keep clear of the words on the left and the calendar on the right.
        const x = 250 + Math.round(next() * 245);
        const startX = x - 30 + Math.round(next() * 40);
        const land = groundY(x) - 2 + Math.round(next() * 8);
        const delay = (next() * 1.2).toFixed(2);
        const dur = (2.8 + next() * 0.8).toFixed(2);
        const size = (0.75 + next() * 0.5).toFixed(2);
        const turn = Math.round(next() * 300 - 150);
        const fall = (body) => `<g transform="translate(${x} ${land.toFixed(1)})"><g class="piece" style="--x0:${startX - x}px;--y0:${(-land - 14).toFixed(0)}px;--r0:${turn}deg;animation-delay:${delay}s;animation-duration:${dur}s"><g class="sway" style="animation-delay:${delay}s">${body}</g></g></g>`;
        if (season === 'autumn') {
            const shape = i % 3 === 0 ? LEAF_MAPLE : LEAF_OVAL;
            const vein = shape === LEAF_OVAL ? '<path d="M0 -7 L0 8" stroke="#6e3412" stroke-width=".7" opacity=".7"/>' : '';
            out.push(fall(`<g transform="rotate(${Math.round(next() * 180 - 90)}) scale(${size})"><path d="${shape}" fill="${AUTUMN[i % AUTUMN.length]}"/>${vein}</g>`));
        }
        else if (season === 'winter') {
            const r = (1.4 + next() * 2).toFixed(1);
            out.push(fall(`<circle r="${r}" fill="#ffffff" stroke="#a9c3dc" stroke-width=".6"/>`));
        }
        else if (season === 'spring') {
            if (i % 4 === 0) {
                const petals = [0, 72, 144, 216, 288]
                    .map(a => `<ellipse cx="0" cy="-4.2" rx="2.6" ry="4.2" fill="${PETALS[i % PETALS.length]}" transform="rotate(${a})"/>`)
                    .join('');
                out.push(`<g transform="translate(${x} ${(land - 3).toFixed(1)})"><g class="bloom" style="animation-delay:${delay}s">${petals}<circle r="1.9" fill="#f2c94c"/></g></g>`);
            }
            else {
                out.push(fall(`<ellipse rx="${(3 * Number(size)).toFixed(1)}" ry="${(1.9 * Number(size)).toFixed(1)}" fill="${PETALS[i % PETALS.length]}" transform="rotate(${turn})"/>`));
            }
        }
        else {
            // Summer: a breeze drifts through once and is gone; the grass stays.
            const y = 26 + Math.round(next() * 50);
            const len = 70 + Math.round(next() * 70);
            out.push(`<g class="breeze" style="animation-delay:${delay}s;animation-duration:${dur}s"><path d="M${x - 60} ${y} q ${len / 4} -7 ${len / 2} 0 t ${len / 2} 0" fill="none" stroke="#4aa8a0" stroke-width="1.8" stroke-linecap="round"/></g>`);
            out.push(`<path d="M${x} ${groundY(x).toFixed(1)} q -2 -9 1 -14 M${x + 4} ${groundY(x + 4).toFixed(1)} q 2 -7 -1 -11" stroke="#6aa58a" stroke-width="1.4" fill="none" stroke-linecap="round"/>`);
        }
    }
    return out.join('');
}
/** A tear-off calendar: today's sheet on a short stack, bound by two rings. */
function page(x, y, input) {
    const w = 96;
    const h = 108;
    const band = 24;
    const dayColor = input.isRedDay ? '#b83227' : '#1f1f1f';
    return `<g>
    <rect x="${x + 2}" y="${y + 5}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".08"/>
    <rect x="${x + 2}" y="${y + 4}" width="${w - 1}" height="${h}" rx="6" fill="#e9e2d3"/>
    <rect x="${x + 1}" y="${y + 2}" width="${w}" height="${h}" rx="6" fill="#f3eee3"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fffdf8" stroke="#e2dccd"/>
    <path d="M${x} ${y + 6} a6 6 0 0 1 6 -6 h${w - 12} a6 6 0 0 1 6 6 v${band - 6} h-${w} Z" fill="${esc(input.accent)}"/>
    <circle cx="${x + 26}" cy="${y + 7}" r="2.6" fill="#000" opacity=".28"/>
    <circle cx="${x + w - 26}" cy="${y + 7}" r="2.6" fill="#000" opacity=".28"/>
    <rect x="${x + 24}" y="${y - 6}" width="4" height="13" rx="2" fill="#3f3f3f"/>
    <rect x="${x + w - 28}" y="${y - 6}" width="4" height="13" rx="2" fill="#3f3f3f"/>
    <text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" font-size="12" font-weight="600" letter-spacing="1" fill="#ffffff" ${FONT}>${esc(input.month)}</text>
    <text x="${x + w / 2}" y="${y + 68}" text-anchor="middle" font-size="44" font-weight="700" fill="${dayColor}" style="font-variant-numeric: tabular-nums" ${FONT}>${String(input.day).padStart(2, '0')}</text>
    <line x1="${x + 14}" y1="${y + 80}" x2="${x + w - 14}" y2="${y + 80}" stroke="#ece5d6"/>
    <text x="${x + w / 2}" y="${y + 93}" text-anchor="middle" font-size="12" font-weight="500" fill="#3d3d3d" ${FONT}>${esc(input.weekday)}</text>
    <text x="${x + w / 2}" y="${y + 104}" text-anchor="middle" font-size="10" fill="#5c5c5c" ${FONT}>${esc(input.lunarDay)}</text>
  </g>`;
}
/** The banner: the season falling through, today's calendar page on the right. */
export function bannerSvg(input) {
    const cx = W - 122;
    const cy = 12;
    const sc = SCENE[input.season];
    const uid = `${input.season}-${input.seed}-${input.run}`;
    const ground = `<path d="${groundPath()}" fill="${sc.hill}"/>`;
    const card = `<defs><clipPath id="card-${uid}"><rect width="${W}" height="${H}" rx="12"/></clipPath></defs>
  <g clip-path="url(#card-${uid})"><rect width="${W}" height="${H}" fill="${sc.ground}"/>${ground}</g>
  <text x="22" y="30" font-size="12" letter-spacing="1" fill="${sc.soft}" ${FONT}>${esc(input.tag)}</text>
  <text x="20" y="68" font-size="32" font-weight="700" fill="${sc.ink}" ${FONT}>${esc(input.big)}</text>
  <text x="22" y="90" font-size="12" fill="${sc.soft}" ${FONT}>${esc(input.small)}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-run="${input.run}">
  <style>
    .piece { animation-name: drop; animation-timing-function: cubic-bezier(.45,.05,.7,.95); animation-iteration-count: 1; animation-fill-mode: both; }
    .sway { animation: sway-leaf .8s ease-in-out 4 alternate both; }
    .bloom { transform: scale(0); animation: bloom 1.1s cubic-bezier(.3,1.6,.5,1) forwards; }
    .breeze { opacity: 0; animation-name: breeze; animation-timing-function: ease-in-out; animation-iteration-count: 1; animation-fill-mode: both; }
    .cord { transform-box: fill-box; transform-origin: 50% 0; animation: swing 2.4s ease-out .2s both, sway 2.4s ease-in-out 2.6s 1; }
    @keyframes swing { 0% { transform: rotate(18deg); } 25% { transform: rotate(-12deg); } 50% { transform: rotate(7deg); } 75% { transform: rotate(-3deg); } 100% { transform: rotate(0deg); } }
    @keyframes sway { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(2.5deg); } 70% { transform: rotate(-2.5deg); } }
    @keyframes drop { from { transform: translate(var(--x0), var(--y0)) rotate(var(--r0)); } }
    @keyframes sway-leaf { from { transform: translateX(-9px) rotate(-28deg); } to { transform: translateX(9px) rotate(28deg); } }
    @keyframes bloom { to { transform: scale(1); } }
    @keyframes breeze { 0% { transform: translateX(-60px); opacity: 0; } 30% { opacity: .8; } 100% { transform: translateX(170px); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .cord, .piece, .sway { animation: none; } .breeze { display: none; } .bloom { transform: scale(1); animation: none; } }
  </style>
  ${card}
  <g clip-path="url(#card-${uid})">${pieces(input.season, input.seed)}</g>
  <g class="cal">
    ${page(cx, cy, input)}
    <g class="cord">
      <line x1="${cx + 106}" y1="${cy + 8}" x2="${cx + 106}" y2="${cy + 70}" stroke="#9c7b4a" stroke-width="1.5"/>
      <circle cx="${cx + 106}" cy="${cy + 76}" r="5" fill="#b83227"/>
      <path d="M${cx + 103} ${cy + 81} l3 9 l3 -9" fill="#b83227"/>
    </g>
  </g>
</svg>`;
}
/**
 * A bamboo 签筒 holding a fan of slips, in flat colour: a shaded left side,
 * a lit stripe, two nodes and a lacquer rim. Still, it invites one wobble
 * and its slips settle; shaken, it rocks, the slips rattle and one slides
 * out with its number. Every motion ends within a few seconds.
 */
export function tubeSvg(input) {
    const sticks = Array.from({ length: 11 }, (_, i) => {
        const x = 48 + i * 4.4;
        const top = 26 + ((i * 17) % 14);
        const tilt = (i - 5) * 2;
        const delay = ((i * 0.13) % 0.6).toFixed(2);
        return `<g class="stick" style="animation-delay:${delay}s"><g transform="rotate(${tilt} ${x.toFixed(1)} 122)">
      <rect x="${x.toFixed(1)}" y="${top}" width="3.4" height="${122 - top}" rx="1.7" fill="#ecd9ab"/>
      <rect x="${(x + 2.4).toFixed(1)}" y="${top + 2}" width="1" height="${120 - top}" fill="#cdb27a"/>
    </g></g>`;
    }).join('');
    const chosen = input.isShaking && input.number !== undefined
        ? `<g class="pop"><rect x="65.5" y="36" width="9" height="88" rx="2.5" fill="#f3e4bd" stroke="#b9975d" stroke-width=".8"/>
         <rect x="67" y="44" width="6" height="30" rx="1" fill="#b83227"/>
         <text x="70" y="59" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="700" fill="#fbe9c6" ${FONT} transform="rotate(90 70 59)">${input.number}</text></g>`
        : '';
    const motion = input.isShaking
        ? { tube: 'shake .16s ease-in-out 9', stick: 'rattle .16s ease-in-out 9 alternate' }
        : { tube: 'invite 2.6s ease-in-out .4s 1', stick: 'settle 2.6s ease-in-out 1' };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 172" width="140" height="172" data-run="${input.run}">
  <defs><clipPath id="mouth-${input.run}"><rect x="0" y="0" width="140" height="150"/></clipPath></defs>
  <style>
    .tube { transform-box: view-box; transform-origin: 70px 162px; animation: ${motion.tube}; }
    .stick { animation: ${motion.stick}; }
    .pop { animation: pop .9s cubic-bezier(.25,1.3,.5,1) 1.3s both; transform-box: view-box; transform-origin: 70px 120px; }
    @keyframes shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-12deg) translateX(-2px); } 75% { transform: rotate(12deg) translateX(2px); } }
    @keyframes invite { 0%, 60%, 100% { transform: rotate(0deg); } 70% { transform: rotate(-3deg); } 80% { transform: rotate(3deg); } 90% { transform: rotate(-1.2deg); } }
    @keyframes settle { 0%, 100% { transform: translateY(0); } 35% { transform: translateY(-2.5px); } 70% { transform: translateY(.6px); } }
    @keyframes rattle { from { transform: translateY(0); } to { transform: translateY(-6px); } }
    @keyframes pop { 0% { transform: translateY(48px); opacity: 0; } 15% { opacity: 1; } 70% { transform: translateY(-34px) rotate(4deg); } 100% { transform: translateY(-26px) rotate(8deg); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .tube, .stick, .pop { animation: none; } .pop { transform: translateY(-26px) rotate(8deg); } }
  </style>
  <ellipse cx="70" cy="164" rx="36" ry="4.5" fill="#000" opacity=".12"/>
  <g class="tube">
    <ellipse cx="70" cy="82" rx="31" ry="7" fill="#3a2210"/>
    <g clip-path="url(#mouth-${input.run})">${sticks}${chosen}</g>
    <path d="M39 82 L42 154 Q70 165 98 154 L101 82 A31 7 0 0 1 39 82 Z" fill="#c98b4a"/>
    <path d="M39 82 L42 154 Q48 157.5 55 159.5 L53 88.5 A31 7 0 0 1 39 82 Z" fill="#a8692f"/>
    <path d="M86 88 L85.4 160 Q88 159.4 90 158.6 L91 87.2 Z" fill="#dba366"/>
    <path d="M40.1 104 Q70 112 99.9 104 L99.8 107.4 Q70 115.4 40.2 107.4 Z" fill="#8a5524"/>
    <path d="M41.5 136 Q70 144 98.5 136 L98.3 139.4 Q70 147.4 41.7 139.4 Z" fill="#8a5524"/>
    <path d="M39 82 A31 7 0 0 0 101 82" fill="none" stroke="#3b2414" stroke-width="3"/>
    <rect x="60" y="113" width="20" height="21" rx="2" fill="#b83227"/>
    <rect x="62" y="115" width="16" height="17" rx="1.5" fill="none" stroke="#f6d98b" stroke-width=".6" opacity=".8"/>
    <text x="70" y="128.5" text-anchor="middle" font-size="13" font-weight="700" fill="#f6d98b" ${FONT}>${esc(input.label)}</text>
  </g>
</svg>`;
}
// ---------------------------------------------------------------------------
// The terminal's frames
const GLYPH = {
    spring: ['🌸', '🌱', '🌸', '🌷'],
    summer: ['〰', '～', '〰', '🍃'],
    autumn: ['🍂', '🍁', '🍂', '🍃'],
    winter: ['❄', '·', '❅', '·'],
};
/**
 * One line of the season drifting across, `frame` 1..n; frame 0 is the
 * still garnish shown once the entrance is over. `cells` is the room.
 */
export function particleLine(season, seed, frame, cells) {
    const glyphs = GLYPH[season];
    const slots = Math.max(8, Math.floor(cells / 2));
    const line = Array.from({ length: slots }, () => ' ');
    const next = rng(`line:${seed}`);
    const count = frame === 0 ? 3 : 6;
    for (let i = 0; i < count; i++) {
        const base = Math.floor(next() * slots);
        // Leaves and snow drift right, summer's breeze faster.
        const drift = frame === 0 ? 0 : frame * (season === 'summer' ? 3 : 1);
        const at = (base + drift) % slots;
        line[at] = glyphs[i % glyphs.length] ?? '·';
    }
    // Emoji take two cells; the rest one.
    return line.map(c => (c === ' ' ? '  ' : c.length > 1 || c > '⿿' ? c : `${c} `)).join('').trimEnd();
}
/** The tube in the terminal, nudged left and right while it shakes. */
export function terminalTube(frame, label) {
    const offsets = [2, 0, 4, 1, 3, 0, 2];
    const pad = ' '.repeat(frame === 0 ? 2 : offsets[frame % offsets.length] ?? 2);
    // The sticks jump about while it shakes; one rises out at the end.
    const sticks = frame === 0 ? '╽┃╽┃╽┃' : frame % 2 === 0 ? '┃╿┃╽╿┃' : '╿┃╽┃┃╿';
    const out = frame >= 8 ? `${pad}    ┃${' '.repeat(3)}` : '';
    return [out, `${pad}  ${sticks}`, `${pad} ╭──────╮`, `${pad} │  ${label}  │`, `${pad} ╰──────╯`].filter(l => l !== '');
}
export const INTRO_FRAMES = 12;
export const INTRO_MS = 120;
