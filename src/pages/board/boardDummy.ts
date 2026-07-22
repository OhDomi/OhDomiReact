export type BoardType = 'notice' | 'inquiry'
export type BoardStatus = '공지' | '답변완료' | '대기중' | '긴급'

export type BoardPost = {
  id: number
  type: BoardType
  title: string
  writer: string
  date: string
  views: number
  pinned: boolean
  status: BoardStatus
  category: string
  content: string
}

export const boardSummary = {
  notices: 8,
  inquiries: 24,
  pending: 5,
  urgent: 2,
}

export const boardPosts: BoardPost[] = [
  {
    id: 1,
    type: 'notice',
    title: '7월 신메뉴 출시 안내',
    writer: '본사 운영팀',
    date: '2026-07-10',
    views: 48,
    pinned: true,
    status: '공지',
    category: '메뉴',
    content:
      '7월 20일부터 여름 한정 메뉴가 추가됩니다.\n발주 품목이 3개 늘어나니 발주 관리 화면에서 추천 수량을 확인해 주세요.',
  },
  {
    id: 2,
    type: 'notice',
    title: '설비 점검 주기 변경 공지',
    writer: '본사 운영팀',
    date: '2026-07-08',
    views: 19,
    pinned: false,
    status: '공지',
    category: '설비',
    content:
      '가맹점 설비 점검 주기가 일부 변경되었습니다.\n냉장고, POS 기기, 조리대 점검 항목을 매주 1회 이상 확인해 주세요.',
  },
  {
    id: 3,
    type: 'notice',
    title: '위생 점검 사진 업로드 기준 안내',
    writer: '품질관리팀',
    date: '2026-07-06',
    views: 31,
    pinned: false,
    status: '공지',
    category: '위생',
    content:
      'AI 위생 분석 정확도를 높이기 위해 조리대, 냉장고, 홀 출입구 사진을 정면 기준으로 촬영해 주세요.',
  },
  {
    id: 4,
    type: 'inquiry',
    title: '연어 발주 추천 수량이 평소보다 높게 나옵니다',
    writer: '강남역점 김도윤',
    date: '2026-07-21',
    views: 12,
    pinned: false,
    status: '답변완료',
    category: '발주',
    content:
      '내일 예상 주문 수 기준으로 연어 추천 수량이 평소보다 높게 나왔습니다.\n최근 판매량 기준이 반영된 건지 확인 부탁드립니다.',
  },
  {
    id: 5,
    type: 'inquiry',
    title: '위생 점검 재촬영 요청 기준이 궁금합니다',
    writer: '잠실점 박지우',
    date: '2026-07-20',
    views: 9,
    pinned: false,
    status: '대기중',
    category: '위생',
    content:
      '사진을 업로드했는데 재촬영 요청이 발생했습니다.\n어떤 기준으로 재촬영이 필요한지 확인 부탁드립니다.',
  },
  {
    id: 6,
    type: 'inquiry',
    title: 'POS 매출 데이터 반영 시간이 지연됩니다',
    writer: '부산서면점 정민호',
    date: '2026-07-20',
    views: 17,
    pinned: false,
    status: '긴급',
    category: '매출',
    content:
      '오늘 오전 POS 매출 데이터가 대시보드에 늦게 반영되고 있습니다.\n본사 확인 부탁드립니다.',
  },
]