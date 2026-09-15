/* LIFE : RISE V0.5 — Business Empire, Capital Markets & Power Transition */
const V5={version:'0.5', impeachmentProposal:151, impeachmentPass:200};

Object.assign(MARKET,{
 hanbit:{name:'HANBIT Semiconductor',icon:'🧠',risk:'높음',vol:.105,bias:.010,link:'economy',kind:'stock',sector:'반도체'},
 cloudmind:{name:'CLOUDMIND AI',icon:'☁️',risk:'매우 높음',vol:.135,bias:.012,link:'sentiment',kind:'stock',sector:'AI'},
 orbit:{name:'ORBIT Mobility',icon:'🚙',risk:'중상',vol:.085,bias:.006,link:'economy',kind:'stock',sector:'모빌리티'},
 miraebio:{name:'MIRAE Bio',icon:'🧪',risk:'매우 높음',vol:.145,bias:.007,link:'sentiment',kind:'stock',sector:'바이오'}
});

function ensureV5(){
 ensureV4();S.version=5;S.v5=S.v5||{};
 S.v5.company=S.v5.company||{
  exists:false,name:'',cash:0,employees:0,avgSalary:2200000,product:32,quality:42,brand:4,morale:62,
  marketing:0,revenue:0,expenses:0,profit:0,valuation:0,debt:0,founderOwnership:100,investors:0,
  listed:false,sharePrice:0,sharesOutstanding:1000000,marketKey:null,governance:35,months:0,lossMonths:0,
  acquired:[],lastGrowth:0,stage:'아이디어',dividendPolicy:0
 };
 S.v5.shorts=S.v5.shorts||{};
 S.v5.fundamentals=S.v5.fundamentals||{};
 const fundamentals={
  hanbit:{rev:980000000000,profit:92000000000,debt:260000000000,cash:180000000000,growth:16,eps:5400,pe:17.2,dividend:.012,quality:74,news:'차세대 공정 수율 개선 기대가 커지고 있습니다.'},
  cloudmind:{rev:410000000000,profit:18000000000,debt:120000000000,cash:240000000000,growth:34,eps:980,pe:48.0,dividend:0,quality:68,news:'AI 인프라 수요가 빠르게 늘고 있습니다.'},
  orbit:{rev:1520000000000,profit:76000000000,debt:590000000000,cash:150000000000,growth:8,eps:3100,pe:21.0,dividend:.018,quality:66,news:'신차 판매와 배터리 원가가 실적 변수입니다.'},
  miraebio:{rev:125000000000,profit:-18000000000,debt:72000000000,cash:95000000000,growth:22,eps:-620,pe:0,dividend:0,quality:51,news:'핵심 임상 결과를 앞두고 변동성이 커졌습니다.'}
 };
 Object.entries(fundamentals).forEach(([k,f])=>{
   if(!S.v5.fundamentals[k])S.v5.fundamentals[k]={...f,quarter:0,shock:0,lastEarnings:'-',earningsHistory:[]};
   if(!S.v4.market.assets[k])S.v4.market.assets[k]={price:{hanbit:87000,cloudmind:132000,orbit:68000,miraebio:54000}[k],last:{hanbit:87000,cloudmind:132000,orbit:68000,miraebio:54000}[k],chg:0};
   if(!S.v4.holdings[k])S.v4.holdings[k]={qty:0,avg:0};
   if(!S.v5.shorts[k])S.v5.shorts[k]={qty:0,entry:0,margin:0,fees:0};
 });
 S.v5.ipo=S.v5.ipo||{active:false,key:null,name:'',sector:'',price:0,months:0,allocatedQty:0,quality:0};
 S.v5.power=S.v5.power||{
   presidentStatus:'재임',actingPresident:null,impeachment:null,earlyElectionDays:null,playerCandidate:false,
   courtTrust:65,evidence:20,coalitionSeats:0,coupSupport:0,coupStatus:'없음',regime:'민주공화정',legitimacy:100,
   transitionLog:[]
 };
 if(S.v5.power.presidentStatus==='탄핵심판'&&!S.v5.power.actingPresident)S.v5.power.actingPresident='국무총리 권한대행(가상)';
}
ensureV5();

function injectV5UI(){
 const top=$('.top-actions');
 if(top&&!$('#businessBtn'))top.insertAdjacentHTML('afterbegin','<button id="businessBtn" class="v5-btn">🏢 사업</button><button id="powerBtn" class="v5-btn dangerPower">⚖ 권력</button>');
 $('#businessBtn')&&($('#businessBtn').onclick=openBusinessHQ);
 $('#powerBtn')&&($('#powerBtn').onclick=openPowerTransition);
 const badge=$('#v04Badge');if(badge){badge.id='v05Badge';badge.innerHTML='<b>V0.5 · EMPIRE & POWER</b><span>회사 경영 · IPO/M&A · 재무제표/실적/배당/공매도 · 탄핵 · 군사 권력변동</span>'}
 const brand=document.querySelector('.brand span');if(brand)brand.textContent='Visual Life & Power Sandbox · V0.5';
}
injectV5UI();

/* ---------- BUSINESS EMPIRE ---------- */
function companyValuation(){
 const c=S.v5.company;if(!c.exists)return 0;
 const annualRev=Math.max(0,c.revenue*12),annualProfit=c.profit*12;
 const multiple=Math.max(0,annualProfit)*5+annualRev*(.8+c.brand/100*1.8);
 const intangible=c.product*500000+c.quality*350000+c.brand*1000000+c.governance*250000;
 return Math.max(10000000,Math.round(multiple+intangible-c.debt));
}
function founderEquityValue(){const c=S.v5.company;return c.exists?companyValuation()*(c.founderOwnership/100):0}
const baseNetworthV5=networth;networth=function(){ensureV5();return baseNetworthV5()+founderEquityValue()-shortLiabilityEstimate()};

function createCompany(){
 ensureV5();const c=S.v5.company;if(c.exists)return toast('이미 운영 중인 회사가 있습니다.');
 if(S.cash<20000000)return toast('창업자금 최소 2천만원이 필요합니다.');
 const name=(prompt('회사 이름을 입력하세요.','LOGAN Ventures')||'').trim();if(!name)return;
 S.cash-=20000000;Object.assign(c,{exists:true,name:name.slice(0,24),cash:20000000,employees:2,avgSalary:2200000,product:34,quality:44,brand:4,morale:65,marketing:500000,revenue:2500000,expenses:0,profit:0,valuation:45000000,debt:0,founderOwnership:100,investors:0,listed:false,sharePrice:0,marketKey:null,governance:38,months:0,lossMonths:0,acquired:[],lastGrowth:0,stage:'초기 스타트업',dividendPolicy:0});
 if(S.career!=='entrepreneur'&&!S.career){S.career='entrepreneur';S.level=1;S.xp=0}
 S.inf.business=clamp(S.inf.business+4);log(`${c.name}을 창업하고 개인자금 2천만원을 출자했습니다.`);save();updateAll();openBusinessHQ();
}
function businessMonth(){
 ensureV5();const c=S.v5.company;if(!c.exists)return;
 c.months++;
 const prev=c.revenue||1;
 const macro=.72+S.nation.economy/180;
 const efficiency=.55+c.product/180+c.quality/240+c.morale/500;
 const brand=.55+c.brand/115;
 const randomness=.72+Math.random()*.62;
 const scale=Math.pow(Math.max(1,c.employees),.88);
 const revenue=Math.round(scale*3100000*efficiency*brand*macro*randomness + c.marketing*(1.1+c.brand/140));
 const payroll=c.employees*c.avgSalary;
 const rent=1200000+Math.max(0,c.employees-5)*130000;
 const admin=850000+c.employees*95000;
 const interest=c.debt*.008;
 const expenses=Math.round(payroll+rent+admin+c.marketing+interest);
 c.revenue=revenue;c.expenses=expenses;c.profit=revenue-expenses;c.cash+=c.profit;c.lastGrowth=(revenue/prev-1)*100;
 c.morale=clamp(c.morale+rnd(-3,3)+(c.profit>0?1:-2));
 c.brand=clamp(c.brand+(c.marketing>0?rnd(0,2):0)+(c.profit>0&&Math.random()<.35?1:0));
 if(c.profit<0)c.lossMonths++;else c.lossMonths=0;
 c.stage=c.employees>=100?'대형 성장기업':c.employees>=35?'스케일업':c.employees>=12?'성장 스타트업':c.employees>=5?'초기 기업':'초기 스타트업';
 c.valuation=companyValuation();
 if(c.listed&&c.marketKey&&S.v4.market.assets[c.marketKey]){
   const st=S.v4.market.assets[c.marketKey];const fundamentalMove=clamp(c.lastGrowth/180 + (c.profit>0?.025:-.04),-.18,.18);st.last=st.price;st.price=Math.max(1000,Math.round(st.price*(1+fundamentalMove+(Math.random()*2-1)*.07)));st.chg=(st.price/st.last-1)*100;
 }
 if(c.dividendPolicy>0&&c.profit>0&&c.months%3===0){
   const pool=Math.min(c.cash*.12,c.profit*c.dividendPolicy);if(pool>0){c.cash-=pool;const founder=pool*c.founderOwnership/100*.85;S.cash+=founder;log(`${c.name} 분기 배당으로 세후 ${KRW(founder)}을 받았습니다.`)}
 }
 if(c.cash<0){c.cash=0;c.debt+=Math.max(5000000,Math.abs(c.profit));log(`${c.name}이 운영자금 부족으로 긴급 차입을 했습니다.`)}
 if(c.lossMonths>=5&&c.cash<10000000){c.morale=clamp(c.morale-8);log(`${c.name}의 자금난이 심각합니다. 투자유치·감원·매출 개선이 필요합니다.`)}
}
function openBusinessHQ(){
 ensureV5();const c=S.v5.company;if(!c.exists)return modal('🏢','사업 본부','회사를 직접 창업해 직원·급여·제품·마케팅·투자유치·M&A·IPO를 관리할 수 있습니다.',[['회사 창업','개인자금 ₩20,000,000 필요',createCompany]],'<div class="empireIntro">사업은 월급처럼 확정 수익이 아닙니다. 초반에는 직원 급여와 고정비 때문에 적자가 정상이며, 살아남아 규모를 키워야 합니다.</div>');
 c.valuation=companyValuation();
 const body=`<div class="companyHero"><div><span>${c.stage}</span><b>${c.name}</b><small>창업자 지분 ${c.founderOwnership.toFixed(1)}% · ${c.listed?'상장기업':'비상장'}</small></div><strong>${KRW(c.valuation)}</strong></div>
 <div class="companyGrid">
  <div><span>회사 현금</span><b>${KRW(c.cash)}</b></div><div><span>직원</span><b>${c.employees}명</b></div>
  <div><span>월 매출</span><b>${KRW(c.revenue)}</b></div><div><span>월 영업손익</span><b class="${c.profit>=0?'up':'down'}">${KRW(c.profit)}</b></div>
  <div><span>평균연봉(월급)</span><b>${KRW(c.avgSalary)}</b></div><div><span>마케팅/월</span><b>${KRW(c.marketing)}</b></div>
  <div><span>제품력</span><b>${Math.round(c.product)}</b></div><div><span>브랜드</span><b>${Math.round(c.brand)}</b></div>
  <div><span>조직사기</span><b>${Math.round(c.morale)}</b></div><div><span>기업부채</span><b>${KRW(c.debt)}</b></div>
 </div><div class="runway">지난달 성장률 <b class="${c.lastGrowth>=0?'up':'down'}">${c.lastGrowth>=0?'+':''}${c.lastGrowth.toFixed(1)}%</b> · 창업자 지분가치 ${KRW(founderEquityValue())}</div>`;
 const acts=[
  ['인사·급여','채용·감원·연봉 정책',openHR],['제품 개발','현금 ₩5,000,000 · 제품/품질 상승',productDevelopment],
  ['영업·마케팅','월 마케팅비와 브랜드 관리',openMarketing],['투자 유치','지분을 팔아 회사 현금을 확보',openFunding],
  ['기업대출','은행 차입 · 이자 부담',companyLoan],['M&A','경쟁사를 인수해 규모 확대',openMA],
  ['IPO 준비',c.listed?'이미 상장됨':'조건 충족 시 증시 상장',openIPOCompany],['대표 급여','회사에서 개인에게 급여 지급',founderPay],
  ['배당 정책',`현재 순이익의 ${Math.round(c.dividendPolicy*100)}%`,setDividendPolicy]
 ];modal('🏢','사업 본부 V0.5','회사의 돈과 내 개인 돈은 분리됩니다. 무리한 확장은 기업을 파산시킬 수 있습니다.',acts,body)
}
function openHR(){const c=S.v5.company;modal('👥','인사·급여',`직원 ${c.employees}명 · 평균 월급 ${KRW(c.avgSalary)} · 조직사기 ${Math.round(c.morale)}`,[['직원 1명 채용','채용비 100만원 + 월 급여 증가',()=>hireEmployees(1)],['직원 5명 채용','채용비 500만원 + 고정비 급증',()=>hireEmployees(5)],['직원 1명 감원',`퇴직비용 ${KRW(c.avgSalary)}`,()=>fireEmployees(1)],['연봉 10% 인상','조직사기 상승 / 고정비 상승',()=>salaryChange(1.1)],['연봉 10% 삭감','현금 보존 / 조직사기 하락',()=>salaryChange(.9)],['사업 본부','돌아가기',openBusinessHQ]])}
function hireEmployees(n){const c=S.v5.company,cost=n*1000000;if(c.cash<cost)return toast('회사 현금이 부족합니다.');c.cash-=cost;c.employees+=n;c.morale=clamp(c.morale+Math.min(4,n));c.governance=clamp(c.governance+1);log(`${c.name}이 ${n}명을 채용했습니다.`);save();openBusinessHQ()}
function fireEmployees(n){const c=S.v5.company;if(c.employees<=1)return toast('최소 1명은 필요합니다.');n=Math.min(n,c.employees-1);const cost=c.avgSalary*n;if(c.cash<cost)return toast('퇴직 비용을 낼 회사 현금이 부족합니다.');c.cash-=cost;c.employees-=n;c.morale=clamp(c.morale-8*n);S.stats.reputation=clamp(S.stats.reputation-1);log(`${c.name}이 ${n}명을 감원했습니다.`);save();openBusinessHQ()}
function salaryChange(mult){const c=S.v5.company;c.avgSalary=Math.round(c.avgSalary*mult);c.morale=clamp(c.morale+(mult>1?7:-10));save();openHR()}
function productDevelopment(){const c=S.v5.company;if(c.cash<5000000)return toast('회사 현금 500만원이 필요합니다.');c.cash-=5000000;const gain=rnd(3,7)+Math.round(S.stats.int/30);c.product=clamp(c.product+gain);c.quality=clamp(c.quality+rnd(1,4));c.morale=clamp(c.morale+2);advance(14,`${c.name}이 신제품 개발에 투자했습니다.`);openBusinessHQ()}
function openMarketing(){const c=S.v5.company;modal('📣','영업·마케팅',`현재 월 마케팅비 ${KRW(c.marketing)} · 브랜드 ${Math.round(c.brand)}`,[['월 50만원','보수적 성장',()=>setMarketing(500000)],['월 300만원','성장 투자',()=>setMarketing(3000000)],['월 1,000만원','공격적 확장',()=>setMarketing(10000000)],['영업 캠페인','회사 현금 300만원 · 즉시 브랜드/매출 기회',salesCampaign],['마케팅 중단','월 고정비 절감',()=>setMarketing(0)]])}
function setMarketing(v){S.v5.company.marketing=v;save();openBusinessHQ()}
function salesCampaign(){const c=S.v5.company;if(c.cash<3000000)return toast('회사 현금이 부족합니다.');c.cash-=3000000;const ok=Math.random()*100<clamp(35+S.stats.cha*.45+S.stats.net*.2,25,88);if(ok){c.brand=clamp(c.brand+rnd(3,7));c.cash+=rnd(2000000,8000000);log('대형 고객 영업에 성공해 선급금을 확보했습니다.')}else{c.brand=clamp(c.brand-1);log('영업 캠페인이 기대만큼 성과를 내지 못했습니다.')}advance(7);openBusinessHQ()}
function openFunding(){const c=S.v5.company;const offer=Math.max(10000000,Math.round(companyValuation()*.10*(.75+Math.random()*.35)));modal('💸','투자 유치',`예상 기업가치 ${KRW(companyValuation())}. 외부자본을 받으면 회사 현금은 늘지만 창업자 지분은 희석됩니다.`,[['10% 지분 투자유치',`약 ${KRW(offer)} 회사 유입`,()=>raiseFunding(10,offer)],['20% 전략투자',`약 ${KRW(offer*1.85)} 회사 유입`,()=>raiseFunding(20,offer*1.85)],['투자자 미팅','개인 인맥 + 회사 거버넌스 개선',investorMeeting]])}
function raiseFunding(pct,amount){const c=S.v5.company;if(c.founderOwnership<=pct+20)return toast('창업자 지분이 너무 낮아 추가 희석이 어렵습니다.');const chance=clamp(35+S.stats.net*.45+c.brand*.35+c.product*.15-(c.lossMonths*7),15,92);if(Math.random()*100>chance){c.cash=Math.max(0,c.cash-1000000);S.stats.stress=clamp(S.stats.stress+5);log('투자 유치가 결렬되었습니다.');return openBusinessHQ()}c.cash+=amount;c.founderOwnership=Math.max(1,c.founderOwnership-pct);c.investors+=pct;c.governance=clamp(c.governance+5);S.inf.business=clamp(S.inf.business+3);log(`${c.name}이 ${pct}% 지분 투자로 ${KRW(amount)}을 유치했습니다.`);save();openBusinessHQ()}
function investorMeeting(){const c=S.v5.company;if(c.cash<1000000)return toast('회사 현금 100만원이 필요합니다.');c.cash-=1000000;S.stats.net=clamp(S.stats.net+2);c.governance=clamp(c.governance+3);advance(3,'투자자 미팅을 진행했습니다.');openBusinessHQ()}
function companyLoan(){const c=S.v5.company;const cap=Math.max(20000000,Math.min(500000000,companyValuation()*.2));const amount=Math.round(cap);c.cash+=amount;c.debt+=amount;c.governance=clamp(c.governance-1);log(`${c.name}이 ${KRW(amount)} 기업대출을 실행했습니다.`);save();openBusinessHQ()}
function openMA(){const c=S.v5.company;const targets=[{n:'마이크로 SaaS',p:80000000,e:5,prod:5,brand:2},{n:'성장 경쟁사',p:450000000,e:18,prod:9,brand:7},{n:'업계 중견사',p:1800000000,e:60,prod:14,brand:13}];const body=`<div class="maList">${targets.map(t=>`<div><span>${t.n}</span><b>${KRW(t.p)}</b><small>직원 +${t.e} · 제품 +${t.prod} · 브랜드 +${t.brand}</small></div>`).join('')}</div>`;modal('🤝','M&A 시장','인수는 빠른 성장 수단이지만 회사 현금을 크게 소모합니다.',targets.map(t=>[t.n,KRW(t.p),()=>acquireCompany(t)]),body)}
function acquireCompany(t){const c=S.v5.company;if(c.cash<t.p)return toast('개인 현금이 아니라 회사 현금이 필요합니다.');c.cash-=t.p;c.employees+=t.e;c.product=clamp(c.product+t.prod);c.brand=clamp(c.brand+t.brand);c.quality=clamp(c.quality+Math.round(t.prod/2));c.acquired.push(t.n);c.governance=clamp(c.governance+2);S.inf.business=clamp(S.inf.business+5);advance(30,`${c.name}이 ${t.n}을 인수했습니다.`);openBusinessHQ()}
function openIPOCompany(){const c=S.v5.company;if(c.listed)return toast('이미 상장기업입니다.');const ok=c.employees>=20&&c.revenue>=50000000&&c.brand>=30&&c.governance>=55&&c.profit>0;const body=`<div class="ipoReq"><div><span>직원 20명</span><b>${c.employees>=20?'충족':'미달'} (${c.employees})</b></div><div><span>월 매출 5천만원</span><b>${c.revenue>=50000000?'충족':'미달'} ${KRW(c.revenue)}</b></div><div><span>브랜드 30</span><b>${c.brand>=30?'충족':'미달'} (${Math.round(c.brand)})</b></div><div><span>거버넌스 55</span><b>${c.governance>=55?'충족':'미달'} (${Math.round(c.governance)})</b></div><div><span>영업흑자</span><b>${c.profit>0?'충족':'미달'} ${KRW(c.profit)}</b></div></div>`;modal('🔔','IPO 준비',ok?'상장 요건을 충족했습니다. 창업자 지분 일부를 시장에 팔아 회사 자본을 확충할 수 있습니다.':'아직 상장 요건을 충족하지 못했습니다.',ok?[['상장 추진','창업자 지분 20% 공개 · 회사 자본 확충',listCompany],['거버넌스 강화','회사 현금 1천만원 · 거버넌스 +8',improveGovernance]]:[['거버넌스 강화','회사 현금 1천만원 · 거버넌스 +8',improveGovernance]],body)}
function improveGovernance(){const c=S.v5.company;if(c.cash<10000000)return toast('회사 현금이 부족합니다.');c.cash-=10000000;c.governance=clamp(c.governance+8);advance(14,'외부감사와 내부통제를 강화했습니다.');openBusinessHQ()}
function listCompany(){const c=S.v5.company;const key='founderco';const valuation=companyValuation();const proceeds=Math.round(valuation*.20);c.cash+=proceeds;c.founderOwnership=Math.max(1,c.founderOwnership-20);c.investors+=20;c.listed=true;c.marketKey=key;c.sharePrice=Math.max(5000,Math.round(valuation/c.sharesOutstanding));MARKET[key]={name:c.name,icon:'🏢',risk:'창업기업',vol:.14,bias:.006,link:'economy',kind:'stock',sector:'창업자 회사'};S.v4.market.assets[key]={price:c.sharePrice,last:c.sharePrice,chg:0};S.v4.holdings[key]={qty:0,avg:0};S.v5.shorts[key]={qty:0,entry:0,margin:0,fees:0};S.v5.fundamentals[key]={rev:c.revenue*12,profit:c.profit*12,debt:c.debt,cash:c.cash,growth:c.lastGrowth,eps:Math.max(-1000,c.profit*12/c.sharesOutstanding),pe:c.profit>0?Math.min(80,valuation/(c.profit*12)):0,dividend:c.dividendPolicy*.02,quality:c.quality,news:'창업자 기업이 신규 상장했습니다.',quarter:0,shock:.08,lastEarnings:'IPO',earningsHistory:[]};S.inf.business=clamp(S.inf.business+15);S.stats.reputation=clamp(S.stats.reputation+10);log(`${c.name}이 증시에 상장했습니다. 회사에 ${KRW(proceeds)} 신규자금이 유입됐습니다.`);save();updateAll();openBusinessHQ()}
function founderPay(){const c=S.v5.company;const amount=Math.min(5000000,Math.max(0,c.cash-10000000));if(amount<1000000)return toast('회사가 아직 대표 급여를 지급할 여력이 부족합니다.');c.cash-=amount;const tax=amount*.18;S.cash+=amount-tax;S.v4.taxPaid+=tax;log(`${c.name}에서 대표 급여 세후 ${KRW(amount-tax)}을 받았습니다.`);save();openBusinessHQ()}
function setDividendPolicy(){const c=S.v5.company;const p=c.dividendPolicy===0?.15:c.dividendPolicy===.15?.30:0;c.dividendPolicy=p;save();toast(`분기 배당정책: 순이익의 ${Math.round(p*100)}%`);openBusinessHQ()}

/* ---------- CAPITAL MARKETS ---------- */
function shortLiabilityEstimate(){let x=0;Object.entries(S.v5?.shorts||{}).forEach(([k,s])=>{if(s.qty>0){const p=S.v4.market.assets[k]?.price||s.entry;x+=Math.max(0,(p-s.entry)*s.qty)}});return x}
function stockFundamentalMonth(){
 ensureV5();
 Object.entries(S.v5.fundamentals).forEach(([k,f])=>{
   if(!S.v4.market.assets[k])return;
   f.quarter=(f.quarter||0)+1;
   if(f.quarter%3===0){
     const econ=(S.nation.economy-50)/1200;const surprise=(Math.random()*2-1)*.16;const baseGrowth=(f.growth||5)/100/4;
     const revMove=baseGrowth+econ+surprise;f.rev=Math.max(10000000,Math.round(f.rev*(1+revMove)));
     const margin=f.profit/Math.max(1,f.rev);const marginShock=(Math.random()*2-1)*.045;f.profit=Math.round(f.rev*(margin+marginShock));
     f.debt=Math.max(0,Math.round(f.debt*(1+(Math.random()*2-1)*.035)));f.cash=Math.max(0,Math.round(f.cash+f.profit*.35));f.growth=revMove*400;
     f.eps=Math.round(f.profit/Math.max(10000000,(S.v5.company.marketKey===k?S.v5.company.sharesOutstanding:40000000)));
     f.pe=f.profit>0?Math.max(4,Math.min(90,(S.v4.market.assets[k].price/Math.max(1,f.eps)))):0;
     const expectation=(f.quality-50)/180 + (f.growth/100)*.4;f.shock=clamp(expectation+surprise,-.22,.25);
     f.lastEarnings=`매출 ${KRW(f.rev)} · 영업이익 ${KRW(f.profit)} · 성장률 ${f.growth.toFixed(1)}%`;
     f.earningsHistory.unshift(f.lastEarnings);f.earningsHistory=f.earningsHistory.slice(0,6);
     f.news=f.shock>.08?'실적이 시장 기대를 크게 웃돌았습니다.':f.shock<-.08?'실적이 기대에 못 미치며 전망이 낮아졌습니다.':'실적이 시장 예상 범위에 들어왔습니다.';
     const st=S.v4.market.assets[k];st.price=Math.max(1000,Math.round(st.price*(1+f.shock)));st.chg=(st.price/st.last-1)*100;
     if(f.dividend>0&&S.v4.holdings[k]?.qty>0){const gross=S.v4.holdings[k].qty*st.price*f.dividend/4;const net=gross*.85;S.cash+=net;S.v4.taxPaid+=gross-net;log(`${MARKET[k].name} 분기 배당 ${KRW(net)}을 받았습니다.`)}
   }
 });
 processShortsMonthly();processIPO();
}
const baseMarketMonthV5=marketMonth;marketMonth=function(){baseMarketMonthV5();stockFundamentalMonth()};

function processShortsMonthly(){Object.entries(S.v5.shorts).forEach(([k,s])=>{if(!s.qty)return;const price=S.v4.market.assets[k]?.price||s.entry;const notional=s.qty*price;const fee=notional*.003;s.fees+=fee;S.cash=Math.max(0,S.cash-fee);const loss=(price-s.entry)*s.qty;if(loss>s.margin*.72){const settlement=s.margin-loss-fee;S.cash+=Math.max(0,settlement);log(`${MARKET[k]?.name||k} 공매도 포지션이 증거금 부족으로 강제 청산되었습니다.`);S.v5.shorts[k]={qty:0,entry:0,margin:0,fees:0}}})}
function generateIPO(){const names=['NEON Robotics','BLUEWAVE Energy','ATOM Space','LUMEN Games','GENESIS Materials','NOVA Health'];const sectors=['로봇','에너지','우주','게임','소재','헬스케어'];const i=rnd(0,names.length-1);const key='ipo'+Date.now().toString().slice(-6);S.v5.ipo={active:true,key,name:names[i],sector:sectors[i],price:rnd(18000,78000),months:2,allocatedQty:0,quality:rnd(35,85)};log(`${names[i]}가 신규 상장을 준비합니다. 투자 메뉴에서 공모주 청약이 가능합니다.`)}
function processIPO(){const ipo=S.v5.ipo;if(!ipo.active){if(S.v4.monthsPlayed>2&&Math.random()<.08)generateIPO();return}ipo.months--;if(ipo.months>0)return;const firstMove=(ipo.quality-55)/160+(Math.random()*2-1)*.22;MARKET[ipo.key]={name:ipo.name,icon:'🆕',risk:'신규상장',vol:.16,bias:.005,link:'sentiment',kind:'stock',sector:ipo.sector};S.v4.market.assets[ipo.key]={price:Math.max(1000,Math.round(ipo.price*(1+firstMove))),last:ipo.price,chg:firstMove*100};S.v4.holdings[ipo.key]={qty:ipo.allocatedQty,avg:ipo.allocatedQty?ipo.price:0};S.v5.shorts[ipo.key]={qty:0,entry:0,margin:0,fees:0};S.v5.fundamentals[ipo.key]={rev:rnd(80000000000,450000000000),profit:rnd(-15000000000,50000000000),debt:rnd(10000000000,150000000000),cash:rnd(30000000000,180000000000),growth:rnd(8,45),eps:rnd(-400,2400),pe:rnd(15,60),dividend:0,quality:ipo.quality,news:'신규 상장 후 시장의 가격 발견 과정이 진행 중입니다.',quarter:0,shock:0,lastEarnings:'신규 상장',earningsHistory:[]};log(`${ipo.name}가 상장했습니다. 첫 거래 변동률 ${firstMove>=0?'+':''}${(firstMove*100).toFixed(1)}%.`);ipo.active=false;ipo.allocatedQty=0}
function openIPODesk(){const ipo=S.v5.ipo;if(!ipo.active)return modal('🆕','IPO 센터','현재 청약 가능한 신규 상장이 없습니다. 시장 상황에 따라 새로운 기업이 등장합니다.',[['투자시장','돌아가기',openMarket]]);const body=`<div class="ipoCard"><span>${ipo.sector}</span><b>${ipo.name}</b><strong>공모가 ${KRW(ipo.price)}</strong><small>예상 상장까지 ${ipo.months}개월 · 기업품질 ${ipo.quality}/100 · 배정주식 ${ipo.allocatedQty.toFixed(2)}주</small></div><div class="tradeBox"><b>청약 금액</b><input id="ipoAmount" type="number" min="10000" step="10000" value="1000000"></div>`;modal('🆕','IPO 공모주',`공모주는 상장 직후 크게 오르거나 떨어질 수 있습니다.`,[['공모주 청약','청약금 즉시 출금 · 전량 배정 게임 규칙',subscribeIPO],['투자시장','돌아가기',openMarket]],body)}
function subscribeIPO(){const ipo=S.v5.ipo,amt=Math.max(0,Number($('#ipoAmount')?.value||0));if(!ipo.active||amt<10000)return toast('유효한 청약 금액을 입력하세요.');if(S.cash<amt)return toast('현금이 부족합니다.');S.cash-=amt;ipo.allocatedQty+=amt/ipo.price;S.v4.tradeCount++;log(`${ipo.name} 공모주 ${KRW(amt)} 청약.`);save();openIPODesk()}

const baseOpenMarketV5=openMarket;openMarket=function(){
 ensureV5();const m=S.v4.market;const rows=Object.entries(MARKET).map(([k,a])=>{const st=m.assets[k];if(!st)return'';const h=S.v4.holdings[k]||{qty:0,avg:0};const v=h.qty*st.price,pl=h.qty&&h.avg?((st.price-h.avg)/h.avg*100):0;const f=S.v5.fundamentals[k];return `<div class="ticker v5ticker"><div><b>${a.icon} ${a.name}<span class="riskChip">${a.risk}</span></b><small>${a.kind==='stock'&&f?`${a.sector} · 매출 ${KRW(f.rev)} · 이익 ${KRW(f.profit)}`:`보유 ${h.qty.toFixed(k==='bitcoin'?4:2)} · 평단 ${h.avg?KRW(h.avg):'-'}`}</small></div><div class="price">${KRW(st.price)}</div><div class="chg ${st.chg>=0?'up':'down'}">${st.chg>=0?'+':''}${st.chg.toFixed(1)}%</div><div class="holding">${KRW(v)}<br>${h.qty?`${pl>=0?'+':''}${pl.toFixed(1)}%`:'미보유'}</div></div>`}).join('');
 const shortValue=Object.entries(S.v5.shorts).reduce((s,[k,x])=>s+(x.qty?x.qty*(S.v4.market.assets[k]?.price||0):0),0);
 const body=`<div class="marketHeader"><div class="marketKpi"><span>시장 국면</span><b>${m.regime}</b></div><div class="marketKpi"><span>롱 투자자산</span><b>${KRW(marketValue())}</b></div><div class="marketKpi"><span>공매도 규모</span><b>${KRW(shortValue)}</b></div></div><div class="marketNews">📰 ${m.news}<br>기업주는 분기실적·재무구조·뉴스·배당이 가격에 추가 반영됩니다.</div><div class="marketList">${rows}</div>`;
 const acts=Object.entries(MARKET).map(([k,a])=>[`${a.icon} ${a.name}`,a.kind==='stock'?'재무제표 · 실적 · 매매 · 공매도':`매수/매도 · ${KRW(m.assets[k]?.price||0)}`,()=>a.kind==='stock'?openStockDetail(k):openTrade(k)]);
 acts.unshift(['🆕 IPO 센터',S.v5.ipo.active?`${S.v5.ipo.name} 청약 진행중`:'신규 상장 대기',openIPODesk]);modal('📈','자본시장 V0.5','ETF와 자산군 투자에 더해 개별기업 분석·실적발표·배당·IPO·공매도가 추가되었습니다.',acts,body)
};
function openStockDetail(k){const a=MARKET[k],st=S.v4.market.assets[k],f=S.v5.fundamentals[k],h=S.v4.holdings[k]||{qty:0,avg:0},sh=S.v5.shorts[k]||{qty:0,entry:0,margin:0};if(!f)return openTrade(k);const margin=f.rev?f.profit/f.rev*100:0;const body=`<div class="stockHero"><div><span>${a.sector}</span><b>${a.name}</b><small>${f.news}</small></div><strong>${KRW(st.price)} <em class="${st.chg>=0?'up':'down'}">${st.chg>=0?'+':''}${st.chg.toFixed(1)}%</em></strong></div><div class="financialGrid"><div><span>연환산 매출</span><b>${KRW(f.rev)}</b></div><div><span>영업이익</span><b class="${f.profit>=0?'up':'down'}">${KRW(f.profit)}</b></div><div><span>이익률</span><b>${margin.toFixed(1)}%</b></div><div><span>부채</span><b>${KRW(f.debt)}</b></div><div><span>현금</span><b>${KRW(f.cash)}</b></div><div><span>성장률</span><b>${f.growth.toFixed(1)}%</b></div><div><span>EPS</span><b>${KRW(f.eps)}</b></div><div><span>PER</span><b>${f.pe?f.pe.toFixed(1)+'배':'적자'}</b></div><div><span>배당수익률</span><b>${(f.dividend*100).toFixed(1)}%</b></div><div><span>기업품질</span><b>${Math.round(f.quality)}/100</b></div></div><div class="earningsBox"><b>최근 실적</b><span>${f.lastEarnings}</span></div><div class="positionBox">롱 ${h.qty.toFixed(2)}주 · ${KRW(h.qty*st.price)} / 공매도 ${sh.qty.toFixed(2)}주 · 진입가 ${sh.entry?KRW(sh.entry):'-'}</div>`;modal(a.icon,a.name,'재무제표가 좋아도 비싼 주가는 하락할 수 있고, 적자기업도 성장 기대가 높으면 오를 수 있습니다.',[['현물 매수/매도','기존 거래창',()=>openTrade(k)],['공매도','증거금 50% · 월 대차비용 0.3%',()=>openShort(k)],['실적 기록','최근 분기 실적 이력',()=>showEarnings(k)],['투자시장','전체 시장',openMarket]],body)}
function showEarnings(k){const f=S.v5.fundamentals[k],hist=f.earningsHistory.length?f.earningsHistory.map((x,i)=>`<div class="earnRow"><span>${i===0?'최근':'과거 '+i}</span><b>${x}</b></div>`).join(''):'<div class="earnRow"><span>아직 실적발표 전입니다.</span></div>';modal('🧾',`${MARKET[k].name} 실적 기록`,'분기마다 매출·이익·성장률이 변하고 주가에 충격을 줍니다.',[['종목으로','돌아가기',()=>openStockDetail(k)]],`<div class="earnHistory">${hist}</div>`)}
function openShort(k){const a=MARKET[k],st=S.v4.market.assets[k],s=S.v5.shorts[k]||{qty:0,entry:0,margin:0};const body=`<div class="shortWarn">공매도는 주가 상승 시 손실이 커질 수 있습니다. 게임에서는 50% 증거금을 요구하며 손실이 증거금의 72%를 넘으면 강제청산됩니다.</div><div class="tradeGrid"><div class="tradeBox"><b>신규 공매도</b><span>현재가 ${KRW(st.price)}</span><input id="shortAmount" type="number" min="10000" step="10000" value="1000000"></div><div class="tradeBox"><b>현재 포지션</b><span>${s.qty.toFixed(2)}주 · 진입가 ${s.entry?KRW(s.entry):'-'} · 증거금 ${KRW(s.margin)}</span></div></div>`;modal('📉',`${a.name} 공매도`,'실제 전술이나 시장조작이 아니라 가격 방향을 맞히는 게임 투자 기능입니다.',[['공매도 진입','명목금액의 50% 증거금',()=>shortOpen(k)],['전량 상환','현재가로 포지션 종료',()=>shortCover(k)],['종목으로','돌아가기',()=>openStockDetail(k)]],body)}
function shortOpen(k){const amount=Math.max(0,Number($('#shortAmount')?.value||0));if(amount<10000)return toast('최소 1만원 이상 입력하세요.');const margin=amount*.5;if(S.cash<margin)return toast('증거금이 부족합니다.');const price=S.v4.market.assets[k].price,s=S.v5.shorts[k],qty=amount/price;S.cash-=margin;const totalQty=s.qty+qty;s.entry=totalQty?(s.entry*s.qty+price*qty)/totalQty:price;s.qty=totalQty;s.margin+=margin;S.v4.tradeCount++;log(`${MARKET[k].name} ${KRW(amount)} 규모 공매도 진입.`);save();openStockDetail(k)}
function shortCover(k){const s=S.v5.shorts[k];if(!s||!s.qty)return toast('공매도 포지션이 없습니다.');const price=S.v4.market.assets[k].price,pnl=(s.entry-price)*s.qty;const tax=Math.max(0,pnl)*.15;const settlement=s.margin+pnl-tax-s.fees;S.cash+=Math.max(0,settlement);if(settlement<0)S.debt+=Math.abs(settlement);log(`${MARKET[k].name} 공매도 상환 · 손익 ${KRW(pnl)}.`);S.v5.shorts[k]={qty:0,entry:0,margin:0,fees:0};save();openStockDetail(k)}


// V0.5 routes old one-click investment into the full capital market and keeps entrepreneur cash inside the company.
investAction=function(){openMarket()};
const baseQuickV5=quick;quick=function(q){
 ensureV5();
 if(q==='work'&&S.career==='entrepreneur'){
   const c=S.v5.company;
   if(c.exists){
     const contract=Math.max(0,rnd(300000,1800000)+Math.round(S.stats.cha*18000));
     c.cash+=contract;c.product=clamp(c.product+1);c.brand=clamp(c.brand+(Math.random()<.35?1:0));S.stats.stress=clamp(S.stats.stress+5);addXP(12);
     advance(5,`${c.name}의 대표 업무와 영업을 수행해 회사에 ${KRW(contract)} 계약대금이 들어왔습니다.`);return;
   }
   const freelance=rnd(100000,650000);S.cash+=freelance;S.stats.stress=clamp(S.stats.stress+4);addXP(8);advance(5,`창업 준비와 프리랜스 일로 ${KRW(freelance)}을 벌었습니다.`);return;
 }
 return baseQuickV5(q);
};
const baseEventPoolV5=eventPool;eventPool=function(){let pool=baseEventPoolV5();if(S.career==='entrepreneur'&&S.v5?.company?.exists)pool=pool.filter(e=>e.id!=='startup_runway');return pool};

/* ---------- IMPEACHMENT & POWER TRANSITION ---------- */
function effectiveCoalitionSeats(){const p=S.v5.power;const own=S.faction.partySeats||0;const influence=Math.round((S.inf.political+S.stats.pol+S.stats.net)/3*1.15);return clamp(own+p.coalitionSeats+influence,0,300)}
function impeachmentRisk(){if(S.nation.currentPresident!==S.name)return 0;const g=S.v3.gov,a=S.v4.gov,p=S.v5.power;return clamp((50-g.approval)*.9+(55-g.integrity)*.55+(50-a.coalition)*.4+(55-S.nation.mood)*.35-(S.faction.partySeats||0)*.05,0,100)}
function openPowerTransition(){
 ensureV5();const p=S.v5.power;const president=S.nation.currentPresident;const support=effectiveCoalitionSeats();const body=`<div class="powerState"><div><span>국가체제</span><b>${p.regime}</b></div><div><span>대통령</span><b>${president}</b></div><div><span>대통령 상태</span><b>${p.presidentStatus}</b></div><div><span>국회 확보 예상표</span><b>${support}/300</b></div><div><span>탄핵 증거지수</span><b>${Math.round(p.evidence)}/100</b></div><div><span>군 영향력</span><b>${Math.round(S.inf.military)}/100</b></div><div><span>군내 지지</span><b>${Math.round(p.coupSupport)}/100</b></div><div><span>체제 정당성</span><b>${Math.round(p.legitimacy)}/100</b></div></div><div class="powerDisclaimer">군사 권력변동은 실제 실행 방법을 묘사하지 않는 추상적 게임 판정입니다. 실패하면 장기 구금·경력 상실·자산 손실 같은 큰 대가가 생깁니다.</div>`;
 const acts=[['대통령 탄핵 시스템',president===S.name?`내 탄핵위험 ${Math.round(impeachmentRisk())}%`:'증거·국회표·헌재심판',openImpeachment],['군사 권력 시스템','장성 지지·국가불안·정당성 기반의 고위험 루트',openCoup],['정상적 권력교체','선거·정당·조기대선 상태 확인',openElectionTransition]];
 if(p.regime!=='민주공화정')acts.push(['민정 이양','군정/비상체제를 선거 체제로 되돌린다',civilianTransition]);
 modal('⚖','권력 교체 V0.5','선거뿐 아니라 탄핵과 극단적 국가위기에서의 군사 권력변동도 세계 상태를 바꿉니다.',acts,body)
}
function openImpeachment(){const p=S.v5.power,president=S.nation.currentPresident,support=effectiveCoalitionSeats();const body=`<div class="impeachFlow"><div class="${support>=151?'done':''}"><b>1. 발의</b><span>국회 재적 과반수(151/300) 수준의 지지 필요</span></div><div class="${support>=200?'done':''}"><b>2. 의결</b><span>대통령 탄핵소추는 3분의 2(200/300) 찬성 필요</span></div><div class="${p.presidentStatus==='탄핵심판'?'done':''}"><b>3. 탄핵심판</b><span>소추 의결 시 대통령 권한 정지, 게임 내 헌법재판 판단</span></div><div><b>4. 파면 또는 복귀</b><span>파면 시 조기 대선 시뮬레이션</span></div></div>`;const acts=[];
 if(president===S.name){acts.push(['법률·헌정 방어','정치력/법적 정당성으로 탄핵 위험을 낮춘다',defendImpeachment],['여야 협상','협치·국회지지 회복',()=>govAdvancedAction('coalition')]);}
 else if(p.presidentStatus==='재임'){acts.push(['위법 증거 조사','개인자금 1천만원 · 증거지수 상승 가능',investigatePresident],['국회 연대 확대','정치력/인맥 판정 · 확보표 상승',buildImpeachmentCoalition],['탄핵소추 발의',`예상 지지 ${support}석 · 최소 151`,fileImpeachment]);}
 else if(p.presidentStatus==='탄핵심판'){acts.push(['심판 진행 상황','결정까지 '+Math.max(0,p.impeachment?.days||0)+'일',()=>toast('시간을 진행하면 헌법재판 판단이 내려집니다.')]);}
 acts.push(['권력 메뉴','돌아가기',openPowerTransition]);modal('⚖','대통령 탄핵',`${president} 대통령의 현재 상태: ${p.presidentStatus}. 실제 헌법의 국회 정족수 구조를 게임 규칙에 반영했습니다.`,acts,body)}
function investigatePresident(){if(!spend(10000000))return;const p=S.v5.power;const success=Math.random()*100<clamp(30+S.stats.int*.35+S.stats.pol*.25+S.inf.media*.2,20,88);p.evidence=clamp(p.evidence+(success?rnd(10,22):rnd(1,5)));S.stats.stress=clamp(S.stats.stress+4);log(success?'대통령 관련 조사에서 탄핵심판에 영향을 줄 자료를 확보했습니다.':'조사했지만 결정적 자료를 확보하지 못했습니다.');advance(10);openImpeachment()}
function buildImpeachmentCoalition(){const p=S.v5.power;const ok=Math.random()*100<clamp(35+S.stats.pol*.45+S.stats.net*.35+S.inf.political*.15,15,93);p.coalitionSeats=clamp(p.coalitionSeats+(ok?rnd(15,42):rnd(-8,7)),0,220);S.stats.stress=clamp(S.stats.stress+4);log(ok?'탄핵소추를 위한 국회 연대가 확대됐습니다.':'국회 연대 협상이 난항을 겪었습니다.');advance(7);openImpeachment()}
function fileImpeachment(){const p=S.v5.power,support=effectiveCoalitionSeats();if(support<151)return toast('탄핵소추 발의에 필요한 국회 지지가 부족합니다.');if(p.evidence<35)return toast('탄핵 사유를 뒷받침할 증거지수가 너무 낮습니다.');const vote=Math.round(clamp(support+(S.nation.mood<45?12:0)+(p.evidence-50)*.25+rnd(-18,18),0,300));log(`대통령 탄핵소추 표결: ${vote}표 찬성.`);if(vote<200){p.coalitionSeats=clamp(p.coalitionSeats-12);S.stats.reputation=clamp(S.stats.reputation-3);advance(3,'탄핵소추안이 국회에서 부결되었습니다.');return openImpeachment()}p.presidentStatus='탄핵심판';p.actingPresident='국무총리 권한대행(가상)';p.impeachment={target:S.nation.currentPresident,days:rnd(45,105),evidence:p.evidence,vote};S.nation.stability=clamp(S.nation.stability-7);S.nation.mood=clamp(S.nation.mood-3);advance(1,'탄핵소추안이 가결되어 대통령 권한이 정지되었습니다.');openImpeachment()}
function defendImpeachment(){const p=S.v5.power,g=S.v3.gov;const ok=Math.random()*100<clamp(35+S.stats.pol*.4+S.stats.int*.3+g.integrity*.2,20,92);if(ok){p.evidence=clamp(p.evidence-10);S.v4.gov.coalition=clamp(S.v4.gov.coalition+6);g.approval=clamp(g.approval+2);log('법률·정치 대응으로 탄핵 동력을 일부 약화했습니다.')}else{p.evidence=clamp(p.evidence+5);g.approval=clamp(g.approval-3);log('해명이 설득력을 얻지 못해 탄핵 압력이 커졌습니다.')}advance(7);openImpeachment()}
function processPowerDays(days){const p=S.v5.power;if(p.presidentStatus==='탄핵심판'&&p.impeachment){p.impeachment.days-=days;if(p.impeachment.days<=0)resolveConstitutionalCourt()}if(p.earlyElectionDays!=null){p.earlyElectionDays-=days;if(p.earlyElectionDays<=0)runEarlyElection()}}
function resolveConstitutionalCourt(){const p=S.v5.power,imp=p.impeachment;if(!imp)return;const chance=clamp(22+imp.evidence*.62+(imp.vote-200)*.18+(50-S.nation.mood)*.08+(p.courtTrust-50)*.12,12,92);const upheld=Math.random()*100<chance;if(upheld){const removed=imp.target;p.presidentStatus='궐위';p.actingPresident='국무총리 권한대행(가상)';p.earlyElectionDays=60;p.impeachment=null;S.nation.currentPresident=p.actingPresident;S.nation.simulated=true;S.nation.stability=clamp(S.nation.stability-4);log(`${removed} 대통령에 대한 탄핵심판이 인용되어 파면되었습니다. 게임 내 60일 조기대선이 시작됩니다.`)}else{p.presidentStatus='재임';p.actingPresident=null;p.impeachment=null;p.evidence=clamp(p.evidence-20);log('탄핵심판이 기각되어 대통령이 직무에 복귀했습니다.')}save();updateAll()}
function openElectionTransition(){const p=S.v5.power;const text=p.earlyElectionDays!=null?`조기대선까지 ${Math.max(0,p.earlyElectionDays)}일`:`다음 정기 대선: ${S.nation.nextPresElection}년`;const acts=[];if(p.earlyElectionDays!=null&&S.career==='politics'&&S.level>=5)acts.push(['조기대선 출마 선언','평판/정치력으로 선거 승부',()=>{p.playerCandidate=true;S.stats.reputation=clamp(S.stats.reputation+2);log('조기 대통령선거 출마를 선언했습니다.');save();openElectionTransition()}]);acts.push(['정당 활동','정상적인 선거 권력 확대',partyOffice],['권력 메뉴','돌아가기',openPowerTransition]);modal('🗳️','정상적 권력교체',text,acts,`<div class="electionState"><span>내 정당</span><b>${S.faction.party||'없음'} · ${S.faction.partySeats||0}석</b><span>정치 영향력</span><b>${Math.round(S.inf.political)}</b><span>조기대선 후보</span><b>${p.playerCandidate?'출마 선언':'미출마'}</b></div>`)}
function runEarlyElection(){const p=S.v5.power;const restoreDemocracy=()=>{if(p.regime!=='민주공화정'){p.regime='민주공화정';p.coupStatus='없음';p.legitimacy=clamp(p.legitimacy+25);S.nation.stability=clamp(S.nation.stability+6)}};if(p.playerCandidate){const score=S.stats.reputation*.45+S.stats.cha*.25+S.stats.pol*.35+S.inf.political*.35+(S.faction.partySeats||0)*.12+rnd(-25,25);if(score>=78){restoreDemocracy();S.nation.currentPresident=S.name;S.nation.simulated=true;p.presidentStatus='재임';p.actingPresident=null;p.earlyElectionDays=null;p.playerCandidate=false;S.level=Math.max(S.level,8);S.inf.political=100;S.v3.gov.approval=52;log('조기 대통령선거에서 승리해 새 정부를 출범시켰습니다.');return}}restoreDemocracy();const names=['김도윤','박서진','한지우','정민호','이서현','최유진'];S.nation.currentPresident=names[rnd(0,names.length-1)];p.presidentStatus='재임';p.actingPresident=null;p.earlyElectionDays=null;p.playerCandidate=false;p.evidence=20;log(`${S.nation.currentPresident}가 조기 대통령선거에서 당선되었습니다. (가상 인물)`)}

/* ---------- ABSTRACT COUP / MILITARY POWER ---------- */
function coupEligibility(){return S.career==='military'&&S.level>=7&&S.inf.military>=65&&S.stats.lead>=55&&S.faction.militaryBloc}
function openCoup(){const p=S.v5.power;const eligible=coupEligibility();const body=`<div class="coupMeter"><div><span>군 영향력</span><b>${Math.round(S.inf.military)}</b></div><div><span>군내 지지</span><b>${Math.round(p.coupSupport)}</b></div><div><span>리더십</span><b>${Math.round(S.stats.lead)}</b></div><div><span>국가 안정도</span><b>${Math.round(S.nation.stability)}</b></div><div><span>정당성</span><b>${Math.round(p.legitimacy)}</b></div></div><div class="powerDisclaimer">이 시스템은 실제 군사행동의 장소·부대·통신·무기·작전 절차를 제공하지 않습니다. 오직 추상적인 정치/충성도 수치로 결과를 판정합니다.</div>`;const acts=[];
 if(S.career==='military'){acts.push(['장성 지지 확대','인맥/리더십 판정 · 군내 지지 상승',buildMilitarySupport]);acts.push(['헌정질서 수호 선언','군내 지지를 합법적 영향력으로 전환',constitutionalMilitaryPath]);}
 if(eligible)acts.push(['군사 권력장악 시도','극고위험 · 실패 시 장기 구금/경력 상실',attemptCoup]);
 if(p.coupStatus==='군정')acts.push(['군정 운영','정당성·경제·민심 관리',openMilitaryRegime]);
 acts.push(['권력 메뉴','돌아가기',openPowerTransition]);modal('🎖️','군사 권력 시스템',eligible?'권력장악 시도 조건을 충족했습니다. 국가가 안정적일수록 성공은 훨씬 어렵고 후폭풍이 큽니다.':'장군급 경력·군 영향력 65·리더십 55·장성 파벌이 필요합니다.',acts,body)}
function buildMilitarySupport(){const p=S.v5.power;const ok=Math.random()*100<clamp(30+S.stats.lead*.45+S.stats.net*.2+S.inf.military*.2,20,90);p.coupSupport=clamp(p.coupSupport+(ok?rnd(7,16):rnd(-5,4)));S.inf.military=clamp(S.inf.military+(ok?2:0));S.stats.stress=clamp(S.stats.stress+4);log(ok?'군 고위층에서 개인적 영향력이 확대됐습니다.':'군 내부에서 당신의 정치적 움직임을 경계하기 시작했습니다.');advance(10);openCoup()}
function constitutionalMilitaryPath(){const p=S.v5.power;p.coupSupport=Math.max(0,p.coupSupport-8);S.stats.reputation=clamp(S.stats.reputation+4);S.nation.stability=clamp(S.nation.stability+4);S.inf.political=clamp(S.inf.political+2);log('군의 정치적 중립과 헌정질서 수호를 공개 선언했습니다.');advance(5);openCoup()}
function attemptCoup(){const p=S.v5.power;if(!coupEligibility())return toast('조건을 충족하지 못했습니다.');const instability=100-S.nation.stability;const presidentWeak=S.nation.currentPresident===S.name?-25:(S.v3.gov?.approval!=null?50-S.v3.gov.approval:0);const score=S.inf.military*.28+p.coupSupport*.34+S.stats.lead*.22+instability*.28+presidentWeak*.15+rnd(-22,22);const success=score>=82;S.stats.stress=100;if(success){p.coupStatus='군정';p.regime='군사과도체제';p.legitimacy=32;p.presidentStatus='권력상실';p.actingPresident=null;S.nation.currentPresident=`${S.name} · 군정 최고책임자`;S.nation.simulated=true;S.nation.stability=clamp(S.nation.stability-18);S.nation.economy=clamp(S.nation.economy-12);S.nation.mood=clamp(S.nation.mood-20);S.inf.military=100;S.inf.political=clamp(S.inf.political+18);S.stats.reputation=clamp(S.stats.reputation-18);log('군사 권력장악 시도가 성공해 군사과도체제가 출범했습니다. 경제·민심·정당성이 크게 악화됐습니다.')}else{p.coupSupport=0;p.coupStatus='실패';S.jailDays=(S.jailDays||0)+3650;S.career=null;S.level=0;S.inf.military=clamp(S.inf.military-60);S.stats.reputation=clamp(S.stats.reputation-35);S.cash*=.35;S.nation.stability=clamp(S.nation.stability-8);log('군사 권력장악 시도가 실패했습니다. 장기 구금·경력 상실·자산 손실이 발생했습니다.')}advance(1);openPowerTransition()}
function openMilitaryRegime(){const p=S.v5.power;const body=`<div class="regimeGrid"><div><span>정당성</span><b>${Math.round(p.legitimacy)}</b></div><div><span>경제</span><b>${Math.round(S.nation.economy)}</b></div><div><span>민심</span><b>${Math.round(S.nation.mood)}</b></div><div><span>안정도</span><b>${Math.round(S.nation.stability)}</b></div></div>`;modal('🎖️','군사과도체제','권력을 잡는 것보다 유지하고 정상화하는 것이 더 어렵습니다. 정당성이 낮으면 경제·민심·군 내부까지 흔들립니다.',[['6개월 민정이양 로드맵','정당성 상승 · 군 영향력 하락',()=>regimeChoice('roadmap')],['경제 안정 우선','재정/경제 투자 · 민심 회복 시도',()=>regimeChoice('economy')],['통제 강화','단기 안정도 상승 · 정당성/민심 큰 하락',()=>regimeChoice('control')],['즉시 선거 선언','30일 뒤 선거 · 군정 종료 준비',()=>regimeChoice('election')],['권력 메뉴','돌아가기',openPowerTransition]],body)}
function regimeChoice(type){const p=S.v5.power;if(type==='roadmap'){p.legitimacy=clamp(p.legitimacy+15);S.nation.mood=clamp(S.nation.mood+8);S.inf.military=clamp(S.inf.military-7);p.earlyElectionDays=180;log('6개월 내 민정이양 로드맵을 발표했습니다.')}if(type==='economy'){S.nation.economy=clamp(S.nation.economy+5);S.nation.mood=clamp(S.nation.mood+3);p.legitimacy=clamp(p.legitimacy+4);log('경제 안정과 생활 회복을 군정의 최우선 과제로 삼았습니다.')}if(type==='control'){S.nation.stability=clamp(S.nation.stability+8);S.nation.mood=clamp(S.nation.mood-12);p.legitimacy=clamp(p.legitimacy-14);S.stats.reputation=clamp(S.stats.reputation-8);log('통제를 강화해 단기 안정도는 올랐지만 체제 정당성이 크게 떨어졌습니다.')}if(type==='election'){p.earlyElectionDays=30;p.legitimacy=clamp(p.legitimacy+12);log('30일 뒤 전국 선거를 실시한다고 발표했습니다.')}advance(7);openMilitaryRegime()}
function civilianTransition(){const p=S.v5.power;p.regime='민주공화정';p.coupStatus='없음';p.legitimacy=clamp(p.legitimacy+30);p.presidentStatus='궐위';p.earlyElectionDays=p.earlyElectionDays??45;S.nation.currentPresident='과도정부(가상)';S.nation.mood=clamp(S.nation.mood+8);S.nation.stability=clamp(S.nation.stability+5);log('군사과도체제가 민정 이양 절차에 들어갔습니다.');advance(1);openPowerTransition()}
function militaryRegimeMonth(){const p=S.v5.power;if(p.coupStatus!=='군정')return;p.legitimacy=clamp(p.legitimacy+rnd(-4,2)+(S.nation.mood>55?2:-1));S.nation.economy=clamp(S.nation.economy+rnd(-3,1));if(p.legitimacy<20){S.nation.stability=clamp(S.nation.stability-5);p.coupSupport=clamp(p.coupSupport-6);log('군사과도체제의 정당성 위기가 심각해졌습니다.')}if(p.coupSupport<18&&p.legitimacy<18&&Math.random()<.18){p.coupStatus='붕괴';p.regime='과도정부';S.nation.currentPresident='비상 과도정부(가상)';p.earlyElectionDays=60;S.nation.stability=clamp(S.nation.stability-12);log('군정 내부 균열로 체제가 붕괴하고 과도정부가 구성됐습니다.')}}

/* ---------- HOOKS / BALANCE ---------- */
const baseMonthlyIncomeV5=monthlyIncome;monthlyIncome=function(){ensureV5();const f=baseMonthlyIncomeV5();/* keep personal and company accounting separate */return f};
const baseMonthlyTickV5=monthlyTick;monthlyTick=function(){ensureV5();baseMonthlyTickV5();businessMonth();militaryRegimeMonth();if(S.nation.currentPresident===S.name&&impeachmentRisk()>65&&Math.random()<.12&&S.v5.power.presidentStatus==='재임'){S.v5.power.evidence=clamp(S.v5.power.evidence+rnd(5,12));S.v5.power.coalitionSeats=clamp(S.v5.power.coalitionSeats+rnd(8,22),0,220);log('야권이 대통령 탄핵 가능성을 공개적으로 거론하기 시작했습니다.')}};
const baseAdvanceV5=advance;advance=function(days,reason=''){ensureV5();baseAdvanceV5(days,reason);processPowerDays(days);save();updateAll()};

const baseShowAssetsV5=showAssets;showAssets=function(){ensureV5();const f=monthlyIncome();const c=S.v5.company;const body=`<div class="assetList"><div class="assetRow"><span>현금</span><b>${KRW(S.cash)}</b></div><div class="assetRow"><span>롱 투자자산</span><b>${KRW(marketValue())}</b></div><div class="assetRow"><span>공매도 잠재부채</span><b class="red">${KRW(shortLiabilityEstimate())}</b></div><div class="assetRow"><span>창업자 지분가치</span><b>${KRW(founderEquityValue())}</b></div><div class="assetRow"><span>개인부채</span><b class="red">${KRW(S.debt)}</b></div><div class="assetRow"><span>순자산</span><b class="gold">${KRW(networth())}</b></div><div class="assetRow"><span>월 총수입</span><b>${KRW(f.income)}</b></div><div class="assetRow"><span>개인 고정비</span><b class="red">-${KRW(f.expenses)}</b></div>${c.exists?`<div class="assetRow"><span>${c.name} 회사현금</span><b>${KRW(c.cash)}</b></div><div class="assetRow"><span>회사 월 영업손익</span><b class="${c.profit>=0?'green':'red'}">${KRW(c.profit)}</b></div>`:''}</div><div class="difficultyBox">V0.5: 개인자산과 회사자금을 분리했습니다. 기업가치가 높아도 회사 돈을 마음대로 개인 돈처럼 쓸 수 없습니다.</div>`;modal('💎','내 자산 · 기업/투자 통합','현금흐름이 나쁘면 자산가여도 파산할 수 있습니다.',[['투자시장','재무제표·IPO·공매도',openMarket],['사업 본부','회사 경영',openBusinessHQ]],body)};

const baseOpenGovernmentV5=openGovernment;openGovernment=function(){ensureV5();if(S.nation.currentPresident!==S.name)return baseOpenGovernmentV5();const g=S.v3.gov,a=S.v4.gov,p=S.v5.power;const body=`<div class="govGrid"><div class="govKpi"><span>국정 지지율</span><b>${Math.round(g.approval)}%</b></div><div class="govKpi"><span>탄핵 위험</span><b class="${impeachmentRisk()>55?'down':''}">${Math.round(impeachmentRisk())}%</b></div><div class="govKpi"><span>정부 재정</span><b>${KRW(g.treasury)}</b></div></div><div class="govAdvanced"><div><span>내각 역량</span><b>${Math.round(a.cabinet)}</b></div><div><span>정보기관</span><b>${Math.round(a.intel)}</b></div><div><span>안보 태세</span><b>${Math.round(a.security)}</b></div><div><span>여야 협치</span><b>${Math.round(a.coalition)}</b></div><div><span>헌정 증거압력</span><b>${Math.round(p.evidence)}</b></div><div><span>체제</span><b>${p.regime}</b></div></div>`;const acts=[['예산·경제정책','경제/복지/세금',openEconomicGov],['장관 인선','내각 역량 조정',()=>govAdvancedAction('cabinet')],['정보기관 브리핑','안보·정보 역량',()=>govAdvancedAction('intel')],['야당 지도부 협상','협치·탄핵위험 완화',()=>govAdvancedAction('coalition')],['국가안보회의','군사위기 대응',()=>govAdvancedAction('security')],['대통령 탄핵 대응','국회·증거·헌정위기 관리',openImpeachment],['권력교체 현황','탄핵/군사/선거 상태',openPowerTransition],['반부패 개혁','청렴도 개선',()=>govPolicy('integrity')]];modal('🇰🇷','대통령 국정 운영 V0.5','지지율과 경제뿐 아니라 국회의 탄핵 압력과 권력교체 위험도 관리해야 합니다.',acts,body)};

const baseUpdateAllV5=updateAll;updateAll=function(){ensureV5();baseUpdateAllV5();S.version=5;const mini=$('#v3GovMini');if(mini){const c=S.v5.company,p=S.v5.power;mini.insertAdjacentHTML('beforeend',`${c.exists?`<div class="systemRow"><span>내 회사</span><b>${c.name} · ${KRW(companyValuation())}</b></div>`:''}<div class="systemRow"><span>국가체제</span><b>${p.regime}</b></div><div class="systemRow"><span>대통령 상태</span><b>${p.presidentStatus}</b></div>`)}const pres=$('.president strong');if(pres)pres.textContent=S.nation.currentPresident;};

$('#marketBtn')&&($('#marketBtn').onclick=openMarket);$('#assetsBtn')&&($('#assetsBtn').onclick=showAssets);$('#governBtn')&&($('#governBtn').onclick=openGovernment);$('#businessBtn')&&($('#businessBtn').onclick=openBusinessHQ);$('#powerBtn')&&($('#powerBtn').onclick=openPowerTransition);
ensureV5();updateAll();
