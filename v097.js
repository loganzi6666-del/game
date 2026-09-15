/* LIFE : RISE V0.9.7 — POST-COUP CONSTITUTION SYSTEM */
const V097={version:'0.9.7'};

const V097_REGIMES={
  military_council:{
    icon:'🎖️',name:'국가재건 군사평의회',tag:'군정 유지',tone:'danger',
    executive:'군사평의회 의장',legislature:'국가자문회의',elections:'정기선거 중지',term:'과도기',partySystem:'정당 활동 제한',concentration:95,
    desc:'군 지휘부 중심으로 권력을 유지합니다. 단기 안정은 높지만 민심·정당성·대외 신뢰가 계속 압박받습니다.',
    effects:{legitimacy:-4,stability:8,mood:-8,economy:-2,military:5,political:-3}
  },
  strong_presidency:{
    icon:'🦅',name:'강한 대통령 중심 공화국',tag:'권력 집중',tone:'amber',
    executive:'대통령',legislature:'단원제 의회',elections:'제한적 정기선거',term:'대통령 6년',partySystem:'제한적 다당제',concentration:82,
    desc:'군정을 대통령 중심의 신체제로 재편합니다. 정책 추진력은 강하지만 권력집중에 대한 반발을 관리해야 합니다.',
    effects:{legitimacy:4,stability:4,mood:-3,economy:1,military:-3,political:7}
  },
  semi_presidential:{
    icon:'⚖️',name:'이원집정부제 공화국',tag:'권력 분점',tone:'blue',
    executive:'대통령 + 총리',legislature:'단원제 국회',elections:'대통령·의회 선거',term:'대통령 5년',partySystem:'다당제',concentration:58,
    desc:'대통령과 총리가 권한을 나눕니다. 독주 위험은 낮지만 국회·총리와의 갈등을 관리해야 합니다.',
    effects:{legitimacy:12,stability:3,mood:5,economy:1,military:-8,political:7}
  },
  parliamentary:{
    icon:'🏛️',name:'의원내각제 공화국',tag:'의회 중심',tone:'green',
    executive:'총리',legislature:'의회',elections:'총선 중심',term:'의회 신임 유지',partySystem:'다당제·연정',concentration:42,
    desc:'정부 수반을 의회 다수파가 결정합니다. 정당·연정 운영이 국가권력의 핵심이 됩니다.',
    effects:{legitimacy:18,stability:2,mood:8,economy:1,military:-12,political:6}
  },
  presidential_democracy:{
    icon:'🗳️',name:'민정 대통령제 복귀',tag:'민정 이양',tone:'green',
    executive:'대통령',legislature:'단원제 국회',elections:'자유 대통령·국회의원 선거',term:'대통령 5년 단임',partySystem:'다당제',concentration:48,
    desc:'군정을 종료하고 선거를 통해 기존 민주공화정에 가까운 체제로 복귀합니다. 플레이어의 직접 권력은 크게 줄어듭니다.',
    effects:{legitimacy:24,stability:5,mood:12,economy:2,military:-15,political:-4}
  },
  technocratic_transition:{
    icon:'🧠',name:'전문가 과도내각',tag:'한시 체제',tone:'blue',
    executive:'과도내각 총리',legislature:'과도 국가위원회',elections:'120일 내 선거',term:'120일 과도기',partySystem:'선거 전 임시중립',concentration:50,
    desc:'군이 전면에서 물러나고 전문가 중심 과도내각이 경제·행정 정상화 후 선거를 준비합니다.',
    effects:{legitimacy:10,stability:5,mood:4,economy:5,military:-7,political:1}
  }
};

function ensureV097(){
  if(typeof ensureV096==='function')ensureV096();
  S.version='0.9.7';
  const p=S.v5.power;
  S.v097=S.v097||{};
  if(!S.v097.constitution){
    S.v097.constitution={
      key:p.coupStatus==='군정'?'transitional':'democratic',
      name:p.regime||'민주공화정',
      executive:p.coupStatus==='군정'?'군사과도정부':'대통령',
      legislature:'단원제 국회',elections:p.coupStatus==='군정'?'미정':'정기선거',term:'-',partySystem:'다당제',
      concentration:p.coupStatus==='군정'?88:50,reformCount:0,lastChanged:S.date,playerRole:'-'
    };
  }
  if(S.v097.reformPending==null)S.v097.reformPending=false;
  if(S.v097.regimeHistory==null)S.v097.regimeHistory=[];
}

function v097CurrentRegime(){ensureV097();return S.v097.constitution}
function v097CanReform(){ensureV097();const p=S.v5.power;return ['군정','신체제','헌정개편','민정이양','과도내각'].includes(p.coupStatus)||p.regime!=='민주공화정'}
function v097PoliticalFormSummary(){
  const c=v097CurrentRegime();
  return `<div class="v097-current"><div><span>CURRENT CONSTITUTION</span><h2>${c.name}</h2><p>${c.executive} · ${c.legislature}</p></div><b>${Math.round(c.concentration||50)}<small>권력집중도</small></b></div>
  <div class="v097-kpis"><div><span>선거</span><b>${c.elections}</b></div><div><span>임기</span><b>${c.term}</b></div><div><span>정당체제</span><b>${c.partySystem}</b></div><div><span>플레이어 지위</span><b>${c.playerRole||'-'}</b></div></div>`;
}

function v097RegimeCards(){
  return `<div class="v097-regime-grid">${Object.entries(V097_REGIMES).map(([key,r])=>`<button class="v097-regime-card ${r.tone}" data-v097-regime="${key}"><div class="v097-regime-icon">${r.icon}</div><div class="v097-regime-copy"><span>${r.tag}</span><b>${r.name}</b><p>${r.desc}</p><small>권력집중 ${r.concentration} · 정당성 ${r.effects.legitimacy>=0?'+':''}${r.effects.legitimacy} · 민심 ${r.effects.mood>=0?'+':''}${r.effects.mood}</small></div></button>`).join('')}</div>`;
}

function v097OpenConstitutionConvention(){
  ensureV097();
  if(!v097CanReform()&&!S.v097.reformPending)return toast('현재는 쿠데타 이후 체제개편 단계가 아닙니다.');
  const body=`${v097PoliticalFormSummary()}<div class="v097-section-title"><b>새 정치체제 선택</b><span>선택 즉시 국가 규칙과 권력구조가 바뀝니다.</span></div>${v097RegimeCards()}<div class="powerDisclaimer">모든 군사 권력변동과 체제개편은 실제 실행 절차가 아닌 추상적인 게임 수치와 정치제도 선택으로만 처리됩니다.</div>`;
  modal('🏛️','헌정질서 재설계','쿠데타 이후 어떤 국가를 만들지 결정합니다. 권력을 오래 쥐는 체제일수록 단기 통제는 쉽지만 정당성·민심·경제의 부담이 커질 수 있습니다.',[['현재 체제 유지','지금의 정치형태를 유지합니다.',()=>{S.v097.reformPending=false;closeModal();save();toast('현재 체제를 유지합니다.')}],['체제 운영 화면','현재 체제의 정책과 전환 상태 확인',v097OpenRegimeDashboard]],body);
  setTimeout(()=>document.querySelectorAll('[data-v097-regime]').forEach(b=>b.addEventListener('click',()=>v097ConfirmRegime(b.dataset.v097Regime))),0);
}

function v097ConfirmRegime(key){
  ensureV097();const r=V097_REGIMES[key];if(!r)return;
  modal(r.icon,r.name,'이 정치형태를 채택하면 국가의 권력구조와 향후 이벤트가 달라집니다.',[
    ['이 체제로 개편',`권력집중 ${r.concentration} · 민심 ${r.effects.mood>=0?'+':''}${r.effects.mood} · 정당성 ${r.effects.legitimacy>=0?'+':''}${r.effects.legitimacy}`,()=>v097ApplyRegime(key)],
    ['다시 선택','헌정개편 화면으로 돌아갑니다.',v097OpenConstitutionConvention]
  ],`<div class="v097-confirm"><div><span>행정부</span><b>${r.executive}</b></div><div><span>입법부</span><b>${r.legislature}</b></div><div><span>선거</span><b>${r.elections}</b></div><div><span>정당</span><b>${r.partySystem}</b></div></div>`);
}

function v097ApplyRegime(key){
  ensureV097();const r=V097_REGIMES[key],p=S.v5.power,c=S.v097.constitution;if(!r)return;
  S.v097.regimeHistory.unshift({date:S.date,from:c.name,to:r.name});S.v097.regimeHistory=S.v097.regimeHistory.slice(0,20);
  c.key=key;c.name=r.name;c.executive=r.executive;c.legislature=r.legislature;c.elections=r.elections;c.term=r.term;c.partySystem=r.partySystem;c.concentration=r.concentration;c.lastChanged=S.date;c.reformCount=(c.reformCount||0)+1;
  p.regime=r.name;p.legitimacy=clamp(p.legitimacy+r.effects.legitimacy);
  S.nation.stability=clamp(S.nation.stability+r.effects.stability);S.nation.mood=clamp(S.nation.mood+r.effects.mood);S.nation.economy=clamp(S.nation.economy+r.effects.economy);
  S.inf.military=clamp(S.inf.military+r.effects.military);S.inf.political=clamp(S.inf.political+r.effects.political);
  if(key==='military_council'){
    p.coupStatus='군정';p.presidentStatus='권력상실';p.earlyElectionDays=null;c.playerRole=`${S.name} · 군사평의회 의장`;S.nation.currentPresident=`${S.name} · 군사평의회 의장`;
  }else if(key==='strong_presidency'){
    p.coupStatus='신체제';p.presidentStatus='재임';p.earlyElectionDays=null;c.playerRole=`${S.name} · 대통령`;S.nation.currentPresident=S.name;
  }else if(key==='semi_presidential'){
    p.coupStatus='헌정개편';p.presidentStatus='재임';p.earlyElectionDays=90;c.playerRole=`${S.name} · 과도 대통령`;S.nation.currentPresident=S.name;
  }else if(key==='parliamentary'){
    p.coupStatus='민정이양';p.presidentStatus='상징직';p.earlyElectionDays=90;c.playerRole=`${S.name} · 과도 총리`;S.nation.currentPresident='상징적 국가원수(가상)';
  }else if(key==='presidential_democracy'){
    p.coupStatus='민정이양';p.presidentStatus='궐위';p.earlyElectionDays=45;c.playerRole='민정이양 감독';S.nation.currentPresident='과도정부(가상)';
  }else if(key==='technocratic_transition'){
    p.coupStatus='과도내각';p.presidentStatus='과도';p.earlyElectionDays=120;c.playerRole='국가재건위원장';S.nation.currentPresident='전문가 과도내각(가상)';
  }
  S.nation.simulated=true;S.v097.reformPending=false;
  log(`헌정개편을 통해 국가 정치체제가 '${r.name}'으로 변경되었습니다. (게임 시뮬레이션)`);
  if(typeof v9AddHeadline==='function')v9AddHeadline('POLITICS',`[게임] 새 헌정체제 출범 — ${r.name}`,'bad',true);
  save();closeModal();advance(7);setTimeout(v097OpenRegimeDashboard,40);
}

function v097RegimeAction(type){
  ensureV097();const p=S.v5.power,c=S.v097.constitution;
  if(type==='stabilize'){S.nation.stability=clamp(S.nation.stability+5);S.nation.mood=clamp(S.nation.mood+2);p.legitimacy=clamp(p.legitimacy+2);S.nation.economy=clamp(S.nation.economy-1);log('국가 안정과 행정 정상화를 최우선 과제로 추진했습니다.');}
  if(type==='economy'){S.nation.economy=clamp(S.nation.economy+5);S.nation.mood=clamp(S.nation.mood+3);p.legitimacy=clamp(p.legitimacy+3);log('경제 회복 패키지를 추진해 체제 안정 기반을 다졌습니다.');}
  if(type==='liberalize'){c.concentration=clamp((c.concentration||50)-10);p.legitimacy=clamp(p.legitimacy+8);S.nation.mood=clamp(S.nation.mood+7);S.inf.military=clamp(S.inf.military-5);log('권력 분산과 정치 정상화 조치를 발표했습니다.');}
  if(type==='centralize'){c.concentration=clamp((c.concentration||50)+8);S.nation.stability=clamp(S.nation.stability+4);p.legitimacy=clamp(p.legitimacy-7);S.nation.mood=clamp(S.nation.mood-6);log('권한을 중앙에 집중해 단기 통제력을 높였습니다.');}
  if(type==='election'){p.earlyElectionDays=Math.min(p.earlyElectionDays??999,60);p.legitimacy=clamp(p.legitimacy+10);S.nation.mood=clamp(S.nation.mood+6);c.elections='60일 내 전국선거';log('60일 내 전국선거 실시를 선언했습니다.');}
  if(type==='coalition'){S.inf.political=clamp(S.inf.political+4);S.stats.pol=clamp(S.stats.pol+2);p.legitimacy=clamp(p.legitimacy+5);S.nation.stability=clamp(S.nation.stability+2);log('정당·의회 세력과 협력해 체제 운영 기반을 넓혔습니다.');}
  advance(7);v097OpenRegimeDashboard();
}

function v097OpenRegimeDashboard(){
  ensureV097();const p=S.v5.power,c=S.v097.constitution;
  const body=`${v097PoliticalFormSummary()}<div class="regimeGrid v097-regime-stats"><div><span>정당성</span><b>${Math.round(p.legitimacy)}</b></div><div><span>경제</span><b>${Math.round(S.nation.economy)}</b></div><div><span>민심</span><b>${Math.round(S.nation.mood)}</b></div><div><span>안정도</span><b>${Math.round(S.nation.stability)}</b></div></div><div class="v097-history"><b>최근 체제변경</b>${S.v097.regimeHistory.length?S.v097.regimeHistory.slice(0,4).map(x=>`<span>${x.date} · ${x.from} → ${x.to}</span>`).join(''):'<span>기록 없음</span>'}</div>`;
  const acts=[
    ['국가 안정화','안정도 + · 정당성 소폭 +',()=>v097RegimeAction('stabilize')],
    ['경제 회복','경제·민심 회복',()=>v097RegimeAction('economy')],
    ['권력 분산','민심·정당성 + · 군 영향력 -',()=>v097RegimeAction('liberalize')],
    ['권력 집중','단기 안정 + · 민심/정당성 -',()=>v097RegimeAction('centralize')],
    ['선거 일정 선언','60일 내 전국선거',()=>v097RegimeAction('election')],
    ['정치세력 협상','의회·정당과 운영기반 확대',()=>v097RegimeAction('coalition')],
    ['🏛️ 헌정 개편','정치형태를 다시 설계',v097OpenConstitutionConvention],
    ['권력 메뉴','탄핵·선거·군사권력 현황',openPowerTransition]
  ];
  modal('🏛️',`${c.name} 운영`,'정치형태에 따라 국가를 유지하는 방식이 달라집니다. 권력집중도가 높을수록 단기 의사결정은 쉽지만 정당성·민심 관리가 어려워집니다.',acts,body);
}

/* 쿠데타 성공 직후 헌정개편 선택창 자동 제시 */
const v097BaseAttemptCoup=attemptCoup;
attemptCoup=function(){
  ensureV097();const before=S.v5.power.coupStatus;
  v097BaseAttemptCoup();
  if(before!=='군정'&&S.v5.power.coupStatus==='군정'){
    S.v097.reformPending=true;
    S.v097.constitution={key:'transitional',name:'군사과도체제',executive:'군사과도정부',legislature:'비상 국가회의',elections:'미정',term:'과도기',partySystem:'정당 활동 제한',concentration:88,reformCount:0,lastChanged:S.date,playerRole:`${S.name} · 군정 최고책임자`};
    save();setTimeout(v097OpenConstitutionConvention,120);
  }
};

/* 기존 군정 운영 메뉴는 새 체제 운영 화면으로 대체 */
openMilitaryRegime=v097OpenRegimeDashboard;

/* 군사 권력 창에 헌정개편 접근 추가 */
const v097BaseOpenCoup=v096OpenCoup;
v096OpenCoup=function(){
  ensureV097();
  if(['군정','신체제','헌정개편','민정이양','과도내각'].includes(S.v5.power.coupStatus))return v097OpenRegimeDashboard();
  return v097BaseOpenCoup();
};
openCoup=v096OpenCoup;

/* 체제별 월간 효과 */
const v097BaseMonthlyTick=monthlyTick;
monthlyTick=function(){
  ensureV097();v097BaseMonthlyTick();
  const p=S.v5.power,c=S.v097.constitution,key=c.key;
  if(key==='military_council'){
    S.nation.stability=clamp(S.nation.stability+1);S.nation.mood=clamp(S.nation.mood-1);p.legitimacy=clamp(p.legitimacy-1);S.nation.economy=clamp(S.nation.economy+rnd(-2,1));
  }else if(key==='strong_presidency'){
    p.legitimacy=clamp(p.legitimacy+(S.nation.mood>=50?1:-2));S.nation.stability=clamp(S.nation.stability+(p.legitimacy>45?1:-1));
  }else if(key==='semi_presidential'){
    p.legitimacy=clamp(p.legitimacy+(S.nation.mood>=45?1:-1));
  }else if(key==='parliamentary'){
    const seats=S.faction.partySeats||0;S.nation.stability=clamp(S.nation.stability+(seats>=120?1:seats<50?-1:0));
  }else if(key==='technocratic_transition'){
    S.nation.economy=clamp(S.nation.economy+1);p.legitimacy=clamp(p.legitimacy-1);
  }
  if(p.legitimacy<15&&key!=='presidential_democracy'&&Math.random()<.18){
    S.nation.stability=clamp(S.nation.stability-5);S.nation.mood=clamp(S.nation.mood-4);log(`${c.name}의 정당성 위기가 심화되고 있습니다.`);if(typeof v9AddHeadline==='function')v9AddHeadline('POLITICS',`[게임] ${c.name}, 정당성 위기 심화`,'down',true);
  }
};

/* 버전 / 버튼 바인딩 */
const v097BaseRender=v9Render;
v9Render=function(){
  ensureV097();v097BaseRender();
  const ver=document.querySelector('.v091-player-summary>small');if(ver)ver.textContent='PLAYER PROFILE · V0.9.7';
  const brand=document.querySelector('.v9-brand small');if(brand&&brand.textContent.includes('COMMAND CENTER'))brand.textContent='COMMAND CENTER · V0.9.7';
};

setTimeout(()=>{ensureV097();v9Render();if(S.v097.reformPending)setTimeout(v097OpenConstitutionConvention,180)},140);
