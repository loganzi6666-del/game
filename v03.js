/* LIFE : RISE V0.3 - NPCs, vehicles, career events, government */
const V3={inEvent:false,eventOpening:false};
const NPCS={
 seoyun:{name:"서윤",role:"NOVA 전략팀",icon:"👩🏻‍💼",loc:"corp",zone:[42,12,56,27],romance:true,help:"business"},
 minjae:{name:"민재",role:"정당 전략보좌관",icon:"🧑🏻‍💼",loc:"parliament",zone:[79,39,94,56],romance:false,help:"political"},
 dohyun:{name:"도현",role:"육군 장교",icon:"🧑🏻‍✈️",loc:"military",zone:[5,42,20,58],romance:false,help:"military"},
 yuna:{name:"유나",role:"변호사 · 정치권 인맥",icon:"👩🏻‍⚖️",loc:"parliament",zone:[72,33,89,49],romance:true,help:"political"},
 emma:{name:"Emma",role:"외국계 금융",icon:"👩🏼‍💼",loc:"bank",zone:[39,42,55,57],romance:true,help:"business"},
 jisoo:{name:"지수",role:"NEWS 24 기자",icon:"👩🏻‍💻",loc:"media",zone:[73,36,88,52],romance:false,help:"media"}
};

function ensureV3(){
 S.version=3;
 S.relations=S.relations||{};S.romance=S.romance||{};
 Object.keys(NPCS).forEach(k=>{if(S.relations[k]==null)S.relations[k]=rnd(6,18);if(NPCS[k].romance&&S.romance[k]==null)S.romance[k]=rnd(4,12)});
 S.v3=S.v3||{};
 S.v3.eventCooldown=S.v3.eventCooldown||0;S.v3.eventsSeen=S.v3.eventsSeen||[];S.v3.scheduled=S.v3.scheduled||[];
 S.v3.vehicleMode=!!S.v3.vehicleMode;S.v3.interiorX=S.v3.interiorX||48;S.v3.interiorY=S.v3.interiorY||76;
 S.v3.npcs=S.v3.npcs||{};S.v3.rivalry=S.v3.rivalry||{};
 Object.entries(NPCS).forEach(([k,n])=>{if(!S.v3.npcs[k])S.v3.npcs[k]={x:(n.zone[0]+n.zone[2])/2,y:(n.zone[1]+n.zone[3])/2};if(S.v3.rivalry[k]==null)S.v3.rivalry[k]=0});
 S.v3.gov=S.v3.gov||{approval:55,treasury:30000000000000,debt:0,tax:24,foreign:50,integrity:55,termStart:null};
 S.v3.flags=S.v3.flags||{};
 S.v3.eventCount=S.v3.eventCount||0;
}
ensureV3();

function injectV3UI(){
 const top=$('.top-actions');
 if(top&&!$('#peopleBtn')){
  top.insertAdjacentHTML('afterbegin','<button id="peopleBtn" class="v3-btn">👥 인물</button><button id="driveBtn" class="v3-btn">🚘 운전</button><button id="governBtn" class="v3-btn hidden">🇰🇷 국정</button>');
  $('#peopleBtn').onclick=showPeople;$('#driveBtn').onclick=toggleDrive;$('#governBtn').onclick=openGovernment;
 }
 if(!$('#eventBadge'))document.body.insertAdjacentHTML('beforeend','<div id="eventBadge"><b>V0.3 · 살아있는 세계</b><span>직업 사건, NPC 관계, 라이벌, 운전, 대통령 국정 운영이 활성화되었습니다.</span></div>');
 const world=$('#world');
 if(world&&!$('#npcLayer'))world.insertAdjacentHTML('beforeend','<div id="npcLayer"></div>');
 const interior=$('#interior');
 if(interior&&!$('#interiorNpcLayer')){
  interior.insertAdjacentHTML('afterbegin','<div class="interiorRoom roomA"><span>ROOM A</span></div><div class="interiorRoom roomB"><span>ROOM B</span></div><div class="interiorRoom roomC"><span>ROOM C</span></div><div class="interiorRoom roomD"><span>ROOM D</span></div><div id="interiorNpcLayer"></div>');
  interior.addEventListener('click',e=>{
    if(S.location==='city'||e.target.closest('button,.hotspot,.interiorNpc'))return;
    const r=interior.getBoundingClientRect();S.v3.interiorX=clamp((e.clientX-r.left)/r.width*100,5,90);S.v3.interiorY=clamp((e.clientY-r.top)/r.height*100,8,88);renderInteriorAvatar();save();
  });
 }
 const nat=$('.national');
 if(nat&&!$('#v3GovMini'))nat.insertAdjacentHTML('beforeend','<div id="v3GovMini" class="systemList" style="margin-top:8px"></div>');
}
injectV3UI();

function renderInteriorAvatar(){
 const a=$('.interiorAvatar');if(!a)return;a.style.left=S.v3.interiorX+'%';a.style.top=S.v3.interiorY+'%';a.style.bottom='auto';
}
function renderNPCs(){
 const layer=$('#npcLayer');if(!layer)return;layer.innerHTML='';
 Object.entries(NPCS).forEach(([k,n])=>{
  const st=S.v3.npcs[k],r=S.v3.rivalry[k]||0;const d=document.createElement('div');d.className='worldNpc'+(r>=50?' npc-rival':'');d.style.left=st.x+'%';d.style.top=st.y+'%';d.dataset.npc=k;
  d.innerHTML=`<div class="npcTag">${n.name}</div><div class="npcHead"></div><div class="npcHair"></div><div class="npcBody"></div>`;
  d.onclick=e=>{e.stopPropagation();npcInteract(k)};layer.appendChild(d)
 });
}
function wanderNPCs(){
 if(S.location!=='city'||!$('#startScreen').classList.contains('hidden'))return;
 Object.entries(NPCS).forEach(([k,n])=>{let st=S.v3.npcs[k];st.x=clamp(st.x+rnd(-4,4),n.zone[0],n.zone[2]);st.y=clamp(st.y+rnd(-3,3),n.zone[1],n.zone[3])});renderNPCs();
}
setInterval(wanderNPCs,2600);

function renderInteriorNPCs(){
 const layer=$('#interiorNpcLayer');if(!layer)return;layer.innerHTML='';
 Object.entries(NPCS).filter(([k,n])=>n.loc===S.location).slice(0,2).forEach(([k,n],idx)=>{
  const d=document.createElement('div');d.className='interiorNpc';d.style.left=(24+idx*46)+'%';d.style.top=(28+idx*30)+'%';d.innerHTML=`<div class="npcTag">${n.name}</div><div class="npcHead"></div><div class="npcHair"></div><div class="npcBody"></div>`;d.onclick=e=>{e.stopPropagation();npcInteract(k)};layer.appendChild(d)
 });
 renderInteriorAvatar();
}

function relationTier(v){return v>=80?'절대적 신뢰':v>=60?'친밀':v>=40?'우호':v>=20?'지인':v>=0?'서먹함':'적대'}
function npcInteract(k){
 const n=NPCS[k],rel=S.relations[k]||0,riv=S.v3.rivalry[k]||0,rom=S.romance[k]||0;
 const body=`<div class="npcSheet"><div class="npcSheetRow"><div class="npcAvatarBig">${n.icon}</div><div><b>${n.name}</b><span>${n.role} · ${relationTier(rel)}</span><div class="rivalMeter"><i style="width:${clamp(riv)}%"></i></div></div><em>관계 ${Math.round(rel)}<br>경쟁 ${Math.round(riv)}</em></div></div>`;
 const acts=[
  ['대화한다','관계 +2~6 · 매력 성장',()=>{S.relations[k]=clamp(rel+rnd(2,6),-100,100);S.stats.cha=clamp(S.stats.cha+1);closeModal();advance(1,`${n.name}와 이야기를 나눴습니다.`)}],
  ['도움을 부탁한다',`관계 35+ 권장 · ${n.help} 영향력`,()=>npcFavor(k)],
  ['경쟁한다','성과 경쟁 · 성공 시 경력/영향력, 실패 시 관계 악화',()=>npcRival(k)]
 ];
 if(n.romance&&!S.spouse)acts.push(['데이트 신청',`호감 ${Math.round(rom)} · 관계에 따라 성공률 변화`,()=>npcDate(k)]);
 if(S.faction.party&&rel>=55)acts.push(['정당에 합류 제안',`${S.faction.party} 조직 확대`,()=>recruitNPC(k)]);
 modal(n.icon,n.name,`${n.role}. 이 인물은 플레이어와 별개로 도시 안에서 움직이며 관계와 경쟁 상태가 누적됩니다.`,acts,body)
}
function npcFavor(k){const n=NPCS[k],rel=S.relations[k]||0;if(rel<35)return toast('관계 35 이상이 필요합니다.');S.relations[k]=clamp(rel-3,-100,100);S.inf[n.help]=clamp((S.inf[n.help]||0)+3);S.stats.net=clamp(S.stats.net+2);closeModal();advance(2,`${n.name}의 도움으로 ${n.help} 영향력이 커졌습니다.`)}
function npcRival(k){const n=NPCS[k],chance=clamp(45+S.stats.int*.25+S.stats.cha*.15-S.v3.rivalry[k]*.15,20,88),ok=Math.random()*100<chance;S.v3.rivalry[k]=clamp(S.v3.rivalry[k]+rnd(5,10));if(ok){addXP(10);S.stats.reputation=clamp(S.stats.reputation+2);S.relations[k]=clamp(S.relations[k]-2,-100,100);log(`${n.name}와의 경쟁에서 우위를 점했습니다.`)}else{S.stats.stress=clamp(S.stats.stress+6);S.relations[k]=clamp(S.relations[k]-7,-100,100);S.stats.reputation=clamp(S.stats.reputation-1);log(`${n.name}와의 경쟁에서 밀렸습니다.`)}closeModal();advance(3);toast(ok?'경쟁에서 승리했습니다.':'경쟁에서 밀렸습니다.')}
function npcDate(k){const n=NPCS[k],rel=S.relations[k]||0,rom=S.romance[k]||0;if(!spend(650000))return;const chance=clamp(38+rel*.45+S.stats.cha*.35,20,94),ok=Math.random()*100<chance;if(ok){S.romance[k]=clamp(rom+rnd(7,12));S.relations[k]=clamp(rel+rnd(3,6),-100,100);S.stats.stress=clamp(S.stats.stress-5);log(`${n.name}와의 데이트가 잘 풀렸습니다.`)}else{S.romance[k]=clamp(rom-2);S.relations[k]=clamp(rel-1,-100,100);log(`${n.name}와의 데이트 분위기가 어색했습니다.`)}closeModal();advance(2);toast(ok?'데이트 성공':'분위기가 어색했습니다.')}
function recruitNPC(k){const n=NPCS[k];S.relations[k]=clamp(S.relations[k]+3,-100,100);S.faction.partySupport=clamp(S.faction.partySupport+2);S.stats.net=clamp(S.stats.net+2);closeModal();advance(5,`${n.name}가 ${S.faction.party}와 협력하기 시작했습니다.`)}
function showPeople(){
 const body=`<div class="npcSheet">${Object.entries(NPCS).map(([k,n])=>`<div class="npcSheetRow"><div class="npcAvatarBig">${n.icon}</div><div><b>${n.name}</b><span>${n.role} · ${relationTier(S.relations[k]||0)}</span><div class="rivalMeter"><i style="width:${clamp(S.v3.rivalry[k]||0)}%"></i></div></div><em>관계 ${Math.round(S.relations[k]||0)}<br>경쟁 ${Math.round(S.v3.rivalry[k]||0)}</em></div>`).join('')}</div>`;
 modal('👥','인물 관계','NPC들은 도시에서 이동하고, 시간이 지나며 친구·연인·라이벌·정치적 동맹이 될 수 있습니다.',Object.entries(NPCS).map(([k,n])=>[n.name,n.role,()=>npcInteract(k)]),body)
}

function toggleDrive(){
 ensureV3();if(!S.assets.car)return toast('먼저 자동차를 구입하세요.');if(S.location!=='city')return toast('도시 화면에서 운전할 수 있습니다.');S.v3.vehicleMode=!S.v3.vehicleMode;renderVehicle();save();toast(S.v3.vehicleMode?`${S.assets.car.n} 운전 시작`:'차에서 내렸습니다.')
}
function renderVehicle(){const p=$('#player'),w=$('#world'),b=$('#driveBtn');if(!p)return;p.classList.toggle('driving',!!S.v3.vehicleMode);w?.classList.toggle('vehicle-active',!!S.v3.vehicleMode);if(b)b.textContent=S.v3.vehicleMode?'🚘 운전중':'🚘 운전'}
function vehicleKey(e){
 if(!S.v3.vehicleMode||S.location!=='city'||!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','e','E'].includes(e.key))return;
 e.preventDefault();e.stopImmediatePropagation();let step=5.2;if(['w','ArrowUp'].includes(e.key))S.py-=step;if(['s','ArrowDown'].includes(e.key))S.py+=step;if(['a','ArrowLeft'].includes(e.key))S.px-=step;if(['d','ArrowRight'].includes(e.key))S.px+=step;S.px=clamp(S.px,2,94);S.py=clamp(S.py,5,90);renderPlayer();
 if(e.key.toLowerCase()==='e'){let best=null,dist=999;Object.entries(mapPos).forEach(([k,[x,y]])=>{let dd=Math.hypot(S.px-x,S.py-y);if(dd<dist){dist=dd;best=k}});if(dist<16){S.v3.vehicleMode=false;renderVehicle();enter(best)}else toast('건물에 더 가까이 주차하세요.')}
 save();
}
document.addEventListener('keydown',vehicleKey,true);

const baseEnterV3=enter;enter=function(loc){S.v3.vehicleMode=false;renderVehicle();baseEnterV3(loc);renderInteriorNPCs()};
const baseExitV3=exitInterior;exitInterior=function(){baseExitV3();renderNPCs();renderVehicle()};
const baseRenderPlayerV3=renderPlayer;renderPlayer=function(){baseRenderPlayerV3();renderVehicle()};

function deltaText(d){
 const parts=[];if(d.cash)parts.push(`${d.cash>0?'+':''}${KRW(d.cash)}`);if(d.xp)parts.push(`경력 +${d.xp}`);if(d.heat)parts.push(`수사위험 ${d.heat>0?'+':''}${d.heat}`);
 const labels={int:'지능',cha:'매력',lead:'리더십',pol:'정치력',net:'인맥',health:'건강',stress:'스트레스',reputation:'평판',notoriety:'악명'};
 Object.entries(d.stats||{}).forEach(([k,v])=>parts.push(`${labels[k]||k} ${v>0?'+':''}${v}`));const il={political:'정치영향',business:'기업영향',military:'군영향',media:'언론영향',under:'지하영향'};Object.entries(d.inf||{}).forEach(([k,v])=>parts.push(`${il[k]||k} ${v>0?'+':''}${v}`));return parts.join(' · ')
}
function applyDelta(d={}){
 if(d.cash)S.cash+=d.cash;if(d.xp)addXP(d.xp);if(d.heat)S.heat=clamp(S.heat+d.heat);
 Object.entries(d.stats||{}).forEach(([k,v])=>S.stats[k]=clamp((S.stats[k]||0)+v,k==='reputation'||k==='notoriety'?0:0,100));
 Object.entries(d.inf||{}).forEach(([k,v])=>S.inf[k]=clamp((S.inf[k]||0)+v));
 Object.entries(d.nation||{}).forEach(([k,v])=>S.nation[k]=clamp((S.nation[k]||0)+v));
 Object.entries(d.relations||{}).forEach(([k,v])=>S.relations[k]=clamp((S.relations[k]||0)+v,-100,100));
 if(d.partySupport)S.faction.partySupport=clamp((S.faction.partySupport||0)+d.partySupport);
 if(d.govApproval)S.v3.gov.approval=clamp(S.v3.gov.approval+d.govApproval);
}
function scheduleEvent(id,days){S.v3.scheduled.push({id,days})}
function choice(label,desc,outcome,opt={}){return {label,desc,outcome,...opt}}
function evt(id,career,icon,title,text,choices,opt={}){return {id,career,icon,title,text,choices,...opt}}

const EVENTS=[
 evt('corp_deadline','corp','🔥','납기 48시간 전','핵심 프로젝트가 예상보다 크게 밀렸다. 임원은 “이번 주 안에 반드시 끝내라”고 압박한다.',[
  choice('내가 직접 책임진다','지능 판정 · 성공하면 큰 승진점수', {success:{xp:28,stats:{reputation:4,stress:12,int:1},inf:{business:4}},fail:{xp:5,stats:{reputation:-3,stress:16}},successText:'팀을 재정비해 프로젝트를 살려냈습니다.',failText:'무리하게 밀어붙였지만 일정과 품질 모두 흔들렸습니다.'},{check:['int',43]}),
  choice('임원을 설득해 범위를 줄인다','정치력 판정 · 위험을 낮추는 현실적 선택',{success:{xp:16,stats:{pol:2,net:2,stress:5},inf:{business:2}},fail:{stats:{reputation:-2,stress:7}},successText:'핵심 범위에 집중하도록 합의를 끌어냈습니다.',failText:'임원은 핑계로 받아들였습니다.'},{check:['pol',38]}),
  choice('팀원에게 강하게 밀어붙인다','빠른 성과 가능 · 관계와 평판 위험',{success:{xp:19,stats:{lead:2,stress:7,reputation:1},relations:{seoyun:-3}},fail:{xp:4,stats:{stress:10,reputation:-4},relations:{seoyun:-6}},successText:'팀이 이를 악물고 마감에 맞췄습니다.',failText:'팀 사기가 무너지며 문제가 더 커졌습니다.'},{check:['lead',45]})
 ],{minLevel:0}),
 evt('corp_credit','corp','🧑‍💼','상사가 당신의 공을 가져갔다','회의에서 상사가 당신의 아이디어를 자기 성과처럼 발표했다. 주변 동료들은 상황을 알고 있다.',[
  choice('회의에서 즉시 바로잡는다','매력/평판 승부 · 성공 시 존재감 상승',{success:{xp:18,stats:{cha:2,reputation:4,stress:4},inf:{business:2}},fail:{stats:{reputation:-3,stress:8}},successText:'차분한 근거로 주도권을 되찾았습니다.',failText:'공개 충돌로 비쳤고 분위기가 차가워졌습니다.'},{check:['cha',44]}),
  choice('상사와 1:1로 협상한다','정치력 판정 · 장기적으로 안전',{success:{xp:14,stats:{pol:3,net:2},inf:{business:2}},fail:{stats:{stress:5},relations:{seoyun:1}},successText:'다음 인사평가에 기여도를 명확히 반영하기로 했습니다.',failText:'상사는 말을 돌렸지만 당신은 내부 사정을 더 파악했습니다.'},{check:['pol',40]}),
  choice('기록만 남기고 다음 기회를 노린다','스트레스 낮음 · 경력 소폭 상승',{xp:8,stats:{int:1,stress:-2},relations:{seoyun:2},resultText:'감정적으로 움직이지 않고 증거와 성과를 쌓기로 했습니다.'})
 ]),
 evt('corp_headhunt','corp','📨','경쟁사 헤드헌팅 제안','경쟁사에서 높은 계약금과 빠른 직급 상승을 제시했다. 하지만 현재 회사의 핵심 프로젝트도 당신을 필요로 한다.',[
  choice('제안을 받아 협상카드로 쓴다','현금 보너스 · 사내 평판 변동',{cash:25000000,xp:12,stats:{pol:2,reputation:-1,net:3},inf:{business:3},resultText:'이직 가능성을 지렛대로 보상과 역할을 재협상했습니다.'}),
  choice('충성도를 보여주며 거절한다','평판/기업 영향력 상승',{xp:20,stats:{reputation:4,stress:2},inf:{business:4},relations:{seoyun:3},resultText:'회사 핵심 인재라는 인식이 강해졌습니다.'}),
  choice('조용히 시장가치만 확인한다','지능/인맥 성장',{xp:9,stats:{int:2,net:3},resultText:'시장가치를 파악하고 다음 이동을 준비했습니다.'})
 ],{minLevel:1}),
 evt('corp_layoff','corp','📉','구조조정 명단','경기 둔화로 팀 인원을 줄여야 한다. 실적만 보면 답은 분명하지만, 오래 함께한 직원들이 포함돼 있다.',[
  choice('성과 기준으로 냉정하게 정리','기업 영향력 상승 · 관계/민심 손실',{xp:22,stats:{lead:3,reputation:-3,stress:7},inf:{business:5},nation:{mood:-1},resultText:'비용은 줄었지만 조직 분위기가 싸늘해졌습니다.'}),
  choice('임원과 대체안을 만든다','지능 판정 · 성공 시 모두 이득',{success:{xp:26,stats:{int:2,reputation:5,pol:2},inf:{business:4}},fail:{xp:7,stats:{stress:8,reputation:-2}},successText:'업무 재배치와 비용 절감안을 만들어 해고 규모를 크게 줄였습니다.',failText:'대안은 숫자를 맞추지 못했고 결정은 미뤄졌습니다.'},{check:['int',52]}),
  choice('내 보너스를 일부 포기하고 시간을 번다','현금 손실 · 평판/충성 상승',{cash:-8000000,xp:15,stats:{reputation:5,lead:2},relations:{seoyun:4},resultText:'짧은 유예지만 팀의 신뢰를 얻었습니다.'})
 ],{minLevel:3}),
 evt('corp_merger','corp','🤝','M&A 비밀 프로젝트','회사가 경쟁사 인수를 검토한다. 성공하면 판이 커지지만 무리한 가격은 회사에 부담이 된다.',[
  choice('공격적으로 인수를 밀어붙인다','지능 판정 · 대박 또는 큰 손실',{success:{xp:32,stats:{reputation:5,int:2},inf:{business:8},cash:12000000},fail:{xp:4,stats:{reputation:-5,stress:12},inf:{business:-3}},successText:'인수 후 시너지가 예상보다 빠르게 나타났습니다.',failText:'가격을 너무 높게 써 내부 비판이 커졌습니다.'},{check:['int',58]}),
  choice('조건을 낮춰 장기 협상한다','정치력 판정 · 안정적',{success:{xp:22,stats:{pol:3,net:3},inf:{business:5}},fail:{xp:8,stats:{stress:5}},successText:'상대 주주와 절충안을 만들었습니다.',failText:'협상은 길어졌지만 큰 손실은 피했습니다.'},{check:['pol',50]}),
  choice('인수를 반대하고 현금 보존','단기 평판은 낮지만 안정적',{xp:10,stats:{reputation:-1,stress:-2},inf:{business:1},resultText:'성장 기회를 놓쳤다는 비판과 함께 재무 안정성은 지켰습니다.'})
 ],{minLevel:4}),
 evt('corp_whistle','corp','⚠️','내부 문제를 발견했다','회계와 성과 보고 과정에서 심각한 왜곡 정황을 발견했다. 덮으면 편하지만 나중에 폭발할 수도 있다.',[
  choice('정식 내부절차로 문제 제기','평판/정치력 판정',{success:{xp:24,stats:{reputation:7,pol:2,stress:7},inf:{business:3}},fail:{stats:{reputation:-2,stress:12},inf:{business:-1}},successText:'감사 절차가 작동했고 당신은 신뢰를 얻었습니다.',failText:'조직 저항이 거셌고 한동안 인사상 불이익이 생겼습니다.'},{check:['pol',48]}),
  choice('조용히 증거만 확보','지능/인맥 성장',{xp:11,stats:{int:3,net:2,stress:3},resultText:'즉시 움직이지 않고 상황을 더 파악했습니다.'}),
  choice('모른 척한다','스트레스 감소 · 장기 리스크 플래그',{xp:5,stats:{stress:-3,reputation:-2},resultText:'당장은 조용해졌지만 위험은 사라지지 않았습니다.'},{schedule:['corp_whistle_follow',30]})
 ],{minLevel:2}),
 evt('corp_whistle_follow',null,'📰','과거의 문제가 터졌다','전에 외면했던 문제가 언론에 보도됐다. 내부에서는 누가 무엇을 알고 있었는지 조사 중이다.',[
  choice('알고 있던 사실을 공개한다','평판 일부 회복 · 스트레스 상승',{stats:{reputation:2,stress:8},inf:{media:2},resultText:'뒤늦게라도 사실관계를 공개했습니다.'}),
  choice('법무팀과 방어한다','정치력 판정',{success:{stats:{pol:2,reputation:1,stress:4}},fail:{stats:{reputation:-6,stress:10}},successText:'책임 범위를 명확히 해 큰 타격을 피했습니다.',failText:'방어 논리가 설득력을 얻지 못했습니다.'},{check:['pol',52]}),
  choice('회사를 떠난다','현재 커리어 종료 · 평판 하락',{stats:{reputation:-2,stress:-8},resultText:'논란에서 벗어나기 위해 회사를 떠났습니다.'},{special:'quit'})
 ],{follow:true}),

 evt('mil_exercise','military','🧭','대규모 지휘훈련','예상치 못한 변수로 훈련 계획이 흔들렸다. 상부는 결과를 지켜보고 있고 부대는 당신의 판단을 기다린다.',[
  choice('현장에서 계획을 즉시 수정','리더십 판정 · 성공 시 큰 진급점수',{success:{xp:28,stats:{lead:4,reputation:3,stress:8},inf:{military:5}},fail:{xp:5,stats:{reputation:-3,stress:12}},successText:'상황을 빠르게 재정리해 훈련을 정상화했습니다.',failText:'변경이 혼선을 키워 평가가 나빠졌습니다.'},{check:['lead',44]}),
  choice('상급부대 지침을 기다린다','안전하지만 성장 적음',{xp:8,stats:{stress:2},inf:{military:1},resultText:'큰 실수는 피했지만 주도성 평가도 평범했습니다.'}),
  choice('참모들에게 권한을 나눈다','인맥/리더십 균형',{success:{xp:18,stats:{lead:2,net:2},relations:{dohyun:3},inf:{military:3}},fail:{stats:{stress:5}},successText:'참모진이 제 역할을 하며 팀워크가 살아났습니다.',failText:'역할 분담이 늦어 대응 속도가 떨어졌습니다.'},{check:['lead',38]})
 ]),
 evt('mil_promotion','military','⭐','진급 심사 직전','진급 명단이 곧 확정된다. 실력뿐 아니라 보직, 평판, 장성 인맥이 모두 영향을 준다.',[
  choice('성과 자료로 정면 승부','지능/리더십 판정',{success:{xp:32,stats:{reputation:4,lead:1},inf:{military:4}},fail:{xp:8,stats:{stress:6}},successText:'명확한 성과가 심사에서 높은 평가를 받았습니다.',failText:'성과는 나쁘지 않았지만 경쟁자를 넘기엔 부족했습니다.'},{check:['int',45]}),
  choice('장성 인맥을 활용','인맥 35 권장 · 군 영향력 상승',{success:{xp:24,stats:{pol:2,net:2},inf:{military:6}},fail:{stats:{reputation:-2,stress:5}},successText:'추천과 신뢰가 결정적 순간에 힘을 발휘했습니다.',failText:'과도한 줄서기로 보인다는 뒷말이 나왔습니다.'},{check:['net',35]}),
  choice('다음 기회를 기다린다','스트레스 감소 · 리더십 상승',{xp:10,stats:{lead:2,stress:-4},resultText:'조급해하지 않고 다음 보직을 준비했습니다.'})
 ],{minLevel:1}),
 evt('mil_welfare','military','🪖','부대 내부 불만','장병들의 휴식과 근무 여건에 대한 불만이 쌓이고 있다. 임무 일정은 빡빡하다.',[
  choice('일정을 조정해 휴식을 보장','평판/리더십 상승 · 상부 평가 소폭 위험',{xp:17,stats:{lead:3,reputation:4},inf:{military:2},resultText:'부대 사기가 눈에 띄게 좋아졌습니다.'}),
  choice('임무 우선 원칙을 유지','진급점수 상승 · 평판 하락',{xp:22,stats:{stress:3,reputation:-2},inf:{military:3},resultText:'일정은 지켰지만 현장 불만은 남았습니다.'}),
  choice('중간관리자와 타협안을 만든다','정치력 판정',{success:{xp:20,stats:{pol:2,lead:2,reputation:2}},fail:{xp:7,stats:{stress:4}},successText:'임무와 휴식의 균형을 맞췄습니다.',failText:'양쪽 모두 완전히 만족시키지 못했습니다.'},{check:['pol',35]})
 ]),
 evt('mil_procurement','military','📦','조달 논란','신규 장비 사업을 두고 업체와 내부 부서가 치열하게 대립한다. 언론도 관심을 갖기 시작했다.',[
  choice('투명한 평가 절차를 고수','평판/언론 신뢰 상승',{xp:20,stats:{reputation:6,stress:5},inf:{military:2,media:2},resultText:'절차적 신뢰를 확보했고 논란이 잦아들었습니다.'}),
  choice('상부가 원하는 방향에 맞춘다','군 영향력 상승 · 평판 위험',{xp:18,stats:{pol:2,reputation:-2},inf:{military:5},resultText:'조직 내부에서는 신뢰를 얻었지만 외부 시선은 차가웠습니다.'}),
  choice('전문가 재검토를 요청','지능 판정',{success:{xp:23,stats:{int:2,reputation:3},inf:{military:3}},fail:{xp:6,stats:{stress:5}},successText:'추가 검증에서 중요한 문제를 찾아냈습니다.',failText:'일정 지연에 대한 비판만 커졌습니다.'},{check:['int',48]})
 ],{minLevel:2}),
 evt('mil_crisis','military','🚨','국가 긴장 고조','외교·안보 긴장이 급격히 높아져 군 지휘부가 비상태세에 들어갔다. 정치권과 언론도 촉각을 곤두세운다.',[
  choice('침착하게 대비태세 강화','리더십 판정 · 안정도 상승',{success:{xp:30,stats:{lead:3,reputation:4,stress:9},inf:{military:6},nation:{stability:4}},fail:{stats:{stress:12,reputation:-2},nation:{stability:-2}},successText:'과잉대응 없이 준비태세를 높여 신뢰를 얻었습니다.',failText:'현장 혼선이 발생해 불안감이 커졌습니다.'},{check:['lead',55]}),
  choice('정치권과 적극 조율','정치력/인맥 성장',{xp:18,stats:{pol:3,net:3,stress:5},inf:{military:3,political:2},nation:{stability:2},resultText:'군과 정부 사이의 의사소통을 안정시켰습니다.'}),
  choice('언론 브리핑을 주도','매력 판정 · 성공 시 평판 상승',{success:{xp:18,stats:{cha:2,reputation:6},inf:{media:3},nation:{mood:3}},fail:{stats:{reputation:-4,stress:8},nation:{mood:-3}},successText:'차분한 설명으로 시민 불안을 낮췄습니다.',failText:'말 한마디가 논란이 되어 오히려 불안을 키웠습니다.'},{check:['cha',50]})
 ],{minLevel:3}),
 evt('mil_politics','military','🏛️','정치권의 접근','유력 정치인이 비공식 자리에서 당신의 명성과 군 경력을 높이 평가하며 향후 협력을 제안했다.',[
  choice('원칙적으로 거리를 둔다','군 평판 상승',{xp:14,stats:{reputation:4},inf:{military:3},resultText:'정치적 중립 이미지를 지켰습니다.'}),
  choice('정책 자문 수준으로 협력','정치/군 영향력 동시 상승',{xp:18,stats:{pol:3,net:3},inf:{military:2,political:4},relations:{minjae:3},resultText:'공식적인 정책 자문 네트워크를 만들었습니다.'}),
  choice('강한 정치적 동맹을 만든다','큰 정치 영향력 · 군 내부 평판 위험',{stats:{pol:4,reputation:-2,stress:3},inf:{political:7,military:2},relations:{minjae:5},resultText:'정치권에 강한 우군을 확보했지만 군 내부에서 뒷말이 나왔습니다.'})
 ],{minLevel:5}),

 evt('mil_general_reform','military','📘','국방개혁 보고서','장성회의에서 향후 군 조직개혁의 우선순위를 정해 달라는 요구를 받았다. 어느 선택을 하든 군 내부와 정치권의 평가는 갈릴 수 있다.',[
  choice('현장 지휘체계 개선을 우선','리더십/군 신뢰 중심',{xp:26,stats:{lead:3,reputation:2,stress:5},inf:{military:5},resultText:'현장 중심 개혁안이 지휘관들의 지지를 얻었습니다.'}),
  choice('예산 효율과 조직 슬림화를 강조','지능 판정 · 정부와 대중평판 상승 가능',{success:{xp:28,stats:{int:2,reputation:5,pol:2},inf:{military:2,political:2},nation:{mood:2}},fail:{xp:8,stats:{stress:7,reputation:-2},inf:{military:-1}},successText:'재정과 전력을 함께 고려한 현실적인 개혁안이라는 평가를 받았습니다.',failText:'현장 이해가 부족한 탁상개혁이라는 반발이 나왔습니다.'},{check:['int',58]}),
  choice('민군 협력과 투명성을 앞세운다','정치·언론 영향력 상승',{xp:20,stats:{pol:3,reputation:4,net:2},inf:{political:4,media:3,military:1},resultText:'군 외부에서도 신뢰할 수 있는 장성이라는 이미지가 강해졌습니다.'})
 ],{minLevel:7}),
 evt('mil_general_hearing','military','🎙️','국회 인사검증 출석','고위 보직 후보로 거론되면서 국회가 과거 인사와 의사결정을 집중적으로 묻기 시작했다. 답변 하나가 군 경력뿐 아니라 향후 정계 진출에도 영향을 줄 수 있다.',[
  choice('자료와 원칙으로 정면 대응','지능/평판 판정',{success:{xp:28,stats:{int:2,reputation:7,stress:7},inf:{military:4,political:3,media:3}},fail:{xp:7,stats:{reputation:-5,stress:11},inf:{media:-2}},successText:'침착하고 구체적인 답변으로 검증을 통과했습니다.',failText:'몇몇 답변이 논란이 되면서 추가 검증 요구가 나왔습니다.'},{check:['int',60]}),
  choice('정치권과 사전 조율한다','정치력/인맥 판정',{success:{xp:24,stats:{pol:4,net:4,reputation:2},inf:{political:5,military:2}},fail:{xp:6,stats:{reputation:-3,stress:8}},successText:'쟁점이 정리되면서 청문 분위기를 안정적으로 관리했습니다.',failText:'사전 조율 의혹이 제기되어 오히려 부담이 커졌습니다.'},{check:['pol',55]}),
  choice('군인의 정치적 중립을 강조','군 영향력과 신뢰 상승 · 정치 영향력은 적음',{xp:18,stats:{lead:2,reputation:4},inf:{military:5},resultText:'정치적 거리두기가 군 내부에서 높은 평가를 받았습니다.'})
 ],{minLevel:8}),
 evt('mil_general_command','military','⭐','차기 핵심보직 경쟁','다음 인사에서 야전 지휘, 합참, 국방정책 라인 중 하나로 이동할 가능성이 열렸다. 선택한 경로는 대장 진급과 향후 장관·정계 영입 가능성을 바꾼다.',[
  choice('야전 지휘를 택한다','리더십·군 영향력에 집중',{xp:30,stats:{lead:4,reputation:2,stress:7},inf:{military:7},resultText:'현장 지휘관으로서의 상징성이 더 강해졌습니다.'}),
  choice('합참 라인을 택한다','군·정치 균형, 인맥 강화',{xp:27,stats:{lead:2,pol:2,net:3,stress:5},inf:{military:5,political:3},resultText:'합동 지휘 경험과 정부 네트워크를 동시에 확보했습니다.'}),
  choice('국방정책 라인을 택한다','정치권·장관 영입에 유리',{xp:22,stats:{pol:4,int:2,net:3},inf:{political:6,military:2,media:2},resultText:'정책형 장성이라는 평가가 퍼지며 정치권의 관심이 커졌습니다.'})
 ],{minLevel:9}),

 evt('pol_primary','politics','🗳️','공천 경쟁','같은 당의 유력 후보와 지역 공천을 두고 맞붙었다. 여론, 당내 인맥, 지역 조직이 모두 중요하다.',[
  choice('정책 경쟁으로 정면승부','정치력/지능 판정',{success:{xp:28,stats:{pol:3,reputation:5},inf:{political:5},partySupport:3},fail:{xp:7,stats:{stress:8,reputation:-2}},successText:'정책 토론에서 우위를 잡아 공천 가능성이 높아졌습니다.',failText:'메시지가 유권자에게 충분히 전달되지 못했습니다.'},{check:['pol',43]}),
  choice('당내 인맥을 총동원','인맥 판정 · 성공 시 조직 장악',{success:{xp:23,stats:{net:3,pol:2},inf:{political:6},partySupport:2},fail:{stats:{reputation:-3,stress:5}},successText:'당내 핵심 인사들이 공개적으로 지지하기 시작했습니다.',failText:'줄세우기라는 비판이 나왔습니다.'},{check:['net',40]}),
  choice('상대와 역할을 나눈다','성장 느림 · 관계와 안정성 상승',{xp:13,stats:{reputation:2,net:2,stress:-2},partySupport:1,resultText:'정면충돌 대신 장기 동맹을 택했습니다.'})
 ]),
 evt('pol_bill','politics','📜','논쟁적 법안','당 지도부가 강하게 추진하는 법안이 지역구 여론과 충돌한다. 표결을 앞두고 압박이 거세다.',[
  choice('당론에 따른다','당내 영향력 상승 · 민심 변동',{xp:19,stats:{pol:2,reputation:-1},inf:{political:4},partySupport:2,nation:{mood:-2},resultText:'당 지도부의 신뢰를 얻었지만 일부 지지층이 반발했습니다.'}),
  choice('지역 여론을 따라 반대표','대중 평판 상승 · 당내 갈등',{xp:16,stats:{reputation:5,stress:5},inf:{political:-1},partySupport:-1,nation:{mood:2},resultText:'지역에서는 호평을 받았지만 지도부와 긴장이 생겼습니다.'}),
  choice('수정안을 중재한다','정치력 판정 · 성공하면 모두 이득',{success:{xp:26,stats:{pol:4,reputation:4,net:2},inf:{political:5},nation:{mood:2}},fail:{xp:6,stats:{stress:8,reputation:-2}},successText:'절충안을 만들어 갈등을 봉합했습니다.',failText:'양쪽 모두 만족하지 못해 정치적 비용만 커졌습니다.'},{check:['pol',50]})
 ],{minLevel:2}),
 evt('pol_donor','politics','💰','거액 후원 제안','경제계 인사가 합법적 후원과 조직적 지원을 제안한다. 대가성 의혹을 피하려면 관계를 투명하게 관리해야 한다.',[
  choice('공개 원칙 아래 후원받기','자금/기업 영향력 상승 · 투명성 유지',{cash:18000000,xp:12,stats:{reputation:2},inf:{business:3,political:2},resultText:'후원 내역과 원칙을 공개해 큰 논란 없이 자금을 확보했습니다.'}),
  choice('후원을 거절하고 독립성 강조','평판 상승 · 자금 없음',{xp:10,stats:{reputation:5,pol:1},nation:{mood:1},resultText:'독립적인 정치인 이미지를 강화했습니다.'}),
  choice('비공식 관계까지 넓힌다','큰 인맥 상승 · 스캔들 위험',{success:{cash:30000000,xp:15,stats:{net:5,pol:2},inf:{business:5}},fail:{cash:12000000,stats:{reputation:-6,stress:9},inf:{media:-2}},successText:'관계를 넓히면서도 선을 지켰습니다.',failText:'관계가 과도하다는 의혹이 언론에 번졌습니다.'},{check:['pol',58]})
 ],{minLevel:2}),
 evt('pol_debate','politics','🎙️','생방송 토론','전국 생방송 토론에서 상대 후보가 당신의 약점을 집중 공격한다.',[
  choice('논리와 데이터로 반격','지능 판정',{success:{xp:24,stats:{int:2,reputation:6},inf:{political:4,media:4},partySupport:3},fail:{stats:{reputation:-4,stress:8},partySupport:-2},successText:'숫자와 논리로 흐름을 뒤집었습니다.',failText:'복잡한 설명이 오히려 방어적으로 보였습니다.'},{check:['int',50]}),
  choice('감정과 메시지로 대중 공략','매력 판정',{success:{xp:22,stats:{cha:3,reputation:7},inf:{media:5},partySupport:4},fail:{stats:{reputation:-5,stress:6},partySupport:-2},successText:'짧고 강한 메시지가 대중에게 먹혔습니다.',failText:'과장된 말투라는 역풍을 맞았습니다.'},{check:['cha',50]}),
  choice('공격을 받더라도 품위를 지킨다','안정적 평판 상승',{xp:14,stats:{reputation:3,stress:3},partySupport:1,resultText:'폭발적인 반응은 없었지만 안정적인 이미지를 남겼습니다.'})
 ],{minLevel:3}),
 evt('pol_scandal','politics','📰','측근 스캔들','가까운 보좌진의 사생활·금전 문제가 보도됐다. 당신에게 직접 책임은 없지만 여론은 냉정하다.',[
  choice('즉시 해임하고 사과','평판 회복 · 인맥 손실',{stats:{reputation:4,stress:7,net:-2},inf:{media:2},partySupport:1,resultText:'신속한 대응으로 확산을 막았습니다.'}),
  choice('조사 결과까지 기다린다','정치력 판정',{success:{stats:{pol:2,reputation:3,stress:4},partySupport:1},fail:{stats:{reputation:-6,stress:9},partySupport:-3},successText:'사실관계가 정리되며 성급한 판단을 피했다는 평가를 받았습니다.',failText:'늑장 대응이라는 비판이 폭발했습니다.'},{check:['pol',52]}),
  choice('정면으로 측근을 감싼다','관계/충성 상승 · 큰 여론 위험',{stats:{reputation:-4,lead:3,stress:5},relations:{minjae:5},partySupport:-2,resultText:'측근의 충성은 얻었지만 대중 여론은 악화됐습니다.'},{schedule:['pol_scandal_follow',21]})
 ],{minLevel:3}),
 evt('pol_scandal_follow',null,'📺','스캔들 후속 보도','새로운 자료가 공개되며 과거에 감쌌던 측근 문제가 다시 커졌다.',[
  choice('이번에는 선을 긋는다','평판 일부 회복',{stats:{reputation:2,stress:6},partySupport:1,resultText:'더 큰 피해를 막기 위해 관계를 정리했습니다.'}),
  choice('끝까지 방어한다','정치력 판정',{success:{stats:{pol:3,reputation:1},partySupport:1},fail:{stats:{reputation:-8,stress:10},partySupport:-4},successText:'사실관계를 뒤집는 데 성공했습니다.',failText:'여론은 책임 회피로 받아들였습니다.'},{check:['pol',60]}),
  choice('공개 기자회견으로 승부','매력 판정',{success:{stats:{cha:2,reputation:5},inf:{media:4}},fail:{stats:{reputation:-5,stress:8}},successText:'직접 설명이 여론을 누그러뜨렸습니다.',failText:'기자회견에서 새로운 논란이 생겼습니다.'},{check:['cha',55]})
 ],{follow:true}),
 evt('pol_protest','politics','📣','대규모 집회','정책에 반대하는 대규모 집회가 열렸다. 강경대응과 대화 사이에서 정치권이 갈라진다.',[
  choice('대표단과 공개 대화','매력/정치력 판정',{success:{stats:{reputation:5,pol:2},inf:{political:3},nation:{mood:5,stability:2},partySupport:2},fail:{stats:{reputation:-2,stress:6},nation:{mood:-2}},successText:'대화를 통해 일부 요구를 제도권으로 끌어들였습니다.',failText:'대화가 보여주기식이라는 비판을 받았습니다.'},{check:['pol',48]}),
  choice('법과 원칙을 강조','안정도 상승 · 민심 하락',{stats:{reputation:-1,lead:2},nation:{stability:4,mood:-4},inf:{political:2},resultText:'질서는 유지됐지만 갈등은 깊어졌습니다.'}),
  choice('정책 일부를 수정','민심 상승 · 당내 영향력 손실',{stats:{reputation:4},nation:{mood:6,stability:1},partySupport:-1,inf:{political:-1},resultText:'정책을 조정해 긴장을 완화했습니다.'})
 ],{minLevel:4}),

 evt('under_pressure','underworld','🌒','라이벌 조직의 압박','라이벌 세력이 당신의 영향권과 거래처에 압박을 넣기 시작했다. 충돌이 커지면 돈도 사람도 잃을 수 있다.',[
  choice('협상으로 선을 다시 긋는다','정치력 판정 · 위험 낮음',{success:{xp:22,stats:{pol:2,net:2},inf:{under:4},heat:-2},fail:{xp:6,stats:{reputation:-2,stress:6},inf:{under:-1}},successText:'서로의 이해관계를 정리해 충돌을 피했습니다.',failText:'상대는 약한 태도로 받아들였습니다.'},{check:['pol',42]}),
  choice('합법 사업을 키워 영향력을 옮긴다','현금 투자 · 기업 영향력 상승',{cash:-8000000,xp:16,stats:{int:2},inf:{business:4,under:1},heat:-4,resultText:'수익 일부를 합법 사업으로 돌려 위험을 낮췄습니다.'}),
  choice('강경하게 세력 과시','리더십 판정 · 영향력 또는 수사위험',{success:{xp:25,stats:{lead:3,notoriety:4},inf:{under:7},heat:8},fail:{xp:4,stats:{stress:10,notoriety:2},inf:{under:-3},heat:12},successText:'상대가 물러나며 지하세계 평판이 올라갔습니다.',failText:'갈등이 커지고 수사기관의 관심까지 높아졌습니다.'},{check:['lead',50]})
 ]),
 evt('under_crackdown','underworld','🚨','수사기관의 집중단속','주변 인물들이 연이어 조사를 받으며 활동 반경이 좁아지고 있다.',[
  choice('한동안 활동을 줄인다','수익 감소 · 수사위험 크게 감소',{cash:-4000000,xp:5,stats:{stress:-2},heat:-18,inf:{under:-1},resultText:'눈에 띄는 활동을 줄여 위험을 크게 낮췄습니다.'}),
  choice('법률 대응과 합법 사업에 집중','비용 큼 · 평판/기업 영향 상승',{cash:-15000000,xp:13,stats:{int:1,reputation:2},inf:{business:4},heat:-12,resultText:'합법 활동 비중을 높이며 방어선을 만들었습니다.'}),
  choice('평소처럼 활동한다','고수익 가능 · 수사위험 급등',{success:{cash:22000000,xp:20,inf:{under:4},heat:12},fail:{cash:-12000000,stats:{reputation:-4,stress:10},heat:25},successText:'운 좋게 수익을 유지했습니다.',failText:'주변 수사망에 걸려 큰 비용이 발생했습니다.'},{check:['pol',58]})
 ]),
 evt('under_betrayal','underworld','🕶️','내부 배신 의심','측근 중 한 명이 정보를 외부에 흘린다는 소문이 돈다. 확실한 증거는 없다.',[
  choice('사실관계를 차분히 확인','지능 판정',{success:{xp:20,stats:{int:2,lead:1},inf:{under:3},heat:-3},fail:{xp:6,stats:{stress:5}},successText:'오해와 실제 문제를 구분해 내부를 안정시켰습니다.',failText:'확실한 결론을 내리지 못해 불신이 남았습니다.'},{check:['int',45]}),
  choice('조직을 재편하고 권한을 분산','리더십 상승 · 단기 영향력 감소',{xp:16,stats:{lead:3,stress:4},inf:{under:-1},heat:-2,resultText:'한 사람에게 권력이 몰리지 않도록 조직을 바꿨습니다.'}),
  choice('의심되는 인물을 바로 배제','빠른 통제 · 평판/충성 리스크',{xp:18,stats:{notoriety:3,reputation:-2,stress:3},inf:{under:4},resultText:'통제력은 강해졌지만 내부에 두려움과 불신도 커졌습니다.'})
 ],{minLevel:2}),
 evt('under_legit','underworld','🏢','합법화의 기회','오래 알고 지낸 사업가가 “이제 합법 사업으로 중심을 옮길 때”라며 공동투자를 제안했다.',[
  choice('적극적으로 전환','₩30,000,000 투자 · 기업영향/수사위험 개선',{cash:-30000000,xp:18,stats:{reputation:4,int:2},inf:{business:7,under:-2},heat:-15,resultText:'사업의 중심을 합법 영역으로 옮기기 시작했습니다.'}),
  choice('두 영역을 병행','기업/지하 영향 동시 상승 · 관리 스트레스',{cash:-12000000,xp:20,stats:{stress:6,pol:2},inf:{business:4,under:3},heat:-4,resultText:'합법 사업을 키우면서 기존 영향력도 유지했습니다.'}),
  choice('지금은 거절','현금 보존 · 지하 영향 상승',{xp:11,stats:{lead:1},inf:{under:3},resultText:'기존 조직에 집중하기로 했습니다.'})
 ],{minLevel:3}),
 evt('under_media','underworld','📺','언론의 추적 보도','탐사보도팀이 당신 주변의 자산과 인맥을 취재하기 시작했다.',[
  choice('정식 인터뷰로 선을 긋는다','매력 판정 · 평판 회복 가능',{success:{stats:{cha:2,reputation:5},inf:{media:3},heat:-2},fail:{stats:{reputation:-5,stress:8},inf:{media:-2},heat:3},successText:'차분한 인터뷰로 의혹 일부를 잠재웠습니다.',failText:'답변이 새로운 의문을 만들었습니다.'},{check:['cha',52]}),
  choice('전문 홍보·법률팀을 쓴다','₩12,000,000 · 위험 감소',{cash:-12000000,stats:{reputation:2},inf:{media:2},heat:-8,resultText:'대응 창구를 일원화해 리스크를 줄였습니다.'}),
  choice('아무 대응도 하지 않는다','현금 보존 · 여론 악화 가능',{stats:{stress:3,reputation:-3},heat:4,resultText:'보도는 한동안 계속됐고 이미지가 나빠졌습니다.'})
 ],{minLevel:3}),

 evt('life_health',null,'❤️','몸이 보내는 신호','최근 피로와 스트레스가 누적돼 집중력이 떨어지고 있다.',[
  choice('며칠 완전히 쉰다','건강/스트레스 크게 회복',{stats:{health:8,stress:-14},resultText:'일정을 비우고 제대로 회복했습니다.'},{days:4}),
  choice('검진과 운동 루틴을 잡는다','₩600,000 · 건강/지능 소폭 상승',{cash:-600000,stats:{health:6,int:1,stress:-4},resultText:'생활 패턴을 재정비했습니다.'},{days:3}),
  choice('그냥 버틴다','시간 절약 · 건강 악화',{stats:{health:-6,stress:5},resultText:'일은 계속했지만 몸 상태가 더 나빠졌습니다.'},{days:1})
 ],{generic:true}),
 evt('life_friend',null,'🤝','오랜 친구의 부탁','오랜 친구가 사업을 시작하며 투자를 부탁했다. 아이디어는 괜찮지만 성공을 장담할 수 없다.',[
  choice('₩10,000,000 투자','확률형 수익 · 인맥 상승',{success:{cash:16000000,stats:{net:4,reputation:2}},fail:{cash:2000000,stats:{net:2,stress:4}},successText:'사업이 잘 풀려 원금과 수익을 돌려받았습니다.',failText:'사업이 어려워져 투자금을 잃었습니다.'},{check:['int',48],preCost:10000000}),
  choice('소액만 돕는다','₩2,000,000 · 인맥 상승',{cash:-2000000,stats:{net:3,reputation:1},resultText:'큰 부담 없이 친구를 도왔습니다.'}),
  choice('정중히 거절','돈 보존 · 스트레스 없음',{stats:{stress:-1},resultText:'관계가 크게 상하지 않도록 솔직하게 거절했습니다.'})
 ],{generic:true}),
 evt('life_market',null,'📉','자산시장 급변','뉴스 속보가 이어지고 자산시장 변동성이 커졌다. 주변 사람들도 투자 이야기에 열을 올린다.',[
  choice('현금을 지킨다','안전 · 지능 +1',{stats:{int:1},resultText:'기회를 놓칠 수 있지만 자산을 지켰습니다.'}),
  choice('₩20,000,000 분할 투자','지능 판정 · 수익 또는 손실',{success:{cash:28000000,stats:{int:1},inf:{business:1}},fail:{cash:12000000,stats:{stress:4}},successText:'변동성을 이용해 수익을 냈습니다.',failText:'시장 하락이 이어져 평가손실이 발생했습니다.'},{check:['int',48],preCost:20000000}),
  choice('정보 인맥을 활용한다','인맥 판정 · 작은 우위',{success:{cash:4000000,stats:{net:1}},fail:{stats:{stress:2}},successText:'좋은 정보 흐름 덕분에 무리 없는 수익을 냈습니다.',failText:'확실한 정보는 없었습니다.'},{check:['net',42]})
 ],{generic:true}),
 evt('life_rumor',null,'📱','SNS 소문','당신에 대한 사실과 과장이 뒤섞인 글이 온라인에서 빠르게 퍼지고 있다.',[
  choice('짧고 명확하게 해명','매력 판정',{success:{stats:{reputation:4,cha:1},inf:{media:1}},fail:{stats:{reputation:-3,stress:5}},successText:'간결한 설명이 여론을 진정시켰습니다.',failText:'해명이 또 다른 논쟁을 불렀습니다.'},{check:['cha',45]}),
  choice('전문 PR 대응','₩5,000,000 · 안정적',{cash:-5000000,stats:{reputation:3,stress:-1},inf:{media:2},resultText:'전문가가 이슈를 빠르게 정리했습니다.'}),
  choice('무시한다','시간/돈 절약 · 결과 랜덤',{success:{stats:{reputation:1,stress:-2}},fail:{stats:{reputation:-4,stress:5}},successText:'관심이 금방 다른 곳으로 옮겨갔습니다.',failText:'침묵이 의혹으로 해석되며 소문이 커졌습니다.'},{check:['reputation',35]})
 ],{generic:true}),
 evt('life_family',null,'🏠','가족과 일의 충돌','중요한 가족 일정과 커리어 일정이 겹쳤다. 어느 쪽을 선택하든 대가가 있다.',[
  choice('가족을 우선한다','스트레스 감소 · 경력 기회 소폭 손실',{xp:-4,stats:{stress:-8,reputation:1},resultText:'커리어 일정 하나를 포기했지만 삶의 균형을 되찾았습니다.'}),
  choice('일을 우선한다','경력 상승 · 스트레스 증가',{xp:12,stats:{stress:7,lead:1},resultText:'성과는 얻었지만 개인 생활에는 피로가 남았습니다.'}),
  choice('둘 다 맞추려 무리한다','지능 판정',{success:{xp:9,stats:{stress:2,reputation:2}},fail:{xp:2,stats:{stress:10,health:-3}},successText:'일정을 정교하게 조정해 두 가지를 모두 챙겼습니다.',failText:'일정이 꼬이며 양쪽 모두 만족스럽지 못했습니다.'},{check:['int',45]})
 ],{generic:true})
];

function eventPool(){
 const career=S.career;return EVENTS.filter(e=>!e.follow&&((e.generic)||(career&&e.career===career&&(e.minLevel==null||S.level>=e.minLevel))))
}
function getEvent(id){return EVENTS.find(e=>e.id===id)}
function pickEvent(){
 let pool=eventPool();const recent=S.v3.eventsSeen.slice(-6);let fresh=pool.filter(e=>!recent.includes(e.id));if(fresh.length)pool=fresh;return pool[rnd(0,pool.length-1)]
}
function showEvent(e){
 if(!e||V3.eventOpening)return;V3.eventOpening=true;S.v3.eventsSeen.push(e.id);S.v3.eventsSeen=S.v3.eventsSeen.slice(-20);S.v3.eventCount++;S.v3.eventCooldown=rnd(6,12);
 const body=`<div class="event-card"><div class="event-meta"><span class="event-chip">${e.career?careers[e.career].name:'인생'}</span><span class="event-chip">선택형 이벤트 #${S.v3.eventCount}</span>${S.career?`<span class="event-chip">${careerName()}</span>`:''}</div><div class="event-result">${e.text}</div></div>`;
 const acts=e.choices.map((c,idx)=>[c.label,eventChoiceDescription(c),()=>resolveEventChoice(e,c),c.req&& !c.req()?'reqOff':'']);
 modal(e.icon,e.title,'상황을 읽고 선택하세요. 능력치와 관계에 따라 같은 선택도 결과가 달라질 수 있습니다.',acts,body);V3.eventOpening=false
}
function eventChoiceDescription(c){let d=c.desc||'';if(c.check){const label={int:'지능',cha:'매력',lead:'리더십',pol:'정치력',net:'인맥',reputation:'평판'}[c.check[0]]||c.check[0];const val=S.stats[c.check[0]]||0;const chance=clamp(55+(val-c.check[1])*1.6,15,92);d+=` · ${label} 성공률 약 ${Math.round(chance)}%`}if(c.preCost)d+=` · 선투입 ${KRW(c.preCost)}`;return d}
function resolveEventChoice(e,c){
 if(c.req&&!c.req())return toast('현재 조건을 충족하지 못했습니다.');if(c.preCost&&!spend(c.preCost))return;
 V3.inEvent=true;let out=c.outcome||{},ok=true,result='';
 if(c.check){const [stat,diff]=c.check,val=S.stats[stat]||0,chance=clamp(55+(val-diff)*1.6,15,92);ok=Math.random()*100<chance;out=ok?(out.success||{}):(out.fail||{});result=ok?(c.outcome.successText||'판정에 성공했습니다.'):(c.outcome.failText||'판정에 실패했습니다.')}else result=out.resultText||'선택의 결과가 반영되었습니다.';
 if(c.special==='quit')quitCareer();else applyDelta(out);
 if(c.schedule)scheduleEvent(c.schedule[0],c.schedule[1]);
 const days=c.days||rnd(1,3);closeModal();baseAdvanceV3(days);log(`${e.title}: ${result}`);updateAll();save();V3.inEvent=false;
 const txt=deltaText(out);modal(ok?'✅':'⚠️',ok?'선택 결과':'예상 밖의 결과',result,[['계속','도시로 돌아간다',()=>closeModal()]],`<div class="event-result ${ok?'eventResultGood':'eventResultBad'}"><strong>${c.label}</strong><br>${txt||'눈에 보이지 않는 관계와 세계 상태가 변화했습니다.'}</div>`)
}
function maybeEvent(force=false){
 ensureV3();if(V3.inEvent||V3.eventOpening||!$('#modal').classList.contains('hidden'))return;if(!force&&S.v3.eventCooldown>0)return;const e=pickEvent();if(e)showEvent(e)
}
function processScheduled(days){
 if(!S.v3.scheduled.length)return;S.v3.scheduled.forEach(x=>x.days-=days);const due=S.v3.scheduled.find(x=>x.days<=0);if(due&&!V3.inEvent){S.v3.scheduled=S.v3.scheduled.filter(x=>x!==due);setTimeout(()=>showEvent(getEvent(due.id)),220)}
}

const baseAdvanceV3=advance;advance=function(days,reason=''){
 ensureV3();baseAdvanceV3(days,reason);S.v3.eventCooldown=Math.max(0,S.v3.eventCooldown-days);processScheduled(days);
 if(!V3.inEvent&&days>=2&&S.v3.eventCooldown<=0){const chance=S.career?Math.min(.62,.18+days*.055):Math.min(.36,.08+days*.035);if(Math.random()<chance)setTimeout(()=>maybeEvent(true),180)}
};

const baseMonthlyV3=monthlyTick;monthlyTick=function(){baseMonthlyV3();governmentMonthly();if(S.spouse)S.stats.stress=clamp(S.stats.stress-1);Object.keys(NPCS).forEach(k=>{if(Math.random()<.18)S.relations[k]=clamp(S.relations[k]+rnd(-1,1),-100,100)})};

function governmentMonthly(){
 ensureV3();const g=S.v3.gov;if(S.nation.currentPresident!==S.name)return;const revenue=S.nation.economy*18000000000*(g.tax/24);const baseSpend=900000000000;g.treasury+=revenue-baseSpend;if(g.treasury<0){g.debt+=Math.abs(g.treasury);g.treasury=0}g.approval=clamp(g.approval+(S.nation.mood-50)*.05+(S.nation.economy-50)*.03+rnd(-2,2));if(g.approval<25&&Math.random()<.22){S.inf.political=clamp(S.inf.political-3);log('낮은 국정 지지율로 여당 내부 이탈이 늘고 있습니다.')}if(g.debt>30000000000000)S.nation.economy=clamp(S.nation.economy-1)
}
function spendTreasury(cost){const g=S.v3.gov;if(g.treasury>=cost){g.treasury-=cost;return}const lack=cost-g.treasury;g.treasury=0;g.debt+=lack}
function openGovernment(){
 ensureV3();if(S.nation.currentPresident!==S.name)return toast('대통령이 된 뒤 사용할 수 있습니다.');const g=S.v3.gov;
 const body=`<div class="govGrid"><div class="govKpi"><span>국정 지지율</span><b>${Math.round(g.approval)}%</b></div><div class="govKpi"><span>정부 가용재원</span><b>${KRW(g.treasury)}</b></div><div class="govKpi"><span>추가 국가부채</span><b>${KRW(g.debt)}</b></div><div class="govKpi"><span>세율 지수</span><b>${g.tax}%</b></div><div class="govKpi"><span>외교 영향력</span><b>${Math.round(g.foreign)}</b></div><div class="govKpi"><span>정부 청렴도</span><b>${Math.round(g.integrity)}</b></div></div>`;
 const acts=[
  ['경제부양 패키지','2조원 · 경제 +6 / 민심 +2',()=>govPolicy('stimulus')],['복지 확대','1.5조원 · 민심 +7 / 안정 +2',()=>govPolicy('welfare')],['국방 현대화','1.5조원 · 안정 +3 / 군 영향 +3',()=>govPolicy('defense')],['대형 인프라 투자','3조원 · 경제 +5 / 민심 +3',()=>govPolicy('infra')],['증세','세율 +2%p · 재정 개선 / 지지율 위험',()=>govPolicy('taxup')],['감세','세율 -2%p · 경제/지지율 단기 상승',()=>govPolicy('taxdown')],['반부패 드라이브','청렴도/지지율 판정',()=>govPolicy('integrity')],['정상외교','0.3조원 · 외교/경제/평판 상승',()=>govPolicy('summit')]
 ];modal('🇰🇷','대통령 국정 운영','대통령이 된 뒤에는 개인의 성공이 아니라 경제·민심·국가안정·재정 사이의 균형을 관리해야 합니다.',acts,body)
}
function govPolicy(type){const g=S.v3.gov;let msg='';
 if(type==='stimulus'){spendTreasury(2000000000000);S.nation.economy=clamp(S.nation.economy+6);S.nation.mood=clamp(S.nation.mood+2);g.approval=clamp(g.approval+2);msg='대규모 경기부양책을 집행했습니다.'}
 if(type==='welfare'){spendTreasury(1500000000000);S.nation.mood=clamp(S.nation.mood+7);S.nation.stability=clamp(S.nation.stability+2);g.approval=clamp(g.approval+5);msg='복지 확대 정책을 시행했습니다.'}
 if(type==='defense'){spendTreasury(1500000000000);S.nation.stability=clamp(S.nation.stability+3);S.inf.military=clamp(S.inf.military+3);g.approval=clamp(g.approval+rnd(-2,2));msg='국방 현대화 예산을 확대했습니다.'}
 if(type==='infra'){spendTreasury(3000000000000);S.nation.economy=clamp(S.nation.economy+5);S.nation.mood=clamp(S.nation.mood+3);g.approval=clamp(g.approval+2);msg='대형 인프라 투자를 시작했습니다.'}
 if(type==='taxup'){g.tax=clamp(g.tax+2,10,45);S.nation.economy=clamp(S.nation.economy-2);g.approval=clamp(g.approval-5);msg='세율을 인상해 재정 기반을 강화했습니다.'}
 if(type==='taxdown'){g.tax=clamp(g.tax-2,10,45);S.nation.economy=clamp(S.nation.economy+3);g.approval=clamp(g.approval+4);msg='감세 정책을 시행했습니다.'}
 if(type==='integrity'){const ok=Math.random()*100<clamp(40+S.stats.pol*.4+S.stats.int*.2,35,90);if(ok){g.integrity=clamp(g.integrity+12);g.approval=clamp(g.approval+6);S.inf.political=clamp(S.inf.political+2);msg='반부패 드라이브가 성과를 냈습니다.'}else{g.approval=clamp(g.approval-4);S.stats.stress=clamp(S.stats.stress+6);msg='개혁 과정의 내부 반발이 커졌습니다.'}}
 if(type==='summit'){spendTreasury(300000000000);g.foreign=clamp(g.foreign+8);S.nation.economy=clamp(S.nation.economy+2);S.stats.reputation=clamp(S.stats.reputation+3);g.approval=clamp(g.approval+2);msg='정상외교를 통해 경제·외교 성과를 만들었습니다.'}
 closeModal();baseAdvanceV3(7);log(msg);updateAll();save();setTimeout(openGovernment,120)
}

const basePresElectionV3=presidentialElection;presidentialElection=function(){
 ensureV3();if(S.nation.currentPresident===S.name){const names=['김도윤','박서진','윤태성','한지우','정민호','이서현'];const next=names[rnd(0,names.length-1)];S.nation.currentPresident=next;S.nation.simulated=true;if(S.career==='politics')S.level=Math.min(S.level,7);S.inf.political=clamp(S.inf.political-15);log(`5년 단임 임기를 마치고 ${next} 정부가 출범했습니다. (가상 시뮬레이션)`);return}const before=S.nation.currentPresident;basePresElectionV3();if(S.nation.currentPresident===S.name&&before!==S.name){S.v3.gov.termStart=S.date;S.v3.gov.approval=55;S.v3.gov.treasury=30000000000000;S.v3.gov.debt=0;log('대통령 권한으로 국가경영 시스템이 해금되었습니다.')}
};

const baseUpdateAllV3=updateAll;updateAll=function(){ensureV3();baseUpdateAllV3();renderNPCs();renderVehicle();const gb=$('#governBtn');if(gb)gb.classList.toggle('hidden',S.nation.currentPresident!==S.name);const mini=$('#v3GovMini');if(mini)mini.innerHTML=`<div class="systemRow"><span>직업 이벤트</span><b>${S.v3.eventCount}회 경험</b></div><div class="systemRow"><span>NPC 관계</span><b>${Object.keys(NPCS).length}명 활성</b></div>${S.nation.currentPresident===S.name?`<div class="systemRow"><span>국정 지지율</span><b>${Math.round(S.v3.gov.approval)}%</b></div>`:''}`;};

const baseQuickV3=quick;quick=function(q){baseQuickV3(q);if(q==='work'&&S.career&&Math.random()<.45&&S.v3.eventCooldown<=0)setTimeout(()=>maybeEvent(true),220)};

// Force-event keyboard shortcut for testing/fun: F2
window.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();maybeEvent(true)}});

// Normalize old saves and refresh.
ensureV3();updateAll();renderNPCs();renderVehicle();
