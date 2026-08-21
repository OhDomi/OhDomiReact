import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../../api/useApiData'
import {
  badgeTier, dummyMonthlyRent, dummyMonthlySales, fmtWon, pctLabel,
  riskTagClass, stripMarkdownSymbols, topClauseFactor, type RankingRow, type TopFactor,
} from '../riskTool/riskToolShared'
import GeneratingBanner from '../../api/GeneratingBanner'
import { describeApiError } from '../../api/useApiData'
import './AdminStoreDetail.css'

// closure-risk-model의 store-detail.html을 React로 재구현(2026-08-10, "모든 페이지에
// 사이드바가 빠짐없이 보였으면 좋겠다" 요청) — 위험도 요약(해석 5개 항목)+상권 원자료
// (헤드라인 3개+그룹별 통계+경쟁점포 목록)+상담자료(재계약/예비창업자 탭, 다운로드)까지
// 원본과 동일한 3단 구성을 그대로 포팅.

interface DistrictStat {
  key: string
  label: string
  formatted: string
  value: number | string | null
  avg?: number | null
  avg_formatted?: string | null
}

interface Competitor {
  name: string
  distance_m: number
}

interface DistrictAnalysis {
  district_stats: DistrictStat[]
  nearby_competitors: Competitor[] | null
}

interface DocResult {
  internal_md: string
  franchisee_md?: string
  transfer_md?: string
}

type DocKind = 'renewal' | 'transfer'

const KIND_LABELS: Record<DocKind, { audience: string; internal: string }> = {
  renewal: { audience: '가맹점주용', internal: '내부용(상세)' },
  transfer: { audience: '양수인용', internal: '내부용(상세)' },
}

const DISTRICT_STAT_ICONS: Record<string, string> = {
  trdar_flpop: '🚶',
  trdar_flpop_lunch: '🍱',
  trdar_flpop_dinner: '🌆',
  avg_selng_amt_per_store: '💰',
  trdar_cls_sale_mt_gap: '⏳',
  trdar_chnge_ix: '📊',
  adstrd_expndtr_total: '💳',
  adstrd_fd_expndtr: '🍜',
  avg_competitors_250m: '🏪',
  avg_competitors_500m: '🏬',
  sgis_grid_population: '👥',
  dist_subway_m: '🚇',
}

const DISTRICT_HERO_KEYS = ['trdar_flpop', 'sgis_grid_population', 'avg_competitors_500m']
const DISTRICT_STAT_GROUPS: { title: string; keys: string[] }[] = [
  { title: '유동인구 · 소비', keys: ['trdar_flpop_lunch', 'trdar_flpop_dinner', 'avg_selng_amt_per_store', 'adstrd_expndtr_total', 'adstrd_fd_expndtr'] },
  { title: '경쟁 · 접근성', keys: ['avg_competitors_250m', 'dist_subway_m'] },
  { title: '상권 변화', keys: ['trdar_chnge_ix', 'trdar_cls_sale_mt_gap'] },
]

function splitValueUnit(formatted: string): { num: string; unit: string } {
  const m = String(formatted).match(/^([+-]?[\d,.]+)(.*)$/)
  return m ? { num: m[1], unit: m[2].trim() } : { num: formatted, unit: '' }
}

function avgCompareText(s: DistrictStat): string {
  if (s.avg == null || s.avg_formatted == null || typeof s.value !== 'number') return ''
  if (s.avg === 0) return `평균 ${s.avg_formatted}`
  const diffPct = ((s.value - s.avg) / s.avg) * 100
  const sign = diffPct > 0 ? '+' : ''
  return `평균 ${s.avg_formatted} · ${sign}${diffPct.toFixed(0)}%`
}

function axisNarrative(percentile: number | null | undefined, subject: string): string | null {
  if (percentile == null) return null
  const rank = Math.round(100 - percentile)
  let level: string, note: string
  if (percentile >= 75) { level = '위험한 편'; note = '비슷한 조건 대비 위험 신호가 뚜렷하게 나타납니다.' }
  else if (percentile >= 50) { level = '다소 주의가 필요한 편'; note = '평균보다는 위험 신호가 있지만 아직 심각한 수준은 아닙니다.' }
  else if (percentile >= 25) { level = '비교적 안전한 편'; note = '평균보다 위험 신호가 적은 편입니다.' }
  else { level = '안전한 편'; note = '비슷한 조건 대비 위험 신호가 적게 나타납니다.' }
  return `${subject} 기준 상위 ${rank}%로 ${level}입니다. ${note} (백분위 ${percentile.toFixed(1)})`
}

function rentBurdenNarrative(storeLabel: string): string {
  const sales = dummyMonthlySales(storeLabel)
  const rent = dummyMonthlyRent(storeLabel)
  const ratioPct = (rent / sales) * 100
  const level = ratioPct >= 18 ? '부담이 큰 편' : ratioPct >= 13 ? '평균보다 다소 높은 편' : '평균적인 수준'
  return `추정 월매출 ${fmtWon(sales)} 대비 추정 월임대료 ${fmtWon(rent)}로, 임대료가 매출의 ${ratioPct.toFixed(1)}%를 차지합니다(외식업 통상 참고 기준 10~15% — ${level}).`
}

function AdminStoreDetail({ address, onBack }: { address: string; onBack: () => void }) {
  const [summary, setSummary] = useState<RankingRow | null | 'loading' | { error: string }>('loading')
  const [district, setDistrict] = useState<DistrictAnalysis | null | 'loading' | { error: string }>(null)
  const [docs, setDocs] = useState<Partial<Record<DocKind, DocResult>>>({})
  const [docLoading, setDocLoading] = useState<DocKind | null>(null)
  const [docError, setDocError] = useState<Partial<Record<DocKind, string>>>({})
  const [activeTab, setActiveTab] = useState<DocKind>('renewal')

  useEffect(() => {
    setSummary('loading')
    setDistrict(null)
    setDocs({})
    setDocError({})
    setActiveTab('renewal')

    fetch(apiUrl('/risk-api/rankings'))
      .then(async (r) => {
        if (!r.ok) throw new Error(await describeApiError(r, `요청에 실패했습니다. (${r.status})`))
        return r.json() as Promise<(RankingRow & { error?: string })[]>
      })
      .then((rows) => {
        const row = rows.find((r) => r.store_label === address && !r.error) ?? null
        setSummary(row)
        if (row && row.v2_percentile != null) loadDistrict()
      })
      .catch((e: unknown) => setSummary({ error: e instanceof Error ? e.message : '요청에 실패했습니다.' }))

    async function loadDistrict() {
      setDistrict('loading')
      try {
        const resp = await fetch(apiUrl('/risk-api/district-analysis'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_nm: '김가네', address, sbiz_category: '김밥/만두/분식' }),
        })
        if (!resp.ok) throw new Error(await describeApiError(resp, `HTTP_${resp.status}`))
        setDistrict(await resp.json())
      } catch (e) {
        setDistrict({ error: e instanceof Error ? e.message : '요청에 실패했습니다.' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    if (!address || docs[activeTab] || docLoading === activeTab) return
    setDocLoading(activeTab)
    fetch(apiUrl('/risk-api/store-packet'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, kind: activeTab }),
    })
      .then(async (resp) => {
        if (!resp.ok) throw new Error(await describeApiError(resp, `HTTP_${resp.status}`))
        const body: DocResult = await resp.json()
        setDocs((prev) => ({ ...prev, [activeTab]: body }))
      })
      .catch((e: unknown) => setDocError((prev) => ({
        ...prev,
        [activeTab]: `자료를 만들지 못했습니다. (${e instanceof Error ? e.message : '알 수 없는 오류'})`,
      })))
      .finally(() => setDocLoading(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, activeTab])

  const renewalDoc = docs.renewal
  const topFactor = useMemo<TopFactor | null>(() => {
    if (!renewalDoc || summary === 'loading' || !summary || (typeof summary === 'object' && 'error' in summary)) return null
    const axisLabel = summary.v2_percentile != null ? '입지 기준, 서울 매장' : '업종 기준, 전국'
    return topClauseFactor(renewalDoc.internal_md || '', axisLabel)
  }, [renewalDoc, summary])

  if (!address) {
    return (
      <div className="admin-store-detail-page">
        <button type="button" className="detail-back-link" onClick={onBack}>← 전체 매장 목록으로</button>
        <div className="panel">주소 정보가 없어 표시할 수 없습니다 — 전체 매장 목록에서 매장을 클릭해 들어와 주세요.</div>
      </div>
    )
  }

  return (
    <div className="admin-store-detail-page">
      <button type="button" className="detail-back-link" onClick={onBack}>← 전체 매장 목록으로</button>
      <h1>{address}</h1>
      <p className="page-heading-sub">이 매장의 위험도와 실제 계산된 상담자료를 확인합니다.</p>

      <section className="panel store-detail-section">
        <h2><span className="step">1</span> 위험도 요약</h2>
        {summary === 'loading' && <span className="skeleton-block" style={{ display: 'block', height: 90 }} />}
        {summary && typeof summary === 'object' && 'error' in summary && (
          <div className="results-error">위험도 요약을 불러오지 못했습니다. ({summary.error})</div>
        )}
        {summary === null && <p className="results-empty">이 매장의 사전 계산된 순위 데이터를 찾지 못했습니다 — 아래 상담자료 탭은 그대로 이용할 수 있습니다.</p>}
        {summary && summary !== 'loading' && !('error' in summary) && (
          <SummaryCard row={summary} topFactor={topFactor} />
        )}
      </section>

      {summary && summary !== 'loading' && !('error' in summary) && summary.v2_percentile != null && (
        <section className="panel store-detail-section">
          <h2><span className="step">2</span> 상권 원자료</h2>
          <p className="explain">이 매장 상권의 유동인구·경쟁점포·배후인구 등 공공데이터 원자료입니다 — 위험도 판단(1번)과는 별개로, 판단 근거가 된 숫자를 그대로 보여줍니다.</p>
          {district === 'loading' && <span className="skeleton-block" style={{ display: 'block', height: 120 }} />}
          {district && typeof district === 'object' && 'error' in district && (
            <div className="results-error">상권 원자료를 불러오지 못했습니다. ({district.error})</div>
          )}
          {district && district !== 'loading' && !('error' in district) && (
            <DistrictStats stats={district.district_stats} competitors={district.nearby_competitors} />
          )}
        </section>
      )}

      <section className="panel store-detail-section">
        <h2><span className="step">3</span> 상담자료</h2>
        <p className="explain">이 매장 주소로 실제 계산해서 만든 자료입니다(미리 만들어둔 문서를 재활용하지 않습니다) — 재계약 검토 자료·가맹점 양도·양수 자료 중 골라 보고, 필요하면 그대로 다운로드할 수 있습니다.</p>

        <div className="doc-tabs" role="group" aria-label="자료 종류">
          <button type="button" className="doc-tab" aria-pressed={activeTab === 'renewal'} onClick={() => setActiveTab('renewal')}>재계약 검토 자료</button>
          <button type="button" className="doc-tab" aria-pressed={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')}>가맹점 양도·양수 자료</button>
        </div>

        {docLoading === activeTab && <GeneratingBanner title="자료 생성 중…" detail="실제 계산이라 몇 초~수십 초 걸릴 수 있습니다" />}
        {docError[activeTab] && <div className="results-error">{docError[activeTab]}</div>}
        {docs[activeTab] && <DocBody kind={activeTab} body={docs[activeTab]!} address={address} />}
      </section>
    </div>
  )
}

function SummaryCard({ row, topFactor }: { row: RankingRow; topFactor: TopFactor | null }) {
  const v1 = pctLabel(row.v1_percentile)
  const v2 = pctLabel(row.v2_percentile)
  const tier = badgeTier(row.classification)
  const v1Narrative = axisNarrative(row.v1_percentile, '같은 업종 전체')
  const v2Narrative = row.v2_percentile != null ? axisNarrative(row.v2_percentile, '서울 매장 전체') : null
  const summaryText = row.v2_percentile != null
    ? `종합적으로 이 매장은 ${row.classification} 상태로 판단됩니다.`
    : `입지 위험도를 계산할 수 없어 업종 위험도만으로 판단하며, 그 결과는 ${row.classification}입니다.`

  return (
    <>
      <div className="store-detail-card-header">
        <span className={`risk-tag ${riskTagClass(tier)}`}>{row.classification}</span>
      </div>
      <div className="risk-list-stat-row">
        <div className="risk-list-stat-top"><span>업종 평균 대비</span><b>{v1.text}</b></div>
        <span className="risk-list-stat-track"><span className={`risk-list-stat-fill ${v1.tier}`} style={{ width: `${v1.width}%` }} /></span>
      </div>
      <div className="risk-list-stat-row">
        <div className="risk-list-stat-top"><span>입지(서울 매장만)</span><b className={v2.na ? 'muted' : ''}>{v2.text}</b></div>
        <span className="risk-list-stat-track"><span className={`risk-list-stat-fill ${v2.tier}`} style={{ width: `${v2.width}%` }} /></span>
      </div>

      <div className="interp-detail">
        <div className="interp-item">
          <h3>업종 위험도 해석</h3>
          <p>{v1Narrative ?? <span className="muted">업종 위험도를 계산할 데이터가 없습니다.</span>}</p>
        </div>
        <div className="interp-item">
          <h3>입지 위험도 해석 (서울 매장 기준)</h3>
          <p>{v2Narrative ?? '이 매장은 서울 밖 주소이거나 위치 정보가 없어 입지 위험도를 계산할 수 없습니다 — 입지 관련 위험은 상담자료나 별도 확인이 필요합니다.'}</p>
        </div>
        <div className="interp-item">
          <h3>종합 해석</h3>
          <p>{summaryText}</p>
        </div>
        <div className="interp-item">
          <h3>매출 대비 임대료 부담 <span className="muted" style={{ fontWeight: 400 }}>(참고용 더미 데이터)</span></h3>
          <p>{rentBurdenNarrative(row.store_label)}</p>
          <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>※ 매출·임대료 실 데이터 연동 전이라 주소를 기준으로 고정된 더미 값입니다(새로고침해도 동일, 실제 수치 아님).</p>
        </div>
        <div className="interp-item">
          <h3>가장 큰 영향 요인</h3>
          {topFactor ? (
            <p><strong>{topFactor.category}</strong> — {topFactor.evidence}<br />권장 조치: {topFactor.action}</p>
          ) : (
            <p className="muted">확인 중… (3번 상담자료를 함께 준비하고 있습니다)</p>
          )}
        </div>
      </div>
    </>
  )
}

function DistrictStats({ stats, competitors }: { stats: DistrictStat[]; competitors: Competitor[] | null }) {
  if (!stats || !stats.length) return <p className="results-empty">상권 원자료가 없습니다.</p>
  const byKey = Object.fromEntries(stats.map((s) => [s.key, s]))
  const heroItems = DISTRICT_HERO_KEYS.map((k) => byKey[k]).filter(Boolean)
  const usedKeys = new Set(DISTRICT_HERO_KEYS)
  const groups = DISTRICT_STAT_GROUPS.map((g) => {
    const items = g.keys.map((k) => byKey[k]).filter(Boolean)
    items.forEach((s) => usedKeys.add(s.key))
    return { title: g.title, items }
  }).filter((g) => g.items.length)
  const leftover = stats.filter((s) => !usedKeys.has(s.key))
  if (leftover.length) groups.push({ title: '기타', items: leftover })

  const maxDist = competitors && competitors.length ? Math.max(...competitors.map((c) => c.distance_m)) : 0

  return (
    <>
      {heroItems.length > 0 && (
        <div className="dstat-hero">
          {heroItems.map((s) => {
            const { num, unit } = splitValueUnit(s.formatted)
            const avgText = avgCompareText(s)
            return (
              <div className="dstat-hero-item" key={s.key}>
                <span className="dstat-hero-icon" aria-hidden="true">{DISTRICT_STAT_ICONS[s.key] || '📍'}</span>
                <div className="dstat-hero-value">{num}<span className="unit">{unit}</span></div>
                <div className="dstat-hero-label">{s.label}</div>
                {avgText && <div className="dstat-hero-avg">{avgText}</div>}
              </div>
            )
          })}
        </div>
      )}

      <div className="dstat-groups">
        {groups.map((g) => (
          <div className="dstat-group" key={g.title}>
            <div className="group-title">{g.title}</div>
            {g.items.map((s) => {
              const avgText = avgCompareText(s)
              return (
                <div className="dstat-line" key={s.key}>
                  <span className="dstat-line-label">{DISTRICT_STAT_ICONS[s.key] || '📍'} {s.label}</span>
                  <span className="dstat-line-value-wrap">
                    <span className="dstat-line-value">{s.formatted}</span>
                    {avgText && <span className="dstat-line-avg">{avgText}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <h3 className="dstat-subheading">🍽️ 인근 경쟁 점포 (반경 500m, 가까운 순)</h3>
      {!competitors ? (
        <p className="results-empty">인근 경쟁 점포 목록을 가져오지 못했습니다.</p>
      ) : !competitors.length ? (
        <p className="results-empty">반경 500m 내 같은 업종 점포가 없습니다.</p>
      ) : (
        <div className="competitor-list">
          {competitors.map((c, i) => (
            <div className="competitor-row" key={`${c.name}-${i}`}>
              <span className="competitor-rank">{i + 1}</span>
              <span className="competitor-name">{c.name}</span>
              <span className="competitor-bar-wrap"><span className="competitor-bar" style={{ width: `${((c.distance_m / maxDist) * 100).toFixed(0)}%` }} /></span>
              <span className="competitor-dist">{c.distance_m.toFixed(0)}m</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

const DOC_KIND_FILE_LABELS: Record<DocKind, string> = {
  renewal: '재계약검토자료',
  transfer: '가맹점양도양수자료',
}

function DocBody({ kind, body, address }: { kind: DocKind; body: DocResult; address: string }) {
  const labels = KIND_LABELS[kind]
  const audienceMd = kind === 'renewal' ? body.franchisee_md : body.transfer_md

  function filenameBase(docLabel: string) {
    const safeAddr = address.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40)
    return `${safeAddr}_${DOC_KIND_FILE_LABELS[kind]}_${docLabel}`
  }

  return (
    <>
      <div className="doc-actions">
        <DownloadMenu label={labels.audience} filenameBase={filenameBase(labels.audience)} markdown={audienceMd || ''} />
        <DownloadMenu label={labels.internal} filenameBase={filenameBase('내부용')} markdown={body.internal_md || ''} />
      </div>
      <div className="doc-columns">
        <div className="doc-col">
          <div className="group-title">{labels.audience}</div>
          <pre className="packet-md">{stripMarkdownSymbols(audienceMd || '(내용 없음)')}</pre>
        </div>
        <div className="doc-col">
          <div className="group-title">{labels.internal}</div>
          <pre className="packet-md">{stripMarkdownSymbols(body.internal_md || '(내용 없음)')}</pre>
        </div>
      </div>
    </>
  )
}

type ExportFormat = 'pdf' | 'rtf'

// 다운로드 버튼 클릭 시 PDF/한글 중 고르는 작은 팝오버(2026-08-11, "PDF와 한글파일 중에서
// 선택" 요청). 한글 쪽은 HWPX(개방형 XML)를 직접 구현했다가 네 차례 수정에도 한글 프로그램
// 에서 문단이 겹치는 문제를 못 고쳐 RTF로 전환(사용자 동의) — 한글이 별도 변환 없이 그대로
// 여는 표준 포맷이라 훨씬 안정적. 서버가 그 자리에서 실제 파일(바이트)을 만들어 응답하므로,
// blob으로 받아 즉시 다운로드 트리거.
function DownloadMenu({ label, filenameBase, markdown }: { label: string; filenameBase: string; markdown: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState('')

  async function handleDownload(format: ExportFormat) {
    setOpen(false)
    setBusy(format)
    setError('')
    try {
      const resp = await fetch(apiUrl(`/risk-api/export/${format}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, filename: filenameBase }),
      })
      if (!resp.ok) throw new Error(await describeApiError(resp, `HTTP_${resp.status}`))
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filenameBase}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(`다운로드에 실패했습니다. (${e instanceof Error ? e.message : '알 수 없는 오류'})`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="download-menu-wrap">
      {/* data-backend-ready="true": App.tsx의 전역 "준비 중" 인터셉터가 버튼 텍스트에
          "다운로드"가 들어가면 무조건 토스트로 막는데, 이 버튼들은 실제로 동작하는
          기능이라 예외 처리 필요(2026-08-10, HygieneCheck.tsx와 동일 패턴). */}
      <button
        type="button"
        className="check-btn"
        data-backend-ready="true"
        disabled={busy !== null}
        onClick={() => setOpen((v) => !v)}
      >
        {busy ? '다운로드 중…' : `다운로드 (${label})`}
      </button>

      {open && (
        <div className="download-menu">
          <button type="button" data-backend-ready="true" onClick={() => handleDownload('pdf')}>PDF로 다운로드</button>
          <button type="button" data-backend-ready="true" onClick={() => handleDownload('rtf')}>한글로 다운로드</button>
        </div>
      )}

      {error && <p className="download-menu-error">{error}</p>}
    </div>
  )
}

export default AdminStoreDetail
