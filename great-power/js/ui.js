/* ============================================================
   열강의 시대 1900 — UI
   ============================================================ */
const SVGNS='http://www.w3.org/2000/svg';
const UI = {
  mode:'pol', sel:null, order:null, tab:'nation', auto:false, autoTimer:null,
  view:{x:0,y:0,w:MAP_VIEW.w,h:MAP_VIEW.h}, paths:{}, built:false,
};
const $ = s=>document.querySelector(s);
const el = (t,a,txt)=>{ const e=document.createElement(t); if(a) for(const k in a) e.setAttribute(k,a[k]); if(txt!=null) e.textContent=txt; return e; };
const sv = (t,a)=>{ const e=document.createElementNS(SVGNS,t); if(a) for(const k in a) e.setAttribute(k,a[k]); return e; };
const fmt = (v,d)=> (v==null||isNaN(v))?'—':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d===undefined?0:d});
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- 색상 ---------- */
function shade(hex, amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.round(r+(amt>0?(255-r)*amt:r*amt)); g=Math.round(g+(amt>0?(255-g)*amt:g*amt)); b=Math.round(b+(amt>0?(255-b)*amt:b*amt));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function lerpCol(a,b,t){
  const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  const r=Math.round(((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t);
  const g=Math.round(((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t);
  const bl=Math.round((pa&255)+((pb&255)-(pa&255))*t);
  return '#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
}
const RESCOL={gr:'#c8b44a',co:'#4a5560',ir:'#8a7a6a',oi:'#2f3a44',ru:'#4f7a52',ct:'#cfc2a8',go:'#d9b93c',sp:'#b0643c',fi:'#4a7f9a','-':'#3a4854'};

function provFill(p){
  const own = G.nats[p.own], ctl = G.nats[p.ctrl];
  switch(UI.mode){
    case 'pol':  return own? own.color : '#2b3744';
    case 'ctrl': {
      if(p.own!==p.ctrl) return ctl? shade(ctl.color,0.30) : '#555';
      const w = warsOf(p.own).length;
      return own? (w? shade(own.color,-0.1) : shade(own.color,-0.35)) : '#2b3744';
    }
    case 'dev':  return lerpCol('#1e2c38','#ffd98a', Math.min(1,p.dev/10));
    case 'unrest':return lerpCol('#1b3325','#d13b3b', Math.min(1,p.unrest/70));
    case 'army': {
      let a=0; for(const c in G.nats){ const v=G.nats[c].armies[p.id]; if(v) a+=v; }
      return a? lerpCol('#23384d','#6fd0ff', Math.min(1,a/25)) : '#1c2733';
    }
    case 'rel': {
      if(p.own===G.player) return '#e5c65a';
      const me=G.nats[G.player];
      if(atWarWith(G.player,p.own)) return '#a8262c';
      if(me.allies.includes(p.own)) return '#3f8f5f';
      const r=me.relations[p.own]||0;
      return r>=0 ? lerpCol('#37475a','#4f9e6f', r/100) : lerpCol('#37475a','#9e4f4f', -r/100);
    }
    case 'res':  return RESCOL[p.res]||'#3a4854';
  }
  return '#334';
}

/* ---------- 지도 구축 ---------- */
function buildMap(svg, interactive){
  svg.innerHTML='';
  svg.setAttribute('viewBox', `0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`);
  const defs=sv('defs');
  defs.innerHTML = `<pattern id="occ" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="8" fill="#000" opacity="0"/><rect width="3" height="8" fill="#000" opacity=".35"/></pattern>`;
  svg.appendChild(defs);
  const gLand=sv('g',{id:'gLand'}), gOver=sv('g',{id:'gOver'}), gMark=sv('g',{id:'gMark'});
  svg.appendChild(gLand); svg.appendChild(gOver); svg.appendChild(gMark);
  for(const raw of MAP_RAW){
    if(!G || !G.provs[raw.id]) { if(!PROV[raw.id]) continue; }
    const path=sv('path',{d:raw.d, class:'prov', 'data-id':raw.id});
    gLand.appendChild(path);
    if(interactive) UI.paths[raw.id]=path;
  }
  return {gLand,gOver,gMark};
}

function paintMap(){
  for(const id in UI.paths){
    const p=G.provs[id]; if(!p) continue;
    const path=UI.paths[id];
    path.setAttribute('fill', provFill(p));
    path.classList.toggle('sel', UI.sel===id);
  }
  paintOverlays();
  paintMarkers();
  renderLegend();
}
function paintOverlays(){
  const g=$('#map #gOver'); g.innerHTML='';
  if(UI.mode==='ctrl'){
    for(const id in G.provs){ const p=G.provs[id];
      if(p.own!==p.ctrl) g.appendChild(sv('path',{d:rawPath(id), fill:'url(#occ)', stroke:'none'})); }
  }
  // 이동/공격 가능 표시
  if(UI.order && UI.order.from){
    for(const nb of neighbours(UI.order.from)){
      if(!UI.paths[nb]) continue;
      const q=G.provs[nb];
      const hostile = atWarWith(G.player,q.ctrl);
      g.appendChild(sv('path',{d:rawPath(nb), fill:'none',
        stroke: hostile?'#ff6b6b':'#7fdc9a', 'stroke-width':'3', 'vector-effect':'non-scaling-stroke'}));
    }
  }
}
const RAWMAP={}; MAP_RAW.forEach(r=>RAWMAP[r.id]=r);
function rawPath(id){ return RAWMAP[id]?RAWMAP[id].d:''; }
function provCentre(id){ return RAWMAP[id]?RAWMAP[id].c:[0,0]; }

/* 지도 단위 ↔ 화면 픽셀. 오버레이는 확대해도 같은 크기로 보여야 한다. */
function mapUnit(){
  const r=$('#map').getBoundingClientRect();
  if(!r.width || !r.height) return UI.view.w/1200;
  // viewBox 비율과 화면 비율이 어긋나면 실제 배율은 '맞춰지는 쪽'이 결정한다
  const sx = r.width/UI.view.w, sy = r.height/UI.view.h;
  return 1/Math.min(sx, sy);
}
function provBox(id){ const r=RAWMAP[id]; return r && r.b ? r.b : null; }

/* ---------- 부대 카운터 ---------- */
function drawCounter(g, opts){
  const {x, y, U, color, value, kind, selected, mine, tag, dataKey} = opts;
  const px = v=>v*U;
  const w = px(kind==='fleet' ? 38 : 34), h = px(20);
  const grp = sv('g', kind==='fleet' ? {'data-fleet':dataKey} : {'data-army':dataKey});
  grp.style.cursor='pointer';
  // 본체
  grp.appendChild(sv('rect',{x:x-w/2, y:y-h/2, width:w, height:h, rx:px(3),
    fill:'#131d28', stroke: selected?'#ffffff' : mine?'#e5c65a':'#4b5c6d',
    'stroke-width': selected?2.6 : mine?1.8:1.2, 'vector-effect':'non-scaling-stroke', opacity:.97}));
  // 국가색 띠
  grp.appendChild(sv('rect',{x:x-w/2, y:y-h/2, width:px(7), height:h, rx:px(3), fill:color}));
  grp.appendChild(sv('rect',{x:x-w/2+px(4), y:y-h/2, width:px(3), height:h, fill:color}));
  // 병종 기호
  const sx=x-w/2+px(10), sy=y-h/2+px(5), sw=px(11), sh=px(10);
  if(kind==='fleet'){
    grp.appendChild(sv('path',{d:`M${sx} ${sy+sh*0.55} L${sx+sw} ${sy+sh*0.55} L${sx+sw*0.8} ${sy+sh} L${sx+sw*0.2} ${sy+sh} Z`,
      fill:'#9fb8cc'}));
    grp.appendChild(sv('line',{x1:sx+sw*0.5,y1:sy,x2:sx+sw*0.5,y2:sy+sh*0.55,
      stroke:'#9fb8cc','stroke-width':1.4,'vector-effect':'non-scaling-stroke'}));
  } else {
    grp.appendChild(sv('rect',{x:sx, y:sy, width:sw, height:sh, fill:'none',
      stroke:'#9fb8cc','stroke-width':1.3,'vector-effect':'non-scaling-stroke'}));
    grp.appendChild(sv('path',{d:`M${sx} ${sy} L${sx+sw} ${sy+sh} M${sx+sw} ${sy} L${sx} ${sy+sh}`,
      stroke:'#9fb8cc','stroke-width':1.1,'vector-effect':'non-scaling-stroke'}));
  }
  // 수치
  const t=sv('text',{x:x+w/2-px(4), y:y+px(4), style:`font-size:${px(12.5)}px;font-weight:700;fill:#fff;text-anchor:end`});
  t.textContent=Math.round(value); grp.appendChild(t);
  if(tag){
    const tt=sv('text',{x, y:y+h/2+px(9), class:'caplabel', style:`font-size:${px(9.5)}px;stroke-width:${px(2.5)}px`});
    tt.textContent=tag; grp.appendChild(tt);
  }
  g.appendChild(grp);
  return {w,h};
}

function paintMarkers(){
  const g=$('#map #gMark'); g.innerHTML='';
  const zoom = MAP_VIEW.w/UI.view.w;
  const U = mapUnit();
  const px = v => v*U;
  const me = G.nats[G.player];
  UI.selArmies = UI.selArmies || new Set();
  UI.selFleets = UI.selFleets || new Set();

  /* 프로빈스별 주둔 집계 */
  const stacks={};
  for(const c in G.nats){ const n=G.nats[c];
    for(const id in n.armies){ const v=n.armies[id]; if(v<0.5) continue;
      (stacks[id]=stacks[id]||[]).push([c,v]); } }
  const fxByProv={};
  if(G.fx) for(const f of G.fx){
    if(G.turn-f.turn>2 || !RAWMAP[f.prov]) continue;
    (fxByProv[f.prov]=fxByProv[f.prov]||[]).push(f);
  }
  const showInfra = zoom > 1.3;
  const s = px(4.4), iw = s*2.0;
  const cw = px(34), ch = px(20);

  /* 1) 진군 경로 (맨 아래) */
  for(const from in (me.orders||{})){
    const o=me.orders[from];
    if(!G.provs[from]||!G.provs[o.to]) continue;
    const a=provCentre(from), b=provCentre(o.to);
    g.appendChild(sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1], stroke:'#e5c65a',
      'stroke-width':1.8, 'vector-effect':'non-scaling-stroke','stroke-dasharray':'7 5', opacity:.7}));
    g.appendChild(sv('path',{d:arrowHead(a,b,px(7)), fill:'#e5c65a', opacity:.8}));
  }
  for(const from in (me.fleetOrders||{})){
    const o=me.fleetOrders[from];
    if(!SEA_ZONES[from]||!SEA_ZONES[o.to]) continue;
    const a=[SEA_ZONES[from].x,SEA_ZONES[from].y], b=[SEA_ZONES[o.to].x,SEA_ZONES[o.to].y];
    g.appendChild(sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1], stroke:'#6fd0ff',
      'stroke-width':1.8, 'vector-effect':'non-scaling-stroke','stroke-dasharray':'7 5', opacity:.7}));
    g.appendChild(sv('path',{d:arrowHead(a,b,px(7)), fill:'#6fd0ff', opacity:.8}));
  }

  /* 2) 시설 — 부대가 있으면 카운터 오른쪽으로 비켜 놓는다 */
  if(showInfra) for(const id in G.provs){
    const p=G.provs[id];
    const icons=[];
    const fac = p.dev>=9?3 : p.dev>=6?2 : p.dev>=3?1 : 0;
    for(let i=0;i<fac;i++) icons.push(['fac',null]);
    if(p.fort>0) icons.push(['fort', p.fort]);
    if(p.rail>0) icons.push(['rail', p.rail]);
    const bd = buildingsAt(id);
    if(bd) icons.push(['work', bd]);
    if(!icons.length) continue;

    const total = icons.length*iw;
    const [cx,cy]=provCentre(id);
    const box=provBox(id);
    const hasArmy = !!stacks[id];
    let ox, oy;
    if(hasArmy){ ox = cx + cw/2 + px(5) + total/2; oy = cy; }
    else { ox = cx; oy = cy; }
    // 프로빈스 밖으로 밀려나면 아래쪽으로 내린다
    if(box && hasArmy && ox + total/2 > box[2] + px(6)){ ox = cx; oy = cy + ch/2 + px(9); }
    if(box && Math.sqrt(RAWMAP[id].a) < total*0.75 && id!==UI.sel && !hasArmy) continue;

    g.appendChild(sv('rect',{x:ox-total/2-s*0.35, y:oy-s*1.5, width:total+s*0.7, height:s*2.7,
      rx:s*0.5, fill:'#0b1620', opacity:.62}));
    let x = ox - total/2 + iw/2;
    for(const [kind,val] of icons){ drawInfra(g, kind, x, oy, s, val); x+=iw; }
  }

  /* 3) 병력 카운터 */
  for(const id in stacks){
    if(!RAWMAP[id]) continue;
    const [cx,cy]=provCentre(id);
    const list=stacks[id].sort((a,b)=>b[1]-a[1]);
    const [c,v]=list[0];
    const mine = c===G.player;
    const order = mine && me.orders && me.orders[id];
    drawCounter(g,{ x:cx, y:cy, U, color:G.nats[c].color, value:v, kind:'army',
      selected: mine && UI.selArmies.has(id), mine, dataKey:id,
      tag: zoom>2.2 ? (Math.round(v)+'개 사단'+(order?' »':'')) : (order?'»':null) });
    if(list.length>1){
      const t2=sv('text',{x:cx-cw/2-px(5), y:cy+px(4), class:'caplabel',
        style:`font-size:${px(12)}px;fill:#ff8a8a;stroke-width:${px(3)}px`});
      t2.textContent='⚔'; g.appendChild(t2);
    }
  }

  /* 4) 수도 이름 — 카운터 위 */
  if(zoom>1.6){
    for(const c in G.nats){ const n=G.nats[c]; if(!n.alive || !RAWMAP[n.cap]) continue;
      if(fxByProv[n.cap]) continue;
      const [cx,cy]=provCentre(n.cap);
      const off = (stacks[n.cap] ? ch/2 : 0) + px(9);
      const t=sv('text',{x:cx, y:cy-off, class:'caplabel',
        style:`font-size:${px(10.5)}px;stroke-width:${px(3)}px`});
      t.textContent='★ '+n.adj; g.appendChild(t); }
  }

  /* 5) 완공 알림 — 가장 위, 카운터와 겹치지 않게 */
  for(const id in fxByProv){
    const arr=fxByProv[id];
    const [cx,cy]=provCentre(id);
    const age = G.turn - arr[0].turn;
    const label = arr.length>1 ? `${arr.length}건 완공` : arr[0].label;
    const fs = px(10);
    const w = px(label.length*7.2 + 12);
    const base = cy - (stacks[id]? ch/2 : 0) - px(11) - age*px(4);
    g.appendChild(sv('rect',{x:cx-w/2, y:base-fs*1.2, width:w, height:fs*1.7, rx:px(3),
      fill:'#1b2734', opacity:Math.max(0.35, .92-age*0.2),
      stroke:'#e5c65a','stroke-width':1,'vector-effect':'non-scaling-stroke'}));
    const t=sv('text',{x:cx, y:base+px(2), style:`font-size:${fs}px;fill:#ffe9a8;text-anchor:middle`});
    t.textContent=label; g.appendChild(t);
  }

  if(typeof drawFleets==='function') drawFleets(g, px, U);
}
function arrowHead(a,b,size){
  const ang=Math.atan2(b[1]-a[1], b[0]-a[0]);
  const tipx=b[0]-Math.cos(ang)*size*1.2, tipy=b[1]-Math.sin(ang)*size*1.2;
  const p1=[tipx-Math.cos(ang-0.5)*size, tipy-Math.sin(ang-0.5)*size];
  const p2=[tipx-Math.cos(ang+0.5)*size, tipy-Math.sin(ang+0.5)*size];
  return `M${tipx} ${tipy} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`;
}


function buildingsAt(provId){
  for(const c in G.nats){
    for(const b of G.nats[c].building) if(b.prov===provId) return BUILDINGS[b.type].n;
  }
  return null;
}

/* 작은 벡터 글리프 — 공장 / 요새 / 철도 / 공사중 */
function drawInfra(g, kind, x, y, s, val){
  const add=(t,a)=>{ g.appendChild(sv(t,a)); };
  if(kind==='fac'){
    add('rect',{x:x-s*0.8, y:y-s*0.35, width:s*1.6, height:s*1.05, fill:'#d98c33', stroke:'#2a1c08','stroke-width':.6,rx:.6});
    add('rect',{x:x+s*0.15, y:y-s*1.05, width:s*0.42, height:s*0.75, fill:'#b06e20', stroke:'#2a1c08','stroke-width':.5});
    add('circle',{cx:x+s*0.36, cy:y-s*1.35, r:s*0.26, fill:'#cfd8e0', opacity:.55});
  } else if(kind==='fort'){
    add('path',{d:`M${x-s*0.85} ${y+s*0.6} L${x-s*0.85} ${y-s*0.45} L${x-s*0.5} ${y-s*0.45} L${x-s*0.5} ${y-s*0.8}
                  L${x-s*0.15} ${y-s*0.8} L${x-s*0.15} ${y-s*0.45} L${x+s*0.15} ${y-s*0.45} L${x+s*0.15} ${y-s*0.8}
                  L${x+s*0.5} ${y-s*0.8} L${x+s*0.5} ${y-s*0.45} L${x+s*0.85} ${y-s*0.45} L${x+s*0.85} ${y+s*0.6} Z`,
              fill:'#9aa7b4', stroke:'#1a2430','stroke-width':.6});
    if(val>=3){ const t=sv('text',{x, y:y+s*0.5, class:'armytag',
      style:`font-size:${s*1.15}px;stroke-width:2px`}); t.textContent=val; g.appendChild(t); }
  } else if(kind==='rail'){
    add('line',{x1:x-s*0.9,y1:y-s*0.2,x2:x+s*0.9,y2:y-s*0.2, stroke:'#8d99a5','stroke-width':s*0.22});
    add('line',{x1:x-s*0.9,y1:y+s*0.3,x2:x+s*0.9,y2:y+s*0.3, stroke:'#8d99a5','stroke-width':s*0.22});
    for(let i=-1;i<=1;i++) add('line',{x1:x+i*s*0.55,y1:y-s*0.45,x2:x+i*s*0.55,y2:y+s*0.55,
      stroke:'#5d6a76','stroke-width':s*0.18});
  } else if(kind==='work'){
    add('circle',{cx:x, cy:y+s*0.1, r:s*0.95, fill:'#1b2734', stroke:'#e5c65a','stroke-width':.9});
    add('path',{d:`M${x-s*0.45} ${y+s*0.55} L${x+s*0.1} ${y-s*0.2} M${x-s*0.05} ${y-s*0.55} L${x+s*0.55} ${y-s*0.05}`,
      stroke:'#e5c65a','stroke-width':s*0.28,'stroke-linecap':'round',fill:'none'});
    const ttl=sv('title'); ttl.textContent='공사 중: '+val; g.appendChild(ttl);
  }
}

function renderLegend(){
  const L=$('#legend'); if(!L) return;
  const rows=[];
  if(UI.mode==='pol'||UI.mode==='ctrl'){
    const tops=G.ranking.slice(0,6).filter(c=>G.nats[c].alive);
    for(const c of tops) rows.push([G.nats[c].color, G.nats[c].name]);
    if(UI.mode==='ctrl') rows.push(['repeating-linear-gradient(45deg,#000,#000 3px,transparent 3px,transparent 6px)','빗금 = 점령 중']);
  } else if(UI.mode==='dev'){ rows.push(['#1e2c38','개발도 1 (미개발)'],['#8a7a56','5'],['#ffd98a','10 (공업 중심지)']); }
  else if(UI.mode==='unrest'){ rows.push(['#1b3325','평온'],['#8a3a30','동요'],['#d13b3b','봉기 직전']); }
  else if(UI.mode==='army'){ rows.push(['#23384d','병력 없음'],['#6fd0ff','대군 주둔']); }
  else if(UI.mode==='rel'){ rows.push(['#e5c65a','우리 영토'],['#3f8f5f','동맹'],['#4f9e6f','우호'],['#9e4f4f','적대'],['#a8262c','교전 중']); }
  else if(UI.mode==='res'){ for(const k in RESCOL) if(k!=='-') rows.push([RESCOL[k], RESOURCE[k].n]); }
  let html = rows.map(([c,t])=>`<div class="lg"><i style="background:${c}"></i>${esc(t)}</div>`).join('');
  html += `<div class="lgsep"></div>
    <div class="lg"><b style="color:var(--gold2)">■ 사각 마커 = 부대</b></div>
    <div class="lg tiny" style="color:var(--dim)">├ 육지: 숫자 = <b>사단 수</b></div>
    <div class="lg tiny" style="color:var(--dim)">└ 바다: 숫자 = <b>함선 수</b></div>
    <div class="lgsep"></div>
    <div class="lg"><i style="background:#d98c33"></i>공장 (개발도 3/6/9)</div>
    <div class="lg"><i style="background:#9aa7b4"></i>요새</div>
    <div class="lg"><i style="background:#8d99a5"></i>철도</div>
    <div class="lg"><i style="background:#e5c65a"></i>공사 중 · 완공</div>
    <div class="lgsep"></div>
    <div class="lg tiny" style="color:var(--dim)"><b>드래그</b> 부대 선택 · <b>우클릭</b> 명령</div>
    <div class="lg tiny" style="color:var(--dim)"><b>우클릭 끌기</b> 지도 이동</div>`;
  const folded = UI.legendFolded ? ' folded' : '';
  L.className = folded.trim();
  L.innerHTML = `<button class="lgtoggle">범례 ${UI.legendFolded?'▸':'▾'}</button><div class="lgbody">${html}</div>`;
  const tg=L.querySelector('.lgtoggle');
  if(tg) tg.addEventListener('click',()=>{ UI.legendFolded=!UI.legendFolded; renderLegend(); });
}

/* ---------- 팬 / 줌 ---------- */
function applyView(){
  const v=UI.view;
  $('#map').setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  paintMarkers();
}
function zoomAt(factor, cx, cy){
  const v=UI.view;
  const nw=Math.max(MAP_VIEW.w*0.06, Math.min(MAP_VIEW.w, v.w/factor));
  const nh=nw*(MAP_VIEW.h/MAP_VIEW.w)*(v.h/v.w)/(MAP_VIEW.h/MAP_VIEW.w);
  const ratio=nw/v.w;
  v.x = cx - (cx-v.x)*ratio; v.y = cy - (cy-v.y)*ratio;
  v.w = nw; v.h = v.h*ratio;
  clampView(); applyView();
}
function clampView(){
  const v=UI.view;
  v.x=Math.max(-200, Math.min(MAP_VIEW.w-v.w+200, v.x));
  v.y=Math.max(-150, Math.min(MAP_VIEW.h-v.h+150, v.y));
}
function focusProv(id, zoom){
  const [cx,cy]=provCentre(id);
  const v=UI.view;
  if(zoom){ v.w=MAP_VIEW.w/3.2; v.h=v.w*(UI.view.h/UI.view.w||0.49); v.h=v.w*0.49; }
  v.x=cx-v.w/2; v.y=cy-v.h/2; clampView(); applyView();
}

function setupMapInteraction(){
  const svg=$('#map');
  const wrap=$('#mapwrap');
  let pan=null, box=null;
  const boxEl=el('div',{id:'selbox'});
  wrap.appendChild(boxEl);

  svg.addEventListener('contextmenu', e=>e.preventDefault());

  const toMap = e => {
    const r=svg.getBoundingClientRect();
    const U=mapUnit();
    const cx=UI.view.x + UI.view.w/2, cy=UI.view.y + UI.view.h/2;
    return [ cx + (e.clientX - (r.left+r.width/2))*U,
             cy + (e.clientY - (r.top +r.height/2))*U ];
  };

  svg.addEventListener('mousedown', e=>{
    if(e.button===0){
      box={ sx:e.clientX, sy:e.clientY, moved:false, target:e.target };
    } else {                                  // 오른쪽·가운데 = 화면 이동
      pan={ x:e.clientX, y:e.clientY, vx:UI.view.x, vy:UI.view.y, moved:false, button:e.button, target:e.target };
      svg.classList.add('dragging');
    }
    e.preventDefault();
  });

  window.addEventListener('mousemove', e=>{
    if(pan){
      const U=mapUnit();
      const dx=(e.clientX-pan.x)*U, dy=(e.clientY-pan.y)*U;
      if(Math.abs(dx)>3*U||Math.abs(dy)>3*U) pan.moved=true;
      UI.view.x=pan.vx-dx; UI.view.y=pan.vy-dy; clampView(); applyView();
      return;
    }
    if(box){
      const dx=Math.abs(e.clientX-box.sx), dy=Math.abs(e.clientY-box.sy);
      if(dx>4||dy>4) box.moved=true;
      if(box.moved){
        const r=wrap.getBoundingClientRect();
        const x=Math.min(box.sx,e.clientX)-r.left, y=Math.min(box.sy,e.clientY)-r.top;
        boxEl.style.display='block';
        boxEl.style.left=x+'px'; boxEl.style.top=y+'px';
        boxEl.style.width=dx+'px'; boxEl.style.height=dy+'px';
      }
    }
  });

  window.addEventListener('mouseup', e=>{
    if(pan){
      const wasPan=pan; pan=null; svg.classList.remove('dragging');
      if(!wasPan.moved && wasPan.button===2) rightClickAt(e);     // 끌지 않았으면 명령
      return;
    }
    if(!box) return;
    const wasBox=box; box=null; boxEl.style.display='none';
    if(wasBox.moved){ selectInBox(wasBox.sx, wasBox.sy, e.clientX, e.clientY, e.shiftKey); return; }
    leftClickAt(e);
  });

  svg.addEventListener('wheel', e=>{
    e.preventDefault();
    const r=svg.getBoundingClientRect();
    const U=mapUnit();
    const cx=UI.view.x+UI.view.w/2 + (e.clientX-(r.left+r.width/2))*U;
    const cy=UI.view.y+UI.view.h/2 + (e.clientY-(r.top+r.height/2))*U;
    zoomAt(e.deltaY<0?1.25:0.8, cx, cy);
  },{passive:false});

  svg.addEventListener('mousemove', e=>{
    const tip=$('#tip');
    const cnt=e.target.closest('[data-army],[data-fleet]');
    if(cnt){
      const aid=cnt.getAttribute('data-army'), zid=cnt.getAttribute('data-fleet');
      tip.innerHTML = aid ? armyTipHTML(aid) : fleetTipHTML(zid);
      showTip(tip,e); return;
    }
    const sea=e.target.closest('circle.seahit');
    if(sea){ tip.innerHTML=fleetTipHTML(sea.getAttribute('data-zone')); showTip(tip,e); return; }
    const t=e.target.closest('path.prov');
    if(!t){ tip.style.display='none'; return; }
    const p=G.provs[t.getAttribute('data-id')]; if(!p){ tip.style.display='none'; return; }
    tip.innerHTML=tipHTML(p); showTip(tip,e);
  });
  svg.addEventListener('mouseleave', ()=>{ $('#tip').style.display='none'; });
}
function showTip(tip,e){
  tip.style.display='block';
  const w=tip.offsetWidth, h=tip.offsetHeight;
  tip.style.left=Math.min(window.innerWidth-w-10, e.clientX+16)+'px';
  tip.style.top=Math.max(8, e.clientY-h-12)+'px';
}

/* ---------- 좌클릭: 선택 ---------- */
function leftClickAt(e){
  const me=G.nats[G.player];
  UI.selArmies=UI.selArmies||new Set(); UI.selFleets=UI.selFleets||new Set();
  const cnt=e.target.closest('[data-army],[data-fleet]');
  if(cnt){
    const aid=cnt.getAttribute('data-army'), zid=cnt.getAttribute('data-fleet');
    if(aid && me.armies[aid]>=0.5){
      if(!e.shiftKey){ UI.selArmies.clear(); UI.selFleets.clear(); }
      UI.selArmies.has(aid) ? UI.selArmies.delete(aid) : UI.selArmies.add(aid);
      UI.sel=aid; UI.tab='prov'; syncTabs(); refreshAll(); return;
    }
    if(zid && (me.fleets||{})[zid]>=0.5){
      if(!e.shiftKey){ UI.selArmies.clear(); UI.selFleets.clear(); }
      UI.selFleets.has(zid) ? UI.selFleets.delete(zid) : UI.selFleets.add(zid);
      UI.seaSel=zid; UI.tab='sea'; syncTabs(); refreshAll(); return;
    }
  }
  const sea=e.target.closest('circle.seahit');
  if(sea){ onSeaClick(sea.getAttribute('data-zone')); return; }
  const t=e.target.closest('path.prov');
  if(t){
    if(!e.shiftKey){ UI.selArmies.clear(); UI.selFleets.clear(); }
    onProvClick(t.getAttribute('data-id'));
  }
}

/* ---------- 드래그 상자 선택 ---------- */
function selectInBox(x1,y1,x2,y2, add){
  const svg=$('#map'), r=svg.getBoundingClientRect(), U=mapUnit();
  const toMapPt=(cx,cy)=>[ UI.view.x+UI.view.w/2 + (cx-(r.left+r.width/2))*U,
                           UI.view.y+UI.view.h/2 + (cy-(r.top+r.height/2))*U ];
  const a=toMapPt(Math.min(x1,x2), Math.min(y1,y2));
  const b=toMapPt(Math.max(x1,x2), Math.max(y1,y2));
  const me=G.nats[G.player];
  UI.selArmies=UI.selArmies||new Set(); UI.selFleets=UI.selFleets||new Set();
  if(!add){ UI.selArmies.clear(); UI.selFleets.clear(); }
  let na=0, nf=0;
  for(const id in me.armies){
    if(me.armies[id]<0.5 || !RAWMAP[id]) continue;
    const c=provCentre(id);
    if(c[0]>=a[0]&&c[0]<=b[0]&&c[1]>=a[1]&&c[1]<=b[1]){ UI.selArmies.add(id); na++; }
  }
  for(const z in (me.fleets||{})){
    if(me.fleets[z]<0.5 || !SEA_ZONES[z]) continue;
    const Z=SEA_ZONES[z];
    if(Z.x>=a[0]&&Z.x<=b[0]&&Z.y>=a[1]&&Z.y<=b[1]){ UI.selFleets.add(z); nf++; }
  }
  const tot=[...UI.selArmies].reduce((s,i)=>s+me.armies[i],0);
  if(na||nf) toast(`${na?`육군 ${na}개 부대 (${Math.round(tot)}개 사단)`:''}${na&&nf?' · ':''}${nf?`함대 ${nf}곳`:''} 선택`, true);
  else toast('선택된 부대가 없다', false);
  refreshAll();
}

/* ---------- 우클릭: 명령 ---------- */
function rightClickAt(e){
  const me=G.nats[G.player];
  UI.selArmies=UI.selArmies||new Set(); UI.selFleets=UI.selFleets||new Set();
  if(!UI.selArmies.size && !UI.selFleets.size){
    toast('먼저 부대를 선택하세요 — 마커를 클릭하거나 지도를 드래그', false); return;
  }
  const sea=e.target.closest('circle.seahit,[data-fleet]');
  if(sea && UI.selFleets.size){
    const z=sea.getAttribute('data-zone')||sea.getAttribute('data-fleet');
    orderFleets(z); return;
  }
  const t=e.target.closest('path.prov');
  if(t && UI.selArmies.size){ orderArmies(t.getAttribute('data-id')); return; }
  if(sea) toast('함대를 선택해야 해역으로 보낼 수 있다', false);
  else toast('육군을 선택해야 육지로 보낼 수 있다', false);
}

function orderArmies(target){
  const me=G.nats[G.player];
  const q=G.provs[target];
  let moved=0, marched=0, fought=0, lastReport=null, err=null;
  for(const from of [...UI.selArmies]){
    if(!(me.armies[from]>=1) || from===target) continue;
    const divs=me.armies[from];
    const adjacent=neighbours(from).includes(target);
    // 붙어 있지 않아도, 두 지역이 바다에 면해 있고 전쟁 중이면 상륙을 시도한다
    const overseas = !adjacent && q.coast && G.provs[from].coast && atWarWith(G.player,q.ctrl);
    if(adjacent || overseas){
      let r;
      if(q.ctrl!==G.player && atWarWith(G.player,q.ctrl)) { r=attack(G.player, from, target, divs); if(r.report){ lastReport=r.report; fought++; } else if(r.ok===false) err=r.msg; }
      else if(adjacent) { r=moveArmy(G.player, from, target, divs); if(r.ok) moved++; else err=r.msg; }
      else { err='그 지역과는 전쟁 중이 아니다'; }
    } else {
      const r=setMarchOrder(G.player, from, target, divs);
      if(r.ok) marched++; else err=r.msg;
    }
  }
  UI.selArmies.clear();
  const parts=[];
  if(fought) parts.push(`${G.provs[target].name} 공격 ${fought}회`);
  if(moved) parts.push(`${moved}개 부대 이동`);
  if(marched) parts.push(`${marched}개 부대 진군 명령`);
  toast(parts.length? parts.join(' · ') : (err||'명령을 수행할 수 없다'), parts.length>0);
  if(lastReport) showBattle(lastReport);
  refreshAll();
}
function orderFleets(zone){
  const me=G.nats[G.player];
  let moved=0, sailed=0, err=null;
  for(const from of [...UI.selFleets]){
    if(!((me.fleets||{})[from]>=1) || from===zone) continue;
    const ships=me.fleets[from];
    if(zoneAdj(from).includes(zone)){
      const r=fleetMove(G.player, from, zone, ships);
      if(r.ok) moved++; else err=r.msg;
    } else {
      const r=setFleetOrder(G.player, from, zone, ships);
      if(r.ok) sailed++; else err=r.msg;
    }
  }
  UI.selFleets.clear();
  const parts=[];
  if(moved) parts.push(`${moved}개 함대 ${SEA_ZONES[zone].n}(으)로 이동`);
  if(sailed) parts.push(`${sailed}개 함대 항해 명령`);
  toast(parts.length? parts.join(' · ') : (err||'명령을 수행할 수 없다'), parts.length>0);
  refreshAll();
}

function armyTipHTML(id){
  const p=G.provs[id];
  let s=`<b>${esc(p.name)} 주둔군</b><div class="tl">숫자 = 사단 수</div>`;
  for(const c in G.nats){ const v=G.nats[c].armies[id]; if(v>=0.5)
    s+=`<div><i class="dotc" style="background:${G.nats[c].color}"></i>${esc(G.nats[c].adj)} <b>${Math.round(v)}</b>개 사단</div>`; }
  const me=G.nats[G.player];
  if(me.armies[id]>=0.5){
    s+=`<div class="tl" style="margin-top:4px">보급 ×${supplyAt(me,id).toFixed(2)}</div>`;
    s+=`<div class="tl">좌클릭 선택 · 우클릭으로 목표 지정</div>`;
  }
  return s;
}
function fleetTipHTML(z){
  const Z=SEA_ZONES[z]; if(!Z) return '';
  const f=fleetsIn(z);
  let s=`<b>${esc(Z.n)}</b><div class="tl">해역 · 숫자 = 함선 수</div>`;
  s+= f.length? f.map(([c,v])=>`<div><i class="dotc" style="background:${G.nats[c].color}"></i>${esc(G.nats[c].adj)} <b>${Math.round(v)}</b>척</div>`).join('')
              : `<div class="tl">함대 없음</div>`;
  s+=`<div class="tl" style="margin-top:4px">접한 해안 ${Z.coasts.length}곳</div>`;
  return s;
}

function tipHTML(p){
  const own=G.nats[p.own], ctl=G.nats[p.ctrl];
  let s=`<b>${esc(p.name)}</b><div class="tl">${own?esc(own.name):'무주지'}`;
  if(p.own!==p.ctrl && ctl) s+= ` <span style="color:#e08a8a">— ${esc(ctl.adj)}군 점령</span>`;
  s+=`</div><div class="tl">${TERRAIN[p.ter].n} · ${RESOURCE[p.res].n}${p.colonial?' · 식민지':''}</div>`;
  s+=`<div style="margin-top:4px">인구 ${fmt(p.pop)}만 · 개발 ${p.dev} · 요새 ${p.fort}`;
  if(p.unrest>8) s+=` · <span style="color:#e08a8a">불만 ${Math.round(p.unrest)}</span>`;
  s+=`</div>`;
  let arm=[];
  for(const c in G.nats){ const v=G.nats[c].armies[p.id]; if(v>=0.5) arm.push(`${G.nats[c].adj} ${Math.round(v)}`); }
  if(arm.length) s+=`<div class="tl" style="margin-top:3px">주둔: ${esc(arm.join(' / '))}</div>`;
  return s;
}

function onSeaClick(zone){
  const me=G.nats[G.player];
  if(UI.seaSel && UI.seaSel!==zone && me.fleets && me.fleets[UI.seaSel] && zoneAdj(UI.seaSel).includes(zone)){
    const r=fleetMove(G.player, UI.seaSel, zone, UI.fleetDivs || me.fleets[UI.seaSel]);
    toast(r.msg, r.ok);
    if(r.ok) UI.seaSel=zone;
    refreshAll(); return;
  }
  UI.seaSel = (UI.seaSel===zone) ? null : zone;
  UI.sel=null; UI.order=null; UI.tab='sea'; syncTabs(); refreshAll();
}

function onProvClick(id){
  UI.seaSel=null;
  if(UI.order && UI.order.from && UI.order.from!==id){
    if(neighbours(UI.order.from).includes(id)){ execOrder(id); return; }
    // 멀리 있는 곳은 진군 명령
    const r=setMarchOrder(G.player, UI.order.from, id, UI.order.divs);
    toast(r.msg, r.ok);
    if(r.ok){ UI.order=null; UI.sel=id; }
    refreshAll(); return;
  }
  UI.sel=id; UI.order=null; UI.tab='prov';
  syncTabs(); paintMap(); renderPanel();
}
function execOrder(to){
  const from=UI.order.from, n=G.nats[G.player];
  const divs=UI.order.divs || n.armies[from] || 0;
  const q=G.provs[to];
  let r;
  if(atWarWith(G.player, q.ctrl) && q.ctrl!==G.player) r=attack(G.player, from, to, divs);
  else r=moveArmy(G.player, from, to, divs);
  toast(r.msg || (r.report? `${r.report.to} 전투 — ${r.report.result}` : ''), r.ok!==false);
  if(r.report) showBattle(r.report);
  UI.order=null; UI.sel=to;
  refreshAll();
}

/* ---------- 상단 바 ---------- */
function renderTop(){
  const n=G.nats[G.player];
  $('#tFlag').style.background=n.color;
  $('#natname').textContent=n.name;
  $('#natgov').textContent=GOVS[n.gov].name;
  $('#date').textContent=`${G.year}년 ${MONTHS[G.month]}`;
  const bal=(n.income||0)-(n.expense||0);
  $('#sGold').textContent=fmt(n.gold);
  const b=$('#sBal'); b.textContent=(bal>=0?'+':'')+fmt(bal,1); b.className='sub '+(bal>=0?'up':'down');
  $('#sMan').textContent=fmt(freeManpower(n))+'만';
  $('#sArmy').textContent=`${fmt(armyTotal(n))} / ${fmt(n.navy)}`;
  $('#sPP').textContent=fmt(n.pp);
  const st=$('#sStab'); st.textContent=fmt(n.stab); st.className=n.stab<40?'down':(n.stab>65?'up':'');
  $('#sPres').textContent=fmt(n.pres);
  const ex=$('#sExh'); ex.textContent=fmt(n.exh); ex.className=n.exh>35?'down':'';
  $('#sRank').textContent=n.rank+'위';
  let badge=$('#cheatBadge');
  if(G.cheat && G.cheat.used){
    if(!badge){ badge=el('span',{id:'cheatBadge'}); badge.textContent='치트'; $('#natgov').after(badge); }
    badge.title = G.cheat.godMode? '무적 모드 작동 중' : '이 게임에는 치트가 사용되었다';
    badge.classList.toggle('god', !!G.cheat.godMode);
  } else if(badge) badge.remove();
}

/* ---------- 로그 ---------- */
function renderLog(){
  const box=$('#logbox');
  box.innerHTML=G.log.slice(0,60).map(l=>
    `<div class="lg1 ${l.kind}"><span class="lgd">${l.y}.${l.m+1}</span>`+
    `<span><span class="lgt">${esc(l.title)}</span> <span class="muted">${esc(l.text)}</span></span></div>`).join('');
}

function toast(msg, ok){
  if(!msg) return;
  let t=$('#toast');
  if(!t){ t=el('div',{id:'toast'}); document.body.appendChild(t);
    t.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:26px;z-index:300;padding:10px 18px;border-radius:6px;font-size:13px;box-shadow:0 8px 24px #000a;transition:opacity .3s'; }
  const bar=$('#selbar');
  t.style.bottom = (bar && bar.style.display==='flex') ? '96px' : '26px';
  t.textContent=msg;
  t.style.background = ok===false ? '#5a2328' : '#1f3a2b';
  t.style.border = '1px solid '+(ok===false ? '#a8464e' : '#3f7d57');
  t.style.color = ok===false ? '#ffc9c9' : '#c9f0d8';
  t.style.opacity='1';
  clearTimeout(t._h); t._h=setTimeout(()=>{ t.style.opacity='0'; }, 2600);
}

/* ---------- 모달 ---------- */
function modal(html, opts){
  const host=$('#modalHost');
  const ovl=el('div',{class:'ovl'});
  ovl.innerHTML=`<div class="modal">${html}</div>`;
  host.appendChild(ovl);
  if(!opts||!opts.sticky) ovl.addEventListener('click',e=>{ if(e.target===ovl) ovl.remove(); });
  return ovl;
}
function closeModals(){ $('#modalHost').innerHTML=''; }

function showBattle(r){
  if(!r) return;
  const col=r.result==='승리'?'#8fd8a2':(r.result==='격퇴'?'#e08a8a':'#d9c08f');
  modal(`<div class="mh"><h2>${esc(r.to)} 전투</h2><div class="ms">${G.year}년 ${MONTHS[G.month]}${r.naval?' · 상륙작전':''}${r.general?' · 지휘 '+esc(r.general):''}</div></div>
  <div class="mb">
    <div style="font-size:22px;color:${col};text-align:center;margin-bottom:12px">${r.result}</div>
    <table class="t"><tr><th></th><th class="num">투입</th><th class="num">손실</th></tr>
    <tr><td>${esc(r.attacker)} (공격)</td><td class="num">${fmt(r.divs)}</td><td class="num" style="color:#e08a8a">-${r.lossA}</td></tr>
    <tr><td>${esc(r.defender)} (방어)</td><td class="num">${fmt(r.defDivs,1)}</td><td class="num" style="color:#e08a8a">-${r.lossD}</td></tr></table>
    <div class="tiny" style="margin-top:10px">전력비 ${r.ratio} — ${r.result==='승리'?'적 전선이 붕괴했다. 우리 군이 진주한다.':r.result==='격퇴'?'적의 방어선을 뚫지 못했다.':'양측 모두 물러서지 않았다.'}</div>
  </div><div class="mc"><button class="btn gold" style="width:100%" onclick="closeModals()">확인</button></div>`);
}

/* ============================================================
   사이드 패널
   ============================================================ */
function syncTabs(){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t.dataset.t===UI.tab));
}
function renderPanel(){
  const P=$('#panel');
  P.innerHTML = ({
    nation:panelNation, prov:panelProv, tech:panelTech,
    mil:panelMil, sea:panelSea, cab:panelCabinet,
    dip:panelDip, pol:panelPol, rank:panelRank,
  }[UI.tab]||panelNation)();
  P.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>handleAct(b.dataset)));
}
function bar(v,max,col){ const w=Math.max(0,Math.min(100,v/max*100)); return `<div class="bar"><i style="width:${w}%;background:${col}"></i></div>`; }

/* ---------- 국가 ---------- */
function panelNation(){
  const n=G.nats[G.player];
  const provs=ownedProvs(G.player);
  const pop=provs.reduce((s,p)=>s+p.pop,0);
  const col=provs.filter(p=>p.colonial).length;
  const bal=(n.income||0)-(n.expense||0);
  const wars=warsOf(G.player);
  let h=`<div class="sec"><h3>국세</h3>
    <div class="row"><span class="k">영토</span><span class="v">${provs.length}개 (식민지 ${col})</span></div>
    <div class="row"><span class="k">인구</span><span class="v">${fmt(pop)}만</span></div>
    <div class="row"><span class="k">월 수입</span><span class="v up">+${fmt(n.income,1)}</span></div>
    <div class="row"><span class="k">월 지출</span><span class="v down">-${fmt(n.expense,1)}</span></div>
    <div class="row"><span class="k">수지</span><span class="v ${bal>=0?'up':'down'}">${bal>=0?'+':''}${fmt(bal,1)}</span></div>
    <div class="row"><span class="k">국채</span><span class="v">${n.debt>0?'£'+fmt(n.debt):'없음'}</span></div>
    <div class="row"><span class="k">연구력</span><span class="v">${fmt(n.rp||researchPoints(n),1)} / 월</span></div>
    </div>`;
  h+=`<div class="sec"><h3>내정</h3>
    <div class="row"><span class="k">안정도</span><span class="v">${fmt(n.stab)}</span></div>${bar(n.stab,100,n.stab<40?'#d15c5c':'#5fb87a')}
    <div class="row" style="margin-top:6px"><span class="k">정통성</span><span class="v">${fmt(n.legit)}</span></div>${bar(n.legit,100,'#c9a227')}
    <div class="row" style="margin-top:6px"><span class="k">전쟁 피로</span><span class="v">${fmt(n.exh)}</span></div>${bar(n.exh,100,'#d9a441')}
    <div class="row" style="margin-top:6px"><span class="k">동원 인력</span><span class="v">${fmt(freeManpower(n))} / ${fmt(effectiveManpower(n))}만</span></div>
    ${n.casualties>2?`<div class="tiny">전상자로 ${Math.round(n.casualties)}%의 인력이 회복 중이다</div>`:''}
    </div>`;
  if(wars.length){
    h+=`<div class="sec"><h3>전쟁</h3>`;
    for(const w of wars){
      const mine=sideOf(w,G.player), sc=mine==='att'?w.score:-w.score;
      const foes=(mine==='att'?w.def:w.att).map(c=>G.nats[c].adj).join(', ');
      h+=`<div class="card"><h4>${esc(foes)} 전선 <span class="tiny">${w.start.y}년~</span></h4>
        <div class="row"><span class="k">전쟁 점수</span><span class="v ${sc>=0?'up':'down'}">${sc>=0?'+':''}${fmt(sc)}</span></div>
        ${bar(sc+100,200,sc>=0?'#5fb87a':'#d15c5c')}
        <div class="btnrow"><button class="btn sm" data-act="peace" data-war="${w.id}">강화 협상</button></div></div>`;
    }
    h+=`</div>`;
  }
  const bld=n.building.concat(n.recruiting.map(r=>({...r,type:r.kind==='navy'?'__navy':'__army'})));
  if(bld.length){
    h+=`<div class="sec"><h3>진행 중</h3>`;
    for(const b of bld){
      const nm = b.type==='__navy'?`주력함 ${b.count}척`:b.type==='__army'?`${b.count}개 사단 모병`:`${G.provs[b.prov].name} — ${BUILDINGS[b.type].n}`;
      h+=`<div class="row"><span class="k">${esc(nm)}</span><span class="v">${b.left}개월</span></div>`;
    }
    h+=`</div>`;
  }
  h+=`<div class="sec"><h3>재정 운용</h3>
    <div class="row"><span class="k">세율</span><span class="v">${Math.round(n.taxRate*100)}%</span></div>
    <input type="range" min="60" max="140" value="${Math.round(n.taxRate*100)}" style="width:100%" id="taxR">
    <div class="tiny">세율이 높을수록 수입이 늘지만 불만이 커진다.</div>
    <div class="btnrow">
      <button class="btn sm" data-act="loan">국채 £100 발행</button>
      <button class="btn sm" data-act="repay">부채 상환</button>
    </div></div>
    <div class="sec"><h3>기록</h3><div class="btnrow">
      <button class="btn sm" data-act="save">저장</button>
      <button class="btn sm" data-act="load">불러오기</button>
      <button class="btn sm" data-act="help">명령어 도움말</button>
    </div><div class="tiny" style="margin-top:5px">저장은 이 브라우저에 보관된다.</div></div>`;
  setTimeout(()=>{ const r=$('#taxR'); if(r) r.addEventListener('change',()=>{
    G.nats[G.player].taxRate=r.value/100; refreshAll(); }); },0);
  return h;
}

/* ---------- 지역 ---------- */
function panelProv(){
  if(!UI.sel) return `<div class="muted" style="padding:20px 0;text-align:center">지도에서 지역을 선택하세요.</div>`;
  const p=G.provs[UI.sel], own=G.nats[p.own], ctl=G.nats[p.ctrl];
  const me=G.nats[G.player];
  const mine=p.own===G.player, hold=p.ctrl===G.player;
  let h=`<div class="sec"><h3>${esc(p.name)}</h3>
    <div class="row"><span class="k">소유</span><span class="v"><i class="dotc" style="background:${own?own.color:'#555'}"></i>${own?esc(own.name):'무주지'}</span></div>`;
  if(p.own!==p.ctrl) h+=`<div class="row"><span class="k">실효 지배</span><span class="v down">${ctl?esc(ctl.name):'—'}</span></div>`;
  h+=`<div class="row"><span class="k">인구</span><span class="v">${fmt(p.pop)}만</span></div>
    <div class="row"><span class="k">개발도</span><span class="v">${p.dev} / 10</span></div>${bar(p.dev,10,'#d98c33')}
    <div class="row" style="margin-top:6px"><span class="k">요새</span><span class="v">${p.fort} / 5</span></div>
    <div class="row"><span class="k">철도</span><span class="v">${p.rail} / 3</span></div>
    <div class="row"><span class="k">지형 / 자원</span><span class="v">${TERRAIN[p.ter].n} · ${RESOURCE[p.res].n}</span></div>
    <div class="row"><span class="k">불만</span><span class="v ${p.unrest>40?'down':''}">${fmt(p.unrest)}</span></div>${bar(p.unrest,100,'#d15c5c')}
    ${p.colonial?'<div class="tiny" style="margin-top:5px">식민지 — 세수·인력 효율이 낮다</div>':''}
    ${p.cores.length?`<div class="tiny">핵심주 주장: ${p.cores.map(c=>G.nats[c]?G.nats[c].adj:c).join(', ')}</div>`:''}
    </div>`;
  // 주둔군
  const garr=[];
  for(const c in G.nats){ const v=G.nats[c].armies[p.id]; if(v>=0.5) garr.push([c,v]); }
  h+=`<div class="sec"><h3>주둔</h3>`;
  h+= garr.length? garr.map(([c,v])=>`<div class="row"><span class="k"><i class="dotc" style="background:${G.nats[c].color}"></i>${esc(G.nats[c].adj)}</span><span class="v">${fmt(v,1)}개 사단</span></div>`).join('')
    : `<div class="muted">주둔 병력 없음</div>`;
  h+=`</div>`;

  if(mine && hold){
    h+=`<div class="sec"><h3>건설</h3>`;
    for(const k in BUILDINGS){
      const B=BUILDINGS[k];
      const busy=me.building.some(b=>b.prov===p.id&&b.type===k);
      const maxed=B.max(p);
      const cost=Math.round(B.cost(p)*me._m.bld);
      h+=`<div class="card"><h4>${B.n}<span class="tc" style="color:var(--gold2)">£${fmt(cost)} · ${B.t}개월</span></h4>
        <div class="tiny">${B.d}</div>
        <div class="btnrow"><button class="btn sm" data-act="build" data-type="${k}" ${busy||maxed||me.gold<cost?'disabled':''}>
          ${maxed?'최대':busy?'공사 중':'착공'}</button></div></div>`;
    }
    h+=`</div><div class="sec"><h3>모병</h3>
      <div class="row"><span class="k">사단당</span><span class="v">£${DIV_COST} · 인력 ${DIV_MAN}만 · ${DIV_TIME}개월</span></div>
      <div class="btnrow">
        <button class="btn sm" data-act="recruit" data-n="1">1개</button>
        <button class="btn sm" data-act="recruit" data-n="3">3개</button>
        <button class="btn sm" data-act="recruit" data-n="5">5개</button>
        <button class="btn sm" data-act="recruit" data-n="10">10개</button>
      </div></div>`;
  }
  const myArmy=me.armies[p.id]||0;
  if(myArmy>=1){
    const sel = UI.order && UI.order.from===p.id;
    const divs = sel ? UI.order.divs : Math.round(myArmy);
    const order = me.orders && me.orders[p.id];
    h+=`<div class="sec"><h3>부대 지휘</h3>
      <div class="row"><span class="k">주둔 병력</span><span class="v">${fmt(myArmy,1)}개 사단</span></div>
      ${(()=>{ const g=typeof generalAt==='function'?generalAt(me,p.id):null;
        if(!g) return `<div class="row"><span class="k">지휘관</span><span class="v" style="color:#d9a441">없음</span></div>`;
        const bn=generalBonus(me,p.id);
        return `<div class="row"><span class="k">지휘관</span><span class="v">${esc(g.name)} (지휘 ${g.skill})</span></div>
          <div class="tiny">공격 ${bn.atk>=0?'+':''}${Math.round(bn.atk*100)}% · 방어 ${bn.def>=0?'+':''}${Math.round(bn.def*100)}% · 손실 ${Math.round(bn.loss*100)}%</div>`;
      })()}
      <div class="row"><span class="k">보낼 병력</span><span class="v" id="divLbl">${fmt(divs)}개</span></div>
      <input type="range" id="divR" min="1" max="${Math.floor(myArmy)}" value="${Math.min(divs,Math.floor(myArmy))}" style="width:100%">
      <div class="btnrow">
        <button class="btn sm" data-act="setdiv" data-v="1">1</button>
        <button class="btn sm" data-act="setdiv" data-v="half">절반</button>
        <button class="btn sm" data-act="setdiv" data-v="all">전군</button>
      </div>
      <div class="btnrow">
        <button class="btn ${sel?'red':'gold'}" data-act="order" style="flex:1">
          ${sel?'지휘 취소':'부대 지휘 시작'}</button>
      </div>
      ${sel?`<div class="tiny" style="margin-top:6px;color:var(--gold2)">
          지도에서 목표를 클릭하세요.<br>
          · <b>인접 지역</b> — 즉시 이동(초록) 또는 공격(빨강)<br>
          · <b>먼 지역</b> — 진군 명령, 매달 한 칸씩 스스로 전진하며 적을 만나면 교전</div>`:''}
      ${order?`<div class="card" style="margin-top:8px;border-color:var(--gold)">
          <h4>진군 중 <button class="btn sm red" data-act="cancelmarch" data-id="${p.id}">중지</button></h4>
          <div class="tiny">목표: ${esc(G.provs[order.to].name)} · ${fmt(order.divs)}개 사단</div></div>`:''}
      </div>`;
    setTimeout(()=>{ const r=$('#divR'); if(r){ r.addEventListener('input',()=>{
      $('#divLbl').textContent=fmt(r.value)+'개';
      UI.order = UI.order || {from:p.id}; UI.order.from=p.id; UI.order.divs=+r.value; }); } },0);
  }
  if(!mine && own && own.code!==G.player){
    h+=`<div class="sec"><h3>대외</h3><div class="btnrow">
      <button class="btn sm" data-act="godip" data-c="${own.code}">${esc(own.adj)} 외교</button>
      ${atWarWith(G.player,own.code)?'':`<button class="btn sm red" data-act="warmodal" data-c="${own.code}">선전포고</button>`}
      </div></div>`;
  }
  return h;
}

/* ---------- 기술 ---------- */
function panelTech(){
  const n=G.nats[G.player];
  const b=UI.techBranch||'ind';
  let h=`<div class="treebar">`;
  for(const k in BRANCH) h+=`<button data-act="branch" data-b="${k}" class="${k===b?'on':''}" style="${k===b?'background:'+BRANCH[k].c+';border-color:'+BRANCH[k].c:''}">${BRANCH[k].n}</button>`;
  h+=`</div>`;
  h+=`<div class="sec"><div class="row"><span class="k">월 연구력</span><span class="v">${fmt(researchPoints(n),1)}</span></div>
    <div class="row"><span class="k">배분</span><span class="v">산업 ${n.alloc.ind}% · 정치 ${n.alloc.pol}% · 군사 ${n.alloc.mil}%</span></div>
    <input type="range" id="allocR" min="0" max="100" value="${n.alloc[b]}" style="width:100%">
    <div class="tiny">이 분야에 배분할 비율. 나머지는 다른 두 분야가 나눠 갖는다.</div></div>`;
  const cur=n.research[b];
  if(cur){
    const t=TECHS[cur], pr=n.progress[b]||0, cost=techCost(t);
    h+=`<div class="card" style="border-color:var(--gold)"><h4>연구 중: ${t.n}<span class="tc">${fmt(pr)} / ${cost}<br><span class="tiny">${Math.ceil((cost-pr)/Math.max(0.1,researchPoints(n)*n.alloc[b]/100))}개월 남음</span></span></h4>
      ${bar(pr,cost,BRANCH[b].c)}<div class="tiny" style="margin-top:5px">${esc(t.d)}</div></div>`;
  }
  const tiers={};
  for(const id in TECHS){ const t=TECHS[id]; if(t.b!==b) continue; (tiers[t.t]=tiers[t.t]||[]).push(id); }
  for(const tier of Object.keys(tiers).sort((x,y)=>x-y)){
    h+=`<div class="tier"><div class="tl">${tier}단계</div>`;
    for(const id of tiers[tier]){
      const t=TECHS[id];
      const done=!!n.techs[id];
      const active=n.research[b]===id;
      const reqOk=!t.r||t.r.every(r=>n.techs[r]);
      const yearOk=G.year>=t.y;
      const locked=!done&&(!reqOk||!yearOk);
      const effs=Object.keys(t.eff).map(k=>{
        const map={ind:'산업',res:'연구',tax:'세수',man:'인력',atk:'공격',def:'방어',nav:'해군',sup:'보급',stab:'안정',pp:'정치력',col:'식민수입',bld:'건설비',grw:'성장',exh:'전쟁피로'};
        const v=t.eff[k];
        return `<span class="eff">${map[k]||k} ${(k==='stab'||k==='pp')?(v>0?'+':'')+v:(v>0?'+':'')+Math.round(v*100)+'%'}</span>`;
      }).join('');
      h+=`<div class="tech ${done?'done':''} ${active?'active':''} ${locked?'locked':''}">
        <div style="flex:1"><div class="tn">${done?'✔ ':''}${t.n}</div><div class="td">${esc(t.d)}</div><div class="effs">${effs}</div>
        ${locked?`<div class="tiny" style="color:#d9a441;margin-top:3px">${!yearOk?t.y+'년 이후':'선행: '+t.r.filter(r=>!n.techs[r]).map(r=>TECHS[r].n).join(', ')}</div>`:''}</div>
        <div style="text-align:right">
          <div class="tc">${done?'완료':fmt(techCost(t))}</div>
          ${(!done&&!locked&&!active)?`<button class="btn sm" data-act="research" data-id="${id}" style="margin-top:4px">연구</button>`:''}
        </div></div>`;
    }
    h+=`</div>`;
  }
  setTimeout(()=>{ const r=$('#allocR'); if(r) r.addEventListener('change',()=>{
    const v=+r.value, rest=100-v, others=['ind','pol','mil'].filter(x=>x!==b);
    const sum=n.alloc[others[0]]+n.alloc[others[1]]||1;
    n.alloc[b]=v; n.alloc[others[0]]=Math.round(rest*(n.alloc[others[0]]/sum));
    n.alloc[others[1]]=rest-n.alloc[others[0]]; renderPanel(); }); },0);
  return h;
}

/* ---------- 육군 ---------- */
function panelMil(){
  const n=G.nats[G.player];
  const stacks=Object.keys(n.armies).filter(id=>n.armies[id]>=0.5)
    .sort((a,b)=>n.armies[b]-n.armies[a]);
  let h=`<div class="sec"><h3>병력</h3>
    <div class="row"><span class="k">육군</span><span class="v">${fmt(armyTotal(n),1)}개 사단 · ${stacks.length}개 부대</span></div>
    <div class="row"><span class="k">동원 여력</span><span class="v">${fmt(freeManpower(n))}만 (${Math.floor(freeManpower(n)/DIV_MAN)}개 사단분)</span></div>
    <div class="row"><span class="k">공격력 / 방어력</span><span class="v">×${(n._m.atk).toFixed(2)} / ×${(n._m.def).toFixed(2)}</span></div>
    <div class="btnrow"><button class="btn sm red" data-act="disband">선택 지역 1개 사단 해산</button></div>
    </div>`;
  h+=`<div class="sec"><h3>부대 배치</h3>`;
  if(!stacks.length) h+=`<div class="muted">보유한 부대가 없다.</div>`;
  for(const id of stacks){
    const p=G.provs[id];
    const front = neighbours(id).some(x=>atWarWith(G.player,G.provs[x].ctrl));
    const order = n.orders && n.orders[id];
    const sel = UI.order && UI.order.from===id;
    h+=`<div class="card" style="${sel?'border-color:var(--gold)':''}">
      <h4>${esc(p.name)} ${front?'<span style="color:#e08a8a">⚔ 전선</span>':''}
        <span class="tc">${fmt(n.armies[id],1)}개 사단</span></h4>
      ${order?`<div class="tiny" style="color:var(--gold2)">→ ${esc(G.provs[order.to].name)}(으)로 진군 중</div>`:''}
      <div class="tiny">보급 ×${supplyAt(n,id).toFixed(2)} · ${TERRAIN[p.ter].n} · 요새 ${p.fort}</div>
      <div class="btnrow">
        <button class="btn sm" data-act="goprov" data-id="${id}">지도에서 보기</button>
        <button class="btn sm ${sel?'red':'gold'}" data-act="pickstack" data-id="${id}">${sel?'지휘 취소':'지휘'}</button>
        ${order?`<button class="btn sm red" data-act="cancelmarch" data-id="${id}">진군 중지</button>`:''}
      </div></div>`;
  }
  h+=`</div>`;

  /* 장군 */
  n.generals=n.generals||[]; n.genPool=n.genPool||[];
  h+=`<div class="sec"><h3>장군 <span class="tiny">${n.generals.length} / ${generalCap(n)}명</span></h3>
    <div class="tiny" style="margin-bottom:6px">부대에 배치하면 그 부대의 전투력과 손실이 달라진다. 정원은 육군 규모에 따라 늘어난다.</div>`;
  if(!n.generals.length) h+=`<div class="muted">등용한 장군이 없다.</div>`;
  for(const g of n.generals){
    h+=`<div class="card"><h4>${esc(g.name)}
        <span class="tc">지휘 ${g.skill} · ${g.age}세</span></h4>
      <div class="mtr">${g.traits.map(t=>`<span class="mtrait" title="${esc(GTRAITS[t].d)}">${GTRAITS[t].n}</span>`).join('')}
        <span class="tiny" style="margin-left:auto">${g.wins}승 ${g.losses}패</span></div>
      <div class="tiny">${g.loc? '배치: <b style="color:var(--gold2)">'+esc(G.provs[g.loc].name)+'</b>' : '<span style="color:#d9a441">대기 중 — 부대에 배치하세요</span>'}</div>
      <div class="btnrow">
        ${UI.sel && n.armies[UI.sel]>=1 ? `<button class="btn sm gold" data-act="assigngen" data-id="${g.id}" data-prov="${UI.sel}">${esc(G.provs[UI.sel].name)}에 배치</button>`:''}
        ${g.loc? `<button class="btn sm" data-act="assigngen" data-id="${g.id}" data-prov="">대기</button>`:''}
        <button class="btn sm red" data-act="firegen" data-id="${g.id}">예편</button>
      </div></div>`;
  }
  if(n.genPool.length){
    h+=`<h3 style="margin-top:10px">등용 후보</h3>`;
    for(const g of n.genPool.slice().sort((a,b)=>b.skill-a.skill)){
      h+=`<div class="card"><h4>${esc(g.name)}<span class="tc">지휘 ${g.skill} · ${g.age}세</span></h4>
        <div class="mtr">${g.traits.map(t=>`<span class="mtrait" title="${esc(GTRAITS[t].d)}">${GTRAITS[t].n}</span>`).join('')}</div>
        <div class="btnrow"><button class="btn sm" data-act="hiregen" data-id="${g.id}"
          ${n.pp<15||n.generals.length>=generalCap(n)?'disabled':''}>등용 (정치력 15)</button></div></div>`;
    }
  }
  h+=`</div>`;

  const wars=warsOf(G.player);
  if(wars.length){
    h+=`<div class="sec"><h3>전선</h3>`;
    for(const w of wars){
      const mine=sideOf(w,G.player);
      for(const f of (mine==='att'?w.def:w.att)){
        const fr=[];
        for(const id in G.provs){ const p=G.provs[id];
          if(p.ctrl!==f) continue;
          if(neighbours(id).some(x=>G.provs[x].ctrl===G.player)) fr.push(p); }
        if(fr.length) h+=`<div class="card"><h4>${esc(G.nats[f].adj)} 전선</h4>`+
          fr.slice(0,8).map(p=>{
            const d=G.nats[f].armies[p.id]||0;
            return `<div class="row"><span class="k">${esc(p.name)}</span><span class="v">적 ${fmt(d,1)}개 사단 · 요새 ${p.fort}</span></div>`;
          }).join('')+`</div>`;
      }
    }
    h+=`</div>`;
  }
  return h;
}

/* ---------- 해군 ---------- */
function panelSea(){
  const n=G.nats[G.player];
  n.fleets=n.fleets||{};
  const zones=Object.keys(n.fleets).filter(z=>n.fleets[z]>=0.5);
  let h=`<div class="sec"><h3>함대</h3>
    <div class="row"><span class="k">총 함선</span><span class="v">${fmt(n.navy)}척 / 조선 상한 ${fmt(maxNavy(n))}</span></div>
    <div class="row"><span class="k">해군력 보정</span><span class="v">×${n._m.nav.toFixed(2)}</span></div>
    <div class="btnrow">
      <button class="btn sm" data-act="ships" data-n="1">1척 건조 £${SHIP_COST}</button>
      <button class="btn sm" data-act="ships" data-n="3">3척</button>
      <button class="btn sm" data-act="ships" data-n="5">5척</button>
    </div>
    <div class="tiny" style="margin-top:5px">함선은 ${SHIP_TIME}개월 뒤 본토 해역에 배치된다.</div></div>`;

  if(UI.seaSel){
    const Z=SEA_ZONES[UI.seaSel];
    const here=fleetsIn(UI.seaSel);
    const mineHere=n.fleets[UI.seaSel]||0;
    h+=`<div class="sec"><h3>${esc(Z.n)}</h3>`;
    h+= here.length? here.map(([c,v])=>{
        const war=atWarWith(G.player,c);
        return `<div class="row"><span class="k"><i class="dotc" style="background:${G.nats[c].color}"></i>${esc(G.nats[c].adj)}${war?' <span class="down">교전</span>':''}</span><span class="v">${fmt(v)}척</span></div>`;
      }).join('') : `<div class="muted">함대 없음</div>`;
    const coastal=Z.coasts.map(c=>G.provs[c]).filter(Boolean);
    const blockable=coastal.filter(p=>atWarWith(G.player,p.own));
    if(blockable.length) h+=`<div class="tiny" style="margin-top:6px;color:#e08a8a">봉쇄 대상: ${blockable.map(p=>esc(p.name)).join(', ')}</div>`;
    h+=`<div class="tiny" style="margin-top:5px">접한 해안: ${coastal.slice(0,10).map(p=>esc(p.name)).join(', ')}${coastal.length>10?' 외':''}</div>`;
    if(mineHere>=1){
      h+=`<div class="row" style="margin-top:8px"><span class="k">보낼 함선</span><span class="v" id="fleetLbl">${fmt(UI.fleetDivs||mineHere)}척</span></div>
        <input type="range" id="fleetR" min="1" max="${Math.floor(mineHere)}" value="${Math.min(UI.fleetDivs||mineHere,Math.floor(mineHere))}" style="width:100%">
        <div class="tiny">아래 해역을 누르거나 지도에서 인접 해역을 클릭하면 이동한다. 한 해역은 한 달에 한 번만 움직일 수 있다.</div>
        <div class="btnrow">`;
      for(const z of zoneAdj(UI.seaSel)){
        h+=`<button class="btn sm" data-act="fleetmove" data-to="${z}">${esc(SEA_ZONES[z].n)} →</button>`;
      }
      h+=`</div>`;
      setTimeout(()=>{ const r=$('#fleetR'); if(r) r.addEventListener('input',()=>{
        $('#fleetLbl').textContent=fmt(r.value)+'척'; UI.fleetDivs=+r.value; }); },0);
    }
    h+=`<div class="btnrow"><button class="btn sm" data-act="seaback">← 전체 해역</button></div></div>`;
    return h;
  }

  h+=`<div class="sec"><h3>우리 함대 배치</h3>`;
  if(!zones.length) h+=`<div class="muted">바다에 나가 있는 함대가 없다.</div>`;
  for(const z of zones.sort((a,b)=>n.fleets[b]-n.fleets[a])){
    const here=fleetsIn(z);
    const hostile=here.filter(([c])=>atWarWith(G.player,c));
    h+=`<div class="card"><h4>${esc(SEA_ZONES[z].n)}<span class="tc">${fmt(n.fleets[z])}척</span></h4>
      ${hostile.length?`<div class="tiny" style="color:#e08a8a">적 함대: ${hostile.map(([c,v])=>esc(G.nats[c].adj)+' '+Math.round(v)).join(', ')}</div>`:'<div class="tiny">제해권 확보</div>'}
      <div class="btnrow"><button class="btn sm gold" data-act="goSea" data-z="${z}">지휘</button></div></div>`;
  }
  h+=`</div>`;
  h+=`<div class="sec"><h3>전 세계 해역</h3><table class="t"><tr><th>해역</th><th>주둔 함대</th><th></th></tr>`;
  for(const z in SEA_ZONES){
    const f=fleetsIn(z);
    h+=`<tr><td>${esc(SEA_ZONES[z].n)}</td>
      <td>${f.length? f.slice(0,3).map(([c,v])=>`<i class="dotc" style="background:${G.nats[c].color}"></i>${Math.round(v)}`).join(' ') : '<span class="tiny">—</span>'}</td>
      <td class="num"><button class="btn sm" data-act="goSea" data-z="${z}">보기</button></td></tr>`;
  }
  h+=`</table></div>`;
  return h;
}

/* ---------- 외교 ---------- */
function panelDip(){
  const n=G.nats[G.player];
  const list=Object.keys(G.nats).filter(c=>c!==G.player&&G.nats[c].alive)
    .sort((a,b)=>(G.nats[b].score-G.nats[a].score));
  const sel=UI.dipSel&&G.nats[UI.dipSel]&&G.nats[UI.dipSel].alive?UI.dipSel:null;
  let h='';
  if(sel){
    const t=G.nats[sel], rel=n.relations[sel]||0;
    const war=atWarWith(G.player,sel);
    h+=`<div class="sec"><h3><i class="dotc" style="background:${t.color}"></i>${esc(t.name)}</h3>
      <div class="row"><span class="k">정부</span><span class="v">${GOVS[t.gov].name}</span></div>
      <div class="row"><span class="k">국력 / 순위</span><span class="v">${fmt(t.score)} · ${t.rank}위</span></div>
      <div class="row"><span class="k">병력</span><span class="v">육 ${fmt(armyTotal(t))} · 해 ${fmt(t.navy)}</span></div>
      <div class="row"><span class="k">관계</span><span class="v ${rel>=0?'up':'down'}">${rel>0?'+':''}${fmt(rel)}</span></div>
      ${bar(rel+100,200,rel>=0?'#5fb87a':'#d15c5c')}
      <div class="row" style="margin-top:6px"><span class="k">상태</span><span class="v">${
        war?'<span class="down">교전 중</span>':n.allies.includes(sel)?'<span class="up">동맹</span>':
        (n.truces[sel]>G.turn?`정전 (${Math.ceil((n.truces[sel]-G.turn)/12)}년)`:'평시')}</span></div>
      ${t.allies.length?`<div class="tiny">동맹: ${t.allies.map(a=>G.nats[a]?G.nats[a].adj:a).join(', ')}</div>`:''}
      </div>`;
    h+=`<div class="sec"><h3>외교 행동</h3>`;
    for(const k in DIPLO){
      const D=DIPLO[k];
      if(k==='breakally'&&!n.allies.includes(sel)) continue;
      if(k==='alliance'&&n.allies.includes(sel)) continue;
      h+=`<div class="card"><h4>${D.n}<span class="tc">정치력 ${D.pp}${D.gold?' · £'+D.gold:''}</span></h4>
        <div class="tiny">${D.d}</div>
        <div class="btnrow"><button class="btn sm" data-act="diplo" data-c="${sel}" data-k="${k}" ${n.pp<D.pp||war?'disabled':''}>실행</button></div></div>`;
    }
    h+=`</div>`;
    if(!war) h+=`<div class="btnrow"><button class="btn red" data-act="warmodal" data-c="${sel}" style="width:100%">선전포고 검토</button></div>`;
    h+=`<div class="btnrow"><button class="btn sm" data-act="dipback">← 전체 목록</button></div>`;
    return h;
  }
  h+=`<div class="sec"><h3>열강과 이웃</h3><table class="t"><tr><th>국가</th><th class="num">국력</th><th class="num">관계</th><th></th></tr>`;
  for(const c of list.slice(0,40)){
    const t=G.nats[c], rel=n.relations[c]||0;
    const war=atWarWith(G.player,c);
    h+=`<tr><td><i class="dotc" style="background:${t.color}"></i>${esc(t.adj)}${t.gp?' <span class="gpmark">열강</span>':''}</td>
      <td class="num">${fmt(t.score)}</td>
      <td class="num ${rel>=0?'up':'down'}">${war?'<span class="down">전쟁</span>':(rel>0?'+':'')+fmt(rel)}</td>
      <td class="num"><button class="btn sm" data-act="godip" data-c="${c}">교섭</button></td></tr>`;
  }
  h+=`</table></div>`;
  return h;
}

/* ---------- 정치 ---------- */
function panelPol(){
  const n=G.nats[G.player];
  const g=GOVS[n.gov];
  let h=`<div class="sec"><h3>정부</h3>
    <div class="card"><h4>${g.name}</h4><div class="tiny">${esc(g.desc)}</div>
    <div class="effs" style="margin-top:6px">
      <span class="eff">세수 ${Math.round((g.tax-1)*100)}%</span>
      <span class="eff">연구 ${Math.round((g.res-1)*100)}%</span>
      <span class="eff">안정 ${g.stab>0?'+':''}${g.stab}</span>
      <span class="eff">정치력 +${g.pp}</span>
      <span class="eff">군사 ${Math.round((g.mil-1)*100)}%</span>
    </div></div></div>`;
  h+=`<div class="sec"><h3>정체 변혁 <span class="tiny">정치력 120 · 안정 -12 · 불만 +10</span></h3>`;
  for(const k in GOVS){
    if(k===n.gov) continue;
    const G2=GOVS[k];
    if(G2.unlock && !(G.year>=1917)) continue;
    h+=`<div class="card"><h4>${G2.name}
      <button class="btn sm" data-act="gov" data-g="${k}" ${n.pp<120?'disabled':''}>변혁</button></h4>
      <div class="tiny">${esc(G2.desc)}</div></div>`;
  }
  h+=`</div>`;
  const provs=ownedProvs(G.player).filter(p=>p.unrest>25).sort((a,b)=>b.unrest-a.unrest);
  h+=`<div class="sec"><h3>불안 지역</h3>`;
  h+= provs.length? `<table class="t"><tr><th>지역</th><th class="num">불만</th><th></th></tr>`+
      provs.slice(0,12).map(p=>`<tr><td>${esc(p.name)}</td><td class="num down">${fmt(p.unrest)}</td>
        <td class="num"><button class="btn sm" data-act="goprov" data-id="${p.id}">보기</button></td></tr>`).join('')+`</table>`
    : `<div class="muted">제국 전역이 평온하다.</div>`;
  h+=`</div>`;
  h+=`<div class="sec"><h3>국가 특성</h3><div class="tiny">${esc(NATIONS[G.player].trait||'특별한 전통 없음')}</div></div>`;
  return h;
}

/* ---------- 열강 순위 ---------- */
function panelRank(){
  let h=`<div class="sec"><h3>${G.year}년 열강 서열</h3>
    <div class="tiny" style="margin-bottom:8px">국력 = 공업 42% + 군사 30% + 위신 16% + 식민지 7% + 기술 5%</div>
    <table class="t"><tr><th>#</th><th>국가</th><th class="num">국력</th><th class="num">공업</th><th class="num">군사</th></tr>`;
  for(const c of G.ranking.slice(0,20)){
    const n=G.nats[c]; if(!n.alive) continue;
    const me=c===G.player;
    h+=`<tr style="${me?'background:#2b3c4f':''}"><td>${n.rank}</td>
      <td><i class="dotc" style="background:${n.color}"></i>${esc(n.adj)}${n.gp?' <span class="gpmark">열강</span>':''}</td>
      <td class="num">${fmt(n.score)}</td><td class="num">${fmt(n.indScore)}</td><td class="num">${fmt(n.milScore)}</td></tr>`;
  }
  h+=`</table></div>`;
  h+=`<div class="sec"><h3>목표</h3><div class="card">
    <div class="tiny">${G.endYear}년까지 열강 서열 <b style="color:var(--gold2)">1위</b>에 오르면 완전한 승리.
    3위 이내면 열강 반열에 오른 것으로 본다.</div>
    <div class="row" style="margin-top:6px"><span class="k">남은 기간</span><span class="v">${(G.endYear-G.year)}년 ${11-G.month}개월</span></div>
    </div></div>`;
  const dead=Object.values(G.nats).filter(n=>!n.alive);
  if(dead.length) h+=`<div class="sec"><h3>사라진 나라들</h3><div class="tiny">${dead.map(n=>esc(n.name)).join(' · ')}</div></div>`;
  return h;
}

/* ============================================================
   패널 액션
   ============================================================ */
function handleAct(d){
  const n=G.nats[G.player];
  switch(d.act){
    case 'branch': UI.techBranch=d.b; renderPanel(); return;
    case 'build':  toastR(startBuild(G.player, UI.sel, d.type)); break;
    case 'recruit':toastR(recruit(G.player, UI.sel, +d.n)); break;
    case 'ships':  toastR(buildShips(G.player, +d.n)); break;
    case 'research':toastR(startResearch(G.player, TECHS[d.id].b, d.id)); break;
    case 'gov':    toastR(changeGovernment(G.player, d.g)); break;
    case 'loan':   toastR(takeLoan(G.player, 100)); break;
    case 'repay':  toastR(repayDebt(G.player, Math.min(n.debt, n.gold))); break;
    case 'diplo':  toastR(doDiplo(G.player, d.c, d.k)); break;
    case 'godip':  UI.dipSel=d.c; UI.tab='dip'; syncTabs(); break;
    case 'dipback':UI.dipSel=null; break;
    case 'goprov': UI.sel=d.id; UI.tab='prov'; syncTabs(); focusProv(d.id); break;
    case 'order': {
      if(UI.order && UI.order.from===UI.sel){ UI.order=null; break; }
      const have=n.armies[UI.sel]||0;
      UI.order={from:UI.sel, divs: Math.max(1, Math.floor((UI.order&&UI.order.divs)||have))};
      toast('지도에서 목표를 클릭하세요 — 인접은 즉시, 먼 곳은 진군 명령', true); break;
    }
    case 'setdiv': {
      const have=Math.floor(n.armies[UI.sel]||0);
      const v = d.v==='all'? have : d.v==='half'? Math.max(1,Math.floor(have/2)) : +d.v;
      UI.order={from:UI.sel, divs:Math.min(have,Math.max(1,v))}; break;
    }
    case 'pickstack': {
      if(UI.order && UI.order.from===d.id){ UI.order=null; UI.sel=d.id; break; }
      UI.order={from:d.id, divs:Math.floor(n.armies[d.id]||1)};
      UI.sel=d.id; focusProv(d.id);
      toast('지도에서 목표를 클릭하세요', true); break;
    }
    case 'cancelmarch': {
      if(n.orders) delete n.orders[d.id];
      toast('진군 명령을 취소했다', true); break;
    }
    case 'fleetmove': {
      const r=fleetMove(G.player, UI.seaSel, d.to, UI.fleetDivs);
      toast(r.msg, r.ok); if(r.ok) UI.seaSel=d.to; break;
    }
    case 'goSea': { UI.seaSel=d.z; UI.tab='sea'; syncTabs(); UI.fleetDivs=null;
      const Z=SEA_ZONES[d.z]; UI.view.x=Z.x-UI.view.w/2; UI.view.y=Z.y-UI.view.h/2; clampView(); applyView(); break; }
    case 'seaback': UI.seaSel=null; UI.fleetDivs=null; break;
    case 'cabpost': UI.postSel=d.post; break;
    case 'cabback': UI.postSel=null; break;
    case 'hiregen': toastR(hireGeneral(n, d.id)); break;
    case 'firegen': toastR(dismissGeneral(n, d.id)); break;
    case 'assigngen': toastR(assignGeneral(n, d.id, d.prov||null)); break;
    case 'appoint': toastR(appointMinister(n, d.post, d.id)); break;
    case 'dismiss': toastR(dismissMinister(n, d.post)); break;
    case 'cancelorder': UI.order=null; break;
    case 'disband': {
      const ids=Object.keys(n.armies).filter(i=>n.armies[i]>=1);
      if(!ids.length){ toast('해산할 부대가 없다', false); break; }
      const id=UI.sel&&n.armies[UI.sel]>=1?UI.sel:ids[0];
      n.armies[id]-=1; if(n.armies[id]<0.5) delete n.armies[id];
      toast(`${G.provs[id].name}의 1개 사단을 해산했다`, true); break;
    }
    case 'save':   saveGame(); return;
    case 'load':   loadGame(); return;
    case 'help':   showHelp(); return;
    case 'warmodal': showWarModal(d.c); return;
    case 'peace':  showPeaceModal(+d.war); return;
  }
  refreshAll();
}
function toastR(r){ if(r) toast(r.msg, r.ok!==false); }

/* ---------- 선전포고 모달 ---------- */
function showWarModal(target){
  const n=G.nats[G.player], t=G.nats[target];
  let h=`<div class="mh"><h2>${esc(t.name)}에 대한 개전</h2>
    <div class="ms">국력 ${fmt(n.score)} 대 ${fmt(t.score)} · 병력 ${fmt(armyTotal(n))} 대 ${fmt(armyTotal(t))}</div></div>
    <div class="mb">`;
  if(t.allies.length) h+=`<div style="color:#e0b07a;margin-bottom:10px">⚠ ${esc(t.adj)}의 동맹: ${t.allies.map(a=>esc(G.nats[a].adj)).join(', ')} — 참전할 수 있다.</div>`;
  h+=`<div class="tiny" style="margin-bottom:10px">개전 명분을 고르면 국제적 파장과 요구할 수 있는 조건이 달라진다.</div></div><div class="mc">`;
  for(const k in CBS){
    const C=CBS[k];
    const cost=Math.round(C.pp*(n._m.cbcost||1));
    const err=canDeclareWar(G.player,target,k);
    h+=`<button class="choice" ${err?'disabled style="opacity:.45"':''} data-cb="${k}">
      <b>${C.n} <span style="float:right;color:var(--gold2);font-weight:400">정치력 ${cost} · 위신 ${C.pres>0?'+':''}${C.pres}</span></b>
      <span>${esc(C.d)}${err?' — <span style="color:#e08a8a">'+esc(err)+'</span>':''}</span></button>`;
  }
  h+=`<button class="btn" style="width:100%;margin-top:6px" onclick="closeModals()">물러선다</button></div>`;
  const ovl=modal(h);
  ovl.querySelectorAll('[data-cb]').forEach(b=>b.addEventListener('click',()=>{
    const r=declareWar(G.player, target, b.dataset.cb);
    closeModals(); toast(r.ok?`${t.name}에 선전포고했다!`:r.msg, r.ok);
    refreshAll();
  }));
}

/* ---------- 강화 모달 ---------- */
function showPeaceModal(warId){
  const w=G.wars.find(x=>x.id===warId); if(!w) return;
  const mine=sideOf(w,G.player);
  const sc=mine==='att'?w.score:-w.score;
  const terms=peaceTerms(w, mine);
  const foe=(mine==='att'?w.def:w.att).map(c=>G.nats[c].adj).join(', ');
  let h=`<div class="mh"><h2>강화 협상 — ${esc(foe)}</h2>
    <div class="ms">전쟁 점수 ${sc>=0?'+':''}${fmt(sc)} · 개전 ${w.start.y}년 · 전투 ${w.battles}회</div></div>
    <div class="mb"><div class="tiny">전쟁 점수가 높을수록 더 많은 것을 요구할 수 있다. 상대가 받아들일지는 그들의 피로도에 달렸다.</div></div><div class="mc">`;
  for(const t of terms){
    const ok = sc >= t.need;
    h+=`<button class="choice" ${ok?'':'disabled style="opacity:.4"'} data-term="${t.id}">
      <b>${t.n} <span style="float:right;color:var(--gold2);font-weight:400">${t.need>-100?'필요 점수 '+t.need:''}</span></b>
      <span>${esc(t.d)}</span></button>`;
  }
  h+=`<button class="btn" style="width:100%;margin-top:6px" onclick="closeModals()">협상을 미룬다</button></div>`;
  const ovl=modal(h);
  ovl.querySelectorAll('[data-term]').forEach(b=>b.addEventListener('click',()=>{
    const term=b.dataset.term;
    const enemyLead=G.nats[mine==='att'?w.leadD:w.leadA];
    const need=terms.find(t=>t.id===term).need;
    const willing = sc >= need + 12 || enemyLead.exh > 40 || term==='white';
    closeModals();
    if(!willing){ toast(`${enemyLead.adj}이(가) 그 조건을 거부했다. 더 밀어붙여야 한다.`, false); refreshAll(); return; }
    const desc=makePeace(w, mine, term);
    toast(`강화 성립 — ${desc}`, true); refreshAll();
  }));
}

/* ---------- 대기 중 결정 ---------- */
function processPending(){
  if(!G.pending.length) return false;
  const p=G.pending[0];
  if(p.type==='event'){
    const e=p.ev;
    let h=`<div class="mh"><h2>${esc(e.t)}</h2><div class="ms">${G.year}년 ${MONTHS[G.month]}</div></div>
      <div class="mb">${esc(e.x)}</div><div class="mc">`;
    (e.ch||[{t:'알겠다',d:'',f:()=>{}}]).forEach((c,i)=>{
      h+=`<button class="choice" data-i="${i}"><b>${esc(c.t)}</b><span>${esc(c.d||'')}</span></button>`;
    });
    h+=`</div>`;
    const ovl=modal(h,{sticky:true});
    ovl.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{
      resolveEvent(p, +b.dataset.i); G.pending.shift(); ovl.remove();
      refreshAll(); processPending();
    }));
    return true;
  }
  if(p.type==='peace'){
    const w=G.wars.find(x=>x.id===p.warId);
    if(!w){ G.pending.shift(); return processPending(); }
    const iLose=(p.winner==='att'?w.def:w.att).includes(G.player);
    let h=`<div class="mh"><h2>${esc(p.title)}</h2><div class="ms">전쟁 점수 ${p.score>=0?'+':''}${p.score}</div></div>
      <div class="mb">${esc(p.text)}</div><div class="mc">
      <button class="choice" data-a="1"><b>받아들인다</b><span>${esc(p.termName)} 조건으로 전쟁을 끝낸다.</span></button>
      <button class="choice" data-a="0"><b>거부한다</b><span>전쟁을 계속한다. 피로도가 계속 쌓인다.</span></button></div>`;
    const ovl=modal(h,{sticky:true});
    ovl.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{
      if(b.dataset.a==='1'){ const d=makePeace(w,p.winner,p.term); toast('강화 성립 — '+d, !iLose); }
      else { const foe=G.nats[p.winner==='att'?w.leadA:w.leadD]; foe.exh+=2; toast('강화를 거부했다. 전쟁은 계속된다.', false); }
      G.pending.shift(); ovl.remove(); refreshAll(); processPending();
    }));
    return true;
  }
  G.pending.shift();
  return processPending();
}

/* ---------- 게임 종료 ---------- */
function showEnding(){
  const n=G.nats[G.player];
  const rank=n.rank;
  let title, body;
  if(!n.alive){ title='제국의 최후'; body='당신의 나라는 지도에서 사라졌다. 역사는 승자의 언어로 기록될 것이다.'; }
  else if(rank===1){ title='세계의 중심'; body=`${G.year}년, ${n.name}은(는) 지구상에서 가장 강력한 나라가 되었다. 다른 모든 수도가 당신의 결정을 기다린다.`; }
  else if(rank<=3){ title='열강의 반열'; body=`${n.name}은(는) 세계 ${rank}위의 강대국으로 20세기를 맞았다. 어느 회의장에서도 당신의 자리는 비워져 있다.`; }
  else if(rank<=8){ title='열강의 말석'; body=`${n.name}은(는) 열강의 끝자리를 지켰다. 살아남았으나, 결정하는 쪽은 아니었다.`; }
  else { title='변방의 나라'; body=`${n.name}은(는) 세계 ${rank}위에 머물렀다. 20세기는 다른 이들의 것이었다.`; }
  const prov=ownedProvs(G.player);
  modal(`<div class="mh"><h2>${title}</h2><div class="ms">${G.year}년 — 최종 보고</div></div>
    <div class="mb">${body}
      <table class="t" style="margin-top:14px">
      <tr><td>최종 순위</td><td class="num">${rank}위</td></tr>
      <tr><td>국력</td><td class="num">${fmt(n.score)}</td></tr>
      <tr><td>영토</td><td class="num">${prov.length}개</td></tr>
      <tr><td>인구</td><td class="num">${fmt(prov.reduce((s,p)=>s+p.pop,0))}만</td></tr>
      <tr><td>연구 완료</td><td class="num">${Object.keys(n.techs).length} / ${Object.keys(TECHS).length}</td></tr>
      <tr><td>정부 형태</td><td class="num">${GOVS[n.gov].name}</td></tr>
      </table></div>
    <div class="mc"><button class="btn gold" style="width:100%" onclick="location.reload()">새 게임</button></div>`,{sticky:true});
}

/* ---------- 전체 갱신 ---------- */
function refreshAll(){
  recalcScores();
  G.nats[G.player]._m = calcMods(G.nats[G.player]);
  renderTop(); paintMap(); renderPanel(); renderLog(); renderBadges(); renderSelBar();
}

/* 선택한 부대 요약 바 */
function renderSelBar(){
  const bar=$('#selbar'); if(!bar) return;
  const me=G.nats[G.player];
  UI.selArmies=UI.selArmies||new Set(); UI.selFleets=UI.selFleets||new Set();
  for(const id of [...UI.selArmies]) if(!(me.armies[id]>=0.5)) UI.selArmies.delete(id);
  for(const z of [...UI.selFleets]) if(!((me.fleets||{})[z]>=0.5)) UI.selFleets.delete(z);
  const na=UI.selArmies.size, nf=UI.selFleets.size;
  if(!na && !nf){ bar.style.display='none'; return; }
  const divs=[...UI.selArmies].reduce((s,i)=>s+me.armies[i],0);
  const ships=[...UI.selFleets].reduce((s,z)=>s+me.fleets[z],0);
  let h='';
  if(na) h+=`<div class="sbi"><b>${fmt(divs)}</b><span>사단 · ${na}개 부대</span></div>`;
  if(nf) h+=`<div class="sbi"><b>${fmt(ships)}</b><span>함선 · ${nf}개 함대</span></div>`;
  h+=`<div class="hint">목표를 <b>우클릭</b> — 인접이면 즉시 이동·공격, 멀면 자동 진군</div>`;
  h+=`<button class="btn sm" id="selClear">해제 (Esc)</button>`;
  bar.innerHTML=h; bar.style.display='flex';
  const c=$('#selClear'); if(c) c.addEventListener('click',()=>{
    UI.selArmies.clear(); UI.selFleets.clear(); refreshAll(); });
}

/* 탭의 빨간 알림 — 공석, 진행 중 전쟁 */
function renderBadges(){
  const n=G.nats[G.player];
  const set=(tab,v)=>{
    const el2=document.querySelector(`.tab[data-t="${tab}"]`); if(!el2) return;
    const old=el2.querySelector('.bdg'); if(old) old.remove();
    if(v>0){ const b=el('span',{class:'bdg'}); b.textContent=v; el2.appendChild(b); }
  };
  let vac=0; if(n.cabinet) for(const p in POSTS) if(!n.cabinet[p]) vac++;
  set('cab', vac);
  set('mil', warsOf(G.player).length);
}
