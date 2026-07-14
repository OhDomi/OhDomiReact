export const dailySales = [
  { date: '07/10', sales: 1280000, orders: 164 },
  { date: '07/11', sales: 1420000, orders: 181 },
  { date: '07/12', sales: 1670000, orders: 209 },
  { date: '07/13', sales: 1510000, orders: 194 },
]

export const weeklySales = [
  { period: '7월 1주차', sales: 8350000, orders: 1064 },
  { period: '7월 2주차', sales: 9760000, orders: 1218 },
  { period: '7월 3주차', sales: 10420000, orders: 1320 },
]

export const monthlySales = [
  { period: '2026년 5월', sales: 34200000, orders: 4210 },
  { period: '2026년 6월', sales: 36500000, orders: 4488 },
  { period: '2026년 7월', sales: 38500000, orders: 4762 },
]

export const orderRecommendations = [
  {
    item: '우유',
    currentStock: '22L',
    predictedUsage: '28L',
    recommendedQuantity: '16L',
    risk: '높음',
    reason: '내일 음료 판매량 증가 예상',
  },
  {
    item: '샌드위치빵',
    currentStock: '45개',
    predictedUsage: '35개',
    recommendedQuantity: '10개',
    risk: '보통',
    reason: '점심 시간대 샌드위치 판매 증가 예상',
  },
  {
    item: '원두',
    currentStock: '8.5kg',
    predictedUsage: '6.2kg',
    recommendedQuantity: '1kg',
    risk: '낮음',
    reason: '안전재고 확보 목적',
  },
]