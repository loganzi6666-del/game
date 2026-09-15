/* LIFE : RISE V0.9.5 — LIVE SIDEBAR NEWS + INTERACTIVE NEWSROOM */
const V095={version:'0.9.5'};

function ensureV095(){
  ensureV094();
  S.version='0.9.5';
  S.v095=S.v095||{};
  const x=S.v095;
  x.majorNews=x.majorNews||[];
  x.nextNewsId=x.nextNewsId||1;
  x.selectedNewsId=x.selectedNewsId||null;
  x.lastShockDate=x.lastShockDate||null;
  x.newsSeen=x.newsSeen||{};
  v095SyncStateNews(false);
}

function v095Esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function v095CatInfo(cat){
  const m={
    POLITICS:['🏛️','정치'],BREAKING:['🚨','속보'],ECONOMY:['💹','경제'],MARKET:['📉','시장'],WORLD:['🌐','국제'],DEFENSE:['🎖️','국방'],CAREER:['💼','커리어'],BUSINESS:['🏢','기업'],LIFE:['👤','인생'],SECURITY:['🕶️','안보'],MEDIA:['📺','미디어']
  };
  return m[cat]||['📰',cat||'뉴스'];
}
function v095Severity(title,cat,tone){
  if(/탄핵|파면|쿠데타|군정|전쟁|폭락|붕괴|파산|구금|비상|위기/.test(title))return 'urgent';
  if(cat==='BREAKING'||tone==='bad')return 'high';
  if(/대통령|장관|대선|당선|진급|상장|IPO|인수|스캔들/.test(title))return 'high';
  return 'normal';
}
function v095AddMajorNews(cat,title,tone='neutral',body='',opts={}){
  if(!S.v095)return null;
  title=String(title||'').trim();if(!title)return null;
  const existing=S.v095.majorNews.find(n=>n.title===title);
  if(existing){existing.date=S.date;existing.tone=tone||existing.tone;existing.severity=v095Severity(title,cat,tone);if(body)existing.body=body;return existing}
  const item={id:S.v095.nextNewsId++,date:S.date,cat:cat||'NEWS',title,tone:tone||'neutral',severity:v095Severity(title,cat,tone),body:body||'',source:opts.source||'LIFE NEWS',impact:opts.impact||null,route:opts.route||v095RouteFor(cat,title),sim:true};
  S.v095.majorNews.unshift(item);S.v095.majorNews=S.v095.majorNews.slice(0,30);return item;
}
function v095RouteFor(cat,title=''){
  if(/탄핵|대통령|국회|정당|장관|대선|정치/.test(title)||cat==='POLITICS')return 'politics';
  if(/증시|주가|시장|투자|금리|코인/.test(title)||cat==='MARKET'||cat==='ECONOMY')return 'market';
  if(/전쟁|외교|국제|동맹|제재|북한|세계/.test(title)||cat==='WORLD')return 'world';
  if(/군|국방|장성|진급/.test(title)||cat==='DEFENSE')return S.career==='military'?'career':'power';
  if(/회사|기업|상장|IPO|인수|매출/.test(title)||cat==='BUSINESS')return 'business';
  if(cat==='CAREER'||cat==='LIFE')return 'career';
  return 'home';
}
function v095BodyFor(item){
  const t=item.title;
  if(/탄핵/.test(t))return '헌정질서가 크게 흔들리는 사건입니다. 국회 표결, 대통령 권한 상태, 헌법재판 절차와 조기 대선 가능성이 동시에 정치 지형을 바꿉니다.';
  if(/파면/.test(t))return '대통령직이 궐위되며 권한대행 체제와 조기 대통령선거 국면이 시작됩니다. 정당·국회·민심의 움직임이 크게 달라집니다.';
  if(/폭락|급락/.test(t))return '위험자산 가격과 투자심리가 크게 흔들리고 있습니다. 현금 비중, 부채, 보유 종목의 변동성을 다시 확인할 필요가 있습니다.';
  if(/전쟁|안보|국제|외교|위기/.test(t))return '국제 긴장이 국내 경제와 민심, 안보 태세에 영향을 주고 있습니다. 대통령과 정치권의 대응에 따라 후속 사건이 달라질 수 있습니다.';
  if(/장관|대통령실|영입/.test(t))return '당신의 커리어가 정치권과 연결되기 시작했습니다. 수락 여부에 따라 현재 직업을 유지할지 권력의 중심으로 이동할지 인생 경로가 크게 갈립니다.';
  if(/진급|승진/.test(t))return '커리어의 중요한 변곡점입니다. 새 직위는 수입뿐 아니라 접근 가능한 사건·인맥·정치권 영입 조건까지 바꿉니다.';
  if(/스캔들|논란/.test(t))return '여론이 빠르게 움직이는 사건입니다. 평판과 미디어 영향력, 정치적 관계가 후속 결과에 영향을 줄 수 있습니다.';
  return item.body||'게임 세계에서 중요한 변화가 발생했습니다. 관련 화면에서 현재 수치와 후속 선택지를 확인할 수 있습니다.';
}
function v095ImpactFor(item){
  const rows=[];
  if(['POLITICS','BREAKING'].includes(item.cat)||/대통령|탄핵|정치|장관/.test(item.title)){
    rows.push(['대통령 상태',S.v5?.power?.presidentStatus||'재임']);rows.push(['국가 안정도',Math.round(S.nation.stability)]);rows.push(['민심',Math.round(S.nation.mood)]);rows.push(['정치 영향력',Math.round(S.inf.political)]);
  } else if(item.cat==='MARKET'||/증시|시장|주가|투자/.test(item.title)){
    rows.push(['시장 국면',S.v4?.market?.regime||'중립']);rows.push(['시장 심리',Math.round(S.v4?.market?.sentiment||50)]);rows.push(['경제지수',Math.round(S.nation.economy)]);rows.push(['내 투자자산',typeof marketValue==='function'?v093Money(marketValue()):'-']);
  } else if(item.cat==='WORLD'||/국제|외교|전쟁|위기/.test(item.title)){
    rows.push(['세계 긴장',Math.round(S.v6?.world?.globalTension||0)]);rows.push(['국제 위상',Math.round(S.v6?.world?.prestige||0)]);rows.push(['국가 안정도',Math.round(S.nation.stability)]);rows.push(['민심',Math.round(S.nation.mood)]);
  } else {
    rows.push(['평판',Math.round(S.stats.reputation)]);rows.push(['POWER',Math.round(power())]);rows.push(['직업',S.career?careers[S.career].name:'무직']);rows.push(['순자산',v093Money(networth())]);
  }
  return rows;
}
function v095SyncStateNews(saveAfter=true){
  if(!S.v095)return;
  const p=S.v5?.power;
  if(p?.presidentStatus==='탄핵심판')v095AddMajorNews('BREAKING',`${p.impeachment?.target||S.nation.currentPresident} 대통령 탄핵소추 가결…권한 정지`,'bad','',{route:'politics'});
  if(p?.presidentStatus==='궐위')v095AddMajorNews('BREAKING','대통령 탄핵 인용·파면…조기 대선 정국 돌입','bad','',{route:'politics'});
  if(p?.regime==='군사과도체제')v095AddMajorNews('BREAKING','군사과도체제 출범…국가 권력구조 급변','bad','',{route:'power'});
  if(S.v6?.world?.activeCrisis)v095AddMajorNews('WORLD',`${S.v6.world.activeCrisis.title}…국제 긴장 고조`,'bad','',{route:'world'});
  if(S.v4?.market?.regime==='급락장')v095AddMajorNews('MARKET','글로벌 위험회피 확산…증시 급락장 진입','bad','',{route:'market'});
  if(S.v6?.drama?.activeScandal)v095AddMajorNews('POLITICS',`${S.v6.drama.activeScandal.title} 논란 확산`,'bad','',{route:'politics'});
  if(S.career==='military'&&S.level>=7)v095AddMajorNews('DEFENSE',`${careers.military.levels[S.level]} ${S.name}, 군 수뇌부 핵심 인사로 부상`,'good','',{route:'career'});
  if(S.nation.economy<=32)v095AddMajorNews('ECONOMY','경기침체 경고등…소비·투자심리 동반 위축','bad','',{route:'market'});
  if(S.nation.economy>=78)v095AddMajorNews('ECONOMY','경제지표 강세…투자·고용 심리 개선','good','',{route:'market'});
  (S.v9?.headlines||[]).slice(0,12).forEach(h=>{
    if(h.cat==='BREAKING'||h.tone==='bad'||/대통령|탄핵|장관|진급|대선|당선|폭락|위기|스캔들|상장/.test(h.title))v095AddMajorNews(h.cat,h.title,h.tone,'',{route:v095RouteFor(h.cat,h.title),source:'NEWSROOM'});
  });
  if(saveAfter)save();
}
function v095ClassifyLog(text){
  if(!/탄핵|파면|대통령|장관|대선|당선|조기.*선거|진급|승진|쿠데타|군사|군정|상장|IPO|파산|폭락|급락|전쟁|국제위기|스캔들|구금|체제|영입/.test(text))return null;
  let cat='BREAKING';if(/증시|시장|폭락|급락/.test(text))cat='MARKET';else if(/국제|외교|전쟁|동맹/.test(text))cat='WORLD';else if(/진급|군|국방/.test(text))cat='DEFENSE';else if(/회사|상장|IPO|기업/.test(text))cat='BUSINESS';else if(/대통령|탄핵|장관|대선|정치|당선/.test(text))cat='POLITICS';
  return {cat,title:text,tone:/실패|부결|파면|탄핵|폭락|위기|구금|붕괴/.test(text)?'bad':'neutral'};
}

function v095NewsIcon(n){return v095CatInfo(n.cat)[0]}
function v095SidebarNews(){
  ensureV095();const list=S.v095.majorNews.slice(0,4);
  return `<section class="v095-side-news"><div class="v095-side-news-head"><div><span>LIVE · GAME SIM</span><b>주요 뉴스</b></div><button data-v095-newsroom>전체</button></div><div class="v095-side-news-list">${list.length?list.map(n=>`<button class="v095-side-news-item ${n.severity}" data-v095-news="${n.id}"><i>${v095NewsIcon(n)}</i><div><b>${v095Esc(n.title)}</b><span>${n.date.replaceAll('-','.')} · ${v095CatInfo(n.cat)[1]}</span></div></button>`).join(''):'<div class="v095-side-empty">아직 주요 속보가 없습니다.<br>시간을 진행하면 세계가 움직입니다.</div>'}</div></section>`;
}
function v095NewsListRow(n){
  return `<button class="v095-news-row ${n.severity}" data-v095-news="${n.id}"><span class="v095-news-row-icon">${v095NewsIcon(n)}</span><div><small>${v095CatInfo(n.cat)[1]} · ${n.date.replaceAll('-','.')} · GAME SIM</small><b>${v095Esc(n.title)}</b></div><em>→</em></button>`;
}
function v095SelectedNews(){
  ensureV095();return S.v095.majorNews.find(n=>n.id===S.v095.selectedNewsId)||S.v095.majorNews[0]||null;
}
function v095NewsPage(){
  ensureV095();const n=v095SelectedNews();const list=S.v095.majorNews.slice(0,14);
  if(!n)return `<div class="v9-page"><div class="v9-page-title"><div><span>LIVE NEWSROOM</span><h1>아직 큰 뉴스가 없습니다</h1><p>다음 주를 진행하면 정치·시장·국제정세·커리어에서 중요한 사건이 발생합니다.</p></div></div></div>`;
  const impact=v095ImpactFor(n),route=n.route||'home';
  return `<div class="v095-newsroom">
    <section class="v095-news-hero ${n.severity}"><div class="v095-live-badge">${n.severity==='urgent'?'BREAKING':'LIVE'} · GAME SIMULATION</div><div class="v095-news-hero-grid"><div><div class="v095-news-cat">${v095NewsIcon(n)} ${v095CatInfo(n.cat)[1]} · ${n.date.replaceAll('-','.') }</div><h1>${v095Esc(n.title)}</h1><p>${v095Esc(v095BodyFor(n))}</p><div class="v095-news-actions"><button class="hot" data-v095-route="${route}">관련 화면으로 이동</button><button data-v095-route="politics">정치·국가</button><button data-v095-route="market">투자시장</button><button data-v095-route="world">외교·세계</button></div></div><div class="v095-news-stamp"><span>${v095NewsIcon(n)}</span><b>${n.severity==='urgent'?'긴급':'주요'}</b><small>${n.source||'LIFE NEWS'}</small></div></div></section>
    <div class="v095-news-columns"><section class="v9-card"><div class="v9-section-head"><div><span>IMPACT BOARD</span><b>이 사건이 놓인 현재 상황</b></div></div><div class="v095-impact-grid">${impact.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><div class="v095-explain"><b>왜 중요한가?</b><p>${v095Esc(v095BodyFor(n))}</p></div></section>
    <section class="v9-card"><div class="v9-section-head"><div><span>LIVE ARCHIVE</span><b>최근 주요 뉴스</b></div><button id="v095GenerateNews">새 뉴스 생성</button></div><div class="v095-news-feed">${list.map(v095NewsListRow).join('')}</div></section></div>
    <section class="v9-card v095-world-strip"><div><span>경제</span><b>${Math.round(S.nation.economy)}</b></div><div><span>민심</span><b>${Math.round(S.nation.mood)}</b></div><div><span>국가 안정</span><b>${Math.round(S.nation.stability)}</b></div><div><span>세계 긴장</span><b>${Math.round(S.v6?.world?.globalTension||0)}</b></div><div><span>POWER</span><b>${Math.round(power())}</b></div></section>
  </div>`;
}

function v095OpenNews(id){
  ensureV095();const n=S.v095.majorNews.find(x=>x.id===Number(id));if(!n)return;
  S.v095.selectedNewsId=n.id;S.v095.newsSeen[n.id]=true;S.v9.view='news';save();v9Render();
}
function v095OpenHeadline(id){
  ensureV095();const h=S.v9.headlines.find(x=>String(x.id)===String(id));if(!h)return;
  const n=v095AddMajorNews(h.cat,h.title,h.tone,'',{source:'NEWSROOM'});v095OpenNews(n.id);
}
function v095NewsRoute(route){S.v9.view=route;save();v9Render();if(route==='politics'&&typeof openPowerTransition==='function'&&S.v5?.power?.presidentStatus!=='재임'){setTimeout(()=>openPowerTransition(),120)}}

function v095MaybeShock(days){
  ensureV095();if(days<5)return;if(S.v095.lastShockDate===S.date)return;
  const chance=days>=20?.28:.10;if(Math.random()>chance)return;S.v095.lastShockDate=S.date;
  const shocks=[
    ()=>{S.v4.market.sentiment=clamp((S.v4.market.sentiment||50)-8);v095AddMajorNews('MARKET','해외 금융시장 충격…성장주 중심 변동성 확대','bad','',{route:'market'});},
    ()=>{S.nation.mood=clamp(S.nation.mood-4);S.nation.stability=clamp(S.nation.stability-2);v095AddMajorNews('POLITICS','여야 강대강 대치…정국 긴장 다시 고조','bad','',{route:'politics'});},
    ()=>{S.nation.economy=clamp(S.nation.economy+4);v095AddMajorNews('ECONOMY','수출·투자 개선…경기 회복 기대감 확산','good','',{route:'market'});},
    ()=>{if(S.v6?.world){S.v6.world.globalTension=clamp(S.v6.world.globalTension+7)}v095AddMajorNews('WORLD','돌발 외교 갈등…정부 비상 대응회의 소집','bad','',{route:'world'});},
    ()=>{S.stats.reputation=clamp(S.stats.reputation+2);v095AddMajorNews('MEDIA',`${S.name}, 최근 행보 온라인 화제…인지도 상승`,'good','',{route:'career'});}
  ];
  shocks[rnd(0,shocks.length-1)]();
}

/* Important legacy log lines automatically become sidebar headlines. */
const v095BaseLog=log;
log=function(t){
  v095BaseLog(t);
  if(!S.v095)return;const x=v095ClassifyLog(String(t));if(x)v095AddMajorNews(x.cat,x.title,x.tone,'',{source:'GAME EVENT'});
};

/* Make old newsroom rows clickable instead of dead text. */
v9HeadlineRow=function(h){return `<button class="v9-headline ${h.tone}" data-v095-headline="${h.id}"><span>${h.cat}</span><b>${v095Esc(h.title)}</b><time>${h.date.slice(5).replace('-','.')}</time></button>`};

/* The top ticker now opens the full article screen. */
v9HeadlineTicker=function(){
  ensureV095();const n=S.v095.majorNews[0],h=n||S.v9.headlines[0]||{cat:'LIVE',title:'세계가 움직이고 있습니다.',date:S.date};
  const id=n?.id||'';return `<button class="v9-breaking v095-breaking-click" ${id?`data-v095-news="${id}"`:''}><b>${n?.severity==='urgent'?'BREAKING':'LIVE'}</b><span>${v095Esc(h.title)}</span><em>${S.date.replaceAll('-','.') } · 클릭해서 보기</em></button>`;
};

const v095BasePage=v9Page;
v9Page=function(){if(S.v9?.view==='news')return v095NewsPage();return v095BasePage()};

const v095BaseAdvance=advance;
advance=function(days,reason=''){
  v095BaseAdvance(days,reason);ensureV095();v095MaybeShock(days);v095SyncStateNews(false);save();
};

function v095EnhanceRail(){
  ensureV095();const rail=$('.v9-rail');if(!rail)return;
  const inbox=rail.querySelector('[data-v9view="inbox"]');
  if(inbox&&!rail.querySelector('[data-v095-newsroom-nav]'))inbox.insertAdjacentHTML('afterend',`<button data-v095-newsroom-nav class="${S.v9.view==='news'?'active':''}"><i>📰</i><span>뉴스룸</span><em>${S.v095.majorNews.filter(n=>!S.v095.newsSeen[n.id]).slice(0,9).length||''}</em></button>`);
  const player=rail.querySelector('.v9-player');let panel=rail.querySelector('.v095-side-news');
  if(panel)panel.remove();if(player)player.insertAdjacentHTML('beforebegin',v095SidebarNews());
  rail.querySelector('[data-v095-newsroom-nav]')?.addEventListener('click',()=>{S.v9.view='news';save();v9Render()});
  rail.querySelectorAll('[data-v095-newsroom]').forEach(b=>b.onclick=()=>{S.v9.view='news';save();v9Render()});
  rail.querySelectorAll('[data-v095-news]').forEach(b=>b.onclick=()=>v095OpenNews(b.dataset.v095News));
}
function v095BindInteractive(){
  $$('[data-v095-news]').forEach(b=>b.onclick=()=>v095OpenNews(b.dataset.v095News));
  $$('[data-v095-headline]').forEach(b=>b.onclick=()=>v095OpenHeadline(b.dataset.v095Headline));
  $$('[data-v095-route]').forEach(b=>b.onclick=()=>v095NewsRoute(b.dataset.v095Route));
  $('#v095GenerateNews')&&($('#v095GenerateNews').onclick=()=>{v9GenerateNews();v095MaybeShock(28);v095SyncStateNews(false);save();v9Render()});
}

const v095BaseRender=v9Render;
v9Render=function(){
  ensureV095();v095SyncStateNews(false);v095BaseRender();v095EnhanceRail();v095BindInteractive();
  const version=$('.v091-player-summary>small');if(version)version.textContent='PLAYER PROFILE · V0.9.5';
  const old=$('.v9-brand small');if(old&&old.textContent.includes('COMMAND CENTER'))old.textContent='COMMAND CENTER · V0.9.5';
};

setTimeout(()=>{ensureV095();v095SyncStateNews(false);v9Render()},160);
