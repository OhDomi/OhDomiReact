import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 팀원이 외부(인터넷)에서 터널(ngrok/cloudflared 등)을 통해 접속할 때, Vite가 낯선
    // Host 헤더(예: xxxx.trycloudflare.com)를 보안상 자동으로 차단하는 것을 막는다
    // (2026-08-10). 로컬 전용 개발 서버라 위험 낮음 — 실 서비스 배포에는 안 씀.
    allowedHosts: true,
    // Vite's own CORS preflight handling intercepts OPTIONS requests on proxied /api paths
    // before they reach the proxy target, stripping Access-Control-Allow-Origin from Spring's
    // real response (2026-08-12, broke login through the Tailscale Funnel domain). Turn it off
    // so preflight requests pass through to Spring, which already handles CORS itself.
    cors: false,
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
