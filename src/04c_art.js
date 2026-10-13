// =====================================================================================
// SECTION 4c — RENDERING: art — enemy/player illustration, baked biome floors, backdrop, ambience
// Shared visual language: dark armoured body → lit inner plate → bright rim → glowing eye (facing).
// =====================================================================================
Object.assign(SH, {
  hound: mkPath([1.25, 0, .3, .42, -.5, .5, -1, .2, -.8, 0, -1, -.2, -.5, -.5, .3, -.42]), sentinel: mkPath(ngon(4, 1)), hurler: mkPath(ngon(7, 1)),
  fencer: mkPath([.9, -.6, .9, .6, -.8, .85, -.8, -.85]), pylon: mkPath(ngon(3, 1, -PI / 2)), spitter: circ(1),
  siphon: mkPath([1, 0, .3, .8, -.6, .9, -.2, .3, -.9, 0, -.2, -.3, -.6, -.9, .3, -.8]), geode: mkPath([1.1, 0, .6, .75, -.2, 1, -.9, .5, -1, -.3, -.4, -.95, .5, -.8]),
  riftcaller: mkPath([.9, 0, .2, .7, -.9, .9, -.6, 0, -.9, -.9, .2, -.7]), siege: mkPath(ngon(6, 1)), stalker: mkPath(star(7, 1.15, .6)),
  ship: mkPath([1.4, 0, .4, .35, -.2, .95, -.7, .85, -.45, .3, -.6, 0, -.45, -.3, -.7, -.85, -.2, -.95, .4, -.35]),
  shipInner: mkPath([1.05, 0, .3, .22, -.35, .2, -.45, 0, -.35, -.2, .3, -.22]),
});
Object.assign(ROT_FREE, { spitter: 1, pylon: 1 });
const _mid = new Map(); const midOf = c => { let d = _mid.get(c); if (!d) { d = mixHex(darkOf(c), c, .38); _mid.set(c, d); } return d; };
// small helpers in local (unit) space
const L = (c, x0, y0, x1, y1) => { c.moveTo(x0, y0); c.lineTo(x1, y1); };
const dot = (c, x, y, r) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); };
function legs(c, n, len, spread, t, speed, back = 0) { c.beginPath(); for (let i = 0; i < n; i++) { const k = (i / (n - 1 || 1) - .5) * spread + back, w = sin(t * speed + i * 2.1) * .18;
  for (const s of [-1, 1]) { const bx = k, by = s * .35, ex = k - .25 + w * s, ey = s * (.35 + len); c.moveTo(bx, by); c.lineTo((bx + ex) / 2 + .1, (by + ey) / 2 + s * .15); c.lineTo(ex, ey); } } c.stroke(); }
// per-type art: eye [x,y,r] (null = none), under (drawn below body), d (details over body). All in unit space facing +x.
const ART = {
  mite: { eye: [.42, 0, .16], under: (c, e, t) => legs(c, 3, .55, .9, t, 26) },
  hound: { eye: [.7, 0, .13], under: (c, e, t) => legs(c, 2, .6, 1.1, t, 30, -.1), d: (c, e, t) => { c.beginPath(); L(c, .55, 0, -.75, 0); c.stroke(); } },
  gunner: { eye: [.5, 0, .14], d: (c, e, t, col) => { c.fillStyle = col; c.fillRect(.45, -.14, 1.05, .28); c.fillStyle = '#ffffff'; c.fillRect(1.3, -.08, .2, .16); c.beginPath(); c.arc(-.1, 0, .55, -.9, .9); c.stroke(); } },
  ram: { eye: [.45, 0, .15], d: (c, e, t, col) => { c.beginPath(); c.moveTo(.6, .55); c.quadraticCurveTo(1.25, .7, 1.15, .2); c.moveTo(.6, -.55); c.quadraticCurveTo(1.25, -.7, 1.15, -.2); c.stroke(); L(c, -.3, -.5, -.3, .5); c.stroke(); } },
  bulwark: { eye: [.45, 0, .14], d: (c, e) => { c.beginPath(); L(c, -.5, -.6, -.5, .6); L(c, -.5, 0, .5, 0); c.stroke(); } },
  lancer: { eye: [.25, 0, .12], eyeCol: '#ff2a4a', d: (c, e, t, col) => { c.fillStyle = col; c.fillRect(.3, -.08, 1.9, .16); c.beginPath(); c.arc(.2, 0, .25, 0, TAU); c.stroke(); } },
  lobber: { eye: null, d: (c, e, t, col) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * .5; dot(c, cos(a) * .62, sin(a) * .62, .08); } c.fillStyle = col; c.fill(); } },
  brood: { eye: null, d: (c, e, t, col) => { c.fillStyle = col; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(cos(t + i * 2.1) * .45, sin(t + i * 2.1) * .45, .22 + .05 * sin(t * 4 + i), 0, TAU); c.fill(); } c.globalAlpha *= .5; c.beginPath(); c.arc(0, 0, .85 + .05 * sin(t * 3), 0, TAU); c.stroke(); c.globalAlpha *= 2; } },
  phantom: { eye: [.35, 0, .11], eyes2: true, under: (c, e, t, col) => { c.beginPath(); for (let i = 0; i < 3; i++) { const y = (i - 1) * .45; c.moveTo(-.4, y); c.quadraticCurveTo(-1, y + sin(t * 8 + i) * .3, -1.5, y + sin(t * 6 + i) * .2); } c.stroke(); } },
  tick: { eye: null, d: (c, e, t, col) => { c.fillStyle = (e.atkPhase === 1 ? (t * 16 % 1 < .5) : (t * 3 % 1 < .3)) ? '#ffffff' : col; c.beginPath(); c.arc(0, 0, .42, 0, TAU); c.fill();
    c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; L(c, cos(a) * 1, sin(a) * 1, cos(a) * 1.35, sin(a) * 1.35); } c.stroke(); } },
  mender: { eye: null, d: (c, e, t, col) => { c.fillStyle = col; c.globalAlpha *= .5 + .4 * sin(t * 4); c.fillRect(-.18, -.6, .36, 1.2); c.fillRect(-.6, -.18, 1.2, .36); c.globalAlpha = 1; } },
  warden: { eye: [.45, 0, .14], d: (c, e, t, col) => { c.beginPath(); L(c, -.6, 0, -1.3, 0); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(-1.3, 0); c.lineTo(-1.3 + sin(t * 5) * .1, -.6); c.lineTo(-.9, -.4); c.closePath(); c.fill(); } },
  delver: { eye: [-.1, 0, .14], d: (c, e, t) => { c.beginPath(); for (let i = 0; i < 4; i++) { const k = ((t * 3 + i * .25) % 1); L(c, .3 + k * .8, -.6 + k * .55, .3 + k * .8, .6 - k * .55); } c.stroke(); } },
  spire: { eye: [0, 0, .2], d: (c, e, t) => { c.beginPath(); c.arc(0, 0, .45, 0, TAU); c.stroke(); } },
  mimic: { eye: null, d: (c, e, t, col) => { if (e.a) { c.fillStyle = '#ffffff'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * .28 - .12, -.1); c.lineTo(i * .28, .25 + .1 * sin(t * 20 + i)); c.lineTo(i * .28 + .12, -.1); c.fill(); } }
    else { c.fillStyle = '#ffe23a'; c.fillRect(-.15, -.2, .3, .4); } c.beginPath(); L(c, -1, -.15, 1, -.15); c.stroke(); } },
  gel: { eye: null, d: (c, e, t, col) => { c.fillStyle = col; c.beginPath(); c.arc(sin(t * 1.7) * .25, cos(t * 1.3) * .2, .3, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(-.35, -.4, .16, 0, TAU); c.fill(); } },
  wisp: { eye: [0, 0, .22], d: (c, e, t) => { c.beginPath(); c.arc(0, 0, 1.5, t * 3, t * 3 + 4); c.stroke(); } },
  jugg: { eye: [.62, 0, .12], slit: true, d: (c, e) => { c.beginPath(); c.rect(-.55, -.55, 1.1, 1.1); L(c, -.55, 0, .55, 0); c.stroke(); c.beginPath(); L(c, -.2, -1, -.2, -1.3); L(c, -.2, 1, -.2, 1.3); c.stroke(); } },
  sentinel: { eye: [0, 0, .32], d: (c, e, t) => { c.beginPath(); for (let i = 0; i < 3; i++) { const a = t * 2 + i * TAU / 3; c.moveTo(cos(a) * 1.35, sin(a) * 1.35); c.arc(0, 0, 1.35, a, a + 1.2); } c.stroke(); } },
  hurler: { eye: [.5, 0, .14], d: (c, e, t, col) => { c.fillStyle = '#c8f2ff'; c.globalAlpha *= .8; c.beginPath(); c.arc(-.45, 0, .42, 0, TAU); c.fill(); c.globalAlpha = 1; c.beginPath(); L(c, -.6, -.2, -.3, .2); L(c, -.6, .15, -.35, -.2); c.stroke(); } },
  fencer: { eye: [.35, 0, .12], d: (c, e, t, col) => { c.beginPath(); L(c, .7, -.45, 1.35, -.45); L(c, .7, .45, 1.35, .45); c.stroke(); if ((t * 9 % 1) < .5) { c.fillStyle = '#ffffff'; c.beginPath(); dot(c, 1.35, -.45, .1); dot(c, 1.35, .45, .1); c.fill(); } } },
  pylon: { eye: [0, 0, .25], d: (c, e, t) => { c.beginPath(); const a = t * 8; c.arc(0, 0, 1.4, a, a + .6); c.stroke(); } },
  spitter: { eye: null, d: (c, e, t, col) => { c.fillStyle = col; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; c.beginPath(); c.arc(cos(a) * .55, sin(a) * .55, .2 + .06 * sin(t * 5 + i), 0, TAU); c.fill(); } c.beginPath(); c.arc(0, 0, .25, 0, TAU); c.fillStyle = '#ffffff'; c.fill(); } },
  siphon: { eye: [.45, 0, .13], under: (c, e, t) => { c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(-.5, i * .4); c.quadraticCurveTo(-1.1, i * .4 + sin(t * 7 + i) * .4, -1.6, i * .5); } c.stroke(); } },
  geode: { eye: [.3, 0, .14], d: (c, e, t, col) => { c.beginPath(); for (const [x, y] of [[1.1, 0], [.6, .75], [-.2, 1], [-.9, .5], [-1, -.3], [-.4, -.95], [.5, -.8]]) L(c, 0, 0, x * .9, y * .9); c.stroke();
    if (e.atkPhase === 1) { c.fillStyle = '#ffffff'; c.globalAlpha *= .6; c.fill(SH.geode); c.globalAlpha = 1; } } },
  riftcaller: { eye: [.25, 0, .2], eyeCol: '#000000', d: (c, e, t, col) => { c.beginPath(); for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * PI / 2; dot(c, cos(a) * 1.4, sin(a) * 1.4, .1); } c.fillStyle = col; c.fill(); } },
  siege: { eye: [.55, 0, .14], slit: true, under: (c, e, t) => { c.beginPath(); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + PI / 4, w = sin(t * 4 + i * 1.6) * .12; L(c, cos(a) * .7, sin(a) * .7, cos(a) * (1.45 + w), sin(a) * (1.45 + w)); } c.stroke(); },
    d: (c, e, t, col) => { c.fillStyle = col; c.fillRect(.1, -.18, 1.2, .36); c.beginPath(); c.arc(0, 0, .45, 0, TAU); c.stroke(); } },
  stalker: { eye: [.35, .18, .12], eyes2: true, eyeCol: '#ff0a3c' },
};
ART._ = { eye: [.5, 0, .14] };
function drawEnemy(ctx, e, alpha) {
  const x = lerpX(e, alpha), y = lerpY(e, alpha); if (!inView(x, y, e.r * 3 + 20)) return;
  const sh = SH[e.type] || SH.circ, t = G.rt + e.id * .37, art = ART[e.type] || ART._;
  if (e.spawnT > 0) { const f = 1 - e.spawnT / T.director.spawnDelay; xf(ctx, x, y, t * 4, e.r * (2.2 - f * 1.2), e.r * (2.2 - f * 1.2)); ctx.lineWidth = .08; ctx.strokeStyle = e.col; ctx.globalAlpha = .4 + f * .6; ctx.stroke(SH.hex); ctx.globalAlpha = f * .7; xf(ctx, x, y, e.ang, e.r * f, e.r * f); ctx.fillStyle = e.col; ctx.fill(sh); ctx.globalAlpha = 1; return; }
  if (e.burrowed) { xf(ctx, x, y, 0, e.r * 1.1, e.r * .6); ctx.fillStyle = '#2a1c12'; ctx.fill(SH.circ); ctx.lineWidth = .1; ctx.strokeStyle = '#8a6a50'; ctx.stroke(SH.circ); return; }
  if (e.boss) { drawBoss(ctx, e, x, y); return; }
  const sq = e.squash, wob = e.type === 'gel' ? sin(e.bob * 1.5) * .08 : 0, sx = e.r * (1 + sq + wob), sy = e.r * (1 - sq * .7 - wob), lift = e.fly ? -6 + sin(e.bob) * 2 : 0;
  const rot = ROT_FREE[e.type] ? (e.type === 'spire' ? e.a || 0 : 0) : e.ang, jit = e.type === 'stalker' ? rr(-.8, .8) : 0;
  const wind = e.atkPhase === 1 ? 1 - e.atkT / e.atkDur : 0, fl = e.flash > 0, frz = e.frozenT > 0, col = e.col, rimC = fl ? '#ffffff' : frz ? '#bdf0ff' : wind > .6 && (t * 20 % 1) < .5 ? '#ffffff' : col;
  let ga = e.alpha !== undefined ? e.alpha : 1; if (e.type === 'phantom') ga *= .75 + .25 * sin(t * 9); if (B && B.darkness && G.player) ga *= clamp(1 - (hypot(x - G.player.x, y - G.player.y) - 230) / 120, .07, 1);
  ctx.globalAlpha = ga; const lw = 1.7 / e.r;
  xf(ctx, x + jit, y + lift, rot, sx, sy); ctx.lineWidth = lw; ctx.strokeStyle = midOf(col); ctx.lineCap = 'round';
  if (art.under) art.under(ctx, e, t, col);
  ctx.fillStyle = fl ? '#ffffff' : frz ? '#3d6a85' : darkOf(col); ctx.fill(sh);                     // armoured body
  if (!fl) { xf(ctx, x + jit, y + lift - e.r * .08, rot, sx * .64, sy * .64); ctx.fillStyle = frz ? '#5e93b3' : wind > 0 ? mixHex(midOf(col), col, wind * .6) : midOf(col); ctx.fill(sh); xf(ctx, x + jit, y + lift, rot, sx, sy); } // lit plate
  ctx.lineWidth = lw * (1.2 + wind * 1.2); ctx.strokeStyle = rimC; ctx.stroke(sh);                      // rim
  ctx.lineWidth = lw * .8; ctx.strokeStyle = fl ? '#ffffff' : col;
  if (art.d && !fl) art.d(ctx, e, t, col);
  if (art.eye && !fl) { const [ex, ey, er] = art.eye; ctx.fillStyle = art.eyeCol || '#ffffff'; ctx.beginPath(); dot(ctx, ex, ey, er); if (art.eyes2) dot(ctx, ex, -ey || -.18, er); if (art.slit) { ctx.rect(ex - .05, -er * 2.5, .1, er * 5); } ctx.fill();
    if (!art.eyeCol || art.eyeCol === '#000000') { ctx.strokeStyle = col; ctx.lineWidth = lw * .7; ctx.beginPath(); dot(ctx, ex, ey, er * 1.7); ctx.stroke(); } }
  ctx.lineCap = 'butt';
  if (e.type === 'lobber') { xf(ctx, x, y, e.angTo, e.r, e.r); ctx.fillStyle = col; ctx.fillRect(.15, -.28, 1, .56); ctx.fillStyle = darkOf(col); ctx.fillRect(.95, -.2, .12, .4); }
  if (e.type === 'bulwark') { // frontal shield arc
    xf(ctx, x, y, e.ang, e.r, e.r); ctx.beginPath(); ctx.arc(0, 0, 1.45, -e.def.arc, e.def.arc); ctx.lineWidth = .38; ctx.strokeStyle = e.shieldFlash > 0 ? '#ffffff' : '#9fd0ff'; ctx.stroke(); ctx.lineWidth = .12; ctx.strokeStyle = '#ffffff'; ctx.stroke(); }
  // status overlays
  if (frz) { xf(ctx, x, y, .3, e.r * 1.3, e.r * 1.3); ctx.strokeStyle = 'rgba(200,245,255,.85)'; ctx.lineWidth = .1; ctx.stroke(SH.hex); }
  if (e.shield > 0) { xf(ctx, x, y, 0, e.r * 1.55, e.r * 1.55); ctx.globalAlpha = .25 + .35 * e.shield / e.shieldMax; ctx.strokeStyle = '#58a8ff'; ctx.lineWidth = .12; ctx.stroke(SH.circ); ctx.globalAlpha = ga; }
  if (e.elite) { xf(ctx, x, y, t * 1.5, e.r * 1.75, e.r * 1.75); ctx.lineWidth = .07; ctx.setLineDash([.3, .25]); e.mods.forEach((m, i) => { ctx.strokeStyle = T.elite[m].col; ctx.beginPath(); ctx.arc(0, 0, 1 + i * .14, 0, TAU); ctx.stroke(); }); ctx.setLineDash([]); }
  if (e.reflectT > 0) { xf(ctx, x, y, t * 4, e.r * 1.4, e.r * 1.4); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .18; ctx.globalAlpha = .6 + .4 * sin(t * 30); ctx.stroke(SH.oct); }
  ctx.globalAlpha = 1;
  if ((e.hp < e.maxHp && G.time - e.lastHitT < 2.5 && !e.untouchable) || e.elite) { camXf(); const w = max(18, e.r * 2), f = e.hp / e.maxHp; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2 - 1, y - e.r - 9, w + 2, 4);
    ctx.fillStyle = e.elite ? '#ffb020' : '#ff4a6a'; ctx.fillRect(x - w / 2, y - e.r - 8, w * f, 2); if (e.shieldMax) { ctx.fillStyle = '#58a8ff'; ctx.fillRect(x - w / 2, y - e.r - 6, w * e.shield / e.shieldMax, 1); } }
  if (G.debug.ai) { camXf(); ctx.font = '6px monospace'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(`${e.act}${e.role ? ' ' + ROLE_NAME[e.role] : ''}${e.token ? ' T' : ''}`, x, y + e.r + 9);
    if (e.path) { ctx.strokeStyle = 'rgba(255,255,0,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); for (let i = e.pathI * 2; i < e.path.length; i += 2) ctx.lineTo(e.path[i], e.path[i + 1]); ctx.stroke(); } }
  if (G.debug.hit) { camXf(); ctx.strokeStyle = '#0f0'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(x, y, e.r, 0, TAU); ctx.stroke(); }
}
// ---- player ship: hull, lit plate, cockpit, engine flames, per-weapon model -------------------------------------------------------
const GUN_ART = {
  gun: (c, d) => { c.fillRect(.35, -.1, .95, .2); }, scatter: (c) => { c.fillRect(.35, -.22, .95, .16); c.fillRect(.35, .06, .95, .16); },
  minigun: (c, d, w) => { c.fillRect(.3, -.24, .5, .48); for (let i = -1; i <= 1; i++) c.fillRect(.8, i * .13 + sin(G.rt * 40 * (w.spin || 0)) * .04 - .04, .65, .08); },
  rocket: (c) => { c.fillRect(.25, -.2, 1.05, .4); c.fillStyle = '#ff8a2b'; c.fillRect(1.2, -.12, .12, .24); }, rail: (c) => { c.fillRect(.3, -.07, 1.6, .14); c.fillStyle = '#7ff6ff'; for (let i = 0; i < 3; i++) c.fillRect(.6 + i * .35, -.16, .1, .32); },
  beam: (c) => { c.fillRect(.3, -.1, .7, .2); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(1, 0); c.lineTo(1.25, -.18); c.lineTo(1.5, 0); c.lineTo(1.25, .18); c.fill(); },
  arc: (c) => { c.fillRect(.3, -.08, .7, .16); c.fillRect(.95, -.28, .12, .56); c.fillRect(1, -.28, .4, .08); c.fillRect(1, .2, .4, .08); }, disc: (c) => { c.fillRect(.3, -.1, .6, .2); c.beginPath(); c.arc(1.05, 0, .25, 0, TAU); c.fill(); },
  flamer: (c) => { c.fillRect(.3, -.12, .85, .24); c.fillRect(-.4, .35, .5, .3); c.fillStyle = '#ff8a2b'; c.fillRect(1.1, -.15, .14, .3); }, bow: (c, d, w) => { c.beginPath(); c.arc(.25, 0, .9, -1.1, 1.1); c.stroke(); c.beginPath(); c.moveTo(.25 + cos(-1.1) * .9, sin(-1.1) * .9); c.lineTo(.25 - (w.charge || 0) * .5, 0); c.lineTo(.25 + cos(1.1) * .9, sin(1.1) * .9); c.stroke(); },
  orbit: () => { }, mines: (c) => { c.fillRect(.3, -.2, .8, .4); c.fillStyle = '#ffe23a'; c.fillRect(.95, -.08, .12, .16); },
};
function drawPlayer(ctx, p, alpha) {
  const x = lerpX(p, alpha) + p.recX * .5, y = lerpY(p, alpha) + p.recY * .5, col = p.color, ang = p.ang;
  for (const g of p.ghosts) { xf(ctx, g.x, g.y, g.a, 13, 13); ctx.globalAlpha = g.t / .22 * .45; ctx.lineWidth = .12; ctx.strokeStyle = col; ctx.stroke(SH.ship); } ctx.globalAlpha = 1;
  if (p.dead) return;
  if (p.hitT > 0 && (p.hitT * 20 % 1) < .35 && p.flash <= 0) ctx.globalAlpha = .35;
  const sq = p.squash, bob = sin(p.bob) * .6, s = 12.5, sp = hypot(p.vx, p.vy), fl = p.flash > 0;
  xf(ctx, x, y + bob, ang, s * (1 + sq), s * (1 - sq * .6));
  // engine flames (length scales with speed)
  if (!fl) { const k = .25 + min(1, sp / 230) * .55 + (p.dashT > 0 ? .6 : 0) + sin(G.rt * 50) * .05; ctx.fillStyle = col; ctx.beginPath(); for (const yy of [-.42, .42]) { ctx.moveTo(-.55, yy - .14); ctx.lineTo(-.55 - k, yy); ctx.lineTo(-.55, yy + .14); } ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (const yy of [-.42, .42]) { ctx.moveTo(-.55, yy - .07); ctx.lineTo(-.55 - k * .55, yy); ctx.lineTo(-.55, yy + .07); } ctx.fill(); }
  ctx.fillStyle = fl ? '#ffffff' : darkOf(col); ctx.fill(SH.ship);
  if (!fl) { ctx.fillStyle = midOf(col); ctx.fill(SH.shipInner); ctx.lineWidth = .06; ctx.strokeStyle = col; ctx.beginPath(); L(ctx, -.2, -.6, .25, -.3); L(ctx, -.2, .6, .25, .3); ctx.stroke(); }
  ctx.lineWidth = .13; ctx.strokeStyle = fl ? '#ffffff' : col; ctx.stroke(SH.ship);
  if (!fl) { ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.ellipse(.42, 0, .26, .13, 0, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(.48, 0, .13, .07, 0, 0, TAU); ctx.fill(); }
  const w = curWeapon(p), ga = GUN_ART[w.def.k === 'gun' ? (GUN_ART[w.id] ? w.id : 'gun') : w.def.k] || GUN_ART.gun; ctx.fillStyle = '#d8e2f5'; ctx.strokeStyle = '#d8e2f5'; ctx.lineWidth = .08; ga(ctx, w.def, w);
  ctx.globalAlpha = 1;
  if (p.shield > 0) { xf(ctx, x, y, 0, 19, 19); ctx.globalAlpha = .2 + .4 * p.shield / p.shieldMax; ctx.strokeStyle = '#5dff8a'; ctx.lineWidth = .06; ctx.stroke(SH.hex); ctx.globalAlpha = 1; }
  if (p.blood > 0 || p.oshield > 0) { xf(ctx, x, y, -G.rt, 20, 20); ctx.globalAlpha = .5; ctx.strokeStyle = p.blood > 0 ? '#ff2a4a' : '#ffe23a'; ctx.lineWidth = .05; ctx.setLineDash([.2, .15]); ctx.stroke(SH.circ); ctx.setLineDash([]); ctx.globalAlpha = 1; }
  if (B.barrier && p.barrierT <= 0) { xf(ctx, x, y, G.rt, 21, 21); ctx.globalAlpha = .55; ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = .05; ctx.stroke(SH.circ); ctx.globalAlpha = 1; }
  if (G.debug.hit) { camXf(); ctx.strokeStyle = '#0f0'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(x, y, p.r * .7, 0, TAU); ctx.stroke(); }
  // engine sparks
  if (sp > 120 && rnd() < .5) { const a = ang + PI + rr(-.3, .3); emit(PK.DOT, p.x - cos(ang) * 10, p.y - sin(ang) * 10, cos(a) * 60, sin(a) * 60, .25, 1.6, ci(col), 4); }
}
// ---- baked room floor: base, tile variation, biome motifs, ambient occlusion -------------------------------------------------------------
function bakeRoomFloor(room) {
  const ts = TS, w = room.w, h = room.h, k = min(1.6, 4096 / (max(w, h) * ts)), bio = T.BIO[room.biome], r = new RNG(room.seed + 'floor');
  const cv = room.floorCv || (room.floorCv = document.createElement('canvas')); cv.width = ceil(w * ts * k); cv.height = ceil(h * ts * k); const c = cv.getContext('2d');
  c.setTransform(k, 0, 0, k, 0, 0); c.fillStyle = bio.floor; c.fillRect(0, 0, w * ts, h * ts);
  const floor = (x, y) => x >= 0 && y >= 0 && x < w && y < h && room.tiles[y * w + x] !== 1;
  // tile variation + bevels
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!floor(x, y)) continue; const X = x * ts, Y = y * ts, v = r.next();
    if (v < .45) { c.fillStyle = bio.floor2; c.fillRect(X + 1, Y + 1, ts - 2, ts - 2); } else if (v > .93) { c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(X + 1, Y + 1, ts - 2, ts - 2); }
    c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(X + 1, Y + 1, ts - 2, 1.5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(X + 1, Y + ts - 2.5, ts - 2, 1.5); }
  c.strokeStyle = bio.grid; c.globalAlpha = .45; c.lineWidth = 1; c.beginPath(); for (let x = 0; x <= w; x++) { c.moveTo(x * ts, 0); c.lineTo(x * ts, h * ts); } for (let y = 0; y <= h; y++) { c.moveTo(0, y * ts); c.lineTo(w * ts, y * ts); } c.stroke(); c.globalAlpha = 1;
  // biome motifs
  const rp = () => { let x, y, n = 0; do { x = r.int(1, w - 2); y = r.int(1, h - 2); } while (!floor(x, y) && n++ < 30); return [x, y]; };
  const id = bio.id;
  if (id === 'neon') { // circuit traces with solder nodes
    c.lineWidth = 1.6; for (let i = 0; i < w * h / 30; i++) { let [x, y] = rp(); x = x * ts + r.pick([8, 16, 24]); y = y * ts + r.pick([8, 16, 24]); c.strokeStyle = rgba(r.chance(.7) ? bio.edge : bio.acc, .18); c.beginPath(); c.moveTo(x, y);
      for (let s = 0; s < r.int(2, 5); s++) { if (r.chance(.5)) x += r.pick([-1, 1]) * r.int(1, 3) * 16; else y += r.pick([-1, 1]) * r.int(1, 3) * 16; c.lineTo(x, y); } c.stroke(); c.fillStyle = rgba(bio.acc, .35); c.fillRect(x - 2.5, y - 2.5, 5, 5); }
    for (let i = 0; i < w * h / 70; i++) { const [x, y] = rp(); c.fillStyle = rgba(bio.edge, .05); c.fillRect(x * ts, y * ts, ts, ts); c.strokeStyle = rgba(bio.edge, .12); c.lineWidth = 1; c.beginPath(); for (let k2 = 4; k2 < ts * 2; k2 += 6) { c.moveTo(x * ts + min(ts, k2), y * ts + max(0, k2 - ts)); c.lineTo(x * ts + max(0, k2 - ts), y * ts + min(ts, k2)); } c.stroke(); }
  } else if (id === 'frost') { // frost cracks, rimed patches, coolant pipes
    for (let i = 0; i < w * h / 40; i++) { const [x, y] = rp(); const g = c.createRadialGradient(x * ts, y * ts, 0, x * ts, y * ts, 60); g.addColorStop(0, 'rgba(200,240,255,.09)'); g.addColorStop(1, 'rgba(200,240,255,0)'); c.fillStyle = g; c.fillRect(x * ts - 60, y * ts - 60, 120, 120); }
    c.strokeStyle = 'rgba(210,245,255,.14)'; c.lineWidth = 1; for (let i = 0; i < w * h / 25; i++) { const [x, y] = rp(); let px = x * ts + r.int(0, ts), py = y * ts + r.int(0, ts); c.beginPath(); c.moveTo(px, py); for (let s = 0; s < 5; s++) { px += r.range(-14, 14); py += r.range(-14, 14); c.lineTo(px, py); } c.stroke(); }
    for (let i = 0; i < 3; i++) { const y = r.int(2, h - 3) * ts + 10; c.strokeStyle = rgba(bio.acc, .15); c.lineWidth = 4; c.beginPath(); c.moveTo(0, y); c.lineTo(w * ts, y); c.stroke(); c.strokeStyle = rgba(bio.edge, .2); c.lineWidth = 1; c.beginPath(); c.moveTo(0, y - 3); c.lineTo(w * ts, y - 3); c.stroke(); for (let x = r.int(0, 60); x < w * ts; x += r.int(80, 160)) { c.fillStyle = rgba(bio.acc, .3); c.fillRect(x, y - 5, 6, 10); } }
  } else if (id === 'toxic') { // moss, roots, fungus
    for (let i = 0; i < w * h / 12; i++) { const [x, y] = rp(); c.fillStyle = rgba(r.chance(.7) ? '#3a8a22' : '#7dff3a', r.range(.05, .13)); c.beginPath(); c.arc(x * ts + r.int(0, ts), y * ts + r.int(0, ts), r.range(5, 16), 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(20,50,18,.8)'; c.lineCap = 'round'; for (let i = 0; i < w * h / 45; i++) { const [x, y] = rp(); const x0 = x * ts, y0 = y * ts; c.lineWidth = r.range(2, 4); c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + r.range(-40, 40), y0 + r.range(-40, 40), x0 + r.range(-60, 60), y0 + r.range(-60, 60), x0 + r.range(-80, 80), y0 + r.range(-80, 80)); c.stroke(); }
    for (let i = 0; i < w * h / 60; i++) { const [x, y] = rp(); for (let k2 = 0; k2 < 3; k2++) { c.fillStyle = rgba(bio.acc, .3); c.beginPath(); c.arc(x * ts + 8 + k2 * 6, y * ts + 18 - k2 * 3, 2.5, 0, TAU); c.fill(); } }
  } else if (id === 'abyss') { // crystal clusters and star dust
    for (let i = 0; i < w * h / 3; i++) { const [x, y] = rp(); c.fillStyle = `rgba(200,210,255,${r.range(.05, .25)})`; c.fillRect(x * ts + r.int(0, ts), y * ts + r.int(0, ts), 1.2, 1.2); }
    for (let i = 0; i < w * h / 40; i++) { const [x, y] = rp(); const cx = x * ts + 16, cy = y * ts + 16, colr = r.chance(.5) ? bio.edge : bio.acc; for (let k2 = 0; k2 < r.int(2, 4); k2++) { const a = r.range(0, TAU), l = r.range(8, 18);
      c.fillStyle = rgba(colr, .16); c.strokeStyle = rgba(colr, .35); c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + cos(a - .25) * l * .5, cy + sin(a - .25) * l * .5); c.lineTo(cx + cos(a) * l, cy + sin(a) * l); c.lineTo(cx + cos(a + .25) * l * .5, cy + sin(a + .25) * l * .5); c.closePath(); c.fill(); c.stroke(); } }
  } else { // core: molten seams + machine plates
    for (let i = 0; i < w * h / 30; i++) { const [x, y] = rp(); let px = x * ts, py = y * ts; c.beginPath(); c.moveTo(px, py); for (let s = 0; s < 6; s++) { px += r.range(-18, 18); py += r.range(-18, 18); c.lineTo(px, py); }
      c.strokeStyle = 'rgba(255,90,20,.12)'; c.lineWidth = 5; c.stroke(); c.strokeStyle = 'rgba(255,170,60,.3)'; c.lineWidth = 1.2; c.stroke(); }
    for (let i = 0; i < w * h / 50; i++) { const [x, y] = rp(); c.strokeStyle = rgba(bio.acc, .12); c.lineWidth = 1; c.strokeRect(x * ts + 4, y * ts + 4, ts - 8, ts - 8); c.fillStyle = rgba(bio.acc, .2); for (const [dx, dy] of [[7, 7], [25, 7], [7, 25], [25, 25]]) c.fillRect(x * ts + dx - 1, y * ts + dy - 1, 2, 2); }
  }
  // ambient occlusion along walls
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!floor(x, y)) continue; const X = x * ts, Y = y * ts;
    const sh = (dx, dy, gx0, gy0, gx1, gy1, rx, ry, rw, rh) => { if (floor(x + dx, y + dy)) return; const g = c.createLinearGradient(gx0, gy0, gx1, gy1); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
    sh(0, -1, X, Y, X, Y + 16, X, Y, ts, 16); sh(-1, 0, X, Y, X + 12, Y, X, Y, 12, ts); sh(1, 0, X + ts, Y, X + ts - 12, Y, X + ts - 12, Y, 12, ts); sh(0, 1, X, Y + ts, X, Y + ts - 8, X, Y + ts - 8, ts, 8); }
  room.floorK = k;
}
// wall faces: walls with floor below get a darker "front" face for depth
function buildWallFaces(room) {
  const ts = TS, w = room.w, h = room.h, face = new Path2D(), seams = new Path2D(), solid = (x, y) => x < 0 || y < 0 || x >= w || y >= h || room.tiles[y * w + x] === 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!solid(x, y) || solid(x, y + 1)) continue; const X = x * ts, Y = y * ts; face.rect(X, Y + ts - 11, ts, 11); seams.moveTo(X + ts / 2, Y + ts - 11); seams.lineTo(X + ts / 2, Y + ts); }
  room.paths.face = face; room.paths.seams = seams;
}
// ---- backdrop beyond the room: parallax stars + biome nebula ------------------------------------------------------------------------------
const STARS = []; for (let i = 0; i < 260; i++) STARS.push([rnd(), rnd(), rnd() * 1.6 + .3, rnd() * TAU, rnd() < .15]);
const _neb = new Map();
function nebulaFor(bio) { let c = _neb.get(bio.id); if (c) return c; c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  for (const [cx, cy, r, col] of [[70, 80, 140, bio.edge], [190, 170, 120, bio.acc], [140, 40, 90, bio.edge]]) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, .14)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
  _neb.set(bio.id, c); return c; }
function drawBackdrop(ctx, bio) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bio.bg; ctx.fillRect(0, 0, R.W, R.H);
  const c = G.cam, W = R.W, H = R.H, n = nebulaFor(bio), ox = -c.x * .05 % W, oy = -c.y * .05 % H; ctx.globalAlpha = 1; ctx.drawImage(n, ox - W * .2, oy - H * .2, W * 1.6, H * 1.6);
  ctx.fillStyle = '#dfe8ff';
  for (const [sx, sy, sz, ph, big] of STARS) { const par = .08 + sz * .05, x = ((sx * W - c.x * par * R.z) % W + W) % W, y = ((sy * H - c.y * par * R.z) % H + H) % H; ctx.globalAlpha = .25 + .35 * (.5 + .5 * sin(G.rt * (big ? 3 : 1) + ph)); const s = sz * R.scale * (big ? 1.6 : 1); ctx.fillRect(x, y, s, s); }
  ctx.globalAlpha = 1;
}
// ---- ambient particles per biome --------------------------------------------------------------------------------------------------------------
function ambience(dt, bio) {
  if (dt <= 0 || G.settings.particles <= .3) return; const c = G.cam, hw = R.vw * .6, hh = R.vh * .6; let n = dt * 26 * G.settings.particles; const id = bio.id;
  while (n > 0) { if (n < 1 && rnd() > n) break; n--; const x = c.x + rr(-hw, hw), y = c.y + rr(-hh, hh);
    if (id === 'neon') emit(PK.DOT, x, y, 0, -rr(8, 22), rr(1.5, 3), rr(.8, 1.4), ci(rnd() < .5 ? bio.edge : bio.acc), 0);
    else if (id === 'frost') emit(PK.DOT, x, y - hh, rr(10, 30), rr(30, 60), rr(3, 6), rr(.8, 1.5), C_WHITE, 0);
    else if (id === 'toxic') emit(PK.GLOW, x, y, rr(-8, 8), -rr(4, 12), rr(2, 4), rr(3, 6), ci('#7dff3a'), 0);
    else if (id === 'abyss') emit(PK.GLOW, x, y, 0, 0, rr(1, 2.5), rr(2, 4), ci(rnd() < .5 ? bio.acc : '#b8a8ff'), 0);
    else emit(PK.DOT, x, y + hh, rr(-10, 10), -rr(30, 70), rr(2, 4), rr(.8, 1.6), rnd() < .5 ? C_FIRE : C_FIRE2, 0); }
}
// ---- tethers (fences, siphon drains) -------------------------------------------------------------------------------------------------------------
function drawTethers(ctx) {
  for (const t of TETHERS) { const on = t.t >= t.warn, f = sat(t.t / t.warn); ctx.lineCap = 'round'; ctx.strokeStyle = t.col; ctx.globalAlpha = on ? .9 : .3 + .4 * f * (sin(G.rt * 40) > 0 ? 1 : .4);
    ctx.lineWidth = on ? 4 : 1.5; ctx.beginPath(); ctx.moveTo(t.a.x, t.a.y); const n = 8; for (let i = 1; i <= n; i++) { const k = i / n; ctx.lineTo(lerp(t.a.x, t.b.x, k) + (i < n && on ? rr(-4, 4) : 0), lerp(t.a.y, t.b.y, k) + (i < n && on ? rr(-4, 4) : 0)); } ctx.stroke();
    if (on) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.stroke(); } }
  for (const e of G.enemies) if (e.tether && !e.dead) { const p = G.player; ctx.strokeStyle = '#ff4d9e'; ctx.globalAlpha = .7 + .3 * sin(G.rt * 30); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e.x, e.y);
    const n = 10; for (let i = 1; i <= n; i++) { const k = i / n; ctx.lineTo(lerp(e.x, p.x, k) + sin(G.rt * 20 + i) * 5, lerp(e.y, p.y, k) + cos(G.rt * 20 + i) * 5); } ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt';
}
