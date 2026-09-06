/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// t1-topic.js — 주제별로 보기 (대분류 10 → 소분류 → 목록)

import { h, paint, beginScreen, num } from '../lib/ui.js';
import { CATS, SUBS, SUB_DESC, ITEMS, search, cat as getCat } from '../lib/store.js';
import { datasetCard } from '../lib/card.js';
import { go } from '../main.js';

export function render(arg) {
  beginScreen();
  const [catKey, sub] = (arg || '').split('/').map((s) => (s ? decodeURIComponent(s) : ''));
  if (!catKey) return paintOverview();
  return paintCat(catKey, sub);
}

function paintOverview() {
  const counts = {};
  for (const d of ITEMS) counts[d.cat] = (counts[d.cat] || 0) + 1;

  paint(
    h('div.lead', {},
      h('h2', {}, '주제로 찾아보기'),
      h('p', {}, 'PyDataset 이 담고 있는 데이터셋 ' + num(ITEMS.length)
        + '개를 열 갈래로 나누어 두었습니다. 갈래를 누르면 더 자세한 소주제가 나옵니다.')),
    h('div.catgrid', {}, CATS.map((c) => h('button.catcard', { onclick: () => go('topic/' + c.k) },
      h('div.ce', {}, c.e),
      h('div.cn', {}, c.n),
      h('div.cd', {}, c.d),
      h('div.cc', {}, num(counts[c.k] || 0) + '개'),
      h('div.csubs', {}, (SUBS[c.k] || []).map((s) => h('span.subchip', {}, s)))))));
}

function paintCat(catKey, sub) {
  const c = getCat(catKey);
  const subs = SUBS[catKey] || [];
  if (!subs.length) return paintOverview();

  const counts = {};
  for (const d of ITEMS) if (d.cat === catKey) counts[d.sub] = (counts[d.sub] || 0) + 1;
  const list = search('', { cat: catKey, sub: sub || null })
    .sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));

  paint(
    h('div.crumb', {},
      h('button.link', { onclick: () => go('topic') }, '← 모든 갈래'),
      h('span', {}, ' / '),
      h('b', {}, c.e + ' ' + c.n)),
    h('div.lead', {},
      h('h2', {}, c.e + ' ' + c.n),
      h('p', {}, c.d)),
    h('div.pills', {},
      h('button.pill' + (sub ? '' : '.on'), { onclick: () => go('topic/' + catKey) },
        '전체 ' + num(list.length && !sub ? list.length : Object.values(counts).reduce((a, b) => a + b, 0))),
      subs.map((s) => h('button.pill' + (s === sub ? '.on' : ''), {
        onclick: () => go('topic/' + catKey + '/' + encodeURIComponent(s)),
        title: SUB_DESC[s] || '',
      }, s + ' ' + (counts[s] || 0)))),
    sub ? h('p.subdesc', {}, SUB_DESC[sub] || '') : null,
    h('div.grid', {}, list.map((d) => datasetCard(d, { showCat: false }))));
}
