/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// t2-find.js — 이름·제목·컬럼 이름으로 찾기 + 조건으로 좁히기

import { h, paint, beginScreen, num } from '../lib/ui.js';
import { CATS, search, pkgList, CHART_NAMES } from '../lib/store.js';
import { datasetCard } from '../lib/card.js';

// 탭을 옮겼다 와도 찾던 것이 남아 있게 한다
const S = { q: '', cat: '', chart: '', size: '', pkg: '', easy: false };

const SIZES = [
  ['', '모든 크기'],
  ['s', '작음 (100행 이하)'],
  ['m', '보통 (100~2000행)'],
  ['l', '큼 (2000행 넘음)'],
];

export function render(arg) {
  beginScreen();
  if (arg) S.q = decodeURIComponent(arg);

  const box = h('input.search', {
    type: 'search', value: S.q, placeholder: '이름 · 제목 · 컬럼 이름 · 초성 (예: iris, 붓꽃, ㅂㄲ, price)',
    'aria-label': '데이터셋 찾기',
  });
  box.addEventListener('input', () => { S.q = box.value; refresh(); });

  const results = h('div.results');

  paint(
    h('div.lead', {},
      h('h2', {}, '데이터셋 찾기'),
      h('p', {}, '이름 일부만 넣어도 됩니다. 한국어 제목과 컬럼 이름까지 함께 뒤집니다. '
        + '「ㅂㄲ」처럼 초성만 넣어도 찾습니다.')),
    h('div.searchrow', {}, box,
      h('button.clear', {
        onclick: () => { S.q = ''; box.value = ''; box.focus(); refresh(); },
      }, '지우기')),
    h('div.filters', {},
      picker('갈래', S.cat, [['', '모든 갈래']].concat(CATS.map((c) => [c.k, c.e + ' ' + c.n])),
        (v) => { S.cat = v; }),
      picker('그래프', S.chart, [['', '아무 그래프']].concat(
        Object.entries(CHART_NAMES).map(([k, v]) => [k, v.icon + ' ' + v.ko])),
      (v) => { S.chart = v; }),
      picker('크기', S.size, SIZES, (v) => { S.size = v; }),
      picker('패키지', S.pkg, [['', '모든 패키지']].concat(pkgList().map(([p, n]) => [p, p + ' (' + n + ')'])),
        (v) => { S.pkg = v; }),
      h('label.check', {},
        h('input', {
          type: 'checkbox', checked: S.easy ? 'checked' : null,
          onchange: (e) => { S.easy = e.target.checked; refresh(); },
        }),
        h('span', {}, '수업에 알맞은 것만')),
      h('button.reset', {
        onclick: () => {
          S.cat = S.chart = S.size = S.pkg = ''; S.easy = false; S.q = ''; box.value = '';
          render();
        },
      }, '조건 모두 지우기')),
    results);

  refresh();

  function refresh() {
    const f = { cat: S.cat || null, chart: S.chart || null, pkg: S.pkg || null, easy: S.easy };
    if (S.size === 's') f.maxR = 100;
    if (S.size === 'm') { f.minR = 100; f.maxR = 2000; }
    if (S.size === 'l') f.minR = 2001;

    const list = search(S.q, f).sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));
    results.textContent = '';
    results.appendChild(h('p.count', {},
      list.length ? num(list.length) + '개를 찾았습니다.' : '조건에 맞는 데이터셋이 없습니다.'));
    if (!list.length) {
      results.appendChild(h('p.dim', {}, '검색어를 줄이거나 조건을 지워 보세요. '
        + (S.q && /^[ㄱ-ㅎ]+$/.test(S.q.replace(/\s/g, ''))
          ? '초성 「' + S.q + '」로는 아무것도 걸리지 않았습니다.' : '')));
      return;
    }
    results.appendChild(h('div.grid', {}, list.slice(0, 300).map((d) => datasetCard(d))));
    if (list.length > 300) {
      results.appendChild(h('p.dim', {}, '앞의 300개만 보여 줍니다. 조건을 좁혀 보세요.'));
    }
  }

  function picker(label, value, opts, set) {
    const sel = h('select', { 'aria-label': label },
      opts.map(([v, t]) => h('option', { value: v, selected: v === value ? 'selected' : null }, t)));
    sel.addEventListener('change', () => { set(sel.value); refresh(); });
    return h('label.pick', {}, h('span', {}, label), sel);
  }
}
