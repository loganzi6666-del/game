/* ============================================================
   열강의 시대 1900 — 턴 처리 / 전쟁 / 외교
   ============================================================ */

/* 한국어 조사 — 받침 유무에 따라 골라 쓴다 */
function hasJong(w){
  if(!w) return false;
  const c=w.charCodeAt(w.length-1);
  if(c<0xAC00||c>0xD7A3) return /[1360-9lmnr]$/i.test(w[w.length-1]);
  return (c-0xAC00)%28!==0;
}
function J(word, withJong, withoutJong){ return word + (hasJong(word)?withJong:withoutJong); }
const Jeun=w=>J(w,'은','는'), Ji=w=>J(w,'이','가'), Jeul=w=>J(w,'을','를'),
      Jwa=w=>J(w,'과','와'), Jro=w=>J(w,'으로','로');

function provValue(p){ return p.pop*0.01*(1+p.dev*0.4) + p.dev*2 + 4; }
function natValue(code){ let v=0; for(const p of ownedProvs(code)) v+=provValue(p); return v; }

/* ---------- 보급 ---------- */
function supplyDistance(code, target){
  // 내가 지배하는 프로빈스로부터의 최단 거리
  const seen = {}; let frontier = [];
  for(const id in G.provs) if(G.provs[id].ctrl===code && G.provs[id].own===code){ seen[id]=0; frontier.push(id); }
  if(!frontier.length) return 9;
  let d=0;
  while(frontier.length && d<9){
    d++; const nxt=[];
    for(const id of frontier) for(const nb of neighbours(id)){
      if(seen[nb]===undefined){ seen[nb]=d; if(nb===target) return d; nxt.push(nb); }
    }
    frontier=nxt;
  }
  return seen[target]!==undefined ? seen[target] : 9;
}
function supplyAt(n, provId){
  const p = G.provs[provId];
  const t = TERRAIN[p.ter] || {sup:1};
  const d = supplyDistance(n.code, provId);
  let s = (n._m.sup) * t.sup * (1 - Math.min(0.55, d*0.07));
  if(p.rail) s *= 1.08;
  return Math.max(0.35, Math.min(1.35, s));
}

/* ---------- 전쟁 상태 조회 ---------- */
function atWarWith(a,b){
  for(const w of G.wars){
    if((w.att.includes(a)&&w.def.includes(b))||(w.def.includes(a)&&w.att.includes(b))) return w;
  }
  return null;
}
function warsOf(code){ return G.wars.filter(w=>w.att.includes(code)||w.def.includes(code)); }
function sideOf(w, code){ return w.att.includes(code) ? 'att' : (w.def.includes(code) ? 'def' : null); }

/* ---------- 선전포고 ---------- */
function canDeclareWar(a, b, cb){
  const A=G.nats[a], B=G.nats[b];
  if(!A||!B||!A.alive||!B.alive) return '존재하지 않는 국가';
  if(a===b) return '자기 자신에게 선전포고할 수 없다';
  if(atWarWith(a,b)) return '이미 전쟁 중이다';
  if(A.truces[b] && A.truces[b] > G.turn) return `정전 협정이 ${Math.ceil((A.truces[b]-G.turn)/12)}년 더 남았다`;
  if(A.allies.includes(b)) return '동맹국이다. 먼저 동맹을 파기해야 한다';
  if(A.vassalOf===b || B.vassalOf===a) return '종주-속국 관계다';
  const cost = Math.round(CBS[cb].pp * (A._m.cbcost||1));
  if(A.pp < cost) return `정치력이 부족하다 (필요 ${cost})`;
  // 국경을 접하거나 해상으로 닿아야 한다
  let touch=false;
  for(const p of ownedProvs(a)) for(const nb of neighbours(p.id)){
    const q=G.provs[nb]; if(q && (q.own===b || G.nats[b].vassals.includes(q.own))){ touch=true; break; }
  }
  if(!touch && A.navy < 6) return '적국과 국경이 닿지 않는다 (원정을 위해서는 해군 6척 이상 필요)';
  return null;
}

function declareWar(a, b, cb, goals){
  const err = canDeclareWar(a,b,cb); if(err) return {ok:false, msg:err};
  const A=G.nats[a], B=G.nats[b], C=CBS[cb];
  A.pp -= Math.round(C.pp * (A._m.cbcost||1));
  A.pres += C.pres;
  A.aggression += C.aggr * 4;
  const w = {
    id: G.warSeq++, att:[a], def:[b], leadA:a, leadD:b, cb,
    goals: goals||[], score:0, battleScore:0, start:{y:G.year,m:G.month}, battles:0, name:`${A.adj}-${B.adj} 전쟁`,
  };
  // 동맹 참전
  for(const al of B.allies){ const N=G.nats[al];
    if(N && N.alive && !w.def.includes(al) && !w.att.includes(al)){
      const loyal = (N.relations[b]||0) + (N._m && 0) + 30 - (N.exh*1.5);
      if(loyal > 20 || N.ai.dip>0.7){ w.def.push(al); logEvent('참전', `${Ji(N.name)} 동맹 의무에 따라 ${B.adj} 편에서 참전했다.`, 'war'); }
      else logEvent('동맹 파기', `${Jeun(N.name)} ${B.adj}의 호출을 거부했다.`, 'diplo');
    }
  }
  for(const al of A.allies){ const N=G.nats[al];
    if(N && N.alive && !w.att.includes(al) && !w.def.includes(al)){
      if((N.relations[a]||0) > 40 && N.ai.agg > 0.4){ w.att.push(al); logEvent('참전', `${Ji(N.name)} ${A.adj} 편에서 참전했다.`, 'war'); }
    }
  }
  G.wars.push(w);
  // 외교적 파장
  for(const c in G.nats){
    if(c===a) continue;
    const N=G.nats[c];
    N.relations[a] = (N.relations[a]||0) - Math.round(C.aggr*3 + (cb==='none'?12:0));
  }
  logEvent('선전포고', `${Ji(A.name)} ${B.name}에 선전포고했다. 명분: ${C.n}`, 'war', a);
  return {ok:true, war:w};
}

/* ---------- 전투 ---------- */
function attack(code, from, to, divs){
  const n = G.nats[code];
  const pf = G.provs[from], pt = G.provs[to];
  if(!pf||!pt) return {ok:false,msg:'잘못된 지역'};
  if(pf.ctrl!==code) return {ok:false,msg:'출발 지역을 지배하고 있지 않다'};
  if(!neighbours(from).includes(to)) return {ok:false,msg:'인접하지 않은 지역이다'};
  const enemyOwner = pt.ctrl;
  const w = atWarWith(code, enemyOwner);
  if(!w) return {ok:false,msg:`${Jwa(G.nats[enemyOwner]?G.nats[enemyOwner].adj:'그 나라')} 전쟁 중이 아니다`};
  const avail = n.armies[from]||0;
  divs = Math.min(divs, avail);
  if(divs<1) return {ok:false,msg:'출발 지역에 병력이 없다'};

  const naval = isSeaLink(from,to);
  let landingZone=null;
  if(naval){
    landingZone = (typeof canLand==='function') ? canLand(code, from, to) : (n.navy>=4?'x':null);
    if(!landingZone) return {ok:false,msg:'제해권이 없다 — 두 해안을 잇는 해역에 우세한 함대(3척 이상)가 있어야 상륙할 수 있다'};
  }

  const en = G.nats[enemyOwner];
  const defDivs = (en && en.armies[to]) || 0;
  const ter = TERRAIN[pt.ter]||{def:1};
  const gb = (typeof generalBonus==='function') ? generalBonus(n, from) : {atk:0,def:0,sup:0,loss:0,fort:0};
  const gd = (typeof generalBonus==='function' && en) ? generalBonus(en, to) : {atk:0,def:0,sup:0,loss:0,fort:0};
  // 지휘관은 전투가 끝나면 자리를 옮길 수 있으니 먼저 붙잡아 둔다
  const genA = (typeof generalAt==='function') ? generalAt(n, from) : null;
  const genD = (typeof generalAt==='function' && en) ? generalAt(en, to) : null;
  const sup = supplyAt(n, from) * (1+gb.sup);

  let attStr = divs * n._m.atk * (1+gb.atk) * (n._m.mor||1) * sup * (0.85+rnd()*0.3);
  if(naval) attStr *= 0.72;
  let defStr = defDivs * (en?en._m.def:1) * (1+gd.def) * ter.def
             * (1 + pt.fort*0.18*(1+gb.fort)) * (0.85+rnd()*0.3);
  if(en && pt.cores.includes(enemyOwner)) defStr *= (en._m.homedef||1) * 1.12;
  if(defDivs===0) defStr = 0.35 + pt.fort*0.5 + pt.dev*0.06;   // 민병·수비대

  const ratio = attStr/(defStr+0.01);
  const lossA = Math.min(divs, Math.max(0, divs * 0.16 * (1+gb.loss) / Math.max(0.5, Math.min(2.2, ratio))));
  const lossD = Math.min(defDivs, defDivs * 0.16 * (1+gd.loss) * Math.max(0.5, Math.min(2.2, ratio)));
  n.armies[from] = Math.max(0, avail - Math.round(lossA*10)/10);
  if(n.armies[from] < 0.05) delete n.armies[from];
  if(en && defDivs){
    en.armies[to] = Math.max(0, defDivs - Math.round(lossD*10)/10);
    if(en.armies[to] < 0.05) delete en.armies[to];
  }
  n.exh += 0.25; if(en) en.exh += 0.22;
  // 전사자는 한동안 동원 가능 인력에서 빠진다
  const mmA = maxManpower(n)||1;
  n.casualties = Math.min(60, (n.casualties||0) + lossA*DIV_MAN/mmA*100*0.8);
  if(en){ const mmD = maxManpower(en)||1;
    en.casualties = Math.min(60, (en.casualties||0) + lossD*DIV_MAN/mmD*100*0.8); }
  w.battles++;

  let result, moved=0;
  const mine = sideOf(w, code);
  if(ratio > 1.2){
    result='승리';
    w.battleScore = (w.battleScore||0) + (mine==='att'? 1.5 : -1.5);
    moved = Math.max(0, n.armies[from] - 0);
    const keep = Math.min(moved, Math.max(1, Math.round(divs - lossA)));
    n.armies[from] -= keep;
    n.armies[to] = (n.armies[to]||0) + keep;
    if(typeof generalAt==='function'){ const g=generalAt(n, from);   // 장군은 주력을 따라간다
      if(g && keep >= (n.armies[from]||0)) g.loc=to; }
    if(en && en.armies[to]){                       // 패잔병 후퇴
      const retreat = retreatTarget(en, to);
      if(retreat){ en.armies[retreat]=(en.armies[retreat]||0)+en.armies[to]; }
      delete en.armies[to];
    }
    occupyProvince(to, code, w);
  } else if(ratio < 0.82){
    result='격퇴';
    w.battleScore = (w.battleScore||0) + (mine==='att'? -1.5 : 1.5);
  } else {
    result='교착';
  }
  {                                                        // 전공과 경험
    const ga=genA, gdg=genD;
    if(ga){ if(result==='승리'){ ga.wins++; ga.exp+=1; } else if(result==='격퇴'){ ga.losses++; ga.exp+=0.4; }
      if(ga.exp>=4 && ga.skill<10){ ga.skill++; ga.exp=0;
        if(n.code===G.player) logEvent('승진', `${ga.name} 장군의 지휘 능력이 ${ga.skill}로 올랐다.`, 'win', n.code); } }
    if(gdg){ if(result!=='승리'){ gdg.wins++; gdg.exp+=1; } else { gdg.losses++; gdg.exp+=0.4; }
      if(gdg.exp>=4 && gdg.skill<10){ gdg.skill++; gdg.exp=0; } }
  }
  const report = {
    y:G.year, m:G.month, from:pf.name, to:pt.name, attacker:n.name, defender:en?en.name:'현지 수비대',
    general: genA ? genA.name : null,
    divs, defDivs, lossA:+lossA.toFixed(1), lossD:+lossD.toFixed(1), ratio:+ratio.toFixed(2), result, naval,
  };
  logEvent(`전투: ${pt.name}`,
    `${n.adj}군 ${divs.toFixed(0)}개 사단이 ${Jeul(pt.name)} 공격 — ${result}. ` +
    `아군 손실 ${lossA.toFixed(1)}, 적 손실 ${lossD.toFixed(1)}.`, result==='승리'?'win':'war', code);
  updateWarScore(w);
  return {ok:true, report};
}

function retreatTarget(n, from){
  let best=null, bestA=-1;
  for(const nb of ADJ[from]||[]){
    if(G.provs[nb].ctrl===n.code){ const a=n.armies[nb]||0; if(a>bestA){bestA=a;best=nb;} }
  }
  return best;
}

function occupyProvince(id, code, w){
  const p = G.provs[id];
  const prev = p.ctrl;
  p.ctrl = code; p.unrest = Math.min(60, p.unrest + 18); p.siege = 0;
  logEvent('점령', `${G.nats[code].adj}군이 ${Jeul(p.name)} 점령했다.`, 'win', code);
  if(prev && G.nats[prev]) G.nats[prev].exh += 0.6;
  // 수도 함락
  if(G.nats[prev] && G.nats[prev].cap===id){
    G.nats[prev].stab -= 12;
    logEvent('수도 함락', `${G.nats[prev].name}의 수도가 함락되었다!`, 'bad', prev);
  }
}

function updateWarScore(w){
  let a=0, d=0;
  for(const id in G.provs){
    const p=G.provs[id];
    if(w.def.includes(p.own) && w.att.includes(p.ctrl)) a += provValue(p);
    if(w.att.includes(p.own) && w.def.includes(p.ctrl)) d += provValue(p);
  }
  const base = Math.max(30, w.def.reduce((s,c)=>s+natValue(c),0)*0.45);
  w.score = Math.max(-100, Math.min(100, (a-d)/base*100 + (w.battleScore||0)));
  w.occA = a; w.occD = d;
}

/* ---------- 강화 ---------- */
function peaceTerms(w, side){
  const score = side==='att' ? w.score : -w.score;
  const terms = [];
  terms.push({id:'white', n:'백지 강화', need:-100, d:'아무것도 얻지 않고 전쟁을 끝낸다.'});
  if(score >= 15) terms.push({id:'indem', n:'배상금', need:15, d:'적의 국고에서 배상금을 받는다.'});
  if(score >= 25) terms.push({id:'take1', n:'영토 1곳 할양', need:25, d:'점령한 지역 1곳을 병합한다.'});
  if(score >= 45) terms.push({id:'take2', n:'영토 2곳 할양', need:45, d:'점령한 지역 2곳을 병합한다.'});
  if(score >= 65) terms.push({id:'take4', n:'영토 4곳 할양', need:65, d:'점령한 지역 4곳을 병합한다.'});
  if(score >= 80) terms.push({id:'vassal', n:'속국화', need:80, d:'상대국을 속국으로 삼는다.'});
  const loserProvs = (side==='att'? w.def : w.att).reduce((s,c)=>s+ownedProvs(c).length,0);
  const months = (G.year-w.start.y)*12 + (G.month-w.start.m);
  if(score >= 95 && loserProvs <= 4 && months >= 10)
    terms.push({id:'annex', n:'전면 병합', need:95, d:'상대국을 완전히 병합한다. 전 세계가 경악할 것이다.'});
  return terms;
}

function makePeace(w, winnerSide, termId, chosenProvs){
  const winners = winnerSide==='att' ? w.att : w.def;
  const losers  = winnerSide==='att' ? w.def : w.att;
  const W = G.nats[winnerSide==='att' ? w.leadA : w.leadD];
  const L = G.nats[winnerSide==='att' ? w.leadD : w.leadA];
  let desc = '백지 강화';

  if(termId==='indem'){
    const amt = Math.min(L.gold*0.6, 40 + natValue(L.code)*0.3);
    L.gold -= amt; W.gold += amt; W.pres += 3; L.pres -= 4;
    desc = `배상금 £${amt.toFixed(0)}백만`;
  } else if(termId && termId.startsWith('take')){
    const cnt = parseInt(termId.slice(4),10);
    let list = chosenProvs && chosenProvs.length ? chosenProvs.slice(0,cnt) : [];
    if(!list.length){
      const occ = [];
      for(const id in G.provs){ const p=G.provs[id];
        if(losers.includes(p.own) && winners.includes(p.ctrl)) occ.push(p); }
      occ.sort((x,y)=>provValue(y)-provValue(x));
      list = occ.slice(0,cnt).map(p=>p.id);
    }
    for(const id of list) transferProvince(id, W.code);
    desc = `${list.map(i=>G.provs[i].name).join(', ')} 할양`;
    W.pres += 2*list.length; L.pres -= 3*list.length;
  } else if(termId==='vassal'){
    L.vassalOf = W.code; W.vassals.push(L.code);
    desc = `${L.name} 속국화`; W.pres += 12; L.pres -= 15;
  } else if(termId==='annex'){
    for(const p of ownedProvs(L.code)) transferProvince(p.id, W.code);
    L.alive=false; desc = `${L.name} 병합`; W.pres += 20; W.aggression += 25;
    for(const c in G.nats) if(c!==W.code) G.nats[c].relations[W.code]=(G.nats[c].relations[W.code]||0)-18;
    logEvent('국가 소멸', `${Ji(L.name)} 지도에서 사라졌다.`, 'bad', L.code);
  }

  // 점령지 원상 복구 — 이 전쟁의 당사국 사이에서만. 다른 전쟁의 전선은 건드리지 않는다.
  const parties = new Set([...w.att, ...w.def]);
  for(const id in G.provs){
    const p = G.provs[id];
    if(p.ctrl===p.own) continue;
    if(!parties.has(p.own) || !parties.has(p.ctrl)) continue;
    if(!G.nats[p.own] || !G.nats[p.own].alive) continue;
    if(atWarWith(p.own, p.ctrl)) continue;        // 아직 다른 전쟁으로 싸우는 중이면 그대로 둔다
    p.ctrl = p.own;
  }
  // 정전 협정 5년
  for(const a of w.att) for(const b of w.def){
    if(G.nats[a]) G.nats[a].truces[b]=G.turn+60;
    if(G.nats[b]) G.nats[b].truces[a]=G.turn+60;
  }
  for(const c of [...w.att,...w.def]) if(G.nats[c]) G.nats[c].exh = Math.max(0, G.nats[c].exh*0.35);
  G.wars = G.wars.filter(x=>x.id!==w.id);
  logEvent('강화 조약', `${w.name} 종결 — ${W.adj} 측 승리. ${desc}.`, 'peace');
  recalcScores();
  return desc;
}

function transferProvince(id, toCode){
  const p = G.provs[id];
  const from = p.own;
  p.own = toCode; p.ctrl = toCode;
  p.unrest = Math.min(80, p.unrest + 25);
  p.colonial = !p.cores.includes(toCode) && isFarColony(id, toCode);
  // 병력 철수
  if(G.nats[from]) delete G.nats[from].armies[id];
  if(G.nats[from] && ownedProvs(from).length===0){
    G.nats[from].alive=false;
    logEvent('국가 소멸', `${Ji(G.nats[from].name)} 멸망했다.`, 'bad', from);
  }
  if(G.nats[from] && G.nats[from].cap===id && G.nats[from].alive){
    const rest = ownedProvs(from); if(rest.length) G.nats[from].cap = rest[0].id;
  }
}
function isFarColony(id, code){
  const cap = G.nats[code].cap;
  const d = bfsDist(cap, id);
  return d > 4;
}
function bfsDist(a,b){
  if(a===b) return 0;
  const seen={[a]:0}; let fr=[a], d=0;
  while(fr.length && d<12){ d++; const nx=[];
    for(const id of fr) for(const nb of neighbours(id)) if(seen[nb]===undefined){ seen[nb]=d; if(nb===b) return d; nx.push(nb); }
    fr=nx; }
  return 12;
}

/* ---------- 외교 행동 ---------- */
const DIPLO = {
  improve  :{n:'관계 개선',   pp:8,  d:'사절을 보내 관계를 개선한다. (+12)'},
  insult   :{n:'외교적 경고', pp:5,  d:'상대를 규탄한다. 관계 -15, 내 위신 +1'},
  alliance :{n:'동맹 제안',   pp:25, d:'군사 동맹을 맺는다. 서로의 전쟁에 참전 의무가 생긴다.'},
  breakally:{n:'동맹 파기',   pp:10, d:'동맹을 파기한다. 위신 -5'},
  nap      :{n:'불가침 조약', pp:15, d:'10년간 서로 공격하지 않는다.'},
  guarantee:{n:'독립 보장',   pp:20, d:'상대가 침략받으면 자동 참전한다.'},
  subsidy  :{n:'재정 지원',   pp:5,  gold:25, d:'£25백만을 지원한다. 관계 +20'},
  demandTrib:{n:'조공 요구',  pp:20, d:'약소국에 조공을 요구한다. 실패 시 관계 급락'},
};
function doDiplo(a, b, act){
  const A=G.nats[a], B=G.nats[b], D=DIPLO[act];
  if(!A||!B||!B.alive) return {ok:false,msg:'대상이 없다'};
  if(A.pp < D.pp) return {ok:false,msg:'정치력이 부족하다'};
  if(D.gold && A.gold < D.gold) return {ok:false,msg:'국고가 부족하다'};
  A.pp -= D.pp; if(D.gold){ A.gold-=D.gold; B.gold+=D.gold; }
  const rel = ()=>B.relations[a]||0;
  const set = v=>{ B.relations[a]=Math.max(-100,Math.min(100,v)); A.relations[b]=B.relations[a]; };

  switch(act){
    case 'improve': set(rel()+Math.round(12*(A._m.dip||1))); return {ok:true,msg:`${Jwa(B.adj)}의 관계가 개선되었다 (${rel()})`};
    case 'insult':  set(rel()-15); A.pres+=1; return {ok:true,msg:`${B.adj}를 규탄했다`};
    case 'subsidy': set(rel()+Math.round(20*(A._m.dip||1))); return {ok:true,msg:`${B.adj}에 재정 지원을 보냈다`};
    case 'breakally':
      A.allies=A.allies.filter(x=>x!==b); B.allies=B.allies.filter(x=>x!==a);
      A.pres-=5; set(rel()-25); return {ok:true,msg:`${Jwa(B.adj)}의 동맹을 파기했다`};
    case 'nap':
      if(rel()<10) return {ok:false,msg:'관계가 나빠 거절당했다'};
      A.truces[b]=G.turn+120; B.truces[a]=G.turn+120; set(rel()+8);
      return {ok:true,msg:`${Jwa(B.adj)} 불가침 조약을 맺었다`};
    case 'guarantee':
      if(!A.guarantees.includes(b)) A.guarantees.push(b);
      set(rel()+15); return {ok:true,msg:`${B.adj}의 독립을 보장했다`};
    case 'alliance': {
      const want = rel() + (B.ai.dip*30) - (B.score>A.score?15:0) + (sharedEnemy(a,b)?25:0);
      if(want < 55) return {ok:false,msg:`${Ji(B.adj)} 동맹 제안을 거절했다 (호감 ${Math.round(want)}/55)`};
      A.allies.push(b); B.allies.push(a); set(Math.max(rel(),70));
      logEvent('동맹 체결', `${Jwa(A.name)} ${Ji(B.name)} 동맹을 맺었다.`, 'diplo');
      return {ok:true,msg:`${Jwa(B.adj)} 동맹을 체결했다!`};
    }
    case 'demandTrib': {
      const power = A.score/(B.score+1);
      if(power > 2.5 && rel() > -50){ B.gold*=0.8; A.gold+=B.gold*0.25; set(rel()-20);
        return {ok:true,msg:`${Ji(B.adj)} 조공을 바쳤다`}; }
      set(rel()-35); return {ok:false,msg:`${Ji(B.adj)} 굴욕적 요구를 거부했다`};
    }
  }
  return {ok:false,msg:'알 수 없는 행동'};
}
function sharedEnemy(a,b){
  const A=G.nats[a],B=G.nats[b];
  for(const c in G.nats){ if(c===a||c===b) continue;
    if((A.relations[c]||0)<-30 && (B.relations[c]||0)<-30) return true; }
  return false;
}
