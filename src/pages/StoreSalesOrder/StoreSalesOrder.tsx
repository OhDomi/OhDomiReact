import { useMemo, useState } from 'react'
import './StoreSalesOrder.css'
import {
  aiOrderInsights,
  orderSummary,
  recentOrders,
  recommendedOrders,
} from './storeSalesOrderDummy'

function StoreSalesOrder() {
  const [orderItems, setOrderItems] = useState(recommendedOrders)

  const selectedItems = useMemo(
    () => orderItems.filter((item) => item.recommendedQty !== '0kg'),
    [orderItems],
  )

  function updateQuantity(id: number, value: string) {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, recommendedQty: value } : item,
      ),
    )
  }

  return (
    <div className="store-order-page">
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

      <section className="order-summary-grid">
        <article className="metric-card">
          <div className="order-metric-icon">₩</div>
          <div>
            <span>내일 예상 매출</span>
            <strong>{orderSummary.expectedSales}</strong>
            <small>전일 대비 +7.4%</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="order-metric-icon purple">#</div>
          <div>
            <span>예상 주문 수</span>
            <strong>{orderSummary.expectedOrders}건</strong>
            <small>점심 피크 주문 증가 예상</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="order-metric-icon orange">!</div>
          <div>
            <span>발주 필요 품목</span>
            <strong>{orderSummary.requiredItems}개</strong>
            <small>연어, 포장 용기 확인 필요</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="order-metric-icon green">✓</div>
          <div>
            <span>예상 발주 금액</span>
            <strong>{orderSummary.estimatedAmount}</strong>
            <small>AI 추천 기준</small>
          </div>
        </article>
      </section>

      <section className="order-layout">
        <article className="panel order-recommend-panel">
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
            <table className="data-table order-table">
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
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="order-item-name">
                        <span>{item.item[0]}</span>
                        <div>
                          <strong>{item.item}</strong>
                          <small>{item.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.currentStock}</td>
                    <td>{item.expectedUsage}</td>
                    <td>
                      <input
                        className="order-qty-input"
                        value={item.recommendedQty}
                        onChange={(event) => updateQuantity(item.id, event.target.value)}
                      />
                    </td>
                    <td>{item.amount}</td>
                    <td>
                      <span className={`order-risk ${getRiskClass(item.risk)}`}>
                        {item.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel order-cart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">ORDER SHEET</span>
              <h2>발주서 요약</h2>
            </div>
          </div>

          <div className="order-sheet-box">
            <div className="order-sheet-rate">
              <strong>{orderSummary.autoOrderRate}%</strong>
              <span>AI 추천 반영률</span>
            </div>

            <div className="order-sheet-info">
              <span>선택된 품목</span>
              <strong>{selectedItems.length}개</strong>
              <p>추천 수량을 수정한 뒤 발주 요청을 보낼 수 있습니다.</p>
            </div>
          </div>

          <div className="order-sheet-list">
            {selectedItems.map((item) => (
              <div className="order-sheet-item" key={item.id}>
                <div>
                  <strong>{item.item}</strong>
                  <span>{item.recommendedQty}</span>
                </div>
                <b>{item.amount}</b>
              </div>
            ))}
          </div>

          <div className="order-total-box">
            <span>예상 발주 금액</span>
            <strong>{orderSummary.estimatedAmount}</strong>
          </div>

          <button className="primary-action order-submit-button" type="button">
            발주 요청 보내기
          </button>
        </aside>

        <article className="panel order-reason-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">WHY RECOMMENDED</span>
              <h2>품목별 추천 사유</h2>
            </div>
          </div>

          <div className="order-reason-list">
            {orderItems.slice(0, 4).map((item) => (
              <div className="order-reason-card" key={item.id}>
                <span className={`order-reason-dot ${getRiskClass(item.risk)}`}></span>

                <div>
                  <strong>{item.item}</strong>
                  <p>{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel order-insight-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI INSIGHTS</span>
              <h2>AI 발주 인사이트</h2>
            </div>
          </div>

          <div className="order-insight-list">
            {aiOrderInsights.map((insight) => (
              <div className="order-insight-card" key={insight.title}>
                <span className={`order-insight-dot ${insight.type}`}></span>

                <div>
                  <strong>{insight.title}</strong>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel order-wide-panel">
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
                    <td>
                      <strong>{order.orderNo}</strong>
                    </td>
                    <td>{order.items}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`order-status ${getOrderStatusClass(order.status)}`}>
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

function getRiskClass(risk: string) {
  if (risk === '부족') return 'danger'
  if (risk === '주의') return 'warning'
  return 'safe'
}

function getOrderStatusClass(status: string) {
  if (status === '작성중') return 'draft'
  if (status === '배송중') return 'shipping'
  return 'done'
}

export default StoreSalesOrder