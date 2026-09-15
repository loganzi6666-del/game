// 1900 Great Power - map generator
// Input : world-atlas countries-50m TopoJSON (Natural Earth)
// Output: great-power/js/mapdata.js
const fs = require('fs');
const path = require('path');

const topo = JSON.parse(fs.readFileSync('/tmp/claude-0/mapwork/wa/countries-50m.json','utf8'));
const OBJ = topo.objects.countries;

/* ---------- 1. decode arcs (delta -> absolute lon/lat) ---------- */
const tr = topo.transform;
function decodeArc(arc){
  let x=0,y=0; const out=[];
  for(const p of arc){ x+=p[0]; y+=p[1]; out.push([x*tr.scale[0]+tr.translate[0], y*tr.scale[1]+tr.translate[1]]); }
  return out;
}
const ARCS = topo.arcs.map(decodeArc);

/* ---------- 2. projection : Miller cylindrical ---------- */
const LAT_MAX = 83.5, LAT_MIN = -56.5;
const W = 2400;
const D2R = Math.PI/180;
function millerY(lat){ const p = Math.max(Math.min(lat, 89), -89)*D2R; return 1.25*Math.log(Math.tan(Math.PI/4 + 0.4*p)); }
const YT = millerY(LAT_MAX), YB = millerY(LAT_MIN);
const SX = W/360;
const H = Math.round((YT-YB)*SX*180/Math.PI * (Math.PI/180) * (180/Math.PI)); // = (YT-YB)*(W/(2PI))
const SY = W/(2*Math.PI);
const HEIGHT = Math.round((YT-YB)*SY);
function proj(lon,lat){
  return [ (lon+180)*SX, (YT - millerY(lat))*SY ];
}

/* ---------- 3. simplify each ARC (shared -> borders stay gapless) ---------- */
function dp(pts, tol){
  if(pts.length<3) return pts;
  const keep = new Uint8Array(pts.length); keep[0]=1; keep[pts.length-1]=1;
  const stack=[[0,pts.length-1]];
  while(stack.length){
    const [a,b]=stack.pop();
    let maxd=-1,idx=-1;
    const [x1,y1]=pts[a], [x2,y2]=pts[b];
    const dx=x2-x1, dy=y2-y1, len2=dx*dx+dy*dy;
    for(let i=a+1;i<b;i++){
      const [px,py]=pts[i];
      let d;
      if(len2===0){ d=Math.hypot(px-x1,py-y1); }
      else{
        let t=((px-x1)*dx+(py-y1)*dy)/len2; t=Math.max(0,Math.min(1,t));
        d=Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
      }
      if(d>maxd){maxd=d;idx=i;}
    }
    if(maxd>tol){ keep[idx]=1; stack.push([a,idx],[idx,b]); }
  }
  const out=[]; for(let i=0;i<pts.length;i++) if(keep[i]) out.push(pts[i]);
  return out;
}
const TOL = 1.1; // px in projected space
const PARCS = ARCS.map(a=>{
  const p = a.map(([lon,lat])=>proj(lon,lat));
  return dp(p, TOL);
});

/* ---------- 4. build rings per country ---------- */
function ringFromArcIdx(list){
  const pts=[];
  for(const i of list){
    const seg = i<0 ? PARCS[~i].slice().reverse() : PARCS[i];
    for(let k=(pts.length?1:0); k<seg.length; k++) pts.push(seg[k]);
  }
  return pts;
}
function splitDateline(ring){
  const HALF=W/2;
  let wrap=false;
  for(let i=0;i<ring.length;i++){ if(Math.abs(ring[(i+1)%ring.length][0]-ring[i][0])>HALF){ wrap=true; break; } }
  if(!wrap) return [ring];
  const chains=[]; let cur=[];
  for(let i=0;i<ring.length;i++){
    const prev=ring[i], next=ring[(i+1)%ring.length];
    cur.push(prev);
    if(Math.abs(next[0]-prev[0])>HALF){
      const ym=(prev[1]+next[1])/2;
      const eA = prev[0]>HALF ? W : 0;
      cur.push([eA,ym]);
      chains.push(cur);
      cur=[[eA===W?0:W, ym]];
    }
  }
  if(cur.length && chains.length) chains[0] = cur.concat(chains[0]); // ring is circular: rejoin tail to head
  // merge the trailing chain back into the first when they sit on the same edge
  const out=[];
  for(const ch of chains){ if(ch.length>=4) out.push(ch); }
  return out.length?out:[ring];
}
function polyArea(r){ let a=0; for(let i=0,j=r.length-1;i<r.length;j=i++) a += (r[j][0]*r[i][1]-r[i][0]*r[j][1]); return a/2; }

const countries = []; // {iso,name,rings:[[pt]],arcset:Set}
for(const geom of OBJ.geometries){
  const rings=[]; const arcset=new Set();
  const polys = geom.type==='Polygon' ? [geom.arcs] : geom.arcs;
  for(const poly of polys){
    for(const ringArcs of poly){
      for(const i of ringArcs) arcset.add(i<0?~i:i);
      const r = ringFromArcIdx(ringArcs);
      if(r.length>=4) for(const part of splitDateline(r)) if(part.length>=4) rings.push(part);
    }
  }
  countries.push({ iso: geom.id==null?('x'+geom.properties.name.replace(/[^A-Za-z]/g,'')):String(geom.id), name: geom.properties.name, rings, arcset });
}

/* ---------- 5. split oversized countries into provinces ---------- */
// Rectangle clipper (Weiler-Atherton style): returns a LIST of closed loops.
function signedArea(r){ let s=0; for(let i=0;i<r.length;i++){ const p=r[i], q=r[(i+1)%r.length]; s+=p[0]*q[1]-q[0]*p[1]; } return s/2; }
function pointInRing(pt, r){
  let inside=false;
  for(let i=0,j=r.length-1;i<r.length;j=i++){
    const [xi,yi]=r[i],[xj,yj]=r[j];
    if(((yi>pt[1])!==(yj>pt[1])) && (pt[0] < (xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}
function clipBox(ringIn, box){
  const {x0,x1,y0,y1}=box, EPS=1e-7;
  const inside = p => p[0]>=x0-EPS && p[0]<=x1+EPS && p[1]>=y0-EPS && p[1]<=y1+EPS;
  let ring = ringIn;
  if(signedArea(ring) < 0) ring = ring.slice().reverse();

  // perimeter parameter, clockwise-on-screen: top L->R, right T->B, bottom R->L, left B->T
  const W=x1-x0, H=y1-y0;
  const param = p => {
    if(Math.abs(p[1]-y0)<1e-6) return (p[0]-x0)/W;
    if(Math.abs(p[0]-x1)<1e-6) return 1+(p[1]-y0)/H;
    if(Math.abs(p[1]-y1)<1e-6) return 2+(x1-p[0])/W;
    return 3+(y1-p[1])/H;
  };
  const CORNERS=[[1,[x1,y0]],[2,[x1,y1]],[3,[x0,y1]],[4,[x0,y0]]];

  // walk edges, collecting inside vertices and boundary crossings in order
  const seq=[];
  const n=ring.length;
  for(let i=0;i<n;i++){
    const A=ring[i], B=ring[(i+1)%n];
    if(inside(A)) seq.push({p:A,k:'v'});
    const hits=[];
    const add=(t,p)=>{ if(t>1e-9 && t<1-1e-9 && inside(p)) hits.push([t,p]); };
    if(B[0]!==A[0]){
      for(const X of [x0,x1]){ const t=(X-A[0])/(B[0]-A[0]); if(t>0&&t<1) add(t,[X, A[1]+t*(B[1]-A[1])]); }
    }
    if(B[1]!==A[1]){
      for(const Y of [y0,y1]){ const t=(Y-A[1])/(B[1]-A[1]); if(t>0&&t<1) add(t,[A[0]+t*(B[0]-A[0]), Y]); }
    }
    hits.sort((u,v)=>u[0]-v[0]);
    for(const [t,p] of hits){
      const after=[A[0]+(t+1e-6)*(B[0]-A[0]), A[1]+(t+1e-6)*(B[1]-A[1])];
      seq.push({p, k: inside(after)?'in':'out'});
    }
  }
  if(!seq.length){
    // ring misses the box entirely; if the box sits inside the ring, the box itself is land
    return pointInRing([(x0+x1)/2,(y0+y1)/2], ring) ? [[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]] : [];
  }
  if(!seq.some(s=>s.k!=='v')) return [ring]; // fully contained

  // rotate so the sequence starts at an entry
  const startIdx = seq.findIndex(s=>s.k==='in');
  if(startIdx<0) return [];
  const rot = seq.slice(startIdx).concat(seq.slice(0,startIdx));

  // split into chains: entry -> ... -> exit
  const chains=[]; let cur=null;
  for(const s of rot){
    if(s.k==='in'){ cur=[s.p]; }
    else if(s.k==='out'){ if(cur){ cur.push(s.p); chains.push(cur); cur=null; } }
    else if(cur){ cur.push(s.p); }
  }
  if(cur && chains.length) chains[0] = cur.concat(chains[0]); // wrap tail into first chain
  if(!chains.length) return [];

  const entries = chains.map((c,i)=>({i, t:param(c[0])}));
  const used = new Array(chains.length).fill(false);
  const loops=[];
  for(let s=0;s<chains.length;s++){
    if(used[s]) continue;
    const loop=[]; let idx=s;
    for(let guard=0; guard<chains.length*2; guard++){
      used[idx]=true;
      for(const p of chains[idx]) loop.push(p);
      const te=param(chains[idx][chains[idx].length-1]);
      // next entry going forward around the perimeter
      let best=null, bestD=Infinity;
      for(const e of entries){
        let d=e.t-te; if(d<=1e-9) d+=4;
        if(d<bestD){ bestD=d; best=e; }
      }
      if(!best) break;
      for(const [ct,cp] of CORNERS){
        let d=ct-te; if(d<=1e-9) d+=4;
        if(d<bestD) loop.push(cp);
      }
      if(best.i===s) break;
      if(used[best.i]) break;
      idx=best.i;
    }
    if(loop.length>=4) loops.push(loop);
  }
  return loops;
}
function lonx(lon){ return (lon+180)*SX; }
function laty(lat){ return (YT-millerY(lat))*SY; }
function box(lon0,lon1,lat0,lat1){ return {x0:lonx(lon0),x1:lonx(lon1),y0:laty(lat1),y1:laty(lat0)}; }

// [iso] : [ [provinceId, provinceName, lon0,lon1,lat0,lat1], ... ]
const SPLITS = {
  '643':[ // Russia
    ['rus_eur','러시아 본토',   19,  48, 41, 84],
    ['rus_ural','우랄·서시베리아',48, 80, 45, 84],
    ['rus_sib','중앙시베리아',   80, 118, 45, 84],
    ['rus_far','극동',         118, 186, 40, 84],
    ['rus_far','극동',        -186,-168, 60, 74],
  ],
  '840':[ // USA
    ['usa_east','미국 동부',   -90, -60, 24, 50],
    ['usa_mid','미국 중서부', -105, -90, 24, 50],
    ['usa_west','미국 서부',  -128,-105, 24, 50],
    ['usa_ak','알래스카',     -186,-128, 50, 73],
    ['usa_hi','하와이',       -165,-150, 15, 26],
  ],
  '124':[ // Canada
    ['can_east','캐나다 동부', -95, -50, 41, 84],
    ['can_west','캐나다 서부',-142, -95, 47, 84],
  ],
  '156':[ // Qing China
    ['chn_mch','만주',        119, 136, 40, 55],
    ['chn_imn','내몽골',       97, 119, 40, 50],
    ['chn_nor','화북',         97, 126, 31, 40],
    ['chn_sou','화남',         97, 124, 17, 31],
    ['chn_xin','신장',         72,  97, 36, 50],
    ['chn_tib','티베트',       76,  97, 26, 36],
  ],
  '076':[ ['bra_nor','브라질 북부',-75,-33,-12,6], ['bra_sou','브라질 남부',-60,-33,-35,-12] ],
  '036':[ ['aus_east','호주 동부',132,156,-45,-9], ['aus_west','호주 서부',110,132,-40,-9] ],
  '356':[ ['ind_nor','북인도',68,90,23,37], ['ind_sou','남인도',68,90,5,23], ['ind_east','인도 동부',90,98,20,29] ],
  '360':[ ['idn_west','자바·수마트라',94,116,-12,7], ['idn_east','보르네오·동부',116,142,-12,8] ],
};

/* ---------- 6. assemble provinces ---------- */
// dropped micro entities (absorbed or irrelevant at this scale)
const DROP = new Set([
  '336','674','492','438','060','666','652','663','534','535','531','780',
  '850','580','581','583','584',
  '585','316','548','242','090','776','798','570','520','540','574','162','166','184',
  '258','260','334','239','238','234','292','312','474','500','654','831','832','833',
  '744','074','086','010','896','-99','016','772','798','882','776','548','584','583',
  '520','580','581','316','660','652','534','535','092','136','796','796','086','162'
]);
const KEEP_SMALL = new Set([
  '192','214','388','630','044','028','659','662','670','308','212','780','052','659',
  '056','528','442','756','499','688','070','008','470','196','231','232','262','728',
  '729','226','678','132','624','270','324','694','430','384','204','854','120','140',
  '148','562','566','768','426','516','748','072','710','716','894','508','450','174',
  '480','690','248','352','440','428','233','246','578','752','208','276','380','620',
  '724','300','792','268','051','031','398','762','795','860','417','496','104','116',
  '418','704','764','608','458','096','702','392','410','408','156','764','764','818',
  '400','422','376','275','760','368','682','784','634','048','414','512','887','364',
  '004','586','050','524','524','144','104','764','458','608','704','116','418','608'
]);

function ringArea(r){ return Math.abs(polyArea(r)); }
function bboxOf(rings){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const r of rings) for(const p of r){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1]; }
  return [x0,y0,x1,y1];
}
function toPath(rings){
  let d='';
  for(const r of rings){
    d+='M'+r.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z';
  }
  return d;
}
function centroidOf(rings){
  // area weighted centroid of largest ring
  let best=null,ba=0;
  for(const r of rings){ const a=ringArea(r); if(a>ba){ba=a;best=r;} }
  if(!best) return [0,0];
  let cx=0,cy=0,a=0;
  for(let i=0,j=best.length-1;i<best.length;j=i++){
    const f=best[j][0]*best[i][1]-best[i][0]*best[j][1];
    a+=f; cx+=(best[j][0]+best[i][0])*f; cy+=(best[j][1]+best[i][1])*f;
  }
  a*=0.5;
  if(Math.abs(a)<1e-6){ return best[0]; }
  return [cx/(6*a), cy/(6*a)];
}

const MIN_RING = 6;       // px^2 : drop dust islands
const MIN_PROV = 18;      // px^2 : drop micro countries

const provinces=[];
for(const c of countries){
  if(DROP.has(c.iso)) continue;
  const split = SPLITS[c.iso];
  if(split){
    const byId=new Map();
    for(const [pid,pname,lo0,lo1,la0,la1] of split){
      const bx = box(lo0,lo1,la0,la1);
      if(!byId.has(pid)) byId.set(pid,{id:pid,name:pname,iso:c.iso,rings:[],arcs:c.arcset});
      const slot=byId.get(pid);
      for(const r of c.rings){
        for(const cl of clipBox(r, bx)){
          if(cl.length>=4 && ringArea(cl)>MIN_RING) slot.rings.push(cl);
        }
      }
    }
    for(const slot of byId.values()){
      if(!slot.rings.length) continue;
      slot.area = slot.rings.reduce((s,r)=>s+ringArea(r),0);
      provinces.push(slot);
    }
  }else{
    let rings = c.rings.filter(r=>ringArea(r)>MIN_RING);
    if(!rings.length){
      // keep single biggest ring for notable small states
      const big = c.rings.slice().sort((a,b)=>ringArea(b)-ringArea(a))[0];
      if(big && KEEP_SMALL.has(c.iso)) rings=[big]; else continue;
    }
    const area = rings.reduce((s,r)=>s+ringArea(r),0);
    if(area<MIN_PROV) continue;
    provinces.push({ id:'c'+c.iso, name:c.name, iso:c.iso, rings, area, arcs:c.arcset });
  }
}

/* ---------- 7. adjacency ---------- */
const GRID=6;
const hash=new Map();
provinces.forEach((p,pi)=>{
  for(const r of p.rings) for(const pt of r){
    const k=Math.round(pt[0]/GRID)+':'+Math.round(pt[1]/GRID);
    if(!hash.has(k)) hash.set(k,new Set());
    hash.get(k).add(pi);
  }
});
const adj = provinces.map(()=>new Set());
for(const s of hash.values()){
  const a=[...s];
  for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++){ adj[a[i]].add(a[j]); adj[a[j]].add(a[i]); }
}

/* ---------- 8. emit ---------- */
const out = provinces.map((p,i)=>({
  id:p.id, name:p.name, iso:p.iso,
  d: toPath(p.rings),
  c: centroidOf(p.rings).map(v=>Math.round(v)),
  a: Math.round(p.area),
  n: [...adj[i]].map(k=>provinces[k].id)
}));
out.sort((a,b)=>b.a-a.a);

const js = '// AUTO-GENERATED from Natural Earth 1:50m (world-atlas). Do not edit by hand.\n'
  + 'const MAP_VIEW = {w:'+W+', h:'+HEIGHT+'};\n'
  + 'const MAP_RAW = '+JSON.stringify(out)+';\n';
const dest = process.argv[2] || '/tmp/claude-0/mapwork/mapdata.js';
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest, js);
console.log('provinces:', out.length, 'viewBox', W, HEIGHT, 'size', (js.length/1024).toFixed(0)+'KB');
console.log(out.slice(0,25).map(p=>p.id+' '+p.name+' a='+p.a+' n='+p.n.length).join('\n'));
