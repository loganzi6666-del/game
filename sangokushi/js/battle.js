/* =========================================================
   東亞 群雄割據 — 전투 시스템
   병력만으로는 이기지 못한다: 훈련 · 장비 · 기술 · 병종 · 지형 · 전술 · 장수
   ========================================================= */
'use strict';

function unitTypeKey(t) { return t; }

function unitPower(u, B, side) {
  const g = genByName(u.gen) || {lead:50, war:50, int:50, skills:[], apt:'CCCCC'};
  const U = UNITS[u.type], fid = side.fid, T = TERRAIN[B.prov.t];
  let v = u.troops;
  v *= 0.45 + u.train / 100 * 1.25;                  // 훈련: 0.45 ~ 1.70 (전투력의 핵심)
  v *= 0.70 + u.morale / 100 * 0.50;                 // 사기: 0.70 ~ 1.20
  v *= U.base;
  v *= APT_MULT[aptOf(g, u.type)] || 1;              // 병과 적성
  v *= 1 + (g.lead * 0.6 + g.war * 0.4 - 55) / 100 + sfx(g, 'power');
  v *= 0.85 + u.weapon * 0.08;                       // 무기 등급 1~5
  v *= 1 + sfx(g, u.type) + fx(fid, u.type);         // 병종 특기 + 기술
  v *= 1 + fx(fid, 'power');
  const tk = (u.type === 'cav' || u.type === 'ele') ? 'cav' : (u.type === 'bow' || u.type === 'gun') ? 'bow' : 'foot';
  v *= T[tk] || 1;
  if (u.type === 'navy') v *= (T.navy || 0.62);
  if (u.type === 'siege') v *= 0.9;
  return v;
}

function comp(side) {
  const c = {}; let tot = 0;
  side.units.forEach(u => { if (u.troops > 0) { c[u.type] = (c[u.type] || 0) + u.troops; tot += u.troops; } });
  return {c, tot};
}
function counterMult(a, d) {
  const A = comp(a), D = comp(d);
  if (!A.tot || !D.tot) return 1;
  let m = 0;
  Object.keys(A.c).forEach(i => Object.keys(D.c).forEach(j => {
    let k = 1;
    if (UNITS[i].strong === j) k = 1.32;
    else if (UNITS[i].weak === j) k = 0.80;
    m += (A.c[i] / A.tot) * (D.c[j] / D.tot) * k;
  }));
  return m;
}
function sidePower(side, B) {
  let p = 0;
  side.units.forEach(u => { if (u.troops > 0) p += unitPower(u, B, side); });
  return p * (side.luck || 1);
}
function sideTroops(side) { return side.units.reduce((s, u) => s + Math.max(0, u.troops), 0); }
function sideLeader(side) {
  let best = null;
  side.units.forEach(u => { const g = genByName(u.gen); if (g && (!best || (g.lead + g.int) > (best.lead + best.int))) best = g; });
  return best;
}

/* ---------- 부대 편성 ---------- */
function autoCompose(p, fid, ratio, excludeGov) {
  const gs = provGens(p.id).filter(g => g.faction === fid && g.status === 'ok' && g.hurt === 0);
  if (!gs.length) return [];
  gs.sort((a, b) => (b.lead * 0.6 + b.war * 0.4) - (a.lead * 0.6 + a.war * 0.4));
  const use = gs.slice(0, Math.min(5, gs.length));
  let total = Math.floor(p.troops * ratio);
  const units = [];
  const f = fOf(fid);
  use.forEach((g, i) => {
    const share = i === 0 ? 0.34 : (0.66 / Math.max(1, use.length - 1));
    let n = Math.floor(total * share);
    const cmd = rankOf(g).cmd;
    n = Math.min(n, cmd);
    if (n < 200) return;
    units.push({gen:g.name, troops:n, type:bestType(g, p, f), train:p.train, morale:70 + (g.cha - 60) / 6,
      weapon:p.weapon, armor:p.armor, init:n});
  });
  return units;
}
function bestType(g, p, f) {
  const opts = ['foot', 'bow', 'cav', 'navy', 'siege'];
  if (f && f.bonus.gunOK) opts.push('gun');
  if (f && f.bonus.eleOK) opts.push('ele');
  let best = 'foot', bv = -1;
  opts.forEach(t => {
    if (t === 'cav' && p.horses < 600) return;
    if (t === 'navy' && p.ships < 300) return;
    if (t === 'ele' && ['vn','cn'].indexOf(f.region) < 0) return;
    let v = APT_MULT[aptOf(g, t)] * UNITS[t].base * (1 + sfx(g, t));
    if (t === 'siege') v *= 0.7;
    if (v > bv) { bv = v; best = t; }
  });
  return best;
}

/* ---------- 출병 ---------- */
function launchAttack(fid, fromId, toId, plan, auto) {
  const from = PROV_BY_ID[fromId], to = PROV_BY_ID[toId];
  if (!from || !to || from.owner !== fid) return null;
  const link = ADJ[fromId].find(a => a.to === toId); if (!link) return null;
  const f = fOf(fid);
  let units;
  if (plan && plan.units && plan.units.length) units = plan.units.map(u => Object.assign({}, u, {init:u.troops}));
  else {
    units = autoCompose(from, fid, 0.78);
    if (units.length) {
      // 해로 상륙은 수군, 성벽이 높으면 한 부대를 공성으로 돌린다
      if (link.t === 'sea' && ['coast','island','river'].indexOf(to.t) >= 0)
        units.forEach(u => { const g = genByName(u.gen); if (g && aptOf(g, 'navy') !== 'C') u.type = 'navy'; });
      if (to.wall > 50) {
        let worst = 0;
        units.forEach((u, i) => { const g = genByName(u.gen); if (g && g.lead < (genByName(units[worst].gen) || {lead:99}).lead) worst = i; });
        units[worst].type = 'siege';
        if (units.length > 3) units[units.length - 1].type = 'siege';
      }
    }
  }
  if (!units.length) return null;
  const used = units.reduce((s, u) => s + u.troops, 0);
  if (used > from.troops) return null;
  from.troops -= used;
  if (link.t === 'sea') { const need = Math.ceil(used / 22); from.ships = Math.max(0, from.ships - Math.min(from.ships, need)); }
  units.forEach(u => { const g = genByName(u.gen); if (g) { g.acted = true; g.loc = toId; } });
  const B = makeBattle(fid, units, to, from, link.t);
  const playerIn = (S.player.mode === 'lord' && (fid === S.player.faction || to.owner === S.player.faction))
    || (S.player.gen && units.some(u => u.gen === S.player.gen))
    || (S.player.gen && provGens(toId).some(g => g.name === S.player.gen));
  if (!auto && playerIn) { (S.pendingBattles = S.pendingBattles || []).push(B); return B; }
  autoResolve(B);
  return B;
}

function makeBattle(fid, units, to, from, linkType) {
  const dfid = to.owner;
  let dUnits = [];
  if (dfid) {
    dUnits = autoCompose(to, dfid, 0.95);
    if (!dUnits.length && to.troops > 0) dUnits = [{gen:(provGens(to.id)[0] || {name:'—'}).name, troops:to.troops, type:'foot',
      train:to.train, morale:64, weapon:to.weapon, armor:to.armor, init:to.troops}];
  } else if (to.troops > 0) {
    dUnits = [{gen:'—', troops:to.troops, type:'foot', train:to.train, morale:58, weapon:1, armor:1, init:to.troops}];
  }
  const B = {
    prov: to, from: from, link: linkType, round: 1, maxRound: 15, log: [], over: false, result: null,
    atk: {fid, units, tactic:'charge', morale:0, awe:false, name: fOf(fid).name},
    def: {fid: dfid, units: dUnits, tactic:'hold', morale:0, awe:false, name: dfid ? fOf(dfid).name : '토착민'},
    wall: to.wall, wall0: to.wall, sortie: false
  };
  B.atk.morale = avgMorale(B.atk); B.def.morale = avgMorale(B.def);
  B.atk.luck = rnd(0.86, 1.14); B.def.luck = rnd(0.86, 1.14);   // 전기(戰機)
  B.atk.troops0 = sideTroops(B.atk); B.def.troops0 = sideTroops(B.def);
  blog(B, `【${to.name} 공방전】 ${B.atk.name} ${B.atk.troops0}명 → ${B.def.name} ${B.def.troops0}명 · 성벽 ${B.wall} · 지형 ${TERRAIN[to.t].n}`);
  return B;
}
function avgMorale(side) {
  const t = sideTroops(side); if (!t) return 0;
  return side.units.reduce((s, u) => s + u.morale * Math.max(0, u.troops), 0) / t;
}
function blog(B, m, k) { B.log.push({m, k: k || ''}); }

/* ---------- 라운드 ---------- */
function aiTactic(side, foe, B, isDef) {
  const g = sideLeader(side);
  const opts = [];
  const ranged = side.units.some(u => u.type === 'bow' || u.type === 'gun');
  const T = TERRAIN[B.prov.t];
  if (isDef && B.wall > 0) opts.push(['hold', 80]);
  opts.push(['charge', 50 + (g ? g.war / 3 : 0) + (side.morale > 75 ? 15 : 0)]);
  opts.push(['hold', 40 + (side.morale < 45 ? 30 : 0)]);
  if (ranged) opts.push(['volley', 55]);
  if (g && g.int > 72) opts.push(['flank', 52 + g.int / 5]);
  if (g && (T.ambush || 0) > 1 && !isDef) opts.push(['ambush', 40 + sfx(g, 'ambush') * 60]);
  if (g && g.int > 76 && Math.random() < 0.5) opts.push([['fire','confuse','flood'][ri(0,2)], 50 + g.int / 4]);
  if (side.morale < 26 && !isDef) opts.push(['retreat', 95]);
  opts.sort((a, b) => b[1] * rnd(0.75, 1.25) - a[1] * rnd(0.75, 1.25));
  let t = opts[0][0];
  if (t === 'flood' && ['river','coast','island'].indexOf(B.prov.t) < 0) t = 'fire';
  return t;
}

function plotResolve(B, side, foe, tac) {
  const g = sideLeader(side), fg = sideLeader(foe);
  if (!g) return;
  const key = tac === 'fire' ? 'fire' : tac === 'flood' ? 'flood' : 'confuse';
  const atk = g.int * (1 + sfx(g, 'plot') + sfx(g, key) * 0.6 + fx(side.fid, key) * 0.5);
  const dfv = (fg ? fg.int * (1 + sfx(fg, 'plot') + sfx(fg, 'augur')) : 40) * 0.9;
  const pr = clamp(atk / (atk + dfv) * 0.95, 0.06, 0.94);
  const name = tac === 'fire' ? '화계' : tac === 'flood' ? '수공' : '교란';
  if (Math.random() < pr) {
    if (key === 'confuse') {
      foe.morale = clamp(foe.morale - ri(14, 26), 0, 100); foe.confused = 2;
      blog(B, `${g.name}의 ${name}이 성공! ${foe.name}군이 혼란에 빠졌다 (사기 ${Math.round(foe.morale)})`, 'good');
    } else {
      const mult = key === 'fire' ? 1 + sfx(g, 'fire') + fx(side.fid, 'fire') : 1 + sfx(g, 'flood');
      let lost = 0;
      foe.units.forEach(u => { const d = Math.round(u.troops * rnd(0.07, 0.15) * mult); u.troops -= d; lost += d; });
      foe.morale = clamp(foe.morale - ri(8, 18), 0, 100);
      blog(B, `${g.name}의 ${name}이 적중! ${foe.name}군 ${lost}명 소실`, 'good');
    }
  } else {
    blog(B, `${g.name}의 ${name}이 간파되었다. 아군 사기가 떨어진다`, 'bad');
    side.morale = clamp(side.morale - ri(5, 12), 0, 100);
  }
}

function battleRound(B, tacA, tacD) {
  if (B.over) return;
  B.atk.tactic = tacA || 'charge';
  B.def.tactic = tacD || aiTactic(B.def, B.atk, B, true);
  blog(B, `── 제 ${B.round} 합 ── ${B.atk.name}: ${tacName(B.atk.tactic)} / ${B.def.name}: ${tacName(B.def.tactic)}`, 'hdr');

  // 위압
  [[B.atk, B.def], [B.def, B.atk]].forEach(([s, o]) => {
    if (s.awe) return;
    const g = sideLeader(s); if (!g) return;
    const a = sfx(g, 'awe'); if (a > 0) { o.morale = clamp(o.morale - a, 0, 100); s.awe = true;
      blog(B, `${g.name}의 위압! ${o.name}군 사기 -${a}`); }
  });
  // 철퇴
  if (B.atk.tactic === 'retreat') { finishBattle(B, 'retreat'); return; }
  // 일기토
  if (B.atk.tactic === 'duel' || B.def.tactic === 'duel') {
    const chal = B.atk.tactic === 'duel' ? B.atk : B.def, foe = chal === B.atk ? B.def : B.atk;
    duelInBattle(B, chal, foe);
  }
  // 계략
  if (['fire','flood','confuse'].indexOf(B.atk.tactic) >= 0) plotResolve(B, B.atk, B.def, B.atk.tactic);
  if (['fire','flood','confuse'].indexOf(B.def.tactic) >= 0) plotResolve(B, B.def, B.atk, B.def.tactic);

  const TA = TACTICS.find(t => t.id === B.atk.tactic) || TACTICS[0];
  const TD = TACTICS.find(t => t.id === B.def.tactic) || TACTICS[1];
  const tb = 1 + fx(B.atk.fid, 'tacBonus');
  let pa = sidePower(B.atk, B) * (1 + (TA.atk - 1) * tb) * counterMult(B.atk, B.def);
  let pd = sidePower(B.def, B) * (1 + (TD.atk - 1) * (1 + fx(B.def.fid, 'tacBonus'))) * counterMult(B.def, B.atk);
  // 매복 성공 판정
  if (B.atk.tactic === 'ambush') { const g = sideLeader(B.atk), T = TERRAIN[B.prov.t];
    const pr = clamp(0.3 + (g ? g.int / 300 + sfx(g, 'ambush') : 0) + ((T.ambush || 1) - 1), 0.1, 0.9);
    if (Math.random() < pr) { pa *= 1.35; blog(B, '매복이 적중했다!', 'good'); }
    else { pa *= 0.6; blog(B, '매복이 발각되어 역으로 노출되었다', 'bad'); } }
  // 성벽
  const wallB = B.wall > 0 && !B.sortie ? 1 + (B.wall / 250) * 1.45 : 1;
  const defGuard = (1 + (TD.def - 1)) * wallB * (1 + sfx(sideLeader(B.def), 'defend'));
  const atkGuard = (1 + (TA.def - 1));
  if (B.atk.confused) { pa *= 0.75; B.atk.confused--; }
  if (B.def.confused) { pd *= 0.75; B.def.confused--; }

  // 공격력/방어력을 분리: (내 공격력 / 적 방어태세) 대비 (적 공격력 / 내 방어태세)
  const ratio = clamp((pa / defGuard) / Math.max(1, pd / atkGuard), 0.06, 16);
  B.lastRatio = ratio;
  const rate = 0.075;
  let lossD = Math.round(sideTroops(B.def) * rate * Math.pow(ratio, 0.85) * rnd(0.85, 1.18)
    * (1 + sfx(sideLeader(B.atk), 'dmg')));
  let lossA = Math.round(sideTroops(B.atk) * rate * Math.pow(1 / ratio, 0.85) * rnd(0.85, 1.18)
    * (1 + sfx(sideLeader(B.def), 'dmg')));
  lossD = Math.min(lossD, Math.round(sideTroops(B.def) * 0.34));
  lossA = Math.min(lossA, Math.round(sideTroops(B.atk) * 0.34));
  distribute(B.def, lossD); distribute(B.atk, lossA);

  // 성벽 파괴
  if (B.wall > 0) {
    const g = sideLeader(B.atk);
    const siegeUnits = B.atk.units.reduce((s, u) => s + (u.type === 'siege' ? u.troops * 2.2 : u.troops * 0.35), 0);
    let wd = Math.round(siegeUnits / 260 * (1 + (g ? sfx(g, 'siege') : 0) + fx(B.atk.fid, 'siege')));
    if (B.atk.tactic === 'charge') wd = Math.round(wd * 1.3);
    wd = Math.round(wd * (1 - (sfx(sideLeader(B.def), 'wallGuard') || 0)));
    B.wall = Math.max(0, B.wall - wd);
    if (wd > 0) blog(B, `성벽 -${wd} (남은 성벽 ${B.wall})${B.wall === 0 ? ' ── 성벽이 무너졌다!' : ''}`);
  }
  // 사기
  const mgA = 1 - (sfx(sideLeader(B.atk), 'moraleGuard') || 0);
  const mgD = 1 - (sfx(sideLeader(B.def), 'moraleGuard') || 0);
  const tA = Math.max(1, B.atk.troops0), tD = Math.max(1, B.def.troops0);
  B.atk.morale = clamp(B.atk.morale - (lossA / tA) * 100 * 0.55 * mgA + (lossD > lossA ? 2.5 : 0), 0, 100);
  B.def.morale = clamp(B.def.morale - (lossD / tD) * 100 * 0.55 * mgD + (lossA > lossD ? 2.5 : 0), 0, 100);
  blog(B, `${B.atk.name} -${lossA} (잔존 ${sideTroops(B.atk)}, 사기 ${Math.round(B.atk.morale)}) / ${B.def.name} -${lossD} (잔존 ${sideTroops(B.def)}, 사기 ${Math.round(B.def.morale)})`);

  // 장수 부상/전사
  [B.atk, B.def].forEach(s => s.units.forEach(u => {
    if (u.troops <= 0) return;
    const g = genByName(u.gen); if (!g) return;
    const foe = s === B.atk ? B.def : B.atk;
    const snipe = sfx(sideLeader(foe), 'snipe');
    if (Math.random() < 0.025 + snipe * 0.5) {
      if (Math.random() < 0.18) { killGen(g, `${B.prov.name} 전투에서 전사`); u.troops = Math.round(u.troops * 0.6); }
      else { g.hurt = ri(1, 3); blog(B, `${g.name}이 부상을 입었다 (${g.hurt}개월)`, 'bad'); }
    }
  }));

  // 종료 판정
  const rA = sideTroops(B.atk), rD = sideTroops(B.def);
  if (rD <= 0 || (B.def.morale <= 18 && B.wall <= 0) || (rD < B.def.troops0 * 0.14 && B.wall <= 0)) { finishBattle(B, 'atkWin'); return; }
  if (rA <= 0 || B.atk.morale <= 16 || rA < B.atk.troops0 * 0.16) { finishBattle(B, 'defWin'); return; }
  B.round++;
  if (B.round > B.maxRound) finishBattle(B, 'timeout');
}
function tacName(id) { const t = TACTICS.find(x => x.id === id); return t ? t.n : id; }

function distribute(side, loss) {
  const tot = sideTroops(side); if (tot <= 0 || loss <= 0) return;
  side.units.forEach(u => { if (u.troops > 0) u.troops = Math.max(0, u.troops - Math.round(loss * u.troops / tot)); });
}

/* ---------- 일기토 ---------- */
function duelPower(g) { return g.war * (1 + sfx(g, 'duel')) + (g.lead * 0.15); }
function duelInBattle(B, side, foe) {
  const a = pickChampion(side), d = pickChampion(foe);
  if (!a || !d) { blog(B, '일기토에 응할 장수가 없다'); return; }
  blog(B, `⚔ 일기토! ${a.name}(무력 ${a.war}) vs ${d.name}(무력 ${d.war})`, 'hdr');
  let ha = 100, hd = 100, rounds = 0;
  while (ha > 0 && hd > 0 && rounds < 8) {
    rounds++;
    const pa = duelPower(a) * rnd(0.75, 1.3), pd = duelPower(d) * rnd(0.75, 1.3);
    if (pa > pd) hd -= Math.round((pa - pd) / 2.2 + 8); else ha -= Math.round((pd - pa) / 2.2 + 8);
  }
  if (ha <= 0 || (hd > 0 && hd > ha)) {
    blog(B, `${d.name}이 ${a.name}을 꺾었다!`, 'bad');
    side.morale = clamp(side.morale - 14, 0, 100); foe.morale = clamp(foe.morale + 8, 0, 100);
    if (Math.random() < 0.28) killGen(a, `${d.name}과의 일기토에서 전사`); else a.hurt = ri(1, 2);
  } else {
    blog(B, `${a.name}이 ${d.name}을 베었다!`, 'good');
    foe.morale = clamp(foe.morale - 14, 0, 100); side.morale = clamp(side.morale + 8, 0, 100);
    if (Math.random() < 0.28) killGen(d, `${a.name}과의 일기토에서 전사`); else d.hurt = ri(1, 2);
    a.merit += 60;
  }
}
function pickChampion(side) {
  let best = null;
  side.units.forEach(u => { if (u.troops <= 0) return; const g = genByName(u.gen);
    if (g && g.status === 'ok' && (!best || duelPower(g) > duelPower(best))) best = g; });
  return best;
}

/* ---------- 종료 처리 ---------- */
function finishBattle(B, res) {
  B.over = true; B.result = res;
  const to = B.prov, from = B.from;
  const surviveA = sideTroops(B.atk), surviveD = sideTroops(B.def);
  to.wall = B.wall;
  if (res === 'atkWin') {
    blog(B, `【승리】${B.atk.name}이 ${to.name}을 함락시켰다!`, 'big');
    const oldOwner = to.owner;
    // 패자 장수 처리
    const prisoners = [];
    B.def.units.forEach(u => {
      const g = genByName(u.gen); if (!g || g.status !== 'ok') return;
      const esc = oldOwner ? factionProv(oldOwner).filter(p => p.id !== to.id) : [];
      const r = Math.random();
      if (esc.length && r < 0.62) { g.loc = pick(esc).id; }
      else if (r < 0.9) { prisoners.push(g); }
      else { killGen(g, `${to.name} 함락 중 전사`); }
    });
    provGens(to.id).forEach(g => { if (g.faction === oldOwner && prisoners.indexOf(g) < 0) {
      const esc = factionProv(oldOwner).filter(p => p.id !== to.id);
      if (esc.length) g.loc = pick(esc).id; else prisoners.push(g); } });
    to.owner = B.atk.fid; to.gov = null;
    to.troops = surviveA;
    to.order = clamp(to.order - 25, 0, 100); to.mood = clamp(to.mood - 18, 0, 100);
    to.train = Math.round(B.atk.units.reduce((s, u) => s + u.train * Math.max(0, u.troops), 0) / Math.max(1, surviveA));
    to.weapon = Math.max(to.weapon, B.atk.units[0] ? B.atk.units[0].weapon : 1);
    B.atk.units.forEach(u => { const g = genByName(u.gen); if (g && g.status === 'ok') { g.loc = to.id; g.merit += 40 + Math.round(u.init / 200); } });
    const lead = sideLeader(B.atk); if (lead) { lead.merit += 90; if (!to.gov) to.gov = lead.name; checkPromote(lead); }
    B.prisoners = prisoners;
    prisoners.forEach(g => { g.captured = B.atk.fid; g.loc = to.id; });
    logMsg(`【함락】${B.atk.name}이 ${to.name}을(를) 점령했다. (잔존 ${surviveA})`, 'big');
    syncFactionProv();
  } else if (res === 'defWin' || res === 'retreat' || res === 'timeout') {
    blog(B, res === 'retreat' ? `【철퇴】${B.atk.name}이 물러났다.` : `【방어 성공】${B.def.name}이 ${to.name}을 지켰다!`, 'big');
    from.troops += surviveA;
    B.atk.units.forEach(u => { const g = genByName(u.gen); if (g && g.status === 'ok') g.loc = from.id; });
    to.troops = surviveD;
    const lead = sideLeader(B.def); if (lead) { lead.merit += 70; checkPromote(lead); }
    logMsg(`${to.name} 공방전 — ${B.def.name}의 방어 성공 (공격군 잔존 ${surviveA})`, '', B.def.fid);
  }
  // 잔존 병력 반영
  if (res !== 'atkWin' && B.def.fid) to.troops = surviveD;
  to.troops = Math.max(0, to.troops);
}

function autoResolve(B) {
  let guard = 0;
  while (!B.over && guard++ < 40) {
    battleRound(B, aiTactic(B.atk, B.def, B, false), aiTactic(B.def, B.atk, B, true));
  }
  if (!B.over) finishBattle(B, 'timeout');
  // 포로 AI 처리
  if (B.prisoners && B.prisoners.length && B.atk.fid !== S.player.faction) {
    B.prisoners.forEach(g => aiPrisoner(g, B.atk.fid));
  }
}
function aiPrisoner(g, fid) {
  const f = fOf(fid); if (!f) return;
  const ruler = genByName(f.ruler);
  const pr = clamp(0.25 + (ruler ? (ruler.cha - 60) / 200 : 0) + (100 - g.faith) / 260, 0.05, 0.9);
  g.captured = null;
  if (Math.random() < pr) { joinFaction(g, fid, g.loc, clamp(40 + Math.round(g.faith / 4), 25, 75));
    logMsg(`${g.name}이 ${f.name}에 항복하여 등용되었다.`, '', fid); }
  else if (Math.random() < 0.22) { killGen(g, `${f.name}에게 처형`); }
  else { const alt = PROVINCES.filter(p => !p.owner); g.faction = null; g.rank = 0; g.loyal = 0;
    g.loc = (alt.length ? pick(alt) : pick(PROVINCES)).id;
    logMsg(`${g.name}이 석방되어 재야로 떠났다.`, '', fid); }
}

/* ---------- 설전(舌戰) ---------- */
function debate(a, d) {
  let ha = 100, hd = 100, r = 0; const log = [];
  const pw = g => g.int * 0.7 + g.pol * 0.2 + g.cha * 0.1 + sfx(g, 'persuade') * 40;
  while (ha > 0 && hd > 0 && r < 6) {
    r++;
    const x = pw(a) * rnd(0.7, 1.35), y = pw(d) * rnd(0.7, 1.35);
    if (x > y) { hd -= Math.round((x - y) / 2 + 10); log.push(`${a.name}의 논변이 ${d.name}을 몰아붙인다`); }
    else { ha -= Math.round((y - x) / 2 + 10); log.push(`${d.name}이 ${a.name}의 말을 되받아친다`); }
  }
  return {win: hd <= 0 || hd < ha, log};
}
