const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVEKEY="lifeRiseV02";
const DAYMS=86400000;
const KRW=n=>"₩"+Math.round(n).toLocaleString("ko-KR");
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const careers={
 corp:{name:"대기업",levels:["인턴","사원","대리","과장","팀장","임원","대표이사","그룹 회장"],salary:[2400000,3600000,4800000,6500000,9000000,18000000,45000000,120000000],primary:"int"},
 military:{name:"군인",levels:["훈련병","소위","중위","대위","소령","중령","대령","장군","참모총장"],salary:[1200000,3200000,3800000,4800000,6000000,7500000,9000000,12000000,18000000],primary:"lead"},
 politics:{name:"정치",levels:["당원","보좌진","지방의원","국회의원","중진의원","당대표","장관","대선후보","대통령"],salary:[0,3200000,4800000,13000000,14500000,16000000,15000000,0,22000000],primary:"pol"},
 underworld:{name:"지하세계",levels:["연결책","조직원","팀장","지역 실세","간부","보스","전국급 거물"],salary:[2000000,3500000,6000000,10000000,18000000,40000000,90000000],primary:"lead"}
};

const baseState=()=>({
 version:2,name:"Logan",birthYear:2006,date:"2026-09-13",cash:12000000,bank:0,debt:0,
 stats:{int:26,cha:24,lead:20,pol:14,net:16,health:92,stress:12,reputation:10,notoriety:0},
 inf:{political:0,business:0,military:0,media:0,under:0},
 career:null,level:0,xp:0,workDays:0,
 assets:{home:{name:"부모님 집",value:0,monthly:250000},car:null,items:[],properties:[],businesses:[]},
 relations:{seoyun:15,minjae:10,dohyun:8,emma:5},romance:{seoyun:12,yuna:8,emma:6},spouse:null,children:0,
 faction:{party:null,partySupport:0,partySeats:0,militaryBloc:null,warlord:null},
 nation:{economy:58,stability:78,mood:55,inflation:3.0,yearStartPresident:"이재명",currentPresident:"이재명",presidentNo:21,simulated:false,nextAssemblyElection:2028,nextPresElection:2030},
 heat:0,jailDays:0,location:"city",px:48,py:82,
 log:[{d:"2026.09.13",t:"새 인생이 시작되었습니다."}]
});

let S=baseState();

const locations={
 home:{name:"내 집",sub:"생활 · 휴식 · 옷장",theme:"linear-gradient(135deg,#493f4a,#171c2b)",hot:[
  ["🛏️","침대","휴식하고 스트레스를 낮춘다","rest",15,20],
  ["🖥️","컴퓨터","공부·투자·사업 구상을 한다","computer",55,18],
  ["👔","옷장","보유한 패션 아이템을 확인한다","wardrobe",24,58],
  ["👨‍👩‍👧","가족 공간","배우자·가족·생활을 관리한다","kitchen",64,58]
 ]},
 corp:{name:"NOVA GROUP",sub:"커리어 · 사내정치 · 기업 인수",theme:"linear-gradient(135deg,#24405e,#101827)",hot:[
  ["💻","업무 데스크","성과를 쌓고 승진을 노린다","corpWork",13,19],
  ["🧑‍💼","인사팀","입사·이직·승진 현황","corpHR",57,18],
  ["🥂","임원 라운지","고위 인맥과 사내정치를 한다","corpPolitics",16,59],
  ["📈","M&A 룸","사업을 인수하거나 회사를 만든다","business",60,58]
 ]},
 uni:{name:"대학교",sub:"학력 · 능력 · 인맥",theme:"linear-gradient(135deg,#49375d,#17172d)",hot:[
  ["📚","강의실","지능과 전문성을 올린다","class",14,20],
  ["🎤","동아리","매력과 인맥을 키운다","club",56,18],
  ["🏋️","체육관","건강과 리더십을 관리한다","gym",15,58],
  ["🎓","대학원","큰 비용으로 능력을 크게 올린다","grad",59,58]
 ]},
 parliament:{name:"국회 · 정당가",sub:"선거 · 정당 · 입법 · 대통령",theme:"linear-gradient(135deg,#514b67,#191829)",hot:[
  ["🗳️","정당 사무실","정치 입문·정당 창당·선거 준비","partyOffice",13,18],
  ["🏛️","본회의장","의석과 법안을 이용해 국가를 바꾼다","assembly",57,18],
  ["📣","광장","연설과 대중 지지도를 올린다","campaign",14,59],
  ["🇰🇷","대통령실 라인","대선·정부·국가 권력을 다룬다","presidency",59,58]
 ]},
 military:{name:"국방 지휘부",sub:"진급 · 장성 인맥 · 군 영향력",theme:"linear-gradient(135deg,#384a3a,#151f1a)",hot:[
  ["🎖️","인사사령부","입대·진급·보직 경쟁","milHR",13,18],
  ["🧭","지휘 훈련","리더십·군 영향력 성장","command",57,18],
  ["⭐","장성 회관","고위 장교 인맥과 파벌","generalClub",14,59],
  ["🗺️","전략상황실","국가 위기 때 군사 권력 루트가 열린다","milPower",59,58]
 ]},
 bank:{name:"은행",sub:"현금 · 대출 · 투자",theme:"linear-gradient(135deg,#4a5139,#181d15)",hot:[
  ["🏦","예금 창구","현금을 예금한다","deposit",13,19],
  ["💳","대출 센터","신용과 자산으로 돈을 빌린다","loan",57,18],
  ["📊","투자 데스크","자산을 운용한다","invest",14,59],
  ["🧾","자산관리","순자산과 현금흐름을 확인한다","wealth",59,58]
 ]},
 estate:{name:"부동산",sub:"원룸 · 아파트 · 빌딩 · 펜트하우스",theme:"linear-gradient(135deg,#304b58,#15232c)",hot:[
  ["🏢","주거 매물","집을 사고 생활 수준을 바꾼다","homes",13,19],
  ["🏙️","수익형 부동산","월세가 나오는 건물을 산다","incomeProperty",57,18],
  ["🛋️","인테리어","생활 수준과 평판을 높인다","interiorShop",14,59],
  ["📑","매각 데스크","부동산을 정리한다","sellProperty",59,58]
 ]},
 dealer:{name:"자동차 딜러",sub:"이동수단 · 체면 · 유지비",theme:"linear-gradient(135deg,#36505b,#121e27)",hot:[
  ["🚗","실속관","현실적인 차를 산다","cars1",13,19],
  ["🚘","프리미엄관","성공한 사람의 차","cars2",57,18],
  ["🏎️","슈퍼카관","엄청난 체면과 유지비","cars3",14,59],
  ["🔑","내 차","차량 관리·매각","mycar",59,58]
 ]},
 mall:{name:"THE GALLERIA",sub:"패션 · 명품 · 소비",theme:"linear-gradient(135deg,#5c4059,#251927)",hot:[
  ["👔","패션관","옷과 스타일에 돈을 쓴다","fashion",13,19],
  ["⌚","시계관","고급 시계로 체면을 올린다","watch",57,18],
  ["💍","주얼리","선물과 관계에 투자한다","jewelry",14,59],
  ["🎁","VIP 서비스","큰 소비로 상류층 네트워크를 연다","vip",59,58]
 ]},
 lounge:{name:"THE CLUB",sub:"연애 · 상류층 인맥 · 소문",theme:"linear-gradient(135deg,#513665,#1e1629)",hot:[
  ["🥂","바","새 인맥을 만든다","network",13,19],
  ["💃","프라이빗 룸","연애·관계 이벤트","dating",57,18],
  ["🤵","VIP 테이블","정치·재계 거물과 연결","vipNetwork",14,59],
  ["🎲","밤의 선택","큰돈과 위험이 오가는 이벤트","nightEvent",59,58]
 ]},
 media:{name:"NEWS 24",sub:"언론 · 여론 · 이미지",theme:"linear-gradient(135deg,#3e4770,#181d36)",hot:[
  ["🎙️","방송 스튜디오","인지도와 대중 이미지를 키운다","studio",13,19],
  ["📰","편집국","언론 인맥을 만든다","newsroom",57,18],
  ["📺","미디어 투자","언론사를 지분 인수한다","mediaBuy",14,59],
  ["📢","홍보전략실","위기관리·캠페인","pr",59,58]
 ]},
 underworld:{name:"BACKSTREET",sub:"고위험 · 고수익 · 수사 위험",theme:"linear-gradient(135deg,#4d3339,#21151a)",hot:[
  ["🌒","연결책","지하세계에 발을 들인다","underJoin",13,19],
  ["💼","거래실","위험을 감수하고 돈과 영향력을 얻는다","underDeal",57,18],
  ["👥","조직 회합","조직 내 지위를 올린다","underRank",14,59],
  ["🚨","수사망","현재 수사위험과 악명을 확인한다","heat",59,58]
 ]}
};

const mapPos={home:[10,19],corp:[46,15],uni:[80,20],parliament:[88,46],military:[9,49],bank:[46,49],estate:[20,80],dealer:[46,80],mall:[67,80],lounge:[88,80],media:[80,43],underworld:[9,71]};

const ITEMS={
 fashion:[
  {n:"맞춤 정장",p:1800000,rep:2,cha:1},
  {n:"디자이너 풀세트",p:8500000,rep:5,cha:2},
  {n:"상류층 스타일 패키지",p:25000000,rep:9,cha:4}
 ],
 watch:[
  {n:"기계식 시계",p:6000000,rep:2},
  {n:"하이엔드 시계",p:35000000,rep:6},
  {n:"컬렉터 피스",p:150000000,rep:12}
 ],
 luxury:[
  {n:"프라이빗 클럽 평생회원권",p:50000000,rep:6,net:5,monthly:300000},
  {n:"대형 요트",p:1200000000,rep:15,net:5,monthly:12000000},
  {n:"전용기",p:8000000000,rep:25,net:8,monthly:60000000},
  {n:"패밀리 오피스",p:500000000,rep:5,net:8,monthly:5000000,business:8}
 ],
 cars:[
  {n:"준중형 세단",p:32000000,rep:1,monthly:350000},
  {n:"프리미엄 세단",p:85000000,rep:4,monthly:700000},
  {n:"럭셔리 SUV",p:150000000,rep:6,monthly:1200000},
  {n:"슈퍼카",p:380000000,rep:12,monthly:2800000},
  {n:"플래그십 리무진",p:650000000,rep:16,monthly:4200000}
 ],
 homes:[
  {n:"원룸",p:180000000,monthly:350000,rep:1},
  {n:"신축 아파트",p:850000000,monthly:900000,rep:5},
  {n:"한강 고급 아파트",p:2200000000,monthly:2200000,rep:10},
  {n:"펜트하우스",p:5200000000,monthly:4800000,rep:18}
 ],
 props:[
  {n:"소형 상가",p:900000000,income:5500000},
  {n:"오피스 빌딩",p:6500000000,income:42000000},
  {n:"대형 빌딩",p:18000000000,income:125000000}
 ],
 biz:[
  {n:"스타트업",p:120000000,income:6000000,inf:3},
  {n:"중견기업",p:1200000000,income:55000000,inf:8},
  {n:"미디어 회사",p:3000000000,income:85000000,inf:10,media:18},
  {n:"프로 스포츠 구단",p:4500000000,income:40000000,inf:14},
  {n:"대기업 지주사",p:15000000000,income:220000000,inf:25}
 ]
};

function startBackground(bg){
 S=baseState(); S.name=$("#startName").value.trim()||"Logan";
 if(bg==="poor"){S.cash=2500000;S.stats.lead+=4;S.stats.pol+=3;S.stats.stress+=8}
 if(bg==="elite"){S.cash=25000000;S.stats.int+=10;S.stats.net+=12;S.stats.reputation+=4}
 if(bg==="military"){S.cash=15000000;S.stats.lead+=8;S.inf.military=10;S.relations.dohyun+=15}
 if(bg==="wealthy"){S.cash=180000000;S.stats.net+=8;S.stats.reputation+=8;S.inf.business=8}
 save(); $("#startScreen").classList.add("hidden"); updateAll(); toast("새 인생이 시작되었습니다.");
}

function dateObj(){return new Date(S.date+"T12:00:00")}
function age(){return dateObj().getFullYear()-S.birthYear}
function advance(days,reason=""){
 let d=dateObj();
 for(let i=0;i<days;i++){
   const oldMonth=d.getMonth(), oldYear=d.getFullYear();
   d.setDate(d.getDate()+1); S.date=d.toISOString().slice(0,10);
   if(d.getMonth()!=oldMonth||d.getFullYear()!=oldYear) monthlyTick();
 }
 if(reason) log(reason);
 updateAll(); save();
}

function monthlyIncome(){
 let income=0, expenses=S.assets.home.monthly||0;
 if(S.career&&careers[S.career]){
  income+=(careers[S.career].salary?.[S.level]||0);
 }
 S.assets.properties.forEach(x=>income+=x.income||0);
 S.assets.businesses.forEach(x=>income+=x.income||0);
 if(S.assets.car)expenses+=S.assets.car.monthly||0;
 S.assets.items.forEach(x=>expenses+=x.monthly||0);
 expenses+=Math.max(700000, age()*15000);
 return {income,expenses,net:income-expenses};
}
function networth(){
 let n=S.cash+S.bank-S.debt+(S.assets.home.value||0)+(S.assets.car?.p||0)*.72;
 S.assets.properties.forEach(x=>n+=x.p*.9);S.assets.businesses.forEach(x=>n+=x.p*.75);
 S.assets.items.forEach(x=>n+=x.p*.55);return n;
}
function power(){
 return Math.round((S.inf.political*1.15+S.inf.business+S.inf.military*1.1+S.inf.media*.8+S.inf.under*.8+S.stats.reputation*.45+S.stats.net*.35+(S.faction.partySeats||0)*.08)/6);
}
function monthlyTick(){
 let f=monthlyIncome(); S.cash+=f.net;
 S.stats.stress=clamp(S.stats.stress+(S.career?2:0)-1);
 S.heat=clamp(S.heat-3);
 const econDelta=rnd(-3,3), stabDelta=rnd(-2,2), moodDelta=rnd(-3,3);
 S.nation.economy=clamp(S.nation.economy+econDelta);
 S.nation.stability=clamp(S.nation.stability+stabDelta);
 S.nation.mood=clamp(S.nation.mood+moodDelta);
 if(Math.random()<.28) nationalEvent();
 electionCheck();
 if(S.cash<0){S.debt+=Math.abs(S.cash);S.cash=0;log("생활비 부족으로 부채가 늘었습니다.")}
 if(S.heat>72 && Math.random()<.18){
   let days=rnd(30,180); S.jailDays+=days; S.heat=Math.max(20,S.heat-35); S.stats.reputation=clamp(S.stats.reputation-8); S.cash=Math.max(0,S.cash-rnd(5000000,30000000));
   log(`수사 위험이 현실화되어 ${days}일간 활동이 제한되었습니다.`);
 }
}
function nationalEvent(){
 const events=[
  {t:"경기 호조로 투자 심리가 살아났습니다.",e:5,s:1,m:3},
  {t:"경기 둔화 우려가 커지며 소비가 줄었습니다.",e:-6,s:-2,m:-4},
  {t:"정부와 국회가 강하게 충돌하며 정국 긴장이 높아졌습니다.",e:0,s:-6,m:-3},
  {t:"대형 사회 이슈로 시민 불안이 높아졌습니다.",e:-2,s:-5,m:-5},
  {t:"수출 증가와 기업 투자 확대가 경제를 끌어올렸습니다.",e:7,s:2,m:4},
  {t:"대규모 집회가 이어지며 정치권이 민심 경쟁에 들어갔습니다.",e:-1,s:-4,m:-2}
 ];
 const x=events[rnd(0,events.length-1)];S.nation.economy=clamp(S.nation.economy+x.e);S.nation.stability=clamp(S.nation.stability+x.s);S.nation.mood=clamp(S.nation.mood+x.m);log(x.t);
}
function electionCheck(){
 const d=dateObj(), y=d.getFullYear(), m=d.getMonth()+1;
 if(y===S.nation.nextAssemblyElection && m===4){
   if(S.faction.party){
    const score=S.faction.partySupport+S.stats.reputation*.35+S.stats.cha*.18+S.stats.pol*.25+rnd(-18,18);
    S.faction.partySeats=clamp(Math.round(score*2.25),0,260);
    S.inf.political=clamp(S.inf.political+Math.round(S.faction.partySeats/15));
    log(`${S.faction.party}가 총선에서 ${S.faction.partySeats}석을 얻었습니다. (게임 시뮬레이션)`);
   } else log("총선이 치러졌고 국회의 권력 구도가 재편되었습니다. (게임 시뮬레이션)");
   S.nation.nextAssemblyElection+=4;
 }
 if(y===S.nation.nextPresElection && m===5){
   presidentialElection();
   S.nation.nextPresElection+=5;
 }
}
function presidentialElection(){
 if(S.career==="politics" && S.level>=7){
   const score=S.faction.partySupport+S.stats.reputation*.5+S.stats.cha*.25+S.stats.pol*.3+S.inf.media*.2+rnd(-22,22);
   if(score>=92){
    S.level=8;S.nation.currentPresident=S.name;S.nation.simulated=true;S.inf.political=100;S.stats.reputation=clamp(S.stats.reputation+20);log(`대통령 선거에서 승리했습니다. ${S.name} 정부가 출범했습니다.`);
    return;
   }
   log("대통령 선거에 도전했지만 승리하지 못했습니다.");
 }
 const names=["김도윤","박서진","윤태성","한지우","정민호","이서현"];
 S.nation.currentPresident=names[rnd(0,names.length-1)];S.nation.simulated=true;log(`${S.nation.currentPresident}가 대통령에 당선되었습니다. (가상 인물/게임 시뮬레이션)`);
}

function log(t){S.log.unshift({d:S.date.replaceAll("-","."),t});S.log=S.log.slice(0,18)}
function save(){localStorage.setItem(SAVEKEY,JSON.stringify(S))}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
function spend(n){if(S.cash<n){toast("현금이 부족합니다.");return false}S.cash-=n;return true}
function addXP(v){
 if(!S.career)return;
 S.xp+=v;
 const c=careers[S.career];
 const need=100+S.level*28;
 if(S.xp>=need&&S.level<c.levels.length-1){
   S.xp-=need;S.level++;S.stats.reputation=clamp(S.stats.reputation+4);toast(`승진/진급: ${c.levels[S.level]}`);log(`${c.name}에서 ${c.levels[S.level]} 단계로 올라섰습니다.`);
 }
}
function careerName(){
 if(!S.career)return "무직";
 // police/doctor 등 일부 직업은 뒤에 로드되는 패치 파일에서 정의된다.
 // 저장된 게임을 불러오는 순간에는 아직 없을 수 있으므로 방어한다.
 const c=careers[S.career];
 if(!c)return "무직";
 return `${c.name} · ${c.levels[clamp(S.level,0,c.levels.length-1)]}`;
}

function updateAll(){
 $("#dateLabel").textContent=S.date.replaceAll("-",".");
 $("#nameLabel").textContent=S.name;$("#lifeLabel").textContent=`${age()}세 · ${careerName()}`;
 $("#rankBadge").textContent=power()>=70?"국가급 거물":power()>=45?"권력 실세":power()>=25?"유력 인사":S.stats.reputation>=30?"유명 인사":"평범한 시민";
 $("#cashLabel").textContent=KRW(S.cash);$("#networthLabel").textContent=KRW(networth());$("#flowLabel").textContent=KRW(monthlyIncome().net);
 const sm={int:"intStat",cha:"chaStat",lead:"leadStat",pol:"polStat",net:"netStat",health:"healthStat",stress:"stressStat"};
 Object.entries(sm).forEach(([k,id])=>$("#"+id).textContent=Math.round(S.stats[k]));
 const im={political:["politicalInf","politicalBar"],business:["businessInf","businessBar"],military:["militaryInf","militaryBar"],media:["mediaInf","mediaBar"],under:["underInf","underBar"]};
 Object.entries(im).forEach(([k,[t,b]])=>{$("#"+t).textContent=Math.round(S.inf[k]);$("#"+b).style.width=clamp(S.inf[k])+"%"});
 let p=clamp(power());$("#powerIndex").textContent=p;$("#powerRingText").textContent=p;$(".powerRing").style.background=`conic-gradient(var(--mint) ${p*3.6}deg,#263149 0deg)`;
 ["economy","stability","mood"].forEach(k=>{let id=k==="economy"?"economy":k==="stability"?"stability":"mood";$("#"+id+"Label").textContent=Math.round(S.nation[k]);$("#"+id+"Bar").style.width=clamp(S.nation[k])+"%"});
 $("#feed").innerHTML=S.log.slice(0,8).map(x=>`<div class="feedItem"><b>${x.t}</b><time>${x.d}</time></div>`).join("");
}

function enter(loc){
 S.location=loc;
 $("#world").classList.add("hidden");$("#interior").classList.remove("hidden");$("#exitInterior").classList.remove("hidden");
 $("#sceneName").textContent=locations[loc].name;$("#sceneSub").textContent=locations[loc].sub;
 $("#interiorBackdrop").style.background=locations[loc].theme;
 const h=$("#hotspots");h.innerHTML="";
 locations[loc].hot.forEach(([ic,n,sub,act,x,y])=>{
   const b=document.createElement("button");b.className="hotspot";b.style.left=x+"%";b.style.top=y+"%";
   b.innerHTML=`<span>${ic}</span><b>${n}</b><small>${sub}</small>`;b.onclick=()=>action(act);h.appendChild(b)
 });
 save();
}
function exitInterior(){
 S.location="city";$("#interior").classList.add("hidden");$("#world").classList.remove("hidden");$("#exitInterior").classList.add("hidden");$("#sceneName").textContent="수도권";$("#sceneSub").textContent="WASD 이동 · 건물 클릭 · E 상호작용";save()
}
function moveTo(loc){
 const [x,y]=mapPos[loc];S.px=x;S.py=y;renderPlayer();setTimeout(()=>enter(loc),420)
}
function renderPlayer(){$("#player").style.left=S.px+"%";$("#player").style.top=S.py+"%"}

function modal(icon,title,text,actions=[],body=""){
 $("#modalIcon").textContent=icon;$("#modalTitle").textContent=title;$("#modalText").textContent=text;$("#modalBody").innerHTML=body;
 const box=$("#modalActions");box.innerHTML="";
 actions.forEach(a=>{let b=document.createElement("button");b.innerHTML=`<b>${a[0]}</b><span class="${a[3]||""}">${a[1]}</span>`;b.onclick=a[2];box.appendChild(b)});
 $("#modal").classList.remove("hidden")
}
function closeModal(){$("#modal").classList.add("hidden")}
function simpleAct(cost,days,changes,msg){
 if(cost&&!spend(cost))return;
 Object.entries(changes.stats||{}).forEach(([k,v])=>S.stats[k]=clamp(S.stats[k]+v));
 Object.entries(changes.inf||{}).forEach(([k,v])=>S.inf[k]=clamp(S.inf[k]+v));
 if(changes.cash)S.cash+=changes.cash;if(changes.heat)S.heat=clamp(S.heat+changes.heat);
 if(changes.xp)addXP(changes.xp);
 closeModal();advance(days,msg);toast(msg)
}
function joinCareer(key){
 if(S.career&&S.career!==key){toast("현재 커리어를 정리해야 합니다.");return}
 if(!S.career){S.career=key;S.level=0;S.xp=0;log(`${careers[key].name} 커리어를 시작했습니다.`)}
 updateAll();save();closeModal();toast(`${careers[key].name} 시작`)
}

function action(a){
 const A={
 rest:()=>simpleAct(0,2,{stats:{stress:-18,health:4}},"충분히 쉬었습니다."),
 computer:()=>modal("🖥️","컴퓨터","무엇을 할까요?",[
  ["온라인 강의","₩300,000 · 지능 +3",()=>simpleAct(300000,3,{stats:{int:3,stress:2}},"온라인 강의를 수료했습니다.")],
  ["시장 조사","기업 영향력 +1 · 지능 +1",()=>simpleAct(0,2,{stats:{int:1},inf:{business:1}},"사업 아이디어를 조사했습니다.")]
 ]),
 wardrobe:()=>showAssets(),
 kitchen:()=>familyLife(),

 corpWork:()=>{if(S.career!=="corp")return modal("💻","업무 데스크","직원이 아니면 업무를 맡을 수 없습니다.",[["입사지원","기업 커리어 시작",()=>joinCareer("corp")]]);simpleAct(0,5,{stats:{stress:6,int:1},inf:{business:2},xp:18},"프로젝트 성과를 냈습니다.")},
 corpHR:()=>modal("🧑‍💼","인사팀",S.career==="corp"?`현재 ${careerName()} · 경력 ${S.xp}`:"대기업 커리어를 시작할 수 있습니다.",[["입사/재직","기업 커리어",()=>joinCareer("corp")],["퇴사","현재 직업 종료",()=>quitCareer()]]),
 corpPolitics:()=>simpleAct(1000000,3,{stats:{net:4,pol:2,stress:5},inf:{business:3},xp:S.career==="corp"?8:0},"임원 라인과 관계를 만들었습니다."),
 business:()=>shopBusiness(),

 class:()=>simpleAct(450000,5,{stats:{int:5,stress:2}},"집중 수업으로 실력이 늘었습니다."),
 club:()=>simpleAct(250000,3,{stats:{cha:3,net:4,stress:-1}},"동아리에서 사람들을 만났습니다."),
 gym:()=>simpleAct(180000,3,{stats:{health:5,lead:2,stress:-4}},"체력과 자신감을 키웠습니다."),
 grad:()=>simpleAct(18000000,30,{stats:{int:12,net:5,reputation:3}},"집중 교육 과정을 마쳤습니다."),

 partyOffice:()=>partyOffice(),
 assembly:()=>assemblyAction(),
 campaign:()=>simpleAct(3000000,7,{stats:{cha:2,reputation:5,stress:6},inf:{political:3}},"대중 연설과 지역 활동을 진행했습니다."),
 presidency:()=>presidency(),

 milHR:()=>modal("🎖️","인사사령부",S.career==="military"?`현재 ${careerName()} · 진급점수 ${S.xp}`:"군인 커리어에 들어갈 수 있습니다.",[["군 커리어","입대/임관",()=>joinCareer("military")],["퇴직","현재 군 경력 종료",()=>quitCareer()]]),
 command:()=>{if(S.career!=="military")return toast("군 경력이 필요합니다.");simpleAct(0,6,{stats:{lead:4,stress:5,health:1},inf:{military:4},xp:20},"지휘 훈련과 보직 경험을 쌓았습니다.")},
 generalClub:()=>simpleAct(2500000,4,{stats:{net:3,pol:2,stress:3},inf:{military:5}},"고위 군 인맥을 넓혔습니다."),
 milPower:()=>militaryPower(),

 deposit:()=>moneyMove("deposit"),
 loan:()=>loanAction(),
 invest:()=>investAction(),
 wealth:()=>showAssets(),

 homes:()=>shopHomes(),
 incomeProperty:()=>shopProperty(),
 interiorShop:()=>simpleAct(25000000,10,{stats:{reputation:3,stress:-3}},"집을 고급스럽게 꾸몄습니다."),
 sellProperty:()=>sellProperty(),

 cars1:()=>shopCars(0,1),cars2:()=>shopCars(1,2),cars3:()=>shopCars(3,4),mycar:()=>myCar(),
 fashion:()=>shopItems("fashion","👔","패션관"),watch:()=>shopItems("watch","⌚","시계관"),
 jewelry:()=>simpleAct(8000000,1,{stats:{reputation:2,cha:1}},"고급 선물을 구입했습니다."),
 vip:()=>luxuryLifestyle(),

 network:()=>simpleAct(600000,2,{stats:{net:5,cha:1,stress:-2}},"새로운 사람들과 연결됐습니다."),
 dating:()=>datingAction(),
 vipNetwork:()=>{if(S.stats.reputation<35)return toast("평판 35 이상이 필요합니다.");simpleAct(5000000,3,{stats:{net:7,pol:3},inf:{business:2,political:2}},"정·재계 VIP와 인맥을 만들었습니다.")},
 nightEvent:()=>nightEvent(),

 studio:()=>simpleAct(1500000,2,{stats:{cha:3,reputation:4},inf:{media:2}},"방송 출연으로 인지도가 올랐습니다."),
 newsroom:()=>simpleAct(2500000,3,{stats:{net:4},inf:{media:4}},"언론계 인맥을 만들었습니다."),
 mediaBuy:()=>buyMedia(),
 pr:()=>simpleAct(4000000,3,{stats:{reputation:6},inf:{media:3}},"전문 PR팀이 이미지를 관리했습니다."),

 underJoin:()=>{if(!S.career)return modal("🌒","연결책","지하세계 커리어에 들어가면 돈은 빠르지만 수사 위험과 악명이 따라옵니다.",[["들어간다","지하세계 커리어 시작",()=>joinCareer("underworld")]]);if(S.career!=="underworld")toast("다른 커리어를 정리해야 합니다.")},
 underDeal:()=>{if(S.career!=="underworld")return toast("지하세계 경력이 필요합니다.");let gain=(S.level+1)*rnd(2000000,5000000);simpleAct(0,3,{cash:gain,stats:{notoriety:3,stress:5},inf:{under:4},heat:8,xp:16},`위험한 거래로 ${KRW(gain)}를 벌었습니다.`)},
 underRank:()=>{if(S.career!=="underworld")return toast("지하세계 경력이 필요합니다.");simpleAct(1500000,4,{stats:{lead:2,net:2,notoriety:2},inf:{under:5},heat:5,xp:20},"조직 내 입지를 키웠습니다.")},
 heat:()=>modal("🚨","수사 위험",`현재 수사 위험 ${Math.round(S.heat)}/100 · 악명 ${Math.round(S.stats.notoriety)}/100`,[],`<div class="systemList"><div class="systemRow"><span>위험이 높을수록</span><b>벌금·구금·평판 하락 가능성 증가</b></div></div>`)
 };
 A[a]?.()
}

function quitCareer(){S.career=null;S.level=0;S.xp=0;closeModal();updateAll();save();toast("현재 커리어를 종료했습니다.")}

function partyOffice(){
 const acts=[];
 if(S.career!=="politics")acts.push(["정치 입문","정치 커리어 시작",()=>joinCareer("politics")]);
 if(!S.faction.party)acts.push(["신당 창당","₩100,000,000 · 평판 30 · 인맥 35 필요",()=>createParty(),"require"]);
 else acts.push(["당 조직 확대",`${S.faction.party} · 지지 ${Math.round(S.faction.partySupport)} · ${S.faction.partySeats}석`,()=>partyGrow()]);
 modal("🗳️","정당 사무실",S.faction.party?`당신의 정당: ${S.faction.party}`:"기존 정치권에 들어가거나 직접 정당을 만들 수 있습니다.",acts)
}
function createParty(){
 if(S.cash<100000000||S.stats.reputation<30||S.stats.net<35)return toast("현금 1억·평판 30·인맥 35가 필요합니다.");
 const n=prompt("정당 이름을 입력하세요","미래국민당");if(!n)return;
 spend(100000000);S.faction.party=n.slice(0,18);S.faction.partySupport=12;S.inf.political=clamp(S.inf.political+12);S.stats.reputation=clamp(S.stats.reputation+5);S.career=S.career||"politics";log(`${S.faction.party}를 창당했습니다.`);closeModal();advance(30);toast("정당을 창당했습니다.")
}
function partyGrow(){
 if(!spend(12000000))return;S.faction.partySupport=clamp(S.faction.partySupport+rnd(2,6));S.inf.political=clamp(S.inf.political+3);S.stats.net=clamp(S.stats.net+3);closeModal();advance(14,"전국 조직을 확대했습니다.")
}
function assemblyAction(){
 const body=`<div class="systemList">
 <div class="systemRow"><span>국회 구조</span><b>단원제 · 300석 · 의원 임기 4년</b></div>
 <div class="systemRow"><span>내 정당</span><b>${S.faction.party?S.faction.party+" · "+S.faction.partySeats+"석":"없음"}</b></div>
 <div class="systemRow"><span>개헌 조건</span><b>국회 재적 2/3 찬성 후 국민투표</b></div></div>`;
 const acts=[];
 if(S.career==="politics")acts.push(["의정 활동","정치력·평판·경력 증가",()=>simpleAct(0,7,{stats:{pol:3,reputation:2,stress:4},inf:{political:3},xp:18},"의정 활동으로 존재감을 키웠습니다.")]);
 if(S.faction.partySeats>=200)acts.push(["개헌 추진","의석 200석 이상 · 국민투표는 시뮬레이션",()=>constitutionalReform()]);
 modal("🏛️","국회 본회의장","정당 의석이 커질수록 법과 제도를 바꿀 힘이 커집니다.",acts,body)
}
function constitutionalReform(){
 const chance=clamp(45+S.nation.mood*.35+S.stats.reputation*.2);
 if(rnd(1,100)<=chance){S.inf.political=100;S.stats.reputation=clamp(S.stats.reputation+8);log("개헌 국민투표가 가결되어 게임 내 정치체계가 크게 바뀌었습니다.");toast("개헌 가결")}
 else {S.stats.reputation=clamp(S.stats.reputation-6);log("개헌안이 국민투표에서 부결되었습니다.");toast("개헌 부결")}
 closeModal();advance(60)
}
function presidency(){
 const d=dateObj(), months=(S.nation.nextPresElection-d.getFullYear())*12+(5-(d.getMonth()+1));
 const acts=[];
 if(S.career==="politics"&&S.level>=7)acts.push(["대선 준비","다음 대선에서 자동으로 후보 평가",()=>simpleAct(30000000,30,{stats:{cha:4,reputation:6,pol:3},inf:{media:5,political:5}},"대통령 선거 캠프를 준비했습니다.")]);
 if(S.nation.currentPresident===S.name)acts.push(["국정 운영","경제·안정도·민심에 영향을 준다",()=>govern()]);
 modal("🇰🇷","대통령실 라인",`현재 대통령: ${S.nation.currentPresident}${S.nation.simulated?" (게임 시뮬레이션)":""}. 다음 대선 시스템 시점까지 약 ${Math.max(0,months)}개월.`,acts)
}
function govern(){
 const e=rnd(-3,6),s=rnd(-3,5),m=rnd(-5,6);S.nation.economy=clamp(S.nation.economy+e);S.nation.stability=clamp(S.nation.stability+s);S.nation.mood=clamp(S.nation.mood+m);S.stats.stress=clamp(S.stats.stress+8);S.inf.political=100;closeModal();advance(14,"대통령으로 국정 현안을 처리했습니다.")
}

function militaryPower(){
 const body=`<div class="systemList">
 <div class="systemRow"><span>군 영향력</span><b>${Math.round(S.inf.military)}/100</b></div>
 <div class="systemRow"><span>국가 안정도</span><b>${Math.round(S.nation.stability)}/100</b></div>
 <div class="systemRow"><span>군벌 루트</span><b>군 영향력 70 · 리더십 60 · 안정도 35 이하 · 현금 5억</b></div></div>`;
 const acts=[];
 if(!S.faction.militaryBloc&&S.inf.military>=40&&S.stats.lead>=45)acts.push(["장성 파벌 형성","₩50,000,000 · 군 영향력 강화",()=>makeMilitaryBloc()]);
 if(!S.faction.warlord)acts.push(["군벌 세력화","국가가 붕괴 수준으로 흔들릴 때만 가능",()=>makeWarlord(),"require"]);
 else acts.push(["세력 확대",`${S.faction.warlord} · 지역 영향력 ${S.faction.warlord.control}/5`,()=>expandWarlord()]);
 modal("🗺️","전략상황실","현대 국가에서 군벌화는 정상적인 커리어가 아니라 국가 질서가 무너진 극단적 후반 상황에서만 열립니다.",acts,body)
}
function makeMilitaryBloc(){
 if(!spend(50000000))return;S.faction.militaryBloc="장성 네트워크";S.inf.military=clamp(S.inf.military+12);S.inf.political=clamp(S.inf.political+4);S.stats.net=clamp(S.stats.net+5);closeModal();advance(21,"고위 장교들을 중심으로 영향력 있는 군 내부 파벌을 형성했습니다.")
}
function makeWarlord(){
 if(S.inf.military<70||S.stats.lead<60||S.nation.stability>35||S.cash<500000000)return toast("군 영향력 70·리더십 60·안정도 35 이하·현금 5억이 필요합니다.");
 spend(500000000);S.faction.warlord={name:`${S.name}계 군사세력`,control:1,loyalty:55};S.inf.military=90;S.nation.stability=clamp(S.nation.stability-15);S.stats.reputation=clamp(S.stats.reputation-10);log("국가 붕괴 상황 속에서 독자 군사 권력 블록을 형성했습니다. (가상 게임 시스템)");closeModal();advance(30);toast("군벌 루트가 열렸습니다.")
}
function expandWarlord(){
 if(!spend(200000000))return;S.faction.warlord.control=clamp(S.faction.warlord.control+1,1,5);S.inf.military=clamp(S.inf.military+3);S.nation.stability=clamp(S.nation.stability-5);closeModal();advance(21,"군사 권력 블록의 지역 영향력이 확대되었습니다.")
}

function shopList(icon,title,list,buyfn){
 const body=`<div class="assetList">${list.map((x,i)=>`<div class="assetRow"><span>${x.n}</span><b>${KRW(x.p)}</b></div>`).join("")}</div>`;
 modal(icon,title,"돈을 벌면 생활수준과 체면, 현금흐름, 권력 기반을 실제로 바꿀 수 있습니다.",list.map((x,i)=>[x.n,KRW(x.p),()=>buyfn(x)]),body)
}
function shopItems(type,icon,title){shopList(icon,title,ITEMS[type],x=>{if(!spend(x.p))return;S.assets.items.push({...x,type});S.stats.reputation=clamp(S.stats.reputation+(x.rep||0));S.stats.cha=clamp(S.stats.cha+(x.cha||0));S.stats.net=clamp(S.stats.net+(x.net||0));S.inf.business=clamp(S.inf.business+(x.business||0));closeModal();advance(1,`${x.n}을 구입했습니다.`)})}
function shopCars(a,b){shopList("🚘","자동차",ITEMS.cars.slice(a,b+1),x=>{if(!spend(x.p))return;S.assets.car={...x};S.stats.reputation=clamp(S.stats.reputation+x.rep);closeModal();advance(1,`${x.n}을 구입했습니다.`)})}
function myCar(){modal("🔑","내 차",S.assets.car?`${S.assets.car.n} · 예상 자산가치 ${KRW(S.assets.car.p*.72)} · 월 유지비 ${KRW(S.assets.car.monthly)}`:"보유 차량이 없습니다.",S.assets.car?[["매각",`약 ${KRW(S.assets.car.p*.7)} 회수`,()=>{S.cash+=S.assets.car.p*.7;log(`${S.assets.car.n}을 매각했습니다.`);S.assets.car=null;closeModal();updateAll();save()}]]:[])}
function shopHomes(){shopList("🏢","주거 매물",ITEMS.homes,x=>{if(!spend(x.p))return;S.assets.home={name:x.n,value:x.p,monthly:x.monthly};S.stats.reputation=clamp(S.stats.reputation+x.rep);closeModal();advance(7,`${x.n}으로 이사했습니다.`)})}
function shopProperty(){shopList("🏙️","수익형 부동산",ITEMS.props,x=>{if(!spend(x.p))return;S.assets.properties.push({...x});S.inf.business=clamp(S.inf.business+3);closeModal();advance(14,`${x.n}을 매입했습니다. 월 임대수입 ${KRW(x.income)}`)})}
function sellProperty(){
 if(!S.assets.properties.length)return toast("매각할 수익형 부동산이 없습니다.");
 const list=S.assets.properties.map((x,i)=>[x.n,`약 ${KRW(x.p*.9)} 회수`,()=>{S.cash+=x.p*.9;S.assets.properties.splice(i,1);closeModal();updateAll();save()}]);
 modal("📑","부동산 매각","보유 자산을 현금화합니다.",list)
}
function shopBusiness(){shopList("📈","기업 투자 · 인수",ITEMS.biz,x=>{if(!spend(x.p))return;S.assets.businesses.push({...x});S.inf.business=clamp(S.inf.business+x.inf);if(x.media)S.inf.media=clamp(S.inf.media+x.media);closeModal();advance(30,`${x.n}을 소유하게 되었습니다. 월 현금흐름 ${KRW(x.income)}`)})}
function buyMedia(){let x=ITEMS.biz.find(x=>x.media);if(S.assets.businesses.some(b=>b.n===x.n))return toast("이미 미디어 회사를 보유하고 있습니다.");if(!spend(x.p))return;S.assets.businesses.push({...x});S.inf.media=clamp(S.inf.media+x.media);S.inf.business=clamp(S.inf.business+x.inf);closeModal();advance(30,"미디어 회사를 인수했습니다.")}
function showAssets(){
 const body=`<div class="assetList">
 <div class="assetRow"><span>현금</span><b>${KRW(S.cash)}</b></div>
 <div class="assetRow"><span>예금</span><b>${KRW(S.bank)}</b></div>
 <div class="assetRow"><span>부채</span><b class="red">${KRW(S.debt)}</b></div>
 <div class="assetRow"><span>주거</span><b>${S.assets.home.name}</b></div>
 <div class="assetRow"><span>차량</span><b>${S.assets.car?.n||"없음"}</b></div>
 <div class="assetRow"><span>가족</span><b>${S.spouse?S.spouse+" · 자녀 "+(S.children||0)+"명":"미혼"}</b></div>
 <div class="assetRow"><span>수익형 부동산</span><b>${S.assets.properties.length}개</b></div>
 <div class="assetRow"><span>보유 기업</span><b>${S.assets.businesses.length}개</b></div>
 <div class="assetRow"><span>순자산</span><b class="gold">${KRW(networth())}</b></div>
 <div class="assetRow"><span>월 순현금흐름</span><b class="${monthlyIncome().net>=0?"green":"red"}">${KRW(monthlyIncome().net)}</b></div></div>`;
 modal("💎","내 자산","돈은 단순 점수가 아니라 생활수준, 현금흐름, 평판과 권력을 바꿉니다.",[],body)
}
function moneyMove(type){
 if(type==="deposit"){
  const amt=Math.min(10000000,S.cash);if(amt<=0)return toast("예금할 현금이 없습니다.");S.cash-=amt;S.bank+=amt;closeModal();advance(1,`${KRW(amt)}을 예금했습니다.`)
 }
}
function loanAction(){
 const limit=Math.max(0,networth()*.35-S.debt);const amt=Math.min(100000000,limit);
 modal("💳","대출 센터",`현재 추가 한도 약 ${KRW(limit)}.`,amt>0?[["대출 실행",`${KRW(amt)} 수령`,()=>{S.debt+=amt;S.cash+=amt;closeModal();advance(1,"대출을 실행했습니다.")}]]:[])
}
function investAction(){
 modal("📊","투자 데스크","투자는 수익과 손실이 모두 발생합니다.",[
  ["안정형","₩10,000,000 · 낮은 변동성",()=>investment(10000000,false)],
  ["공격형","₩10,000,000 · 높은 변동성",()=>investment(10000000,true)]
 ])
}
function investment(amt,risky){
 if(!spend(amt))return;let r=risky?(Math.random()*.9-.32):(Math.random()*.22-.06);let out=Math.max(0,amt*(1+r));S.cash+=out;closeModal();advance(7,`투자 결과 ${r>=0?"+":""}${(r*100).toFixed(1)}% · ${KRW(out)} 회수`)
}
function datingAction(){
 const people=[
  {k:"seoyun",n:"서윤",job:"대기업 전략팀",icon:"👩🏻‍💼"},
  {k:"yuna",n:"유나",job:"변호사 · 정치권 인맥",icon:"👩🏻‍⚖️"},
  {k:"emma",n:"Emma",job:"외국계 금융",icon:"👩🏼‍💼"}
 ];
 if(!S.romance)S.romance={seoyun:12,yuna:8,emma:6};
 const body=`<div class="assetList">${people.map(p=>`<div class="assetRow"><span>${p.icon} ${p.n} · ${p.job}</span><b>호감 ${Math.round(S.romance[p.k]||0)}</b></div>`).join("")}</div>`;
 const acts=people.map(p=>[`${p.n}와 데이트`,`₩800,000 · 호감/매력 상승`,()=>{
   if(!spend(800000))return;S.romance[p.k]=clamp((S.romance[p.k]||0)+rnd(5,10));S.stats.cha=clamp(S.stats.cha+1);S.stats.stress=clamp(S.stats.stress-5);closeModal();advance(2,`${p.n}와 데이트했습니다.`)
 }]);
 const ready=people.find(p=>(S.romance[p.k]||0)>=70);
 if(!S.spouse&&ready)acts.push([`${ready.n}에게 청혼`,`호감 70+ · 결혼비용 ₩30,000,000`,()=>marry(ready)]);
 modal("💃","연애 · 관계","관계는 시간이 지나며 성장하고, 충분히 가까워지면 결혼과 가족으로 이어집니다.",acts,body)
}
function marry(p){
 if(!spend(30000000))return;S.spouse=p.n;S.stats.reputation=clamp(S.stats.reputation+3);S.stats.stress=clamp(S.stats.stress-8);log(`${p.n}와 결혼했습니다.`);closeModal();advance(30);toast("결혼했습니다.")
}
function familyLife(){
 if(!S.spouse)return modal("👨‍👩‍👧","가족 공간","아직 배우자가 없습니다. 라운지에서 관계를 발전시킬 수 있습니다.",[["건강식 준비","₩150,000 · 건강 +3",()=>simpleAct(150000,2,{stats:{health:3,stress:-2}},"생활 리듬을 관리했습니다.")]]);
 const acts=[
  ["배우자와 시간 보내기",`${S.spouse} · 스트레스 감소`,()=>simpleAct(300000,2,{stats:{stress:-8,cha:1}},`${S.spouse}와 시간을 보냈습니다.`)],
  ["가족 계획","₩10,000,000 · 자녀 가능",()=>{}]
 ];
 // replace placeholder action safely
 acts[1]=["가족 계획","₩10,000,000 · 자녀 1명 증가",()=>{if(!spend(10000000))return;S.children=(S.children||0)+1;S.stats.stress=clamp(S.stats.stress+4);S.stats.reputation=clamp(S.stats.reputation+2);closeModal();advance(90,`가족이 늘었습니다. 현재 자녀 ${S.children}명.`)}];
 modal("👨‍👩‍👧","우리 가족",`배우자 ${S.spouse} · 자녀 ${S.children||0}명`,acts)
}
function luxuryLifestyle(){
 shopList("✨","VIP 라이프스타일",ITEMS.luxury,x=>{if(!spend(x.p))return;S.assets.items.push({...x,type:"luxury"});S.stats.reputation=clamp(S.stats.reputation+(x.rep||0));S.stats.net=clamp(S.stats.net+(x.net||0));S.inf.business=clamp(S.inf.business+(x.business||0));closeModal();advance(3,`${x.n}을 확보했습니다. 월 유지비 ${KRW(x.monthly||0)}`)})
}
function nightEvent(){
 if(Math.random()<.5)simpleAct(3000000,2,{stats:{net:3,stress:-4,reputation:1}},"밤의 사교 모임에서 유용한 인맥을 얻었습니다.");
 else simpleAct(5000000,2,{stats:{stress:6,reputation:-2},heat:3},"밤의 선택이 소문을 만들었습니다.");
}

function showPolitics(){
 const body=`<div class="systemList">
 <div class="systemRow"><span>현직 대통령</span><b>${S.nation.currentPresident}${S.nation.simulated?" · 가상 시뮬레이션":""}</b></div>
 <div class="systemRow"><span>시작 기준</span><b>2026.09.13 · 제21대 대통령 이재명</b></div>
 <div class="systemRow"><span>대통령 선출</span><b>국민 직접선거 · 5년 단임</b></div>
 <div class="systemRow"><span>국회</span><b>단원제 300석 · 의원 임기 4년</b></div>
 <div class="systemRow"><span>다음 게임 총선</span><b>${S.nation.nextAssemblyElection}년</b></div>
 <div class="systemRow"><span>다음 게임 대선</span><b>${S.nation.nextPresElection}년</b></div>
 <div class="systemRow"><span>내 정당</span><b>${S.faction.party?S.faction.party+" / "+S.faction.partySeats+"석":"없음"}</b></div>
 <div class="systemRow"><span>군사 권력 블록</span><b>${S.faction.warlord?S.faction.warlord.name:"없음"}</b></div>
 </div>`;
 modal("🏛️","국가 권력 구조","실제 제도를 출발점으로 삼고, 이후 정치인·선거 결과·정국 사건은 플레이에 따라 가상으로 변화합니다.",[],body)
}

function quick(q){
 if(q==="rest")simpleAct(0,2,{stats:{stress:-12,health:3}},"집에서 쉬었습니다.");
 if(q==="study")simpleAct(200000,3,{stats:{int:2,stress:1}},"자기계발을 했습니다.");
 if(q==="social")simpleAct(150000,2,{stats:{net:2,cha:1}},"지인들과 연락하며 관계를 유지했습니다.");
 if(q==="work"){
  if(!S.career)return toast("먼저 직업을 선택하세요.");
  if(S.career==="corp")simpleAct(0,5,{stats:{stress:5,int:1},inf:{business:1},xp:15},"이번 주 업무를 마쳤습니다.");
  if(S.career==="military")simpleAct(0,5,{stats:{stress:5,lead:1},inf:{military:2},xp:15},"군 복무와 보직 업무를 수행했습니다.");
  if(S.career==="politics")simpleAct(0,5,{stats:{stress:6,pol:2},inf:{political:2},xp:15},"지역과 정당 업무를 수행했습니다.");
  if(S.career==="underworld"){let g=(S.level+1)*1500000;simpleAct(0,4,{cash:g,stats:{stress:5,notoriety:2},inf:{under:2},heat:5,xp:14},`지하세계 활동으로 ${KRW(g)}를 벌었습니다.`)}
 }
 if(q==="next")advance(7,"일주일이 흘렀습니다.")
}

function keyMove(e){
 if(S.location!=="city"||$("#startScreen").classList.contains("hidden")===false)return;
 let step=2.2;
 if(["w","ArrowUp"].includes(e.key))S.py-=step;
 if(["s","ArrowDown"].includes(e.key))S.py+=step;
 if(["a","ArrowLeft"].includes(e.key))S.px-=step;
 if(["d","ArrowRight"].includes(e.key))S.px+=step;
 S.px=clamp(S.px,2,94);S.py=clamp(S.py,5,90);renderPlayer();
 if(e.key.toLowerCase()==="e"){
  let best=null,dist=999;
  Object.entries(mapPos).forEach(([k,[x,y]])=>{let dd=Math.hypot(S.px-x,S.py-y);if(dd<dist){dist=dd;best=k}});
  if(dist<13)enter(best); else toast("건물에 더 가까이 가세요.");
 }
}

$$(".building").forEach(b=>b.onclick=()=>moveTo(b.dataset.loc));
$$("[data-quick]").forEach(b=>b.onclick=()=>quick(b.dataset.quick));
$("#exitInterior").onclick=exitInterior;$("#modalClose").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#politicsBtn").onclick=showPolitics;$("#assetsBtn").onclick=showAssets;$("#saveBtn").onclick=()=>{save();toast("저장했습니다.")};
$("#startBtn").onclick=()=>startBackground($("#startBg").value);
$("#continueBtn").onclick=()=>{$("#startScreen").classList.add("hidden");updateAll();renderPlayer()};
document.addEventListener("keydown",keyMove);

const existing=localStorage.getItem(SAVEKEY);
if(existing){
 try{S=JSON.parse(existing);S.romance=S.romance||{seoyun:12,yuna:8,emma:6};S.children=S.children||0;$("#continueBtn").classList.remove("hidden")}catch(e){}
}
updateAll();renderPlayer();
