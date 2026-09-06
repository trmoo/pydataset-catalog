/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요. */
// vite.config.js — dist/index.html 한 파일로 묶는다 (더블클릭 실행)

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const BANNER = '/*! PyDataset 데이터 도감 — (C) 2026 티쳐무 · 모든 권리 보유.'
  + ' 학교 수업 목적으로만 이용해 주세요. 데이터셋은 R 의 여러 패키지에 실린 것이며'
  + ' 저작권과 출처가 각각 따로 있습니다. */';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 4000,
    rollupOptions: { output: { banner: BANNER } },
  },
  // ⚠ 'none' 으로 두면 위 /*! 배너까지 지워진다. 저작권 표시가 사라지므로 건드리지 말 것.
  esbuild: { legalComments: 'inline' },
  plugins: [viteSingleFile()],
});
