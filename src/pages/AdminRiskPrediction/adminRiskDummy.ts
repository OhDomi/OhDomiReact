export const riskSummary = {
  totalStores: 126,
  highRiskStores: 7,
  warningStores: 17,
  stableStores: 102,
  averageRiskScore: 18.6,
}

export const riskStores = [
  {
    name: '부산서면점',
    owner: '정민호',
    region: '부산 부산진구',
    riskLevel: '높음',
    riskScore: 87,
    salesChange: '-7.6%',
    hygieneScore: 69,
    orderDelay: '3회',
    complaintCount: 12,
    mainReason: '매출 감소와 위생 점수 하락이 동시에 발생했습니다.',
    prediction: '향후 2주 내 운영 리스크가 높아질 가능성이 큽니다.',
    action: '본사 현장 점검 및 운영 상담을 권장합니다.',
  },
  {
    name: '강남역점',
    owner: '김도윤',
    region: '서울 강남구',
    riskLevel: '높음',
    riskScore: 78,
    salesChange: '+8.4%',
    hygieneScore: 72,
    orderDelay: '1회',
    complaintCount: 8,
    mainReason: '매출은 양호하지만 위생 점검 이슈가 반복되고 있습니다.',
    prediction: '위생 관리 미흡이 브랜드 신뢰도 리스크로 이어질 수 있습니다.',
    action: '조리대 재점검 요청과 점주 안내 메시지 발송이 필요합니다.',
  },
  {
    name: '잠실점',
    owner: '박지우',
    region: '서울 송파구',
    riskLevel: '주의',
    riskScore: 62,
    salesChange: '-2.8%',
    hygieneScore: 86,
    orderDelay: '2회',
    complaintCount: 5,
    mainReason: '월 매출 목표 달성률이 낮고 발주 지연이 발생했습니다.',
    prediction: '재고 부족으로 인한 판매 기회 손실 가능성이 있습니다.',
    action: '발주 패턴 점검과 매출 개선 가이드를 제공하는 것이 좋습니다.',
  },
  {
    name: '대구동성로점',
    owner: '오서윤',
    region: '대구 중구',
    riskLevel: '주의',
    riskScore: 58,
    salesChange: '-4.1%',
    hygieneScore: 88,
    orderDelay: '0회',
    complaintCount: 4,
    mainReason: '배달앱 유입 감소로 매출 성장세가 둔화되었습니다.',
    prediction: '프로모션 부재 시 다음 주 매출도 감소할 가능성이 있습니다.',
    action: '지역 맞춤 프로모션과 배달 채널 점검을 권장합니다.',
  },
  {
    name: '성수점',
    owner: '이서준',
    region: '서울 성동구',
    riskLevel: '안전',
    riskScore: 18,
    salesChange: '+14.2%',
    hygieneScore: 94,
    orderDelay: '0회',
    complaintCount: 1,
    mainReason: '매출, 위생, 발주 지표가 모두 안정적입니다.',
    prediction: '단기 운영 리스크가 낮은 상태입니다.',
    action: '우수 매장 사례로 운영 노하우를 공유할 수 있습니다.',
  },
]

export const riskFactors = [
  {
    factor: '매출 감소',
    weight: 35,
    description: '최근 2주 매출 변화율과 월 목표 달성률을 반영합니다.',
  },
  {
    factor: '위생 점수',
    weight: 30,
    description: 'AI 위생 점검 점수와 재점검 발생 횟수를 반영합니다.',
  },
  {
    factor: '발주 지연',
    weight: 20,
    description: '필수 식자재 발주 지연 및 재고 부족 가능성을 반영합니다.',
  },
  {
    factor: '고객 문의/불만',
    weight: 15,
    description: '문의게시판, 리뷰, 민원성 문의 발생량을 반영합니다.',
  },
]

export const riskTrend = [
  { label: '월', high: 5, warning: 14 },
  { label: '화', high: 6, warning: 15 },
  { label: '수', high: 6, warning: 16 },
  { label: '목', high: 7, warning: 16 },
  { label: '금', high: 7, warning: 17 },
  { label: '토', high: 8, warning: 18 },
  { label: '일', high: 7, warning: 17 },
]

export const aiRecommendations = [
  {
    title: '부산서면점 현장 점검 우선 배정',
    description: '매출 감소, 위생 점수 하락, 고객 불만 증가가 동시에 발생했습니다.',
    priority: '긴급',
  },
  {
    title: '강남역점 위생 재점검 요청',
    description: '매출은 양호하지만 위생 이슈가 반복되어 브랜드 리스크로 이어질 수 있습니다.',
    priority: '긴급',
  },
  {
    title: '잠실점 발주 패턴 점검',
    description: '발주 지연으로 인한 품절 가능성이 있어 식자재 사용량 점검이 필요합니다.',
    priority: '주의',
  },
]