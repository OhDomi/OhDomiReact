import { useEffect, useMemo, useState } from 'react'
import ApiDataState from '../../api/ApiDataState'
import { badgeTier, pctLabel, riskTagClass, riskTierFromPercentile, shortBadgeLabel, type RankingRow } from '../riskTool/riskToolShared'
import './AdminStoreRiskList.css'

// closure-risk-model의 store-list.html을 React로 재구현(2026-08-10, iframe 제거 요청) —
// 216개 매장 정렬 가능한 표 + 클릭 시 오른쪽 슬라이드오버 요약 패널. 로직은 원본
// web/store-list.html·shared.js(renderCard)와 동일하게 포팅.

type SortKey = 'store_label' | 'v2_percentile' | 'classification'
type TierFilter = 'all' | 'danger' | 'caution' | 'safe'

const TIER_FILTERS: { id: TierFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'danger', label: '위험한 편' },
  { id: 'caution', label: '주의가 필요한 편' },
  { id: 'safe', label: '안전한 편' },
]

function riskValue(row: RankingRow): number | null {
  return row.v2_percentile != null ? row.v2_percentile : row.v1_percentile
}

function AdminStoreRiskList() {
  const [rows, setRows] = useState<RankingRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('v2_percentile')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<RankingRow | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setRows(null)

    fetch('/risk-api/rankings', { signal: controller.signal })
      .then(async (resp) => {
        if (!resp.ok) throw new Error('load failed')
        return resp.json() as Promise<RankingRow[]>
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : '불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [requestVersion])

  const visibleRows = useMemo(() => {
    if (!rows) return []
    const q = query.trim()
    const filtered = rows.filter((r) => {
      if ((r as { error?: string }).error) return false
      if (q && !r.store_label.includes(q) && !(r.sigungu || '').includes(q)) return false
      if (tierFilter !== 'all' && riskTierFromPercentile(riskValue(r)).tier !== tierFilter) return false
      return true
    })
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortKey === 'v2_percentile') {
        av = riskValue(a) ?? -1
        bv = riskValue(b) ?? -1
      } else {
        av = a[sortKey]
        bv = b[sortKey]
      }
      if (typeof av === 'string') return av.localeCompare(bv as string) * dir
      return (av - (bv as number)) * dir
    })
  }, [rows, query, tierFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'store_label' || key === 'classification' ? 'asc' : 'desc')
    }
  }

  if (!rows) {
    return (
      <ApiDataState
        loading={loading}
        error={error}
        retry={() => setRequestVersion((v) => v + 1)}
      />
    )
  }

  return (
    <div className="admin-store-risk-page">
      <header className="page-heading">
        <div>
          <h1>전체 매장 목록</h1>
          <p>열 제목을 클릭하면 정렬됩니다. 매장을 클릭하면 오른쪽에 요약 패널이 열립니다.</p>
        </div>
      </header>

      <div className="risk-list-toolbar">
        <input
          type="search"
          className="risk-list-search"
          placeholder="매장명 또는 구 이름으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="risk-list-tier-filter">
          {TIER_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`renewal-filter-chip ${tierFilter === f.id ? 'active' : ''}`}
              onClick={() => setTierFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="risk-list-count">{visibleRows.length}건</p>

      <div className="panel risk-list-table-wrap">
        <table className="data-table selectable risk-list-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('store_label')}>매장 {sortKey === 'store_label' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="th-num" onClick={() => toggleSort('v2_percentile')}>입지 위험(백분위) {sortKey === 'v2_percentile' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => toggleSort('classification')}>종합 판정 {sortKey === 'classification' && (sortDir === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr><td colSpan={3} className="risk-list-empty">표시할 매장이 없습니다.</td></tr>
            ) : (
              visibleRows.map((row, i) => (
                // store_label(주소)이 유일 식별자 역할을 하는데, 실제 216개 매장 중 4곳은
                // 주소가 중복돼(같은 건물에 다른 매장 등) key 충돌로 React가 클릭 대상을
                // 잘못 연결하는 문제가 있었다(2026-08-10) — 인덱스를 더해 항상 유일하게.
                <tr key={`${row.store_label}-${i}`} onClick={() => setSelected(row)}>
                  <td><strong>{row.store_label}</strong></td>
                  <td className="cell-num">{row.v2_percentile != null ? row.v2_percentile.toFixed(1) : '-'}</td>
                  <td><span className={`risk-tag ${riskTagClass(badgeTier(row.classification))}`}>{shortBadgeLabel(row.classification)}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && <DetailPanel row={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function DetailPanel({ row, onClose }: { row: RankingRow; onClose: () => void }) {
  const v1 = pctLabel(row.v1_percentile)
  const v2 = pctLabel(row.v2_percentile)
  const tier = badgeTier(row.classification)

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <aside className="store-detail risk-list-panel" aria-label="매장 요약">
        <button type="button" className="detail-close" onClick={onClose} aria-label="닫기">×</button>
        <h2>{row.store_label}</h2>

        <div className="risk-list-panel-section">
          <div className="risk-list-panel-label">해석</div>
          <span className={`risk-tag ${riskTagClass(tier)}`}>{row.classification}</span>
        </div>

        <div className="risk-list-panel-section">
          <div className="risk-list-panel-label">원자료 (통계 수치)</div>
          <p className="risk-list-scale-hint">막대가 길수록 위험 — 같은 조건의 매장들과 비교한 백분위(0 안전 ~ 100 위험).</p>

          <div className="risk-list-stat-row">
            <div className="risk-list-stat-top">
              <span>업종 평균 대비</span>
              <b>{v1.text}</b>
            </div>
            <span className="risk-list-stat-track"><span className={`risk-list-stat-fill ${v1.tier}`} style={{ width: `${v1.width}%` }} /></span>
          </div>

          <div className="risk-list-stat-row">
            <div className="risk-list-stat-top">
              <span>입지(서울 매장만)</span>
              <b className={v2.na ? 'muted' : ''}>{v2.text}</b>
            </div>
            <span className="risk-list-stat-track"><span className={`risk-list-stat-fill ${v2.tier}`} style={{ width: `${v2.width}%` }} /></span>
          </div>
        </div>

        {row.v2_top_factor && (
          <div className="risk-list-top-factor" title={row.v2_top_factor.evidence}>
            가장 큰 영향 요인: {row.v2_top_factor.category}
          </div>
        )}

        {row.v2_percentile == null && (
          <p className="risk-list-panel-footnote">[비고] 서울 밖 주소 또는 주소 미입력 — 입지 위험도는 서울 매장 데이터 기준으로만 산출됩니다.</p>
        )}

        <a
          className="outline-button risk-list-panel-link"
          href={`/risk-tool/store-detail.html?address=${encodeURIComponent(row.store_label)}`}
          target="_blank"
          rel="noopener"
        >
          전체 상세·상담자료 보기 →
        </a>
      </aside>
    </>
  )
}

export default AdminStoreRiskList
