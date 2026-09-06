# -*- coding: utf-8 -*-
"""
build_data.py — PyDataset 이 담고 있는 자료를 읽어 src/data/catalog.js 를 만든다.

(C) 2026 티쳐무 · 모든 권리 보유
학교 수업 목적으로만 이용해 주세요.

  python tools/build_data.py

⚠ 먼저 `pip install pydataset` 을 한 번 해야 한다. 파이썬에서 한 번 부르면
  PyDataset 이 자료를 홈 폴더(~/.pydataset)에 풀어 놓는다. 이 도구는 그것을 읽는다.
⚠ 데이터의 값(행)은 담지 않는다. 담는 것은 「행·열 수」·「컬럼 이름과 종류」뿐이다.
  까닭은 LICENSE 의 「이 앱이 다루는 자료에 관하여」 절에 적어 두었다.
⚠ catalog_ko.py 에 빠진 데이터셋이 하나라도 있으면 여기서 멈춘다.
"""

import csv
import html
import json
import os
import re
import sys
import warnings

warnings.filterwarnings('ignore')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = os.path.join(os.path.expanduser('~'), '.pydataset', 'resources', 'rdata')
OUT = os.path.join(ROOT, 'src', 'data', 'catalog.js')

sys.path.insert(0, HERE)
import catalog_ko as KO  # noqa: E402

# 시간을 나타내는 컬럼 이름 — 꺾은선 그래프 판정에 쓴다
TIME_NAMES = {'time', 'year', 'date', 'month', 'day', 'week', 'yr', 't'}


def die(msg):
    print('오류: ' + msg)
    sys.exit(1)


def load_index():
    p = os.path.join(BASE, 'datasets.csv')
    if not os.path.exists(p):
        die('PyDataset 자료를 찾지 못했습니다: %s\n'
            '      pip install pydataset 을 한 뒤\n'
            '      python -c "from pydataset import data; data()" 를 한 번 실행하세요.' % p)
    return list(csv.DictReader(open(p, encoding='utf-8')))


def doc_words(pkg, item):
    """문서(HTML)에서 태그를 걷어 낸 글자. 컬럼 이름이 실제로 나오는지 보는 데만 쓴다."""
    p = os.path.join(BASE, 'doc', pkg, item + '.html')
    if not os.path.exists(p):
        return ''
    t = open(p, encoding='utf-8', errors='replace').read()
    t = re.sub(r'<[^>]+>', ' ', t)
    return html.unescape(t)


def col_kind(series, dtype):
    """컬럼을 숫자·범주·글자·참거짓 넷으로 가른다."""
    if dtype == 'bool':
        return 'bool'
    if dtype.startswith(('int', 'float', 'Int', 'Float', 'uint')):
        return 'num'
    return 'cat' if int(series.nunique(dropna=True)) <= 20 else 'text'


def is_time_col(name, col, rows):
    """시간 축인가 — 이름이 그렇고, 값이 대체로 늘어나며, 거의 겹치지 않는다."""
    if col['k'] != 'num' or rows < 4:
        return False
    if name.strip().lower().lstrip('_') not in TIME_NAMES:
        return False
    return col['u'] >= rows * 0.5


def charts(rec):
    """이 자료로 그릴 만한 그래프를 고른다. 맷플롯립 네 가지에 맞췄다.

    ⚠ 행 이름(index)을 잊지 말 것 — mtcars 의 자동차 이름처럼 첫 열이 이름이면
      범주 열이 하나도 없어도 막대그래프를 그릴 수 있다.
    ⚠ boot/coal 처럼 시간 열 하나뿐인 자료도 히스토그램은 그려진다.
    """
    rows, cols, named = rec['r'], rec['cols'], rec['ix']
    tcols = [cols[rec['t']]] if rec['t'] >= 0 else []
    nums = [c for c in cols if c['k'] == 'num' and c not in tcols]
    cats = [c for c in cols if c['k'] in ('cat', 'bool') and 2 <= c['u'] <= 12]
    out = []
    # 변화 — 시간 축과 값이 함께 있어야 한다
    if tcols and nums and rows >= 8:
        out.append('line')
    # 비교 — ① 범주 열 + 값  ② 행 이름 + 값(자료가 작을 때)  ③ 범주뿐이면 개수를 센다
    if (cats and (nums or tcols) and rows >= 3) \
            or (named and nums and 2 <= rows <= 60) \
            or (cats and not nums and not tcols and rows >= 10):
        out.append('bar')
    # 분포 — 값이 충분히 흩어져 있어야 한다
    for c in (nums or tcols):
        if rows >= 30 and c['u'] >= 10:
            out.append('hist')
            break
    # 관계 — 숫자 열이 둘 이상
    if rows >= 15 and len(nums) >= 2:
        out.append('scatter')
    return out


def main():
    idx = load_index()
    print('색인 %d줄' % len(idx))

    ko = {k: (cat, sub, title) for k, cat, sub, title in KO.D}
    catkeys = {c[0] for c in KO.CATS}

    # ── 한 이름에 여러 패키지 — data('이름') 은 하나만 준다 ──────────
    import collections
    byname = collections.defaultdict(list)
    for r in idx:
        byname[r['Item']].append(r['Package'])

    # PyDataset 이 실제로 고르는 것은 os.walk 차례라 폴더 이름 순서를 따른다.
    # 여기서는 pydataset 을 직접 불러 확인한다 (설치되어 있으면).
    winner = {}
    try:
        from pydataset.locate_datasets import __items_dict as items_dict
        for name, path in items_dict().items():
            p = path.replace('\\', '/')
            if '/csv/' in p:
                winner[name] = p.split('/csv/')[1].split('/')[0]
    except Exception as e:  # pydataset 이 없으면 폴더 이름 순서로 어림한다
        print('  (pydataset 을 못 불러 폴더 순서로 어림합니다: %s)' % e)
        for name, pkgs in byname.items():
            winner[name] = sorted(pkgs)[-1]

    try:
        import pandas as pd
    except ImportError:
        die('pandas 가 필요합니다.  pip install pandas')

    out, missing = [], []
    for r in idx:
        pkg, item = r['Package'], r['Item']
        key = pkg + '/' + item
        if key not in ko:
            missing.append(key)
            continue
        cat, sub, kotitle = ko[key]
        if cat not in catkeys:
            die('%s 의 대분류 %r 이 CATS 에 없습니다.' % (key, cat))
        if sub not in KO.SUBS[cat]:
            die('%s 의 소분류 %r 이 %s 의 SUBS 에 없습니다.' % (key, sub, cat))

        path = os.path.join(BASE, 'csv', pkg, item + '.csv')
        df = pd.read_csv(path, index_col=0)   # pydataset 의 data() 와 같은 방식
        cols = []
        for c in df.columns:
            s = df[c]
            dt = str(s.dtype)
            cols.append({'n': str(c), 'k': col_kind(s, dt),
                         'u': int(s.nunique(dropna=True)), 'na': int(s.isna().sum())})

        # 행 이름이 있는가 — 1,2,3… 이 아니라 mtcars 처럼 이름이 붙은 경우
        # ⚠ `dtype == object` 로 보면 안 된다. pandas 3 에서 글자 열은 str dtype 이라
        #   mtcars 의 자동차 이름을 「이름 없음」으로 잘못 읽는다 (실제로 걸렸다).
        named = not pd.api.types.is_numeric_dtype(df.index)

        rec = {'id': item, 'pkg': pkg, 'cat': cat, 'sub': sub,
               'ko': kotitle, 'en': r['Title'], 'ix': named,
               'r': int(df.shape[0]), 'c': int(df.shape[1]), 'cols': cols}
        # 시간 축이 몇 번째 열인가 (없으면 -1).
        # ⚠ 이것을 자바스크립트에서 다시 찾게 하면 두 판정이 어긋난다 (실제로 걸렸다).
        rec['t'] = next((i for i, c in enumerate(cols) if is_time_col(c['n'], c, rec['r'])), -1)
        rec['ch'] = charts(rec)

        # 문서가 말하는 컬럼이 실제 파일에 몇 개나 있는가 (0~1)
        doc = doc_words(pkg, item)
        if cols and doc:
            hit = sum(1 for c in cols
                      if re.search(r'(?<![\w.])' + re.escape(c['n']) + r'(?![\w.])', doc))
            rec['dm'] = round(hit / len(cols), 3)
        else:
            rec['dm'] = None

        # data('이름') 으로 부를 수 있는가
        rec['win'] = winner.get(item, pkg)
        rec['dup'] = sorted(byname[item]) if len(byname[item]) > 1 else None
        out.append(rec)

    if missing:
        die('catalog_ko.py 에 빠진 데이터셋 %d개:\n      %s'
            % (len(missing), ', '.join(missing[:20])))

    extra = set(ko) - {d['pkg'] + '/' + d['id'] for d in out}
    if extra:
        die('catalog_ko.py 에 없는 데이터셋이 적혀 있습니다: %s' % ', '.join(sorted(extra)))

    # ── 겹치는 이름 가운데 파일이 잘못 담긴 것 찾기 ────────────────
    # 두 패키지가 같은 파일 하나를 나눠 쓰므로, 문서와 맞지 않는 쪽은
    # 「다른 패키지의 자료가 들어와 있다」는 뜻이다.
    bykey = {d['pkg'] + '/' + d['id']: d for d in out}
    for name, pkgs in byname.items():
        if len(pkgs) < 2:
            continue
        recs = [bykey[p + '/' + name] for p in pkgs]
        ms = [x['dm'] for x in recs]
        if None in ms:
            continue
        for me, other in ((recs[0], recs[1]), (recs[1], recs[0])):
            if me['dm'] < 0.5 <= other['dm'] and other['dm'] >= 0.6:
                me['bad'] = other['pkg']      # 실제로 든 것은 저쪽 자료
            elif max(ms) < 0.6:
                me['bad'] = '?'               # 어느 쪽인지 가릴 수 없다

    # ── 요약 ────────────────────────────────────────────────────────
    meta = {
        'cats': [{'k': k, 'e': e, 'n': n, 'd': d} for k, e, n, d in KO.CATS],
        'subs': KO.SUBS,
        'subDesc': KO.SUB_DESC,
        'nPkg': len(byname and {d['pkg'] for d in out}),
        'nCallable': len({d['id'] for d in out}),
        'nShadowed': sum(1 for d in out if d['dup'] and d['win'] != d['pkg']),
        'nBadFile': sum(1 for d in out if d.get('bad') and d['bad'] != '?'),
    }
    out.sort(key=lambda d: (d['cat'], d['sub'], d['id'].lower()))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = json.dumps({'meta': meta, 'items': out}, ensure_ascii=False, separators=(',', ':'))
    # ⚠ .json 이 아니라 .js 로 내보낸다 — vite 와 node 가 똑같이 읽을 수 있어야 하는데
    #   JSON 모듈은 import 문법이 서로 달라 시험이 깨진다.
    head = ('/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유.'
            ' 학교 수업 목적으로만 이용해 주세요. */\n'
            '// 이 파일은 tools/build_data.py 가 만든다. 손으로 고치지 말 것.\n')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(head + 'export default ' + body + ';\n')

    if os.path.exists(OUT[:-3] + '.json'):
        os.remove(OUT[:-3] + '.json')

    print('데이터셋 %d개 · 패키지 %d종 → %s (%.0fKB)'
          % (len(out), meta['nPkg'], os.path.relpath(OUT, ROOT),
             os.path.getsize(OUT) / 1024))
    print('  부를 수 있는 이름 %d개 / 가려진 것 %d개 / 파일이 어긋난 것 %d개'
          % (meta['nCallable'], meta['nShadowed'], meta['nBadFile']))
    c = collections.Counter(d['cat'] for d in out)
    print('  ' + ' · '.join('%s %d' % (k, c[k]) for k, _, _, _ in KO.CATS))
    g = collections.Counter(x for d in out for x in d['ch'])
    print('  그래프 추천 — 꺾은선 %d · 막대 %d · 히스토그램 %d · 산점도 %d'
          % (g['line'], g['bar'], g['hist'], g['scatter']))
    print('  그릴 그래프가 없는 것 %d개' % sum(1 for d in out if not d['ch']))


if __name__ == '__main__':
    main()
