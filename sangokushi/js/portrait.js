/* =========================================================
   東亞 群雄割據 — 장수 초상 생성기 (절차적 SVG)
   문화권별 관모/투구/복식을 고증에 맞춰 조합한다.
   ========================================================= */
'use strict';

function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
function rngFrom(seed){ let x=seed||1; return ()=>{ x^=x<<13; x>>>=0; x^=x>>17; x^=x<<5; x>>>=0; return x/4294967296; }; }

/* 초상 아키타입: cul(문화) head(관모) armor(복식) accent(주색) */
const ART = {
  kr_go:       {cul:'kr', head:'helm_kr',   armor:'scale',  accent:'#3f6b4f', sub:'#8a6a2f'},
  kr_go_lord:  {cul:'kr', head:'jowu',      armor:'royal',  accent:'#2f6b4a', sub:'#d4b040'},
  kr_bai:      {cul:'kr', head:'helm_kr',   armor:'scale',  accent:'#5a4a8a', sub:'#c9a227'},
  kr_bai_lord: {cul:'kr', head:'baekje',    armor:'royal',  accent:'#4a3f7a', sub:'#e0c050'},
  kr_sil:      {cul:'kr', head:'helm_kr',   armor:'scale',  accent:'#8a6a2f', sub:'#c05030'},
  kr_sil_lord: {cul:'kr', head:'geumgwan',  armor:'royal',  accent:'#8a7020', sub:'#f0d060'},
  kr_kaya:     {cul:'kr', head:'helm_kr',   armor:'scale',  accent:'#2f6b6b', sub:'#b0a040'},
  kr_kaya_lord:{cul:'kr', head:'geumgwan',  armor:'royal',  accent:'#2f7070', sub:'#e0c860'},
  kr_tam:      {cul:'kr', head:'gapmo',     armor:'hide',   accent:'#5a6b3a', sub:'#8a7a5a'},
  kr_jo:       {cul:'kr', head:'auto_kr',   armor:'brigan', accent:'#3a5070', sub:'#b03030'},
  kr_civ:      {cul:'kr', head:'jeongja',   armor:'robe',   accent:'#3a4a6a', sub:'#d0d0d8'},
  jp_kab:      {cul:'jp', head:'kabuto',    armor:'dou',    accent:'#4a4a5a', sub:'#a03030'},
  jp_kab_lord: {cul:'jp', head:'kabuto_big',armor:'dou',    accent:'#3a3a4a', sub:'#d4b040'},
  jp_eb:       {cul:'jp', head:'eboshi',    armor:'kamishimo',accent:'#4a4a60', sub:'#c0c0c8'},
  jp_sou:      {cul:'jp', head:'zukin',     armor:'kesa',   accent:'#6a2a2a', sub:'#e0d0a0'},
  jp_sou_lord: {cul:'jp', head:'zukin',     armor:'kesa',   accent:'#7a2020', sub:'#f0e0b0'},
  jp_nan_lord: {cul:'jp', head:'nanban',    armor:'nanban', accent:'#2a2a33', sub:'#c04020'},
  jp_nin:      {cul:'jp', head:'hachimaki', armor:'shinobi',accent:'#2a3033', sub:'#606a6a'},
  jp_ainu:     {cul:'jp', head:'ainu',      armor:'attush', accent:'#5a4a3a', sub:'#c0a070'},
  jp_lord:     {cul:'jp', head:'kanmuri',   armor:'sokutai',accent:'#5a4a7a', sub:'#e0c060'},
  cn_gen:      {cul:'cn', head:'helm_cn',   armor:'lamel',  accent:'#4a5a7a', sub:'#b03030'},
  cn_lord:     {cul:'cn', head:'crown_cn',  armor:'royal',  accent:'#3a3a6a', sub:'#e0c040'},
  cn_civ:      {cul:'cn', head:'guan_cn',   armor:'robe',   accent:'#4a5a6a', sub:'#d8d8e0'},
  cn_taoist:   {cul:'cn', head:'daoguan',   armor:'robe',   accent:'#5a6a5a', sub:'#e8e8d0'},
  cn_bar:      {cul:'cn', head:'bar',       armor:'hide',   accent:'#6a4a2a', sub:'#c08040'},
  cn_guan:     {cul:'cn', head:'helm_cn',   armor:'lamel',  accent:'#2f6b3f', sub:'#c9a227', face:'red', beard:'long'},
  cn_zhang:    {cul:'cn', head:'helm_cn',   armor:'lamel',  accent:'#4a3a2a', sub:'#a02020', face:'dark', beard:'bristle'},
  cn_lubu:     {cul:'cn', head:'helm_pheasant',armor:'lamel',accent:'#5a4a6a', sub:'#d0b040'},
  cn_liang:    {cul:'cn', head:'waryong',   armor:'robe',   accent:'#e8e8e8', sub:'#b0c0d0', fan:1},
  vn_khan:     {cul:'vn', head:'khan',      armor:'aodai',  accent:'#3a6a4a', sub:'#c0a040'},
  vn_khan_lord:{cul:'vn', head:'khan_gold', armor:'aodai',  accent:'#2f6b48', sub:'#e0c050'},
  vn_cham:     {cul:'vn', head:'cham',      armor:'cham',   accent:'#8a5a2a', sub:'#d0a040'},
  vn_cham_lord:{cul:'vn', head:'cham_gold', armor:'cham',   accent:'#9a6020', sub:'#f0c860'},
  vn_khmer:    {cul:'vn', head:'khmer',     armor:'khmer',  accent:'#7a7a2a', sub:'#d0c040'},
  vn_khmer_lord:{cul:'vn',head:'khmer_gold',armor:'khmer',  accent:'#8a8a20', sub:'#f0e060'},
  tw_ming:     {cul:'tw', head:'ming',      armor:'ming',   accent:'#8a4a2a', sub:'#c04030'},
  tw_ming_lord:{cul:'tw', head:'ming_gold', armor:'ming',   accent:'#9a4a20', sub:'#e0b040'},
  tw_abo:      {cul:'tw', head:'abo',       armor:'abo',    accent:'#5a6a3a', sub:'#c04030'},
  tw_abo_lord: {cul:'tw', head:'abo_chief', armor:'abo',    accent:'#5a7030', sub:'#e05030'}
};

const SKINS = {
  kr:['#f0d0ae','#e8c6a2','#dfba92','#d6ae84'],
  jp:['#f2d4b2','#ead0ab','#e0c098','#d5b288'],
  cn:['#efceaa','#e6c49e','#dcb68e','#cfa87e'],
  vn:['#dcb188','#d2a67c','#c4956c','#b8875f'],
  tw:['#d8ab80','#cc9e73','#c09268','#b4855c']
};

/* ---------- 메인 ---------- */
function portraitSVG(g, size, opts) {
  opts = opts || {};
  let art = ART[g.art] || ART.cn_gen;
  const h = hashStr(g.name + (g.han || ''));
  const r = rngFrom(h || 7);
  const id = 'p' + (h % 100000);
  const age = g.age || 35;
  const sk = SKINS[art.cul];
  let skin = sk[h % sk.length];
  if (art.face === 'red') skin = '#c2604a';
  if (art.face === 'dark') skin = '#b0855c';
  const FW = 64 + Math.floor(r() * 8);      // 얼굴 폭
  const FH = 80 + Math.floor(r() * 8);      // 얼굴 높이
  const cx = 100, cy = 100;
  const square = r() < 0.5;
  const eyeSharp = (g.war || 60) > 78 || (g.lead || 60) > 86;
  const grey = age >= 52;
  const hairC = grey ? (age >= 62 ? '#ddddde' : '#adadb0') : (r() < 0.12 ? '#372a22' : '#17161a');
  const beard = pickBeard(g, art, r, age);
  // 개체별 금속/직물 색 변주
  const artBase = art;
  art = Object.assign({}, art, { sub: hueJitter(art.sub, (h >> 7) % 22 - 11, r), accent: hueJitter(art.accent, (h >> 11) % 16 - 8, r) });
  const BROW = cy - FH * 0.20, EYE = cy - FH * 0.05, MOUTH = cy + FH * 0.29;
  const S_ = [];

  S_.push(`<svg viewBox="0 0 200 240" width="${size}" height="${Math.round(size * 1.2)}" class="portrait" xmlns="http://www.w3.org/2000/svg">`);
  S_.push(`<defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${shade(art.accent, 0.42)}"/><stop offset="1" stop-color="${shade(art.accent, -0.62)}"/></linearGradient>
    <radialGradient id="${id}gl" cx="0.5" cy="0.34" r="0.7">
      <stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.62" stop-color="#000" stop-opacity="0.05"/><stop offset="1" stop-color="#000" stop-opacity="0.42"/></radialGradient>
    <radialGradient id="${id}sk" cx="0.42" cy="0.32" r="0.8">
      <stop offset="0" stop-color="${shade(skin, 0.20)}"/><stop offset="0.7" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, -0.22)}"/></radialGradient>
    <linearGradient id="${id}mt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(art.sub, 0.5)}"/><stop offset="0.45" stop-color="${art.sub}"/><stop offset="1" stop-color="${shade(art.sub, -0.45)}"/></linearGradient>
  </defs>`);
  S_.push(`<rect width="200" height="240" fill="url(#${id}bg)"/>`);
  S_.push(`<g opacity="0.12">${bgPattern(art.cul, id)}</g>`);
  // 몸통 / 복식
  S_.push(bodyArmor(art, id, r));
  // 목
  S_.push(`<path d="M${cx-14} ${cy+FH*0.34} q14 8 28 0 l0 30 h-28 z" fill="${shade(skin,-0.26)}"/>`);
  S_.push(`<path d="M${cx-14} ${cy+FH*0.34} q14 16 28 0 q-2 12 -14 12 q-12 0 -14 -12 z" fill="${shade(skin,-0.4)}" opacity="0.7"/>`);
  // 뒷머리
  S_.push(`<path d="M${cx-FW*0.54} ${cy-FH*0.1} q-2 ${FH*0.34} 6 ${FH*0.44} l${FW*0.16} -4 q-8 ${-FH*0.2} -6 ${-FH*0.4} z" fill="${hairC}"/>`);
  S_.push(`<path d="M${cx+FW*0.54} ${cy-FH*0.1} q2 ${FH*0.34} -6 ${FH*0.44} l${-FW*0.16} -4 q8 ${-FH*0.2} 6 ${-FH*0.4} z" fill="${hairC}"/>`);
  // 얼굴 (두개골 + 턱)
  S_.push(`<ellipse cx="${cx}" cy="${cy-FH*0.08}" rx="${FW/2}" ry="${FH*0.40}" fill="url(#${id}sk)"/>`);
  const jw = square ? 0.96 : 0.80;
  S_.push(`<path d="M${cx-FW/2*jw} ${cy} q${FW*0.02} ${FH*0.34} ${FW/2*jw} ${FH*0.42} q${FW/2*jw} ${-FH*0.08} ${FW/2*jw} ${-FH*0.42} z" fill="url(#${id}sk)"/>`);
  S_.push(`<ellipse cx="${cx}" cy="${cy-FH*0.08}" rx="${FW/2}" ry="${FH*0.40}" fill="none" stroke="${shade(skin,-0.38)}" stroke-width="0.9" opacity="0.6"/>`);
  // 귀
  S_.push(`<ellipse cx="${cx-FW/2+1}" cy="${cy-2}" rx="5" ry="10" fill="${shade(skin,-0.14)}" stroke="${shade(skin,-0.34)}" stroke-width="0.7"/>`);
  S_.push(`<ellipse cx="${cx+FW/2-1}" cy="${cy-2}" rx="5" ry="10" fill="${shade(skin,-0.14)}" stroke="${shade(skin,-0.34)}" stroke-width="0.7"/>`);
  // 볼 음영
  S_.push(`<ellipse cx="${cx-FW*0.28}" cy="${cy+FH*0.1}" rx="8" ry="6" fill="${shade(skin,-0.2)}" opacity="0.35"/>`);
  S_.push(`<ellipse cx="${cx+FW*0.28}" cy="${cy+FH*0.1}" rx="8" ry="6" fill="${shade(skin,-0.2)}" opacity="0.35"/>`);
  // 앞머리
  S_.push(`<path d="M${cx-FW*0.52} ${BROW-4} q${FW*0.1} ${-FH*0.3} ${FW*0.52} ${-FH*0.31} q${FW*0.42} ${0.01*FH} ${FW*0.52} ${FH*0.31} q${-FW*0.22} ${-FH*0.16} ${-FW*0.52} ${-FH*0.15} q${-FW*0.3} ${-0.01*FH} ${-FW*0.52} ${FH*0.15} z" fill="${hairC}"/>`);
  // 눈썹
  const bw = FW * 0.27, tilt = eyeSharp ? 6 : 2.5;
  S_.push(`<path d="M${cx-FW*0.34} ${BROW+tilt} q${bw*0.5} ${-tilt-5} ${bw} -1" stroke="${hairC}" stroke-width="${eyeSharp?5:3.8}" fill="none" stroke-linecap="round"/>`);
  S_.push(`<path d="M${cx+FW*0.34} ${BROW+tilt} q${-bw*0.5} ${-tilt-5} ${-bw} -1" stroke="${hairC}" stroke-width="${eyeSharp?5:3.8}" fill="none" stroke-linecap="round"/>`);
  // 눈
  S_.push(eyes(cx, EYE, FW, eyeSharp));
  // 코
  S_.push(`<path d="M${cx} ${EYE+4} q${r()<0.5?-3.5:3.5} 14 0 18 q-4 1.5 -6 0" stroke="${shade(skin,-0.34)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  S_.push(`<ellipse cx="${cx}" cy="${EYE+19}" rx="5" ry="2.4" fill="${shade(skin,-0.18)}" opacity="0.6"/>`);
  // 입
  const mw = FW * 0.15;
  S_.push(`<path d="M${cx-mw} ${MOUTH} q${mw} ${(g.war||60)>85?2.5:5} ${mw*2} 0" stroke="#8d4a41" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  // 주름
  if (age >= 50) S_.push(`<g stroke="${shade(skin,-0.32)}" stroke-width="1.1" fill="none" opacity="0.7">
    <path d="M${cx-FW*0.26} ${MOUTH-12} q5 6 4 12"/><path d="M${cx+FW*0.26} ${MOUTH-12} q-5 6 -4 12"/>
    <path d="M${cx-FW*0.2} ${BROW-8} q${FW*0.2} -4 ${FW*0.4} 0"/></g>`);
  if (r() < 0.16 && (g.war || 0) > 74) S_.push(`<path d="M${cx+FW*0.2} ${BROW+2} l7 22" stroke="#a75d52" stroke-width="2" opacity="0.75"/>`);
  // 수염
  S_.push(beardSVG(beard, cx, cy, FW, FH, hairC, MOUTH));
  // 관모 / 투구
  S_.push(headGear(art.head, id, art, g, cx, cy, FW, FH, r, hairC));
  if (art.fan) S_.push(`<g transform="translate(162,176) rotate(-14)"><path d="M0 0 q-24 -20 -44 -4 q18 11 44 4 z" fill="#f6f3e8" stroke="#b9ae92" stroke-width="1"/><path d="M0 0 l9 7" stroke="#8a7a5a" stroke-width="3.4"/></g>`);
  S_.push(`<rect width="200" height="240" fill="url(#${id}gl)"/>`);
  S_.push(`<rect x="0.5" y="0.5" width="199" height="239" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>`);
  S_.push('</svg>');
  return S_.join('');
}

function hueJitter(hex, deg, r) {
  const c = hex.replace('#','');
  let R = parseInt(c.substr(0,2),16)/255, G = parseInt(c.substr(2,2),16)/255, B = parseInt(c.substr(4,2),16)/255;
  const mx = Math.max(R,G,B), mn = Math.min(R,G,B), d = mx-mn; let hh = 0;
  if (d) { if (mx===R) hh = ((G-B)/d)%6; else if (mx===G) hh = (B-R)/d+2; else hh = (R-G)/d+4; }
  hh = (hh*60 + deg + 360) % 360;
  const L = (mx+mn)/2, Sa = d ? d/(1-Math.abs(2*L-1)) : 0;
  const Lm = Math.max(0.08, Math.min(0.92, L + (r()-0.5)*0.10));
  const Cc = (1-Math.abs(2*Lm-1))*Sa, X = Cc*(1-Math.abs((hh/60)%2-1)), m = Lm - Cc/2;
  let rr,gg,bb;
  if (hh<60){rr=Cc;gg=X;bb=0;} else if (hh<120){rr=X;gg=Cc;bb=0;} else if (hh<180){rr=0;gg=Cc;bb=X;}
  else if (hh<240){rr=0;gg=X;bb=Cc;} else if (hh<300){rr=X;gg=0;bb=Cc;} else {rr=Cc;gg=0;bb=X;}
  const t = v => ('0'+Math.round(Math.max(0,Math.min(255,(v+m)*255))).toString(16)).slice(-2);
  return '#'+t(rr)+t(gg)+t(bb);
}

function shade(hex, amt) {
  const c = hex.replace('#', '');
  let r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
  if (amt > 0) { r += (255-r)*amt; g += (255-g)*amt; b += (255-b)*amt; }
  else { r *= (1+amt); g *= (1+amt); b *= (1+amt); }
  const t = v => ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2);
  return '#' + t(r) + t(g) + t(b);
}

function bgPattern(cul, id) {
  if (cul === 'jp') return `<g stroke="#fff" stroke-width="1.2" fill="none"><circle cx="100" cy="66" r="42"/><circle cx="100" cy="66" r="52"/></g>`;
  if (cul === 'kr') return `<g stroke="#fff" stroke-width="1.2" fill="none"><path d="M40 210 q60 -46 120 0"/><path d="M28 226 q72 -52 144 0"/><circle cx="100" cy="58" r="30"/></g>`;
  if (cul === 'vn') return `<g stroke="#fff" stroke-width="1.1" fill="none"><path d="M20 60 q40 30 0 60"/><path d="M180 60 q-40 30 0 60"/><circle cx="100" cy="52" r="24"/></g>`;
  if (cul === 'tw') return `<g stroke="#fff" stroke-width="1.1" fill="none"><path d="M10 120 l30 -30 l30 30 l30 -40 l30 40 l30 -30 l30 30"/></g>`;
  return `<g stroke="#fff" stroke-width="1.1" fill="none"><path d="M100 18 q34 24 34 56 q0 34 -34 46 q-34 -12 -34 -46 q0 -32 34 -56 z"/><path d="M66 120 q34 16 68 0"/></g>`;
}

function eyes(cx, ey, FW, sharp) {
  const ex = FW * 0.23, w = FW * (sharp ? 0.17 : 0.16), hh = sharp ? 5 : 6.4;
  let s = '';
  [-1, 1].forEach(d => {
    const x = cx + d * ex;
    s += `<path d="M${x-w/2} ${ey} q${w/2} ${-hh} ${w} 0 q${-w/2} ${hh*1.2} ${-w} 0 z" fill="#f7f3ec" stroke="#3a2c22" stroke-width="1.2"/>`;
    s += `<circle cx="${x + d*0.8}" cy="${ey+0.5}" r="3.3" fill="#2a1c14"/>`;
    s += `<circle cx="${x + d*0.8 - 1.1}" cy="${ey-1}" r="1" fill="#fff" opacity="0.9"/>`;
    s += `<path d="M${x-w/2} ${ey-0.4} q${w/2} ${-hh} ${w} 0" stroke="#2a2018" stroke-width="${sharp?2:1.4}" fill="none"/>`;
  });
  return s;
}

function pickBeard(g, art, r, age) {
  if (art.beard) return art.beard;
  if (age < 20) return 'none';
  const cul = art.cul, w = g.war || 60;
  const rv = r();
  if (cul === 'jp') { if (rv < 0.42) return 'none'; if (rv < 0.72) return 'chin'; return w > 80 ? 'bristle' : 'mustache'; }
  if (cul === 'cn') { if (rv < 0.12) return 'none'; if (rv < 0.4) return 'mustache'; if (rv < 0.72) return 'tri'; return age > 46 ? 'long' : 'full'; }
  if (cul === 'kr') { if (rv < 0.24) return 'none'; if (rv < 0.5) return 'mustache'; if (rv < 0.8) return 'tri'; return 'long'; }
  if (cul === 'vn') { if (rv < 0.4) return 'none'; if (rv < 0.7) return 'mustache'; return 'tri'; }
  return rv < 0.7 ? 'none' : 'mustache';
}

function beardSVG(kind, cx, cy, FW, FH, hairC, MOUTH) {
  const my = MOUTH - 6, cn = cy + FH * 0.42;
  const must = `<path d="M${cx-FW*0.21} ${my} q${FW*0.21} -6 ${FW*0.42} 0 q${-FW*0.1} 7 -${FW*0.21} 7 q${-FW*0.11} 0 -${FW*0.21} -7 z" fill="${hairC}"/>`;
  switch (kind) {
    case 'mustache': return must;
    case 'chin': return must + `<path d="M${cx-8} ${MOUTH+8} q8 9 16 0 q-3 14 -8 15 q-5 -1 -8 -15 z" fill="${hairC}"/>`;
    case 'tri': return must + `<path d="M${cx-13} ${MOUTH+7} q13 8 26 0 q-4 26 -13 31 q-9 -5 -13 -31 z" fill="${hairC}"/>`;
    case 'long': return must + `<path d="M${cx-15} ${MOUTH+6} q15 10 30 0 q-3 48 -15 58 q-12 -10 -15 -58 z" fill="${hairC}"/>`
      + `<path d="M${cx-FW*0.42} ${cy+FH*0.06} q-3 ${FH*0.3} 8 ${FH*0.42}" stroke="${hairC}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      + `<path d="M${cx+FW*0.42} ${cy+FH*0.06} q3 ${FH*0.3} -8 ${FH*0.42}" stroke="${hairC}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'full': return `<path d="M${cx-FW*0.44} ${cy+FH*0.02} q0 ${FH*0.44} ${FW*0.44} ${FH*0.52} q${FW*0.44} ${-FH*0.08} ${FW*0.44} ${-FH*0.52} q${-FW*0.14} ${FH*0.2} ${-FW*0.44} ${FH*0.2} q${-FW*0.3} 0 ${-FW*0.44} ${-FH*0.2} z" fill="${hairC}"/>` + must;
    case 'bristle': return `<path d="M${cx-FW*0.46} ${cy-FH*0.02} q2 ${FH*0.48} ${FW*0.46} ${FH*0.56} q${FW*0.46} ${-FH*0.08} ${FW*0.46} ${-FH*0.56} q${-FW*0.16} ${FH*0.2} ${-FW*0.46} ${FH*0.2} q${-FW*0.3} 0 ${-FW*0.46} ${-FH*0.2} z" fill="${hairC}"/>`
      + `<path d="M${cx-FW*0.3} ${my+6} q-9 -7 -13 -16 M${cx+FW*0.3} ${my+6} q9 -7 13 -16" stroke="${hairC}" stroke-width="4.6" stroke-linecap="round"/>` + must;
    default: return '';
  }
}

/* ---------- 관모 / 투구 ----------
   B: 테두리(눈썹 위) 라인, T: 정점, HW: 반폭 */
function headGear(kind, id, art, g, cx, cy, fw, fh, r, hairC) {
  const M = `url(#${id}mt)`;
  const B = cy - fh * 0.29, T = cy - fh * 0.70, HW = fw * 0.585;
  const SD = cy + fh * 0.30;            // 목가리개 하단
  const S_ = [];
  const dome = (fill, stroke) => `<path d="M${cx-HW} ${B} q0 ${T-B} ${HW} ${(T-B)*1.02} q${HW} ${-0.02*(T-B)} ${HW} ${B-T} z" fill="${fill}" stroke="${stroke||'#1e1a14'}" stroke-width="1.4"/>`;
  const brim = (fill) => `<path d="M${cx-HW-5} ${B} q${HW+5} 13 ${(HW+5)*2} 0 l0 8 q${-HW-5} 13 ${-(HW+5)*2} 0 z" fill="${fill}" stroke="#1e1a14" stroke-width="1"/>`;
  const flapL = (fill) => `<path d="M${cx-HW-3} ${B+6} q-9 ${(SD-B)*0.6} 1 ${SD-B} l14 -4 q-9 ${-(SD-B)*0.5} -5 ${-(SD-B)*0.55} z" fill="${fill}" stroke="#1e1a14" stroke-width="1"/>`;
  const flapR = (fill) => `<path d="M${cx+HW+3} ${B+6} q9 ${(SD-B)*0.6} -1 ${SD-B} l-14 -4 q9 ${-(SD-B)*0.5} 5 ${-(SD-B)*0.55} z" fill="${fill}" stroke="#1e1a14" stroke-width="1"/>`;
  const plume = (x, col, hgt) => `<path d="M${x} ${T+4} q7 ${-hgt*0.6} 3 ${-hgt} q11 ${hgt*0.36} 6 ${hgt} z" fill="${col}" stroke="#00000055" stroke-width="0.6"/>`;
  switch (kind) {
    case 'auto_kr': return headGear((g.war || 60) >= 72 ? 'helm_kr' : 'gat', id, art, g, cx, cy, fw, fh, r, hairC);
    case 'helm_kr': // 두정 투구 + 상모
      S_.push(flapL(shade(art.accent,-0.05)), flapR(shade(art.accent,-0.05)));
      S_.push(dome(M));
      for (let i = 0; i < 3; i++) S_.push(`<path d="M${cx-HW+6+i*((HW*2-12)/2)} ${B-2} l0 ${T-B+10}" stroke="${shade(art.sub,-0.4)}" stroke-width="1.6" opacity="0.7"/>`);
      S_.push(brim(shade(art.sub, -0.34)));
      S_.push(`<path d="M${cx} ${T-1} l0 -13" stroke="${shade(art.sub,-0.15)}" stroke-width="3.4"/><circle cx="${cx}" cy="${T-19}" r="7.5" fill="#b8342c" stroke="#6a1a14" stroke-width="0.8"/>`);
      break;
    case 'jowu': // 고구려 조우관
      S_.push(`<path d="M${cx-HW*0.8} ${B+2} q${HW*0.8} ${(T-B)*0.9} ${HW*1.6} 0 q${-HW*0.8} -14 ${-HW*1.6} 0 z" fill="#2a2620" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-HW*0.74} ${B} q${HW*0.74} -22 ${HW*1.48} 0 q${-HW*0.74} 10 ${-HW*1.48} 0 z" fill="${M}" stroke="#2a2018" stroke-width="1"/>`);
      S_.push(plume(cx - HW*0.46, '#f4eddc', 46), plume(cx + HW*0.3, '#f4eddc', 46));
      S_.push(`<circle cx="${cx}" cy="${B-10}" r="5.4" fill="${art.sub}" stroke="#2a2018" stroke-width="0.8"/>`);
      break;
    case 'geumgwan': // 신라 금관
      S_.push(`<path d="M${cx-HW*0.92} ${B-2} h${HW*1.84} v10 h${-HW*1.84} z" fill="${M}" stroke="#7a5a10" stroke-width="1"/>`);
      [-1, 0, 1].forEach(k => { const x = cx + k * HW * 0.62;
        S_.push(`<path d="M${x-5} ${B-2} l0 -20 l-8 -3 l8 -4 l0 -12 l6 0 l0 12 l8 4 l-8 3 l0 20 z" fill="${M}" stroke="#7a5a10" stroke-width="0.8"/>`); });
      S_.push(`<path d="M${cx-HW*0.92} ${B+8} q-4 24 2 34" stroke="${M}" stroke-width="3.2" fill="none"/><path d="M${cx+HW*0.92} ${B+8} q4 24 -2 34" stroke="${M}" stroke-width="3.2" fill="none"/>`);
      S_.push(`<path d="M${cx-HW*0.92-2} ${B+42} q6 8 8 0 q-2 8 -8 0 z" fill="#3f8f6f"/><path d="M${cx+HW*0.92+2} ${B+42} q-6 8 -8 0 q2 8 8 0 z" fill="#3f8f6f"/>`);
      break;
    case 'baekje': // 백제 금동관식
      S_.push(`<path d="M${cx-HW*0.86} ${B-1} q${HW*0.86} -16 ${HW*1.72} 0 l0 10 q${-HW*0.86} 12 ${-HW*1.72} 0 z" fill="#2c2620" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx} ${B-4} q-18 -22 -7 -42 q7 13 7 13 q0 -18 7 -24 q2 15 4 20 q7 -11 11 -9 q-4 22 -22 42 z" fill="${M}" stroke="#7a5a10" stroke-width="0.9"/>`);
      break;
    case 'gat': // 조선 갓
      S_.push(`<ellipse cx="${cx}" cy="${B}" rx="${fw*1.02}" ry="10" fill="#25211c" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-17} ${B} q0 -30 17 -30 q17 0 17 30 z" fill="#2e2a24" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-17} ${B-5} q17 6 34 0" stroke="${art.sub}" stroke-width="2.2" fill="none"/>`);
      S_.push(`<path d="M${cx-fw*0.5} ${B+3} q6 22 -2 34" stroke="#2e2a24" stroke-width="2" fill="none"/>`);
      break;
    case 'jeongja': // 문관 정자관
      S_.push(`<path d="M${cx-21} ${B} h42 v-14 h-42 z" fill="#242028" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-14} ${B-14} q14 -26 28 0 z" fill="#242028" stroke="#15120e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-21} ${B-5} h42" stroke="${art.sub}" stroke-width="1.6" opacity="0.7"/>`);
      break;
    case 'gapmo': // 가죽 모자
      S_.push(dome('#6a5a44', '#3a3022'));
      S_.push(brim('#4a3e2c'));
      S_.push(`<path d="M${cx-HW*0.6} ${T+8} q${HW*0.6} -10 ${HW*1.2} 0" stroke="#8a7a5a" stroke-width="2.4" fill="none"/>`);
      break;
    case 'kabuto': case 'kabuto_big': { // 일본 투구
      const big = kind === 'kabuto_big';
      S_.push(`<path d="M${cx-HW-4} ${B+4} q-13 ${(SD-B)*0.7} -2 ${SD-B+6} l20 -5 q-11 ${-(SD-B)*0.55} -6 ${-(SD-B)*0.6} z" fill="${shade(art.accent,-0.05)}" stroke="#15120e" stroke-width="1"/>`);
      S_.push(`<path d="M${cx+HW+4} ${B+4} q13 ${(SD-B)*0.7} 2 ${SD-B+6} l-20 -5 q11 ${-(SD-B)*0.55} 6 ${-(SD-B)*0.6} z" fill="${shade(art.accent,-0.05)}" stroke="#15120e" stroke-width="1"/>`);
      S_.push(dome(M));
      S_.push(`<path d="M${cx} ${B-2} l0 ${T-B+4}" stroke="${shade(art.sub,-0.35)}" stroke-width="2.2" opacity="0.85"/>`);
      S_.push(brim(shade(art.sub, -0.4)));
      const mk = hashStr(g.name) % 4;
      if (mk === 0 || big) S_.push(`<path d="M${cx-30} ${T+2} q30 ${big?-52:-38} 60 -2 q-24 ${big?-20:-14} -60 2 z" fill="${M}" stroke="#4a3a10" stroke-width="1"/>`);
      else if (mk === 1) S_.push(`<path d="M${cx-9} ${T+4} l9 -34 l9 34 z" fill="${M}" stroke="#4a3a10" stroke-width="1"/>`);
      else if (mk === 2) S_.push(`<path d="M${cx-19} ${T+4} l-9 -28 l16 9 M${cx+19} ${T+4} l9 -28 l-16 9" stroke="${M}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`);
      else S_.push(`<circle cx="${cx}" cy="${T-10}" r="10" fill="${M}" stroke="#4a3a10" stroke-width="1"/>`);
      break;
    }
    case 'eboshi':
      S_.push(`<path d="M${cx-17} ${B} q5 -34 21 -38 q15 5 15 38 z" fill="#1f1c22" stroke="#100e12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-17} ${B-3} h36" stroke="${art.sub}" stroke-width="1.8" opacity="0.6"/>`);
      break;
    case 'kanmuri':
      S_.push(`<path d="M${cx-18} ${B} h36 v-16 h-36 z" fill="#1c1a22" stroke="#100e12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx+16} ${B-16} q24 -7 22 24 q-7 -16 -22 -11 z" fill="#1c1a22" stroke="#100e12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-18} ${B-7} h36" stroke="${M}" stroke-width="2.2"/>`);
      break;
    case 'zukin': // 승병 두건
      S_.push(`<path d="M${cx-HW-2} ${B+8} q0 ${T-B-4} ${HW+2} ${T-B-2} q${HW+2} 0 ${HW+2} ${B-T+6} q-8 22 -${HW+2} 18 q-${HW-2} 4 -${HW+2} -18 z" fill="${shade(art.sub,-0.12)}" stroke="#4a3a2a" stroke-width="1.4"/>`);
      S_.push(`<path d="M${cx-HW-4} ${B+14} q${HW+4} 14 ${(HW+4)*2} 0 l-4 16 q-${HW+1} 12 -${(HW+1)*2} 0 z" fill="${shade(art.sub,-0.34)}" stroke="#4a3a2a" stroke-width="0.8"/>`);
      S_.push(`<path d="M${cx-12} ${T+10} q12 -8 24 0" stroke="#8a2a2a" stroke-width="2.8" fill="none"/>`);
      break;
    case 'nanban': // 남만 투구
      S_.push(dome(shade('#454b56', 0.1), '#15181e'));
      S_.push(`<path d="M${cx} ${B-4} q9 ${(T-B)*0.6} 0 ${T-B+2} q-9 ${-(T-B)*0.5} 0 ${-(T-B)-2} z" fill="${M}"/>`);
      S_.push(`<ellipse cx="${cx}" cy="${B+2}" rx="${fw*0.86}" ry="8" fill="#2e343d" stroke="#15181e" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-HW*0.7} ${T+16} q${HW*0.7} -12 ${HW*1.4} 0" stroke="${M}" stroke-width="2.6" fill="none"/>`);
      break;
    case 'hachimaki':
      S_.push(`<path d="M${cx-HW} ${B+2} q${HW} 12 ${HW*2} 0 l0 -12 q-${HW} -12 -${HW*2} 0 z" fill="${shade(art.sub,-0.2)}" stroke="#20242a" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx+HW} ${B-2} q18 5 14 26 l-9 -5 q5 -14 -7 -16 z" fill="${shade(art.sub,-0.32)}"/>`);
      S_.push(`<path d="M${cx-HW-1} ${cy+fh*0.1} q${HW+1} 20 ${(HW+1)*2} 0 l0 14 q-${HW+1} 20 -${(HW+1)*2} 0 z" fill="#20242a" opacity="0.92"/>`);
      break;
    case 'ainu': // 사파운페
      S_.push(`<path d="M${cx-HW} ${B+3} q${HW} 10 ${HW*2} 0 l0 -13 q-${HW} -10 -${HW*2} 0 z" fill="#6a4a30" stroke="#3a2818" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-HW*0.7} ${B-2} q${HW*0.7} 5 ${HW*1.4} 0" stroke="#e5d6a8" stroke-width="2.2" fill="none"/>`);
      [-1, 0, 1].forEach(k => S_.push(`<path d="M${cx+k*HW*0.6-5} ${B-8} l5 -15 l5 15 z" fill="#c9a86b" stroke="#6a5030" stroke-width="0.6"/>`));
      break;
    case 'helm_cn': case 'helm_pheasant': // 중국 투구
      S_.push(flapL(shade(art.accent,-0.05)), flapR(shade(art.accent,-0.05)));
      S_.push(dome(M));
      S_.push(brim(shade(art.sub, -0.38)));
      S_.push(`<path d="M${cx} ${T-1} l0 -12" stroke="${shade(art.sub,-0.2)}" stroke-width="3.2"/>`);
      if (kind === 'helm_pheasant') {
        S_.push(`<path d="M${cx-4} ${T-10} q-30 -24 -20 -46 q12 22 26 40 z" fill="#c9a227" stroke="#00000044" stroke-width="0.6"/>`);
        S_.push(`<path d="M${cx+4} ${T-10} q30 -24 20 -46 q-12 22 -26 40 z" fill="#3f7f5f" stroke="#00000044" stroke-width="0.6"/>`);
      } else S_.push(`<path d="M${cx} ${T-12} q9 -24 0 -32 q-9 8 0 32 z" fill="#b8342c"/>`);
      break;
    case 'crown_cn': // 통천관
      S_.push(`<path d="M${cx-22} ${B} h44 v-18 h-44 z" fill="#1c1a24" stroke="#0e0c12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-33} ${B-18} h66 v-7 h-66 z" fill="#14121a" stroke="${M}" stroke-width="1.6"/>`);
      [-26, -9, 9, 26].forEach(d => S_.push(`<circle cx="${cx+d}" cy="${B-34}" r="3.6" fill="${M}"/><path d="M${cx+d} ${B-31} l0 6" stroke="${M}" stroke-width="1.4"/>`));
      S_.push(`<path d="M${cx-22} ${B-9} h44" stroke="${M}" stroke-width="2.2"/>`);
      break;
    case 'guan_cn':
      S_.push(`<path d="M${cx-20} ${B} h40 v-11 q-20 -14 -40 0 z" fill="#232028" stroke="#100e12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-9} ${B-22} h18 v-9 h-18 z" fill="#232028" stroke="#100e12" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-20} ${B-5} h40" stroke="${art.sub}" stroke-width="1.6" opacity="0.7"/>`);
      break;
    case 'waryong': // 와룡건
      S_.push(`<path d="M${cx-22} ${B} q0 -32 22 -34 q22 2 22 34 z" fill="#f4f1e6" stroke="#b5ad9c" stroke-width="1.4"/>`);
      S_.push(`<path d="M${cx-22} ${B-6} q22 9 44 0" stroke="#c8c0ae" stroke-width="1.6" fill="none"/>`);
      S_.push(`<path d="M${cx-20} ${B-17} q20 -9 40 0" stroke="#c8c0ae" stroke-width="1.4" fill="none"/>`);
      break;
    case 'daoguan':
      S_.push(`<path d="M${cx-18} ${B} h36 v-20 q-18 -9 -36 0 z" fill="#e8e4d4" stroke="#a89e86" stroke-width="1.4"/>`);
      S_.push(`<circle cx="${cx}" cy="${B-11}" r="5.4" fill="none" stroke="#6a7a5a" stroke-width="1.8"/>`);
      break;
    case 'bar': // 남만 두목
      S_.push(`<path d="M${cx-HW} ${B+3} q${HW} 9 ${HW*2} 0 l0 -11 q-${HW} -9 -${HW*2} 0 z" fill="#8a5a2a" stroke="#4a3018" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-HW*0.55} ${B-6} l-5 -26 l12 10 M${cx+HW*0.55} ${B-6} l5 -26 l-12 10" stroke="#eee4c4" stroke-width="4.6" fill="none" stroke-linecap="round"/>`);
      S_.push(`<circle cx="${cx}" cy="${B-5}" r="4.4" fill="#c04030"/>`);
      break;
    case 'khan': case 'khan_gold': // 베트남 칸동
      S_.push(`<path d="M${cx-HW} ${B+4} q${HW} 8 ${HW*2} 0 q3 -22 -7 -26 q-${HW*0.9} -13 -${HW*1.8} 0 q-10 4 -7 26 z" fill="${kind==='khan_gold'?M:'#241f2a'}" stroke="#12101a" stroke-width="1.4"/>`);
      S_.push(`<path d="M${cx-HW*0.8} ${B-4} q${HW*0.8} 7 ${HW*1.6} 0" stroke="${kind==='khan_gold'?'#7a5a10':art.sub}" stroke-width="1.8" fill="none"/>`);
      S_.push(`<path d="M${cx-9} ${B-20} q9 -7 18 0 q-9 5 -18 0 z" fill="${art.sub}"/>`);
      break;
    case 'cham': case 'cham_gold': // 참파 보관
      S_.push(`<path d="M${cx-24} ${B+2} h48 l-5 -12 h-38 z" fill="${M}" stroke="#7a5a10" stroke-width="1.1"/>`);
      S_.push(`<path d="M${cx-15} ${B-10} q15 -34 30 0 z" fill="${M}" stroke="#7a5a10" stroke-width="1.1"/>`);
      if (kind === 'cham_gold') S_.push(`<circle cx="${cx}" cy="${B-20}" r="4.4" fill="#c03030"/><path d="M${cx} ${B-27} l0 -10" stroke="${M}" stroke-width="2.6"/>`);
      S_.push(`<path d="M${cx-24} ${B+8} q-5 20 2 30" stroke="${M}" stroke-width="2.8" fill="none"/><path d="M${cx+24} ${B+8} q5 20 -2 30" stroke="${M}" stroke-width="2.8" fill="none"/>`);
      break;
    case 'khmer': case 'khmer_gold': // 크메르 보관
      S_.push(`<path d="M${cx-22} ${B+2} h44 v-10 h-44 z" fill="${M}" stroke="#7a6a10" stroke-width="1.1"/>`);
      S_.push(`<path d="M${cx-16} ${B-8} q7 -17 16 -19 q9 2 16 19 z" fill="${M}" stroke="#7a6a10" stroke-width="1.1"/>`);
      S_.push(`<path d="M${cx} ${B-27} l0 -16" stroke="${M}" stroke-width="3.4"/>`);
      if (kind === 'khmer_gold') [-15, 15].forEach(d => S_.push(`<path d="M${cx+d} ${B-12} l0 -14" stroke="${M}" stroke-width="2.6"/>`));
      break;
    case 'ming': case 'ming_gold': // 명식 투구
      S_.push(flapL('#4a3f38'), flapR('#4a3f38'));
      S_.push(dome(shade('#544840', 0.08), '#241c16'));
      S_.push(`<ellipse cx="${cx}" cy="${B+1}" rx="${fw*0.9}" ry="8" fill="${M}" stroke="#241c16" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx} ${T-2} l0 -14" stroke="${M}" stroke-width="3.2"/><path d="M${cx} ${T-16} q9 -16 0 -22 q-9 7 0 22 z" fill="#c03028"/>`);
      if (kind === 'ming_gold') S_.push(`<path d="M${cx-HW*0.8} ${T+14} q${HW*0.8} -14 ${HW*1.6} 0" stroke="${M}" stroke-width="3" fill="none"/>`);
      break;
    case 'abo': case 'abo_chief': { // 대만 원주민
      S_.push(`<path d="M${cx-HW} ${B+3} q${HW} 9 ${HW*2} 0 l0 -10 q-${HW} -9 -${HW*2} 0 z" fill="#b03830" stroke="#6a1e18" stroke-width="1.2"/>`);
      S_.push(`<path d="M${cx-HW*0.7} ${B-3} q${HW*0.7} 6 ${HW*1.4} 0" stroke="#f0e0c0" stroke-width="1.8" fill="none" stroke-dasharray="3 3"/>`);
      const n = kind === 'abo_chief' ? 5 : 3;
      for (let i = 0; i < n; i++) { const d = (i - (n - 1) / 2) * 13;
        S_.push(`<path d="M${cx+d} ${B-6} q${d*0.22} -28 ${d*0.1} -38 q7 11 ${-d*0.1+3} 38 z" fill="${i%2?'#e8e0d0':'#3a2f28'}" stroke="#00000055" stroke-width="0.6"/>`); }
      break;
    }
  }
  return S_.join('');
}

/* ---------- 복식 / 갑주 ---------- */
function bodyArmor(art, id, r) {
  const M = `url(#${id}mt)`, A = art.accent, S_ = [];
  const shoulders = (fill, stroke) => `<path d="M100 158 q-48 5 -64 42 q-11 18 -13 40 h154 q-2 -22 -13 -40 q-16 -37 -64 -42 z" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
  switch (art.armor) {
    case 'scale': case 'lamel': case 'brigan':
      S_.push(shoulders(shade(A, -0.1), '#1c1814'));
      for (let y = 0; y < 4; y++) for (let x = 0; x < 11; x++) {
        const px = 34 + x * 13 + (y % 2 ? 6 : 0), py = 190 + y * 12;
        if (px > 30 && px < 176) S_.push(`<path d="M${px} ${py} q6 0 6 7 q0 7 -6 7 q-6 0 -6 -7 q0 -7 6 -7 z" fill="${shade(A,0.12)}" stroke="#00000055" stroke-width="0.6"/>`);
      }
      S_.push(`<path d="M100 170 l0 70" stroke="${M}" stroke-width="5"/>`);
      S_.push(`<ellipse cx="100" cy="196" rx="13" ry="13" fill="${M}" stroke="#2a2018" stroke-width="1.2"/><circle cx="100" cy="196" r="5" fill="${shade(A,-0.35)}"/>`);
      break;
    case 'dou': // 도마루/도구소쿠
      S_.push(shoulders(shade(A, -0.05), '#15120e'));
      for (let y = 0; y < 4; y++) S_.push(`<path d="M${38+y*3} ${192+y*13} h${124-y*6}" stroke="${shade(A,0.2)}" stroke-width="7" stroke-linecap="round"/>`);
      S_.push(`<path d="M24 206 q-6 18 -4 34 h26 q-4 -18 2 -34 z" fill="${shade(A,0.1)}" stroke="#15120e" stroke-width="1"/>`);
      S_.push(`<path d="M176 206 q6 18 4 34 h-26 q4 -18 -2 -34 z" fill="${shade(A,0.1)}" stroke="#15120e" stroke-width="1"/>`);
      S_.push(`<path d="M100 176 l-12 22 h24 z" fill="${M}"/>`);
      break;
    case 'nanban':
      S_.push(shoulders('#3a3f4a', '#14171c'));
      S_.push(`<path d="M100 172 q-22 10 -26 34 q22 10 52 0 q-4 -24 -26 -34 z" fill="#4a5058" stroke="#14171c" stroke-width="1.2"/>`);
      S_.push(`<path d="M100 172 l0 66" stroke="#20242a" stroke-width="3"/>`);
      S_.push(`<path d="M62 214 q38 -12 76 0" stroke="${M}" stroke-width="3" fill="none"/>`);
      break;
    case 'royal':
      S_.push(shoulders(shade(A, 0.05), '#15120e'));
      S_.push(`<path d="M100 168 q-24 30 -30 72 h60 q-6 -42 -30 -72 z" fill="${shade(A,0.22)}" stroke="#15120e" stroke-width="1"/>`);
      S_.push(`<path d="M74 196 q26 -10 52 0" stroke="${M}" stroke-width="3" fill="none"/>`);
      S_.push(`<path d="M100 206 q-14 6 -12 20 q12 8 24 0 q2 -14 -12 -20 z" fill="${M}" stroke="#7a5a10" stroke-width="0.8"/>`);
      S_.push(`<path d="M46 214 q-6 14 -6 26 M154 214 q6 14 6 26" stroke="${M}" stroke-width="2.4" fill="none"/>`);
      break;
    case 'robe': case 'kamishimo': case 'sokutai': case 'aodai':
      S_.push(shoulders(shade(A, 0.06), '#1a1820'));
      S_.push(`<path d="M100 168 l-22 72 h44 z" fill="${shade(A,0.3)}" stroke="#1a1820" stroke-width="1"/>`);
      S_.push(`<path d="M78 196 q22 8 44 0" stroke="${art.sub}" stroke-width="2.4" fill="none"/>`);
      if (art.armor === 'kamishimo') S_.push(`<path d="M52 200 l-14 40 M148 200 l14 40" stroke="${shade(A,-0.25)}" stroke-width="5"/>`);
      if (art.armor === 'aodai') S_.push(`<path d="M100 176 l0 64" stroke="${art.sub}" stroke-width="2"/>`);
      break;
    case 'kesa':
      S_.push(shoulders(shade(A, 0.02), '#2a1414'));
      S_.push(`<path d="M62 176 q40 24 82 -4 l8 20 q-46 30 -96 4 z" fill="${shade(art.sub,-0.05)}" stroke="#2a1414" stroke-width="1"/>`);
      S_.push(`<path d="M100 200 l0 40" stroke="${shade(A,-0.2)}" stroke-width="4"/>`);
      break;
    case 'shinobi':
      S_.push(shoulders('#252b2e', '#12161a'));
      S_.push(`<path d="M66 182 q34 22 70 -2" stroke="#3a4247" stroke-width="6" fill="none"/>`);
      S_.push(`<path d="M100 176 l0 64" stroke="#1a1e22" stroke-width="3"/>`);
      break;
    case 'hide': case 'attush': case 'abo':
      S_.push(shoulders(shade(A, 0.08), '#2a2018'));
      S_.push(`<path d="M60 184 q40 22 80 -4 l6 18 q-44 26 -92 2 z" fill="${shade(art.sub,-0.1)}" stroke="#2a2018" stroke-width="1"/>`);
      for (let i = 0; i < 6; i++) S_.push(`<path d="M${46+i*22} 210 l6 12 l-12 0 z" fill="${shade(art.sub,0.2)}" opacity="0.8"/>`);
      break;
    case 'cham': case 'khmer':
      S_.push(shoulders(shade(A, 0.08), '#2a2410'));
      S_.push(`<path d="M64 182 q36 20 74 -2 l4 16 q-40 24 -84 0 z" fill="${M}" stroke="#7a6a10" stroke-width="1"/>`);
      S_.push(`<path d="M100 200 q-10 6 -8 18 q10 6 18 0 q2 -12 -10 -18 z" fill="${M}"/>`);
      break;
    case 'ming':
      S_.push(shoulders(shade(A, -0.05), '#1c1410'));
      for (let y = 0; y < 3; y++) S_.push(`<path d="M${40+y*4} ${196+y*15} h${120-y*8}" stroke="${shade(A,0.18)}" stroke-width="9" stroke-linecap="round"/>`);
      S_.push(`<ellipse cx="100" cy="198" rx="14" ry="12" fill="${M}" stroke="#2a2018" stroke-width="1.2"/>`);
      S_.push(`<path d="M100 186 q-6 12 6 12 q10 0 6 -12" stroke="#2a2018" stroke-width="1" fill="none"/>`);
      break;
    default:
      S_.push(shoulders(shade(A, 0), '#1a1614'));
  }
  return S_.join('');
}
