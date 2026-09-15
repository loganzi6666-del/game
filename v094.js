/* LIFE : RISE V0.9.4 — RETIREMENT + F4 CHEAT CENTER */
const V094={version:'0.9.4'};

function ensureV094(){
  ensureV093();
  S.version='0.9.4';
  S.v094=S.v094||{cheatOpened:0};
}

/* ─────────────────────────────────────────────
   Career retirement
───────────────────────────────────────────── */
function v094RetireCareer(){
  if(!S.career){toast('현재 직업이 없습니다.');return}
  const comp=v091Compensation();
  modal('🚪','퇴직하시겠습니까?',`${comp.job} · ${comp.rank} 커리어를 종료합니다. 보유 현금·자산·능력치·인맥은 유지되지만 현재 경력점수와 직위는 초기화됩니다.`,[
    ['퇴직하기','현재 직업 종료',()=>{
      const oldJob=comp.job,oldRank=comp.rank;
      S.career=null;S.level=0;S.xp=0;
      if(S.v092){S.v092.monthShifts=0;S.v092.lastWorkDate=null}
      closeModal();
      log(`${oldJob} ${oldRank}에서 퇴직했습니다.`);
      save();updateAll();S.v9.view='career';v9Render();toast(`${oldJob}에서 퇴직했습니다.`)
    }],
    ['계속 근무','퇴직하지 않음',()=>closeModal()]
  ])
}

/* Career hub에 퇴직 버튼 삽입 */
const v094BaseCareerHub=v093CareerHubPage;
v093CareerHubPage=function(){
  let html=v094BaseCareerHub();
  if(!S.career)return html;
  return html.replace(
    '<button id="v093ChangeCareer">직업 관리</button>',
    '<div class="v094-career-actions"><button id="v093ChangeCareer">직업 관리</button><button id="v094RetireCareer" class="danger">퇴직하기</button></div>'
  )
};
v9CareerPage=v093CareerHubPage;

/* ─────────────────────────────────────────────
   Cheat Center
───────────────────────────────────────────── */
function v094CheatBody(){
  ensureV094();
  const comp=v091Compensation();
  const job=S.career?`${comp.job} · ${comp.rank}`:'무직';
  return `<div class="v094-cheat">
    <div class="v094-cheat-status">
      <div><span>현재 직업</span><b>${job}</b></div>
      <div><span>현금</span><b>${v093Money(S.cash)}</b></div>
      <div><span>경력점수</span><b>${Math.round(S.xp||0)}</b></div>
      <div><span>POWER</span><b>${Math.round(typeof power==='function'?power():0)}</b></div>
    </div>

    <section><h3>💰 자금</h3><div class="v094-cheat-grid">
      <button data-v094-cheat="cash10m">+1,000만원</button>
      <button data-v094-cheat="cash100m">+1억원</button>
      <button data-v094-cheat="cash1b">+10억원</button>
      <button data-v094-cheat="cash10b">현금 100억원</button>
    </div></section>

    <section><h3>🧠 능력치</h3><div class="v094-cheat-grid">
      <button data-v094-cheat="stats10">모든 능력 +10</button>
      <button data-v094-cheat="stats100">모든 능력 100</button>
      <button data-v094-cheat="stress0">스트레스 0</button>
      <button data-v094-cheat="health100">건강 100</button>
    </div></section>

    <section><h3>💼 커리어</h3><div class="v094-cheat-grid ${S.career?'':'disabled'}">
      <button data-v094-cheat="xp100" ${S.career?'':'disabled'}>경력 +100</button>
      <button data-v094-cheat="xp500" ${S.career?'':'disabled'}>경력 +500</button>
      <button data-v094-cheat="promote" ${S.career?'':'disabled'}>한 단계 승진</button>
      <button data-v094-cheat="maxrank" ${S.career?'':'disabled'}>최고 직위</button>
    </div></section>

    <section><h3>👑 평판 · 권력</h3><div class="v094-cheat-grid">
      <button data-v094-cheat="rep20">평판 +20</button>
      <button data-v094-cheat="inf10">모든 영향력 +10</button>
      <button data-v094-cheat="inf100">모든 영향력 100</button>
      <button data-v094-cheat="network100">인맥 100</button>
    </div></section>

    <section><h3>🇰🇷 국가</h3><div class="v094-cheat-grid">
      <button data-v094-cheat="economy100">경제 100</button>
      <button data-v094-cheat="stability100">안정도 100</button>
      <button data-v094-cheat="mood100">민심 100</button>
      <button data-v094-cheat="nation100">국가상태 전부 100</button>
    </div></section>
    <p class="v094-cheat-note">F4를 다시 누르면 치트센터를 닫습니다. 치트 사용 내용은 현재 저장 데이터에 그대로 반영됩니다.</p>
  </div>`
}

function v094OpenCheat(){
  ensureV094();S.v094.cheatOpened++;
  modal('🛠️','F4 치트센터','테스트나 자유 플레이용 치트 모드입니다. 원하는 항목을 즉시 변경할 수 있습니다.',[],v094CheatBody());
  $('#modal')?.classList.add('v094-cheat-modal');
  v094BindCheats();
}

function v094CheatApply(kind){
  ensureV094();
  const stats=['int','cha','lead','pol','net'];
  const infs=['political','business','military','media','under'];
  switch(kind){
    case 'cash10m':S.cash+=1e7;break;
    case 'cash100m':S.cash+=1e8;break;
    case 'cash1b':S.cash+=1e9;break;
    case 'cash10b':S.cash=1e10;break;
    case 'stats10':stats.forEach(k=>S.stats[k]=clamp((S.stats[k]||0)+10));break;
    case 'stats100':stats.forEach(k=>S.stats[k]=100);S.stats.health=100;break;
    case 'stress0':S.stats.stress=0;break;
    case 'health100':S.stats.health=100;break;
    case 'xp100':if(S.career)S.xp=(S.xp||0)+100;break;
    case 'xp500':if(S.career)S.xp=(S.xp||0)+500;break;
    case 'promote':if(S.career){const c=careers[S.career];if(S.level<c.levels.length-1){S.level++;S.xp=0;log(`[치트] ${c.levels[S.level]} 단계로 승진했습니다.`)}else toast('이미 최고 직위입니다.')}break;
    case 'maxrank':if(S.career){const c=careers[S.career];S.level=c.levels.length-1;S.xp=0;log(`[치트] ${c.levels[S.level]} 단계로 이동했습니다.`)}break;
    case 'rep20':S.stats.reputation=clamp((S.stats.reputation||0)+20);break;
    case 'inf10':infs.forEach(k=>S.inf[k]=clamp((S.inf[k]||0)+10));break;
    case 'inf100':infs.forEach(k=>S.inf[k]=100);break;
    case 'network100':S.stats.net=100;break;
    case 'economy100':S.nation.economy=100;break;
    case 'stability100':S.nation.stability=100;break;
    case 'mood100':S.nation.mood=100;break;
    case 'nation100':S.nation.economy=100;S.nation.stability=100;S.nation.mood=100;break;
    default:return;
  }
  save();updateAll();
  toast('치트가 적용되었습니다.');
  $('#modalBody').innerHTML=v094CheatBody();
  v094BindCheats();
}

function v094BindCheats(){
  $$('[data-v094-cheat]').forEach(b=>b.onclick=()=>v094CheatApply(b.dataset.v094Cheat));
}

/* F4: 어느 메인 화면에서도 치트센터 토글 */
window.addEventListener('keydown',e=>{
  if(e.key!=='F4')return;
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  e.preventDefault();e.stopPropagation();
  const m=$('#modal');
  if(m&&!m.classList.contains('hidden')&&m.classList.contains('v094-cheat-modal')){
    m.classList.remove('v094-cheat-modal');closeModal();return;
  }
  if(m&&!m.classList.contains('hidden'))closeModal();
  v094OpenCheat();
},{capture:true});

/* close 시 치트 전용 클래스 정리 */
const v094BaseCloseModal=closeModal;
closeModal=function(){
  $('#modal')?.classList.remove('v094-cheat-modal');
  v094BaseCloseModal();
};

/* 렌더 후 버튼 바인딩 + 버전 라벨 */
const v094BaseRender=v9Render;
v9Render=function(){
  ensureV094();
  v094BaseRender();
  $('#v094RetireCareer')&&($('#v094RetireCareer').onclick=v094RetireCareer);
  const version=$('.v091-player-summary>small');if(version)version.textContent='PLAYER PROFILE · V0.9.4';
  const old=$('.v9-brand small');if(old&&old.textContent.includes('COMMAND CENTER'))old.textContent='COMMAND CENTER · V0.9.4';
};

setTimeout(()=>{ensureV094();v9Render()},120);
