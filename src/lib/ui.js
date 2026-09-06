/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// ui.js — 화면을 그리는 데 쓰는 아주 작은 도구 모음
//
// ⚠ 화면 파일에서 window.addEventListener('resize', …) 나 setInterval 을 직접 쓰지 말 것.
//   탭을 옮겨도 살아남아 오갈 때마다 쌓인다. onResize()·screenInterval() 을 쓴다.
// ⚠ h() 의 자식 자리에 HTML 태그를 넣지 말 것. 글자 그대로 나온다. {html:…} 을 쓴다.
// ⚠ alert·confirm·prompt 를 쓰지 말 것. 크롬이 주소를 함께 보여 준다. modal()·say() 를 쓴다.

let resizeFns = [];
let timers = [];

/** 새 화면을 그리기 직전에 부른다 — 앞 화면이 걸어 둔 것을 걷어 낸다. */
export function beginScreen() {
  resizeFns = [];
  timers.forEach(clearInterval);
  timers = [];
}

export function onResize(fn) {
  resizeFns.push(fn);
}

export function screenInterval(fn, ms) {
  timers.push(setInterval(fn, ms));
}

window.addEventListener('resize', () => resizeFns.forEach((f) => f()));

/**
 * 요소 만들기.  h('div.card', {onclick: f}, '글자', h('b', {}, '굵게'))
 * 태그 이름 뒤에 .클래스 를 이어 붙일 수 있다.
 */
export function h(sel, attrs, ...kids) {
  const [tag, ...cls] = String(sel).split('.');
  const el = document.createElement(tag || 'div');
  if (cls.length) el.className = cls.join(' ');
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k === 'cls') el.className = (el.className + ' ' + v).trim();
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  }
  add(el, kids);
  return el;
}

function add(el, kids) {
  for (const k of kids) {
    if (k === null || k === undefined || k === false) continue;
    if (Array.isArray(k)) add(el, k);
    else if (k instanceof Node) el.appendChild(k);
    else el.appendChild(document.createTextNode(String(k)));
  }
}

export const txt = (s) => document.createTextNode(String(s));

/** 화면 자리를 비우고 새로 채운다. */
export function paint(...kids) {
  const root = document.getElementById('screen');
  root.textContent = '';
  add(root, kids);
  window.scrollTo(0, 0);   // 새 화면은 언제나 맨 위에서 시작한다
}

// ── 대화상자 ──────────────────────────────────────────────────────
// ⚠ 열려 있는 동안 뒤쪽 목록이 함께 스크롤되면 안 된다. 닫았을 때 보던 자리를 잃는다.
//   그래서 body 를 그 자리에 붙들어 두고, 닫을 때 돌려놓는다.
let openModal = null;
let heldScroll = 0;

export function modal(title, ...body) {
  const wasOpen = !!openModal;
  closeModal(true);
  const box = h('div.modal', { tabindex: '-1' },
    h('div.modal-head', {},
      h('h3', {}, title),
      h('button.x', { onclick: () => closeModal(), 'aria-label': '닫기' }, '✕')),
    h('div.modal-body', {}, ...body));
  const back = h('div.backdrop', {
    onclick: (e) => { if (e.target === back) closeModal(); },
  }, box);
  document.body.appendChild(back);
  openModal = back;

  if (!wasOpen) {
    heldScroll = window.scrollY;
    document.body.classList.add('locked');
    document.body.style.top = -heldScroll + 'px';
  }
  box.focus();
  return back;
}

/** keep 이 참이면 다른 대화상자로 갈아 끼우는 중이라 스크롤 잠금을 그대로 둔다. */
export function closeModal(keep) {
  if (openModal) openModal.remove();
  openModal = null;
  if (keep) return;
  if (document.body.classList.contains('locked')) {
    document.body.classList.remove('locked');
    document.body.style.top = '';
    window.scrollTo(0, heldScroll);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/** 잠깐 떴다 사라지는 알림. */
export function say(msg) {
  const t = h('div.toast', {}, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/** 글자를 클립보드에 넣는다. */
export function copy(text, what) {
  const done = () => say((what || '코드') + '를 복사했습니다');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
  } else {
    fallback(text, done);
  }
}

function fallback(text, done) {
  const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }, text);
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { say('복사하지 못했습니다'); }
  ta.remove();
}

/** 1234 → 1,234 */
export const num = (n) => Number(n).toLocaleString('ko-KR');
