/* LIFE : RISE V0.9 — NEWSROOM / INBOX / ELITE CAREER UPDATE */
const V9={version:'0.9',views:['home','inbox','career','market','business','politics','power','world','intel']};

/* ROK-style officer ladder for the game. Chief of Staff/JCS are posts, not ranks. */
careers.military.levels=['훈련병','소위','중위','대위','소령','중령','대령','준장','소장','중장','대장'];
careers.military.salary=[1200000,3200000,3800000,4800000,6000000,7500000,9000000,11200000,12800000,14500000,16500000];

function v9DefaultMilitaryPost(level=S.level){
  return ['교육대','소대장','중대 참모','중대장','대대 참모','대대장','연대장','여단장','사단장','군단장','대장 보직 대기'][clamp(level,0,10)]||'지휘 보직';
}
function v9Stars(level=S.level){return level>=7?'★'.repeat(Math.min(4,level-6)):''}
function ensureV9(){
  ensureV8();S.version=9;S.v9=S.v9||{};
  const x=S.v9;
  x.view=x.view||'home';x.inbox=x.inbox||[];x.nextInboxId=x.nextInboxId||1;x.headlines=x.headlines||[];
  x.social=x.social||{sentiment:50,followers:120,trending:['#경제','#커리어','#증시'],buzz:12};
  x.history=x.history||[];x.offerFlags=x.offerFlags||{};x.cooldowns=x.cooldowns||{};
  x.office=x.office||null;x.previousCareer=x.previousCareer||null;
  x.military=x.military||{branch:'육군',post:v9DefaultMilitaryPost(),commandTrust:25,decorations:0,retiredRank:null,postingHistory:[]};
  x.newsCycle=x.newsCycle||0;x.lastAdvanceDate=x.lastAdvanceDate||S.date;x.unread=x.unread||0;
  if(!x.migratedRanks){
    if(S.career==='military'&&S.level===8){S.level=10;x.military.post='참모총장';}
    else if(S.career==='military'&&S.level>=7)x.military.post=v9DefaultMilitaryPost(S.level);
    x.migratedRanks=true;
  }
  if(!x.headlines.length){
    v9AddHeadline('LIFE','새로운 주간 브리핑 시스템이 가동됐습니다.','neutral',false);
    v9AddHeadline('ECONOMY',`경제지수 ${Math.round(S.nation.economy)} · 시장은 ${S.v4?.market?.regime||'중립'} 국면입니다.`,'neutral',false);
  }
  if(!x.inbox.length){x.inbox.unshift({id:x.nextInboxId++,date:S.date,kind:'welcome',from:'LIFE : RISE',title:'V0.9 COMMAND INBOX',body:'이제 중요한 제안과 사건은 인박스로 들어옵니다. 모든 메뉴를 반복해서 누르지 않아도 됩니다.',payload:{},priority:'info',read:false,resolved:false});x.unread=1;}
  v9RecordHistory(false);
}

function v9AddHeadline(cat,title,tone='neutral',render=true){
  if(!S.v9)return;S.v9.headlines.unshift({id:Date.now()+Math.random(),date:S.date,cat,title,tone});S.v9.headlines=S.v9.headlines.slice(0,24);if(render)v9Render();
}
function v9PushInbox(kind,from,title,body,payload={},priority='normal',render=true){
  ensureV9();
  const dup=S.v9.inbox.some(i=>!i.resolved&&i.kind===kind&&JSON.stringify(i.payload||{})===JSON.stringify(payload||{}));if(dup)return null;
  const item={id:S.v9.nextInboxId++,date:S.date,kind,from,title,body,payload,priority,read:false,resolved:false};
  S.v9.inbox.unshift(item);S.v9.inbox=S.v9.inbox.slice(0,40);S.v9.unread=(S.v9.unread||0)+1;if(render){save();v9Render()}return item;
}
function v9Unread(){return S.v9.inbox.filter(i=>!i.read&&!i.resolved).length}
function v9CareerPrestige(){
  if(!S.career)return 0;const c=careers[S.career];const max=Math.max(1,c.levels.length-1);return clamp(S.level/max*52+S.stats.reputation*.24+power()*.3+S.stats.net*.08);
}
function v9MilitaryScore(){return clamp(S.stats.lead*.28+S.inf.military*.32+S.stats.reputation*.16+S.stats.net*.08+S.v9.military.commandTrust*.16)}
function v9ContextTags(){
  const t=[];if(S.career==='military')t.push('#군인사');if(S.career==='politics')t.push('#국회');if(S.v4?.market?.regime==='급락장')t.push('#증시급락');if(S.v5?.company?.exists)t.push('#스타트업');if(S.v6?.world?.globalTension>55)t.push('#안보');if(S.stats.reputation>55)t.push('#화제인물');return [...new Set([...t,'#경제','#정치'])].slice(0,4)
}
function v9UpdateSocial(){
  const scandal=S.v6?.drama?.activeScandal?12:0;const heat=S.heat||0;const base=36+S.stats.reputation*.42+S.inf.media*.18+S.nation.mood*.12-scandal-heat*.12;
  S.v9.social.sentiment=clamp(base+rnd(-4,4));S.v9.social.followers=Math.max(20,Math.round(S.v9.social.followers*(1.002+S.stats.reputation/30000)+S.inf.media*12+power()*3));
  S.v9.social.buzz=clamp(8+S.stats.reputation*.35+S.inf.media*.3+(S.career==='politics'?15:0)+(S.career==='military'&&S.level>=7?18:0));S.v9.social.trending=v9ContextTags();
}
function v9GenerateNews(){
  ensureV9();S.v9.newsCycle++;
  const pool=[];
  const reg=S.v4?.market?.regime||'중립';
  pool.push(['MARKET',`${reg} 장세… 투자자 심리 ${Math.round(S.v4?.market?.sentiment||50)}`,reg==='급락장'?'bad':reg==='강세장'||reg==='과열장'?'good':'neutral']);
  pool.push(['ECONOMY',`국가 경제지수 ${Math.round(S.nation.economy)}, 민심 ${Math.round(S.nation.mood)}`,S.nation.economy>=60?'good':S.nation.economy<40?'bad':'neutral']);
  if(S.career)pool.push(['CAREER',`${S.name}, ${careerName()}에서 영향력 확대`,S.stats.reputation>50?'good':'neutral']);
  if(S.career==='military'&&S.level>=7)pool.push(['DEFENSE',`${v9Stars()} ${careers.military.levels[S.level]} ${S.name}, 군 수뇌부 차세대 인사로 주목 (게임)`, 'good']);
  if(S.v5?.company?.exists)pool.push(['BUSINESS',`${S.v5.company.name} 월 매출 ${KRW(S.v5.company.revenue)} · ${S.v5.company.profit>=0?'흑자':'적자'} 기록` ,S.v5.company.profit>=0?'good':'bad']);
  if(S.v6?.world?.activeCrisis)pool.push(['WORLD',`${S.v6.world.activeCrisis.title}… 외교·안보 긴장 고조 (게임 시뮬레이션)`,'bad']);
  if(S.v6?.drama?.activeScandal)pool.push(['POLITICS',`${S.v6.drama.activeScandal.title} 논란 확산 (게임 시뮬레이션)`,'bad']);
  const picks=pool.sort(()=>Math.random()-.5).slice(0,2);picks.forEach(x=>v9AddHeadline(...x,false));
  v9UpdateSocial();
}
function v9RecordHistory(force=true){
  ensureV8();if(!S.v9)return;const h=S.v9.history,last=h[h.length-1];if(!force&&last&&last.date===S.date)return;
  h.push({date:S.date,nw:Math.round(networth()),power:Math.round(power()),rep:Math.round(S.stats.reputation),market:Math.round(S.v4?.market?.sentiment||50),approval:Math.round(S.v3?.gov?.approval||S.nation.mood)});if(h.length>36)h.shift();
}

function v9MinisterForCareer(){return {military:'국방부 장관',doctor:'보건복지부 장관',prosecutor:'법무부 장관',lawyer:'법무부 장관',police:'행정안전부 장관',corp:'산업통상자원부 장관',entrepreneur:'중소벤처기업부 장관',intel:'국가안보실장',entertainer:'문화체육관광부 장관',athlete:'문화체육관광부 장관'}[S.career]||'국무위원'}
function v9OppositionParty(){
  // The starting scenario uses the current 2026 governing/opposition alignment.
  // After the simulated timeline diverges, avoid presenting a future real-world party claim as fact.
  if(!S.nation.simulated&&S.nation.currentPresident==='이재명')return '국민의힘';
  return '제1야당';
}
function v9CheckEliteOffers(){
  ensureV9();if(!S.career||S.career==='politics')return;
  const f=S.v9.offerFlags,prestige=v9CareerPrestige(),rep=S.stats.reputation,pow=power();
  if(S.career==='military'){
    if(S.level>=7&&rep>=42&&S.inf.military>=38&&!f.oppRecruit){f.oppRecruit=true;v9PushInbox('opposition_recruit','제1야당 인재영입위원회','“장군님을 정치권으로 모시고 싶습니다”',`${careers.military.levels[S.level]}까지 올라온 경력과 대중적 신뢰를 높게 평가한다며 비례대표·지역구 출마 카드를 제시했습니다.`,{party:v9OppositionParty()},'high',false);v9AddHeadline('POLITICS','야권, 안보 분야 외부 인재 영입 추진설 (게임 시뮬레이션)','neutral',false)}
    if(S.level>=8&&rep>=50&&S.inf.military>=52&&!f.securityOffer){f.securityOffer=true;v9PushInbox('security_offer',`${S.nation.currentPresident} 대통령실`,'국가안보실 합류 제안',`군 지휘 경험을 살려 대통령을 직접 보좌하는 국가안보실 고위직을 맡아달라는 제안입니다. 수락하면 현역 군 경력을 정리하고 정치·안보 권력의 중심으로 이동합니다.`,{},'urgent',false)}
    if(S.level>=9&&rep>=58&&S.inf.military>=62&&!f.defenseMinister){f.defenseMinister=true;v9PushInbox('defense_minister',`${S.nation.currentPresident} 대통령실`,'국방부 장관 임명 제안',`중장급 이상의 지휘경력과 군내 영향력을 바탕으로 국방부 장관직을 맡아달라는 공식 제안이 도착했습니다.`,{},'urgent',false);v9AddHeadline('BREAKING','대통령실, 국방라인 대규모 인선 검토 (게임 시뮬레이션)','neutral',false)}
    if(S.level>=10&&rep>=68&&pow>=45&&!f.presidentRecruit){f.presidentRecruit=true;v9PushInbox('presidential_recruit','야권 전략기획단','차기 대선후보 영입 제안',`대장까지 오른 상징성과 높은 평판을 앞세워 차기 대선의 외부 후보가 되어달라는 제안입니다. 정치 경력이 짧다는 점은 가장 큰 위험입니다.`,{party:v9OppositionParty()},'urgent',false)}
  } else {
    const max=careers[S.career]?.levels.length||99;
    if(S.level>=Math.max(4,max-3)&&prestige>=55&&rep>=50&&!f.genericPoliticalRecruit){f.genericPoliticalRecruit=true;v9PushInbox('generic_party_recruit','정당 인재영입위원회','정계 입문 제안',`${careerName()}에서 쌓은 전문성을 정치권에서 활용해 달라는 영입 제안입니다.`,{party:v9OppositionParty()},'high',false)}
    if(S.level>=Math.max(5,max-2)&&prestige>=65&&rep>=57&&!f.genericCabinet){f.genericCabinet=true;v9PushInbox('cabinet_offer',`${S.nation.currentPresident} 대통령실`,`${v9MinisterForCareer()} 임명 검토`,`${careerName()}에서의 성과를 인정해 ${v9MinisterForCareer()} 후보로 검토하고 있다는 연락이 왔습니다.`,{office:v9MinisterForCareer()},'urgent',false)}
  }
}
function v9MaybeMilitaryPosting(){
  if(S.career!=='military'||S.level<6)return;const key='post_'+S.level;if(S.v9.offerFlags[key])return;S.v9.offerFlags[key]=true;
  const rank=careers.military.levels[S.level];const options={6:['연대장','합참 작전참모','국방부 정책보직'],7:['여단장','합참 작전참모부','국방부 정책관'],8:['사단장','합참 참모부장','수도권 핵심보직'],9:['군단장','합참 본부장','연합 지휘보직'],10:['각군 참모총장 후보','합참의장 후보','국가안보 자문역']}[S.level]||['지휘보직','정책보직','합참보직'];
  v9PushInbox('military_posting','국방부 인사라인',`${rank} 보직 인사`,`${rank} 진급 이후 첫 핵심보직을 선택할 시점입니다. 보직 선택은 다음 진급과 정치권의 평가를 바꿉니다.`,{options},'high',false)
}
function v9AfterAdvance(days,before={}){
  ensureV9();if(days>=5){v9GenerateNews();v9CheckEliteOffers();v9MaybeMilitaryPosting();v9RecordHistory(true)}
  if(S.career==='military')S.v9.military.commandTrust=clamp(S.v9.military.commandTrust+(S.stats.lead>55?1:0)+(S.inf.military>60?1:0)-((S.heat||0)>40?2:0));
  save();v9Render();
}

/* General-rank promotions are no longer pure XP. */
const v9BaseAddXP=addXP;
addXP=function(v){
  ensureV9();
  if(S.career!=='military'||S.level<6)return v9BaseAddXP(v);
  if(S.level>=careers.military.levels.length-1){S.xp=Math.min(199,S.xp+v);return}
  S.xp+=v;const need=130+S.level*34;if(S.xp<need)return;
  const score=v9MilitaryScore();const difficulty=56+(S.level-6)*8;const chance=clamp(45+(score-difficulty)*1.25,18,91);
  if(Math.random()*100<chance){S.xp=Math.max(0,S.xp-need);S.level++;S.stats.reputation=clamp(S.stats.reputation+5);S.inf.military=clamp(S.inf.military+7);S.v9.military.commandTrust=clamp(S.v9.military.commandTrust+6);S.v9.military.post=v9DefaultMilitaryPost();v9AddHeadline('BREAKING',`${S.name}, ${careers.military.levels[S.level]} 진급 ${v9Stars()} (게임)`,'good',false);v9PushInbox('promotion_result','국방부 인사관리','장성 인사 발표',`${S.name}의 ${careers.military.levels[S.level]} 진급이 확정됐습니다. 이제 보직 선택과 정치권의 관심이 훨씬 커집니다.`,{},'high',false);v9MaybeMilitaryPosting();toast(`🎖 진급! ${careers.military.levels[S.level]} ${v9Stars()}`)}
  else{S.xp=Math.round(need*.72);S.stats.stress=clamp(S.stats.stress+5);S.v9.military.commandTrust=clamp(S.v9.military.commandTrust-2);v9PushInbox('promotion_fail','장성 인사위원회','이번 장성 진급 심사 보류',`진급점수는 충분했지만 지휘평가·조직신뢰·경쟁구도에서 최종 선택을 받지 못했습니다. 다음 심사까지 보직 성과를 더 쌓아야 합니다.`,{},'normal',false);toast('이번 진급 심사는 보류됐습니다.')}
};

const v9BaseAdvance=advance;
advance=function(days,reason=''){
  const before={career:S.career,level:S.level,date:S.date};v9BaseAdvance(days,reason);v9AfterAdvance(days,before)
};

function v9RetireFromCareer(reason){if(S.career==='military')S.v9.military.retiredRank=careers.military.levels[S.level];S.v9.previousCareer=S.career;log(`${careerName()} 경력을 정리했습니다. ${reason||''}`)}
function v9EnterPolitics(level,office,party){
  v9RetireFromCareer(`${office||'정계 진출'}을 위해 전직했습니다.`);S.career='politics';S.level=clamp(level,0,8);S.xp=0;S.v9.office=office?{title:office,since:S.date}:null;if(party)S.faction.party=party;S.inf.political=clamp(S.inf.political+14);S.stats.pol=clamp(S.stats.pol+6);S.stats.reputation=clamp(S.stats.reputation+5);S.stats.stress=clamp(S.stats.stress+6);v9AddHeadline('POLITICS',`${S.name}, ${office||'정치권'} 합류 선언 (게임 시뮬레이션)`,'good',false);log(`${office||'정치권'}에 합류했습니다. (게임 시뮬레이션)`);save();updateAll()
}
function v9ResolveInbox(id,choice){
  ensureV9();const item=S.v9.inbox.find(i=>i.id===id);if(!item||item.resolved)return;item.read=true;item.resolved=true;let msg='결정을 내렸습니다.';
  const p=item.payload||{};
  if(item.kind==='welcome'){msg='V0.9 인박스 시스템을 확인했습니다.'}
  if(item.kind==='opposition_recruit'||item.kind==='generic_party_recruit'){
    if(choice==='accept'){v9EnterPolitics(3,null,p.party||'국민의힘');msg='야당의 영입 제안을 받아들여 국회의원급 정치 커리어로 전환했습니다.'}
    if(choice==='run'){v9RetireFromCareer('지역구 출마를 준비합니다.');S.career='politics';S.level=2;S.faction.party=p.party||'국민의힘';S.inf.political=clamp(S.inf.political+8);S.stats.pol=clamp(S.stats.pol+4);msg='지역구 공천 경쟁에 뛰어들었습니다.';setTimeout(()=>typeof openElectionHub==='function'&&openElectionHub(),220)}
    if(choice==='decline'){S.stats.reputation=clamp(S.stats.reputation+1);msg='정치권 영입을 거절하고 현재 커리어에 남았습니다.'}
  }
  if(item.kind==='security_offer'){
    if(choice==='accept'){v9EnterPolitics(5,'국가안보실장');S.inf.military=clamp(S.inf.military+3);msg='현역 경력을 정리하고 국가안보실장으로 이동했습니다.'}
    if(choice==='advisor'){S.v9.office={title:'대통령 국방자문역',since:S.date};S.inf.political=clamp(S.inf.political+6);S.stats.net=clamp(S.stats.net+4);msg='현역 신분을 유지하며 대통령 국방자문역을 맡았습니다.'}
    if(choice==='decline'){S.v9.military.commandTrust=clamp(S.v9.military.commandTrust+2);msg='대통령실 제안을 정중히 거절했습니다.'}
  }
  if(item.kind==='defense_minister'){
    if(choice==='accept'){v9EnterPolitics(6,'국방부 장관');S.inf.military=clamp(S.inf.military+5);msg='국방부 장관에 취임했습니다.'}
    if(choice==='security'){const ok=S.stats.pol+S.stats.net+rnd(-15,15)>80;if(ok){v9EnterPolitics(5,'국가안보실장');msg='협상 끝에 국가안보실장으로 합류했습니다.'}else{item.resolved=false;msg='역제안이 받아들여지지 않았습니다. 원래 제안은 아직 유효합니다.'}}
    if(choice==='decline'){S.stats.reputation=clamp(S.stats.reputation+2);msg='장관직을 거절하고 군 커리어를 계속합니다.'}
  }
  if(item.kind==='presidential_recruit'){
    if(choice==='accept'){v9EnterPolitics(7,'야권 대선후보',p.party||'국민의힘');msg='외부 영입 대선후보 제안을 수락했습니다.'}
    if(choice==='kingmaker'){S.inf.political=clamp(S.inf.political+10);S.stats.net=clamp(S.stats.net+7);S.v9.office={title:'야권 안보정책 고문',since:S.date};msg='후보가 되는 대신 킹메이커와 안보정책 고문 역할을 택했습니다.'}
    if(choice==='decline'){msg='대선후보 영입을 거절했습니다.'}
  }
  if(item.kind==='cabinet_offer'){
    if(choice==='accept'){v9EnterPolitics(6,p.office||'국무위원');msg=`${p.office||'장관'} 임명 제안을 수락했습니다.`}
    if(choice==='advisor'){S.v9.office={title:`대통령실 ${p.office||'정책'} 특보`,since:S.date};S.inf.political=clamp(S.inf.political+6);S.stats.net=clamp(S.stats.net+4);msg='전업 장관 대신 대통령실 특보를 택했습니다.'}
    if(choice==='decline')msg='장관 임명 검토를 고사했습니다.'
  }
  if(item.kind==='military_posting'){
    const idx=Number(choice.replace('opt',''));const opt=p.options?.[idx]||p.options?.[0]||v9DefaultMilitaryPost();S.v9.military.post=opt;S.v9.military.postingHistory.push({date:S.date,rank:careers.military.levels[S.level],post:opt});
    if(idx===0){S.stats.lead=clamp(S.stats.lead+3);S.inf.military=clamp(S.inf.military+3);S.v9.military.commandTrust=clamp(S.v9.military.commandTrust+3)}
    if(idx===1){S.stats.int=clamp(S.stats.int+2);S.stats.net=clamp(S.stats.net+2);S.inf.military=clamp(S.inf.military+2)}
    if(idx===2){S.stats.pol=clamp(S.stats.pol+3);S.inf.political=clamp(S.inf.political+3);S.stats.net=clamp(S.stats.net+2)}
    msg=`새 보직: ${opt}`;v9AddHeadline('DEFENSE',`${careers.military.levels[S.level]} ${S.name}, ${opt} 보직 부임 (게임)`,'neutral',false)
  }
  if(item.kind==='promotion_result'||item.kind==='promotion_fail'){msg='인사 결과를 확인했습니다.'}
  S.v9.unread=v9Unread();log(`인박스 결정: ${msg}`);save();updateAll();closeModal();toast(msg)
}
function v9InboxActions(item){
  const id=item.id;
  if(item.kind==='welcome'||item.kind==='promotion_result'||item.kind==='promotion_fail')return [['확인','메시지를 처리합니다.',()=>v9ResolveInbox(id,'ok')]];
  if(item.kind==='opposition_recruit'||item.kind==='generic_party_recruit')return [['비례·영입 수락','정치 커리어로 즉시 전환',()=>v9ResolveInbox(id,'accept')],['지역구 출마로 협상','공천·선거 루트로 이동',()=>v9ResolveInbox(id,'run')],['거절','현재 커리어 유지',()=>v9ResolveInbox(id,'decline')]];
  if(item.kind==='security_offer')return [['국가안보실장 수락','현역 경력 종료 · 정치/안보 권력 급상승',()=>v9ResolveInbox(id,'accept')],['국방자문역만 수락','현역 유지 · 대통령실 네트워크 확보',()=>v9ResolveInbox(id,'advisor')],['거절','군 커리어 유지',()=>v9ResolveInbox(id,'decline')]];
  if(item.kind==='defense_minister')return [['국방부 장관 수락','전역 후 장관 취임',()=>v9ResolveInbox(id,'accept')],['국가안보실장 역제안','정치력/인맥 판정',()=>v9ResolveInbox(id,'security')],['거절','군 커리어 계속',()=>v9ResolveInbox(id,'decline')]];
  if(item.kind==='presidential_recruit')return [['대선후보 수락','야권 외부 영입후보로 전환',()=>v9ResolveInbox(id,'accept')],['킹메이커로 남는다','후보 대신 안보정책/인맥 영향력',()=>v9ResolveInbox(id,'kingmaker')],['거절','군 원로 루트 유지',()=>v9ResolveInbox(id,'decline')]];
  if(item.kind==='cabinet_offer')return [[`${item.payload.office||'장관'} 수락`,'정치 커리어로 전환',()=>v9ResolveInbox(id,'accept')],['대통령실 특보 제안','본업 유지 · 정치 영향력 상승',()=>v9ResolveInbox(id,'advisor')],['고사','현재 커리어 유지',()=>v9ResolveInbox(id,'decline')]];
  if(item.kind==='military_posting')return (item.payload.options||[]).map((x,i)=>[x,i===0?'현장 지휘 중심':i===1?'합참·전략 중심':'정책·정치 네트워크 중심',()=>v9ResolveInbox(id,'opt'+i)]);
  return [['확인','처리 완료',()=>v9ResolveInbox(id,'ok')]];
}
function v9OpenInboxItem(id){const item=S.v9.inbox.find(i=>i.id===id);if(!item)return;item.read=true;save();const tag=item.priority==='urgent'?'긴급':item.priority==='high'?'중요':'메시지';modal(item.priority==='urgent'?'🚨':'✉️',item.title,`${item.from} · ${item.date}`,v9InboxActions(item),`<div class="v9-mail"><span>${tag}</span><p>${item.body}</p></div>`)}

function v9Money(n){const a=Math.abs(n||0);if(a>=1e12)return '₩'+(n/1e12).toFixed(1)+'조';if(a>=1e8)return '₩'+(n/1e8).toFixed(1)+'억';if(a>=1e4)return '₩'+(n/1e4).toFixed(0)+'만';return KRW(n||0)}
function v9Spark(key){const h=S.v9.history.slice(-18);if(h.length<2)return '<div class="v9-empty-chart">시간이 지나면 추세가 표시됩니다.</div>';const vals=h.map(x=>Number(x[key]||0)),min=Math.min(...vals),max=Math.max(...vals),d=Math.max(1,max-min),pts=vals.map((v,i)=>`${(i/(vals.length-1))*100},${42-((v-min)/d)*34}`).join(' ');return `<svg class="v9-spark" viewBox="0 0 100 46" preserveAspectRatio="none"><polyline points="${pts}" /></svg>`}
function v9HeadlineTicker(){const h=S.v9.headlines[0]||{cat:'LIVE',title:'세계가 움직이고 있습니다.'};return `<div class="v9-breaking"><b>${h.cat==='BREAKING'?'BREAKING':'LIVE'}</b><span>${h.title}</span><em>${S.date.replaceAll('-','.')}</em></div>`}
function v9CareerRank(){if(!S.career)return '무직';const extra=S.career==='military'?` · ${S.v9.military.post}`:S.v9.office?` · ${S.v9.office.title}`:'';return `${careerName()}${extra}`}
function v9RailButton(view,icon,label,badge=''){return `<button class="${S.v9.view===view?'active':''}" data-v9view="${view}"><i>${icon}</i><span>${label}</span>${badge?`<em>${badge}</em>`:''}</button>`}

function v9HomePage(){
  const unread=v9Unread(),head=S.v9.headlines.slice(0,6),ib=S.v9.inbox.filter(i=>!i.resolved).slice(0,4),soc=S.v9.social,flow=monthlyIncome();
  return `<div class="v9-grid-home">
    <section class="v9-card v9-command"><div class="v9-kicker">WEEKLY COMMAND</div><h1>${v9HomeTitle()}</h1><p>${v9HomeText()}</p><div class="v9-command-actions"><button data-focus="career">커리어 집중</button><button data-focus="wealth">자산 집중</button><button data-focus="power">권력 집중</button><button data-focus="life">회복</button></div><div class="v9-command-foot"><span>월 현금흐름 <b class="${flow.net>=0?'up':'down'}">${v9Money(flow.net)}</b></span><span>미처리 인박스 <b>${ib.length}</b></span><span>대중호감 <b>${Math.round(soc.sentiment)}%</b></span></div></section>
    <section class="v9-card"><div class="v9-section-head"><div><span>DECISION INBOX</span><b>내 결정이 필요한 일</b></div><button data-v9view="inbox">전체 ${unread?`· ${unread} NEW`:''}</button></div><div class="v9-inbox-preview">${ib.length?ib.map(v9InboxRow).join(''):'<div class="v9-empty">지금 당장 결정할 일은 없습니다.</div>'}</div></section>
    <section class="v9-card v9-chart-card wealth-chart"><div class="v9-section-head"><div><span>WEALTH TRAJECTORY</span><b>순자산 추세</b></div><em>${v9Money(networth())}</em></div>${v9Spark('nw')}</section>
    <section class="v9-card v9-chart-card power-chart"><div class="v9-section-head"><div><span>POWER TRAJECTORY</span><b>권력지수 추세</b></div><em>${Math.round(power())}</em></div>${v9Spark('power')}</section>
    <section class="v9-card v9-news-card"><div class="v9-section-head"><div><span>NEWSROOM</span><b>오늘의 헤드라인</b></div><button id="v9RefreshNews">뉴스 갱신</button></div><div class="v9-news-list">${head.map(v9HeadlineRow).join('')}</div></section>
    <section class="v9-card v9-social-card"><div class="v9-section-head"><div><span>SOCIAL PULSE</span><b>여론과 화제성</b></div><em>${soc.followers.toLocaleString()} followers</em></div><div class="v9-sentiment"><div><span>긍정 여론</span><b>${Math.round(soc.sentiment)}%</b></div><i><em style="width:${soc.sentiment}%"></em></i></div><div class="v9-tags">${soc.trending.map(x=>`<span>${x}</span>`).join('')}</div><div class="v9-buzz"><span>화제성</span><b>${Math.round(soc.buzz)}/100</b></div></section>
    <section class="v9-card v9-pulse-card"><div class="v9-section-head"><div><span>WORLD PULSE</span><b>세계 상태</b></div></div>${v9PulseRows()}</section>
  </div>`
}
function v9HomeTitle(){if(S.career==='military'&&S.level>=7)return `${v9Stars()} ${careers.military.levels[S.level]}, 이제 군 밖에서도 당신을 주목한다`;if(S.v9.office)return `${S.v9.office.title}, 권력의 중심에서 선택할 시간`;if(!S.career)return '첫 직업이 인생의 권력 지도를 만든다';if(v9Unread()>0)return '중요한 제안이 도착했다';return `${careerName()}, 다음 한 주가 커리어를 바꾼다`}
function v9HomeText(){if(S.career==='military'&&S.level>=7)return `현재 보직은 ${S.v9.military.post}. 장성 인사부터 대통령실·정당의 러브콜까지 커리어의 선택지가 넓어졌습니다.`;if(v9Unread()>0)return '인박스에는 자동으로 처리되지 않는 중요한 결정만 들어옵니다. 나머지 세계는 주간 진행과 함께 스스로 움직입니다.';return '반복 클릭 대신 이번 주의 전략 하나를 고르세요. 뉴스, 시장, 정치, 커리어 사건이 자동으로 이어집니다.'}
function v9InboxRow(i){return `<button class="v9-inbox-row ${i.read?'':'unread'} ${i.priority}" data-mail="${i.id}"><span>${i.priority==='urgent'?'●':'○'}</span><div><b>${i.title}</b><small>${i.from} · ${i.date}</small></div><em>→</em></button>`}
function v9HeadlineRow(h){return `<div class="v9-headline ${h.tone}"><span>${h.cat}</span><b>${h.title}</b><time>${h.date.slice(5).replace('-','.')}</time></div>`}
function v9PulseRows(){return `<div class="v9-pulse"><div><span>경제</span><b>${Math.round(S.nation.economy)}</b><i><em style="width:${S.nation.economy}%"></em></i></div><div><span>국가 안정</span><b>${Math.round(S.nation.stability)}</b><i><em style="width:${S.nation.stability}%"></em></i></div><div><span>민심</span><b>${Math.round(S.nation.mood)}</b><i><em style="width:${S.nation.mood}%"></em></i></div><div><span>국제 긴장</span><b>${Math.round(S.v6?.world?.globalTension||0)}</b><i><em class="danger" style="width:${S.v6?.world?.globalTension||0}%"></em></i></div></div>`}

function v9InboxPage(){const active=S.v9.inbox.filter(i=>!i.resolved),done=S.v9.inbox.filter(i=>i.resolved).slice(0,12);return `<div class="v9-page"><div class="v9-page-title"><div><span>COMMAND INBOX</span><h1>중요한 결정만 모아서 처리</h1><p>승진 인사, 대통령실 제안, 정당 영입, 국가위기처럼 자동으로 넘기면 안 되는 일만 들어옵니다.</p></div><div class="v9-big-num">${active.length}<small>OPEN</small></div></div><div class="v9-two-col"><section class="v9-card"><div class="v9-section-head"><div><span>OPEN</span><b>결정 대기</b></div></div><div class="v9-mail-list">${active.length?active.map(v9InboxRow).join(''):'<div class="v9-empty">모든 결정을 처리했습니다.</div>'}</div></section><section class="v9-card"><div class="v9-section-head"><div><span>ARCHIVE</span><b>처리 완료</b></div></div><div class="v9-mail-list archive">${done.map(v9InboxRow).join('')||'<div class="v9-empty">기록이 없습니다.</div>'}</div></section></div></div>`}

function v9CareerPage(){if(!S.career)return `<div class="v9-page"><div class="v9-page-title"><div><span>CAREER</span><h1>아직 직업이 없습니다</h1><p>직업은 단순 월급이 아니라 사건, 인간관계, 정치권 영입 조건을 결정합니다.</p></div><button id="v9OpenCareer">직업 선택</button></div></div>`;
  const c=careers[S.career],need=S.career==='military'&&S.level>=6?130+S.level*34:100+S.level*28,pct=clamp(S.xp/need*100);return `<div class="v9-page"><div class="v9-page-title"><div><span>CAREER COMMAND</span><h1>${v9CareerRank()}</h1><p>경력점수 ${Math.round(S.xp)} / ${need} · 명성 ${Math.round(S.stats.reputation)} · 커리어 프레스티지 ${Math.round(v9CareerPrestige())}</p></div><button id="v9CareerEvent">직업 이벤트</button></div>
  ${S.career==='military'?v9MilitaryCareerPanel():v9GenericCareerPanel(c,pct)}
  <div class="v9-two-col"><section class="v9-card v9-chart-card"><div class="v9-section-head"><div><span>REPUTATION</span><b>평판 추세</b></div><em>${Math.round(S.stats.reputation)}</em></div>${v9Spark('rep')}</section><section class="v9-card"><div class="v9-section-head"><div><span>POLITICAL DOOR</span><b>정치권 진입 가능성</b></div></div>${v9PoliticalDoor()}</section></div></div>`}
function v9GenericCareerPanel(c,pct){return `<section class="v9-card"><div class="v9-section-head"><div><span>CAREER LADDER</span><b>${c.name} 승진 트랙</b></div><em>${Math.round(pct)}%</em></div><div class="v9-rank-track">${c.levels.map((x,i)=>`<div class="${i<S.level?'done':i===S.level?'current':''}"><span>${i+1}</span><b>${x}</b><small>${i===S.level?'현재':i<S.level?'완료':'목표'}</small></div>`).join('')}</div></section>`}
function v9MilitaryCareerPanel(){const score=v9MilitaryScore(),need=130+S.level*34;return `<section class="v9-card military-command"><div class="military-hero"><div><span>대한민국 육군 · GAME CAREER</span><h2>${v9Stars()} ${careers.military.levels[S.level]} ${S.name}</h2><p>${S.v9.military.post} · 지휘신뢰 ${Math.round(S.v9.military.commandTrust)} · 장군 진급평가 ${Math.round(score)}</p></div><div class="military-stars">${v9Stars()||'◇'}</div></div><div class="v9-rank-track military">${careers.military.levels.map((x,i)=>`<div class="${i<S.level?'done':i===S.level?'current':''} ${i>=7?'general':''}"><span>${i>=7?'★'.repeat(i-6):i+1}</span><b>${x}</b><small>${i===S.level?'현재 계급':i<S.level?'진급 완료':i>=7?'장성':'목표'}</small></div>`).join('')}</div><div class="military-kpis"><div><span>진급점수</span><b>${Math.round(S.xp)} / ${S.level>=6?need:100+S.level*28}</b></div><div><span>군 영향력</span><b>${Math.round(S.inf.military)}</b></div><div><span>리더십</span><b>${Math.round(S.stats.lead)}</b></div><div><span>정치력</span><b>${Math.round(S.stats.pol)}</b></div></div></section>`}
function v9PoliticalDoor(){const rep=S.stats.reputation,prest=v9CareerPrestige();let txt='아직 정치권이 먼저 연락할 정도의 단계는 아닙니다.';if(S.career==='military'&&S.level>=7)txt='장성급부터 야당 인재영입, 대통령실 자문 제안이 열립니다.';if(S.career==='military'&&S.level>=9)txt='중장 이상은 국방부 장관·국가안보실장 후보군에 들어갑니다.';if(prest>=65)txt='현재 전문성과 평판이면 장관급 인선 제안이 들어올 수 있습니다.';return `<div class="v9-door"><div><span>프레스티지</span><b>${Math.round(prest)}</b></div><div><span>평판</span><b>${Math.round(rep)}</b></div><p>${txt}</p><button data-v9view="inbox">영입 제안 확인</button></div>`}

function v9MarketPage(){ensureV4();const assets=Object.entries(MARKET).slice(0,10),mv=marketValue();return `<div class="v9-page"><div class="v9-page-title"><div><span>CAPITAL MARKET</span><h1>${S.v4.market.regime} · 투자자산 ${v9Money(mv)}</h1><p>${S.v4.market.news}</p></div><button id="v9LegacyMarket">거래 실행</button></div><div class="v9-market-board">${assets.map(([k,a])=>{const st=S.v4.market.assets[k],h=S.v4.holdings[k]||{qty:0,avg:0};return `<button data-stock="${k}"><span>${a.icon} ${a.name}</span><b>${KRW(st.price)}</b><em class="${st.chg>=0?'up':'down'}">${st.chg>=0?'+':''}${st.chg.toFixed(1)}%</em><small>보유 ${v9Money(h.qty*st.price)}</small></button>`}).join('')}</div><div class="v9-two-col"><section class="v9-card v9-chart-card"><div class="v9-section-head"><div><span>MARKET SENTIMENT</span><b>시장 심리 추세</b></div><em>${Math.round(S.v4.market.sentiment)}</em></div>${v9Spark('market')}</section><section class="v9-card"><div class="v9-section-head"><div><span>RULES</span><b>현실경제 난이도</b></div></div><div class="v9-rule-list"><p>매수 수수료 0.20%</p><p>매도 수수료 0.25%</p><p>실현이익 게임세금 15%</p><p>공매도는 증거금과 대차비용 발생</p></div></section></div></div>`}
function v9BusinessPage(){ensureV5();const c=S.v5.company;if(!c.exists)return `<div class="v9-page"><div class="v9-page-title"><div><span>BUSINESS EMPIRE</span><h1>아직 소유 기업이 없습니다</h1><p>창업부터 투자유치·직원·IPO·M&A까지 관리할 수 있습니다.</p></div><button id="v9LegacyBusiness">사업 시작</button></div></div>`;return `<div class="v9-page"><div class="v9-page-title"><div><span>${c.stage}</span><h1>${c.name}</h1><p>창업자 지분 ${c.founderOwnership.toFixed(1)}% · ${c.listed?'상장기업':'비상장'} · 기업가치 ${v9Money(companyValuation())}</p></div><button id="v9LegacyBusiness">경영 의사결정</button></div><div class="v9-kpi-grid">${[['월 매출',v9Money(c.revenue)],['영업손익',v9Money(c.profit)],['회사현금',v9Money(c.cash)],['직원',c.employees+'명'],['브랜드',Math.round(c.brand)],['제품력',Math.round(c.product)],['조직사기',Math.round(c.morale)],['기업부채',v9Money(c.debt)]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><div class="v9-two-col"><section class="v9-card"><div class="v9-section-head"><div><span>FOUNDER</span><b>내 지분 가치</b></div><em>${v9Money(founderEquityValue())}</em></div><div class="v9-big-stat">${c.founderOwnership.toFixed(1)}<small>% OWNERSHIP</small></div></section><section class="v9-card"><div class="v9-section-head"><div><span>GROWTH</span><b>최근 성장률</b></div></div><div class="v9-big-stat ${c.lastGrowth>=0?'up':'down'}">${c.lastGrowth>=0?'+':''}${c.lastGrowth.toFixed(1)}<small>% MoM</small></div></section></div></div>`}
function v9PoliticsPage(){const party=S.faction.party||'무소속/비정치';return `<div class="v9-page"><div class="v9-page-title"><div><span>POLITICAL COMMAND</span><h1>${S.v9.office?.title||party}</h1><p>현직 대통령 ${S.nation.currentPresident} · 정치영향력 ${Math.round(S.inf.political)} · 민심 ${Math.round(S.nation.mood)}</p></div><button id="v9LegacyPolitics">정치 시스템 열기</button></div><div class="v9-two-col"><section class="v9-card v9-chart-card"><div class="v9-section-head"><div><span>PUBLIC MOOD</span><b>지지·민심 추세</b></div><em>${Math.round(S.nation.mood)}</em></div>${v9Spark('approval')}</section><section class="v9-card"><div class="v9-section-head"><div><span>POWER NETWORK</span><b>핵심 권력 연결</b></div></div>${v9PowerGraph()}</section></div><section class="v9-card"><div class="v9-section-head"><div><span>ENTRY ROUTES</span><b>정치권으로 들어가는 방법</b></div></div><div class="v9-route-grid"><div><b>선거</b><span>공천 → 유세 → TV토론 → 개표</span></div><div><b>장관</b><span>전문직·장성 커리어에서 대통령실 영입</span></div><div><b>야당 영입</b><span>높은 평판과 상징성을 정당이 활용</span></div><div><b>킹메이커</b><span>직접 출마하지 않고 후보와 계파에 영향</span></div></div></section></div>`}
function v9PowerGraph(){const rows=v8PowerRows().slice(0,6),cx=160,cy=105;return `<svg class="v9-power-graph" viewBox="0 0 320 210">${rows.map((x,i)=>{const a=(i/rows.length)*Math.PI*2-Math.PI/2,px=cx+Math.cos(a)*105,py=cy+Math.sin(a)*70;return `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}"/><g transform="translate(${px},${py})"><circle r="22"/><text y="-2">${i+1}</text><text class="name" y="34">${x.name.slice(0,8)}</text></g>`}).join('')}<g class="me" transform="translate(${cx},${cy})"><circle r="30"/><text y="4">YOU</text><text class="name" y="45">${S.name}</text></g></svg>`}
function v9PowerPage(){const rows=v8PowerRows();return `<div class="v9-page"><div class="v9-page-title"><div><span>POWER BOARD</span><h1>누가 실제로 판을 움직이는가</h1><p>공식 순위가 아니라 게임 내 직책·조직·돈·군·정치·언론 영향력을 단순화한 지수입니다.</p></div><button id="v9LegacyPower">상세 권력판</button></div><div class="v9-two-col"><section class="v9-card"><div class="v9-power-ranking">${rows.map((x,i)=>`<div class="${x.name===S.name?'me':''}"><strong>${i+1}</strong><span><b>${x.name}</b><small>${x.role} · ${x.institution||''}</small></span><em>${x.score}</em></div>`).join('')}</div></section><section class="v9-card">${v9PowerGraph()}</section></div></div>`}
function v9SimplePage(type){const cfg={world:['🌐','WORLD ORDER','국제정치·정상회담·경제제재·안보위기','openWorldOrder'],intel:['🕶️','INTELLIGENCE','정보력·방첩·산업보안·블랙데스크','openIntelHub']}[type];return `<div class="v9-page"><div class="v9-page-title"><div><span>${cfg[1]}</span><h1>${cfg[0]} ${cfg[2]}</h1><p>상세 의사결정은 기존 심화 시스템으로 연결됩니다.</p></div><button id="v9SimpleOpen" data-simple="${type}">심화 화면 열기</button></div>${type==='world'?v9PulseRows():`<div class="v9-kpi-grid"><div><span>정보력</span><b>${typeof intelPower==='function'?intelPower():0}</b></div><div><span>정치 영향</span><b>${Math.round(S.inf.political)}</b></div><div><span>노출도</span><b>${Math.round(S.v7?.intel?.exposure||0)}</b></div><div><span>조직신뢰</span><b>${Math.round(S.v7?.intel?.trust||0)}</b></div></div>`}</div>`}

function v9Render(){
  ensureV9();const root=$('#v8root');if(!root)return;const unread=v9Unread(),flow=monthlyIncome();root.innerHTML=`<div class="v9-shell"><aside class="v9-rail"><div class="v9-brand"><div>LR</div><span><b>LIFE : RISE</b><small>COMMAND CENTER · V0.9.2</small></span></div><nav>${v9RailButton('home','⌂','대시보드')}${v9RailButton('inbox','✉','인박스',unread?unread:'')}${v9RailButton('career','🎖','커리어')}${v9RailButton('market','📈','투자시장')}${v9RailButton('business','🏢','사업경영')}<hr>${v9RailButton('politics','🏛','정치·국가')}${v9RailButton('power','⚡','권력관계')}${v9RailButton('world','🌐','외교·세계')}${v9RailButton('intel','🕶','정보국')}</nav><div class="v9-player"><div class="v9-id">${v8Initials()}</div><div><b>${S.name}</b><span>${v9CareerRank()}</span></div><em>POWER ${Math.round(power())}</em></div></aside><main class="v9-main"><header class="v9-top"><div><b>${S.date.replaceAll('-','.')} · ${age()}세</b><span>${v9CareerRank()}</span></div><div class="v9-top-kpi"><span>순자산 <b>${v9Money(networth())}</b></span><span>월흐름 <b class="${flow.net>=0?'up':'down'}">${v9Money(flow.net)}</b></span><span>평판 <b>${Math.round(S.stats.reputation)}</b></span></div><div class="v9-top-btns"><button id="v9Save">저장</button><button id="v9Month">+1개월</button><button id="v9Week" class="hot">다음 주 ▶</button></div></header>${v9HeadlineTicker()}<div class="v9-content">${v9Page()}</div></main></div>`;v9Bind()
}
function v9Page(){return {home:v9HomePage,inbox:v9InboxPage,career:v9CareerPage,market:v9MarketPage,business:v9BusinessPage,politics:v9PoliticsPage,power:v9PowerPage,world:()=>v9SimplePage('world'),intel:()=>v9SimplePage('intel')}[S.v9.view]?.()||v9HomePage()}
function v9SetView(v){ensureV9();S.v9.view=v;save();v9Render()}
function v9Bind(){
  $$('[data-v9view]').forEach(b=>b.onclick=()=>v9SetView(b.dataset.v9view));$$('[data-mail]').forEach(b=>b.onclick=()=>v9OpenInboxItem(Number(b.dataset.mail)));$$('[data-focus]').forEach(b=>b.onclick=()=>v8RunFocus(b.dataset.focus));
  $('#v9Save')&&($('#v9Save').onclick=()=>{save();toast('저장했습니다.')});$('#v9Week')&&($('#v9Week').onclick=()=>v8NextWeek());$('#v9Month')&&($('#v9Month').onclick=()=>v8RunMonth());$('#v9RefreshNews')&&($('#v9RefreshNews').onclick=()=>{v9GenerateNews();save();v9Render()});
  $('#v9OpenCareer')&&($('#v9OpenCareer').onclick=openCareerCenter);$('#v9CareerEvent')&&($('#v9CareerEvent').onclick=()=>maybeEvent(true));$('#v9LegacyMarket')&&($('#v9LegacyMarket').onclick=openMarket);$('#v9LegacyBusiness')&&($('#v9LegacyBusiness').onclick=openBusinessHQ);$('#v9LegacyPolitics')&&($('#v9LegacyPolitics').onclick=()=>typeof openPowerTransition==='function'?openPowerTransition():showPolitics());$('#v9LegacyPower')&&($('#v9LegacyPower').onclick=openPowerBoard);
  $$('[data-stock]').forEach(b=>b.onclick=()=>typeof openStockDetail==='function'?openStockDetail(b.dataset.stock):openTrade(b.dataset.stock));$('#v9SimpleOpen')&&($('#v9SimpleOpen').onclick=e=>e.currentTarget.dataset.simple==='world'?openWorldOrder():openIntelHub());
}

const v9BaseUpdateAll=updateAll;updateAll=function(){v9BaseUpdateAll();ensureV9();v9Render()};
const v9BaseStartBackground=startBackground;startBackground=function(bg){v9BaseStartBackground(bg);delete S.v9;ensureV9();v9AddHeadline('LIFE',`${S.name}의 새 인생이 시작됐습니다.`,'good',false);v9RecordHistory(true);save();v9Render()};
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(!$('#modal')?.classList.contains('hidden'))return;if(!$('#startScreen')?.classList.contains('hidden'))return;if(e.key.toLowerCase()==='i'){e.preventDefault();v9SetView('inbox')}if(e.key.toLowerCase()==='n'){e.preventDefault();v9GenerateNews();v9Render()}});
setTimeout(()=>{ensureV9();v9CheckEliteOffers();v9MaybeMilitaryPosting();v9UpdateSocial();v9RecordHistory(false);v9Render();const b=document.querySelector('.brand span');if(b)b.textContent='Visual Life & Power Sandbox · V0.9';},120);
