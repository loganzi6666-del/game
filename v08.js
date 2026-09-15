/* LIFE : RISE V0.8 — COMMAND CENTER / NO-AVATAR UI */
const V8={version:'0.8',active:'home'};
function ensureV8(){
  ensureV7();S.version=8;S.v8=S.v8||{};
  S.v8.weeks=S.v8.weeks||0;S.v8.monthRuns=S.v8.monthRuns||0;S.v8.lastFocus=S.v8.lastFocus||'career';
  S.v8.ui=S.v8.ui||{compact:false};
}
ensureV8();

function v8CareerInfKey(){return {corp:'business',business:'business',politics:'political',military:'military',underworld:'under',intel:'political',police:'political',prosecutor:'political',lawyer:'business',doctor:'business',celebrity:'media',athlete:'media'}[S.career]||'business'}
function v8Money(n){return KRW ? KRW(n) : ('₩'+Math.round(n||0).toLocaleString('ko-KR'))}
function v8Initials(){const n=(S.name||'LR').trim();return n.slice(0,2).toUpperCase()}
function v8PowerRows(){
  const pp=clamp(power());
  const src=(typeof V7_POWER_SNAPSHOT!=='undefined'?V7_POWER_SNAPSHOT:[]).map(x=>x.name==='플레이어'?{...x,name:S.name,role:careerName(),score:pp}:x);
  const has=src.some(x=>x.name===S.name);if(!has)src.push({name:S.name,role:careerName(),institution:'게임',score:pp});
  return src.sort((a,b)=>b.score-a.score).slice(0,7);
}
function v8Urgent(){
  ensureV8();
  if(S.v6?.world?.activeCrisis){const x=S.v6.world.activeCrisis;return {icon:'🚨',eyebrow:'GLOBAL CRISIS',title:x.title,text:x.text||'국제위기가 현재 국정과 경제를 압박하고 있습니다.',label:'위기 대응',fn:()=>openGlobalCrisis()}}
  if(S.v6?.drama?.activeScandal){const x=S.v6.drama.activeScandal;return {icon:'🔥',eyebrow:'POLITICAL PRESSURE',title:x.title,text:x.text||'정치적 논란이 커지고 있습니다.',label:'대응 결정',fn:()=>openScandal()}}
  if(S.cash<1500000)return {icon:'💸',eyebrow:'CASH WARNING',title:'현금흐름이 위험합니다',text:'생활비와 고정비를 감안하면 현금 버퍼가 부족합니다. 직업·사업·자산구조를 먼저 정리하는 편이 좋습니다.',label:'자산 점검',fn:()=>showAssets()};
  if(S.stats.stress>78)return {icon:'🧠',eyebrow:'BURNOUT RISK',title:'성과보다 회복이 먼저입니다',text:'스트레스가 높아 다음 판정과 장기 성장에 악영향을 줄 수 있습니다.',label:'이번 주 회복',fn:()=>v8RunFocus('life')};
  if(!S.career)return {icon:'🧭',eyebrow:'CAREER',title:'첫 커리어가 인생의 방향을 정합니다',text:'직업은 월급뿐 아니라 정치·기업·군·정보 영향력과 이벤트 풀 자체를 바꿉니다.',label:'직업 선택',fn:()=>openCareerCenter()};
  if(S.career==='politics'&&S.v7?.election?.stage!=='idle')return {icon:'🗳️',eyebrow:'ELECTION',title:'선거판이 움직이고 있습니다',text:`현재 여론조사 ${Math.round(S.v7.election.poll||0)}%. 공천·유세·토론 선택이 결과를 바꿉니다.`,label:'선거 본부',fn:()=>openElectionHub()};
  if(S.career==='intel')return {icon:'🕶️',eyebrow:'INTELLIGENCE',title:'정보가 곧 권력입니다',text:`정보력 ${intelPower()} · 노출도 ${S.v7.intel.exposure}. 성과와 은밀성의 균형이 중요합니다.`,label:'정보국',fn:()=>openIntelHub()};
  return {icon:'⚡',eyebrow:'LIFE MOMENTUM',title:`${careerName()}에서 다음 단계로 올라갈 시간`,text:'반복 클릭 대신 이번 주의 포커스를 하나 정하세요. 결과와 사건이 자동으로 이어집니다.',label:'직업 이벤트',fn:()=>maybeEvent(true)};
}
function v8MarketCells(){
  try{ensureV4();const keys=Object.keys(S.v4.market.assets||{}).slice(0,4);return keys.map(k=>{const st=S.v4.market.assets[k],a=MARKET[k];return `<div class="v8-market-cell"><b>${a?.name||k}</b><span>${v8Money(st.price)}</span><em class="${st.chg>=0?'v8-up':'v8-down'}">${st.chg>=0?'+':''}${Number(st.chg||0).toFixed(1)}%</em></div>`}).join('')}catch(e){return '<div class="v8-market-cell"><b>시장 데이터</b><span>준비 중</span><em>-</em></div>'}
}
function v8Story(){
  const u=v8Urgent();
  return `<div class="v8-storybox"><div class="row"><div class="icon">${u.icon}</div><div><b>${u.title}</b><p>${u.text}</p></div></div><button id="v8UrgentAction">${u.label} →</button></div>`
}
function v8FocusCard(icon,title,desc,key,no){return `<button class="v8-focus" data-focus="${key}"><em>${no}</em><div class="ico">${icon}</div><b>${title}</b><span>${desc}</span></button>`}
function v8System(icon,title,sub,action,tag='OPEN'){return `<button class="v8-system" data-sys="${action}"><strong>${icon} ${title}</strong><span>${sub}</span><small>${tag} →</small></button>`}
function v8Render(){
  ensureV8();const root=$('#v8root');if(!root)return;
  const flow=monthlyIncome(), nw=networth(), pp=clamp(power()), u=v8Urgent();
  const xpNeed=S.career?100+S.level*28:100,xpPct=S.career?clamp((S.xp/xpNeed)*100):0;
  const rows=v8PowerRows();
  const logRows=(S.log||[]).slice(0,7).map(x=>`<div class="v8-feed-item"><time>${x.d}</time><span>${x.t}</span></div>`).join('');
  const isPres=S.nation.currentPresident===S.name;
  const party=S.faction.party||'정당 없음';
  const realCount=S.v7?.roster?.status==='ready'?S.v7.roster.currentCount:'동기화 전';
  root.innerHTML=`<div class="v8-shell">
    <aside class="v8-rail">
      <div class="v8-brand"><div class="v8-logo">LR</div><div><b>LIFE : RISE</b><small>COMMAND CENTER · V0.8</small></div></div>
      <nav class="v8-nav">
        <button class="active" data-nav="home"><i>⌂</i>대시보드</button>
        <button data-nav="career"><i>💼</i>커리어</button>
        <button data-nav="assets"><i>💎</i>자산·소비</button>
        <button data-nav="market"><i>📈</i>투자시장</button>
        <button data-nav="business"><i>🏢</i>사업경영</button>
        <div class="sep"></div>
        <button data-nav="politics"><i>🏛️</i>정치·국가</button>
        <button data-nav="congress"><i>🗳️</i>국회</button>
        <button data-nav="election"><i>📣</i>선거</button>
        <button data-nav="world"><i>🌐</i>외교·세계</button>
        <div class="sep"></div>
        <button data-nav="society"><i>🤝</i>인맥·사회</button>
        <button data-nav="intel"><i>🕶️</i>정보국</button>
        <button data-nav="drama"><i>🔥</i>드라마</button>
        <button data-nav="power"><i>⚡</i>권력판</button>
      </nav>
      <div class="v8-profile"><div class="v8-profile-top"><div class="v8-monogram">${v8Initials()}</div><div><b>${S.name}</b><span>${age()}세 · ${careerName()}</span></div></div><div class="v8-profile-stats"><div><small>평판</small><strong>${Math.round(S.stats.reputation)}</strong></div><div><small>스트레스</small><strong>${Math.round(S.stats.stress)}</strong></div></div></div>
    </aside>
    <main class="v8-main">
      <header class="v8-top">
        <div class="v8-top-left"><div class="v8-date"><strong>${S.date.replaceAll('-','.')} · ${age()}세</strong><span>${careerName()} · ${S.v8.weeks}주 플레이</span></div></div>
        <div class="v8-top-metrics"><div class="v8-chip"><span>순자산</span><b>${v8Money(nw)}</b></div><div class="v8-chip"><span>월 현금흐름</span><b class="${flow.net>=0?'v8-up':'v8-down'}">${v8Money(flow.net)}</b></div><div class="v8-chip"><span>POWER</span><b>${pp}</b></div></div>
        <div class="v8-top-actions"><button id="v8Save">저장</button><button id="v8Month">한 달 진행</button><button id="v8Next" class="primary">다음 주 ▶</button></div>
      </header>
      <section class="v8-content"><div class="v8-dashboard">
        <div class="v8-leftcol">
          <section class="v8-card v8-hero"><div class="v8-eyebrow">${u.eyebrow}</div><h1>${u.title}</h1><p>${u.text}</p><div class="v8-hero-bottom"><button class="hot" id="v8HeroAction">${u.label}</button><button id="v8ForceEvent">새 사건 보기</button><button id="v8PoliticsQuick">권력 현황</button></div><div class="v8-hero-tags"><span>${party}</span><span>국회 ${realCount}${typeof realCount==='number'?'명':''}</span><span>${isPres?'대통령 재임':'대통령 '+S.nation.currentPresident}</span></div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>WEEKLY FOCUS</span><b>이번 주 무엇에 집중할까?</b></div><em>숫자키 1–4</em></div><div class="v8-focus-grid">
            ${v8FocusCard('💼','커리어 몰입','성과·승진·직업 영향력에 집중','career','1')}
            ${v8FocusCard('💰','부와 투자','재무 판단과 시장 감각을 키운다','wealth','2')}
            ${v8FocusCard('♟️','권력 확장','정치·군·정보·인맥 영향력을 키운다','power','3')}
            ${v8FocusCard('🌿','생활 회복','건강·스트레스·관계를 정비한다','life','4')}
          </div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>SYSTEMS</span><b>큰 시스템은 한 번에 들어간다</b></div><em>반복 이동 없음</em></div><div class="v8-system-grid">
            ${v8System('📈','투자시장','주식·ETF·채권·코인·공매도','market',S.v4?.market?.regime||'MARKET')}
            ${v8System('🏢','사업 본부','직원·매출·투자유치·IPO·M&A','business',S.v5?.company?.active?'ACTIVE':'START')}
            ${v8System('🏛️','정치판','정당·탄핵·국정·권력교체','politics',S.nation.currentPresident===S.name?'PRESIDENT':'POLITICS')}
            ${v8System('🗳️','국회','실명 국회·법안·표결·당권','congress',S.v7?.roster?.status==='ready'?'REAL ROSTER':'SYNC')}
            ${v8System('🌐','국제정치','정상회담·제재·동맹·위기','world',`긴장 ${Math.round(S.v6?.world?.globalTension||0)}`)}
            ${v8System('🕶️','정보국','정보력·방첩·산업보안·감찰','intel',S.career==='intel'?`정보력 ${intelPower()}`:'CAREER')}
          </div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>MARKET PULSE</span><b>내 세계의 시장</b></div><em>가격은 게임 시뮬레이션</em></div><div class="v8-market-row">${v8MarketCells()}</div></section>
        </div>
        <aside class="v8-rightcol">
          <section class="v8-card"><div class="v8-card-head"><div><span>STORY</span><b>지금 가장 중요한 일</b></div></div><div class="v8-story">${v8Story()}</div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>MOMENTUM</span><b>성장 상태</b></div></div><div class="v8-progress"><div class="v8-progress-row"><span>승진 진행도</span><i><em style="width:${xpPct}%"></em></i><b>${Math.round(xpPct)}%</b></div><div class="v8-progress-row"><span>정치 영향력</span><i><em style="width:${clamp(S.inf.political)}%"></em></i><b>${Math.round(S.inf.political)}</b></div><div class="v8-progress-row"><span>기업 영향력</span><i><em style="width:${clamp(S.inf.business)}%"></em></i><b>${Math.round(S.inf.business)}</b></div><div class="v8-progress-row"><span>군 영향력</span><i><em style="width:${clamp(S.inf.military)}%"></em></i><b>${Math.round(S.inf.military)}</b></div></div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>POWER BOARD</span><b>현재 영향력 상위</b></div><em>게임용 지수</em></div><div class="v8-powerlist">${rows.map((x,i)=>`<div class="v8-powrow ${x.name===S.name?'me':''}"><strong>${i+1}</strong><div><b>${x.name}</b><span>${x.role} · ${x.institution||''}</span></div><em>${x.score}</em></div>`).join('')}</div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>LIFE STATS</span><b>현재 상태</b></div></div><div class="v8-stats-grid">${[['지능',S.stats.int],['매력',S.stats.cha],['리더십',S.stats.lead],['정치력',S.stats.pol],['인맥',S.stats.net],['건강',S.stats.health]].map(([n,v])=>`<div class="v8-mini"><span>${n}</span><b>${Math.round(v)}</b><i><em style="width:${clamp(v)}%"></em></i></div>`).join('')}</div></section>
          <section class="v8-card"><div class="v8-card-head"><div><span>LIVE FEED</span><b>최근 변화</b></div></div><div class="v8-feed">${logRows||'<div class="v8-feed-item"><time>NOW</time><span>새로운 인생이 시작됩니다.</span></div>'}</div></section>
        </aside>
      </div></section>
    </main>
  </div>`;
  v8Bind();
}
function v8Bind(){
  const u=v8Urgent();
  $('#v8HeroAction')&&($('#v8HeroAction').onclick=u.fn);$('#v8UrgentAction')&&($('#v8UrgentAction').onclick=u.fn);
  $('#v8ForceEvent')&&($('#v8ForceEvent').onclick=()=>maybeEvent(true));$('#v8PoliticsQuick')&&($('#v8PoliticsQuick').onclick=()=>openPowerBoard());
  $('#v8Save')&&($('#v8Save').onclick=()=>{save();toast('저장했습니다.')});
  $('#v8Next')&&($('#v8Next').onclick=()=>v8NextWeek());$('#v8Month')&&($('#v8Month').onclick=()=>v8RunMonth());
  $$('.v8-focus').forEach(b=>b.onclick=()=>v8RunFocus(b.dataset.focus));$$('.v8-system').forEach(b=>b.onclick=()=>v8Open(b.dataset.sys));$$('[data-nav]').forEach(b=>b.onclick=()=>{const k=b.dataset.nav;if(k==='home')return v8Render();v8Open(k)});
}
function v8Open(k){
  const fn={career:()=>openCareerCenter(),assets:()=>showAssets(),market:()=>openMarket(),business:()=>openBusinessHQ(),politics:()=>openPowerTransition?openPowerTransition():showPolitics(),congress:()=>openRealCongress?openRealCongress():openParliament300(),election:()=>openElectionHub(),world:()=>openWorldOrder(),society:()=>openSociety(),intel:()=>openIntelHub(),drama:()=>openDramaHub(),power:()=>openPowerBoard(),home:()=>v8Render()}[k];
  if(fn)fn();
}
function v8RunFocus(type){
  ensureV8();S.v8.lastFocus=type;S.v8.weeks++;
  if(type==='career'){
    if(!S.career)return openCareerCenter();
    const key=v8CareerInfKey();S.stats.stress=clamp(S.stats.stress+5);S.stats[S.career==='military'?'lead':S.career==='politics'?'pol':'int']=clamp(S.stats[S.career==='military'?'lead':S.career==='politics'?'pol':'int']+1);S.inf[key]=clamp(S.inf[key]+2);addXP(18);advance(7,`${careerName()} 업무에 한 주를 집중했습니다.`);return;
  }
  if(type==='wealth'){
    if(S.cash>=250000){S.cash-=250000;S.stats.int=clamp(S.stats.int+1);S.inf.business=clamp(S.inf.business+1);advance(7,'시장과 자산을 분석하며 한 주를 보냈습니다.');if(Math.random()<.35)setTimeout(()=>openMarket(),220)}else{advance(7,'지출을 줄이고 재정 상태를 점검했습니다.');}return;
  }
  if(type==='power'){
    const key=v8CareerInfKey();S.stats.net=clamp(S.stats.net+2);S.stats.pol=clamp(S.stats.pol+1);S.inf[key]=clamp(S.inf[key]+3);S.stats.stress=clamp(S.stats.stress+3);if(S.career==='intel'){S.v7.intel.intel=clamp(S.v7.intel.intel+2);S.v7.intel.trust=clamp(S.v7.intel.trust+1)}advance(7,'사람과 조직을 움직이며 영향력을 넓혔습니다.');return;
  }
  if(type==='life'){
    S.stats.stress=clamp(S.stats.stress-16);S.stats.health=clamp(S.stats.health+4);Object.keys(S.relations||{}).slice(0,3).forEach(k=>S.relations[k]=clamp((S.relations[k]||0)+1,-100,100));advance(7,'일정을 줄이고 생활과 관계를 회복했습니다.');return;
  }
}
function v8NextWeek(){S.v8.weeks++;advance(7,'큰 결정을 미루고 한 주가 흘렀습니다.')}
function v8RunMonth(){
  ensureV8();S.v8.monthRuns++;S.v8.weeks+=4;const hadV3=typeof V3!=='undefined';if(hadV3)V3.inEvent=true;advance(28,'한 달을 전략적으로 운영했습니다.');if(hadV3)V3.inEvent=false;save();updateAll();toast('한 달 진행 완료');setTimeout(()=>{if(typeof maybeEvent==='function')maybeEvent(true)},260)
}
const v8PrevUpdateAll=updateAll;updateAll=function(){v8PrevUpdateAll();v8Render()};
const v8PrevStartBackground=startBackground;startBackground=function(bg){v8PrevStartBackground(bg);ensureV8();setTimeout(v8Render,50)};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(!$('#modal')?.classList.contains('hidden'))return;if(!$('#startScreen')?.classList.contains('hidden'))return;const map={'1':'career','2':'wealth','3':'power','4':'life'};if(map[e.key]){e.preventDefault();v8RunFocus(map[e.key])}if(e.key.toLowerCase()==='m'){e.preventDefault();openMarket()}if(e.key.toLowerCase()==='p'){e.preventDefault();openPowerBoard()}if(e.key.toLowerCase()==='c'){e.preventDefault();openCareerCenter()}});
setTimeout(()=>{ensureV8();v8Render();const b=document.querySelector('.brand span');if(b)b.textContent='Visual Life & Power Sandbox · V0.8';},80);
