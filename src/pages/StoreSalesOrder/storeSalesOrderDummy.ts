export const orderSummary = {
  expectedSales: '₩1,580,000',
  expectedOrders: 198,
  requiredItems: 4,
  estimatedAmount: '₩428,500',
  autoOrderRate: 82,
}

export const recommendedOrders = [
  {
    id: 1,
    item: '연어',
    category: '수산',
    currentStock: '22kg',
    expectedUsage: '38kg',
    recommendedQty: '16kg',
    unitPrice: '₩18,000',
    amount: '₩288,000',
    risk: '부족',
    reason: '점심 피크 시간대 연어 포케 주문 증가 예상',
  },
  {
    id: 2,
    item: '날치알',
    category: '토핑',
    currentStock: '45개',
    expectedUsage: '55개',
    recommendedQty: '10개',
    unitPrice: '₩3,500',
    amount: '₩35,000',
    risk: '주의',
    reason: '인기 메뉴 주문 증가로 추가 확보 권장',
  },
  {
    id: 3,
    item: '포장 용기',
    category: '소모품',
    currentStock: '120개',
    expectedUsage: '190개',
    recommendedQty: '70개',
    unitPrice: '₩750',
    amount: '₩52,500',
    risk: '부족',
    reason: '배달앱 주문 비중이 45%로 상승',
  },
  {
    id: 4,
    item: '샐러드 채소',
    category: '신선식품',
    currentStock: '8kg',
    expectedUsage: '13kg',
    recommendedQty: '5kg',
    unitPrice: '₩10,600',
    amount: '₩53,000',
    risk: '주의',
    reason: '저녁 시간대 샐러드 메뉴 판매 증가 예상',
  },
  {
    id: 5,
    item: '메밀면',
    category: '면류',
    currentStock: '8.5kg',
    expectedUsage: '6.2kg',
    recommendedQty: '0kg',
    unitPrice: '₩7,800',
    amount: '₩0',
    risk: '안전',
    reason: '현재 재고로 내일 예상 수요 대응 가능',
  },
]

export const recentOrders = [
  {
    date: '2026-07-21',
    orderNo: 'OD-20260721-004',
    items: '연어 외 3개',
    amount: '₩428,500',
    status: '작성중',
  },
  {
    date: '2026-07-20',
    orderNo: 'OD-20260720-018',
    items: '메밀면 외 5개',
    amount: '₩612,000',
    status: '입고완료',
  },
  {
    date: '2026-07-19',
    orderNo: 'OD-20260719-011',
    items: '포장 용기 외 2개',
    amount: '₩184,000',
    status: '배송중',
  },
]

export const aiOrderInsights = [
  {
    title: '연어 재고가 내일 점심 전에 부족할 수 있습니다',
    description: '최근 3일간 연어 포케 주문량이 증가했고, 현재 재고는 예상 사용량보다 16kg 부족합니다.',
    type: 'danger',
  },
  {
    title: '배달 포장재 추가 확보가 필요합니다',
    description: '오늘 배달앱 주문 비중이 45%로 높아 포장 용기 소진 속도가 빠릅니다.',
    type: 'warning',
  },
  {
    title: '메밀면은 추가 발주하지 않아도 됩니다',
    description: '현재 재고가 내일 예상 사용량보다 충분해 과잉 발주를 줄일 수 있습니다.',
    type: 'positive',
  },
]