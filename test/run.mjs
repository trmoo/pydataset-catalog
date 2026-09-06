/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// run.mjs — 시험을 모아 돌린다.  npm test
//
// ⚠ 시험은 DOM 을 쓰지 않는 파일만 부른다 (store.js · code.js).
//   화면 파일(tabs/·lib/ui.js·lib/card.js)의 문법은 npm run check:syntax 가 본다.

import data from './data.test.mjs';
import traps from './traps.test.mjs';
import chart from './chart.test.mjs';
import search from './search.test.mjs';
import { 결과 } from './harness.mjs';

console.log('PyDataset 데이터 도감 — 시험');

data();
traps();
chart();
search();

process.exit(결과() ? 1 : 0);
