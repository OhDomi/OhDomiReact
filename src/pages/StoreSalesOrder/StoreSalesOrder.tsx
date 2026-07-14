import { useState } from 'react'
import './StoreSalesOrder.css'
import StoreSalesNav from './components/StoreSalesNav'
import SalesSummaryPage from './pages/SalesSummaryPage'
import SalesTablePage from './pages/SalesTablePage'
import OrderPredictionPage from './pages/OrderPredictionPage'
import OrderRequestPage from './pages/OrderRequestPage'

export type StoreSalesPage = 'summary' | 'sales' | 'prediction' | 'order'

function StoreSalesOrder() {
  const [activePage, setActivePage] = useState<StoreSalesPage>('summary')

  const pageTitle = {
    summary: '매출 / 발주 관리',
    sales: '매출표 보기',
    prediction: 'AI 발주 예측',
    order: '발주하기',
  }

  return (
    <main className="store-sales-page">
      <section className="store-sales-header">
        <div>
          <p className="eyebrow">가맹점주 대시보드</p>
          <h1>{pageTitle[activePage]}</h1>
          <p className="store-sales-description">
            매장 매출 흐름과 AI 추천 발주량을 확인합니다.
          </p>
        </div>
      </section>

      <section className="store-sales-layout">
        <div className="store-sales-main">
          {activePage === 'summary' && <SalesSummaryPage />}
          {activePage === 'sales' && <SalesTablePage />}
          {activePage === 'prediction' && <OrderPredictionPage />}
          {activePage === 'order' && <OrderRequestPage />}
        </div>

        <StoreSalesNav activePage={activePage} setActivePage={setActivePage} />
      </section>
    </main>
  )
}

export default StoreSalesOrder