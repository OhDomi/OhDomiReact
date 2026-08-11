// dashboard.html과 store-detail.html이 공유하는 공통 함수(2026-08-06, 매장 상세 페이지
// 신설하면서 추출) — API 주소, 라이트/다크 테마, 결과 카드 렌더링, 배지/백분위 해석.

// 2026-08-10: 이 페이지가 FastAPI 자체 포트(8050)에서 직접 열렸으면 same-origin이라
// 빈 문자열(상대경로)로 충분하지만, OhDomiReact의 Vite 프록시(/risk-api)를 거쳐 열렸을
// 때(로컬 5173 또는 팀원 접속용 터널 도메인 등) 기존처럼 절대주소 "http://127.0.0.1:8050"을
// 기본값으로 두면 "127.0.0.1"이 접속한 사람 자신의 컴퓨터를 가리켜버려 요청이 항상
// 실패한다(Failed to fetch) — 페이지를 연 위치를 보고 자동으로 맞는 기본값을 고른다.
function defaultApiBase() {
  return location.port === '8050' ? '' : '/risk-api';
}

function apiBase() {
  const el = document.getElementById('apiBase');
  if (!el) return defaultApiBase();
  // "개발자용" 입력칸에 사용자가 실제로 다른 값을 입력한 경우만 그 값을 쓴다 — 원래
  // HTML의 하드코딩된 기본값(예전 표기)은 무시하고 defaultApiBase()로 교체.
  if (!el.value || el.value === 'http://127.0.0.1:8050') return defaultApiBase();
  return el.value.replace(/\/$/, '');
}

// "개발자용" 입력칸이 실제로 쓰는 값과 다르게 옛 고정 주소만 보여주고 있으면 혼란스러우니
// 화면에도 실제 사용 값을 반영한다.
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('apiBase');
  if (el && el.value === 'http://127.0.0.1:8050') el.value = defaultApiBase();
});

// 시스템 라이트/다크 설정을 [data-theme]에 반영 — DESIGN.md 토큰은 이미 두 모드 모두
// 정의돼 있으므로(둘 다 WCAG AA 통과, DW-2.2) 별도 수동 토글 없이 OS 설정만 따라간다.
function applyTheme(mql) { document.documentElement.dataset.theme = mql.matches ? 'dark' : 'light'; }
const darkMql = matchMedia('(prefers-color-scheme: dark)');
applyTheme(darkMql);
darkMql.addEventListener('change', applyTheme);

// ---------- 결과 해석: 배지 색/문구는 API가 이미 만든 classification 문장을 그대로 쓰고,
// 색상만 이 문장에서 유추한다(문장을 다시 쓰지 않음 — content-design: 원자료의 언어를
// 존중). "unknown" 계열(문장에 판정 키워드가 없는 경우)은 info 톤으로 폴백. ----------
function badgeTier(classification) {
  if (!classification) return 'unknown';
  if (classification.includes('고위험')) return 'danger';
  if (classification.includes('위험')) return 'caution'; // 업종 구조적 위험 / 입지 위험
  if (classification.includes('안전')) return 'safe';
  return 'unknown'; // 예: "업종 기준만 판단 — 입지 정보 없음(서울 외 지역 매장)"
}

// 백분위 숫자만 보고는 위험한 건지 안전한 건지 감이 안 잡힌다는 리포트(2026-08-07) —
// axisNarrative()(store-detail.html)가 문장형 해석에서 이미 쓰던 경계값(75/50/25)을 원자료
// 숫자 옆에도 붙인다. 색상은 새로 만들지 않고 기존 badge tier(tier-danger/caution/safe)를
// 재사용 — 배지와 원자료 숫자가 같은 색 언어를 쓰게 함.
function riskTierFromPercentile(p) {
  if (p == null) return { tier: 'unknown', label: '' };
  if (p >= 75) return { tier: 'danger', label: '위험한 편' };
  if (p >= 50) return { tier: 'caution', label: '주의가 필요한 편' };
  if (p >= 25) return { tier: 'safe', label: '비교적 안전한 편' };
  return { tier: 'safe', label: '안전한 편' };
}

// compact=true: 전체 매장 목록처럼 카드 폭이 좁고 옆에 등급 배지가 이미 있는 곳에서 씀
// (등급 문구까지 반복하면 줄바꿈이 잦아 목록이 지저분해짐) — 방향 표기("위험도")만 붙이고
// 등급 문구는 생략. compact=false(기본): 매장 하나를 자세히 보는 결과 카드용, 등급 문구까지
// 붙여 숫자만 봐도 감이 잡히게 한다.
function pctLabel(p, compact) {
  if (p === null || p === undefined) return { text: '계산 안 됨', width: 0, na: true, tier: 'unknown', tierLabel: '' };
  const { tier, label } = riskTierFromPercentile(p);
  // "상위 X%"만 쓰면 좋은 쪽 상위인지 위험한 쪽 상위인지 문구만으론 알 수 없어("위험도"를 명시).
  const text = compact
    ? `위험도 상위 ${Math.round(100 - p)}% (백분위 ${p.toFixed(1)})`
    : `위험도 상위 ${Math.round(100 - p)}% · ${label} (백분위 ${p.toFixed(1)})`;
  return { text, width: p, na: false, tier, tierLabel: label };
}

// classification 문장은 "<짧은 등급> — <설명> (<권고>)" 형태(src/combine_scores.py:_classify) —
// " — " 앞부분만 잘라 목록 밀도의 짧은 배지 레이블로 쓴다.
function shortBadgeLabel(classification) {
  if (!classification) return '';
  return classification.split(' — ')[0];
}

function renderCard(row, showExpiry) {
  const tier = badgeTier(row.classification);
  const v1 = pctLabel(row.v1_percentile);
  const v2 = pctLabel(row.v2_percentile);
  const label = row.store_label && row.store_label !== '-' ? row.store_label : row.brand_nm;
  const expiryHtml = showExpiry && row.contract_expiry
    ? `<span class="store-sub">계약 만료 예정일: ${row.contract_expiry}</span>` : '';
  const footerHtml = row.v2_percentile == null
    ? `<div class="card-footer">[비고] 서울 밖 주소 또는 주소 미입력 — 입지 위험도는 서울 매장 데이터 기준으로만 산출됩니다.</div>`
    : '';
  // 2026-08-08: "왜 이 매장이 이 점수인지" 직관적으로 안 보인다는 리포트 — 백분위 막대만
  // 있고 원인이 없었음. 매장마다 갈리는 v2(입지) 1위 SHAP 요인(batch_score_real_stores.py가
  // 미리 계산)을 카테고리 태그로 보여준다. title 속성에 근거 문장 전체를 담아 마우스 오버로
  // 상세 확인 가능(별도 UI 없이 네이티브 툴팁 재사용).
  const topFactorHtml = row.v2_top_factor
    ? `<div class="top-factor" title="${row.v2_top_factor.evidence.replace(/"/g, '&quot;')}">가장 큰 영향 요인: ${row.v2_top_factor.category}</div>`
    : '';
  return `
    <article class="result-card">
      <div class="card-header">
        <span class="store-label">${label}</span>${expiryHtml}
      </div>
      <div class="interp-region">
        <div class="region-label">해석</div>
        <span class="badge tier-${tier}">${row.classification}</span>
      </div>
      <div class="raw-region">
        <div class="region-label">원자료 (통계 수치)</div>
        <div class="stat-scale">막대가 길수록 위험 — 같은 조건의 매장들과 비교한 백분위(0 안전 ~ 100 위험). 25 미만 안전한 편 · 25~50 비교적 안전한 편 · 50~75 주의가 필요한 편 · 75 이상 위험한 편</div>
        <div class="stat-row">
          <div class="stat-row-top">
            <span class="stat-name">업종 평균 대비</span>
            <span class="stat-value">${v1.text}</span>
          </div>
          <span class="stat-track"><span class="stat-fill tier-${v1.tier}" style="width:${v1.width}%"></span></span>
        </div>
        <div class="stat-row">
          <div class="stat-row-top">
            <span class="stat-name">입지(서울 매장만)</span>
            <span class="stat-value${v2.na ? ' na' : ''}">${v2.text}</span>
          </div>
          <span class="stat-track${v2.na ? ' na' : ''}"><span class="stat-fill tier-${v2.tier}" style="width:${v2.width}%"></span></span>
        </div>
      </div>
      ${topFactorHtml}
      ${footerHtml}
    </article>`;
}

// ---------- 매출/임대료 더미 데이터(2026-08-07) — 실제 매장별 매출·임대료 데이터는 아직
// 연동 전이라 구할 수 없지만(다른 곳에서도 "산정서 자동생성 불가"로 이미 명시), "구해진다는
// 가정하에" 화면에 구체적인 원 단위 숫자로 체감되게 표현해 달라는 요청(2026-08-07) — 매장
// 목록 사이드바(store-list.html)에서 쓰던 매출 더미 생성 로직을 여기(공용)로 옮기고, 같은
// 방식으로 임대료 더미도 추가해 두 페이지가 같은 매장에 항상 같은 값을 보여주게 한다
// (store_label을 시드로 쓰는 결정적 해시 — 진짜 난수 아님, 새로고침해도 매장마다 고정값).
// 화면에는 반드시 더미임을 명시할 것. ----------
function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function dummyMonthlySales(storeLabel) {
  return 25_000_000 + (hashSeed(storeLabel) % 105_000_000); // 2,500만~1억3,000만원/월
}
// 임대료는 매출의 8~20% 사이에서 매장마다 다른 비율로 잡는다(외식업 임대료율 통상 참고
// 범위) — 매출과 똑같은 해시를 그대로 쓰면 두 값이 100% 연동돼(매출 2배=임대료 2배) 더미인
// 게 너무 티나므로, 시드 문자열에 접미사를 붙여 매출과는 독립적으로 비율이 갈리게 한다.
function dummyMonthlyRent(storeLabel) {
  const ratio = 0.08 + (hashSeed(storeLabel + '|rent') % 1201) / 10000; // 0.08~0.20
  return Math.round(dummyMonthlySales(storeLabel) * ratio / 10000) * 10000; // 만원 단위
}
function fmtWon(n) {
  return n == null ? '-' : Math.round(n).toLocaleString('ko-KR') + '원';
}

// ---------- 계약 만료일 더미 데이터(2026-08-07) — 서울 전체 216개 매장은 아직 실제
// 계약일자 데이터가 없어 "재계약 대상 점검" 페이지가 데모용 매장 3곳으로만 동작했다는
// 리포트 — 매출/임대료 더미와 같은 방식(store_label 시드 결정적 해시)으로 매장마다 고정된
// 계약 만료일을 붙인다. -90~+400일 범위로 흩어서 "마감 임박/경과", "조율 가능(91~200일)",
// "그 밖(90일 초과 400일 이하 또는 이미 만료)" 세 상태가 매장마다 골고루 섞이게 한다
// (좁은 범위로 잡으면 전부 같은 그룹에 몰려 데모 가치가 없음). ----------
function dummyContractExpiryDays(storeLabel) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (hashSeed(storeLabel + '|contract') % 491) - 90); // -90~+400
  return expiry.toISOString().slice(0, 10);
}

// 화면에 상담자료(재계약/예비창업자/신규가맹)를 <pre>로 그대로 찍으면 마크다운 기호
// (#, ##, **)가 렌더링 안 되고 글자 그대로 보여서 "사람이 쓴 보고서 같지 않다"는 리포트
// (2026-08-06). 실제 서식으로 바꾸는(마크다운→HTML 렌더링) 대신 기호 자체를 지운 순수
// 텍스트로 보여달라는 요청 — 다운로드되는 .md 파일 자체는 원본 마크다운 그대로 유지한다
// (마크다운 편집기로 열면 정상 서식으로 보여야 하므로, downloadMarkdown()은 이 함수를 안 씀).
function stripMarkdownSymbols(md) {
  return md
    .replace(/^#{1,6}\s+/gm, '')       // # 제목, ## 소제목 등 — 앞머리 기호만 제거, 텍스트는 남김
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **굵게**
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1'); // *기울임* (굵게와 겹치지 않게)
}

// 매장 상세 페이지의 "다운로드" 버튼용 — 서버 없이 브라우저에서 바로 .md 파일로 저장.
function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
