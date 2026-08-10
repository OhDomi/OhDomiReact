export const adminSalesSummary = {
  todayTotalSales: '₩186,400,000',
  monthlyTotalSales: '₩3,820,000,000',
  totalOrders: '486,230건',
  averageOrderPrice: '₩8,090',
  growthRate: '+8.4%',
  targetRate: 84,
}

export const monthlySalesTrend = [
  { month: '1월', sales: 58 },
  { month: '2월', sales: 62 },
  { month: '3월', sales: 69 },
  { month: '4월', sales: 74 },
  { month: '5월', sales: 81 },
  { month: '6월', sales: 77 },
  { month: '7월', sales: 89 },
]

export const regionSales = [
  {
    region: '서울',
    stores: 82,
    sales: '₩2.42B',
    growth: '+9.8%',
    rate: 82,
  },
  {
    region: '부산',
    stores: 18,
    sales: '₩520M',
    growth: '+4.1%',
    rate: 58,
  },
  {
    region: '대구',
    stores: 11,
    sales: '₩310M',
    growth: '+6.7%',
    rate: 46,
  },
  {
    region: '기타',
    stores: 15,
    sales: '₩570M',
    growth: '+7.5%',
    rate: 61,
  },
]

export const storeSalesRanking = [
  {
    rank: 1,
    store: '성수점',
    owner: '이서준',
    region: '서울 성동구',
    sales: '₩42,180,000',
    salesAmount: 42180000,
    orders: '5,120건',
    growth: '+14.2%',
    status: '상승',
    address: '',
  },
  {
    rank: 2,
    store: '강남역점',
    owner: '김도윤',
    region: '서울 강남구',
    sales: '₩38,520,000',
    salesAmount: 38520000,
    orders: '4,762건',
    growth: '+8.4%',
    status: '양호',
    address: '',
  },
  {
    rank: 3,
    store: '여의도점',
    owner: '최하늘',
    region: '서울 영등포구',
    sales: '₩35,960,000',
    salesAmount: 35960000,
    orders: '4,420건',
    growth: '+5.1%',
    status: '양호',
    address: '',
  },
  {
    rank: 4,
    store: '잠실점',
    owner: '박지우',
    region: '서울 송파구',
    sales: '₩31,440,000',
    salesAmount: 31440000,
    orders: '3,910건',
    growth: '-2.8%',
    status: '주의',
    address: '',
  },
  {
    rank: 5,
    store: '부산서면점',
    owner: '정민호',
    region: '부산 부산진구',
    sales: '₩25,320,000',
    salesAmount: 25320000,
    orders: '3,260건',
    growth: '-7.6%',
    status: '위험',
    address: '',
  },
]

export const weakStores = [
  {
    store: '부산서면점',
    issue: '2주 연속 매출 감소',
    description: '점심 시간대 주문량이 전월 대비 12% 감소했습니다.',
    priority: '긴급',
  },
  {
    store: '잠실점',
    issue: '월 목표 달성률 저조',
    description: '현재 목표 달성률이 68%로 본사 평균보다 낮습니다.',
    priority: '주의',
  },
  {
    store: '대구동성로점',
    issue: '배달앱 매출 비중 감소',
    description: '배달 채널 유입이 감소해 프로모션 점검이 필요합니다.',
    priority: '주의',
  },
]

export const adminSalesInsights = [
  {
    title: '서울권 매출 성장세가 가장 높습니다',
    description: '서울 지역 가맹점의 월 매출 성장률이 +9.8%로 전체 평균보다 높습니다.',
    type: 'positive',
  },
  {
    title: '부산서면점은 본사 조치가 필요합니다',
    description: '매출 감소와 위생 점수 하락이 동시에 발생하고 있어 운영 상담이 필요합니다.',
    type: 'danger',
  },
  {
    title: '점심 시간대 매출 집중도가 높습니다',
    description: '전체 가맹점 기준 12시~13시 매출 비중이 가장 높아 재고 준비 시간 조정이 필요합니다.',
    type: 'info',
  },
]