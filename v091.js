/* LIFE : RISE V0.9.1 — READABILITY / CAREER ACCESS PATCH */
const V091={version:'0.9.1'};

function v091CareerMeta(k){
  const meta={
    corp:{icon:'🏢',desc:'대기업 조직에서 실적·승진·사내정치를 경험합니다.',req:()=>({ok:true,text:'바로 지원 가능'})},
    military:{icon:'🪖',desc:'군 커리어. 대령 이후 준장·소장·중장·대장 진급 심사가 열립니다.',req:()=>({ok:true,text:'바로 지원 가능'})},
    politics:{icon:'🏛️',desc:'당원부터 시작해 선거·의회·장관·대통령을 노립니다.',req:()=>({ok:true,text:'바로 입문 가능'})},
    intel:{icon:'🕶️',desc:'정보분석·방첩·국가안보 커리어. 채용 심사를 통과해야 합니다.',req:()=>({ok:S.stats.int>=30,text:`지능 30 필요 · 현재 ${Math.round(S.stats.int)}`})},
    police:{icon:'🚔',desc:'치안·수사·조직 진급. 리더십과 평판이 중요합니다.',req:()=>({ok:true,text:'바로 지원 가능'})},
    prosecutor:{icon:'⚖️',desc:'수사·기소·권력 사건. 높은 지능과 정치력이 중요합니다.',req:()=>({ok:S.stats.int>=45,text:`지능 45 필요 · 현재 ${Math.round(S.stats.int)}`})},
    doctor:{icon:'🏥',desc:'진료·연구·병원 경영. 높은 진입 난이도와 안정적인 수입.',req:()=>({ok:S.stats.int>=48,text:`지능 48 필요 · 현재 ${Math.round(S.stats.int)}`})},
    lawyer:{icon:'📚',desc:'소송·협상·대형 고객. 지능과 매력이 수입으로 연결됩니다.',req:()=>({ok:S.stats.int>=42,text:`지능 42 필요 · 현재 ${Math.round(S.stats.int)}`})},
    entertainer:{icon:'🎬',desc:'오디션·방송·스캔들. 성공하면 큰돈과 인지도를 얻습니다.',req:()=>({ok:S.stats.cha>=35,text:`매력 35 필요 · 현재 ${Math.round(S.stats.cha)}`})},
    athlete:{icon:'⚽',desc:'경기·부상·이적. 짧은 전성기와 높은 보상을 노립니다.',req:()=>({ok:S.stats.health>=65,text:`건강 65 필요 · 현재 ${Math.round(S.stats.health)}`})},
    entrepreneur:{icon:'🚀',desc:'창업·투자유치·IPO·M&A. 고정 월급 없이 회사를 키웁니다.',req:()=>({ok:true,text:'바로 시작 가능'})},
    underworld:{icon:'🌒',desc:'고위험·고수익 지하세계 루트. 수사위험과 악명이 따라옵니다.',req:()=>({ok:true,text:'진입 가능 · 고위험'})}
  };
  return meta[k]||{icon:'💼',desc:'커리어',req:()=>({ok:true,text:'지원 가능'})};
}
function v091CareerKeys(){return ['corp','military','politics','intel','police','prosecutor','doctor','lawyer','entertainer','athlete','entrepreneur','underworld']}
function v091StatLabel(k){return {int:'지능',cha:'매력',lead:'리더십',pol:'정치력',net:'인맥',health:'건강'}[k]||k}
function v091AbilityPanel(withButtons=true){
  const rows=['int','cha','lead','pol','net','health'];
  return `<section class="v091-ability-card v9-card"><div class="v091-ability-head"><div><span>ABILITY DEVELOPMENT</span><b>내 능력치</b><small>지원 조건이 부족하면 여기서 바로 올릴 수 있습니다.</small></div>${withButtons?'<button data-v091-open-training>능력개발</button>':''}</div><div class="v091-ability-grid">${rows.map(k=>`<div><span>${v091StatLabel(k)}</span><b>${Math.round(S.stats[k])}</b><i><em style="width:${clamp(S.stats[k])}%"></em></i></div>`).join('')}</div></section>`;
}

function v091TrainingBody(){
  const cfg={
    int:['🧠','지능','집중학습 · 국정원/검사/의사 지원에 중요','+2','₩25만 · 5일'],
    cha:['🗣️','매력','화술·발표 훈련 · 정치/연예/협상에 중요','+2','₩20만 · 5일'],
    lead:['👑','리더십','지휘·리더십 과정 · 군/경찰 승진에 중요','+2','₩18만 · 5일'],
    pol:['♟️','정치력','정책·정치 감각 훈련 · 정치권 판정에 중요','+2','₩30만 · 7일'],
    net:['🤝','인맥','세미나·모임 참여 · 영입/사업/정치에 중요','+3','₩35만 · 7일'],
    health:['❤️','건강','체력관리 · 운동선수/고강도 커리어에 중요','+4','₩12만 · 5일']
  };
  return `<div class="v091-training-grid">${Object.entries(cfg).map(([k,x])=>`<button data-v091-train="${k}"><strong>${x[0]} ${x[1]}</strong><span>${x[2]}</span><em>${x[3]} · ${x[4]}</em></button>`).join('')}</div>`;
}
function openV091Training(){
  modal('📚','능력 개발 센터','원하는 능력치를 직접 훈련할 수 있습니다. 시간과 비용이 들기 때문에 어떤 커리어를 준비할지 먼저 정하는 편이 효율적입니다.',[['직업 센터','지원 가능한 직업 확인',openCareerCenter]],v091TrainingBody());
  $$('[data-v091-train]').forEach(b=>b.onclick=()=>v091TrainStat(b.dataset.v091Train));
}
function v091TrainStat(k){
  const cfg={int:{cost:250000,days:5,add:2,stress:2,msg:'집중학습으로 지능이 올랐습니다.'},cha:{cost:200000,days:5,add:2,stress:1,msg:'화술과 발표 훈련으로 매력이 올랐습니다.'},lead:{cost:180000,days:5,add:2,stress:2,msg:'리더십 훈련을 마쳤습니다.'},pol:{cost:300000,days:7,add:2,stress:2,msg:'정책과 정치 감각을 공부했습니다.'},net:{cost:350000,days:7,add:3,stress:1,msg:'새로운 사람들을 만나 인맥을 넓혔습니다.'},health:{cost:120000,days:5,add:4,stress:-2,msg:'체력관리를 통해 건강이 좋아졌습니다.'}}[k];
  if(!cfg)return;if(!spend(cfg.cost))return;
  S.stats[k]=clamp(S.stats[k]+cfg.add);S.stats.stress=clamp(S.stats.stress+cfg.stress);closeModal();advance(cfg.days,cfg.msg);setTimeout(openV091Training,30);
}

function v091ApplyCareer(k){
  if(S.career&&S.career!==k)return toast('현재 커리어를 먼저 정리해야 합니다. 커리어 화면에서 퇴직 후 다시 지원하세요.');
  const req=v091CareerMeta(k).req();if(!req.ok){toast(req.text);return openV091Training()}
  if(k==='intel')return joinIntel();
  if(['police','prosecutor','doctor','lawyer','entertainer','athlete','entrepreneur'].includes(k))return startV4Career(k);
  return joinCareer(k);
}

/* Replace old limited career center: all careers are visible from the beginning. */
openCareerCenter=function(){
  ensureV9();
  const groups=[
    ['국가·권력',['military','politics','intel','police','prosecutor']],
    ['기업·전문직',['corp','doctor','lawyer','entrepreneur']],
    ['대중·고위험',['entertainer','athlete','underworld']]
  ];
  const body=`<div class="v091-current-stats"><b>현재 능력치</b><span>지능 ${Math.round(S.stats.int)}</span><span>매력 ${Math.round(S.stats.cha)}</span><span>리더십 ${Math.round(S.stats.lead)}</span><span>정치력 ${Math.round(S.stats.pol)}</span><span>인맥 ${Math.round(S.stats.net)}</span><span>건강 ${Math.round(S.stats.health)}</span><button id="v091TrainNow">능력개발</button></div>${groups.map(([g,keys])=>`<div class="v091-career-group"><h3>${g}</h3><div class="v091-career-grid">${keys.map(k=>{const m=v091CareerMeta(k),r=m.req(),cur=S.career===k;return `<button class="v091-career ${r.ok?'ready':'locked'} ${cur?'current':''}" data-v091-career="${k}"><div class="ico">${m.icon}</div><div><b>${careers[k]?.name||k}</b><span>${m.desc}</span><em>${cur?'현재 직업':r.ok?'지원 가능':r.text}</em></div></button>`}).join('')}</div></div>`).join('')}<div class="difficultyBox">국정원은 <b>지능 30</b>부터 지원할 수 있습니다. 시작 지능이 부족하면 위의 <b>능력개발</b>에서 집중학습을 하세요. 군인은 처음부터 지원 가능합니다.</div>`;
  modal('💼','직업 센터','모든 핵심 커리어를 한 화면에서 선택할 수 있습니다. 잠긴 직업은 필요한 능력치와 현재 수치가 바로 표시됩니다.',[],body);
  $('#v091TrainNow')&&($('#v091TrainNow').onclick=openV091Training);
  $$('[data-v091-career]').forEach(b=>b.onclick=()=>v091ApplyCareer(b.dataset.v091Career));
}

function v091Compensation(){
  if(!S.career)return {job:'무직',rank:'구직 중',annual:'연봉 없음',monthly:'월급 ₩0'};
  const c=careers[S.career],monthly=Number(c?.salary?.[S.level]||0),rank=c?.levels?.[S.level]||'현재 직위';
  const variable=S.career==='entrepreneur';
  return {job:c?.name||S.career,rank,annual:variable?'수익 변동':monthly?`연봉 ${KRW(monthly*12)}`:'연봉 없음',monthly:variable?'사업 수익 기반':`월급 ${KRW(monthly)}`};
}
function v091EnhanceUI(){
  const comp=v091Compensation();
  const brand=$('.v9-brand');
  if(brand)brand.innerHTML=`<div class="v091-player-mark">${v8Initials()}</div><div class="v091-player-summary"><small>PLAYER PROFILE · V0.9.1</small><strong>${S.name}</strong><p><span>직업</span><b>${comp.job}</b></p><p><span>직위</span><b>${comp.rank}</b></p><p><span>연봉</span><b>${comp.annual}</b></p></div>`;
  const nav=$('.v9-rail nav');
  const careerBtn=nav?.querySelector('[data-v9view="career"]');
  if(nav&&careerBtn&&!nav.querySelector('[data-v091-ability]'))careerBtn.insertAdjacentHTML('afterend','<button data-v091-ability><i>🧠</i>능력개발</button>');
  const abilityBtn=nav?.querySelector('[data-v091-ability]');if(abilityBtn)abilityBtn.onclick=openV091Training;
  const player=$('.v9-player');
  if(player){player.classList.add('v091-side-abilities');player.innerHTML=`<div class="v091-side-title"><b>능력치</b><button data-v091-side-train>개발</button></div><div class="v091-side-grid"><span>지능 <b>${Math.round(S.stats.int)}</b></span><span>매력 <b>${Math.round(S.stats.cha)}</b></span><span>리더십 <b>${Math.round(S.stats.lead)}</b></span><span>정치력 <b>${Math.round(S.stats.pol)}</b></span><span>인맥 <b>${Math.round(S.stats.net)}</b></span><span>건강 <b>${Math.round(S.stats.health)}</b></span></div><em>POWER ${Math.round(power())} · 평판 ${Math.round(S.stats.reputation)}</em>`;player.querySelector('[data-v091-side-train]').onclick=openV091Training}
  $$('[data-v091-open-training]').forEach(b=>b.onclick=openV091Training);
}

/* Improve the empty career page and always expose abilities. */
const v091BaseCareerPage=v9CareerPage;
v9CareerPage=function(){
  if(!S.career)return `<div class="v9-page"><div class="v9-page-title"><div><span>CAREER START</span><h1>어떤 인생을 시작할까요?</h1><p>군인과 국정원을 포함한 모든 핵심 직업을 직업 센터에서 선택할 수 있습니다. 조건이 부족하면 능력개발부터 시작하세요.</p></div><div class="v091-title-actions"><button id="v9OpenCareer">직업 선택</button><button id="v091CareerTraining">능력개발</button></div></div>${v091AbilityPanel(false)}<section class="v9-card v091-career-guide"><div class="v9-section-head"><div><span>QUICK GUIDE</span><b>초반 추천 진로</b></div></div><div><p>🪖 <b>군인</b> — 조건 없이 시작. 리더십과 군 영향력을 키워 장군·장관·정치 진출.</p><p>🕶️ <b>국정원</b> — 지능 30 필요. 시작 지능 26이라면 집중학습 2회면 지원 기준 도달.</p><p>🏢 <b>대기업</b> — 안정적인 월급과 승진. 기업·정치 인맥을 만들기 좋음.</p><p>🚀 <b>사업가</b> — 월급은 없지만 성공하면 가장 큰 자산을 만들 수 있음.</p></div></section></div>`;
  return v091BaseCareerPage()+v091AbilityPanel(true);
};

const v091BaseRender=v9Render;
v9Render=function(){v091BaseRender();v091EnhanceUI();const b=$('#v091CareerTraining');if(b)b.onclick=openV091Training;const brandText=document.querySelector('.brand span');if(brandText)brandText.textContent='Visual Life & Power Sandbox · V0.9.1'};

/* Re-bind because V0.9 had already performed its first render before this patch loaded. */
setTimeout(()=>{ensureV9();v9Render()},80);
