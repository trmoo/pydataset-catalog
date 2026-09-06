/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// t4-help.js — 안내 · 쓰는 법 · 알아 둘 함정 · 출처
//
// ⚠ 여기에 나오는 숫자는 손으로 적지 않고 catalog.json 에서 그때그때 센다.
//   자료를 다시 만들면 문장도 저절로 맞는다.

import { h, paint, beginScreen, num, copy } from '../lib/ui.js';
import { ITEMS, META, pkgList, callable, badFile, isEasy } from '../lib/store.js';
import { openDetail } from '../lib/card.js';

export function render() {
  beginScreen();

  const shadowed = ITEMS.filter((d) => !callable(d));
  const bad = ITEMS.filter(badFile);
  const unclear = ITEMS.filter((d) => d.bad === '?');
  const empty = ITEMS.filter((d) => d.r === 0);
  const easy = ITEMS.filter(isEasy);
  const names = new Set(ITEMS.map((d) => d.id));

  paint(
    h('div.lead', {},
      h('h2', {}, 'PyDataset 이란'),
      h('p', {}, 'R 이라는 통계 프로그램에는 교과서와 논문에 자주 나오는 연습용 데이터가 많이 들어 있습니다. '
        + 'PyDataset 은 그 가운데 ' + num(ITEMS.length) + '개를 모아, 파이썬에서 한 줄로 불러 쓸 수 있게 만든 패키지입니다. '
        + '인터넷에 이어져 있지 않아도 됩니다 — 설치할 때 자료가 함께 들어옵니다.')),

    h('div.stats', {},
      stat(num(ITEMS.length), '데이터셋'),
      stat(META.nPkg, 'R 패키지'),
      stat(num(names.size), '부를 수 있는 이름'),
      stat(num(easy.length), '수업에 알맞은 것')),

    h('h3', {}, '쓰는 법'),
    h('ol.steps', {},
      step('설치는 한 번만', '터미널이나 코랩에서', 'pip install pydataset'),
      step('목록 보기', 'dataset_id 와 title 두 열짜리 표가 나옵니다',
        "from pydataset import data\n\n목록 = data()\nprint(목록.shape)      # (757, 2)\nprint(목록.head())"),
      step('하나 불러오기', '판다스 데이터프레임으로 옵니다',
        "붓꽃 = data('iris')\nprint(붓꽃.head())\nprint(붓꽃.shape)      # (150, 5)"),
      step('설명 읽기', 'R 문서를 글자로 보여 줍니다 (영어이고, 예제 코드는 R 문법입니다)',
        "data('iris', show_doc=True)")),

    h('h3', {}, '⚠ 미리 알아 두면 좋은 것 네 가지'),
    h('p', {}, '이 앱을 만들면서 PyDataset 을 뜯어보다 찾은 것들입니다. '
      + '수업에서 학생이 부딪히면 당황하기 쉬운 대목이라 적어 둡니다.'),

    trap('① 이름이 겹치는 것이 ' + num(shadowed.length) + '쌍 있고, 쌍마다 한쪽은 부를 수 없습니다',
      'PyDataset 은 「이름 → 파일」을 하나만 이어 둡니다. 그래서 서로 다른 패키지에 같은 이름이 있으면 '
      + '한쪽은 어떻게 해도 부를 수 없습니다. 데이터셋은 ' + num(ITEMS.length) + '개인데 '
      + '실제로 부를 수 있는 이름은 ' + num(names.size) + '개뿐인 까닭입니다. '
      + '아래는 부를 수 없는 쪽입니다 — 눌러 보면 이길 쪽이 어느 것인지 나옵니다.',
      shadowed),

    trap('② 파일이 잘못 담긴 것이 ' + num(bad.length) + '개 있습니다',
      '이름이 겹치는 것들은 파일도 하나만 들어 있습니다. 그래서 문서에 적힌 컬럼과 실제 파일의 컬럼이 '
      + '아예 다른 경우가 생깁니다. 예를 들어 R 의 MASS::housing 은 코펜하겐 주거 만족도 표(72행 5열)인데, '
      + 'PyDataset 의 MASS/housing.csv 를 열어 보면 multgee 패키지의 자료(1448행 4열)가 들어 있습니다. '
      + '문서가 말하는 컬럼 이름이 실제 파일에 몇 개나 나오는지 세어 확인했습니다.'
      + (unclear.length ? ' 이 밖에 어느 쪽인지 가릴 수 없는 것이 ' + num(unclear.length) + '개 더 있습니다.' : ''),
      bad),

    trap('③ 비어 있는 데이터셋이 ' + num(empty.length) + '개 있습니다',
      '불러도 오류는 나지 않는데 행이 0개입니다. 컬럼 이름만 있고 값이 없습니다.',
      empty),

    h('div.trap', {},
      h('h4', {}, "④ data('datasets') 를 부르면 자료가 아니라 목록표가 나옵니다"),
      h('p', {}, 'PyDataset 은 폴더 안의 csv 파일을 모두 데이터셋으로 봅니다. 그런데 목록을 담아 둔 '
        + 'datasets.csv 도 같은 폴더에 있어서, 그것까지 「datasets 라는 이름의 데이터셋」으로 잡혔습니다. '
        + '부르면 ' + num(ITEMS.length) + '행 4열짜리 색인 표가 나옵니다. 버그이지만 고칠 것은 아니고, '
        + '알고 있으면 학생이 헷갈릴 때 설명해 줄 수 있습니다.'),
      h('div.codebox', {},
        h('pre', {}, "data('datasets').shape   # (757, 4)  ← 자료가 아니라 목록"),
        h('button.copy', { onclick: () => copy("data('datasets').shape") }, '복사'))),

    h('h3', {}, 'R 패키지별 개수'),
    h('div.tablewrap', {}, h('table.pkgs', {},
      h('thead', {}, h('tr', {}, h('th', {}, '패키지'), h('th', {}, '개수'), h('th', {}, '어떤 자료인가'))),
      h('tbody', {}, pkgList().map(([p, n]) => h('tr', {},
        h('td', {}, h('code', {}, p)),
        h('td', {}, num(n)),
        h('td', {}, PKG_NOTE[p] || '')))))),

    h('h3', {}, '이 앱에 대하여'),
    h('div.about', {},
      h('p', {}, '데이터셋의 ', h('b', {}, '값(행)은 담지 않았습니다'), '. '
        + '담은 것은 행·열 수와 컬럼 이름·종류처럼 「어떤 자료인가」를 말해 주는 정보뿐입니다. '
        + '값을 보려면 코랩에서 직접 불러 보세요 — 그것이 이 앱이 바라는 쓰임입니다.'),
      h('p', {}, '한국어 제목 ' + num(ITEMS.length) + '개와 주제 분류는 원문을 옮긴 것이 아니라 '
        + '「무엇을 담은 자료인가」를 우리가 새로 쓴 것입니다. '
        + '분류는 수업에서 찾기 쉽게 하려고 나눈 것이지 공식 분류가 아닙니다.'),
      h('p', {}, '데이터셋 자체는 R 의 여러 패키지에 실린 것이고 각각 저작권과 출처가 따로 있습니다. '
        + '자세한 것은 저장소의 LICENSE 를 보세요.'),
      h('p.copy', {}, '© 2026 티쳐무 · 모든 권리 보유')));

  function trap(title, body, list) {
    return h('div.trap', {},
      h('h4', {}, title),
      h('p', {}, body),
      list.length ? h('div.chipslist', {}, list
        .slice()
        .sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()))
        .map((d) => h('button.dchip', {
          onclick: () => openDetail(d),
          title: d.ko,
        }, d.pkg + '/' + d.id))) : null);
  }
}

function stat(v, k) {
  return h('div.statbox', {}, h('div.sv', {}, String(v)), h('div.sk', {}, k));
}

function step(title, desc, code) {
  return h('li', {},
    h('b', {}, title),
    h('span.sd', {}, desc),
    h('div.codebox', {},
      h('pre', {}, code),
      h('button.copy', { onclick: () => copy(code) }, '복사')));
}

const PKG_NOTE = {
  Ecdat: '계량경제학 교재 자료 — 임금·물가·선택',
  MASS: '『Modern Applied Statistics with S』 교재',
  datasets: 'R 을 설치하면 바로 들어 있는 기본 자료',
  boot: '부트스트랩 교재 자료',
  car: '회귀분석 교재 『An R Companion to Applied Regression』',
  HSAUR: '『A Handbook of Statistical Analyses Using R』',
  HistData: '통계학 역사에 남은 유명한 자료',
  robustbase: '이상치에 강한 회귀 교재 자료',
  psych: '심리측정 — 성격·지능 검사',
  Zelig: '여러 통계 모형의 예시 자료',
  vcd: '범주형 자료 시각화',
  KMsurv: '생존분석 교재 (Klein·Moeschberger)',
  COUNT: '계수 자료 회귀 교재',
  survival: '생존분석 패키지의 자료',
  gap: '유전역학',
  pscl: '정치학 계량 분석',
  plm: '패널 자료 분석',
  lme4: '혼합효과 모형',
  cluster: '군집 분석',
  ggplot2: '그래프 패키지에 딸린 예제 자료',
  geepack: '일반화추정방정식',
  evir: '극단값 이론 — 금융·수문',
  rpart: '결정트리',
  quantreg: '분위수 회귀',
  texmex: '극단값 분석 — 환경 자료',
  lattice: '격자 그래프 예제',
  sem: '구조방정식 모형',
  reshape2: '자료 모양 바꾸기 예제',
  multgee: '다항 반응 GEE',
  plyr: '자료 다루기 예제',
  sandwich: '로버스트 표준오차',
};
