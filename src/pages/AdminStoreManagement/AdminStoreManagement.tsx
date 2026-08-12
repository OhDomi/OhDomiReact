import { useEffect, useRef, useState } from 'react'
import './AdminStoreManagement.css'
import type {
  actionRequiredStores,
  adminStoreSummary,
  adminStores,
  regionStats,
} from './adminStoreDummy'
import { useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'

type AdminStoreData = {
  actionRequiredStores: typeof actionRequiredStores
  adminStoreSummary: typeof adminStoreSummary
  adminStores: typeof adminStores
  regionStats: typeof regionStats
}
type AdminStore = (typeof adminStores)[number]

// 2026-08-08: 216개 실매장 임포트 후 목록이 5줄→221줄로 늘어나면서 검색/페이지 없이는
// 원래 데모 5곳을 찾기도 어려워졌다는 리포트 — 검색(이름/지역/점주)과 클라이언트 페이지네이션만
// 추가(전체 데이터는 이미 useApiData로 다 받아와 있어 서버 쪽 변경 없이 처리 가능).
const PAGE_SIZE = 20
const ACTION_PAGE_SIZE = 5

function AdminStoreManagement() {
  const api = useApiData<AdminStoreData>('/api/ui/admin/stores')
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [actionPage, setActionPage] = useState(1)
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set())
  const seededResolved = useRef(false)

  useEffect(() => {
    if (api.data?.adminStores.length) setSelectedStore(api.data.adminStores[0])
  }, [api.data])

  // 처리완료/미처리 구분이 실제로 보이려면 처리완료 표본이 하나는 있어야 확인이 되는데,
  // 이 목록은 항상 "현재 조치가 필요한" 매장만 내려오는 구조라 처리완료 상태가 존재하지
  // 않았음(2026-08-12) — 데모 확인용으로 최초 로드 시 긴급/주의 하나씩만 미리 처리완료로
  // 표시해 두 상태가 한 화면에서 비교되게 함. 클릭으로 다시 미처리로 되돌릴 수 있음.
  useEffect(() => {
    if (seededResolved.current || !api.data?.actionRequiredStores.length) return
    seededResolved.current = true
    const items = api.data.actionRequiredStores
    const seeded = [
      items.find((item) => item.priority === '긴급'),
      items.find((item) => item.priority === '주의'),
    ].filter((item): item is typeof items[number] => Boolean(item))
    if (seeded.length) {
      setResolvedKeys(new Set(seeded.map((item) => `${item.store}-${item.title}`)))
    }
  }, [api.data])

  if (!api.data || !selectedStore) {
    return <ApiDataState loading={api.loading || !selectedStore} error={api.error} retry={api.retry} />
  }
  const { actionRequiredStores, adminStores, regionStats } = api.data

  const q = query.trim()
  const filteredStores = q
    ? adminStores.filter((store) => `${store.name} ${store.region} ${store.owner}`.includes(q))
    : adminStores
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE))
  const pageStores = filteredStores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const actionKey = (item: { store: string; title: string }) => `${item.store}-${item.title}`
  const sortedActionStores = [...actionRequiredStores].sort((a, b) => {
    const aResolved = resolvedKeys.has(actionKey(a))
    const bResolved = resolvedKeys.has(actionKey(b))
    if (aResolved !== bResolved) return aResolved ? 1 : -1
    if (a.priority !== b.priority) return a.priority === '긴급' ? -1 : 1
    return 0
  })
  const totalActionPages = Math.max(1, Math.ceil(sortedActionStores.length / ACTION_PAGE_SIZE))
  const pageActionStores = sortedActionStores.slice(
    (actionPage - 1) * ACTION_PAGE_SIZE,
    actionPage * ACTION_PAGE_SIZE,
  )
  const unresolvedActionCount = actionRequiredStores.length -
    actionRequiredStores.filter((item) => resolvedKeys.has(actionKey(item))).length

  return (
    <div className="admin-store-page">
      <header className="page-heading">
        <div>
          <span className="kicker">FRANCHISE NETWORK</span>
          <h1>가맹점 관리</h1>
          <p>전체 가맹점의 운영 상태, 리스크, 계약 현황과 본사 조치 필요 항목을 확인하세요.</p>
        </div>

        <button className="primary-action" type="button">
          + 가맹점 등록
        </button>
      </header>

      <article className="panel wide-panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">ACTION REQUIRED</span>
            <h2>본사 조치 필요 항목</h2>
          </div>

          <span className="select-button" style={{ cursor: 'default' }}>
            미처리 {unresolvedActionCount}건 · 전체 {actionRequiredStores.length}건
          </span>
        </div>

        <div className="action-store-list">
          {pageActionStores.map((item) => {
            const key = actionKey(item)
            const resolved = resolvedKeys.has(key)
            const tone = resolved ? 'resolved' : item.priority === '긴급' ? 'danger' : 'warning'
            return (
              <div className={`action-store-card ${tone}`} key={key}>
                <span className={`action-priority ${tone}`}>
                  {resolved ? '✓ 처리완료' : `● ${item.priority}`}
                </span>

                <div>
                  <strong>{item.store} · {item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <button
                  className={`action-resolve-button ${resolved ? 'is-resolved' : ''}`}
                  type="button"
                  onClick={() => setResolvedKeys((prev) => {
                    const next = new Set(prev)
                    if (next.has(key)) next.delete(key)
                    else next.add(key)
                    return next
                  })}
                >
                  {resolved ? '✓ 처리됨 · 되돌리기' : '처리'}
                </button>
              </div>
            )
          })}
        </div>

        {totalActionPages > 1 && (
          <div className="admin-store-pager">
            {Array.from({ length: totalActionPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`page-number-button ${actionPage === n ? 'active' : ''}`}
                onClick={() => setActionPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </article>

      <section className="admin-store-layout">
        <article className="panel admin-store-table-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE LIST</span>
              <h2>가맹점 목록</h2>
            </div>

            <div className="admin-store-filter">
              <input
                className="admin-store-search"
                type="search"
                placeholder="가맹점명·지역·점주 검색"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
              />
              <button className="select-button" type="button">전체 지역</button>
              <button className="select-button" type="button">전체 리스크</button>
            </div>
          </div>

          <p className="admin-store-count">
            총 {filteredStores.length}개 매장{q ? ` ("${q}" 검색 결과)` : ''} — {page}/{totalPages}페이지
          </p>

          <div className="table-scroll">
            <table className="data-table selectable">
              <thead>
                <tr>
                  <th>가맹점</th>
                  <th>지역</th>
                  <th>오늘 매출</th>
                  <th>위생 점수</th>
                  <th>리스크</th>
                  <th>계약</th>
                </tr>
              </thead>

              <tbody>
                {pageStores.map((store) => (
                  <tr
                    key={store.name}
                    className={selectedStore.name === store.name ? 'selected' : ''}
                    onClick={() => setSelectedStore(store)}
                  >
                    <td>
                      <span className="store-avatar">{store.name[0]}</span>
                      <strong>{store.name}</strong>
                      {store.source === 'IMPORTED' && <span className="source-badge">임포트</span>}
                    </td>
                    <td>{store.region}</td>
                    <td>{store.sales}</td>
                    <td>
                      <b>{store.hygieneScore}</b>점
                    </td>
                    <td>
                      <span className={`risk-tag ${getRiskClass(store.risk)}`}>
                        {store.risk}
                      </span>
                    </td>
                    <td>{store.contractStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-store-pager">
            <button
              className="outline-button"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              이전
            </button>
            <span>{page} / {totalPages}</span>
            <button
              className="outline-button"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </button>
          </div>
        </article>

        <aside className="panel selected-store-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE DETAIL</span>
              <h2>{selectedStore.name}</h2>
            </div>

            <span className={`risk-tag ${getRiskClass(selectedStore.risk)}`}>
              {selectedStore.risk}
            </span>
          </div>

          <div className="selected-store-profile">
            <div className="selected-store-mark">
              {selectedStore.name[0]}
            </div>

            <div>
              <strong>{selectedStore.owner} 점주</strong>
              <p>{selectedStore.address}</p>
              <span>{selectedStore.phone}</span>
            </div>
          </div>

          <dl className="selected-store-info">
            <div>
              <dt>오늘 매출</dt>
              <dd>{selectedStore.sales}</dd>
            </div>
            <div>
              <dt>월 누적 매출</dt>
              <dd>{selectedStore.monthlySales}</dd>
            </div>
            <div>
              <dt>위생 점수</dt>
              <dd>{selectedStore.hygieneScore}점</dd>
            </div>
            <div>
              <dt>최근 점검</dt>
              <dd>{selectedStore.lastInspection}</dd>
            </div>
          </dl>

          <div className="selected-store-issue">
            <span>최근 특이사항</span>
            <strong>{selectedStore.issue}</strong>
          </div>

          <div className="selected-store-actions">
            <button className="outline-button" type="button">
              점주에게 연락
            </button>
            <button className="primary-action" type="button">
              리포트 보기
            </button>
          </div>
        </aside>

        <article className="panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">REGION STATUS</span>
              <h2>지역별 가맹점 현황</h2>
            </div>
          </div>

          <div className="region-status-grid">
            {regionStats.map((item) => (
              <div className="region-status-card" key={item.region}>
                <div>
                  <strong>{item.region}</strong>
                  <span>{item.stores}개 매장</span>
                </div>

                <div className="region-progress">
                  <div style={{ width: `${Math.min(item.stores, 100)}%` }}></div>
                </div>

                <p>위험 매장 {item.risk}개</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function getRiskClass(risk: string) {
  if (risk === '높음') return 'high'
  if (risk === '보통') return 'medium'
  return 'low'
}

export default AdminStoreManagement