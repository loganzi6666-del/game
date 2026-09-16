/* ============================================================
   열강의 시대 1900 — 치트 모드 (F4)
   ============================================================ */
const CHEAT = {
  open:false,
  init(){ G.cheat = G.cheat || { on:false, used:false, godMode:false }; },
};

function toggleCheat(){
  CHEAT.init();
  if(CHEAT.open){ closeCheat(); return; }
  G.cheat.on = true;
  openCheatPanel();
}
function closeCheat(){
  CHEAT.open=false;
  const d=$('#cheatDock'); if(d) d.remove();
  paintMap();
}

/* 치트 목록 — f(n) 은 플레이어 국가를 받는다 */
const CHEATS = [
  { g:'재정', n:'국고 +£1,000',   f:n=>{ n.gold+=1000; },            d:'£1,000백만을 즉시 입금' },
  { g:'재정', n:'국고 +£10,000',  f:n=>{ n.gold+=10000; },           d:'대규모 입금' },
  { g:'재정', n:'부채 전액 탕감',  f:n=>{ n.debt=0; },                d:'국채를 모두 없앤다' },
  { g:'재정', n:'정치력 +500',    f:n=>{ n.pp=Math.min(9999,n.pp+500); }, d:'외교·개전·개혁에 쓰는 자원' },

  { g:'내정', n:'안정도 100',     f:n=>{ n.stab=100; n.legit=100; },  d:'안정도·정통성을 최대로' },
  { g:'내정', n:'전 국토 불만 0', f:n=>{ for(const p of ownedProvs(n.code)) p.unrest=0; }, d:'봉기 위험 제거' },
  { g:'내정', n:'위신 +100',      f:n=>{ n.pres+=100; },              d:'국제적 명성' },
  { g:'내정', n:'전쟁 피로 0',    f:n=>{ n.exh=0; n.casualties=0; },  d:'피로도와 전상자 회복' },
  { g:'내정', n:'전 국토 개발 최대', f:n=>{ for(const p of ownedProvs(n.code)){ p.dev=10; p.rail=3; } }, d:'모든 영토를 공업지대로' },

  { g:'기술', n:'연구 중인 기술 즉시 완료', f:n=>{
      for(const b of ['ind','pol','mil']){ const id=n.research[b]; if(id){ n.techs[id]=true; n.research[b]=null; n.progress[b]=0; } }
    }, d:'진행 중인 세 갈래를 한 번에' },
  { g:'기술', n:'연대 제한 내 전 기술 해금', f:n=>{
      let c=0; for(const id in TECHS) if(!n.techs[id] && G.year>=TECHS[id].y){ n.techs[id]=true; c++; }
      toast(`${c}개 기술을 해금했다`, true);
    }, d:'현재 연도까지 가능한 모든 기술' },
  { g:'기술', n:'연대 무시하고 전 기술 해금', f:n=>{
      for(const id in TECHS) n.techs[id]=true;
    }, d:'1900년에 기계화 사단을 굴린다' },

  { g:'군사', n:'수도에 10개 사단', f:n=>{ n.armies[n.cap]=(n.armies[n.cap]||0)+10; }, d:'즉시 편성' },
  { g:'군사', n:'선택 지역에 20개 사단', f:n=>{
      const id=(UI.sel && G.provs[UI.sel].ctrl===n.code)? UI.sel : n.cap;
      n.armies[id]=(n.armies[id]||0)+20;
      toast(`${G.provs[id].name}에 20개 사단 배치`, true);
    }, d:'지도에서 고른 곳에 배치' },
  { g:'군사', n:'주력함 +20척',   f:n=>{ n.navy+=20; },               d:'조선 능력 무시' },
  { g:'군사', n:'전 국토 요새 5급', f:n=>{ for(const p of ownedProvs(n.code)) p.fort=5; }, d:'철벽 방어' },
  { g:'군사', n:'인력 완전 회복',  f:n=>{ n.casualties=0; },           d:'동원 여력 복구' },

  { g:'영토', n:'선택 지역 병합', f:n=>{
      if(!UI.sel) return toast('지도에서 지역을 먼저 고르세요', false);
      const p=G.provs[UI.sel];
      if(p.own===n.code) return toast('이미 우리 땅이다', false);
      const old=G.nats[p.own] ? G.nats[p.own].name : '무주지';
      transferProvince(UI.sel, n.code);
      p.unrest=0; if(!p.cores.includes(n.code)) p.cores.push(n.code);
      toast(`${old}로부터 ${p.name}을(를) 병합했다`, true);
    }, d:'고른 프로빈스를 즉시 우리 영토로' },
  { g:'영토', n:'인접 지역 전부 병합', f:n=>{
      const mine=ownedProvs(n.code).map(p=>p.id);
      const targets=new Set();
      for(const id of mine) for(const nb of neighbours(id)) if(G.provs[nb].own!==n.code) targets.add(nb);
      for(const id of targets){ transferProvince(id, n.code); G.provs[id].unrest=0;
        if(!G.provs[id].cores.includes(n.code)) G.provs[id].cores.push(n.code); }
      toast(`${targets.size}개 지역을 병합했다`, true);
    }, d:'국경에 닿은 모든 땅을 한 번에' },

  { g:'전쟁', n:'진행 중인 전쟁 즉시 승리', f:n=>{
      const wars=warsOf(n.code);
      if(!wars.length) return toast('전쟁 중이 아니다', false);
      for(const w of [...wars]){
        const side=sideOf(w,n.code);
        w.score = side==='att'? 100 : -100;
        w.battleScore = side==='att'? 100 : -100;
        const occ=[];
        for(const id in G.provs){ const p=G.provs[id];
          if((side==='att'? w.def : w.att).includes(p.own)) occ.push(id); }
        for(const id of occ) G.provs[id].ctrl=n.code;
      }
      toast(`${wars.length}개 전쟁에서 전 영토를 점령했다 — 강화 협상에서 원하는 만큼 요구할 수 있다`, true);
    }, d:'전쟁 점수를 100으로 만들고 적 영토를 전부 점령 상태로' },
  { g:'전쟁', n:'모든 전쟁 백지 강화', f:n=>{
      const wars=warsOf(n.code);
      for(const w of [...wars]) makePeace(w, sideOf(w,n.code), 'white');
      toast(`${wars.length}개 전쟁을 끝냈다`, true);
    }, d:'아무것도 얻지 않고 전부 종전' },

  { g:'외교', n:'모든 나라와 관계 +100', f:n=>{
      for(const c in G.nats){ if(c===n.code) continue;
        n.relations[c]=100; G.nats[c].relations[n.code]=100; }
    }, d:'전 세계가 우리를 사랑한다' },
  { g:'외교', n:'열강 전부와 동맹', f:n=>{
      let c2=0;
      for(const c in G.nats){ const t=G.nats[c];
        if(c===n.code||!t.alive||!t.gp) continue;
        if(atWarWith(n.code,c)) continue;
        if(!n.allies.includes(c)){ n.allies.push(c); t.allies.push(n.code); c2++; }
        n.relations[c]=t.relations[n.code]=100;
      }
      toast(`${c2}개 열강과 동맹을 맺었다`, true);
    }, d:'강대국을 모두 우리 편으로' },
  { g:'외교', n:'침략 평판 초기화', f:n=>{ n.aggression=0; }, d:'세계가 우리의 과거를 잊는다' },

  { g:'특수', n:'무적 모드 켜기/끄기', f:n=>{
      G.cheat.godMode=!G.cheat.godMode; n._m=calcMods(n);
      toast(G.cheat.godMode? '무적 모드 — 전투·산업·연구·세수 3배':'무적 모드 해제', true);
    }, d:'전투력·산업·연구·세수가 3배가 된다' },
  { g:'특수', n:'1년 건너뛰기', f:n=>{
      for(let i=0;i<12;i++){ nextTurn(); if(G.pending.length) break; }
      toast(`${G.year}년 ${MONTHS[G.month]}까지 진행했다`, true);
    }, d:'12개월을 한 번에 (사건이 뜨면 멈춤)' },
  { g:'특수', n:'건설·모병 즉시 완료', f:n=>{
      n.building.forEach(b=>b.left=1); n.recruiting.forEach(r=>r.left=1);
      toast('다음 달에 모두 완공된다', true);
    }, d:'진행 중인 공사를 다음 달로 당긴다' },
];

function openCheatPanel(){
  CHEAT.open=true;
  const old=$('#cheatDock'); if(old) old.remove();
  const groups={};
  CHEATS.forEach((c,i)=>{ (groups[c.g]=groups[c.g]||[]).push([c,i]); });

  const d=el('div',{id:'cheatDock'});
  let h=`<div class="chHead">
      <b>치트 모드</b>
      <span class="tiny">F4로 닫기 · 사용하면 기록에 표시된다</span>
      <button class="chX" id="chClose">✕</button>
    </div><div class="chBody">`;
  for(const g in groups){
    h+=`<div class="chGrp"><div class="chGt">${esc(g)}</div>`;
    for(const [c,i] of groups[g]){
      h+=`<button class="chBtn" data-i="${i}" title="${esc(c.d)}">${esc(c.n)}<span>${esc(c.d)}</span></button>`;
    }
    h+=`</div>`;
  }
  h+=`</div><div class="chFoot">
      <span class="tiny">명령창에도 쓸 수 있다 — <b>돈 5000</b> · <b>기술 전부</b> · <b>병력 30</b> · <b>즉시 승리</b></span>
    </div>`;
  d.innerHTML=h;
  document.body.appendChild(d);
  d.querySelector('#chClose').addEventListener('click',closeCheat);
  d.querySelectorAll('.chBtn').forEach(b=>b.addEventListener('click',()=>{
    const c=CHEATS[+b.dataset.i];
    G.cheat.used=true;
    c.f(G.nats[G.player]);
    logEvent('치트', c.n, 'cheat', G.player);
    refreshAll();
  }));
}

/* 명령창에서 쓰는 치트 — 치트 모드가 켜져 있을 때만 동작 */
function tryCheatCommand(T, raw){
  if(!G.cheat || !G.cheat.on) return false;
  const n=G.nats[G.player];
  const num=(def)=>{ const m=T.match(/(\d+)/); return m? parseInt(m[1],10) : def; };
  const mark=(msg)=>{ G.cheat.used=true; logEvent('치트', msg, 'cheat', G.player); toast(msg,true); refreshAll(); return true; };

  if(has(T,'돈','국고','금','자금')){ const v=num(1000); n.gold+=v; return mark(`국고 +£${v}백만`); }
  if(has(T,'정치력')){ const v=num(500); n.pp+=v; return mark(`정치력 +${v}`); }
  if(has(T,'기술 전부','기술전부','모든 기술','전 기술')){
    for(const id in TECHS) n.techs[id]=true; n._m=calcMods(n); return mark('전 기술 해금'); }
  if(has(T,'병력','사단 추가','군대 추가')){
    const v=num(20); const id=(UI.sel&&G.provs[UI.sel].ctrl===G.player)?UI.sel:n.cap;
    n.armies[id]=(n.armies[id]||0)+v; return mark(`${G.provs[id].name}에 ${v}개 사단`); }
  if(has(T,'함대','함선 추가')){ const v=num(20); n.navy+=v; return mark(`주력함 +${v}척`); }
  if(has(T,'즉시 승리','즉시승리','전쟁 승리')){ CHEATS.find(c=>c.n.includes('즉시 승리')).f(n); G.cheat.used=true; refreshAll(); return true; }
  if(has(T,'병합')){ CHEATS.find(c=>c.n==='선택 지역 병합').f(n); G.cheat.used=true; refreshAll(); return true; }
  if(has(T,'무적')){ CHEATS.find(c=>c.n.includes('무적')).f(n); G.cheat.used=true; refreshAll(); return true; }
  if(has(T,'안정')&&has(T,'최대','100')){ n.stab=100; n.legit=100; return mark('안정도 100'); }
  return false;
}
