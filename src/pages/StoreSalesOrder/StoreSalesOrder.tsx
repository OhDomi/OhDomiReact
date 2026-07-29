import { useState } from 'react'
import './StoreSalesOrder.css'
import {
  aiOrderInsights,
  orderSummary,
  recentOrders,
  recommendedOrders,
} from './storeSalesOrderDummy'

const reasonTypeMap: Record<string, string> = {
  부족: 'danger',
  주의: 'warning',
  안전: 'positive',
}

function StoreSalesOrder({ storeId: _storeId }: { storeId: number }) {
  const [quantities, setQuantities] = useState<Record<number, string>>(() =>
    recommendedOrders.reduce((acc, item) => ({ ...acc, [item.id]: item.recommendedQty }), {}),
  )

  const selectedOrders = recommendedOrders.filter(
    (item) => quantities[item.id] !== '0kg' && quantities[item.id] !== '0개',
  )

  return (
    <div className="order-page">
      <header className="page-heading">
        <div>
          <span className="kicker">SMART ORDER MANAGEMENT</span>
          <h1>발주 관리</h1>
          <p>AI 추천 발주 품목을 확인하고, 필요한 식자재를 빠르게 발주하세요.</p>
        </div>

        <button className="primary-action" type="button">
          발주서 작성
        </button>
      </header>

      <section className="order-insight-layout">
        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI INSIGHTS</span>
              <h2>AI 발주 인사이트</h2>
            </div>
          </div>

          <div className="order-insight-list">
            {aiOrderInsights.map((insight) => (
              <div className="order-insight-card" key={insight.title}>
                <span className={`insight-dot ${insight.type}`}></span>

                <div>
                  <strong>{insight.title}</strong>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">WHY RECOMMENDED</span>
              <h2>품목별 추천 사유</h2>
            </div>
          </div>

          <div className="order-reason-list">
            {recommendedOrders.map((item) => (
              <div className="order-reason-card" key={item.id}>
                <span className={`reason-dot ${reasonTypeMap[item.risk] ?? 'positive'}`}></span>

                <div>
                  <strong>{item.item}</strong>
                  <p>{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="order-layout">
        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI RECOMMENDATION</span>
              <h2>AI 추천 발주 품목</h2>
            </div>

            <button className="select-button" type="button">
              내일 기준
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>품목</th>
                  <th>현재 재고</th>
                  <th>예상 사용량</th>
                  <th>추천 수량</th>
                  <th>예상 금액</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {recommendedOrders.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="store-avatar">{item.item[0]}</span>
                      <div className="order-item-name">
                        <strong>{item.item}</strong>
                        <small>{item.category}</small>
                      </div>
                    </td>
                    <td>{item.currentStock}</td>
                    <td>{item.expectedUsage}</td>
                    <td>
                      <input
                        className="order-qty-input"
                        value={quantities[item.id]}
                        onChange={(event) =>
                          setQuantities((prev) => ({ ...prev, [item.id]: event.target.value }))
                        }
                      />
                    </td>
                    <td>{item.amount}</td>
                    <td>
                      <span className={`order-status ${getStatusClass(item.risk)}`}>
                        {item.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel order-sheet-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">ORDER SHEET</span>
              <h2>발주서 요약</h2>
            </div>
          </div>

          <div className="order-reflect-box">
            <div className="target-ring">
              <strong>{orderSummary.autoOrderRate}%</strong>
              <span>AI 추천 반영률</span>
            </div>

            <div>
              <strong>선택된 품목</strong>
              <b>{orderSummary.requiredItems}개</b>
              <p>추천 수량을 수정한 뒤 발주 요청을 보낼 수 있습니다.</p>
            </div>
          </div>

          <div className="order-sheet-list">
            {selectedOrders.map((item) => (
              <div className="order-sheet-item" key={item.id}>
                <div>
                  <strong>{item.item}</strong>
                  <small>{quantities[item.id]}</small>
                </div>
                <b>{item.amount}</b>
              </div>
            ))}
          </div>

          <div className="order-total-box">
            <span>예상 발주 금액</span>
            <strong>{orderSummary.estimatedAmount}</strong>
          </div>

          <button className="primary-action full-width" type="button">
            발주 요청 보내기
          </button>
        </aside>

        <article className="panel order-wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">RECENT ORDERS</span>
              <h2>최근 발주 내역</h2>
            </div>

            <button className="select-button" type="button">
              전체 보기
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>발주일</th>
                  <th>발주번호</th>
                  <th>품목</th>
                  <th>금액</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderNo}>
                    <td>{order.date}</td>
                    <td>{order.orderNo}</td>
                    <td>{order.items}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`order-state ${getRecentStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}

function getStatusClass(risk: string) {
  if (risk === '부족') return 'danger'
  if (risk === '주의') return 'warning'
  return 'safe'
}

function getRecentStatusClass(status: string) {
  if (status === '입고완료') return 'safe'
  if (status === '배송중') return 'warning'
  return 'info'
}

export default StoreSalesOrder