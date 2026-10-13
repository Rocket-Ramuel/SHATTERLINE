// DPS harness: player fires continuously at a cluster of 6 inert, unkillable dummies for 10 sim-seconds.
// usage: NODE_PATH=$(npm root -g) node tools/balance.js            (prints a table of builds)
const { chromium } = require('playwright'); const path = require('path');
const BUILDS = [
  ['sidearm'], ['scatter'], ['stinger'], ['minigun'], ['rocket'], ['rail'], ['beam'], ['arc'], ['disc'], ['flamer'], ['bow'], ['orbit'], ['mines'],
  ['flamer', 'missilepod'], ['flamer', 'missilepod', 'missilepod'], ['flamer', 'missilepod', 'swarm'], ['ember:flamer', 'kindling', 'missilepod', 'swarm', 'incendiary'],
  ['sidearm', 'missilepod'], ['minigun', 'missilepod', 'swarm'], ['stinger', 'static', 'capacitor'], ['flamer', 'static', 'capacitor', 'ball'],
  ['sidearm', 'blast', 'bigbang', 'demolition'], ['stinger', 'frag', 'chainreact'], ['sidearm', 'venom', 'pandemic', 'virulence'],
];
(async () => {
  console.log('single cluster6   build');
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } }); page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'index.html')); await page.waitForTimeout(500);
  for (const b of BUILDS) {
    const run1 = (b, n) => page.evaluate(([b, n]) => {
      let [w, ...ups] = b, ch = 'kestrel'; if (w.includes(':')) [ch, w] = w.split(':');
      SL.startRun({ char: ch, seed: 'DPS' }); const run = SL.G.run; run.weapons = [makeWeapon(w)]; for (const u of ups) SL.pickUpgrade(u, true);
      const nd = run.map.layers[0][0]; nd.type = 'shop'; SL.enterNode(nd); UI.clear(); SL.G.paused = false; SL.G.props.length = 0; SL.G.bot = false; SL.G.godMode = true;
      const p = SL.G.player, room = SL.G.room, px = room.w * 16 - 120, py = room.h * 16, near = ['flamer', 'scatter', 'orbit'].includes(w), dx = near ? 70 : 150;
      p.x = px; p.y = py;
      for (let i = 0; i < n; i++) { const e = SL.spawnEnemy('gunner', px + dx + (i % 3) * 26, py - (n > 1 ? 30 : 0) + floor(i / 3) * 40, { noTele: true }); e.hp = e.maxHp = 1e7; e.stunT = 1e9; }
      const d0 = run.stats.dmgDealt;
      for (let i = 0; i < 1200; i++) { IN.held.Mouse0 = w === 'bow' ? (i % 110) < 100 : true; IN.update(); IN.wx = px + dx + 26; IN.wy = py; p.x = px; p.y = py; for (const e of SL.G.enemies) { e.x = e.px; e.y = e.py; e.kbx = e.kby = 0; e.stunT = 1e9; } SL.G.hitstop = 0; simTick(1 / 120); }
      IN.held.Mouse0 = false; return ((run.stats.dmgDealt - d0) / 10).toFixed(0);
    }, [b, n]);
    const r = (await run1(b, 1)).padStart(6) + ' ' + (await run1(b, 6)).padStart(6);
    console.log(r, '  ', b.join(' + '));
  }
  await browser.close();
})();
