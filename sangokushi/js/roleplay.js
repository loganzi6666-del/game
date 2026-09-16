/* =========================================================
   東亞 群雄割據 — 장수 플레이 / 재야(방랑) 플레이
   ========================================================= */
'use strict';

const RP = {
  /* ---------- 임무 ---------- */
  missions: [
    {id:'m_farm',  n:'농업 진흥',  d:'부임지의 농업을 일으켜라', check:(g,a)=>a==='farm',  rew:70},
    {id:'m_trade', n:'상업 진흥',  d:'부임지의 상업을 일으켜라', check:(g,a)=>a==='trade', rew:70},
    {id:'m_drill', n:'병 조련',    d:'병사를 조련하여 전력을 높여라', check:(g,a)=>a==='drill', rew:80},
    {id:'m_levy',  n:'병력 모집',  d:'병력을 모아라', check:(g,a)=>a==='levy', rew:80},
    {id:'m_order', n:'치안 확립',  d:'순찰로 치안을 회복하라', check:(g,a)=>a==='patrol', rew:60},
    {id:'m_wall',  n:'성벽 보수',  d:'성벽을 튼튼히 하라', check:(g,a)=>a==='wall', rew:75},
    {id:'m_rec',   n:'인재 초빙',  d:'재야의 인재를 등용하라', check:(g,a)=>a==='recruit'||a==='search', rew:110},
    {id:'m_spy',   n:'적정 탐색',  d:'적 도시의 사정을 살펴라', check:(g,a)=>a==='spy', rew:100},
    {id:'m_war',   n:'출진',       d:'적을 쳐서 공을 세워라', check:(g,a)=>a==='attack', rew:180}
  ],
  assignMission(g) {
    const f = fOf(g.faction); if (!f) { S.player.mission = null; return; }
    const p = PROV_BY_ID[g.loc];
    let pool = RP.missions.slice();
    if (p && p.owner === g.faction) {
      const front = ADJ[p.id].some(a => PROV_BY_ID[a.to].owner !== g.faction);
      if (!front) pool = pool.filter(m => m.id !== 'm_war');
      if (p.order > 75) pool = pool.filter(m => m.id !== 'm_order');
    }
    const m = pick(pool);
    S.player.mission = {id:m.id, done:false, turn:S.turn};
    return m;
  },
  missionDef(id) { return RP.missions.find(m => m.id === id); },
  reportAction(g, act) {
    const ms = S.player.mission;
    if (!ms || ms.done) return null;
    const def = RP.missionDef(ms.id);
    if (def && def.check(g, act)) {
      ms.done = true;
      g.merit += def.rew; S.player.merit += def.rew;
      const f = fOf(g.faction);
      if (f) f.gold += 0;
      checkPromote(g);
      return `임무「${def.n}」을 완수했다! 공적 +${def.rew}`;
    }
    return null;
  },

  /* ---------- 장수 개인 행동 ---------- */
  officerActions(g) {
    const p = PROV_BY_ID[g.loc], f = fOf(g.faction);
    const gov = p && p.gov === g.name, ruler = f && f.ruler === g.name;
    const A = [];
    const canCiv = p && p.owner === g.faction && (gov || ruler || g.rank >= 2);
    if (canCiv) ['farm','trade','water','wall','patrol','levy','drill'].forEach(o => A.push({id:o, kind:'order'}));
    else if (p && p.owner === g.faction) ['patrol','drill'].forEach(o => A.push({id:o, kind:'order'}));
    A.push({id:'train_war', n:'무예 수련', d:'무력이 오를 수 있다 (부상 위험 소)', gold:0, kind:'self'});
    A.push({id:'train_int', n:'독서',      d:'지력이 오를 수 있다', gold:0, kind:'self'});
    A.push({id:'train_pol', n:'정무 견습', d:'정치가 오를 수 있다', gold:0, kind:'self'});
    A.push({id:'train_lead',n:'병법 연구', d:'통솔이 오를 수 있다', gold:0, kind:'self'});
    A.push({id:'befriend',  n:'친교',      d:'동료 장수와 친분을 쌓는다 (충성·유대)', gold:60, kind:'self'});
    A.push({id:'advise',    n:'진언',      d:'주군에게 계책을 올린다 (공적·세력 이익)', gold:0, kind:'self'});
    A.push({id:'spar',      n:'연무(演武)', d:'동료와 무예를 겨룬다 — 무력·통솔 성장과 유대', gold:0, kind:'self'});
    A.push({id:'oath',      n:'의형제 결의', d:'뜻이 맞는 동료와 형제의 의를 맺는다 (전투 결속 +5%)', gold:200, kind:'self'});
    A.push({id:'hunt',      n:'도적 토벌', d:'치안을 회복하고 공적을 얻는다', gold:0, kind:'self'});
    if (g.rank >= 1) A.push({id:'recruit_p', n:'등용', d:'같은 도시의 재야를 등용한다', gold:100, kind:'self'});
    A.push({id:'search_p', n:'인재탐색', d:'숨은 인재를 찾는다', gold:80, kind:'self'});
    A.push({id:'move_p',   n:'이동',     d:'아군 도시로 옮긴다', gold:40, kind:'self'});
    if (g.rank >= 4 || ruler) A.push({id:'sortie', n:'출진(出陣)', d:'스스로 군을 이끌고 적을 친다', gold:0, kind:'war'});
    A.push({id:'resign', n:'하야(下野)', d:'섬김을 그만두고 재야로 돌아간다', gold:0, kind:'danger'});
    if (g.loyal < 45 && g.ambition > 55) A.push({id:'rebel', n:'거병(擧兵)', d:'주군을 배반하고 이 성에서 독립한다', gold:0, kind:'danger'});
    return A;
  },

  doSelf(g, id, arg) {
    const f = fOf(g.faction), p = PROV_BY_ID[g.loc];
    if (g.acted) return {ok:false, m:'이번 달에는 이미 움직였다'};
    if (g.hurt > 0) return {ok:false, m:'부상 중이다'};
    const pay = n => { if (f) { if (f.gold < n) return false; f.gold -= n; } return true; };
    let m = '', ok = true;
    switch (id) {
      case 'train_war': case 'train_int': case 'train_pol': case 'train_lead': {
        const k = {train_war:'war', train_int:'int', train_pol:'pol', train_lead:'lead'}[id];
        const kn = {war:'무력', int:'지력', pol:'정치', lead:'통솔'}[k];
        const pr = clamp(0.44 - (g[k] - 60) / 180 + (g.age < 30 ? 0.16 : 0) + fx(g.faction, 'growth') * 0.5, 0.05, 0.8);
        if (Math.random() < pr) { g[k] = clamp(g[k] + 1, 1, 100); m = `${kn}이 1 올랐다! (${g[k]})`; }
        else m = `${kn} 수련에 힘썼으나 별 진전이 없었다`;
        if (id === 'train_war' && Math.random() < 0.04) { g.hurt = 1; m += ' — 수련 중 다쳤다'; }
        g.merit += 8; break; }
      case 'spar': {
        const mates = provGens(p.id).filter(x => x !== g && x.faction === g.faction);
        if (!mates.length) { m = '이 성에는 겨룰 상대가 없다'; break; }
        mates.sort((a, b) => b.war - a.war);
        const t = mates[Math.min(ri(0, 1), mates.length - 1)];
        const gap = t.war - g.war;
        const pr = clamp(0.34 + gap / 120, 0.1, 0.8);
        if (Math.random() < pr) {
          const k = Math.random() < 0.65 ? 'war' : 'lead';
          g[k] = clamp(g[k] + 1, 1, 100);
          m = `${t.name}과 목검을 겨루며 ${k === 'war' ? '무력' : '통솔'}이 1 올랐다 (${g[k]})`;
        } else m = `${t.name}과 겨루었으나 배운 것이 적다`;
        t.bond = (t.bond || 0) + 3; g.bond = (g.bond || 0) + 3;
        t.loyal = clamp(t.loyal + 2, 0, 100);
        if (Math.random() < 0.05) { g.hurt = 1; m += ' — 겨루다 다쳤다'; }
        g.merit += 12; break; }
      case 'oath': {
        if (!pay(200)) return {ok:false, m:'금이 부족하다 (200)'};
        const mates = provGens(p.id).filter(x => x !== g && x.faction === g.faction && !bondOf(g.name, x.name));
        if (!mates.length) { m = '이 성에는 의를 맺을 상대가 없다'; break; }
        mates.sort((a, b) => (b.faith + b.loyal) - (a.faith + a.loyal));
        const t = arg ? genByName(arg) : mates[0];
        const pr = clamp(0.18 + (g.bond || 0) / 60 + (g.cha - 55) / 160 + (t.faith - 50) / 180 + (t.loyal - 55) / 220, 0.05, 0.9);
        if (Math.random() < pr) {
          addBond(g.name, t.name, 'oath');
          t.loyal = clamp(t.loyal + 12, 0, 100);
          m = `${t.name}과 의형제의 의를 맺었다! 같은 군에서 싸우면 결속 보너스를 받는다`;
          logMsg(`【결의】${g.name}과 ${t.name}이 형제의 의를 맺었다.`, 'good', g.faction);
          annal(`${g.name}·${t.name} 의형제 결의`, 'oath');
        } else m = `${t.name}은 아직 그만한 신뢰를 주지 않는다 (성공률 ${Math.round(pr * 100)}%)`;
        break; }
      case 'befriend': {
        if (!pay(60)) return {ok:false, m:'금이 부족하다'};
        const mates = provGens(p.id).filter(x => x !== g && x.faction === g.faction);
        if (!mates.length) { m = '이 성에는 친교를 나눌 동료가 없다'; break; }
        const t = pick(mates);
        t.loyal = clamp(t.loyal + ri(3, 8), 0, 100); t.bond = (t.bond || 0) + 4; g.bond = (g.bond || 0) + 4;
        g.cha = Math.random() < 0.12 ? clamp(g.cha + 1, 1, 100) : g.cha;
        m = `${t.name}과 술잔을 나누며 친분을 쌓았다 (그의 충성 ${Math.round(t.loyal)})`; g.merit += 10; break; }
      case 'advise': {
        const ruler = f ? genByName(f.ruler) : null;
        const pr = clamp(0.3 + (g.int - 60) / 150 + (g.rank >= 3 ? 0.15 : 0) + (ruler ? (100 - ruler.ambition) / 400 : 0), 0.08, 0.9);
        if (Math.random() < pr) {
          const kind = pick(['tech','gold','order','war']);
          if (kind === 'tech') { f.tp.civ += 60; f.tp.mil += 60; m = '진언이 채택되어 연구가 진척되었다 (기술점 +120)'; }
          else if (kind === 'gold') { f.gold += 400; m = '재정 개혁을 진언하여 국고가 늘었다 (금 +400)'; }
          else if (kind === 'order') { factionProv(f.id).forEach(q => q.order = clamp(q.order + 4, 0, 100)); m = '법령 정비를 진언하여 전국의 치안이 올랐다'; }
          else { factionProv(f.id).forEach(q => q.train = Math.min(100 + fx(f.id,'trainCap'), q.train + 2)); m = '조련법을 진언하여 전군의 훈련도가 올랐다'; }
          g.merit += 60;
        } else { m = '진언이 받아들여지지 않았다'; g.merit += 5; }
        break; }
      case 'hunt': {
        const pr = clamp(0.5 + (g.war - 60) / 140, 0.15, 0.95);
        if (Math.random() < pr) { p.order = clamp(p.order + ri(5, 11), 0, 100); g.merit += 40;
          m = `도적떼를 소탕했다. ${p.name} 치안 회복 (공적 +40)`;
          if (Math.random() < 0.14) { const c = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === p.id);
            if (c.length) { const t = pick(c); t.found = true; m += ` — 협력한 ${t.name}과 안면을 텄다`; } } }
        else { g.hurt = Math.random() < 0.3 ? 1 : 0; m = '도적을 놓쳤다' + (g.hurt ? ' — 추격 중 부상' : ''); }
        break; }
      case 'recruit_p': { const r = doOrder(g, 'recruit', arg); return r; }
      case 'search_p':  { const r = doOrder(g, 'search'); return r; }
      case 'move_p':    { const r = doOrder(g, 'move', arg); return r; }
      case 'resign': {
        const old = g.faction; g.faction = null; g.rank = 0; g.loyal = 0; g.merit = 0;
        S.player.mode = 'wanderer'; S.player.faction = null; S.player.mission = null;
        m = `${fOf(old).name}를 떠나 재야로 돌아갔다.`; logMsg(`${g.name}이 하야하여 재야로 돌아갔다.`, 'bad', old);
        break; }
      case 'rebel': {
        const old = g.faction, ofn = fOf(old);
        const allies = provGens(p.id).filter(x => x !== g && x.faction === old && x.loyal < 55 && Math.random() < 0.5);
        const myStr = (g.lead + g.war) / 2 + allies.length * 18 + g.cha / 2;
        const enStr = 60 + p.troops / 400 + (p.gov && p.gov !== g.name ? 25 : 0);
        if (myStr > enStr * rnd(0.7, 1.3)) {
          RP.foundFaction(g, p, allies);
          m = `거병 성공! ${p.name}을 장악하고 독립했다.`;
        } else { m = '거병이 실패하여 사로잡혔다...'; g.status = 'dead'; S.gameOver = {win:false, reason:'모반에 실패하여 처형되었다.'}; }
        break; }
      default: return {ok:false, m:'알 수 없는 행동'};
    }
    g.acted = true;
    if (ok) { const r = RP.reportAction(g, id); if (r) m += ' / ' + r; }
    checkPromote(g);
    return {ok, m};
  },

  /* ---------- 재야 행동 ---------- */
  wandererActions(g) {
    const A = [
      {id:'w_travel', n:'유력(遊歷)', d:'인접 고을로 떠난다 — 새 인물과 기회를 만난다'},
      {id:'w_war',    n:'무예 수련', d:'무력이 오를 수 있다'},
      {id:'w_read',   n:'학문',      d:'지력이 오를 수 있다'},
      {id:'w_see',    n:'견문',      d:'정치·매력이 오를 수 있다'},
      {id:'w_fame',   n:'유세(遊說)', d:'거리에서 뜻을 논하여 명성을 얻는다'},
      {id:'w_hunt',   n:'도적 토벌', d:'명성과 민심을 얻는다 (위험)'},
      {id:'w_help',   n:'백성 구휼', d:'사재를 털어 민심과 명성을 얻는다'},
      {id:'w_friend', n:'인재 탐방', d:'이 고을의 재야 인물을 동료로 삼는다'},
      {id:'w_serve',  n:'사관(仕官)', d:'세력에 출사한다 — 장수 플레이로 전환'},
      {id:'w_rise',   n:'거병(擧兵)', d:'스스로 깃발을 든다 — 군주 플레이로 전환'}
    ];
    return A;
  },
  doWander(g, id, arg) {
    if (g.acted) return {ok:false, m:'이번 달에는 이미 움직였다'};
    if (g.hurt > 0) return {ok:false, m:'부상 중이다'};
    const p = PROV_BY_ID[g.loc];
    let m = '';
    S.player.mates = S.player.mates || [];
    switch (id) {
      case 'w_travel': { const to = PROV_BY_ID[arg]; if (!to) return {ok:false, m:'갈 곳이 없다'};
        g.loc = to.id; S.player.mates.forEach(n => { const x = genByName(n); if (x) x.loc = to.id; });
        m = `${to.name}(${to.han})에 이르렀다. ${to.note}`;
        if (Math.random() < 0.3) { const c = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === to.id && S.player.mates.indexOf(x.name) < 0);
          if (c.length) m += ` — 이곳에 ${pick(c).name}이 은거하고 있다는 소문을 들었다`; }
        break; }
      case 'w_war': case 'w_read': case 'w_see': {
        const k = id === 'w_war' ? 'war' : id === 'w_read' ? 'int' : (Math.random() < 0.5 ? 'pol' : 'cha');
        const kn = {war:'무력', int:'지력', pol:'정치', cha:'매력'}[k];
        const pr = clamp(0.5 - (g[k] - 60) / 170 + (g.age < 28 ? 0.15 : 0), 0.08, 0.85);
        if (Math.random() < pr) { g[k] = clamp(g[k] + 1, 1, 100); m = `${kn}이 1 올랐다 (${g[k]})`; }
        else m = `${kn} 수련에 몰두했으나 진전이 없었다`;
        break; }
      case 'w_fame': { const v = ri(3, 8) + Math.round(g.cha / 22);
        S.player.fame += v; p.mood = clamp(p.mood + 1, 0, 100);
        m = `${p.name}의 저자에서 천하를 논했다. 명성 +${v} (${S.player.fame})`; break; }
      case 'w_hunt': { const pr = clamp(0.45 + (g.war - 60) / 130, 0.12, 0.94);
        if (Math.random() < pr) { const v = ri(6, 13); S.player.fame += v; p.order = clamp(p.order + ri(4, 9), 0, 100);
          m = `도적을 베어 고을을 안정시켰다. 명성 +${v} (${S.player.fame})`; }
        else { g.hurt = 1; m = '도적에게 밀려 부상을 입었다'; } break; }
      case 'w_help': { const v = ri(5, 10);
        S.player.fame += v; p.mood = clamp(p.mood + ri(3, 7), 0, 100);
        m = `굶주린 백성을 도왔다. 명성 +${v}, ${p.name} 민심 상승`; break; }
      case 'w_friend': { const c = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === p.id && x !== g && S.player.mates.indexOf(x.name) < 0);
        if (!c.length) { m = '이 고을에는 뜻을 함께할 인물이 없다'; break; }
        const t = arg ? genByName(arg) : pick(c);
        const pr = clamp(0.16 + S.player.fame / 260 + (g.cha - 50) / 200 - (t.fame - 70) / 200, 0.03, 0.9);
        if (Math.random() < pr) { S.player.mates.push(t.name); t.mate = 1;
          m = `${t.name}(${t.han})이 뜻을 함께하기로 했다! (동료 ${S.player.mates.length}명)`; }
        else m = `${t.name}은 아직 당신을 믿지 못한다 (성공률 ${Math.round(pr*100)}%)`;
        break; }
      case 'w_serve': { const f = fOf(arg); if (!f || !f.alive) return {ok:false, m:'그런 세력이 없다'};
        const ruler = genByName(f.ruler);
        const pr = clamp(0.3 + S.player.fame / 200 + (g.lead + g.war + g.int + g.pol + g.cha - 280) / 300, 0.1, 0.96);
        if (Math.random() < pr) {
          joinFaction(g, f.id, g.loc && PROV_BY_ID[g.loc].owner === f.id ? g.loc : f.cap, 62);
          S.player.mates.forEach(n => { const x = genByName(n); if (x && !x.faction) joinFaction(x, f.id, g.loc, 60); });
          S.player.mode = 'officer'; S.player.faction = f.id; S.player.mates = [];
          RP.assignMission(g);
          m = `${f.name}에 출사했다! 주군은 ${f.ruler}. 이제 공을 세워 출세하라.`;
          logMsg(`${g.name}이 ${f.name}에 출사했다.`, 'good', f.id);
        } else m = `${f.name}은 당신을 받아들이지 않았다 (명성이 더 필요하다)`;
        break; }
      case 'w_rise': {
        const need = 110;
        if (S.player.fame < need) return {ok:false, m:`명성이 부족하다 (${S.player.fame}/${need})`};
        if ((S.player.mates || []).length < 2) return {ok:false, m:'함께할 동료가 2명 이상 필요하다'};
        if (p.owner && p.mood > 42) return {ok:false, m:`${p.name}의 민심이 높아 봉기에 호응하지 않는다 (민심 ${Math.round(p.mood)} > 42)`};
        const mates = S.player.mates.map(n => genByName(n)).filter(x => x);
        const myStr = S.player.fame + (g.lead + g.war) / 2 + mates.length * 20;
        const enStr = p.owner ? 70 + p.troops / 350 : 40 + p.troops / 500;
        if (myStr > enStr * rnd(0.75, 1.25)) { RP.foundFaction(g, p, mates); m = `${p.name}에서 깃발을 들었다! 새로운 세력이 탄생했다.`; }
        else { m = '봉기가 진압되었다...'; g.status = 'dead'; S.gameOver = {win:false, reason:'봉기에 실패했다.'}; }
        break; }
      default: return {ok:false, m:'알 수 없는 행동'};
    }
    g.acted = true;
    return {ok:true, m};
  },

  /* ---------- 세력 창설 ---------- */
  foundFaction(g, p, mates) {
    const id = 'new_' + g.name.replace(/[^가-힣A-Za-z]/g, '') + '_' + S.turn;
    const old = p.owner;
    const colors = ['#b8452f','#2f7fb8','#7f2fb8','#2fb87f','#b8a02f','#b82f6f'];
    const f = {
      id, name: g.name.length > 3 ? g.name.slice(0, 2) : g.name, han: g.han.slice(0, 1) + '氏',
      region: p.region, color: pick(colors), ruler: g.name, cap: p.id, prov: [p.id],
      ai: 'balanced', pref: 'foot', desc: `${g.name}이 ${p.name}에서 일으킨 신흥 세력.`,
      gold: 1500, food: 4500, alive: true, tax: 1, tp:{civ:0,mil:0,dip:0,cul:0}, techs: [], rel: {}, bonus: {}, fame: 0, vassalOf: null
    };
    Object.keys(S.factions).forEach(k => {
      f.rel[k] = {state: k === old ? 'war' : 'none', v: k === old ? -60 : ri(-15, 10), turns: 0};
      S.factions[k].rel[id] = {state: k === old ? 'war' : 'none', v: k === old ? -60 : ri(-15, 10), turns: 0};
    });
    S.factions[id] = f;
    FACTIONS.push({id, name:f.name, han:f.han, region:f.region, color:f.color, ruler:f.ruler, cap:f.cap, prov:[p.id], ai:'balanced', pref:'foot', desc:f.desc});
    p.owner = id; p.gov = g.name;
    p.troops = Math.max(600, Math.round(p.troops * 0.35));
    p.order = clamp(p.order - 18, 0, 100); p.mood = clamp(p.mood + 12, 0, 100);
    g.faction = id; g.rank = 7; g.loyal = 100; g.merit = 2200; g.loc = p.id;
    (mates || []).forEach(x => { x.faction = id; x.rank = 2; x.loyal = 88; x.loc = p.id; x.merit = 240; });
    S.player.mode = 'lord'; S.player.faction = id; S.player.mates = []; S.player.mission = null;
    logMsg(`【기병】${g.name}이 ${p.name}에서 거병하여 독립했다!`, 'big');
    syncFactionProv();
    f.lastIncome = projectIncome(f);
  }
};
