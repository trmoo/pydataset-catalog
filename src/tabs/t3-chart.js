/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// t3-chart.js — 그리고 싶은 그래프로 데이터셋 고르기
//
// 옆 폴더 matplotlib_pandas_practice 의 1차시(변화·비교·분포·관계)와 짝이 되는 화면이다.

import { h, paint, beginScreen, num } from '../lib/ui.js';
import { ITEMS, CHART_NAMES, CATS, search, isEasy } from '../lib/store.js';
import { datasetCard } from '../lib/card.js';
import { go } from '../main.js';

const HINT = {
  line: '가로축을 시간으로 두고 값이 오르내리는 모습을 봅니다. 시간 열과 값 열이 함께 있어야 합니다.',
  bar: '무리(범주)마다 값을 견줍니다. groupby( ) 로 평균을 낸 뒤 그리면 좋습니다.',
  hist: '값 하나가 어디에 몰려 있는지 봅니다. bins 를 바꿔 보면 모습이 달라집니다.',
  scatter: '두 숫자 열을 점으로 찍어 함께 움직이는지 봅니다. 관계가 보인다고 원인은 아닙니다.',
};

export function render(arg) {
  beginScreen();
  const kind = (arg || '').split('/')[0];
  if (!CHART_NAMES[kind]) return paintPick();
  return paintList(kind);
}

function paintPick() {
  const counts = {};
  const easyCounts = {};
  for (const d of ITEMS) {
    for (const k of d.ch) {
      counts[k] = (counts[k] || 0) + 1;
      if (isEasy(d)) easyCounts[k] = (easyCounts[k] || 0) + 1;
    }
  }
  const none = ITEMS.filter((d) => !d.ch.length).length;

  paint(
    h('div.lead', {},
      h('h2', {}, '그리고 싶은 그래프로 고르기'),
      h('p', {}, '「막대그래프를 연습해야 하는데 쓸 자료가 없다」 할 때 씁니다. '
        + '행·열 수와 컬럼 종류를 보고 그릴 수 있는 그래프를 미리 가려 두었습니다.')),
    h('div.chartgrid', {}, Object.entries(CHART_NAMES).map(([k, v]) =>
      h('button.chartcard', { onclick: () => go('chart/' + k) },
        h('div.ce', {}, v.icon),
        h('div.cn', {}, v.ko),
        h('code.cfn', {}, 'plt.' + v.fn + '( )'),
        h('div.cd', {}, v.desc),
        h('div.cc', {}, num(counts[k] || 0) + '개  ·  수업용 ' + num(easyCounts[k] || 0) + '개')))),
    h('div.note.warn', {},
      h('b', {}, 'ℹ 이 판정은 컬럼의 생김새만 보고 한 것입니다'),
      h('p', {}, '행·열 수와 컬럼 종류로 가렸을 뿐, 자료의 뜻까지 본 것은 아닙니다. '
        + '그릴 수 있다고 해서 뜻이 있는 그래프가 되는 것은 아닙니다. '
        + '네 가지 가운데 아무것도 걸리지 않은 자료가 ' + num(none) + '개 있는데, '
        + '대개 행이 아주 적거나 상관행렬처럼 표 자체가 결과인 것들입니다.')));
}

function paintList(kind) {
  const v = CHART_NAMES[kind];
  const all = search('', { chart: kind });
  const easy = all.filter(isEasy);
  const rest = all.filter((d) => !isEasy(d));
  const byCat = {};
  for (const d of easy) (byCat[d.cat] = byCat[d.cat] || []).push(d);

  const sortId = (a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase());

  paint(
    h('div.crumb', {},
      h('button.link', { onclick: () => go('chart') }, '← 그래프 고르기'),
      h('span', {}, ' / '),
      h('b', {}, v.icon + ' ' + v.ko)),
    h('div.lead', {},
      h('h2', {}, v.icon + ' ' + v.ko + ' — plt.' + v.fn + '( )'),
      h('p', {}, HINT[kind])),
    h('p.count', {}, '그릴 수 있는 자료 ' + num(all.length) + '개 가운데, 크기와 컬럼이 수업에 알맞은 것 '
      + num(easy.length) + '개를 갈래별로 먼저 보여 줍니다.'),

    CATS.filter((c) => byCat[c.k]).map((c) => h('section.catsec', {},
      h('h3', {}, c.e + ' ' + c.n,
        h('span.n', {}, num(byCat[c.k].length) + '개')),
      h('div.grid', {}, byCat[c.k].sort(sortId).map((d) => datasetCard(d, { showCat: false }))))),

    rest.length ? h('details.more', {},
      h('summary', {}, '나머지 ' + num(rest.length) + '개도 보기 (아주 크거나 작거나, 빠진 값이 많습니다)'),
      h('div.grid', {}, rest.sort(sortId).slice(0, 300).map((d) => datasetCard(d))),
      rest.length > 300 ? h('p.dim', {}, '앞의 300개만 보여 줍니다.') : null) : null);
}
