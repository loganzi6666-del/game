/* LIFE : RISE V0.4 — expanded careers, living NPC society, investing, harder economy, deeper government */
const V4={newCareers:['police','prosecutor','doctor','lawyer','entertainer','athlete','entrepreneur']};

Object.assign(careers,{
 police:{name:'경찰',levels:['순경','경장','경사','경위','경감','경정','총경','경무관','치안정감'],salary:[2400000,2800000,3300000,4000000,5000000,6200000,7600000,9500000,12000000],primary:'lead'},
 prosecutor:{name:'검사',levels:['수습검사','평검사','부부장검사','부장검사','차장검사','검사장','고검장','검찰 수뇌부'],salary:[4800000,6500000,7800000,9500000,11500000,13500000,15500000,18500000],primary:'int'},
 doctor:{name:'의사',levels:['인턴','레지던트','전문의','펠로우','조교수','부교수','교수','병원장'],salary:[3200000,4500000,8500000,12000000,15000000,18000000,23000000,32000000],primary:'int'},
 lawyer:{name:'변호사',levels:['수습변호사','어쏘시에이트','시니어 변호사','파트너 후보','파트너','대표변호사','로펌 회장'],salary:[4000000,5500000,8000000,12000000,22000000,45000000,80000000],primary:'cha'},
 entertainer:{name:'연예인',levels:['연습생','신인','주목받는 스타','톱스타','국민스타','글로벌 스타','엔터 거물'],salary:[800000,2500000,7000000,18000000,45000000,90000000,150000000],primary:'cha'},
 athlete:{name:'운동선수',levels:['유망주','프로 신인','주전','올스타','리그 스타','국가대표','레전드'],salary:[1000000,4000000,9000000,20000000,45000000,80000000,120000000],primary:'health'},
 entrepreneur:{name:'사업가',levels:['1인 창업','초기 창업가','스타트업 대표','성장기업 CEO','중견기업 오너','대기업 회장','산업계 거물'],salary:[0,0,0,0,0,0,0],primary:'int'}
});

Object.assign(NPCS,{
 hyunjun:{name:'현준',role:'강력팀 형사',icon:'👮🏻‍♂️',loc:'underworld',zone:[8,56,22,75],romance:false,help:'political'},
 sohee:{name:'소희',role:'대학병원 의사',icon:'👩🏻‍⚕️',loc:'uni',zone:[74,13,91,31],romance:true,help:'business'},
 junho:{name:'준호',role:'대형로펌 변호사',icon:'🧑🏻‍⚖️',loc:'parliament',zone:[76,38,94,57],romance:false,help:'political'},
 aria:{name:'아리아',role:'가수 · 방송인',icon:'🎤',loc:'media',zone:[72,34,90,55],romance:true,help:'media'},
 minseok:{name:'민석',role:'프로 축구선수',icon:'⚽',loc:'lounge',zone:[78,66,94,88],romance:false,help:'business'},
 taewoo:{name:'태우',role:'스타트업 창업가',icon:'🧑🏻‍💻',loc:'corp',zone:[38,9,58,28],romance:false,help:'business'}
});

function ensureV4(){
 ensureV3();S.version=4;S.v4=S.v4||{};
 S.v4.difficulty=S.v4.difficulty||'REALISTIC';
 S.v4.monthsPlayed=S.v4.monthsPlayed||0;
 S.v4.market=S.v4.market||{regime:'중립',sentiment:50,news:'시장은 방향성을 탐색하고 있습니다.',lastMonth:S.date.slice(0,7),assets:{}};
 S.v4.holdings=S.v4.holdings||{};S.v4.realizedGain=S.v4.realizedGain||0;S.v4.taxPaid=S.v4.taxPaid||0;S.v4.tradeCount=S.v4.tradeCount||0;
 S.v4.npcLife=S.v4.npcLife||{};S.v4.gov=S.v4.gov||{cabinet:50,intel:45,security:58,warRisk:12,coalition:50,crisisCooldown:0};
 const basePrices={korea:100000,nasdaq:150000,semi:90000,bio:65000,bond:100000,bitcoin:85000000};
 Object.entries(basePrices).forEach(([k,p])=>{if(!S.v4.market.assets[k])S.v4.market.assets[k]={price:p,last:p,chg:0};if(!S.v4.holdings[k])S.v4.holdings[k]={qty:0,avg:0}});
 Object.entries(NPCS).forEach(([k,n])=>{if(S.relations[k]==null)S.relations[k]=rnd(5,18);if(n.romance&&S.romance[k]==null)S.romance[k]=rnd(4,12);if(!S.v3.npcs[k])S.v3.npcs[k]={x:(n.zone[0]+n.zone[2])/2,y:(n.zone[1]+n.zone[3])/2};if(S.v3.rivalry[k]==null)S.v3.rivalry[k]=0;if(!S.v4.npcLife[k])S.v4.npcLife[k]={age:rnd(23,36),careerLevel:rnd(0,3),wealth:rnd(12000000,120000000),status:'일상',married:false,ambition:rnd(25,85)}});
}
ensureV4();

const MARKET={
 korea:{name:'KOSPI 200 ETF',icon:'🇰🇷',risk:'중',vol:.055,bias:.004,link:'economy'},
 nasdaq:{name:'NASDAQ 100 ETF',icon:'🇺🇸',risk:'중상',vol:.075,bias:.007,link:'sentiment'},
 semi:{name:'반도체 성장주',icon:'💾',risk:'높음',vol:.12,bias:.009,link:'economy'},
 bio:{name:'바이오 성장주',icon:'🧬',risk:'매우 높음',vol:.16,bias:.006,link:'sentiment'},
 bond:{name:'국채 ETF',icon:'📜',risk:'낮음',vol:.018,bias:.002,link:'stability'},
 bitcoin:{name:'비트코인',icon:'₿',risk:'극고위험',vol:.22,bias:.012,link:'sentiment'}
};

function injectV4UI(){
 const top=$('.top-actions');if(top&&!$('#marketBtn'))top.insertAdjacentHTML('afterbegin','<button id="careerBtn" class="v4-btn careers">💼 직업</button><button id="marketBtn" class="v4-btn market">📈 투자</button><button id="societyBtn" class="v4-btn">🌐 사회</button>');
 $('#careerBtn')&&($('#careerBtn').onclick=openCareerCenter);$('#marketBtn')&&($('#marketBtn').onclick=openMarket);$('#societyBtn')&&($('#societyBtn').onclick=openSociety);
 if(!$('#v04Badge'))document.body.insertAdjacentHTML('beforeend','<div id="v04Badge"><b>V0.4 · REALISTIC ECONOMY</b><span>직업 11종 · 시장 투자 · NPC 인생 · 강화된 생활비/세금 · 고급 국가경영</span></div>');
 const old=$('#eventBadge');if(old)old.remove();
 const brand=document.querySelector('.brand span');if(brand)brand.textContent='Visual Life & Power Sandbox · V0.4';
}
injectV4UI();

const baseStartV4=startBackground;startBackground=function(bg){
 baseStartV4(bg);ensureV4();
 const cash={ordinary:8000000,poor:2000000,elite:18000000,military:10000000,wealthy:100000000}[bg]||8000000;S.cash=cash;
 S.bank=0;S.debt=0;S.v4.difficulty='REALISTIC';log('V0.4 현실경제 난이도: 생활비·세금·보험·투자위험이 강화되었습니다.');updateAll();save();
};

const baseMonthlyIncomeV4=monthlyIncome;monthlyIncome=function(){
 ensureV4();const f=baseMonthlyIncomeV4();
 let salary=S.career?(careers[S.career]?.salary[S.level]||0):0;
 let passive=0;S.assets.properties.forEach(x=>passive+=x.income||0);S.assets.businesses.forEach(x=>passive+=x.income||0);
 const incomeTax=Math.max(0,salary*.11+passive*.07);
 const insurance=Math.max(80000,salary*.04);
 const baseLiving=age()<25?250000:450000;
 const lifestyle=Math.min(2200000,Math.max(0,S.stats.reputation-20)*18000)+(S.spouse?350000:0)+(S.children||0)*450000;
 const businessOverhead=passive*.18;
 f.expenses+=incomeTax+insurance+baseLiving+lifestyle+businessOverhead;
 f.net=f.income-f.expenses;f.tax=incomeTax;f.insurance=insurance;f.living=baseLiving+lifestyle;f.overhead=businessOverhead;return f;
};

const baseNetworthV4=networth;networth=function(){ensureV4();let n=baseNetworthV4();Object.entries(S.v4.holdings).forEach(([k,h])=>n+=(h.qty||0)*(S.v4.market.assets[k]?.price||0));return n};

function marketValue(){let n=0;Object.entries(S.v4.holdings).forEach(([k,h])=>n+=(h.qty||0)*(S.v4.market.assets[k]?.price||0));return n}
function marketMonth(){
 ensureV4();const m=S.v4.market;const roll=Math.random();m.regime=roll<.12?'급락장':roll<.28?'약세장':roll<.72?'중립':roll<.9?'강세장':'과열장';
 const regimeAdj={급락장:-.10,약세장:-.035,중립:0,강세장:.035,과열장:.07}[m.regime];m.sentiment=clamp(50+regimeAdj*300+rnd(-12,12));
 const newsBy={급락장:'금리·경기 우려가 커지며 위험자산이 급락했습니다.',약세장:'투자자들이 현금을 선호하며 시장이 약해졌습니다.',중립:'실적과 거시경제 지표가 엇갈리며 종목별 장세가 이어집니다.',강세장:'기업 실적과 유동성 기대가 시장을 끌어올립니다.',과열장:'개인투자자 자금이 몰리며 고위험 자산까지 급등하고 있습니다.'};m.news=newsBy[m.regime];
 Object.entries(MARKET).forEach(([k,a])=>{const st=m.assets[k];st.last=st.price;let macro=0;if(a.link==='economy')macro=(S.nation.economy-50)/800;if(a.link==='stability')macro=(S.nation.stability-50)/1200;if(a.link==='sentiment')macro=(m.sentiment-50)/900;let r=a.bias+regimeAdj*(k==='bond'?-.25:1)+macro+(Math.random()*2-1)*a.vol;if(k==='bond'&&m.regime==='급락장')r+=.025;st.price=Math.max(100,Math.round(st.price*(1+r)));st.chg=(st.price/st.last-1)*100});
 if(m.regime==='급락장')S.stats.stress=clamp(S.stats.stress+2);S.v4.monthsPlayed++;
}

const baseMonthlyTickV4=monthlyTick;monthlyTick=function(){
 ensureV4();baseMonthlyTickV4();marketMonth();npcLifeMonth();advancedGovMonth();
 const f=monthlyIncome();if(f.net<0&&S.cash<Math.abs(f.net)*2)log('생활비와 고정비 부담이 커지고 있습니다. 소비나 자산 구조조정이 필요합니다.');
};

function openMarket(){
 ensureV4();const m=S.v4.market;const rows=Object.entries(MARKET).map(([k,a])=>{const st=m.assets[k],h=S.v4.holdings[k],v=h.qty*st.price,pl=h.qty?((st.price-h.avg)/h.avg*100):0;return `<div class="ticker"><div><b>${a.icon} ${a.name}<span class="riskChip">${a.risk}</span></b><small>보유 ${h.qty.toFixed(k==='bitcoin'?4:2)} · 평단 ${h.avg?KRW(h.avg):'-'}</small></div><div class="price">${KRW(st.price)}</div><div class="chg ${st.chg>=0?'up':'down'}">${st.chg>=0?'+':''}${st.chg.toFixed(1)}%</div><div class="holding">${KRW(v)}<br>${h.qty?`${pl>=0?'+':''}${pl.toFixed(1)}%`:'미보유'}</div></div>`}).join('');
 const body=`<div class="marketHeader"><div class="marketKpi"><span>시장 국면</span><b>${m.regime}</b></div><div class="marketKpi"><span>투자자산</span><b>${KRW(marketValue())}</b></div><div class="marketKpi"><span>거래횟수</span><b>${S.v4.tradeCount}</b></div></div><div class="marketNews">📰 ${m.news}<br>매수 수수료 0.20% · 매도 수수료 0.25% · 수익 실현 시 게임세금 15%</div><div class="marketList">${rows}</div>`;
 modal('📈','투자 시장','한 번 클릭해서 즉시 수익이 나는 구조를 없앴습니다. 시장은 매월 변하고 경제·안정도·투자심리의 영향을 받습니다.',Object.entries(MARKET).map(([k,a])=>[`${a.icon} ${a.name}`,`매수/매도 · 현재 ${KRW(m.assets[k].price)}`,()=>openTrade(k)]),body)
}
function openTrade(k){const a=MARKET[k],st=S.v4.market.assets[k],h=S.v4.holdings[k];const body=`<div class="tradeGrid"><div class="tradeBox"><b>매수</b><span>현금 ${KRW(S.cash)} · 수수료 0.20%</span><input id="buyAmount" type="number" min="10000" step="10000" value="1000000"></div><div class="tradeBox"><b>매도</b><span>보유가치 ${KRW(h.qty*st.price)} · 수수료 0.25% + 이익세 15%</span><input id="sellAmount" type="number" min="10000" step="10000" value="500000"></div></div>`;modal(a.icon,a.name,`현재가 ${KRW(st.price)} · 위험도 ${a.risk}`,[["금액만큼 매수","입력한 원화 금액 기준",()=>tradeBuy(k)],["금액만큼 매도","입력한 원화 금액 기준",()=>tradeSell(k)],["시장으로","전체 종목으로 돌아가기",()=>openMarket()]],body)}
function tradeBuy(k){const amt=Math.max(0,Number($('#buyAmount')?.value||0)),fee=amt*.002,total=amt+fee;if(amt<10000)return toast('최소 1만원 이상 투자하세요.');if(S.cash<total)return toast('수수료 포함 현금이 부족합니다.');const st=S.v4.market.assets[k],h=S.v4.holdings[k],qty=amt/st.price,newCost=h.avg*h.qty+amt;S.cash-=total;h.qty+=qty;h.avg=h.qty?newCost/h.qty:0;S.v4.tradeCount++;log(`${MARKET[k].name} ${KRW(amt)} 매수.`);save();updateAll();openMarket()}
function tradeSell(k){const target=Math.max(0,Number($('#sellAmount')?.value||0)),st=S.v4.market.assets[k],h=S.v4.holdings[k],max=h.qty*st.price,amt=Math.min(target,max);if(amt<10000||h.qty<=0)return toast('매도할 보유자산이 부족합니다.');const qty=amt/st.price,cost=h.avg*qty,gain=Math.max(0,amt-cost),fee=amt*.0025,tax=gain*.15,net=amt-fee-tax;h.qty=Math.max(0,h.qty-qty);if(h.qty<1e-8){h.qty=0;h.avg=0}S.cash+=net;S.v4.realizedGain+=gain;S.v4.taxPaid+=tax;S.v4.tradeCount++;log(`${MARKET[k].name} 매도 · 세후 ${KRW(net)} 회수.`);save();updateAll();openMarket()}

function openCareerCenter(){
 ensureV4();const desc={police:'치안·수사·조직 진급. 정의와 실적 사이의 선택.',prosecutor:'수사·기소·권력 사건. 지능과 정치력이 중요.',doctor:'생명·연구·병원 정치. 높은 진입 난이도와 안정적 수입.',lawyer:'소송·협상·대형 고객. 매력과 지능이 돈으로 연결.',entertainer:'오디션·방송·스캔들. 성공 시 큰돈, 실패 시 수입 불안정.',athlete:'경기·부상·이적. 짧은 전성기와 높은 보상.',entrepreneur:'사업 아이디어·투자유치·파산 위험. 월급 없이 직접 수익을 만든다.'};
 const body=`<div class="careerGrid">${V4.newCareers.map(k=>`<div class="careerCard"><b>${careers[k].name}</b><span>${desc[k]}</span><em>${S.career===k?'현재 직업':'진입 가능'}</em></div>`).join('')}</div><div class="difficultyBox">현실경제 난이도에서는 고연봉 직업도 세금·보험·생활비를 내며, 사업가는 고정 월급이 없습니다.</div>`;
 modal('💼','직업 센터','기존 기업·군·정치·지하세계 외에 전문직·연예·스포츠·창업 커리어가 추가되었습니다.',V4.newCareers.map(k=>[careers[k].name,careers[k].levels[0]+'부터 시작',()=>startV4Career(k)]),body)
}
function startV4Career(k){if(S.career&&S.career!==k)return toast('현재 커리어를 먼저 정리해야 합니다.');const req={prosecutor:45,doctor:48,lawyer:42}[k];if(req&&S.stats.int<req)return toast(`지능 ${req} 이상이 필요합니다.`);if(k==='athlete'&&S.stats.health<65)return toast('건강 65 이상이 필요합니다.');if(k==='entertainer'&&S.stats.cha<35)return toast('매력 35 이상이 필요합니다.');joinCareer(k)}

const baseQuickV4=quick;quick=function(q){
 if(q==='work'&&V4.newCareers.includes(S.career)){const c=S.career;let d={stats:{stress:5},xp:14},msg='이번 주 업무를 수행했습니다.';if(c==='police'){d.stats.lead=1;d.inf={political:1};msg='현장 근무와 사건 처리를 수행했습니다.'}if(c==='prosecutor'){d.stats.int=1;d.stats.pol=1;msg='사건 기록과 수사 지휘를 처리했습니다.'}if(c==='doctor'){d.stats.int=1;d.stats.health=-1;d.stats.reputation=1;msg='진료와 당직을 마쳤습니다.'}if(c==='lawyer'){d.stats.cha=1;d.inf={business:1};msg='의뢰인 상담과 사건 대응을 마쳤습니다.'}if(c==='entertainer'){d.stats.cha=1;d.inf={media:2};d.stats.reputation=1;msg='촬영과 방송 일정을 소화했습니다.'}if(c==='athlete'){d.stats.health=-1;d.stats.reputation=1;d.inf={media:1};msg='훈련과 경기를 치렀습니다.'}if(c==='entrepreneur'){const rev=Math.max(0,(S.level+1)*rnd(200000,1400000)-rnd(300000,1800000));d.cash=rev;d.stats.int=1;d.inf={business:2};d.stats.stress=7;msg=rev>0?`이번 주 사업에서 ${KRW(rev)}를 남겼습니다.`:'이번 주 사업은 손익분기에도 못 미쳤습니다.'}return simpleAct(0,5,d,msg)}
 baseQuickV4(q)
};

EVENTS.push(
 evt('police_night','police','🚔','심야 강력사건','관할 지역에서 중대한 사건이 발생했고, 인력은 부족하다. 현장 지휘를 맡을 기회다.',[choice('직접 현장 지휘','리더십 판정 · 성공 시 빠른 진급',{success:{xp:24,stats:{lead:2,reputation:3,stress:9},inf:{political:2}},fail:{xp:5,stats:{health:-4,stress:13,reputation:-2}},successText:'침착한 지휘로 사건을 안정적으로 마무리했습니다.',failText:'현장이 꼬이며 책임론이 생겼습니다.'},{check:['lead',42]}),choice('정보팀과 공조','지능/인맥 중심의 안전한 접근',{success:{xp:16,stats:{int:2,net:2,stress:5}},fail:{xp:6,stats:{stress:6}},successText:'증거를 차근차근 쌓아 사건을 해결했습니다.',failText:'결정적 단서를 놓쳤습니다.'},{check:['int',40]}),choice('상부에 지원 요청','성과는 적지만 위험 최소화',{xp:7,stats:{stress:1},resultText:'대규모 지원으로 사건을 안정적으로 처리했습니다.'})]),
 evt('prosecutor_pressure','prosecutor','⚖️','민감한 권력 사건','유력 인사가 연루된 사건이 배당됐다. 증거는 있지만 정치적 압박도 거세다.',[choice('원칙대로 수사','지능/정치력 판정 · 성공 시 명성',{success:{xp:26,stats:{int:1,pol:2,reputation:5,stress:10},inf:{political:3}},fail:{xp:7,stats:{reputation:-3,stress:13}},successText:'흔들리지 않는 수사로 대중의 신뢰를 얻었습니다.',failText:'수사와 조직 정치 모두 꼬였습니다.'},{check:['pol',48]}),choice('조직 내부 합의부터 만든다','인맥 중심 · 장기적으로 안전',{success:{xp:16,stats:{net:3,pol:2},inf:{political:2}},fail:{stats:{stress:7}},successText:'상부와 수사팀의 방어선을 만들었습니다.',failText:'누구도 책임지려 하지 않았습니다.'},{check:['net',45]}),choice('사건을 피한다','승진 위험 감소 · 평판 손실',{xp:4,stats:{reputation:-3,stress:-3},resultText:'당장은 안전했지만 주변은 당신의 선택을 기억합니다.'})]),
 evt('doctor_emergency','doctor','🏥','응급실의 밤','응급수술이 겹치고 의료진은 지쳐 있다. 중요한 판단을 내려야 한다.',[choice('가장 어려운 수술을 맡는다','지능 판정 · 성공 시 명성 급상승',{success:{xp:25,stats:{int:2,reputation:5,stress:12,health:-2}},fail:{xp:4,stats:{reputation:-4,stress:15,health:-3}},successText:'어려운 케이스를 성공적으로 마쳤습니다.',failText:'최선을 다했지만 결과가 좋지 않았습니다.'},{check:['int',52]}),choice('팀을 재배치한다','리더십 판정',{success:{xp:17,stats:{lead:3,reputation:2,stress:6}},fail:{stats:{stress:9}},successText:'병목을 풀어 응급실 전체가 안정됐습니다.',failText:'인력 배치가 오히려 혼선을 만들었습니다.'},{check:['lead',43]}),choice('내 컨디션을 우선한다','건강 보호 · 경력 상승 적음',{xp:5,stats:{health:3,stress:-5},resultText:'무리하지 않고 다음 근무를 준비했습니다.'})]),
 evt('lawyer_client','lawyer','📁','거액의 기업 사건','대기업이 매우 큰 사건을 맡기려 한다. 이기면 이름값이 뛰지만 준비비와 평판 위험이 크다.',[choice('정면 승부','지능 판정 · 큰 성과',{success:{cash:8000000,xp:25,stats:{reputation:5,stress:10},inf:{business:4}},fail:{cash:-3000000,xp:4,stats:{reputation:-4,stress:12}},successText:'승소하며 업계에서 이름이 크게 올랐습니다.',failText:'패소와 비용 부담이 동시에 남았습니다.'},{check:['int',48]}),choice('합의를 이끈다','매력 판정 · 안정적인 보수',{success:{cash:4000000,xp:15,stats:{cha:2,net:2},inf:{business:2}},fail:{xp:5,stats:{stress:6}},successText:'양측이 받아들일 합의를 만들었습니다.',failText:'협상 창구가 닫혔습니다.'},{check:['cha',46]}),choice('거절한다','위험 회피',{stats:{stress:-2},resultText:'큰 기회는 놓쳤지만 리스크를 피했습니다.'})]),
 evt('ent_audition','entertainer','🎬','대형 프로젝트 오디션','화제작의 주연 자리가 열렸다. 경쟁자는 이미 유명하다.',[choice('모든 걸 걸고 도전','매력 판정 · 성공 시 폭발적 성장',{success:{cash:12000000,xp:30,stats:{cha:2,reputation:7,stress:8},inf:{media:6}},fail:{xp:4,stats:{stress:10,reputation:-1}},successText:'오디션장을 뒤집으며 주연을 따냈습니다.',failText:'좋은 평가를 받았지만 배역은 다른 사람에게 갔습니다.'},{check:['cha',50]}),choice('인맥으로 제작진 미팅','인맥 판정',{success:{xp:18,stats:{net:3,reputation:2},inf:{media:4}},fail:{stats:{reputation:-2,stress:5}},successText:'정식 미팅으로 새로운 배역을 얻었습니다.',failText:'과도한 인맥 플레이로 뒷말이 나왔습니다.'},{check:['net',46]}),choice('작은 작품을 고른다','안정적인 성장',{cash:1800000,xp:10,stats:{reputation:1},resultText:'작은 작품에서 차분히 경력을 쌓았습니다.'})]),
 evt('athlete_final','athlete','🏆','중요한 경기','시즌의 흐름을 바꿀 큰 경기를 앞뒀다. 몸 상태는 완벽하지 않다.',[choice('출전을 강행','건강/리더십 판정',{success:{cash:5000000,xp:24,stats:{reputation:6,health:-3,stress:8},inf:{media:3}},fail:{xp:3,stats:{health:-12,stress:10}},successText:'결정적인 활약으로 팀을 승리로 이끌었습니다.',failText:'부상까지 겹치며 경기를 망쳤습니다.'},{check:['health',75]}),choice('팀 플레이에 집중','리더십 판정',{success:{xp:17,stats:{lead:2,reputation:3,health:-2}},fail:{xp:6,stats:{stress:5}},successText:'개인 기록보다 팀 승리를 만들었습니다.',failText:'존재감을 보여주지 못했습니다.'},{check:['lead',43]}),choice('회복을 택한다','부상 위험 최소화',{xp:4,stats:{health:7,stress:-4},resultText:'경기는 놓쳤지만 몸을 회복했습니다.'})]),
 evt('startup_runway','entrepreneur','🚀','통장 잔고가 줄어든다','회사의 현금이 빠르게 줄고 있다. 투자 유치, 매출, 비용절감 중 하나에 집중해야 한다.',[choice('투자유치 피칭','매력/인맥 판정',{success:{cash:18000000,xp:24,stats:{cha:2,net:2,stress:7},inf:{business:5}},fail:{cash:-1200000,xp:3,stats:{stress:11}},successText:'새 투자금을 유치해 런웨이를 늘렸습니다.',failText:'투자자들을 설득하지 못했고 비용만 썼습니다.'},{check:['net',45]}),choice('매출에 올인','지능 판정 · 성공 시 실질 현금',{success:{cash:7000000,xp:18,stats:{int:2,stress:8},inf:{business:3}},fail:{cash:-800000,stats:{stress:9}},successText:'핵심 고객을 확보해 현금흐름이 살아났습니다.',failText:'세일즈 비용만 늘었습니다.'},{check:['int',44]}),choice('인원·비용 감축','평판 손실 · 생존력 증가',{cash:1500000,xp:8,stats:{reputation:-2,stress:5},resultText:'회사는 작아졌지만 당장 버틸 시간을 벌었습니다.'})])
);

function npcLifeMonth(){
 ensureV4();Object.entries(S.v4.npcLife).forEach(([k,l])=>{l.wealth=Math.max(0,l.wealth+rnd(-1500000,3500000));if(Math.random()<.08&&l.careerLevel<7){l.careerLevel++;l.status='승진'}else l.status='일상';if(!l.married&&l.age>27&&Math.random()<.015){l.married=true;l.status='결혼'}if(Math.random()<.03&&l.ambition>60){S.v3.rivalry[k]=clamp((S.v3.rivalry[k]||0)+2)}});
 if(S.v4.monthsPlayed>0&&S.v4.monthsPlayed%12===0)Object.values(S.v4.npcLife).forEach(l=>l.age++);
}
function openSociety(){ensureV4();const body=`<div class="npcTimeline">${Object.entries(NPCS).map(([k,n])=>{const l=S.v4.npcLife[k];return `<div class="npcLifeRow"><div class="ico">${n.icon}</div><div><b>${n.name} · ${l.age}세</b><span>${n.role} · 커리어 Lv.${l.careerLevel+1} · ${l.married?'기혼':'미혼'}</span></div><em>${l.status}<br>${KRW(l.wealth)}</em></div>`}).join('')}</div>`;modal('🌐','살아있는 사회','NPC들도 나이를 먹고 승진하고 돈을 벌고 결혼합니다. 야망이 높은 인물은 당신의 경쟁자가 될 수 있습니다.',Object.entries(NPCS).slice(0,10).map(([k,n])=>[n.name,`관계 ${Math.round(S.relations[k]||0)} · 경쟁 ${Math.round(S.v3.rivalry[k]||0)}`,()=>npcInteract(k)]),body)}

function advancedGovMonth(){ensureV4();if(S.nation.currentPresident!==S.name)return;const g=S.v4.gov;g.crisisCooldown=Math.max(0,g.crisisCooldown-1);g.warRisk=clamp(g.warRisk+rnd(-2,3)+(S.nation.stability<45?2:0));g.security=clamp(g.security+rnd(-2,2));g.coalition=clamp(g.coalition+rnd(-3,2)+(S.faction.partySeats>=151?1:0));if(g.warRisk>55&&g.crisisCooldown===0&&Math.random()<.22){g.crisisCooldown=4;S.nation.stability=clamp(S.nation.stability-6);S.v3.gov.approval=clamp(S.v3.gov.approval-3);log('안보 위기가 발생했습니다. 국정 메뉴에서 대응이 필요합니다.')}}
const baseOpenGovernmentV4=openGovernment;openGovernment=function(){
 ensureV4();if(S.nation.currentPresident!==S.name)return toast('대통령이 된 뒤 사용할 수 있습니다.');const g=S.v3.gov,a=S.v4.gov;const body=`<div class="govGrid"><div class="govKpi"><span>국정 지지율</span><b>${Math.round(g.approval)}%</b></div><div class="govKpi"><span>정부 재정</span><b>${KRW(g.treasury)}</b></div><div class="govKpi"><span>국가부채 증가</span><b>${KRW(g.debt)}</b></div></div><div class="govAdvanced"><div><span>내각 역량</span><b>${Math.round(a.cabinet)}</b></div><div><span>정보기관 역량</span><b>${Math.round(a.intel)}</b></div><div><span>안보 태세</span><b>${Math.round(a.security)}</b></div><div><span>군사위기</span><b>${Math.round(a.warRisk)}</b></div><div><span>여야 협치</span><b>${Math.round(a.coalition)}</b></div><div><span>외교력</span><b>${Math.round(g.foreign)}</b></div></div>`;const acts=[['예산·경제정책','기존 경제/복지/세금 정책',()=>openEconomicGov()],['장관 인선','내각 역량과 정치 지지 기반 조정',()=>govAdvancedAction('cabinet')],['정보기관 브리핑','₩800억 · 정보력/안보 상승',()=>govAdvancedAction('intel')],['야당 지도부 협상','정치력 판정 · 협치 개선',()=>govAdvancedAction('coalition')],['국가안보회의','위기 상승 시 안보 대응',()=>govAdvancedAction('security')],['정상외교','외교·경제 관계 강화',()=>govPolicy('summit')],['국방 현대화','군사위험 억제 · 큰 예산',()=>govAdvancedAction('defense')],['반부패 개혁','청렴도/권력 기반 재편',()=>govPolicy('integrity')]];modal('🇰🇷','대통령 국정 운영 V0.4','대통령 이후에도 내각·정보기관·안보·야당·재정의 균형을 관리해야 합니다.',acts,body)
};
function openEconomicGov(){const g=S.v3.gov;modal('💰','경제·예산 정책',`가용재원 ${KRW(g.treasury)} · 세율 ${g.tax}%`,[['경기부양','2조 · 경제 중심',()=>govPolicy('stimulus')],['복지 확대','1.5조 · 민심 중심',()=>govPolicy('welfare')],['인프라 투자','3조 · 장기 성장',()=>govPolicy('infra')],['증세','재정 개선 · 지지율 하락',()=>govPolicy('taxup')],['감세','단기 경기/인기 · 세수 감소',()=>govPolicy('taxdown')],['국정으로','상위 메뉴',()=>openGovernment()]])}
function govAdvancedAction(type){const a=S.v4.gov,g=S.v3.gov;let msg='';if(type==='cabinet'){const cost=120000000000;spendTreasury(cost);const ok=Math.random()*100<clamp(45+S.stats.pol*.4+S.stats.net*.2,25,90);if(ok){a.cabinet=clamp(a.cabinet+10);a.coalition=clamp(a.coalition+4);g.approval=clamp(g.approval+2);msg='능력과 정치적 균형을 갖춘 장관 인선을 마쳤습니다.'}else{a.cabinet=clamp(a.cabinet-4);g.approval=clamp(g.approval-4);msg='장관 후보 검증 논란이 커졌습니다.'}}if(type==='intel'){spendTreasury(80000000000);a.intel=clamp(a.intel+9);a.security=clamp(a.security+4);a.warRisk=clamp(a.warRisk-3);msg='정보기관 역량을 강화했습니다.'}if(type==='coalition'){const ok=Math.random()*100<clamp(40+S.stats.pol*.5+S.stats.cha*.2,20,92);if(ok){a.coalition=clamp(a.coalition+12);g.approval=clamp(g.approval+3);msg='야당과 주요 법안 협상에 합의했습니다.'}else{a.coalition=clamp(a.coalition-7);g.approval=clamp(g.approval-2);msg='협상이 결렬되어 정국이 더 경색됐습니다.'}}if(type==='security'){spendTreasury(500000000000);const ok=a.intel+a.security+rnd(-30,30)>90;if(ok){a.warRisk=clamp(a.warRisk-14);S.nation.stability=clamp(S.nation.stability+4);g.approval=clamp(g.approval+4);msg='국가안보회의 대응으로 위기를 완화했습니다.'}else{a.warRisk=clamp(a.warRisk+7);S.nation.stability=clamp(S.nation.stability-4);msg='대응이 엇갈리며 안보 불안이 커졌습니다.'}}if(type==='defense'){spendTreasury(2500000000000);a.security=clamp(a.security+12);a.warRisk=clamp(a.warRisk-7);S.inf.military=clamp(S.inf.military+2);msg='국방 현대화 계획을 승인했습니다.'}closeModal();advance(7,msg);setTimeout(openGovernment,100)}

const baseShowAssetsV4=showAssets;showAssets=function(){ensureV4();const f=monthlyIncome();const body=`<div class="assetList"><div class="assetRow"><span>현금</span><b>${KRW(S.cash)}</b></div><div class="assetRow"><span>투자자산</span><b>${KRW(marketValue())}</b></div><div class="assetRow"><span>부채</span><b class="red">${KRW(S.debt)}</b></div><div class="assetRow"><span>주거</span><b>${S.assets.home.name}</b></div><div class="assetRow"><span>차량</span><b>${S.assets.car?.n||'없음'}</b></div><div class="assetRow"><span>부동산/기업</span><b>${S.assets.properties.length} / ${S.assets.businesses.length}</b></div><div class="assetRow"><span>순자산</span><b class="gold">${KRW(networth())}</b></div><div class="assetRow"><span>월 총수입</span><b>${KRW(f.income)}</b></div><div class="assetRow"><span>세금·보험·생활비·고정비</span><b class="moneyDrain">-${KRW(f.expenses)}</b></div><div class="assetRow"><span>월 순현금흐름</span><b class="${f.net>=0?'green':'red'}">${KRW(f.net)}</b></div></div><div class="difficultyBox">V0.4 현실경제: 급여세·사회보험·기본생활비·생활수준 비용·사업/부동산 운영비가 자동 반영됩니다.</div>`;modal('💎','내 자산 · 현실경제','많이 버는 것보다 얼마나 남기고 투자하느냐가 중요해졌습니다.',[['투자시장','주식·ETF·채권·코인',()=>openMarket()]],body)};

const baseUpdateAllV4=updateAll;updateAll=function(){ensureV4();baseUpdateAllV4();const mini=$('#v3GovMini');if(mini)mini.insertAdjacentHTML('beforeend',`<div class="systemRow"><span>투자자산</span><b>${KRW(marketValue())}</b></div><div class="systemRow"><span>경제 난이도</span><b>REALISTIC</b></div>`);};

// Re-bind buttons that may still reference earlier functions.
$('#assetsBtn')&&($('#assetsBtn').onclick=showAssets);$('#governBtn')&&($('#governBtn').onclick=openGovernment);
ensureV4();updateAll();
