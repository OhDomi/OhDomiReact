export const storeInfo = {
  storeName: '강남역점',
  ownerName: '김도윤',
  region: '서울 강남구',
  address: '서울 강남구 테헤란로 18길 12',
  phone: '010-4820-1593',
  openTime: '09:00',
  closeTime: '22:00',
  operationStatus: '영업 중',
}

export const facilityStatus = [
  {
    name: '냉장고',
    status: '주의',
    lastCheckedAt: '오늘 09:40',
    memo: '온도 변동이 감지되어 재확인이 필요합니다.',
  },
  {
    name: 'POS 기기',
    status: '정상',
    lastCheckedAt: '오늘 09:10',
    memo: '결제 및 주문 연동 정상',
  },
  {
    name: '조리대',
    status: '점검 필요',
    lastCheckedAt: '어제 18:20',
    memo: '위생 점검 사진 재업로드가 필요합니다.',
  },
  {
    name: '에어컨',
    status: '정상',
    lastCheckedAt: '오늘 08:55',
    memo: '이상 없음',
  },
]

export const todayStaff = [
  {
    name: '김민수',
    role: '주방',
    workTime: '09:00 - 15:00',
    status: '출근 완료',
  },
  {
    name: '이서연',
    role: '홀',
    workTime: '12:00 - 18:00',
    status: '근무 중',
  },
  {
    name: '박지훈',
    role: '마감',
    workTime: '18:00 - 22:00',
    status: '근무 예정',
  },
]

export const operationChecklist = [
  { task: '오픈 전 매장 청결 확인', checked: true },
  { task: '냉장 재고 온도 확인', checked: false },
  { task: 'POS 결제 테스트', checked: true },
  { task: '마감 정산 자료 확인', checked: false },
]