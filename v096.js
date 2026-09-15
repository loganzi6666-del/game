/* LIFE : RISE V0.9.6 — MILITARY POWER ENTRY FIX */
const V096={version:'0.9.6'};

function ensureV096(){
  if(typeof ensureV5==='function')ensureV5();
  if(typeof ensureV093==='function')ensureV093();
  S.version='0.9.6';
  S.v096=S.v096||{militaryPowerOpened:0};
}

function v096RankName(){
  return S.career==='military'?(careers.military.levels[S.level]||'군인'):'비군인';
}
function v096MilitaryReqs(){
  ensureV096();
  return [
    {label:'현역 군인',ok:S.career==='military',now:S.career==='military'?'충족':'미충족',need:'군인 커리어'},
    {label:'계급',ok:S.career==='military'&&S.level>=7,now:v096RankName(),need:'준장 이상'},
    {label:'군 영향력',ok:S.inf.military>=65,now:Math.round(S.inf.military),need:'65 이상'},
    {label:'리더십',ok:S.stats.lead>=55,now:Math.round(S.stats.lead),need:'55 이상'},
    {label:'장성 네트워크',ok:!!S.faction.militaryBloc,now:S.faction.militaryBloc||'없음',need:'형성 필요'}
  ];
}
function v096CoupReady(){return v096MilitaryReqs().every(x=>x.ok)}
function v096ReqGrid(){
  return `<div class="v096-req-grid">${v096MilitaryReqs().map(r=>`<div class="${r.ok?'ok':'no'}"><span>${r.ok?'✓':'○'} ${r.label}</span><b>${r.now}</b><small>${r.ok?'조건 충족':`필요: ${r.need}`}</small></div>`).join('')}</div>`
}
function v096MilitaryPowerCard(){
  if(S.career!=='military')return '';
  ensureV096();
  const p=S.v5.power,ready=v096CoupReady();
  return `<section class="v9-card v096-power-card ${ready?'ready':''}">
    <div class="v096-power-head"><div><span>MILITARY POWER</span><h2>⚠ 군사 권력</h2><p>장성급 이후 국가 위기에서 열리는 고위험 권력 루트입니다. 모든 판정은 추상적인 게임 수치로 처리됩니다.</p></div><div class="v096-power-badge">${ready?'READY':'LOCKED'}</div></div>
    ${v096ReqGrid()}
    <div class="v096-power-stats"><span>군내 지지 <b>${Math.round(p.coupSupport)}/100</b></span><span>국가 안정도 <b>${Math.round(S.nation.stability)}/100</b></span><span>체제 정당성 <b>${Math.round(p.legitimacy)}/100</b></span><span>현재 체제 <b>${p.regime}</b></span></div>
    <div class="v096-power-actions">
      <button id="v096OpenMilitaryPower" class="${ready?'danger':''}">${ready?'군사 권력 시스템 열기':'조건 확인 / 세력 구축'}</button>
      ${!S.faction.militaryBloc&&S.level>=7?'<button id="v096BuildBloc">장성 네트워크 형성</button>':''}
    </div>
  </section>`;
}

function v096CreateGeneralBloc(){
  ensureV096();
  if(S.career!=='military'||S.level<7)return toast('준장 이상 현역 군인이 필요합니다.');
  if(S.faction.militaryBloc)return toast('이미 장성 네트워크가 있습니다.');
  if(S.inf.military<40||S.stats.lead<45)return toast('군 영향력 40 · 리더십 45가 필요합니다.');
  const cost=50000000;
  if(S.cash<cost)return toast('장성 네트워크 구축에 5,000만원이 필요합니다.');
  S.cash-=cost;
  S.faction.militaryBloc='장성 네트워크';
  S.inf.military=clamp(S.inf.military+8);
  S.v5.power.coupSupport=clamp(S.v5.power.coupSupport+6);
  S.stats.net=clamp(S.stats.net+3);
  S.stats.stress=clamp(S.stats.stress+4);
  log('군 수뇌부에서 당신을 중심으로 한 장성 네트워크가 형성되었습니다. (게임 시뮬레이션)');
  if(typeof v9AddHeadline==='function')v9AddHeadline('DEFENSE',`${S.name}, 군 수뇌부 내 영향력 확대 (게임 시뮬레이션)`,'neutral',false);
  save();
  toast('장성 네트워크가 형성되었습니다.');
  setTimeout(()=>{if(typeof v9SetView==='function')v9SetView('career');else if(typeof v9Render==='function')v9Render()},30);
}

function v096OpenCoup(){
  ensureV096();
  S.v096.militaryPowerOpened++;
  const p=S.v5.power,ready=v096CoupReady();
  const body=`${v096ReqGrid()}<div class="v096-coup-state"><div><span>군내 지지</span><b>${Math.round(p.coupSupport)}</b></div><div><span>국가 안정도</span><b>${Math.round(S.nation.stability)}</b></div><div><span>민심</span><b>${Math.round(S.nation.mood)}</b></div><div><span>정당성</span><b>${Math.round(p.legitimacy)}</b></div></div><div class="powerDisclaimer">이 기능은 실제 군사 작전·부대·통신·무기·시설·행동 절차를 다루지 않습니다. 리더십·영향력·국가 안정도 같은 추상적인 게임 수치만으로 결과를 판정합니다.</div>`;
  const acts=[];
  if(!S.faction.militaryBloc&&S.career==='military'&&S.level>=7)acts.push(['장성 네트워크 형성','군 영향력 40 · 리더십 45 · 5,000만원',v096CreateGeneralBloc]);
  if(S.career==='military')acts.push(['군내 지지 확대','장성·고위층의 개인적 지지도를 높인다',buildMilitarySupport]);
  if(ready)acts.push(['⚠ 군사 권력장악 시도','극고위험 · 실패 시 장기 구금·경력/자산 손실',v096ConfirmCoup]);
  if(p.coupStatus==='군정')acts.push(['군사과도체제 운영','경제·민심·정당성 관리',openMilitaryRegime]);
  acts.push(['헌정질서 수호 선언','군사적 영향력을 합법적 권위로 전환',constitutionalMilitaryPath]);
  modal('🎖️','군사 권력 시스템',ready?'권력장악 시도 조건을 충족했습니다. 국가가 안정적일수록 성공 가능성은 낮고 후폭풍은 큽니다.':'잠긴 조건을 충족하고 군내 지지를 확보해야 권력장악 시도를 선택할 수 있습니다.',acts,body);
}

function v096ConfirmCoup(){
  ensureV096();
  if(!v096CoupReady())return toast('아직 권력장악 조건을 충족하지 못했습니다.');
  modal('⚠️','최종 결정','이 선택은 게임 내 체제를 크게 바꾸는 극고위험 분기입니다. 실패하면 장기 구금, 군 경력 상실, 자산 손실이 발생할 수 있습니다.',[
    ['권력장악 시도','추상 수치 판정으로 즉시 결과 결정',()=>{closeModal();attemptCoup()}],
    ['취소','현재 체제를 유지합니다.',v096OpenCoup]
  ],`<div class="v096-final-warning"><b>현재 조건</b><span>군 영향력 ${Math.round(S.inf.military)} · 군내 지지 ${Math.round(S.v5.power.coupSupport)} · 리더십 ${Math.round(S.stats.lead)} · 국가 안정도 ${Math.round(S.nation.stability)}</span></div>`)
}

/* 군인 커리어 허브에 군사 권력 패널 삽입 */
const v096BaseCareerHub=v093CareerHubPage;
v093CareerHubPage=function(){
  let html=v096BaseCareerHub();
  if(S.career==='military')html=html.replace(/<div class="v093-bottom-grid">/,v096MilitaryPowerCard()+'<div class="v093-bottom-grid">');
  return html;
};
v9CareerPage=v093CareerHubPage;

/* v093가 이미 v9Page를 감싸고 있으므로 career 렌더도 새 함수를 사용 */
const v096BasePage=v9Page;
v9Page=function(){
  if(S.v9?.view==='career')return v093CareerHubPage();
  return v096BasePage();
};

function v096InjectRail(){
  const nav=document.querySelector('.v9-rail nav');
  if(!nav)return;
  nav.querySelectorAll('[data-v096-military]').forEach(x=>x.remove());
  if(S.career!=='military')return;
  const b=document.createElement('button');
  b.setAttribute('data-v096-military','1');
  b.innerHTML='<i>⚠️</i><span>군사 권력</span><em>'+(v096CoupReady()?'!':'')+'</em>';
  const career=nav.querySelector('[data-v9view="career"]');
  if(career)career.insertAdjacentElement('afterend',b);else nav.prepend(b);
  b.onclick=v096OpenCoup;
}
function v096Bind(){
  document.getElementById('v096OpenMilitaryPower')?.addEventListener('click',v096OpenCoup);
  document.getElementById('v096BuildBloc')?.addEventListener('click',v096CreateGeneralBloc);
  v096InjectRail();
}

const v096BaseRender=v9Render;
v9Render=function(){
  ensureV096();
  v096BaseRender();
  const ver=document.querySelector('.v091-player-summary>small');if(ver)ver.textContent='PLAYER PROFILE · V0.9.6';
  const brand=document.querySelector('.v9-brand small');if(brand&&brand.textContent.includes('COMMAND CENTER'))brand.textContent='COMMAND CENTER · V0.9.6';
  v096Bind();
};

/* 구버전 openCoup 호출도 새 화면으로 연결 */
openCoup=v096OpenCoup;

setTimeout(()=>{ensureV096();v9Render()},120);
