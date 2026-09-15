/* LIFE : RISE V0.9.8 — PERSISTENT CAREER HISTORY + SPLIT WORK/CAREER + REPEATING RECRUITMENT */
const V098={version:'0.9.8'};

function v098CareerLabel(k){return careers[k]?.name||k||'알 수 없음'}
function v098CareerIcon(k){return v091CareerMeta(k||'corp')?.icon||'💼'}
function v098RankName(k,level){return careers[k]?.levels?.[clamp(Number(level)||0,0,(careers[k]?.levels?.length||1)-1)]||'경력'}
function v098IsoAddDays(date,days){const d=new Date((date||S.date)+'T12:00:00');d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function v098DateGE(a,b){return String(a||'')>=String(b||'')}

function ensureV098(){
  if(typeof ensureV097==='function')ensureV097(); else ensureV094();
  S.version='0.9.8';
  S.v098=S.v098||{};
  const x=S.v098;
  x.records=x.records||{};
  x.offerCooldowns=x.offerCooldowns||{};
  x.offerMeta=x.offerMeta||{};
  x.timeline=x.timeline||[];
  x.migrated=x.migrated||false;

  if(!x.migrated){
    // 현재 직업은 기존 세이브의 직급/경력 그대로 경력기록에 편입한다.
    if(S.career){
      const r=x.records[S.career]||v098BlankRecord(S.career);
      r.level=Math.max(r.level||0,S.level||0);r.xp=Math.max(r.xp||0,S.xp||0);r.maxLevel=Math.max(r.maxLevel||0,S.level||0);
      if(!r.periods.some(p=>p.active))r.periods.push({start:S.date,end:null,active:true,startLevel:S.level||0,endLevel:null,reason:'V0.9.8 이전 세이브에서 계속'});
      r.lastStart=S.date;r.lastActive=S.date;x.records[S.career]=r;
    }
    // 예전 버전이 보존하던 군 퇴역계급은 가능한 범위에서 복구한다.
    if(S.v9?.military?.retiredRank&&!x.records.military&&S.career!=='military'){
      const lv=Math.max(0,careers.military.levels.indexOf(S.v9.military.retiredRank));
      const r=v098BlankRecord('military');r.level=lv;r.maxLevel=lv;r.xp=0;r.periods.push({start:'이전 기록',end:S.date,active:false,startLevel:0,endLevel:lv,reason:'구버전 퇴역기록 복구'});r.lastEnd=S.date;x.records.military=r;
    }
    // 과거 처리 완료된 영입 메일은 바로 재발송되지 않도록 최초 쿨다운을 계산한다.
    const cooldownDays={opposition_recruit:120,generic_party_recruit:150,security_offer:150,defense_minister:210,presidential_recruit:300,cabinet_offer:210};
    Object.keys(cooldownDays).forEach(kind=>{
      const last=(S.v9?.inbox||[]).find(i=>i.kind===kind&&i.resolved);
      if(last&&!x.offerCooldowns[kind])x.offerCooldowns[kind]=v098IsoAddDays(last.date||S.date,cooldownDays[kind]);
    });
    x.migrated=true;
  }
  v098SyncActiveRecord();
}

function v098BlankRecord(k){return {career:k,level:0,xp:0,maxLevel:0,totalShifts:0,totalEarnings:0,firstStart:S.date,lastStart:null,lastEnd:null,lastActive:null,returns:0,periods:[]}}
function v098GetRecord(k,create=false){ensureV098Lite();if(!S.v098.records[k]&&create)S.v098.records[k]=v098BlankRecord(k);return S.v098.records[k]||null}
function ensureV098Lite(){S.v098=S.v098||{records:{},offerCooldowns:{},offerMeta:{},timeline:[],migrated:true};S.v098.records=S.v098.records||{};S.v098.offerCooldowns=S.v098.offerCooldowns||{};S.v098.offerMeta=S.v098.offerMeta||{};S.v098.timeline=S.v098.timeline||[]}

function v098SyncActiveRecord(){
  if(!S.career)return;
  const r=S.v098.records[S.career]||v098BlankRecord(S.career);
  // 복귀/전직 직후 기존 기록이 더 높으면 과거 직급을 보존한다.
  if(r.periods.length&&!r.periods.some(p=>p.active)){
    if((r.level||0)>(S.level||0)){S.level=r.level||0;S.xp=r.xp||0}
    r.returns=(r.returns||0)+1;r.lastStart=S.date;r.periods.push({start:S.date,end:null,active:true,startLevel:S.level||0,endLevel:null,reason:'커리어 복귀'});
  }else if(!r.periods.length){r.firstStart=S.date;r.lastStart=S.date;r.periods.push({start:S.date,end:null,active:true,startLevel:S.level||0,endLevel:null,reason:'커리어 시작'})}
  r.level=S.level||0;r.xp=S.xp||0;r.maxLevel=Math.max(r.maxLevel||0,S.level||0);r.lastActive=S.date;S.v098.records[S.career]=r;
}

function v098ArchiveCurrent(reason='퇴직'){
  ensureV098Lite();if(!S.career)return null;
  const k=S.career,r=S.v098.records[k]||v098BlankRecord(k);
  r.level=S.level||0;r.xp=S.xp||0;r.maxLevel=Math.max(r.maxLevel||0,S.level||0);r.lastEnd=S.date;r.lastActive=S.date;
  const p=[...r.periods].reverse().find(p=>p.active);if(p){p.active=false;p.end=S.date;p.endLevel=S.level||0;p.reason=reason}
  S.v098.records[k]=r;
  S.v098.timeline.unshift({date:S.date,career:k,level:S.level||0,rank:v098RankName(k,S.level||0),type:'exit',text:reason});S.v098.timeline=S.v098.timeline.slice(0,80);
  return r;
}

function v098ActivateCareer(k,opts={}){
  ensureV098();
  if(S.career&&S.career!==k){toast('현재 직업을 먼저 퇴직해야 합니다.');return false}
  const r=S.v098.records[k];const returning=!!(r&&r.periods.length);
  S.career=k;
  if(returning){S.level=r.level||0;S.xp=r.xp||0;r.returns=(r.returns||0)+1;r.lastStart=S.date;r.lastActive=S.date;r.periods.push({start:S.date,end:null,active:true,startLevel:S.level,endLevel:null,reason:'재입사/복귀'});toast(`${v098CareerLabel(k)} ${v098RankName(k,S.level)}로 복귀했습니다.`)}
  else{S.level=opts.level??0;S.xp=opts.xp??0;const nr=v098BlankRecord(k);nr.level=S.level;nr.xp=S.xp;nr.maxLevel=S.level;nr.firstStart=S.date;nr.lastStart=S.date;nr.periods.push({start:S.date,end:null,active:true,startLevel:S.level,endLevel:null,reason:'첫 커리어 시작'});S.v098.records[k]=nr;toast(`${v098CareerLabel(k)} 커리어를 시작했습니다.`)}
  if(S.v092){S.v092.monthShifts=0;S.v092.lastWorked=null}
  S.v098.timeline.unshift({date:S.date,career:k,level:S.level,rank:v098RankName(k,S.level),type:'enter',text:returning?'커리어 복귀':'첫 입사'});
  log(`${v098CareerLabel(k)} ${returning?'복귀':'커리어 시작'} — ${v098RankName(k,S.level)}`);save();updateAll();closeModal();return true
}

/* 기본 직업 진입도 과거 경력을 복원한다. */
joinCareer=function(k){return v098ActivateCareer(k)};

/* 국정원은 첫 입사만 채용심사를 거치고, 과거 근무경력이 있으면 해당 직급으로 재입사한다. */
const v098OldJoinIntel=joinIntel;
joinIntel=function(){
  ensureV098();
  if(S.career&&S.career!=='intel')return toast('현재 직업을 먼저 퇴직해야 합니다.');
  if(S.v098.records.intel?.periods?.length)return v098ActivateCareer('intel');
  if(S.stats.int<30)return toast('지능 30 이상이 필요합니다.');
  const before=S.career;v098OldJoinIntel();
  if(before!==S.career&&S.career==='intel'){ensureV098();v098SyncActiveRecord();save()}
};

/* 퇴직: 기록을 보존하고 현재 직업만 비운다. */
function v098RetireCurrent(){
  ensureV098();if(!S.career)return toast('현재 직업이 없습니다.');
  const job=S.career,comp=v091Compensation();
  modal('🚪','현재 직업에서 퇴직할까요?',`${comp.job} · ${comp.rank}에서 퇴직합니다. 직급과 경력점수는 커리어 기록에 보존되며, 나중에 같은 직업으로 돌아오면 이 지점부터 이어집니다.`,[
    ['퇴직하기',`${comp.rank} 경력 보존`,()=>{v098ArchiveCurrent('자진 퇴직');S.career=null;S.level=0;S.xp=0;if(S.v092){S.v092.monthShifts=0;S.v092.lastWorked=null}closeModal();log(`${comp.job} ${comp.rank}에서 퇴직했습니다. 경력은 보존됩니다.`);save();updateAll();S.v9.view='career';v9Render();toast(`${comp.job} 경력을 보존하고 퇴직했습니다.`)}],
    ['계속 근무','퇴직하지 않음',closeModal]
  ])
}
v094RetireCareer=v098RetireCurrent;
quitCareer=function(){if(S.career)v098ArchiveCurrent('퇴직');S.career=null;S.level=0;S.xp=0;closeModal();save();updateAll();toast('현재 직업에서 퇴직했습니다. 기존 경력은 보존됩니다.')};

/* 정치권 전직도 떠나는 직업을 자동 보존. 과거 정치경력이 더 높으면 그 경력보다 아래로 떨어지지 않는다. */
const v098OldRetireFromCareer=v9RetireFromCareer;
v9RetireFromCareer=function(reason){ensureV098();if(S.career)v098ArchiveCurrent(reason||'전직');return v098OldRetireFromCareer(reason)};
const v098OldEnterPolitics=v9EnterPolitics;
v9EnterPolitics=function(level,office,party){
  ensureV098();const oldPolitics=S.v098.records.politics?{...S.v098.records.politics}:null;
  v098OldEnterPolitics(level,office,party);ensureV098();
  if(S.career==='politics'&&oldPolitics){S.level=Math.max(S.level||0,oldPolitics.level||0);if(S.level===(oldPolitics.level||0))S.xp=Math.max(S.xp||0,oldPolitics.xp||0);}
  v098SyncActiveRecord();save();updateAll();
};

/* 근무 실적을 직업별 경력기록에 분리해서 누적한다. */
const v098OldDoWork=v092DoWork;
v092DoWork=function(type){
  ensureV098();const job=S.career,beforeEarn=S.v092?.careerEarnings||0,beforeShifts=S.v092?.workShifts||0;
  v098OldDoWork(type);
  if(job&&S.v098?.records?.[job]){const r=S.v098.records[job];r.totalEarnings=(r.totalEarnings||0)+Math.max(0,(S.v092?.careerEarnings||0)-beforeEarn);r.totalShifts=(r.totalShifts||0)+Math.max(0,(S.v092?.workShifts||0)-beforeShifts);r.level=S.career===job?S.level:r.level;r.xp=S.career===job?S.xp:r.xp;r.maxLevel=Math.max(r.maxLevel||0,r.level||0);r.lastActive=S.date;save()}
};

function v098RecordDuration(p){if(!p?.start||p.start==='이전 기록')return '이전 기록';return `${p.start} → ${p.active?'재직 중':(p.end||'종료')}`}
function v098CareerHistoryCard(r){
  const active=S.career===r.career,rank=v098RankName(r.career,r.level),maxRank=v098RankName(r.career,r.maxLevel),periods=(r.periods||[]).slice(-3).reverse();
  return `<section class="v9-card v098-history-card ${active?'active':''}"><div class="v098-history-top"><div class="v098-icon">${v098CareerIcon(r.career)}</div><div><span>${active?'CURRENT CAREER':'PAST CAREER'}</span><h2>${v098CareerLabel(r.career)}</h2><p>${rank}${maxRank!==rank?` · 최고 ${maxRank}`:''}</p></div><b>${active?'재직 중':`${r.returns||0}회 복귀`}</b></div>
    <div class="v098-history-kpis"><div><span>보존 직급</span><b>${rank}</b></div><div><span>경력점수</span><b>${Math.round(r.xp||0)}</b></div><div><span>누적 근무</span><b>${r.totalShifts||0}회</b></div><div><span>누적 실수령</span><b>${v093Money(r.totalEarnings||0)}</b></div></div>
    <div class="v098-periods">${periods.map(p=>`<div><span>${v098RecordDuration(p)}</span><b>${v098RankName(r.career,p.endLevel??p.startLevel??r.level)}</b><small>${p.reason||''}</small></div>`).join('')}</div>
    ${!active?`<button class="v098-return" data-v098-return="${r.career}" ${S.career?'disabled':''}>${S.career?'현재 직업 퇴직 후 복귀 가능':`${rank}로 다시 복귀`}</button>`:''}
  </section>`
}

function v098CareerHistoryPage(){
  ensureV098();const records=Object.values(S.v098.records).filter(r=>r.periods?.length).sort((a,b)=>String(b.lastActive||b.lastEnd||'').localeCompare(String(a.lastActive||a.lastEnd||'')));
  const total=records.length,returns=records.reduce((n,r)=>n+(r.returns||0),0);
  return `<div class="v9-page v098-career-page"><div class="v9-page-title"><div><span>CAREER HISTORY</span><h1>내가 거쳐 온 커리어</h1><p>퇴직해도 직급과 경력점수는 사라지지 않습니다. 같은 직업으로 돌아오면 예전 경력에서 다시 시작합니다.</p></div><div class="v098-summary"><div><span>경험 직업</span><b>${total}</b></div><div><span>커리어 복귀</span><b>${returns}</b></div><button id="v098CareerCenter">새 직업 찾기</button></div></div>
  ${records.length?`<div class="v098-history-grid">${records.map(v098CareerHistoryCard).join('')}</div>`:`<section class="v9-card v098-empty"><h2>아직 커리어 기록이 없습니다</h2><p>첫 직업을 시작하면 입사일부터 승진·퇴직·복귀 기록이 여기에 쌓입니다.</p><button id="v098CareerCenter2">직업 선택</button></section>`}</div>`
}

function v098WorkPage(){
  ensureV098();
  if(!S.career)return `<div class="v9-page"><div class="v9-page-title"><div><span>WORK</span><h1>현재 직업이 없습니다</h1><p>커리어 기록은 그대로 보존되어 있습니다. 이전 직업으로 복귀하거나 새로운 직업을 선택하세요.</p></div><button id="v098WorkChoose">직업 선택</button></div>${v093WorkPanel()}</div>`;
  // V0.9.7까지의 '현재 커리어 허브'를 이제 일하기 화면으로 사용한다.
  let html=v093CareerHubPage();
  html=html.replace(/CAREER HUB/g,'CURRENT JOB').replace('직업을 선택하고 첫 경력을 시작하세요','현재 직업을 선택하세요');
  return html;
}

/* 메인 라우터: 커리어는 경력 전체, 일하기는 현재 직업. */
const v098OldPage=v9Page;
v9Page=function(){ensureV098();if(S.v9?.view==='career')return v098CareerHistoryPage();if(S.v9?.view==='work')return v098WorkPage();return v098OldPage()};

/* ── 반복 영입 제안 시스템 ───────────────────── */
const V098_OFFER_DAYS={opposition_recruit:120,generic_party_recruit:150,security_offer:150,defense_minister:210,presidential_recruit:300,cabinet_offer:210};
function v098OfferOpen(kind){return (S.v9?.inbox||[]).some(i=>i.kind===kind&&!i.resolved)}
function v098OfferReady(kind){ensureV098();if(v098OfferOpen(kind))return false;const cd=S.v098.offerCooldowns[kind];if(!cd)return true;const m=S.v098.offerMeta[kind]||{};const promoted=(S.level||0)>(m.level??-1);return v098DateGE(S.date,cd)||(promoted&&v098DateGE(S.date,v098IsoAddDays(m.date||S.date,45)))}
function v098MarkOffer(kind){ensureV098();S.v098.offerCooldowns[kind]=v098IsoAddDays(S.date,V098_OFFER_DAYS[kind]||150);S.v098.offerMeta[kind]={date:S.date,level:S.level||0,rep:Math.round(S.stats.reputation||0)}}
function v098SendOffer(kind,from,title,body,payload={},priority='high',headline=null){if(!v098OfferReady(kind))return false;const it=v9PushInbox(kind,from,title,body,payload,priority,false);if(!it)return false;v098MarkOffer(kind);if(headline)v9AddHeadline(...headline,false);return true}

v9CheckEliteOffers=function(){
  ensureV098();if(!S.career||S.career==='politics')return;
  const prestige=v9CareerPrestige(),rep=S.stats.reputation,pow=power();
  if(S.career==='military'){
    if(S.level>=7&&rep>=42&&S.inf.military>=38)v098SendOffer('opposition_recruit','제1야당 인재영입위원회','“장군님을 정치권으로 모시고 싶습니다”',`${careers.military.levels[S.level]} 경력과 대중적 신뢰를 높게 평가한다며 정치권 합류를 다시 검토해 달라는 연락입니다.`,{party:v9OppositionParty()},'high',['POLITICS','야권, 안보 분야 외부 인재 접촉 (게임 시뮬레이션)','neutral']);
    if(S.level>=8&&rep>=50&&S.inf.military>=52)v098SendOffer('security_offer',`${S.nation.currentPresident} 대통령실`,'국가안보실 합류 제안',`군 지휘 경험을 살려 대통령을 보좌해 달라는 제안입니다. 과거에 고사했더라도 상황이 바뀌면 다시 제안될 수 있습니다.`,{},'urgent');
    if(S.level>=9&&rep>=58&&S.inf.military>=62)v098SendOffer('defense_minister',`${S.nation.currentPresident} 대통령실`,'국방부 장관 임명 제안',`중장급 이상의 지휘경력과 군내 영향력을 바탕으로 국방부 장관직을 맡아달라는 제안입니다.`,{},'urgent',['BREAKING','대통령실, 국방라인 인선 검토 (게임 시뮬레이션)','neutral']);
    if(S.level>=10&&rep>=68&&pow>=45)v098SendOffer('presidential_recruit','야권 전략기획단','차기 대선후보 영입 제안',`대장급 상징성과 높은 평판을 앞세워 차기 대선의 외부 후보가 되어달라는 제안입니다.`,{party:v9OppositionParty()},'urgent');
  }else{
    const max=careers[S.career]?.levels.length||99;
    if(S.level>=Math.max(4,max-3)&&prestige>=55&&rep>=50)v098SendOffer('generic_party_recruit','정당 인재영입위원회','정계 입문 제안',`${careerName()}에서 쌓은 전문성을 정치권에서 활용해 달라는 제안입니다. 거절해도 향후 상황에 따라 재접촉할 수 있습니다.`,{party:v9OppositionParty()},'high');
    if(S.level>=Math.max(5,max-2)&&prestige>=65&&rep>=57)v098SendOffer('cabinet_offer',`${S.nation.currentPresident} 대통령실`,`${v9MinisterForCareer()} 임명 검토`,`${careerName()}에서의 성과를 인정해 ${v9MinisterForCareer()} 후보로 검토하고 있다는 연락입니다.`,{office:v9MinisterForCareer()},'urgent');
  }
  save();
};

/* 인박스 처리 후 거절/고사는 영구차단이 아니라 다음 제안일까지 쿨다운만 유지. */
const v098OldResolveInbox=v9ResolveInbox;
v9ResolveInbox=function(id,choice){
  ensureV098();const item=S.v9.inbox.find(i=>i.id===id),kind=item?.kind;
  v098OldResolveInbox(id,choice);
  if(kind&&V098_OFFER_DAYS[kind]&&['decline','advisor','kingmaker'].includes(choice)){
    const days=V098_OFFER_DAYS[kind];S.v098.offerCooldowns[kind]=v098IsoAddDays(S.date,days);S.v098.offerMeta[kind]={date:S.date,level:S.level||0,rep:Math.round(S.stats.reputation||0),choice};save();
  }
};

function v098EnhanceRail(){
  const nav=$('.v9-rail nav');if(!nav)return;
  const career=nav.querySelector('[data-v9view="career"]');if(career){career.innerHTML='<i>🧭</i><span>커리어</span>';career.classList.toggle('active',S.v9.view==='career')}
  let work=nav.querySelector('[data-v092-work]');
  if(!work&&career){career.insertAdjacentHTML('afterend',`<button data-v092-work><i>💼</i><span>일하기</span></button>`);work=nav.querySelector('[data-v092-work]')}
  if(work){work.innerHTML='<i>💼</i><span>일하기</span>';work.classList.toggle('active',S.v9.view==='work');work.onclick=()=>v9SetView('work')}
}
function v098Bind(){
  $('#v098CareerCenter')&&($('#v098CareerCenter').onclick=openCareerCenter);$('#v098CareerCenter2')&&($('#v098CareerCenter2').onclick=openCareerCenter);$('#v098WorkChoose')&&($('#v098WorkChoose').onclick=openCareerCenter);
  $$('[data-v098-return]').forEach(b=>b.onclick=()=>{if(S.career)return toast('현재 직업을 먼저 퇴직하세요.');const k=b.dataset.v098Return;const req=v091CareerMeta(k).req();if(!req.ok)return toast(req.text);v098ActivateCareer(k);S.v9.view='work';save();v9Render()});
  $('#v094RetireCareer')&&($('#v094RetireCareer').onclick=v098RetireCurrent);
  v098EnhanceRail();
}

const v098OldRender=v9Render;
v9Render=function(){ensureV098();v098OldRender();v098Bind();const ver=document.querySelector('.v091-player-summary>small');if(ver)ver.textContent='PLAYER PROFILE · V0.9.8';const brand=document.querySelector('.v9-brand small');if(brand&&brand.textContent.includes('COMMAND CENTER'))brand.textContent='COMMAND CENTER · V0.9.8'};

/* 경력/직급 변경은 렌더 시마다 최신값으로 동기화 */
const v098OldSave=save;
save=function(){if(S.v098&&S.career){const r=S.v098.records?.[S.career];if(r){r.level=S.level||0;r.xp=S.xp||0;r.maxLevel=Math.max(r.maxLevel||0,S.level||0);r.lastActive=S.date}}return v098OldSave()};

setTimeout(()=>{ensureV098();v9Render()},180);
