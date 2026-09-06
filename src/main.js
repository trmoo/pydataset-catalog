/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// main.js — 탭을 그리고 주소(해시)에 맞는 화면을 부른다

import './style.css';
import { h, closeModal, num } from './lib/ui.js';
import { ITEMS } from './lib/store.js';
import * as topic from './tabs/t1-topic.js';
import * as find from './tabs/t2-find.js';
import * as chart from './tabs/t3-chart.js';
import * as help from './tabs/t4-help.js';

const TABS = [
  { k: 'topic', e: '🗂️', n: '주제별 보기', mod: topic },
  { k: 'find', e: '🔎', n: '찾기', mod: find },
  { k: 'chart', e: '📊', n: '그래프로 고르기', mod: chart },
  { k: 'help', e: '📖', n: '안내', mod: help },
];

/** 화면 옮기기 — go('topic/bio') */
export function go(hash) {
  window.location.hash = '#' + hash;
}

function route() {
  closeModal();
  const raw = decodeURI(window.location.hash.replace(/^#/, ''));
  const [key, ...rest] = raw.split('/');
  const tab = TABS.find((t) => t.k === key) || TABS[0];
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('on', b.dataset.k === tab.k);
  });
  tab.mod.render(rest.join('/'));
}

function boot() {
  const app = document.getElementById('app');
  app.appendChild(h('header.top', {},
    h('div.brand', {},
      h('button.logo', { onclick: () => go('topic'), title: '처음으로' }, '🗂️'),
      h('div', {},
        h('h1', {}, 'PyDataset 데이터 도감'),
        h('p', {}, '파이썬에서 바로 불러 쓰는 연습용 데이터 '
          + num(ITEMS.length) + '개를 주제별로 모아 두었습니다'))),
    h('nav.tabs', {}, TABS.map((t) => h('button.tab', {
      'data-k': t.k, onclick: () => go(t.k),
    }, t.e + ' ' + t.n)))));

  app.appendChild(h('main', { id: 'screen' }));

  app.appendChild(h('footer.foot', {},
    h('p', {}, '© 2026 티쳐무 · 모든 권리 보유 — 학교 수업 목적으로만 이용해 주세요.'),
    h('p.dim', {}, '데이터셋은 R 의 여러 패키지에 실린 것이며 저작권과 출처가 각각 따로 있습니다. '
      + '이 앱은 값이 아니라 「어떤 자료인가」만 담고 있습니다.')));

  window.addEventListener('hashchange', route);
  route();
}

boot();
