import { useEffect, useState } from 'react'
import './AdminRiskPrediction.css'
import type {
  aiRecommendations,
  riskFactors,
  riskStores,
  riskSummary,
  riskTrend,
} from './adminRiskDummy'
import { useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'

type RiskData = {
  aiRecommendations: typeof aiRecommendations
  riskFactors: typeof riskFactors
  riskStores: typeof riskStores
  riskSummary: typeof riskSummary
  riskTrend: typeof riskTrend
}
type RiskStore = (typeof riskStores)[number]

function AdminRiskPrediction() {
  const api = useApiData<RiskData>('/api/ui/admin/risks')
  const [selectedStore, setSelectedStore] = useState<RiskStore | null>(null)

  useEffect(() => {
    if (api.data?.riskStores.length) setSelectedStore(api.data.riskStores[0])
  }, [api.data])

  if (!api.data || !selectedStore) {
    return <ApiDataState loading={api.loading || !selectedStore} error={api.error} retry={api.retry} />
  }
  const { aiRecommendations, riskFactors, riskStores, riskTrend } = api.data

  return (
    <div className="admin-risk-page">
      <header className="page-heading">
        <div>
          <span className="kicker">AI RISK PREDICTION</span>
          <h1>리스크 예측</h1>
          <p>매출, 위생, 발주, 고객 문의 데이터를 기반으로 가맹점 운영 리스크를 예측합니다.</p>
        </div>

        <button className="select-button" type="button">
          최근 14일
        </button>
      </header>

      <section className="admin-risk-layout">
        <article className="panel ai-risk-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI ACTION RECOMMENDATION</span>
              <h2>AI 조치 추천</h2>
            </div>
          </div>

          <div className="ai-risk-list">
            {aiRecommendations.map((item) => (
              <div className="ai-risk-card" key={item.title}>
                <span className={`ai-risk-priority ${item.priority === '긴급' ? 'danger' : 'warning'}`}>
                  {item.priority}
                </span>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <button className="detail-button" type="button">
                  실행
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel risk-factors-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">RISK FACTORS</span>
              <h2>리스크 요인 분석</h2>
            </div>
          </div>

          <div className="risk-factor-grid">
            {riskFactors.map((item) => (
              <div className="risk-factor-card" key={item.factor}>
                <div className="risk-factor-top">
                  <strong>{item.factor}</strong>
                  <b>{item.weight}%</b>
                </div>

                <div className="risk-factor-progress">
                  <div style={{ width: `${Math.min(item.weight, 100)}%` }}></div>
                </div>

                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel admin-risk-table-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">RISK STORE LIST</span>
              <h2>가맹점 리스크 예측 리스트</h2>
            </div>

            <div className="admin-risk-filter">
              <button className="select-button" type="button">전체 리스크</button>
              <button className="select-button" type="button">전체 지역</button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table selectable">
              <thead>
                <tr>
                  <th>가맹점</th>
                  <th>지역</th>
                  <th>리스크 점수</th>
                  <th>매출 변화</th>
                  <th>위생 점수</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {riskStores.map((store) => (
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
                    <td>
                      <b>{store.riskScore}</b>점
                    </td>
                    <td>
                      <span className={store.salesChange.startsWith('-') ? 'risk-down' : 'risk-up'}>
                        {store.salesChange}
                      </span>
                    </td>
                    <td>{store.hygieneScore}점</td>
                    <td>
                      <span className={`risk-level ${getRiskClass(store.riskLevel)}`}>
                        {store.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel selected-risk-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">SELECTED STORE</span>
              <h2>{selectedStore.name}</h2>
            </div>

            <span className={`risk-level ${getRiskClass(selectedStore.riskLevel)}`}>
              {selectedStore.riskLevel}
            </span>
          </div>

          <div className="selected-risk-score">
            <div className="risk-score-ring">
              <strong>{selectedStore.riskScore}</strong>
              <span>risk</span>
            </div>

            <div>
              <strong>{selectedStore.mainReason}</strong>
              <p>{selectedStore.owner} 점주 · {selectedStore.region}</p>
            </div>
          </div>

          <dl className="selected-risk-info">
            <div>
              <dt>매출 변화</dt>
              <dd className={selectedStore.salesChange.startsWith('-') ? 'risk-down' : 'risk-up'}>
                {selectedStore.salesChange}
              </dd>
            </div>
            <div>
              <dt>위생 점수</dt>
              <dd>{selectedStore.hygieneScore}점</dd>
            </div>
            <div>
              <dt>발주 지연</dt>
              <dd>{selectedStore.orderDelay}</dd>
            </div>
            <div>
              <dt>고객 문의</dt>
              <dd>{selectedStore.complaintCount}건</dd>
            </div>
          </dl>

          <div className="risk-prediction-box">
            <span>AI 예측</span>
            <strong>{selectedStore.prediction}</strong>
            <p>{selectedStore.action}</p>
          </div>

          <div className="selected-risk-actions">
            <button className="outline-button" type="button">
              점주 연락
            </button>
            <button className="primary-action" type="button">
              조치 등록
            </button>
          </div>
        </aside>

        <article className="panel risk-trend-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">RISK TREND</span>
              <h2>주간 리스크 추이</h2>
            </div>
          </div>

          <div className="risk-trend-chart">
            {(() => {
              const maxRisk = Math.max(...riskTrend.map((s) => Math.max(s.high, s.warning)), 1)
              return riskTrend.map((item) => (
                <div className="risk-trend-column" key={item.label}>
                  <div className="risk-trend-bars">
                    <div className="risk-trend-bar danger" style={{ height: `${(item.high / maxRisk) * 100}%` }}>
                      <span>{item.high}</span>
                    </div>
                    <div className="risk-trend-bar warning" style={{ height: `${(item.warning / maxRisk) * 100}%` }}>
                      <span>{item.warning}</span>
                    </div>
                  </div>
                  <small>{item.label}</small>
                </div>
              ))
            })()}
          </div>

          <div className="risk-trend-legend">
            <span><i className="danger"></i>고위험</span>
            <span><i className="warning"></i>주의</span>
          </div>
        </article>
      </section>
    </div>
  )
}

function getRiskClass(risk: string) {
  if (risk === '높음') return 'danger'
  if (risk === '주의') return 'warning'
  return 'safe'
}

export default AdminRiskPrediction