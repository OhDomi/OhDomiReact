import { useEffect, useMemo, useRef, useState } from 'react'
import ApiDataState from '../../api/ApiDataState'
import { badgeTier, dummyContractExpiryDays, riskTagClass, topClauseFactor, type BadgeTier, type RankingRow, type TopFactor } from '../riskTool/riskToolShared'
import './AdminRenewalCheck.css'

// closure-risk-model(src/api.py, /risk-api로 프록시)의 dashboard.html을 React로 재구현
// (2026-08-10, iframe 제거 요청) — 로직은 원본 정적 페이지(web/dashboard.html·shared.js)와
// 동일하게 포팅했다: 계약 만료일은 아직 실제 데이터가 없어 매장 주소 기반 결정적 해시로
// 고정한 더미 값(실제 계약서상 날짜 아님, dummyContractExpiryDays와 동일 알고리즘).

const COORDINATION_DEADLINE_DAYS = 90
const COORDINATION_WINDOW_DAYS = 200

type UrgencyTier = 'urgent' | 'soon' | 'ok' | 'none'

interface PriorityRow extends RankingRow {
  address: string
  days: number | null
  tier: UrgencyTier
  badgeTier: BadgeTier
  isHighRisk: boolean
}

function daysUntilExpiry(contractExpiry: string | null): number | null {
  if (!contractExpiry) return null
  const [ey, em, ed] = contractExpiry.split('-').map(Number)
  const now = new Date()
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const expiryUTC = Date.UTC(ey, em - 1, ed)
  return Math.round((expiryUTC - todayUTC) / 86400000)
}

function urgencyTier(days: number | null): UrgencyTier {
  if (days == null) return 'none'
  if (days <= COORDINATION_DEADLINE_DAYS) return 'urgent'
  if (days <= COORDINATION_WINDOW_DAYS) return 'soon'
  return 'ok'
}

function ddayLabel(days: number | null): { tier: UrgencyTier; text: string; sub: string } {
  const tier = urgencyTier(days)
  if (tier === 'none') return { tier, text: '계약일자 미상', sub: '' }
  const text = days !== null && days <= 0 ? '만료 경과' : `D-${days}`
  const sub = tier === 'urgent' ? '(통지 마감 임박·경과)' : tier === 'soon' ? '(조율 가능)' : ''
  return { tier, text, sub }
}

const FILTERS: { id: 'all' | UrgencyTier | 'highRisk'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'urgent', label: '마감 임박·경과' },
  { id: 'soon', label: '조율 가능' },
  { id: 'highRisk', label: '고위험만' },
]

function AdminRenewalCheck({ onOpenDetail }: { onOpenDetail: (address: string) => void }) {
  const [rows, setRows] = useState<PriorityRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const [filter, setFilter] = useState<'all' | UrgencyTier | 'highRisk'>('all')
  const [topFactors, setTopFactors] = useState<Record<string, TopFactor | 'loading' | 'error'>>({})

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setRows(null)

    fetch('/risk-api/rankings', { signal: controller.signal })
      .then(async (resp) => {
        if (!resp.ok) throw new Error(await resp.text())
        return resp.json() as Promise<RankingRow[]>
      })
      .then((rankings) => {
        const processed = rankings.map((r) => {
          const contractExpiry = dummyContractExpiryDays(r.store_label)
          const days = daysUntilExpiry(contractExpiry)
          return {
            ...r,
            address: r.store_label,
            days,
            tier: urgencyTier(days),
            badgeTier: badgeTier(r.classification),
            isHighRisk: badgeTier(r.classification) === 'danger',
          }
        })
        processed.sort((a, b) => {
          const rank: Record<UrgencyTier, number> = { urgent: 0, soon: 1, ok: 2, none: 3 }
          if (rank[a.tier] !== rank[b.tier]) return rank[a.tier] - rank[b.tier]
          if (a.days == null || b.days == null) return 0
          return a.days - b.days
        })
        setRows(processed)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : '불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [requestVersion])

  const filteredRows = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => {
      if (filter === 'all') return true
      if (filter === 'highRisk') return r.isHighRisk
      return r.tier === filter
    })
  }, [rows, filter])

  // 216개 매장을 한꺼번에 fetch하면(각 건이 SHAP 계산 포함 수 초) 로컬 개발 서버가 동시
  // 요청 폭주로 멈춘다는 게 이미 원본 페이지에서 확인된 문제 — 한 번에 하나씩 순서대로
  // 호출(원본 loadTopFactorsSequentially와 동일 원칙). 필터가 바뀌면 이전 실행은
  // requestId 불일치로 조용히 중단.
  const requestIdRef = useRef(0)
  useEffect(() => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current
    let cancelled = false

    async function run() {
      for (const row of filteredRows) {
        if (cancelled || requestId !== requestIdRef.current) return
        if (!row.address || topFactors[row.store_label]) continue
        setTopFactors((prev) => ({ ...prev, [row.store_label]: 'loading' }))
        try {
          const resp = await fetch('/risk-api/store-packet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: row.address, kind: 'renewal' }),
          })
          if (cancelled || requestId !== requestIdRef.current) return
          if (!resp.ok) throw new Error('failed')
          const body = await resp.json()
          const axisLabel = row.v2_percentile != null ? '입지 기준, 서울 매장' : '업종 기준, 전국'
          const factor = topClauseFactor(body.internal_md || '', axisLabel)
          setTopFactors((prev) => ({ ...prev, [row.store_label]: factor ?? 'error' }))
        } catch {
          if (!cancelled && requestId === requestIdRef.current) {
            setTopFactors((prev) => ({ ...prev, [row.store_label]: 'error' }))
          }
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRows])

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
    <div className="admin-renewal-page">
      <header className="page-heading">
        <div>
          <h1>재계약 대상 점검</h1>
          <p>긴급도(재계약 시한) + 위험도를 하나의 목록으로 합쳐 우선순위 순으로 보여줍니다. 아래 필터로 원하는 범위만 좁혀볼 수 있습니다.</p>
        </div>
      </header>

      <div className="renewal-filter-bar">
        {FILTERS.map((f) => {
          const count = f.id === 'all'
            ? rows.length
            : f.id === 'highRisk'
              ? rows.filter((r) => r.isHighRisk).length
              : rows.filter((r) => r.tier === f.id).length
          return (
            <button
              key={f.id}
              type="button"
              className={`renewal-filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}<span>{count}</span>
            </button>
          )
        })}
      </div>

      {filteredRows.length === 0 ? (
        <div className="panel renewal-empty">이 필터에 해당하는 매장이 없습니다.</div>
      ) : (
        <div className="renewal-priority-list">
          {filteredRows.map((row, i) => {
            const dday = ddayLabel(row.days)
            const factor = topFactors[row.store_label]
            return (
              // store_label(주소) 중복 4건 때문에 key 충돌 나던 것과 동일 문제 —
              // AdminStoreRiskList와 같은 방식으로 인덱스를 더해 유일하게(2026-08-10).
              <article key={`${row.store_label}-${i}`} className="panel renewal-priority-row">
                <div className="renewal-priority-head">
                  <div>
                    <div className="renewal-priority-store">{row.store_label}</div>
                  </div>
                  <div className="renewal-priority-badges">
                    <span className={`renewal-dday-badge ${dday.tier}`}>{dday.text} {dday.sub}</span>
                    <span className={`risk-tag ${riskTagClass(row.badgeTier)}`}>
                      {row.classification.split(' — ')[0]}
                    </span>
                  </div>
                </div>
                <div className="renewal-priority-reason">
                  <div className="renewal-priority-reason-label">가장 큰 영향 요인</div>
                  {factor === 'loading' || factor === undefined ? (
                    <p className="muted">확인 중…</p>
                  ) : factor === 'error' ? (
                    <p className="muted">영향 요인을 불러오지 못했습니다.</p>
                  ) : (
                    <p><strong>{factor.category}</strong> — {factor.evidence}<br />권장 조치: {factor.action}</p>
                  )}
                </div>
                <div className="renewal-priority-actions">
                  <button type="button" className="outline-button" onClick={() => onOpenDetail(row.address)}>
                    매장 상세·상담자료 보기
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <p className="renewal-hint">위험도는 전체 매장 목록과 같은 사전 계산 값을 씁니다. 계약 만료일은 아직 실제 데이터가 없어 매장별로 고정된 더미 값(가상의 날짜)을 붙였습니다 — 실제 계약일자 연동 전까지의 데모용 표시입니다.</p>
    </div>
  )
}

export default AdminRenewalCheck
