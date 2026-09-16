/* =========================================================
   東亞 群雄割據 — UI
   ========================================================= */
'use strict';

const UI = {
  view: {x:0, y:0, k:1}, selProv: null, selGen: null, pick: null, setup: {reg:'kr', fac:null, gen:null},
  legendOn: false,

  /* ================= 부트 / 타이틀 ================= */
  boot() {
    const sv = document.getElementById('titlemap');
    sv.innerHTML = UI.mapStatic(true);
    document.addEventListener('keydown', UI.onKey);
  },
  showHelp() {
    UI.openModal('遊 書 — 유서', `
    <div style="line-height:1.95;font-size:13.5px;max-width:760px">
      <p class="gold" style="font-size:16px;letter-spacing:4px">■ 천하의 형세</p>
      <p>서기 190년, 동아시아 전역에서 영웅들이 일어섰다. 한반도의 삼국, 열도의 다이묘, 중원의 군웅,
         홍하의 왕조, 바다의 해상세력 — 54개 주군(州郡)을 놓고 32개 세력이 다툰다.</p>
      <p class="gold" style="margin-top:8px">■ 세 가지 유형</p>
      <p>· <b>군주(君主)</b> — 세력 전체를 지휘한다. 내정·군사·외교·기술·출병을 모두 결정한다.<br>
         · <b>장수(將軍)</b> — 한 사람으로 시작해 임무를 수행하고 공적을 쌓아 태수 → 도독 → 대장군으로 오른다.
           불만이 쌓이면 하야하거나 거병할 수도 있다.<br>
         · <b>재야(在野)</b> — 방랑하며 명성과 동료를 모아, 세력에 출사하거나 스스로 깃발을 든다.</p>
      <p class="gold" style="margin-top:8px">■ 전쟁은 숫자가 아니다</p>
      <p>부대의 실제 전력은 <b>병력 × 훈련도 × 사기 × 장비등급 × 병과적성 × 장수능력 × 기술 × 지형 × 병종상성 × 전술</b>로 결정된다.
         훈련 100·무기 4등급의 정예 1만 2천은 훈련 30의 오합지졸 2만을 이긴다.
         명장이 병종 상성까지 잡으면 4천으로 2만을 깨뜨릴 수도 있다.</p>
      <p>· 병종 상성 — 기병▶보병, 보병▶궁병, 궁병▶기병 (수군·공성·철포·상병은 별도)<br>
         · 지형 — 산악·밀림에서 기병은 반토막, 궁병은 강해진다. 하천·해안은 수군이 지배한다.<br>
         · 성벽 — 성벽이 높으면 방어 태세가 최대 2.5배. 공성병종과 화약 기술이 답이다.<br>
         · 전술 — 돌격/견수/제사/우회/매복/화계/수공/교란/일기토/철퇴. 지력 대결로 계략이 갈린다.</p>
      <p class="gold" style="margin-top:8px">■ 기술 테크트리</p>
      <p>내정·군사·외교·문화 네 갈래. 상업과 인구에서 매달 연구점이 쌓인다.
         나라마다 잘 맞는 기술이 있어 값이 싸진다 (조선의 강노·철갑선, 일본의 조총, 중원의 대운하·과거제,
         베트남의 상병, 대만의 조선술).</p>
      <p class="gold" style="margin-top:8px">■ 조작</p>
      <p>지도는 드래그로 이동, 휠로 확대. 왼쪽 패널에서 장수 초상을 클릭하면 그 장수에게 명령을 내릴 수 있다.
         단축키 — <b>Space</b> 턴 종료, <b>G</b> 장수일람, <b>T</b> 기술, <b>D</b> 외교, <b>F</b> 세력, <b>S</b> 저장.</p>
    </div>`, [{n:'닫기', f:UI.closeModal}]);
  },
  showCredit() {
    UI.openModal('史 書 — 사서', `<div style="line-height:1.9;max-width:620px">
      <p>이 게임은 실제 역사를 뒤섞은 <b>가상 시나리오</b>입니다. 한반도의 삼국·후삼국·고려·조선,
         일본의 전국시대, 중국의 후한말, 베트남의 십이사군과 쩐 왕조, 대만의 정씨 정권과 대두왕국 —
         서로 다른 시대의 영웅들이 한 판에 모였습니다.</p>
      <p>장수 354명의 이름·한자·능력은 각국 사서의 평가를 참고해 배치했고, 초상은 문화권별 관모·갑주
         (고구려 조우관, 신라 금관, 조선 갓과 두정갑, 일본 카부토와 남만구소쿠, 중국 통천관과 수면갑,
         베트남 칸동, 참파·크메르 보관, 명식 갑주, 대만 원주민 깃털 머리띠)를 절차적으로 생성합니다.</p>
      <p class="hz">해상도 1280×760 이상 권장 · 저장은 브라우저 로컬에 보관됩니다.</p></div>`,
      [{n:'닫기', f:UI.closeModal}]);
  },

  /* ================= 세력 선택 ================= */
  openSetup() {
    document.getElementById('setup').style.display = 'flex';
    initWorld();
    UI.renderDiff();
    const tabs = document.getElementById('regtabs');
    tabs.innerHTML = Object.keys(REGIONS).map(r =>
      `<div class="btn ${UI.setup.reg === r ? 'sel' : ''}" onclick="UI.setupReg('${r}')">${REGIONS[r].n}</div>`).join('')
      + `<div class="btn ${UI.setup.reg === 'free' ? 'sel' : ''}" onclick="UI.setupReg('free')">재야</div>`;
    UI.setupReg(UI.setup.reg);
  },
  closeSetup() { document.getElementById('setup').style.display = 'none'; },
  renderDiff() {
    const el = document.getElementById('diffsel'); if (!el) return;
    el.innerHTML = Object.keys(DIFFS).map(k =>
      `<div class="btn ${S.diff === k ? 'sel' : ''}" onclick="UI.setDiff('${k}')" title="${DIFFS[k].d}">${DIFFS[k].n}</div>`).join('');
  },
  setDiff(k) { S.diff = k; UI.sfx('click'); UI.renderDiff();
    const g = UI.setup.gen ? genByName(UI.setup.gen) : null; UI.setupInfo(g); },
  setupReg(r) {
    UI.setup.reg = r; UI.setup.fac = null; UI.setup.gen = null;
    document.getElementById('regtabs').querySelectorAll('.btn').forEach((b, i) => {
      const keys = Object.keys(REGIONS).concat('free');
      b.className = 'btn' + (keys[i] === r ? ' sel' : '');
    });
    const fl = document.getElementById('flist');
    if (r === 'free') {
      fl.innerHTML = `<div class="fcard sel" onclick="UI.setupFac('__free')">
        <div class="flag" style="background:#555">野</div><div><b>재야(在野)</b><div class="hz">주인 없는 영웅 76명</div></div></div>`;
      UI.setupFac('__free');
      return;
    }
    const list = FACTIONS.filter(f => f.region === r);
    fl.innerHTML = list.map(f => {
      const ps = f.prov.length, gs = (ROSTER[f.id] || []).length;
      return `<div class="fcard" id="fc_${f.id}" onclick="UI.setupFac('${f.id}')">
        <div class="flag" style="background:${f.color}">${f.han[0]}</div>
        <div style="min-width:0"><b>${f.name}</b> <span class="hz">${f.han}</span>
        <div class="hz">${ps}성 · 장수 ${gs} · ${f.ruler}</div></div></div>`;
    }).join('');
    if (list.length) UI.setupFac(list[0].id);
  },
  setupFac(id) {
    UI.setup.fac = id; UI.setup.gen = null;
    document.querySelectorAll('#flist .fcard').forEach(e => e.classList.remove('sel'));
    const el = document.getElementById('fc_' + id); if (el) el.classList.add('sel');
    const grid = document.getElementById('pgrid');
    let gens;
    if (id === '__free') {
      gens = S.gens.filter(g => !g.faction).sort((a, b) => (b.lead + b.war + b.int + b.pol + b.cha) - (a.lead + a.war + a.int + a.pol + a.cha));
      document.getElementById('pttl').textContent = '在 野 人 物 — 고르면 방랑 플레이';
    } else {
      gens = factionGens(id);
      document.getElementById('pttl').textContent = `${fOf(id).name} 人 物 — 군주를 고르면 군주 플레이, 장수를 고르면 장수 플레이`;
    }
    grid.innerHTML = gens.map(g => {
      const isRuler = g.faction && fOf(g.faction).ruler === g.name;
      return `<div class="pcard" id="pc_${encodeURIComponent(g.name)}" onclick="UI.setupGen('${g.name.replace(/'/g,"\\'")}')">
        ${portraitSVG(g, 104)}
        <div class="nm">${isRuler ? '<span class="gold">君</span> ' : ''}${g.name}</div>
        <div class="rk">${g.han} · ${g.age}세</div></div>`;
    }).join('');
    UI.setupInfo(null);
  },
  setupGen(name) {
    UI.setup.gen = name;
    document.querySelectorAll('#pgrid .pcard').forEach(e => e.classList.remove('sel'));
    const el = document.getElementById('pc_' + encodeURIComponent(name)); if (el) el.classList.add('sel');
    UI.setupInfo(genByName(name));
  },
  setupInfo(g) {
    const box = document.getElementById('pinfo');
    if (!g) {
      const f = UI.setup.fac && UI.setup.fac !== '__free' ? fOf(UI.setup.fac) : null;
      box.innerHTML = f ? `<div style="padding:10px;line-height:1.8">
        <div style="font-size:24px;letter-spacing:3px" class="gold">${f.name} <span class="hz">${f.han}</span></div>
        <div class="hz" style="margin:6px 0">군주 ${f.ruler} · ${REGIONS[f.region].n} · 성향 ${UI.aiName(f.ai)}</div>
        <p style="margin:8px 0">${f.desc}</p>
        <div class="hz">영지</div><div>${f.prov.map(p => PROV_BY_ID[p].name).join(' · ')}</div>
        <div class="hz" style="margin-top:8px">유리한 기술</div>
        <div>${Object.keys(REGION_TECH_AFFINITY[f.region]).map(t => TECH_BY_ID[t].n).join(' · ')}</div>
        <div style="margin-top:10px" class="warn">▷ 위 인물 중 하나를 고르시오</div></div>`
        : `<div style="padding:10px" class="hz">재야 인물 중 하나를 고르시오</div>`;
      return;
    }
    const isRuler = g.faction && fOf(g.faction).ruler === g.name;
    const mode = !g.faction ? 'wanderer' : (isRuler ? 'lord' : 'officer');
    const modeTxt = {lord:['군주 플레이', '세력 전체를 지휘한다. 내정·군사·외교·기술·출병 전권.'],
      officer:['장수 플레이', '한 사람으로 출발해 임무와 공적으로 출세한다. 하야·거병도 가능.'],
      wanderer:['방랑 플레이', '명성과 동료를 모아 출사하거나 스스로 세력을 세운다.']}[mode];
    box.innerHTML = `<div style="padding:9px;display:grid;gap:8px">
      <div style="display:flex;gap:9px">
        <div>${portraitSVG(g, 120)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:21px;letter-spacing:2px" class="gold">${g.name}</div>
          <div class="hz">${g.han} · ${g.age}세 · ${g.faction ? fOf(g.faction).name : '재야'}</div>
          <div class="hz" style="margin-top:4px">관직 ${RANKS[g.rank].n}</div>
          <div class="hz">야망 ${g.ambition} · 의리 ${g.faith}</div>
        </div>
      </div>
      ${UI.statGrid(g)}
      <div class="aptrow">${UI.aptRow(g)}</div>
      <div class="skills">${UI.skillTags(g)}</div>
      <div class="frame" style="padding:8px">
        <div class="gold" style="letter-spacing:5px;font-size:16px">${modeTxt[0]}</div>
        <div class="hz" style="margin-top:4px;line-height:1.6">${modeTxt[1]}</div>
      </div>
      <div class="frame" style="padding:8px">
        <div class="gold">난이도 — ${DIFFS[S.diff].n}</div>
        <div class="hz" style="margin-top:3px;line-height:1.6">${DIFFS[S.diff].d}</div>
      </div></div>`;
  },
  aiName(a) { return {aggressive:'공격적', balanced:'균형', schemer:'모략', steady:'견실', defensive:'수비적',
    passive:'소극적', honorable:'의리', diplomatic:'외교적'}[a] || a; },
  statGrid(g) {
    const k = [['통솔','lead'],['무력','war'],['지력','int'],['정치','pol'],['매력','cha']];
    return `<div class="stg">${k.map(([n, key]) => {
      const v = g[key], c = v >= 95 ? 's99' : v >= 88 ? 's90' : v >= 76 ? 's80' : v >= 60 ? 's70' : 's0';
      return `<div class="c"><b class="${c}">${v}</b><span>${n}</span></div>`; }).join('')}</div>`;
  },
  aptRow(g) {
    return ['foot','bow','cav','navy','siege'].map(t =>
      `<div class="a">${UNITS[t].n} <b>${aptOf(g, t)}</b></div>`).join('');
  },
  skillTags(g) {
    return g.skills.map(s => { const sk = SKILLS[s];
      return `<span class="sk ${sk ? sk.c : ''}" title="${sk ? sk.d : ''}">${s}</span>`; }).join('');
  },

  beginGame() {
    const name = UI.setup.gen;
    if (!name) { UI.toast('인물을 먼저 고르시오'); return; }
    const g = genByName(name);
    const isRuler = g.faction && fOf(g.faction).ruler === g.name;
    S.player = {mode: !g.faction ? 'wanderer' : (isRuler ? 'lord' : 'officer'),
      faction: g.faction, gen: g.name, fame: g.fame, merit: g.merit, mates: [], mission: null};
    if (S.player.mode === 'officer') RP.assignMission(g);
    if (S.player.mode === 'wanderer') S.player.fame = Math.round(g.fame * 0.6);
    UI.closeSetup();
    document.getElementById('title').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    UI.selProv = S.player.mode === 'lord' ? fOf(S.player.faction).cap : g.loc;
    UI.selGen = S.player.mode === 'lord' ? null : g.name;
    UI.buildMap();
    UI.resetView();
    logMsg(`【개막】${S.year}년, 천하가 갈라졌다. ${g.name}의 이야기가 시작된다.`, 'big');
    if (S.player.mode === 'wanderer') logMsg('명성을 쌓아 세력에 출사하거나, 동료를 모아 스스로 일어서라.', '');
    UI.renderAll();
    UI.openEvent('群 雄 割 據', `<div style="line-height:2">
      <div style="font-size:19px" class="gold">${S.year}년 ${S.month}월 — ${['','군주','장수','방랑'][{lord:1,officer:2,wanderer:3}[S.player.mode]]}의 길</div>
      <p style="margin-top:10px">${S.player.mode === 'lord'
        ? `당신은 <b>${fOf(S.player.faction).name}</b>의 군주 <b>${g.name}</b>. ${fOf(S.player.faction).desc}<br>54개 주군을 모두 손에 넣어 동아시아를 통일하라.`
        : S.player.mode === 'officer'
        ? `당신은 <b>${fOf(S.player.faction).name}</b>의 장수 <b>${g.name}</b>. 주군 ${fOf(S.player.faction).ruler}을 섬기며 공을 세워라.<br>태수 → 도독 → 대장군 → 승상. 혹은 때가 오면 스스로 깃발을 들 수도 있다.`
        : `당신은 주인 없는 <b>${g.name}</b>. 천하를 유력하며 명성과 동료를 모으라.<br>세력에 출사하여 장수가 되거나, 명성 110과 동료 2인으로 거병하여 군주가 되라.`}</p></div>`);
  },

  /* ================= 지도 ================= */
  mapStatic(dim) {
    const L = [], q = dim ? 'T' : 'M';
    L.push(`<defs>
      <linearGradient id="oc${q}" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#16405e"/><stop offset="1" stop-color="#07182a"/></linearGradient>
      <linearGradient id="ld${q}" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#7d7150"/><stop offset="0.55" stop-color="#5e5536"/><stop offset="1" stop-color="#3d3623"/></linearGradient>
      <filter id="sh${q}" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.6"/></filter>
    </defs>`);
    L.push(`<rect x="-1400" y="-1200" width="${MAP_W + 2800}" height="${MAP_H + 2400}" fill="url(#oc${q})"/>`);
    // 바다 결
    for (let y = 40; y < MAP_H; y += 46)
      L.push(`<path d="M0 ${y} q40 -9 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" stroke="#2a5570" stroke-width="1" fill="none" opacity="0.30"/>`);
    LANDMASS.forEach(m => L.push(`<path d="${toPath(m.pts, true)}" fill="url(#ld${q})" stroke="#241d13" stroke-width="2.4" filter="url(#sh${q})"/>`));
    LANDMASS.forEach(m => L.push(`<path d="${toPath(m.pts, true)}" fill="none" stroke="#a89a6e" stroke-width="1" opacity="0.35"/>`));
    RIVERS.forEach(r => L.push(`<path class="river" d="${toPath(r.pts, false)}"/>`));
    if (!dim) SEA_LABELS.forEach(s => { const q = prj(s.lon, s.lat);
      L.push(`<text class="sea-label" x="${q[0]}" y="${q[1]}" font-size="${s.s}" text-anchor="middle">${s.t}</text>`); });
    return L.join('');
  },
  buildMap() {
    const sv = document.getElementById('map');
    let h = UI.mapStatic(false);
    h += '<g id="mroads">';
    LINKS.forEach(([a, b, t]) => {
      const p = PROV_BY_ID[a], q = PROV_BY_ID[b];
      h += `<line class="road ${t}" x1="${p.xy[0]}" y1="${p.xy[1]}" x2="${q.xy[0]}" y2="${q.xy[1]}"/>`;
    });
    h += '</g><g id="mhalo"></g><g id="mcities">';
    PROVINCES.forEach(p => {
      const s = p.big ? 1.32 : 1, L2 = UI.labelPos(p.lp, s);
      h += `<g class="city" id="c_${p.id}" transform="translate(${p.xy[0]},${p.xy[1]})" onclick="UI.clickProv('${p.id}')">
        <circle class="hit" r="${19 * s}" fill="transparent"/>
        ${UI.castle(s)}
        <circle class="ring" r="${13 * s}" fill="none" stroke="#000" stroke-width="1.6" opacity="0.8"/>
        <text class="cname" x="${L2.x}" y="${L2.y1}" text-anchor="${L2.a}">${p.name}</text>
        <text class="chan" x="${L2.x}" y="${L2.y2}" text-anchor="${L2.a}">${p.han}</text>
        <text class="ctr" x="${L2.x}" y="${L2.y3}" text-anchor="${L2.a}" font-size="10" fill="#ffd98a" paint-order="stroke" stroke="#000" stroke-width="2.8"></text>
      </g>`;
    });
    h += '</g><g id="mfx"></g>';
    sv.innerHTML = `<g id="mroot">${h}</g>`;
    UI.bindMap(sv);
  },
  labelPos(lp, s) {
    const d = 15 * s;
    if (lp === 'left')  return {x:-d, a:'end',    y1:-2, y2:10, y3:22};
    if (lp === 'right') return {x: d, a:'start',  y1:-2, y2:10, y3:22};
    if (lp === 'down')  return {x: 0, a:'middle', y1:26 * s, y2:38 * s, y3:-15 * s};
    return {x:0, a:'middle', y1:-16 * s, y2:25 * s, y3:36 * s};
  },
  castle(s) {
    return `<g transform="scale(${s})">
      <rect class="body" x="-10" y="-3" width="20" height="11" fill="#8a7a5a" stroke="#241c12" stroke-width="1"/>
      <path class="body2" d="M-10 -3 h4 v-3 h3 v3 h3 v-3 h3 v3 h4" fill="none" stroke="#241c12" stroke-width="1.4"/>
      <path class="roof" d="M-12 -3 l12 -9 l12 9 z" fill="#7a4a3a" stroke="#241c12" stroke-width="1"/>
      <rect x="-2" y="1" width="4" height="7" fill="#3a2a1a"/></g>`;
  },
  bindMap(sv) {
    let drag = null;
    sv.addEventListener('mousedown', e => { drag = {x:e.clientX, y:e.clientY, vx:UI.view.x, vy:UI.view.y, moved:0}; sv.classList.add('drag'); });
    window.addEventListener('mousemove', e => {
      if (!drag) return;
      const r = sv.getBoundingClientRect(), sc = MAP_W / r.width;
      drag.moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
      UI.view.x = drag.vx + (e.clientX - drag.x) * sc; UI.view.y = drag.vy + (e.clientY - drag.y) * sc;
      UI.applyView();
    });
    window.addEventListener('mouseup', () => { if (drag) { sv.classList.remove('drag'); drag = null; } });
    sv.addEventListener('wheel', e => { e.preventDefault(); UI.zoom(e.deltaY < 0 ? 1.13 : 0.885, e); }, {passive:false});
  },
  applyView() {
    const g = document.getElementById('mroot');
    if (g) g.setAttribute('transform', `translate(${UI.view.x},${UI.view.y}) scale(${UI.view.k})`);
  },
  zoom(f, e) {
    const k0 = UI.view.k, k = clamp(k0 * f, 0.55, 4.2);
    const sv = document.getElementById('map'), r = sv.getBoundingClientRect();
    let cx = MAP_W / 2, cy = MAP_H / 2;
    if (e) { const sc = MAP_W / r.width; cx = (e.clientX - r.left) * sc; cy = (e.clientY - r.top) * sc; }
    UI.view.x = cx - (cx - UI.view.x) * (k / k0); UI.view.y = cy - (cy - UI.view.y) * (k / k0);
    UI.view.k = k; UI.applyView();
  },
  resetView() {
    const p = UI.selProv ? PROV_BY_ID[UI.selProv] : null;
    UI.view.k = 1.5;
    if (p) { UI.view.x = MAP_W / 2 - p.xy[0] * UI.view.k; UI.view.y = MAP_H / 2 - p.xy[1] * UI.view.k; }
    else { UI.view.x = 0; UI.view.y = 0; }
    UI.applyView();
  },
  focusProv(id) { UI.selProv = id; UI.resetView(); UI.renderAll(); },
  focusGen(n) { const g = genByName(n); if (!g || !g.loc) return; UI.selProv = g.loc; UI.selGen = n; UI.resetView(); UI.renderAll(); },
  toggleLegend() {
    UI.legendOn = !UI.legendOn;
    const el = document.getElementById('legend');
    el.style.display = UI.legendOn ? 'block' : 'none';
    if (UI.legendOn) {
      const list = Object.values(S.factions).filter(f => f.alive)
        .sort((a, b) => factionProv(b.id).length - factionProv(a.id).length);
      el.innerHTML = list.map(f => `<div class="lg" onclick="UI.focusProv('${f.cap}')" style="cursor:pointer">
        <i style="background:${f.color}"></i>${f.name} <span class="hz">${factionProv(f.id).length}성</span></div>`).join('');
    }
  },
  updateMap() {
    const halo = document.getElementById('mhalo');
    if (!halo) return;
    let hh = '';
    PROVINCES.forEach(p => {
      const c = p.owner ? fOf(p.owner).color : '#5a5a5a';
      hh += `<circle class="halo" cx="${p.xy[0]}" cy="${p.xy[1]}" r="${(p.big ? 33 : 27)}" fill="${c}" opacity="${p.owner ? 0.5 : 0.16}"/>`;
    });
    halo.innerHTML = hh;
    PROVINCES.forEach(p => {
      const g = document.getElementById('c_' + p.id); if (!g) return;
      const c = p.owner ? fOf(p.owner).color : '#6b6b6b';
      g.querySelector('.body').setAttribute('fill', c);
      g.querySelector('.roof').setAttribute('fill', shade(c, -0.32));
      const ring = g.querySelector('.ring');
      const isMine = p.owner && (p.owner === S.player.faction);
      ring.setAttribute('stroke', UI.selProv === p.id ? '#fff' : (isMine ? '#ffe08a' : '#000'));
      ring.setAttribute('stroke-width', UI.selProv === p.id ? 3 : (isMine ? 2 : 1.4));
      const known = !p.owner || p.owner === S.player.faction || p.spied || (S.cheat && S.cheat.eye) || p.owner === (genByName(S.player.gen||'') || {}).faction;
      g.querySelector('.ctr').textContent = known ? (p.troops >= 1000 ? (p.troops / 1000).toFixed(1) + '천' : p.troops) : '?';
    });
  },
  clickProv(id) {
    if (UI.pick) { const cb = UI.pick; UI.pick = null; document.getElementById('minfo').textContent = ''; cb(id); return; }
    UI.selProv = id; UI.selGen = null;
    const g = genByName(S.player.gen || '');
    if (S.player.mode !== 'lord' && g && g.loc === id) UI.selGen = g.name;
    UI.renderAll();
  },
  askProv(msg, filter, cb) {
    UI.pick = id => { if (filter && !filter(PROV_BY_ID[id])) { UI.toast('대상이 될 수 없는 곳이다'); UI.askProv(msg, filter, cb); return; } cb(id); };
    document.getElementById('minfo').innerHTML = `<span class="gold">${msg}</span> <span class="hz">(지도에서 도시를 클릭 · Esc 취소)</span>`;
  },

  /* ================= 렌더 ================= */
  renderAll() {
    if (S.gameOver) { UI.showGameOver(); return; }
    UI.renderTop(); UI.updateMap(); UI.renderProv(); UI.renderCmds(); UI.renderLog();
    const ac = S.player.mode === 'lord' && S.player.faction
      ? factionGens(S.player.faction).filter(g => !g.acted && g.status === 'ok' && g.hurt === 0).length : 0;
    document.getElementById('actleft').innerHTML = S.player.mode === 'lord'
      ? `행동 가능 <span class="gold">${ac}</span>명` : (genByName(S.player.gen) && !genByName(S.player.gen).acted ? '<span class="gold">행동 가능</span>' : '<span class="hz">행동 완료</span>');
  },
  renderTop() {
    document.getElementById('tdate').textContent = `${S.year}년 ${S.month}월`;
    const me = document.getElementById('tme'), st = document.getElementById('tstat');
    const g = genByName(S.player.gen || '');
    if (S.player.mode === 'wanderer') {
      me.innerHTML = `<div class="flag" style="background:#555">野</div><div><b>${g.name}</b> <span class="hz">방랑</span></div>`;
      st.innerHTML = `<span>명성 <b>${S.player.fame}</b></span><span>동료 <b>${(S.player.mates||[]).length}</b></span>
        <span>소재 <b>${PROV_BY_ID[g.loc].name}</b></span><span class="hz">통${g.lead} 무${g.war} 지${g.int} 정${g.pol} 매${g.cha}</span>`;
    } else {
      const f = fOf(S.player.faction);
      if (!f) { me.innerHTML = ''; st.innerHTML = ''; return; }
      const ps = factionProv(f.id), troops = ps.reduce((s, p) => s + p.troops, 0);
      me.innerHTML = `<div class="flag" style="background:${f.color}">${f.han[0]}</div>
        <div><b>${f.name}</b> <span class="hz">${f.han}</span>
        <div class="hz">${S.player.mode === 'lord' ? '군주 ' + f.ruler : g.name + ' · ' + RANKS[g.rank].n}</div></div>`;
      const inc = f.lastIncome && f.lastIncome.gold ? f.lastIncome : (f.lastIncome = projectIncome(f));
      const net = inc.net !== undefined ? inc.net : 0;
      const netS = (net >= 0 ? '+' : '') + net.toLocaleString();
      st.innerHTML = `<span class="lk" onclick="UI.financeWin()" title="세수 ${(inc.gold||0).toLocaleString()} · 봉록 ${(inc.pay||0)}/${(inc.payDue||0)} · 군비 ${inc.upkeep||0}\n클릭하면 재정 명세">금 <b>${f.gold.toLocaleString()}</b>
          <b class="${net>=0?'jade':'seal'}" style="font-size:12px">${netS}/월</b></span>
        <span title="수확 ${(inc.food||0).toLocaleString()} / 월 소모 ${(inc.eat||0).toLocaleString()}">식량 <b>${f.food.toLocaleString()}</b></span>
        <span class="lk" onclick="UI.taxWin()" title="세율을 바꾼다">세율 <b>${taxOf(f).n.slice(0,2)}</b></span>
        <span>성 <b>${ps.length}</b></span><span>장수 <b>${factionGens(f.id).length}</b></span>
        <span>병력 <b>${troops.toLocaleString()}</b></span>
        <span title="내정/군사/외교/문화 연구점">연구 <b>${Math.round(f.tp.civ)}·${Math.round(f.tp.mil)}·${Math.round(f.tp.dip)}·${Math.round(f.tp.cul)}</b></span>
        ${S.player.mode === 'officer' ? `<span>공적 <b>${g.merit}</b></span><span>충성 <b>${Math.round(g.loyal)}</b></span>` : ''}`;
    }
    document.getElementById('ttools').innerHTML = `
      <div class="btn sm" onclick="UI.listGens()">장수일람</div>
      <div class="btn sm" onclick="UI.listFactions()">세력</div>
      <div class="btn sm" onclick="UI.techWin()">기술</div>
      <div class="btn sm" onclick="UI.diploWin()">외교</div>
      <div class="btn sm" onclick="UI.chronWin()">정세</div>
      <div class="btn sm" onclick="UI.saveGame()">저장</div>
      <div class="btn sm" onclick="UI.toggleSfx()" title="효과음">${UI.sfxOn ? '♪' : '♪̸'}</div>
      <div class="btn sm" onclick="UI.showHelp()">유서</div>
      ${S.cheat && S.cheat.used ? '<div class="btn sm red" onclick="UI.cheatWin()" title="치트 사용 중">天機</div>' : ''}`;
  },
  renderProv() {
    const p = PROV_BY_ID[UI.selProv]; const box = document.getElementById('pvbox');
    document.getElementById('lprov').textContent = p ? p.han : '';
    if (!p) { box.innerHTML = ''; return; }
    const mine = p.owner === S.player.faction;
    const known = mine || !p.owner || p.spied || (S.cheat && S.cheat.eye);
    const f = p.owner ? fOf(p.owner) : null;
    const bar = (k, v, max, cls) => `<div class="st"><span class="k">${k}</span><span class="bar ${cls||''}"><i style="width:${clamp(v/Math.max(1,max)*100,0,100)}%"></i></span><span class="v">${Math.round(v)}<span class="hz">/${Math.round(max)}</span></span></div>`;
    let h = `<div class="pv">
      <div class="nmrow"><b>${p.name}</b><span class="hz">${p.han}</span>
        <span class="sp"></span><span class="tag" style="border-color:${f?f.color:'#666'};color:${f?'#fff':'#aaa'};background:${f?f.color+'55':'#0006'}">${f ? f.name : '무주(無主)'}</span></div>
      <div class="hz">${TERRAIN[p.t].n} · ${p.port ? '항구 ' : ''}${p.big ? '대도시 ' : ''}${REGIONS[p.region].n}</div>
      <div class="hz" style="font-size:11px;line-height:1.5">${p.note}</div>`;
    if (known) {
      h += `<div style="border-top:1px solid #4d3826;margin:3px 0"></div>
      ${bar('농업', p.agri, capOf(p, 'agri'), 'g')}
      ${bar('상업', p.comm, capOf(p, 'comm'))}
      ${bar('치수', p.water, capOf(p, 'water'), 'b')}
      ${bar('성벽', p.wall, capOf(p, 'wall'), 'p')}
      ${bar('치안', p.order, 100 + (f ? fx(f.id,'orderCap') : 0))}
      ${bar('민심', p.mood, 100 + (f ? fx(f.id,'moodCap') : 0), 'g')}
      ${bar('인구', p.pop, capOf(p, 'pop'), 'b')}
      <div style="border-top:1px solid #4d3826;margin:3px 0"></div>
      ${bar('병력', p.troops, Math.max(p.troops, p.pop * 45), 'r')}
      ${bar('훈련', p.train, 100 + (f ? fx(f.id,'trainCap') : 0), 'r')}
      <div class="st"><span class="k">장비</span><span>무기 <b class="gold">${p.weapon}</b> · 방어 <b class="gold">${p.armor}</b></span><span class="v"></span></div>
      <div class="st"><span class="k">군마</span><span>${p.horses}</span><span class="v hz">전선 ${p.ships}</span></div>
      <div class="st"><span class="k">태수</span><span>${p.gov || '<span class="hz">없음</span>'}</span>
        <span class="v">${mine && S.player.mode === 'lord' ? `<span class="btn sm" onclick="UI.assignGov()">임명</span>` : ''}</span></div>`;
      if (f) h += `<div class="st"><span class="k">수입</span><span class="hz">금 ${provIncome(p)}/월 · 수확 ${provHarvest(p)}/기</span><span></span></div>`;
    } else {
      h += `<div class="hz" style="padding:8px 0">내부 사정을 알 수 없다. <b>첩보</b>를 보내면 파악할 수 있다.<br>추정 병력 ${p.troops >= 1000 ? Math.round(p.troops/1000)+'천' : p.troops} 내외</div>`;
    }
    h += `</div><div class="ttl" style="margin-top:2px">在 城 武 將</div><div class="mini">`;
    const gs = provGens(p.id).filter(g => g.faction === p.owner);
    gs.sort((a, b) => b.rank - a.rank || b.merit - a.merit);
    gs.forEach(g => {
      const can = (S.player.mode === 'lord' && p.owner === S.player.faction) || g.name === S.player.gen;
      h += `<div class="g ${g.acted ? 'acted' : ''} ${UI.selGen === g.name ? 'sel' : ''}" onclick="UI.pickGen('${g.name.replace(/'/g,"\\'")}')" title="${g.name} ${RANKS[g.rank].n}\n통${g.lead} 무${g.war} 지${g.int} 정${g.pol} 매${g.cha}\n충성 ${Math.round(g.loyal)}${g.hurt?'\n부상 '+g.hurt+'개월':''}">
        <div style="position:relative;border:${UI.selGen===g.name?'2px solid #e8cc6a':'0'}">${portraitSVG(g, 44)}${can ? `<span class="dot"></span>` : ''}</div>
        <div class="n">${g.name}</div></div>`;
    });
    const free = S.gens.filter(g => !g.faction && g.status === 'ok' && g.loc === p.id && (g.found || g.mate || S.player.mode === 'wanderer'));
    if (free.length) {
      h += `</div><div class="ttl">在 野</div><div class="mini">`;
      free.forEach(g => h += `<div class="g" onclick="UI.genWin('${g.name.replace(/'/g,"\\'")}')" title="재야 ${g.name}">
        <div>${portraitSVG(g, 44)}</div><div class="n">${g.name}</div></div>`);
    }
    h += `</div><div class="ttl">隣 接</div><div style="padding:5px 7px;display:grid;gap:3px">`;
    ADJ[p.id].forEach(a => {
      const q = PROV_BY_ID[a.to], qf = q.owner ? fOf(q.owner) : null;
      const st = q.owner && S.player.faction ? relation(S.player.faction, q.owner) : 'none';
      h += `<div class="btn sm" style="text-align:left;display:flex;gap:5px" onclick="UI.focusProv('${q.id}')">
        <i style="width:9px;height:9px;background:${qf?qf.color:'#666'};display:inline-block;border:1px solid #000"></i>
        ${q.name} <span class="hz">${qf ? qf.name : '무주'}</span><span class="sp"></span>
        <span class="hz">${a.t === 'sea' ? '해로' : a.t === 'mountain' ? '산길' : a.t === 'river' ? '수로' : '가도'}</span>
        ${st === 'war' ? '<span class="seal">교전</span>' : ''}</div>`;
    });
    h += '</div>';
    box.innerHTML = h;
  },
  pickGen(n) {
    if (S.player.mode !== 'lord' && n !== S.player.gen) { UI.genWin(n); return; }
    UI.selGen = n; UI.sfx('click');
    UI.renderProv(); UI.renderCmds();
  },

  /* ================= 명령 패널 ================= */
  renderCmds() {
    const box = document.getElementById('cmdbox');
    if (S.player.mode === 'wanderer') return UI.renderWander(box);
    if (S.player.mode === 'officer') return UI.renderOfficer(box);
    const f = fOf(S.player.faction);
    if (!f) { box.innerHTML = '<div class="hz" style="padding:8px">세력이 없다</div>'; return; }
    const p = PROV_BY_ID[UI.selProv];
    const mine = p && p.owner === f.id;
    // 도시를 고르면 그 성의 장수를 자동 선택한다
    const here = p ? provGens(p.id).filter(x => x.faction === f.id) : [];
    if (mine && (!UI.selGen || !here.some(x => x.name === UI.selGen))) {
      const free = here.filter(x => !x.acted && x.hurt === 0);
      UI.selGen = (free[0] || here[0] || {}).name || null;
    }
    const g = UI.selGen ? genByName(UI.selGen) : null;
    let h = '';
    // 도시 배너 + 장수 띠
    if (p) h += `<div class="frame" style="padding:5px 6px">
      <div class="row"><b class="gold">${p.name}</b><span class="hz">${p.han}</span><span class="sp"></span>
        <span class="tag">${mine ? '아군' : (p.owner ? fOf(p.owner).name : '무주')}</span></div>
      ${mine ? `<div class="hz">세수 ${provIncome(p)}금/월 · 병력 ${p.troops.toLocaleString()} · 훈련 ${Math.round(p.train)}${p.settle > 0 ? ` · <span class="warn">전후 수습 ${p.settle}개월</span>` : ''}</div>` : ''}</div>`;
    if (mine && here.length) {
      h += `<div class="genstrip">${here.map(x => `<div class="gs ${x.acted || x.hurt ? 'off' : ''} ${UI.selGen === x.name ? 'on' : ''}"
        onclick="UI.pickGen('${x.name.replace(/'/g, "\\'")}')" title="${x.name} ${RANKS[x.rank].n}${x.title ? ' · ' + x.title.n : ''}
통${x.lead} 무${x.war} 지${x.int} 정${x.pol} 매${x.cha} · 충성 ${Math.round(x.loyal)}${x.hurt ? '\n부상 ' + x.hurt + '개월' : ''}${x.acted ? '\n행동 완료' : ''}">
        ${portraitSVG(x, 38)}<span>${x.name.length > 4 ? x.name.slice(0, 4) : x.name}</span></div>`).join('')}</div>`;
    }
    if (g && g.faction === f.id) {
      const why = (o) => {
        const d = ORDERS[o];
        if (g.acted) return '행동완료';
        if (g.hurt > 0) return '부상';
        const local = ['farm','trade','water','wall','patrol','relief','levy','drill','smith','armory','horse','ship','merc'];
        if (local.indexOf(o) >= 0 && (!p || p.owner !== f.id || g.loc !== p.id)) return '타도시';
        if (o === 'ship' && p && !p.port) return '항구없음';
        if (d.food && f.food < d.food) return '식량부족';
        if (d.gold && f.gold < d.gold) return '금부족';
        return '';
      };
      h += `<div class="frame" style="padding:5px 6px;display:flex;gap:7px;align-items:center">
        ${portraitSVG(g, 44)}<div style="min-width:0;flex:1"><b>${g.name}</b> <span class="hz">${RANKS[g.rank].n}</span>
        ${g.title ? `<span class="tag gold">${g.title.n}</span>` : ''}
        <div class="hz">통${g.lead} 무${g.war} 지${g.int} 정${g.pol} 매${g.cha}</div>
        <div class="hz">${g.acted ? '<span class="warn">행동 완료</span>' : g.hurt ? `<span class="seal">부상 ${g.hurt}개월</span>` : '<span class="jade">대기</span>'}
          · 충성 ${Math.round(g.loyal)}</div></div></div>`;
      if (!p || g.loc !== p.id) h += `<div class="frame" style="padding:5px;border-color:#8a6a2f">
        <span class="warn">※ ${g.name}은 ${PROV_BY_ID[g.loc].name}에 있다</span>
        <div class="btn sm" style="margin-top:3px" onclick="UI.focusProv('${g.loc}')">${PROV_BY_ID[g.loc].name}으로 보기</div></div>`;
      const cats = {civ:'內 政', mil:'軍 事', per:'人 事', plot:'計 略'};
      Object.keys(cats).forEach(c => {
        h += `<div class="grp">${cats[c]}</div>`;
        Object.keys(ORDERS).filter(o => ORDERS[o].cat === c).forEach(o => {
          const d = ORDERS[o], r = why(o), bad = !!r;
          const cost = o === 'merc' ? '금 소요' : (d.gold ? d.gold + '금' : '') + (d.food ? ' ' + d.food + '식' : '');
          h += `<div class="btn ${bad ? 'dis' : ''}" onclick="${bad ? '' : `UI.order('${o}')`}" title="${d.d}">
            ${d.n}<small>${bad ? '<span class="seal">' + r + '</span>' : cost}</small></div>`;
        });
      });
      h += `<div class="grp">出 陣</div>
        <div class="btn ${g.acted || g.hurt > 0 ? 'dis' : ''}" onclick="${g.acted || g.hurt > 0 ? '' : 'UI.startWar()'}">
          출병(出兵)<small>${g.acted ? '<span class="seal">행동완료</span>' : '지휘 ' + rankOf(g).cmd.toLocaleString()}</small></div>`;
    } else if (mine) {
      h += `<div class="hz" style="padding:8px;line-height:1.7">이 성에 장수가 없습니다.<br>다른 성에서 <b>이동</b> 명령으로 보내십시오.</div>`;
    } else {
      h += `<div class="hz" style="padding:8px;line-height:1.7">내 영지의 도시를 고르면<br>그 성의 장수와 명령이 표시됩니다.</div>`;
    }
    h += `<div class="grp">勢 力</div>
      <div class="btn" onclick="UI.techWin()">기술 연구<small>${['civ','mil','dip','cul'].map(k => Math.round(f.tp[k])).join('·')}</small></div>
      <div class="btn" onclick="UI.diploWin()">외교</div>
      <div class="btn" onclick="UI.taxWin()">세율 조정<small>${taxOf(f).n}</small></div>
      <div class="btn" onclick="UI.financeWin()">재정 명세<small class="${(f.lastIncome&&f.lastIncome.net)>=0?'jade':'seal'}">${f.lastIncome ? ((f.lastIncome.net >= 0 ? '+' : '') + f.lastIncome.net) : '-'}/월</small></div>
      <div class="btn" onclick="UI.chronWin()">천하정세</div>
      <div class="btn" onclick="UI.listGens()">장수 일람</div>
      <div class="btn jade" onclick="UI.autoDelegate()">일괄 위임(委任)</div>`;
    box.innerHTML = h;
  },

  /* ---------- 세율 ---------- */
  taxWin() {
    const f = fOf(S.player.faction); if (!f) return;
    const ps = factionProv(f.id);
    const proj = r => {
      const old = f.tax; f.tax = r;
      const v = ps.reduce((s2, p) => s2 + provIncome(p), 0);
      f.tax = old; return v;
    };
    UI.openModal('稅 率 — 세율 조정', `<div style="min-width:520px">
      <div class="hz" style="margin-bottom:8px">세율은 매달 세수와 민심을 함께 움직인다.
        치안이 높으면 징세력이, 민심이 높으면 인구세가 오른다.</div>
      <div style="display:grid;gap:6px">${TAX_RATES.map(t => `
        <div class="btn ${f.tax === t.id ? 'sel' : ''}" style="text-align:left" onclick="UI.setTax(${t.id})">
          <div class="row"><b>${t.n}</b><span class="sp"></span>
            <span class="gold">${proj(t.id).toLocaleString()}금/월</span>
            <span class="${t.mood >= 0 ? 'jade' : 'seal'}">민심 ${t.mood > 0 ? '+' : ''}${t.mood}/월</span></div>
          <div class="hz">${t.d}</div></div>`).join('')}</div>
      <div class="hz" style="margin-top:8px">현재 봉록 ${(f.lastIncome && f.lastIncome.payDue) || 0}금 · 군비 ${(f.lastIncome && f.lastIncome.upkeep) || 0}금
        · 통치 부담 ${(strain(f.id) * 100).toFixed(0)}%</div>
    </div>`, [{n:'닫기', f:UI.closeModal}]);
  },
  setTax(r) {
    const f = fOf(S.player.faction); f.tax = r;
    UI.sfx('coin'); UI.toast(`세율을 ${TAX_RATES[r].n}로 정했다`);
    logMsg(`【세율】${TAX_RATES[r].n}로 조정했다. ${TAX_RATES[r].d}`, '', f.id);
    UI.taxWin(); UI.renderAll();
  },

  /* ---------- 재정 명세 ---------- */
  financeWin() {
    const f = fOf(S.player.faction); if (!f) return;
    const ps = factionProv(f.id).map(p => ({p, t:provTaxParts(p)})).sort((a, b) => b.t.total - a.t.total);
    const sum = k => ps.reduce((s2, x) => s2 + x.t[k], 0);
    const inc = f.lastIncome && f.lastIncome.gold ? f.lastIncome : projectIncome(f);
    const harvest = ps.reduce((s2, x) => s2 + provHarvest(x.p), 0);
    UI.openModal('財 政 — 재정 명세', `<div style="min-width:760px">
      <div class="row" style="flex-wrap:wrap;gap:12px;margin-bottom:8px">
        <span>국고 <b class="gold">${f.gold.toLocaleString()}</b>금</span>
        <span>세율 <b>${taxOf(f).n}</b></span>
        <span>월 세수 <b class="gold">${sum('total').toLocaleString()}</b></span>
        ${inc.proj ? '<span class="hz">(정산 전 예상치)</span>' : ''}
        <span>봉록 <b class="seal">-${(inc.payDue || 0).toLocaleString()}</b>${inc.payDue > inc.pay ? ` <span class="warn">(체불 ${(inc.payDue - inc.pay).toLocaleString()})</span>` : ''}</span>
        <span>군비 <b class="seal">-${(inc.upkeep || 0).toLocaleString()}</b></span>
        <span>순익 <b class="${(inc.net || 0) >= 0 ? 'jade' : 'seal'}">${(inc.net || 0) >= 0 ? '+' : ''}${(inc.net || 0).toLocaleString()}</b>/월</span>
        <span class="hz">통치 부담 ${(strain(f.id) * 100).toFixed(0)}%</span>
      </div>
      <div style="max-height:52vh;overflow:auto"><table class="gl"><thead><tr>
        <th>도시</th><th>상업세</th><th>인구세</th><th>농지세</th><th>교역보정</th><th>태수보정</th><th>합계</th><th>수확(6·10월)</th><th>상태</th></tr></thead><tbody>
        ${ps.map(({p, t}) => `<tr onclick="UI.closeModal();UI.focusProv('${p.id}')" style="cursor:pointer">
          <td>${p.name}<span class="hz">${p.big ? ' 大' : ''}${p.port ? ' 港' : ''}</span></td>
          <td class="stv">${t.comm}</td><td class="stv">${t.head}</td><td class="stv">${t.land}</td>
          <td class="stv hz">×${t.trade.toFixed(2)}</td><td class="stv hz">×${t.govM.toFixed(2)}</td>
          <td class="stv gold">${t.total}</td><td class="stv hz">${provHarvest(p).toLocaleString()}</td>
          <td class="hz">${t.settle ? '<span class="warn">전후수습</span>' : `치안 ${Math.round(p.order)} 민심 ${Math.round(p.mood)}`}</td></tr>`).join('')}
        <tr><td><b>합계</b></td><td class="stv">${sum('comm').toLocaleString()}</td><td class="stv">${sum('head').toLocaleString()}</td>
          <td class="stv">${sum('land').toLocaleString()}</td><td></td><td></td>
          <td class="stv gold"><b>${sum('total').toLocaleString()}</b></td>
          <td class="stv">${harvest.toLocaleString()}</td><td></td></tr>
      </tbody></table></div>
      <div class="hz" style="margin-top:7px;line-height:1.7">
        · <b>상업세</b> = 상업 × 치안 보정 — 상업 투자와 순찰이 곧 세금이다<br>
        · <b>인구세</b> = 인구 × 민심 보정 — 구휼과 낮은 세율이 인구를 늘린다<br>
        · <b>농지세</b> = 농업 × 0.34 — 개간은 세금과 식량을 함께 늘린다<br>
        · <b>교역보정</b> 대도시 +14% · 항구 +12% · 화폐주조/시장개혁/대운하 기술<br>
        · 점령 직후 5개월은 전후 수습으로 세수가 45%로 떨어지고 징병할 수 없다
      </div></div>`, [{n:'닫기', f:UI.closeModal}]);
  },

  renderOfficer(box) {
    const g = genByName(S.player.gen), f = fOf(g.faction);
    if (!f) { box.innerHTML = '<div class="hz" style="padding:8px">소속이 없다</div>'; return; }
    const ms = S.player.mission, md = ms ? RP.missionDef(ms.id) : null;
    let h = `<div class="frame" style="padding:6px">
      <div style="display:flex;gap:7px">${portraitSVG(g, 52)}
      <div style="min-width:0"><b>${g.name}</b><div class="hz">${RANKS[g.rank].n} · ${f.name}</div>
      <div class="hz">공적 ${g.merit} / 다음 ${RANKS[Math.min(7,g.rank+1)].merit}</div>
      <div class="bar" style="margin-top:3px"><i style="width:${clamp((g.merit-RANKS[g.rank].merit)/Math.max(1,RANKS[Math.min(7,g.rank+1)].merit-RANKS[g.rank].merit)*100,0,100)}%"></i></div>
      <div class="hz">충성 ${Math.round(g.loyal)} · 야망 ${g.ambition}</div></div></div></div>`;
    if (md) h += `<div class="frame" style="padding:6px">
      <div class="gold">주군의 명 — ${md.n}</div><div class="hz">${md.d}</div>
      <div class="hz">${ms.done ? '<span class="jade">완수</span>' : '진행 중 (공적 +' + md.rew + ')'}</div></div>`;
    const acts = RP.officerActions(g);
    h += `<div class="grp">職 務</div>`;
    acts.filter(a => a.kind === 'order').forEach(a => {
      const d = ORDERS[a.id];
      const bad = g.acted || g.hurt > 0 || f.gold < d.gold;
      h += `<div class="btn ${bad?'dis':''}" onclick="${bad?'':`UI.order('${a.id}')`}" title="${d.d}">${d.n}<small>${d.gold?d.gold+'금':''}</small></div>`;
    });
    h += `<div class="grp">修 行 · 活 動</div>`;
    acts.filter(a => a.kind === 'self').forEach(a => {
      const bad = g.acted || g.hurt > 0 || (a.gold && f.gold < a.gold);
      h += `<div class="btn ${bad?'dis':''}" onclick="${bad?'':`UI.selfAct('${a.id}')`}" title="${a.d}">${a.n}<small>${a.gold?a.gold+'금':''}</small></div>`;
    });
    const war = acts.filter(a => a.kind === 'war');
    if (war.length) { h += `<div class="grp">出 陣</div>`;
      war.forEach(a => h += `<div class="btn ${g.acted?'dis':''}" onclick="${g.acted?'':'UI.startWar()'}" title="${a.d}">${a.n}</div>`); }
    h += `<div class="grp">其 他</div>`;
    acts.filter(a => a.kind === 'danger').forEach(a =>
      h += `<div class="btn red" onclick="UI.selfAct('${a.id}')" title="${a.d}">${a.n}</div>`);
    h += `<div class="btn" onclick="UI.techWin()">세력 기술 보기</div>
      <div class="btn" onclick="UI.financeWin()">세력 재정</div>
      <div class="btn" onclick="UI.chronWin()">천하정세</div>
      <div class="btn" onclick="UI.listGens()">장수 일람</div>`;
    box.innerHTML = h;
  },
  renderWander(box) {
    const g = genByName(S.player.gen);
    const p = PROV_BY_ID[g.loc];
    const mates = (S.player.mates || []).map(n => genByName(n)).filter(x => x);
    let h = `<div class="frame" style="padding:6px">
      <div style="display:flex;gap:7px">${portraitSVG(g, 52)}
      <div><b>${g.name}</b><div class="hz">재야 · ${p.name}</div>
      <div class="hz">명성 <b class="gold">${S.player.fame}</b> / 거병 110</div>
      <div class="bar" style="margin-top:3px"><i style="width:${clamp(S.player.fame/110*100,0,100)}%"></i></div>
      <div class="hz">동료 ${mates.length}명</div></div></div>
      ${mates.length ? `<div class="mini">${mates.map(m => `<div class="g" onclick="UI.genWin('${m.name.replace(/'/g,"\\'")}')">${portraitSVG(m,40)}<div class="n">${m.name}</div></div>`).join('')}</div>` : ''}
      </div><div class="grp">放 浪</div>`;
    RP.wandererActions(g).forEach(a => {
      const bad = g.acted || g.hurt > 0;
      h += `<div class="btn ${bad?'dis':''}" onclick="${bad?'':`UI.wandAct('${a.id}')`}" title="${a.d}">${a.n}</div>`;
    });
    h += `<div class="grp">情 報</div><div class="btn" onclick="UI.listGens()">장수 일람</div>
      <div class="btn" onclick="UI.listFactions()">세력 일람</div>`;
    box.innerHTML = h;
  },
  renderLog() {
    const box = document.getElementById('logbox');
    box.innerHTML = S.log.slice(0, 60).map(l =>
      `<div class="${l.kind}"><span class="t">${l.t}</span>${l.m}</div>`).join('');
  },

  /* ================= 명령 실행 ================= */
  order(o) {
    const g = genByName(UI.selGen || S.player.gen); if (!g) return;
    const d = ORDERS[o];
    const needGen = ['sow','reward'], needProv = ['move','spy','rumor','arson'];
    if (o === 'merc') { UI.mercWin(); return; }
    if (o === 'recruit') {
      const cands = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === g.loc);
      if (!cands.length) { UI.toast('이 도시에 재야 인재가 없다 (인재탐색으로 찾으시오)'); return; }
      UI.pickGenModal('등용할 인물', cands, n => {
        const t = genByName(n);
        UI.closeModal();
        if (t.fame >= 78) { UI.debateWin(g, t, () => UI.renderAll()); }   // 거물은 설전으로
        else UI.run(g, o, n);
      });
      return;
    }
    if (o === 'sow') {
      const cands = S.gens.filter(x => x.faction && x.faction !== g.faction && x.status === 'ok' && x.rank < 7);
      UI.pickGenModal('이간할 적장', cands.sort((a,b)=>a.loyal-b.loyal).slice(0, 60), n => UI.run(g, o, n));
      return;
    }
    if (o === 'reward') {
      UI.pickGenModal('포상할 장수', factionGens(g.faction).sort((a,b)=>a.loyal-b.loyal), n => UI.run(g, o, n));
      return;
    }
    if (needProv.indexOf(o) >= 0) {
      const filt = o === 'move' ? (q => q.owner === g.faction) : (q => q.owner !== g.faction);
      UI.askProv(o === 'move' ? '이동할 아군 도시를 고르시오' : '대상 도시를 고르시오', filt, id => UI.run(g, o, id));
      return;
    }
    UI.run(g, o);
  },
  run(g, o, arg) {
    UI.closeModal();
    const r = doOrder(g, o, arg);
    if (!r.ok) { UI.sfx('bad'); UI.toast(r.m); return; }
    let m = r.m;
    if (S.player.mode === 'officer' && g.name === S.player.gen) { const mm = RP.reportAction(g, o); if (mm) m += ' / ' + mm; }
    logMsg(`${g.name} — ${m}`, 'good', g.faction);
    UI.sfx(o === 'merc' || o === 'reward' ? 'coin' : 'ok');
    if (S.cheat && S.cheat.freeAct) g.acted = false;
    UI.toast(m);
    UI.renderAll();
  },
  selfAct(id) {
    const g = genByName(S.player.gen);
    if (id === 'recruit_p') {
      const cands = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === g.loc);
      if (!cands.length) { UI.toast('이 도시에 재야 인재가 없다'); return; }
      UI.pickGenModal('등용할 인물', cands, n => { UI.closeModal(); const r = RP.doSelf(g, id, n); UI.after(r, g); });
      return;
    }
    if (id === 'move_p') { UI.askProv('이동할 아군 도시를 고르시오', q => q.owner === g.faction, pid => { const r = RP.doSelf(g, id, pid); UI.after(r, g); }); return; }
    if (id === 'resign' || id === 'rebel') {
      UI.confirm(id === 'resign' ? '정말 하야하시겠습니까? 관직과 공적을 모두 잃고 재야로 돌아갑니다.'
        : `정말 거병하시겠습니까? ${PROV_BY_ID[g.loc].name}에서 주군을 배반합니다. 실패하면 처형됩니다.`,
        () => { const r = RP.doSelf(g, id); UI.after(r, g); });
      return;
    }
    const r = RP.doSelf(g, id); UI.after(r, g);
  },
  wandAct(id) {
    const g = genByName(S.player.gen);
    if (id === 'w_travel') {
      const adj = ADJ[g.loc];
      UI.openModal('유력(遊歷) — 어디로 갈 것인가', `<div style="display:grid;gap:5px;min-width:320px">${
        adj.map(a => { const q = PROV_BY_ID[a.to], qf = q.owner ? fOf(q.owner) : null;
          return `<div class="btn" style="text-align:left" onclick="UI.closeModal();UI.wandGo('${q.id}')">
            <b>${q.name}</b> <span class="hz">${q.han} · ${qf ? qf.name : '무주'} · ${a.t==='sea'?'해로':'육로'}</span>
            <div class="hz">${q.note}</div></div>`; }).join('')}</div>`, [{n:'취소', f:UI.closeModal}]);
      return;
    }
    if (id === 'w_friend') {
      const c = S.gens.filter(x => !x.faction && x.status === 'ok' && x.loc === g.loc && x !== g && (S.player.mates||[]).indexOf(x.name) < 0);
      if (!c.length) { UI.toast('이 고을에 함께할 인물이 없다'); return; }
      UI.pickGenModal('동료로 삼을 인물', c, n => { UI.closeModal(); UI.after(RP.doWander(g, id, n), g); });
      return;
    }
    if (id === 'w_serve') {
      const list = Object.values(S.factions).filter(f => f.alive);
      UI.openModal('사관(仕官) — 누구를 섬기겠는가', `<div style="display:grid;gap:5px;min-width:380px;max-height:60vh">${
        list.map(f => `<div class="btn" style="text-align:left" onclick="UI.closeModal();UI.after(RP.doWander(genByName(S.player.gen),'w_serve','${f.id}'),genByName(S.player.gen))">
          <div style="display:flex;gap:6px;align-items:center"><i style="width:11px;height:11px;background:${f.color};display:inline-block"></i>
          <b>${f.name}</b><span class="hz">${f.han} · 군주 ${f.ruler} · ${factionProv(f.id).length}성 · 장수 ${factionGens(f.id).length}</span></div>
          <div class="hz">${f.desc}</div></div>`).join('')}</div>`, [{n:'취소', f:UI.closeModal}]);
      return;
    }
    if (id === 'w_rise') {
      const p = PROV_BY_ID[g.loc];
      UI.confirm(`${p.name}에서 거병합니다.<br>명성 ${S.player.fame}/110 · 동료 ${(S.player.mates||[]).length}/2 · ${p.name} 민심 ${Math.round(p.mood)}(42 이하 필요)<br>실패하면 죽습니다.`,
        () => UI.after(RP.doWander(g, id), g));
      return;
    }
    UI.after(RP.doWander(g, id), g);
  },
  wandGo(id) { const g = genByName(S.player.gen); UI.after(RP.doWander(g, 'w_travel', id), g); },
  after(r, g) {
    UI.closeModal();
    if (!r.ok) { UI.sfx('bad'); UI.toast(r.m); return; }
    UI.sfx('ok');
    if (S.cheat && S.cheat.freeAct) g.acted = false;
    logMsg(`${g.name} — ${r.m}`, 'good', g.faction);
    UI.toast(r.m);
    if (S.player.mode === 'lord') { UI.selProv = g.loc; UI.selGen = null; UI.buildMapRefresh(); }
    UI.selProv = g.loc;
    UI.renderAll();
  },
  buildMapRefresh() { UI.updateMap(); },
  autoDelegate() {
    const f = fOf(S.player.faction); if (!f) return;
    const before = f.gold;
    const save = S.player.mode; S.player.mode = 'auto';
    aiFaction(f);
    S.player.mode = save;
    UI.toast(`위임 완료 — 금 ${before} → ${f.gold}`);
    UI.renderAll();
  },
  assignGov() {
    const p = PROV_BY_ID[UI.selProv];
    const gs = provGens(p.id).filter(g => g.faction === p.owner);
    if (!gs.length) { UI.toast('이 성에 장수가 없다'); return; }
    UI.pickGenModal('태수로 임명할 장수', gs, n => { p.gov = n; UI.closeModal();
      logMsg(`${n}을 ${p.name} 태수로 임명했다.`, 'good', p.owner); UI.renderAll(); });
  },

  /* ================= 모달 기본 ================= */
  openModal(title, html, foots, cls) {
    const w = document.getElementById('win');
    w.className = 'win ' + (cls || '');
    document.getElementById('wtitle').firstElementChild.textContent = title;
    document.getElementById('wbody').innerHTML = html;
    document.getElementById('wfoot').innerHTML = '';
    (foots || []).forEach((b, i) => {
      const e = document.createElement('div');
      e.className = 'btn ' + (b.c || ''); e.textContent = b.n; e.onclick = b.f;
      document.getElementById('wfoot').appendChild(e);
    });
    document.getElementById('modal').classList.add('on');
  },
  closeModal() { document.getElementById('modal').classList.remove('on'); },
  confirm(msg, cb) {
    UI.openModal('확 인', `<div style="max-width:420px;line-height:1.85;padding:6px">${msg}</div>`,
      [{n:'취소', f:UI.closeModal}, {n:'실행', c:'red', f:() => { UI.closeModal(); cb(); }}]);
  },
  toast(m) {
    const t = document.getElementById('toast'), d = document.createElement('div');
    d.innerHTML = m; t.appendChild(d);
    setTimeout(() => d.remove(), 3400);
  },
  openEvent(title, html) {
    UI.openModal(title, html, [{n:'계속', f:UI.closeModal}], 'evwin');
  },
  pickGenModal(title, list, cb) {
    UI.openModal(title, `<div class="pgrid" style="max-height:62vh;min-width:520px">${
      list.map(g => `<div class="pcard" onclick="UI._pick('${g.name.replace(/'/g,"\\'")}')">
        ${portraitSVG(g, 96)}<div class="nm">${g.name}</div>
        <div class="rk">통${g.lead} 무${g.war} 지${g.int}<br>정${g.pol} 매${g.cha}${g.faction ? '<br>충'+Math.round(g.loyal) : ''}</div></div>`).join('')
      }</div>`, [{n:'취소', f:UI.closeModal}]);
    UI._pickCb = cb;
  },
  _pick(n) { const cb = UI._pickCb; UI._pickCb = null; if (cb) cb(n); },

  /* ================= 인물 상세 ================= */
  genWin(name) {
    const g = genByName(name); if (!g) return;
    const f = g.faction ? fOf(g.faction) : null;
    const me = genByName(S.player.gen || '');
    let acts = '';
    if (S.player.mode === 'lord' && f && f.id === S.player.faction && g.rank < 7) {
      acts += `<div class="btn sm" onclick="UI.closeModal();UI.pickGenReward('${name}')">포상</div>`;
    }
    UI.openModal(g.name + ' — ' + g.han, `<div class="gdet">
      <div class="pic">${portraitSVG(g, 210)}
        <div class="hz" style="text-align:center;margin-top:4px">${f ? f.name + ' · ' + RANKS[g.rank].n : '재야'}</div></div>
      <div class="info">
        <h4>${g.name} <span class="hz" style="font-size:14px">${g.han}</span></h4>
        <div class="hz">${g.age}세 · 소재 ${g.loc ? PROV_BY_ID[g.loc].name : '-'} ${g.hurt ? '· <span class="seal">부상 '+g.hurt+'개월</span>' : ''}
          ${g.status === 'dead' ? '· <span class="seal">사망</span>' : ''}</div>
        ${UI.statGrid(g)}
        <div><span class="hz">병과 적성</span><div class="aptrow" style="margin-top:3px">${UI.aptRow(g)}</div></div>
        <div><span class="hz">특기</span><div class="skills" style="margin-top:3px">${UI.skillTags(g) || '<span class="hz">없음</span>'}</div></div>
        <div class="st"><span class="k">야망</span><span class="bar r"><i style="width:${g.ambition}%"></i></span><span class="v">${g.ambition}</span></div>
        <div class="st"><span class="k">의리</span><span class="bar g"><i style="width:${g.faith}%"></i></span><span class="v">${g.faith}</span></div>
        ${f ? `<div class="st"><span class="k">충성</span><span class="bar"><i style="width:${g.loyal}%"></i></span><span class="v">${Math.round(g.loyal)}</span></div>
        <div class="st"><span class="k">공적</span><span class="hz">${g.merit}</span><span class="v"></span></div>` : ''}
        <div class="row" style="margin-top:4px">${acts}</div>
      </div></div>`, [{n:'닫기', f:UI.closeModal}]);
  },
  pickGenReward(n) { const g = genByName(UI.selGen || S.player.gen); if (g) UI.run(g, 'reward', n); },

  /* ================= 장수 일람 ================= */
  glSort: {k:'lead', d:-1}, glFilter: 'all',
  listGens() {
    UI.renderGL();
  },
  renderGL() {
    const cols = [['이름','name'],['세력','fac'],['소재','loc'],['관직','rank'],['통','lead'],['무','war'],['지','int'],['정','pol'],['매','cha'],
      ['특기','sk'],['적성','apt'],['충','loyal'],['야','ambition'],['의','faith'],['나이','age']];
    let list = S.gens.filter(g => g.status === 'ok');
    if (UI.glFilter === 'mine') list = list.filter(g => g.faction === S.player.faction);
    else if (UI.glFilter === 'free') list = list.filter(g => !g.faction);
    else if (UI.glFilter !== 'all') list = list.filter(g => g.faction === UI.glFilter);
    const k = UI.glSort.k, d = UI.glSort.d;
    list.sort((a, b) => {
      let x = k === 'fac' ? (a.faction ? fOf(a.faction).name : 'ㅎ') : k === 'loc' ? (a.loc ? PROV_BY_ID[a.loc].name : '') : a[k];
      let y = k === 'fac' ? (b.faction ? fOf(b.faction).name : 'ㅎ') : k === 'loc' ? (b.loc ? PROV_BY_ID[b.loc].name : '') : b[k];
      if (typeof x === 'string') return d * x.localeCompare(y);
      return d * ((x || 0) - (y || 0));
    });
    const facs = Object.values(S.factions).filter(f => f.alive).sort((a,b)=>factionProv(b.id).length-factionProv(a.id).length);
    const filt = `<div class="row" style="flex-wrap:wrap;gap:4px;margin-bottom:6px">
      <span class="btn sm ${UI.glFilter==='all'?'sel':''}" onclick="UI.glF('all')">전체 ${list.length}</span>
      ${S.player.faction ? `<span class="btn sm ${UI.glFilter==='mine'?'sel':''}" onclick="UI.glF('mine')">우리 세력</span>` : ''}
      <span class="btn sm ${UI.glFilter==='free'?'sel':''}" onclick="UI.glF('free')">재야</span>
      <select onchange="UI.glF(this.value)"><option value="">세력 선택…</option>
      ${facs.map(f => `<option value="${f.id}" ${UI.glFilter===f.id?'selected':''}>${f.name}</option>`).join('')}</select></div>`;
    const rows = list.slice(0, 400).map(g => {
      const cls = (v) => v >= 95 ? 's99' : v >= 88 ? 's90' : v >= 76 ? 's80' : v >= 60 ? 's70' : 's0';
      return `<tr class="${g.name === S.player.gen ? 'me' : ''}" onclick="UI.genWin('${g.name.replace(/'/g,"\\'")}')" style="cursor:pointer">
        <td>${g.name}</td><td>${g.faction ? fOf(g.faction).name : '<span class="hz">재야</span>'}</td>
        <td class="hz">${g.loc ? PROV_BY_ID[g.loc].name : '-'}</td><td class="hz">${RANKS[g.rank].n.split('(')[0]}</td>
        <td class="stv ${cls(g.lead)}">${g.lead}</td><td class="stv ${cls(g.war)}">${g.war}</td>
        <td class="stv ${cls(g.int)}">${g.int}</td><td class="stv ${cls(g.pol)}">${g.pol}</td><td class="stv ${cls(g.cha)}">${g.cha}</td>
        <td class="hz" style="max-width:190px;overflow:hidden">${g.skills.join(' ')}</td>
        <td class="hz">${g.apt}</td><td class="stv">${g.faction ? Math.round(g.loyal) : '-'}</td>
        <td class="stv hz">${g.ambition}</td><td class="stv hz">${g.faith}</td><td class="stv hz">${g.age}</td></tr>`;
    }).join('');
    UI.openModal('武 將 一 覽', filt + `<div style="max-height:70vh;overflow:auto;min-width:900px">
      <table class="gl"><thead><tr>${cols.map(c => `<th onclick="UI.glS('${c[1]}')">${c[0]}${UI.glSort.k===c[1]?(UI.glSort.d<0?' ▼':' ▲'):''}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody></table></div>`, [{n:'닫기', f:UI.closeModal}]);
  },
  glS(k) { if (UI.glSort.k === k) UI.glSort.d *= -1; else { UI.glSort.k = k; UI.glSort.d = -1; } UI.renderGL(); },
  glF(v) { UI.glFilter = v || 'all'; UI.renderGL(); },

  /* ================= 세력 일람 ================= */
  listFactions() {
    const list = Object.values(S.factions).filter(f => f.alive)
      .map(f => ({f, p:factionProv(f.id), g:factionGens(f.id), pw:factionPower(f.id)}))
      .sort((a, b) => b.pw - a.pw);
    const me = S.player.faction;
    UI.openModal('勢 力 一 覽', `<div style="max-height:72vh;overflow:auto;min-width:760px">
      <table class="gl"><thead><tr><th>세력</th><th>군주</th><th>지역</th><th>성</th><th>장수</th><th>병력</th><th>금</th><th>기술</th><th>국력</th><th>외교</th></tr></thead><tbody>
      ${list.map(({f, p, g, pw}) => {
        const rel = me && f.id !== me ? relation(me, f.id) : 'self';
        const rv = me && f.id !== me ? relVal(me, f.id) : 0;
        return `<tr class="${f.id === me ? 'me' : ''}">
          <td><i style="width:10px;height:10px;background:${f.color};display:inline-block;margin-right:4px"></i>${f.name} <span class="hz">${f.han}</span></td>
          <td>${f.ruler}</td><td class="hz">${REGIONS[f.region].n}</td>
          <td class="stv">${p.length}</td><td class="stv">${g.length}</td>
          <td class="stv">${p.reduce((s, q) => s + q.troops, 0).toLocaleString()}</td>
          <td class="stv">${f.id === me || !me ? f.gold : '?'}</td><td class="stv">${f.techs.length}<span class="hz">/${TECHS.length}</span></td>
          <td class="stv gold">${pw}</td>
          <td>${rel === 'self' ? '<span class="jade">자국</span>' : `<span class="dst" style="background:${DIPLO[rel].c}33;border-color:${DIPLO[rel].c}">${DIPLO[rel].n}</span> <span class="hz">${rv}</span>`}</td></tr>`;
      }).join('')}</tbody></table></div>`, [{n:'닫기', f:UI.closeModal}]);
  },

  /* ================= 기술 ================= */
  techWin() {
    const f = fOf(S.player.faction);
    if (!f) { UI.toast('소속 세력이 없다'); return; }
    const aff = REGION_TECH_AFFINITY[f.region] || {};
    const h = `<div class="hz" style="margin-bottom:6px">연구점은 상업·인구·지력 높은 장수에서 매달 쌓입니다.
      ${REGIONS[f.region].n}은 <span class="gold">${Object.keys(aff).map(t => TECH_BY_ID[t].n).join(' · ')}</span> 연구비가 저렴합니다.</div>
      <div class="trees">${Object.keys(TREES).map(tr => {
        const T = TREES[tr];
        const nodes = TECHS.filter(t => t.tree === tr).sort((a, b) => a.tier - b.tier);
        return `<div class="tree"><div class="th" style="color:${T.c}">${T.han} ${T.n}<br><span class="hz" style="font-size:11px">보유 연구점 ${Math.round(f.tp[tr])}</span></div>
          ${nodes.map(t => { const st = canResearch(f.id, t), cost = techCost(f.id, t);
            const cls = st === 'done' ? 'done' : st === 'ok' ? 'ready' : st === 'poor' ? '' : 'locked';
            const dis = st !== 'ok' || S.player.mode !== 'lord';
            return `<div class="tnode ${cls}" onclick="${dis ? '' : `UI.doResearch('${t.id}')`}">
              <span class="tier">${t.tier}</span><span class="cst">${st === 'done' ? '완료' : cost + (aff[t.id] ? ' <span class="jade">▼</span>' : '')}</span>
              <b>${t.n}</b> <span class="hz">${t.han}</span>
              <p>${t.d}</p>
              ${st === 'locked' ? `<p class="hz">선행: ${t.req.map(r => TECH_BY_ID[r].n).join(', ')}</p>` : ''}</div>`;
          }).join('')}</div>`;
      }).join('')}</div>`;
    UI.openModal('技 術 樹 — 기술 연구', h, [{n:'닫기', f:UI.closeModal}]);
  },
  doResearch(id) {
    const f = fOf(S.player.faction);
    if (research(f.id, id)) { UI.toast(`「${TECH_BY_ID[id].n}」 연구 완료!`); UI.techWin(); UI.renderTop(); }
    else UI.toast('연구점이 부족하다');
  },

  /* ================= 외교 ================= */
  diploWin() {
    const me = S.player.faction;
    if (!me) { UI.toast('소속 세력이 없다'); return; }
    const f = fOf(me);
    const list = Object.values(S.factions).filter(x => x.alive && x.id !== me)
      .sort((a, b) => relVal(me, b.id) - relVal(me, a.id));
    const lord = S.player.mode === 'lord';
    const h = `<div class="hz" style="margin-bottom:6px">국고 <span class="gold">${f.gold}금</span> ·
      관계도는 예물·시간으로 오릅니다. 동맹은 관계 45 이상, 신속 요구는 패자책봉 기술이 필요합니다.</div>
      <div style="max-height:66vh;overflow:auto;min-width:720px"><table class="gl"><thead><tr>
      <th>세력</th><th>군주</th><th>국력</th><th>상태</th><th>관계</th><th>외교 행동</th></tr></thead><tbody>
      ${list.map(x => {
        const st = relation(me, x.id), v = relVal(me, x.id);
        const b = (a, n, g2) => `<span class="btn sm ${lord ? '' : 'dis'}" onclick="${lord ? `UI.diplo('${x.id}','${a}',${g2||0})` : ''}">${n}</span>`;
        return `<tr><td><i style="width:10px;height:10px;background:${x.color};display:inline-block;margin-right:4px"></i>${x.name}</td>
          <td>${x.ruler}</td><td class="stv">${factionPower(x.id)}</td>
          <td><span class="dst" style="background:${DIPLO[st].c}33;border-color:${DIPLO[st].c}">${DIPLO[st].n}</span></td>
          <td><span class="bar ${v>=0?'g':'r'}" style="width:70px;display:inline-block"><i style="width:${Math.abs(v)}%"></i></span> <span class="stv">${v}</span></td>
          <td class="row" style="gap:3px;flex-wrap:wrap">
            ${b('gift','예물 300', 300)}${b('truce','불가침', 150)}${b('ally','동맹', 200)}
            ${st === 'war' ? b('peace','정전', 100) : b('war','선전포고')}
            ${b('demand','금 요구')}${st === 'ally' ? b('joint','공동출병') : ''}
            ${factionHasTech(me, 'dip_hege') ? b('vassal','신속 요구') : ''}</td></tr>`;
      }).join('')}</tbody></table></div>`;
    UI.openModal('外 交', h, [{n:'닫기', f:UI.closeModal}]);
  },
  diplo(tid, act, gold) {
    const r = diploAct(S.player.faction, tid, act, gold || 0, null);
    UI.toast(r.m); logMsg(`【외교】${r.m}`, r.ok ? 'good' : '', S.player.faction);
    UI.diploWin(); UI.renderTop(); UI.updateMap();
  },

  /* ================= 출병 편성 ================= */
  startWar() {
    const g = genByName(UI.selGen || S.player.gen);
    if (!g) { UI.toast('출병할 장수를 고르시오'); return; }
    const p = PROV_BY_ID[g.loc];
    if (!p || p.owner !== g.faction) { UI.toast('아군 도시에서만 출병할 수 있다'); return; }
    const tg = ADJ[p.id].filter(a => PROV_BY_ID[a.to].owner !== g.faction);
    if (!tg.length) { UI.toast('인접한 적/무주 도시가 없다'); return; }
    UI.askProv(`${p.name}에서 출병 — 목표를 고르시오`,
      q => ADJ[p.id].some(a => a.to === q.id) && q.owner !== g.faction,
      id => UI.armyWin(p.id, id));
  },
  armyWin(fromId, toId) {
    const from = PROV_BY_ID[fromId], to = PROV_BY_ID[toId], f = fOf(from.owner);
    const link = ADJ[fromId].find(a => a.to === toId);
    const gs = provGens(fromId).filter(g => g.faction === f.id && g.hurt === 0 && !g.acted);
    if (!gs.length) { UI.toast('출진할 수 있는 장수가 없다'); return; }
    gs.sort((a, b) => (b.lead * 0.6 + b.war * 0.4) - (a.lead * 0.6 + a.war * 0.4));
    UI.army = {from:fromId, to:toId, link:link.t, rows: gs.map((g, i) => ({
      name:g.name, troops: i < 3 ? Math.min(rankOf(g).cmd, Math.floor(from.troops * (i === 0 ? 0.35 : 0.2))) : 0,
      type: bestType(g, from, f), on: i < 3
    }))};
    UI.armyRender();
  },
  armyRender() {
    const A = UI.army, from = PROV_BY_ID[A.from], to = PROV_BY_ID[A.to], f = fOf(from.owner);
    const units = A.rows.filter(r => r.on && r.troops > 0).map(r => {
      const g = genByName(r.name);
      return {gen:r.name, troops:r.troops, type:r.type, train:from.train, morale:70 + (g.cha - 60) / 6,
        weapon:from.weapon, armor:from.armor, init:r.troops};
    });
    const tot = units.reduce((s, u) => s + u.troops, 0);
    const fakeB = {prov:to, atk:{fid:f.id, units}, def:{fid:to.owner, units:[]}};
    const myPow = units.length ? Math.round(sidePower({fid:f.id, units, luck:1}, fakeB)) : 0;
    const enPow = Math.round(provDefEst(to));
    const need = A.link === 'sea' ? Math.ceil(tot / 22) : 0;
    const cc = campaignCost(tot, A.link);
    const body = `<div style="min-width:760px">
      <div class="row" style="margin-bottom:6px">
        <b>${from.name}</b> <span class="hz">병력 ${from.troops} · 훈련 ${Math.round(from.train)} · 무기 ${from.weapon} · 군마 ${from.horses} · 전선 ${from.ships}</span>
        <span class="gold">→</span> <b>${to.name}</b>
        <span class="hz">${to.owner ? fOf(to.owner).name : '무주'} · 성벽 ${to.wall} · ${TERRAIN[to.t].n} · 추정병력 ${to.owner === f.id || to.spied || !to.owner ? to.troops : '?'}</span>
        <span class="tag">${A.link === 'sea' ? '해로 — 전선 필요' : A.link === 'mountain' ? '산길' : A.link === 'river' ? '수로' : '가도'}</span></div>
      <div class="army">${A.rows.map((r, i) => {
        const g = genByName(r.name);
        const cmd = rankOf(g).cmd;
        return `<div class="arow" style="${r.on ? '' : 'opacity:.45'}">
          <div>${portraitSVG(g, 40)}</div>
          <div><b>${g.name}</b> <span class="hz">${RANKS[g.rank].n} 지휘한도 ${cmd}</span>
            <div class="hz">통${g.lead} 무${g.war} 지${g.int} · ${['foot','bow','cav','navy','siege'].map(t=>UNITS[t].n[0]+aptOf(g,t)).join(' ')}
            ${g.skills.length ? ' · ' + g.skills.join(',') : ''}</div></div>
          <div><select onchange="UI.armySet(${i},'type',this.value)">
            ${Object.keys(UNITS).filter(t => (t !== 'gun' || f.bonus.gunOK) && (t !== 'ele' || f.bonus.eleOK)).map(t =>
              `<option value="${t}" ${r.type===t?'selected':''}>${UNITS[t].n}(${aptOf(g,t)})</option>`).join('')}</select></div>
          <div><input type="range" min="0" max="${Math.min(cmd, from.troops)}" step="100" value="${r.troops}"
            oninput="UI.armySet(${i},'troops',this.value)"></div>
          <div class="row"><input type="number" style="width:64px" value="${r.troops}" onchange="UI.armySet(${i},'troops',this.value)">
            <span class="btn sm ${r.on?'sel':''}" onclick="UI.armySet(${i},'on',${!r.on})">${r.on?'참전':'대기'}</span></div>
        </div>`; }).join('')}</div>
      <div class="frame" style="margin-top:8px;padding:8px">
        <div class="row"><span>출진 병력 <b class="gold">${tot.toLocaleString()}</b> / 보유 ${from.troops.toLocaleString()}</span>
          <span class="sp"></span>
          <span>아군 추정 전력 <b class="gold">${myPow.toLocaleString()}</b></span>
          <span>적 추정 방어력 <b class="seal">${enPow.toLocaleString()}</b></span>
          <span class="tag">${myPow > enPow * 1.3 ? '우세' : myPow > enPow * 0.85 ? '호각' : '열세'}</span></div>
        <div class="row" style="margin-top:4px">
          <span>군량 수송 — 식량 <b class="${f.food < cc.food ? 'seal' : 'gold'}">${cc.food.toLocaleString()}</b>
            <span class="hz">/ 보유 ${f.food.toLocaleString()}</span></span>
          <span>금 <b class="${f.gold < cc.gold ? 'seal' : 'gold'}">${cc.gold.toLocaleString()}</b>
            <span class="hz">/ 보유 ${f.gold.toLocaleString()}</span></span>
          <span class="sp"></span>
          <span class="hz">${A.link === 'sea' ? '해로 +30%' : A.link === 'mountain' ? '산길 +20%' : ''}</span></div>
        ${f.food < cc.food ? '<div class="warn">식량이 부족해 출병할 수 없습니다</div>' : ''}
        ${f.gold < cc.gold ? '<div class="warn">금이 부족해 출병할 수 없습니다</div>' : ''}
        ${tot > from.troops ? '<div class="warn">병력이 부족합니다</div>' : ''}
        ${need ? `<div class="hz">해로 진격 — 전선 ${need} 소모 (보유 ${from.ships})${from.ships < need ? ' <span class="warn">전선 부족</span>' : ''}</div>` : ''}
        <div class="hz" style="margin-top:4px">성벽이 남아 있으면 방어측 태세가 최대 2.5배. 공성 병종과 화약 기술이 성을 여는 열쇠입니다.</div>
      </div></div>`;
    UI.openModal('出 兵 — 부대 편성', body, [
      {n:'취소', f:UI.closeModal},
      {n:'출 진', c:'red', f:UI.doAttack}]);
  },
  armySet(i, k, v) {
    const A = UI.army, r = A.rows[i];
    if (k === 'troops') r.troops = clamp(parseInt(v) || 0, 0, rankOf(genByName(r.name)).cmd);
    else if (k === 'on') r.on = (v === true || v === 'true');
    else r[k] = v;
    if (k === 'troops' && r.troops > 0) r.on = true;
    UI.armyRender();
  },
  doAttack() {
    const A = UI.army, from = PROV_BY_ID[A.from], f = fOf(from.owner);
    const units = A.rows.filter(r => r.on && r.troops > 0).map(r => {
      const g = genByName(r.name);
      return {gen:r.name, troops:r.troops, type:r.type, train:Math.round(from.train), morale:Math.round(70 + (g.cha - 60) / 6),
        weapon:from.weapon, armor:from.armor};
    });
    if (!units.length) { UI.toast('출진할 부대가 없다'); return; }
    const tot = units.reduce((s, u) => s + u.troops, 0);
    if (tot > from.troops) { UI.toast('병력이 부족하다'); return; }
    if (A.link === 'sea' && from.ships < Math.ceil(tot / 22)) { UI.toast('전선이 부족하다'); return; }
    const cc2 = campaignCost(tot, A.link);
    if (f.food < cc2.food) { UI.toast(`군량이 부족하다 (식량 ${cc2.food.toLocaleString()} 필요)`); return; }
    if (f.gold < cc2.gold) { UI.toast(`수송비가 부족하다 (금 ${cc2.gold.toLocaleString()} 필요)`); return; }
    UI.closeModal();
    const B = launchAttack(f.id, A.from, A.to, {units}, false);
    if (!B) { UI.toast('출병할 수 없다'); return; }
    if (S.player.mode === 'officer') RP.reportAction(genByName(S.player.gen), 'attack');
    const i = (S.pendingBattles || []).indexOf(B);
    if (i >= 0) S.pendingBattles.splice(i, 1);
    UI.openBattle(B, () => { UI.renderAll(); });
  },

  /* ================= 전투 화면 ================= */
  openBattle(B, done) {
    UI.bt = {B, done, auto:false};
    const myF = S.player.faction;
    const myGen = S.player.gen;
    UI.bt.side = (B.atk.fid === myF || B.atk.units.some(u => u.gen === myGen)) ? 'atk' : 'def';
    document.getElementById('battle').classList.add('on');
    UI.sfx('drum');
    UI.renderBattle();
  },
  renderBattle() {
    const {B, side} = UI.bt;
    document.getElementById('bhead').textContent = `${B.prov.name}(${B.prov.han}) 攻防戰 — 제 ${Math.min(B.round, B.maxRound)} 합 / ${B.maxRound}`;
    const hd = (s, isDef) => `<div style="min-width:0"><b style="color:${s.fid ? fOf(s.fid).color : '#aaa'};text-shadow:0 0 6px #000">${s.name}</b>
        <span class="hz">${side === (isDef ? 'def' : 'atk') ? '(我)' : ''}</span>
        <div class="hz">병력 ${sideTroops(s).toLocaleString()} / ${s.troops0.toLocaleString()} · 전술 ${tacName(s.tactic)}</div></div>
      <div style="width:110px"><div class="hz">사기 ${Math.round(s.morale)}</div>
        <div class="bar ${s.morale > 50 ? 'g' : 'r'}"><i style="width:${s.morale}%"></i></div>
        ${isDef ? `<div class="hz" style="margin-top:3px">성벽 ${B.wall}</div><div class="bar p"><i style="width:${clamp(B.wall / Math.max(1, B.wall0) * 100, 0, 100)}%"></i></div>` : ''}</div>`;
    document.getElementById('bahd').innerHTML = hd(B.atk, false);
    document.getElementById('bdhd').innerHTML = hd(B.def, true);
    const ucard = s => s.units.map(u => {
      const g = genByName(u.gen);
      return `<div class="bu ${u.troops <= 0 ? 'dead' : ''}">
        ${g ? portraitSVG(g, 42) : ''}
        <div class="i"><b>${u.gen}</b> <span class="tag">${UNITS[u.type].n}</span>
          ${g && g.hurt ? '<span class="seal">부상</span>' : ''}
          <div class="hz">병력 ${Math.max(0, u.troops).toLocaleString()} · 훈련 ${Math.round(u.train)} · 무기 ${u.weapon} · 적성 ${g ? aptOf(g, u.type) : '-'}</div>
          <div class="bar r"><i style="width:${clamp(u.troops / Math.max(1, u.init) * 100, 0, 100)}%"></i></div></div></div>`;
    }).join('');
    document.getElementById('bau').innerHTML = ucard(B.atk);
    document.getElementById('bdu').innerHTML = ucard(B.def);
    const lg = document.getElementById('blog');
    lg.innerHTML = B.log.map(l => `<div class="${l.k}">${l.m}</div>`).join('');
    lg.scrollTop = lg.scrollHeight;
    const tb = document.getElementById('btacs');
    if (B.over) {
      document.getElementById('btacttl').innerHTML = `<span class="gold">전투 종료</span>`;
      tb.innerHTML = `<div class="btn" style="grid-column:span 2" onclick="UI.battleDone()">결 과 확 인</div>`;
      return;
    }
    const me = side === 'atk' ? B.atk : B.def;
    const foeS = side === 'atk' ? B.def : B.atk;
    // 적장이 일기토를 청한다
    if (!B.over && B.askDuel !== B.round && B.round >= 2 && !(B.duelUsed && B.round - B.duelUsed < 3)) {
      B.askDuel = B.round;
      const ch = pickChampion(foeS), mine = pickChampion(me);
      if (ch && mine && ch.war >= 82 && Math.random() < 0.16) {
        UI.openModal('一 騎 討 — 도전', `<div style="min-width:460px;text-align:center;line-height:1.9">
          <div style="display:flex;gap:14px;justify-content:center;align-items:center">
            ${portraitSVG(ch, 120)}<div style="font-size:26px" class="seal">⚔</div>${portraitSVG(mine, 120)}</div>
          <p style="margin-top:10px"><b class="gold">${ch.name}</b>(무력 ${ch.war})이 진 앞에 나와
            <b>${mine.name}</b>(무력 ${mine.war})에게 단기 승부를 청한다!</p>
          <p class="hz">거절하면 아군 사기가 8 떨어진다. 이기면 적 사기가 크게 꺾인다.</p></div>`,
          [{n:'거절한다', f:() => { me.morale = clamp(me.morale - 8, 0, 100);
              blog(B, `${mine.name}이 일기토를 거절했다. 아군 사기 -8`, 'bad'); UI.closeModal(); UI.renderBattle(); }},
           {n:'응한다', c:'red', f:() => { UI.closeModal(); B.duelUsed = B.round;
              const D = duelStart(B, me, foeS); if (D) UI.duelWin(D, () => UI.renderBattle()); }}]);
        return;
      }
    }
    const leader = sideLeader(me);
    const ranged = me.units.some(u => (u.type === 'bow' || u.type === 'gun') && u.troops > 0);
    document.getElementById('btacttl').innerHTML = `전술 선택 — 지휘 <span class="gold">${leader ? leader.name : '-'}</span>
      <span class="hz">(지력 ${leader ? leader.int : 0})</span>`;
    tb.innerHTML = TACTICS.map(t => {
      let dis = false;
      if (t.need === 'ranged' && !ranged) dis = true;
      if (t.need === 'plot' && (!leader || leader.int < 55)) dis = true;
      if (t.id === 'retreat' && side === 'def') dis = true;
      if (t.id === 'flood' && ['river','coast','island'].indexOf(B.prov.t) < 0) dis = true;
      return `<div class="btn ${dis ? 'dis' : ''}" onclick="${dis ? '' : `UI.btac('${t.id}')`}" title="${t.d}">${t.n}<br><span class="hz" style="font-size:10px">${t.han}</span></div>`;
    }).join('') + `<div class="btn jade" style="grid-column:span 2" onclick="UI.bauto()">자동 진행 (위임)</div>`;
  },
  btac(t) {
    const {B, side} = UI.bt;
    if (t === 'duel') {           // 일기토는 합을 소모하지 않고 별도로 벌어진다
      const me = side === 'atk' ? B.atk : B.def, foe = side === 'atk' ? B.def : B.atk;
      if (B.duelUsed && B.round - B.duelUsed < 3) { UI.toast('아직 다시 청할 수 없다 (3합 간격)'); return; }
      const D = duelStart(B, me, foe);
      if (!D) { UI.toast('일기토에 응할 장수가 없다'); return; }
      B.duelUsed = B.round;
      UI.duelWin(D, () => { UI.renderBattle(); });
      return;
    }
    UI.sfx('clash');
    if (side === 'atk') battleRound(B, t, null);
    else battleRound(B, aiTactic(B.atk, B.def, B, false), t);
    if (B.over) UI.sfx(((B.result === 'atkWin') === (side === 'atk')) ? 'win' : 'lose');
    UI.renderBattle();
  },
  bauto() {
    const {B} = UI.bt;
    let g = 0;
    while (!B.over && g++ < 40) battleRound(B, aiTactic(B.atk, B.def, B, false), aiTactic(B.def, B.atk, B, true));
    if (!B.over) finishBattle(B, 'timeout');
    UI.renderBattle();
  },
  battleDone() {
    const {B, done} = UI.bt;
    document.getElementById('battle').classList.remove('on');
    const myF = S.player.faction;
    // 포로 처리
    if (B.prisoners && B.prisoners.length) {
      if (B.atk.fid === myF && S.player.mode !== 'wanderer') { UI.prisonerWin(B.prisoners.slice(), done); return; }
      B.prisoners.forEach(g => {
        if (g.name === S.player.gen) {
          aiPrisoner(g, B.atk.fid);
          if (g.status === 'dead') S.gameOver = {win:false, reason:'포로가 되어 처형되었다.'};
          else if (g.faction === B.atk.fid) { S.player.faction = g.faction; S.player.mode = g.rank === 7 ? 'lord' : 'officer';
            RP.assignMission(g); UI.toast(`${fOf(g.faction).name}에 항복하여 새 주군을 섬기게 되었다`); }
          else { S.player.mode = 'wanderer'; S.player.faction = null; S.player.fame = Math.round(S.player.fame * 0.6);
            UI.toast('석방되어 재야를 떠돌게 되었다'); }
        } else aiPrisoner(g, B.atk.fid);
      });
    }
    UI.bt = null;
    if (done) done(); else UI.renderAll();
  },
  prisonerWin(list, done) {
    if (!list.length) { UI.bt = null; if (done) done(); else UI.renderAll(); return; }
    const g = list[0];
    const f = fOf(S.player.faction);
    const ruler = genByName(f.ruler);
    const pr = Math.round(clamp(0.22 + (ruler ? (ruler.cha - 60) / 180 : 0) + (100 - g.faith) / 220 + fx(f.id, 'recruit'), 0.03, 0.95) * 100);
    UI.openModal('捕 虜 — ' + g.name, `<div class="gdet" style="min-width:600px">
      <div class="pic">${portraitSVG(g, 190)}</div>
      <div class="info">
        <h4>${g.name} <span class="hz" style="font-size:14px">${g.han}</span></h4>
        <div class="hz">${g.age}세 · 의리 ${g.faith} · 야망 ${g.ambition}</div>
        ${UI.statGrid(g)}
        <div class="skills">${UI.skillTags(g)}</div>
        <p class="hz" style="line-height:1.7">등용 성공률 약 <b class="gold">${pr}%</b>.
          의리가 높은 자는 좀처럼 굽히지 않는다. 처형하면 민심과 명성이 떨어지고, 석방하면 언젠가 다시 만난다.</p>
      </div></div>`, [
      {n:'등 용', c:'jade', f:() => {
        if (Math.random() * 100 < pr) { joinFaction(g, f.id, g.loc, clamp(35 + Math.round(g.faith / 4), 20, 70));
          UI.toast(`${g.name}이 항복하여 휘하에 들었다!`); logMsg(`${g.name}이 항복하여 ${f.name}에 들어왔다.`, 'good', f.id); }
        else { g.captured = null; g.faction = null; g.rank = 0; UI.toast(`${g.name}은 끝까지 굽히지 않았다`); }
        UI.prisonerWin(list.slice(1), done); }},
      {n:'석 방', f:() => { g.captured = null; g.faction = null; g.rank = 0; g.loyal = 0;
        const alt = factionProv(f.id); if (alt.length) g.loc = pick(alt).id;
        logMsg(`${g.name}을 석방했다. 의로운 처사라는 평이 돌았다.`, '', f.id);
        factionProv(f.id).forEach(p => p.mood = clamp(p.mood + 1, 0, 100));
        UI.prisonerWin(list.slice(1), done); }},
      {n:'처 형', c:'red', f:() => { killGen(g, `${f.name}에게 처형`);
        factionProv(f.id).forEach(p => p.mood = clamp(p.mood - 3, 0, 100));
        UI.toast(`${g.name}을 처형했다. 민심이 나빠졌다.`);
        UI.prisonerWin(list.slice(1), done); }}]);
  },

  /* ================= 턴 종료 ================= */
  endTurn() {
    if (S.gameOver) { UI.showGameOver(); return; }
    const g = genByName(S.player.gen || '');
    if (S.player.mode !== 'lord' && g && !g.acted && g.hurt === 0) {
      UI.confirm('아직 이번 달에 행동하지 않았습니다. 그냥 넘기시겠습니까?', () => UI.doEndTurn());
      return;
    }
    UI.doEndTurn();
  },
  doEndTurn() {
    UI.sfx('drum');
    document.getElementById('endturn').classList.add('dis');
    aiPhase();
    UI.processBattles();
  },
  processBattles() {
    const q = S.pendingBattles || [];
    if (q.length) {
      const B = q.shift();
      UI.openBattle(B, () => UI.processBattles());
      return;
    }
    UI.finishTurn();
  },
  finishTurn() {
    settlePhase();
    document.getElementById('endturn').classList.remove('dis');
    const g = genByName(S.player.gen || '');
    if (S.player.mode === 'officer' && g && g.faction) {
      const ms = S.player.mission;
      if (!ms || ms.done || S.turn - ms.turn >= 3) {
        const m = RP.assignMission(g);
        if (m) UI.toast(`주군의 새 명령 — 「${m.n}」 ${m.d}`);
      }
      if (fOf(g.faction) && fOf(g.faction).ruler === g.name) { S.player.mode = 'lord'; UI.toast('당신이 새 군주가 되었다!'); }
    }
    if (S.player.mode !== 'wanderer' && S.player.faction && !fOf(S.player.faction).alive) {
      if (g && g.status === 'ok') { S.player.mode = 'wanderer'; S.player.faction = null; UI.toast('세력이 멸망했다. 재야로 떠돌게 되었다.'); }
    }
    if (g && g.status === 'ok') { UI.selProv = S.player.mode === 'lord' ? UI.selProv : g.loc; }
    UI.renderAll();
    if (S.pending && S.pending.length) { const e = S.pending.shift();
      UI.openEvent(e.title, `<div style="line-height:1.9">${e.text}</div>`); }
    if (S.gameOver) UI.showGameOver();
  },
  showGameOver() {
    const w = S.gameOver;
    UI.openModal(w.win ? '天 下 統 一' : '終 焉', `<div style="text-align:center;line-height:2.1;padding:16px;min-width:420px">
      <div style="font-size:34px;letter-spacing:12px" class="${w.win ? 'gold' : 'seal'}">${w.win ? '天下統一' : '終焉'}</div>
      <p style="margin-top:12px;font-size:15px">${w.reason}</p>
      <p class="hz">${S.year}년 ${S.month}월 · ${S.turn}개월의 여정</p>
      </div>`, [{n:'타이틀로', f:() => location.reload()}], 'evwin');
  },

  /* ================= 저장 / 불러오기 ================= */
  saveGame() {
    try {
      const prov = {};
      PROVINCES.forEach(p => { prov[p.id] = {owner:p.owner, agri:p.agri, comm:p.comm, water:p.water, wall:p.wall,
        order:p.order, mood:p.mood, pop:p.pop, troops:p.troops, train:p.train, weapon:p.weapon, armor:p.armor,
        horses:p.horses, ships:p.ships, gov:p.gov, unrest:p.unrest, spied:p.spied}; });
      const data = {v:2, year:S.year, month:S.month, turn:S.turn, player:S.player, log:S.log.slice(0, 120),
        histDone:S.histDone, factions:S.factions, gens:S.gens, prov};
      localStorage.setItem('dawg_save', JSON.stringify(data));
      localStorage.setItem('dawg_save_info', `${S.year}년 ${S.month}월 · ${S.player.gen} · ${S.player.faction ? fOf(S.player.faction).name : '재야'}`);
      UI.toast('저장했습니다');
    } catch (e) { UI.toast('저장 실패: ' + e.message); }
  },
  loadGame() {
    const raw = localStorage.getItem('dawg_save');
    if (!raw) { UI.toast('저장된 기록이 없습니다'); return; }
    try {
      const d = JSON.parse(raw);
      initWorld();
      S.year = d.year; S.month = d.month; S.turn = d.turn; S.player = d.player;
      S.log = d.log || []; S.histDone = d.histDone || {};
      S.factions = d.factions;
      Object.keys(S.factions).forEach(id => {
        if (!FACTIONS.some(f => f.id === id)) { const f = S.factions[id];
          FACTIONS.push({id, name:f.name, han:f.han, region:f.region, color:f.color, ruler:f.ruler, cap:f.cap, prov:f.prov||[], ai:f.ai, pref:f.pref, desc:f.desc||''}); }
      });
      S.gens = d.gens; S.genIdx = {}; S.gens.forEach(g => S.genIdx[g.name] = g);
      PROVINCES.forEach(p => { const q = d.prov[p.id]; if (q) Object.assign(p, q); });
      syncFactionProv();
      document.getElementById('title').style.display = 'none';
      document.getElementById('setup').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
      const g = genByName(S.player.gen);
      UI.selProv = S.player.mode === 'lord' ? (S.player.faction ? fOf(S.player.faction).cap : g.loc) : g.loc;
      UI.selGen = S.player.mode === 'lord' ? null : S.player.gen;
      UI.buildMap(); UI.resetView(); UI.renderAll();
      UI.toast('기록을 불러왔습니다');
    } catch (e) { UI.toast('불러오기 실패: ' + e.message); }
  },


  /* ================= 효과음 ================= */
  sfxOn: true,
  _ac: null,
  sfx(name) {
    if (!UI.sfxOn) return;
    try {
      if (!UI._ac) UI._ac = new (window.AudioContext || window.webkitAudioContext)();
      const c = UI._ac, t = c.currentTime;
      const beep = (f, dur, type, vol, slide) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
      };
      const noise = (dur, vol) => {
        const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = b; g.gain.value = vol || 0.06; src.connect(g); g.connect(c.destination); src.start(t);
      };
      switch (name) {
        case 'click': beep(620, 0.05, 'square', 0.025); break;
        case 'ok':    beep(760, 0.08, 'triangle', 0.04); beep(1020, 0.09, 'triangle', 0.03); break;
        case 'bad':   beep(240, 0.16, 'sawtooth', 0.045, 130); break;
        case 'drum':  beep(90, 0.22, 'sine', 0.11, 55); noise(0.09, 0.04); break;
        case 'clash': noise(0.13, 0.09); beep(1500, 0.05, 'square', 0.03, 700); break;
        case 'duel':  beep(1800, 0.06, 'square', 0.05, 900); noise(0.08, 0.07); break;
        case 'win':   [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => { try { beep(f, 0.16, 'triangle', 0.05); } catch (e) {} }, i * 95)); break;
        case 'lose':  [400, 330, 262, 196].forEach((f, i) => setTimeout(() => { try { beep(f, 0.2, 'sawtooth', 0.05); } catch (e) {} }, i * 130)); break;
        case 'coin':  beep(1180, 0.05, 'square', 0.035); beep(1560, 0.07, 'square', 0.03); break;
        case 'fire':  noise(0.3, 0.07); beep(300, 0.25, 'sawtooth', 0.04, 120); break;
      }
    } catch (e) { UI.sfxOn = false; }
  },
  toggleSfx() { UI.sfxOn = !UI.sfxOn; UI.toast('효과음 ' + (UI.sfxOn ? '켜짐' : '꺼짐')); UI.renderTop(); },

  /* ================= 치트 (F4) ================= */
  cheatWin() {
    const f = S.player.faction ? fOf(S.player.faction) : null;
    const g = genByName(S.player.gen || '');
    const tg = (k, n, d) => `<div class="btn ${S.cheat[k] ? 'sel' : ''}" onclick="UI.cheatT('${k}')" title="${d}">
      ${S.cheat[k] ? '■' : '□'} ${n}</div>`;
    const b = (fn, n, d, cls) => `<div class="btn ${cls || ''}" onclick="UI.cheat('${fn}')" title="${d || ''}">${n}</div>`;
    UI.openModal('天 機 — 치트 모드 (F4)', `<div style="min-width:640px;max-width:860px">
      <div class="hz" style="margin-bottom:6px">천기를 엿본다. ※ 치트를 쓰면 상단에 <span class="seal">天機</span> 표시가 붙습니다.</div>
      <div class="grp" style="color:var(--gold);border-bottom:1px solid #4d3826;padding:3px 0;letter-spacing:3px">상 시 효 과 (토글)</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:6px 0">
        ${tg('god', '전투 무적', '내가 참전한 전투에서 아군은 피해를 받지 않고 적은 3배 피해')}
        ${tg('freeAct', '무한 행동', '장수가 매달 몇 번이든 행동할 수 있다')}
        ${tg('gold', '무한 국고', '매달 금·식량이 999,999로 채워진다')}
        ${tg('eye', '천리안', '모든 도시의 내부 사정이 보인다')}
        ${tg('peace', '천하무적 외교', '아무도 나에게 선전포고하지 않는다')}
        ${tg('fastTech', '연구 폭주', '매달 연구점 +2000')}
      </div>
      <div class="grp" style="color:var(--gold);border-bottom:1px solid #4d3826;padding:3px 0;letter-spacing:3px">즉 시 발 동</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:6px 0">
        ${b('gold10', '금 +10만', '국고에 금 100,000')}
        ${b('food10', '식량 +10만', '')}
        ${b('tp', '연구점 +5000', '네 부문 모두')}
        ${b('allTech', '전 기술 습득', '39개 기술을 모두 즉시 습득')}
        ${b('maxCiv', '내 전 도시 내정 MAX', '농업·상업·치수·성벽·치안·민심·인구 만개')}
        ${b('maxMil', '내 전 도시 군비 MAX', '병력·훈련·장비·군마·전선 만개')}
        ${b('loyal', '전 장수 충성 100', '')}
        ${b('statMe', '내 세력 장수 능력 100', '')}
        ${b('statOne', '특정 장수 능력 100', '')}
        ${b('heal', '부상·전사 회복', '내 세력 장수의 부상 치료와 최근 전사자 부활')}
        ${b('recruitAny', '장수 즉시 등용', '재야·타국 누구든 데려온다', 'jade')}
        ${b('takeAdj', '인접 도시 즉시 점령', '내 영토와 접한 도시 하나를 무혈 점령', 'red')}
        ${b('takeAll', '천하 즉시 통일', '54개 주군 전부 점령 — 즉시 승리', 'red')}
        ${b('skip1', '1년 경과', '12턴을 즉시 진행')}
        ${b('switch', '세력 전환', '다른 세력의 군주로 갈아탄다', 'jade')}
        ${b('fame', '명성·공적 +2000', '')}
        ${b('coalOn', '반패권 연합 결성', '최대 세력을 표적으로 즉시 결성')}
        ${b('coalOff', '반패권 연합 해산', '')}
        ${b('allHist', '사서 이벤트 전부 발동', '')}
        ${b('spawn', '명장 5명 소환', '내 도시에 능력 90대 신규 장수 5명 등장', 'jade')}
        ${b('reset', '치트 전부 해제', '')}
      </div>
      <div class="hz">현재 — ${f ? `${f.name} 금 ${f.gold.toLocaleString()} · 식량 ${f.food.toLocaleString()} · ${factionProv(f.id).length}성` : '재야'}
        ${g ? ` · ${g.name} 통${g.lead} 무${g.war} 지${g.int} 정${g.pol} 매${g.cha}` : ''}</div>
    </div>`, [{n:'닫기', f:UI.closeModal}]);
  },
  cheatT(k) {
    S.cheat[k] = !S.cheat[k];
    S.cheat.used = 1;
    UI.sfx('coin');
    UI.cheatWin(); UI.renderAll();
  },
  cheat(fn) {
    const f = S.player.faction ? fOf(S.player.faction) : null;
    const g = genByName(S.player.gen || '');
    S.cheat.used = 1;
    UI.sfx('coin');
    const ps = f ? factionProv(f.id) : [];
    switch (fn) {
      case 'gold10': if (f) f.gold += 100000; break;
      case 'food10': if (f) f.food += 100000; break;
      case 'tp': if (f) ['civ','mil','dip','cul'].forEach(k => f.tp[k] += 5000); break;
      case 'allTech': if (f) TECHS.forEach(t => { if (f.techs.indexOf(t.id) < 0) { f.techs.push(t.id);
        if (t.e.gunUnlock) f.bonus.gunOK = 1; if (t.e.eleUnlock) f.bonus.eleOK = 1; } }); break;
      case 'maxCiv': ps.forEach(p => { p.agri = capOf(p, 'agri'); p.comm = capOf(p, 'comm'); p.water = capOf(p, 'water');
        p.wall = capOf(p, 'wall'); p.pop = capOf(p, 'pop'); p.order = 100 + fx(f.id, 'orderCap');
        p.mood = 100 + fx(f.id, 'moodCap'); p.settle = 0; }); break;
      case 'maxMil': ps.forEach(p => { p.troops = Math.max(p.troops, Math.round(p.pop * 26));
        p.train = 100 + fx(f.id, 'trainCap'); p.weapon = 5; p.armor = 5;
        p.horses = p.troops; p.ships = p.port ? p.troops : p.ships; }); break;
      case 'loyal': S.gens.forEach(x => { if (x.faction === (f && f.id)) x.loyal = 100; }); break;
      case 'statMe': if (f) factionGens(f.id).forEach(x => { ['lead','war','int','pol','cha'].forEach(k => x[k] = 100); }); break;
      case 'statOne': {
        UI.pickGenModal('능력을 100으로 만들 장수', S.gens.filter(x => x.status === 'ok').slice(0, 200), n => {
          const t = genByName(n); ['lead','war','int','pol','cha'].forEach(k => t[k] = 100);
          UI.closeModal(); UI.toast(`${n}의 모든 능력이 100이 되었다`); UI.renderAll(); });
        return; }
      case 'heal': if (f) { factionGens(f.id).forEach(x => x.hurt = 0);
        S.gens.filter(x => x.status === 'dead').slice(0, 9999).forEach(x => {});
        const dead = S.gens.filter(x => x.status === 'dead');
        dead.slice(-8).forEach(x => { x.status = 'ok'; x.hurt = 0; x.age = Math.min(x.age, 45);
          x.faction = f.id; x.loc = f.cap; x.loyal = 90; x.rank = Math.max(1, x.rank); });
        UI.toast(`부상 치료 · 최근 전사자 ${Math.min(8, dead.length)}명 부활`); } break;
      case 'recruitAny': {
        const list = S.gens.filter(x => x.status === 'ok' && x.faction !== (f && f.id))
          .sort((a, b) => (b.lead + b.war + b.int + b.pol + b.cha) - (a.lead + a.war + a.int + a.pol + a.cha)).slice(0, 240);
        UI.pickGenModal('즉시 등용할 인물', list, n => {
          const t = genByName(n);
          if (f) { joinFaction(t, f.id, f.cap, 100); UI.toast(`${n}이 휘하에 들어왔다`); }
          else { S.player.mates = S.player.mates || []; S.player.mates.push(n); t.mate = 1; UI.toast(`${n}이 동료가 되었다`); }
          UI.closeModal(); UI.renderAll(); });
        return; }
      case 'takeAdj': {
        if (!f) break;
        const cand = [];
        ps.forEach(p => ADJ[p.id].forEach(a => { const q = PROV_BY_ID[a.to]; if (q.owner !== f.id && cand.indexOf(q) < 0) cand.push(q); }));
        if (!cand.length) { UI.toast('인접한 다른 도시가 없다'); break; }
        UI.openModal('즉시 점령할 도시', `<div style="display:grid;gap:4px;min-width:340px">${cand.map(q =>
          `<div class="btn" style="text-align:left" onclick="UI.cheatTake('${q.id}')">${q.name} <span class="hz">${q.owner ? fOf(q.owner).name : '무주'} · 병력 ${q.troops}</span></div>`).join('')}</div>`,
          [{n:'취소', f:UI.closeModal}]);
        return; }
      case 'takeAll': {
        if (!f) break;
        PROVINCES.forEach(p => { if (p.owner !== f.id) { p.owner = f.id; p.gov = null; p.settle = 0; } });
        syncFactionProv();
        Object.values(S.factions).forEach(x => { if (x.id !== f.id && x.alive) killFaction(x.id); });
        checkVictory();
        UI.toast('천하를 통일했다');
        break; }
      case 'skip1': { UI.closeModal(); let n = 0;
        const step = () => { if (n++ >= 12 || S.gameOver) { UI.renderAll(); UI.cheatWin(); return; }
          aiPhase(); (S.pendingBattles || []).forEach(B => autoResolve(B)); S.pendingBattles = []; settlePhase(); setTimeout(step, 10); };
        step(); return; }
      case 'switch': {
        const list = Object.values(S.factions).filter(x => x.alive);
        UI.openModal('세력 전환 — 누구의 군주가 되겠는가', `<div style="display:grid;gap:4px;min-width:420px;max-height:60vh">${
          list.map(x => `<div class="btn" style="text-align:left" onclick="UI.cheatSwitch('${x.id}')">
            <i style="width:10px;height:10px;background:${x.color};display:inline-block;margin-right:5px"></i>
            <b>${x.name}</b> <span class="hz">${x.han} · 군주 ${x.ruler} · ${factionProv(x.id).length}성 · 장수 ${factionGens(x.id).length}</span></div>`).join('')}</div>`,
          [{n:'취소', f:UI.closeModal}]);
        return; }
      case 'fame': S.player.fame = (S.player.fame || 0) + 2000; if (g) { g.merit += 2000; checkPromote(g); checkTitle(g); } break;
      case 'coalOn': { S.coalition = null; const save = DF().coalition; coalitionCheck();
        if (!S.coalition) { const list = Object.values(S.factions).filter(x => x.alive)
          .map(x => ({x, n:factionProv(x.id).length})).sort((a, b) => b.n - a.n);
          if (list.length > 3) { S.coalition = {target:list[0].x.id, members:list.slice(1).map(v => v.x.id), since:S.turn};
            logMsg(`【반패권 연합】${list[0].x.name} 타도 맹약이 강제로 결성되었다.`, 'big'); } }
        break; }
      case 'coalOff': S.coalition = null; break;
      case 'allHist': HISTORY_EVENTS.forEach(e => { if (!S.histDone[e.id]) { S.histDone[e.id] = 1;
        try { e.run(S); } catch (err) {} logMsg(`【사서】${e.n} — ${e.text}`, 'big'); } }); break;
      case 'spawn': {
        if (!f) break;
        const reg = f.region, N = NAMEGEN[reg] || NAMEGEN.cn;
        for (let i = 0; i < 5; i++) {
          const si = ri(0, N.sur.length - 1), yi = ri(0, N.syl.length - 1);
          let nm = N.sur[si] + (reg === 'jp' ? ' ' : '') + N.syl[yi];
          while (S.genIdx[nm]) nm += '·' + ri(2, 99);
          const sk = Object.keys(SKILLS).sort(() => Math.random() - 0.5).slice(0, 3);
          const x = mkGen([nm, N.han[si] + N.hs[yi], ri(90, 99), ri(90, 99), ri(88, 99), ri(85, 97), ri(88, 99),
            sk.join(','), 'SSSSS', ri(18, 26), (N.art || ['cn_gen'])[0]]);
          x.faction = f.id; x.loc = f.cap; x.loyal = 100; x.rank = 3; x.merit = 500;
          S.gens.push(x); S.genIdx[nm] = x;
        }
        UI.toast('명장 5명이 찾아왔다'); break; }
      case 'reset': S.cheat = {}; UI.toast('치트를 모두 해제했다'); break;
    }
    UI.cheatWin(); UI.renderAll();
  },
  cheatTake(id) {
    const f = fOf(S.player.faction), p = PROV_BY_ID[id];
    const old = p.owner;
    if (old) provGens(p.id).forEach(x => { if (x.faction === old) { const esc = factionProv(old).filter(q => q.id !== p.id);
      if (esc.length) x.loc = pick(esc).id; else { x.faction = null; x.rank = 0; x.loyal = 0; } } });
    p.owner = f.id; p.gov = null; p.settle = 0; p.order = 60; p.mood = 60;
    syncFactionProv(); UI.closeModal(); UI.toast(`${p.name}을 점령했다`); UI.selProv = id; UI.renderAll();
  },
  cheatSwitch(fid) {
    const f = fOf(fid);
    const r = genByName(f.ruler);
    S.player.mode = 'lord'; S.player.faction = fid; S.player.gen = f.ruler; S.player.mission = null; S.player.mates = [];
    UI.selProv = f.cap; UI.selGen = null;
    UI.closeModal(); UI.toast(`이제 ${f.name}의 군주 ${f.ruler}이다`);
    logMsg(`【천기】${f.name}의 군주 ${f.ruler}로 갈아탔다.`, 'big');
    UI.resetView(); UI.renderAll();
  },

  /* ================= 인터랙티브 일기토 ================= */
  duelWin(D, after) {
    UI.duelState = {D, after};
    UI.sfx('duel');
    UI.renderDuel();
  },
  renderDuel() {
    const {D} = UI.duelState;
    const hp = (v, c) => `<div class="bar ${c}" style="height:14px"><i style="width:${clamp(v, 0, 100)}%"></i></div>`;
    const moves = Object.keys(DUEL_MOVES).map(k =>
      `<div class="btn" onclick="UI.duelMove('${k}')" title="${DUEL_MOVES[k].d}">${DUEL_MOVES[k].n}</div>`).join('');
    UI.openModal('一 騎 討 — 일기토', `<div style="min-width:640px">
      <div style="display:flex;gap:10px;align-items:stretch">
        <div style="width:170px;text-align:center">${portraitSVG(D.a, 160)}
          <div><b>${D.a.name}</b> <span class="hz">무력 ${D.a.war}</span></div>
          ${hp(D.ha, 'g')}<div class="hz">${Math.max(0, D.ha)}</div></div>
        <div style="flex:1;display:flex;flex-direction:column">
          <div class="blog sc" style="flex:1;min-height:210px">${D.log.map(l => `<div>${l}</div>`).join('')}</div>
          <div style="margin-top:6px">${D.over
            ? `<div class="btn jade" onclick="UI.duelDone()">결 과</div>`
            : `<div class="hz" style="text-align:center;margin-bottom:4px">수를 고르시오 (제 ${D.round + 1} 합)</div>
               <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">${moves}</div>
               <div class="btn" style="margin-top:5px" onclick="UI.duelFlee()">물러난다 (사기 -6)</div>`}</div>
        </div>
        <div style="width:170px;text-align:center">${portraitSVG(D.d, 160)}
          <div><b>${D.d.name}</b> <span class="hz">무력 ${D.d.war}</span></div>
          ${hp(D.hd, 'r')}<div class="hz">${Math.max(0, D.hd)}</div></div>
      </div></div>`, []);
  },
  duelMove(k) {
    const {D} = UI.duelState;
    duelStep(D, k);
    UI.sfx(D.over ? (D.winner === 'a' ? 'win' : 'lose') : 'clash');
    UI.renderDuel();
  },
  duelFlee() {
    const {D, after} = UI.duelState;
    D.side.morale = clamp(D.side.morale - 6, 0, 100);
    blog(D.B, `${D.a.name}이 일기토를 중단하고 물러났다 (사기 -6)`, 'bad');
    UI.duelState = null; UI.closeModal();
    if (after) after();
  },
  duelDone() {
    const {D, after} = UI.duelState;
    duelEnd(D);
    UI.duelState = null; UI.closeModal();
    if (after) after();
  },

  /* ================= 설전(舌戰) — 등용 ================= */
  DEBATE: [
    {id:'cause', n:'명분(名分)', d:'대의와 천하를 말한다 — 의리 높은 자에게 통한다', vs:'faith'},
    {id:'gain',  n:'실리(實利)', d:'관직과 부를 약속한다 — 야망 높은 자에게 통한다', vs:'ambition'},
    {id:'bond',  n:'인정(人情)', d:'사람의 정으로 설득한다 — 매력 대결', vs:'cha'},
    {id:'threat',n:'위압(威壓)', d:'힘으로 누른다 — 성공하면 크게, 실패하면 반감', vs:'war'}
  ],
  debateWin(g, t, onDone) {
    UI.deb = {g, t, pt:0, round:0, log:[
      `${t.name}(${t.han})을 마주했다. 의리 ${t.faith} · 야망 ${t.ambition} · 지력 ${t.int}`,
      '세 번의 논변으로 마음을 움직여라.'
    ], onDone};
    UI.renderDebate();
  },
  renderDebate() {
    const D = UI.deb;
    const done = D.round >= 3;
    const base = UI.recruitChance(D.g, D.t);
    const pr = clamp(base + D.pt * 0.12, 0.02, 0.97);
    UI.openModal('舌 戰 — 설전', `<div style="min-width:620px">
      <div style="display:flex;gap:10px">
        <div style="width:150px;text-align:center">${portraitSVG(D.t, 140)}
          <div><b>${D.t.name}</b></div><div class="hz">${RANKS[D.t.rank].n}</div></div>
        <div style="flex:1">
          <div class="blog sc" style="min-height:190px">${D.log.map(l => `<div>${l}</div>`).join('')}</div>
          <div class="row" style="margin-top:6px"><span>설득 우위 <b class="gold">${D.pt > 0 ? '+' : ''}${D.pt}</b></span>
            <span class="sp"></span><span>등용 성공률 <b class="${pr > 0.6 ? 'jade' : 'gold'}">${Math.round(pr * 100)}%</b></span></div>
          ${done ? `<div class="btn jade" style="margin-top:6px" onclick="UI.debateEnd()">등용을 청한다</div>`
            : `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-top:6px">
               ${UI.DEBATE.map(x => `<div class="btn" onclick="UI.debateGo('${x.id}')" title="${x.d}">${x.n}</div>`).join('')}</div>`}
        </div></div></div>`, [{n:'물러난다', f:() => { UI.closeModal(); if (D.onDone) D.onDone(false); }}]);
  },
  recruitChance(g, t) {
    const f = fOf(g.faction), ruler = f ? genByName(f.ruler) : null;
    let pr = 0.20 + (g.cha - 50) / 200 + sfx(g, 'recruit') + (ruler ? (ruler.cha - 60) / 240 + sfx(ruler, 'virtue') * 0.3 : 0);
    pr += (100 - t.ambition) / 500; pr -= (t.fame - 70) / 220;
    if (ruler && ruler.region === t.region) pr += 0.05;
    pr += (f ? factionProv(f.id).length : 0) * 0.012;
    return clamp(pr, 0.03, 0.9);
  },
  debateGo(id) {
    const D = UI.deb, x = UI.DEBATE.find(v => v.id === id), g = D.g, t = D.t;
    D.round++;
    let my = g.int * 0.5 + g.cha * 0.5 + sfx(g, 'persuade') * 60;
    let en = t.int * 0.7 + 25;
    if (x.vs === 'faith') my += (t.faith - 50) * 0.7;
    if (x.vs === 'ambition') my += (t.ambition - 50) * 0.7;
    if (x.vs === 'cha') { my += (g.cha - t.cha) * 0.6; }
    if (x.vs === 'war') { my += (g.war - t.war) * 0.5 + (t.faith > 70 ? -25 : 15); }
    const ok = my * rnd(0.72, 1.3) > en * rnd(0.8, 1.25);
    const lines = {
      cause: ok ? ['「천하가 갈라져 백성이 죽는다. 그대의 칼은 무엇을 위한 것인가.」', `${t.name}의 눈빛이 흔들린다.`]
                : ['「대의를 말하는가.」', `${t.name}은 콧방귀를 뀌었다. 「그 대의로 몇 사람을 죽였는가.」`],
      gain: ok ? ['「태수의 자리와 군을 맡기겠다.」', `${t.name}이 잠시 말을 잃었다.`]
               : ['「관직과 금을 약속하마.」', `${t.name}이 웃었다. 「나를 그런 자로 보았는가.」`],
      bond: ok ? ['「그대 같은 사람을 오래 기다렸다.」', `${t.name}의 표정이 부드러워졌다.`]
               : ['「사람의 정으로 청하는 것이다.」', `${t.name}은 시선을 돌렸다.`],
      threat: ok ? ['「지금 이 성 밖에 내 군이 있다.」', `${t.name}이 이를 물었다. 하지만 물러설 곳이 없다.`]
                 : ['「힘으로 누르겠다는 건가.」', `${t.name}의 얼굴이 굳었다. 「그럼 베어 보아라.」`]
    }[id];
    D.log.push(`<span class="gold">${g.name}</span> — ${lines[0]}`);
    D.log.push(lines[1]);
    D.pt += ok ? (id === 'threat' ? 2 : 1) : (id === 'threat' ? -2 : -1);
    UI.sfx(ok ? 'ok' : 'bad');
    UI.renderDebate();
  },
  debateEnd() {
    const D = UI.deb, g = D.g, t = D.t, f = fOf(g.faction);
    const pr = clamp(UI.recruitChance(g, t) + D.pt * 0.12, 0.02, 0.97);
    UI.closeModal();
    g.acted = true;
    if (f.gold >= ORDERS.recruit.gold) f.gold -= ORDERS.recruit.gold;
    if (Math.random() < pr) {
      joinFaction(t, f.id, g.loc, clamp(50 + Math.round(t.faith / 3) + D.pt * 4, 40, 95));
      bump(g, 'recruit'); g.merit += 40;
      UI.sfx('win');
      logMsg(`${t.name}이 설전에 승복하여 휘하에 들어왔다! (성공률 ${Math.round(pr * 100)}%)`, 'good', f.id);
      UI.toast(`${t.name}이 휘하에 들어왔다!`);
    } else {
      UI.sfx('bad');
      logMsg(`${t.name}은 끝내 응하지 않았다. (성공률 ${Math.round(pr * 100)}%)`, '', f.id);
      UI.toast(`${t.name}은 끝내 응하지 않았다`);
    }
    if (D.onDone) D.onDone(true);
    UI.renderAll();
  },

  /* ================= 용병 ================= */
  mercWin() {
    const g = genByName(UI.selGen || S.player.gen); if (!g) return;
    const f = fOf(g.faction), p = PROV_BY_ID[g.loc];
    const unit = mercCost();
    const maxByGold = Math.floor(f.gold / unit), maxByCmd = rankOf(g).cmd;
    const max = Math.min(maxByGold, maxByCmd);
    UI.merc = {n: Math.min(max, 3000)};
    const draw = () => {
      UI.openModal('傭 兵 — 용병 고용', `<div style="min-width:460px">
        <div class="hz">${p.name}에서 떠도는 군졸을 금으로 사들인다. 훈련도 38의 오합지졸이지만 당장 머릿수가 된다.
          ${S.flags && S.flags.mercCheap ? '<span class="jade">(용병의 시대 — 단가 인하)</span>' : ''}</div>
        <div class="row" style="margin:8px 0"><span>단가 <b class="gold">${unit}금</b>/명</span>
          <span class="sp"></span><span>국고 ${f.gold.toLocaleString()}금 · 지휘한도 ${maxByCmd.toLocaleString()}</span></div>
        <input type="range" min="0" max="${max}" step="100" value="${UI.merc.n}" oninput="UI.merc.n=+this.value;UI.mercUpd()">
        <div class="row"><input type="number" id="mercN" value="${UI.merc.n}" style="width:90px" onchange="UI.merc.n=+this.value;UI.mercUpd()">
          <span>명 → <b class="gold" id="mercG">${(UI.merc.n * unit).toLocaleString()}</b>금</span>
          <span class="sp"></span><span class="hz">고용 후 ${p.name} 병력 <b id="mercT">${(p.troops + UI.merc.n).toLocaleString()}</b></span></div>
      </div>`, [{n:'취소', f:UI.closeModal}, {n:'고 용', c:'red', f:() => {
        UI.closeModal(); UI.run(g, 'merc', UI.merc.n); UI.sfx('coin'); }}]);
    };
    UI._mercDraw = draw; draw();
  },
  mercUpd() {
    const g = genByName(UI.selGen || S.player.gen), p = PROV_BY_ID[g.loc], unit = mercCost();
    const eG = document.getElementById('mercG'), eT = document.getElementById('mercT'), eN = document.getElementById('mercN');
    if (eG) eG.textContent = (UI.merc.n * unit).toLocaleString();
    if (eT) eT.textContent = (p.troops + UI.merc.n).toLocaleString();
    if (eN) eN.value = UI.merc.n;
  },

  /* ================= 천하정세 (연표 · 판도) ================= */
  chronWin() {
    const rows = S.chron.slice(-60);
    const ids = {};
    rows.forEach(r => Object.keys(r.f).forEach(k => ids[k] = (ids[k] || 0) + r.f[k]));
    const keys = Object.keys(ids).sort((a, b) => ids[b] - ids[a]).slice(0, 10);
    const W = 760, H = 240, pad = 34;
    const tot = PROVINCES.length;
    const x = i => pad + (rows.length < 2 ? 0 : i / (rows.length - 1) * (W - pad - 10));
    const y = v => H - 18 - (v / tot) * (H - 34);
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#0d0906;border:1px solid var(--gold3)">`;
    [0, 0.25, 0.5, 0.75, 1].forEach(t => { const v = tot * t;
      svg += `<line x1="${pad}" y1="${y(v)}" x2="${W - 10}" y2="${y(v)}" stroke="#4d3826" stroke-width="1"/>
        <text x="4" y="${y(v) + 4}" fill="#8a7550" font-size="10">${Math.round(v)}</text>`; });
    keys.forEach(k => {
      const f = fOf(k); if (!f) return;
      let d = '';
      rows.forEach((r, i) => { const v = r.f[k] || 0; d += (d ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1) + ' '; });
      svg += `<path d="${d}" fill="none" stroke="${f.color}" stroke-width="${k === S.player.faction ? 3.4 : 1.9}" opacity="0.95"/>`;
    });
    if (rows.length) {
      svg += `<text x="${pad}" y="${H - 4}" fill="#8a7550" font-size="10">${rows[0].y}년</text>`;
      svg += `<text x="${W - 50}" y="${H - 4}" fill="#8a7550" font-size="10">${rows[rows.length - 1].y}년</text>`;
    }
    svg += '</svg>';
    const cur = Object.values(S.factions).filter(f => f.alive)
      .map(f => ({f, n:factionProv(f.id).length})).sort((a, b) => b.n - a.n);
    UI.openModal('天 下 情 勢 — 판도와 연표', `<div style="min-width:800px;max-width:900px">
      ${svg}
      <div class="row" style="flex-wrap:wrap;gap:6px;margin:7px 0">${keys.map(k => { const f = fOf(k); return f ?
        `<span class="row" style="gap:4px"><i style="width:11px;height:11px;background:${f.color};display:inline-block"></i>
         <span class="${k === S.player.faction ? 'gold' : ''}">${f.name} ${factionProv(k).length}</span></span>` : ''; }).join('')}</div>
      ${S.coalition ? `<div class="frame" style="padding:6px;margin-bottom:6px">
        <span class="seal">반패권 연합</span> 표적 <b>${fOf(S.coalition.target).name}</b> —
        참가 ${S.coalition.members.filter(m => fOf(m) && fOf(m).alive).map(m => fOf(m).name).join(' · ')}</div>` : ''}
      <div class="grp" style="color:var(--gold);letter-spacing:3px;border-bottom:1px solid #4d3826;padding:3px 0">年 表</div>
      <div class="sc" style="max-height:230px;font-size:12.5px;line-height:1.75;margin-top:4px">
        ${S.annals.length ? S.annals.slice(0, 70).map(a => `<div><span class="hz">${a.y}년 ${a.mo}월</span>
          <span class="${a.kind === 'fall' ? 'seal' : a.kind === 'war' ? '' : 'jade'}">${a.m}</span></div>`).join('')
          : '<div class="hz">아직 기록된 사건이 없다</div>'}
      </div>
      <div class="hz" style="margin-top:6px">현재 세력 ${cur.length} · 최대 ${cur.length ? cur[0].f.name + ' ' + cur[0].n + '성' : '-'}
        · 통치 부담 ${S.player.faction ? (strain(S.player.faction) * 100).toFixed(0) + '%' : '-'}</div>
    </div>`, [{n:'닫기', f:UI.closeModal}]);
  },

  /* ================= 키 ================= */
  onKey(e) {
    if (e.key === 'F4') { e.preventDefault(); if (document.getElementById('app').style.display !== 'none') UI.cheatWin(); return; }
    if (document.getElementById('battle').classList.contains('on')) return;
    if (e.key === 'Escape') {
      if (UI.pick) { UI.pick = null; document.getElementById('minfo').textContent = ''; return; }
      UI.closeModal(); return;
    }
    if (document.getElementById('modal').classList.contains('on')) return;
    if (document.getElementById('app').style.display === 'none') return;
    const k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); UI.endTurn(); }
    else if (k === 'g') UI.listGens();
    else if (k === 't') UI.techWin();
    else if (k === 'd') UI.diploWin();
    else if (k === 'f') UI.listFactions();
    else if (k === 's') UI.saveGame();
    else if (k === 'l') UI.toggleLegend();
    else if (k === 'c') UI.chronWin();
    else if (k === 'w') UI.financeWin();
    else if (k === 'x') UI.taxWin();
  }
};
