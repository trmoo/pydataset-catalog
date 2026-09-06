/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// card.js — 데이터셋 하나를 목록 카드와 자세히 보기로 그린다
//
// ⚠ 코드를 만드는 부분은 lib/code.js 에 있다 (시험이 그 파일을 node 로 그대로 부른다).

import { h, modal, copy, num } from './ui.js';
import { cat, callable, badFile, isEasy, siblings, CHART_NAMES } from './store.js';
import { sampleCode, loadCode, pyq } from './code.js';

const KIND = {
  num: { ko: '숫자', cls: 'k-num' },
  cat: { ko: '범주', cls: 'k-cat' },
  text: { ko: '글자', cls: 'k-text' },
  bool: { ko: '참거짓', cls: 'k-bool' },
};

/** 목록에 늘어놓는 카드 하나 */
export function datasetCard(d, opt) {
  const o = opt || {};
  const c = cat(d.cat);
  const warn = !callable(d) || badFile(d) || d.r === 0;
  return h('button.ds' + (warn ? '.warn' : ''), {
    onclick: () => openDetail(d),
    title: d.en,
  },
  h('div.ds-top', {},
    h('code.ds-id', {}, d.id),
    h('span.ds-size', {}, num(d.r) + '행 × ' + d.c + '열'),
    warn ? h('span.ds-warn', { title: '주의할 점이 있습니다' }, '⚠') : null),
  h('div.ds-ko', {}, d.ko),
  h('div.ds-bot', {},
    o.showCat === false ? null : h('span.tag', {}, c.e + ' ' + c.n + ' · ' + d.sub),
    h('span.pkg', {}, d.pkg),
    isEasy(d) ? h('span.easy', { title: '크기와 컬럼이 수업에 알맞습니다' }, '수업용') : null,
    h('span.chips', {}, d.ch.map((k) =>
      h('span.chip', { title: CHART_NAMES[k].ko }, CHART_NAMES[k].icon)))));
}

/** 데이터셋 하나를 자세히 — 대화상자로 연다 */
export function openDetail(d) {
  const c = cat(d.cat);
  const sib = siblings(d).filter(Boolean);

  const notes = [];
  if (d.r === 0) {
    notes.push(note('bad', '이 자료는 비어 있습니다',
      '행이 0개입니다. 불러도 컬럼 이름만 있고 값이 없습니다.'));
  }
  if (!callable(d)) {
    notes.push(note('bad', 'data(' + pyq(d.id) + ') 로는 이것을 부를 수 없습니다',
      '같은 이름이 ' + (d.dup || []).join(' · ') + ' 에 있어 ' + d.win
      + ' 쪽이 이깁니다. PyDataset 은 이름 하나에 파일 하나만 이어 두기 때문입니다.'));
  }
  if (badFile(d)) {
    notes.push(note('bad', 'PyDataset 안에 파일이 잘못 담겨 있습니다',
      '불러 보면 ' + d.bad + ' 패키지의 자료가 나옵니다. 문서가 말하는 컬럼과 실제 파일의 컬럼이 맞지 않아 '
      + '알아냈습니다 (일치도 ' + Math.round(d.dm * 100) + '%). R 에서 쓰던 것과는 다른 자료입니다.'));
  } else if (d.bad === '?') {
    notes.push(note('warn', '어느 패키지의 자료인지 가릴 수 없습니다',
      '같은 이름이 ' + (d.dup || []).join(' · ') + ' 에 있는데, 두 문서 모두 실제 컬럼과 잘 맞지 않습니다.'));
  }

  modal(d.ko,
    h('div.dt-head', {},
      h('code.dt-id', {}, d.id),
      h('span.tag', {}, c.e + ' ' + c.n + ' · ' + d.sub),
      h('span.pkg', {}, 'R ' + d.pkg + ' 패키지'),
      isEasy(d) ? h('span.easy', {}, '수업용으로 알맞음') : null),
    h('p.dt-en', {}, d.en),

    notes.length ? h('div.notes', {}, notes) : null,

    h('div.dt-facts', {},
      fact('행', num(d.r)),
      fact('열', d.c),
      fact('숫자 열', d.cols.filter((x) => x.k === 'num').length),
      fact('범주 열', d.cols.filter((x) => x.k === 'cat' || x.k === 'bool').length),
      fact('빠진 값', num(d.cols.reduce((s, x) => s + x.na, 0))),
      fact('행 이름', d.ix ? '있음' : '없음')),

    h('h4', {}, '불러오기'),
    codeBox(loadCode(d)),

    d.cols.length ? h('div', {},
      h('h4', {}, '컬럼 ' + d.c + '개'),
      h('div.tablewrap', {}, h('table.cols', {},
        h('thead', {}, h('tr', {},
          h('th', {}, '이름'), h('th', {}, '종류'), h('th', {}, '다른 값'), h('th', {}, '빠진 값'))),
        h('tbody', {}, d.cols.map((x) => h('tr', {},
          h('td', {}, h('code', {}, x.n)),
          h('td', {}, h('span.kind.' + KIND[x.k].cls, {}, KIND[x.k].ko)),
          h('td', {}, num(x.u)),
          h('td', { cls: x.na ? 'na' : '' }, x.na ? num(x.na) : '—')))))))
      : null,

    h('h4', {}, d.ch.length ? '그려 볼 만한 그래프' : '그래프'),
    d.ch.length
      ? h('div.charts', {}, d.ch.map((k) => h('div.chartbox', {},
        h('div.chart-h', {}, CHART_NAMES[k].icon + ' ' + CHART_NAMES[k].ko
          + ' — plt.' + CHART_NAMES[k].fn + '( )'),
        codeBox(sampleCode(d, k)))))
      : h('p.dim', {}, '이 자료는 행이 적거나 숫자 열이 모자라 네 가지 기본 그래프에는 잘 맞지 않습니다. '
        + '표 그대로 살펴보거나 상관행렬처럼 다른 방법으로 다루는 것이 좋습니다.'),

    sib.length ? h('div', {},
      h('h4', {}, '이름이 같은 다른 자료'),
      h('div.sibs', {}, sib.map((s) => h('button.sib', { onclick: () => openDetail(s) },
        s.pkg + ' / ' + s.id, h('span', {}, s.ko))))) : null);
}

function fact(k, v) {
  return h('div.fact', {}, h('div.fk', {}, k), h('div.fv', {}, String(v)));
}

function note(kind, title, body) {
  return h('div.note.' + kind, {}, h('b', {}, (kind === 'bad' ? '⚠ ' : 'ℹ ') + title), h('p', {}, body));
}

function codeBox(code) {
  return h('div.codebox', {},
    h('pre', {}, code),
    h('button.copy', { onclick: () => copy(code, '코드') }, '복사'));
}
