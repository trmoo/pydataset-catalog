/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// chart.test.mjs — 그래프 추천과 예제 코드가 앞뒤가 맞는가
//
// ⚠ 「그릴 수 있다」고 해 놓고 코드가 안 나오면 학생이 그대로 붙여 넣었을 때 막힌다.
//   그래서 757개 × 추천된 그래프를 모두 만들어 본다.

import { 묶음, 시험, 같다, 참, 거짓 } from './harness.mjs';
import { ITEMS, keyOf, CHART_NAMES, isEasy } from '../src/lib/store.js';
import { sampleCode, loadCode, pyq, numCols, catCols, timeCol } from '../src/lib/code.js';

export default function run() {
  const get = (k) => ITEMS.find((d) => keyOf(d) === k);
  const KINDS = Object.keys(CHART_NAMES);

  묶음('그래프 추천');

  시험('추천 값은 line·bar·hist·scatter 넷뿐이다', () => {
    const bad = new Set();
    for (const d of ITEMS) for (const k of d.ch) if (!KINDS.includes(k)) bad.add(k);
    같다([...bad], []);
  });

  시험('같은 그래프가 두 번 추천되지 않는다', () => {
    같다(ITEMS.filter((d) => new Set(d.ch).size !== d.ch.length).map(keyOf), []);
  });

  시험('산점도를 추천했으면 숫자 열이 둘 이상이다', () => {
    const bad = ITEMS.filter((d) => d.ch.includes('scatter')
      && numCols(d).filter((c) => c !== timeCol(d)).length < 2);
    같다(bad.map(keyOf), []);
  });

  시험('꺾은선을 추천했으면 시간 열이 있다', () => {
    같다(ITEMS.filter((d) => d.ch.includes('line') && !timeCol(d)).map(keyOf), []);
  });

  시험('꺾은선을 추천했으면 행이 8개 이상이다', () => {
    같다(ITEMS.filter((d) => d.ch.includes('line') && d.r < 8).map(keyOf), []);
  });

  시험('히스토그램을 추천했으면 행이 30개 이상이다', () => {
    같다(ITEMS.filter((d) => d.ch.includes('hist') && d.r < 30).map(keyOf), []);
  });

  시험('행이 0개면 아무 그래프도 추천하지 않는다', () => {
    같다(ITEMS.filter((d) => d.r === 0 && d.ch.length).map(keyOf), []);
  });

  시험('추천 개수가 검증값과 같다 — 판정 규칙이 달라지면 여기서 걸린다', () => {
    const c = {};
    for (const d of ITEMS) for (const k of d.ch) c[k] = (c[k] || 0) + 1;
    같다(c, { hist: 528, scatter: 557, bar: 335, line: 97 });
  });

  시험('수업용 추천 개수가 검증값과 같다', () => {
    const c = {};
    for (const d of ITEMS.filter(isEasy)) for (const k of d.ch) c[k] = (c[k] || 0) + 1;
    같다(c, { hist: 394, scatter: 373, bar: 207, line: 76 });
  });

  시험('네 가지 모두 수업에서 고를 것이 넉넉하다 (수업용 50개 이상)', () => {
    for (const k of KINDS) {
      const n = ITEMS.filter((d) => d.ch.includes(k) && isEasy(d)).length;
      참(n >= 50, k + ' 의 수업용 자료가 ' + n + '개뿐이다');
    }
  });

  시험('아무 그래프도 안 되는 것이 49개다', () => {
    같다(ITEMS.filter((d) => !d.ch.length).length, 49);
  });

  묶음('잘 아는 데이터셋의 추천');

  시험('iris 는 막대·히스토그램·산점도가 된다', () => {
    같다(get('datasets/iris').ch.sort(), ['bar', 'hist', 'scatter']);
  });
  시험('AirPassengers 는 꺾은선이 된다', () => {
    참(get('datasets/AirPassengers').ch.includes('line'));
  });
  시험('AirPassengers 는 산점도가 안 된다 (숫자 열이 시간 말고 하나뿐)', () => {
    거짓(get('datasets/AirPassengers').ch.includes('scatter'));
  });
  시험('mtcars 는 행 이름 덕에 막대가 된다', () => {
    참(get('datasets/mtcars').ix);
    참(get('datasets/mtcars').ch.includes('bar'));
  });
  시험('diamonds 는 네 가지 가운데 셋이 된다', () => {
    const ch = get('ggplot2/diamonds').ch;
    참(ch.includes('bar') && ch.includes('hist') && ch.includes('scatter'));
  });

  묶음('예제 코드 — 757개 전부 만들어 본다');

  시험('추천한 그래프는 반드시 그 함수를 부르는 코드가 나온다', () => {
    const bad = [];
    for (const d of ITEMS) {
      for (const k of d.ch) {
        const code = sampleCode(d, k);
        if (!code.includes('plt.' + CHART_NAMES[k].fn + '(')) bad.push(keyOf(d) + '/' + k);
      }
    }
    같다(bad.slice(0, 10), []);
  });

  시험('추천한 그래프의 코드에는 반드시 plt.show() 가 있다', () => {
    const bad = [];
    for (const d of ITEMS) {
      for (const k of d.ch) if (!sampleCode(d, k).includes('plt.show()')) bad.push(keyOf(d) + '/' + k);
    }
    같다(bad.slice(0, 10), []);
  });

  시험('코드에 undefined·null 이 새어 나오지 않는다', () => {
    const bad = [];
    for (const d of ITEMS) {
      for (const k of KINDS) {
        const c = sampleCode(d, k);
        if (/undefined|\bnull\b|NaN/.test(c)) bad.push(keyOf(d) + '/' + k);
      }
    }
    같다(bad.slice(0, 10), []);
  });

  시험('코드의 따옴표가 짝이 맞는다', () => {
    const bad = [];
    for (const d of ITEMS) {
      for (const k of KINDS) {
        for (const line of sampleCode(d, k).split('\n')) {
          const s = (line.match(/'/g) || []).length;
          const q = (line.match(/"/g) || []).length;
          if (s % 2 || q % 2) bad.push(keyOf(d) + '/' + k + ' → ' + line);
        }
      }
    }
    같다(bad.slice(0, 5), []);
  });

  시험('컬럼 이름이 코드에 그대로 들어간다', () => {
    const d = get('datasets/iris');
    const c = sampleCode(d, 'scatter');
    참(c.includes("df['Sepal.Length']"), c);
    참(c.includes("df['Sepal.Width']"), c);
  });

  시험('추천하지 않은 그래프는 head() 코드로 돌아간다', () => {
    const d = get('datasets/AirPassengers');   // 산점도는 안 된다
    참(sampleCode(d, 'scatter').includes('df.head()'));
  });

  시험('막대그래프는 groupby 또는 value_counts 또는 행 이름을 쓴다', () => {
    const bad = [];
    for (const d of ITEMS.filter((x) => x.ch.includes('bar'))) {
      const c = sampleCode(d, 'bar');
      if (!/groupby|value_counts|df\.index/.test(c)) bad.push(keyOf(d));
    }
    같다(bad.slice(0, 10), []);
  });

  시험('범주 열과 값이 함께 있으면 groupby 로 평균을 낸다', () => {
    const c = sampleCode(get('datasets/iris'), 'bar');
    참(c.includes("groupby('Species')"), c);
  });

  묶음('따옴표 처리');

  시험("pyq 는 보통 작은따옴표로 감싼다", () => 같다(pyq('price'), "'price'"));
  시험("이름에 작은따옴표가 있으면 큰따옴표로 감싼다", () => 같다(pyq("it's"), '"it\'s"'));

  시험('불러오기 코드가 언제나 data() 를 쓴다', () => {
    같다(ITEMS.filter((d) => !loadCode(d).includes('data(')).map(keyOf), []);
  });

  묶음('컬럼 고르기 도구');

  시험('numCols 는 숫자 열만 준다', () => {
    같다(numCols(get('datasets/iris')).length, 4);
  });
  시험('catCols 는 범주 열만 준다', () => {
    같다(catCols(get('datasets/iris')).map((c) => c.n), ['Species']);
  });
  시험('timeCol 은 time 이라는 이름의 숫자 열을 찾는다', () => {
    같다(timeCol(get('datasets/AirPassengers')).n, 'time');
  });
  시험('시간 열이 없으면 undefined 를 준다', () => {
    같다(timeCol(get('datasets/iris')), undefined);
  });
}
