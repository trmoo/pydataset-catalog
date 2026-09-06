/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// code.js — 데이터셋에 맞는 맷플롯립 예제 코드를 만든다
//
// ⚠ 여기에는 DOM 을 쓰지 않는다. 시험(node)이 이 파일을 그대로 불러 757개를 전부 검사한다.

/** 파이썬 따옴표 — 이름에 작은따옴표가 있으면 큰따옴표로 감싼다. */
export function pyq(s) {
  return String(s).includes("'") ? '"' + s + '"' : "'" + s + "'";
}

export const numCols = (d) => d.cols.filter((c) => c.k === 'num');
export const catCols = (d) => d.cols.filter((c) => c.k === 'cat' || c.k === 'bool');
// ⚠ 시간 축은 여기서 다시 찾지 않는다. build_data.py 가 정한 자리(d.t)를 그대로 쓴다.
//   양쪽에서 따로 판정하면 「산점도가 된다」고 해 놓고 코드는 못 만드는 일이 생긴다 (실제로 걸렸다).
export const timeCol = (d) => (d.t >= 0 ? d.cols[d.t] : undefined);

const HEAD = (id) =>
  'import matplotlib.pyplot as plt\nfrom pydataset import data\n\ndf = data(' + pyq(id) + ')\n';

/**
 * 이 데이터셋으로 그 그래프를 그리는 코드.
 * 그릴 수 없으면 head( ) 로 들여다보는 코드를 준다.
 */
export function sampleCode(d, chart) {
  const head = HEAD(d.id);
  const ns = numCols(d);
  const cs = catCols(d).filter((c) => c.u >= 2 && c.u <= 12);
  const t = timeCol(d);
  const v = ns.filter((c) => c !== t);

  if (chart === 'line' && t && v.length) {
    return head
      + 'plt.plot(df[' + pyq(t.n) + '], df[' + pyq(v[0].n) + '])\n'
      + 'plt.xlabel(' + pyq(t.n) + ')\n'
      + 'plt.ylabel(' + pyq(v[0].n) + ')\n'
      + "plt.title('시간에 따른 변화')\nplt.show()";
  }
  if (chart === 'bar') {
    if (cs.length && v.length) {
      return head
        + '평균 = df.groupby(' + pyq(cs[0].n) + ')[' + pyq(v[0].n) + '].mean()\n'
        + 'plt.bar(평균.index.astype(str), 평균.values)\n'
        + 'plt.ylabel(' + pyq(v[0].n + ' 평균') + ')\n'
        + 'plt.title(' + pyq(cs[0].n + '별 비교') + ')\nplt.show()';
    }
    if (cs.length) {
      return head
        + '개수 = df[' + pyq(cs[0].n) + '].value_counts()\n'
        + 'plt.bar(개수.index.astype(str), 개수.values)\n'
        + "plt.ylabel('개수')\n"
        + 'plt.title(' + pyq(cs[0].n + '별 개수') + ')\nplt.show()';
    }
    if (d.ix && v.length) {
      return head
        + 'plt.bar(df.index, df[' + pyq(v[0].n) + '])\n'
        + 'plt.xticks(rotation=90)\n'
        + 'plt.ylabel(' + pyq(v[0].n) + ')\n'
        + "plt.tight_layout()\nplt.show()";
    }
  }
  if (chart === 'hist') {
    const c = v[0] || ns[0] || d.cols[0];
    if (c) {
      return head
        + 'plt.hist(df[' + pyq(c.n) + "], bins=15, edgecolor='white')\n"
        + 'plt.xlabel(' + pyq(c.n) + ")\nplt.ylabel('빈도')\n"
        + "plt.title('값이 어디에 몰려 있나')\nplt.show()";
    }
  }
  if (chart === 'scatter' && v.length >= 2) {
    return head
      + 'plt.scatter(df[' + pyq(v[0].n) + '], df[' + pyq(v[1].n) + '], alpha=0.6)\n'
      + 'plt.xlabel(' + pyq(v[0].n) + ')\n'
      + 'plt.ylabel(' + pyq(v[1].n) + ')\n'
      + "plt.title('두 값의 관계')\nplt.show()";
  }
  return head + 'print(df.head())\nprint(df.shape)';
}

/** 그냥 불러오기만 하는 코드 */
export const loadCode = (d) => 'from pydataset import data\ndf = data(' + pyq(d.id) + ')';
