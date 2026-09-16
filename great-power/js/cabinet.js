/* ============================================================
   열강의 시대 1900 — 내각
   각 부처에 인물을 앉히고, 능력치만큼 국정이 달라진다.
   ============================================================ */

const POSTS = {
  pm : { n:'총리',     d:'국정 전반. 안정도와 정치력이 그의 손에 달렸다.',  key:['adm','cha'] },
  fin: { n:'재무대신', d:'세수와 건설비. 국고의 두께를 결정한다.',          key:['eco'] },
  war: { n:'국방대신', d:'군의 훈련과 교리. 전투력에 직결된다.',            key:['mil'] },
  for: { n:'외무대신', d:'교섭과 명분. 외교 비용과 효과를 좌우한다.',        key:['dip'] },
  int: { n:'내무대신', d:'치안과 행정. 지방의 불만을 눌러 둔다.',           key:['adm'] },
  ind: { n:'상공대신', d:'공업과 개발. 공장이 얼마나 빨리 서는가.',          key:['eco','adm'] },
  col: { n:'식민대신', d:'총독부와 해외 영지. 식민 수입을 짜낸다.',          key:['adm','cha'] },
};
const STAT_N = { adm:'행정', cha:'카리스마', mil:'군사', eco:'경제', dip:'외교' };

/* 인물 특성 — eff 는 내각 보정에 직접 더해진다 */
const MTRAITS = {
  ironblood : { n:'철혈',       d:'힘이 곧 질서다', eff:{atk:.08,stab:2}, rel:-6 },
  banker    : { n:'은행가 출신', d:'숫자를 읽는 눈', eff:{tax:.07} },
  corrupt   : { n:'부패',       d:'장부가 새어 나간다', eff:{tax:-.08,stab:-2} },
  reformer  : { n:'개혁가',     d:'낡은 것을 부순다', eff:{res:.08,stab:-1} },
  reaction  : { n:'수구파',     d:'선대의 법도를 지킨다', eff:{stab:3,res:-.06} },
  warlord   : { n:'군벌',       d:'군이 곧 그의 사병', eff:{atk:.10,def:.05,stab:-3} },
  scholar   : { n:'학자',       d:'서재에서 나온 정책', eff:{res:.09} },
  diplomat  : { n:'노회한 외교가', d:'스무 해의 공관 생활', eff:{dip:.15} },
  demagogue : { n:'선동가',     d:'군중을 움직인다', eff:{exh:-.15,stab:-1} },
  incompetent:{ n:'무능',       d:'자리만 지킨다', eff:{tax:-.05,res:-.05,stab:-2} },
  beloved   : { n:'국민적 인기', d:'거리에서 환호받는다', eff:{stab:4}, legit:2 },
  colonial  : { n:'식민지 경영자', d:'현지를 안다', eff:{col:.12} },
  engineer  : { n:'공학자',     d:'설계도를 직접 본다', eff:{ind:.08,bld:-.06} },
  spymaster : { n:'정보통',     d:'모든 것을 안다', eff:{stab:2,unrest:-2} },
  aristocrat: { n:'대귀족',     d:'혈통이 곧 권위', eff:{stab:2}, legit:3, rel:2 },
  populist  : { n:'대중정치가',  d:'표를 아는 사람', eff:{pp:.3,stab:1} },
};

/* 문화권별 이름 */
const NAMEPOOL = {
  ko:{ s:['김','이','박','최','정','강','조','윤','장','한','신','오','서','권','황'],
       g:['병하','규식','승훈','동녕','재형','준호','인영','태현','상현','기호','정식','원식','경석','희준'] },
  jp:{ s:['이토','야마가타','가쓰라','사이온지','오쿠마','이노우에','마쓰카타','데라우치','고무라','아오키','하라','다카하시'],
       g:['히로부미','아리토모','다로','긴모치','시게노부','가오루','마사요시','주타로','슈조','다카시'] },
  cn:{ s:['이','원','장','강','서','유','담','왕','육','심','증','좌','성','주'],
       g:['홍장','세개','지동','유위','계초','옥린','국번','종당','선회','조명'] },
  gb:{ s:['체임벌린','밸푸어','솔즈베리','그레이','애스퀴스','처칠','커즌','로이드조지','핼데인','캠벨배너먼','밀너','키치너','매켄나','하코트','버컨헤드','더비','리딩','시먼','런시먼','새뮤얼','에드워드 경','노스클리프','발포어','로즈베리'], g:[] },
  fr:{ s:['델카세','클레망소','푸앵카레','브리앙','카요','비비아니','리보','콩브','발덱루소','피숑','갈리에니','루비에','사리앙','뒤퓌','바르투','두메르그','조프르','포슈','말비','팽르베','타르디외'], g:[] },
  de:{ s:['폰 뷜로','티르피츠','홀슈타인','베트만홀베크','폰 몰트케','슐리펜','포자도프스키','발더제','슈튀르머','치르슈키','호엔로에','카프리비','뎀부르크','킬만제크','팔켄하인','루덴도르프','힌덴부르크','야고','조른','바세르만','슈트레제만','에르츠베르거'], g:[] },
  ru:{ s:['비테','플레베','스톨리핀','이즈볼스키','람스도르프','쿠로파트킨','두르노보','고레미킨','사조노프','코콥초프','슈튀르머','트레포프','포베도노스체프','밀류코프','로디잔코','브루실로프','알렉세예프','수호믈리노프','샤호프스코이','크리보셰인'], g:[] },
  it:{ s:['졸리티','손니노','티토니','크리스피','루차티','살란드라','산 줄리아노','오를란도','차넬라','보셀리','니티','파치오니','카도르나','디아츠','스포르차','알베르티니'], g:[] },
  es:{ s:['실벨라','마우라','카날레하스','모레트','사가스타','로마노네스','다토'], g:[] },
  tr:{ s:['사이드 파샤','페리드 파샤','카밀 파샤','탈라트','엔베르','제말','휘세인 힐미','하키 파샤'], g:[] },
  lat:{s:['실바','로드리게스','멘도사','카스트로','바르가스','오르티스','피게로아','아길라르','살라사르','두아르테'],
       g:['호세','카를로스','마누엘','안토니오','프란시스코','라몬','에두아르도','미겔'] },
  eu:{ s:['판 데르 베르흐','드 브라윈','뢰벤','안데르센','린드베리','올센','노바크','호르바트','야노시','페트로비치','베르흐만','스트란드','하우겐','뮐러','카르손','비르켈란','스벤손','옌센','로센','달베리','코바치','마르코비치'], g:[] },
  me:{ s:['알 라시드','알 사바','알 파루키','미르자','하이다르','나시르','바흐티아르','카시미'], g:[] },
};
const CULTURE = {
  KOR:'ko', JPN:'jp', QIN:'cn', GBR:'gb', USA:'gb', FRA:'fr', BEL:'fr', GER:'de', AUH:'de',
  SUI:'de', RUS:'ru', BUL:'ru', SER:'ru', MNE:'ru', ITA:'it', ESP:'es', POR:'es', OTT:'tr',
  PER:'me', AFG:'me', MOR:'me', OMA:'me', ETH:'me', EGY:'me',
  NLD:'eu', DEN:'eu', SWE:'eu', LUX:'eu', GRE:'eu', ROM:'eu', SIA:'eu', NEP:'eu', BHU:'eu',
};
function cultureOf(code){ return CULTURE[code] || 'lat'; }

/* ---------- 인물 생성 ---------- */
let MIN_SEQ = 1;
const NAME_USED = {};                       // 나라별로 같은 이름이 겹치지 않게
function makeMinister(code, post){
  const pool = NAMEPOOL[cultureOf(code)] || NAMEPOOL.lat;
  NAME_USED[code] = NAME_USED[code] || new Set();
  let name='';
  for(let i=0;i<24;i++){
    const s=pick(pool.s);
    name = (pool.g && pool.g.length) ? s+pick(pool.g) : s;
    if(!NAME_USED[code].has(name)) break;
    name='';
  }
  if(!name){                                 // 풀이 마르면 대수를 붙여 반드시 고유하게
    const s=pick(pool.s);
    const base = (pool.g&&pool.g.length)? s+pick(pool.g) : s;
    let gen=2;
    while(NAME_USED[code].has(base+' '+gen+'세')) gen++;
    name = base+' '+gen+'세';
  }
  NAME_USED[code].add(name);
  const stats = {};
  for(const k in STAT_N) stats[k] = 2 + Math.floor(rnd()*6);      // 2~7 기본
  // 해당 부처의 핵심 능력은 더 높게 뽑힌다
  for(const k of POSTS[post].key) stats[k] = Math.min(10, stats[k] + 1 + Math.floor(rnd()*3));
  const traits=[];
  const keys=Object.keys(MTRAITS);
  const cnt = rnd()<0.25 ? 2 : 1;
  while(traits.length<cnt){ const t=pick(keys); if(!traits.includes(t)) traits.push(t); }
  return {
    id: 'm'+(MIN_SEQ++), name, post,
    age: 42 + Math.floor(rnd()*28),
    stats, traits,
    loyalty: 40 + Math.floor(rnd()*55),
    since: null,
  };
}
function ministerScore(m){
  const key = POSTS[m.post].key;
  let v=0; for(const k of key) v+=m.stats[k];
  v/=key.length;
  for(const t of m.traits){ if(t==='incompetent') v-=1.5; if(t==='corrupt') v-=1; if(t==='beloved') v+=0.5; }
  return v;
}

function initCabinet(n){
  n.cabinet = {}; n.candidates = {};
  for(const post in POSTS){
    n.candidates[post] = [0,1,2,3].map(()=>makeMinister(n.code, post));
    // 처음 앉아 있는 사람은 그저 물려받은 인물이다 — 능력은 복불복
    const seat = pick(n.candidates[post]);
    appointMinister(n, post, seat.id, true);
  }
}
function appointMinister(n, post, id, free){
  const list=n.candidates[post]||[];
  const m=list.find(x=>x.id===id);
  if(!m) return {ok:false,msg:'그런 후보가 없다'};
  const cost = free? 0 : 20;
  if(n.pp < cost) return {ok:false,msg:`정치력이 부족하다 (필요 ${cost})`};
  n.pp -= cost;
  const old = n.cabinet[post];
  if(old){ n.candidates[post] = list.filter(x=>x.id!==id).concat([old]); }
  else { n.candidates[post] = list.filter(x=>x.id!==id); }
  m.since = G ? {y:G.year, m:G.month} : null;
  n.cabinet[post]=m;
  n._m = calcMods(n);
  if(!free && n.code===G.player)
    logEvent('임명', `${POSTS[post].n}에 ${m.name}을(를) 임명했다.`, 'politics', n.code);
  return {ok:true,msg:`${m.name} — ${POSTS[post].n} 임명`};
}
function dismissMinister(n, post){
  const m=n.cabinet[post];
  if(!m) return {ok:false,msg:'공석이다'};
  const cost=25;
  if(n.pp<cost) return {ok:false,msg:`정치력이 부족하다 (필요 ${cost})`};
  n.pp-=cost;
  delete n.cabinet[post];
  n.candidates[post]=(n.candidates[post]||[]).concat([m]);
  // 인기 있는 인물을 내치면 대가가 따른다
  let msg=`${m.name}을(를) ${POSTS[post].n}에서 해임했다`;
  if(m.traits.includes('beloved')){ n.stab-=6; msg+=' — 여론이 들끓는다'; }
  if(m.loyalty>75){ n.stab-=3; }
  if(m.traits.includes('warlord') && rnd()<0.3){
    n.stab-=8; msg+=' — 군부가 동요한다';
  }
  n._m=calcMods(n);
  if(n.code===G.player) logEvent('해임', msg, 'politics', n.code);
  return {ok:true,msg};
}

/* ---------- 내각 보정 ---------- */
function cabinetMods(n){
  const out={ tax:0, res:0, ind:0, atk:0, def:0, col:0, bld:0, grw:0, exh:0, dip:0,
              stab:0, pp:0, unrest:0, legit:0, rel:0 };
  if(!n.cabinet) return out;
  for(const post in POSTS){
    const m=n.cabinet[post];
    if(!m){ out.vac=(out.vac||0)+1; continue; }           // 공석은 뒤에서 한꺼번에 계산
    const key=POSTS[post].key;
    let k=0; for(const s of key) k+=m.stats[s]; k/=key.length;
    const d=(k-5);                                        // 5가 평범
    switch(post){
      case 'pm' : out.stab += d*1.1; out.pp += d*0.10; break;
      case 'fin': out.tax  += d*0.030; out.bld -= d*0.020; break;
      case 'war': out.atk  += d*0.028; out.def += d*0.022; break;
      case 'for': out.dip  += d*0.060; break;
      case 'int': out.unrest -= d*0.9; out.stab += d*0.45; break;
      case 'ind': out.ind  += d*0.028; out.grw += d*0.040; break;
      case 'col': out.col  += d*0.045; break;
    }
    for(const t of m.traits){
      const T=MTRAITS[t]; if(!T) continue;
      for(const kk in T.eff) out[kk]=(out[kk]||0)+T.eff[kk];
      if(T.legit) out.legit+=T.legit;
      if(T.rel) out.rel+=T.rel;
    }
  }
  if(out.vac){                                           // 공석 손해는 상한을 둔다
    out.stab -= Math.min(10, out.vac*2.0);
    out.pp   -= Math.min(0.9, out.vac*0.15);
  }
  return out;
}

/* ---------- 매달 처리 ---------- */
function cabinetTick(n){
  n.candidates=n.candidates||{}; n.cabinet=n.cabinet||{};
  // 후보 풀 보충
  for(const post in POSTS){
    n.candidates[post]=n.candidates[post]||[];
    if(n.candidates[post].length<3 && rnd()<0.08) n.candidates[post].push(makeMinister(n.code, post));
    if(n.candidates[post].length>6) n.candidates[post].shift();
  }
  const cm = n._m && n._m.cabRel !== undefined ? n._m.cabRel : 0;
  if(cm){                                                  // 철혈재상은 주변을 불편하게 만든다
    for(const cc in n.relations){
      n.relations[cc] = Math.max(-100, Math.min(100, n.relations[cc] + cm*0.02));
      if(G.nats[cc]) G.nats[cc].relations[n.code]=n.relations[cc];
    }
  }
  if(G.month!==0) return;                                  // 나이는 해마다
  for(const post in POSTS){
    const m=n.cabinet[post];
    if(!m) { if(n.code!==G.player) aiFillPost(n, post); continue; }
    m.age++;
    const risk = m.age>74 ? 0.22 : m.age>68 ? 0.10 : m.age>60 ? 0.035 : 0.008;
    if(rnd()<risk){
      delete n.cabinet[post];
      if(n.code===G.player)
        logEvent('부고', `${POSTS[post].n} ${m.name}이(가) ${m.age}세로 세상을 떠났다. 자리가 비었다.`, 'politics', n.code);
      if(n.code!==G.player) aiFillPost(n, post);
    } else if(m.loyalty<25 && rnd()<0.12){
      delete n.cabinet[post];
      n.candidates[post].push(m);
      if(n.code===G.player)
        logEvent('사임', `${POSTS[post].n} ${m.name}이(가) 사임했다.`, 'politics', n.code);
      if(n.code!==G.player) aiFillPost(n, post);
    }
  }
  for(const post in POSTS) if(!n.cabinet[post] && n.code!==G.player) aiFillPost(n, post);
}
function aiFillPost(n, post){
  const list=n.candidates[post]||[];
  if(!list.length){ n.candidates[post]=[makeMinister(n.code,post)]; }
  const best=n.candidates[post].slice().sort((a,b)=>ministerScore(b)-ministerScore(a))[0];
  if(best) appointMinister(n, post, best.id, true);
}

/* ---------- 패널 ---------- */
function statBar(v){
  const col = v>=8?'#5fb87a' : v>=6?'#c9a227' : v>=4?'#8fa3b5' : '#d15c5c';
  return `<div class="sbar"><i style="width:${v*10}%;background:${col}"></i></div>`;
}
function ministerCard(m, post, mode, n){
  const key=POSTS[post].key;
  const sc=ministerScore(m).toFixed(1);
  let h=`<div class="mcard ${mode==='in'?'seat':''}">
    <div class="mhd"><b>${esc(m.name)}</b><span class="tiny">${m.age}세 · 평점 ${sc}</span></div>
    <div class="mstats">`;
  for(const k in STAT_N){
    const hot=key.includes(k);
    h+=`<div class="mstat ${hot?'hot':''}"><span>${STAT_N[k]}</span>${statBar(m.stats[k])}<b>${m.stats[k]}</b></div>`;
  }
  h+=`</div><div class="mtr">`;
  for(const t of m.traits){
    const T=MTRAITS[t];
    const good = !['corrupt','incompetent','warlord','demagogue'].includes(t);
    h+=`<span class="mtrait ${good?'':'bad'}" title="${esc(T.d)}">${esc(T.n)}</span>`;
  }
  h+=`<span class="tiny" style="margin-left:auto">충성 ${m.loyalty}</span></div>`;
  if(mode==='in'){
    h+=`<div class="btnrow"><button class="btn sm red" data-act="dismiss" data-post="${post}">해임 (정치력 25)</button></div>`;
  } else {
    h+=`<div class="btnrow"><button class="btn sm gold" data-act="appoint" data-post="${post}" data-id="${m.id}"
        ${n.pp<20?'disabled':''}>임명 (정치력 20)</button></div>`;
  }
  return h+`</div>`;
}
function panelCabinet(){
  const n=G.nats[G.player];
  if(!n.cabinet || !Object.keys(n.candidates||{}).length) initCabinet(n);
  const cm=cabinetMods(n);
  const sel=UI.postSel && POSTS[UI.postSel] ? UI.postSel : null;

  let h=`<div class="sec"><h3>내각 총평</h3>
    <div class="tiny" style="margin-bottom:6px">장관의 능력치가 국정 수치에 그대로 반영된다. 공석은 손해다.</div>
    <div class="effs">`;
  const show={tax:'세수',res:'연구',ind:'산업',atk:'공격',def:'방어',col:'식민수입',bld:'건설비',grw:'성장',dip:'외교효과'};
  for(const k in show){ if(Math.abs(cm[k])<0.005) continue;
    h+=`<span class="eff">${show[k]} ${cm[k]>0?'+':''}${Math.round(cm[k]*100)}%</span>`; }
  if(cm.stab) h+=`<span class="eff">안정 ${cm.stab>0?'+':''}${cm.stab.toFixed(1)}</span>`;
  if(cm.unrest) h+=`<span class="eff">불만 ${cm.unrest>0?'+':''}${cm.unrest.toFixed(1)}</span>`;
  if(cm.pp) h+=`<span class="eff">정치력 ${cm.pp>0?'+':''}${cm.pp.toFixed(2)}</span>`;
  h+=`</div><div class="row" style="margin-top:6px"><span class="k">정치력</span><span class="v">${fmt(n.pp)}</span></div></div>`;

  if(sel){
    const P=POSTS[sel], cur=n.cabinet[sel];
    h+=`<div class="sec"><h3>${P.n}</h3><div class="tiny" style="margin-bottom:8px">${esc(P.d)}
      <br>핵심 능력: <b style="color:var(--gold2)">${P.key.map(k=>STAT_N[k]).join(' · ')}</b></div>`;
    h+= cur? ministerCard(cur, sel, 'in', n)
           : `<div class="card"><div class="muted">공석 — 안정도가 깎이고 있다.</div></div>`;
    h+=`<h3 style="margin-top:12px">후보자</h3>`;
    const list=(n.candidates[sel]||[]).slice().sort((a,b)=>ministerScore(b)-ministerScore(a));
    h+= list.length? list.map(m=>ministerCard(m, sel, 'out', n)).join('')
                   : `<div class="muted">추천할 만한 인물이 없다. 시간이 지나면 새 인물이 나타난다.</div>`;
    h+=`<div class="btnrow"><button class="btn sm" data-act="cabback">← 전체 부처</button></div></div>`;
    return h;
  }

  h+=`<div class="sec"><h3>부처</h3>`;
  for(const post in POSTS){
    const m=n.cabinet[post], P=POSTS[post];
    h+=`<div class="card"><h4>${P.n}
        <span class="tc">${m? '평점 '+ministerScore(m).toFixed(1) : '<span style="color:#d15c5c">공석</span>'}</span></h4>
      <div class="tiny">${m? esc(m.name)+' · '+m.age+'세 · '+m.traits.map(t=>MTRAITS[t].n).join(', ')
                          : '임명하지 않으면 안정도가 계속 깎인다'}</div>
      <div class="btnrow">
        <button class="btn sm ${m?'':'gold'}" data-act="cabpost" data-post="${post}">
          ${m?'교체 / 후보 보기':'임명하기'}</button>
        <span class="tiny" style="align-self:center;color:var(--dim2)">후보 ${(n.candidates[post]||[]).length}명</span>
      </div></div>`;
  }
  h+=`</div>`;
  return h;
}
