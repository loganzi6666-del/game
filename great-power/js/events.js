/* ============================================================
   열강의 시대 1900 — 사건
   ============================================================ */
function alive(c){ return G.nats[c] && G.nats[c].alive; }
function nat(c){ return G.nats[c]; }
function addUnrestAll(code, v){ for(const p of ownedProvs(code)) p.unrest = Math.max(0, p.unrest+v); }

/* ── 역사적 사건 ───────────────────────────── */
const HIST = [
  { id:'victoria', y:1901, m:0, c:()=>alive('GBR'), n:'GBR',
    t:'빅토리아 여왕 서거',
    x:'64년간 제국을 통치한 여왕이 오즈번 하우스에서 눈을 감았다. 한 시대가 끝났다.',
    ch:[{t:'국장을 성대히 치른다', d:'정통성 +6, 국고 -30', f:n=>{ n.legit+=6; n.gold-=30; }},
        {t:'조용히 넘긴다', d:'안정 -3', f:n=>{ n.stab-=3; }}] },

  { id:'anglojap', y:1902, m:0, c:()=>alive('GBR')&&alive('JPN'), n:null,
    t:'영일동맹',
    x:'런던에서 영국과 일본이 동맹을 체결했다. 러시아의 남하를 함께 막기로 한 것이다.',
    auto:()=>{ const a=nat('GBR'), b=nat('JPN');
      if(!a.allies.includes('JPN')){ a.allies.push('JPN'); b.allies.push('GBR'); }
      a.relations.JPN=b.relations.GBR=80; a.relations.RUS=(a.relations.RUS||0)-10; } },

  { id:'russojap', y:1904, m:1, c:()=>alive('RUS')&&alive('JPN')&&!atWarWith('RUS','JPN'), n:'JPN',
    t:'뤼순 앞바다',
    x:'만주와 조선을 둘러싼 러시아와의 긴장이 한계에 이르렀다. 연합함대는 출격 명령만 기다린다.',
    ch:[{t:'기습 공격을 감행한다', d:'러시아에 선전포고', f:n=>{ nat('JPN').pp+=60; declareWar('JPN','RUS','conquer'); }},
        {t:'협상을 택한다', d:'위신 -5, 관계 +20', f:n=>{ n.pres-=5; n.relations.RUS=(n.relations.RUS||0)+20; }}] },

  { id:'bloodysunday', y:1905, m:0, c:()=>alive('RUS'), n:'RUS',
    t:'피의 일요일',
    x:'겨울궁전 앞 청원 행렬에 근위대가 발포했다. 제국 전역에서 파업이 번진다.',
    ch:[{t:'두마를 설치한다', d:'입헌군주제로 이행, 안정 회복', f:n=>{ n.gov='con'; n.stab+=6; n._m=calcMods(n); addUnrestAll('RUS',-8); }},
        {t:'코사크를 보낸다', d:'불만 +18, 정통성 -10', f:n=>{ addUnrestAll('RUS',18); n.legit-=10; }}] },

  { id:'dreadnought', y:1906, m:11, c:()=>alive('GBR'), n:'GBR',
    t:'드레드노트 진수',
    x:'포츠머스에서 단 한 척의 군함이 세계의 모든 전함을 구식으로 만들었다.',
    auto:()=>{ nat('GBR').techs.m5=true; nat('GBR').navy+=4; nat('GBR').pres+=8;
      for(const c in G.nats) if(c!=='GBR' && nat(c).gp) nat(c).relations.GBR=(nat(c).relations.GBR||0)-5; } },

  { id:'youngturk', y:1908, m:6, c:()=>alive('OTT')&&nat('OTT').gov==='abs', n:'OTT',
    t:'청년 튀르크 혁명',
    x:'살로니카의 장교들이 헌법 부활을 요구하며 봉기했다. 술탄의 시대가 저물고 있다.',
    ch:[{t:'헌법을 복원한다', d:'입헌군주제, 안정 +8, 연구 +', f:n=>{ n.gov='con'; n.stab+=8; n._m=calcMods(n); }},
        {t:'유혈 진압한다', d:'불만 +22, 정통성 -12', f:n=>{ addUnrestAll('OTT',22); n.legit-=12; }}] },

  { id:'xinhai', y:1911, m:9, c:()=>alive('QIN')&&nat('QIN').gov==='abs', n:'QIN',
    t:'신해혁명',
    x:'우창에서 신군이 봉기했다. 남방 각 성이 잇따라 독립을 선포한다. 268년의 왕조가 흔들린다.',
    ch:[{t:'공화국을 선포한다', d:'공화정 전환, 행정역량 상승', f:n=>{ n.gov='rep'; n.name='중화민국'; n.adj='중국'; ADMIN.QIN=0.5; n.legit=55; n._m=calcMods(n); addUnrestAll('QIN',-10); }},
        {t:'끝까지 저항한다', d:'대규모 반란 위험', f:n=>{ addUnrestAll('QIN',30); n.stab-=15; }}] },

  { id:'balkan', y:1912, m:9, c:()=>alive('OTT')&&(alive('SER')||alive('BUL')||alive('GRE')), n:null,
    t:'발칸 전쟁',
    x:'세르비아·불가리아·그리스가 발칸 동맹을 결성해 오스만에 선전포고했다.',
    auto:()=>{ for(const c of ['SER','BUL','GRE']) if(alive(c) && !atWarWith(c,'OTT')){
        nat(c).pp+=70; declareWar(c,'OTT','liberate'); } } },

  { id:'sarajevo', y:1914, m:5, c:()=>alive('AUH')&&alive('SER'), n:null,
    t:'사라예보의 총성',
    x:'오스트리아 황태자 부부가 사라예보에서 암살되었다. 유럽의 화약고에 불이 붙었다.',
    auto:()=>{ const a=nat('AUH');
      a.relations.SER=-100; if(nat('SER')) nat('SER').relations.AUH=-100;
      a.pp+=80;
      if(alive('SER') && !atWarWith('AUH','SER')) declareWar('AUH','SER','conquer');
      for(const c in G.nats){ nat(c).exh+=1; }
      G.flags.greatWar=true; } },

  { id:'revolution', y:1917, m:2, c:()=>alive('RUS')&&(nat('RUS').stab<52||nat('RUS').exh>30), n:'RUS',
    t:'2월 혁명',
    x:'페트로그라드의 빵 줄이 시위로, 시위가 혁명으로 번졌다. 차르가 퇴위했다.',
    ch:[{t:'임시정부를 세운다', d:'공화정, 안정 소폭 회복', f:n=>{ n.gov='rep'; n.stab+=5; n.legit=50; n._m=calcMods(n); }},
        {t:'소비에트가 권력을 잡는다', d:'사회주의 공화국 — 공업 +, 열강과 단절', f:n=>{
            n.gov='soc'; n.name='소비에트 연방'; n.adj='소련'; n.legit=45; n.exh=0; n._m=calcMods(n);
            for(const c in G.nats) if(c!=='RUS') nat(c).relations.RUS=Math.min(nat(c).relations.RUS||0, -40);
            addUnrestAll('RUS',15); }}] },

  { id:'flu', y:1918, m:8, c:()=>true, n:null,
    t:'스페인 독감',
    x:'전선에서 시작된 역병이 전 세계를 덮쳤다. 수천만 명이 쓰러진다.',
    auto:()=>{ for(const id in G.provs){ G.provs[id].pop *= 0.972; }
      for(const c in G.nats){ nat(c).stab-=4; nat(c).casualties=Math.min(60,(nat(c).casualties||0)+8); } } },

  { id:'crash', y:1929, m:9, c:()=>true, n:null,
    t:'검은 목요일',
    x:'월스트리트가 무너졌다. 신용이 증발하고 공장의 불이 꺼진다.',
    auto:()=>{ for(const c in G.nats){ const n=nat(c);
        n.gold*=0.55; n.stab-=10; addUnrestAll(c, 14);
        if(n.debt>0) n.debt*=1.25; }
      G.flags.depression=true; } },

  { id:'marchrome', y:1922, m:9, c:()=>alive('ITA')&&nat('ITA').stab<65, n:'ITA',
    t:'로마 진군',
    x:'검은 셔츠단이 로마로 행진한다. 국왕은 그들에게 정권을 넘길지 결정해야 한다.',
    ch:[{t:'정권을 넘긴다', d:'국가주의 독재 — 군사력 ++, 세계의 경계', f:n=>{ n.gov='fas'; n.legit=60; n.stab+=6; n._m=calcMods(n); n.aggression+=20; }},
        {t:'계엄령으로 막는다', d:'안정 -8, 불만 +15', f:n=>{ n.stab-=8; addUnrestAll('ITA',15); }}] },

  { id:'machtergreifung', y:1933, m:0, c:()=>alive('GER')&&(nat('GER').stab<70), n:'GER',
    t:'권력 장악',
    x:'대공황과 배상금에 지친 국민이 극단을 선택했다. 새 총리가 전권을 요구한다.',
    ch:[{t:'수권법을 통과시킨다', d:'국가주의 독재 — 군사 +30%, 침략성 급등', f:n=>{ n.gov='fas'; n.legit=65; n.stab+=10; n._m=calcMods(n); n.aggression+=30; n.pp+=80; }},
        {t:'헌정을 지킨다', d:'안정 -10, 정치력 -40', f:n=>{ n.stab-=10; n.pp=Math.max(0,n.pp-40); }}] },

  { id:'ww2', y:1939, m:8, c:()=>G.flags.greatWar!==undefined||true, n:null,
    t:'다시, 전쟁',
    x:'유럽이 또 한 번 총동원령을 내린다. 이번에는 아무도 크리스마스까지 끝난다고 말하지 않는다.',
    auto:()=>{ for(const c in G.nats){ const n=nat(c); n.pp+=40; n.exh+=2; } G.flags.ww2=true; } },
];

/* ── 랜덤 사건 ─────────────────────────────── */
const RANDOM = [
  { id:'strike', w:10, c:n=>n.stab<70, t:'총파업',
    x:'주요 공업 도시의 노동자들이 일손을 놓았다. 굴뚝에서 연기가 멎었다.',
    ch:[{t:'요구를 수용한다', d:'국고 -40, 안정 +6', f:n=>{ n.gold-=40; n.stab+=6; addUnrestAll(n.code,-6); }},
        {t:'군을 투입한다', d:'불만 +14, 안정 -4', f:n=>{ addUnrestAll(n.code,14); n.stab-=4; }}] },
  { id:'harvest', w:8, c:()=>true, t:'대풍년',
    x:'기록적인 수확이다. 곡물 가격이 떨어지고 곳간이 가득 찼다.',
    ch:[{t:'비축한다', d:'국고 +35, 안정 +3', f:n=>{ n.gold+=35; n.stab+=3; }},
        {t:'수출한다', d:'국고 +60, 위신 +2', f:n=>{ n.gold+=60; n.pres+=2; }}] },
  { id:'goldrush', w:5, c:()=>true, t:'금광 발견',
    x:'변경의 강바닥에서 사금이 발견되었다. 사람들이 몰려든다.',
    ch:[{t:'국영으로 개발한다', d:'국고 +90', f:n=>{ n.gold+=90; }},
        {t:'민간에 개방한다', d:'해당 지역 개발도 +1, 불만 +5', f:n=>{ const ps=ownedProvs(n.code); if(ps.length){ const p=pick(ps); p.dev=Math.min(10,p.dev+1); p.unrest+=5; } }}] },
  { id:'cholera', w:7, c:()=>true, t:'콜레라 창궐',
    x:'항구 도시에서 시작된 역병이 내륙으로 번진다.',
    ch:[{t:'검역을 강화한다', d:'국고 -45, 피해 최소', f:n=>{ n.gold-=45; n.stab-=2; }},
        {t:'방치한다', d:'인구 감소, 불만 +12', f:n=>{ for(const p of ownedProvs(n.code)) p.pop*=0.985; addUnrestAll(n.code,12); }}] },
  { id:'succession', w:5, c:n=>['abs','con','theo'].includes(n.gov), t:'왕위 계승 분쟁',
    x:'후계를 둘러싸고 궁정이 둘로 갈라졌다.',
    ch:[{t:'장자에게 넘긴다', d:'정통성 +8', f:n=>{ n.legit+=8; }},
        {t:'유능한 방계를 세운다', d:'정통성 -10, 정치력 +40', f:n=>{ n.legit-=10; n.pp+=40; }}] },
  { id:'colrevolt', w:9, c:n=>ownedProvs(n.code).some(p=>p.colonial), t:'식민지 봉기',
    x:'총독부가 불타고 있다. 원주민 지도자가 독립을 선포했다.',
    ch:[{t:'무력 진압', d:'국고 -50, 불만 -15', f:n=>{ n.gold-=50; for(const p of ownedProvs(n.code)) if(p.colonial) p.unrest=Math.max(0,p.unrest-15); }},
        {t:'자치를 허용', d:'식민 수입 -, 안정 +5', f:n=>{ n.stab+=5; for(const p of ownedProvs(n.code)) if(p.colonial){ p.unrest=Math.max(0,p.unrest-25); p.dev=Math.max(1,p.dev); } }}] },
  { id:'inventor', w:7, c:()=>true, t:'발명가의 청원',
    x:'무명의 기술자가 설계도를 들고 찾아왔다. 대부분의 심사관은 회의적이다.',
    ch:[{t:'연구비를 지원한다', d:'국고 -35, 연구 진척 +', f:n=>{ n.gold-=35; for(const b of ['ind','pol','mil']) n.progress[b]+=researchPoints(n)*1.5; }},
        {t:'돌려보낸다', d:'변화 없음', f:()=>{}}] },
  { id:'scandal', w:7, c:()=>true, t:'외교 스캔들',
    x:'비밀 전문이 신문 1면에 실렸다. 동맹국들이 해명을 요구한다.',
    ch:[{t:'외무장관을 경질한다', d:'정치력 -25, 관계 회복', f:n=>{ n.pp=Math.max(0,n.pp-25); for(const c in n.relations) n.relations[c]+=5; }},
        {t:'부인한다', d:'위신 -6, 주변국 관계 -8', f:n=>{ n.pres-=6; for(const c in n.relations){ n.relations[c]-=8; if(G.nats[c]) G.nats[c].relations[n.code]=n.relations[c]; } }}] },
  { id:'immigrants', w:6, c:()=>true, t:'대규모 이민 유입',
    x:'구대륙의 가난을 피해 배가 줄지어 들어온다.',
    ch:[{t:'받아들인다', d:'인구 +2%, 불만 +4', f:n=>{ for(const p of ownedProvs(n.code)) if(!p.colonial) p.pop*=1.02; addUnrestAll(n.code,4); }},
        {t:'문을 닫는다', d:'안정 +3', f:n=>{ n.stab+=3; }}] },
  { id:'militarycoup', w:4, c:n=>n.stab<42, t:'군부의 움직임',
    x:'수도 근교 사단이 명령 없이 이동 중이라는 보고가 들어왔다.',
    ch:[{t:'선제적으로 숙청한다', d:'군 -3개 사단, 안정 +8', f:n=>{ const ids=Object.keys(n.armies); if(ids.length){const id=pick(ids); n.armies[id]=Math.max(0,n.armies[id]-3);} n.stab+=8; }},
        {t:'타협한다', d:'군사정권 위험, 정치력 -50', f:n=>{ n.pp=Math.max(0,n.pp-50); if(rnd()<0.4){ n.gov='jun'; n._m=calcMods(n); logEvent('쿠데타',`${n.name}에서 군부가 정권을 장악했다.`,'bad',n.code); } }}] },
  { id:'trade', w:8, c:()=>true, t:'통상 조약 제안',
    x:'이웃 나라가 관세 인하를 제안해 왔다.',
    ch:[{t:'체결한다', d:'국고 +50, 관계 +10', f:n=>{ n.gold+=50; for(const c in n.relations) if(n.relations[c]>0){ n.relations[c]+=10; if(G.nats[c])G.nats[c].relations[n.code]=n.relations[c]; break; } }},
        {t:'보호무역을 택한다', d:'산업 성장, 관계 -6', f:n=>{ const ps=ownedProvs(n.code).filter(p=>!p.colonial); if(ps.length) pick(ps).dev=Math.min(10,pick(ps).dev+1); }}] },
  { id:'nobel', w:4, c:n=>Object.keys(n.techs).length>14, t:'국제 학회의 영예',
    x:'우리 학자가 세계적인 상을 받았다. 신문이 자랑스러워한다.',
    ch:[{t:'국가적으로 기린다', d:'위신 +8, 연구 +', f:n=>{ n.pres+=8; n.progress.ind+=researchPoints(n); }}] },
  { id:'famine', w:6, c:n=>ownedProvs(n.code).some(p=>p.res==='gr'), t:'기근',
    x:'작황이 실패했다. 곡창 지대에서 사람들이 굶고 있다.',
    ch:[{t:'구휼미를 푼다', d:'국고 -60, 안정 +4', f:n=>{ n.gold-=60; n.stab+=4; }},
        {t:'시장에 맡긴다', d:'인구 -1.5%, 불만 +18', f:n=>{ for(const p of ownedProvs(n.code)) p.pop*=0.985; addUnrestAll(n.code,18); }}] },
  { id:'fleetweek', w:5, c:n=>n.navy>4, t:'관함식',
    x:'함대를 항구에 늘어세워 국력을 과시할 기회다.',
    ch:[{t:'성대히 연다', d:'국고 -30, 위신 +7', f:n=>{ n.gold-=30; n.pres+=7; }},
        {t:'생략한다', d:'국고 절약', f:n=>{ n.gold+=5; }}] },
  { id:'unionrail', w:6, c:()=>true, t:'철도 확장 청원',
    x:'상공회의소가 간선 철도 부설을 요구한다.',
    ch:[{t:'국비로 부설한다', d:'국고 -70, 무작위 지역 철도 +1', f:n=>{ n.gold-=70; const ps=ownedProvs(n.code).filter(p=>p.rail<3); if(ps.length) pick(ps).rail++; }},
        {t:'민간에 맡긴다', d:'변화 없음', f:()=>{}}] },
];

/* ── 처리 ─────────────────────────────────── */
function eventTick(){
  // 역사
  for(const e of HIST){
    if(G.flags['ev_'+e.id]) continue;
    if(G.year<e.y || (G.year===e.y && G.month<e.m)) continue;
    if(G.year>e.y+2) { G.flags['ev_'+e.id]=true; continue; }
    if(e.c && !e.c()) continue;
    G.flags['ev_'+e.id]=true;
    if(e.auto){ e.auto(); logEvent(e.t, e.x, 'hist'); continue; }
    const target = e.n;
    if(target===G.player){ G.pending.push({type:'event', ev:e, code:target}); }
    else if(target && alive(target)){
      const ch = aiChoose(nat(target), e);
      ch.f(nat(target));
      logEvent(e.t, `${nat(target).name}: ${e.x} → ${ch.t}`, 'hist', target);
    }
  }
  // 랜덤 — 국가당 평균 2~3년에 한 번
  for(const c in G.nats){
    const n=G.nats[c]; if(!n.alive) continue;
    if(rnd() > 0.028) continue;
    const pool = RANDOM.filter(e=>!e.c || e.c(n));
    if(!pool.length) continue;
    let tot=0; for(const e of pool) tot+=e.w;
    let r=rnd()*tot, ev=pool[0];
    for(const e of pool){ r-=e.w; if(r<=0){ ev=e; break; } }
    if(c===G.player) G.pending.push({type:'event', ev, code:c});
    else { const ch=aiChoose(n,ev); ch.f(n); }
  }
}
function aiChoose(n, e){
  if(!e.ch || !e.ch.length) return {t:'',f:()=>{}};
  if(e.ch.length===1) return e.ch[0];
  // 성향에 따라: 공격적이면 강경책(두 번째), 아니면 온건책
  const hard = n.ai.agg > 0.5 || n.gov==='abs' || n.gov==='jun' || n.gov==='fas';
  if(n.gold < 60) return e.ch.find(c=>!/국고 -/.test(c.d||'')) || e.ch[0];
  return hard ? e.ch[e.ch.length-1] : e.ch[0];
}
function resolveEvent(p, idx){
  const e=p.ev, n=G.nats[p.code];
  const ch=e.ch[idx] || e.ch[0];
  ch.f(n); n._m=calcMods(n);
  logEvent(e.t, `${e.x} → ${ch.t}`, 'hist', p.code);
}
