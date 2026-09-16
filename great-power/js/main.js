/* ============================================================
   열강의 시대 1900 — 시작 / 진행
   ============================================================ */
const GAME_VERSION = 'v1.4 · 2026-09-16';   // UPDATE.bat / update.sh 로 갱신
let PICK=null;

function initStart(){
  buildAdjacency();
  buildSeaZones();
  // 시작 화면 지도
  const svg=$('#startmap');
  svg.setAttribute('viewBox',`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`);
  const g=sv('g');
  svg.appendChild(g);
  const byNat={};
  for(const id in PROV){ const own=PROV[id][1]; (byNat[own]=byNat[own]||[]).push(id); }
  for(const raw of MAP_RAW){
    if(!PROV[raw.id]) continue;
    const own=PROV[raw.id][1];
    const path=sv('path',{d:raw.d, fill:NATIONS[own]?NATIONS[own].color:'#2b3744',
      stroke:'#0d1a26','stroke-width':'0.8','vector-effect':'non-scaling-stroke','data-n':own});
    path.style.cursor='pointer';
    path.addEventListener('click',()=>selectNation(own));
    path.addEventListener('mouseenter',()=>{ path.style.filter='brightness(1.4)'; });
    path.addEventListener('mouseleave',()=>{ path.style.filter=''; });
    g.appendChild(path);
  }
  // 국가 목록
  const order=Object.keys(NATIONS).sort((a,b)=>{
    const ga=NATIONS[a].gp?0:1, gb=NATIONS[b].gp?0:1;
    if(ga!==gb) return ga-gb;
    return byNat[b].length-byNat[a].length;
  });
  const box=$('#startpick');
  box.innerHTML=`<div class="tiny" style="margin-bottom:8px;color:var(--gold)">플레이할 나라 — 지도를 눌러도 됩니다</div>`;
  for(const c of order){
    const d=NATIONS[c];
    const pop=byNat[c].reduce((s,id)=>s+PROV[id][2],0);
    const row=el('div',{class:'npick','data-c':c});
    row.innerHTML=`<i class="dotc" style="background:${d.color};width:14px;height:14px"></i>
      <div style="flex:1"><div class="nm">${esc(d.name)} ${d.gp?'<span class="gpmark">열강</span>':''}</div>
      <div class="nd">${GOVS[d.gov].name} · 영토 ${byNat[c].length} · 인구 ${fmt(pop)}만</div></div>`;
    row.addEventListener('click',()=>selectNation(c));
    box.appendChild(row);
  }
  const ver=$('#verTag'); if(ver) ver.textContent=GAME_VERSION;
  $('#startBtn').addEventListener('click',startGame);
  // 저장된 게임이 있으면 이어하기 버튼
  if(localStorage.getItem('gp1900')){
    const b=el('button',{class:'btn',id:'contBtn'},'이어하기');
    b.style.marginRight='8px';
    b.addEventListener('click',loadGame);
    $('#startBtn').before(b);
  }
}
function selectNation(c){
  if(!NATIONS[c]) return;
  PICK=c;
  document.querySelectorAll('.npick').forEach(r=>r.classList.toggle('on', r.dataset.c===c));
  const r=document.querySelector(`.npick[data-c="${c}"]`); if(r) r.scrollIntoView({block:'nearest'});
  document.querySelectorAll('#startmap path').forEach(p=>{
    p.setAttribute('stroke', p.dataset.n===c?'#e5c65a':'#0d1a26');
    p.setAttribute('stroke-width', p.dataset.n===c?'2.5':'0.8');
  });
  const d=NATIONS[c];
  $('#pickinfo').innerHTML=`<b style="color:var(--gold2)">${esc(d.name)}</b> — ${esc(d.trait||GOVS[d.gov].desc)}`;
  $('#startBtn').disabled=false;
}
function startGame(){
  if(!PICK) return;
  newGame(PICK, { endYear:+$('#optEnd').value, difficulty:$('#optDiff').value });
  applyDifficulty();
  CHEAT.init();
  $('#start').style.display='none';
  $('#app').style.display='flex';
  buildMap($('#map'), true);
  UI.built=true;
  setupMapInteraction();
  wireUI();
  const v=UI.view; v.w=MAP_VIEW.w; v.h=MAP_VIEW.h; v.x=0; v.y=0;
  const r=$('#map').getBoundingClientRect();
  v.h=v.w*(r.height/r.width); if(v.h>MAP_VIEW.h){ v.h=MAP_VIEW.h; v.w=v.h*(r.width/r.height); }
  applyView();
  focusProv(G.nats[G.player].cap); zoomAt(2.0, ...provCentre(G.nats[G.player].cap));
  UI.sel=G.nats[G.player].cap;
  refreshAll();
  setTimeout(()=>showIntro(),260);
}
function applyDifficulty(){
  const d=G.difficulty;
  for(const c in G.nats){
    const n=G.nats[c]; if(c===G.player) continue;
    if(d==='easy'){ n.ai.agg*=0.6; n.ai.exp*=0.7; n.gold*=0.8; }
    if(d==='hard'){ n.ai.agg=Math.min(1,n.ai.agg*1.35); n.ai.exp=Math.min(1,n.ai.exp*1.3); n.gold*=1.4;
      if(n.gp) n.relations[G.player]=(n.relations[G.player]||0)-10; }
  }
}
function showIntro(){
  const n=G.nats[G.player];
  const rivals=G.ranking.slice(0,3).filter(c=>c!==G.player).map(c=>G.nats[c].name).join(', ');
  modal(`<div class="mh"><h2>${esc(n.name)} — 1900년 1월</h2>
    <div class="ms">현재 서열 ${n.rank}위 · 정부 ${GOVS[n.gov].name}</div></div>
    <div class="mb">
      새 세기가 밝았다. 증기와 강철, 전신과 식민지의 시대다.
      ${esc(rivals)}이(가) 세계를 나눠 갖고 있고, 당신의 자리는 아직 ${n.rank}위다.
      <div style="margin-top:12px">
        <b style="color:var(--gold2)">해야 할 일</b>
        <div class="tiny" style="margin-top:4px">
        · <b>공업</b>을 키워라 — 지역을 클릭해 공장을 세우면 세수·연구·인력이 모두 오른다.<br>
        · <b>기술</b>을 놓치지 마라 — 산업·정치·군사 세 갈래가 국력의 뼈대다.<br>
        · <b>외교</b>로 뒤를 막아라 — 동맹 없는 전쟁은 연합의 표적이 된다.<br>
        · <b>전쟁</b>은 명분과 함께 — 명분 없는 침략은 온 세계를 적으로 만든다.<br>
        · 아래 <b>명령창</b>에 한국어로 적어도 된다. 예) "프랑스와 동맹", "공장 건설"
        </div>
      </div>
      <div style="margin-top:12px">
        <b style="color:var(--gold2)">부대 다루는 법</b>
        <div class="tiny" style="margin-top:4px">
        · <b>드래그</b>로 상자를 그려 부대를 한꺼번에 고른다 (Shift = 추가, Ctrl+A = 전군)<br>
        · 고른 뒤 목표를 <b>우클릭</b> — 붙어 있으면 즉시 이동·공격, 멀면 매달 알아서 진군<br>
        · <b>우클릭 끌기</b>로 지도를 옮기고, 휠로 확대한다<br>
        · 사각 마커의 숫자는 육지에선 <b>사단 수</b>, 바다에선 <b>함선 수</b>다
        </div>
      </div>
      <div class="tiny" style="margin-top:12px">${G.endYear}년까지 서열 1위에 오르는 것이 목표다.</div>
    </div>
    <div class="mc"><button class="btn gold" style="width:100%" onclick="closeModals()">집무를 시작한다</button></div>`);
}

/* ---------- 턴 ---------- */
function doNextTurn(){
  if(G.finished) return;
  if(G.pending.length){ processPending(); return; }
  nextTurn();
  refreshAll();
  if(processPending()) return;
  if(G.finished || !G.nats[G.player].alive){ stopAuto(); showEnding(); }
}
function toggleAuto(){
  if(UI.auto) stopAuto();
  else {
    UI.auto=true; $('#btnAuto').classList.add('on'); $('#btnAuto').textContent='■ 정지';
    UI.autoTimer=setInterval(()=>{
      if(G.pending.length || G.finished || !G.nats[G.player].alive){ stopAuto(); processPending();
        if(G.finished||!G.nats[G.player].alive) showEnding(); return; }
      doNextTurn();
    }, 700);
  }
}
function stopAuto(){
  UI.auto=false; clearInterval(UI.autoTimer);
  const b=$('#btnAuto'); if(b){ b.classList.remove('on'); b.textContent='▶▶ 자동'; }
}

/* ---------- 저장 ---------- */
function saveGame(){
  try{
    // 대기 중인 사건 객체에는 함수가 들어 있어 직렬화되지 않는다 — 저장 전에 정리한다
    const pending = G.pending;
    G.pending = [];
    const json = JSON.stringify({G, v:2});
    G.pending = pending;
    localStorage.setItem('gp1900', json);
    toast(`${G.year}년 ${MONTHS[G.month]} 시점으로 저장했다`, true);
  }catch(e){ toast('저장 실패: '+e.message, false); }
}
function loadGame(){
  try{
    const raw=localStorage.getItem('gp1900');
    if(!raw) return toast('저장된 게임이 없다', false);
    const data=JSON.parse(raw);
    G=data.G;
    G.pending = G.pending || [];
    G.cheat = G.cheat || {on:false, used:false, godMode:false};
    G.handicap = G.handicap || {weak:0,res:1,tax:1,grw:1,def:1,shield:0};
    for(const c in G.nats) G.nats[c]._m=calcMods(G.nats[c]);
    if($('#start').style.display!=='none'){
      $('#start').style.display='none'; $('#app').style.display='flex';
      buildMap($('#map'), true); UI.built=true; setupMapInteraction(); wireUI();
      const r=$('#map').getBoundingClientRect();
      UI.view={x:0,y:0,w:MAP_VIEW.w,h:MAP_VIEW.w*(r.height/r.width)};
      applyView();
    }
    refreshAll(); toast('불러왔다', true);
  }catch(e){ toast('불러오기 실패: '+e.message, false); }
}

/* ---------- 이벤트 연결 ---------- */
function wireUI(){
  $('#btnNext').addEventListener('click',doNextTurn);
  $('#btnAuto').addEventListener('click',toggleAuto);
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
    UI.tab=t.dataset.t; syncTabs(); renderPanel(); }));
  document.querySelectorAll('.mapmode').forEach(b=>b.addEventListener('click',()=>{
    UI.mode=b.dataset.mode;
    document.querySelectorAll('.mapmode').forEach(x=>x.classList.toggle('on',x===b));
    paintMap(); }));
  $('#zIn').addEventListener('click',()=>zoomAt(1.4, UI.view.x+UI.view.w/2, UI.view.y+UI.view.h/2));
  $('#zOut').addEventListener('click',()=>zoomAt(0.72, UI.view.x+UI.view.w/2, UI.view.y+UI.view.h/2));
  $('#zFit').addEventListener('click',()=>{
    const r=$('#map').getBoundingClientRect();
    UI.view={x:0,y:0,w:MAP_VIEW.w,h:MAP_VIEW.w*(r.height/r.width)};
    if(UI.view.h>MAP_VIEW.h){ UI.view.h=MAP_VIEW.h; UI.view.w=MAP_VIEW.h*(r.width/r.height); }
    applyView(); });
  const go=()=>{ const v=$('#cmd').value; $('#cmd').value=''; runCommand(v); };
  $('#cmdgo').addEventListener('click',go);
  $('#cmdhelp').addEventListener('click',showHelp);
  $('#cmd').addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
  window.addEventListener('keydown',e=>{
    if(e.key==='F4'){ e.preventDefault(); toggleCheat(); return; }   // 어디서든 동작
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
    if(e.key===' '){ e.preventDefault(); doNextTurn(); }
    if(e.key==='Escape'){
      closeModals(); if(CHEAT.open) closeCheat(); UI.order=null;
      if(UI.selArmies) UI.selArmies.clear(); if(UI.selFleets) UI.selFleets.clear();
      refreshAll();
    }
    if(e.key==='a' && (e.ctrlKey||e.metaKey)){        // 전군 선택
      e.preventDefault();
      const me=G.nats[G.player];
      UI.selArmies=new Set(Object.keys(me.armies).filter(i=>me.armies[i]>=0.5));
      UI.selFleets=new Set(Object.keys(me.fleets||{}).filter(z=>me.fleets[z]>=0.5));
      refreshAll();
    }
    const keys={'1':'pol','2':'ctrl','3':'dev','4':'unrest','5':'army','6':'rel','7':'res'};
    if(keys[e.key]){ UI.mode=keys[e.key];
      document.querySelectorAll('.mapmode').forEach(x=>x.classList.toggle('on',x.dataset.mode===UI.mode));
      paintMap(); }
  });
}

window.addEventListener('DOMContentLoaded', initStart);
