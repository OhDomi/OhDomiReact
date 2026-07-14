import { orderRecommendations } from '../data/storeSalesDummy'

function OrderRequestPage() {
  return (
    <section className="sales-panel full-panel">
      <h2>발주하기</h2>

      <div className="order-form-list">
        {orderRecommendations.map((item) => (
          <div className="order-form-row" key={item.item}>
            <div>
              <strong>{item.item}</strong>
              <p>추천 발주량: {item.recommendedQuantity}</p>
            </div>

            <input type="text" defaultValue={item.recommendedQuantity} />
          </div>
        ))}
      </div>

      <button className="order-submit-button" type="button">
        발주 요청 저장
      </button>
    </section>
  )
}

export default OrderRequestPage