/* =========================================================
   東亞 群雄割據 — 게임 엔진
   ========================================================= */
'use strict';

const S = {
  year: 190, month: 1, turn: 1,
  factions: {}, gens: [], genIdx: {}, player: {mode:'lord', faction:null, gen:null, fame:0, merit:0},
  log: [], histDone: {}, pending: [], selected: null, gameOver: null, opts: {},
  diff: 'normal', bonds: [], coalition: null, chron: [], annals: [], flags: {}, cheat: {}
};
function DF() { return DIFFS[S.diff] || DIFFS.normal; }
function isMine(fid) { return fid === S.player.faction; }

const rnd = (a, b) => a + Math.random() * (b - a);
const ri  = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function genByName(n) { return S.genIdx[n] || null; }
function fOf(id) { return S.factions[id]; }
function provGens(pid) { return S.gens.filter(g => g.loc === pid && g.faction && g.status === 'ok'); }
function factionGens(fid) { return S.gens.filter(g => g.faction === fid && g.status !== 'dead'); }
function factionProv(fid) { return PROVINCES.filter(p => p.owner === fid); }
function relation(a, b) { if (a === b) return 'self'; const f = fOf(a); return (f && f.rel[b] && f.rel[b].state) || 'none'; }
function relVal(a, b) { const f = fOf(a); return (f && f.rel[b] && f.rel[b].v) || 0; }
function factionHasTech(fid, t) { const f = fOf(fid); return !!(f && f.techs.indexOf(t) >= 0); }

/* ---------- 초기화 ---------- */
function initWorld() {
  S.gens = []; S.genIdx = {}; S.factions = {}; S.log = []; S.histDone = {};
  S.year = 190; S.month = 1; S.turn = 1; S.gameOver = null;

  PROVINCES.forEach(p => { p.owner = null; });

  FACTIONS.forEach(fd => {
    const f = Object.assign({}, fd);
    f.gold = 0; f.food = 0; f.alive = true;
    f.tp = {civ:0, mil:0, dip:0, cul:0};
    f.techs = []; f.rel = {}; f.bonus = {}; f.fame = 0; f.vassalOf = null; f.tax = 1;
    f.prov = fd.prov.slice();
    S.factions[f.id] = f;
  });
  // 관계 초기화
  FACTIONS.forEach(a => FACTIONS.forEach(b => {
    if (a.id === b.id) return;
    const same = a.region === b.region;
    S.factions[a.id].rel[b.id] = { state: 'none', v: same ? ri(-25, 5) : ri(-10, 20), turns: 0 };
  }));
  // 도시 배정 + 초기값
  FACTIONS.forEach(fd => fd.prov.forEach(pid => {
    const p = PROV_BY_ID[pid];
    p.owner = fd.id;
    setupProv(p, true, pid === fd.cap);
  }));
  PROVINCES.filter(p => !p.owner).forEach(p => setupProv(p, false, false));
  // 장수 배치
  FACTIONS.forEach(fd => {
    const list = ROSTER[fd.id] || [];
    list.forEach((row, i) => {
      const g = mkGen(row);
      g.faction = fd.id;
      g.loc = fd.prov[Math.min(i % fd.prov.length, fd.prov.length - 1)];
      if (i === 0) { g.loc = fd.cap; g.rank = 7; g.loyal = 100; }
      else { g.rank = i < 3 ? 3 : (i < 6 ? 2 : 1); g.loyal = clamp(ri(62, 92) + Math.round((g.faith - 50) * 0.3), 30, 100); }
      g.merit = g.rank * 180 + ri(0, 100);
      S.gens.push(g); S.genIdx[g.name] = g;
    });
    // 군주 소재 도시 태수 지정
    const p = PROV_BY_ID[fd.cap]; p.gov = ROSTER[fd.id][0][0];
    fd.prov.forEach(pid => { if (!PROV_BY_ID[pid].gov) { const gs = provGens(pid); if (gs.length) PROV_BY_ID[pid].gov = gs[0].name; } });
  });
  FREE_GENERALS.forEach(row => {
    const g = mkGen(row); g.faction = null; g.loc = row[11]; g.loyal = 0; g.rank = 0; g.merit = 0;
    S.gens.push(g); S.genIdx[g.name] = g;
  });
  FACTIONS.forEach(fd => { const f = fOf(fd.id);
    f.gold = 1400 + f.prov.length * 750; f.food = 9000 + f.prov.length * 5200;
    f.tp = {civ:70, mil:70, dip:55, cul:55};   // 개막 연구점 — 1단 기술을 바로 고를 수 있다
  });
  S.bonds = []; S.coalition = null; S.chron = []; S.annals = []; S.flags = {}; S.cheat = {};
  BOND_PRESET.forEach(([a, b, t]) => addBond(a, b, t));
  Object.values(S.factions).forEach(f => { f.lastIncome = projectIncome(f); });
  snapChron();
}

function setupProv(p, owned, isCap) {
  const k = owned ? (isCap ? 0.62 : 0.5) : 0.34;
  p.agri  = Math.round(p.a * (k + rnd(-0.05, 0.06)));
  p.comm  = Math.round(p.c * (k + rnd(-0.05, 0.06)));
  p.water = Math.round(p.a * 0.4 * k);
  p.wall  = Math.round(p.w * (owned ? (isCap ? 0.68 : 0.55) : 0.4));
  p.pop   = Math.round(p.p * (k + 0.12));
  p.order = owned ? ri(58, 82) : ri(30, 55);
  p.mood  = owned ? ri(55, 80) : ri(35, 60);
  p.troops = owned ? Math.round(p.p * (isCap ? 0.07 : 0.05) * 100) : Math.round(p.p * 12);
  p.train = owned ? ri(35, 62) : ri(15, 35);
  p.weapon = owned ? ri(1, 2) : 1;
  p.armor  = owned ? ri(1, 2) : 1;
  p.horses = Math.round(p.troops * (p.t === 'plain' || p.t === 'plateau' ? 0.22 : 0.10));
  p.ships  = p.port ? Math.round(p.troops * 0.18) : 0;
  p.gov = null; p.unrest = 0; p.settle = 0;
  if (!owned) { p.wall = Math.round(p.w * 0.35); }
}

function mkGen(row) {
  const h = hashStr(row[0]);
  return applyFix({
    name: row[0], han: row[1], lead: row[2], war: row[3], int: row[4], pol: row[5], cha: row[6],
    skills: row[7] ? row[7].split(',') : [], apt: row[8], age: row[9], art: row[10],
    ambition: clamp(30 + (h % 70), 5, 98), faith: clamp(20 + ((h >> 7) % 80), 5, 99),
    faction: null, loc: null, rank: 0, merit: 0, loyal: 0, exp: 0, status: 'ok', hurt: 0,
    acted: false, army: null, fame: Math.round((row[2] + row[3] + row[4] + row[5] + row[6]) / 5), bond: 0,
    st: {duelWin:0, battleWin:0, defWin:0, plotWin:0, civAct:0, recruit:0}, title: null, bonds: []
  });
}
function applyFix(g) { const f = FIX[g.name]; if (f) Object.assign(g, f); return g; }
/* 의리·야망 보정 (고증 캐릭터) */
const FIX = {'관우':{faith:99},'여포':{faith:8,ambition:92},'장비':{faith:95},'조운':{faith:97},'제갈량':{faith:96},
 '마쓰나가 히사히데':{faith:5,ambition:95},'사이토 도산':{faith:20,ambition:90},'아케치 미쓰히데':{faith:35,ambition:78},
 '도쿠가와 이에야스':{ambition:94,faith:45},'김유신':{faith:95},'을지문덕':{faith:94},'이순신':{faith:99},
 '최영':{faith:97},'계백':{faith:98},'쩐흥다오':{faith:96},'정성공':{faith:94},'맹달':{faith:15},'양송':{faith:8},
 '오다 노부나가':{ambition:99,faith:35},'조조':{ambition:97,faith:40},'유비':{ambition:80,faith:88},
 '다케다 신겐':{ambition:88,faith:70},'우에스기 겐신':{ambition:55,faith:96},'호조 우지야스':{ambition:62,faith:80},
 '모리 모토나리':{ambition:86,faith:55},'시마즈 요시히로':{faith:92},'다치바나 도세쓰':{faith:96},
 '다테 마사무네':{ambition:93,faith:50},'기노시타 도키치로':{ambition:96,faith:55},'구로다 간베에':{ambition:80,faith:60},
 '광개토대왕':{ambition:92,faith:80},'김수로':{faith:85},'계백':{faith:98},'양만춘':{faith:92},'온달':{faith:90},
 '연개소문':{ambition:90,faith:55},'흑치상지':{faith:60},'복신':{faith:85},'주유':{faith:93},'손책':{ambition:90,faith:80},
 '태사자':{faith:92},'황충':{faith:94},'강유':{faith:96},'장료':{faith:88},'가후':{faith:30,ambition:45},
 '방덕':{faith:95},'마초':{ambition:85,faith:65},'엄안':{faith:90},'장임':{faith:92},'전위':{faith:97},'허저':{faith:96},
 '순욱':{faith:90},'곽가':{faith:82},'제갈량':{faith:96,ambition:60},'딘보린':{ambition:90,faith:75},
 '레호안':{ambition:88,faith:45},'체 봉 응아':{ambition:94,faith:60},'정성공':{ambition:90,faith:94},
 '카밧치 아슬라미':{faith:88},'샤쿠샤인':{faith:90},'이성계':{ambition:96,faith:40},'최영':{faith:98},
 '정몽주':{faith:99},'서희':{faith:88},'강감찬':{faith:94},'쩐흥다오':{faith:96}};

/* ---------- 효과 계산 ---------- */
function fx(fid, key) {
  const f = fOf(fid); if (!f) return 0;
  let v = f.bonus[key] || 0;
  f.techs.forEach(t => { const e = TECH_BY_ID[t].e; if (e[key]) v += e[key]; });
  return v;
}
function sfx(g, key) {
  let v = 0;
  if (!g) return 0;
  g.skills.forEach(s => { const sk = SKILLS[s]; if (sk && sk.e[key]) v += sk.e[key]; });
  if (g.title && g.title.e && g.title.e[key]) v += g.title.e[key];
  return v;
}
function bump(g, k, n) { if (!g) return; if (!g.st) g.st = {duelWin:0,battleWin:0,defWin:0,plotWin:0,civAct:0,recruit:0};
  g.st[k] = (g.st[k] || 0) + (n || 1); checkTitle(g); }
function checkTitle(g) {
  for (const t of TITLES) {
    let ok = false; try { ok = t.cond(g); } catch (e) { ok = false; }
    if (ok) {
      if (!g.title || g.title.id !== t.id) {
        const had = !!g.title;
        g.title = {id:t.id, n:t.n, e:t.e};
        logMsg(`【칭호】${g.name}이 「${t.n}」의 이름을 얻었다. (${t.d})`, 'good', g.faction);
      }
      return;
    }
  }
}

/* ---------- 인물 관계(의형제·혈연·라이벌) ---------- */
const BOND_PRESET = [
  ['유비','관우','oath'],['유비','장비','oath'],['관우','장비','oath'],
  ['마초','마대','kin'],['조조','조인','kin'],['조조','조홍','kin'],
  ['원소','원담','kin'],['원소','원희','kin'],['원소','원상','kin'],
  ['손책','손권','kin'],['근초고왕','근구수왕','kin'],['연개소문','연남생','kin'],
  ['김유신','김흠순','kin'],['광개토대왕','장수왕','kin'],['사나다 유키타카','사나다 마사유키','kin'],
  ['다케다 신겐','다케다 가쓰요리','kin'],['시마즈 요시히사','시마즈 요시히로','kin'],
  ['시마즈 요시히사','시마즈 도시히사','kin'],['시마즈 요시히사','시마즈 이에히사','kin'],
  ['모리 모토나리','깃카와 모토하루','kin'],['모리 모토나리','고바야카와 다카카게','kin'],
  ['모리 모토나리','모리 다카모토','kin'],['호조 우지야스','호조 우지마사','kin'],
  ['딘보린','딘리엔','kin'],['정성공','정지룡','kin'],['정성공','정경','kin'],
  ['체 봉 응아','체 만','kin'],['카밧치 아슬라미','카밧치 마로아','kin'],
  ['전위','허저','oath'],['하후돈','하후연','kin'],['을지문덕','양만춘','oath'],
  ['계백','성충','oath'],['진흥왕','거칠부','mentor'],['제갈량','방통','rival'],
  ['우에스기 겐신','다케다 신겐','rival'],['오다 노부나가','다케다 신겐','rival'],
  ['조조','유비','rival'],['여포','장비','rival'],['관우','황충','rival'],
  ['마초','허저','rival'],['시마즈 요시히로','다치바나 무네시게','rival'],
  ['김유신','계백','rival'],['광개토대왕','근초고왕','rival'],['딘보린','체 봉 응아','rival'],
  ['정성공','시랑','rival'],['샤쿠샤인','다테 마사무네','rival']
];
function addBond(a, b, t) {
  if (!a || !b || a === b) return;
  if (S.bonds.some(x => (x.a === a && x.b === b) || (x.a === b && x.b === a))) return;
  S.bonds.push({a, b, t});
  const ga = genByName(a), gb = genByName(b);
  if (ga) { ga.bonds = ga.bonds || []; ga.bonds.push({n:b, t}); }
  if (gb) { gb.bonds = gb.bonds || []; gb.bonds.push({n:a, t}); }
}
function bondOf(a, b) {
  const x = S.bonds.find(v => (v.a === a && v.b === b) || (v.a === b && v.b === a));
  return x ? x.t : null;
}
function aptOf(g, type) { return g ? (g.apt[UNITS[type].apt] || 'B') : 'C'; }
function rankOf(g) { return RANKS[clamp(g.rank, 0, 7)]; }
function capOf(p, key) {
  const fid = p.owner, base = {agri:p.a, comm:p.c, water:p.a*0.6, wall:p.w, pop:p.p};
  let m = 1;
  if (key === 'agri') m += fx(fid, 'agriCap');
  if (key === 'comm') m += fx(fid, 'commCap');
  if (key === 'water') m += fx(fid, 'waterCap');
  return Math.round(base[key] * m);
}
function provValue(p) {
  return Math.round(p.agri * 1.1 + p.comm * 1.2 + p.wall * 0.7 + p.pop * 0.4 + p.troops / 100 * 3);
}
function factionPower(fid) {
  const ps = factionProv(fid);
  let v = ps.reduce((s, p) => s + provValue(p), 0);
  const gs = factionGens(fid);
  v += gs.reduce((s, g) => s + (g.lead + g.war + g.int) / 6, 0);
  v += ps.reduce((s, p) => s + p.troops / 40 * (0.6 + p.train / 100), 0);
  return Math.round(v);
}

/* ---------- 세율(稅率) ---------- */
const TAX_RATES = [
  {id:0, n:'경세(輕稅)', r:0.70, mood:+1.6, d:'세를 낮춘다. 수입 70%, 민심이 오른다'},
  {id:1, n:'보통(常稅)', r:1.00, mood:+0.2, d:'표준 세율. 수입 100%'},
  {id:2, n:'중세(重稅)', r:1.35, mood:-1.4, d:'세를 무겁게. 수입 135%, 민심이 내린다'},
  {id:3, n:'가혹(苛稅)', r:1.70, mood:-3.2, d:'짜낸다. 수입 170%, 민심 급락·민란 위험'}
];
function taxOf(f) { return TAX_RATES[clamp(f && f.tax !== undefined ? f.tax : 1, 0, 3)]; }

/* ---------- 통치 부담(統治負擔) ----------
   영지가 넓어지면 관료가 부족해 치안·민심이 흔들리고 군비가 더 든다.
   율령·과거제·양전개혁·중앙집권으로 완화한다. */
function strain(fid) {
  const n = factionProv(fid).length;
  if (n <= 11) return 0;
  const ease = Math.min(0.85, fx(fid, 'ruleEase') + fx(fid, 'orderCap') / 260);
  return (n - 11) * 0.115 * (1 - ease);
}
function annal(m, kind) {
  S.annals.unshift({y:S.year, mo:S.month, m, kind: kind || ''});
  if (S.annals.length > 200) S.annals.pop();
}
function snapChron() {
  const row = {y:S.year, f:{}};
  Object.values(S.factions).forEach(f => { const n = factionProv(f.id).length; if (n) row.f[f.id] = n; });
  S.chron.push(row);
  if (S.chron.length > 220) S.chron.shift();
}

/* ---------- 반패권 연합(反霸權聯合) ----------
   한 세력이 지나치게 커지면 나머지가 맹약을 맺고 함께 친다. */
function coalitionCheck() {
  const total = PROVINCES.length;
  const list = Object.values(S.factions).filter(f => f.alive)
    .map(f => ({f, n:factionProv(f.id).length})).sort((a, b) => b.n - a.n);
  if (!list.length) return;
  const top = list[0];
  const thr = Math.max(7, Math.round(total * 0.145 * DF().coalition));
  if (S.coalition && S.coalition.target) {
    const t = fOf(S.coalition.target);
    const n = t && t.alive ? factionProv(t.id).length : 0;
    if (!t || !t.alive || n < thr - 2) {
      logMsg(`【연합 해산】${t ? t.name : '패자'}를 향한 맹약이 풀렸다.`, 'big');
      annal(`반패권 연합 해산`, 'dip');
      S.coalition = null;
    } else {
      // 유지 중 — 매달 관계 악화와 참전 압박
      S.coalition.members = S.coalition.members.filter(m => fOf(m) && fOf(m).alive);
      S.coalition.members.forEach(m => {
        const f = fOf(m); if (!f) return;
        const r = f.rel[t.id]; if (!r) return;
        r.v = clamp(r.v - 2, -100, 100); t.rel[m].v = r.v;
        if (r.state !== 'war' && Math.random() < 0.25) {
          r.state = 'war'; t.rel[m].state = 'war';
          logMsg(`【연합】${f.name}이 맹약에 따라 ${t.name}에 출병한다!`, 'bad');
        }
      });
      return;
    }
  }
  if (top.n < thr) return;
  const guard = fx(top.f.id, 'coalitionGuard');
  if (Math.random() < guard * 0.6) return;
  const members = list.slice(1).filter(x => x.n >= 1 && relation(x.f.id, top.f.id) !== 'vassal').map(x => x.f.id);
  if (members.length < 3) return;
  S.coalition = {target: top.f.id, members, since: S.turn};
  members.forEach(m => {
    const f = fOf(m); const r = f.rel[top.f.id];
    r.v = clamp(r.v - 30, -100, 100); top.f.rel[m].v = r.v;
    if (Math.random() < 0.55) { r.state = 'war'; top.f.rel[m].state = 'war'; }
    members.forEach(o => { if (o !== m) { const rr = f.rel[o]; if (rr) { rr.v = clamp(rr.v + 25, -100, 100);
      if (rr.state === 'war' && Math.random() < 0.7) { rr.state = 'none'; fOf(o).rel[m].state = 'none'; } } } });
  });
  logMsg(`【반패권 연합】천하의 제후 ${members.length}세력이 ${top.f.name} 타도를 맹약했다!`, 'big');
  annal(`${top.f.name} 타도 반패권 연합 결성 (${members.length}세력)`, 'war');
  S.pending.push({type:'coalition', title:'反霸權聯合 — 반패권 연합',
    text:`${top.f.name}이 ${top.n}개 주군을 차지하자, 남은 제후들이 한자리에 모여 맹약을 맺었다.<br>
      「홀로 커진 자를 함께 친다.」<br><br>연합 참가 — ${members.map(m => fOf(m).name).join(' · ')}`});
}
function inCoalitionVs(aid, did) {
  if (!S.coalition) return false;
  return S.coalition.target === did && S.coalition.members.indexOf(aid) >= 0;
}

/* ---------- 경제 / 정산 ---------- */
/* 도시 세수 명세 — 상업세·인구세(丁稅)·농지세 + 교역 보정 */
function provTaxParts(p) {
  const fid = p.owner;
  if (!fid) return {comm:0, head:0, land:0, trade:1, total:0};
  const f = fOf(fid);
  const gov = p.gov ? genByName(p.gov) : null;
  const govM = gov ? 1 + (gov.pol - 55) / 240 + sfx(gov, 'income') : 1;
  const dm = (isMine(fid) ? DF().myGold : DF().aiGold) * (p.settle > 0 ? 0.45 : 1);
  const rate = taxOf(f).r;
  const comm = p.comm * 1.35 * (0.45 + p.order / 190);        // 상업세 — 치안이 곧 징세력
  const head = p.pop * 1.20 * (0.5 + p.mood / 200);           // 인구세 — 민심이 곧 납세
  const land = p.agri * 0.34;                                  // 농지세
  const trade = 1 + (p.port ? 0.12 : 0) + (p.big ? 0.14 : 0) + fx(fid, 'income');
  const m = rate * trade * govM * dm;
  return {
    comm: Math.round(comm * m), head: Math.round(head * m), land: Math.round(land * m),
    trade, rate, govM: govM, settle: p.settle > 0,
    total: Math.round((comm + head + land) * m)
  };
}
function provIncome(p) { return provTaxParts(p).total; }
/* 아직 정산 전(개막·거병 직후)에도 명세를 보여주기 위한 예상 계산 */
function projectIncome(f) {
  const ps = factionProv(f.id);
  const gold = ps.reduce((s2, p) => s2 + provIncome(p), 0);
  const payDue = factionGens(f.id).filter(g => g.status === 'ok').reduce((s2, g) => s2 + rankOf(g).pay, 0);
  const upkeep = Math.round(ps.reduce((s2, p) => s2 + p.troops * 0.013 * (1 + fx(f.id, 'upkeep')), 0) * (1 + strain(f.id) * 0.9));
  return {gold, pay:payDue, payDue, upkeep, net: gold - payDue - upkeep, food:0,
    eat: Math.round(ps.reduce((s2, p) => s2 + p.troops * 0.02, 0)), tax: taxOf(f).n, strain: strain(f.id), proj:1};
}

function provHarvest(p) {
  const fid = p.owner;
  const gov = p.gov ? genByName(p.gov) : null;
  const govM = gov ? 1 + (gov.pol - 55) / 300 : 1;
  const terr = TERRAIN[p.t].agri;
  return Math.round(p.agri * 7 * terr * (0.5 + p.mood / 200) * (1 + fx(fid, 'foodYield')) * govM);
}

function settleMonth() {
  Object.values(S.factions).forEach(f => {
    if (!f.alive) return;
    const ps = factionProv(f.id);
    if (!ps.length) { killFaction(f.id); return; }
    let gold = 0, food = 0, up = 0;
    ps.forEach(p => {
      gold += provIncome(p);
      if (S.month === 6 || S.month === 10) food += provHarvest(p);
      // 병사 식량 소모
      up += p.troops * 0.020 * (1 + fx(f.id, 'troopFood'));
      if (p.settle > 0) p.settle--;
      // 자연 변동 + 통치 부담
      const st = strain(f.id);
      p.order = clamp(p.order - (p.gov ? 0.4 : 1.6) - st + (p.mood > 70 ? 0.5 : 0), 0, 100 + fx(f.id,'orderCap'));
      p.mood = clamp(p.mood - 0.5 - st * 0.7 + (p.order > 70 ? 0.8 : 0) - (p.troops > p.pop * 40 ? 1.2 : 0), 0, 100 + fx(f.id,'moodCap'));
      const pc = capOf(p, 'pop');
      p.pop = clamp(Math.round(p.pop + (p.mood - 45) * 0.12 * (pc > p.pop ? 1 : -0.3)), 20, pc);
      if (p.mood < 22 && Math.random() < 0.12) { p.unrest++; if (p.unrest > 2) revolt(p); } else p.unrest = Math.max(0, p.unrest - 1);
    });
    // 봉록 — 국고가 부족하면 체불되고 충성이 떨어진다 (파산으로 마비되지 않게)
    const gens = factionGens(f.id).filter(g => g.status === 'ok');
    const payDue = gens.reduce((s, g) => s + rankOf(g).pay, 0);
    const upkeep = Math.round(ps.reduce((s, p) => s + p.troops * 0.013 * (1 + fx(f.id, 'upkeep')), 0)
      * (1 + strain(f.id) * 0.9));
    const cash = f.gold + gold;
    const payable = Math.max(0, Math.floor(cash * 0.55) - upkeep);
    const pay = Math.min(payDue, payable);
    const unpaid = payDue - pay;
    f.gold += Math.round(gold - pay - upkeep);
    f.food += Math.round(food - up);
    if (unpaid > 0) {
      const share = unpaid / Math.max(1, payDue);
      gens.forEach(g => { if (g.rank !== 7) g.loyal = clamp(g.loyal - 1.4 * share, 0, 100); });
      if (isMine(f.id) && S.turn % 3 === 0)
        logMsg(`국고가 모자라 봉록 ${Math.round(unpaid)}금이 체불되었다. 장수들의 충성이 흔들린다.`, 'bad', f.id);
    }
    // 세율에 따른 민심 변동
    const tx = taxOf(f);
    ps.forEach(p => { p.mood = clamp(p.mood + tx.mood, 0, 100 + fx(f.id, 'moodCap')); });
    const fCap = Math.round((15000 + 7000 * ps.length) * (1 + fx(f.id, 'foodCap')));
    if (f.food > fCap) f.food = fCap;
    f.lastIncome = {gold: Math.round(gold), pay: Math.round(pay), payDue: Math.round(payDue),
      upkeep, food: Math.round(food), eat: Math.round(up), net: Math.round(gold - pay - upkeep),
      tax: tx.n, strain: strain(f.id)};
    if (S.cheat && S.cheat.gold && isMine(f.id)) { f.gold = Math.max(f.gold, 999999); f.food = Math.max(f.food, 999999); }
    if (S.cheat && S.cheat.fastTech && isMine(f.id)) ['civ','mil','dip','cul'].forEach(k => f.tp[k] += 2000);
    // 연구
    let rp = ps.reduce((s, p) => s + p.comm * 0.03 + p.pop * 0.01, 0);
    const scholars = factionGens(f.id).filter(g => g.int >= 80).length;
    rp *= (1 + scholars * 0.05 + fx(f.id, 'techRate') + fx(f.id, 'tech')) * (isMine(f.id) ? 1 : DF().aiTech);
    if (factionHasTech(f.id, 'cul_acad')) rp *= 1.1;
    const share = {civ:0.28, mil:0.30, dip:0.18, cul:0.24};
    Object.keys(share).forEach(k => f.tp[k] += rp * share[k]);
  });
}

function revolt(p) {
  const loss = Math.round(p.troops * rnd(0.12, 0.3));
  p.troops -= loss; p.order = clamp(p.order - 20, 0, 100); p.mood = clamp(p.mood + 6, 0, 100); p.unrest = 0;
  logMsg(`${p.name}에서 민란이 일어나 병력 ${loss}을 잃었다.`, 'bad', p.owner);
  if (Math.random() < 0.18 && p.troops < 500) { const old = p.owner; p.owner = null; p.gov = null;
    provGens(p.id).forEach(g => { if (g.faction === old) { g.faction = null; g.loyal = 0; g.rank = 0; } });
    logMsg(`${p.name}이 반란으로 이탈하여 무주지가 되었다!`, 'bad', old);
    syncFactionProv(); }
}

function syncFactionProv() {
  Object.values(S.factions).forEach(f => { f.prov = factionProv(f.id).map(p => p.id); if (f.alive && !f.prov.length) killFaction(f.id); });
}

function killFaction(fid) {
  const f = fOf(fid); if (!f || !f.alive) return;
  f.alive = false;
  factionGens(fid).forEach(g => { g.faction = null; g.loyal = 0; g.rank = 0; g.army = null; });
  logMsg(`【멸망】${f.name} 세력이 역사에서 사라졌다.`, 'big');
  annal(`${f.name} 멸망`, 'fall');
  if (S.player.faction === fid && S.player.mode === 'lord') S.gameOver = {win:false, reason:`${f.name}는 멸망했다.`};
}

/* ---------- 장수 성장 / 노화 ---------- */
function yearlyGens() {
  S.gens.forEach(g => {
    if (g.status === 'dead') return;
    g.age++;
    const growth = 1 + fx(g.faction, 'growth');
    if (g.age < 34 && Math.random() < 0.55 * growth) {
      const k = pick(['lead','war','int','pol','cha']);
      g[k] = clamp(g[k] + ri(1, 2), 1, 100);
    }
    if (g.age > 48 && Math.random() < (g.age - 48) * 0.03) { g.war = clamp(g.war - 1, 1, 100); }
    // 사망 판정
    let dr = g.age < 50 ? 0.004 : 0.004 + Math.pow(g.age - 50, 1.7) * 0.00035;
    if (g.hurt > 0) dr += 0.025;
    if (g.age > 88) dr += 0.25;
    if (Math.random() < dr) killGen(g, '병사');
  });
}
function killGen(g, how) {
  g.status = 'dead'; g.army = null;
  const isRuler = g.faction && fOf(g.faction) && fOf(g.faction).ruler === g.name;
  logMsg(`${g.name}(${g.age}세)이 ${how}하였다.`, 'bad', g.faction);
  if (g.name === (S.player.gen && S.player.gen)) S.gameOver = {win:false, reason:`${g.name}의 생애가 끝났다.`};
  if (isRuler) succession(g.faction);
}
function succession(fid) {
  const f = fOf(fid); if (!f) return;
  const cand = factionGens(fid).filter(g => g.status === 'ok').sort((a, b) =>
    (b.merit + b.cha * 4 + b.loyal * 2 + (b.name.slice(0,2) === f.name.slice(0,2) ? 400 : 0)) -
    (a.merit + a.cha * 4 + a.loyal * 2 + (a.name.slice(0,2) === f.name.slice(0,2) ? 400 : 0)));
  if (!cand.length) { killFaction(fid); return; }
  const n = cand[0]; f.ruler = n.name; n.rank = 7; n.loyal = 100;
  logMsg(`【계승】${f.name}의 새 군주로 ${n.name}이 올랐다.`, 'big');
  annal(`${f.name} 군주 ${n.name} 계승`, 'lord');
  factionGens(fid).forEach(g => { if (g !== n) g.loyal = clamp(g.loyal - ri(4, 16) + Math.round(n.cha / 12), 0, 100); });
}

/* ---------- 신진 장수 출현 ---------- */
const NAMEGEN = {
  kr: {sur:['김','이','박','최','정','강','조','윤','장','임','한','신','서','권','황','안','송','류','홍','전','고','양','배','손'],
       syl:['원','충','의','덕','현','경','유','문','인','세','대','상','국','성','태','효','정','기','승','광','보','겸','열','규'],
       han:['金','李','朴','崔','鄭','姜','趙','尹','張','任','韓','申','徐','權','黃','安','宋','柳','洪','全','高','梁','裵','孫'],
       hs:['元','忠','義','德','賢','慶','裕','文','仁','世','大','相','國','成','泰','孝','正','奇','昇','光','輔','謙','烈','珪'],
       art:['kr_jo','kr_jo','kr_civ','kr_go','kr_sil','kr_bai']},
  jp: {sur:['이시카와','오가사와라','아오키','사쿠라이','쓰치야','미우라','와타나베','구도','히라타','하세가와','니시오','아마노','이노우에','오쿠보'],
       syl:['요시타다','노부히사','마사토모','다다카쓰','시게노리','가쓰히사','히데아키','나가요시','우지사토','야스나가','도모카게','모토쓰구'],
       han:['石川','小笠原','靑木','櫻井','土屋','三浦','渡邊','工藤','平田','長谷川','西尾','天野','井上','大久保'],
       hs:['義忠','信久','政朝','忠勝','重則','勝久','秀明','長慶','氏鄕','安長','朝景','元繼'],
       art:['jp_kab','jp_kab','jp_eb','jp_kab','jp_nin']},
  cn: {sur:['왕','장','진','유','조','황','주','오','서','손','마','정','양','호','임','고','곽','하','심','전'],
       syl:['원','충','현','의','문','무','위','덕','경','평','건','흠','순','휘','량','호','준','언','기','창'],
       han:['王','張','陳','劉','曹','黃','周','吳','徐','孫','馬','程','楊','胡','林','高','郭','何','沈','錢'],
       hs:['元','忠','賢','義','文','武','威','德','敬','平','建','欽','順','徽','良','浩','儁','彦','機','昌'],
       art:['cn_gen','cn_gen','cn_civ','cn_gen','cn_taoist']},
  vn: {sur:['응우옌','쩐','레','팜','황','부','당','부이','도','호'],
       syl:['반민','꽝빈','득타인','히우중','안득','쭝히에우','민카인','타인손','득푹','반롱'],
       han:['阮','陳','黎','范','黃','武','鄧','裴','杜','胡'],
       hs:['文明','光平','德淸','孝忠','安德','忠孝','明慶','淸山','德福','文龍'],
       art:['vn_khan','vn_khan','vn_cham','vn_khmer']},
  tw: {sur:['린','천','황','장','차이','양','쉬','정'],
       syl:['밍더','룽칭','하오즈','청웨이','유하이','즈밍','궈싱','전난'],
       han:['林','陳','黃','張','蔡','楊','許','鄭'],
       hs:['明德','隆慶','浩志','成偉','有海','志明','國興','鎭南'],
       art:['tw_ming','tw_ming','tw_abo']}
};
function spawnGenerals() {
  const n = ri(3, 6);
  for (let i = 0; i < n; i++) {
    const reg = pick(['kr','jp','cn','cn','vn','tw','jp']);
    const N = NAMEGEN[reg];
    const si = ri(0, N.sur.length - 1), yi = ri(0, N.syl.length - 1);
    let nm = N.sur[si] + (reg === 'jp' ? ' ' : '') + N.syl[yi];
    if (S.genIdx[nm]) nm = nm + '·' + ri(2, 9);
    const tier = Math.random();
    const base = tier < 0.06 ? 78 : tier < 0.3 ? 64 : 52;
    const sp = () => clamp(base + ri(-14, 20), 18, 97);
    const skpool = Object.keys(SKILLS);
    const nsk = tier < 0.06 ? 3 : tier < 0.3 ? 2 : 1;
    const sks = []; for (let k = 0; k < nsk; k++) { const s2 = pick(skpool); if (sks.indexOf(s2) < 0) sks.push(s2); }
    const apt = Array.from({length:5}, () => pick(['S','A','B','B','C','C'])).join('');
    const reg2 = PROVINCES.filter(p => p.region === reg);
    const g = mkGen([nm, N.han[si] + N.hs[yi], sp(), sp(), sp(), sp(), sp(), sks.join(','), apt, ri(16, 21), pick(N.art)]);
    g.region = reg; g.faction = null; g.loc = pick(reg2).id;
    S.gens.push(g); S.genIdx[g.name] = g;
  }
}

/* ---------- 충성 / 이탈 ---------- */
function loyaltyMonth() {
  Object.values(S.factions).forEach(f => {
    if (!f.alive) return;
    const ruler = genByName(f.ruler);
    factionGens(f.id).forEach(g => {
      if (g.rank === 7) { g.loyal = 100; return; }
      let d = 0;
      if (ruler) d += (ruler.cha - 70) / 60 + sfx(ruler, 'virtue') * 0.4;
      d += (g.faith - 50) / 200 + fx(f.id, 'loyalGain') * 0.5;
      if (rankOf(g).merit > g.merit * 1.6) d -= 0.25;         // 공에 비해 낮은 대우
      if (f.gold < 120) d -= 0.25;
      g.loyal = clamp(g.loyal + d, 0, 100);
      if (g.loyal < 22 && g.ambition > 60 && Math.random() < 0.04 && g.name !== S.player.gen) {
        g.faction = null; g.rank = 0; g.loyal = 0;
        logMsg(`${g.name}이 불만을 품고 세력을 떠나 재야로 돌아갔다.`, 'bad', f.id);
      }
    });
  });
}

/* ---------- 명령 ---------- */
const ORDERS = {
  // 내정
  farm:   {n:'개간',   cat:'civ', gold:120, need:'pol', d:'농업을 늘린다 (식량 생산)'},
  trade:  {n:'상업',   cat:'civ', gold:140, need:'pol', d:'상업을 늘린다 (금 수입)'},
  water:  {n:'치수',   cat:'civ', gold:110, need:'pol', d:'치수 공사로 수해를 막고 농지를 안정시킨다'},
  wall:   {n:'축성',   cat:'civ', gold:170, need:'pol', d:'성벽을 보수·증축한다'},
  patrol: {n:'순찰',   cat:'civ', gold:55,  need:'pol', d:'치안을 회복한다'},
  relief: {n:'구휼',   cat:'civ', gold:0,   food:700, need:'cha', d:'창고를 열어 민심을 얻는다'},
  // 군사
  levy:   {n:'징병',   cat:'mil', gold:140, need:'cha', d:'병력을 모집한다 (인구·민심 소모)'},
  drill:  {n:'훈련',   cat:'mil', gold:100, need:'lead', d:'훈련도를 올린다 — 전투력의 핵심'},
  smith:  {n:'무기생산',cat:'mil', gold:380, need:'pol', d:'무기 등급을 올린다'},
  armory: {n:'방어구', cat:'mil', gold:380, need:'pol', d:'방어구 등급을 올린다'},
  horse:  {n:'군마구입',cat:'mil', gold:280, need:'pol', d:'군마를 확보한다 (기병 편성)'},
  ship:   {n:'조선',   cat:'mil', gold:330, need:'pol', d:'전선을 건조한다 (수군 편성)'},
  merc:   {n:'용병고용',cat:'mil', gold:0,   need:'cha', d:'금으로 즉시 병력을 산다 (훈련도는 낮다)', dyn:1},
  // 인사
  recruit:{n:'등용',   cat:'per', gold:100, need:'cha', d:'재야 인재를 등용한다'},
  search: {n:'인재탐색',cat:'per', gold:80, need:'int', d:'숨은 인재를 찾는다'},
  reward: {n:'포상',   cat:'per', gold:300, need:'cha', d:'금을 내려 충성을 높인다'},
  move:   {n:'이동',   cat:'per', gold:40,  need:'lead', d:'다른 도시로 이동한다'},
  // 계략
  spy:    {n:'첩보',   cat:'plot',gold:180, need:'int', d:'적 도시 정보를 캔다'},
  sow:    {n:'이간',   cat:'plot',gold:430, need:'int', d:'적장의 충성을 떨어뜨린다'},
  rumor:  {n:'유언비어',cat:'plot',gold:300, need:'int', d:'적 도시의 치안·민심을 흔든다'},
  arson:  {n:'방화',   cat:'plot',gold:360, need:'int', d:'적 도시의 창고를 태운다'}
};

function orderCost(o) { return ORDERS[o] ? ORDERS[o].gold : 0; }
function mercCost() { return (S.flags && S.flags.mercCheap) ? 3.2 : 4.6; }

function doOrder(g, o, arg) {
  const f = fOf(g.faction); if (!f) return {ok:false, m:'소속이 없다'};
  const p = PROV_BY_ID[g.loc];
  const def = ORDERS[o]; if (!def) return {ok:false, m:'알 수 없는 명령'};
  if (g.acted) return {ok:false, m:`${g.name}은 이번 달에 이미 움직였다`};
  if (g.hurt > 0) return {ok:false, m:`${g.name}은 부상 중이다 (${g.hurt}개월)`};
  if (f.gold < def.gold) return {ok:false, m:'금이 부족하다'};
  if (def.food && f.food < def.food) return {ok:false, m:'식량이 부족하다'};
  const stat = g[def.need] || 60;
  const base = stat * 0.9 + g.int * 0.1;
  let m = '';
  f.gold -= def.gold; if (def.food) f.food -= def.food;
  switch (o) {
    case 'farm': { const v = Math.round((6 + base * 0.16) * (1 + sfx(g, 'agri') + fx(f.id, 'agriGain')));
      const c = capOf(p, 'agri'); const b = p.agri; p.agri = Math.min(c, p.agri + v);
      m = `${p.name} 농업 +${p.agri - b} (${p.agri}/${c})`; break; }
    case 'trade': { const v = Math.round((6 + base * 0.16) * (1 + sfx(g, 'comm')));
      const c = capOf(p, 'comm'); const b = p.comm; p.comm = Math.min(c, p.comm + v);
      m = `${p.name} 상업 +${p.comm - b} (${p.comm}/${c})`; break; }
    case 'water': { const v = Math.round((5 + base * 0.14) * (1 + sfx(g, 'water')));
      const c = capOf(p, 'water'); const b = p.water; p.water = Math.min(c, p.water + v);
      m = `${p.name} 치수 +${p.water - b}`; break; }
    case 'wall': { const v = Math.round((5 + base * 0.15) * (1 + sfx(g, 'wall')));
      const c = capOf(p, 'wall'); const b = p.wall; p.wall = Math.min(c, p.wall + v);
      m = `${p.name} 성벽 +${p.wall - b} (${p.wall}/${c})`; break; }
    case 'patrol': { const v = Math.round((7 + base * 0.13) * (1 + sfx(g, 'order')));
      p.order = clamp(p.order + v, 0, 100 + fx(f.id, 'orderCap')); m = `${p.name} 치안 +${v} (${Math.round(p.order)})`; break; }
    case 'relief': { const v = Math.round((6 + base * 0.12) * (1 + sfx(g, 'virtue')));
      p.mood = clamp(p.mood + v, 0, 100 + fx(f.id, 'moodCap')); m = `${p.name} 민심 +${v} (${Math.round(p.mood)})`; break; }
    case 'levy': { if (p.settle > 0) { f.gold += def.gold; return {ok:false, m:`${p.name}은 전후 수습 중이다 (${p.settle}개월)`}; }
      const cap = Math.round(p.pop * 26);
      let v = Math.round((p.pop * 1.6 + base * 12) * (1 + sfx(g, 'levy') + fx(f.id, 'levy')) * (0.5 + p.mood / 150));
      v = Math.min(v, Math.max(0, cap - p.troops));
      p.troops += v; p.mood = clamp(p.mood - (4 - sfx(g, 'levy') * 3), 0, 100);
      p.train = Math.round(p.train * (p.troops - v + 1) / (p.troops + 1) + 12 * v / (p.troops + 1));
      m = `${p.name} 병력 +${v} (${p.troops}) · 훈련도 ${Math.round(p.train)}`; break; }
    case 'drill': { const cap = 100 + fx(f.id, 'trainCap');
      const v = Math.round((3.5 + g.lead * 0.075) * (1 + sfx(g, 'train')));
      const b = p.train; p.train = Math.min(cap, p.train + v);
      m = `${p.name} 훈련도 +${Math.round(p.train - b)} (${Math.round(p.train)}/${cap})`; break; }
    case 'smith': { const cap = 3 + fx(f.id, 'weapon') + (factionHasTech(f.id,'mil_gun') ? 1 : 0);
      if (p.weapon >= cap) { m = '더 좋은 무기를 만들 기술이 없다'; f.gold += def.gold; return {ok:false, m}; }
      if (Math.random() < 0.42 + g.pol / 300) { p.weapon++; m = `${p.name} 무기 등급 → ${p.weapon}`; }
      else m = '무기 제작이 신통치 않았다'; break; }
    case 'armory': { const cap = 3 + fx(f.id, 'armor');
      if (p.armor >= cap) { m = '더 좋은 방어구를 만들 기술이 없다'; f.gold += def.gold; return {ok:false, m}; }
      if (Math.random() < 0.42 + g.pol / 300) { p.armor++; m = `${p.name} 방어구 등급 → ${p.armor}`; }
      else m = '방어구 제작이 신통치 않았다'; break; }
    case 'horse': { const v = Math.round(250 + base * 4); p.horses += v; m = `${p.name} 군마 +${v} (${p.horses})`; break; }
    case 'ship': { if (!p.port) { f.gold += def.gold; return {ok:false, m:'항구가 없는 도시다'}; }
      const v = Math.round((120 + base * 2.4) * (1 + sfx(g, 'ship') + fx(f.id, 'shipCap'))); p.ships += v;
      m = `${p.name} 전선 +${v} (${p.ships})`; break; }
    case 'merc': {
      const unit = mercCost();
      const want = Math.max(0, Math.min(parseInt(arg) || 0, Math.floor(f.gold / unit), rankOf(g).cmd));
      if (want < 100) { return {ok:false, m:'금이 부족하거나 수량이 너무 적다'}; }
      f.gold -= want * unit;
      const before = p.troops;
      p.train = Math.round((p.train * before + 38 * want) / Math.max(1, before + want));
      p.troops += want;
      p.mood = clamp(p.mood - 1, 0, 100);
      m = `${p.name}에 용병 ${want.toLocaleString()}명 고용 (금 ${(want * unit).toLocaleString()}) · 훈련도 ${Math.round(p.train)}`;
      break; }
    case 'search': { const cands = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === p.id && !x.found);
      if (!cands.length) { m = '이 고을에는 더 찾을 인재가 없다'; break; }
      const pr = 0.34 + g.int / 260 + sfx(g, 'order') * 0.1 + fx(f.id, 'searchRate');
      if (Math.random() < pr) { const c = pick(cands); c.found = true; m = `재야의 인재 ${c.name}(${c.han})을 찾아냈다!`; }
      else m = '수색했으나 마땅한 인재를 찾지 못했다'; break; }
    case 'recruit': { const t = genByName(arg);
      if (!t) { f.gold += def.gold; return {ok:false, m:'대상이 없다'}; }
      if (t.faction) { f.gold += def.gold; return {ok:false, m:'이미 섬기는 주인이 있다'}; }
      const ruler = genByName(f.ruler);
      let pr = 0.20 + (g.cha - 50) / 200 + sfx(g, 'recruit') + (ruler ? (ruler.cha - 60) / 240 + sfx(ruler, 'virtue') * 0.3 : 0);
      pr += (100 - t.ambition) / 500; pr -= (t.fame - 70) / 220;
      if (ruler && ruler.region === t.region) pr += 0.05;
      pr += f.prov.length * 0.012;
      pr = clamp(pr, 0.04, 0.92);
      if (Math.random() < pr) { joinFaction(t, f.id, p.id, clamp(50 + Math.round(t.faith / 3), 40, 90)); m = `${t.name}이 휘하에 들어왔다! (성공률 ${Math.round(pr*100)}%)`; }
      else { t.mood = 1; m = `${t.name}은 정중히 거절했다. (성공률 ${Math.round(pr*100)}%)`; } break; }
    case 'reward': { const t = genByName(arg) || g;
      t.loyal = clamp(t.loyal + ri(8, 16), 0, 100); m = `${t.name}에게 포상. 충성 ${Math.round(t.loyal)}`; break; }
    case 'move': { const to = PROV_BY_ID[arg];
      if (!to || to.owner !== f.id) { f.gold += def.gold; return {ok:false, m:'이동할 수 없는 곳이다'}; }
      g.loc = to.id; m = `${g.name}이 ${to.name}으로 이동했다`; break; }
    case 'spy': { const t = PROV_BY_ID[arg]; if (!t) { f.gold += def.gold; return {ok:false, m:'대상이 없다'}; }
      const pr = clamp(0.45 + g.int / 220 + sfx(g, 'spy') + fx(f.id, 'spy'), 0.1, 0.96);
      if (Math.random() < pr) { t.spied = S.turn; m = `${t.name}의 내부를 상세히 파악했다`; }
      else m = '첩자가 붙잡혔다'; break; }
    case 'sow': { const t = genByName(arg); if (!t || !t.faction) { f.gold += def.gold; return {ok:false, m:'대상이 없다'}; }
      const df = fOf(t.faction), dr = genByName(df.ruler);
      const atk = g.int * (1 + sfx(g, 'discord') + sfx(g, 'plot') + fx(f.id, 'discord'));
      const dfv = (dr ? dr.int * 0.5 : 30) + t.faith * 0.8 + t.loyal * 0.5;
      const pr = clamp(atk / (atk + dfv) * 0.9, 0.05, 0.9);
      if (Math.random() < pr) { const d = ri(10, 26); t.loyal = clamp(t.loyal - d, 0, 100);
        m = `${t.name}의 충성이 ${d} 떨어졌다 (${Math.round(t.loyal)})`; }
      else m = '이간책이 간파되었다'; break; }
    case 'rumor': { const t = PROV_BY_ID[arg]; if (!t || t.owner === f.id) { f.gold += def.gold; return {ok:false, m:'대상이 없다'}; }
      const pr = clamp(0.35 + g.int / 240 + sfx(g, 'confuse'), 0.08, 0.9);
      if (Math.random() < pr) { t.order = clamp(t.order - ri(8, 20), 0, 100); t.mood = clamp(t.mood - ri(5, 14), 0, 100);
        m = `${t.name}에 유언비어가 퍼져 혼란에 빠졌다`; } else m = '유언비어가 먹히지 않았다'; break; }
    case 'arson': { const t = PROV_BY_ID[arg]; if (!t || t.owner === f.id) { f.gold += def.gold; return {ok:false, m:'대상이 없다'}; }
      const pr = clamp(0.28 + g.int / 260 + sfx(g, 'fire') * 0.4 + sfx(g, 'plot'), 0.06, 0.85);
      if (Math.random() < pr) { const tf = fOf(t.owner); if (tf) { const lost = Math.round(tf.food * rnd(0.08, 0.2)); tf.food -= lost;
        t.comm = Math.round(t.comm * 0.94); m = `${t.name}의 창고를 태웠다! 적 식량 ${lost} 소실`; } }
      else { m = '방화에 실패하고 첩자를 잃었다'; } break; }
  }
  g.acted = true; g.exp += 8; g.merit += 6 + Math.round(base / 14);
  if (def.cat === 'civ') bump(g, 'civAct');
  if (o === 'recruit' && /휘하에 들어왔다/.test(m)) bump(g, 'recruit');
  if ((o === 'sow' || o === 'rumor' || o === 'arson') && !/간파|실패|먹히지/.test(m)) bump(g, 'plotWin');
  checkPromote(g);
  return {ok:true, m};
}

function joinFaction(g, fid, loc, loyal) {
  g.faction = fid; g.loc = loc || fOf(fid).cap; g.loyal = loyal || 60; g.rank = 1; g.merit = 60; g.found = true;
}
function checkPromote(g) {
  if (g.rank >= 6) return;
  const nx = RANKS[g.rank + 1];
  if (g.merit >= nx.merit) {
    const f = fOf(g.faction); if (!f) return;
    g.rank++;
    if (g.rank >= 3) { const p = PROV_BY_ID[g.loc]; if (p && p.owner === g.faction && !p.gov) p.gov = g.name; } g.loyal = clamp(g.loyal + 6, 0, 100);
    logMsg(`${g.name}이 ${RANKS[g.rank].n}으로 승진했다.`, 'good', g.faction);
  }
}

/* ---------- 기술 ---------- */
function techCost(fid, t) {
  const f = fOf(fid);
  const aff = (REGION_TECH_AFFINITY[f.region] || {})[t.id] || 1;
  return Math.round(t.cost * aff);
}
function canResearch(fid, t) {
  const f = fOf(fid);
  if (f.techs.indexOf(t.id) >= 0) return 'done';
  if (!t.req.every(r => f.techs.indexOf(r) >= 0)) return 'locked';
  if (f.tp[t.tree] < techCost(fid, t)) return 'poor';
  return 'ok';
}
function research(fid, tid) {
  const f = fOf(fid), t = TECH_BY_ID[tid];
  if (canResearch(fid, t) !== 'ok') return false;
  f.tp[t.tree] -= techCost(fid, t); f.techs.push(tid);
  if (t.e.gunUnlock) f.bonus.gunOK = 1;
  if (t.e.eleUnlock) f.bonus.eleOK = 1;
  logMsg(`【기술】${f.name}이 「${t.n}(${t.han})」을 완성했다. ${t.d}`, 'good', fid);
  return true;
}

/* ---------- 외교 ---------- */
function diploAct(fid, tid, act, gold, envoyName) {
  const f = fOf(fid), t = fOf(tid);
  if (!f || !t || !t.alive) return {ok:false, m:'상대가 없다'};
  const envoy = envoyName ? genByName(envoyName) : genByName(f.ruler);
  const skill = envoy ? (envoy.pol * 0.5 + envoy.cha * 0.5) : 50;
  const bonus = (envoy ? sfx(envoy, 'diplo') + sfx(envoy, 'persuade') * 0.5 : 0) + fx(fid, 'diplo')
    + (f.region !== t.region ? (fx(fid, 'foreignDiplo') - 0.25) : 0) + fx(fid, 'relGain');
  const cur = f.rel[tid];
  let pr = clamp((skill - 40) / 100 + bonus + (cur.v + 40) / 200 + gold / 4000, 0.05, 0.95);
  if (f.gold < gold) return {ok:false, m:'금이 부족하다'};
  f.gold -= gold;
  if (envoy) envoy.acted = true;
  let m = '', ok = false;
  switch (act) {
    case 'gift': { const d = Math.round(6 + gold / 90 + skill / 22);
      cur.v = clamp(cur.v + d, -100, 100); t.rel[fid].v = cur.v; t.gold += Math.round(gold * 0.8);
      m = `${t.name}에 예물을 보냈다. 관계 +${d} (${cur.v})`; ok = true; break; }
    case 'truce': { if (Math.random() < pr * (cur.v + 60) / 110) {
        cur.state = 'truce'; t.rel[fid].state = 'truce'; cur.turns = 24; t.rel[fid].turns = 24;
        cur.v = clamp(cur.v + 10, -100, 100); t.rel[fid].v = cur.v;
        m = `${t.name}과 불가침 조약을 맺었다 (24개월)`; ok = true; } else m = `${t.name}이 불가침을 거절했다`; break; }
    case 'ally': { const need = 45 - fx(fid, 'allyStable') * 30;
      if (cur.v < need) { m = `관계가 부족하다 (${cur.v}/${Math.round(need)})`; break; }
      if (Math.random() < pr) { cur.state = 'ally'; t.rel[fid].state = 'ally'; cur.v = clamp(cur.v + 15, -100, 100); t.rel[fid].v = cur.v;
        m = `${t.name}과 동맹을 맺었다!`; ok = true; } else m = `${t.name}이 동맹을 망설인다`; break; }
    case 'war': { cur.state = 'war'; t.rel[fid].state = 'war'; cur.v = clamp(cur.v - 45, -100, 100); t.rel[fid].v = cur.v;
      m = `${t.name}에 선전포고했다!`; ok = true;
      logMsg(`【선전포고】${f.name} → ${t.name}`, 'bad'); break; }
    case 'peace': { if (relation(fid, tid) !== 'war') { m = '교전 중이 아니다'; break; }
      const pw = factionPower(fid) / (factionPower(tid) + 1);
      if (Math.random() < clamp(pr * 0.7 + (pw - 1) * 0.25, 0.05, 0.92)) {
        cur.state = 'none'; t.rel[fid].state = 'none'; cur.v = clamp(cur.v + 12, -100, 100); t.rel[fid].v = cur.v;
        m = `${t.name}과 정전했다`; ok = true; } else m = `${t.name}이 정전을 거부했다`; break; }
    case 'joint': { if (cur.state !== 'ally') { m = '동맹국이 아니다'; break; }
      const targets = Object.keys(S.factions).filter(x => x !== fid && x !== tid && fOf(x).alive && relation(fid, x) === 'war');
      if (!targets.length) { m = '공동 출병할 대상이 없다'; break; }
      const tg = targets[0];
      if (Math.random() < pr) { t.rel[tg].state = 'war'; fOf(tg).rel[tid].state = 'war';
        m = `${t.name}이 ${fOf(tg).name}에 함께 출병한다!`; ok = true; } else m = '공동 출병을 거절했다'; break; }
    case 'vassal': { if (!factionHasTech(fid, 'dip_hege')) { m = '패자책봉 기술이 필요하다'; break; }
      const pw = factionPower(fid) / (factionPower(tid) + 1);
      if (pw > 2.5 && Math.random() < clamp(pr * pw / 3, 0.05, 0.9)) {
        cur.state = 'vassal'; t.rel[fid].state = 'vassal'; t.vassalOf = fid;
        m = `${t.name}이 신속을 받아들였다!`; ok = true; } else m = `${t.name}이 신속을 거부했다`; break; }
    case 'demand': { const pw = factionPower(fid) / (factionPower(tid) + 1);
      if (Math.random() < clamp((pw - 1) * 0.35 + pr * 0.3, 0.03, 0.85)) {
        const take = Math.round(t.gold * 0.4); t.gold -= take; f.gold += take;
        cur.v = clamp(cur.v - 20, -100, 100); t.rel[fid].v = cur.v;
        m = `${t.name}에서 금 ${take}을 받아냈다`; ok = true; }
      else { cur.v = clamp(cur.v - 25, -100, 100); t.rel[fid].v = cur.v; m = `${t.name}이 요구를 묵살했다`; } break; }
  }
  return {ok, m};
}

function diploMonth() {
  Object.values(S.factions).forEach(f => {
    if (!f.alive) return;
    Object.keys(f.rel).forEach(k => {
      const r = f.rel[k];
      if (r.turns > 0) { r.turns--; if (r.turns === 0 && r.state === 'truce') { r.state = 'none'; fOf(k).rel[f.id].state = 'none'; } }
      // 관계 자연 회복
      if (r.state !== 'war') r.v = clamp(r.v + (r.v < 0 ? 0.35 : 0.1), -100, 100);
      // 조공 수입
      if (r.state === 'ally' && factionHasTech(f.id, 'dip_trib')) f.gold += Math.round(20 * (1 + fx(f.id, 'tributeIncome')));
      if (r.state === 'vassal') { const t = fOf(k); if (t && t.alive) { const tax = Math.round(t.gold * 0.12); t.gold -= tax; f.gold += tax; } }
    });
  });
}

/* ---------- 이벤트 ---------- */
function randomEvents() {
  Object.values(S.factions).forEach(f => {
    if (!f.alive) return;
    if (Math.random() > 0.30) return;
    const ps = factionProv(f.id); if (!ps.length) return;
    const p = pick(ps);
    const pool = RANDOM_EVENTS.filter(e => !e.port || p.port);
    let tot = pool.reduce((s, e) => s + e.w, 0), x = Math.random() * tot, ev = pool[0];
    for (const e of pool) { x -= e.w; if (x <= 0) { ev = e; break; } }
    const r = ev.f(f, p) || {};
    let vtxt = '';
    Object.keys(r).forEach(k => {
      const v = r[k];
      if (k === 'gold') { f.gold = Math.max(0, f.gold + v); vtxt = Math.abs(v); }
      else if (k === 'food') { f.food = Math.max(0, f.food + v); vtxt = Math.abs(v); }
      else if (k === 'tech') { f.tp.civ += v / 2; f.tp.cul += v / 2; }
      else if (k === 'allMood') PROVINCES.forEach(q => q.mood = clamp(q.mood + v, 0, 100));
      else if (k === 'recruitFree') { const c = S.gens.filter(x => !x.faction && x.status === 'ok' && x.fame < 76);
        if (c.length) { const t = pick(c); joinFaction(t, f.id, p.id, 55); vtxt = t.name; } }
      else if (k === 'mood') p.mood = clamp(p.mood + v, 0, 100);
      else if (k === 'order') p.order = clamp(p.order + v, 0, 100);
      else if (p[k] !== undefined) { p[k] = Math.max(0, p[k] + v); vtxt = Math.abs(v); }
    });
    logMsg(`【${ev.n}】` + ev.d.replace('{prov}', p.name).replace('{v}', vtxt), ev.good ? 'good' : 'bad', f.id);
  });
}
function checkHistory() {
  HISTORY_EVENTS.forEach(e => {
    if (S.histDone[e.id]) return;
    let c = false; try { c = e.cond(S); } catch (err) { c = false; }
    if (c) { S.histDone[e.id] = 1; try { e.run(S); } catch (err) {} 
      S.pending.push({type:'hist', title:e.n, text:e.text}); logMsg(`【사서】${e.n} — ${e.text}`, 'big'); }
  });
}

function logMsg(m, kind, fid) {
  S.log.unshift({t:`${S.year}년 ${S.month}월`, m, kind: kind || '', fid: fid || null});
  if (S.log.length > 400) S.log.pop();
}

/* ---------- AI ---------- */
function aiFaction(f) {
  if (!f.alive || f.id === S.player.faction && S.player.mode === 'lord') return;
  const ps = factionProv(f.id); if (!ps.length) return;
  const gens = factionGens(f.id).filter(g => g.status === 'ok' && !g.acted && g.name !== S.player.gen);
  const style = f.ai;
  // 기술 구매
  ['mil','civ','dip','cul'].forEach(tr => {
    const avail = TECHS.filter(t => t.tree === tr && canResearch(f.id, t) === 'ok');
    if (avail.length) {
      avail.sort((a, b) => techCost(f.id, a) - techCost(f.id, b));
      let pickT = avail[0];
      if (style === 'aggressive' && tr === 'mil') pickT = avail[avail.length - 1];
      research(f.id, pickT.id);
    }
  });
  // 명령 배분 (예산의 60%까지만 사용)
  let budget = Math.floor(f.gold * 0.62);
  gens.forEach(g => {
    const p = PROV_BY_ID[g.loc]; if (!p || p.owner !== f.id) { g.loc = f.cap; return; }
    const cands = [];
    const front = ADJ[p.id].some(a => { const q = PROV_BY_ID[a.to]; return q.owner !== f.id; });
    if (p.order < 55) cands.push(['patrol', 90]);
    if (p.mood < 45) cands.push(['relief', 70]);
    if (p.agri < capOf(p, 'agri') * 0.75) cands.push(['farm', 62 + (g.pol > 70 ? 18 : 0)]);
    if (p.comm < capOf(p, 'comm') * 0.75) cands.push(['trade', 58 + (g.pol > 70 ? 18 : 0)]);
    if (p.train < 72) cands.push(['drill', 66 + (g.lead > 78 ? 24 : 0) + (front ? 16 : 0)]);
    if (p.settle === 0 && p.troops < p.pop * (style === 'aggressive' ? 24 : 20)) cands.push(['levy', 60 + (front ? 30 : 0) + (style === 'aggressive' ? 20 : 0)]);
    if (p.wall < capOf(p, 'wall') * 0.7 && (front || style === 'defensive')) cands.push(['wall', 60]);
    if (p.weapon < 3) cands.push(['smith', 46]);
    if (p.armor < 3) cands.push(['armory', 40]);
    if (p.port && p.ships < p.troops * 0.3 && f.pref === 'navy') cands.push(['ship', 55]);
    if (p.horses < p.troops * 0.3 && f.pref === 'cav') cands.push(['horse', 52]);
    const free = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === p.id);
    if (free.length && g.cha > 60) cands.push(['recruit', 130]);
    if (g.int > 66) cands.push(['search', 46]);
    if (!cands.length) cands.push(['patrol', 10]);
    cands.sort((a, b) => (b[1] * rnd(0.7, 1.3)) - (a[1] * rnd(0.7, 1.3)));
    const o = cands[0][0];
    const c = orderCost(o);
    if (budget < c || f.gold < c) { g.acted = true; return; }
    budget -= c;
    if (o === 'recruit') doOrder(g, 'recruit', pick(free).name);
    else doOrder(g, o);
  });
  // 외교
  if (Math.random() < 0.3) {
    const others = Object.keys(S.factions).filter(x => x !== f.id && fOf(x).alive);
    if (others.length) {
      const myP = factionPower(f.id);
      const weakFirst = others.sort((a, b) => factionPower(a) - factionPower(b));
      const strong = weakFirst[weakFirst.length - 1];
      if (factionPower(strong) > myP * 1.8 && relation(f.id, strong) === 'none' && f.gold > 500)
        diploAct(f.id, strong, 'truce', 300);
      else if (style === 'diplomatic' || style === 'honorable') {
        const cand = others.filter(x => relVal(f.id, x) > 30 && relation(f.id, x) === 'none');
        if (cand.length) diploAct(f.id, cand[0], 'ally', 200);
        else if (f.gold > 900) diploAct(f.id, pick(others), 'gift', 300);
      }
    }
  }
  // 병력 이송 → 잉여 금 소비
  aiLogistics(f);
  aiSurplus(f);
  // 출병 판단
  aiWar(f, style);
}

/* ---------- AI 병력 이송(兵力移送) ----------
   후방 도시의 병력을 전선으로 모은다. 이것이 없으면 대국끼리 영원히 교착된다. */
function isFront(p) { return ADJ[p.id].some(a => { const q = PROV_BY_ID[a.to]; return q.owner !== p.owner; }); }
function aiLogistics(f) {
  if (S.turn < 14) return;                     // 개막기에는 각 성이 자기 병력으로만 싸운다
  const ps = factionProv(f.id);
  if (ps.length < 2) return;
  const fronts = ps.filter(isFront);
  if (!fronts.length) return;
  // 전선 도시 중 적 방어력 대비 가장 아쉬운 곳으로 모은다
  fronts.forEach(fp => {
    fp._need = Math.max(0, bestTargetDef(fp) * 1.35 - armyStrengthEst(fp, f.id));
  });
  fronts.sort((a, b) => b._need - a._need);
  const rear = ps.filter(p => !isFront(p) && p.troops > 1800);
  rear.forEach(rp => {
    // 인접 아군 중 전선에 가까운 쪽으로 단계 이송
    const cand = ADJ[rp.id].map(a => PROV_BY_ID[a.to]).filter(q => q.owner === f.id);
    if (!cand.length) return;
    cand.sort((a, b) => (isFront(b) ? 1 : 0) - (isFront(a) ? 1 : 0) || (b._need || 0) - (a._need || 0));
    const to = cand[0];
    const send = Math.floor(rp.troops * (isFront(to) ? 0.6 : 0.4));
    if (send < 400) return;
    const keep = Math.max(600, Math.round(rp.pop * 3));
    const real = Math.min(send, Math.max(0, rp.troops - keep));
    if (real < 400) return;
    const room = Math.max(0, Math.round(to.pop * 52) - to.troops);   // 전선 집결은 넉넉히 허용
    const mv = Math.min(real, room);
    if (mv < 400) return;
    rp.troops -= mv;
    to.train = Math.round((to.train * to.troops + rp.train * mv) / Math.max(1, to.troops + mv));
    to.troops += mv;
    if (rp.horses > 600) { const h = Math.floor(rp.horses * 0.5); rp.horses -= h; to.horses += h; }
  });
  // 전선 도시에 장수도 보낸다
  const idle = factionGens(f.id).filter(g => g.status === 'ok' && !g.acted && g.rank < 7 &&
    PROV_BY_ID[g.loc] && !isFront(PROV_BY_ID[g.loc]));
  const want = fronts[0];
  idle.slice(0, 2).forEach(g => {
    if (provGens(want.id).filter(x => x.faction === f.id).length >= 5) return;
    if (f.gold < 60) return;
    if (ADJ[g.loc].some(a => a.to === want.id)) doOrder(g, 'move', want.id);
  });
}
function bestTargetDef(p) {
  let mx = 0;
  ADJ[p.id].forEach(a => { const q = PROV_BY_ID[a.to];
    if (q.owner !== p.owner) mx = Math.max(mx, provDefEst(q)); });
  return mx;
}

function aiSurplus(f) {
  const ps = factionProv(f.id); if (!ps.length) return;
  let k = 0, lim = 8 + ps.length * 3;
  while (f.gold > 2200 && k++ < lim) {
    const spend = Math.max(700, Math.min(9000, Math.floor(f.gold * 0.035)));
    if (f.gold < spend) break;
    const m = clamp(spend / 700, 1, 5);          // 투자 규모 배율
    const p = pick(ps);
    const opts = [];
    if (p.train < 100 + fx(f.id, 'trainCap')) opts.push('train', 'train');
    if (p.settle === 0 && p.troops < p.pop * 24) opts.push('levy', 'levy');
    if (p.wall < capOf(p, 'wall')) opts.push('wall');
    if (p.agri < capOf(p, 'agri')) opts.push('agri');
    if (p.comm < capOf(p, 'comm')) opts.push('comm');
    if (p.weapon < 3 + fx(f.id, 'weapon')) opts.push('weapon');
    if (p.armor < 3 + fx(f.id, 'armor')) opts.push('armor');
    if (p.port && p.ships < p.troops * 0.35) opts.push('ship');
    if (p.horses < p.troops * 0.35) opts.push('horse');
    const troopCap = Math.round(p.pop * (isFront(p) ? 32 : 24));
    if (p.settle === 0 && p.troops < troopCap && f.gold > 12000) opts.push('merc', 'merc');
    if (!opts.length) {
      // 더 투자할 곳이 없으면 금을 학사 초빙(연구)과 하사금(충성)으로 돌린다 — 금 사장 방지
      if (f.gold > 4000) {
        f.gold -= spend;
        const tr = pick(['civ','mil','dip','cul']);
        f.tp[tr] += spend * 0.11;
        const gs = factionGens(f.id).filter(g => g.loyal < 98);
        if (gs.length) { const g2 = pick(gs); g2.loyal = clamp(g2.loyal + 2, 0, 100); }
        continue;
      }
      break;
    }
    f.gold -= spend;
    const o = pick(opts);
    if (o === 'merc') { const unit = mercCost();
      const n = Math.min(Math.floor(spend / unit), Math.max(0, troopCap - p.troops));
      p.train = Math.round((p.train * p.troops + 38 * n) / Math.max(1, p.troops + n)); p.troops += n; continue; }
    if (o === 'train') p.train = Math.min(100 + fx(f.id, 'trainCap'), p.train + 4 * m);
    else if (o === 'levy') { const v = Math.min(Math.round(p.pop * 1.8 * m * (isMine(f.id) ? 1 : DF().aiTroop)),
        Math.max(0, troopCap - p.troops)); p.troops += v; p.mood = clamp(p.mood - 1.5, 0, 100); p.train = Math.round(p.train * (1 - 0.03 * m)); }
    else if (o === 'wall') p.wall = Math.min(capOf(p, 'wall'), p.wall + 7 * m);
    else if (o === 'agri') p.agri = Math.min(capOf(p, 'agri'), p.agri + 6 * m);
    else if (o === 'comm') p.comm = Math.min(capOf(p, 'comm'), p.comm + 6 * m);
    else if (o === 'ship') p.ships += Math.round(90 * m);
    else if (o === 'horse') p.horses += Math.round(180 * m);
    else if (o === 'weapon' && Math.random() < 0.18 * m) p.weapon++;
    else if (o === 'armor' && Math.random() < 0.18 * m) p.armor++;
  }
}

function aiWar(f, style) {
  if (S.turn < 4) return;                       // 개막 직후 유예
  if (S.turn < 10 && Math.random() < 0.55) return;
  const base = {aggressive:0.98, balanced:1.18, schemer:1.15, steady:1.28, defensive:1.55, passive:1.95, honorable:1.22, diplomatic:1.45}[style] || 1.25;
  const ps = factionProv(f.id);
  // 대국은 더 공격적, 연합 참가국은 표적에게 더 공격적
  const sizeBoost = 1 - Math.min(0.22, Math.max(0, ps.length - 8) * 0.018);
  const cand = [];
  ps.forEach(p => {
    if (p.troops < 2400) return;
    ADJ[p.id].forEach(a => {
      const q = PROV_BY_ID[a.to];
      if (q.owner === f.id) return;
      if (q.owner && ['ally','truce','vassal'].indexOf(relation(f.id, q.owner)) >= 0) return;
      if (S.cheat && S.cheat.peace && q.owner && isMine(q.owner)) return;    // 天機 — 아무도 나를 치지 않는다
      if (a.t === 'sea' && p.ships < 400) return;
      let aggr = base * sizeBoost * (isMine(f.id) ? 1 : DF().aiAggr);
      if (q.owner && inCoalitionVs(f.id, q.owner)) aggr *= 0.72;      // 맹약 표적은 과감히 친다
      const myStr = armyStrengthEst(p, f.id), enStr = provDefEst(q);
      const sc = myStr / (enStr + 1);
      if (sc > aggr) cand.push({from:p, to:q, v: sc * (q.owner ? 1 : 1.4) * (1 + provValue(q) / 3000), sc});
    });
  });
  if (!cand.length) return;
  cand.sort((a, b) => b.v - a.v);
  // 군량이 없으면 대군을 낼 수 없다
  const maxAtk = Math.max(1, Math.min(1 + Math.floor(ps.length / 6), Math.floor(f.food / 9000)));
  const used = {};
  let done = 0;
  for (const c of cand) {
    if (done >= maxAtk) break;
    if (used[c.from.id] || used[c.to.id]) continue;
    if (c.to.owner && relation(f.id, c.to.owner) !== 'war') {
      const cur = f.rel[c.to.owner]; cur.state = 'war'; fOf(c.to.owner).rel[f.id].state = 'war';
      cur.v = clamp(cur.v - 40, -100, 100);
      logMsg(`【선전포고】${f.name} → ${fOf(c.to.owner).name}`, 'bad');
    }
    if (launchAttack(f.id, c.from.id, c.to.id, null, false)) { used[c.from.id] = 1; used[c.to.id] = 1; done++; }
  }
}

function armyStrengthEst(p, fid) {
  const gs = provGens(p.id).filter(g => g.faction === fid);
  const lead = gs.length ? Math.max(...gs.map(g => g.lead * 0.6 + g.war * 0.4)) : 40;
  return p.troops * (0.55 + p.train / 100) * (0.88 + p.weapon * 0.06) * (0.6 + lead / 100) * (1 + fx(fid, 'power'));
}
function lastStand(q) {
  if (!q.owner) return 1;
  return factionProv(q.owner).length <= 1 ? 1.22 : (factionProv(q.owner).length <= 2 ? 1.10 : 1);
}
function provDefEst(q) {
  const gs = provGens(q.id);
  const lead = gs.length ? Math.max(...gs.map(g => g.lead * 0.6 + g.war * 0.4)) : 35;
  return q.troops * (0.55 + q.train / 100) * (0.88 + q.armor * 0.06) * (0.6 + lead / 100)
    * (1 + q.wall / 340) * TERRAIN[q.t].def * (q.owner ? 1 : 0.8) * lastStand(q);
}

/* ---------- 턴 진행 ---------- */
function endTurn() { aiPhase(); settlePhase(); }

function aiPhase() {
  S.pendingBattles = [];
  Object.values(S.factions).forEach(f => { if (f.alive && !(f.id === S.player.faction && S.player.mode === 'lord')) aiFaction(f); });
}

function settlePhase() {
  // 정산
  settleMonth();
  diploMonth();
  loyaltyMonth();
  randomEvents();
  S.gens.forEach(g => { g.acted = false; if (g.hurt > 0) g.hurt = Math.max(0, g.hurt - 1 - (sfx(g,'heal') > 0 ? 1 : 0)); });
  coalitionCheck();
  S.month++;
  if (S.month > 12) { S.month = 1; S.year++; yearlyGens(); spawnGenerals(); snapChron(); }
  S.turn++;
  syncFactionProv();
  checkHistory();
  checkVictory();
}

function checkVictory() {
  const owners = {}; PROVINCES.forEach(p => { if (p.owner) owners[p.owner] = (owners[p.owner] || 0) + 1; });
  const mine = S.player.mode === 'lord' ? S.player.faction : (S.player.gen && genByName(S.player.gen) ? genByName(S.player.gen).faction : null);
  const tot = PROVINCES.length;
  for (const k in owners) if (owners[k] === tot) {
    S.gameOver = {win: k === mine, reason: `${fOf(k).name}이 동아시아를 통일했다.`}; return;
  }
  if (mine && owners[mine] >= tot * 0.6) S.flagsNear = true;
}
