import { orderRecommendations } from '../data/storeSalesDummy'

function OrderPredictionPage() {
  return (
    <section className="sales-panel full-panel">
      <h2>AI 발주 예측</h2>

      <div className="order-recommendation-list">
        {orderRecommendations.map((item) => (
          <div className="order-recommendation-card" key={item.item}>
            <div className="order-recommendation-top">
              <strong>{item.item}</strong>
              <span className={`risk-badge risk-${item.risk}`}>위험도 {item.riskLabel}</span>
            </div>

            <dl>
              <div>
                <dt>현재 재고</dt>
                <dd>{item.currentStock}</dd>
              </div>
              <div>
                <dt>예상 사용량</dt>
                <dd>{item.predictedUsage}</dd>
              </div>
              <div>
                <dt>추천 발주량</dt>
                <dd>{item.recommendedQuantity}</dd>
              </div>
            </dl>

            <p>{item.reason}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default OrderPredictionPage
