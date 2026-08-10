import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      // closure-risk-model의 FastAPI(src/api.py, 로컬 8050) — 재계약 대상 점검/전체 매장
      // 목록/희망상권 탐색 React 페이지가 쓴다(2026-08-10, iframe 제거하고 React로 재구현).
      '/risk-api': {
        target: 'http://127.0.0.1:8050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/risk-api/, ''),
      },
    },
  },
})
