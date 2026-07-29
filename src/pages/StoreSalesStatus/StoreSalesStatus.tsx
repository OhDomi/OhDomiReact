import './StoreSalesStatus.css'
import type {
  aiInsights,
  channelSales,
  hourlySales,
  menuRanking,
  salesSummary,
} from './storeSalesStatusDummy'
import { useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'

type SalesData = {
  aiInsights: typeof aiInsights
  channelSales: typeof channelSales
  hourlySales: typeof hourlySales
  menuRanking: typeof menuRanking
  salesSummary: typeof salesSummary
}

function StoreSalesStatus({ storeId }: { storeId: number }) {
  const api = useApiData<SalesData>(`/api/ui/stores/${storeId}/sales`)
  if (!api.data) return <ApiDataState loading={api.loading} error={api.error} retry={api.retry} />
  const { aiInsights, channelSales, hourlySales, menuRanking, salesSummary } = api.data

  return (
    <div className="store-sales-status">
      <header className="page-heading">
        <div>
          <span className="kicker">SALES ANALYTICS</span>
          <h1>매출 현황</h1>
          <p>오늘 매출, 시간대별 흐름, 메뉴별 판매 순위와 AI 인사이트를 확인하세요.</p>
        </div>

        <button className="select-button" type="button">
          2026년 7월 21일
        </button>
      </header>

      <section className="sales-status-summary">
        <article className="metric-card">
          <div className="sales-metric-icon">₩</div>
          <div>
            <span>오늘 매출</span>
            <strong>{salesSummary.todaySales}</strong>
            <small>어제보다 +7.4%</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="sales-metric-icon purple">#</div>
          <div>
            <span>오늘 주문</span>
            <strong>{salesSummary.todayOrders}건</strong>
            <small>어제보다 +12건</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="sales-metric-icon green">◎</div>
          <div>
            <span>평균 객단가</span>
            <strong>{salesSummary.averageOrderPrice}</strong>
            <small>전주보다 +1.2%</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="sales-metric-icon orange">%</div>
          <div>
            <span>월 목표 달성률</span>
            <strong>{salesSummary.targetRate}%</strong>
            <small>{salesSummary.monthlySales} / {salesSummary.monthlyTarget}</small>
          </div>
        </article>
      </section>

      <section className="sales-status-layout">
        <article className="panel sales-chart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">HOURLY SALES</span>
              <h2>시간대별 매출 흐름</h2>
            </div>

            <button className="select-button" type="button">
              오늘
            </button>
          </div>

          <div className="hourly-chart">
            {(() => {
              const maxSales = Math.max(...hourlySales.map((s) => s.sales), 1)
              return hourlySales.map((item) => (
                <div className="hourly-column" key={item.time}>
                  <div className="hourly-bar-wrap">
                    <div
                      className="hourly-bar"
                      style={{ height: `${(item.sales / maxSales) * 100}%` }}
                    >
                      {item.sales >= maxSales * 0.8 && <span>{item.sales}만</span>}
                    </div>
                  </div>
                  <small>{item.time}</small>
                </div>
              ))
            })()}
          </div>
        </article>

        <article className="panel target-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">MONTHLY TARGET</span>
              <h2>월 매출 목표</h2>
            </div>
          </div>

          <div className="target-box">
            <div className="target-ring">
              <strong>{salesSummary.targetRate}%</strong>
              <span>달성</span>
            </div>

            <div className="target-info">
              <span>이번 달 누적 매출</span>
              <strong>{salesSummary.monthlySales}</strong>
              <p>목표까지 약 ₩6,480,000 남았습니다.</p>
            </div>
          </div>

          <div className="target-progress">
            <div style={{ width: `${salesSummary.targetRate}%` }}></div>
          </div>
        </article>

        <article className="panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">MENU RANKING</span>
              <h2>메뉴별 판매 순위</h2>
            </div>

            <button className="select-button" type="button">
              매출순
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>메뉴명</th>
                  <th>카테고리</th>
                  <th>주문 수</th>
                  <th>매출</th>
                  <th>변동률</th>
                </tr>
              </thead>

              <tbody>
                {menuRanking.map((menu) => (
                  <tr key={menu.name}>
                    <td>
                      <span className="rank-badge">{menu.rank}</span>
                    </td>
                    <td>
                      <strong>{menu.name}</strong>
                    </td>
                    <td>{menu.category}</td>
                    <td>{menu.orders}건</td>
                    <td>{menu.sales}</td>
                    <td>
                      <span className={menu.change.startsWith('+') ? 'up-text' : 'down-text'}>
                        {menu.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel channel-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">SALES CHANNEL</span>
              <h2>주문 채널별 매출</h2>
            </div>
          </div>

          <div className="channel-list">
            {channelSales.map((item) => (
              <div className="channel-item" key={item.channel}>
                <div>
                  <strong>{item.channel}</strong>
                  <span>{item.sales}</span>
                </div>

                <div className="channel-progress">
                  <div style={{ width: `${item.rate}%` }}></div>
                </div>

                <b>{item.rate}%</b>
              </div>
            ))}
          </div>
        </article>

        <article className="panel insight-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI INSIGHTS</span>
              <h2>AI 매출 인사이트</h2>
            </div>
          </div>

          <div className="sales-insight-list">
            {aiInsights.map((insight) => (
              <div className="sales-insight-card" key={insight.title}>
                <span className={`insight-dot ${insight.type}`}></span>

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

export default StoreSalesStatus
