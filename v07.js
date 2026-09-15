/* LIFE : RISE V0.7 — REAL POLITICS / ELECTION / INTELLIGENCE UPDATE
   Snapshot date: 2026-09-13. Real public figures are used only for nonviolent civic/political simulation.
   Any future actions/traits after the divergence date are fictional game simulation, not factual claims.
*/
const V7={version:'0.7',snapshot:'2026-09-13',pageSize:24};

const V7_PARTY_COLORS={
 '더불어민주당':'#4d8dff','국민의힘':'#ef5c67','조국혁신당':'#3f66d4','개혁신당':'#ff7a38',
 '진보당':'#d64c80','기본소득당':'#43a6a4','사회민주당':'#e86c9d','무소속':'#a5adba','공석':'#525d6d'
};
const V7_POWER_SNAPSHOT=[
 {rank:1,name:'이재명',role:'대통령',institution:'행정부',score:100,why:'헌법상 행정부 수반·국군통수권·인사/정책 중심'},
 {rank:2,name:'한성숙',role:'국무총리',institution:'행정부',score:80,why:'내각 통할·국정조정의 핵심'},
 {rank:3,name:'조정식',role:'국회의장',institution:'입법부',score:78,why:'국회 운영·본회의 의사 진행의 중심'},
 {rank:4,name:'김민석',role:'더불어민주당 대표',institution:'정당',score:76,why:'거대 정당의 당권·공천·원내정치 영향'},
 {rank:5,name:'장동혁',role:'국민의힘 대표',institution:'정당',score:69,why:'제1야당 당권·대여 전략 영향'},
 {rank:6,name:'이종석',role:'국가정보원장',institution:'정보',score:67,why:'국가정보·방첩·안보정보 조직 지휘'},
 {rank:7,name:'한병도',role:'더불어민주당 원내대표',institution:'국회',score:64,why:'여당 원내전략·법안·표결 조정'},
 {rank:8,name:'정점식',role:'국민의힘 원내대표',institution:'국회',score:61,why:'야당 원내전략·법안·표결 조정'},
 {rank:9,name:'플레이어',role:'당신',institution:'게임',score:0,why:'돈·인맥·정치·군·정보 영향력에 따라 변동'},
 {rank:10,name:'재계/언론 핵심 네트워크',role:'비선출 영향력',institution:'민간',score:55,why:'자본·여론·정책 네트워크의 간접 영향'}
];

const V7_FACTIONS=['개혁파','실용파','조직파','강경파']; // game-only simulated factions
const V7_BLACK_TARGETS=[
 {id:'jackal',name:'GRAY JACKAL',type:'가상 적대 공작원',threat:72,value:80,active:true},
 {id:'helix',name:'HELIX NETWORK',type:'가상 국제 무기중개망',threat:64,value:72,active:true},
 {id:'vesper',name:'VESPER CELL',type:'가상 해외 영향공작 조직',threat:58,value:68,active:true},
 {id:'obsidian',name:'OBSIDIAN BROKER',type:'가상 산업기밀 브로커',threat:49,value:60,active:true}
];

/* career extension */
careers.intel={name:'국정원',levels:['수습 정보관','정보분석관','현장 정보관','선임 정보관','팀장','처장급','차장','국정원장'],salary:[3300000,4300000,5400000,6900000,9500000,13500000,18000000,24000000],primary:'int'};

function v7HashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)}
function v7Rng(s,salt=0){return ((v7HashStr(String(s)+'|'+salt)%10000)/10000)}
function v7Trait(name,min,max,salt){return Math.round(min+v7Rng(name,salt)*(max-min))}

function ensureV7(){
 ensureV6();S.version=7;S.v7=S.v7||{};
 S.v7.roster=S.v7.roster||{status:'pending',source:'',snapshot:V7.snapshot,lastSync:null,currentCount:0,vacancies:0};
 S.v7.election=S.v7.election||{district:null,party:null,stage:'idle',nomination:0,poll:8,budget:0,volunteers:0,debate:0,field:0,incumbentId:null,won:false,history:[]};
 S.v7.party=S.v7.party||{selected:null,playerFaction:'실용파',leadershipSupport:8,isLeader:false,kingmaker:null,kingmakerPower:0,simEvents:[]};
 S.v7.intel=S.v7.intel||{intel:10,clearance:0,trust:10,exposure:0,oversight:12,field:0,analysis:15,assets:0,briefings:0,blackOps:0,targets:JSON.parse(JSON.stringify(V7_BLACK_TARGETS)),director:false};
 S.v7.power=S.v7.power||{lastBoard:V7.snapshot,kingmakerWins:0};
 S.v7.flags=S.v7.flags||{};
}
ensureV7();

/* ---------- REAL ASSEMBLY SYNC ---------- */
function normalizeRealMP(o,i){
 const name=String(o.name||o.HG_NM||'').trim();
 const party=String(o.party||o.POLY_NM||'무소속').trim()||'무소속';
 const district=String(o.dist||o.district||o.ORIG_NM||'비례대표').trim()||'비례대표';
 const committee=Array.isArray(o.committees)?o.committees.join(', '):String(o.committee||o.committees||'').trim();
 const id=String(o.id||o.member_id||o.MONA_CD||('REAL'+String(i+1).padStart(3,'0')));
 const ideologyBase=party==='더불어민주당'?-24:party==='국민의힘'?34:party==='조국혁신당'?-38:party==='개혁신당'?15:0;
 return {id,name,party,startParty:party,partyShort:party,ideology:clamp(Math.round(ideologyBase+(v7Rng(name,1)-.5)*26),-100,100),
   loyalty:v7Trait(name,44,91,2),ambition:v7Trait(name,28,88,3),integrity:v7Trait(name,40,88,4),influence:v7Trait(name,25,82,5),
   relation:v7Trait(name,-5,16,6),committee:committee||'상임위원회',district,term:v7Trait(name,1,5,7),scandal:0,rebel:false,
   real:true,simFaction:V7_FACTIONS[v7HashStr(name)%V7_FACTIONS.length],simNote:'성향·관계·계파 수치는 게임 시뮬레이션'};
}
function scanDogam(node,out,seen=new Set()){
 if(!node)return;
 if(Array.isArray(node)){node.forEach(x=>scanDogam(x,out,seen));return}
 if(typeof node!=='object')return;
 const n=node.name, p=node.party, d=node.dist||node.district;
 if(typeof n==='string'&&typeof p==='string'&&typeof d==='string'&&n.length>=2&&n.length<=12&&p.length<=24){
   const key=n+'|'+d;if(!seen.has(key)){seen.add(key);out.push(node)}
 }
 Object.values(node).forEach(v=>{if(typeof v==='object')scanDogam(v,out,seen)});
}
function parseAssemblyCsv(txt){
 const lines=txt.split(/\r?\n/),out=[];
 for(const line of lines){
  if(!line.includes(',22,'))continue;
  const cols=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===','&&!q){cols.push(cur);cur=''}else cur+=ch}cols.push(cur);
  if(Number(cols[1])!==22)continue;
  out.push({id:cols[0],name:cols[2],party:cols[5],district:cols[7],committee:cols[9]});
 }
 return out;
}
async function fetchText(url){const c=new AbortController();const tm=setTimeout(()=>c.abort(),4500);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.text()}finally{clearTimeout(tm)}}
async function loadCurrentRoster(){
 // 1) Current 299-member community dataset updated near snapshot date.
 try{
  const urls=['https://raw.githubusercontent.com/rumins01/dogam/main/dogam-a.json','https://raw.githubusercontent.com/rumins01/dogam/main/dogam-b.json'];
  const texts=await Promise.all(urls.map(fetchText));let raw=[];texts.forEach(t=>scanDogam(JSON.parse(t),raw));
  const ded=[...new Map(raw.map(x=>[(x.name+'|'+(x.dist||x.district)),x])).values()];
  if(ded.length>=295&&ded.length<=305)return {rows:ded,source:'실시간 22대 국회 데이터',quality:'current'};
 }catch(e){console.warn('dogam sync failed',e)}
 // 2) Fallback official-API-derived dataset.
 try{
  const t=await fetchText('https://raw.githubusercontent.com/kyusik-yang/assemblykor/main/inst/extdata/legislators.csv');
  const rows=parseAssemblyCsv(t);if(rows.length>=290)return {rows,source:'국회 공개데이터 기반 스냅샷',quality:'fallback'};
 }catch(e){console.warn('assemblykor sync failed',e)}
 // 3) Older bundled real-name fallback from public repo.
 try{
  const t=await fetchText('https://raw.githubusercontent.com/justbuildpd-sudo/newsbot/04927abaea56c42583f9c6d527477a4e5990b221/backend/hardcoded_members.py');
  const json=t.replace(/^\s*HARDCODED_MEMBERS\s*=\s*/,'').trim();const rows=JSON.parse(json);if(rows.length>=280)return {rows,source:'실명 백업 스냅샷',quality:'older'};
 }catch(e){console.warn('fallback sync failed',e)}
 throw new Error('실제 국회 데이터에 연결하지 못했습니다.');
}
async function syncRealAssembly(show=true,force=false){
 ensureV7();if(S.v7.roster.status==='ready'&&!force){if(show)toast(`실명 국회 ${S.v7.roster.currentCount}명 로드됨`);return true}
 S.v7.roster.status='loading';if(show)toast('실제 국회 명단을 동기화 중…');
 try{
  const {rows,source,quality}=await loadCurrentRoster();let mps=rows.map(normalizeRealMP).filter(x=>x.name&&x.party);
  mps=[...new Map(mps.map(x=>[x.name+'|'+x.district,x])).values()];
  // The 22nd Assembly has 300 seats; if current sitting members are 299, keep the vacancy visible rather than inventing a person.
  const realCount=mps.length;
  while(mps.length<300){const vn=mps.length+1;mps.push({id:'VACANT'+String(vn).padStart(3,'0'),name:'공석',party:'공석',startParty:'공석',district:'현재 결원',committee:'-',real:false,vacant:true,loyalty:0,ambition:0,integrity:0,influence:0,relation:0,ideology:0,term:0,scandal:0,rebel:false,simFaction:'-'})}
  if(mps.length>300)mps=mps.slice(0,300);
  S.v6.parliament.mps=mps;S.v6.parliament.speaker='조정식';
  S.v7.roster={status:'ready',source,quality,snapshot:V7.snapshot,lastSync:new Date().toISOString(),currentCount:mps.filter(x=>!x.vacant).length,vacancies:mps.filter(x=>x.vacant).length};
  save();if(show)toast(`실명 국회 동기화: 현원 ${S.v7.roster.currentCount}명 · 공석 ${S.v7.roster.vacancies}`);return true;
 }catch(e){S.v7.roster.status='error';S.v7.roster.source='오프라인 — V0.6 가상 명단 유지';save();if(show)toast('실명 명단 동기화 실패 — 인터넷 연결 후 다시 시도');return false}
}

partyColor=function(name){return V7_PARTY_COLORS[name]||(name===S.faction.party?'#f092c4':'#9aa8bc')};

/* ---------- UI INJECTION ---------- */
function injectV7UI(){
 const top=$('.top-actions');
 if(top&&!$('#electionBtn'))top.insertAdjacentHTML('afterbegin','<button id="electionBtn">🗳 선거</button><button id="partyWarBtn">⚔ 당권</button><button id="intelBtn">🕶 정보국</button><button id="powerBoardBtn">⚡ 권력판</button>');
 $('#electionBtn')&&($('#electionBtn').onclick=openElectionHub);$('#partyWarBtn')&&($('#partyWarBtn').onclick=openPartyWar);
 $('#intelBtn')&&($('#intelBtn').onclick=openIntelHub);$('#powerBoardBtn')&&($('#powerBoardBtn').onclick=openPowerBoard);
 const brand=document.querySelector('.brand span');if(brand)brand.textContent='Visual Life & Power Sandbox · V0.7 REAL POLITICS';
 const note=document.querySelector('.simnote');if(note)note.textContent='※ 2026.09.13의 실제 제도·현직자 정보를 출발점으로 사용합니다. 이후의 선거·탈당·표결·계파·사건은 게임 시뮬레이션이며 사실 주장이나 예측이 아닙니다.';
}
injectV7UI();

/* ---------- REAL CONGRESS UI ---------- */
openParliament300=function(){openRealCongress()};
openMPRoster=function(page=0){openRealRoster(page)};
function rosterSummary(){const r=S.v7.roster;return r.status==='ready'?`${r.source} · 현원 ${r.currentCount} · 공석 ${r.vacancies}`:r.status==='loading'?'실명 데이터 동기화 중…':'실명 데이터 미동기화'}
async function openRealCongress(){
 ensureV7();if(S.v7.roster.status!=='ready')await syncRealAssembly(false);
 const p=S.v6.parliament,c=partyCounts(),parties=Object.entries(c).sort((a,b)=>b[1]-a[1]);
 const bars=parties.map(([n,v])=>`<div class="partySeat"><div><span class="partyDot" style="background:${partyColor(n)}"></span><b>${n}</b><em>${v}석</em></div><i><u style="width:${Math.min(100,v/3)}%;background:${partyColor(n)}"></u></i></div>`).join('');
 const body=`<div class="v7RealBanner"><b>대한민국 제22대 국회 · REAL ROSTER</b><span>${rosterSummary()}</span><small>실제 이름·정당·지역구를 사용. 개인의 게임 능력치/계파/관계는 가상 시뮬레이션입니다.</small></div><div class="seatBars">${bars}</div>
 <div class="v7Stats"><div><span>정원</span><b>300</b></div><div><span>현원</span><b>${S.v7.roster.currentCount||p.mps.filter(x=>!x.vacant).length}</b></div><div><span>국회의장</span><b>조정식</b></div><div><span>게임 분기일</span><b>2026.09.13</b></div></div>`;
 modal('🏛️','실명 국회 300석','현실의 국회를 출발점으로 하되, 게임 시작 이후 정치행동은 완전히 별개의 시뮬레이션 세계로 진행됩니다.',[
  ['실제 의원 명부','이름·정당·지역구 검색',()=>openRealRoster(0)],['실명 데이터 새로고침','현재 스냅샷 다시 불러오기',async()=>{closeModal();await syncRealAssembly(true,true);openRealCongress()}],
  ['법안 표결','300석 개별 판정',openBillDesk],['선거 출마','공천→유세→토론→개표',openElectionHub],['당권전쟁','가상 계파·당대표·탈당·합당',openPartyWar],['탄핵 시스템','헌법 절차 기반 시뮬레이션',openImpeachment]
 ],body);
}
function openRealRoster(page=0,query=''){
 const all=S.v6.parliament.mps.filter(m=>!m.vacant);const q=query.trim().toLowerCase();const rows=q?all.filter(m=>(m.name+' '+m.party+' '+m.district).toLowerCase().includes(q)):all;
 const pages=Math.max(1,Math.ceil(rows.length/V7.pageSize));page=clamp(page,0,pages-1);const slice=rows.slice(page*V7.pageSize,(page+1)*V7.pageSize);
 const body=`<div class="v7RosterTop"><input id="v7MpSearch" placeholder="이름·정당·지역구 검색" value="${query.replaceAll('"','&quot;')}"><button id="v7MpSearchBtn">검색</button></div><div class="mpRoster">${slice.map(m=>`<button class="mpCard real" data-mpid="${m.id}"><div><b>${m.name}</b><span style="color:${partyColor(m.party)}">${m.party}</span></div><small>${m.district}</small><em>${m.committee||''}</em></button>`).join('')}</div><div class="pager"><button id="mpPrev">←</button><span>${page+1}/${pages} · ${rows.length}명</span><button id="mpNext">→</button></div><div class="v7FactNote">※ 실명·정당·지역구는 데이터 스냅샷. 관계·영향력·계파·향후 행동은 게임 전용 가상 수치입니다.</div>`;
 modal('👥','22대 국회의원 실명 명부',rosterSummary(),[['국회 홈','돌아가기',openRealCongress]],body);
 $$('.mpCard').forEach(b=>b.onclick=()=>openRealMP(b.dataset.mpid));$('#mpPrev').onclick=()=>openRealRoster(page-1,query);$('#mpNext').onclick=()=>openRealRoster(page+1,query);$('#v7MpSearchBtn').onclick=()=>openRealRoster(0,$('#v7MpSearch').value);$('#v7MpSearch').onkeydown=e=>{if(e.key==='Enter')openRealRoster(0,e.target.value)};
}
function openRealMP(id){
 const m=mp(id);if(!m)return;const body=`<div class="realMpHero"><div class="realSeal">국회</div><div><b>${m.name}</b><span style="color:${partyColor(m.party)}">${m.party}</span><small>${m.district}</small></div></div><div class="v7Stats"><div><span>위원회</span><b>${m.committee||'-'}</b></div><div><span>게임 관계</span><b>${m.relation}</b></div><div><span>게임 영향력</span><b>${m.influence}</b></div><div><span>SIM 계파</span><b>${m.simFaction}</b></div></div><div class="v7SafetyBox">실존 공인: 선거·토론·설득·공개정보·합법적 의회/수사 절차만 상호작용 가능. 불법 폭력·살상 임무 대상 선택은 비활성화됩니다.</div>`;
 const acts=[['정책 면담','관계 개선 · 공개 정책 협상',()=>v7MeetMP(m)],['법안 설득','정치력 판정 · 관계 변화',()=>v7PersuadeMP(m)],['공개 토론','정책 경쟁으로 평판 승부',()=>v7DebateMP(m)],['선거에서 경쟁','해당 지역구 출마 준비',()=>chooseDistrictFromMP(m)],['정보위 공개 브리핑','국정원 경력 시 합법적 보고',()=>v7IntelBriefMP(m)],['명부로','돌아가기',()=>openRealRoster(0,m.name)]];
 modal('🏛️',m.name,`${m.party} · ${m.district}`,acts,body);
}
function v7MeetMP(m){if(!spend(250000))return;m.relation=clamp(m.relation+rnd(3,8),-100,100);S.stats.net=clamp(S.stats.net+1);advance(2,`${m.name} 의원과 정책 면담을 진행했습니다. (게임 시뮬레이션)`);openRealMP(m.id)}
function v7PersuadeMP(m){const ok=Math.random()*100<clamp(30+S.stats.pol*.42+S.stats.cha*.18+m.relation*.3,10,92);m.relation=clamp(m.relation+(ok?6:-3),-100,100);S.stats.reputation=clamp(S.stats.reputation+(ok?1:0));advance(2,ok?`${m.name} 의원과 정책 공조에 성공했습니다. (게임 시뮬레이션)`:`${m.name} 의원 설득이 성과를 내지 못했습니다. (게임 시뮬레이션)`);openRealMP(m.id)}
function v7DebateMP(m){const a=S.stats.cha*.4+S.stats.pol*.35+S.stats.int*.25+rnd(-15,15),b=m.influence*.5+m.loyalty*.25+rnd(0,35);const win=a>b;S.stats.reputation=clamp(S.stats.reputation+(win?3:-1));m.relation=clamp(m.relation+(win?-1:1),-100,100);advance(2,win?`${m.name} 의원과의 정책토론에서 좋은 평가를 받았습니다. (게임 시뮬레이션)`:`${m.name} 의원과의 정책토론에서 밀렸습니다. (게임 시뮬레이션)`);openRealMP(m.id)}
function v7IntelBriefMP(m){if(S.career!=='intel')return toast('국정원 경력이 필요합니다.');S.v7.intel.oversight=clamp(S.v7.intel.oversight+1);S.v7.intel.trust=clamp(S.v7.intel.trust+2);m.relation=clamp(m.relation+2,-100,100);advance(2,`${m.name} 의원에게 적법한 정보위 브리핑을 진행했습니다. (게임 시뮬레이션)`);openRealMP(m.id)}

/* ---------- FULL ELECTION ---------- */
function openElectionHub(){
 ensureV7();const e=S.v7.election;const inc=e.incumbentId?mp(e.incumbentId):null;
 const body=`<div class="campaignHero"><div><span>지역구</span><b>${e.district||'미선택'}</b><small>${inc?`현역: ${inc.name} · ${inc.party}`:'지역구를 먼저 고르세요'}</small></div><strong>${e.stage==='idle'?'준비':e.stage}</strong></div>
 <div class="campaignMeters"><div><span>공천력</span><i><em style="width:${clamp(e.nomination)}%"></em></i><b>${Math.round(e.nomination)}</b></div><div><span>지지율</span><i><em style="width:${clamp(e.poll)}%"></em></i><b>${e.poll.toFixed(1)}%</b></div><div><span>현장조직</span><i><em style="width:${clamp(e.field)}%"></em></i><b>${Math.round(e.field)}</b></div><div><span>TV토론</span><i><em style="width:${clamp(e.debate)}%"></em></i><b>${Math.round(e.debate)}</b></div></div>
 <div class="v7Stats"><div><span>출마 정당</span><b>${e.party||'없음'}</b></div><div><span>선거예산</span><b>${KRW(e.budget)}</b></div><div><span>자원봉사</span><b>${e.volunteers}명</b></div><div><span>상태</span><b>${e.won?'당선':'진행 중'}</b></div></div>`;
 const acts=[['지역구 선택','실제 현역 의원/지역구에서 선택',selectDistrictPrompt],['정당 선택','공천받을 정당 설정',selectElectionParty]];
 if(e.district){acts.push(['공천 경선','정치력·인맥·당내 기반 판정',runNomination],['거리 유세','₩1,000,000 · 지지/조직 강화',campaignStreet],['정책 공약','₩1,500,000 · 지능/정치력 판정',campaignPolicy],['후원회','인맥으로 선거자금 확보',campaignFundraise],['TV 토론','현역/경쟁후보와 정책토론',campaignDebate],['여론조사','표본오차가 있는 현재 추정치',campaignPoll]);if(e.nomination>=50)acts.push(['개표방송','선거일 결과 계산',runElectionNight])}
 modal('🗳️','국회의원 선거','공천 → 지역구 조직 → 정책 → TV토론 → 여론조사 → 개표까지 하나의 캠페인으로 진행됩니다.',acts,body);
}
function selectDistrictPrompt(){
 const q=prompt('출마할 지역구/현역 의원 이름 일부를 입력하세요.\n예: 서울 종로구 / 수원 / 강경숙','서울 종로구');if(!q)return;
 const list=S.v6.parliament.mps.filter(m=>!m.vacant&&(m.district.includes(q)||m.name.includes(q))).slice(0,20);if(!list.length)return toast('일치하는 지역구를 찾지 못했습니다.');
 const body=`<div class="districtPick">${list.map(m=>`<button data-pick="${m.id}"><b>${m.district}</b><span>${m.name} · ${m.party}</span></button>`).join('')}</div>`;modal('📍','지역구 선택',`“${q}” 검색 결과`,[['취소','선거 허브',openElectionHub]],body);$$('[data-pick]').forEach(b=>b.onclick=()=>chooseDistrictFromMP(mp(b.dataset.pick)));
}
function chooseDistrictFromMP(m){const e=S.v7.election;e.district=m.district;e.incumbentId=m.id;e.poll=clamp(7+S.stats.reputation*.12+S.stats.net*.05,4,28);e.stage='출마준비';e.won=false;closeModal();save();openElectionHub()}
function selectElectionParty(){const ps=['더불어민주당','국민의힘','조국혁신당','개혁신당','무소속'];modal('🏳️','출마 정당 선택','실제 정당명은 시작 시점 기준입니다. 이후 공천 결과는 게임 시뮬레이션입니다.',ps.map(p=>[p,'선택',()=>{S.v7.election.party=p;S.v7.party.selected=p;closeModal();openElectionHub()}]))}
function runNomination(){const e=S.v7.election;if(!e.party)return toast('먼저 정당을 선택하세요.');if(e.party==='무소속'){e.nomination=100;e.stage='본선';save();return openElectionHub()}const score=S.stats.pol*.32+S.stats.net*.24+S.stats.reputation*.2+S.inf.political*.16+S.v7.party.leadershipSupport*.08+rnd(-12,15);e.nomination=clamp(score);e.stage=e.nomination>=50?'공천확정':'공천경쟁';advance(7,e.nomination>=50?`${e.party} 공천을 확보했습니다. (게임 시뮬레이션)`:`${e.party} 공천 경쟁에서 아직 우위를 확보하지 못했습니다. (게임 시뮬레이션)`);openElectionHub()}
function campaignStreet(){if(!spend(1000000))return;const e=S.v7.election;e.field=clamp(e.field+rnd(6,12));e.volunteers+=rnd(8,28);e.poll=clamp(e.poll+rnd(1,4)*.7);advance(5,'지역구 거리유세와 자원봉사 조직을 확대했습니다.');openElectionHub()}
function campaignPolicy(){if(!spend(1500000))return;const e=S.v7.election;const ok=Math.random()*100<clamp(35+S.stats.int*.4+S.stats.pol*.3,20,92);e.poll=clamp(e.poll+(ok?rnd(2,5):-1));S.stats.reputation=clamp(S.stats.reputation+(ok?2:0));advance(4,ok?'지역 맞춤 공약이 좋은 평가를 받았습니다.':'정책 공약이 큰 관심을 끌지 못했습니다.');openElectionHub()}
function campaignFundraise(){const e=S.v7.election;const gain=Math.round((S.stats.net*70000+S.stats.reputation*40000)*(.7+Math.random()*.7));e.budget+=gain;S.cash+=Math.round(gain*.05);e.volunteers+=rnd(2,10);advance(3,`합법적 후원회에서 선거자금 ${KRW(gain)}을 모았습니다. (게임)`);openElectionHub()}
function campaignDebate(){const e=S.v7.election,inc=mp(e.incumbentId);const me=S.stats.cha*.4+S.stats.pol*.32+S.stats.int*.28+rnd(-12,14),opp=(inc?.influence||50)*.55+(inc?.loyalty||55)*.2+rnd(0,25);const win=me>opp;e.debate=clamp(e.debate+(win?15:5));e.poll=clamp(e.poll+(win?rnd(3,6):-rnd(1,3)));advance(2,win?`${inc?.name||'상대 후보'}와 TV 정책토론에서 우세 평가를 받았습니다. (게임 시뮬레이션)`:`TV 정책토론에서 상대 후보가 우세 평가를 받았습니다. (게임 시뮬레이션)`);openElectionHub()}
function campaignPoll(){const e=S.v7.election,noise=(Math.random()-.5)*6;const shown=clamp(e.poll+noise);modal('📊','지역구 여론조사',`표본오차를 포함한 게임 내 조사 결과: ${shown.toFixed(1)}%`,[['캠페인으로','계속 선거운동',openElectionHub]],`<div class="pollBar"><i><em style="width:${shown}%"></em></i><b>${shown.toFixed(1)}%</b><small>실제 여론조사가 아닌 게임 수치입니다.</small></div>`)}
function runElectionNight(){const e=S.v7.election;if(e.nomination<50)return toast('공천 또는 무소속 출마 확정이 필요합니다.');const inc=mp(e.incumbentId);const score=e.poll+e.field*.12+e.debate*.1+S.stats.reputation*.08+S.stats.cha*.05+rnd(-8,10);const opp=36+(inc?.influence||50)*.08+rnd(-5,7);const win=score>opp;e.won=win;e.stage='개표완료';
 if(win){const idx=S.v6.parliament.mps.findIndex(x=>x.id===e.incumbentId);if(idx>=0)S.v6.parliament.mps[idx]={id:'PLAYERMP',name:S.name,party:e.party,startParty:e.party,district:e.district,committee:'미정',real:false,player:true,loyalty:75,ambition:80,integrity:65,influence:45,relation:100,ideology:0,term:1,scandal:0,rebel:false,simFaction:S.v7.party.playerFaction};S.career='politics';S.level=Math.max(S.level,3);S.inf.political=clamp(S.inf.political+15);S.stats.reputation=clamp(S.stats.reputation+12);log(`${S.name}이 ${e.district} 국회의원에 당선됐습니다. (게임 시뮬레이션)`)}else log(`${S.name}이 ${e.district} 선거에서 낙선했습니다. (게임 시뮬레이션)`);
 advance(10);modal(win?'🎉':'📺',win?'당선 확정':'낙선',`${e.district} 개표가 끝났습니다. ${win?'당선되어 국회에 입성합니다.':'이번 선거는 패배했지만 인지도와 조직은 남습니다.'}`,[['결과 확인','국회로',openRealCongress],['다시 준비','선거 허브',openElectionHub]],`<div class="electionNight"><b>${S.name} ${Math.round(score)}%</b><span>${inc?.name||'상대 후보'} ${Math.round(opp)}%</span><small>모든 결과는 게임 시뮬레이션</small></div>`)}

/* ---------- PARTY FACTIONS / LEADERSHIP / DEFECTION / MERGER ---------- */
function openPartyWar(){
 ensureV7();const p=S.v7.party,party=p.selected||S.v7.election.party||S.faction.party||'더불어민주당';p.selected=party;const members=S.v6.parliament.mps.filter(m=>m.party===party&&!m.vacant),counts={};V7_FACTIONS.forEach(f=>counts[f]=0);members.forEach(m=>counts[m.simFaction]=(counts[m.simFaction]||0)+1);
 const body=`<div class="partyWarHero"><b>${party}</b><span>당내 권력전쟁 · ${members.length}명</span><small>계파 배정과 향후 행동은 전부 게임 전용 시뮬레이션입니다.</small></div><div class="factionGrid">${V7_FACTIONS.map(f=>`<button data-faction="${f}" class="${p.playerFaction===f?'active':''}"><b>${f}</b><span>${counts[f]||0}명</span></button>`).join('')}</div><div class="v7Stats"><div><span>내 계파</span><b>${p.playerFaction}</b></div><div><span>당권 지지</span><b>${Math.round(p.leadershipSupport)}</b></div><div><span>당대표</span><b>${p.isLeader?'나':'아님'}</b></div><div><span>킹메이커</span><b>${p.kingmaker||'없음'}</b></div></div>`;
 const acts=[['당대표 경선','당내 지지와 정치력으로 승부',runLeadershipRace],['당내 세력 확대','₩8,000,000 · 계파 영향력 증가',growFaction],['탈당','현재 소속을 떠나 무소속',defectPlayer],['신당 창당','기존 정당 창당 시스템',partyOffice],['합당 협상','두 정당의 게임 내 합병 시도',mergePartySim],['킹메이커','다른 정치인을 밀어 권력을 만든다',openKingmaker],['정당 변경','다른 정당 선택',selectElectionParty]];
 modal('⚔️','당권전쟁',`${party} 내부에서 가상의 계파가 경쟁합니다. 실존 의원의 실제 계파나 충성도를 의미하지 않습니다.`,acts,body);$$('[data-faction]').forEach(b=>b.onclick=()=>{p.playerFaction=b.dataset.faction;p.leadershipSupport=clamp(p.leadershipSupport+2);save();openPartyWar()})
}
function growFaction(){if(!spend(8000000))return;S.v7.party.leadershipSupport=clamp(S.v7.party.leadershipSupport+rnd(5,11));S.stats.net=clamp(S.stats.net+2);S.stats.pol=clamp(S.stats.pol+1);advance(10,'당내 조직을 확대했습니다. (게임 시뮬레이션)');openPartyWar()}
function runLeadershipRace(){const p=S.v7.party,score=p.leadershipSupport+S.stats.pol*.35+S.stats.cha*.2+S.stats.reputation*.18+S.inf.political*.15+rnd(-16,18);const win=score>=70;p.isLeader=win;if(win){S.inf.political=clamp(S.inf.political+14);S.stats.reputation=clamp(S.stats.reputation+8);log(`${S.name}이 ${p.selected} 당대표 경선에서 승리했습니다. (게임 시뮬레이션)`)}else{p.leadershipSupport=clamp(p.leadershipSupport+5);log(`${S.name}이 ${p.selected} 당대표 경선에서 패배했습니다. (게임 시뮬레이션)`)}advance(14);modal(win?'👑':'🗳️',win?'당대표 당선':'당대표 경선 패배',win?'이제 공천·당론·연정에 훨씬 강한 영향력을 행사합니다.':'당내 기반은 남았습니다. 다시 세력을 키워 도전할 수 있습니다.',[['당권전쟁','계속',openPartyWar]])}
function playerMP(){return S.v6.parliament.mps.find(m=>m.player)}
function defectPlayer(){const m=playerMP();if(!m)return toast('먼저 국회의원에 당선되어야 합니다.');m.party='무소속';S.v7.party.selected='무소속';S.v7.party.isLeader=false;S.stats.reputation=clamp(S.stats.reputation-2);advance(3,'소속 정당을 탈당해 무소속이 됐습니다. (게임 시뮬레이션)');openPartyWar()}
function mergePartySim(){const a=S.v7.party.selected;if(!a)return toast('정당을 선택하세요.');const opts=['더불어민주당','국민의힘','조국혁신당','개혁신당'].filter(x=>x!==a);modal('🤝','합당 협상',`${a}와 합칠 상대를 선택하세요. 실제 정당의 계획이 아니라 게임 시뮬레이션입니다.`,opts.map(b=>[b,'합당 협상',()=>doMerge(a,b)]))}
function doMerge(a,b){const support=S.v7.party.leadershipSupport+S.stats.pol*.4+S.stats.net*.2+rnd(-20,20);if(support<65){advance(5,`${a}와 ${b}의 합당 협상이 결렬됐습니다. (게임 시뮬레이션)`);return openPartyWar()}const newName=prompt('통합 정당 이름을 입력하세요',a+'연합');if(!newName)return;S.v6.parliament.mps.filter(m=>m.party===a||m.party===b).forEach(m=>m.party=newName);S.v7.party.selected=newName;S.inf.political=clamp(S.inf.political+8);advance(14,`${a}와 ${b}가 ${newName}으로 합당했습니다. (게임 시뮬레이션)`);openPartyWar()}
function openKingmaker(){const candidates=S.v6.parliament.mps.filter(m=>m.real&&!m.vacant).sort((a,b)=>b.influence-a.influence).slice(0,12);const body=`<div class="kingmakerList">${candidates.map(m=>`<button data-king="${m.id}"><b>${m.name}</b><span>${m.party} · ${m.district}</span><em>게임 영향력 ${m.influence}</em></button>`).join('')}</div>`;modal('♛','킹메이커','실존 정치인을 게임 속 후보로 지원할 수 있습니다. 실제 지지·관계·선거예측이 아니라 완전한 시뮬레이션입니다.',[['당권전쟁','돌아가기',openPartyWar]],body);$$('[data-king]').forEach(b=>b.onclick=()=>chooseKingmaker(mp(b.dataset.king)))}
function chooseKingmaker(m){S.v7.party.kingmaker=m.name;S.v7.party.kingmakerPower=clamp(S.v7.party.kingmakerPower+10);m.relation=clamp(m.relation+8,-100,100);advance(5,`${m.name}을 게임 내 정치 프로젝트의 핵심 후보로 지원하기 시작했습니다. (게임 시뮬레이션)`);openPartyWar()}

/* ---------- INTELLIGENCE CAREER ---------- */
function intelPower(){const i=S.v7.intel;return Math.round(i.intel*.25+i.clearance*.18+i.trust*.22+i.analysis*.15+i.field*.12+i.assets*.08-i.exposure*.14)}
function openIntelHub(){
 ensureV7();const i=S.v7.intel;const body=`<div class="intelHero"><div class="intelEmblem">★</div><div><b>국가정보원 CAREER</b><span>${S.career==='intel'?careerName():'비재직'} · 정보력 ${intelPower()}</span><small>실제 기관 명칭은 현실감을 위한 배경. 모든 임무·인물·결과는 게임 시뮬레이션입니다.</small></div></div>
 <div class="intelMeters"><div><span>정보력</span><i><em style="width:${clamp(i.intel)}%"></em></i><b>${i.intel}</b></div><div><span>보안등급</span><i><em style="width:${clamp(i.clearance)}%"></em></i><b>${i.clearance}</b></div><div><span>조직신뢰</span><i><em style="width:${clamp(i.trust)}%"></em></i><b>${i.trust}</b></div><div><span>노출도</span><i class="danger"><em style="width:${clamp(i.exposure)}%"></em></i><b>${i.exposure}</b></div><div><span>국회감시</span><i><em style="width:${clamp(i.oversight)}%"></em></i><b>${i.oversight}</b></div></div>`;
 const acts=[];if(S.career!=='intel')acts.push(['국정원 지원','지능 30 이상 · 신원심사 게임 판정',joinIntel]);else acts.push(['정보 분석 임무','합법 임무 · 분석/신뢰/경력',()=>intelMission('analysis')],['방첩 임무','합법 임무 · 노출 위험 낮음',()=>intelMission('counter')],['산업보안','기업/기술정보 보호',()=>intelMission('industry')],['해외정보','해외 위협 분석 · 정보력 상승',()=>intelMission('foreign')],['대통령 브리핑','고위직 해금 · 정치 영향',presidentialIntelBrief],['BLACK DESK','가상 적대세력 대상 고위험 임무',openBlackDesk],['감찰/정보위','노출과 조직신뢰 관리',openIntelOversight],['퇴직','정보기관 경력 종료',quitCareer]);
 modal('🕶️','정보국',`정보력이 높을수록 위기 이벤트를 미리 탐지하고 정치·외교·산업 사건에서 추가 선택지가 열립니다.`,acts,body)
}
function joinIntel(){if(S.stats.int<30)return toast('지능 30 이상이 필요합니다.');const ok=Math.random()*100<clamp(45+S.stats.int*.35+S.stats.reputation*.1-S.heat*.25,25,94);if(!ok){S.v7.intel.oversight=clamp(S.v7.intel.oversight+2);advance(7,'국정원 채용 심사에서 탈락했습니다. (게임 시뮬레이션)');return openIntelHub()}S.career='intel';S.level=0;S.xp=0;S.v7.intel.clearance=12;S.v7.intel.trust=22;S.v7.intel.intel=20;S.v7.intel.analysis=25;advance(14,'국가정보원 정보관 커리어를 시작했습니다. (게임 시뮬레이션)');openIntelHub()}
function intelMission(type){if(S.career!=='intel')return toast('국정원 경력이 필요합니다.');const i=S.v7.intel;const cfg={analysis:['국가안보 정보분석',5,1,5,0],counter:['방첩 사건 분석',4,2,4,1],industry:['산업기술 보호',4,1,3,0],foreign:['해외정보 수집·분석',6,2,4,2]}[type];const score=S.stats.int*.45+S.stats.net*.15+i.analysis*.25+i.field*.15-rnd(0,28);const ok=score>38;i.intel=clamp(i.intel+(ok?cfg[1]:1));i.trust=clamp(i.trust+(ok?cfg[2]:0));i.analysis=clamp(i.analysis+(type==='analysis'?cfg[3]:2));i.field=clamp(i.field+(type==='foreign'||type==='counter'?2:0));i.exposure=clamp(i.exposure+(ok?cfg[4]:cfg[4]+3));addXP(ok?18:8);advance(5,ok?`${cfg[0]} 임무를 성공적으로 마쳤습니다. (게임)`:`${cfg[0]} 임무에서 충분한 성과를 얻지 못했습니다. (게임)`);openIntelHub()}
function presidentialIntelBrief(){const i=S.v7.intel;if(S.career!=='intel'||S.level<4)return toast('팀장급 이상에서 해금됩니다.');const ok=Math.random()*100<clamp(50+i.intel*.3+i.trust*.25+i.analysis*.2,30,95);i.briefings++;i.trust=clamp(i.trust+(ok?5:-1));S.inf.political=clamp(S.inf.political+(ok?3:0));S.v6.world.globalTension=clamp(S.v6.world.globalTension-(ok?2:0));advance(3,ok?'대통령실 안보 브리핑이 높은 평가를 받았습니다. (게임 시뮬레이션)':'브리핑이 기대만큼 설득력을 얻지 못했습니다. (게임 시뮬레이션)');openIntelHub()}
function openIntelOversight(){const i=S.v7.intel;modal('⚖️','정보기관 감찰·통제','노출도가 커질수록 국회 정보위·감찰·언론 리스크가 커집니다. 합법 임무와 내부통제로 신뢰를 회복할 수 있습니다.',[['내부감찰 강화','노출 -12 · 신뢰 +3 · 활동 제약',()=>{i.exposure=clamp(i.exposure-12);i.trust=clamp(i.trust+3);advance(7,'내부감찰과 통제를 강화했습니다.');openIntelHub()}],['정보위 보고','감시 +5 · 노출 -6 · 정치신뢰 증가',()=>{i.oversight=clamp(i.oversight+5);i.exposure=clamp(i.exposure-6);i.trust=clamp(i.trust+2);advance(3,'국회 정보위원회에 적법한 업무보고를 했습니다.');openIntelHub()}],['정보국으로','돌아가기',openIntelHub]],`<div class="v7Stats"><div><span>노출도</span><b>${i.exposure}</b></div><div><span>국회감시</span><b>${i.oversight}</b></div><div><span>조직신뢰</span><b>${i.trust}</b></div><div><span>블랙임무</span><b>${i.blackOps}</b></div></div>`)}
function openBlackDesk(){const i=S.v7.intel;if(S.career!=='intel'||S.level<2)return toast('현장 정보관 이상에서 해금됩니다.');const targets=i.targets.filter(t=>t.active);const body=`<div class="blackDeskWarning"><b>BLACK DESK · FICTIONAL TARGETS ONLY</b><span>여기의 적대 공작원·조직은 모두 가상입니다. 현실 인물 프로필에는 이 메뉴가 연결되지 않습니다.</span></div><div class="blackTargets">${targets.map(t=>`<button data-black="${t.id}"><b>${t.name}</b><span>${t.type}</span><em>위협 ${t.threat}</em></button>`).join('')}</div>`;modal('⬛','BLACK DESK','고위험 비공식 임무는 성공해도 노출·감찰·정치적 후폭풍이 발생할 수 있습니다. 실행 방식은 묘사하지 않고 게임 수치로만 처리합니다.',[['정보국으로','돌아가기',openIntelHub]],body);$$('[data-black]').forEach(b=>b.onclick=()=>openBlackTarget(b.dataset.black))}
function openBlackTarget(id){const t=S.v7.intel.targets.find(x=>x.id===id);if(!t||!t.active)return openBlackDesk();const body=`<div class="blackTarget"><b>${t.name}</b><span>${t.type}</span><em>위협도 ${t.threat} · 정보가치 ${t.value}</em></div>`;modal('🎯',t.name,'가상의 적대세력을 상대로 한 추상적 임무입니다. 구체적 수법·무기·위치·작전절차는 게임에 존재하지 않습니다.',[['감시·추적','정보 확보 · 위험 낮음',()=>blackMission(t,'track')],['네트워크 차단','활동능력 약화 · 중위험',()=>blackMission(t,'disrupt')],['신병 확보','가상 대상 생포 판정 · 고위험',()=>blackMission(t,'capture')],['제거 승인','가상 적대 공작원/조직 제거 판정 · 최고위험',()=>blackMission(t,'remove')],['취소','BLACK DESK',openBlackDesk]],body)}
function blackMission(t,type){const i=S.v7.intel;const diff={track:25,disrupt:42,capture:58,remove:68}[type];const score=i.intel*.32+i.field*.28+i.trust*.12+S.stats.int*.18+S.stats.lead*.1-rnd(0,38);const ok=score>diff;const exposure={track:2,disrupt:7,capture:12,remove:18}[type];i.exposure=clamp(i.exposure+(ok?exposure:exposure+12));i.blackOps++;i.intel=clamp(i.intel+(ok?5:1));i.field=clamp(i.field+(ok?4:1));i.trust=clamp(i.trust+(ok?2:-5));if(ok&&type==='remove'){t.active=false;S.v6.world.globalTension=clamp(S.v6.world.globalTension-2)}if(ok&&type==='capture'){t.threat=clamp(t.threat-25)}if(ok&&type==='disrupt'){t.threat=clamp(t.threat-18)}if(i.exposure>70){S.stats.reputation=clamp(S.stats.reputation-5);S.v7.intel.oversight=clamp(i.oversight+12);log('비공식 임무 노출 논란으로 국회·감찰 압력이 커졌습니다. (게임 시뮬레이션)')}advance(5,ok?`${t.name} 대상 ${type==='remove'?'제거':type==='capture'?'신병 확보':type==='disrupt'?'네트워크 차단':'감시'} 임무가 성공했습니다. (가상 게임 대상)`:`${t.name} 대상 임무가 실패해 노출 위험이 커졌습니다. (가상 게임 대상)`);openBlackDesk()}

/* Quick work support for intelligence career */
const v7BaseQuick=quick;quick=function(q){if(q==='work'&&S.career==='intel'){intelMission('analysis');return}return v7BaseQuick(q)};

/* ---------- POWER BOARD ---------- */
function openPowerBoard(){
 ensureV7();const pp=clamp(power());const rows=V7_POWER_SNAPSHOT.map(x=>x.name==='플레이어'?{...x,name:S.name,role:careerName(),score:pp,why:'게임 내 POWER INDEX를 반영'}:x).sort((a,b)=>b.score-a.score).map((x,i)=>`<div class="powerRank ${x.name===S.name?'me':''}"><strong>${i+1}</strong><div><b>${x.name}</b><span>${x.role} · ${x.institution}</span><small>${x.why}</small></div><em>${x.score}</em></div>`).join('');
 const body=`<div class="v7PowerNote"><b>2026.09.13 GAME INFLUENCE BOARD</b><span>공식적인 대한민국 ‘권력순위’는 존재하지 않습니다. 아래 숫자는 헌법상 권한·직책·조직·정당·정보 영향력을 단순화한 게임용 주관적 지수입니다.</span></div><div class="powerRanking">${rows}</div>`;
 modal('⚡','현재 권력판','게임 시작 시점의 현실 직책을 기반으로 한 영향력 보드입니다. 게임이 진행되면 플레이어가 이 순위를 뒤집을 수 있습니다.',[['킹메이커','직접 대통령이 되지 않고 권력을 만든다',openKingmaker],['실명 국회','의원 300석 보기',openRealCongress],['국정원','정보 권력 루트',openIntelHub],['국가','대통령·제도',showPolitics]],body)
}

/* ---------- MONTHLY DYNAMIC PARTY & INTEL EVENTS ---------- */
function v7Month(){ensureV7();const i=S.v7.intel;if(S.career==='intel'){i.exposure=clamp(i.exposure-2);if(Math.random()<.18){i.intel=clamp(i.intel+1);log('정보망 분석으로 잠재 위협 신호를 포착했습니다. (게임 시뮬레이션)')}}
 // After divergence, neutral political moves among real-name NPCs are fictional simulation.
 if(S.v7.roster.status==='ready'&&Math.random()<.035){const real=S.v6.parliament.mps.filter(m=>m.real&&!m.vacant);const m=real[rnd(0,real.length-1)];if(m){const action=Math.random()<.55?'당내 계파 이동':'지도부와 공개 이견';log(`${m.name} 의원에게 ${action} 이벤트가 발생했습니다. (게임 시뮬레이션 · 실제 사실 아님)`)}}
 if(S.v7.party.kingmaker&&Math.random()<.12){S.v7.party.kingmakerPower=clamp(S.v7.party.kingmakerPower+rnd(1,4));log(`${S.v7.party.kingmaker} 지원 프로젝트의 게임 내 영향력이 커졌습니다. (시뮬레이션)`)}}
const v7BaseMonthlyTick=monthlyTick;monthlyTick=function(){v7BaseMonthlyTick();v7Month()};

/* safer future-event note in feed */
const v7BaseUpdateAll=updateAll;updateAll=function(){ensureV7();v7BaseUpdateAll();if(S.career==='intel'&&S.level>=7)S.v7.intel.director=true};

/* New-game reset also re-initializes V0.7 and re-syncs the real roster. */
const v7BaseStartBackground=startBackground;
startBackground=function(bg){v7BaseStartBackground(bg);ensureV7();S.v7.roster.status='pending';save();setTimeout(()=>syncRealAssembly(false,true).then(()=>{updateAll();save()}),120)};

/* Auto-sync real roster once. Cache remains inside save after successful load. */
setTimeout(()=>{ensureV7();if(S.v7.roster.status!=='ready')syncRealAssembly(false).then(ok=>{if(ok){updateAll();save()}})},900);

/* Testing shortcuts: F5 election hub, F6 intel hub, F7 power board */
document.addEventListener('keydown',e=>{if(e.key==='F5'){e.preventDefault();openElectionHub()}if(e.key==='F6'){e.preventDefault();openIntelHub()}if(e.key==='F7'){e.preventDefault();openPowerBoard()}});

updateAll();
