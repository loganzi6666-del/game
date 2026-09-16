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
  return p * (side.luck || 1) * (side.bond || 1);
}
/* 의형제·혈연이 같은 군에 있으면 결속, 라이벌이 마주 보면 투지가 오른다 */
function bondBonus(B) {
  [[B.atk, B.def], [B.def, B.atk]].forEach(([s2, o]) => {
    const mine = s2.units.map(u => u.gen), foes = o.units.map(u => u.gen);
    let b = 0, notes = [];
    for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) {
      const t = bondOf(mine[i], mine[j]);
      if (t === 'oath') { b += 0.05; notes.push(`${mine[i]}·${mine[j]} 의형제`); }
      else if (t === 'kin') { b += 0.035; notes.push(`${mine[i]}·${mine[j]} 혈연`); }
      else if (t === 'mentor') { b += 0.03; notes.push(`${mine[i]}·${mine[j]} 사제`); }
    }
    mine.forEach(m => foes.forEach(f2 => {
      if (bondOf(m, f2) === 'rival') { b += 0.045; notes.push(`${m} ↔ ${f2} 숙적`); }
    }));
    s2.bond = 1 + Math.min(0.16, b);
    if (notes.length) blog(B, `${s2.name}군 결속 — ${notes.slice(0, 3).join(', ')} (전력 +${Math.round((s2.bond - 1) * 100)}%)`, 'good');
  });
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
  // 군량 수송 — 출병에는 병력만큼 식량과 금이 든다
  const cost = campaignCost(used, link.t);
  if (f.food < cost.food || f.gold < cost.gold) return null;
  f.food -= cost.food; f.gold -= cost.gold;
  from.troops -= used;
  if (link.t === 'sea') { const need = Math.ceil(used / 22); from.ships = Math.max(0, from.ships - Math.min(from.ships, need)); }
  units.forEach(u => { const g = genByName(u.gen); if (g) { g.acted = true; g.loc = toId; } });
  const B = makeBattle(fid, units, to, from, link.t);
  B.cost = cost;
  const playerIn = (S.player.mode === 'lord' && (fid === S.player.faction || to.owner === S.player.faction))
    || (S.player.gen && units.some(u => u.gen === S.player.gen))
    || (S.player.gen && provGens(toId).some(g => g.name === S.player.gen));
  if (!auto && playerIn) { (S.pendingBattles = S.pendingBattles || []).push(B); return B; }
  autoResolve(B);
  return B;
}

function campaignCost(troops, link) {
  const far = link === 'sea' ? 1.3 : (link === 'mountain' || link === 'jungle' ? 1.2 : 1);
  return {food: Math.round(troops * 0.45 * far), gold: Math.round(troops * 0.08 * far)};
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
  // 반패권 연합 — 맹약군은 결속하고, 표적은 사면초가에 몰린다
  if (typeof inCoalitionVs === 'function') {
    if (inCoalitionVs(fid, dfid)) { B.atk.luck *= 1.10; B.def.luck *= 0.93; B.coal = 1; }
    else if (inCoalitionVs(dfid, fid)) { B.def.luck *= 1.08; B.atk.luck *= 0.95; B.coal = -1; }
  }
  // 배수진 — 마지막 남은 성은 죽기로 싸운다
  const ls = lastStand(to);
  if (ls > 1) { B.def.luck *= ls; B.def.morale = clamp(B.def.morale + (ls > 1.15 ? 14 : 7), 0, 100); B.lastStand = ls; }
  B.atk.troops0 = sideTroops(B.atk); B.def.troops0 = sideTroops(B.def);
  blog(B, `【${to.name} 공방전】 ${B.atk.name} ${B.atk.troops0}명 → ${B.def.name} ${B.def.troops0}명 · 성벽 ${B.wall} · 지형 ${TERRAIN[to.t].n}`);
  if (B.cost) blog(B, `군량 수송 — 식량 ${B.cost.food.toLocaleString()} · 금 ${B.cost.gold.toLocaleString()} 소모`);
  if (B.coal === 1) blog(B, '연합군의 맹약 — 표적을 향한 결의가 굳다', 'good');
  if (B.lastStand) blog(B, '배수진 — 수비군은 물러설 곳이 없다', 'bad');
  bondBonus(B);
  B.reinf = {atk:0, def:0};
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
      bump(g, 'plotWin');
    } else {
      const mult = key === 'fire' ? 1 + sfx(g, 'fire') + fx(side.fid, 'fire') : 1 + sfx(g, 'flood');
      let lost = 0;
      foe.units.forEach(u => { const d = Math.round(u.troops * rnd(0.07, 0.15) * mult); u.troops -= d; lost += d; });
      foe.morale = clamp(foe.morale - ri(8, 18), 0, 100);
      blog(B, `${g.name}의 ${name}이 적중! ${foe.name}군 ${lost}명 소실`, 'good');
      bump(g, 'plotWin');
    }
  } else {
    blog(B, `${g.name}의 ${name}이 간파되었다. 아군 사기가 떨어진다`, 'bad');
    side.morale = clamp(side.morale - ri(5, 12), 0, 100);
  }
}

/* 인접 아군 도시에서 원군이 달려온다 (4합·8합) */
function checkReinforce(B) {
  if (!B.reinf) B.reinf = {atk:0, def:0};
  if (B.round !== 4 && B.round !== 8) return;
  [['def', B.def], ['atk', B.atk]].forEach(([k, side]) => {
    if (!side.fid || B.reinf[k] >= (B.round === 4 ? 1 : 2)) return;
    const from = k === 'def'
      ? factionProv(side.fid).filter(p => p.id !== B.prov.id && ADJ[p.id].some(a => a.to === B.prov.id) && p.troops > 1600)
      : factionProv(side.fid).filter(p => p.id !== B.prov.id && ADJ[p.id].some(a => a.to === B.from.id || a.to === B.prov.id) && p.troops > 1600);
    if (!from.length) return;
    if (Math.random() > 0.55) return;
    from.sort((a, b) => b.troops - a.troops);
    const src = from[0];
    const gs = provGens(src.id).filter(g => g.faction === side.fid && g.status === 'ok' && g.hurt === 0);
    if (!gs.length) return;
    gs.sort((a, b) => (b.lead * 0.6 + b.war * 0.4) - (a.lead * 0.6 + a.war * 0.4));
    const g = gs[0];
    const n = Math.min(Math.floor(src.troops * 0.4), rankOf(g).cmd);
    if (n < 500) return;
    src.troops -= n;
    g.acted = true; g.loc = B.prov.id;
    side.units.push({gen:g.name, troops:n, type:bestType(g, src, fOf(side.fid)), train:src.train,
      morale:Math.min(100, side.morale + 18), weapon:src.weapon, armor:src.armor, init:n});
    side.morale = clamp(side.morale + 9, 0, 100);
    B.reinf[k]++;
    side.troops0 += Math.round(n * 0.5);
    blog(B, `★ 원군 도착! ${src.name}에서 ${g.name}이 ${n.toLocaleString()}명을 이끌고 달려왔다 (사기 +9)`, 'big');
    bondBonus(B);
  });
}

function battleRound(B, tacA, tacD) {
  if (B.over) return;
  checkReinforce(B);
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
  if (S.cheat && S.cheat.god) {                       // 天機 — 전투 무적
    const me = B.atk.fid === S.player.faction ? 'atk' : (B.def.fid === S.player.faction ? 'def' : null);
    if (me === 'atk') { lossA = 0; lossD = Math.round(lossD * 3 + 400); B.atk.morale = 100; }
    else if (me === 'def') { lossD = 0; lossA = Math.round(lossA * 3 + 400); B.def.morale = 100; }
  }
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

/* ---------- 일기토(一騎討) ---------- */
function duelPower(g) { return g.war * (1 + sfx(g, 'duel')) + g.lead * 0.15; }
const DUEL_MOVES = {
  strike: {n:'강공(强攻)', atk:1.00, def:1.00, d:'정면으로 맞선다 — 균형'},
  guard:  {n:'견제(牽制)', atk:0.48, def:1.70, d:'거리를 두고 받아넘긴다 — 피해 최소'},
  finish: {n:'필살(必殺)', atk:1.62, def:0.52, d:'전부를 실은 일격 — 성공하면 결판, 헛치면 크게 노출된다'}
};
function duelStart(B, side, foe) {
  const a = pickChampion(side), d = pickChampion(foe);
  if (!a || !d) return null;
  return {B, side, foe, a, d, ha:100, hd:100, round:0, log:[
    `${a.name}(무력 ${a.war}${a.title ? ' · ' + a.title.n : ''}) 가 ${d.name}(무력 ${d.war}${d.title ? ' · ' + d.title.n : ''}) 에게 단기 승부를 청한다!`
  ], over:false, winner:null};
}
function aiDuelMove(D, forFoe) {
  const me = forFoe ? D.d : D.a, hp = forFoe ? D.hd : D.ha, ehp = forFoe ? D.ha : D.hd;
  if (ehp <= 32 && me.war > 78) return 'finish';
  if (hp <= 30) return Math.random() < 0.6 ? 'guard' : 'strike';
  if (me.int > 75 && Math.random() < 0.3) return 'guard';
  return Math.random() < 0.26 ? 'finish' : 'strike';
}
function duelStep(D, myMove) {
  if (D.over) return D;
  D.round++;
  const mm = DUEL_MOVES[myMove] || DUEL_MOVES.strike;
  const em = DUEL_MOVES[aiDuelMove(D, true)];
  const pa = duelPower(D.a) * mm.atk * rnd(0.60, 1.48);
  const pd = duelPower(D.d) * em.atk * rnd(0.60, 1.48);
  let toD = Math.max(0, Math.round((pa - duelPower(D.d) * em.def * 0.42) / 4.2));
  let toA = Math.max(0, Math.round((pd - duelPower(D.a) * mm.def * 0.42) / 4.2));
  // 필살은 헛치면 되받아 맞는다
  if (myMove === 'finish' && Math.random() < 0.3) { toD = Math.round(toD * 0.25); toA = Math.round(toA * 1.5);
    D.log.push(`　${D.a.name}의 필살이 허공을 갈랐다!`); }
  if (em === DUEL_MOVES.finish && Math.random() < 0.3) { toA = Math.round(toA * 0.25); toD = Math.round(toD * 1.5);
    D.log.push(`　${D.d.name}의 필살이 빗나갔다!`); }
  D.hd -= toD; D.ha -= toA;
  const verb = v => v >= 26 ? '깊이 베였다' : v >= 14 ? '큰 타격' : v >= 5 ? '스쳤다' : '막아냈다';
  D.log.push(`제 ${D.round} 합 — ${D.a.name} ${mm.n} / ${D.d.name} ${em.n}`);
  D.log.push(`　${D.d.name} ${verb(toD)} (-${toD})　｜　${D.a.name} ${verb(toA)} (-${toA})`);
  if (D.ha <= 0 || D.hd <= 0 || D.round >= 12) {
    D.over = true;
    D.winner = (D.hd <= 0 && D.ha <= 0) ? (D.ha > D.hd ? 'a' : 'd') : (D.hd <= 0 ? 'a' : (D.ha <= 0 ? 'd' : (D.ha >= D.hd ? 'a' : 'd')));
    if (D.round >= 12 && D.ha > 0 && D.hd > 0) D.draw = Math.abs(D.ha - D.hd) < 15;
  }
  return D;
}
function duelEnd(D) {
  const B = D.B, side = D.side, foe = D.foe, a = D.a, d = D.d;
  if (D.draw) {
    blog(B, `⚔ ${a.name}과 ${d.name}은 수십 합을 겨루고도 승부를 가리지 못했다. 양군의 함성이 하늘을 찌른다.`, 'hdr');
    side.morale = clamp(side.morale + 4, 0, 100); foe.morale = clamp(foe.morale + 4, 0, 100);
    D.log.push('승부를 가리지 못했다 — 양군 사기 +4');
    return D;
  }
  const win = D.winner === 'a' ? a : d, lose = D.winner === 'a' ? d : a;
  const winSide = D.winner === 'a' ? side : foe, loseSide = D.winner === 'a' ? foe : side;
  blog(B, `⚔ 일기토 — ${win.name}이 ${lose.name}을 꺾었다!`, D.winner === 'a' ? 'good' : 'bad');
  winSide.morale = clamp(winSide.morale + 10, 0, 100);
  loseSide.morale = clamp(loseSide.morale - 15, 0, 100);
  win.merit += 70; bump(win, 'duelWin');
  if (Math.random() < 0.20) { killGen(lose, `${win.name}과의 일기토에서 전사`); D.killed = 1; }
  else { lose.hurt = ri(1, 2); D.hurt = 1; }
  D.log.push(`${win.name}의 승리! (공적 +70${D.killed ? ` · ${lose.name} 전사` : ` · ${lose.name} 부상`})`);
  return D;
}
/* AI 자동 일기토 */
function duelInBattle(B, side, foe) {
  const D = duelStart(B, side, foe);
  if (!D) { blog(B, '일기토에 응할 장수가 없다'); return null; }
  blog(B, `⚔ 일기토! ${D.a.name}(무력 ${D.a.war}) vs ${D.d.name}(무력 ${D.d.war})`, 'hdr');
  let g = 0;
  while (!D.over && g++ < 16) duelStep(D, aiDuelMove(D, false));
  duelEnd(D);
  return D;
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
    to.settle = 5;                                 // 전후 수습 — 5개월간 수입 감소·징병 불가
    to.train = Math.round(B.atk.units.reduce((s, u) => s + u.train * Math.max(0, u.troops), 0) / Math.max(1, surviveA));
    to.weapon = Math.max(to.weapon, B.atk.units[0] ? B.atk.units[0].weapon : 1);
    B.atk.units.forEach(u => { const g = genByName(u.gen); if (g && g.status === 'ok') { g.loc = to.id; g.merit += 40 + Math.round(u.init / 200); } });
    const lead = sideLeader(B.atk); if (lead) { lead.merit += 90; if (!to.gov) to.gov = lead.name; checkPromote(lead); }
    B.atk.units.forEach(u => { const g = genByName(u.gen); if (g && g.status === 'ok') bump(g, 'battleWin'); });
    annal(`${B.atk.name}이 ${to.name} 함락`, 'war');
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
    B.def.units.forEach(u => { const g = genByName(u.gen); if (g && g.status === 'ok') { bump(g, 'battleWin'); bump(g, 'defWin'); } });
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
