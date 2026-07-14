import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import StoreSalesOrder from './pages/StoreSalesOrder/StoreSalesOrder'

type Role = 'admin' | 'user'
type UserPage = 'dashboard' | 'inspection' | 'staff' | 'salesOrder'

type Session = {
  username: string
  role: Role
}

type AttendanceDay = {
  date: string
  staff: string[]
}

const ADMIN_ID = 'admin'
const ADMIN_PASSWORD = '1234'

const inspectionGuides = [
  {
    title: '설비 점검 지시사항',
    description:
      '본사에서 전달한 매장 설비 점검 항목을 확인하고, 이상 여부를 점검해 주세요.',
    items: [
      '냉장고와 냉동고 온도가 기준 범위 안에 있는지 확인',
      '조리 설비, POS, 키오스크의 작동 상태 확인',
      '누수, 전기 이상, 안전 장치 문제 발생 시 즉시 본사에 보고',
    ],
  },
  {
    title: '발주 관리 페이지 지시사항',
    description: '발주 관리 화면에서 확인해야 하는 본사 운영 지침입니다.',
    items: [
      '현재 재고와 예상 판매량을 확인한 뒤 발주 수량 검토',
      '본사 추천 발주량과 실제 매장 필요 수량 비교',
      '승인, 반려, 수정 요청 상태를 확인하고 필요한 조치 진행',
    ],
  },
]

const demandForecast = [
  { label: '오늘 예상 필요 인원', value: '5명', note: '점심 피크 2명 추가 권장' },
  { label: '내일 예상 필요 인원', value: '6명', note: '배달 주문 증가 예상' },
  { label: '주말 예상 필요 인원', value: '8명', note: '오픈/마감 보조 인력 확보 필요' },
]

const laborChecklist = [
  '이번 주 근무표와 실제 출근 기록 비교',
  '초과 근무 발생 직원 확인',
  '휴게 시간 누락 여부 확인',
  '급여 지급 대상자와 계좌 정보 확인',
  '노무 서류 갱신 필요 직원 확인',
]

const attendanceDays: AttendanceDay[] = [
  { date: '2026-07-14', staff: ['김민수', '이지은', '박서준', '최유나'] },
  { date: '2026-07-15', staff: ['이지은', '정하늘', '최유나'] },
  { date: '2026-07-16', staff: ['김민수', '박서준', '정하늘', '한도윤'] },
  { date: '2026-07-17', staff: ['김민수', '이지은', '최유나', '한도윤'] },
  { date: '2026-07-18', staff: ['박서준', '정하늘', '한도윤'] },
  { date: '2026-07-19', staff: ['김민수', '이지은', '정하늘'] },
  { date: '2026-07-20', staff: ['이지은', '박서준', '최유나'] },
]

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [userPage, setUserPage] = useState<UserPage>('dashboard')
  const [selectedDate, setSelectedDate] = useState(attendanceDays[0].date)
  const [error, setError] = useState('')

  const selectedAttendance = attendanceDays.find((day) => day.date === selectedDate)

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()

    if (!trimmedUsername || !password) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }

    if (trimmedUsername === ADMIN_ID) {
      if (password !== ADMIN_PASSWORD) {
        setError('관리자 비밀번호가 올바르지 않습니다.')
        return
      }

      setSession({ username: trimmedUsername, role: 'admin' })
      setUserPage('dashboard')
      setError('')
      return
    }

    setSession({ username: trimmedUsername, role: 'user' })
    setUserPage('dashboard')
    setError('')
  }

  function handleLogout() {
    setSession(null)
    setUserPage('dashboard')
    setPassword('')
    setError('')
  }

  if (session?.role === 'admin') {
    return (
      <main className="app-shell">
        <section className="dashboard-panel">
          <p className="eyebrow">관리자 로그인</p>
          <h1>관리자 대시보드</h1>
          <p className="dashboard-copy">
            안녕하세요, {session.username}님. 현재 관리자 계정으로 로그인되어 있습니다.
          </p>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </section>
      </main>
    )
  }

  if (session?.role === 'user' && userPage === 'inspection') {
    return (
      <main className="app-shell app-shell-wide">
        <section className="inspection-page" aria-labelledby="inspection-heading">
          <div className="page-top">
            <div>
              <p className="eyebrow">가맹점주 대시보드</p>
              <h1 id="inspection-heading">점검사항</h1>
              <p className="dashboard-copy">
                본사에서 내려온 설비 점검과 발주 관리 지시사항을 확인해 주세요.
              </p>
            </div>
            <button
              className="secondary-button top-button"
              type="button"
              onClick={() => setUserPage('dashboard')}
            >
              대시보드로 돌아가기
            </button>
          </div>

          <div className="inspection-list">
            {inspectionGuides.map((guide) => (
              <article className="inspection-card" key={guide.title}>
                <h2>{guide.title}</h2>
                <p>{guide.description}</p>
                <ul>
                  {guide.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (session?.role === 'user' && userPage === 'staff') {
    return (
      <main className="app-shell app-shell-wide">
        <section className="staff-page" aria-labelledby="staff-heading">
          <div className="page-top">
            <div>
              <p className="eyebrow">가맹점주 대시보드</p>
              <h1 id="staff-heading">인력 관리</h1>
              <p className="dashboard-copy">
                인력 수요 예측, 급여/노무 체크리스트, 날짜별 출근자를 확인해 주세요.
              </p>
            </div>
            <button
              className="secondary-button top-button"
              type="button"
              onClick={() => setUserPage('dashboard')}
            >
              대시보드로 돌아가기
            </button>
          </div>

          <div className="staff-summary-grid">
            {demandForecast.map((forecast) => (
              <article className="summary-card" key={forecast.label}>
                <p>{forecast.label}</p>
                <strong>{forecast.value}</strong>
                <span>{forecast.note}</span>
              </article>
            ))}
          </div>

          <div className="staff-content-grid">
            <section className="staff-section" aria-labelledby="labor-checklist-heading">
              <h2 id="labor-checklist-heading">급여/노무 체크리스트</h2>
              <ul className="checklist">
                {laborChecklist.map((item) => (
                  <li key={item}>
                    <input type="checkbox" aria-label={item} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="staff-section" aria-labelledby="attendance-heading">
              <h2 id="attendance-heading">날짜별 출근자</h2>
              <div className="attendance-layout">
                <div className="calendar-grid" aria-label="출근 날짜 선택">
                  {attendanceDays.map((day) => (
                    <button
                      className={day.date === selectedDate ? 'calendar-day active' : 'calendar-day'}
                      type="button"
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span>{new Date(day.date).getDate()}</span>
                      <small>{day.staff.length}명</small>
                    </button>
                  ))}
                </div>

                <div className="attendance-detail">
                  <p className="detail-label">선택 날짜</p>
                  <h3>{selectedDate}</h3>
                  <ul>
                    {selectedAttendance?.staff.map((staff) => (
                      <li key={staff}>{staff}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    )
  }

  if (session?.role === 'user' && userPage === 'salesOrder') {
    return (
      <main className="app-shell app-shell-wide">
        <section className="sales-order-page">
          <div className="page-top sales-order-top">
            <div>
              <p className="eyebrow">가맹점주 대시보드</p>
              <h1>매출/발주 관리</h1>
            </div>
            <button
              className="secondary-button top-button"
              type="button"
              onClick={() => setUserPage('dashboard')}
            >
              대시보드로 돌아가기
            </button>
          </div>
          <StoreSalesOrder />
        </section>
      </main>
    )
  }

  if (session?.role === 'user') {
    return (
      <main className="app-shell">
        <section className="dashboard-panel">
          <p className="eyebrow">가맹점주 로그인</p>
          <h1>가맹점주 대시보드</h1>
          <p className="dashboard-copy">
            안녕하세요, {session.username} 사장님. 확인할 메뉴를 선택해 주세요.
          </p>

          <div className="dashboard-actions">
            <button
              className="menu-button"
              type="button"
              onClick={() => setUserPage('inspection')}
            >
              <span>점검사항</span>
              <small>본사 설비 점검 및 발주 관리 지시사항 확인</small>
            </button>
            <button
              className="menu-button"
              type="button"
              onClick={() => setUserPage('staff')}
            >
              <span>인력 관리</span>
              <small>인력 수요 예측, 급여/노무 체크리스트, 출근자 확인</small>
            </button>
            <button
              className="menu-button"
              type="button"
              onClick={() => setUserPage('salesOrder')}
            >
              <span>매출/발주 관리</span>
              <small>매출 현황, 발주 예측, 발주 요청 화면 확인</small>
            </button>
          </div>

          <button className="secondary-button" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="login-panel" aria-labelledby="login-heading">
        <div className="login-header">
          <p className="eyebrow">로그인</p>
          <h1 id="login-heading">OhDomi</h1>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">ID</label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit">
            로그인
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
