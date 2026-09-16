/* ============================================================
   열강의 시대 1900 — 해역과 함대
   ============================================================ */
function zProj(lon,lat){
  const YT=1.9793, SY=2400/(2*Math.PI), SX=2400/360;
  const p=Math.max(-89,Math.min(89,lat))*Math.PI/180;
  const my=1.25*Math.log(Math.tan(Math.PI/4+0.4*p));
  return [ (lon+180)*SX, (YT-my)*SY ];
}

const SEA_ZONES = {
  natl : { n:'북대서양',   lon:-38, lat:50, coasts:['c826','c372','c352','can_east','c304'], adj:['nsea','bisc','matl'] },
  nsea : { n:'북해',       lon:  3, lat:56, coasts:['c826','c528','c276','c208','c578','c056','c250'], adj:['natl','balt','bisc'] },
  balt : { n:'발트해',     lon: 19, lat:58, coasts:['c752','c208','c276','c616','c428','c440','c233','c246','rus_eur'], adj:['nsea'] },
  bisc : { n:'서유럽 해역', lon: -9, lat:44, coasts:['c250','c724','c620','c826'], adj:['natl','nsea','wmed','matl'] },
  wmed : { n:'서지중해',   lon:  5, lat:39, coasts:['c380','c724','c250','c012','c788','c504'], adj:['bisc','emed'] },
  emed : { n:'동지중해',   lon: 23, lat:34, coasts:['c380','c300','c792','c760','c422','c376','c818','c434','c196','c008','c807','c191','c705','c070','c499','c788'], adj:['wmed','blak','reds'] },
  blak : { n:'흑해',       lon: 34, lat:43, coasts:['c792','c804','c642','c100','c268','rus_eur'], adj:['emed'] },
  matl : { n:'중부대서양', lon:-40, lat:25, coasts:['c044','c630','usa_east','c504','c732','c192'], adj:['natl','bisc','carb','satl'] },
  carb : { n:'카리브해',   lon:-76, lat:15, coasts:['c192','c332','c214','c388','c170','c862','c484','c591','c558','c340','c084','c188','usa_east'], adj:['matl'] },
  satl : { n:'남대서양',   lon:-22, lat:-18, coasts:['bra_nor','bra_sou','c024','c516','c710','c686','c478'], adj:['matl','guin','indo','plat'] },
  guin : { n:'기니만',     lon:  3, lat:  2, coasts:['c566','c288','c384','c120','c266','c178','c226','c204','c768','c430','c694','c324','c854','c624','c270'], adj:['matl','satl'] },
  reds : { n:'홍해·아라비아해', lon:55, lat:15, coasts:['c818','c682','c887','c262','c232','c706','c512','c364','c414','c784','c634','c368','cxSomaliland'], adj:['emed','indo'] },
  indo : { n:'인도양',     lon: 72, lat:-12, coasts:['ind_sou','c144','c450','c508','c834','c404','c710','c586'], adj:['reds','satl','beng','ausw'] },
  beng : { n:'벵골만',     lon: 90, lat:14, coasts:['c050','ind_east','ind_sou','c104','c458'], adj:['indo','schn'] },
  schn : { n:'남중국해',   lon:114, lat:12, coasts:['chn_sou','c704','c764','c458','c608','idn_west','idn_east','c158','c116'], adj:['beng','echn','ausw'] },
  echn : { n:'동중국해',   lon:126, lat:29, coasts:['chn_sou','chn_nor','c158','c410','c392'], adj:['schn','jsea','npac'] },
  jsea : { n:'동해·황해',   lon:132, lat:41, coasts:['c392','c408','c410','chn_mch','rus_far'], adj:['echn','npac'] },
  npac : { n:'북태평양',   lon:172, lat:40, coasts:['c392','rus_far','usa_ak'], adj:['jsea','echn','epac','spac'] },
  epac : { n:'동태평양',   lon:-138, lat:34, coasts:['usa_west','can_west','usa_ak','usa_hi','c484'], adj:['npac','spac_am'] },
  spac_am:{ n:'남미 태평양', lon:-84, lat:-20, coasts:['c152','c604','c218','c170','c591'], adj:['epac','plat'] },
  plat : { n:'라플라타 해역', lon:-50, lat:-36, coasts:['c032','c858','bra_sou'], adj:['satl','spac_am'] },
  ausw : { n:'호주 서부 해역', lon:108, lat:-26, coasts:['aus_west','idn_east','idn_west','c626'], adj:['indo','schn','spac'] },
  spac : { n:'남태평양',   lon:166, lat:-25, coasts:['aus_east','c554','c598'], adj:['ausw','npac'] },
};
const ZONE_OF_COAST = {};      // 프로빈스 → 접한 해역들

function buildSeaZones(){
  for(const z in SEA_ZONES){
    const Z=SEA_ZONES[z];
    Z.id=z;
    const [x,y]=zProj(Z.lon,Z.lat); Z.x=x; Z.y=y;
    Z.coasts = Z.coasts.filter(c=>PROV[c]);
    for(const c of Z.coasts) (ZONE_OF_COAST[c]=ZONE_OF_COAST[c]||[]).push(z);
  }
  // 인접은 항상 양방향이어야 한다
  for(const z in SEA_ZONES) for(const a of SEA_ZONES[z].adj){
    if(SEA_ZONES[a] && !SEA_ZONES[a].adj.includes(z)) SEA_ZONES[a].adj.push(z);
  }
  // 파나마 운하는 1914년에 열린다
  SEA_ZONES.carb.adjCanal = ['spac_am'];
}
function zoneAdj(z){
  const Z=SEA_ZONES[z];
  const a=[...Z.adj];
  if(Z.adjCanal && G.year>=1914) a.push(...Z.adjCanal);
  if(z==='spac_am' && G.year>=1914) a.push('carb');
  return a;
}
function zonesTouching(provId){ return ZONE_OF_COAST[provId]||[]; }

/* ---------- 초기 배치 ---------- */
function deployFleets(){
  for(const c in G.nats){
    const n=G.nats[c];
    n.fleets={}; n.fleetMoved={};
    if(!n.navy) continue;
    const home=[];
    for(const p of ownedProvs(c)) for(const z of zonesTouching(p.id)) if(!home.includes(z)) home.push(z);
    if(!home.length){ n.navy=0; continue; }
    const cap=provCentreXY(n.cap);
    home.sort((a,b)=>dist2(SEA_ZONES[a],cap)-dist2(SEA_ZONES[b],cap));
    // 주력은 본토 해역, 나머지는 두 번째 해역에
    const main=Math.ceil(n.navy*0.7);
    n.fleets[home[0]]=main;
    if(home[1] && n.navy-main>0) n.fleets[home[1]]=n.navy-main;
    else if(n.navy-main>0) n.fleets[home[0]]+=n.navy-main;
  }
}
function provCentreXY(id){ const r=MAP_RAW.find(x=>x.id===id); return r?{x:r.c[0],y:r.c[1]}:{x:0,y:0}; }
function dist2(a,b){ return (a.x-b.x)**2+(a.y-b.y)**2; }

function fleetTotal(n){ let t=0; for(const z in n.fleets||{}) t+=n.fleets[z]; return t; }
function fleetsIn(zone){
  const out=[];
  for(const c in G.nats){ const v=(G.nats[c].fleets||{})[zone]; if(v>=0.5) out.push([c,v]); }
  return out.sort((a,b)=>b[1]-a[1]);
}

/* ---------- 이동 ---------- */
function fleetMove(code, from, to, ships){
  const n=G.nats[code];
  const have=(n.fleets||{})[from]||0;
  if(have<1) return {ok:false,msg:'그 해역에 함대가 없다'};
  if(!zoneAdj(from).includes(to)) return {ok:false,msg:'맞닿지 않은 해역이다'};
  if((n.fleetMoved||{})[from]===G.turn) return {ok:false,msg:'이번 달에는 이미 움직였다'};
  ships=Math.min(Math.max(1,Math.floor(ships||have)), have);
  n.fleets[from]-=ships; if(n.fleets[from]<0.5) delete n.fleets[from];
  n.fleets[to]=(n.fleets[to]||0)+ships;
  n.fleetMoved=n.fleetMoved||{}; n.fleetMoved[to]=G.turn;
  return {ok:true,msg:`${SEA_ZONES[from].n} → ${SEA_ZONES[to].n} ${ships}척 이동`};
}

/* ---------- 항로 명령 (여러 해역을 거쳐 이동) ---------- */
function zoneNextStep(from, to){
  if(from===to) return null;
  const prev={}, seen={[from]:true}; let fr=[from];
  for(let d=0; d<12 && fr.length; d++){
    const nx=[];
    for(const z of fr) for(const nb of zoneAdj(z)){
      if(seen[nb]) continue;
      seen[nb]=true; prev[nb]=z;
      if(nb===to){ let cur=to; while(prev[cur]!==from){ cur=prev[cur]; if(cur===undefined) return null; } return cur; }
      nx.push(nb);
    }
    fr=nx;
  }
  return null;
}
function setFleetOrder(code, from, to, ships){
  const n=G.nats[code];
  if(!((n.fleets||{})[from]>=1)) return {ok:false,msg:'그 해역에 함대가 없다'};
  if(from===to){ if(n.fleetOrders) delete n.fleetOrders[from]; return {ok:true,msg:'항로를 취소했다'}; }
  if(!SEA_ZONES[to]) return {ok:false,msg:'없는 해역이다'};
  if(!zoneNextStep(from,to)) return {ok:false,msg:'그 해역까지 가는 항로가 없다'};
  n.fleetOrders=n.fleetOrders||{};
  n.fleetOrders[from]={to, ships: Math.min(ships||n.fleets[from], n.fleets[from])};
  return {ok:true,msg:`${SEA_ZONES[from].n} 함대가 ${SEA_ZONES[to].n}(으)로 향한다`};
}
function processFleetOrders(n){
  n.fleetOrders=n.fleetOrders||{};
  for(const from of Object.keys(n.fleetOrders)){
    const o=n.fleetOrders[from];
    if(!((n.fleets||{})[from]>=1) || !SEA_ZONES[o.to]){ delete n.fleetOrders[from]; continue; }
    if(from===o.to){ delete n.fleetOrders[from]; continue; }
    const step=zoneNextStep(from,o.to);
    delete n.fleetOrders[from];
    if(!step) continue;
    const r=fleetMove(n.code, from, step, o.ships);
    if(r.ok && step!==o.to && n.fleets[step]>=1) n.fleetOrders[step]={to:o.to, ships:o.ships};
  }
}

/* ---------- 해전 ---------- */
function navalTick(){
  for(const z in SEA_ZONES){
    const present=fleetsIn(z);
    if(present.length<2) continue;
    // 교전 중인 두 나라를 찾는다
    for(let i=0;i<present.length;i++) for(let j=i+1;j<present.length;j++){
      const [a,av]=present[i], [b,bv]=present[j];
      if(!atWarWith(a,b)) continue;
      const A=G.nats[a], B=G.nats[b];
      const ap=av*A._m.nav*(0.85+rnd()*0.3), bp=bv*B._m.nav*(0.85+rnd()*0.3);
      const ratio=ap/(bp+0.01);
      const la=Math.min(av, av*0.14/Math.max(0.5,Math.min(2.2,ratio)));
      const lb=Math.min(bv, bv*0.14*Math.max(0.5,Math.min(2.2,ratio)));
      A.fleets[z]=Math.max(0,av-la); B.fleets[z]=Math.max(0,bv-lb);
      A.navy=Math.max(0,A.navy-la); B.navy=Math.max(0,B.navy-lb);
      const loser = ratio>1.15 ? b : (ratio<0.87 ? a : null);
      if(loser){                                   // 패한 쪽은 인접 해역으로 후퇴
        const L=G.nats[loser];
        // 자기 해안이 있는 해역으로 물러난다
        const safe=zoneAdj(z).filter(zz=>!fleetsIn(zz).some(([c])=>atWarWith(loser,c)));
        safe.sort((x,y)=>{
          const hx=SEA_ZONES[x].coasts.filter(c=>G.provs[c].own===loser).length;
          const hy=SEA_ZONES[y].coasts.filter(c=>G.provs[c].own===loser).length;
          return hy-hx;
        });
        const back=safe[0];
        if(back && L.fleets[z]){ L.fleets[back]=(L.fleets[back]||0)+L.fleets[z]; }
        delete L.fleets[z];
      }
      for(const k of [a,b]) if(G.nats[k].fleets[z]<0.5) delete G.nats[k].fleets[z];
      if(a===G.player||b===G.player){
        logEvent('해전: '+SEA_ZONES[z].n,
          `${A.adj} ${Math.round(av)}척 대 ${B.adj} ${Math.round(bv)}척 — `+
          (loser? `${G.nats[loser].adj} 함대 후퇴` : '결판나지 않음')+
          `. 손실 ${la.toFixed(1)} / ${lb.toFixed(1)}척.`,
          loser && loser!==G.player ? 'win':'war', G.player);
      }
      break;
    }
  }
}

/* ---------- 해상 봉쇄 ---------- */
function isBlockaded(p){
  if(!p.coast) return false;
  const owner=p.own;
  for(const z of zonesTouching(p.id)){
    const present=fleetsIn(z);
    let enemy=0, friend=0;
    for(const [c,v] of present){
      if(c===owner || (G.nats[owner]&&G.nats[owner].allies.includes(c))) friend+=v;
      else if(atWarWith(owner,c)) enemy+=v;
    }
    if(enemy>0 && enemy>friend*1.2) return true;
  }
  return false;
}
/* 상륙에 필요한 제해권 — 두 지역을 모두 접한 해역에 우리 함대가 있어야 한다 */
function canLand(code, from, to){
  const za=zonesTouching(from), zb=zonesTouching(to);
  const n=G.nats[code];
  for(const z of za){
    if(!zb.includes(z)) continue;
    const mine=(n.fleets||{})[z]||0;
    if(mine<3) continue;
    let enemy=0;
    for(const [c,v] of fleetsIn(z)) if(atWarWith(code,c)) enemy+=v;
    if(mine > enemy) return z;
  }
  return null;
}

/* 장부 맞추기 — 보유 함선 수와 해역 배치가 어긋나지 않게 */
function reconcileFleets(nat){
  nat.fleets=nat.fleets||{};
  const t=fleetTotal(nat);
  const d=nat.navy-t;
  if(Math.abs(d)<0.01) return;
  if(d>0){
    let z=null;
    for(const p of ownedProvs(nat.code)){
      if(p.ctrl!==nat.code) continue;
      const zs=zonesTouching(p.id);
      if(zs.length){ z=zs[0]; if(p.id===nat.cap) break; }
    }
    if(z) nat.fleets[z]=(nat.fleets[z]||0)+d;
    else nat.navy=t;                      // 항구를 모두 잃으면 함대도 사라진다
  } else {
    nat.navy=t;
  }
  for(const z in nat.fleets) if(nat.fleets[z]<0.01) delete nat.fleets[z];
}

/* ---------- AI 함대 ---------- */
function aiFleetTick(n){
  if(!n.fleets || !fleetTotal(n)) return;
  const wars=warsOf(n.code);
  const enemies=new Set();
  for(const w of wars){ (sideOf(w,n.code)==='att'?w.def:w.att).forEach(c=>enemies.add(c)); }
  if(!enemies.size) return;
  // 적 해역으로 한 번에 한 함대만
  for(const z of Object.keys(n.fleets)){
    if((n.fleetMoved||{})[z]===G.turn) continue;
    if(n.fleets[z]<3) continue;
    const targets=zoneAdj(z).filter(zz=>{
      const Z=SEA_ZONES[zz];
      return Z.coasts.some(c=>enemies.has(G.provs[c].own));
    });
    if(!targets.length) continue;
    const t=targets[0];
    let enemyThere=0; for(const [c,v] of fleetsIn(t)) if(enemies.has(c)) enemyThere+=v;
    if(n.fleets[z] > enemyThere*1.3) fleetMove(n.code, z, t, n.fleets[z]);
    break;
  }
}

/* ---------- 렌더 ---------- */
function drawFleets(g, px, U){
  const me=G.nats[G.player];
  const zoom = MAP_VIEW.w/UI.view.w;
  UI.selFleets = UI.selFleets || new Set();
  for(const z in SEA_ZONES){
    const Z=SEA_ZONES[z];
    const present=fleetsIn(z);
    const hit=sv('circle',{cx:Z.x, cy:Z.y, r:px(present.length?24:16),
      fill:'transparent', class:'seahit','data-zone':z});
    hit.style.cursor='pointer';
    g.appendChild(hit);
    if(!present.length) continue;
    const [c,v]=present[0];
    const mine=c===G.player;
    const order = mine && me.fleetOrders && me.fleetOrders[z];
    drawCounter(g,{ x:Z.x, y:Z.y, U, color:G.nats[c].color, value:v, kind:'fleet',
      selected: mine && UI.selFleets.has(z), mine, dataKey:z,
      tag: zoom>2.2 ? (Math.round(v)+'척'+(order?' »':'')) : (order?'»':null) });
    if(present.length>1){
      const t2=sv('text',{x:Z.x-px(24), y:Z.y+px(4), class:'caplabel',
        style:`font-size:${px(12)}px;fill:#ff8a8a;stroke-width:${px(3)}px`});
      t2.textContent='⚓'; g.appendChild(t2);
    }
    if(zoom>1.6){
      const t=sv('text',{x:Z.x, y:Z.y-px(15), class:'caplabel',
        style:`font-size:${px(9.5)}px;stroke-width:${px(3)}px;fill:#9fc4dc`});
      t.textContent=Z.n; g.appendChild(t);
    }
  }
}
