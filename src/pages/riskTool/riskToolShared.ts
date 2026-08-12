// closure-risk-model의 web/shared.js에 있던 공용 로직을 React 페이지 3개
// (AdminRenewalCheck/AdminStoreRiskList/AdminDistrictProspect)가 공유하도록 옮긴 것
// (2026-08-10, iframe 제거하고 React로 재구현).

export interface RankingRow {
  store_label: string
  sido?: string
  sigungu?: string
  classification: string
  v1_percentile: number
  v2_percentile: number | null
  avg_competitors_500m?: number | null
  v2_top_factor?: { category: string; evidence: string } | null
}

export type BadgeTier = 'danger' | 'caution' | 'safe' | 'unknown'

export function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// 216개 실매장은 아직 실제 계약일자 데이터가 없어, 매장 주소 시드로 고정된 더미 만료일을
// 붙인다(원본과 동일 알고리즘 — -90~+400일 범위, 매번 같은 매장은 같은 값).
export function dummyContractExpiryDays(storeLabel: string): string {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + (hashSeed(storeLabel + '|contract') % 491) - 90)
  return expiry.toISOString().slice(0, 10)
}

export function badgeTier(classification: string | undefined): BadgeTier {
  if (!classification) return 'unknown'
  if (classification.includes('고위험')) return 'danger'
  if (classification.includes('위험')) return 'caution'
  if (classification.includes('안전')) return 'safe'
  return 'unknown'
}

export function riskTierFromPercentile(p: number | null | undefined): { tier: BadgeTier; label: string } {
  if (p == null) return { tier: 'unknown', label: '' }
  if (p >= 75) return { tier: 'danger', label: '위험한 편' }
  if (p >= 50) return { tier: 'caution', label: '주의가 필요한 편' }
  if (p >= 25) return { tier: 'safe', label: '비교적 안전한 편' }
  return { tier: 'safe', label: '안전한 편' }
}

export function pctLabel(p: number | null | undefined, compact = false): {
  text: string; width: number; na: boolean; tier: BadgeTier; tierLabel: string
} {
  if (p === null || p === undefined) return { text: '계산 안 됨', width: 0, na: true, tier: 'unknown', tierLabel: '' }
  const { tier, label } = riskTierFromPercentile(p)
  const text = compact
    ? `위험도 상위 ${Math.round(100 - p)}% (백분위 ${p.toFixed(1)})`
    : `위험도 상위 ${Math.round(100 - p)}% · ${label} (백분위 ${p.toFixed(1)})`
  return { text, width: p, na: false, tier, tierLabel: label }
}

export function shortBadgeLabel(classification: string | undefined): string {
  if (!classification) return ''
  return classification.split(' — ')[0]
}

export function riskTagClass(tier: BadgeTier): string {
  if (tier === 'danger') return 'high'
  if (tier === 'caution') return 'medium'
  if (tier === 'safe') return 'low'
  return ''
}

export function stripMarkdownSymbols(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
}

// 매출/임대료 실 데이터 연동 전이라 매장 주소 시드로 고정된 더미 값을 쓴다(원본과
// 동일 알고리즘 — 새로고침해도 매장마다 항상 같은 값).
export function dummyMonthlySales(storeLabel: string): number {
  return 25_000_000 + (hashSeed(storeLabel) % 105_000_000)
}

export function dummyMonthlyRent(storeLabel: string): number {
  const ratio = 0.08 + (hashSeed(storeLabel + '|rent') % 1201) / 10000
  return Math.round((dummyMonthlySales(storeLabel) * ratio) / 10000) * 10000
}

export function fmtWon(n: number | null | undefined): string {
  return n == null ? '-' : Math.round(n).toLocaleString('ko-KR') + '원'
}

export interface TopFactor {
  category: string
  evidence: string
  action: string
}

// 재계약 검토 자료(내부용) 마크다운에서 SHAP 1위 위험요인만 뽑아낸다.
export function topClauseFactor(md: string, axisLabel: string): TopFactor | null {
  const startMarker = `## 위험요인 근거 및 조항 후보 (${axisLabel})`
  const startIdx = md.indexOf(startMarker)
  if (startIdx === -1) return null
  const rest = md.slice(startIdx + startMarker.length)
  const endIdx = rest.indexOf('\n## ')
  const section = endIdx === -1 ? rest : rest.slice(0, endIdx)
  const m = section.match(/-\s+\*\*\[(.+?)\]\*\*\s+(.+?)\s+\(영향 순위 1위\)\s*\n\s*-\s*예방조치:\s*(.+)/)
  if (!m) return null
  return { category: m[1], evidence: m[2].trim(), action: m[3].trim() }
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
