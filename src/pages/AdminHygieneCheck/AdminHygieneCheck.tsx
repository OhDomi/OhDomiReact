import { useEffect, useState } from 'react'
import './AdminHygieneCheck.css'
import type {
  adminHygieneSummary,
  hygieneActions,
  hygieneStoreList,
  hygieneTrend,
  reviewQueue,
} from './adminHygieneDummy'
import { useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'

type AdminHygieneData = {
  adminHygieneSummary: typeof adminHygieneSummary
  hygieneActions: typeof hygieneActions
  hygieneStoreList: typeof hygieneStoreList
  hygieneTrend: typeof hygieneTrend
  reviewQueue: typeof reviewQueue
}
type HygieneStore = (typeof hygieneStoreList)[number]

function AdminHygieneCheck() {
  const api = useApiData<AdminHygieneData>('/api/ui/admin/hygiene')
  const [selectedStore, setSelectedStore] = useState<HygieneStore | null>(null)

  useEffect(() => {
    if (api.data?.hygieneStoreList.length) setSelectedStore(api.data.hygieneStoreList[0])
  }, [api.data])

  if (!api.data || !selectedStore) {
    return <ApiDataState loading={api.loading || !selectedStore} error={api.error} retry={api.retry} />
  }
  const { hygieneActions, hygieneStoreList, hygieneTrend, reviewQueue } = api.data

  return (
    <div className="admin-hygiene-page">
      <header className="page-heading">
        <div>
          <span className="kicker">AI QUALITY INSPECTION</span>
          <h1>위생 점검</h1>
          <p>가맹점별 AI 위생 점검 결과와 본사 조치 필요 항목을 확인하세요.</p>
        </div>

        <button className="select-button" type="button">
          최근 7일
        </button>
      </header>

      <article className="panel admin-hygiene-wide" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">ACTION REQUIRED</span>
            <h2>본사 조치 필요 항목</h2>
          </div>
        </div>

        <div className="hygiene-action-list">
          {hygieneActions.map((item) => (
            <div className="hygiene-action-card" key={item.action + item.store}>
              <span className={`action-priority ${item.priority === '긴급' ? 'danger' : 'warning'}`}>
                {item.priority}
              </span>

              <div>
                <strong>{item.store} · {item.action}</strong>
                <p>{item.description}</p>
              </div>

              <button className="detail-button" type="button">
                처리
              </button>
            </div>
          ))}
        </div>
      </article>

      <section className="admin-hygiene-layout">
        <article className="panel admin-hygiene-table-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE INSPECTIONS</span>
              <h2>매장별 점검 현황</h2>
            </div>

            <div className="admin-hygiene-filter">
              <button className="select-button" type="button">전체 상태</button>
              <button className="select-button" type="button">전체 지역</button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table selectable">
              <thead>
                <tr>
                  <th>가맹점</th>
                  <th>지역</th>
                  <th>점검 항목</th>
                  <th>위생 점수</th>
                  <th>상태</th>
                  <th>최근 점검</th>
                </tr>
              </thead>

              <tbody>
                {hygieneStoreList.map((store) => (
                  <tr
                    key={store.name}
                    className={selectedStore.name === store.name ? 'selected' : ''}
                    onClick={() => setSelectedStore(store)}
                  >
                    <td>
                      <span className="store-avatar">{store.name[0]}</span>
                      <strong>{store.name}</strong>
                    </td>
                    <td>{store.region}</td>
                    <td>{store.category}</td>
                    <td>
                      <b>{store.score}</b>점
                    </td>
                    <td>
                      <span className={`hygiene-state ${getStatusClass(store.status)}`}>
                        {store.status}
                      </span>
                    </td>
                    <td>{store.lastCheckedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel hygiene-detail-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">SELECTED STORE</span>
              <h2>{selectedStore.name}</h2>
            </div>

            <span className={`hygiene-state ${getStatusClass(selectedStore.status)}`}>
              {selectedStore.status}
            </span>
          </div>

          <div className="hygiene-detail-score">
            <div className="hygiene-score-ring">
              <strong>{selectedStore.score}</strong>
              <span>/ 100</span>
            </div>

            <div>
              <strong>{selectedStore.issue}</strong>
              <p>
                {selectedStore.owner} 점주 · {selectedStore.region}
              </p>
            </div>
          </div>

          <dl className="hygiene-detail-list">
            <div>
              <dt>점검 항목</dt>
              <dd>{selectedStore.category}</dd>
            </div>
            <div>
              <dt>업로드 사진</dt>
              <dd>{selectedStore.imageCount}장</dd>
            </div>
            <div>
              <dt>분석 담당</dt>
              <dd>{selectedStore.reviewer}</dd>
            </div>
            <div>
              <dt>최근 점검</dt>
              <dd>{selectedStore.lastCheckedAt}</dd>
            </div>
          </dl>

          <div className="hygiene-detail-actions">
            <button className="outline-button" type="button">
              점주에게 안내
            </button>
            <button className="primary-action" type="button">
              재점검 요청
            </button>
          </div>
        </aside>

        <article className="panel admin-hygiene-wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">PHOTO REVIEW QUEUE</span>
              <h2>점검 사진 검토 대기</h2>
            </div>

            <button className="select-button" type="button">
              긴급순
            </button>
          </div>

          <div className="review-queue-grid">
            {reviewQueue.map((item, index) => (
              <div className="review-card" key={item.title}>
                <div className={`review-photo photo-${index + 1}`}>
                  <span>{item.title}</span>
                </div>

                <div className="review-card-body">
                  <div>
                    <strong>{item.store}</strong>
                    <span className={item.status === '긴급 검토' ? 'urgent-text' : ''}>
                      {item.status}
                    </span>
                  </div>

                  <p>{item.result}</p>
                  <small>{item.uploadedAt}</small>

                  <button className="outline-button" type="button">
                    사진 검토하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel admin-hygiene-wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">SCORE TREND</span>
              <h2>전체 위생 점수 추이</h2>
            </div>
          </div>

          <div className="hygiene-trend-chart">
            {hygieneTrend.map((item) => (
              <div className="trend-column" key={item.label}>
                <div className="trend-bar-wrap">
                  <div
                    className="trend-bar"
                    style={{ height: `${Math.min(item.score, 100)}%` }}
                  >
                    <span>{item.score}</span>
                  </div>
                </div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === '긴급') return 'danger'
  if (status === '주의') return 'warning'
  return 'safe'
}

export default AdminHygieneCheck