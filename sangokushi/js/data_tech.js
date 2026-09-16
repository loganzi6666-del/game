/* =========================================================
   東亞 群雄割據 — 특기 / 테크트리 / 병종 / 관직 / 이벤트
   ========================================================= */
'use strict';

/* ---------- 특기(特技) ---------- */
/* k: 효과키, v: 계수. 전투/계략/내정 구분(c) */
const SKILLS = {
  '신장':   {c:'war', d:'전투 시 부대 전력 +14%',            e:{power:0.14}},
  '돌격':   {c:'war', d:'돌격 전술 위력 +25%',                e:{tacCharge:0.25}},
  '귀병':   {c:'war', d:'가하는 병력 피해 +18%',              e:{dmg:0.18}},
  '견수':   {c:'war', d:'수비 시 전력 +18%, 성벽 피해 -20%',  e:{defend:0.18, wallGuard:0.2}},
  '불굴':   {c:'war', d:'사기 저하 -50%, 궤멸 저항',          e:{moraleGuard:0.5}},
  '일기토': {c:'war', d:'일기토 승률 대폭 상승',              e:{duel:0.25}},
  '궁술':   {c:'war', d:'궁병 전력 +20%, 원거리 반격',        e:{bow:0.20}},
  '기마':   {c:'war', d:'기병 전력 +20%, 추격 강화',          e:{cav:0.20}},
  '수전':   {c:'war', d:'수군 전력 +22%, 하천/해안 보정',     e:{navy:0.22}},
  '철포':   {c:'war', d:'철포대 전력 +25% (火器 기술 필요)',  e:{gun:0.25}},
  '상병':   {c:'war', d:'상병 전력 +25%, 적 사기 저하',       e:{ele:0.25}},
  '공성':   {c:'war', d:'성벽 파괴 +45%',                     e:{siege:0.45}},
  '강행':   {c:'war', d:'행군 속도 +50%, 기습 확률 상승',     e:{march:0.5}},
  '위압':   {c:'war', d:'적 사기 -12, 이탈 유발',             e:{awe:12}},
  '조련':   {c:'war', d:'훈련 성과 +60%',                     e:{train:0.6}},
  '저격':   {c:'war', d:'적장 부상 확률 상승',                e:{snipe:0.2}},
  '신산':   {c:'plot',d:'계략 성공률 +20%, 간파 +20%',        e:{plot:0.20}},
  '화계':   {c:'plot',d:'화계 위력 +50%',                     e:{fire:0.5}},
  '수계':   {c:'plot',d:'수공 위력 +50%',                     e:{flood:0.5}},
  '매복':   {c:'plot',d:'매복 성공률·위력 +40%',              e:{ambush:0.4}},
  '허보':   {c:'plot',d:'허보/혼란 성공률 +35%',              e:{confuse:0.35}},
  '이간':   {c:'plot',d:'이간·충성 저하 성공률 +35%',         e:{discord:0.35}},
  '첩보':   {c:'plot',d:'첩보 정확도·성공률 +40%',            e:{spy:0.4}},
  '농정':   {c:'civ', d:'개간 성과 +50%',                     e:{agri:0.5}},
  '상재':   {c:'civ', d:'상업투자 성과 +50%, 수입 +8%',       e:{comm:0.5, income:0.08}},
  '치수':   {c:'civ', d:'치수 성과 +60%, 수해 방지',          e:{water:0.6}},
  '축성':   {c:'civ', d:'축성 성과 +60%',                     e:{wall:0.6}},
  '징병':   {c:'civ', d:'징병 인원 +40%, 민심 피해 감소',     e:{levy:0.4}},
  '감찰':   {c:'civ', d:'치안 회복 +50%, 첩자 발각',          e:{order:0.5}},
  '등용':   {c:'civ', d:'등용 성공률 +35%',                   e:{recruit:0.35}},
  '설득':   {c:'civ', d:'설전·항복권유 +30%',                 e:{persuade:0.3}},
  '교섭':   {c:'civ', d:'외교 성과 +40%',                     e:{diplo:0.4}},
  '인덕':   {c:'civ', d:'민심 +50%, 부하 충성 상승',          e:{virtue:0.5}},
  '의술':   {c:'civ', d:'부상 회복 2배, 역병 피해 감소',      e:{heal:1.0}},
  '점술':   {c:'civ', d:'재해 예지, 계략 간파 +15%',          e:{augur:0.15}},
  '발명':   {c:'civ', d:'기술 연구 속도 +45%',                e:{tech:0.45}},
  '조선':   {c:'civ', d:'조선 성과 +60%, 수군 유지비 -20%',   e:{ship:0.6}}
};

/* ---------- 병종(兵種) ---------- */
const UNITS = {
  foot: {n:'보병', han:'步兵', apt:0, cost:1.0, base:1.00, strong:'bow',  weak:'cav',  d:'창과 방패의 기본 전력. 성 수비에 강하다.'},
  bow:  {n:'궁병', han:'弓兵', apt:1, cost:1.2, base:0.95, strong:'cav',  weak:'foot', d:'원거리 제압. 산악·성벽에서 위력적.'},
  cav:  {n:'기병', han:'騎兵', apt:2, cost:1.8, base:1.15, strong:'foot', weak:'bow',  d:'평야 돌파와 추격의 왕. 산악에서 약하다.'},
  navy: {n:'수군', han:'水軍', apt:3, cost:1.5, base:1.00, strong:'foot', weak:'bow',  d:'하천·해안 전투 필수. 항로 진격 가능.'},
  siege:{n:'공성', han:'攻城', apt:4, cost:2.0, base:0.80, strong:'foot', weak:'cav',  d:'성벽 파괴 전문. 야전은 약하다.'},
  gun:  {n:'철포', han:'鐵砲', apt:1, cost:2.4, base:1.25, strong:'cav',  weak:'navy', d:'화기 기술 필요. 훈련도가 곧 위력.', tech:'mil_gun'},
  ele:  {n:'상병', han:'象兵', apt:2, cost:2.2, base:1.20, strong:'foot', weak:'bow',  d:'남방 코끼리 부대. 적 사기를 꺾는다.', tech:'mil_ele'}
};
const APT_MULT = {S:1.30, A:1.15, B:1.00, C:0.82, D:0.65};

/* ---------- 테크트리 ---------- */
/* tree: civ(내정) mil(군사) dip(외교) cul(문화) */
const TECHS = [
/* 내정 */
{id:'civ_ox',   tree:'civ', n:'우경',     han:'牛耕',     cost:120, req:[],             tier:1, e:{agriCap:0.10, agriGain:0.15}, d:'소로 밭을 갈아 농업 상한 +10%, 개간 효율 +15%'},
{id:'civ_mill', tree:'civ', n:'수차',     han:'水車',     cost:210, req:['civ_ox'],     tier:2, e:{foodYield:0.12, waterCap:0.15}, d:'수차로 관개. 식량 수확 +12%'},
{id:'civ_tun',  tree:'civ', n:'둔전제',   han:'屯田制',   cost:320, req:['civ_ox'],     tier:2, e:{troopFood:-0.20, foodYield:0.08}, d:'군사가 농사도 짓는다. 병사 식량 소모 -20%'},
{id:'civ_coin', tree:'civ', n:'화폐주조', han:'鑄錢',     cost:260, req:[],             tier:1, e:{income:0.15}, d:'주전으로 유통 확대. 금 수입 +15%'},
{id:'civ_mkt',  tree:'civ', n:'시장개혁', han:'市場改革', cost:390, req:['civ_coin'],   tier:2, e:{commCap:0.15, income:0.10}, d:'상업 상한 +15%, 수입 +10%'},
{id:'civ_cen',  tree:'civ', n:'인구조사', han:'戶籍',     cost:340, req:['civ_coin'],   tier:2, e:{levy:0.20, orderGain:0.20}, d:'호적 정비. 징병량 +20%, 치안 회복 +20%'},
{id:'civ_canal',tree:'civ', n:'대운하',   han:'大運河',   cost:1120, req:['civ_mill','civ_mkt'], tier:3, e:{income:0.20, foodYield:0.15, march:0.15}, d:'물길로 이은 대동맥. 수입·수확·행군 모두 상승'},
{id:'civ_gran', tree:'civ', n:'상평창',   han:'常平倉',   cost:940, req:['civ_tun','civ_cen'], tier:3, e:{foodCap:0.30, riotGuard:0.3}, d:'비축과 구휼. 기근 피해 대폭 감소'},
{id:'civ_irr',  tree:'civ', n:'관개대공사',han:'灌漑大役', cost:2430, req:['civ_canal','civ_gran'], tier:4, e:{agriCap:0.20, foodYield:0.20, waterCap:0.25}, d:'전국 수리 사업. 농업의 완성'},
/* 군사 */
{id:'mil_iron', tree:'mil', n:'단련철제', han:'鍛鐵',     cost:150, req:[],             tier:1, e:{weapon:1, power:0.05}, d:'철기 단련. 무기 등급 상한 +1'},
{id:'mil_bow',  tree:'mil', n:'강노',     han:'强弩',     cost:260, req:['mil_iron'],   tier:2, e:{bow:0.18}, d:'쇠뇌 대량 배치. 궁병 전력 +18%'},
{id:'mil_stir', tree:'mil', n:'등자',     han:'鐙子',     cost:280, req:['mil_iron'],   tier:2, e:{cav:0.18}, d:'등자와 편자. 기병 전력 +18%'},
{id:'mil_form', tree:'mil', n:'진법',     han:'陣法',     cost:370, req:['mil_iron'],   tier:2, e:{power:0.10, tacBonus:0.15}, d:'팔진의 운용. 전 부대 전력 +10%, 전술 효과 +15%'},
{id:'mil_heavy',tree:'mil', n:'개마중기', han:'鐵騎',     cost:940, req:['mil_stir','mil_form'], tier:3, e:{cav:0.22, armor:1}, d:'중장기병 편성. 기병 +22%, 방어구 상한 +1'},
{id:'mil_siege',tree:'mil', n:'공성기',   han:'攻城機',   cost:760, req:['mil_form'],   tier:3, e:{siege:0.35}, d:'정란과 충차. 성벽 파괴 +35%'},
{id:'mil_ship', tree:'mil', n:'조선술',   han:'造船術',   cost:440, req:['mil_iron'],   tier:2, e:{navy:0.18, shipCap:0.25}, d:'대형 함선 건조. 수군 +18%'},
{id:'mil_pow',  tree:'mil', n:'화약',     han:'火藥',     cost:1080, req:['mil_siege'],  tier:3, e:{siege:0.25, fire:0.35}, d:'진천뢰와 화통. 공성·화계 위력 급증'},
{id:'mil_gun',  tree:'mil', n:'조총',     han:'鳥銃',     cost:2210, req:['mil_pow'],    tier:4, e:{gunUnlock:1, gun:0.15}, d:'철포대 편성 가능. 훈련도가 곧 화력'},
{id:'mil_iron_ship',tree:'mil',n:'철갑선',han:'鐵甲船',   cost:2380, req:['mil_ship','mil_pow'], tier:4, e:{navy:0.28, shipCap:0.3}, d:'장갑 전함. 해전 절대 우위'},
{id:'mil_army', tree:'mil', n:'상비군제', han:'常備軍',   cost:1370, req:['mil_form'],   tier:3, e:{trainCap:15, upkeep:-0.15}, d:'직업군인화. 훈련 상한 +15, 유지비 -15%'},
{id:'mil_ele',  tree:'mil', n:'상병조련', han:'象兵調練', cost:860, req:['mil_form'],   tier:3, e:{eleUnlock:1, ele:0.15}, d:'코끼리 부대 편성 가능 (남방)'},
/* 외교 */
{id:'dip_post', tree:'dip', n:'역참',     han:'驛站',     cost:140, req:[],             tier:1, e:{diplo:0.15, march:0.10}, d:'파발과 역마. 외교 성과 +15%'},
{id:'dip_spy',  tree:'dip', n:'첩보망',   han:'諜報網',   cost:300, req:['dip_post'],   tier:2, e:{spy:0.30, counterSpy:0.2}, d:'각국 정보 열람. 첩보 +30%'},
{id:'dip_trib', tree:'dip', n:'조공체제', han:'朝貢體制', cost:390, req:['dip_post'],   tier:2, e:{tributeIncome:0.25, relGain:0.2}, d:'조공 무역. 우호국에서 금 유입'},
{id:'dip_trans',tree:'dip', n:'통역관',   han:'通譯',     cost:250, req:['dip_post'],   tier:2, e:{foreignDiplo:0.35}, d:'이문화 교섭 페널티 대폭 완화'},
{id:'dip_wed',  tree:'dip', n:'혼인동맹', han:'婚姻同盟', cost:760, req:['dip_trib'],   tier:3, e:{allyStable:0.4, relGain:0.15}, d:'혼인으로 맺은 동맹은 잘 깨지지 않는다'},
{id:'dip_sow',  tree:'dip', n:'이간지계', han:'離間之計', cost:860, req:['dip_spy'],    tier:3, e:{discord:0.35}, d:'적 장수 충성·세력 결속 붕괴 공작'},
{id:'dip_hege', tree:'dip', n:'패자책봉', han:'霸者册封', cost:2210, req:['dip_wed','dip_sow'], tier:4, e:{demandVassal:1, awe:8}, d:'약소국에 신속(臣屬)을 요구할 수 있다'},
/* 문화·통치 */
{id:'cul_law',  tree:'cul', n:'율령',     han:'律令',     cost:160, req:[],             tier:1, e:{orderCap:15, income:0.08}, d:'법제 정비. 치안 상한 +15'},
{id:'cul_exam', tree:'cul', n:'과거제',   han:'科擧',     cost:340, req:['cul_law'],    tier:2, e:{searchRate:0.3, polGain:0.15}, d:'인재 탐색 성공률 +30%'},
{id:'cul_acad', tree:'cul', n:'태학',     han:'太學',     cost:410, req:['cul_law'],    tier:2, e:{techRate:0.25}, d:'연구 속도 +25%'},
{id:'cul_hist', tree:'cul', n:'사관제도', han:'史官',     cost:320, req:['cul_law'],    tier:2, e:{loyalGain:0.2, fameGain:0.25}, d:'공적 기록. 충성·명성 상승'},
{id:'cul_relig',tree:'cul', n:'종교진흥', han:'宗敎振興', cost:760, req:['cul_hist'],   tier:3, e:{moodCap:12, riotGuard:0.25}, d:'민심 상한 +12, 반란 억제'},
{id:'cul_mil',  tree:'cul', n:'무학당',   han:'武學堂',   cost:940, req:['cul_acad'],   tier:3, e:{growth:0.35, trainCap:8}, d:'장수 성장 속도 +35%'},
{id:'cul_uni',  tree:'cul', n:'천하일통', han:'天下一統', cost:2700,req:['cul_relig','cul_mil','cul_exam'], tier:4, e:{power:0.08, income:0.12, loyalGain:0.25, fameGain:0.3}, d:'대일통의 명분. 모든 방면 상승'},
/* 5단 — 極 (후반 목표 기술. 한 세력이 전부 갖기는 매우 어렵다) */
{id:'civ_land', tree:'civ', n:'양전개혁',   han:'量田改革', cost:2400, req:['civ_irr'], tier:5,
 e:{income:0.30, foodYield:0.20, orderCap:10, ruleEase:0.35}, d:'전국 토지·호구 재조사. 수입 +30%, 수확 +20%, 통치 부담 대폭 완화'},
{id:'mil_rocket', tree:'mil', n:'신기전',   han:'神機箭', cost:2600, req:['mil_gun','mil_siege'], tier:5,
 e:{bow:0.30, siege:0.35, fire:0.4, awe:6}, d:'다발 화전. 궁병 +30%, 공성 +35%, 화계 강화, 적 사기 저하'},
{id:'dip_world', tree:'dip', n:'사대교린',   han:'事大交隣', cost:2200, req:['dip_hege'], tier:5,
 e:{diplo:0.4, relGain:0.5, allyStable:0.4, coalitionGuard:0.5}, d:'천하의 외교 질서를 쥔다. 반패권 연합 결성 저항 +50%'},
{id:'cul_order', tree:'cul', n:'중앙집권',   han:'中央集權', cost:2600, req:['cul_uni'], tier:5,
 e:{ruleEase:0.5, loyalGain:0.4, orderCap:20, power:0.06}, d:'광역 통치의 완성. 통치 부담 절감, 충성·치안 상한 상승'}
];
const TECH_BY_ID = {}; TECHS.forEach(t => TECH_BY_ID[t.id] = t);
const TREES = {civ:{n:'내정',han:'內政',c:'#7ab87a'}, mil:{n:'군사',han:'軍事',c:'#c96b5a'}, dip:{n:'외교',han:'外交',c:'#6b9ec9'}, cul:{n:'문화',han:'文化',c:'#c9a86b'}};

/* 지역 고유 기술 보너스 (연구비 할인) */
const REGION_TECH_AFFINITY = {
  kr: {mil_bow:0.7, mil_iron_ship:0.75, cul_law:0.8, civ_mill:0.8},
  jp: {mil_gun:0.65, mil_pow:0.8, mil_form:0.85, dip_spy:0.8},
  cn: {civ_canal:0.7, cul_exam:0.7, mil_siege:0.8, civ_coin:0.8},
  vn: {mil_ele:0.6, dip_trans:0.75, civ_ox:0.8, mil_ship:0.85},
  tw: {mil_ship:0.6, mil_iron_ship:0.7, dip_trib:0.75, civ_mkt:0.8}
};

/* ---------- 관직 ---------- */
const RANKS = [
  {id:0, n:'무관(無官)',   merit:0,    cmd:6000,  pay:4},
  {id:1, n:'교위(校尉)',   merit:80,   cmd:9000,  pay:7},
  {id:2, n:'장군(將軍)',   merit:220,  cmd:13000, pay:12},
  {id:3, n:'태수(太守)',   merit:450,  cmd:18000, pay:18},
  {id:4, n:'도독(都督)',   merit:800,  cmd:24000, pay:26},
  {id:5, n:'대장군(大將軍)',merit:1400, cmd:32000, pay:38},
  {id:6, n:'승상(丞相)',   merit:2200, cmd:40000, pay:55},
  {id:7, n:'군주(君主)',   merit:9999, cmd:60000, pay:0}
];

/* ---------- 칭호(稱號) ---------- */
const TITLES = [
  {id:'t_duel',  n:'天下無雙', d:'일기토 10승',        e:{duel:0.12, awe:3},   cond:g=>g.st && g.st.duelWin >= 10},
  {id:'t_duel5', n:'一騎當千', d:'일기토 5승',          e:{duel:0.07},          cond:g=>g.st && g.st.duelWin >= 5},
  {id:'t_tiger', n:'虎將',     d:'전투 15승',           e:{power:0.06},         cond:g=>g.st && g.st.battleWin >= 15},
  {id:'t_gen',   n:'名將',     d:'전투 8승',            e:{power:0.04},         cond:g=>g.st && g.st.battleWin >= 8},
  {id:'t_wall',  n:'鐵壁',     d:'수성 5승',            e:{defend:0.10},        cond:g=>g.st && g.st.defWin >= 5},
  {id:'t_sage',  n:'臥龍',     d:'계략 12회 성공',      e:{plot:0.10},          cond:g=>g.st && g.st.plotWin >= 12},
  {id:'t_plot',  n:'智謀',     d:'계략 6회 성공',       e:{plot:0.06},          cond:g=>g.st && g.st.plotWin >= 6},
  {id:'t_civ',   n:'名宰',     d:'내정 60회',           e:{agri:0.15, comm:0.15}, cond:g=>g.st && g.st.civAct >= 60},
  {id:'t_rec',   n:'伯樂',     d:'등용 8명 성공',       e:{recruit:0.15},       cond:g=>g.st && g.st.recruit >= 8},
  {id:'t_uni',   n:'覇者',     d:'20성 이상 세력의 군주', e:{awe:5, power:0.04},
   cond:g=>g.rank === 7 && g.faction && S.factions[g.faction] && PROVINCES.filter(p=>p.owner===g.faction).length >= 20}
];

/* ---------- 난이도 ---------- */
const DIFFS = {
  easy:  {n:'초급(初)', d:'AI 수입·병력 80%, 나의 수입 120%. 느긋하게 천하를 보시오.',
          aiGold:0.8, aiTroop:0.85, aiTech:0.8, myGold:1.2, aiAggr:1.25, coalition:1.4},
  normal:{n:'중급(中)', d:'표준. 균형 잡힌 난세.',
          aiGold:1.0, aiTroop:1.0, aiTech:1.0, myGold:1.0, aiAggr:1.0, coalition:1.0},
  hard:  {n:'상급(上)', d:'AI 수입 125%, 기술 120%. 연합이 빠르게 결성된다.',
          aiGold:1.25, aiTroop:1.1, aiTech:1.2, myGold:1.0, aiAggr:0.88, coalition:0.8},
  chaos: {n:'최상급(亂)', d:'AI 수입 160%, 병력 125%. 천하가 당신을 노린다.',
          aiGold:1.6, aiTroop:1.25, aiTech:1.4, myGold:0.9, aiAggr:0.78, coalition:0.6}
};

/* ---------- 외교 상태 ---------- */
const DIPLO = {war:{n:'교전',c:'#c0392b'}, none:{n:'중립',c:'#7f8c8d'}, truce:{n:'불가침',c:'#2980b9'}, ally:{n:'동맹',c:'#27ae60'}, vassal:{n:'신속',c:'#8e44ad'}};

/* ---------- 전술 ---------- */
const TACTICS = [
  {id:'charge', n:'돌격', han:'突擊', d:'전력 +25%, 받는 피해 +15%. 기병/무력형에 유리', atk:1.25, def:0.85, need:null},
  {id:'hold',   n:'견수', han:'堅守', d:'받는 피해 -30%, 전력 -10%. 성벽 방어 강화',   atk:0.90, def:1.30, need:null},
  {id:'volley', n:'제사', han:'齊射', d:'궁·철포 전력 +30%. 근접 반격 약화',            atk:1.15, def:0.95, need:'ranged'},
  {id:'flank',  n:'우회', han:'迂回', d:'적 후방 타격. 지력 높을수록 성공률 상승',      atk:1.35, def:0.80, need:null},
  {id:'ambush', n:'매복', han:'伏兵', d:'삼림·산악에서 대성공. 실패 시 손해',           atk:1.55, def:0.75, need:null},
  {id:'fire',   n:'화계', han:'火計', d:'적 병력 직접 소각. 지력 판정',                atk:1.00, def:1.00, need:'plot'},
  {id:'flood',  n:'수공', han:'水攻', d:'하천에서 대피해. 지력 판정',                  atk:1.00, def:1.00, need:'plot'},
  {id:'confuse',n:'교란', han:'攪亂', d:'적 사기·전술 무력화. 지력 판정',              atk:1.00, def:1.00, need:'plot'},
  {id:'duel',   n:'일기토',han:'一騎討',d:'적장에게 단기 승부를 청한다',               atk:1.00, def:1.00, need:null},
  {id:'retreat',n:'철퇴', han:'撤退', d:'전투를 중단하고 물러난다',                    atk:0.50, def:1.10, need:null}
];

/* ---------- 랜덤 이벤트 ---------- */
const RANDOM_EVENTS = [
  {id:'harvest', w:9,  n:'풍년(豊年)',   good:1, d:'{prov}에 대풍이 들었다. 식량 +{v}',           f:(g,p)=>({food:Math.round(p.agri*6)})},
  {id:'famine',  w:6,  n:'기근(飢饉)',   good:0, d:'{prov}에 흉년이 들었다. 식량 -{v}, 민심 하락', f:(g,p)=>({food:-Math.round(p.agri*4), mood:-8})},
  {id:'plague',  w:4,  n:'역병(疫病)',   good:0, d:'{prov}에 역병이 돌았다. 인구·병력 감소',       f:(g,p)=>({pop:-Math.round(p.pop*0.06), troops:-Math.round(p.troops*0.08), mood:-6})},
  {id:'flood',   w:5,  n:'수해(水害)',   good:0, d:'{prov}에 홍수가 났다. 농업·성벽 손상',         f:(g,p)=>({agri:-Math.round(p.agri*0.10), wall:-Math.round(p.wall*0.06), mood:-5})},
  {id:'fire',    w:4,  n:'대화재(大火)', good:0, d:'{prov}의 시가가 불탔다. 상업 손상',            f:(g,p)=>({comm:-Math.round(p.comm*0.12), mood:-4})},
  {id:'merchant',w:7,  n:'대상단(大商團)',good:1, d:'{prov}에 서역 상단이 왔다. 금 +{v}',          f:(g,p)=>({gold:Math.round(p.comm*3)})},
  {id:'horses',  w:5,  n:'양마(良馬)',   good:1, d:'{prov}에 군마 상인이 왔다. 군마 확보',         f:(g,p)=>({horses:300})},
  {id:'refugee', w:6,  n:'유민(流民)',   good:1, d:'{prov}로 유민이 흘러들었다. 인구 +{v}',        f:(g,p)=>({pop:Math.round(p.pop*0.05)})},
  {id:'bandit',  w:7,  n:'적도(賊徒)',   good:0, d:'{prov}에 도적이 일어났다. 치안·금 감소',       f:(g,p)=>({order:-14, gold:-Math.round(p.comm*1.5)})},
  {id:'riot',    w:3,  n:'민란(民亂)',   good:0, d:'{prov}에서 민란이 터졌다! 병력·민심 급감',     f:(g,p)=>({troops:-Math.round(p.troops*0.15), mood:-14, order:-20})},
  {id:'comet',   w:2,  n:'혜성(彗星)',   good:0, d:'하늘에 혜성이 나타났다. 천하가 동요한다',      f:()=>({allMood:-4})},
  {id:'goldmine',w:3,  n:'금맥(金脈)',   good:1, d:'{prov}에서 금맥이 발견되었다! 금 대량 확보',   f:(g,p)=>({gold:1200})},
  {id:'sage',    w:4,  n:'현자내방(賢者)',good:1,d:'{prov}에 은거한 현자가 세력에 가르침을 주었다', f:()=>({tech:120})},
  {id:'pirate',  w:5,  n:'해적(海賊)',   good:0, d:'{prov} 연안이 약탈당했다. 금·상업 감소',       f:(g,p)=>({gold:-Math.round(p.comm*2), comm:-Math.round(p.comm*0.05)}), port:1},
  {id:'defect',  w:3,  n:'투항(投降)',   good:1, d:'인근에서 무명의 장수가 귀순을 청했다',         f:()=>({recruitFree:1})}
];

/* ---------- 사서 이벤트(조건 발동) ---------- */
const HISTORY_EVENTS = [
  {id:'h_samgo', n:'삼고초려(三顧草廬)', once:1,
   cond:s=>s.player.faction==='liubei' && genByName('제갈량') && genByName('제갈량').faction===null && s.turn>4,
   text:'유비가 형주의 초려를 세 번 찾아갔다. 와룡이 드디어 몸을 일으킨다.',
   run:s=>{ joinFaction(genByName('제갈량'), 'liubei', 'jingzhou', 95); }},
  {id:'h_dowon', n:'도원결의(桃園結義)', once:1,
   cond:s=>{const a=genByName('관우'),b=genByName('장비'),c=genByName('유비'); return a&&b&&c&&a.faction===c.faction&&b.faction===c.faction;},
   text:'유비·관우·장비가 도원에서 의를 맺었다. 세 사람의 결속은 무엇으로도 끊을 수 없다.',
   run:s=>{ ['관우','장비'].forEach(n=>{const g=genByName(n); if(g){g.loyal=100; g.bond=(g.bond||0)+20;}}); }},
  {id:'h_salsu', n:'살수대첩(薩水大捷)', once:1,
   cond:s=>{const g=genByName('을지문덕'); return g&&g.faction==='goguryeo'&&factionHasTech('goguryeo','mil_form');},
   text:'을지문덕이 살수의 물길을 미리 막아두었다. 이제 대군이 와도 두렵지 않다.',
   run:s=>{ const g=genByName('을지문덕'); if(g) g.skills.push('수계'); }},
  {id:'h_okehazama', n:'오케하자마(桶狹間)', once:1,
   cond:s=>{const g=genByName('오다 노부나가'); return g&&g.faction==='oda'&&s.turn>8;},
   text:'폭우 속 기습. 노부나가는 적은 병력으로 대군을 깨뜨리는 법을 깨우쳤다.',
   run:s=>{ const g=genByName('오다 노부나가'); if(g) g.skills.push('강행'); }},
  {id:'h_baekgang', n:'백강구 해전(白江口)', once:1,
   cond:s=>{const a=PROV_BY_ID['naju'],b=PROV_BY_ID['chikuzen']; return a.owner&&b.owner&&relation(a.owner,b.owner)==='war';},
   text:'서해에서 대선단이 맞부딪쳤다. 백강의 물이 붉게 물든다.',
   run:s=>{ ['naju','chikuzen'].forEach(id=>{const p=PROV_BY_ID[id]; p.ships=Math.round(p.ships*0.7);}); }},
  {id:'h_kwanggae', n:'광개토(廣開土)', once:1,
   cond:s=>{const f=S.factions['goguryeo']; return f&&f.alive&&f.prov.length>=6;},
   text:'북으로 요동, 남으로 한강. 비문에 새길 만한 위업이다.',
   run:s=>{ const g=genByName('광개토대왕'); if(g){g.lead=Math.min(100,g.lead+2); g.cha=Math.min(100,g.cha+3);} }},
  {id:'h_kobukson', n:'거북선(龜船)', once:1,
   cond:s=>{const g=genByName('이순신'); return g&&g.faction&&factionHasTech(g.faction,'mil_iron_ship');},
   text:'이순신이 철갑을 두른 전선을 완성했다. 이 배 앞에서 해전은 학살이 된다.',
   run:s=>{ const g=genByName('이순신'); if(g&&g.faction){ S.factions[g.faction].bonus.navy=(S.factions[g.faction].bonus.navy||0)+0.15; } }},
  {id:'h_teppo', n:'철포 삼단(三段撃)', once:1,
   cond:s=>{const g=genByName('오다 노부나가'); return g&&g.faction&&factionHasTech(g.faction,'mil_gun');},
   text:'노부나가가 철포대를 삼단으로 나누어 끊임없이 쏘는 법을 고안했다.',
   run:s=>{ const g=genByName('오다 노부나가'); if(g&&g.faction){ S.factions[g.faction].bonus.gun=(S.factions[g.faction].bonus.gun||0)+0.2; } }},
  {id:'h_coalition', n:'반패권 연합(反霸權聯合)', once:1,
   cond:s=>{const big=Object.values(S.factions).filter(f=>f.alive).sort((a,b)=>PROVINCES.filter(p=>p.owner===b.id).length-PROVINCES.filter(p=>p.owner===a.id).length)[0];
     return big && PROVINCES.filter(p=>p.owner===big.id).length >= 12;},
   text:'천하의 제후들이 한자리에 모여 맹약을 맺었다. 「가장 큰 자를 함께 친다.」 이제 홀로 커지는 것은 위험한 일이 되었다.',
   run:s=>{ S.flags = S.flags || {}; S.flags.coalitionEra = 1; }},
  {id:'h_yongbi', n:'용병의 시대(傭兵)', once:1,
   cond:s=>s.turn > 60,
   text:'긴 전란으로 떠도는 군졸이 넘쳐난다. 금만 있으면 하룻밤에 군대를 살 수 있는 시대가 왔다.',
   run:s=>{ S.flags = S.flags || {}; S.flags.mercCheap = 1; }},
  {id:'h_oath', n:'의형제의 결의(義兄弟)', once:1,
   cond:s=>{const g=genByName(S.player.gen||''); return g && g.bonds && g.bonds.length >= 2;},
   text:'피를 나누지 않았어도 형제가 되는 일이 있다. 그 맹세는 어떤 성벽보다 단단하다.',
   run:s=>{}},
  {id:'h_bachdang', n:'바익당강의 말뚝(白藤江)', once:1,
   cond:s=>{const g=genByName('쩐흥다오')||genByName('응오꾸옌'); return g&&g.faction&&PROV_BY_ID['daila'].owner===g.faction;},
   text:'강바닥에 쇠말뚝을 박아두고 조수를 기다린다. 북방 함대는 여기서 끝난다.',
   run:s=>{ const g=genByName('쩐흥다오')||genByName('응오꾸옌'); if(g&&g.faction){ S.factions[g.faction].bonus.navy=(S.factions[g.faction].bonus.navy||0)+0.15; } }}
];
