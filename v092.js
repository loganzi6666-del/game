/* LIFE : RISE V0.9.2 — INLINE DEVELOPMENT + ACTIVE WORK PATCH */
const V092={version:'0.9.2'};

function ensureV092(){
  ensureV9();
  S.v092=S.v092||{workShifts:0,careerEarnings:0,lastWorked:null,monthKey:'',monthShifts:0};
  const key=String(S.date||'').slice(0,7);
  if(S.v092.monthKey!==key){S.v092.monthKey=key;S.v092.monthShifts=0}
}

function v092TrainingCfg(){return {
  int:{icon:'🧠',name:'지능',desc:'집중학습 · 국정원/검사/의사 지원에 중요',cost:250000,days:5,add:2,stress:2},
  cha:{icon:'🗣️',name:'매력',desc:'화술·발표 훈련 · 정치/연예/협상에 중요',cost:200000,days:5,add:2,stress:1},
  lead:{icon:'👑',name:'리더십',desc:'지휘·리더십 과정 · 군/경찰 승진에 중요',cost:180000,days:5,add:2,stress:2},
  pol:{icon:'♟️',name:'정치력',desc:'정책·정치 감각 훈련 · 정치권 판정에 중요',cost:300000,days:7,add:2,stress:2},
  net:{icon:'🤝',name:'인맥',desc:'세미나·모임 참여 · 영입/사업/정치에 중요',cost:350000,days:7,add:3,stress:1},
  health:{icon:'❤️',name:'건강',desc:'체력관리 · 운동선수/고강도 커리어에 중요',cost:120000,days:5,add:4,stress:-2}
}}
function v092NeedCards(){
  const reqs=v091CareerKeys().map(k=>{const m=v091CareerMeta(k),r=m.req();return {k,m,r}}).filter(x=>!x.r.ok).slice(0,4);
  if(!reqs.length)return `<div class="v092-goal good"><b>현재 지원 조건</b><span>주요 직업의 기본 지원 조건을 모두 충족했습니다.</span></div>`;
  return reqs.map(x=>`<div class="v092-goal"><b>${x.m.icon} ${careers[x.k]?.name||x.k}</b><span>${x.r.text}</span></div>`).join('')
}
function v092AbilityPage(){
  ensureV092();const cfg=v092TrainingCfg();
  return `<div class="v9-page v092-page">
    <div class="v9-page-title"><div><span>ABILITY DEVELOPMENT</span><h1>능력 개발 센터</h1><p>팝업 없이 이 화면에서 바로 훈련합니다. 원하는 커리어의 지원 조건을 보고 필요한 능력만 키우세요.</p></div><button id="v092CareerCenter">직업 조건 보기</button></div>
    ${v091AbilityPanel(false)}
    <div class="v092-two">
      <section class="v9-card v092-train-card"><div class="v9-section-head"><div><span>TRAINING</span><b>훈련 선택</b></div><em>시간과 비용이 소모됩니다</em></div>
        <div class="v092-training-grid">${Object.entries(cfg).map(([k,x])=>`<button data-v092-train="${k}"><div class="v092-train-icon">${x.icon}</div><div><b>${x.name} +${x.add}</b><span>${x.desc}</span><em>${KRW(x.cost)} · ${x.days}일 · 스트레스 ${x.stress>=0?'+':''}${x.stress}</em></div></button>`).join('')}</div>
      </section>
      <section class="v9-card"><div class="v9-section-head"><div><span>CAREER TARGET</span><b>지금 부족한 지원 조건</b></div></div><div class="v092-goals">${v092NeedCards()}</div><div class="v092-tip"><b>TIP</b><p>국정원은 지능 30부터 지원할 수 있습니다. 군인은 별도 능력 조건 없이 바로 지원할 수 있습니다.</p></div></section>
    </div>
  </div>`
}
function v092TrainStat(k){
  ensureV092();const x=v092TrainingCfg()[k];if(!x)return;
  if(!spend(x.cost))return;
  S.stats[k]=clamp(S.stats[k]+x.add);S.stats.stress=clamp(S.stats.stress+x.stress);S.v9.view='ability';
  advance(x.days,`${x.name} 훈련을 마쳤습니다. ${x.name} +${x.add}`);toast(`${x.name} +${x.add}`)
}

/* Ability development now lives inside the main command center, never a popup. */
openV091Training=function(){v9SetView('ability')};

function v092CareerWorkMeta(){
  const map={
    corp:['🏢','프로젝트 근무','지능','business'],military:['🪖','지휘·보직 근무','리더십','military'],politics:['🏛️','의정·정당 업무','정치력','political'],intel:['🕶️','정보분석·안보 업무','지능','political'],
    police:['🚔','치안·수사 근무','리더십','political'],prosecutor:['⚖️','수사·공판 업무','지능','political'],doctor:['🏥','진료·당직','지능','business'],lawyer:['📚','사건·자문 업무','매력','business'],
    entertainer:['🎬','촬영·방송 일정','매력','media'],athlete:['⚽','훈련·경기 일정','건강','media'],entrepreneur:['🚀','회사 경영','지능','business'],underworld:['🌒','조직 활동','리더십','under']
  };
  return map[S.career]||['💼','근무','지능','business']
}
function v092TaxRate(monthly){if(monthly>=15000000)return .22;if(monthly>=8000000)return .18;if(monthly>=4500000)return .14;return .10}
function v092WeeklyNet(mult=1){
  if(!S.career)return 0;const monthly=Number(careers[S.career]?.salary?.[S.level]||0);const gross=monthly*12/52*mult;return Math.round(gross*(1-v092TaxRate(monthly)))
}
function v092WorkPage(){
  ensureV092();const meta=v092CareerWorkMeta();const comp=v091Compensation();const net=v092WeeklyNet(1);const level=S.career?careers[S.career]?.levels?.[S.level]:'구직 중';
  if(!S.career)return `<div class="v9-page v092-page"><div class="v9-page-title"><div><span>WORK DESK</span><h1>아직 직업이 없습니다</h1><p>직업을 먼저 선택하거나 단기 아르바이트로 생활비를 벌 수 있습니다.</p></div><button id="v092GoCareer">직업 선택</button></div><section class="v9-card v092-work-empty"><div><span>단기 근무</span><h2>생활비 벌기</h2><p>5일 동안 단기 일을 하고 세후 약 45만원을 받습니다. 경력 승진점수는 쌓이지 않습니다.</p><button data-v092-work="temp">5일 아르바이트 · +₩450,000</button></div></section></div>`;
  return `<div class="v9-page v092-page">
    <div class="v9-page-title"><div><span>WORK DESK</span><h1>${meta[0]} ${meta[1]}</h1><p>${comp.job} · ${level} · ${comp.annual}. V0.9.2부터 급여는 실제로 일한 만큼 지급됩니다.</p></div><div class="v092-work-head"><span>이번 달 근무 <b>${S.v092.monthShifts}회</b></span><span>누적 실수령 <b>${v9Money(S.v092.careerEarnings)}</b></span></div></div>
    <div class="v092-work-layout">
      <section class="v9-card v092-work-main"><div class="v9-section-head"><div><span>SHIFT</span><b>이번 근무 선택</b></div><em>근무 후 시간이 실제로 흐릅니다</em></div>
        <button class="v092-primary-work" data-v092-work="standard"><span>정규 근무</span><b>5일 일하기</b><em>세후 ${net?v9Money(net):'직접수익 없음'} · 경력 +18 · 스트레스 +5</em></button>
        <div class="v092-work-options"><button data-v092-work="overtime"><b>추가 근무</b><span>2일 · 세후 ${v092WeeklyNet(.45)?v9Money(v092WeeklyNet(.45)):'직접수익 없음'}</span><em>경력 +9 · 스트레스 +7</em></button><button data-v092-work="intense"><b>집중 근무</b><span>7일 · 세후 ${v092WeeklyNet(1.25)?v9Money(v092WeeklyNet(1.25)):'직접수익 없음'}</span><em>경력 +26 · 스트레스 +10</em></button></div>
      </section>
      <section class="v9-card"><div class="v9-section-head"><div><span>JOB STATUS</span><b>근무 상태</b></div></div><div class="v092-job-kpis"><div><span>직위</span><b>${level}</b></div><div><span>경력점수</span><b>${Math.round(S.xp)}</b></div><div><span>스트레스</span><b>${Math.round(S.stats.stress)}</b></div><div><span>평판</span><b>${Math.round(S.stats.reputation)}</b></div><div><span>이번달 근무</span><b>${S.v092.monthShifts}회</b></div><div><span>마지막 근무</span><b>${S.v092.lastWorked||'없음'}</b></div></div><div class="v092-tip"><b>급여 규칙</b><p>월급 자동지급을 제거했습니다. 정규/추가/집중 근무를 직접 해야 급여가 들어옵니다. 상단의 월흐름은 풀근무 기준 예상치입니다.</p></div></section>
    </div>
  </div>`
}
function v092DoWork(type){
  ensureV092();
  if(type==='temp'){
    S.cash+=450000;S.stats.stress=clamp(S.stats.stress+5);S.v092.workShifts++;S.v092.monthShifts++;S.v092.careerEarnings+=450000;S.v092.lastWorked=S.date;S.v9.view='work';advance(5,'단기 근무를 마치고 ₩450,000을 벌었습니다.');return
  }
  if(!S.career)return v9SetView('career');
  const setup={standard:{days:5,mult:1,xp:18,stress:5},overtime:{days:2,mult:.45,xp:9,stress:7},intense:{days:7,mult:1.25,xp:26,stress:10}}[type];if(!setup)return;
  const [icon,label,statKr,infKey]=v092CareerWorkMeta();
  const statKey={지능:'int',매력:'cha',리더십:'lead',정치력:'pol',건강:'health'}[statKr]||'int';
  let net=v092WeeklyNet(setup.mult),message=`${label}를 마쳤습니다.`;
  if(S.career==='entrepreneur'){
    net=0;ensureV5();if(S.v5?.company?.exists){const boost=Math.round((S.v5.company.revenue||10000000)*(.05+.04*setup.mult));S.v5.company.cash+=boost;S.v5.company.product=clamp(S.v5.company.product+1);message=`회사 경영에 집중해 회사현금 ${KRW(boost)}을 추가로 확보했습니다.`}else message='창업 준비와 사업개발에 집중했습니다.'
  }else if(S.career==='underworld'){
    net=Math.round((S.level+1)*650000*setup.mult);S.heat=clamp((S.heat||0)+Math.round(4*setup.mult));message=`조직 활동으로 ${KRW(net)}을 벌었습니다.`
  }
  S.cash+=net;S.v092.workShifts++;S.v092.monthShifts++;S.v092.careerEarnings+=net;S.v092.lastWorked=S.date;
  S.stats.stress=clamp(S.stats.stress+setup.stress+(S.v092.monthShifts>5?2:0));S.stats[statKey]=clamp(S.stats[statKey]+1);if(S.inf[infKey]!=null)S.inf[infKey]=clamp(S.inf[infKey]+(type==='intense'?3:2));addXP(setup.xp);S.v9.view='work';
  advance(setup.days,`${message}${net>0?` 실수령 ${KRW(net)}.`:''} 경력점수 +${setup.xp}`);
  if(Math.random()<.18)setTimeout(()=>{if(typeof maybeEvent==='function')maybeEvent(true)},180)
}

/* Remove the old automatic monthly salary. Passive income/expenses still settle monthly. */
const v092BaseMonthlyTick=monthlyTick;
monthlyTick=function(){
  const autoSalary=S.career?Number(careers[S.career]?.salary?.[S.level]||0):0;
  v092BaseMonthlyTick();
  if(autoSalary>0){S.cash-=autoSalary;if(S.cash<0){S.debt=(S.debt||0)+Math.abs(S.cash);S.cash=0}}
  ensureV092();
};

/* Main content router extension */
const v092BasePage=v9Page;
v9Page=function(){if(S.v9?.view==='ability')return v092AbilityPage();if(S.v9?.view==='work')return v092WorkPage();return v092BasePage()};

/* Add an always-visible work button to the career page too. */
const v092BaseCareerPage=v9CareerPage;
v9CareerPage=function(){
  let html=v092BaseCareerPage();
  if(S.career)html=html.replace(/<\/div>\s*$/,`<section class="v9-card v092-career-work"><div><span>ACTIVE WORK</span><b>월급은 직접 일해서 받습니다</b><p>근무를 하면 급여·경력점수·직업 능력치가 함께 상승합니다.</p></div><button data-v092-open-work>💼 일하기</button></section></div>`);
  return html
};

function v092EnhanceUI(){
  ensureV092();
  const nav=$('.v9-rail nav');if(!nav)return;
  let ability=nav.querySelector('[data-v091-ability]');
  if(ability){ability.classList.toggle('active',S.v9.view==='ability');ability.onclick=()=>v9SetView('ability')}
  if(!nav.querySelector('[data-v092-work]')){
    const target=ability||nav.querySelector('[data-v9view="career"]');
    target?.insertAdjacentHTML('afterend',`<button class="${S.v9.view==='work'?'active':''}" data-v092-work><i>💼</i><span>일하기</span></button>`)
  }
  const work=nav.querySelector('[data-v092-work]');if(work){work.classList.toggle('active',S.v9.view==='work');work.onclick=()=>v9SetView('work')}
  const version=$('.v091-player-summary>small');if(version)version.textContent='PLAYER PROFILE · V0.9.2';
  $$('[data-v091-open-training]').forEach(b=>b.onclick=()=>v9SetView('ability'));
}

const v092BaseRender=v9Render;
v9Render=function(){v092BaseRender();v092EnhanceUI();v092Bind()};
function v092Bind(){
  $$('[data-v092-train]').forEach(b=>b.onclick=()=>v092TrainStat(b.dataset.v092Train));
  $$('[data-v092-work]').forEach(b=>{if(b.closest('.v9-rail'))return;b.onclick=()=>v092DoWork(b.dataset.v092Work)});
  $$('[data-v092-open-work]').forEach(b=>b.onclick=()=>v9SetView('work'));
  $('#v092CareerCenter')&&($('#v092CareerCenter').onclick=openCareerCenter);$('#v092GoCareer')&&($('#v092GoCareer').onclick=openCareerCenter)
}

/* Keep career-center training buttons inline as well. */
const v092OldCareerCenter=openCareerCenter;
openCareerCenter=function(){v092OldCareerCenter();const train=$('#v091TrainNow');if(train)train.onclick=()=>{closeModal();v9SetView('ability')}};

window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(!$('#modal')?.classList.contains('hidden'))return;if(!$('#startScreen')?.classList.contains('hidden'))return;if(e.key.toLowerCase()==='w'){e.preventDefault();v9SetView('work')}});
setTimeout(()=>{ensureV092();v9Render()},150);

/* Dashboard 'career focus' now means an actual paid work week. */
const v092BaseRunFocus=v8RunFocus;
v8RunFocus=function(type){
  if(type==='career'){
    if(!S.career)return v9SetView('career');
    return v092DoWork('standard')
  }
  return v092BaseRunFocus(type)
};
