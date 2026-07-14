import type { StoreSalesPage } from '../StoreSalesOrder'

type StoreSalesNavProps = {
  activePage: StoreSalesPage
  setActivePage: (page: StoreSalesPage) => void
}

function StoreSalesNav({ activePage, setActivePage }: StoreSalesNavProps) {
  return (
    <aside className="store-sales-side-nav">
      <h2>바로가기</h2>

      <button
        className={activePage === 'summary' ? 'nav-card active' : 'nav-card'}
        type="button"
        onClick={() => setActivePage('summary')}
      >
        <strong>요약 대시보드</strong>
        <span>오늘 매출, 주문 수, 위험 항목 확인</span>
      </button>

      <button
        className={activePage === 'sales' ? 'nav-card active' : 'nav-card'}
        type="button"
        onClick={() => setActivePage('sales')}
      >
        <strong>매출표 보기</strong>
        <span>일별, 주별, 월별 매출 확인</span>
      </button>

      <button
        className={activePage === 'prediction' ? 'nav-card active' : 'nav-card'}
        type="button"
        onClick={() => setActivePage('prediction')}
      >
        <strong>발주 예측</strong>
        <span>AI 추천 발주량과 위험도 확인</span>
      </button>

      <button
        className={activePage === 'order' ? 'nav-card active' : 'nav-card'}
        type="button"
        onClick={() => setActivePage('order')}
      >
        <strong>발주하기</strong>
        <span>추천 수량을 기준으로 발주 작성</span>
      </button>
    </aside>
  )
}

export default StoreSalesNav
