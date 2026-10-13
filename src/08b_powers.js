// =====================================================================================
// SECTION 8b — WEAPONS / UPGRADES: healing, legendary powers, cursed pacts (hooks called from entities/weapons)
// =====================================================================================
// ---- per-tick passive powers (called from updatePassives) ---------------------------------------------------------
function updatePowers(p, dt) {
  const run = G.run, inFight = DIRECTOR.active || !!G.boss;
  // base regeneration (always on unless healing is forbidden)
  if (!B.noHeal && p.hp < p.maxHp) { p.regenAcc = (p.regenAcc || 0) + dt * T.ST.regen * (1 + B.regenPct); if (p.regenAcc >= 1) { p.regenAcc -= 1; p.hp = min(p.maxHp, p.hp + 1); p.regenPulse = .4; } }
  if (p.regenPulse > 0) p.regenPulse -= dt;
  if (p.hydraT > 0 && (p.hydraT -= dt) <= 0) p.hydra = 0;
  if (p.leechB < 4) p.leechB = min(4, (p.leechB || 0) + dt * 4);
  if (B.blacksun && (p.sunT = (p.sunT || 0) + dt) >= 5) { p.sunT = 0; const t = aimPoint(p, 380); addZone('sun', t.x, t.y, 110, 3, B.sunDps); A.play('ability', t.x, t.y, .6, .6); ring(t.x, t.y, 110, C_FIRE2, .5, 4); }
  if (B.fracture && inFight && (p.fracT = (p.fracT || 0) + dt) >= 7) { p.fracT = 0; p.buffs.frac = 1.2; A.play('graze', p.x, p.y, 1, .5); screenFlash(.12); aberrate(.008); ring(p.x, p.y, 500, ci('#c8f0ff'), .6, 3); wtext(p.x, p.y - 28, 'TIME STOP', '#c8f0ff', 12, 1, -20); }
  if (B.stormheart && inFight && (p.stormT = (p.stormT || 0) + dt) >= .6) { p.stormT = 0; const t = randomEnemyNear(p.x, p.y, 280); if (t) { beamFx(t.x + rr(-20, 20), t.y - 260, t.x, t.y, '#d8c2ff', 3, .2, 26); chainLightning(t, 25 * (1 + B.dmg * .5), 1 + B.shockAdd, t.x, t.y - 30); } }
  if (B.plaguebearer && (p.plagueT = (p.plagueT || 0) + dt) >= .25) { p.plagueT = 0; forEnemiesNear(p.x, p.y, 130, e => addPoison(e, 1)); }
  if (B.lance && inFight && (p.lanceT = (p.lanceT || 0) + dt) >= 2.5) { let best = null; for (const e of G.enemies) if (!e.dead && e.spawnT <= 0 && !e.burrowed && !e.untouchable && inView(e.x, e.y, 0) && (!best || e.hp > best.hp)) best = e;
    if (best) { p.lanceT = 0; tele('circle', best.x, best.y, 26, 0, .35, '#fff27a', 0, best); const t = best; addTimer(.35, () => { if (t.dead) return; beamFx(t.x, t.y - 700, t.x, t.y, '#fff27a', 16, .35); beamFx(t.x, t.y - 700, t.x, t.y, '#ffffff', 5, .25); hurtEnemy(t, 120 * (1 + B.dmg), DMG.EXPL, true); ring(t.x, t.y, 50, C_GOLD, .3, 4); trauma(.2); A.play('rail', t.x, t.y, .6, 1.3); }); } }
  if (B.rearDmg && inFight && (p.rearT = (p.rearT || 0) + dt) >= 2) { let best = null, bd = 400 * 400; for (const e of G.enemies) { if (e.dead || e.spawnT > 0 || e.burrowed || e.untouchable) continue; const d = dist2(p.x, p.y, e.x, e.y);
      if (d < bd && abs(angDiff(p.ang, atan2(e.y - p.y, e.x - p.x))) > PI / 2) { bd = d; best = e; } } if (best) { p.rearT = 0; beamFx(p.x, p.y, best.x, best.y, '#5dff8a', 3, .18); hurtEnemy(best, B.rearDmg * (1 + B.dmg * .5), DMG.SUMMON); A.play('pistol', p.x, p.y, .3, 1.6); } }
  if (B.haunted && inFight && (p.hauntT = (p.hauntT || 0) + dt) >= 20) { p.hauntT = 0; const cur = curWeapon(p).id, pool = Object.keys(T.W).filter(id => id !== cur), id = rpick(pool);
    run.weapons[run.wi] = makeWeapon(id); refreshWeapons(); A.stopLoops(); toast('HAUNTED ARSENAL', 'Your weapon became ' + T.W[id].n); burst(p.x, p.y, 20, ci('#b05cff'), 220, .5, 3); }
  if (B.doomsday && DIRECTOR.active) { run.doomT = (run.doomT === undefined ? 45 : run.doomT) - dt; if (run.doomT <= 0) { run.doomT = 45; const d = p.maxHp * .25; p.hp -= d; p.flash = .2; trauma(.6); screenFlash(.3);
      A.play('hurt', p.x, p.y); wtext(p.x, p.y - 20, 'DOOMSDAY -' + round(d), '#ff2a4a', 12, 1.2); run.recap.push({ src: 'Doomsday Clock', dmg: round(d), t: G.time, hp: max(0, round(p.hp)) }); if (p.hp <= 0) playerDie('Doomsday Clock'); } }
  // shadow clone follows behind your aim
  if (B.clone && !G.allies.some(a => a.kind === 'clone')) addAlly('clone', p.x, p.y, 1e9);
}
function randomEnemyNear(x, y, r) { let pick = null, n = 0; for (const e of G.enemies) { if (e.dead || e.spawnT > 0 || e.burrowed || e.untouchable || dist2(x, y, e.x, e.y) > r * r) continue; if (rnd() < 1 / ++n) pick = e; } return pick; }
// ---- damage taken modifiers from powers (called inside hurtEnemy) -------------------------------------------------------
function powerDmgMul(e) {
  let m = 1; if (B.meltdown && e.burnT > 0) m *= 1 + B.meltdown; if (B.permafrost && e.frozenT > 0) m *= 3; if (B.mark && G.markE === e) m *= 1 + B.mark; return m;
}
// ---- on-hit (bullet) powers -------------------------------------------------------------------------------------------------
function onHitPower(e, b, dmg, crit) {
  const p = G.player;
  if (B.mark && !b.summon) G.markE = e;
  if (B.warhead && !b.summon && G.time - (p.warheadT || -9) >= 1) { p.warheadT = G.time; explode(e.x, e.y, 60 * expRad(), dmg * expMul(), 0, 'Warhead', true); }
  if (B.critHeal && crit && p.leechB >= 1) { p.leechB -= 1; healPlayer(B.critHeal, false, true); }
  if (B.guillotine && !e.dead && !e.boss && !e.untouchable && e.hp < e.maxHp * B.guillotine) { wtext(e.x, e.y - e.r - 8, 'EXECUTED', '#ffef7a', 9, .7); e.hp = 0; killEnemy(e, DMG.BULLET, true); }
}
// ---- on-kill powers --------------------------------------------------------------------------------------------------------
function onKillPower(e) {
  const p = G.player, run = G.run;
  if (B.hydra) { p.hydra = min(5, (p.hydra || 0) + 1); p.hydraT = 4; }
  if (B.permafrost && e.frozenT > 0) { ring(e.x, e.y, 90, C_ICE, .4, 4); forEnemiesNear(e.x, e.y, 90, o => freeze(o, freezeDur())); }
  if (B.midas) dropGold(e.x, e.y, 1 + (e.def.cost || 1) * .5);
  if (B.bloodmoon) { p.blood = min(40, (p.blood || 0) + 2); emit(PK.DOT, e.x, e.y, (p.x - e.x) * 2, (p.y - e.y) * 2, .35, 3, C_RED, 0); }
  if (B.vengeful && !e.boss) { const a = atan2(p.y - e.y, p.x - e.x); eShot(e.x, e.y, a, 165, 8 * (e.dmgMul || 1), 5, 'Vengeful Dead', 3, null); }
}
let _okDepth = 0;
function overkillLeap(e, excess) {
  if (_okDepth >= 3 || excess < 2) return; let best = null, bd = 240 * 240;
  for (const o of G.enemies) { if (o === e || o.dead || o.spawnT > 0 || o.burrowed || o.untouchable) continue; const d = dist2(e.x, e.y, o.x, o.y); if (d < bd) { bd = d; best = o; } }
  if (!best) return; _okDepth++; beamFx(e.x, e.y, best.x, best.y, '#ff4a6a', 4, .2); hurtEnemy(best, excess * .9, DMG.BULLET, false); _okDepth--;
}
// ---- dash powers ------------------------------------------------------------------------------------------------------------
function onDashPower(p) {
  p.dashId = (p.dashId || 0) + 1; if (B.phaseDmg) p.iframe += .15;
  if (B.twinfang) { const w = curWeapon(p), d = w.def;
    for (let i = 0; i < 5; i++) { const a = p.ang + (i - 2) * .16, b = (d.k === 'gun' || d.k === 'bow') ? bulletFrom(p, w, a) : bulletFrom(p, { def: T.W.sidearm }, a); if (d.k !== 'gun') b.dmg = 28 * dmgMul(p); if (b.mine) b.mine = 0; }
    A.play('blade', p.x, p.y, .8, 1.2); }
}
function dashSlice(p) { // Phase Shift: cut through enemies once per dash
  if (!B.phaseDmg) return; forEnemiesNear(p.x, p.y, 20, e => { if (e.sliceId === p.dashId) return; e.sliceId = p.dashId; hurtEnemy(e, B.phaseDmg * dmgMul(p), DMG.MELEE, false, p.dashDx * 200, p.dashDy * 200); spray(e.x, e.y, atan2(p.dashDy, p.dashDx), 1, 10, ci(p.color), 300, .25, 3); A.play('slash', e.x, e.y, .6); });
}
// ---- reload powers ------------------------------------------------------------------------------------------------------------
function onReloadPower(p, w) {
  if (!B.blossom) return; const base = (w.def.dmg || 20) * (w.def.cnt || 1) * .6 * dmgMul(p);
  for (let i = 0; i < 24; i++) { const b = fragBullet(p.x, p.y, i / 24 * TAU, base, 'Death Blossom'); b.bounce = 2; b.life = .6; b.shape = 8; b.r = 4; b.pierce = 1; b.pc = .4; }
  ring(p.x, p.y, 40, ci(bpal()[0]), .3, 3); A.play('blade', p.x, p.y, 1, .8);
}
// ---- player-hurt powers --------------------------------------------------------------------------------------------------------
function onHurtPower(p) {
  if (B.reactive) { for (let i = G.ebullets.length - 1; i >= 0; i--) { const b = G.ebullets[i]; if (dist2(b.x, b.y, p.x, p.y) < 110 * 110) { emit(PK.DOT, b.x, b.y, 0, 0, .3, 3, ci(bpal()[2]), 0); freeBullet(G.ebullets, i); } }
    forEnemiesNear(p.x, p.y, 130, e => { const a = atan2(e.y - p.y, e.x - p.x); e.kbx += cos(a) * 380 / e.mass; e.kby += sin(a) * 380 / e.mass; }); ring(p.x, p.y, 110, ci('#7ff6ff'), .35, 4); }
}
// absorb damage with Blood Moon blood and Second Heart overheal (returns remaining damage)
function absorbPower(p, dmg) {
  for (const k of ['blood', 'oshield']) if (p[k] > 0 && dmg > 0) { const a = min(p[k], dmg); p[k] -= a; dmg -= a; }
  return dmg;
}
// ---- legendary + pact presentation --------------------------------------------------------------------------------------------
function onPickPower(u) {
  const p = G.player; if (!p) return;
  if (u.rar === 3) { setTimeout(() => { toast('★ LEGENDARY ★', u.n.toUpperCase(), true); A.play('legendary'); MUS.stinger('synergy'); }, 120); slowmo(.35, .7); screenFlash(.25);
    ring(p.x, p.y, 160, C_GOLD, .7, 6); ring(p.x, p.y, 90, C_WHITE, .5, 3); burst(p.x, p.y, 60, C_GOLD, 420, .9, 4, PK.SHARD, 2); }
  else if (u.rar === 4) { setTimeout(() => { toast('PACT SEALED', u.n.toUpperCase()); A.play('roar', p.x, p.y, .35, 1.8); }, 120); ring(p.x, p.y, 120, ci('#ff3355'), .6, 5); burst(p.x, p.y, 30, ci('#ff3355'), 260, .7, 3, PK.SHARD, 2); }
}
function removeUpgrade(id) { // used by cleansing; reverses the stat rows
  const u = UPG[id], run = G.run, i = run.upgrades.indexOf(id); if (i < 0) return; run.upgrades.splice(i, 1);
  for (const k in u.s) B[k] -= u.s[k]; B.picks[id]--; B.fam[u.fam]--; recalcPlayer(); refreshWeapons();
}
// ---- Hunted: the unkillable stalker -----------------------------------------------------------------------------------------------
function spawnStalker() {
  const room = G.room, p = G.player; let best = room.spawns[0], bd = 0; for (const s of room.spawns) { const d = dist2(s.x, s.y, p.x, p.y); if (d > bd) { bd = d; best = s; } }
  if (!best) return; const e = spawnEnemy('stalker', best.x, best.y, { noCodex: true }); e.untouchable = true; e.inv = 1e9; e.noDrop = true;
}
