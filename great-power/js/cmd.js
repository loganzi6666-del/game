/* ============================================================
   열강의 시대 1900 — 명령 콘솔
   타이핑한 한국어를 게임 행동으로 해석한다. (외부 API 없음 · 무료)
   ============================================================ */

function normalize(s){
  return s.replace(/\s+/g,' ').trim()
    .replace(/(에게|에서|으로|로서|로|을|를|이|가|은|는|와|과|의|에)\b/g,' ')
    .replace(/\s+/g,' ').trim();
}
/* 국가 찾기 — 정식명·약칭·별칭 */
const NAT_ALIAS = {
  GBR:['영국','대영','브리튼','잉글랜드','영'], FRA:['프랑스','불란서','프'],
  GER:['독일','도이치','프로이센','독'], RUS:['러시아','로서아','소련','소비에트','노국','러'],
  AUH:['오스트리아','오헝','합스부르크','헝가리제국'], USA:['미국','미합중국','아메리카','미'],
  JPN:['일본','왜','일'], ITA:['이탈리아','이태리'], OTT:['오스만','터키','투르크','오토만'],
  QIN:['청','청나라','중국','중화','대청'], KOR:['한국','대한','조선','한'],
  ESP:['스페인','서반아'], NLD:['네덜란드','화란'], BEL:['벨기에'], POR:['포르투갈'],
  SWE:['스웨덴','노르웨이'], DEN:['덴마크'], SUI:['스위스'], GRE:['그리스'],
  ROM:['루마니아'], SER:['세르비아'], BUL:['불가리아'], PER:['페르시아','이란'],
  SIA:['시암','태국'], ETH:['에티오피아'], MEX:['멕시코'], BRA:['브라질'],
  ARG:['아르헨티나'], CHL:['칠레'], AFG:['아프가니스탄','아프간'], MOR:['모로코'],
};
function findNation(text){
  let best=null, bestLen=0;
  for(const c in G.nats){
    if(!G.nats[c].alive) continue;
    const cands=[G.nats[c].name, G.nats[c].adj, ...(NAT_ALIAS[c]||[])];
    for(const w of cands){
      if(w && w.length>=1 && text.includes(w) && w.length>bestLen){ best=c; bestLen=w.length; }
    }
  }
  return best;
}
// "한성·삼남"을 "한성"만 쳐도 찾을 수 있게 마디 단위로도 맞춰 본다
function provAliases(p){
  const out=[p.name.replace(/[·\s]/g,'')];
  for(const part of p.name.split(/[·\s]+/)) if(part.length>=2) out.push(part);
  return out;
}
function findProvince(text, filter){
  let best=null, bestLen=0;
  const t=text.replace(/[·\s]/g,'');
  for(const id in G.provs){
    const p=G.provs[id];
    if(filter && !filter(p)) continue;
    for(const nm of provAliases(p)){
      if(nm.length>=2 && t.includes(nm) && nm.length>bestLen){ best=id; bestLen=nm.length; }
    }
  }
  return best;
}
function findTech(text){
  let best=null,bestLen=0;
  for(const id in TECHS){
    const nm=TECHS[id].n.replace(/\s/g,'');
    if(text.replace(/\s/g,'').includes(nm) && nm.length>bestLen){ best=id; bestLen=nm.length; }
  }
  return best;
}
function firstNum(text, def){
  const m=text.match(/(\d+)/);
  return m? parseInt(m[1],10) : def;
}
const has=(t,...ws)=>ws.some(w=>t.includes(w));

function runCommand(raw){
  if(!raw||!raw.trim()) return;
  const T=normalize(raw);
  const me=G.nats[G.player];
  const say=(m,ok)=>toast(m, ok!==false);

  /* --- 치트 --- */
  if(has(T,'치트','cheat')){ toggleCheat(); return; }
  if(tryCheatCommand(T, raw)) return;

  /* --- 도움말 --- */
  if(has(T,'도움','명령어','헬프','help','?')){ showHelp(); return; }

  /* --- 턴 진행 --- */
  if(has(T,'다음달','다음 달','턴','진행','넘겨','한달','1개월')){ doNextTurn(); return; }

  /* --- 저장/불러오기 --- */
  if(has(T,'저장')){ saveGame(); return; }
  if(has(T,'불러')){ loadGame(); return; }

  /* --- 선전포고 --- */
  if(has(T,'선전포고','전쟁 선포','개전','쳐들어','전쟁을 건','전쟁 시작')){
    const c=findNation(T);
    if(!c) return say('어느 나라에 선전포고할지 알 수 없다. 예) "독일에 선전포고"', false);
    if(c===G.player) return say('자기 자신과는 싸울 수 없다.', false);
    let cb='border';
    if(has(T,'정복')) cb='conquer';
    else if(has(T,'식민')) cb='colony';
    else if(has(T,'속국')) cb='vassal';
    else if(has(T,'해방')) cb='liberate';
    else if(has(T,'굴욕','배상')) cb='humiliate';
    else if(has(T,'명분 없','무단')) cb='none';
    else { showWarModal(c); return; }
    const r=declareWar(G.player,c,cb);
    say(r.ok?`${G.nats[c].name}에 선전포고했다 (${CBS[cb].n})`:r.msg, r.ok);
    refreshAll(); return;
  }

  /* --- 강화 --- */
  if(has(T,'강화','평화','종전','휴전 제안','항복')){
    const wars=warsOf(G.player);
    if(!wars.length) return say('전쟁 중이 아니다.', false);
    const c=findNation(T);
    const w = c? wars.find(x=>x.att.includes(c)||x.def.includes(c)) : wars[0];
    if(!w) return say('그 나라와 전쟁 중이 아니다.', false);
    showPeaceModal(w.id); return;
  }

  /* --- 외교 --- */
  const dipMap=[
    [['동맹'],'alliance'], [['관계 개선','관계개선','친선','사절','우호'],'improve'],
    [['규탄','경고','비난'],'insult'], [['불가침'],'nap'], [['독립 보장','독립보장','보장'],'guarantee'],
    [['지원','원조','차관'],'subsidy'], [['조공'],'demandTrib'], [['동맹 파기','동맹파기','파기'],'breakally'],
  ];
  for(const [ws,act] of dipMap){
    if(has(T,...ws)){
      const c=findNation(T);
      if(!c) return say(`어느 나라와 ${ws[0]}할지 알 수 없다.`, false);
      const r=doDiplo(G.player,c,act);
      say(r.msg, r.ok); refreshAll(); return;
    }
  }

  /* --- 건설 --- */
  const bMap=[ [['공장','산업','개발','공업'],'factory'], [['요새','성채','방어시설'],'fort'],
               [['철도','철로','선로'],'rail'], [['총독부','행정부','통치'],'admin'] ];
  for(const [ws,type] of bMap){
    if(has(T,...ws) && has(T,'건설','짓','착공','세워','증설','부설','설치')){
      let id=findProvince(T, p=>p.own===G.player) || UI.sel;
      const usable = x => x && G.provs[x].own===G.player && G.provs[x].ctrl===G.player && !BUILDINGS[type].max(G.provs[x]);
      if(!usable(id)){
        // 지역을 안 적었거나 더 지을 수 없으면, 가장 값어치 있는 곳을 고른다
        const cands=ownedProvs(G.player).filter(p=>usable(p.id))
          .sort((x,y)=> (y.pop*(1/(y.dev+1))) - (x.pop*(1/(x.dev+1))));
        if(!cands.length) return say('더 지을 수 있는 지역이 없다.', false);
        id=cands[0];
        id=id.id;
      }
      const cnt=Math.min(6, firstNum(T,1));
      let okc=0, lastMsg='';
      for(let i=0;i<cnt;i++){ const r=startBuild(G.player,id,type); if(r.ok) okc++; else { lastMsg=r.msg; break; } }
      say(okc? `${G.provs[id].name}에 ${BUILDINGS[type].n} ${okc}건 착공` : lastMsg, okc>0);
      refreshAll(); return;
    }
  }

  /* --- 모병 --- */
  if(has(T,'모병','징집','사단','병력 증강','군대 늘','증원','동원')){
    const cnt=firstNum(T,1);
    let id=findProvince(T,p=>p.own===G.player) || UI.sel;
    if(!id||G.provs[id].own!==G.player) id=me.cap;
    const r=recruit(G.player,id,cnt); say(r.msg,r.ok); refreshAll(); return;
  }
  /* --- 해군 --- */
  if(has(T,'함선','군함','전함','해군','건함','척')){
    const cnt=firstNum(T,1);
    const r=buildShips(G.player,cnt); say(r.msg,r.ok); refreshAll(); return;
  }

  /* --- 공격 / 침공 --- */
  if(has(T,'공격','침공','진격','점령','쳐라','밀어')){
    const target=findProvince(T,p=>p.ctrl!==G.player);
    if(!target) return say('공격 목표 지역을 찾지 못했다. 예) "알자스 공격"', false);
    const from=Object.keys(me.armies).filter(id=>me.armies[id]>=1 && neighbours(id).includes(target))
      .sort((a,b)=>me.armies[b]-me.armies[a])[0];
    if(!from) return say(`${G.provs[target].name}에 인접한 우리 부대가 없다.`, false);
    const cnt=firstNum(T, me.armies[from]);
    const r=attack(G.player,from,target,Math.min(cnt,me.armies[from]));
    if(r.report){ showBattle(r.report); } else say(r.msg,false);
    refreshAll(); return;
  }

  /* --- 이동 --- */
  if(has(T,'이동','보내','파견','배치','옮겨')){
    // "A에서 B로" 처럼 방향이 분명하면 그대로 따른다 (조사 제거 전 원문에서 찾는다)
    const dir = raw.match(/([^\s,]+)\s*에서\s*([^\s,]+?)\s*(?:으로|로)(?![가-힣])/);
    if(dir){
      const f=findProvince(dir[1]), t2=findProvince(dir[2]);
      if(f && t2 && f!==t2){
        const cnt=firstNum(T, me.armies[f]||0);
        const r=moveArmy(G.player,f,t2,cnt); say(r.msg,r.ok); refreshAll(); return;
      }
    }
    const t=T.replace(/[·\s]/g,'');
    const found=[];
    for(const id in G.provs){
      if(provAliases(G.provs[id]).some(nm=>nm.length>=2 && t.includes(nm))) found.push(id);
    }
    found.sort((a,b)=>(G.nats[G.player].armies[b]||0)-(G.nats[G.player].armies[a]||0));
    if(found.length>=2){
      const from=found.find(i=>me.armies[i]>=1)||found[0];
      const to=found.find(i=>i!==from);
      const cnt=firstNum(T, me.armies[from]||0);
      const r=moveArmy(G.player,from,to,cnt); say(r.msg,r.ok); refreshAll(); return;
    }
    if(found.length===1 && UI.sel){
      const r=moveArmy(G.player,UI.sel,found[0],me.armies[UI.sel]||0); say(r.msg,r.ok); refreshAll(); return;
    }
    return say('출발지와 목적지를 함께 적어주세요. 예) "화북에서 만주로 이동"', false);
  }

  /* --- 연구 --- */
  if(has(T,'연구','기술','개발 착수')){
    const id=findTech(T);
    if(id){ const r=startResearch(G.player,TECHS[id].b,id); say(r.msg,r.ok); refreshAll(); return; }
    let b=null;
    if(has(T,'산업','공업','경제')) b='ind';
    else if(has(T,'정치','행정','사회')) b='pol';
    else if(has(T,'군사','군','무기')) b='mil';
    if(b){
      const av=availableTechs(me,b);
      if(!av.length) return say('지금 연구할 수 있는 기술이 없다.', false);
      const r=startResearch(G.player,b,av[0]); say(r.msg,r.ok); refreshAll(); return;
    }
    UI.tab='tech'; syncTabs(); renderPanel();
    return say('기술 탭을 열었다. 이름을 정확히 적으면 바로 착수한다.');
  }

  /* --- 정체 변혁 --- */
  if(has(T,'변혁','체제','정체','정부','개혁','혁명','전환')){
    let g=null;
    for(const k in GOVS) if(T.includes(GOVS[k].name.replace(/\s/g,''))||T.includes(GOVS[k].name)) g=k;
    if(has(T,'공화')) g=g||'rep';
    if(has(T,'입헌')) g=g||'con';
    if(has(T,'절대','전제')) g=g||'abs';
    if(has(T,'군사정권','군부')) g=g||'jun';
    if(has(T,'사회주의','공산')) g=g||'soc';
    if(has(T,'국가주의','파시')) g=g||'fas';
    if(!g){ UI.tab='pol'; syncTabs(); renderPanel(); return say('정치 탭을 열었다.'); }
    const r=changeGovernment(G.player,g); say(r.msg,r.ok); refreshAll(); return;
  }

  /* --- 재정 --- */
  if(has(T,'국채','차입','빌')){ const r=takeLoan(G.player, firstNum(T,100)); say(r.msg,r.ok); refreshAll(); return; }
  if(has(T,'상환','갚')){ const r=repayDebt(G.player, firstNum(T, Math.min(me.debt,me.gold))); say(r.msg,r.ok); refreshAll(); return; }
  if(has(T,'세율','증세','감세')){
    let v=firstNum(T,null);
    if(has(T,'증세')&&v==null) v=Math.round(me.taxRate*100)+10;
    if(has(T,'감세')&&v==null) v=Math.round(me.taxRate*100)-10;
    if(v==null) return say('세율을 숫자로 적어주세요. 예) "세율 110"', false);
    me.taxRate=Math.max(0.6,Math.min(1.4,v/100));
    say(`세율을 ${Math.round(me.taxRate*100)}%로 조정했다`); refreshAll(); return;
  }

  /* --- 화면 --- */
  if(has(T,'지도','보기','보여')){
    const id=findProvince(T);
    if(id){ UI.sel=id; UI.tab='prov'; syncTabs(); focusProv(id,true); refreshAll(); return say(`${G.provs[id].name}으로 이동`); }
    const c=findNation(T);
    if(c){ UI.dipSel=c; UI.tab='dip'; syncTabs(); focusProv(G.nats[c].cap,true); refreshAll(); return say(`${G.nats[c].name} 정보`); }
  }
  const c=findNation(T);
  if(c && c!==G.player){ UI.dipSel=c; UI.tab='dip'; syncTabs(); renderPanel(); return say(`${G.nats[c].name} 외교 화면`); }
  const pid=findProvince(T);
  if(pid){ UI.sel=pid; UI.tab='prov'; syncTabs(); focusProv(pid); refreshAll(); return say(`${G.provs[pid].name} 선택`); }

  say('무슨 뜻인지 알 수 없다. "도움말"을 입력해 보세요.', false);
}

function showHelp(){
  modal(`<div class="mh"><h2>명령 콘솔</h2><div class="ms">한국어로 적으면 그대로 실행된다. 외부 서버를 쓰지 않으므로 비용이 들지 않는다.</div></div>
  <div class="mb">
    <table class="t">
      <tr><th>하고 싶은 일</th><th>이렇게 적으면 된다</th></tr>
      <tr><td>전쟁</td><td>독일에 선전포고 / 청에 정복 전쟁 / 모로코에 식민지 요구</td></tr>
      <tr><td>전투</td><td>만주 공격 / 알자스 침공 10개 사단</td></tr>
      <tr><td>이동</td><td>화북에서 만주로 이동 / 부대를 우크라이나로 보내</td></tr>
      <tr><td>외교</td><td>프랑스와 동맹 / 영국 관계 개선 / 일본 규탄 / 시암 독립 보장</td></tr>
      <tr><td>강화</td><td>러시아와 강화 / 종전</td></tr>
      <tr><td>건설</td><td>공장 건설 / 화북에 요새 건설 / 철도 부설 3</td></tr>
      <tr><td>군비</td><td>5개 사단 모병 / 군함 3척 건조</td></tr>
      <tr><td>연구</td><td>드레드노트 연구 / 산업 연구 / 군사 기술</td></tr>
      <tr><td>정치</td><td>입헌군주제로 변혁 / 공화정 전환 / 세율 110</td></tr>
      <tr><td>재정</td><td>국채 200 / 부채 상환</td></tr>
      <tr><td>진행</td><td>다음 달 / 턴 / 저장 / 불러오기</td></tr>
      <tr><td>치트</td><td><b>F4</b> 또는 "치트" — 켜면 돈 5000 · 기술 전부 · 병력 30 · 즉시 승리 등이 먹힌다</td></tr>
    </table>
    <div class="tiny" style="margin-top:12px">
      지역 이름은 지도에 적힌 그대로 쓰면 된다(예: 화북, 우크라이나, 북인도).
      지역을 적지 않으면 <b>지도에서 선택한 지역</b>이 대상이 된다.
    </div>
  </div>
  <div class="mc"><button class="btn gold" style="width:100%" onclick="closeModals()">닫기</button></div>`);
}
