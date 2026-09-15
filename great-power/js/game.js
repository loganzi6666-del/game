/* ============================================================
   열강의 시대 1900 — 시뮬레이션 엔진
   ============================================================ */

/* 국가별 행정역량(재정·교육 침투율). 청·오스만이 인구 대비 가난한 이유. */
const ADMIN = {
  GBR:1.05, FRA:1.00, GER:1.08, USA:1.00, JPN:0.92, ITA:0.85, AUH:0.88,
  RUS:0.72, OTT:0.45, QIN:0.32, KOR:0.55, PER:0.45, ETH:0.35, MOR:0.40,
  SIA:0.60, AFG:0.35, NEP:0.35, BHU:0.30, MEX:0.65, BRA:0.70, ARG:0.80,
  CHL:0.78, PEU:0.60, COL:0.60, VEN:0.58, BOL:0.50, ECU:0.55, PAR:0.50,
  URU:0.75, CUB:0.60, HAI:0.40, DOM:0.45, LBR:0.35, OMA:0.40,
  ESP:0.80, POR:0.75, NLD:1.00, BEL:1.00, SWE:0.95, DEN:0.98, SUI:1.00,
  LUX:0.95, GRE:0.65, ROM:0.62, SER:0.60, BUL:0.62, MNE:0.45,
};

/* 국가 특성 */
const TRAITS = {
  GBR:m=>{ m.nav*=1.25; m.col*=1.20; },
  FRA:m=>{ m.res*=1.10; m.man*=1.10; },
  GER:m=>{ m.atk*=1.15; m.def*=1.10; m.ind*=1.10; },
  RUS:m=>{ m.man*=1.40; m.res*=0.90; },
  AUH:m=>{ m.dip=(m.dip||1)*1.10; m.unrest=(m.unrest||0)+3; },
  USA:m=>{ m.grw*=1.25; m.isolation=true; },
  JPN:m=>{ m.res*=1.15; m.mor=(m.mor||1)*1.10; },
  ITA:m=>{ m.cbcost=0.80; },
  OTT:m=>{ m.stab-=10; m.homedef=1.15; },
  QIN:m=>{ m.man*=1.60; m.atk*=0.75; m.def*=0.85; m.unrest=(m.unrest||0)+5; },
  KOR:m=>{ m.reformBonus=1.35; },
  ETH:m=>{ m.homedef=1.25; },
};

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

let G = null;                      // 전역 게임 상태
const ADJ = {};                    // 육상 인접
const SEA = {};                    // 해상 연결

function buildAdjacency(){
  for(const p of MAP_RAW){ ADJ[p.id] = new Set(p.n.filter(x=>PROV[x])); SEA[p.id] = new Set(); }
  for(const [a,b] of SEA_LANES){ SEA[a].add(b); SEA[b].add(a); }
}
function neighbours(id){ return [...ADJ[id], ...SEA[id]]; }
function isSeaLink(a,b){ return SEA[a] && SEA[a].has(b) && !(ADJ[a] && ADJ[a].has(b)); }

/* ---------- 게임 생성 ---------- */
function newGame(playerCode, opts){
  opts = opts || {};
  G = {
    year:1900, month:0, turn:0, player:playerCode, speed:1,
    provs:{}, nats:{}, wars:[], warSeq:1, log:[], pending:[], flags:{},
    endYear: opts.endYear || 1950, difficulty: opts.difficulty || 'normal',
    seed: Math.floor(Math.random()*1e9),
  };

  for(const id in PROV){
    const [name, own, pop, dev, ter, res] = PROV[id];
    G.provs[id] = {
      id, name, own, ctrl:own, pop, basePop:pop, dev, ter, res,
      fort: (NATIONS[own] && NATIONS[own].cap===id) ? 2 : 0,
      unrest: 0, siege: 0, rail: dev>=6?1:0,
      cores: [own], colonial: isColonial(id, own),
    };
  }

  for(const code in NATIONS){
    const d = NATIONS[code];
    G.nats[code] = {
      code, name:d.name, adj:d.adj, color:d.color, cap:d.cap, gov:d.gov,
      gold:d.gold, pres:d.pres, stab:55, legit:70, pp:20, debt:0,
      techs:{}, research:{ind:null,pol:null,mil:null}, progress:{ind:0,pol:0,mil:0},
      alloc:{ind:34,pol:33,mil:33},
      armies:{}, navy:d.navy, manpower:0, casualties:0, exh:0, taxRate:1.0,
      relations:{}, allies:[], truces:{}, guarantees:[], vassalOf:null, vassals:[],
      building:[], recruiting:[], ai:d.ai||{agg:.3,exp:.3,dip:.5}, gp:!!d.gp,
      alive:true, score:0, rank:99, aggression:0, warGoals:{},
      history:[],
    };
    // 열강이 아닌 나라는 재정 한계상 상비군이 작다
    G.nats[code].armies[d.cap] = d.gp ? d.army : Math.max(1, Math.round(d.army*0.65));
    startingTechs(G.nats[code]);
  }

  // 초기 외교 관계 (1900년 실제 정세)
  setupDiplomacy();
  for(const c in G.nats){ const n=G.nats[c]; n._m=calcMods(n); n.manpower = freeManpower(n); }
  recalcScores();
  logEvent('국가 수립', `${G.nats[playerCode].name}의 20세기가 시작된다.`, 'start');
  return G;
}

function isColonial(id, own){
  const nat = NATIONS[own]; if(!nat) return false;
  const home = { GBR:['c826','c372'], FRA:['c250'], NLD:['c528'], BEL:['c056'],
                 POR:['c620'], ESP:['c724'], DEN:['c208'], ITA:['c380'],
                 USA:['usa_east','usa_mid','usa_west'], JPN:['c392'], GER:['c276'] };
  if(home[own]) return !home[own].includes(id);
  return false;
}

function startingTechs(n){
  const tier = { GBR:3, GER:3, FRA:3, USA:3, AUH:2, RUS:2, ITA:2, JPN:2, OTT:1, QIN:0,
                 NLD:2, BEL:2, SWE:2, DEN:2, SUI:2, ESP:1, POR:1, ARG:1, BRA:1, CHL:1 };
  const lv = tier[n.code] !== undefined ? tier[n.code] : 0;
  for(const id in TECHS){ if(TECHS[id].t <= lv) n.techs[id] = true; }
}

function setupDiplomacy(){
  const R = (a,b,v)=>{ G.nats[a].relations[b]=v; G.nats[b].relations[a]=v; };
  const ally = (a,b)=>{ G.nats[a].allies.push(b); G.nats[b].allies.push(a); R(a,b,85); };
  // 삼국동맹
  ally('GER','AUH'); ally('GER','ITA'); R('AUH','ITA',35);
  // 프랑스-러시아 동맹
  ally('FRA','RUS');
  // 영일동맹은 1902년 이벤트로
  R('GBR','GER',20); R('GBR','FRA',5); R('GBR','RUS',-25); R('GBR','USA',45);
  R('FRA','GER',-60); R('FRA','ITA',-15); R('RUS','AUH',-35); R('RUS','JPN',-45);
  R('RUS','OTT',-40); R('GBR','OTT',10); R('GER','OTT',35);
  R('JPN','QIN',-35); R('JPN','KOR',-10); R('QIN','KOR',20);
  R('USA','ESP',-50); R('SER','AUH',-40); R('BUL','OTT',-35); R('GRE','OTT',-45);
  R('ROM','AUH',-15); R('ITA','OTT',-20); R('GBR','POR',60); R('GER','MOR',20);
  R('BEL','GBR',40); R('NLD','GER',25); R('SWE','RUS',-20); R('MEX','USA',-15);
  R('ARG','CHL',-20); R('BOL','CHL',-45); R('PEU','CHL',-40);
}

/* ---------- 파생 수치 ---------- */
function ownedProvs(code){ const r=[]; for(const id in G.provs) if(G.provs[id].own===code) r.push(G.provs[id]); return r; }
function controlledProvs(code){ const r=[]; for(const id in G.provs) if(G.provs[id].ctrl===code) r.push(G.provs[id]); return r; }

function calcMods(n){
  const m = { ind:1,res:1,tax:1,man:1,atk:1,def:1,nav:1,sup:1,bld:1,grw:1,col:1,exh:1,
              stab:0, pp:0, unrest:0, mor:1, dip:1 };
  const g = GOVS[n.gov];
  m.tax*=g.tax; m.res*=g.res; m.stab+=g.stab; m.pp+=g.pp; m.atk*=g.mil; m.def*=g.mil;
  for(const id in n.techs){
    const e = TECHS[id] && TECHS[id].eff; if(!e) continue;
    for(const k in e){
      if(k==='stab'||k==='pp') m[k]+=e[k];
      else m[k] = (m[k]===undefined?1:m[k]) * (1+e[k]);
    }
  }
  if(TRAITS[n.code]) TRAITS[n.code](m);
  const adm = ADMIN[n.code]||0.7;
  m.adm = adm;
  m.tax *= adm; m.res *= adm;
  return m;
}

function techLevel(n, branch){
  let c=0; for(const id in n.techs) if(TECHS[id] && TECHS[id].b===branch) c++;
  return c;
}

function provIncome(p, n, m){
  const rs = RESOURCE[p.res] || {};
  let v = p.pop * 0.0022 * (1 + p.dev*0.24);
  v *= (rs.tax || 1);
  if(p.colonial) v *= 0.42 * m.col;
  if(p.own !== p.ctrl) v = 0;                       // 점령당한 땅은 세금이 안 걷힌다
  v *= (1 - Math.min(0.8, p.unrest/120));
  return v * m.tax * n.taxRate;
}

function nationIncome(n){
  const m = n._m || (n._m = calcMods(n));
  let inc = 0.3;                                   // 관세·전매 등 기타 세입
  for(const p of ownedProvs(n.code)) inc += provIncome(p, n, m);
  for(const v of n.vassals){ if(G.nats[v]) inc += nationIncome(G.nats[v]) * 0.25; }
  return inc;
}
function nationExpense(n){
  const m = n._m || (n._m = calcMods(n));
  let army = 0; for(const id in n.armies) army += n.armies[id];
  const wage = 0.45 + 0.55*(ADMIN[n.code]||0.7);   // 가난한 나라는 병사에게 적게 준다
  const mil = army * 0.34 * (1 + techLevel(n,'mil')*0.04) * wage;
  const nav = n.navy * 0.55 * (1 + techLevel(n,'mil')*0.035) * wage;
  const ownd = ownedProvs(n.code);
  let adminCost = 0;
  for(const p of ownd) adminCost += p.colonial ? 0.18 : 0.08;
  adminCost *= 1 + ownd.length/45;                 // 과대확장: 제국이 클수록 통치비가 급증한다
  const interest = n.debt * 0.004;
  return mil + nav + adminCost + interest;
}

function maxManpower(n){
  const m = n._m || (n._m = calcMods(n));
  let mp = 0;
  for(const p of ownedProvs(n.code)){
    const rs = RESOURCE[p.res]||{};
    let base = p.pop * 0.022 * (rs.man||1);
    if(p.colonial) base *= 0.14;   // 식민지 병력은 본국만큼 동원되지 않는다
    if(!p.cores.includes(n.code)) base *= 0.5;
    mp += base;
  }
  return mp * m.man;
}

function researchPoints(n){
  const m = n._m || (n._m = calcMods(n));
  let base = 2;
  for(const p of ownedProvs(n.code)){
    if(p.own!==p.ctrl) continue;
    let v = p.pop * p.dev * 0.00035;
    if(p.colonial) v *= 0.25;
    base += v;
  }
  return base * m.res;
}

function armyTotal(n){ let a=0; for(const id in n.armies) a += n.armies[id]; return a; }

/* 인력은 '소모품'이 아니라 '정원'이다. 사단 하나는 인력을 계속 붙잡아 둔다. */
function usedManpower(n){
  let u = armyTotal(n) * DIV_MAN;
  for(const r of n.recruiting) if(r.kind!=='navy') u += r.count * DIV_MAN;
  return u;
}
function effectiveManpower(n){ return maxManpower(n) * (1 - Math.min(0.6, (n.casualties||0)/100)); }
function freeManpower(n){ return Math.max(0, effectiveManpower(n) - usedManpower(n)); }

/* 해군은 연안 공업력이 상한이다 */
function maxNavy(n){
  let cap = 2;
  for(const p of ownedProvs(n.code)){
    if(!SEA[p.id].size && p.ter!=='i') continue;
    cap += (1 + p.dev*0.55) * (p.colonial?0.35:1);
  }
  return Math.round(cap * (n._m ? n._m.nav : 1) * 0.75);
}

function armyQuality(n){
  const m = n._m || (n._m = calcMods(n));
  return m.atk;
}

/* ---------- 국력 점수 / 열강 순위 ---------- */
function recalcScores(){
  const list = [];
  for(const c in G.nats){
    const n = G.nats[c]; n._m = calcMods(n);
    if(!n.alive){ n.score=0; continue; }
    let ind=0, colon=0;
    for(const p of ownedProvs(c)){
      ind += p.pop * (1 + p.dev*0.5) * 0.001 * (p.colonial ? 0.45 : 1);
      if(p.colonial) colon += 1 + p.dev*0.2;
    }
    const mil = armyTotal(n) * n._m.atk * 1.4 + n.navy * n._m.nav * 1.8;
    const tech = Object.keys(n.techs).length * 1.2;
    n.indScore = ind; n.milScore = mil; n.colScore = colon;
    n.score = ind*0.42 + mil*0.30 + n.pres*0.16 + colon*0.07 + tech*0.05;
    list.push(n);
  }
  list.sort((a,b)=>b.score-a.score);
  list.forEach((n,i)=>{ n.rank = i+1; n.gp = i<8; });
  G.ranking = list.map(n=>n.code);
}

/* ---------- 난수 (시드 고정) ---------- */
function rnd(){ G.seed = (G.seed*1103515245 + 12345) & 0x7fffffff; return G.seed/0x7fffffff; }
function rint(a,b){ return a + Math.floor(rnd()*(b-a+1)); }
function pick(arr){ return arr[Math.floor(rnd()*arr.length)]; }

/* ---------- 로그 ---------- */
function logEvent(title, text, kind, nation){
  G.log.unshift({ y:G.year, m:G.month, title, text, kind:kind||'info', nation });
  if(G.log.length > 400) G.log.length = 400;
}
