/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// store.js — 자료를 담아 두고 찾아 주는 곳
//
// ⚠ 열쇠는 언제나 '패키지/이름' 이다. 이름만으로는 30개가 겹친다.

import raw from '../data/catalog.js';

export const META = raw.meta;
export const ITEMS = raw.items;
export const CATS = META.cats;
export const SUBS = META.subs;
export const SUB_DESC = META.subDesc;

export const keyOf = (d) => d.pkg + '/' + d.id;

export const CHART_NAMES = {
  line: { ko: '변화', icon: '📈', fn: 'plot', desc: '시간에 따라 어떻게 달라지는가' },
  bar: { ko: '비교', icon: '📊', fn: 'bar', desc: '무리끼리 견주면 어느 쪽이 큰가' },
  hist: { ko: '분포', icon: '📶', fn: 'hist', desc: '값이 어디에 몰려 있는가' },
  scatter: { ko: '관계', icon: '✨', fn: 'scatter', desc: '두 값이 함께 움직이는가' },
};

const CAT_BY_KEY = Object.fromEntries(CATS.map((c) => [c.k, c]));
export const cat = (k) => CAT_BY_KEY[k] || { k, e: '❓', n: k, d: '' };

// ── 초성 찾기 ─────────────────────────────────────────────────────
// 「ㅂㄲ」로 「붓꽃」을 찾을 수 있게 한다.
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function chosung(s) {
  let out = '';
  for (const ch of String(s)) {
    const c = ch.charCodeAt(0) - 0xac00;
    out += (c >= 0 && c <= 11171) ? CHO[Math.floor(c / 588)] : ch;
  }
  return out;
}

const isChosungQuery = (q) => /^[ㄱ-ㅎ]+$/.test(q.replace(/\s/g, ''));

// 찾기에 쓰려고 미리 만들어 두는 글자 뭉치
const HAY = new Map();
for (const d of ITEMS) {
  const cols = d.cols.map((c) => c.n).join(' ');
  const plain = [d.id, d.pkg, d.ko, d.en, cols, cat(d.cat).n, d.sub].join(' ');
  HAY.set(keyOf(d), { low: plain.toLowerCase(), cho: chosung(d.ko + ' ' + d.sub) });
}

/**
 * 찾기.  q 는 이름·제목·컬럼 이름·초성 무엇이든 된다.
 * f 는 좁히기 조건 — {cat, sub, pkg, chart, minR, maxR, needCat, needNum, easy}
 */
export function search(q, f) {
  const opt = f || {};
  const query = String(q || '').trim();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const cho = isChosungQuery(query) ? query.replace(/\s/g, '') : null;

  return ITEMS.filter((d) => {
    if (opt.cat && d.cat !== opt.cat) return false;
    if (opt.sub && d.sub !== opt.sub) return false;
    if (opt.pkg && d.pkg !== opt.pkg) return false;
    if (opt.chart && !d.ch.includes(opt.chart)) return false;
    if (opt.minR && d.r < opt.minR) return false;
    if (opt.maxR && d.r > opt.maxR) return false;
    if (opt.needCat && !d.cols.some((c) => c.k === 'cat' || c.k === 'bool')) return false;
    if (opt.needNum && !d.cols.some((c) => c.k === 'num')) return false;
    if (opt.easy && !isEasy(d)) return false;
    if (!query) return true;
    const hay = HAY.get(keyOf(d));
    if (cho) return hay.cho.replace(/\s/g, '').includes(cho);
    return words.every((w) => hay.low.includes(w));
  });
}

/** 수업에 바로 쓸 만한 크기인가 — 너무 크지도 작지도 않고 빠진 값이 적다. */
export function isEasy(d) {
  if (d.r < 10 || d.r > 5000) return false;
  if (d.c < 2 || d.c > 12) return false;
  if (d.cols.some((c) => c.na > d.r * 0.2)) return false;
  return d.ch.length >= 2;
}

/** data('이름') 으로 부를 수 있는가 — 같은 이름이 겹치면 하나만 이긴다. */
export const callable = (d) => !d.dup || d.win === d.pkg;

/** 파일이 잘못 담겨 다른 패키지의 자료가 나오는가 */
export const badFile = (d) => d.bad && d.bad !== '?';

export const pkgList = () => {
  const c = {};
  for (const d of ITEMS) c[d.pkg] = (c[d.pkg] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

export function countBy(field, filter) {
  const c = {};
  for (const d of ITEMS) {
    if (filter && !filter(d)) continue;
    c[d[field]] = (c[d[field]] || 0) + 1;
  }
  return c;
}

/** 같은 이름을 쓰는 다른 패키지의 것 */
export const siblings = (d) =>
  (d.dup || []).filter((p) => p !== d.pkg).map((p) => ITEMS.find((x) => x.pkg === p && x.id === d.id));
