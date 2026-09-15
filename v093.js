/* LIFE : RISE V0.9.3 — CAREER HUB + STRICT CAREER EVENTS + KOREAN MONEY FORMAT */
const V093={version:'0.9.3'};

function ensureV093(){
  ensureV092();
  S.version='0.9.3';
  S.v093=S.v093||{careerEvents:0,lastCareerEvent:null};
}

/* 1억 2,500만원 / 3,000만원 / 450만원처럼 읽히는 한국식 금액 */
function v093Money(n){
  n=Math.round(Number(n)||0);
  const sign=n<0?'-':''; n=Math.abs(n);
  if(n===0)return '0원';
  const jo=Math.floor(n/1e12); n%=1e12;
  const eok=Math.floor(n/1e8); n%=1e8;
  const man=Math.floor(n/1e4); const won=n%1e4;
  const out=[];
  if(jo)out.push(`${jo.toLocaleString('ko-KR')}조`);
  if(eok)out.push(`${eok.toLocaleString('ko-KR')}억`);
  if(man)out.push(`${man.toLocaleString('ko-KR')}만원`);
  if(!out.length&&won)out.push(`${won.toLocaleString('ko-KR')}원`);
  return sign+out.join(' ');
}
/* Command Center 안의 큰 금액 표기를 전부 한국식 단위로 통일 */
v9Money=v093Money;

v091Compensation=function(){
  if(!S.career)return {job:'무직',rank:'구직 중',annual:'연봉 없음',monthly:'월급 0원'};
  const c=careers[S.career],monthly=Number(c?.salary?.[S.level]||0),rank=c?.levels?.[S.level]||'현재 직위';
  const variable=S.career==='entrepreneur';
  return {job:c?.name||S.career,rank,annual:variable?'수익 변동':monthly?`연봉 ${v093Money(monthly*12)}`:'연봉 없음',monthly:variable?'사업 수익 기반':`월급 ${v093Money(monthly)}`};
};

function v093CareerIcon(){return v091CareerMeta(S.career||'corp').icon||'💼'}
function v093Need(){return S.career==='military'&&S.level>=6?130+S.level*34:100+S.level*28}
function v093CareerEventCount(){return EVENTS.filter(e=>!e.follow&&e.career===S.career&&(e.minLevel==null||S.level>=e.minLevel)).length}
function v093PrimaryStat(){
  const p=careers[S.career]?.primary||'int';return {int:'지능',cha:'매력',lead:'리더십',pol:'정치력',net:'인맥',health:'건강'}[p]||p
}

function v093WorkPanel(){
  ensureV093();
  if(!S.career)return `<section class="v9-card v093-work-card"><div class="v9-section-head"><div><span>WORK</span><b>생활비가 필요하다면</b></div></div><button class="v093-work-main" data-v092-work="temp"><span>단기 아르바이트</span><b>5일 일하기</b><em>실수령 45만원 · 스트레스 +5</em></button></section>`;
  const meta=v092CareerWorkMeta(),net=v092WeeklyNet(1);
  return `<section class="v9-card v093-work-card">
    <div class="v9-section-head"><div><span>WORK</span><b>${meta[0]} ${meta[1]}</b></div><em>이번 달 ${S.v092.monthShifts}회 근무</em></div>
    <button class="v093-work-main" data-v092-work="standard"><span>정규 근무</span><b>5일 일하기</b><em>실수령 ${net?v093Money(net):'직접수익 없음'} · 경력 +18 · 스트레스 +5</em></button>
    <div class="v093-work-sub">
      <button data-v092-work="overtime"><b>추가 근무</b><span>2일 · ${v092WeeklyNet(.45)?v093Money(v092WeeklyNet(.45)):'직접수익 없음'}</span><em>경력 +9 · 스트레스 +7</em></button>
      <button data-v092-work="intense"><b>집중 근무</b><span>7일 · ${v092WeeklyNet(1.25)?v093Money(v092WeeklyNet(1.25)):'직접수익 없음'}</span><em>경력 +26 · 스트레스 +10</em></button>
    </div>
  </section>`
}

function v093EventDesk(){
  if(!S.career)return '';
  const count=v093CareerEventCount(),recent=(S.v3?.eventsSeen||[]).slice(-4).map(getEvent).filter(e=>e&&e.career===S.career);
  return `<section class="v9-card v093-event-desk"><div class="v9-section-head"><div><span>CAREER EVENTS</span><b>${careers[S.career].name} 전용 사건</b></div><em>${count}개 상황</em></div>
    <div class="v093-event-hero"><div><span>${v093CareerIcon()}</span><div><b>오늘 직업 현장에서 무슨 일이 생길까?</b><p>현재 직업과 무관한 정치·다른 직종 사건은 더 이상 등장하지 않습니다.</p></div></div><button id="v093CareerEvent">사건 발생</button></div>
    <div class="v093-recent-events">${recent.length?recent.map(e=>`<span>${e.icon} ${e.title}</span>`).join(''):'<span>아직 처리한 직업 사건이 없습니다.</span>'}</div>
  </section>`
}

function v093CareerStats(){
  const need=v093Need(),pct=clamp(S.xp/need*100),comp=v091Compensation();
  return `<div class="v093-career-kpis">
    <div><span>직위</span><b>${comp.rank}</b></div><div><span>연봉</span><b>${comp.annual.replace('연봉 ','')}</b></div>
    <div><span>승진점수</span><b>${Math.round(S.xp)} / ${need}</b></div><div><span>승진 진행</span><b>${Math.round(pct)}%</b></div>
    <div><span>핵심 능력</span><b>${v093PrimaryStat()}</b></div><div><span>누적 실수령</span><b>${v093Money(S.v092.careerEarnings||0)}</b></div>
  </div>`
}

/* V0.9.8부터 커리어(경력기록)와 일하기(현재 직업)가 분리된다. 분리 버전이 로드되어 있으면
   아래의 work→career 강제 전환은 일하기 화면 자체를 지워버리므로 비활성화한다. */
function v093WorkSplit(){return typeof V098!=='undefined'}

function v093CareerHubPage(){
  ensureV093();
  if(!S.career)return `<div class="v9-page v093-page">
    <div class="v9-page-title"><div><span>CAREER HUB</span><h1>직업을 선택하고 첫 경력을 시작하세요</h1><p>직업을 고르면 일하기·승진·직업 전용 사건이 모두 이 화면에서 관리됩니다.</p></div><button id="v9OpenCareer">직업 선택</button></div>
    <div class="v093-hub-grid">${v093WorkPanel()}<section class="v9-card"><div class="v9-section-head"><div><span>PREP</span><b>능력개발</b></div></div>${v091AbilityPanel(false)}<button class="v093-wide" data-v091-open-training>능력개발 센터 열기</button></section></div>
  </div>`;
  const comp=v091Compensation(),need=v093Need(),pct=clamp(S.xp/need*100);
  const ladder=S.career==='military'?v9MilitaryCareerPanel():v9GenericCareerPanel(careers[S.career],pct);
  return `<div class="v9-page v093-page">
    <div class="v093-career-hero"><div class="v093-job-icon">${v093CareerIcon()}</div><div class="v093-job-title"><span>CAREER HUB</span><h1>${comp.job} · ${comp.rank}</h1><p>${comp.annual} · 평판 ${Math.round(S.stats.reputation)} · 프레스티지 ${Math.round(v9CareerPrestige())}</p></div><button id="v093ChangeCareer">직업 관리</button></div>
    ${v093CareerStats()}
    <div class="v093-hub-grid">${v093WorkPanel()}${v093EventDesk()}</div>
    ${ladder}
    <div class="v093-bottom-grid"><section class="v9-card"><div class="v9-section-head"><div><span>POLITICAL DOOR</span><b>다음 커리어 기회</b></div></div>${v9PoliticalDoor()}</section><section class="v9-card"><div class="v9-section-head"><div><span>ABILITY</span><b>핵심 능력치</b></div></div><div class="v093-mini-ability"><span>지능 <b>${Math.round(S.stats.int)}</b></span><span>매력 <b>${Math.round(S.stats.cha)}</b></span><span>리더십 <b>${Math.round(S.stats.lead)}</b></span><span>정치력 <b>${Math.round(S.stats.pol)}</b></span><span>인맥 <b>${Math.round(S.stats.net)}</b></span><span>건강 <b>${Math.round(S.stats.health)}</b></span></div><button class="v093-wide" data-v091-open-training>능력개발</button></section></div>
  </div>`
}

/* 커리어와 일하기를 한 화면으로 통합. 이전 저장이 work 화면이면 자동으로 career로 전환. */
v9CareerPage=v093CareerHubPage;
const v093BasePage=v9Page;
v9Page=function(){
  if(S.v9?.view==='work'&&!v093WorkSplit()){S.v9.view='career';save()}
  if(S.v9?.view==='career')return v093CareerHubPage();
  return v093BasePage()
};

/* 일한 뒤에도 커리어 허브에 머무른다. */
const v093BaseDoWork=v092DoWork;
v092DoWork=function(type){
  v093BaseDoWork(type);
  if(S.career||type==='temp'){S.v9.view=v093WorkSplit()?'work':'career';save();setTimeout(()=>v9Render(),20)}
  // 근무는 직업 사건의 가장 자연스러운 트리거. 기존 18% 판정이 빗나가면 추가로 한 번 체크한다.
  if(S.career&&type!=='temp')setTimeout(()=>{
    if($('#modal')?.classList.contains('hidden')&&Math.random()<.30)v093TriggerCareerEvent();
  },430);
};

/* 직업별 이벤트를 확장한다. */
(function addV093CareerEvents(){
 const add=(e)=>{if(!EVENTS.some(x=>x.id===e.id))EVENTS.push(e)};
 // 국정원 — 구체적 작전법 대신 정보판단/보안/감사 중심
 add(evt('intel_source','intel','🕶️','정보 신뢰도 경보','서로 다른 정보가 같은 사안을 정반대로 설명한다. 상부는 빠른 판단을 요구한다.',[
  choice('추가 교차검증','지능 판정 · 정확도 우선',{success:{xp:24,stats:{int:2,reputation:3,stress:4},inf:{political:2}},fail:{xp:6,stats:{stress:7}},successText:'상충 정보를 정리해 신뢰도 높은 결론을 냈습니다.',failText:'검증이 길어져 보고 시점을 놓쳤습니다.'},{check:['int',42]}),
  choice('보수적으로 보고','위험 최소화 · 성장 적음',{xp:10,stats:{reputation:1,stress:1},resultText:'확실한 부분만 보고해 큰 오판을 피했습니다.'}),
  choice('분석팀 토론을 주도','리더십/인맥 성장',{xp:17,stats:{lead:2,net:2,stress:3},resultText:'분석팀의 시각을 통합해 판단 품질을 높였습니다.'})]));
 add(evt('intel_counter','intel','🧩','내부 보안 이상징후','내부 자료 접근 기록에서 평소와 다른 패턴이 발견됐다. 아직 사고인지 실수인지 확실하지 않다.',[
  choice('감사 절차로 확인','지능 판정 · 신뢰 상승',{success:{xp:23,stats:{int:2,reputation:4},inf:{political:2}},fail:{xp:7,stats:{stress:6}},successText:'과잉 대응 없이 원인을 확인했습니다.',failText:'원인을 특정하지 못하고 조직 피로만 늘었습니다.'},{check:['int',46]}),
  choice('접근권한을 임시 조정','안전 우선 · 조직마찰',{xp:16,stats:{lead:2,stress:5,reputation:1},resultText:'위험을 낮췄지만 일부 부서의 불만이 생겼습니다.'}),
  choice('상급자와 공동 판단','정치력/인맥 성장',{xp:14,stats:{pol:2,net:2},resultText:'책임을 공유하며 조직적 대응을 만들었습니다.'})]));
 add(evt('intel_audit','intel','🏛️','국회 정보위 보고','국회 정보위원회가 민감한 사안에 대한 공개 가능한 수준의 설명을 요구한다.',[
  choice('팩트 중심으로 설명','매력 판정 · 신뢰 상승',{success:{xp:21,stats:{cha:2,reputation:5},inf:{political:3}},fail:{xp:5,stats:{reputation:-3,stress:6}},successText:'절제된 설명으로 신뢰를 얻었습니다.',failText:'답변이 모호하다는 비판이 나왔습니다.'},{check:['cha',42]}),
  choice('법적 한계를 명확히 한다','정치력 상승',{xp:17,stats:{pol:3,reputation:2},resultText:'공개 범위를 명확히 하며 논란을 줄였습니다.'}),
  choice('실무진 자료를 보강한다','지능/경력 상승',{xp:18,stats:{int:2,stress:4},resultText:'자료 완성도를 높여 후속 질의를 줄였습니다.'})]));
 add(evt('intel_overseas','intel','🌐','해외 정세 급변','해외 정치·경제 상황이 갑자기 바뀌어 기존 전망을 전면 수정해야 한다.',[
  choice('전망을 즉시 수정','지능 판정 · 큰 경력',{success:{xp:27,stats:{int:2,reputation:4,stress:6},inf:{political:3}},fail:{xp:5,stats:{stress:9,reputation:-2}},successText:'빠른 재분석이 정책 판단에 도움을 줬습니다.',failText:'성급한 전망 수정이 혼선을 키웠습니다.'},{check:['int',50]}),
  choice('경제팀과 합동 분석','인맥/기업 이해 상승',{xp:18,stats:{net:3,int:1},inf:{business:2},resultText:'경제적 파급효과까지 반영한 보고서를 만들었습니다.'}),
  choice('불확실성을 강조','안정적 · 평판 소폭',{xp:11,stats:{reputation:2,stress:-1},resultText:'확신보다 불확실성 범위를 명확히 제시했습니다.'})]));

 // 경찰
 add(evt('police_case','police','🚔','중요 사건 수사팀','사회적 관심이 큰 사건의 수사팀에 합류하라는 지시가 내려왔다.',[
  choice('증거 중심 수사','지능 판정',{success:{xp:25,stats:{int:2,reputation:5,stress:7},inf:{political:2}},fail:{xp:6,stats:{stress:9}},successText:'핵심 증거를 정리해 사건을 진전시켰습니다.',failText:'수사가 길어지며 압박이 커졌습니다.'},{check:['int',43]}),
  choice('팀 지휘에 집중','리더십 판정',{success:{xp:22,stats:{lead:3,reputation:3},inf:{political:2}},fail:{xp:5,stats:{stress:7}},successText:'팀 역할을 정리해 수사 속도를 높였습니다.',failText:'팀 내 의견충돌이 길어졌습니다.'},{check:['lead',42]}),
  choice('지역사회 소통','매력/평판 상승',{xp:14,stats:{cha:2,reputation:3,net:2},resultText:'주민 불안을 낮추며 협조를 얻었습니다.'})]));
 add(evt('police_internal','police','🧾','감찰 인터뷰','과거 처리한 사건의 절차 적정성을 확인하는 내부 감찰이 시작됐다.',[
  choice('기록을 전면 공개','평판 상승',{xp:16,stats:{reputation:5,stress:3},resultText:'절차를 투명하게 설명해 신뢰를 지켰습니다.'}),
  choice('법무 검토 후 대응','지능 판정',{success:{xp:19,stats:{int:2,pol:1}},fail:{stats:{stress:6,reputation:-2}},successText:'쟁점을 정확히 정리했습니다.',failText:'설명이 늦어지며 의심을 키웠습니다.'},{check:['int',40]}),
  choice('상급자와 공동 대응','인맥/정치력',{xp:14,stats:{net:2,pol:2},resultText:'조직 차원의 일관된 입장을 만들었습니다.'})]));
 add(evt('police_promotion','police','⭐','승진 대상자 평가','승진 심사에서 현장성과·리더십·평판이 동시에 평가된다.',[
  choice('성과로 정면승부','리더십 판정',{success:{xp:28,stats:{lead:2,reputation:3}},fail:{xp:8,stats:{stress:5}},successText:'현장 성과가 높은 평가를 받았습니다.',failText:'성과가 경쟁자보다 약했습니다.'},{check:['lead',46]}),
  choice('전문교육 이수','지능 +2 · 안정적',{xp:18,stats:{int:2,stress:2},resultText:'전문성을 보강해 다음 심사를 준비했습니다.'}),
  choice('조직 인맥 관리','인맥/정치력',{xp:17,stats:{net:3,pol:1},resultText:'주요 보직자들과 신뢰 관계를 넓혔습니다.'})]));

 // 검사
 add(evt('pros_warrant','prosecutor','⚖️','영장 판단','사회적 관심이 큰 수사에서 강제수사 필요성을 두고 팀 내부 의견이 갈렸다.',[
  choice('증거를 더 보강','지능 판정',{success:{xp:25,stats:{int:2,reputation:4},inf:{political:2}},fail:{xp:7,stats:{stress:6}},successText:'쟁점을 보강해 설득력 있는 판단을 만들었습니다.',failText:'시간만 지나며 수사 동력이 약해졌습니다.'},{check:['int',50]}),
  choice('현재 자료로 판단','정치력/평판 위험',{success:{xp:22,stats:{pol:2,reputation:3}},fail:{stats:{reputation:-4,stress:8}},successText:'판단이 결과적으로 타당했다는 평가를 받았습니다.',failText:'성급한 판단이라는 비판이 나왔습니다.'},{check:['pol',46]}),
  choice('상급부와 재검토','안정적',{xp:13,stats:{net:2,stress:2},resultText:'조직적 재검토를 거쳐 책임을 분산했습니다.'})]));
 add(evt('pros_trial','prosecutor','📚','중요 공판','언론의 관심이 큰 공판에서 핵심 논리를 직접 설명할 기회가 생겼다.',[
  choice('직접 변론 주도','매력/지능 판정',{success:{xp:27,stats:{cha:2,int:1,reputation:5},inf:{media:2}},fail:{xp:5,stats:{reputation:-3,stress:7}},successText:'논리를 명료하게 전달했습니다.',failText:'핵심 쟁점 설명이 흔들렸습니다.'},{check:['cha',45]}),
  choice('팀플레이 중심','리더십 상승',{xp:19,stats:{lead:2,net:1},resultText:'팀의 강점을 살려 안정적으로 대응했습니다.'}),
  choice('언론노출 최소화','스트레스 감소',{xp:11,stats:{stress:-2,reputation:1},resultText:'공판 자체에 집중해 논란을 줄였습니다.'})]));
 add(evt('pros_personnel','prosecutor','🏢','인사 이동 제안','중요 부서로 이동할 기회가 왔지만 업무강도가 크게 올라간다.',[
  choice('이동을 수락','경력/스트레스 크게 상승',{xp:28,stats:{reputation:3,stress:9,net:2},inf:{political:3},resultText:'핵심 부서에서 경력을 쌓기 시작했습니다.'}),
  choice('현재 부서에 남는다','안정·전문성',{xp:14,stats:{int:2,stress:-2},resultText:'현재 분야 전문성을 더 깊게 쌓기로 했습니다.'}),
  choice('조건을 협상','정치력 판정',{success:{xp:22,stats:{pol:3,net:2}},fail:{xp:8,stats:{stress:5}},successText:'원하는 역할을 일부 확보했습니다.',failText:'협상이 큰 변화를 만들지 못했습니다.'},{check:['pol',48]})]));

 // 의사
 add(evt('doctor_research','doctor','🔬','연구 프로젝트 제안','새 치료법 연구팀이 임상과 연구를 병행해 달라고 제안했다.',[
  choice('연구책임을 맡는다','지능 판정',{success:{xp:26,stats:{int:3,reputation:4,stress:7},inf:{business:2}},fail:{xp:6,stats:{stress:10}},successText:'연구 성과가 학계에서 주목받았습니다.',failText:'진료와 연구를 병행하며 성과가 늦어졌습니다.'},{check:['int',54]}),
  choice('진료에 집중','안정적 경력',{xp:15,stats:{reputation:2,health:1},resultText:'환자 진료와 임상경험에 집중했습니다.'}),
  choice('공동연구로 참여','인맥/지능',{xp:19,stats:{net:3,int:1},resultText:'부담을 줄이며 연구 네트워크를 넓혔습니다.'})]));
 add(evt('doctor_vip','doctor','🩺','유명 환자 진료','사회적으로 유명한 인물이 비공개 진료를 요청했다.',[
  choice('다른 환자와 동일 원칙','평판 상승',{xp:18,stats:{reputation:5,stress:2},resultText:'원칙적인 진료로 내부 신뢰를 얻었습니다.'}),
  choice('전담팀을 꾸린다','리더십 판정',{success:{xp:22,stats:{lead:2,net:2,reputation:3}},fail:{stats:{stress:7}},successText:'전담팀이 매끄럽게 움직였습니다.',failText:'과도한 특별대우라는 내부 불만이 생겼습니다.'},{check:['lead',44]}),
  choice('상급자에게 이관','안전',{xp:9,stats:{stress:-2},resultText:'불필요한 위험을 피했습니다.'})]));
 add(evt('doctor_burnout','doctor','🌙','번아웃 경고','연속 당직과 진료로 집중력이 떨어지고 있다.',[
  choice('휴가를 쓴다','건강 회복 · 경력 소폭 손실',{xp:-3,stats:{health:8,stress:-14},resultText:'충분한 휴식으로 컨디션을 회복했습니다.'}),
  choice('일정을 조정한다','리더십 판정',{success:{xp:12,stats:{lead:2,health:3,stress:-6}},fail:{stats:{stress:4}},successText:'팀과 일정을 재배치했습니다.',failText:'인력 부족으로 일정조정이 쉽지 않았습니다.'},{check:['lead',40]}),
  choice('그대로 버틴다','경력 상승 · 건강 위험',{xp:18,stats:{health:-7,stress:10,reputation:1},resultText:'성과는 지켰지만 몸이 크게 지쳤습니다.'})]));

 // 변호사
 add(evt('lawyer_partner','lawyer','🤝','파트너 승진 경쟁','로펌에서 차기 파트너 후보군을 좁히기 시작했다.',[
  choice('대형 고객을 직접 유치','매력 판정',{success:{xp:28,stats:{cha:2,reputation:4,net:2},inf:{business:4}},fail:{xp:6,stats:{stress:8}},successText:'신규 대형 고객을 확보했습니다.',failText:'고객 유치에 실패했습니다.'},{check:['cha',50]}),
  choice('승소율과 전문성으로 승부','지능 판정',{success:{xp:25,stats:{int:2,reputation:4}},fail:{xp:8,stats:{stress:5}},successText:'전문성 평가에서 높은 점수를 받았습니다.',failText:'경쟁자의 실적이 더 강했습니다.'},{check:['int',50]}),
  choice('내부 인맥을 다진다','인맥/정치력',{xp:18,stats:{net:3,pol:2},resultText:'의사결정권자들과 관계를 넓혔습니다.'})]));
 add(evt('lawyer_probono','lawyer','⚖️','공익 사건','수익은 거의 없지만 사회적으로 의미 있는 사건을 맡아달라는 요청이 왔다.',[
  choice('맡는다','평판 크게 상승',{xp:16,stats:{reputation:7,stress:4},inf:{media:2},resultText:'공익 활동이 좋은 평가를 받았습니다.'}),
  choice('일부만 지원','균형',{xp:12,stats:{reputation:3,net:2},resultText:'본업과 공익 활동을 병행했습니다.'}),
  choice('거절한다','수익 업무 집중',{xp:8,stats:{stress:-2},inf:{business:1},resultText:'현재 고객과 수익 업무에 집중했습니다.'})]));
 add(evt('lawyer_media','lawyer','📺','방송 법률자문 제안','시사 프로그램에서 정기 법률자문 출연을 제안했다.',[
  choice('출연한다','매력 판정 · 미디어 영향',{success:{cash:3000000,xp:18,stats:{cha:2,reputation:4},inf:{media:4}},fail:{xp:5,stats:{reputation:-2,stress:5}},successText:'명확한 설명으로 인지도가 올랐습니다.',failText:'발언 일부가 논란이 됐습니다.'},{check:['cha',46]}),
  choice('전문분야만 출연','안정적',{cash:1200000,xp:12,stats:{reputation:2},inf:{media:2},resultText:'전문성을 유지하며 노출을 늘렸습니다.'}),
  choice('거절','본업 집중',{xp:7,stats:{stress:-1},resultText:'언론 노출보다 사건 업무를 택했습니다.'})]));

 // 연예인
 add(evt('ent_ad','entertainer','📸','대형 광고 계약','유명 브랜드에서 거액의 광고 모델 제안이 들어왔다. 이미지 적합성을 두고 소속사 의견이 갈린다.',[
  choice('계약한다','큰 수입 · 이미지 판정',{success:{cash:18000000,xp:22,stats:{reputation:4,cha:1},inf:{media:5}},fail:{cash:12000000,stats:{reputation:-3,stress:5},inf:{media:3}},successText:'광고가 흥행하며 대중 이미지가 좋아졌습니다.',failText:'광고 콘셉트가 팬덤과 맞지 않아 반응이 갈렸습니다.'},{check:['cha',46]}),
  choice('조건을 재협상','인맥 판정',{success:{cash:22000000,xp:16,stats:{net:2,reputation:2}},fail:{xp:5,stats:{stress:4}},successText:'더 좋은 조건으로 계약했습니다.',failText:'협상이 길어지며 계약이 무산됐습니다.'},{check:['net',42]}),
  choice('이미지를 위해 거절','평판 상승',{xp:10,stats:{reputation:3,stress:-1},resultText:'단기 수익보다 장기 이미지를 택했습니다.'})]));
 add(evt('ent_live','entertainer','📺','생방송 사고 위기','생방송 직전 대본이 크게 바뀌고 진행팀이 혼란에 빠졌다.',[
  choice('애드리브로 살린다','매력 판정',{success:{xp:26,stats:{cha:3,reputation:5,stress:5},inf:{media:5}},fail:{xp:4,stats:{reputation:-4,stress:9}},successText:'순발력으로 방송을 살렸습니다.',failText:'방송 흐름이 흔들리며 클립이 부정적으로 퍼졌습니다.'},{check:['cha',50]}),
  choice('제작진과 빠르게 재정리','리더십 판정',{success:{xp:20,stats:{lead:2,net:2,reputation:2}},fail:{stats:{stress:6}},successText:'팀워크로 방송을 안정시켰습니다.',failText:'시간이 부족해 완벽히 정리하지 못했습니다.'},{check:['lead',40]}),
  choice('안전한 분량만 소화','안정적',{xp:10,stats:{stress:1,reputation:1},resultText:'큰 사고 없이 방송을 마쳤습니다.'})]));
 add(evt('ent_rumor','entertainer','💬','열애설 보도','온라인 매체가 당신의 열애설을 보도했다. 사실 여부와 상관없이 팬덤 반응이 빠르게 갈리고 있다.',[
  choice('짧게 입장 발표','매력 판정',{success:{xp:14,stats:{reputation:3,cha:1},inf:{media:2}},fail:{stats:{reputation:-3,stress:6}},successText:'차분한 대응으로 논란이 금방 잦아들었습니다.',failText:'표현 하나가 또 다른 해석을 낳았습니다.'},{check:['cha',45]}),
  choice('소속사에 맡긴다','안정적 · 스트레스 감소',{xp:9,stats:{stress:-3},resultText:'소속사가 공식 창구를 맡아 대응했습니다.'}),
  choice('개인 방송으로 직접 설명','고위험 고보상',{success:{xp:20,stats:{reputation:6,cha:2},inf:{media:4}},fail:{stats:{reputation:-6,stress:8},inf:{media:5}},successText:'진솔한 설명이 좋은 반응을 얻었습니다.',failText:'실시간 발언이 새로운 논란을 만들었습니다.'},{check:['cha',52]})]));
 add(evt('ent_agency','entertainer','📝','재계약 시즌','소속사 재계약 협상이 시작됐다. 계약금, 활동 자율성, 해외진출 조건을 놓고 협상할 수 있다.',[
  choice('계약금을 최대화','인맥/매력 판정',{success:{cash:30000000,xp:16,stats:{net:2}},fail:{cash:12000000,stats:{stress:5}},successText:'높은 계약금을 확보했습니다.',failText:'협상력이 부족해 기대보다 낮은 조건에 합의했습니다.'},{check:['net',48]}),
  choice('활동 자율성을 확보','평판/커리어',{xp:22,stats:{reputation:3,cha:1},inf:{media:2},resultText:'수익 일부를 포기하고 선택권을 넓혔습니다.'}),
  choice('FA 시장을 본다','고위험 · 인맥 상승',{xp:12,stats:{net:4,stress:5},resultText:'여러 회사와 미팅하며 시장가치를 확인했습니다.'})]));

 // 운동선수
 add(evt('ath_transfer','athlete','✈️','이적 제안','더 큰 구단에서 이적 제안이 왔다. 연봉은 높지만 주전 경쟁도 훨씬 치열하다.',[
  choice('도전한다','건강/리더십 판정',{success:{cash:12000000,xp:27,stats:{reputation:5,lead:2,stress:6},inf:{media:4}},fail:{xp:5,stats:{stress:9,reputation:-2}},successText:'새 팀에서 빠르게 자리를 잡았습니다.',failText:'경쟁이 생각보다 치열해 출전시간이 줄었습니다.'},{check:['health',78]}),
  choice('현재 팀에 남는다','안정적',{xp:16,stats:{reputation:3,stress:-2},resultText:'팀의 핵심 선수로 남았습니다.'}),
  choice('계약조건을 협상','인맥/매력',{success:{cash:7000000,xp:17,stats:{net:2,cha:1}},fail:{xp:7,stats:{stress:4}},successText:'잔류하면서도 좋은 조건을 얻었습니다.',failText:'협상이 큰 변화를 만들지 못했습니다.'},{check:['net',42]})]));
 add(evt('ath_national','athlete','🇰🇷','국가대표 소집','국가대표 명단에 이름을 올릴 기회가 왔다. 체력 부담은 크지만 명예와 노출도도 크다.',[
  choice('합류한다','큰 평판 · 건강 부담',{xp:24,stats:{reputation:7,health:-4,stress:6},inf:{media:5},resultText:'국가대표 무대에서 이름을 알렸습니다.'}),
  choice('컨디션을 이유로 고사','건강 회복',{xp:5,stats:{health:6,stress:-3,reputation:-1},resultText:'장기 커리어를 위해 회복을 택했습니다.'}),
  choice('의료진 평가 후 결정','지능/건강 균형',{xp:13,stats:{health:2,int:1},resultText:'객관적 컨디션 평가를 바탕으로 일정을 조절했습니다.'})]));
 add(evt('ath_sponsor','athlete','👟','스폰서 계약','스포츠 브랜드에서 개인 후원 계약을 제안했다.',[
  choice('대형 계약 체결','매력 판정',{success:{cash:15000000,xp:17,stats:{reputation:3,cha:1},inf:{media:3}},fail:{cash:7000000,stats:{stress:3}},successText:'브랜드 캠페인이 흥행했습니다.',failText:'계약은 했지만 캠페인 반응은 평범했습니다.'},{check:['cha',42]}),
  choice('성적 인센티브 중심','고위험 고보상',{cash:5000000,xp:20,stats:{lead:1},resultText:'기본금은 낮지만 성적 보너스가 큰 계약을 택했습니다.'}),
  choice('경기에만 집중','평판 소폭',{xp:11,stats:{reputation:2,stress:-1},resultText:'상업활동보다 경기력을 우선했습니다.'})]));

 // 사업가
 add(evt('startup_cofounder','entrepreneur','🤝','공동창업자 갈등','제품 방향과 자금 사용을 두고 공동창업자와 의견이 크게 갈렸다.',[
  choice('지분과 권한을 재협상','정치력 판정',{success:{xp:24,stats:{pol:2,net:2,reputation:2},inf:{business:3}},fail:{xp:5,stats:{stress:9},inf:{business:-1}},successText:'역할을 다시 나눠 조직이 안정됐습니다.',failText:'갈등이 더 커졌습니다.'},{check:['pol',46]}),
  choice('제품 성과로 설득','지능 판정',{success:{xp:23,stats:{int:2,reputation:3},inf:{business:4}},fail:{xp:7,stats:{stress:6}},successText:'숫자로 방향성을 설득했습니다.',failText:'성과가 아직 부족했습니다.'},{check:['int',48]}),
  choice('외부 멘토 중재','인맥 상승',{xp:15,stats:{net:3,stress:2},resultText:'제3자의 중재로 일단 충돌을 멈췄습니다.'})]));
 add(evt('startup_launch','entrepreneur','🚀','신제품 출시','회사의 다음 운명을 좌우할 제품 출시일이 다가왔다.',[
  choice('공격적 마케팅','큰 비용 · 큰 성장',{success:{cash:9000000,xp:27,stats:{reputation:4,stress:7},inf:{business:6}},fail:{cash:-5000000,xp:5,stats:{stress:10}},successText:'출시가 흥행하며 신규 고객이 몰렸습니다.',failText:'마케팅비 대비 반응이 약했습니다.'},{check:['cha',45],preCost:5000000}),
  choice('제품완성도 우선','지능 판정',{success:{xp:25,stats:{int:2,reputation:3},inf:{business:4}},fail:{xp:8,stats:{stress:5}},successText:'품질 호평으로 입소문이 났습니다.',failText:'출시가 늦어져 시장 관심이 줄었습니다.'},{check:['int',50]}),
  choice('소규모 테스트 출시','안정적',{xp:15,stats:{int:1,stress:2},inf:{business:2},resultText:'위험을 줄이며 고객 반응을 확인했습니다.'})]));
 add(evt('startup_funding','entrepreneur','💼','투자 라운드','회사를 키우려면 자본이 필요하지만 투자받을수록 창업자 지분은 줄어든다.',[
  choice('대규모 투자 유치','인맥 판정',{success:{cash:25000000,xp:24,stats:{net:3,reputation:3},inf:{business:5}},fail:{xp:4,stats:{stress:8}},successText:'좋은 조건의 투자자를 찾았습니다.',failText:'밸류에이션 이견으로 협상이 무산됐습니다.'},{check:['net',50]}),
  choice('작은 투자만 받는다','균형',{cash:8000000,xp:15,stats:{net:1},inf:{business:2},resultText:'지분 희석을 줄이며 필요한 자금만 확보했습니다.'}),
  choice('매출로 버틴다','지능/스트레스',{xp:19,stats:{int:2,stress:7},inf:{business:3},resultText:'외부 자금 없이 매출 성장에 집중했습니다.'})]));

 // 대기업
 add(evt('corp_review','corp','📋','성과평가 시즌','상반기 성과평가가 시작됐다. 숫자는 좋지만 조직 기여도를 어떻게 보여줄지가 관건이다.',[
  choice('성과 데이터로 승부','지능 판정',{success:{xp:25,stats:{int:1,reputation:4},inf:{business:3}},fail:{xp:7,stats:{stress:5}},successText:'명확한 수치로 높은 평가를 받았습니다.',failText:'숫자는 좋았지만 임팩트 설명이 약했습니다.'},{check:['int',44]}),
  choice('동료 피드백을 확보','인맥 판정',{success:{xp:21,stats:{net:2,reputation:3}},fail:{xp:8,stats:{stress:3}},successText:'협업 평판이 평가에 힘을 보탰습니다.',failText:'추천이 기대만큼 강하지 않았습니다.'},{check:['net',40]}),
  choice('다음 프로젝트를 선점','리더십 상승',{xp:18,stats:{lead:2,stress:4},inf:{business:2},resultText:'평가보다 다음 기회를 먼저 잡았습니다.'})]));
 add(evt('corp_client','corp','☎️','핵심 고객 이탈 위기','대형 고객이 서비스 불만을 이유로 계약 재검토를 통보했다.',[
  choice('직접 고객을 만난다','매력 판정',{success:{xp:26,stats:{cha:2,reputation:4},inf:{business:5}},fail:{xp:5,stats:{stress:8,reputation:-2}},successText:'관계를 회복하고 계약을 지켰습니다.',failText:'고객의 불만을 충분히 돌리지 못했습니다.'},{check:['cha',47]}),
  choice('원인분석팀을 꾸린다','지능/리더십',{success:{xp:24,stats:{int:2,lead:1},inf:{business:4}},fail:{xp:8,stats:{stress:6}},successText:'문제의 근본원인을 찾아 개선안을 제시했습니다.',failText:'분석이 늦어 고객의 인내심이 줄었습니다.'},{check:['int',46]}),
  choice('조건을 양보해 계약 유지','안정적 · 평판 소폭',{xp:15,stats:{reputation:2},inf:{business:2},resultText:'마진 일부를 포기하고 장기 관계를 지켰습니다.'})]));

 // 정치
 add(evt('pol_committee','politics','🏛️','상임위 핵심 법안','당론과 지역구 이해가 충돌하는 법안 표결이 다가왔다.',[
  choice('당론을 따른다','정치 영향력 상승 · 지역 민심 위험',{xp:21,stats:{pol:2},inf:{political:4},nation:{mood:-1},resultText:'당 지도부와 관계가 좋아졌지만 지역 반응은 엇갈렸습니다.'}),
  choice('지역구 입장을 지킨다','평판 상승 · 당내 마찰',{xp:19,stats:{reputation:4,stress:4},inf:{political:1},resultText:'지역에서는 지지를 얻었지만 당내에서 불만이 나왔습니다.'}),
  choice('수정안을 중재','정치력 판정',{success:{xp:28,stats:{pol:3,net:2,reputation:4},inf:{political:5}},fail:{xp:6,stats:{stress:7}},successText:'타협안을 만들어 표결을 통과시켰습니다.',failText:'양측 모두를 설득하지 못했습니다.'},{check:['pol',50]})]));
 add(evt('pol_faction','politics','👥','계파의 영입 제안','당내 유력 계파가 당신에게 핵심 회의 참석과 공개 지지를 제안했다.',[
  choice('합류한다','정치 영향력 크게 상승',{xp:22,stats:{pol:2,net:3,reputation:-1},inf:{political:6},resultText:'당내 기반이 강해졌지만 계파색도 뚜렷해졌습니다.'}),
  choice('독자노선을 지킨다','평판 상승',{xp:15,stats:{reputation:4,stress:2},inf:{political:1},resultText:'독립적인 이미지가 강해졌습니다.'}),
  choice('사안별 협력','정치력 판정',{success:{xp:24,stats:{pol:3,net:2},inf:{political:4}},fail:{xp:7,stats:{stress:5}},successText:'거리와 협력을 적절히 조절했습니다.',failText:'양쪽에서 애매하다는 평가를 받았습니다.'},{check:['pol',48]})]));

 // 군
 add(evt('mil_posting','military','🎖️','핵심 보직 제안','다음 진급에 유리한 핵심 보직과 안정적인 현재 보직 사이에서 선택해야 한다.',[
  choice('핵심 보직을 택한다','진급점수/스트레스 크게 상승',{xp:28,stats:{lead:2,reputation:3,stress:8},inf:{military:4},resultText:'어려운 보직에서 존재감을 키웠습니다.'}),
  choice('현재 보직에 남는다','안정적',{xp:14,stats:{lead:1,stress:-2},resultText:'지금 부대를 안정적으로 이끌었습니다.'}),
  choice('합참 보직을 노린다','정치력/인맥 판정',{success:{xp:24,stats:{pol:2,net:2},inf:{military:4,political:2}},fail:{xp:6,stats:{stress:6}},successText:'전략·정책 라인으로 이동할 기회를 만들었습니다.',failText:'경쟁이 치열해 보직을 얻지 못했습니다.'},{check:['net',45]})]));
 add(evt('mil_hearing','military','🏛️','국회 국방위 출석','국회 국방위원회에서 군 현안에 대한 공개 설명을 요구받았다.',[
  choice('원칙과 데이터로 답변','지능 판정',{success:{xp:23,stats:{int:2,reputation:5},inf:{military:3,political:2}},fail:{xp:5,stats:{reputation:-3,stress:7}},successText:'차분한 답변으로 신뢰를 얻었습니다.',failText:'답변이 불명확하다는 지적을 받았습니다.'},{check:['int',48]}),
  choice('현장 경험을 강조','리더십/매력',{success:{xp:20,stats:{lead:2,cha:1,reputation:3}},fail:{xp:7,stats:{stress:5}},successText:'현장감 있는 설명이 호평을 받았습니다.',failText:'정책적 깊이가 부족하다는 평가가 나왔습니다.'},{check:['lead',48]}),
  choice('민감 사안은 절제','정치력 상승',{xp:15,stats:{pol:2,reputation:1},resultText:'공개 가능한 범위 안에서 안정적으로 대응했습니다.'})]));

 // 지하세계: 추상적 권력/위험 중심
 add(evt('under_rival','underworld','🌒','라이벌 세력의 압박','경쟁 세력이 당신의 사업과 인맥을 잠식하기 시작했다.',[
  choice('합법 사업 경쟁으로 맞선다','지능 판정',{success:{cash:5000000,xp:23,stats:{int:2,reputation:2},inf:{under:3,business:2}},fail:{cash:-2000000,xp:5,stats:{stress:7}},successText:'사업 경쟁에서 우위를 잡았습니다.',failText:'비용만 늘고 성과는 약했습니다.'},{check:['int',45]}),
  choice('중재자를 세운다','인맥 판정',{success:{xp:20,stats:{net:3,pol:1},inf:{under:4}},fail:{stats:{stress:5}},successText:'충돌을 피하며 영향권을 조정했습니다.',failText:'중재가 결론을 내지 못했습니다.'},{check:['net',44]}),
  choice('거리 두고 잠잠해진다','수사위험 감소',{xp:8,stats:{stress:-2},resultText:'한동안 눈에 띄는 활동을 줄였습니다.'})]));
 add(evt('under_legalize','underworld','🏢','합법 사업 전환 기회','축적한 자금과 인맥을 합법 사업으로 옮길 기회가 생겼다.',[
  choice('사업에 투자','기업 영향력 상승',{cash:-5000000,xp:18,stats:{reputation:3},inf:{business:5,under:-2},resultText:'합법 사업 기반을 넓혔습니다.'}),
  choice('현재 구조 유지','지하 영향력 유지',{xp:15,inf:{under:4},stats:{reputation:-1},resultText:'익숙한 방식의 영향력을 유지했습니다.'}),
  choice('전문가에게 구조 자문','인맥/지능',{cash:-1500000,xp:16,stats:{net:2,int:1},inf:{business:2},resultText:'법적·재무 구조를 정리하기 시작했습니다.'})]));
})();

/* 핵심 수정: 직업이 있으면 그 직업의 이벤트만 나온다. generic 정치/세계 이벤트가 연예인에게 섞이지 않음. */
eventPool=function(){
  const career=S.career;
  if(career){
    const pool=EVENTS.filter(e=>!e.follow&&e.career===career&&(e.minLevel==null||S.level>=e.minLevel));
    return pool.length?pool:[];
  }
  return EVENTS.filter(e=>!e.follow&&e.generic);
};

/* 직업 이벤트 버튼 */
function v093TriggerCareerEvent(){
  if(!S.career)return openCareerCenter();
  ensureV093(); const e=pickEvent();
  if(!e)return toast('현재 직업 이벤트가 없습니다.');
  S.v093.careerEvents++;S.v093.lastCareerEvent=e.id;showEvent(e)
}

/* UI 후처리: 일하기 단독 메뉴 제거 + V0.9.3 라벨 */
const v093BaseRender=v9Render;
v9Render=function(){
  ensureV093();
  if(S.v9.view==='work'&&!v093WorkSplit())S.v9.view='career';
  v093BaseRender();
  if(!v093WorkSplit()){const work=$('.v9-rail [data-v092-work]');if(work)work.remove()}
  const version=$('.v091-player-summary>small');if(version)version.textContent='PLAYER PROFILE · V0.9.3';
  const old=$('.v9-brand small');if(old&&old.textContent.includes('COMMAND CENTER'))old.textContent='COMMAND CENTER · V0.9.3';
  $('#v093CareerEvent')&&($('#v093CareerEvent').onclick=v093TriggerCareerEvent);
  $('#v093ChangeCareer')&&($('#v093ChangeCareer').onclick=openCareerCenter);
  $$('[data-v091-open-training]').forEach(b=>b.onclick=()=>v9SetView('ability'));
  v092Bind();
};

/* 기존 직업 이벤트 버튼도 strict pool을 사용 */
setTimeout(()=>{ensureV093();v9Render()},100);
