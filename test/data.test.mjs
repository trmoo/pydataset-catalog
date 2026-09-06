/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// data.test.mjs — 자료 그 자체가 성한가

import { 묶음, 시험, 같다, 참, 거짓 } from './harness.mjs';
import { ITEMS, META, CATS, SUBS, SUB_DESC, keyOf, cat } from '../src/lib/store.js';

export default function run() {
  묶음('자료의 뼈대');

  시험('데이터셋이 757개다', () => 같다(ITEMS.length, 757));
  시험('R 패키지가 31종이다', () => 같다(new Set(ITEMS.map((d) => d.pkg)).size, 31));
  시험('대분류가 10개다', () => 같다(CATS.length, 10));
  시험('소분류가 43개다', () => 같다(Object.values(SUBS).reduce((s, v) => s + v.length, 0), 43));

  시험('열쇠(패키지/이름)가 겹치지 않는다', () => {
    같다(new Set(ITEMS.map(keyOf)).size, ITEMS.length);
  });

  시험('모든 항목에 한국어 제목이 있다', () => {
    const bad = ITEMS.filter((d) => !d.ko || d.ko.length < 2);
    같다(bad.map(keyOf), []);
  });

  시험('한국어 제목에 영어만 남은 것이 없다', () => {
    const bad = ITEMS.filter((d) => !/[가-힣]/.test(d.ko));
    같다(bad.map(keyOf), []);
  });

  시험('한국어 제목이 너무 길지 않다 (40자 이하)', () => {
    const bad = ITEMS.filter((d) => d.ko.length > 40).map((d) => keyOf(d) + '(' + d.ko.length + ')');
    같다(bad, []);
  });

  시험('모든 항목에 영어 원제가 있다', () => {
    같다(ITEMS.filter((d) => !d.en).map(keyOf), []);
  });

  묶음('주제 분류');

  시험('모든 항목의 대분류가 CATS 안에 있다', () => {
    const keys = new Set(CATS.map((c) => c.k));
    같다(ITEMS.filter((d) => !keys.has(d.cat)).map(keyOf), []);
  });

  시험('모든 항목의 소분류가 그 대분류의 SUBS 안에 있다', () => {
    const bad = ITEMS.filter((d) => !(SUBS[d.cat] || []).includes(d.sub));
    같다(bad.map((d) => keyOf(d) + '→' + d.cat + '/' + d.sub), []);
  });

  시험('모든 소분류에 설명이 붙어 있다', () => {
    const all = [...new Set(Object.values(SUBS).flat())];
    같다(all.filter((s) => !SUB_DESC[s]), []);
  });

  시험('비어 있는 소분류가 없다 — 눌러도 아무것도 안 나오면 안 된다', () => {
    const used = new Set(ITEMS.map((d) => d.cat + '/' + d.sub));
    const empty = [];
    for (const [c, subs] of Object.entries(SUBS)) {
      for (const s of subs) if (!used.has(c + '/' + s)) empty.push(c + '/' + s);
    }
    같다(empty, []);
  });

  시험('한 대분류가 전체의 절반을 넘지 않는다', () => {
    const c = {};
    for (const d of ITEMS) c[d.cat] = (c[d.cat] || 0) + 1;
    const most = Math.max(...Object.values(c));
    참(most < ITEMS.length / 2, '가장 큰 갈래가 ' + most + '개로 너무 크다');
  });

  시험('cat() 이 모든 대분류에 이모지와 이름을 준다', () => {
    for (const c of CATS) {
      참(cat(c.k).e && cat(c.k).n, c.k + ' 에 이모지·이름이 없다');
    }
  });

  묶음('컬럼 정보');

  시험('열 수와 컬럼 목록 길이가 맞는다', () => {
    같다(ITEMS.filter((d) => d.c !== d.cols.length).map(keyOf), []);
  });

  시험('컬럼 종류는 num·cat·text·bool 넷뿐이다', () => {
    const ok = new Set(['num', 'cat', 'text', 'bool']);
    const bad = new Set();
    for (const d of ITEMS) for (const c of d.cols) if (!ok.has(c.k)) bad.add(c.k);
    같다([...bad], []);
  });

  시험('빠진 값이 행 수를 넘지 않는다', () => {
    const bad = ITEMS.filter((d) => d.cols.some((c) => c.na > d.r));
    같다(bad.map(keyOf), []);
  });

  시험('다른 값의 수가 행 수를 넘지 않는다', () => {
    const bad = ITEMS.filter((d) => d.cols.some((c) => c.u > d.r));
    같다(bad.map(keyOf), []);
  });

  시험('행·열 수가 0 이상이다', () => {
    거짓(ITEMS.some((d) => d.r < 0 || d.c < 0), '음수가 있다');
  });

  묶음('아는 값 대조 — 이 숫자가 바뀌면 자료가 달라진 것이다');

  const get = (k) => ITEMS.find((d) => keyOf(d) === k);

  시험('datasets/iris 는 150행 5열', () => 같다([get('datasets/iris').r, get('datasets/iris').c], [150, 5]));
  시험('datasets/mtcars 는 32행 11열', () => 같다([get('datasets/mtcars').r, get('datasets/mtcars').c], [32, 11]));
  시험('ggplot2/diamonds 는 53940행 10열', () => 같다([get('ggplot2/diamonds').r, get('ggplot2/diamonds').c], [53940, 10]));
  시험('datasets/AirPassengers 는 144행 2열', () => 같다([get('datasets/AirPassengers').r, get('datasets/AirPassengers').c], [144, 2]));
  시험('MASS/Boston 은 506행 14열', () => 같다([get('MASS/Boston').r, get('MASS/Boston').c], [506, 14]));
  시험('gap/mhtdata 가 가장 크다 (159312행)', () => {
    같다(Math.max(...ITEMS.map((d) => d.r)), 159312);
    같다(ITEMS.find((d) => d.r === 159312).id, 'mhtdata');
  });
  시험('gap/crohn 이 열이 가장 많다 (212열)', () => {
    같다(Math.max(...ITEMS.map((d) => d.c)), 212);
    같다(ITEMS.find((d) => d.c === 212).id, 'crohn');
  });
  시험('iris 의 Species 는 범주 열이고 값이 3가지', () => {
    const s = get('datasets/iris').cols.find((c) => c.n === 'Species');
    같다([s.k, s.u], ['cat', 3]);
  });
  시험('mtcars 는 행 이름이 있다 (자동차 이름)', () => 참(get('datasets/mtcars').ix));
  시험('iris 는 행 이름이 없다 (1,2,3…)', () => 거짓(get('datasets/iris').ix));

  묶음('요약 숫자');

  시험('meta 의 패키지 수가 실제와 맞는다', () => {
    같다(META.nPkg, new Set(ITEMS.map((d) => d.pkg)).size);
  });
  시험('meta 의 부를 수 있는 이름 수가 실제와 맞는다', () => {
    같다(META.nCallable, new Set(ITEMS.map((d) => d.id)).size);
  });
}
