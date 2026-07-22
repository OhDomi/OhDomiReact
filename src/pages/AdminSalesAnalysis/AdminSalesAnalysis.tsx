import { useState } from 'react'
import './AdminSalesAnalysis.css'
import {
  adminSalesInsights,
  adminSalesSummary,
  monthlySalesTrend,
  regionSales,
  storeSalesRanking,
  weakStores,
} from './adminSalesDummy'

function AdminSalesAnalysis() {
  const [selectedStore, setSelectedStore] = useState(storeSalesRanking[0])

  return (
    <div className="admin-sales-page">
      <header className="page-heading">
        <div>
          <span className="kicker">SALES ANALYTICS</span>
          <h1>매출 분석</h1>
          <p>전체 가맹점의 매출 흐름, 지역별 성과, 부진 매장과 AI 인사이트를 확인하세요.</p>
        </div>

        <button className="select-button" type="button">
          2026년 7월
        </button>
      </header>

      <section className="admin-sales-summary">
        <article className="metric-card">
          <div className="admin-sales-icon">₩</div>
          <div>
            <span>오늘 통합 매출</span>
            <strong>{adminSalesSummary.todayTotalSales}</strong>
            <small>{adminSalesSummary.growthRate} 지난주 대비</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="admin-sales-icon purple">M</div>
          <div>
            <span>월 누적 매출</span>
            <strong>{adminSalesSummary.monthlyTotalSales}</strong>
            <small>목표 달성률 {adminSalesSummary.targetRate}%</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="admin-sales-icon green">#</div>
          <div>
            <span>총 주문 수</span>
            <strong>{adminSalesSummary.totalOrders}</strong>
            <small>전체 가맹점 합산</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="admin-sales-icon orange">◎</div>
          <div>
            <span>평균 객단가</span>
            <strong>{adminSalesSummary.averageOrderPrice}</strong>
            <small>전월 대비 +1.2%</small>
          </div>
        </article>
      </section>

      <section className="admin-sales-layout">
        <article className="panel admin-sales-trend-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">MONTHLY TREND</span>
              <h2>월별 통합 매출 추이</h2>
            </div>

            <button className="select-button" type="button">
              최근 7개월
            </button>
          </div>

          <div className="admin-sales-chart">
            {monthlySalesTrend.map((item) => (
              <div className="admin-sales-column" key={item.month}>
                <div className="admin-sales-bar-wrap">
                  <div
                    className="admin-sales-bar"
                    style={{ height: `${item.sales}%` }}
                  >
                    <span>{item.sales}</span>
                  </div>
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </article>

        <aside className="panel selected-sales-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">SELECTED STORE</span>
              <h2>{selectedStore.store}</h2>
            </div>

            <span className={`sales-status ${getStatusClass(selectedStore.status)}`}>
              {selectedStore.status}
            </span>
          </div>

          <div className="selected-sales-profile">
            <div className="selected-sales-rank">
              {selectedStore.rank}
            </div>

            <div>
              <strong>{selectedStore.owner} 점주</strong>
              <p>{selectedStore.region}</p>
              <span>월 매출 {selectedStore.sales}</span>
            </div>
          </div>

          <dl className="selected-sales-info">
            <div>
              <dt>월 매출</dt>
              <dd>{selectedStore.sales}</dd>
            </div>
            <div>
              <dt>주문 수</dt>
              <dd>{selectedStore.orders}</dd>
            </div>
            <div>
              <dt>성장률</dt>
              <dd className={selectedStore.growth.startsWith('-') ? 'sales-down' : 'sales-up'}>
                {selectedStore.growth}
              </dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{selectedStore.status}</dd>
            </div>
          </dl>

          <div className="selected-sales-actions">
            <button className="outline-button" type="button">
              점주 연락
            </button>
            <button className="primary-action" type="button">
              리포트 보기
            </button>
          </div>
        </aside>

        <article className="panel admin-sales-wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">REGION SALES</span>
              <h2>지역별 매출 비교</h2>
            </div>
          </div>

          <div className="region-sales-grid">
            {regionSales.map((item) => (
              <div className="region-sales-card" key={item.region}>
                <div className="region-sales-top">
                  <div>
                    <strong>{item.region}</strong>
                    <span>{item.stores}개 매장</span>
                  </div>

                  <b>{item.sales}</b>
                </div>

                <div className="region-sales-progress">
                  <div style={{ width: `${item.rate}%` }}></div>
                </div>

                <p>
                  성장률 <strong>{item.growth}</strong>
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel admin-sales-wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE RANKING</span>
              <h2>가맹점 매출 순위</h2>
            </div>

            <button className="select-button" type="button">
              매출순
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table selectable">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>가맹점</th>
                  <th>지역</th>
                  <th>월 매출</th>
                  <th>주문 수</th>
                  <th>성장률</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {storeSalesRanking.map((store) => (
                  <tr
                    key={store.store}
                    className={selectedStore.store === store.store ? 'selected' : ''}
                    onClick={() => setSelectedStore(store)}
                  >
                    <td>
                      <span className="sales-rank-badge">{store.rank}</span>
                    </td>
                    <td>
                      <strong>{store.store}</strong>
                    </td>
                    <td>{store.region}</td>
                    <td>{store.sales}</td>
                    <td>{store.orders}</td>
                    <td>
                      <span className={store.growth.startsWith('-') ? 'sales-down' : 'sales-up'}>
                        {store.growth}
                      </span>
                    </td>
                    <td>
                      <span className={`sales-status ${getStatusClass(store.status)}`}>
                        {store.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel weak-store-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">WEAK STORES</span>
              <h2>부진 매장 리스트</h2>
            </div>
          </div>

          <div className="weak-store-list">
            {weakStores.map((item) => (
              <div className="weak-store-card" key={item.store}>
                <span className={`weak-priority ${item.priority === '긴급' ? 'danger' : 'warning'}`}>
                  {item.priority}
                </span>

                <div>
                  <strong>{item.store} · {item.issue}</strong>
                  <p>{item.description}</p>
                </div>

                <button className="detail-button" type="button">
                  분석
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel sales-insight-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI INSIGHTS</span>
              <h2>AI 매출 인사이트</h2>
            </div>
          </div>

          <div className="admin-sales-insight-list">
            {adminSalesInsights.map((insight) => (
              <div className="admin-sales-insight-card" key={insight.title}>
                <span className={`admin-sales-insight-dot ${insight.type}`}></span>

                <div>
                  <strong>{insight.title}</strong>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === '위험') return 'danger'
  if (status === '주의') return 'warning'
  if (status === '상승') return 'up'
  return 'safe'
}

export default AdminSalesAnalysis