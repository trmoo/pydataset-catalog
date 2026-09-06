/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// harness.mjs — 아주 작은 시험 도구

let pass = 0;
let fail = 0;
const fails = [];
let group = '';

export function 묶음(name) {
  group = name;
  console.log('\n── ' + name);
}

export function 시험(name, fn) {
  try {
    fn();
    pass += 1;
  } catch (e) {
    fail += 1;
    fails.push(group + ' › ' + name + '\n      ' + e.message);
    console.log('   ✗ ' + name + ' — ' + e.message);
  }
}

export function 같다(got, want, msg) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a !== b) throw new Error((msg ? msg + ': ' : '') + '받은 값 ' + a + ' ≠ 바란 값 ' + b);
}

export function 참(cond, msg) {
  if (!cond) throw new Error(msg || '참이어야 합니다');
}

export function 거짓(cond, msg) {
  if (cond) throw new Error(msg || '거짓이어야 합니다');
}

export function 결과() {
  console.log('\n' + '─'.repeat(46));
  if (fail) {
    console.log('실패한 시험 ' + fail + '가지');
    fails.forEach((f) => console.log('  ✗ ' + f));
  }
  console.log((fail ? '✗' : '✓') + ' 통과 ' + pass + '가지 / 실패 ' + fail + '가지');
  return fail;
}
