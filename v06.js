/* LIFE : RISE V0.6 — Parliament 300, World Order & Political Drama */
const V6={version:'0.6',pageSize:24};

const V6_PARTIES=[
 {name:'미래개혁당',short:'미래',color:'#63d8b3',ideology:-18,base:124},
 {name:'국민보수연합',short:'국민',color:'#6c91ff',ideology:35,base:108},
 {name:'중도시민당',short:'중도',color:'#e5ba65',ideology:4,base:42},
 {name:'녹색사회당',short:'녹색',color:'#7dcf75',ideology:-48,base:26}
];
const V6_SURNAMES=['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','전','홍'];
const V6_GIVEN1=['도','서','민','지','현','준','유','하','성','태','재','수','은','시','예','우','건','다','채','승'];
const V6_GIVEN2=['윤','진','호','민','우','현','영','준','연','빈','원','경','석','림','하','훈','아','진','혁','희'];
const V6_COMMITTEES=['기획재정','국방','외교통일','법제사법','산업통상','보건복지','국토교통','정무','행정안전','과학기술','문화체육'];
const V6_REGIONS=['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];

const V6_LAWS=[
 {id:'growth',name:'첨단산업 성장법',icon:'🧠',ideology:6,cost:1800000000000,econ:6,mood:1,business:5,integrity:0,military:0,desc:'첨단산업 투자와 연구개발 지원을 확대합니다.'},
 {id:'housing',name:'주거안정 패키지',icon:'🏠',ideology:-24,cost:2600000000000,econ:1,mood:7,business:-1,integrity:0,military:0,desc:'공급·주거비 지원을 확대해 민심을 안정시킵니다.'},
 {id:'welfare',name:'사회안전망 확대법',icon:'🤝',ideology:-42,cost:3200000000000,econ:-1,mood:9,business:-2,integrity:0,military:0,desc:'복지 지출을 크게 늘리는 대신 재정 부담이 커집니다.'},
 {id:'taxcut',name:'기업세 부담완화법',icon:'🏢',ideology:38,cost:1400000000000,econ:5,mood:-2,business:7,integrity:0,military:0,desc:'기업 투자 여건을 개선하지만 세수 감소와 형평성 논쟁이 생깁니다.'},
 {id:'defense',name:'국방혁신 특별법',icon:'🛡️',ideology:24,cost:2900000000000,econ:0,mood:-1,business:1,integrity:0,military:8,desc:'국방 역량을 높이지만 큰 예산이 필요합니다.'},
 {id:'clean',name:'고위공직 투명성법',icon:'🔎',ideology:-4,cost:220000000000,econ:0,mood:5,business:-1,integrity:10,military:0,desc:'고위공직 검증과 공개를 강화합니다.'},
 {id:'media',name:'미디어 경쟁법',icon:'📺',ideology:3,cost:350000000000,econ:1,mood:0,business:2,integrity:2,military:0,desc:'미디어 시장 경쟁과 소유 투명성을 손봅니다.'},
 {id:'climate',name:'에너지전환 투자법',icon:'🌱',ideology:-30,cost:2300000000000,econ:2,mood:4,business:0,integrity:0,military:0,desc:'에너지 전환과 신산업 투자를 동시에 추진합니다.'}
];

const V6_COUNTRIES={
 usa:{name:'미국',icon:'🇺🇸',rel:64,trade:78,tension:18,trust:66,power:92,alliance:78,sanctions:0},
 china:{name:'중국',icon:'🇨🇳',rel:30,trade:82,tension:37,trust:35,power:88,alliance:8,sanctions:0},
 japan:{name:'일본',icon:'🇯🇵',rel:45,trade:65,tension:27,trust:48,power:71,alliance:44,sanctions:0},
 north:{name:'북한',icon:'🇰🇵',rel:-72,trade:2,tension:75,trust:8,power:57,alliance:0,sanctions:82},
 eu:{name:'유럽연합',icon:'🇪🇺',rel:55,trade:62,tension:12,trust:61,power:80,alliance:31,sanctions:0},
 russia:{name:'러시아',icon:'🇷🇺',rel:5,trade:18,tension:46,trust:18,power:77,alliance:3,sanctions:28}
};

const V6_CRISIS_POOL=[
 {id:'missile',title:'미사일 긴장 고조',icon:'🚨',country:'north',severity:68,text:'북한 관련 군사 긴장이 빠르게 높아졌습니다. 금융시장과 민심이 동시에 흔들립니다.'},
 {id:'trade_china',title:'대중 무역분쟁',icon:'📦',country:'china',severity:48,text:'핵심 산업의 통상 마찰이 커지며 수출기업이 압박을 받고 있습니다.'},
 {id:'japan_friction',title:'한일 외교 마찰',icon:'🌊',country:'japan',severity:38,text:'외교 현안을 둘러싼 갈등이 커지며 양국 여론이 악화되고 있습니다.'},
 {id:'energy',title:'글로벌 에너지 쇼크',icon:'⛽',country:'russia',severity:52,text:'에너지 가격이 급등하며 물가와 기업 비용이 동시에 올라가고 있습니다.'},
 {id:'alliance',title:'동맹 비용 논쟁',icon:'🤝',country:'usa',severity:42,text:'안보 협력과 비용 분담을 둘러싼 국내외 논쟁이 커졌습니다.'},
 {id:'global_recession',title:'글로벌 경기침체',icon:'📉',country:'eu',severity:55,text:'주요국 경기 둔화가 확산되면서 수출과 투자심리가 약화되고 있습니다.'}
];

function v6SeedName(i){return V6_SURNAMES[i%V6_SURNAMES.length]+V6_GIVEN1[(i*7+3)%V6_GIVEN1.length]+V6_GIVEN2[(i*11+5)%V6_GIVEN2.length]}
function v6Hash(i,salt=0){let x=(i+1)*1103515245+(salt+17)*12345; x=(x>>>0)%2147483647; return x/2147483647}
function v6PartyBySeat(i){let n=i;for(const p of V6_PARTIES){if(n<p.base)return p;n-=p.base}return V6_PARTIES[0]}
function generateMPs(){
 const mps=[];
 for(let i=0;i<300;i++){
  const p=v6PartyBySeat(i),ideo=clamp(Math.round(p.ideology+(v6Hash(i,1)-.5)*52),-100,100);
  mps.push({id:'MP'+String(i+1).padStart(3,'0'),name:v6SeedName(i),party:p.name,partyShort:p.short,ideology:ideo,
   loyalty:Math.round(45+v6Hash(i,2)*50),ambition:Math.round(25+v6Hash(i,3)*70),integrity:Math.round(30+v6Hash(i,4)*68),
   influence:Math.round(20+v6Hash(i,5)*75),relation:Math.round(-8+v6Hash(i,6)*24),committee:V6_COMMITTEES[i%V6_COMMITTEES.length],
   district:V6_REGIONS[i%V6_REGIONS.length]+' '+(1+(i%18))+'선거구',term:1+(i%5),scandal:Math.round(v6Hash(i,7)*35),rebel:false});
 }
 return mps;
}
function ensureV6(){
 ensureV5(); S.version=6; S.v6=S.v6||{};
 S.v6.parliament=S.v6.parliament||{mps:generateMPs(),activeBill:null,lastVote:null,session:1,governmentParty:'미래개혁당',speaker:'김도현',whip:45};
 if(!Array.isArray(S.v6.parliament.mps)||S.v6.parliament.mps.length!==300)S.v6.parliament.mps=generateMPs();
 S.v6.world=S.v6.world||{countries:JSON.parse(JSON.stringify(V6_COUNTRIES)),globalTension:34,tradeClimate:57,energyPrice:48,activeCrisis:null,conflict:null,prestige:32,unInfluence:28,lastSummit:null,month:0};
 S.v6.drama=S.v6.drama||{activeScandal:null,innerCircle:18,security:45,mediaCycle:50,rival:'서민혁',rivalPop:38,rivalPower:31,legacy:0,secrets:0,favors:0,threat:8,achievements:[]};
 S.v6.flags=S.v6.flags||{};S.v6.months=S.v6.months||0;S.v6.lastLaw=S.v6.lastLaw||null;
 syncPlayerPartyMPs();
}
ensureV6();

function syncPlayerPartyMPs(){
 const p=S.v6?.parliament;if(!p||!S.faction?.party||!S.faction.partySeats)return;
 const target=clamp(Math.round(S.faction.partySeats),0,250),mps=p.mps,party=S.faction.party;
 let own=mps.filter(m=>m.party===party);
 if(own.length<target){
  const candidates=mps.filter(m=>m.party!==party).sort((a,b)=>a.loyalty-b.loyalty||a.relation-b.relation);
  candidates.slice(0,target-own.length).forEach(m=>{m.party=party;m.partyShort='PLAYER';m.loyalty=clamp(m.loyalty-12);m.relation=clamp(m.relation+8,-100,100)});
 } else if(own.length>target){
  own.sort((a,b)=>a.loyalty-b.loyalty).slice(0,own.length-target).forEach((m,i)=>{const q=V6_PARTIES[(i+1)%V6_PARTIES.length];m.party=q.name;m.partyShort=q.short;m.loyalty=55});
 }
 if(S.nation.currentPresident===S.name)p.governmentParty=party;
}
function partyCounts(){const out={};S.v6.parliament.mps.forEach(m=>out[m.party]=(out[m.party]||0)+1);return out}
function partyColor(name){return V6_PARTIES.find(p=>p.name===name)?.color||(name===S.faction.party?'#f092c4':'#9aa8bc')}
function mp(id){return S.v6.parliament.mps.find(x=>x.id===id)}
function playerPoliticalAccess(){return S.career==='politics'||S.nation.currentPresident===S.name||S.inf.political>=30||S.faction.party}

function injectV6UI(){
 const top=$('.top-actions');
 if(top&&!$('#assemblyBtn'))top.insertAdjacentHTML('afterbegin','<button id="assemblyBtn" class="v6-btn">🏛 국회300</button><button id="worldBtn" class="v6-btn">🌐 세계</button><button id="dramaBtn" class="v6-btn">🎭 드라마</button>');
 $('#assemblyBtn')&&($('#assemblyBtn').onclick=openParliament300);$('#worldBtn')&&($('#worldBtn').onclick=openWorldOrder);$('#dramaBtn')&&($('#dramaBtn').onclick=openDramaHub);
 const badge=$('#v05Badge');if(badge){badge.id='v06Badge';badge.innerHTML='<b>V0.6 · LIVING POWER</b><span>300 의원 NPC · 법안 표결 · 국제정치 · 제재/동맹/위기 · 정치 드라마</span>'}
 const brand=document.querySelector('.brand span');if(brand)brand.textContent='Visual Life & Power Sandbox · V0.6';
}
injectV6UI();

/* ---------- 300-MEMBER PARLIAMENT ---------- */
function parliamentSupportText(){const c=partyCounts();return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`${n} ${v}`).join(' · ')}
function openParliament300(){
 ensureV6();syncPlayerPartyMPs();const p=S.v6.parliament,c=partyCounts();
 const parties=Object.entries(c).sort((a,b)=>b[1]-a[1]);
 const bars=parties.map(([n,v])=>`<div class="partySeat"><div><span class="partyDot" style="background:${partyColor(n)}"></span><b>${n}</b><em>${v}석</em></div><i><u style="width:${v/3}%;background:${partyColor(n)}"></u></i></div>`).join('');
 const swings=p.mps.slice().sort((a,b)=>(b.influence+Math.abs(b.relation-10))-(a.influence+Math.abs(a.relation-10))).slice(0,6);
 const body=`<div class="parliamentHero"><div><span>제${p.session}회 시뮬레이션 국회</span><b>300명의 의원이 각각 판단합니다</b><small>${parliamentSupportText()}</small></div><strong>${p.activeBill?'표결대기':'본회의'}</strong></div>
 <div class="seatBars">${bars}</div>
 <div class="swingBox"><b>주목할 의원</b>${swings.map(m=>`<span>${m.name} · ${m.party} · 영향력 ${m.influence} · 관계 ${m.relation}</span>`).join('')}</div>
 ${p.lastVote?`<div class="lastVote"><span>최근 표결</span><b>${p.lastVote.name} · 찬성 ${p.lastVote.yes} / 반대 ${p.lastVote.no} / 기권 ${p.lastVote.abstain}</b></div>`:''}`;
 const acts=[['의원 명부','300명 전체를 페이지로 확인',()=>openMPRoster(0)],['법안 발의','경제·복지·국방·청렴 등',openBillDesk],['원내 전략','당론·설득·연정 관리',openWhipRoom],['탄핵 표 계산','300명 실제 성향 기반',openImpeachment],['정치 드라마','라이벌·스캔들·비공식 참모',openDramaHub]];
 modal('🏛️','300인 국회','이제 의석 숫자만 굴리는 게 아니라 의원마다 정당·성향·충성도·야심·청렴도·플레이어와의 관계가 있습니다.',acts,body)
}
function openMPRoster(page=0){
 ensureV6();const mps=S.v6.parliament.mps, pages=Math.ceil(mps.length/V6.pageSize);page=clamp(page,0,pages-1);
 const rows=mps.slice(page*V6.pageSize,(page+1)*V6.pageSize).map(m=>`<button class="mpRow" data-mp="${m.id}"><span class="mpInitial">${m.name[0]}</span><div><b>${m.name}</b><small>${m.party} · ${m.district} · ${m.committee}</small></div><em>영향 ${m.influence}<br>관계 ${m.relation}</em></button>`).join('');
 const body=`<div class="rosterTop"><b>국회의원 300명</b><span>${page+1}/${pages} 페이지</span></div><div class="mpRoster">${rows}</div>`;
 const acts=[];if(page>0)acts.push(['← 이전','이전 24명',()=>openMPRoster(page-1)]);if(page<pages-1)acts.push(['다음 →','다음 24명',()=>openMPRoster(page+1)]);acts.push(['국회 홈','의석 현황',openParliament300]);
 modal('👥','의원 명부',`각 의원은 별도의 성향과 관계값을 가집니다. 설득한 의원은 실제 표결 확률이 달라집니다.`,acts,body);
 $$('.mpRow').forEach(b=>b.onclick=()=>openMPProfile(b.dataset.mp,page));
}
function openMPProfile(id,page=0){
 const m=mp(id);if(!m)return;const ideology=m.ideology<-25?'진보':m.ideology>25?'보수':'중도';
 const body=`<div class="mpProfile"><div class="mpPortrait">${m.name[0]}</div><div><b>${m.name}</b><span>${m.party} · ${m.district}</span><small>${m.term}선 · ${m.committee}위원회</small></div></div>
 <div class="mpStats"><div><span>성향</span><b>${ideology} ${m.ideology}</b></div><div><span>당 충성</span><b>${m.loyalty}</b></div><div><span>야심</span><b>${m.ambition}</b></div><div><span>청렴</span><b>${m.integrity}</b></div><div><span>영향력</span><b>${m.influence}</b></div><div><span>나와 관계</span><b>${m.relation}</b></div></div>`;
 const acts=[['정책 면담','3일 · 관계/정책 이해 상승',()=>meetMP(id,page)],['법안 설득','정치력 판정 · 다음 표결 영향',()=>persuadeMP(id,page)],['공개 공동행보','평판을 걸고 관계 강화',()=>publicAllianceMP(id,page)],['명부로','이전 페이지',()=>openMPRoster(page)]];
 modal('🧑‍⚖️','의원 프로필','개별 의원을 설득하면 법안과 탄핵 표결에서 실제로 반영됩니다.',acts,body)
}
function meetMP(id,page){const m=mp(id);if(!spend(450000))return;const gain=rnd(3,8)+(S.stats.cha>55?2:0);m.relation=clamp(m.relation+gain,-100,100);S.stats.net=clamp(S.stats.net+1);advance(3,`${m.name} 의원과 정책 면담을 진행했습니다.`);openMPProfile(id,page)}
function persuadeMP(id,page){const m=mp(id),ok=Math.random()*100<clamp(28+S.stats.pol*.45+S.stats.cha*.25+S.stats.net*.15+m.relation*.25-m.loyalty*.12,12,92);m.relation=clamp(m.relation+(ok?rnd(6,13):rnd(-5,2)),-100,100);m.rebel=ok&&Math.random()<.55;S.stats.stress=clamp(S.stats.stress+2);advance(4,ok?`${m.name} 의원이 당신의 핵심 법안에 협조하기로 했습니다.`:`${m.name} 의원 설득이 잘 풀리지 않았습니다.`);openMPProfile(id,page)}
function publicAllianceMP(id,page){const m=mp(id);if(S.stats.reputation<20)return toast('평판 20 이상이 필요합니다.');m.relation=clamp(m.relation+8);S.stats.reputation=clamp(S.stats.reputation+(m.integrity>55?2:-1));S.v6.drama.mediaCycle=clamp(S.v6.drama.mediaCycle+4);advance(2,`${m.name} 의원과 공개 정책행보를 함께했습니다.`);openMPProfile(id,page)}

function openBillDesk(){
 const body=`<div class="billGrid">${V6_LAWS.map(b=>`<button class="billCard" data-bill="${b.id}"><span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small><em>재정 ${KRW(b.cost)}</em></button>`).join('')}</div>`;
 modal('📜','법안 발의실',playerPoliticalAccess()?'어떤 정책을 밀 것인지 선택하세요. 의원 300명이 성향·당론·관계에 따라 각자 투표합니다.':'정치적 영향력이 부족합니다. 법안을 관찰할 수 있지만 직접 발의하려면 정치 경력이나 영향력이 필요합니다.',[['국회 홈','돌아가기',openParliament300]],body);$$('.billCard').forEach(x=>x.onclick=()=>previewBill(x.dataset.bill))
}
function billById(id){return V6_LAWS.find(x=>x.id===id)}
function mpVoteScore(m,b){
 const govt=S.v6.parliament.governmentParty, playerParty=S.faction.party;
 let score=48-Math.abs(m.ideology-b.ideology)*.32;
 if(m.party===govt)score+=7;if(playerParty&&m.party===playerParty)score+=16;
 score+=m.relation*.22+(m.rebel?8:0)+(m.integrity>70&&b.id==='clean'?10:0);
 score+=(S.stats.pol-40)*.12+(S.inf.political-30)*.08;
 if(b.id==='welfare'&&S.nation.mood<42)score+=8;if(b.id==='growth'&&S.nation.economy<45)score+=8;
 return clamp(score,3,97)
}
function estimateBill(id){const b=billById(id);let yes=0,no=0,abs=0;S.v6.parliament.mps.forEach(m=>{const sc=mpVoteScore(m,b);if(sc>=57)yes++;else if(sc<=42)no++;else abs++});return {yes,no,abs}}
function previewBill(id){const b=billById(id),e=estimateBill(id),can=playerPoliticalAccess();const body=`<div class="billPreview"><span>${b.icon}</span><div><b>${b.name}</b><small>${b.desc}</small></div></div><div class="voteForecast"><div><span>찬성 예상</span><b class="up">${e.yes}</b></div><div><span>반대 예상</span><b class="down">${e.no}</b></div><div><span>유동/기권</span><b>${e.abs}</b></div></div><div class="lawEffects">경제 ${b.econ>=0?'+':''}${b.econ} · 민심 ${b.mood>=0?'+':''}${b.mood} · 기업 ${b.business>=0?'+':''}${b.business} · 군 ${b.military>=0?'+':''}${b.military}</div>`;const acts=[];if(can)acts.push(['본회의 표결',`가결선 151 · 예상 찬성 ${e.yes}`,()=>voteBill(id)],['의원 설득 주간','7일 동안 유동 의원 집중 설득',()=>lobbyBill(id)]);acts.push(['다른 법안','목록으로',openBillDesk]);modal(b.icon,b.name,'표결 직전까지 개별 의원 설득과 정치 상황에 따라 결과가 변할 수 있습니다.',acts,body)}
function lobbyBill(id){const b=billById(id),swing=S.v6.parliament.mps.filter(m=>{const sc=mpVoteScore(m,b);return sc>38&&sc<62}).sort((a,b)=>b.influence-a.influence).slice(0,18);let wins=0;swing.forEach(m=>{const ok=Math.random()*100<clamp(35+S.stats.pol*.38+S.stats.cha*.22+m.relation*.2,15,88);if(ok){m.relation=clamp(m.relation+rnd(3,8));m.rebel=true;wins++}});S.stats.stress=clamp(S.stats.stress+5);advance(7,`법안 설득주간에서 유동 의원 ${wins}명의 협조를 끌어냈습니다.`);previewBill(id)}
function voteBill(id){
 const b=billById(id);let yes=0,no=0,abstain=0;
 S.v6.parliament.mps.forEach(m=>{const p=mpVoteScore(m,b);const roll=Math.random()*100;if(roll<p)yes++;else if(roll>p+26)abstain++;else no++;m.rebel=false});
 const passed=yes>=151;S.v6.parliament.lastVote={id,name:b.name,yes,no,abstain,passed,date:S.date};S.v6.lastLaw=b.name;
 if(passed){spendTreasury?.(b.cost);S.nation.economy=clamp(S.nation.economy+b.econ);S.nation.mood=clamp(S.nation.mood+b.mood);S.inf.business=clamp(S.inf.business+b.business);S.inf.military=clamp(S.inf.military+b.military);if(S.v3?.gov)S.v3.gov.integrity=clamp(S.v3.gov.integrity+b.integrity);S.stats.reputation=clamp(S.stats.reputation+3);log(`${b.name}이 국회에서 찬성 ${yes}표로 가결되었습니다.`)}else{S.stats.reputation=clamp(S.stats.reputation-1);log(`${b.name}이 찬성 ${yes}표로 부결되었습니다.`)}
 advance(3);modal(passed?'✅':'❌',passed?'법안 가결':'법안 부결',`${b.name}: 찬성 ${yes} · 반대 ${no} · 기권 ${abstain}`,[['국회로','다음 정치 행동',openParliament300]],`<div class="voteResult ${passed?'passed':'failed'}"><b>${passed?'151표를 넘어 가결':'151표에 미달'}</b><span>의원 300명의 개별 판정 결과입니다.</span></div>`)
}
function openWhipRoom(){const p=S.v6.parliament;const body=`<div class="whipGrid"><div><span>내 정치력</span><b>${Math.round(S.stats.pol)}</b></div><div><span>정치 영향력</span><b>${Math.round(S.inf.political)}</b></div><div><span>원내 장악</span><b>${Math.round(p.whip)}</b></div><div><span>내 정당</span><b>${S.faction.party||'없음'}</b></div></div>`;modal('♟️','원내 전략실','의원 전체를 한 번에 통제할 수는 없습니다. 당론을 강하게 밀수록 단기 표는 늘지만 반발도 생깁니다.',[['당론 결집','정치력 소모 · 소속 의원 충성 강화',partyWhip],['초당적 연정','중도 의원 관계 강화',crossPartyCoalition],['개별 의원 명부','직접 설득',()=>openMPRoster(0)],['국회 홈','돌아가기',openParliament300]],body)}
function partyWhip(){if(!S.faction.party)return toast('자신의 정당이 필요합니다.');S.v6.parliament.mps.filter(m=>m.party===S.faction.party).forEach(m=>{m.loyalty=clamp(m.loyalty+5);m.relation=clamp(m.relation+2)});S.v6.parliament.whip=clamp(S.v6.parliament.whip+7);S.stats.stress=clamp(S.stats.stress+4);advance(5,'당론을 정비해 소속 의원들의 결속을 높였습니다.');openWhipRoom()}
function crossPartyCoalition(){if(!spend(6000000))return;const mids=S.v6.parliament.mps.filter(m=>Math.abs(m.ideology)<30&&m.party!==S.faction.party).sort((a,b)=>b.influence-a.influence).slice(0,30);mids.forEach(m=>m.relation=clamp(m.relation+rnd(2,6)));S.v4.gov.coalition=clamp(S.v4.gov.coalition+5);advance(7,'초당적 정책협의회를 열어 중도 의원들과 관계를 넓혔습니다.');openWhipRoom()}

/* Make V0.5 impeachment estimate use individual MPs. */
const baseEffectiveCoalitionSeatsV6=effectiveCoalitionSeats;
effectiveCoalitionSeats=function(){ensureV6();const p=S.v5.power,approval=S.v3?.gov?.approval??50,presParty=S.v6.parliament.governmentParty;let support=0;S.v6.parliament.mps.forEach(m=>{let score=p.evidence*.48+(50-approval)*.28+m.relation*.17+(m.party===S.faction.party?13:0)-(m.party===presParty?m.loyalty*.18:0)+(m.integrity-50)*.13;if(score>=40)support++});return clamp(support,0,300)};

/* ---------- WORLD ORDER ---------- */
function worldCountry(k){return S.v6.world.countries[k]}
function relationClass(v){return v>=45?'ally':v<=-35?'hostile':'neutral'}
function openWorldOrder(){
 ensureV6();const w=S.v6.world;const cards=Object.entries(w.countries).map(([k,c])=>`<button class="countryCard ${relationClass(c.rel)}" data-country="${k}"><span>${c.icon}</span><div><b>${c.name}</b><small>관계 ${Math.round(c.rel)} · 무역 ${Math.round(c.trade)} · 긴장 ${Math.round(c.tension)}</small></div><em>${c.rel>=0?'+':''}${Math.round(c.rel)}</em></button>`).join('');
 const crisis=w.activeCrisis?`<div class="globalCrisis"><span>${w.activeCrisis.icon}</span><div><b>${w.activeCrisis.title}</b><small>${w.activeCrisis.text}</small></div><em>위기 ${w.activeCrisis.severity}</em></div>`:'<div class="globalCalm">현재 즉각적인 국제위기는 없습니다.</div>';
 const body=`<div class="worldKpis"><div><span>세계 긴장</span><b>${Math.round(w.globalTension)}</b></div><div><span>무역환경</span><b>${Math.round(w.tradeClimate)}</b></div><div><span>에너지</span><b>${Math.round(w.energyPrice)}</b></div><div><span>국제위상</span><b>${Math.round(w.prestige)}</b></div></div>${crisis}<div class="countryGrid">${cards}</div>`;
 const acts=[];if(w.activeCrisis)acts.push(['위기 대응','대통령/정치인이 선택',openGlobalCrisis]);acts.push(['정상회의 캘린더','양자 정상회담·무역협상',openSummitDesk],['외교 지도','국가별 관계 확인',()=>toast('국가 카드를 클릭하세요.')],['정치 드라마','국제 사건과 국내정치 연결',openDramaHub]);
 modal('🌐','국제정세','외교는 관계점수만 올리는 메뉴가 아닙니다. 무역·안보·민심·증시·국내 정치가 함께 움직입니다.',acts,body);$$('.countryCard').forEach(b=>b.onclick=()=>openCountry(b.dataset.country))
}
function openCountry(k){const c=worldCountry(k),can=S.nation.currentPresident===S.name;const body=`<div class="countryHero"><span>${c.icon}</span><div><b>${c.name}</b><small>${relationClass(c.rel)==='ally'?'협력적 관계':relationClass(c.rel)==='hostile'?'긴장 관계':'경쟁과 협력이 공존'}</small></div></div><div class="countryStats"><div><span>관계</span><b>${Math.round(c.rel)}</b></div><div><span>신뢰</span><b>${Math.round(c.trust)}</b></div><div><span>무역</span><b>${Math.round(c.trade)}</b></div><div><span>긴장</span><b>${Math.round(c.tension)}</b></div><div><span>안보협력</span><b>${Math.round(c.alliance)}</b></div><div><span>제재수준</span><b>${Math.round(c.sanctions)}</b></div></div>`;const acts=[];if(can){acts.push(['정상회담','재정 사용 · 관계/신뢰 개선',()=>summit(k)],['무역협정','관계 15 이상 필요 · 경제효과',()=>tradeDeal(k)],['긴장완화 제안','긴장도와 세계위기 완화',()=>deescalate(k)],['경제제재','관계/무역 악화 · 압박 증가',()=>sanctionCountry(k)]);if(['usa','japan','eu'].includes(k))acts.push(['안보협력 강화','동맹·안보 상승, 국내 반발 가능',()=>securityCoop(k)])}else acts.push(['외교정책 연설','정치인으로 외교 인지도 상승',()=>foreignSpeech(k)]);acts.push(['세계로','돌아가기',openWorldOrder]);modal(c.icon,c.name,can?'대통령으로 외교 정책을 선택할 수 있습니다. 선택은 국내 경제와 민심에도 영향을 줍니다.':'대통령이 아니어도 외교 의제를 정치적 자산으로 만들 수 있습니다.',acts,body)}
function summit(k){const c=worldCountry(k);if(S.nation.currentPresident!==S.name)return toast('대통령 권한이 필요합니다.');spendTreasury(90000000000);const ok=Math.random()*100<clamp(48+S.v3.gov.foreign*.35+S.stats.cha*.2+c.trust*.15-c.tension*.12,25,92);c.rel=clamp(c.rel+(ok?rnd(8,16):rnd(-4,4)),-100,100);c.trust=clamp(c.trust+(ok?8:-3));S.v6.world.prestige=clamp(S.v6.world.prestige+(ok?5:0));S.v3.gov.approval=clamp(S.v3.gov.approval+(ok?2:-1));S.v6.world.lastSummit=c.name;advance(4,ok?`${c.name}과 정상회담이 성과를 냈습니다.`:`${c.name}과 정상회담에서 큰 합의를 만들지 못했습니다.`);openCountry(k)}
function tradeDeal(k){const c=worldCountry(k);if(c.rel<15)return toast('관계 15 이상이 필요합니다.');const ok=Math.random()*100<clamp(42+c.trust*.3+S.v3.gov.foreign*.25,25,90);if(ok){c.trade=clamp(c.trade+12);c.rel=clamp(c.rel+4);S.nation.economy=clamp(S.nation.economy+4);S.inf.business=clamp(S.inf.business+2);S.v6.world.tradeClimate=clamp(S.v6.world.tradeClimate+3);log(`${c.name}과 새로운 무역협정이 체결됐습니다.`)}else{c.rel=clamp(c.rel-3);log(`${c.name}과 무역협상이 결렬됐습니다.`)}advance(9);openCountry(k)}
function deescalate(k){const c=worldCountry(k),ok=Math.random()*100<clamp(40+S.v3.gov.foreign*.35+S.v4.gov.intel*.15-c.tension*.18,15,88);c.tension=clamp(c.tension-(ok?rnd(10,20):rnd(0,4)));c.rel=clamp(c.rel+(ok?6:0),-100,100);S.v6.world.globalTension=clamp(S.v6.world.globalTension-(ok?6:1));advance(5,ok?`${c.name}과 긴장완화 합의가 이뤄졌습니다.`:'긴장완화 논의가 큰 진전을 만들지 못했습니다.');openCountry(k)}
function sanctionCountry(k){const c=worldCountry(k);c.sanctions=clamp(c.sanctions+18);c.rel=clamp(c.rel-18,-100,100);c.trade=clamp(c.trade-12);c.tension=clamp(c.tension+9);S.v6.world.globalTension=clamp(S.v6.world.globalTension+5);S.nation.economy=clamp(S.nation.economy-(c.trade>40?2:0));S.stats.reputation=clamp(S.stats.reputation+1);advance(3,`${c.name}에 대한 경제제재를 강화했습니다. 외교 관계와 무역이 악화됐습니다.`);openCountry(k)}
function securityCoop(k){const c=worldCountry(k);spendTreasury(480000000000);c.alliance=clamp(c.alliance+12);c.trust=clamp(c.trust+5);S.v4.gov.security=clamp(S.v4.gov.security+5);S.v4.gov.warRisk=clamp(S.v4.gov.warRisk-4);if(Math.random()<.35)S.nation.mood=clamp(S.nation.mood-2);advance(10,`${c.name}과 안보협력을 강화했습니다.`);openCountry(k)}
function foreignSpeech(k){const c=worldCountry(k),ok=Math.random()*100<clamp(35+S.stats.cha*.4+S.stats.pol*.25,20,88);S.stats.reputation=clamp(S.stats.reputation+(ok?3:-1));S.inf.political=clamp(S.inf.political+(ok?2:0));c.rel=clamp(c.rel+(ok?1:-1),-100,100);advance(2,ok?`${c.name} 관련 외교정책 연설이 좋은 평가를 받았습니다.`:'외교정책 연설이 큰 반향을 얻지 못했습니다.');openCountry(k)}
function openSummitDesk(){const ranked=Object.entries(S.v6.world.countries).sort((a,b)=>b[1].trade-a[1].trade).slice(0,5);const body=`<div class="summitList">${ranked.map(([k,c])=>`<button class="summitRow" data-country="${k}"><span>${c.icon}</span><div><b>${c.name}</b><small>관계 ${c.rel} · 무역 ${c.trade}</small></div><em>회담 검토</em></button>`).join('')}</div>`;modal('🤝','정상회의 캘린더','경제·안보 중요도가 높은 국가부터 관리하면 유리하지만, 한쪽과 가까워질수록 다른 관계가 흔들릴 수 있습니다.',[['세계로','돌아가기',openWorldOrder]],body);$$('.summitRow').forEach(b=>b.onclick=()=>openCountry(b.dataset.country))}

function spawnGlobalCrisis(force=false){const w=S.v6.world;if(w.activeCrisis&&!force)return;const base=V6_CRISIS_POOL[rnd(0,V6_CRISIS_POOL.length-1)];w.activeCrisis={...base,days:30+rnd(0,45),progress:0};w.globalTension=clamp(w.globalTension+Math.round(base.severity/10));const c=worldCountry(base.country);c.tension=clamp(c.tension+8);S.nation.stability=clamp(S.nation.stability-3);log(`국제위기 발생: ${base.title}.`)}
function openGlobalCrisis(){const x=S.v6.world.activeCrisis;if(!x)return toast('현재 국제위기가 없습니다.');const c=worldCountry(x.country);const body=`<div class="crisisHero"><span>${x.icon}</span><div><b>${x.title}</b><small>${x.text}</small></div><em>${x.severity}</em></div><div class="crisisStats"><span>${c.name} 긴장 ${Math.round(c.tension)}</span><span>세계 긴장 ${Math.round(S.v6.world.globalTension)}</span><span>국가 안정 ${Math.round(S.nation.stability)}</span></div>`;const acts=[];if(S.nation.currentPresident===S.name){acts.push(['외교 채널 총동원','외교력/신뢰 기반 완화',()=>resolveCrisis('diplomacy')],['국제 공조 요청','국제위상/동맹 기반',()=>resolveCrisis('coalition')],['방어태세 강화','안보 상승 · 긴장도도 일부 상승',()=>resolveCrisis('security')],['경제 충격 흡수','재정 사용 · 경제/민심 방어',()=>resolveCrisis('economy')])}else acts.push(['초당적 해결 촉구','정치 평판을 걸고 위기 메시지',()=>resolveCrisis('speech')]);modal('🚨',x.title,'위기 대응은 추상적인 외교·경제·안보 수치로만 처리되며 실제 군사작전 절차를 다루지 않습니다.',acts,body)}
function resolveCrisis(type){const w=S.v6.world,x=w.activeCrisis,c=worldCountry(x.country);let score=0,msg='';if(type==='diplomacy'){score=S.v3.gov.foreign*.45+c.trust*.2+S.stats.cha*.15-w.globalTension*.15;msg='외교 채널을 총동원했습니다.'}if(type==='coalition'){score=w.prestige*.4+c.alliance*.15+S.v3.gov.foreign*.25;msg='국제 공조 체계를 가동했습니다.'}if(type==='security'){spendTreasury(700000000000);S.v4.gov.security=clamp(S.v4.gov.security+6);c.tension=clamp(c.tension+3);score=S.v4.gov.security*.5+S.v4.gov.intel*.25;msg='국가 방어태세를 강화했습니다.'}if(type==='economy'){spendTreasury(1500000000000);S.nation.economy=clamp(S.nation.economy+2);S.nation.mood=clamp(S.nation.mood+3);score=58+S.v4.gov.cabinet*.1;msg='경제 충격 완화 패키지를 가동했습니다.'}if(type==='speech'){score=S.stats.cha*.45+S.stats.pol*.35+S.stats.reputation*.2;msg='초당적 위기해결을 촉구했습니다.'}
 const ok=score+rnd(-20,20)>48;if(ok){w.globalTension=clamp(w.globalTension-10);c.tension=clamp(c.tension-12);S.nation.stability=clamp(S.nation.stability+4);if(S.v3?.gov)S.v3.gov.approval=clamp(S.v3.gov.approval+3);log(`${x.title} 대응이 효과를 내며 위기가 완화됐습니다.`);w.activeCrisis=null}else{x.severity=clamp(x.severity+8);w.globalTension=clamp(w.globalTension+7);S.nation.economy=clamp(S.nation.economy-3);S.nation.mood=clamp(S.nation.mood-4);log(`${x.title} 대응이 성과를 내지 못해 위기가 장기화됐습니다.`);if(x.severity>82&&Math.random()<.35)startAbstractConflict(x.country)}advance(5,msg);w.activeCrisis?openGlobalCrisis():openWorldOrder()}
function startAbstractConflict(country){const w=S.v6.world,c=worldCountry(country);w.conflict={country,months:0,intensity:35};w.globalTension=clamp(w.globalTension+18);c.tension=92;S.nation.stability=clamp(S.nation.stability-12);S.nation.economy=clamp(S.nation.economy-8);log(`${c.name} 관련 제한적 군사충돌 상태가 발생했습니다. 게임은 작전이 아니라 외교·경제·민심 결과만 처리합니다.`)}
function conflictMonth(){const w=S.v6.world;if(!w.conflict)return;w.conflict.months++;w.conflict.intensity=clamp(w.conflict.intensity+rnd(-8,8));S.nation.economy=clamp(S.nation.economy-rnd(1,3));S.nation.mood=clamp(S.nation.mood-rnd(1,4));if(w.conflict.months>=2&&Math.random()<.28+S.v3.gov.foreign/300){const c=worldCountry(w.conflict.country);c.tension=clamp(c.tension-25);w.globalTension=clamp(w.globalTension-15);log(`${c.name} 관련 군사충돌이 외교 중재로 휴지기에 들어갔습니다.`);w.conflict=null}}
function worldMonth(){const w=S.v6.world;w.month++;Object.values(w.countries).forEach(c=>{c.rel=clamp(c.rel+rnd(-2,2),-100,100);c.tension=clamp(c.tension+rnd(-3,3));c.trade=clamp(c.trade+rnd(-2,2));c.trust=clamp(c.trust+rnd(-2,2))});w.globalTension=clamp(w.globalTension+rnd(-3,3));w.tradeClimate=clamp(w.tradeClimate+rnd(-3,3)+(S.nation.economy>60?1:0));w.energyPrice=clamp(w.energyPrice+rnd(-5,5));if(!w.activeCrisis&&Math.random()<.16)spawnGlobalCrisis();if(w.activeCrisis){w.activeCrisis.days-=30;if(w.activeCrisis.days<=0){w.activeCrisis.severity=clamp(w.activeCrisis.severity+10);w.activeCrisis.days=30}}conflictMonth()}

/* ---------- POLITICAL DRAMA / FUN ---------- */
const V6_SCANDALS=[
 {id:'aide',title:'측근 인사 논란',severity:35,text:'핵심 측근의 인사와 이해관계를 둘러싼 의혹이 커졌습니다.'},
 {id:'recording',title:'비공개 발언 녹취 공개',severity:48,text:'사적인 자리에서 한 발언이 언론에 공개되며 정치권이 들끓고 있습니다.'},
 {id:'donation',title:'후원금 논란',severity:42,text:'후원금의 적절성을 둘러싼 논쟁이 커지고 있습니다.'},
 {id:'family',title:'가족 관련 논란',severity:36,text:'가족의 행동이 정치적 이슈로 번지며 해명 요구가 쏟아집니다.'},
 {id:'policy',title:'정책 실패 책임론',severity:32,text:'성과가 기대에 못 미치면서 야당과 언론의 책임론이 커졌습니다.'}
];
function openDramaHub(){ensureV6();const d=S.v6.drama;const body=`<div class="dramaHero"><div><span>정치 라이벌</span><b>${d.rival}</b><small>인기 ${Math.round(d.rivalPop)} · 권력 ${Math.round(d.rivalPower)}</small></div><strong>${d.activeScandal?'🔥 논란중':'평온'}</strong></div><div class="dramaGrid"><div><span>비공식 참모 영향</span><b>${Math.round(d.innerCircle)}</b></div><div><span>미디어 관심</span><b>${Math.round(d.mediaCycle)}</b></div><div><span>신변 위험</span><b>${Math.round(d.threat)}</b></div><div><span>정치적 빚</span><b>${Math.round(d.favors)}</b></div><div><span>비밀정보</span><b>${Math.round(d.secrets)}</b></div><div><span>레거시</span><b>${Math.round(d.legacy)}</b></div></div>${d.activeScandal?`<div class="activeScandal"><b>${d.activeScandal.title}</b><span>${d.activeScandal.text}</span><em>심각도 ${d.activeScandal.severity}</em></div>`:''}<div class="achievementStrip">${d.achievements.length?d.achievements.slice(-5).map(x=>`<span>🏆 ${x}</span>`).join(''):'<span>아직 특별 업적 없음</span>'}</div>`;
 const acts=[['라이벌과 TV 토론','매력/정치력 승부',debateRival],['정책참모 영입','₩15,000,000 · 능력 상승, 논란위험도 소폭 증가',recruitInnerCircle],['언론 인터뷰','평판과 미디어 사이클 변동',mediaInterview],['신변보호 강화','₩10,000,000 · 위험 감소',securityUpgrade]];if(d.activeScandal)acts.unshift(['스캔들 대응','해명·독립조사·측근정리',openScandal]);acts.push(['국회','300 의원 정치',openParliament300],['세계','국제정세',openWorldOrder]);modal('🎭','정치 드라마','성공만 반복되지 않습니다. 라이벌, 언론, 측근, 스캔들, 신변위협과 뜻밖의 기회가 권력의 흐름을 흔듭니다.',acts,body)}
function debateRival(){const d=S.v6.drama,score=S.stats.cha*.42+S.stats.pol*.36+S.stats.int*.18+S.stats.reputation*.12+rnd(-22,22),rscore=d.rivalPop*.45+d.rivalPower*.35+rnd(-10,18);if(score>=rscore){S.stats.reputation=clamp(S.stats.reputation+5);S.inf.political=clamp(S.inf.political+4);d.rivalPop=clamp(d.rivalPop-4);d.legacy+=2;log(`${d.rival}과의 TV토론에서 우위를 보였습니다.`)}else{S.stats.reputation=clamp(S.stats.reputation-3);d.rivalPop=clamp(d.rivalPop+5);d.rivalPower=clamp(d.rivalPower+2);S.stats.stress=clamp(S.stats.stress+7);log(`${d.rival}과의 TV토론에서 밀렸습니다.`)}advance(3);openDramaHub()}
function recruitInnerCircle(){if(!spend(15000000))return;const d=S.v6.drama;d.innerCircle=clamp(d.innerCircle+12);S.stats.pol=clamp(S.stats.pol+2);S.stats.net=clamp(S.stats.net+2);d.mediaCycle=clamp(d.mediaCycle+3);if(Math.random()<.25)d.secrets+=rnd(1,3);advance(7,'유능한 비공식 정책참모를 영입했습니다. 영향력은 커졌지만 책임 소재 논란 가능성도 생겼습니다.');openDramaHub()}
function mediaInterview(){const d=S.v6.drama,ok=Math.random()*100<clamp(40+S.stats.cha*.4+S.stats.int*.2-d.mediaCycle*.12,20,90);S.stats.reputation=clamp(S.stats.reputation+(ok?4:-3));d.mediaCycle=clamp(d.mediaCycle+(ok?-2:7));S.inf.media=clamp(S.inf.media+(ok?2:0));advance(2,ok?'언론 인터뷰가 좋은 평가를 받았습니다.':'인터뷰 발언이 논란을 키웠습니다.');openDramaHub()}
function securityUpgrade(){if(!spend(10000000))return;const d=S.v6.drama;d.security=clamp(d.security+15);d.threat=clamp(d.threat-12);advance(1,'신변 보호와 행사 안전체계를 강화했습니다.');openDramaHub()}
function spawnScandal(){const d=S.v6.drama;if(d.activeScandal)return;const x=V6_SCANDALS[rnd(0,V6_SCANDALS.length-1)];d.activeScandal={...x,days:30};d.mediaCycle=clamp(d.mediaCycle+15);S.stats.reputation=clamp(S.stats.reputation-3);log(`정치 스캔들 발생: ${x.title}.`)}
function openScandal(){const x=S.v6.drama.activeScandal;if(!x)return openDramaHub();modal('🔥',x.title,x.text,[['자료 공개·정면 해명','청렴/지능 판정 · 성공하면 빠르게 진정',()=>respondScandal('explain')],['독립 조사 수용','시간은 걸리지만 신뢰 회복 가능',()=>respondScandal('investigate')],['문제 측근 정리','내부 영향력 손실 · 논란 즉시 감소',()=>respondScandal('dismiss')],['정책 성과로 돌파','성과가 좋으면 이슈 전환, 실패 시 악화',()=>respondScandal('policy')]],`<div class="scandalMeter"><span>심각도</span><i><u style="width:${x.severity}%"></u></i><b>${x.severity}</b></div>`)}
function respondScandal(type){const d=S.v6.drama,x=d.activeScandal;let success=false;if(type==='explain')success=Math.random()*100<clamp(35+S.stats.int*.35+(S.v3?.gov?.integrity||50)*.25,20,90);if(type==='investigate'){success=Math.random()*100<72;S.stats.stress=clamp(S.stats.stress+3)}if(type==='dismiss'){success=true;d.innerCircle=clamp(d.innerCircle-9);d.favors=clamp(d.favors-2)}if(type==='policy')success=Math.random()*100<clamp(30+S.nation.economy*.35+S.stats.pol*.25,20,85);if(success){S.stats.reputation=clamp(S.stats.reputation+4);d.mediaCycle=clamp(d.mediaCycle-12);log(`${x.title} 대응이 효과를 내며 논란이 잦아들었습니다.`);d.activeScandal=null}else{x.severity=clamp(x.severity+12);S.stats.reputation=clamp(S.stats.reputation-5);d.mediaCycle=clamp(d.mediaCycle+10);log(`${x.title} 해명이 역효과를 내며 논란이 확대됐습니다.`)}advance(type==='investigate'?12:5);openDramaHub()}
function dramaMonth(){const d=S.v6.drama;d.mediaCycle=clamp(d.mediaCycle+rnd(-4,4));d.rivalPop=clamp(d.rivalPop+rnd(-3,3));d.rivalPower=clamp(d.rivalPower+rnd(-2,3));d.threat=clamp(d.threat+rnd(-2,3)+(power()>55?2:0));if(!d.activeScandal&&power()>25&&Math.random()<.10+Math.max(0,d.mediaCycle-55)/400)spawnScandal();if(d.activeScandal){d.activeScandal.days-=30;if(d.activeScandal.days<=0){S.stats.reputation=clamp(S.stats.reputation-Math.round(d.activeScandal.severity/18));d.activeScandal=null;log('시간이 지나며 정치 논란의 관심도가 낮아졌습니다.')}}if(d.threat>70&&Math.random()<.14){S.stats.stress=clamp(S.stats.stress+10);d.security=clamp(d.security-5);d.threat=clamp(d.threat-18);log('신변 위협 첩보로 공개 일정을 일부 취소했습니다.')}}
function checkAchievements(){const d=S.v6.drama;const add=x=>{if(!d.achievements.includes(x)){d.achievements.push(x);toast(`🏆 업적: ${x}`)}};if(networth()>=10000000000)add('100억 자산가');if(S.v5.company?.listed)add('상장 창업자');if(S.nation.currentPresident===S.name)add('청와대의 주인');if(S.v6.parliament.lastVote?.yes>=220)add('초당적 설득가');if(S.v6.world.prestige>=70)add('국제적 지도자');if(S.v5.power?.presidentStatus==='궐위')add('헌정 격변의 목격자');if(S.faction.partySeats>=151)add('국회 과반 장악');d.legacy=clamp(d.legacy+d.achievements.length*.02,0,100)}

/* ---------- MONTHLY / UI HOOKS ---------- */
function parliamentMonth(){ensureV6();const p=S.v6.parliament;p.mps.forEach(m=>{m.relation=clamp(m.relation+rnd(-1,1),-100,100);if(Math.random()<.012)m.rebel=!m.rebel;if(Math.random()<.006&&m.ambition>70)m.influence=clamp(m.influence+1)});syncPlayerPartyMPs();p.session++}
const baseMonthlyTickV6=monthlyTick;monthlyTick=function(){ensureV6();baseMonthlyTickV6();S.v6.months++;parliamentMonth();worldMonth();dramaMonth();checkAchievements()};

const baseUpdateAllV6=updateAll;updateAll=function(){ensureV6();baseUpdateAllV6();S.version=6;const pres=$('.president strong');if(pres)pres.textContent=S.nation.currentPresident;const mini=$('#v3GovMini');if(mini&&!$('#v6mini'))mini.insertAdjacentHTML('beforeend',`<div id="v6mini"><div class="systemRow"><span>국회</span><b>300명 NPC · ${S.v6.parliament.lastVote?S.v6.parliament.lastVote.name:'본회의 대기'}</b></div><div class="systemRow"><span>세계 긴장</span><b>${Math.round(S.v6.world.globalTension)} / 국제위상 ${Math.round(S.v6.world.prestige)}</b></div><div class="systemRow"><span>정치 라이벌</span><b>${S.v6.drama.rival} · 인기 ${Math.round(S.v6.drama.rivalPop)}</b></div></div>`);checkAchievements()};

const baseOpenPoliticsV6=showPolitics;showPolitics=function(){ensureV6();const c=partyCounts(),top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([n,v])=>`${n} ${v}석`).join(' · ');const body=`<div class="systemList"><div class="systemRow"><span>현직 대통령</span><b>${S.nation.currentPresident}${S.nation.simulated?' · 게임 시뮬레이션':''}</b></div><div class="systemRow"><span>국회 300석</span><b>${top}</b></div><div class="systemRow"><span>최근 법안</span><b>${S.v6.parliament.lastVote?S.v6.parliament.lastVote.name+' '+S.v6.parliament.lastVote.yes+'표':'없음'}</b></div><div class="systemRow"><span>세계 긴장</span><b>${Math.round(S.v6.world.globalTension)}</b></div><div class="systemRow"><span>활성 국제위기</span><b>${S.v6.world.activeCrisis?S.v6.world.activeCrisis.title:'없음'}</b></div><div class="systemRow"><span>내 정당</span><b>${S.faction.party?S.faction.party+' / '+(S.faction.partySeats||0)+'석':'없음'}</b></div></div>`;modal('🏛️','국가 권력 구조 V0.6','대한민국 제도를 출발점으로 하되, 이후 국회 구성·가상 정치인·국제 사건은 플레이에 따라 변하는 게임 시뮬레이션입니다.',[['국회 300','개별 의원·법안·표결',openParliament300],['국제정세','외교·무역·위기·동맹',openWorldOrder],['권력교체','탄핵·선거·군사권력 상태',openPowerTransition],['정치 드라마','라이벌·언론·스캔들',openDramaHub]],body)};

const baseOpenGovernmentV6=openGovernment;openGovernment=function(){ensureV6();if(S.nation.currentPresident!==S.name)return baseOpenGovernmentV6();const g=S.v3.gov,a=S.v4.gov,w=S.v6.world,d=S.v6.drama;const body=`<div class="govGrid"><div class="govKpi"><span>국정 지지율</span><b>${Math.round(g.approval)}%</b></div><div class="govKpi"><span>정부 재정</span><b>${KRW(g.treasury)}</b></div><div class="govKpi"><span>탄핵 위험</span><b>${Math.round(impeachmentRisk())}%</b></div></div><div class="govAdvanced"><div><span>내각 역량</span><b>${Math.round(a.cabinet)}</b></div><div><span>정보기관</span><b>${Math.round(a.intel)}</b></div><div><span>안보 태세</span><b>${Math.round(a.security)}</b></div><div><span>여야 협치</span><b>${Math.round(a.coalition)}</b></div><div><span>세계 긴장</span><b>${Math.round(w.globalTension)}</b></div><div><span>국제 위상</span><b>${Math.round(w.prestige)}</b></div><div><span>미디어 관심</span><b>${Math.round(d.mediaCycle)}</b></div><div><span>활성 국제위기</span><b>${w.activeCrisis?w.activeCrisis.title:'없음'}</b></div></div>`;modal('🇰🇷','대통령 국정 운영 V0.6','이제 국내 정책뿐 아니라 국회 300명의 표, 국제정세, 스캔들과 라이벌까지 동시에 관리해야 합니다.',[['국회 300','법안과 의원 설득',openParliament300],['국제정세','정상외교·제재·위기 대응',openWorldOrder],['예산·경제정책','세금·복지·성장정책',openEconomicGov],['장관 인선','내각 역량 조정',()=>govAdvancedAction('cabinet')],['정보기관 브리핑','정보·안보 역량',()=>govAdvancedAction('intel')],['야당 지도부 협상','협치·탄핵 위험 완화',()=>govAdvancedAction('coalition')],['탄핵 대응','헌정위기 관리',openImpeachment],['정치 드라마','라이벌·스캔들·언론',openDramaHub]],body)};

/* Extra events plugged into V0.3 event engine */
const baseEventPoolV6=eventPool;eventPool=function(){let pool=baseEventPoolV6();pool=pool.concat([
 evt('v6_leak',null,'🗂️','익명의 제보','당신에게 정계 거물의 이해충돌 의혹을 담은 익명 자료가 전달됐습니다.',[
  choice('독립 검증부터 한다','지능 +2 · 스트레스 +2',{stats:{int:2,stress:2,reputation:1},inf:{media:1},resultText:'자료의 출처와 신빙성을 차분히 검증하기 시작했습니다.'}),
  choice('공개 검증을 요구한다','정치력 판정 · 성공하면 평판 상승',{success:{stats:{reputation:5,pol:1},inf:{political:2,media:2}},fail:{stats:{reputation:-3,stress:5}},successText:'공개 검증 요구가 설득력을 얻어 정치권이 움직였습니다.',failText:'성급한 문제제기라는 비판이 커졌습니다.'},{check:['pol',48]}),
  choice('관여하지 않는다','위험 회피 · 스트레스 -2',{stats:{stress:-2},resultText:'정치적 위험을 피하고 본업에 집중했습니다.'})
 ],{generic:true}),
 evt('v6_chaebol',null,'🏢','재계의 정책 제안','대형 경제단체가 규제 개선과 투자 확대를 묶은 공개 정책 패키지를 제안했습니다.',[
  choice('공개 정책협약으로 추진','기업 영향력 +5 · 평판 +2',{inf:{business:5},stats:{reputation:2,pol:1},nation:{economy:1},resultText:'공개 협약으로 투명하게 정책 논의를 시작했습니다.'}),
  choice('조건을 더 협상한다','정치력 판정 · 성공 시 경제/기업 영향 상승',{success:{inf:{business:7},stats:{pol:2,net:2},nation:{economy:2}},fail:{stats:{stress:4},inf:{business:1}},successText:'투자와 고용을 더 끌어내는 조건을 만들었습니다.',failText:'협상이 길어지며 기업들의 관심이 일부 식었습니다.'},{check:['pol',52]}),
  choice('거리를 둔다','민심 +2 · 기업 영향 -2',{nation:{mood:2},inf:{business:-2},stats:{reputation:1},resultText:'재계와 거리를 두며 독립성을 강조했습니다.'})
 ],{generic:true}),
 evt('v6_rival',null,'🥊','라이벌의 급부상','정치 라이벌이 전국적인 주목을 받으며 당신의 지지층 일부를 흔들고 있습니다.',[
  choice('정책 경쟁으로 맞선다','지능 판정 · 성공하면 정치 영향 상승',{success:{stats:{reputation:4,int:1},inf:{political:4}},fail:{stats:{reputation:-2,stress:5}},successText:'구체적인 정책 대안으로 주도권을 되찾았습니다.',failText:'라이벌의 메시지가 더 강하게 먹혔습니다.'},{check:['int',50]}),
  choice('TV토론을 제안한다','매력 판정 · 성공하면 큰 평판 상승',{success:{stats:{reputation:6,cha:2},inf:{political:3,media:3}},fail:{stats:{reputation:-4,stress:7},inf:{media:1}},successText:'토론에서 강한 인상을 남기며 여론을 뒤집었습니다.',failText:'토론에서 밀리며 라이벌이 더 주목받았습니다.'},{check:['cha',52]}),
  choice('내 조직을 다진다','인맥 +4 · 정치 영향 +2',{stats:{net:4,pol:1},inf:{political:2},resultText:'외부 공세보다 조직과 지역 기반을 단단히 다졌습니다.'})
 ],{generic:true}),
 evt('v6_globalshock',null,'🌐','해외발 충격','국제 금융시장과 원자재 가격이 동시에 흔들리며 국내 투자심리가 급락했습니다.',[
  choice('현금을 지킨다','안전 · 스트레스 -1',{stats:{stress:-1,int:1},resultText:'공격적인 결정을 피하고 현금흐름을 지켰습니다.'}),
  choice('분할 투자한다','지능 판정 · 수익 또는 손실',{success:{cash:7000000,stats:{int:1},inf:{business:2}},fail:{cash:-5000000,stats:{stress:5}},successText:'공포가 큰 구간에서 좋은 가격에 자산을 확보했습니다.',failText:'추가 하락이 이어지며 평가손실이 커졌습니다.'},{check:['int',55],preCost:10000000}),
  choice('경제대책을 선점한다','정치력 +2 · 평판 +2',{stats:{pol:2,reputation:2},inf:{political:2},resultText:'경제 대응 의제를 빠르게 선점했습니다.'})
 ],{generic:true})
]);return pool};

/* Debug/fun shortcut: F3 parliament event, F4 global crisis */
document.addEventListener('keydown',e=>{if(e.key==='F3'){e.preventDefault();openParliament300()}if(e.key==='F4'){e.preventDefault();spawnGlobalCrisis(true);openGlobalCrisis()}});

ensureV6();updateAll();
