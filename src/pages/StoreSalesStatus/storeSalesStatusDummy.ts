export const salesSummary = {
  todaySales: '₩1,580,000',
  todayOrders: 198,
  averageOrderPrice: '₩7,980',
  monthlySales: '₩38,520,000',
  monthlyTarget: '₩45,000,000',
  targetRate: 86,
}

export const hourlySales = [
  { time: '09시', sales: 18 },
  { time: '10시', sales: 28 },
  { time: '11시', sales: 42 },
  { time: '12시', sales: 88 },
  { time: '13시', sales: 96 },
  { time: '14시', sales: 62 },
  { time: '15시', sales: 38 },
  { time: '16시', sales: 45 },
  { time: '17시', sales: 66 },
  { time: '18시', sales: 84 },
  { time: '19시', sales: 73 },
  { time: '20시', sales: 51 },
]

export const menuRanking = [
  {
    rank: 1,
    name: '연어 포케',
    category: '시그니처',
    orders: 64,
    sales: '₩704,000',
    change: '+12%',
  },
  {
    rank: 2,
    name: '참치 마요 덮밥',
    category: '덮밥',
    orders: 51,
    sales: '₩459,000',
    change: '+8%',
  },
  {
    rank: 3,
    name: '메밀 소바',
    category: '면류',
    orders: 37,
    sales: '₩333,000',
    change: '-3%',
  },
  {
    rank: 4,
    name: '닭가슴살 샐러드',
    category: '샐러드',
    orders: 29,
    sales: '₩319,000',
    change: '+5%',
  },
]

export const channelSales = [
  {
    channel: '매장 주문',
    sales: '₩642,000',
    rate: 41,
  },
  {
    channel: '배달앱',
    sales: '₩708,000',
    rate: 45,
  },
  {
    channel: '포장 주문',
    sales: '₩230,000',
    rate: 14,
  },
]

export const aiInsights = [
  {
    title: '점심 피크 매출이 강합니다',
    description: '12시~13시 매출이 전체 시간대 중 가장 높습니다. 인기 메뉴 재고를 점심 전 미리 확보하세요.',
    type: 'positive',
  },
  {
    title: '메밀 소바 주문이 소폭 감소했습니다',
    description: '최근 3일간 메밀 소바 주문량이 3% 감소했습니다. 날씨와 프로모션 영향을 확인해 보세요.',
    type: 'warning',
  },
  {
    title: '배달앱 매출 비중이 높습니다',
    description: '오늘 배달앱 매출 비중이 45%입니다. 배달 포장재 재고를 추가 확인하는 것이 좋습니다.',
    type: 'info',
  },
]