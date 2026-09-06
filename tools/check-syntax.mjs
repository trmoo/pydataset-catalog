/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// check-syntax.mjs — 시험(npm test)이 손대지 않는 것을 본다.  npm run check:syntax
//
// ⚠ 시험은 DOM 을 쓰는 파일(tabs/·lib/ui.js·lib/card.js)을 부르지 않는다.
//   그래서 그쪽 문법 오류는 시험을 통과하고 빌드에서야 터진다. 여기서 미리 잡는다.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const 문제 = [];

function 알림(파일, 말) {
  문제.push(relative(ROOT, 파일).replace(/\\/g, '/') + ' — ' + 말);
}

function 훑기(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) 훑기(p, out);
    else if (/\.(js|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const 파일들 = [...훑기(join(ROOT, 'src')), ...훑기(join(ROOT, 'tools')), ...훑기(join(ROOT, 'test'))];
console.log('파일 ' + 파일들.length + '개를 봅니다.');

for (const f of 파일들) {
  const src = readFileSync(f, 'utf8');
  const 이름 = relative(ROOT, f).replace(/\\/g, '/');
  const 자료파일 = 이름.endsWith('src/data/catalog.js');
  const 탭인가 = /src\/tabs\//.test(이름);

  // ① 문법 — node 가 직접 읽어 본다
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (e) {
    알림(f, '문법 오류\n      ' + String(e.stderr || e.message).split('\n').slice(0, 3).join('\n      '));
    continue;
  }

  // ② 저작권 — 모든 소스 첫머리에 /*! 로 시작하는 표시가 있어야 한다
  //    (/*! 로 시작해야 압축할 때 살아남는다)
  if (!src.startsWith('/*!') || !src.slice(0, 200).includes('티쳐무')) {
    알림(f, '첫 줄에 /*! 로 시작하는 저작권 표시가 없습니다');
  }

  if (자료파일) continue;   // 아래 규칙은 사람이 쓰는 파일에만

  // ③ 브라우저 기본 대화상자 금지 — 크롬이 주소를 함께 보여 준다
  const 기본창 = src.match(/(?<![\w.])(alert|confirm|prompt)\s*\(/);
  if (기본창) 알림(f, 기본창[1] + '( ) 대신 ui.js 의 modal( )·say( ) 를 쓰세요');

  // ④ 화면 수명 — 탭 파일이 직접 걸면 탭을 오갈 때마다 쌓인다
  if (탭인가) {
    if (/window\.addEventListener\(\s*['"]resize/.test(src)) {
      알림(f, "window.addEventListener('resize') 대신 ui.js 의 onResize( ) 를 쓰세요");
    }
    if (/(?<![\w.])setInterval\s*\(/.test(src)) {
      알림(f, 'setInterval( ) 대신 ui.js 의 screenInterval( ) 을 쓰세요');
    }
    if (!/beginScreen\s*\(/.test(src)) {
      알림(f, '화면을 그리기 전에 beginScreen( ) 을 불러야 합니다');
    }
  }

  // ⑤ 원문자를 이름으로 쓰면 빌드가 깨진다 (한글은 되지만 ①ⓐ 는 안 된다)
  const 원문자 = src.match(/(?:function|const|let|var)\s+[^\s(]*[①-⑳ⓐ-ⓩ㉠-㉻]/);
  if (원문자) 알림(f, '함수·변수 이름에 원문자를 쓰면 빌드가 깨집니다: ' + 원문자[0]);
}

// ⑥ 눈에 보이는 곳의 저작권 — 화면 푸터와 HTML 주석
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
if (!html.includes('티쳐무')) 알림(join(ROOT, 'index.html'), 'HTML 주석에 저작권 표시가 없습니다');
const main = readFileSync(join(ROOT, 'src', 'main.js'), 'utf8');
if (!/foot[\s\S]*티쳐무/.test(main)) 알림(join(ROOT, 'src', 'main.js'), '화면 푸터에 저작권 표시가 없습니다');
const vite = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');
if (!vite.includes("legalComments: 'inline'")) {
  알림(join(ROOT, 'vite.config.js'), "esbuild.legalComments 를 'inline' 으로 두어야 /*! 배너가 살아남습니다");
}

console.log('');
if (문제.length) {
  문제.forEach((m) => console.log('  ✗ ' + m));
  console.log('\n✗ 문제 ' + 문제.length + '건');
  process.exit(1);
}
console.log('✓ 모두 성합니다 (문법 · 저작권 · 대화상자 · 화면 수명 · 원문자)');
