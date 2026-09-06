/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// search.test.mjs — 찾기와 좁히기가 제대로 되는가

import { 묶음, 시험, 같다, 참, 거짓 } from './harness.mjs';
import { ITEMS, search, chosung, keyOf, isEasy, pkgList } from '../src/lib/store.js';

export default function run() {
  const ids = (list) => list.map(keyOf);
  const has = (list, key) => list.some((d) => keyOf(d) === key);

  묶음('찾기');

  시험('빈 말로 찾으면 전부 나온다', () => 같다(search('').length, 757));

  시험('영어 이름으로 찾는다', () => {
    const r = search('iris');
    참(has(r, 'datasets/iris'), 'iris 가 나와야 한다');
  });

  시험('대소문자를 가리지 않는다', () => {
    같다(search('IRIS').length, search('iris').length);
  });

  시험('한국어 제목으로 찾는다', () => {
    참(has(search('붓꽃'), 'datasets/iris'));
  });

  시험('컬럼 이름으로 찾는다', () => {
    const r = search('Sepal.Length');
    참(has(r, 'datasets/iris'), '컬럼 이름으로도 걸려야 한다');
  });

  시험('패키지 이름으로 찾는다', () => {
    참(search('HistData').every((d) => d.pkg === 'HistData' || /HistData/i.test(d.en + d.ko)));
  });

  시험('낱말 여럿을 넣으면 모두 든 것만 나온다', () => {
    const r = search('자동차 연비');
    참(r.length >= 1, '「자동차 연비」로 걸리는 것이 있어야 한다');
    참(r.every((d) => /자동차/.test(d.ko + d.en) && /연비/.test(d.ko + d.en)));
  });

  시험('없는 말을 넣으면 아무것도 안 나온다', () => {
    같다(search('짜장면탕수육').length, 0);
  });

  묶음('초성으로 찾기');

  시험('chosung 이 한글을 초성으로 바꾼다', () => 같다(chosung('붓꽃'), 'ㅂㄲ'));
  시험('한글이 아닌 글자는 그대로 둔다', () => 같다(chosung('iris 붓꽃'), 'iris ㅂㄲ'));
  시험('받침이 있어도 초성만 뽑는다', () => 같다(chosung('강아지'), 'ㄱㅇㅈ'));

  시험('ㅂㄲ 로 붓꽃을 찾는다', () => {
    참(has(search('ㅂㄲ'), 'datasets/iris'));
  });

  시험('초성 찾기는 초성만 넣었을 때만 켜진다', () => {
    // 「ㅂ붓」처럼 섞으면 보통 찾기로 간다
    같다(search('ㅂ붓꽃').length, 0);
  });

  시험('초성으로 여러 개가 걸린다', () => {
    참(search('ㅈㄷㅊ').length >= 1, '「자동차」류가 걸려야 한다');
  });

  묶음('조건으로 좁히기');

  시험('갈래로 좁힌다', () => {
    참(search('', { cat: 'hist' }).every((d) => d.cat === 'hist'));
    같다(search('', { cat: 'hist' }).length, 60);
  });

  시험('소분류로 좁힌다', () => {
    const r = search('', { cat: 'bio', sub: '생존' });
    참(r.length > 0 && r.every((d) => d.cat === 'bio' && d.sub === '생존'));
  });

  시험('패키지로 좁힌다', () => {
    같다(search('', { pkg: 'datasets' }).length, 71);
  });

  시험('그래프로 좁힌다', () => {
    참(search('', { chart: 'line' }).every((d) => d.ch.includes('line')));
  });

  시험('행 수 아래·위로 좁힌다', () => {
    const r = search('', { minR: 100, maxR: 2000 });
    참(r.every((d) => d.r >= 100 && d.r <= 2000));
    거짓(has(r, 'ggplot2/diamonds'), '53940행짜리는 빠져야 한다');
  });

  시험('수업용만 고르면 isEasy 인 것만 나온다', () => {
    참(search('', { easy: true }).every(isEasy));
  });

  시험('조건을 겹쳐 쓸 수 있다', () => {
    const r = search('', { cat: 'econ', chart: 'scatter', easy: true });
    참(r.every((d) => d.cat === 'econ' && d.ch.includes('scatter') && isEasy(d)));
  });

  시험('찾는 말과 조건을 함께 쓸 수 있다', () => {
    const r = search('price', { cat: 'econ' });
    참(r.length > 0 && r.every((d) => d.cat === 'econ'));
  });

  시험('숫자 열·범주 열 있는 것만 고를 수 있다', () => {
    참(search('', { needCat: true }).every((d) => d.cols.some((c) => c.k === 'cat' || c.k === 'bool')));
    참(search('', { needNum: true }).every((d) => d.cols.some((c) => c.k === 'num')));
  });

  묶음('수업용 판정');

  시험('iris 는 수업용이다', () => 참(isEasy(ITEMS.find((d) => keyOf(d) === 'datasets/iris'))));
  시험('mhtdata(159312행)는 수업용이 아니다', () => {
    거짓(isEasy(ITEMS.find((d) => keyOf(d) === 'gap/mhtdata')));
  });
  시험('crohn(212열)은 수업용이 아니다', () => {
    거짓(isEasy(ITEMS.find((d) => keyOf(d) === 'gap/crohn')));
  });
  시험('빈 자료는 수업용이 아니다', () => {
    같다(ids(ITEMS.filter((d) => d.r === 0 && isEasy(d))), []);
  });
  시험('수업용이 100개 넘는다', () => {
    참(ITEMS.filter(isEasy).length > 100);
  });

  묶음('패키지 목록');

  시험('패키지 목록이 31종이고 개수 순으로 늘어선다', () => {
    const l = pkgList();
    같다(l.length, 31);
    같다(l[0][0], 'Ecdat');
    참(l[0][1] >= l[1][1]);
  });

  시험('패키지별 개수를 모두 더하면 757 이다', () => {
    같다(pkgList().reduce((s, [, n]) => s + n, 0), 757);
  });
}
