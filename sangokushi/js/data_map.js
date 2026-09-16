/* =========================================================
   東亞 群雄割據 — 지도 데이터 (실제 경위도 투영)
   x = (lon-95)*30+30 , y = (50-lat)*26+10
   ========================================================= */
'use strict';

const MAP_W = 1560, MAP_H = 1220;
function prj(lon, lat) { return [(lon - 95) * 30 + 30, (50 - lat) * 26 + 10]; }
function toPath(pts, close) {
  let d = '';
  pts.forEach((p, i) => { const q = prj(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' '; });
  return d + (close ? 'Z' : '');
}

/* ---------- 해안선 ---------- */
const LANDMASS = [
  { id: 'mainland', name: '대륙', pts: [
    [95,50],[102,50],[110,49.5],[117,50],[124,50],[130,49],[133,48],[135.2,48.5],
    [135.4,46],[133.2,45.6],[132,45],[131,43.5],[130.5,42.8],[130.2,42.3],
    [129.8,41.8],[129.6,40.6],[129.4,39.2],[129.6,38.3],[129.4,37],[129.3,36],[129.4,35.4],[129,35],
    [128.3,34.9],[127.5,34.5],[126.7,34.3],[126.3,34.6],[126.4,35.2],[126.5,36],[126.8,36.6],
    [126.4,37.2],[126.6,37.8],[126.2,38.3],[125.4,39.3],[124.8,39.8],[124.4,40.1],
    [123.5,40],[122.2,40.9],[121.8,40.5],[122.2,39.8],[122.7,39.6],[121.7,38.9],[121.2,39.7],
    [120.4,40.1],[119.5,39.9],[118.6,39.2],[117.7,39],[118.3,38.2],[118.9,37.9],[119.9,37.4],
    [121,37.6],[122.6,37.4],[122.2,36.9],[120.7,36.1],[119.5,35],[119.9,34.2],[120.3,33],
    [121.5,32.1],[121.8,31.1],[121,30.8],[120.4,30.3],[121.7,29.9],[121.7,29],[121.1,28.3],
    [120.6,27.5],[119.6,26.4],[118.9,25.4],[118.1,24.5],[117.2,23.6],[115.8,22.7],[114.3,22.2],
    [113.6,22.9],[113.2,22.1],[112.3,21.8],[111.2,21.4],[110.5,21.2],[110.4,20.3],[109.9,20.3],
    [109.6,21.3],[108.8,21.5],[108.1,21.5],[106.8,20.7],[106.5,20.2],[106.1,19.4],[105.9,18.8],
    [106.6,17.9],[107.5,17.1],[108.3,16.1],[109.1,15.1],[109.3,13.8],[109.4,12.7],[109.2,11.7],
    [108.2,11],[107,10.7],[106.7,10.4],[105.8,9.5],[105.1,9],[104.8,9.6],[104.9,10.5],
    [104.1,10.4],[103.5,10.7],[102.8,11.7],[102,12.5],[101,12.6],[100.5,13.3],[100,13.5],
    [99.9,12],[99.5,11],[99.2,10.5],[98,10.5],[97.4,13],[97,15],[97.5,18],[98,20],[97.8,22],
    [98,24],[98.5,26],[98,28],[97,30],[96,33],[95,36],[95,50]
  ]},
  { id: 'honshu', name: '본주', pts: [
    [140.5,41.5],[141.5,40.5],[141.0,38.5],[141.1,37.0],[140.6,36.1],[140.9,35.6],[139.7,34.9],
    [138.8,34.6],[137.0,34.5],[136.8,34.0],[135.8,33.6],[135.1,33.9],[134.2,34.3],[133.0,34.3],
    [132.2,33.9],[131.0,34.0],[131.5,34.4],[132.7,35.0],[133.9,35.5],[135.0,35.7],[135.9,35.5],
    [136.8,36.6],[137.9,37.0],[139.0,37.9],[139.9,39.9],[140.0,40.5]
  ]},
  { id: 'hokkaido', name: '하이', pts: [
    [140.0,42.3],[141.0,42.0],[141.9,42.6],[143.0,42.0],[144.4,43.0],[145.3,43.3],[145.1,44.3],
    [143.0,44.3],[141.6,45.4],[141.0,44.0],[140.3,42.6]
  ]},
  { id: 'kyushu', name: '구주', pts: [
    [130.9,33.9],[131.7,33.6],[131.7,33.0],[131.3,31.6],[130.7,31.0],[130.2,31.2],[130.2,32.2],
    [129.4,32.9],[129.9,33.5],[130.3,33.7]
  ]},
  { id: 'shikoku', name: '사국', pts: [
    [134.6,34.3],[134.7,34.0],[134.2,33.5],[133.3,33.2],[132.4,33.0],[132.6,33.6],[133.4,34.0]
  ]},
  { id: 'taiwan', name: '대만', pts: [
    [121.0,25.3],[121.9,25.1],[121.8,24.4],[121.0,22.6],[120.6,21.9],[120.2,22.6],[120.1,23.7],[120.8,25.1]
  ]},
  { id: 'hainan', name: '경주', pts: [ [110.2,20.1],[110.6,19.3],[109.8,18.4],[108.7,19.3],[108.9,19.9] ]},
  { id: 'jeju', name: '탐라', pts: [ [126.2,33.55],[126.95,33.55],[126.95,33.2],[126.2,33.2] ]},
  { id: 'sakhalin', name: '고엽', pts: [ [142.0,45.9],[143.4,46.5],[143.0,48.5],[142.8,50],[141.9,50],[141.7,47.5],[141.6,46.3] ]},
  { id: 'okinawa', name: '유구', pts: [ [127.6,26.6],[128.3,26.7],[128.0,26.1],[127.6,26.1] ]},
  { id: 'tsushima', name: '대마', pts: [ [129.2,34.6],[129.5,34.3],[129.3,34.05],[129.1,34.3] ]},
  { id: 'awaji', name: '담로', pts: [ [134.7,34.55],[135.05,34.5],[134.85,34.2],[134.65,34.3] ]},
  { id: 'sado', name: '좌도', pts: [ [138.2,38.3],[138.55,38.2],[138.3,37.85],[138.0,38.05] ]}
];

/* ---------- 큰 하천 ---------- */
const RIVERS = [
  { name: '黃河', pts: [[103,36],[105,37.5],[107,39.5],[110,40.5],[112,39],[110.5,36],[111,34.8],[114,34.9],[116,35.5],[118,37],[119,37.8]] },
  { name: '長江', pts: [[100,28],[102,28.5],[104,29.5],[106.5,29.6],[108,30.7],[110,30.9],[112.5,30.5],[114.3,30.6],[116,30],[117.5,30.8],[118.8,32],[120,32],[121.8,31.3]] },
  { name: '漢江', pts: [[128,37.4],[127.2,37.45],[126.75,37.6],[126.4,37.85]] },
  { name: '洛東江', pts: [[128.9,36.7],[128.35,35.8],[128.8,35.3],[128.95,35.08]] },
  { name: '大同江', pts: [[126.6,39.5],[125.9,39.1],[125.4,38.85],[125.0,38.7]] },
  { name: '湄公河', pts: [[101,21],[102,19],[103,17.9],[104.8,16.5],[105.8,15],[105.9,13.5],[105.4,12],[106,11],[106.7,10.4]] },
  { name: '紅河', pts: [[102.5,23.4],[104,22.5],[105.8,21.0],[106.5,20.3]] },
  { name: '珠江', pts: [[107,23.5],[109.5,23.3],[111.3,23.4],[113.1,23.1],[113.5,22.5]] }
];

/* ---------- 해역 이름 ---------- */
const SEA_LABELS = [
  { t: '東海',   lon: 132.0, lat: 38.5, s: 30 },
  { t: '黃海',   lon: 123.5, lat: 35.0, s: 30 },
  { t: '南海',   lon: 114.0, lat: 16.0, s: 34 },
  { t: '東支那海', lon: 125.5, lat: 28.5, s: 26 },
  { t: '太平洋', lon: 143.5, lat: 33.0, s: 34 },
  { t: '渤海',   lon: 120.0, lat: 38.6, s: 17 },
  { t: '瀬戸內海', lon: 133.4, lat: 34.05, s: 12 }
];

/* ---------- 州郡(도시) ----------
   a:농업상한 c:상업상한 p:인구상한(천) w:성벽상한 t:지형 big:대도시 port:항구  */
const PROVINCES = [
/* === 한반도 12 === */
{id:'yodong',  name:'요동',  han:'遼東', region:'kr', lon:123.2, lat:41.3, t:'plain',  a:170,c:130,p:290,w:230, port:1, big:1, note:'국내성·안시성의 요새지대'},
{id:'pyeongyang',name:'평양',han:'平壤', region:'kr', lon:125.7, lat:39.0, t:'river',  a:190,c:160,p:330,w:250, port:1, big:1, note:'대동강의 왕도'},
{id:'gaeseong', lp:'left',name:'개성',  han:'開城', region:'kr', lon:126.55,lat:37.97,t:'plain',  a:160,c:190,p:280,w:200, port:1, big:0, note:'송악의 상업도시'},
{id:'hanseong', lp:'right',name:'한성',  han:'漢城', region:'kr', lon:127.0, lat:37.55,t:'river',  a:180,c:200,p:330,w:220, port:1, big:1, note:'한강 유역의 요충'},
{id:'gangneung',name:'강릉', han:'江陵', region:'kr', lon:128.9, lat:37.75,t:'mount',  a:120,c:110,p:170,w:190, port:1, big:0, note:'태백산맥의 관문'},
{id:'cheongju',name:'청주',  han:'淸州', region:'kr', lon:127.5, lat:36.6, t:'plain',  a:200,c:140,p:250,w:180, port:0, big:0, note:'삼남으로 통하는 교차로'},
{id:'sangju', lp:'right',  name:'상주',  han:'尙州', region:'kr', lon:128.16,lat:36.4, t:'basin',  a:180,c:130,p:230,w:190, port:0, big:0, note:'조령의 방벽'},
{id:'jeonju',  name:'전주',  han:'全州', region:'kr', lon:127.15,lat:35.8, t:'plain',  a:230,c:140,p:260,w:180, port:0, big:0, note:'호남평야의 곡창'},
{id:'naju',    name:'나주',  han:'羅州', region:'kr', lon:126.7, lat:35.0, t:'coast',  a:200,c:160,p:230,w:170, port:1, big:0, note:'서남해 수군의 본영'},
{id:'jinju', lp:'down',   name:'진주',  han:'晉州', region:'kr', lon:128.1, lat:35.2, t:'mount',  a:150,c:130,p:200,w:210, port:1, big:0, note:'남강의 석성'},
{id:'gyeongju', lp:'right',name:'경주',  han:'慶州', region:'kr', lon:129.2, lat:35.85,t:'basin',  a:170,c:180,p:300,w:220, port:1, big:1, note:'금성, 천년의 도읍'},
{id:'jeju', lp:'down',    name:'제주',  han:'濟州', region:'kr', lon:126.55,lat:33.4, t:'island', a:100,c:130,p:120,w:140, port:1, big:0, note:'탐라의 목마장'},
/* === 일본 16 === */
{id:'ezo',     name:'에조',  han:'蝦夷', region:'jp', lon:141.3, lat:43.1, t:'snow',   a:90, c:90, p:110,w:120, port:1, big:0, note:'아이누의 땅'},
{id:'mutsu',   name:'무츠',  han:'陸奧', region:'jp', lon:141.15,lat:38.3, t:'plain',  a:160,c:120,p:220,w:190, port:1, big:0, note:'오슈 기마의 고장'},
{id:'dewa', lp:'left',    name:'데와',  han:'出羽', region:'jp', lon:140.1, lat:39.7, t:'mount',  a:140,c:110,p:180,w:170, port:1, big:0, note:'모가미강의 분지'},
{id:'echigo',  name:'에치고',han:'越後', region:'jp', lon:139.0, lat:37.9, t:'snow',   a:190,c:140,p:250,w:200, port:1, big:0, note:'설국의 쌀과 청동'},
{id:'kanto',   name:'간토',  han:'關東', region:'jp', lon:139.7, lat:35.7, t:'plain',  a:210,c:200,p:340,w:240, port:1, big:1, note:'관동평야, 오다와라의 철벽'},
{id:'kai', lp:'down',     name:'카이',  han:'甲斐', region:'jp', lon:138.6, lat:35.66,t:'mount',  a:130,c:150,p:200,w:180, port:0, big:0, note:'갑주 금광과 기마군단'},
{id:'kaga', lp:'right',    name:'카가',  han:'加賀', region:'jp', lon:136.65,lat:36.6, t:'coast',  a:180,c:150,p:220,w:180, port:1, big:0, note:'호쿠리쿠의 문호'},
{id:'owari', lp:'right',   name:'오와리',han:'尾張', region:'jp', lon:136.9, lat:35.2, t:'plain',  a:180,c:230,p:290,w:190, port:1, big:0, note:'쓰시마 교역과 철포의 고을'},
{id:'omi', lp:'left',     name:'오미',  han:'近江', region:'jp', lon:136.0, lat:35.1, t:'river',  a:190,c:200,p:260,w:210, port:1, big:0, note:'비와호의 교차로'},
{id:'yamashiro', lp:'left',name:'야마시로',han:'山城',region:'jp',lon:135.75,lat:35.0,t:'basin',  a:150,c:250,p:320,w:200, port:0, big:1, note:'교토, 천하의 정통'},
{id:'settsu', lp:'down',  name:'셋츠',  han:'攝津', region:'jp', lon:135.5, lat:34.7, t:'coast',  a:150,c:260,p:300,w:230, port:1, big:1, note:'오사카 만의 거대 상권'},
{id:'izumo', lp:'left',   name:'이즈모',han:'出雲', region:'jp', lon:133.05,lat:35.47,t:'mount',  a:140,c:150,p:180,w:180, port:1, big:0, note:'다타라 제철의 본향'},
{id:'aki',     name:'아키',  han:'安藝', region:'jp', lon:132.45,lat:34.4, t:'coast',  a:150,c:190,p:230,w:190, port:1, big:0, note:'세토내해 수군의 근거'},
{id:'tosa',    name:'도사',  han:'土佐', region:'jp', lon:133.5, lat:33.55,t:'forest', a:130,c:120,p:160,w:160, port:1, big:0, note:'이치료구소쿠의 향사들'},
{id:'chikuzen',name:'치쿠젠',han:'筑前', region:'jp', lon:130.4, lat:33.6, t:'coast',  a:170,c:230,p:270,w:200, port:1, big:1, note:'하카타, 대륙 무역의 창구'},
{id:'satsuma', name:'사츠마',han:'薩摩', region:'jp', lon:130.55,lat:31.6, t:'coast',  a:140,c:180,p:200,w:190, port:1, big:0, note:'남만선과 사츠마 무사'},
/* === 중국 18 === */
{id:'beiping', name:'북평',  han:'北平', region:'cn', lon:116.4, lat:39.9, t:'plain',  a:190,c:200,p:340,w:250, port:1, big:1, note:'유주, 북방 기병의 관문'},
{id:'ye',      name:'업',    han:'鄴',   region:'cn', lon:114.5, lat:36.1, t:'plain',  a:240,c:210,p:400,w:260, port:0, big:1, note:'기주, 천하제일의 곡창'},
{id:'taiyuan', name:'태원',  han:'太原', region:'cn', lon:112.55,lat:37.87,t:'plateau',a:150,c:150,p:240,w:240, port:0, big:0, note:'병주, 흉노와 맞선 고원'},
{id:'luoyang', name:'낙양',  han:'洛陽', region:'cn', lon:112.45,lat:34.6, t:'basin',  a:190,c:260,p:390,w:260, port:0, big:1, note:'한실의 옛 도읍'},
{id:'changan', name:'장안',  han:'長安', region:'cn', lon:108.9, lat:34.27,t:'basin',  a:200,c:230,p:360,w:260, port:0, big:1, note:'관중의 왕도'},
{id:'wuwei',   name:'무위',  han:'武威', region:'cn', lon:102.6, lat:37.9, t:'plateau',a:120,c:170,p:190,w:200, port:0, big:0, note:'양주, 서역 상단과 군마'},
{id:'linzi', lp:'right',   name:'임치',  han:'臨淄', region:'cn', lon:118.3, lat:36.85,t:'plain',  a:200,c:220,p:330,w:210, port:1, big:1, note:'청주, 제나라의 옛 부'},
{id:'xuzhou', lp:'left',  name:'서주',  han:'徐州', region:'cn', lon:117.2, lat:34.26,t:'plain',  a:210,c:190,p:320,w:220, port:0, big:1, note:'사통팔달의 요지'},
{id:'shouchun', lp:'left',name:'수춘',  han:'壽春', region:'cn', lon:116.8, lat:32.6, t:'river',  a:200,c:170,p:270,w:220, port:1, big:0, note:'회남의 물길'},
{id:'jianye', lp:'right',  name:'건업',  han:'建業', region:'cn', lon:118.8, lat:32.06,t:'river',  a:190,c:240,p:340,w:250, port:1, big:1, note:'강동의 제왕지택'},
{id:'huiji',   name:'회계',  han:'會稽', region:'cn', lon:120.6, lat:30.0, t:'coast',  a:190,c:230,p:300,w:200, port:1, big:1, note:'강남의 비단과 대선단'},
{id:'xiangyang', lp:'left',name:'양양', han:'襄陽', region:'cn', lon:112.1, lat:32.0, t:'river',  a:180,c:180,p:270,w:250, port:1, big:0, note:'천하의 목구멍'},
{id:'jingzhou', lp:'down',name:'형주',  han:'荊州', region:'cn', lon:112.2, lat:30.35,t:'river',  a:220,c:190,p:310,w:230, port:1, big:1, note:'강릉, 장강 중류의 대성'},
{id:'changsha',name:'장사',  han:'長沙', region:'cn', lon:112.95,lat:28.2, t:'plain',  a:210,c:160,p:260,w:190, port:1, big:0, note:'형남 사군의 중심'},
{id:'chengdu', name:'성도',  han:'成都', region:'cn', lon:104.07,lat:30.67,t:'basin',  a:250,c:210,p:370,w:240, port:0, big:1, note:'촉의 천부지토'},
{id:'hanzhong',name:'한중',  han:'漢中', region:'cn', lon:107.0, lat:33.07,t:'mount',  a:160,c:140,p:210,w:250, port:0, big:0, note:'검각의 험로'},
{id:'nanzhong',name:'남중',  han:'南中', region:'cn', lon:102.7, lat:25.0, t:'jungle', a:130,c:130,p:180,w:170, port:0, big:0, note:'남만의 상병(象兵)'},
{id:'panyu',   name:'번우',  han:'番禺', region:'cn', lon:113.3, lat:23.1, t:'coast',  a:170,c:250,p:280,w:190, port:1, big:1, note:'광주, 남해 교역의 문'},
/* === 베트남 5 === */
{id:'daila',   name:'대라',  han:'大羅', region:'vn', lon:105.85,lat:21.03,t:'river',  a:210,c:200,p:300,w:220, port:1, big:1, note:'홍하 삼각주의 도읍'},
{id:'thanhhoa', lp:'left',name:'청화',  han:'淸化', region:'vn', lon:105.78,lat:19.8, t:'coast',  a:180,c:150,p:220,w:190, port:1, big:0, note:'남쪽 왕조들의 발상지'},
{id:'thuanhoa', lp:'right',name:'순화',  han:'順化', region:'vn', lon:107.6, lat:16.47,t:'coast',  a:150,c:170,p:200,w:200, port:1, big:0, note:'후에, 협착한 회랑'},
{id:'champa',  name:'참파',  han:'占城', region:'vn', lon:109.2, lat:13.77,t:'coast',  a:140,c:190,p:190,w:190, port:1, big:0, note:'비자야, 참족의 해상왕국'},
{id:'saigon',  name:'사이공',han:'柴棍', region:'vn', lon:106.7, lat:10.78,t:'jungle', a:200,c:180,p:220,w:170, port:1, big:0, note:'메콩의 습지와 크메르'},
/* === 대만 3 === */
{id:'taibei',  name:'대북',  han:'臺北', region:'tw', lon:121.5, lat:25.05,t:'coast',  a:130,c:200,p:190,w:180, port:1, big:0, note:'단수이, 해상세력의 관문'},
{id:'tainan', lp:'left',  name:'대남',  han:'臺南', region:'tw', lon:120.2, lat:23.0, t:'coast',  a:170,c:190,p:200,w:200, port:1, big:0, note:'열란차성과 대둔평야'},
{id:'hualien', lp:'right', name:'화련',  han:'花蓮', region:'tw', lon:121.6, lat:23.98,t:'mount',  a:100,c:100,p:110,w:150, port:1, big:0, note:'동부 산악, 원주민의 영역'}
];

/* ---------- 가도 / 항로 ---------- */
const LINKS = [
  // 한반도
  ['yodong','pyeongyang','land'],['yodong','beiping','land'],['pyeongyang','gaeseong','land'],
  ['pyeongyang','gangneung','mount'],['gaeseong','hanseong','land'],['gaeseong','cheongju','land'],
  ['hanseong','cheongju','land'],['hanseong','gangneung','mount'],['gangneung','sangju','mount'],
  ['gangneung','gyeongju','land'],['cheongju','jeonju','land'],['cheongju','sangju','land'],
  ['sangju','gyeongju','land'],['sangju','jinju','mount'],['jeonju','naju','land'],
  ['jeonju','jinju','land'],['naju','jinju','land'],['naju','jeju','sea'],
  ['gyeongju','jinju','land'],['gyeongju','chikuzen','sea'],['jeju','satsuma','sea'],
  // 일본
  ['ezo','mutsu','sea'],['mutsu','dewa','mount'],['dewa','echigo','land'],['echigo','kanto','mount'],
  ['echigo','kai','mount'],['echigo','kaga','land'],['kanto','kai','mount'],['kai','owari','mount'],
  ['owari','omi','land'],['omi','yamashiro','land'],['omi','kaga','mount'],['yamashiro','settsu','land'],
  ['settsu','aki','sea'],['settsu','tosa','sea'],['kaga','izumo','land'],['izumo','aki','mount'],
  ['aki','chikuzen','sea'],['aki','tosa','sea'],['tosa','chikuzen','sea'],['chikuzen','satsuma','land'],
  ['satsuma','taibei','sea'],
  // 중국
  ['beiping','ye','land'],['beiping','taiyuan','mount'],['ye','taiyuan','mount'],['ye','linzi','land'],
  ['ye','luoyang','land'],['taiyuan','luoyang','mount'],['taiyuan','changan','mount'],
  ['luoyang','changan','land'],['luoyang','xiangyang','land'],['luoyang','xuzhou','land'],
  ['changan','hanzhong','mount'],['changan','wuwei','land'],['wuwei','hanzhong','mount'],
  ['linzi','xuzhou','land'],['xuzhou','shouchun','land'],['shouchun','jianye','river'],
  ['shouchun','xiangyang','land'],['jianye','huiji','land'],['huiji','changsha','land'],
  ['huiji','panyu','sea'],['huiji','taibei','sea'],['xiangyang','jingzhou','river'],
  ['xiangyang','hanzhong','mount'],['xiangyang','changsha','land'],['jingzhou','changsha','river'],
  ['jingzhou','chengdu','river'],['chengdu','hanzhong','mount'],['chengdu','nanzhong','mount'],
  ['changsha','panyu','mount'],['nanzhong','daila','jungle'],['panyu','daila','land'],
  ['panyu','tainan','sea'],['panyu','champa','sea'],
  // 베트남
  ['daila','thanhhoa','land'],['thanhhoa','thuanhoa','coast'],['thuanhoa','champa','coast'],
  ['champa','saigon','coast'],['saigon','nanzhong','jungle'],
  // 대만
  ['taibei','tainan','land'],['taibei','hualien','mount'],['tainan','hualien','mount']
];

const TERRAIN = {
  plain:  {n:'평야',  def:1.00, atk:1.00, agri:1.10, move:1.0, cav:1.20, bow:1.00, foot:1.00},
  river:  {n:'하천',  def:1.15, atk:0.92, agri:1.15, move:0.9, cav:0.85, bow:1.05, foot:1.00, navy:1.25},
  mount:  {n:'산악',  def:1.35, atk:0.80, agri:0.85, move:0.7, cav:0.60, bow:1.20, foot:1.15},
  forest: {n:'삼림',  def:1.22, atk:0.86, agri:0.90, move:0.8, cav:0.70, bow:1.15, foot:1.10, ambush:1.3},
  coast:  {n:'해안',  def:1.05, atk:1.00, agri:1.00, move:1.0, cav:1.00, bow:1.00, foot:1.00, navy:1.30},
  island: {n:'도서',  def:1.20, atk:0.95, agri:0.80, move:0.8, cav:0.80, bow:1.00, foot:1.00, navy:1.40},
  jungle: {n:'밀림',  def:1.30, atk:0.82, agri:0.95, move:0.65,cav:0.55, bow:1.10, foot:1.15, ambush:1.4},
  plateau:{n:'고원',  def:1.12, atk:0.95, agri:0.80, move:0.9, cav:1.30, bow:1.05, foot:0.95},
  basin:  {n:'분지',  def:1.18, atk:0.94, agri:1.20, move:0.95,cav:0.95, bow:1.05, foot:1.05},
  snow:   {n:'설원',  def:1.15, atk:0.90, agri:0.75, move:0.8, cav:0.90, bow:1.00, foot:1.10}
};

const REGIONS = {
  kr: {n:'한반도', han:'韓半島', color:'#4a7fb5'},
  jp: {n:'일본',   han:'日本',   color:'#b5504a'},
  cn: {n:'중국',   han:'中國',   color:'#c9a227'},
  vn: {n:'베트남', han:'越南',   color:'#4a9e6b'},
  tw: {n:'대만',   han:'臺灣',   color:'#8a6bb5'}
};

const PROV_BY_ID = {};
PROVINCES.forEach(p => { PROV_BY_ID[p.id] = p; p.xy = prj(p.lon, p.lat); });
const ADJ = {};
PROVINCES.forEach(p => ADJ[p.id] = []);
LINKS.forEach(([a, b, t]) => { ADJ[a].push({to:b, t}); ADJ[b].push({to:a, t}); });
