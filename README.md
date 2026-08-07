# OhDomi React dashboard

## Run locally

```powershell
npm install
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8080` during local development. For a
separately hosted Spring API, set `VITE_API_BASE_URL` before building or running
the app.

The owner hygiene page loads model checklist items from Spring, accepts JPG, PNG,
or WebP images up to 10MB, submits them to `/api/hygiene-inspections/analyze`, and
refreshes the saved score, item result, history, and improvement tasks after a
successful analysis.

## Verification

```powershell
npm run build
npm run lint
```
```mermaid
flowchart LR
    U[가맹점주 / 본사 관리자] --> R[프론트엔드<br>React 19<br/>Vite · TypeScript]
    R -->|/api REST| S[백엔드<br>Spring Boot API<br/>통합 게이트웨이]
    S --> DB[(MySQL<br/>운영 데이터)]
    S -->|사진 분석| H[위생 AI<br/>FastAPI · LangGraph · OpenAI VLM]
    S -->|정기 위험 예측| M[폐점 위험 모델<br/>FastAPI · ML/SHAP]
    M --> P[공공데이터 API<br/>서울·상권·통계·지도]
    H --> O[OpenAI Vision Model]
```