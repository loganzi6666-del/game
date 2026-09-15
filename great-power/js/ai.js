/* ============================================================
   열강의 시대 1900 — AI
   ============================================================ */
function hashCode(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }

function aiTick(){
  for(const code in G.nats){
    const n=G.nats[code];
    if(!n.alive || code===G.player) continue;
    const h = hashCode(code);
    aiResearch(n);
    if(G.turn % 2 === h%2) aiSpend(n);
    if(G.turn % 4 === h%4) aiDiplomacy(n);
    aiWarMoves(n);
    if(G.turn % 12 === h%12) aiWarDecision(n);
  }
}

function aiResearch(n){
  const weight = { ind: 1 + (1-n.ai.agg)*0.6, pol: 0.9 + n.ai.dip*0.5, mil: 0.7 + n.ai.agg*1.4 };
  if(warsOf(n.code).length) weight.mil += 0.8;
  for(const b of ['ind','pol','mil']){
    if(n.research[b]) continue;
    const av = availableTechs(n,b);
    if(av.length) n.research[b]=av[0];
  }
  const tot = weight.ind+weight.pol+weight.mil;
  n.alloc = { ind:Math.round(weight.ind/tot*100), pol:Math.round(weight.pol/tot*100), mil:Math.round(weight.mil/tot*100) };
}

function threatLevel(n){
  let t=0;
  for(const c in G.nats){
    const o=G.nats[c]; if(c===n.code||!o.alive) continue;
    const rel=n.relations[c]||0;
    if(rel>=0) continue;
    let border=false;
    for(const p of ownedProvs(n.code)){ for(const nb of neighbours(p.id)) if(G.provs[nb].own===c){border=true;break;} if(border)break; }
    if(!border) continue;
    t += (o.score/(n.score+1)) * (-rel/100) * 1.5;
  }
  return t;
}

function aiSpend(n){
  const atWar = warsOf(n.code).length>0;
  const reserve = nationExpense(n) * (atWar? 2 : 5);
  let budget = n.gold - reserve;
  if(budget <= 0) return;

  const threat = threatLevel(n);
  const affordable = nationIncome(n) * (atWar?0.62:0.42) / 0.34;   // 군대는 예산이 먼저 결정한다
  const wantArmy = Math.round( Math.min(
      effectiveManpower(n)/DIV_MAN*0.85,
      affordable,
      (natValue(n.code)*0.055) * (0.6 + n.ai.agg*0.9 + threat*0.5) * (atWar?1.6:1)) );
  const have = armyTotal(n) + n.recruiting.filter(r=>r.kind!=='navy').reduce((s,r)=>s+r.count,0);

  if(have < wantArmy && freeManpower(n) > DIV_MAN*2){
    const can = Math.min(Math.floor(budget/DIV_COST), Math.floor(freeManpower(n)/DIV_MAN), wantArmy-have, 6);
    if(can>0){
      const front = aiFrontProvince(n) || n.cap;
      const r = recruit(n.code, front, can);
      if(r.ok) budget -= can*DIV_COST;
    }
  }
  // 해군 — 해양 국가만
  const navalist = ['GBR','USA','JPN','FRA','GER','ITA','NLD','ESP','RUS','AUH','CHL','ARG','BRA'].includes(n.code);
  if(navalist && budget > SHIP_COST*3 && n.navy < maxNavy(n)){
    const cnt=Math.min(3, Math.floor(budget/SHIP_COST/2));
    if(cnt>0){ const r=buildShips(n.code,cnt); if(r.ok) budget-=cnt*SHIP_COST; }
  }
  // 산업 투자
  if(budget > 60 && n.building.length < 4){
    const cands = ownedProvs(n.code).filter(p=>p.dev<10 && p.ctrl===n.code)
      .sort((a,b)=> (b.pop*(1/(b.dev+1))) - (a.pop*(1/(a.dev+1))) );
    for(const p of cands.slice(0,3)){
      const r = startBuild(n.code, p.id, 'factory');
      if(r.ok){ budget -= 30+p.dev*18; break; }
    }
  }
  // 전시 요새화
  if(atWar && budget>80){
    const front = aiFrontProvince(n);
    if(front) startBuild(n.code, front, 'fort');
  }
  if(n.debt>0 && n.gold > reserve*2) repayDebt(n.code, Math.min(n.debt, n.gold-reserve*2));
}

function aiFrontProvince(n){
  let best=null, bestScore=-1;
  for(const p of ownedProvs(n.code)){
    if(p.ctrl!==n.code) continue;
    let danger=0;
    for(const nb of neighbours(p.id)){
      const q=G.provs[nb];
      if(!q) continue;
      if(q.ctrl!==n.code){
        const rel = n.relations[q.ctrl]||0;
        danger += atWarWith(n.code,q.ctrl) ? 5 : (rel<-20?1.5:0.3);
      }
    }
    if(danger>bestScore){ bestScore=danger; best=p.id; }
  }
  return best;
}

function aiDiplomacy(n){
  if(n.pp < 30) return;
  const threat = threatLevel(n);
  const others = Object.keys(G.nats).filter(c=>c!==n.code && G.nats[c].alive);
  // 동맹 탐색
  if(threat > 0.8 && n.allies.length < 3 && n.pp > 40){
    const cand = others.filter(c=>!n.allies.includes(c) && (n.relations[c]||0) > 40 && G.nats[c].score > n.score*0.5);
    if(cand.length){ doDiplo(n.code, pick(cand), 'alliance'); return; }
  }
  // 관계 개선
  const friendly = others.filter(c=>{
    const r=n.relations[c]||0;
    return r>-10 && r<70 && (G.nats[c].gp || bfsDist(n.cap,G.nats[c].cap)<4);
  });
  if(friendly.length && n.pp>25 && rnd()<0.5) doDiplo(n.code, pick(friendly), 'improve');
}

/* ---------- 전쟁 중 기동 ---------- */
function aiWarMoves(n){
  const wars = warsOf(n.code);
  if(!wars.length) return;
  const enemies = new Set();
  for(const w of wars){ const other = sideOf(w,n.code)==='att'? w.def : w.att; other.forEach(c=>enemies.add(c)); }

  // 1) 공격 가능한 전선
  const myProvs = Object.keys(n.armies).filter(id=>n.armies[id]>=1);
  for(const from of myProvs){
    if(!G.provs[from] || G.provs[from].ctrl!==n.code) continue;
    const divs = n.armies[from];
    if(divs < 2) continue;
    const targets = neighbours(from).filter(id=>{
      const q=G.provs[id]; return q && enemies.has(q.ctrl);
    });
    if(!targets.length) continue;
    targets.sort((a,b)=>{
      const ea = G.nats[G.provs[a].ctrl] ? (G.nats[G.provs[a].ctrl].armies[a]||0) : 0;
      const eb = G.nats[G.provs[b].ctrl] ? (G.nats[G.provs[b].ctrl].armies[b]||0) : 0;
      return (ea + G.provs[a].fort*2) - (eb + G.provs[b].fort*2);
    });
    const to = targets[0];
    const enemyNat = G.nats[G.provs[to].ctrl];
    const enemyDivs = enemyNat ? (enemyNat.armies[to]||0) : 0;
    const ter = TERRAIN[G.provs[to].ter]||{def:1};
    const need = enemyDivs * ter.def * (1+G.provs[to].fort*0.18) * 1.35;
    const caution = 1 - n.ai.agg*0.35;
    if(divs > need*caution + 1){
      attack(n.code, from, to, divs);
    }
  }
  // 2) 후방 병력을 전선으로
  const front = aiFrontProvince(n);
  if(front){
    for(const id of Object.keys(n.armies)){
      if(id===front) continue;
      const q=G.provs[id]; if(!q) continue;
      let nearEnemy=false;
      for(const nb of neighbours(id)) if(G.provs[nb] && enemies.has(G.provs[nb].ctrl)) nearEnemy=true;
      if(nearEnemy) continue;
      if(n.armies[id] < 1) continue;
      const path = nextStep(n.code, id, front);
      if(path) moveArmy(n.code, id, path, n.armies[id]);
    }
  }
}
function nextStep(code, from, to){
  const prev={}; const seen={[from]:true}; let fr=[from];
  for(let d=0; d<10 && fr.length; d++){
    const nx=[];
    for(const id of fr) for(const nb of neighbours(id)){
      if(seen[nb]) continue;
      const q=G.provs[nb];
      if(!q) continue;
      if(q.ctrl!==code && !atWarWith(code,q.ctrl) && !G.nats[code].allies.includes(q.ctrl)) continue;
      seen[nb]=true; prev[nb]=id;
      if(nb===to){ let cur=to; while(prev[cur]!==from){ cur=prev[cur]; if(cur===undefined) return null; } return cur; }
      nx.push(nb);
    }
    fr=nx;
  }
  return null;
}

/* ---------- 개전 판단 ---------- */
function aiWarDecision(n){
  if(G.turn < 14) return;            // 개막 1년은 평화 — 플레이어가 나라를 파악할 시간
  if(warsOf(n.code).length) return;
  if(n.exh > 25 || n.stab < 40) return;
  if(n.ai.agg < 0.15) return;
  const cands=[];
  for(const p of ownedProvs(n.code)){
    for(const nb of neighbours(p.id)){
      const q=G.provs[nb]; if(!q||q.own===n.code) continue;
      const t=G.nats[q.own];
      if(!t||!t.alive) continue;
      if(n.allies.includes(q.own)||n.truces[q.own]>G.turn) continue;
      if(t.vassalOf===n.code) continue;
      cands.push(q.own);
    }
  }
  if(!cands.length) return;
  const counts={}; cands.forEach(c=>counts[c]=(counts[c]||0)+1);
  let best=null,bestV=0;
  for(const c in counts){
    const t=G.nats[c];
    const power = (armyTotal(n)*n._m.atk+n.navy*0.4) / (armyTotal(t)*t._m.def + t.navy*0.4 + 1);
    const allyPower = t.allies.reduce((s,a)=>s+(G.nats[a]&&G.nats[a].alive?armyTotal(G.nats[a]):0),0);
    const rel = n.relations[c]||0;
    let v = power*1.2 - allyPower*0.04 + (-rel/45) + n.ai.exp*0.9 + counts[c]*0.10;
    if(t.gp) v -= 1.8;
    if(ADMIN[c] < 0.5) v += 0.6;                 // 약체 국가는 먹잇감
    v -= (t.guaranteedBy||[]).length * 1.2;      // 열강의 보장은 억지력
    v += Math.min(2.0, (t.aggression||0)/25);    // 침략국은 모두의 표적
    v -= Math.min(2.5, n.exh/20) + Math.max(0, (60-n.stab)/25);
    v *= (0.55 + n.ai.agg*0.9);
    if(v>bestV){ bestV=v; best=c; }
  }
  if(!best || bestV < 3.6) return;
  const t=G.nats[best];
  let cb = 'border';
  if(bestV>4.2 && n.pp>70) cb='conquer';
  else if(ADMIN[best]<0.5 && n.pp>40) cb='colony';
  if(n.pp < CBS[cb].pp) return;
  declareWar(n.code, best, cb);
}

/* ---------- AI 강화 판단 ---------- */
function aiPeaceCheck(w){
  const dur = (G.year-w.start.y)*12 + (G.month-w.start.m);
  if(dur < 4) return;
  const attLead=G.nats[w.leadA], defLead=G.nats[w.leadD];
  if(!attLead||!defLead) return;
  const playerIn = w.att.includes(G.player)||w.def.includes(G.player);

  const decide = (side)=>{
    const lead = side==='att'? attLead : defLead;
    const score = side==='att'? w.score : -w.score;
    const other = side==='att'? 'def':'att';
    if(lead.code===G.player) return null;
    // 이기는 쪽: 충분히 얻었으면 강화
    if(score >= 55 || (score>=25 && lead.exh>35) || (score>=15 && dur>48)) return {side, kind:'win'};
    // 지는 쪽: 항복
    if(score <= -45 || (score<=-20 && lead.exh>50)) return {side:other, kind:'surrender'};
    return null;
  };
  const d = decide('att') || decide('def');
  if(!d) return;
  const winner = d.side;
  const winLead = winner==='att'? attLead : defLead;
  const score = winner==='att'? w.score : -w.score;
  const terms = peaceTerms(w, winner);
  const term = terms[terms.length-1];

  if(playerIn){
    const loserIsPlayer = (winner==='att' ? w.def : w.att).includes(G.player);
    G.pending.push({
      type:'peace', warId:w.id, winner, term:term.id, termName:term.n, score:Math.round(score),
      title: loserIsPlayer? '강화 요구' : '강화 제안',
      text: loserIsPlayer
        ? `${winLead.name}이(가) 강화를 요구한다: ${term.n}. 거부하면 전쟁이 계속된다.`
        : `${(winner==='att'?defLead:attLead).name}이(가) 항복을 제안한다: ${term.n}을(를) 받아들이겠는가?`,
    });
    w.offerTurn = G.turn;
  } else {
    makePeace(w, winner, term.id);
  }
}
