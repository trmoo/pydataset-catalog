/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// traps.test.mjs — 앱이 「안내」 탭에서 말하는 함정들이 실제와 맞는가
//
// ⚠ 이 숫자들은 앱 화면에 그대로 나온다. 틀리면 학생에게 거짓을 가르치게 된다.

import { 묶음, 시험, 같다, 참, 거짓 } from './harness.mjs';
import { ITEMS, keyOf, callable, badFile, siblings } from '../src/lib/store.js';

export default function run() {
  const get = (k) => ITEMS.find((d) => keyOf(d) === k);
  const dups = ITEMS.filter((d) => d.dup);

  묶음('겹치는 이름 — data("이름") 은 하나만 준다');

  시험('이름이 겹치는 항목이 60개다 (이름 30가지 × 2)', () => 같다(dups.length, 60));

  시험('겹치는 이름은 언제나 두 패키지뿐이다', () => {
    같다(dups.filter((d) => d.dup.length !== 2).map(keyOf), []);
  });

  시험('부를 수 없는 것이 30개다', () => {
    같다(ITEMS.filter((d) => !callable(d)).length, 30);
  });

  시험('부를 수 있는 이름은 727개다 (757 − 30)', () => {
    같다(new Set(ITEMS.map((d) => d.id)).size, 727);
    같다(757 - 30, 727);
  });

  시험('이름 하나마다 이기는 것이 꼭 하나다', () => {
    const byId = {};
    for (const d of dups) (byId[d.id] = byId[d.id] || []).push(d);
    const bad = Object.entries(byId).filter(([, v]) => v.filter(callable).length !== 1);
    같다(bad.map(([k]) => k), []);
  });

  시험('data("lung") 은 survival 것이고 KMsurv 것은 못 부른다', () => {
    참(callable(get('survival/lung')), 'survival/lung 은 불려야 한다');
    거짓(callable(get('KMsurv/lung')), 'KMsurv/lung 은 못 불러야 한다');
  });

  시험('data("Mroz") 는 Ecdat 것이고 car 것은 못 부른다', () => {
    참(callable(get('Ecdat/Mroz')));
    거짓(callable(get('car/Mroz')));
  });

  시험('겹치지 않는 것은 모두 부를 수 있다', () => {
    같다(ITEMS.filter((d) => !d.dup && !callable(d)).map(keyOf), []);
  });

  시험('siblings() 가 짝을 제대로 찾는다', () => {
    const s = siblings(get('KMsurv/lung'));
    같다(s.length, 1);
    같다(s[0].pkg, 'survival');
  });

  시험('겹치지 않는 것은 형제가 없다', () => {
    같다(siblings(get('datasets/iris')), []);
  });

  묶음('파일이 잘못 담긴 것');

  const bad = ITEMS.filter(badFile);

  시험('파일이 어긋난 것이 13개다', () => 같다(bad.length, 13));

  시험('어긋난 것은 모두 이름이 겹치는 것이다', () => {
    같다(bad.filter((d) => !d.dup).map(keyOf), []);
  });

  시험('MASS/housing 에는 multgee 의 자료가 들어 있다', () => {
    const d = get('MASS/housing');
    참(badFile(d), 'MASS/housing 은 어긋난 것으로 잡혀야 한다');
    같다(d.bad, 'multgee');
    같다([d.r, d.c], [1448, 4]);   // R 의 MASS::housing 은 72행 5열이다
  });

  시험('car/Mroz 에는 Ecdat 의 자료가 들어 있다', () => {
    같다(get('car/Mroz').bad, 'Ecdat');
  });

  시험('robustbase/heart 에는 survival 의 자료가 들어 있다', () => {
    같다(get('robustbase/heart').bad, 'survival');
  });

  시험('어긋난 쪽은 문서 일치도가 0.5 미만이다', () => {
    같다(bad.filter((d) => !(d.dm < 0.5)).map(keyOf), []);
  });

  시험('짝 가운데 한쪽만 어긋난 것으로 잡힌다', () => {
    const byId = {};
    for (const d of bad) (byId[d.id] = byId[d.id] || []).push(d);
    같다(Object.entries(byId).filter(([, v]) => v.length !== 1).map(([k]) => k), []);
  });

  시험('가릴 수 없는 것은 respiratory 둘뿐이다', () => {
    const q = ITEMS.filter((d) => d.bad === '?').map((d) => d.id);
    같다([...new Set(q)], ['respiratory']);
    같다(q.length, 2);
  });

  시험('문서 일치도가 1.0 인 것은 어긋난 것으로 잡히지 않는다', () => {
    같다(ITEMS.filter((d) => d.dm === 1 && d.bad).map(keyOf), []);
  });

  묶음('비어 있는 자료');

  const empty = ITEMS.filter((d) => d.r === 0);

  시험('행이 0개인 것이 2개다', () => 같다(empty.length, 2));

  시험('둘 다 Zelig 의 모의 연결망 자료다', () => {
    같다(empty.map(keyOf).sort(), ['Zelig/friendship', 'Zelig/sna.ex']);
  });

  시험('비어 있으면 그릴 그래프도 없다', () => {
    같다(empty.filter((d) => d.ch.length).map(keyOf), []);
  });

  묶음('경고를 보여 줄 카드');

  시험('경고 표시가 붙는 카드가 36개다', () => {
    // 못 부름 30 + 파일 어긋남 13 + 빈 것 2 = 45 인데, 한 카드에 두 가지가 겹치는 것이
    // 아홉이라 실제로는 36장이다. (예: KMsurv/lung 은 못 부르면서 파일도 어긋난다)
    const warn = ITEMS.filter((d) => !callable(d) || badFile(d) || d.r === 0);
    같다(warn.length, 36);
    같다(30 + 13 + 2 - 9, 36);
  });

  시험('어긋난 13개는 모두 못 부르는 30개 안에 들어 있지는 않다', () => {
    // 파일이 어긋나도 그 이름으로 불릴 수는 있다 (MASS/ships 처럼)
    참(bad.some(callable), '부를 수 있으면서 파일이 어긋난 것이 있어야 한다');
    참(bad.some((d) => !callable(d)), '못 부르면서 파일도 어긋난 것이 있어야 한다');
  });
}
