import { dailySales } from '../data/storeSalesDummy'

function SalesSummaryPage() {
  return (
    <>
      <section className="sales-summary-grid">
        <article className="sales-summary-card">
          <span>오늘 예상 매출</span>
          <strong>1,580,000원</strong>
          <p>전일 대비 +7.4%</p>
        </article>

        <article className="sales-summary-card">
          <span>예상 주문 수</span>
          <strong>198건</strong>
          <p>점심 피크 주문 증가 예상</p>
        </article>

        <article className="sales-summary-card">
          <span>발주 위험 항목</span>
          <strong>2개</strong>
          <p>연어, 샌드위치빵 확인 필요</p>
        </article>
      </section>

      <section className="sales-panel">
        <h2>최근 매출 요약</h2>
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>매출</th>
              <th>주문 수</th>
            </tr>
          </thead>
          <tbody>
            {dailySales.map((item) => (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{item.sales.toLocaleString()}원</td>
                <td>{item.orders}건</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default SalesSummaryPage
