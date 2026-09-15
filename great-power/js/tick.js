/* ============================================================
   열강의 시대 1900 — 월간 진행 / 건설 / 행동
   ============================================================ */

const BUILDINGS = {
  factory:{ n:'공장 증설', t:6,  cost:p=>30+p.dev*18, max:p=>p.dev>=10, apply:p=>{p.dev=Math.min(10,p.dev+1);},
            d:'프로빈스 개발도 +1. 세수·연구·인력이 모두 오른다.' },
  fort   :{ n:'요새 건설', t:8,  cost:p=>40+p.fort*32, max:p=>p.fort>=5, apply:p=>{p.fort=Math.min(5,p.fort+1);},
            d:'요새 등급 +1. 방어 전투력이 크게 오른다.' },
  rail   :{ n:'철도 부설', t:10, cost:p=>55+p.rail*40, max:p=>p.rail>=3, apply:p=>{p.rail=Math.min(3,p.rail+1);},
            d:'보급과 개발 성장 속도가 오른다.' },
  admin  :{ n:'총독부 설치', t:5, cost:p=>25, max:p=>p.adminBuilt, apply:p=>{p.adminBuilt=true; p.unrest=Math.max(0,p.unrest-20);},
            d:'점령지 불만을 크게 낮춘다.' },
};
const DIV_COST = 26, DIV_MAN = 3.0, DIV_TIME = 3;
const SHIP_COST = 30, SHIP_TIME = 8;

function startBuild(code, provId, type){
  const n=G.nats[code], p=G.provs[provId], B=BUILDINGS[type];
  if(!n||!p||!B) return {ok:false,msg:'잘못된 요청'};
  if(p.own!==code) return {ok:false,msg:'내 영토가 아니다'};
  if(B.max(p)) return {ok:false,msg:'더 이상 확장할 수 없다'};
  if(n.building.some(b=>b.prov===provId && b.type===type)) return {ok:false,msg:'이미 공사 중이다'};
  const cost = Math.round(B.cost(p) * n._m.bld);
  if(n.gold < cost) return {ok:false,msg:`국고 부족 (필요 £${cost}백만)`};
  n.gold -= cost;
  n.building.push({prov:provId, type, left:B.t, cost});
  return {ok:true,msg:`${p.name}에 ${B.n} 착공 (£${cost}백만, ${B.t}개월)`};
}
function recruit(code, provId, count){
  const n=G.nats[code], p=G.provs[provId];
  if(!n||!p||p.own!==code||p.ctrl!==code) return {ok:false,msg:'모병할 수 없는 지역'};
  count = Math.max(1, Math.floor(count));
  const cost = count*DIV_COST, man = count*DIV_MAN;
  if(n.gold < cost) return {ok:false,msg:`국고 부족 (필요 £${cost}백만)`};
  if(freeManpower(n) < man) return {ok:false,msg:`동원 가능 인력 부족 (필요 ${man.toFixed(0)}만, 여유 ${freeManpower(n).toFixed(0)}만)`};
  n.gold -= cost;
  n.recruiting.push({prov:provId, count, left:DIV_TIME, kind:'army'});
  return {ok:true,msg:`${p.name}에서 ${count}개 사단 모병 시작 (${DIV_TIME}개월)`};
}
function buildShips(code, count){
  const n=G.nats[code];
  count=Math.max(1,Math.floor(count));
  const cost=count*SHIP_COST;
  if(n.gold<cost) return {ok:false,msg:`국고 부족 (필요 £${cost}백만)`};
  let port=false;
  for(const p of ownedProvs(code)) if(p.coast && p.ctrl===code){ port=true; break; }
  if(!port) return {ok:false,msg:'바다에 면한 항구가 없다'};
  const pending = n.recruiting.filter(r=>r.kind==='navy').reduce((s,r)=>s+r.count,0);
  if(n.navy + pending + count > maxNavy(n))
    return {ok:false,msg:`조선 능력 초과 (연안 공업 기준 최대 ${maxNavy(n)}척)`};
  n.gold-=cost; n.recruiting.push({count,left:SHIP_TIME,kind:'navy'});
  return {ok:true,msg:`주력함 ${count}척 기공 (${SHIP_TIME}개월)`};
}
function moveArmy(code, from, to, divs){
  const n=G.nats[code];
  if(!n.armies[from]) return {ok:false,msg:'병력이 없다'};
  if(!neighbours(from).includes(to)) return {ok:false,msg:'인접하지 않다'};
  const t=G.provs[to];
  if(t.ctrl!==code){
    const owner=G.nats[t.ctrl];
    if(owner && !atWarWith(code,t.ctrl) && !n.allies.includes(t.ctrl) && t.ctrl!==code)
      return {ok:false,msg:`${owner.adj} 영토다. 통행권이 없다`};
  }
  divs=Math.min(divs, n.armies[from]);
  if(divs<=0) return {ok:false,msg:'병력이 없다'};
  if(isSeaLink(from,to) && n.navy<3) return {ok:false,msg:'해상 이동에는 해군 3척 이상 필요'};
  n.armies[from]-=divs; if(n.armies[from]<=0.05) delete n.armies[from];
  n.armies[to]=(n.armies[to]||0)+divs;
  return {ok:true,msg:`${G.provs[from].name} → ${G.provs[to].name} ${divs.toFixed(0)}개 사단 이동`};
}
function startResearch(code, branch, techId){
  const n=G.nats[code], t=TECHS[techId];
  if(!t||t.b!==branch) return {ok:false,msg:'잘못된 기술'};
  if(n.techs[techId]) return {ok:false,msg:'이미 연구했다'};
  if(G.year < t.y) return {ok:false,msg:`${t.y}년 이후에 연구할 수 있다`};
  if(t.r) for(const r of t.r) if(!n.techs[r]) return {ok:false,msg:`선행 기술 필요: ${TECHS[r].n}`};
  n.research[branch]=techId; n.progress[branch]=n.progress[branch]||0;
  return {ok:true,msg:`${t.n} 연구 시작`};
}
function availableTechs(n, branch){
  const out=[];
  for(const id in TECHS){ const t=TECHS[id];
    if(t.b!==branch || n.techs[id]) continue;
    if(G.year < t.y) continue;
    if(t.r && t.r.some(r=>!n.techs[r])) continue;
    out.push(id);
  }
  return out.sort((a,b)=>TECHS[a].c-TECHS[b].c);
}
function changeGovernment(code, gov){
  const n=G.nats[code];
  if(!GOVS[gov]) return {ok:false,msg:'없는 체제'};
  if(n.gov===gov) return {ok:false,msg:'이미 그 체제다'};
  const cost = 120;
  if(n.pp<cost) return {ok:false,msg:`정치력 부족 (필요 ${cost})`};
  n.pp-=cost;
  const old=GOVS[n.gov].name;
  n.gov=gov; n.legit=Math.max(20,n.legit-25); n.stab-=12;
  for(const p of ownedProvs(code)) p.unrest += 10;
  n._m=calcMods(n);
  logEvent('정체 변혁', `${n.name}: ${old} → ${GOVS[gov].name}. 혼란이 뒤따른다.`, 'politics', code);
  return {ok:true,msg:`정부 형태가 ${GOVS[gov].name}(으)로 바뀌었다`};
}
function takeLoan(code, amt){
  const n=G.nats[code];
  if(!n.techs.p3) return {ok:false,msg:'중앙은행이 없어 국채를 발행할 수 없다'};
  const cap = Math.max(50, nationIncome(n)*24);
  if(n.debt+amt > cap) return {ok:false,msg:`신용 한도 초과 (한도 £${cap.toFixed(0)}백만)`};
  n.debt+=amt; n.gold+=amt;
  return {ok:true,msg:`국채 £${amt}백만 발행 (총 부채 £${n.debt.toFixed(0)}백만)`};
}
function repayDebt(code, amt){
  const n=G.nats[code]; amt=Math.min(amt,n.debt,n.gold);
  if(amt<=0) return {ok:false,msg:'상환할 수 없다'};
  n.gold-=amt; n.debt-=amt;
  return {ok:true,msg:`부채 £${amt.toFixed(0)}백만 상환`};
}

/* ============================================================
   월간 진행
   ============================================================ */
function nextTurn(){
  G.turn++;
  G.month++; if(G.month>11){ G.month=0; G.year++; }
  G.monthReport = { income:0, expense:0, events:[] };

  for(const code in G.nats){
    const n=G.nats[code]; if(!n.alive) continue;
    n._m = calcMods(n);
  }
  for(const code in G.nats){
    const n=G.nats[code]; if(!n.alive) continue;
    economyTick(n); researchTick(n); buildTick(n); manpowerTick(n); stabilityTick(n);
  }
  provinceTick();
  warTick();
  aiTick();
  eventTick();
  recalcScores();
  if(G.year >= G.endYear) G.finished = true;
  return G.monthReport;
}

function economyTick(n){
  const inc = nationIncome(n), exp = nationExpense(n);
  n.income=inc; n.expense=exp;
  n.gold += inc-exp;
  if(n.code===G.player){ G.monthReport.income=inc; G.monthReport.expense=exp; }
  if(n.gold < 0){
    // 강제 차입 또는 파산
    if(n.techs.p3 && n.debt < nationIncome(n)*24){ n.debt += -n.gold + 10; n.gold = 10; }
    else {
      n.gold = 0; n.stab -= 2.5; n.pres -= 0.4;
      if(rnd()<0.12){
        const ids=Object.keys(n.armies).filter(i=>n.armies[i]>0);
        if(ids.length){ const id=pick(ids); n.armies[id]=Math.max(0,n.armies[id]-1);
          logEvent('재정 파탄', `${n.name}: 봉급을 주지 못해 1개 사단이 해산되었다.`, 'bad', n.code); }
      }
    }
  }
  // 정치력
  n.pp = Math.min(300, n.pp + n._m.pp + n.pres*0.012 + (n.stab-50)*0.02);
}

function researchTick(n){
  const rp = researchPoints(n);
  n.rp = rp;
  for(const b of ['ind','pol','mil']){
    const id = n.research[b];
    if(!id){ continue; }
    const share = (n.alloc[b]||33)/100;
    n.progress[b] += rp*share;
    const t=TECHS[id];
    if(n.progress[b] >= t.c){
      n.progress[b] -= t.c; n.techs[id]=true; n.research[b]=null; n._m=calcMods(n);
      if(n.code===G.player) logEvent('연구 완료', `${t.n} — ${t.d}`, 'tech', n.code);
      // AI는 즉시 다음 기술
      if(n.code!==G.player){ const av=availableTechs(n,b); if(av.length) n.research[b]=av[0]; }
    }
  }
}

function buildTick(n){
  for(let i=n.building.length-1;i>=0;i--){
    const b=n.building[i]; b.left--;
    if(b.left<=0){
      const p=G.provs[b.prov];
      if(p && p.own===n.code){ BUILDINGS[b.type].apply(p);
        if(n.code===G.player) logEvent('공사 완료', `${p.name}: ${BUILDINGS[b.type].n} 완공`, 'build', n.code); }
      n.building.splice(i,1);
    }
  }
  for(let i=n.recruiting.length-1;i>=0;i--){
    const r=n.recruiting[i]; r.left--;
    if(r.left<=0){
      if(r.kind==='navy'){ n.navy+=r.count;
        if(n.code===G.player) logEvent('함선 진수', `주력함 ${r.count}척이 함대에 합류했다`, 'build', n.code); }
      else {
        const dest = (G.provs[r.prov] && G.provs[r.prov].ctrl===n.code) ? r.prov : n.cap;
        n.armies[dest]=(n.armies[dest]||0)+r.count;
        if(n.code===G.player) logEvent('신병 배치', `${G.provs[dest].name}에 ${r.count}개 사단 편성 완료`, 'build', n.code);
      }
      n.recruiting.splice(i,1);
    }
  }
}

function manpowerTick(n){
  n.maxMan = maxManpower(n);
  n.casualties = Math.max(0, (n.casualties||0) - 0.35*(1 + (n.techs.p11?0.4:0)));
  n.manpower = freeManpower(n);
}

function stabilityTick(n){
  const prov=ownedProvs(n.code);
  let unrest=0; for(const p of prov) unrest+=p.unrest;
  const avg = prov.length? unrest/prov.length : 0;
  const target = 50 + n._m.stab + (n.legit-70)*0.15 - n.exh*1.1 - avg*0.35
               + n.pres*0.04 - (n.debt>0? Math.min(8, n.debt/40):0) - (n._m.unrest||0);
  n.stab += (target-n.stab)*0.25;
  n.stab = Math.max(0, Math.min(100, n.stab));
  n.legit = Math.min(100, n.legit + (n.stab>60?0.12:-0.05));
  if(warsOf(n.code).length) n.exh += 0.18 * n._m.exh;
  else n.exh = Math.max(0, n.exh-0.35);
  n.exh = Math.min(100, n.exh);
  n.aggression = Math.max(0, n.aggression - 0.25);
}

function provinceTick(){
  for(const id in G.provs){
    const p=G.provs[id];
    const owner=G.nats[p.own];
    if(!owner||!owner.alive) continue;
    // 인구
    const war = warsOf(p.own).length>0;
    let growth = 0.00062 + p.dev*0.000055 + (p.rail*0.00008);
    if(war) growth *= 0.45;
    if(p.own!==p.ctrl) growth *= 0.2;
    p.pop *= (1+growth);
    // 개발도 자연 성장
    if(p.dev < (p.colonial?5:8) && rnd() < 0.006*owner._m.grw*(1+p.rail*0.3)) p.dev++;
    // 불만
    let t = 0;
    if(p.own!==p.ctrl) t = 45;
    else if(!p.cores.includes(p.own)) t = p.colonial? 14 : 22;
    t -= (owner.stab-50)*0.25;
    t += (owner._m.unrest||0);
    if(p.adminBuilt) t -= 10;
    t = Math.max(0,t);
    p.unrest += (t-p.unrest)*0.12;
    // 핵심주 편입 (오래 지배하면)
    if(p.own===p.ctrl && !p.cores.includes(p.own) && p.unrest<8 && rnd()<0.004){
      p.cores.push(p.own);
      logEvent('동화', `${p.name}이(가) ${owner.adj}의 핵심 영토가 되었다.`, 'politics', p.own);
    }
    // 반란
    if(p.unrest>68 && rnd()<0.012){
      const target = p.cores.find(c=>c!==p.own && G.nats[c] && G.nats[c].alive);
      p.unrest = 30;
      if(target){ transferProvince(id, target);
        logEvent('민족 봉기', `${p.name}에서 봉기가 일어나 ${G.nats[target].adj}에 합류했다!`, 'bad', p.own); }
      else { owner.stab-=6;
        logEvent('폭동', `${p.name}에서 대규모 폭동이 발생했다.`, 'bad', p.own); }
    }
  }
}

/* ---------- 전쟁 처리 ---------- */
function warTick(){
  for(const w of [...G.wars]){
    updateWarScore(w);
    // 무방비 지역 자동 점령(포위)
    for(const attCode of w.att) sieges(attCode, w);
    for(const defCode of w.def) sieges(defCode, w);
    // 장기전 피로
    const dur = (G.year-w.start.y)*12 + (G.month-w.start.m);
    if(dur>0 && dur%12===0){
      for(const c of [...w.att,...w.def]) if(G.nats[c]) G.nats[c].exh += 1.2;
    }
    // AI 강화 판단
    aiPeaceCheck(w);
  }
}
function sieges(code, w){
  const enemy = sideOf(w,code)==='att' ? w.def : w.att;
  for(const id in G.provs){
    const p=G.provs[id];
    if(!enemy.includes(p.ctrl)) continue;
    const myArmy = (G.nats[code].armies[id]||0);
    if(myArmy<=0) continue;
    const enemyArmy = G.nats[p.ctrl] ? (G.nats[p.ctrl].armies[id]||0) : 0;
    if(enemyArmy>0) continue;
    p.siege += myArmy*1.6;
    if(p.siege >= 8 + p.fort*10 + p.dev*1.2){ p.siege=0; occupyProvince(id, code, w); }
  }
}
