/* LIFE : RISE V0.9.9 — RIVAL / PROMOTION BOARD / WORK INCIDENTS / ACHIEVEMENTS
   일하기 화면을 "버튼 한 번"이 아니라 경쟁과 선택이 있는 무대로 만든다.
   모든 인물·조직·사건은 가상 시뮬레이션이다. */
const V099={version:'0.9.9'};

/* ── 상태 ───────────────────────────────────────── */
function ensureV099(){
  if(typeof ensureV098==='function')ensureV098();
  S.version='0.9.9';
  S.v099=S.v099||{};
  const x=S.v099;
  x.rivals=x.rivals||{};
  x.promo=x.promo||{pending:false,attempts:0,bonus:0,lastResult:null,history:[]};
  x.rhythm=x.rhythm||{last:null,combo:0,streak:0,fatigue:0};
  x.ach=x.ach||{};
  x.counters=x.counters||{incidents:0,boardWin:0,boardFail:0,coop:0,checks:0,scouts:0};
  if(S.career)v099Rival(true);
}
function v099Money(n){return typeof v093Money==='function'?v093Money(n):KRW(n)}
function v099Need(){return typeof v093Need==='function'?v093Need():100+(S.level||0)*28}
function v099MaxLevel(k){return (careers[k||S.career]?.levels?.length||1)-1}
function v099Rank(k,lv){const c=careers[k];if(!c)return '경력';return c.levels[clamp(lv,0,c.levels.length-1)]}
function v099Primary(){return careers[S.career]?.primary||'int'}
const V099_STAT_KR={int:'지능',cha:'매력',lead:'리더십',pol:'정치력',net:'인맥',health:'건강'};

/* ── 라이벌 ─────────────────────────────────────── */
const V099_RIVAL_NAMES=['강도현','서지훈','박세라','정민우','한유진','오승표','김태경','윤하람','임도경','최나윤','배성준','조은결','신아린','권재호'];
const V099_TRAITS={
  ace:{name:'실력파',icon:'🎯',line:'성과로 정면돌파한다. 진급점수가 빠르게 쌓인다.',speed:1.22,politic:.85,dirty:.15},
  politician:{name:'정치형',icon:'🕴',line:'윗선 라인을 탄다. 승진 심사에서 당신을 밀어낸다.',speed:1.00,politic:1.45,dirty:.35},
  grinder:{name:'성실형',icon:'🧱',line:'느리지만 절대 멈추지 않는다.',speed:1.08,politic:.90,dirty:.10},
  schemer:{name:'모략가',icon:'🐍',line:'뒤에서 흠집을 낸다. 사고가 잦다.',speed:.95,politic:1.20,dirty:.60}
};

function v099NewRival(career){
  const used=Object.values(S.v099.rivals).filter(Boolean).map(r=>r.name);
  const pool=V099_RIVAL_NAMES.filter(n=>!used.includes(n));
  const src=pool.length?pool:V099_RIVAL_NAMES;
  const keys=Object.keys(V099_TRAITS);
  return {
    career,name:src[Math.floor(Math.random()*src.length)],trait:keys[Math.floor(Math.random()*keys.length)],
    level:clamp(S.level||0,0,v099MaxLevel(career)),xp:Math.round(Math.random()*40),
    skill:Math.round((.85+Math.random()*.5)*100)/100,relation:48,promotions:0,
    scouted:false,retired:false,since:S.date,note:'같은 해 같은 자리에서 출발했다.'
  };
}
function v099Rival(create=false){
  if(!S.career)return null;
  if(!S.v099)return null;
  const cur=S.v099.rivals[S.career];
  if(cur&&!cur.retired)return cur;
  if(cur&&cur.retired&&!create)return cur;
  if(!create)return cur||null;
  const r=v099NewRival(S.career);
  S.v099.rivals[S.career]=r;
  return r;
}
function v099RivalGap(){const r=v099Rival();if(!r||r.retired)return 0;return (S.level||0)-r.level}
function v099RelationLabel(v){return v>=75?'동맹':v>=55?'우호적 경쟁':v>=32?'냉랭한 경쟁':'적대'}

function v099RivalTick(days){
  const r=v099Rival();
  if(!r||r.retired||!S.career)return false;
  const max=v099MaxLevel();
  const t=V099_TRAITS[r.trait]||V099_TRAITS.grinder;
  let changed=false;
  if(r.level<max){
    r.xp+=days*2.7*t.speed*r.skill*(r.relation>=75?.82:1);
    const need=100+r.level*28;
    while(r.xp>=need&&r.level<max){r.xp-=need;r.level++;r.promotions++;changed=true;v099OnRivalPromoted(r)}
  }
  // 격차가 너무 벌어지면 라이벌은 더 큰 무대로 떠나고, 새 경쟁자가 그 자리를 채운다.
  if(r.level>=(S.level||0)+3){
    r.retired=true;r.note='당신을 제치고 더 큰 조직으로 스카우트됐다.';
    log(`${r.name}이(가) ${v099Rank(S.career,r.level)}로 조직을 떠났습니다. 새 경쟁자가 그 자리를 채웁니다.`);
    S.v099.rivals[S.career]=null;v099Rival(true);changed=true;
  }
  return changed;
}
function v099OnRivalPromoted(r){
  const rank=v099Rank(S.career,r.level);
  if(r.level>(S.level||0)){
    S.stats.stress=clamp(S.stats.stress+4);
    S.v099.promo.bonus=Math.min(20,(S.v099.promo.bonus||0)+6); // 설욕 보정
    log(`${r.name}이(가) ${rank}(으)로 먼저 올라갔습니다. 당신에게는 설욕의 명분이 남았습니다.`);
    toast(`⚠ ${r.name} 먼저 승진 — ${rank}`);
    if(typeof v9AddHeadline==='function')v9AddHeadline('CAREER',`${careers[S.career].name} ${rank} 인사 발표 — ${r.name} (게임 시뮬레이션)`,'bad',false);
  }else{
    log(`${r.name}이(가) ${rank}(으)로 따라붙었습니다.`);
  }
}
/* 적대 관계에서는 라이벌이 당신을 흔든다. */
function v099SabotageTick(days){
  const r=v099Rival();
  if(!r||r.retired||days<3)return false;
  const t=V099_TRAITS[r.trait]||V099_TRAITS.grinder;
  if(r.relation>32)return false;
  if(Math.random()>t.dirty*.5)return false;
  const kind=Math.random();
  if(kind<.5){
    S.stats.reputation=clamp(S.stats.reputation-2);S.stats.stress=clamp(S.stats.stress+4);
    log(`${r.name}이(가) 당신의 실적을 자기 공으로 돌렸습니다. 평판이 깎였습니다.`);
  }else{
    S.xp=Math.max(0,S.xp-6);S.stats.stress=clamp(S.stats.stress+3);
    log(`${r.name}이(가) 당신의 보고 라인을 가로챘습니다. 경력점수가 줄었습니다.`);
  }
  return true;
}

/* 라이벌 상호작용 */
function v099RivalAction(kind){
  ensureV099();
  const r=v099Rival(true);
  if(!r)return toast('현재 직업이 없습니다.');
  if(r.retired)return toast('이 라이벌은 이미 떠났습니다.');
  const lv=(S.level||0)+1;
  if(kind==='coop'){
    r.relation=clamp(r.relation+12);S.v099.counters.coop++;
    S.stats.net=clamp(S.stats.net+1);S.stats.stress=clamp(S.stats.stress+2);
    r.xp+=10;addXP(9);
    save();advance(3,`${r.name}과(와) 공동 프로젝트를 진행했습니다. 관계 ${Math.round(r.relation)} · 경력점수 +9`);
    toast(`🤝 ${r.name}과(와) 협력 — 관계 ${v099RelationLabel(r.relation)}`);
  }
  else if(kind==='check'){
    const cost=lv*300000;
    if(S.cash<cost)return toast(`현금 ${v099Money(cost)}이 필요합니다.`);
    S.cash-=cost;S.v099.counters.checks++;
    const t=V099_TRAITS[r.trait]||V099_TRAITS.grinder;
    const chance=clamp(38+S.stats.pol*.6+S.stats.net*.25-t.politic*12,10,88);
    if(Math.random()*100<chance){
      r.xp=Math.max(0,r.xp*.6-12);r.relation=clamp(r.relation-14);
      save();advance(2,`${r.name}의 라인을 견제했습니다. 상대의 진급 진행이 늦춰졌습니다.`);
      toast('🎯 견제 성공');
    }else{
      r.relation=clamp(r.relation-20);r.xp+=12;
      S.stats.reputation=clamp(S.stats.reputation-3);S.stats.stress=clamp(S.stats.stress+6);
      save();advance(2,`견제가 들통났습니다. ${r.name}과(와)의 관계가 나빠지고 평판이 깎였습니다.`);
      toast('⚠ 견제 실패 — 평판 하락');
    }
  }
  else if(kind==='scout'){
    const cost=lv*200000;
    if(S.cash<cost)return toast(`현금 ${v099Money(cost)}이 필요합니다.`);
    S.cash-=cost;r.scouted=true;S.v099.counters.scouts++;
    S.v099.promo.bonus=Math.min(24,(S.v099.promo.bonus||0)+8);
    save();advance(2,`${r.name}의 진급 자료를 확보했습니다. 다음 승진 심사에서 유리해집니다.`);
    toast('🕵 정보 확보 — 다음 심사 +8%');
  }
  v099CheckAch();save();v9Render();
}

/* ── 승진 심사 ──────────────────────────────────── */
/* 장성(군인 7단계 이상) 진급은 V0.9의 기존 심사 시스템을 그대로 쓴다. */
function v099BoardTrack(){return !!S.career&&!(S.career==='military'&&(S.level||0)>=6)}

const v099BaseAddXP=addXP;
addXP=function(v){
  if(!S.career)return;
  ensureV099();
  if(!v099BoardTrack())return v099BaseAddXP(v);
  const max=v099MaxLevel();
  if((S.level||0)>=max){S.xp=Math.min(199,S.xp+v);return}
  S.xp+=v;
  const need=v099Need();
  if(S.xp>=need){
    // 심사를 기다리는 동안 쌓은 초과분은 버리지 않고 다음 진급으로 이월한다.
    if(!S.v099.promo.pending){
      S.v099.promo.pending=true;
      toast(`🎖 승진 심사 자격 획득 — ${v099Rank(S.career,(S.level||0)+1)}`);
      log(`${careers[S.career].name} ${v099Rank(S.career,(S.level||0)+1)} 승진 심사 자격을 얻었습니다. 일하기 화면에서 심사를 신청하세요.`);
    }
  }
};

function v099BoardBase(){
  const p=v099Primary(),r=v099Rival();
  let base=47
    +(S.stats[p]-(28+(S.level||0)*4))*.55
    +(S.stats.reputation-20)*.25
    -(S.level||0)*2.0
    -Math.max(0,S.stats.stress-55)*.4
    +v099RivalGap()*5
    +(S.v099.promo.attempts||0)*7
    +(S.v099.promo.bonus||0);
  const rec=(typeof v098GetRecord==='function')?v098GetRecord(S.career):null;
  if(rec)base+=Math.min(9,(rec.totalShifts||0)*.3);
  if(r&&!r.retired){
    if(r.relation>=75)base+=8;
    if(r.level>(S.level||0))base-=7;
    base-=(V099_TRAITS[r.trait]?.politic||1)*3;
  }
  return base;
}
function v099BoardStrategies(){
  const p=v099Primary(),r=v099Rival(),lv=(S.level||0)+1,base=v099BoardBase();
  const list=[
    {id:'record',icon:'📊',name:'실적으로 정면승부',
     sub:`${V099_STAT_KR[p]} ${Math.round(S.stats[p])} · 누적 근무 실적`,
     chance:clamp(base+6,12,94),cost:0,days:2,risk:'위험 없음 · 성공 시 평판 +6',
     desc:'쌓아온 성과 자료만으로 심사에 들어갑니다.'},
    {id:'lobby',icon:'🤝',name:'인맥 라인 로비',
     sub:`인맥 ${Math.round(S.stats.net)} · 비용 ${v099Money(lv*1200000)}`,
     chance:clamp(base+(S.stats.net-24)*.55,12,94),cost:lv*1200000,days:3,risk:'18% 적발 시 평판 -5 · 악명 +4',
     desc:'심사위원과 선을 댑니다.'},
    {id:'persuade',icon:'🗣',name:'직속 상관 설득',
     sub:`매력 ${Math.round(S.stats.cha)} · 리더십 ${Math.round(S.stats.lead)}`,
     chance:clamp(base+((S.stats.cha+S.stats.lead)/2-24)*.5,12,94),cost:0,days:2,risk:'스트레스 +8 · 비용 없음',
     desc:'직접 부딪혀 설득합니다.'}
  ];
  if(r&&!r.retired)list.push({
    id:'attack',icon:'🐍',name:`${r.name} 흠집내기`,
    sub:`정치력 ${Math.round(S.stats.pol)} · 고위험`,
    chance:clamp(base+12+(S.stats.pol-20)*.6,12,94),cost:0,days:2,risk:'관계 -22 · 32% 역풍 시 평판 -6',
    desc:'경쟁자의 약점을 심사장에 흘립니다.'
  });
  return list;
}
function v099OpenBoard(){
  ensureV099();
  if(!S.career)return toast('현재 직업이 없습니다.');
  if(!v099BoardTrack())return toast('장성 진급은 군 인사위원회 심사로 진행됩니다.');
  if((S.level||0)>=v099MaxLevel())return toast('이미 이 직업의 최고 계급입니다.');
  if(!S.v099.promo.pending)return toast(`승진점수를 먼저 채우세요. (${Math.round(S.xp)} / ${v099Need()})`);
  const next=v099Rank(S.career,(S.level||0)+1),st=v099BoardStrategies();
  const r=v099Rival();
  const body=`<div class="v099-board-body">
    <div class="v099-board-target"><span>승진 심사</span><b>${v099Rank(S.career,S.level)} → ${next}</b>
      <small>${(S.v099.promo.attempts||0)?`재도전 ${S.v099.promo.attempts}회차 · 누적 보정 +${(S.v099.promo.attempts||0)*7}%`:'첫 심사'}${(S.v099.promo.bonus||0)?` · 사전 정보 +${Math.round(S.v099.promo.bonus)}%`:''}${S.stats.stress>55?` · 스트레스 감점 -${Math.round((S.stats.stress-55)*.4)}%`:''}${r&&!r.retired?` · 경쟁자 ${r.name} ${v099Rank(S.career,r.level)}`:''}</small></div>
    <p class="v099-board-hint">떨어져도 경력은 남습니다. 재도전할 때마다 심사 보정이 +7%씩 쌓입니다.</p>
  </div>`;
  modal('🎖',`${next} 승진 심사`,'어떤 방식으로 심사를 통과할지 고르세요. 한 번 선택하면 되돌릴 수 없습니다.',
    st.map(s=>[`${s.icon} ${s.name} · ${Math.round(s.chance)}%`,`${s.desc} ${s.sub} · ${s.risk}`,()=>v099RunBoard(s.id)])
      .concat([['나중에 하기','이번 심사를 미룹니다. 자격은 그대로 유지됩니다.',closeModal]]),body);
}
function v099RunBoard(id){
  ensureV099();
  const s=v099BoardStrategies().find(x=>x.id===id);if(!s)return;
  if(s.cost&&S.cash<s.cost)return toast(`현금 ${v099Money(s.cost)}이 필요합니다.`);
  if(s.cost)S.cash-=s.cost;
  closeModal();
  const r=v099Rival(),ok=Math.random()*100<s.chance,next=v099Rank(S.career,(S.level||0)+1);
  let extra='';
  // 전략별 부작용은 성공/실패와 별개로 판정한다.
  if(id==='lobby'&&Math.random()<.18){
    S.stats.reputation=clamp(S.stats.reputation-5);S.stats.notoriety=clamp((S.stats.notoriety||0)+4);S.heat=clamp((S.heat||0)+3);
    extra=' 로비 정황이 새어나가 평판이 깎였습니다.';
  }
  if(id==='persuade'){S.stats.stress=clamp(S.stats.stress+8)}
  if(id==='attack'){
    if(r&&!r.retired)r.relation=clamp(r.relation-22);
    if(Math.random()<.32){
      S.stats.reputation=clamp(S.stats.reputation-6);S.stats.notoriety=clamp((S.stats.notoriety||0)+5);
      if(r&&!r.retired)r.xp+=20;
      extra=' 역풍이 불어 당신의 처신이 도마에 올랐습니다.';
    }
  }
  S.v099.promo.pending=false;
  if(ok){
    const carry=Math.max(0,S.xp-v099Need());
    S.level=clamp((S.level||0)+1,0,v099MaxLevel());S.xp=Math.min(carry,v099Need()-1);
    S.v099.promo.attempts=0;S.v099.promo.bonus=0;S.v099.counters.boardWin++;
    S.v099.promo.history.unshift({date:S.date,career:S.career,rank:next,strategy:s.name,result:'통과'});
    S.v099.promo.history=S.v099.promo.history.slice(0,30);
    S.stats.reputation=clamp(S.stats.reputation+(id==='record'?6:3));
    S.stats[v099Primary()]=clamp(S.stats[v099Primary()]+1);
    const infKey=(typeof v092CareerWorkMeta==='function')?v092CareerWorkMeta()[3]:null;
    if(infKey&&S.inf[infKey]!=null)S.inf[infKey]=clamp(S.inf[infKey]+3);
    if(typeof v098SyncActiveRecord==='function')v098SyncActiveRecord();
    if(typeof v9AddHeadline==='function'&&(S.level>=v099MaxLevel()-2))v9AddHeadline('CAREER',`${S.name}, ${careers[S.career].name} ${next} 승진 (게임 시뮬레이션)`,'good',false);
    log(`승진 심사 통과 — ${next}. (${s.name})${extra}`);
    toast(`🎖 승진! ${next}`);
    advance(s.days,`${next} 승진이 확정됐습니다.`);
  }else{
    S.xp=Math.round(v099Need()*.72);
    S.v099.promo.attempts=(S.v099.promo.attempts||0)+1;S.v099.promo.bonus=0;S.v099.counters.boardFail++;
    S.v099.promo.history.unshift({date:S.date,career:S.career,rank:next,strategy:s.name,result:'보류'});
    S.v099.promo.history=S.v099.promo.history.slice(0,30);
    S.stats.stress=clamp(S.stats.stress+7);
    // 심사에서 밀리면 라이벌이 그 자리를 가져갈 수 있다.
    if(r&&!r.retired&&r.level<=(S.level||0)&&Math.random()<.35){r.level=Math.min(v099MaxLevel(),r.level+1);r.promotions++;v099OnRivalPromoted(r)}
    log(`승진 심사 보류 — ${next} 진급이 다음 기회로 넘어갔습니다. (${s.name})${extra} 다음 심사에는 +${(S.v099.promo.attempts)*7}% 보정이 붙습니다.`);
    toast('승진 심사 보류 — 다시 도전할 수 있습니다.');
    advance(s.days,'이번 승진 심사는 통과하지 못했습니다.');
  }
  v099CheckAch();save();updateAll();v9Render();
}

/* ── 근무 리듬: 같은 근무만 반복하면 권태, 번갈아 하면 몰입 ── */
function v099RhythmInfo(){
  ensureV099();const r=S.v099.rhythm;
  if((r.streak||0)>=3)return {state:'권태',icon:'🥱',text:`같은 근무 ${r.streak}회 연속 — 경력점수 효율이 떨어집니다. 다른 근무로 바꾸세요.`,tone:'bad'};
  if((r.combo||0)>=2)return {state:`몰입 x${r.combo}`,icon:'🔥',text:`근무 방식을 바꿔가며 몰입 중 — 경력점수와 실수령에 보너스가 붙습니다.`,tone:'good'};
  return {state:'평상',icon:'🙂',text:'정규/추가/집중 근무를 번갈아 하면 몰입 보너스가 쌓입니다.',tone:''};
}
const v099BaseDoWork=v092DoWork;
v092DoWork=function(type){
  ensureV099();
  const rh=S.v099.rhythm;
  if(type!=='temp'){
    if(rh.last===type){rh.streak=(rh.streak||0)+1;rh.combo=0}
    else{rh.streak=1;rh.combo=Math.min(5,(rh.combo||0)+1)}
    rh.last=type;
  }
  const cashBefore=S.cash;
  v099BaseDoWork(type);
  if(type==='temp'||!S.career){save();return}
  let bonusXp=0,bonusCash=0,msg='';
  if((rh.streak||0)>=3){
    S.xp=Math.max(0,S.xp-4);rh.fatigue=Math.min(3,(rh.fatigue||0)+1);
    S.stats.stress=clamp(S.stats.stress+2);
    msg=`🥱 같은 근무 ${rh.streak}회 연속 — 권태로 경력점수 -4`;
  }else if((rh.combo||0)>=2){
    bonusXp=3+(rh.combo)*2;
    bonusCash=Math.round(Math.max(0,S.cash-cashBefore)*(.05*rh.combo));
    rh.fatigue=Math.max(0,(rh.fatigue||0)-1);
    S.cash+=bonusCash;addXP(bonusXp);
    if(typeof v098GetRecord==='function'){const rec=v098GetRecord(S.career);if(rec)rec.totalEarnings=(rec.totalEarnings||0)+bonusCash}
    msg=`🔥 몰입 x${rh.combo} — 경력점수 +${bonusXp}${bonusCash?` · 추가 실수령 ${v099Money(bonusCash)}`:''}`;
  }
  if(msg){log(msg);setTimeout(()=>toast(msg),900)}
  v099CheckAch();save();
  v099MaybeIncident(type);
};

/* 스트레스는 이제 승진 심사 확률을 직접 깎는다. 일하기 화면에서 바로 회복할 수 있어야 한다. */
function v099Recharge(){
  ensureV099();
  const rh=S.v099.rhythm;
  S.stats.stress=clamp(S.stats.stress-18);
  S.stats.health=clamp(S.stats.health+4);
  rh.streak=0;rh.last=null;rh.fatigue=0;
  save();advance(3,'3일 쉬며 컨디션을 회복했습니다. 스트레스 -18 · 건강 +4');
  toast('🛏 재충전 — 근무 리듬이 초기화됐습니다.');
  v099CheckAch();save();v9Render();
}

/* ── 근무 중 돌발 상황 ─────────────────────────── */
function v099Eff(o){return o}
const V099_INCIDENTS={
  corp:[
    {icon:'📑',title:'임원 보고 5분 전, 숫자가 틀렸다',text:'내일 회장 보고 자료의 매출 수치가 잘못돼 있습니다. 지금 말하면 팀 전체가 밤을 새워야 합니다.',choices:[
      {label:'지금 즉시 보고한다',sub:'정직 · 스트레스 +6',eff:{xp:14,stats:{reputation:4,stress:6},text:'솔직하게 보고해 사고를 막았습니다. 신뢰를 얻었습니다.'}},
      {label:'혼자 밤새 고친다',sub:'실적 · 건강 -4',eff:{xp:18,stats:{health:-4,stress:8,int:1},text:'혼자 밤을 새워 자료를 바로잡았습니다.'}},
      {label:'라이벌 탓으로 돌린다',sub:'위험 · 관계 악화',eff:{xp:8,relation:-18,stats:{reputation:-3,notoriety:2},text:'책임을 경쟁자에게 떠넘겼습니다. 소문이 돌기 시작합니다.'}}]},
    {icon:'🍸',title:'경쟁사의 저녁 제안',text:'경쟁사 임원이 조용히 저녁 자리를 청합니다. 이직 이야기 같기도, 정보 이야기 같기도 합니다.',choices:[
      {label:'나가서 인맥만 만든다',sub:'인맥 +2',eff:{xp:9,stats:{net:2,cha:1},inf:{business:2},text:'선을 지키며 인맥을 넓혔습니다.'}},
      {label:'거절하고 보고한다',sub:'평판 +4',eff:{xp:11,stats:{reputation:4},text:'제안을 거절하고 회사에 보고했습니다.'}},
      {label:'내부 정보를 흘린다',sub:'현금 · 위험',eff:{cash:9000000,heat:6,stats:{notoriety:5,reputation:-4},text:'정보의 대가를 받았습니다. 흔적이 남았습니다.'}}]}
  ],
  military:[
    {icon:'🎖',title:'야간 훈련 중 부하가 쓰러졌다',text:'훈련 일정을 지키려면 계속 가야 하고, 멈추면 지휘 평가에 흠이 남습니다.',choices:[
      {label:'즉시 훈련 중단',sub:'지휘신뢰 · 평판 +',eff:{xp:12,stats:{reputation:4,lead:1},text:'부하를 먼저 챙겼습니다. 부대가 당신을 신뢰합니다.'}},
      {label:'인원만 후송하고 강행',sub:'실적 · 스트레스',eff:{xp:18,stats:{stress:7,lead:1},inf:{military:2},text:'훈련을 완수했습니다. 상부 평가가 좋습니다.'}},
      {label:'보고서에서 사고를 축소',sub:'위험',eff:{xp:14,stats:{notoriety:4,reputation:-3},text:'사고를 축소 보고했습니다. 언젠가 드러날 수 있습니다.'}}]},
    {icon:'🗺',title:'상급부대가 무리한 작전계획을 내려왔다',text:'현장 판단으로는 무리입니다. 그대로 따르면 안전하지만, 이의를 제기하면 눈 밖에 날 수 있습니다.',choices:[
      {label:'수정안을 정면으로 건의',sub:'리더십 · 도박',eff:{xp:17,stats:{lead:2,stress:5},inf:{military:3},text:'건의가 받아들여져 지휘 능력을 인정받았습니다.'}},
      {label:'그대로 수행한다',sub:'안전',eff:{xp:10,stats:{stress:3},text:'명령대로 수행했습니다.'}},
      {label:'정치 라인에 흘린다',sub:'정치력 · 위험',eff:{xp:8,stats:{pol:2,reputation:-2},inf:{political:3},text:'군 밖의 라인을 이용했습니다. 군 내부 평판은 미묘해졌습니다.'}}]}
  ],
  politics:[
    {icon:'🎤',title:'지역 민원이 폭발했다',text:'주민 200명이 사무실 앞에 모였습니다. 카메라도 와 있습니다.',choices:[
      {label:'직접 나가 듣는다',sub:'매력 · 민심',eff:{xp:15,stats:{cha:2,reputation:4,stress:5},inf:{political:2},text:'직접 나가 1시간을 들었습니다. 지역 여론이 좋아졌습니다.'}},
      {label:'보좌진에게 맡긴다',sub:'무난',eff:{xp:8,stats:{reputation:-1},text:'보좌진이 대응했습니다. 큰일은 없었습니다.'}},
      {label:'반대편 선동이라고 규정',sub:'지지층 결집 · 위험',eff:{xp:12,stats:{pol:2,reputation:-3,notoriety:3},inf:{political:3},text:'강경 대응으로 지지층은 결집했지만 중도층이 등을 돌렸습니다.'}}]},
    {icon:'📜',title:'당론과 지역구 이익이 충돌한다',text:'표결이 내일입니다. 당은 찬성, 당신의 지역구는 결사반대입니다.',choices:[
      {label:'지역구를 따른다',sub:'평판 + · 당내 입지 -',eff:{xp:13,stats:{reputation:5},inf:{political:-2},relation:-8,text:'소신 투표로 지역에서는 영웅이 됐습니다.'}},
      {label:'당론을 따른다',sub:'당내 입지 +',eff:{xp:14,inf:{political:4},stats:{reputation:-2},text:'당론을 따랐습니다. 당내 신임이 올라갑니다.'}},
      {label:'표결 당일 자리를 비운다',sub:'회피',eff:{xp:6,stats:{notoriety:2},text:'기권으로 넘겼습니다. 양쪽 모두에게 애매해졌습니다.'}}]}
  ],
  police:[
    {icon:'🚔',title:'유력 인사의 사건이 배당됐다',text:'윗선에서 "조용히 처리하라"는 말이 돌아옵니다.',choices:[
      {label:'원칙대로 수사',sub:'평판 · 위험',eff:{xp:17,stats:{reputation:6,stress:7},inf:{political:-2},text:'원칙대로 밀어붙였습니다. 시민 신뢰가 올랐습니다.'}},
      {label:'절차대로 상부 보고',sub:'안전',eff:{xp:10,text:'절차를 지키며 책임을 나눴습니다.'}},
      {label:'조용히 덮는다',sub:'라인 · 위험',eff:{xp:9,cash:5000000,inf:{political:3},stats:{notoriety:5,reputation:-5},heat:4,text:'사건을 조용히 정리했습니다. 빚이 하나 생겼습니다.'}}]},
    {icon:'🌃',title:'잠복 3일째, 제보자가 흔들린다',text:'제보자가 신변 보호를 요구합니다. 예산은 없습니다.',choices:[
      {label:'사비로 보호한다',sub:'현금 -',eff:{cash:-3000000,xp:15,stats:{reputation:4,lead:1},text:'사비를 털어 제보자를 지켰습니다.'}},
      {label:'설득해서 진행',sub:'매력',eff:{xp:13,stats:{cha:2,stress:4},text:'설득 끝에 작전을 이어갔습니다.'}},
      {label:'작전 중단',sub:'안전',eff:{xp:6,stats:{stress:-3},text:'작전을 접었습니다.'}}]}
  ],
  prosecutor:[
    {icon:'⚖️',title:'증거가 하나 부족하다',text:'기소하면 여론은 뜨겁지만 무죄가 날 수도 있습니다.',choices:[
      {label:'보강수사 후 기소',sub:'지능 · 시간',eff:{xp:16,stats:{int:2,stress:5},text:'끝까지 파고들어 증거를 보강했습니다.'}},
      {label:'바로 기소한다',sub:'도박',eff:{xp:12,stats:{reputation:Math.random()<.5?6:-6},text:'여론전으로 밀어붙였습니다.'}},
      {label:'불기소 처분',sub:'안전 · 뒷말',eff:{xp:7,stats:{notoriety:2},inf:{political:2},text:'사건을 덮었습니다. 뒷말이 남았습니다.'}}]},
    {icon:'📞',title:'정치권에서 연락이 왔다',text:'수사 속도를 조절해달라는 완곡한 부탁입니다.',choices:[
      {label:'통화 내용을 기록한다',sub:'평판 +',eff:{xp:14,stats:{reputation:5,stress:6},inf:{political:-3},text:'부당한 요청을 기록으로 남겼습니다.'}},
      {label:'적당히 응한다',sub:'정치 영향력 +',eff:{xp:11,inf:{political:5},stats:{reputation:-3,notoriety:3},text:'속도를 조절했습니다. 정치권에 선이 생겼습니다.'}},
      {label:'수사를 오히려 확대',sub:'전면전',eff:{xp:18,stats:{pol:2,stress:9,reputation:4},inf:{political:-4},text:'정면으로 받았습니다. 적이 늘었습니다.'}}]}
  ],
  doctor:[
    {icon:'🏥',title:'응급실에 동시에 두 명이 들어왔다',text:'한 명은 VIP 후원자, 한 명은 이름 없는 환자입니다. 의학적으로는 후자가 더 위급합니다.',choices:[
      {label:'위급한 환자부터',sub:'원칙',eff:{xp:17,stats:{reputation:6,stress:6},text:'원칙대로 판단했습니다. 병원 안에서 신뢰가 쌓였습니다.'}},
      {label:'VIP부터 본다',sub:'현금 · 평판 -',eff:{cash:12000000,xp:9,inf:{business:3},stats:{reputation:-5,notoriety:3},text:'후원자를 먼저 챙겼습니다. 소문이 돕니다.'}},
      {label:'동시 대응 체계를 짠다',sub:'지능 · 리더십',eff:{xp:15,stats:{int:1,lead:2,stress:8},text:'인력을 재배치해 둘 다 살렸습니다.'}}]},
    {icon:'🧪',title:'논문 데이터가 미묘하다',text:'한 줄만 다듬으면 대형 저널에 실릴 수 있습니다.',choices:[
      {label:'있는 그대로 제출',sub:'정직',eff:{xp:12,stats:{int:2,reputation:3},text:'데이터를 그대로 제출했습니다.'}},
      {label:'추가 실험을 한다',sub:'시간 · 지능',eff:{xp:18,cash:-4000000,stats:{int:3,stress:6},text:'추가 실험으로 결론을 단단히 했습니다.'}},
      {label:'수치를 다듬는다',sub:'명성 · 큰 위험',eff:{xp:16,cash:8000000,stats:{reputation:5,notoriety:6},heat:5,text:'논문이 통과됐습니다. 언젠가 검증이 올 수 있습니다.'}}]}
  ],
  lawyer:[
    {icon:'📚',title:'승소 가능성 30%의 사건',text:'의뢰인은 전 재산을 걸었습니다.',choices:[
      {label:'정직하게 가능성을 말한다',sub:'평판 +',eff:{xp:12,stats:{reputation:5},text:'솔직하게 설명하고 합의를 유도했습니다.'}},
      {label:'맡아서 끝까지 싸운다',sub:'도박 · 큰 보상',eff:{xp:20,cash:Math.random()<.35?40000000:-6000000,stats:{stress:9,cha:1},text:'법정에서 끝까지 싸웠습니다.'}},
      {label:'수임료만 받고 합의',sub:'현금',eff:{cash:15000000,xp:8,stats:{reputation:-4,notoriety:3},text:'빠르게 합의로 정리했습니다.'}}]},
    {icon:'🏢',title:'대형 로펌의 스카우트',text:'지금 옮기면 수입은 두 배, 대신 지금까지의 의뢰인은 버려야 합니다.',choices:[
      {label:'남는다',sub:'평판 +',eff:{xp:13,stats:{reputation:5,net:1},text:'기존 의뢰인들과의 신의를 지켰습니다.'}},
      {label:'조건을 협상한다',sub:'매력',eff:{xp:15,cash:20000000,stats:{cha:2,net:2},inf:{business:3},text:'양쪽을 모두 챙기는 조건을 얻어냈습니다.'}},
      {label:'바로 옮긴다',sub:'현금 · 관계',eff:{cash:35000000,xp:10,relation:-10,stats:{reputation:-3},inf:{business:4},text:'조건을 받아들이고 자리를 옮겼습니다.'}}]}
  ],
  entertainer:[
    {icon:'🎬',title:'대본이 하루 전에 통째로 바뀌었다',text:'제작진은 "그냥 해달라"고 합니다.',choices:[
      {label:'밤새 외운다',sub:'프로 · 건강 -',eff:{xp:18,stats:{health:-4,stress:8,cha:1},inf:{media:3},text:'완벽하게 소화해 현장에서 인정받았습니다.'}},
      {label:'제작진과 담판',sub:'매력',eff:{xp:13,stats:{cha:2,stress:4},text:'조건을 조정해 무리 없이 촬영했습니다.'}},
      {label:'촬영을 거부한다',sub:'위험',eff:{xp:5,stats:{notoriety:5,reputation:-4},inf:{media:-2},text:'현장을 떠났습니다. 업계에 말이 돕니다.'}}]},
    {icon:'📱',title:'열애설이 터졌다',text:'사실 여부와 무관하게 조회수는 폭발 중입니다.',choices:[
      {label:'정면 인정',sub:'호감 · 도박',eff:{xp:12,stats:{reputation:Math.random()<.6?6:-5,cha:1},inf:{media:4},text:'솔직한 입장문을 냈습니다.'}},
      {label:'침묵한다',sub:'무난',eff:{xp:8,stats:{stress:5},text:'대응하지 않고 흘려보냈습니다.'}},
      {label:'더 큰 이슈로 덮는다',sub:'노이즈',eff:{xp:14,cash:-5000000,inf:{media:6},stats:{notoriety:4},text:'새 이슈로 덮었습니다. 관심은 커졌습니다.'}}]}
  ],
  athlete:[
    {icon:'⚽',title:'중요한 경기 직전 통증이 왔다',text:'진통제를 맞으면 뛸 수 있습니다.',choices:[
      {label:'빠지고 치료한다',sub:'건강 +',eff:{xp:8,stats:{health:4,stress:-3},text:'몸을 먼저 챙겼습니다.'}},
      {label:'진통제 맞고 출전',sub:'명성 · 건강 -',eff:{xp:19,stats:{health:-7,reputation:5},inf:{media:4},text:'출전해 경기를 끝냈습니다. 관중은 열광했습니다.'}},
      {label:'후배에게 자리를 넘긴다',sub:'리더십',eff:{xp:12,stats:{lead:2,reputation:3},text:'후배를 내보내고 벤치에서 지휘했습니다.'}}]},
    {icon:'💸',title:'해외 이적 제안',text:'돈은 크지만 주전 자리는 보장되지 않습니다.',choices:[
      {label:'도전한다',sub:'현금 · 도박',eff:{cash:80000000,xp:16,stats:{stress:7},inf:{media:4},text:'해외 무대로 나섰습니다.'}},
      {label:'남아서 주전으로',sub:'실적',eff:{xp:18,stats:{health:2,reputation:3},text:'남아서 팀의 중심이 됐습니다.'}},
      {label:'재계약 협상 카드로 쓴다',sub:'매력',eff:{cash:30000000,xp:11,stats:{cha:2,net:1},text:'제안을 지렛대로 재계약 조건을 올렸습니다.'}}]}
  ],
  entrepreneur:[
    {icon:'🚀',title:'투자자가 48시간 안에 답을 달라고 한다',text:'조건은 좋지만 지분을 크게 내줘야 합니다.',choices:[
      {label:'조건 그대로 수락',sub:'현금',eff:{cash:150000000,xp:14,inf:{business:5},stats:{stress:5},text:'자금을 확보했습니다. 지분은 줄었습니다.'}},
      {label:'조건을 다시 협상',sub:'매력 · 도박',eff:{xp:18,cash:Math.random()<.55?90000000:0,stats:{cha:2,stress:7},text:'협상 테이블을 다시 차렸습니다.'}},
      {label:'거절하고 자력으로',sub:'지분 유지',eff:{xp:16,stats:{int:2,stress:8},inf:{business:2},text:'투자를 거절하고 자력으로 버티기로 했습니다.'}}]},
    {icon:'🧑‍💻',title:'핵심 개발자가 사표를 냈다',text:'제품 출시가 3주 남았습니다.',choices:[
      {label:'붙잡고 조건을 올린다',sub:'현금 -',eff:{cash:-25000000,xp:13,stats:{net:1},text:'조건을 올려 팀을 지켰습니다.'}},
      {label:'내가 직접 메운다',sub:'지능 · 과로',eff:{xp:19,stats:{int:2,health:-5,stress:10},text:'직접 코드를 붙잡고 출시를 지켰습니다.'}},
      {label:'출시를 미룬다',sub:'안전 · 신뢰 -',eff:{xp:8,inf:{business:-2},stats:{stress:-2},text:'일정을 미뤘습니다. 투자자들이 술렁입니다.'}}]}
  ],
  underworld:[
    {icon:'🌒',title:'구역 하나가 비었다',text:'먼저 잡는 쪽이 임자입니다. 경찰의 눈도 그쪽을 보고 있습니다.',choices:[
      {label:'조용히 접수한다',sub:'현금 · 낮은 위험',eff:{cash:20000000,xp:12,heat:3,inf:{under:3},text:'소리 없이 구역을 가져왔습니다.'}},
      {label:'힘으로 밀어붙인다',sub:'영향력 · 위험',eff:{cash:45000000,xp:17,heat:9,inf:{under:6},stats:{notoriety:6},text:'정면으로 밀어붙여 구역을 장악했습니다.'}},
      {label:'합법 사업으로 세탁',sub:'안정',eff:{cash:-10000000,xp:14,inf:{business:4,under:-1},stats:{reputation:3},text:'합법 간판을 세워 자금을 정리했습니다.'}}]},
    {icon:'🕵',title:'조직 안에 정보원이 있다',text:'누군지는 모릅니다. 세 사람이 의심됩니다.',choices:[
      {label:'조용히 감시한다',sub:'지능',eff:{xp:15,stats:{int:2,stress:5},heat:-2,text:'꼬리를 잡을 때까지 지켜보기로 했습니다.'}},
      {label:'셋 다 잘라낸다',sub:'안전 · 손실',eff:{cash:-15000000,xp:10,inf:{under:-2},stats:{notoriety:3},text:'의심스러운 인원을 모두 정리했습니다.'}},
      {label:'역정보를 흘린다',sub:'고위험 고보상',eff:{xp:18,heat:6,inf:{under:5},stats:{pol:1,notoriety:4},text:'역정보로 판을 뒤집었습니다.'}}]}
  ],
  intel:[
    {icon:'🕶️',title:'출처가 불확실한 첩보',text:'사실이면 대형 사건이고, 아니면 당신의 경력이 끝납니다.',choices:[
      {label:'교차검증 후 보고',sub:'지능 · 시간',eff:{xp:17,stats:{int:3,stress:6},text:'교차검증을 거쳐 신뢰도 높은 보고서를 올렸습니다.'}},
      {label:'즉시 상부 보고',sub:'도박',eff:{xp:13,stats:{reputation:Math.random()<.5?6:-6},inf:{political:2},text:'속보성으로 먼저 올렸습니다.'}},
      {label:'묻어둔다',sub:'안전',eff:{xp:6,stats:{stress:-2},text:'정보를 묻어뒀습니다.'}}]},
    {icon:'🗂',title:'정치권이 자료를 요구한다',text:'법적 근거가 애매한 요청입니다.',choices:[
      {label:'거부하고 기록',sub:'평판 +',eff:{xp:15,stats:{reputation:5,stress:6},inf:{political:-3},text:'요청을 거부하고 기록으로 남겼습니다.'}},
      {label:'일부만 제공',sub:'줄타기',eff:{xp:12,inf:{political:3},stats:{pol:1,notoriety:2},text:'수위를 조절해 일부만 넘겼습니다.'}},
      {label:'전부 넘긴다',sub:'라인 · 위험',eff:{xp:9,inf:{political:6},stats:{reputation:-5,notoriety:5},heat:4,text:'요구대로 넘겼습니다. 강력한 후원자가 생겼습니다.'}}]}
  ],
  _generic:[
    {icon:'☕',title:'후배가 조언을 구한다',text:'당신이 지금 자리에 오기까지 겪은 것을 묻습니다.',choices:[
      {label:'진심으로 조언한다',sub:'인맥 · 리더십',eff:{xp:10,stats:{lead:1,net:2,reputation:2},text:'후배에게 길을 열어줬습니다.'}},
      {label:'바쁘다며 미룬다',sub:'시간 확보',eff:{xp:12,stats:{stress:2},text:'자기 일에 집중했습니다.'}}]},
    {icon:'📨',title:'익명의 제보 메일',text:'조직 내부의 부적절한 관행을 알리는 메일이 당신에게만 왔습니다.',choices:[
      {label:'정식 절차로 올린다',sub:'평판 · 갈등',eff:{xp:13,stats:{reputation:5,stress:7},text:'정식으로 문제를 제기했습니다.'}},
      {label:'보관만 해둔다',sub:'카드로 쥔다',eff:{xp:9,stats:{pol:2},text:'언젠가 쓸 카드로 보관했습니다.'}},
      {label:'삭제한다',sub:'무난',eff:{xp:6,stats:{stress:-3},text:'없던 일로 했습니다.'}}]},
    {icon:'🤒',title:'몸이 보내는 경고',text:'며칠째 신호가 옵니다. 일정은 그대로입니다.',choices:[
      {label:'하루 쉰다',sub:'건강 +',eff:{xp:4,stats:{health:5,stress:-8},text:'하루 쉬며 몸을 돌봤습니다.'}},
      {label:'약 먹고 계속',sub:'실적 · 건강 -',eff:{xp:14,stats:{health:-5,stress:5},text:'일정을 그대로 밀고 갔습니다.'}}]},
    {icon:'🎟',title:'윗선에서 부른 자리',text:'업무와 무관한 사적인 자리입니다. 가면 얼굴을 알릴 수 있습니다.',choices:[
      {label:'참석한다',sub:'인맥 +',eff:{xp:9,cash:-1500000,stats:{net:3,cha:1},text:'자리에서 얼굴과 이름을 알렸습니다.'}},
      {label:'가지 않는다',sub:'실적 집중',eff:{xp:13,stats:{stress:2},relation:-4,text:'자리를 건너뛰고 일에 집중했습니다.'}}]}
  ]
};
function v099ApplyEffect(e,label){
  ensureV099();
  if(!e)return closeModal();
  if(e.cash)S.cash+=e.cash;
  Object.entries(e.stats||{}).forEach(([k,v])=>{S.stats[k]=clamp((S.stats[k]||0)+v)});
  Object.entries(e.inf||{}).forEach(([k,v])=>{if(S.inf[k]!=null)S.inf[k]=clamp(S.inf[k]+v)});
  if(e.heat)S.heat=clamp((S.heat||0)+e.heat,0,100);
  if(e.relation){const r=v099Rival();if(r&&!r.retired)r.relation=clamp(r.relation+e.relation)}
  if(e.rivalXp){const r=v099Rival();if(r&&!r.retired)r.xp=Math.max(0,r.xp+e.rivalXp)}
  if(e.xp)addXP(e.xp);
  const msg=e.text||label||'선택을 마쳤습니다.';
  closeModal();log(msg);toast(msg);
  v099CheckAch();save();updateAll();v9Render();
}
function v099ShowIncident(){
  ensureV099();
  if(!S.career)return;
  const pool=(V099_INCIDENTS[S.career]||[]).concat(V099_INCIDENTS._generic);
  if(!pool.length)return;
  const it=pool[Math.floor(Math.random()*pool.length)];
  S.v099.counters.incidents=(S.v099.counters.incidents||0)+1;
  const tag=`<div class="v099-incident-tag">WORK INCIDENT · ${careers[S.career].name} ${v099Rank(S.career,S.level)} · GAME SIMULATION</div>`;
  modal(it.icon,it.title,it.text,it.choices.map(c=>[c.label,c.sub,()=>v099ApplyEffect(c.eff,c.label)]),tag);
}
function v099MaybeIncident(type){
  if(!S.career||type==='temp')return;
  if(Math.random()>=.34)return;
  // 근무 직후에는 기존 직업 사건이 먼저 뜰 수 있다. 화면이 빌 때까지 몇 번 기다렸다가 띄운다.
  let tries=0;
  const fire=()=>{
    const m=$('#modal');
    if(m&&m.classList.contains('hidden'))return v099ShowIncident();
    if(++tries<6)setTimeout(fire,900);
  };
  setTimeout(fire,720);
}

/* ── 업적 ───────────────────────────────────────── */
const V099_ACH=[
  {id:'first_job',icon:'🧳',name:'첫 출근',desc:'첫 직업을 시작한다',test:()=>!!S.career,reward:{cash:500000}},
  {id:'shift10',icon:'⏱',name:'월급의 맛',desc:'누적 10회 근무',test:()=>(S.v092?.workShifts||0)>=10,reward:{cash:2000000}},
  {id:'shift50',icon:'🏭',name:'버티는 자',desc:'누적 50회 근무',test:()=>(S.v092?.workShifts||0)>=50,reward:{cash:20000000,rep:3}},
  {id:'first_promo',icon:'🎖',name:'첫 승진',desc:'승진 심사를 처음 통과한다',test:()=>(S.v099.counters.boardWin||0)>=1,reward:{xp:10,rep:2}},
  {id:'promo5',icon:'🏆',name:'심사의 달인',desc:'승진 심사 5회 통과',test:()=>(S.v099.counters.boardWin||0)>=5,reward:{rep:5,cash:10000000}},
  {id:'comeback',icon:'🔁',name:'재수생의 품격',desc:'심사에 떨어진 뒤 다시 통과한다',test:()=>(S.v099.counters.boardFail||0)>=1&&(S.v099.counters.boardWin||0)>=1,reward:{rep:3}},
  {id:'rival_lead',icon:'🥇',name:'라이벌 추월',desc:'라이벌보다 높은 계급에 오른다',test:()=>{const r=v099Rival();return !!r&&!r.retired&&(S.level||0)>r.level},reward:{rep:4,xp:8}},
  {id:'rival_ally',icon:'🤝',name:'적에서 동지로',desc:'라이벌과의 관계를 75 이상으로 만든다',test:()=>{const r=v099Rival();return !!r&&!r.retired&&r.relation>=75},reward:{stat:['net',3]}},
  {id:'combo4',icon:'🔥',name:'리듬을 탄다',desc:'근무 몰입 4연속 달성',test:()=>(S.v099.rhythm.combo||0)>=4,reward:{xp:12}},
  {id:'incident10',icon:'🎲',name:'산전수전',desc:'근무 중 돌발 상황 10회 처리',test:()=>(S.v099.counters.incidents||0)>=10,reward:{rep:3,cash:5000000}},
  {id:'two_careers',icon:'🧭',name:'인생 2회차',desc:'서로 다른 직업 2개를 경험한다',test:()=>Object.values(S.v098?.records||{}).filter(r=>r?.periods?.length).length>=2,reward:{stat:['int',2]}},
  {id:'comeback_career',icon:'↩️',name:'돌아온 사람',desc:'퇴직했던 직업으로 복귀한다',test:()=>Object.values(S.v098?.records||{}).some(r=>(r?.returns||0)>=1),reward:{rep:2}},
  {id:'top_rank',icon:'👑',name:'정점',desc:'어떤 직업이든 최고 계급에 오른다',test:()=>!!S.career&&(S.level||0)>=v099MaxLevel(),reward:{rep:10,cash:50000000}},
  {id:'star',icon:'⭐',name:'별을 달다',desc:'군인으로 준장 이상 진급',test:()=>S.career==='military'&&(S.level||0)>=7,reward:{rep:6}},
  {id:'rich',icon:'💰',name:'10억 클럽',desc:'순자산 10억 달성',test:()=>networth()>=1000000000,reward:{rep:4}},
  {id:'power50',icon:'⚡',name:'권력 실세',desc:'POWER INDEX 50 달성',test:()=>power()>=50,reward:{rep:5}},
  {id:'president',icon:'🇰🇷',name:'정점의 자리',desc:'대통령이 된다',test:()=>S.career==='politics'&&(S.level||0)>=8,reward:{rep:10}}
];
function v099CheckAch(){
  if(!S.v099)return;
  let unlocked=[];
  V099_ACH.forEach(a=>{
    if(S.v099.ach[a.id])return;
    let ok=false;try{ok=!!a.test()}catch(e){ok=false}
    if(!ok)return;
    S.v099.ach[a.id]=S.date;unlocked.push(a);
    const rw=a.reward||{};
    if(rw.cash)S.cash+=rw.cash;
    if(rw.rep)S.stats.reputation=clamp(S.stats.reputation+rw.rep);
    if(rw.stat)S.stats[rw.stat[0]]=clamp(S.stats[rw.stat[0]]+rw.stat[1]);
    if(rw.xp&&S.career)S.xp=S.xp+rw.xp;
    log(`업적 달성 — ${a.icon} ${a.name} (${a.desc})`);
  });
  if(unlocked.length){
    const a=unlocked[0];
    setTimeout(()=>toast(`${a.icon} 업적 달성 · ${a.name}`),400);
    save();
  }
  return unlocked.length;
}

/* ── 화면 ───────────────────────────────────────── */
function v099BoardPanel(){
  ensureV099();
  if(!S.career)return '';
  const max=v099MaxLevel(),atTop=(S.level||0)>=max,need=v099Need(),pct=clamp(S.xp/need*100);
  const next=atTop?'최고 계급':v099Rank(S.career,(S.level||0)+1);
  const rh=v099RhythmInfo();
  const generals=!v099BoardTrack();
  let cta;
  if(atTop)cta=`<button class="v099-board-btn" disabled>이 직업의 정점에 있습니다</button>`;
  else if(generals)cta=`<button class="v099-board-btn" disabled>장성 진급은 군 인사위원회가 자동 심사합니다</button>`;
  else if(S.v099.promo.pending)cta=`<button class="v099-board-btn ready" id="v099Board">🎖 ${next} 승진 심사 신청</button>`;
  else cta=`<button class="v099-board-btn" disabled>승진점수 ${Math.round(S.xp)} / ${need} — 근무로 채우세요</button>`;
  const st=(!atTop&&!generals&&S.v099.promo.pending)?v099BoardStrategies():[];
  return `<section class="v9-card v099-board">
    <div class="v9-section-head"><div><span>PROMOTION BOARD</span><b>${v099Rank(S.career,S.level)} → ${next}</b></div><em>${S.v099.promo.pending?'심사 대기 중':`${Math.round(pct)}%`}</em></div>
    <div class="v099-progress"><i style="width:${Math.round(pct)}%"></i></div>
    <div class="v099-board-meta">
      <div><span>승진점수</span><b>${Math.round(S.xp)} / ${need}</b></div>
      <div><span>재도전 보정</span><b>+${(S.v099.promo.attempts||0)*7}%</b></div>
      <div><span>사전 정보</span><b>+${Math.round(S.v099.promo.bonus||0)}%</b></div>
      <div><span>심사 통과</span><b>${S.v099.counters.boardWin||0}회</b></div>
    </div>
    ${cta}
    ${st.length?`<div class="v099-strat-preview">${st.map(s=>`<span>${s.icon} ${s.name} <b>${Math.round(s.chance)}%</b></span>`).join('')}</div>`:''}
    <div class="v099-rhythm ${rh.tone}"><b>${rh.icon} 근무 리듬 · ${rh.state}</b><span>${rh.text}</span>
      <div class="v099-stress"><span>스트레스 <b class="${S.stats.stress>=70?'hot':''}">${Math.round(S.stats.stress)}</b>${S.stats.stress>55?` · 승진 심사 ${Math.round((S.stats.stress-55)*.4)}% 손해`:' · 심사 감점 없음'}</span><button id="v099Recharge">🛏 3일 재충전</button></div>
    </div>
  </section>`;
}
function v099RivalPanel(){
  ensureV099();
  if(!S.career)return '';
  const r=v099Rival(true);
  if(!r)return '';
  const t=V099_TRAITS[r.trait]||V099_TRAITS.grinder,max=v099MaxLevel();
  const myPct=clamp(S.xp/v099Need()*100),rvNeed=100+r.level*28,rvPct=clamp(r.xp/rvNeed*100);
  const gap=v099RivalGap(),lv=(S.level||0)+1;
  const gapText=gap>0?`당신이 ${gap}계급 앞섭니다`:gap<0?`${r.name}이(가) ${-gap}계급 앞섭니다`:'같은 계급에서 맞붙고 있습니다';
  return `<section class="v9-card v099-rival">
    <div class="v9-section-head"><div><span>RIVAL</span><b>${t.icon} ${r.name} · ${t.name}</b></div><em>${v099RelationLabel(r.relation)} ${Math.round(r.relation)}</em></div>
    <p class="v099-rival-line">${t.line} ${gapText}.</p>
    <div class="v099-vs">
      <div class="me"><span>${S.name}</span><b>${v099Rank(S.career,S.level)}</b><i><em style="width:${Math.round(myPct)}%"></em></i><small>승진점수 ${Math.round(S.xp)} / ${v099Need()}</small></div>
      <div class="vs">VS</div>
      <div class="rv ${gap<0?'ahead':''}"><span>${r.name}</span><b>${v099Rank(S.career,r.level)}</b><i><em style="width:${Math.round(rvPct)}%"></em></i><small>${r.scouted?`진급 진행 ${Math.round(r.xp)} / ${rvNeed}`:`진급 진행 비공개 · 승진 ${r.promotions}회`}</small></div>
    </div>
    <div class="v099-rival-acts">
      <button data-v099-rival="coop"><b>🤝 공동 프로젝트</b><span>3일 · 관계 +12 · 경력 +9</span></button>
      <button data-v099-rival="check"><b>🎯 라인 견제</b><span>2일 · ${v099Money(lv*300000)} · 상대 진급 지연</span></button>
      <button data-v099-rival="scout"><b>🕵 정보 수집</b><span>2일 · ${v099Money(lv*200000)} · 다음 심사 +8%</span></button>
    </div>
    <small class="v099-note">※ 라이벌과 모든 사건은 가상 인물·가상 상황입니다. 관계가 적대로 떨어지면 상대가 먼저 움직입니다.</small>
  </section>`;
}
function v099AchPanel(){
  ensureV099();
  const done=V099_ACH.filter(a=>S.v099.ach[a.id]);
  return `<section class="v9-card v099-ach">
    <div class="v9-section-head"><div><span>ACHIEVEMENTS</span><b>인생 업적</b></div><em>${done.length} / ${V099_ACH.length}</em></div>
    <div class="v099-ach-grid">${V099_ACH.map(a=>{
      const got=S.v099.ach[a.id];
      return `<div class="${got?'got':''}"><b>${a.icon} ${a.name}</b><span>${a.desc}</span><small>${got?`달성 ${got}`:'미달성'}</small></div>`;
    }).join('')}</div>
  </section>`;
}

/* 일하기 화면에 새 패널을 끼워 넣는다. */
const v099BaseWorkPage=v098WorkPage;
v098WorkPage=function(){
  ensureV099();
  let html=v099BaseWorkPage();
  const panels=S.career?(v099BoardPanel()+v099RivalPanel()):'';
  if(panels){
    if(html.includes('<div class="v093-hub-grid">'))html=html.replace('<div class="v093-hub-grid">',panels+'<div class="v093-hub-grid">');
    else html=html.replace(/<\/div>\s*$/,panels+'</div>');
  }
  html=html.replace(/<\/div>\s*$/,v099AchPanel()+'</div>');
  return html;
};

function v099Bind(){
  const b=$('#v099Board');if(b)b.onclick=v099OpenBoard;
  const rc=$('#v099Recharge');if(rc)rc.onclick=v099Recharge;
  $$('[data-v099-rival]').forEach(x=>x.onclick=()=>v099RivalAction(x.dataset.v099Rival));
}
const v099OldRender=v9Render;
v9Render=function(){
  ensureV099();
  v099OldRender();
  v099Bind();
  const ver=document.querySelector('.v091-player-summary>small');if(ver)ver.textContent='PLAYER PROFILE · V0.9.9';
  const brand=document.querySelector('.v9-brand small');if(brand&&brand.textContent.includes('COMMAND CENTER'))brand.textContent='COMMAND CENTER · V0.9.9';
  const bt=document.querySelector('.brand span');if(bt)bt.textContent='Visual Life & Power Sandbox · V0.9.9';
};

/* 시간이 흐르면 라이벌도 움직인다. */
const v099BaseAdvance=advance;
advance=function(days,reason=''){
  v099BaseAdvance(days,reason);
  try{
    ensureV099();
    const a=v099RivalTick(days),b=v099SabotageTick(days);
    v099CheckAch();save();
    if(a||b)v9Render();
  }catch(e){console.warn('[V0.9.9]',e)}
};

/* 직업을 바꾸면 그 직업의 라이벌이 기다리고 있다. */
if(typeof v098ActivateCareer==='function'){
  const v099BaseActivate=v098ActivateCareer;
  v098ActivateCareer=function(k,opts){
    const ok=v099BaseActivate(k,opts);
    if(ok){ensureV099();S.v099.promo={pending:false,attempts:0,bonus:0,lastResult:null,history:S.v099.promo?.history||[]};S.v099.rhythm={last:null,combo:0,streak:0,fatigue:0};const r=v099Rival(true);if(r&&!r.retired)log(`${careers[k].name}에는 이미 ${r.name}(${V099_TRAITS[r.trait].name})이(가) 같은 자리를 노리고 있습니다.`);v099CheckAch();save()}
    return ok;
  };
  joinCareer=function(k){return v098ActivateCareer(k)};
}

setTimeout(()=>{try{ensureV099();v099CheckAch();v9Render()}catch(e){console.warn('[V0.9.9]',e)}},240);
