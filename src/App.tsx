import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode, MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import StoreSalesOrder from './pages/StoreSalesOrder/StoreSalesOrder'
import BoardPage from './pages/board/BoardPage'
import StoreManagement from './pages/StoreManagement/StoreManagement'
import HygieneCheck from './pages/HygieneCheck/HygieneCheck'
import StoreSalesStatus from './pages/StoreSalesStatus/StoreSalesStatus'
import AdminStoreManagement from './pages/AdminStoreManagement/AdminStoreManagement'
import AdminHygieneCheck from './pages/AdminHygieneCheck/AdminHygieneCheck'
import AdminSalesAnalysis from './pages/AdminSalesAnalysis/AdminSalesAnalysis'
import AdminRiskPrediction from './pages/AdminRiskPrediction/AdminRiskPrediction'
import AdminRenewalCheck from './pages/AdminRenewalCheck/AdminRenewalCheck'
import AdminStoreRiskList from './pages/AdminStoreRiskList/AdminStoreRiskList'
import AdminDistrictProspect from './pages/AdminDistrictProspect/AdminDistrictProspect'
import AdminStoreDetail from './pages/AdminStoreDetail/AdminStoreDetail'
import RegisterPage from './pages/Auth/RegisterPage'
import type { hygieneActions } from './pages/AdminHygieneCheck/adminHygieneDummy'
import { getCurrentAccount, loginAccount, logoutAccount } from './api/authApi'
import PasswordInput from './components/PasswordInput'
import type { LoginResponse } from './api/authApi'
import { useApiData } from './api/useApiData'
import ApiDataState from './api/ApiDataState'
import GeneratingBanner from './api/GeneratingBanner'
import Footer from './components/Footer'

type Role = 'owner' | 'admin'
type Page = 'overview' | 'stores' | 'hygiene' | 'sales' | 'forecast' | 'renewalCheck' | 'storeRiskList' | 'districtProspect' | 'storeDetail' | 'orders' | 'board' | 'loadingPreview'

// 2026-08-12: 페이지 전환이 전부 React 상태에만 있어서 새로고침하면 항상 대시보드로
// 돌아가고, 뒤로가기/앞으로가기·북마크·링크 공유가 안 됐음 — URL과 동기화한다.
// 나머지 코드는 여전히 Page 값으로만 다루도록(go('sales') 등 기존 호출부 그대로 두고)
// 이 매핑 두 개로만 URL ↔ Page를 변환.
const PAGE_PATHS: Record<Page, string> = {
  overview: '/overview',
  stores: '/stores',
  hygiene: '/hygiene',
  sales: '/sales',
  forecast: '/forecast',
  renewalCheck: '/renewal-check',
  storeRiskList: '/store-risk-list',
  districtProspect: '/district-prospect',
  storeDetail: '/store-detail',
  orders: '/orders',
  board: '/board',
  loadingPreview: '/loading-preview',
}
const PATH_PAGES: Partial<Record<string, Page>> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as Page]),
)

function pageFromPathname(pathname: string): Page {
  const firstSegment = `/${pathname.split('/')[1] ?? ''}`
  return PATH_PAGES[firstSegment] ?? 'overview'
}

function addressFromPathname(pathname: string): string | null {
  const rest = pathname.split('/').slice(2).join('/')
  return rest ? decodeURIComponent(rest) : null
}

const NOTIFICATION_LIMIT = 5

const PAGE_TITLE: Partial<Record<Page, string>> = {
  overview: '대시보드',
  stores: '가맹점 관리',
  hygiene: '위생 점검',
  sales: '매출 분석',
  forecast: '리스크 예측',
  renewalCheck: '재계약 대상 점검',
  storeRiskList: '전체 매장 목록',
  districtProspect: '희망상권 탐색',
  storeDetail: '매장 상세',
  orders: '발주 관리',
  board: '공지/문의게시판',
  loadingPreview: '로딩 화면 테스트',
}

const icons: Record<string, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  stores: <><path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M8 20v-6h4v6"/><path d="M3 10c0 2 4 2 4 0 0 2 5 2 5 0 0 2 5 2 5 0 0 2 4 2 4 0"/></>,
  hygiene: <><path d="M12 3l7 3v5c0 4.8-3 8.4-7 10-4-1.6-7-5.2-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></>,
  sales: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
  forecast: <><path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/></>,
  renewalCheck: <><path d="M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="2.5"/><path d="M14 15l2 2"/></>,
  storeRiskList: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
  districtProspect: <><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
  orders: <><path d="M6 7h14l-2 9H8L6 4H3"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></>,
  bell: <><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  arrow: <><path d="M5 12h14"/><path d="M14 7l5 5-5 5"/></>,
  camera: <><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></>,
  check: <path d="M5 12l4 4L19 6"/>,
  logout: <><path d="M10 5V3H4v18h6v-2"/><path d="M13 8l5 4-5 4"/><path d="M18 12H8"/></>,
  loadingTest: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

type StoreRow = { name: string; owner: string; sales: string; hygieneScore: number; risk: string }

type OwnerOverviewData = {
  management: { storeInfo: { storeName: string } }
  hygiene: { hygieneSummary: { score: number; status: string; lastCheckedAt: string } }
  orders: { orderSummary: { expectedSales: string; expectedOrders: number; requiredItems: number }; recommendedOrders: Array<{ id: number; item: string; currentStock: string; expectedUsage: string; recommendedQty: string; risk: string }> }
  sales: { salesSummary: { todaySales: string; todayOrders: number }; hourlySales: Array<{ time: string; sales: number }> }
}

type AdminOverviewData = {
  stores: { adminStoreSummary: { totalStores: number }; adminStores: StoreRow[]; actionRequiredStores: Array<{ store: string; title: string; description: string; priority: string }> }
  hygiene: { adminHygieneSummary: { checkedStores: number; pendingStores: number }; hygieneActions: Array<{ store: string; priority: string }> }
  sales: { adminSalesSummary: { todayTotalSales: string }; weakStores: Array<{ store: string }> }
  risks: { riskSummary: { highRiskStores: number; warningStores: number; stableStores: number } }
}

function Login({ onLogin }: { onLogin: (account: LoginResponse) => void }) {
  const [role, setRole] = useState<Role>('owner')
  const [loginId, setLoginId] = useState('demo')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    if (!form.get('loginId') || !form.get('password')) {
      return setError('아이디와 비밀번호를 입력해 주세요.')
    }

    setError('')
    setIsSubmitting(true)
    try {
      const account = await loginAccount({
        loginId: String(form.get('loginId')),
        password: String(form.get('password')),
        role: role === 'admin' ? 'ADMIN' : 'OWNER',
      })
      onLogin(account)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '로그인에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showRegister) {
    return (
      <RegisterPage
        onBack={() => setShowRegister(false)}
        onRegistered={(registeredLoginId) => {
          setLoginId(registeredLoginId)
          setRole('owner')
          setError('')
          setSuccess('회원가입이 완료되었습니다. 새 계정으로 로그인해 주세요.')
          setShowRegister(false)
        }}
      />
    )
  }

  return (
    <>
    <main className="login-page">
      <section className="login-story">
        <a className="brand brand-light" href="#top">
          <span className="brand-mark">O</span>
          <span>oh!domi</span>
        </a>

        <div className="story-copy">
          <span className="kicker light">SMART FRANCHISE PARTNER</span>
          <h1>
            매장의 오늘을 읽고,
            <br />
            내일을 준비합니다.
          </h1>
          <p>
            AI 기반 위생 점검부터 매출·발주 예측까지.
            <br />
            오도미가 매장 운영의 모든 순간을 함께합니다.
          </p>

          <div className="story-stats">
            <div>
              <strong>98.7%</strong>
              <span>예측 정확도</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>실시간 모니터링</span>
            </div>
            <div>
              <strong>126</strong>
              <span>함께하는 매장</span>
            </div>
          </div>
        </div>

        <p className="login-copyright">© 2026 OhDomi. Better stores, together.</p>
      </section>

      <section className="login-side">
        <div className="login-card">
          <span className="mobile-brand brand">
            <span className="brand-mark">O</span>
            <span>oh!domi</span>
          </span>

          <span className="kicker">WELCOME BACK</span>
          <h2>다시 만나 반가워요</h2>
          <p className="muted">계정 정보를 입력해 대시보드로 이동하세요.</p>

          <div className="role-switch" role="group" aria-label="로그인 유형">
            <button type="button" className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}>
              가맹점주
            </button>
            <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
              관리자
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            <label>
              아이디
              <input
                name="loginId"
                placeholder="영문, 숫자 4자 이상"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                minLength={4}
                maxLength={100}
                pattern="[A-Za-z0-9._\-]+"
                required
              />
            </label>

            <label>
              비밀번호
              <PasswordInput
                name="password"
                placeholder="비밀번호를 입력하세요"
                defaultValue="1234"
                maxLength={72}
                required
              />
            </label>

            <div className="form-options">
              <label className="check-label">
                <input type="checkbox" /> 로그인 유지
              </label>
              <button type="button" className="text-button">비밀번호 찾기</button>
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <button className="login-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '로그인 확인 중...' : '로그인'}
              {!isSubmitting && <Icon name="arrow" size={18} />}
            </button>
          </form>

          <p className="signup-copy">
            처음 방문하셨나요?{' '}
            <button type="button" className="text-button" onClick={() => setShowRegister(true)}>
              회원가입
            </button>
          </p>

          <div className="demo-note">데모: 유형을 선택한 뒤 바로 로그인해 보세요.</div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

function Sidebar({
  role,
  page,
  setPage,
  logout,
}: {
  role: Role
  page: Page
  setPage: (p: Page) => void
  logout: () => void
}) {
  const ownerNav: { id: Page; label: string; icon: string }[] = [
    { id: 'overview', label: '대시보드', icon: 'overview' },
    { id: 'stores', label: '매장 관리', icon: 'stores' },
    { id: 'hygiene', label: '위생·품질 점검', icon: 'hygiene' },
    { id: 'sales', label: '매출 현황', icon: 'sales' },
    { id: 'orders', label: '발주 관리', icon: 'orders' },
    { id: 'board', label: '공지/문의게시판', icon: 'bell' },
    { id: 'loadingPreview', label: '로딩 화면 (테스트)', icon: 'loadingTest' },
  ]

  const adminNav: { id: Page; label: string; icon: string }[] = [
    { id: 'overview', label: '통합 대시보드', icon: 'overview' },
    { id: 'stores', label: '가맹점 관리', icon: 'stores' },
    { id: 'hygiene', label: '위생 점검', icon: 'hygiene' },
    { id: 'sales', label: '매출 분석', icon: 'sales' },
    { id: 'forecast', label: '리스크 예측', icon: 'forecast' },
    { id: 'renewalCheck', label: '재계약 대상 점검', icon: 'renewalCheck' },
    { id: 'storeRiskList', label: '전체 매장 목록', icon: 'storeRiskList' },
    { id: 'districtProspect', label: '희망상권 탐색', icon: 'districtProspect' },
    { id: 'board', label: '공지/문의게시판', icon: 'bell' },
    { id: 'loadingPreview', label: '로딩 화면 (테스트)', icon: 'loadingTest' },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">O</span>
        <span>oh!domi</span>
      </div>

      <div className="workspace-label">{role === 'admin' ? '본사 관리자' : '강남역점'}</div>

      <nav>
        {(role === 'admin' ? adminNav : ownerNav).map((item) => (
          <button
            key={item.id}
            type="button"
            className={page === item.id ? 'active' : ''}
            onClick={() => setPage(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.id === 'hygiene' && <i>2</i>}
          </button>
        ))}
      </nav>

      <div className="sidebar-help">
        <span>?</span>
        <strong>도움이 필요하신가요?</strong>
        <small>운영지원팀 02-1234-5678</small>
      </div>

      <button className="logout-button" type="button" onClick={logout}>
        <Icon name="logout" />
        <span>로그아웃</span>
      </button>
    </aside>
  )
}

function Metric({
  label,
  value,
  change,
  icon,
  tone = '',
}: {
  label: string
  value: string
  change: string
  icon: string
  tone?: string
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{change}</small>
      </div>
    </article>
  )
}

function SalesChart({ data }: { data: Array<{ time: string; sales: number }> }) {
  const max = Math.max(...data.map((item) => Number(item.sales)), 1)
  return (
    <div className="chart-wrap">
      <div className="chart-scale">
        <span>200만</span>
        <span>150만</span>
        <span>100만</span>
        <span>50만</span>
        <span>0</span>
      </div>

      <div className="bar-chart">
        {data.map((item, index) => (
          <div className="bar-column" key={`${item.time}-${index}`}>
            <div className="bar-value" style={{ height: `${Math.max(4, Number(item.sales) / max * 100)}%` }}>
              {index === data.length - 1 && <span>{item.sales}만</span>}
            </div>
            <small>{item.time}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function OwnerOverview({ go, storeId, name }: { go: (p: Page) => void; storeId: number; name: string }) {
  const api = useApiData<OwnerOverviewData>(`/api/ui/stores/${storeId}/overview`)
  if (!api.data) return <ApiDataState loading={api.loading} error={api.error} retry={api.retry} />
  const { management, hygiene, orders, sales } = api.data
  const recommendations = orders.recommendedOrders.slice(0, 3)
  const ownerAlerts = recommendations.map((item) => ({ title: `${item.item} 발주 ${item.risk}`, time: item.recommendedQty }))
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="kicker">2026년 7월 21일 화요일</span>
          <h1>좋은 아침이에요, {name} 점주님</h1>
          <p>{management.storeInfo.storeName}의 오늘 운영 현황을 한눈에 확인하세요.</p>
        </div>

        <button className="primary-action" type="button" onClick={() => go('orders')}>
          + 빠른 발주
        </button>
      </header>

      <section className="metrics-grid">
        <Metric label="오늘 매출" value={sales.salesSummary.todaySales} change={`${sales.salesSummary.todayOrders}건 주문`} icon="sales" />
        <Metric label="예상 주문" value={`${orders.orderSummary.expectedOrders}건`} change="주문 집계" icon="orders" tone="purple" />
        <Metric label="위생 점수" value={`${hygiene.hygieneSummary.score}점`} change={`${hygiene.hygieneSummary.status} · ${hygiene.hygieneSummary.lastCheckedAt}`} icon="hygiene" tone="green" />
        <Metric label="발주 필요 품목" value={`${orders.orderSummary.requiredItems}개`} change="오늘 확인 필요" icon="bell" tone="orange" />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">SALES OVERVIEW</span>
              <h2>이번 주 매출</h2>
            </div>
            <button className="select-button" type="button">최근 7일⌄</button>
          </div>

          <SalesChart data={sales.hourlySales} />

          <div className="chart-summary">
            <span>주간 누적 매출</span>
            <strong>{sales.salesSummary.todaySales}</strong>
            <em>{sales.salesSummary.todayOrders}건</em>
          </div>
        </article>

        <article className="panel order-preview">
          <div className="panel-head">
            <div>
              <span className="panel-label">SMART ORDER</span>
              <h2>AI 발주 추천</h2>
            </div>

            <button className="link-button" type="button" onClick={() => go('orders')}>
              전체 보기 <Icon name="arrow" size={16} />
            </button>
          </div>

          {recommendations.map((item) => <div className={`stock-item ${item.risk === '부족' ? 'critical' : item.risk === '안전' ? 'safe' : ''}`} key={item.id}><div className="stock-icon">📦</div><div><strong>{item.item}</strong><span>현재 {item.currentStock} · 예상 {item.expectedUsage}</span></div><b>{item.recommendedQty}</b></div>)}

          <button className="wide-button" type="button" onClick={() => go('orders')}>
            추천 수량으로 발주하기 <Icon name="arrow" size={17} />
          </button>
        </article>

        <article className="panel hygiene-preview">
          <div className="panel-head">
            <div>
              <span className="panel-label">QUALITY CHECK</span>
              <h2>위생·품질 점검</h2>
            </div>
            <span className="status-pill success">● 정상</span>
          </div>

          <div className="hygiene-score">
            <div className="score-ring">
              <strong>{hygiene.hygieneSummary.score}</strong>
              <small>/ 100</small>
            </div>

            <div>
              <strong>매장 상태: {hygiene.hygieneSummary.status}</strong>
              <p>마지막 점검: {hygiene.hygieneSummary.lastCheckedAt}</p>

              <div className="mini-checks">
                <span><Icon name="check" size={15} />조리대</span>
                <span><Icon name="check" size={15} />냉장고</span>
                <span><Icon name="check" size={15} />홀</span>
              </div>
            </div>
          </div>

          <button className="outline-button" type="button" onClick={() => go('hygiene')}>
            <Icon name="camera" size={18} /> 새 사진으로 점검하기
          </button>
        </article>

        <article className="panel alerts-preview">
          <div className="panel-head">
            <div>
              <span className="panel-label">NOTIFICATIONS</span>
              <h2>오늘의 알림</h2>
            </div>
            <span className="count-badge">{ownerAlerts.length}</span>
          </div>

          {ownerAlerts.slice(0, 2).map((alert) => (
            <div className="mini-alert" key={alert.title}>
              <span className="alert-dot warning"></span>
              <div>
                <strong>{alert.title}</strong>
                <small>{alert.time}</small>
              </div>
            </div>
          ))}
        </article>
      </section>
    </>
  )
}

function AdminOverview({ go }: { go: (p: Page) => void }) {
  const api = useApiData<AdminOverviewData>('/api/ui/admin/overview')
  if (!api.data) return <ApiDataState loading={api.loading} error={api.error} retry={api.retry} />
  const { stores: storeData, hygiene, sales, risks } = api.data
  const adminAlerts = storeData.actionRequiredStores.map((item) => ({
    level: item.priority, tone: item.priority === '긴급' ? 'danger' : 'warning',
    title: `${item.store} ${item.title}`, detail: item.description, time: '확인 필요',
  }))
  const totalStores = storeData.adminStoreSummary.totalStores
  const weakStoreNames = sales.weakStores.slice(0, 2).map((s) => s.store)
  const urgentHygieneStores = new Set(
    hygiene.hygieneActions.filter((item) => item.priority === '긴급').map((item) => item.store),
  ).size
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="kicker">HEADQUARTERS CONTROL CENTER</span>
          <h1>통합 운영 현황</h1>
          <p>{totalStores}개 가맹점의 핵심 지표와 위험 신호를 확인하세요.</p>
        </div>

        <button className="primary-action" type="button" onClick={() => go('stores')}>
          가맹점 리포트
        </button>
      </header>

      <section className="metrics-grid">
        <Metric label="전체 가맹점" value={`${totalStores}개`} change="등록 매장" icon="stores" />
        <Metric label="오늘 통합 매출" value={sales.adminSalesSummary.todayTotalSales} change="전체 주문 집계" icon="sales" tone="purple" />
        <Metric label="위생 점검 완료" value={`${hygiene.adminHygieneSummary.checkedStores} / ${totalStores}`} change={`${hygiene.adminHygieneSummary.pendingStores}개 매장 확인 필요`} icon="hygiene" tone="green" />
        <Metric label="위험 알림" value={`${risks.riskSummary.highRiskStores + risks.riskSummary.warningStores}건`} change={`긴급 ${risks.riskSummary.highRiskStores} · 주의 ${risks.riskSummary.warningStores}`} icon="bell" tone="orange" />
      </section>

      <article className="panel ai-action-panel admin-ai-highlight">
        <div className="panel-head">
          <div>
            <span className="panel-label">AI ACTION GUIDE</span>
            <h2>AI 추천 조치</h2>
          </div>
          <span className="status-pill success">● 우선 확인</span>
        </div>

        <div className="ai-action-list">
          <button type="button" onClick={() => go('sales')}>
            <span className="ai-action-icon purple">₩</span>
            <div>
              <strong>매출 부진 매장 분석</strong>
              <p>{weakStoreNames.length ? `${weakStoreNames.join(', ')} 매출 흐름 확인` : '매출 부진 매장이 없습니다'}</p>
            </div>
          </button>

          <button type="button" onClick={() => go('hygiene')}>
            <span className="ai-action-icon green">✓</span>
            <div>
              <strong>위생 점검 결과 검토</strong>
              <p>{urgentHygieneStores > 0 ? `긴급 매장 ${urgentHygieneStores}곳 재점검 요청` : '긴급 재점검 대상이 없습니다'}</p>
            </div>
          </button>

          <button type="button" onClick={() => go('forecast')}>
            <span className="ai-action-icon orange">!</span>
            <div>
              <strong>운영 리스크 예측 확인</strong>
              <p>{risks.riskSummary.highRiskStores > 0 ? `고위험 매장 ${risks.riskSummary.highRiskStores}곳 우선 조치 추천` : '고위험 매장이 없습니다'}</p>
            </div>
          </button>
        </div>
      </article>

      <section className="admin-grid">
        <article className="panel alert-center">
          <div className="panel-head">
            <div>
              <span className="panel-label">LIVE ALERTS</span>
              <h2>통합 알림함</h2>
            </div>
            <button className="link-button" type="button">모두 읽음</button>
          </div>

          {adminAlerts.map((alert) => (
            <div className="alert-row" key={alert.title}>
              <span className={`alert-level ${alert.tone}`}>{alert.level}</span>
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
              <time>{alert.time}</time>
            </div>
          ))}
        </article>

        <article className="panel risk-summary">
          <div className="panel-head">
            <div>
              <span className="panel-label">RISK MONITOR</span>
              <h2>가맹점 위험 분포</h2>
            </div>
          </div>

          <div className="donut">
            <div>
              <strong>{totalStores}</strong>
              <span>전체 매장</span>
            </div>
          </div>

          <div className="legend">
            <span><i className="safe"></i>안전 <b>{risks.riskSummary.stableStores}</b></span>
            <span><i className="warning"></i>주의 <b>{risks.riskSummary.warningStores}</b></span>
            <span><i className="danger"></i>위험 <b>{risks.riskSummary.highRiskStores}</b></span>
          </div>

          <button className="outline-button" type="button" onClick={() => go('forecast')}>
            상세 리스크 보기
          </button>
        </article>

        <article className="panel store-table wide">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE STATUS</span>
              <h2>가맹점 현황</h2>
            </div>

            <button className="link-button" type="button" onClick={() => go('stores')}>
              전체 보기 <Icon name="arrow" size={16} />
            </button>
          </div>

          <StoreTable stores={storeData.adminStores} compact />
        </article>

        <article className="panel admin-task-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">TODAY TASKS</span>
              <h2>오늘 처리해야 할 업무</h2>
            </div>

            <button className="select-button" type="button">
              우선순위
            </button>
          </div>

          <div className="admin-task-list">
            <div className="admin-task-card danger">
              <span>긴급</span>
              <div>
                <strong>부산서면점 현장 점검 일정 배정</strong>
                <p>매출 감소와 위생 점수 하락이 동시에 발생했습니다.</p>
              </div>
              <button className="detail-button" type="button" onClick={() => go('forecast')}>
                확인
              </button>
            </div>

            <div className="admin-task-card warning">
              <span>주의</span>
              <div>
                <strong>강남역점 위생 재점검 요청</strong>
                <p>조리대 청결 상태 재확인이 필요합니다.</p>
              </div>
              <button className="detail-button" type="button" onClick={() => go('hygiene')}>
                확인
              </button>
            </div>

            <div className="admin-task-card info">
              <span>안내</span>
              <div>
                <strong>7월 신메뉴 공지 확인 현황 점검</strong>
                <p>일부 가맹점의 공지 확인 여부를 체크하세요.</p>
              </div>
              <button className="detail-button" type="button" onClick={() => go('board')}>
                확인
              </button>
            </div>
          </div>
        </article>

      </section>
    </>
  )
}

function StoreTable({
  stores,
  compact = false,
  onSelect,
  selected,
}: {
  stores: StoreRow[]
  compact?: boolean
  onSelect?: (store: StoreRow) => void
  selected?: string
}) {
  const shown = compact ? stores.slice(0, 3) : stores

  return (
    <div className="table-scroll">
      <table className={`data-table ${onSelect ? 'selectable' : ''}`}>
        <thead>
          <tr>
            <th>가맹점</th>
            <th>점주</th>
            <th>오늘 매출</th>
            <th>위생 점수</th>
            <th>리스크</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {shown.map((store) => (
            <tr
              className={selected === store.name ? 'selected' : ''}
              key={store.name}
              onClick={() => onSelect?.(store)}
            >
              <td>
                <span className="store-avatar">{store.name[0]}</span>
                <strong>{store.name}</strong>
              </td>
              <td>{store.owner}</td>
              <td>{store.sales}</td>
              <td><b>{store.hygieneScore}</b>점</td>
              <td>
                <span className={`risk-tag ${store.risk === '높음' ? 'high' : store.risk === '보통' ? 'medium' : 'low'}`}>
                  {store.risk}
                </span>
              </td>
              <td>
                <button
                  className="detail-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect?.(store)
                  }}
                >
                  {onSelect ? '상세' : '•••'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ModulePage({
  page, role, account, detailAddress, openStoreDetail, backToStoreList,
  storeListInitialSort, onStoreListSortConsumed, goToStoreListBySales,
}: {
  page: Page
  role: Role
  account: LoginResponse
  detailAddress: string | null
  openStoreDetail: (address: string) => void
  backToStoreList: () => void
  storeListInitialSort: 'sales' | undefined
  onStoreListSortConsumed: () => void
  goToStoreListBySales: () => void
}) {
  const content = useMemo(() => ({
    stores: {
      kicker: 'FRANCHISE NETWORK',
      title: '가맹점 관리',
      copy: '매장별 운영 현황과 재계약 리스크를 한곳에서 관리하세요.',
    },
    hygiene: {
      kicker: 'AI QUALITY INSPECTION',
      title: '위생·품질 점검',
      copy: role === 'admin'
        ? '가맹점 점검 사진과 AI 분석 결과를 확인하세요.'
        : '매장 사진을 올리면 AI가 위생 상태를 바로 분석합니다.',
    },
    sales: {
      kicker: 'SALES ANALYTICS',
      title: '매출 현황',
      copy: role === 'admin'
        ? '전체 가맹점의 매출 흐름과 성과를 비교하세요.'
        : '일별·주별 매출 흐름과 주문 추이를 확인하세요.',
    },
    forecast: {
      kicker: 'AI RISK PREDICTION',
      title: role === 'admin' ? '리스크 예측' : '수요·발주 예측',
      copy: '매출, 위생, 발주 데이터를 기반으로 운영 리스크를 예측합니다.',
    },
    orders: {
      kicker: 'ORDER MANAGEMENT',
      title: '발주 관리',
      copy: 'AI 추천 수량을 검토하고 필요한 식자재를 발주하세요.',
    },
    board: {
      kicker: 'COMMUNICATION',
      title: '공지/문의게시판',
      copy: '본사 공지사항과 가맹점 문의를 확인하세요.',
    },
    overview: {
      kicker: '',
      title: '',
      copy: '',
    },
  })[page], [page, role])

  if (role === 'owner' && page === 'stores') {
    return account.storeId ? <StoreManagement storeId={account.storeId} /> : <UnlinkedStore />
  }

  if (role === 'admin' && page === 'stores') {
    return <AdminStoreManagement />
  }

  if (role === 'owner' && page === 'hygiene') {
    return account.storeId ? <HygieneCheck storeId={account.storeId} /> : <UnlinkedStore />
  }

  if (role === 'admin' && page === 'hygiene') {
    return <AdminHygieneCheck />
  }

  if (role === 'owner' && page === 'sales') {
    return account.storeId ? <StoreSalesStatus storeId={account.storeId} /> : <UnlinkedStore />
  }

  if (role === 'admin' && page === 'sales') {
    return <AdminSalesAnalysis onViewAllBySales={goToStoreListBySales} />
  }

  if (role === 'admin' && page === 'forecast') {
    return <AdminRiskPrediction />
  }

  if (role === 'admin' && page === 'renewalCheck') {
    return <AdminRenewalCheck onOpenDetail={openStoreDetail} />
  }

  if (role === 'admin' && page === 'storeRiskList') {
    return (
      <AdminStoreRiskList
        onOpenDetail={openStoreDetail}
        initialSort={storeListInitialSort}
        onSortConsumed={onStoreListSortConsumed}
      />
    )
  }

  if (role === 'admin' && page === 'districtProspect') {
    return <AdminDistrictProspect />
  }

  if (role === 'admin' && page === 'storeDetail') {
    return <AdminStoreDetail address={detailAddress ?? ''} onBack={backToStoreList} />
  }


  if (role === 'owner' && page === 'orders') {
    return account.storeId ? <StoreSalesOrder storeId={account.storeId} /> : <UnlinkedStore />
  }

  if (page === 'board') {
    return (
      <>
        <header className="page-heading">
          <div>
            <span className="kicker">{content.kicker}</span>
            <h1>{content.title}</h1>
            <p>{content.copy}</p>
          </div>
        </header>

        <BoardPage
          userId={account.userId}
          storeId={account.storeId}
          userName={account.name}
          isAdmin={role === 'admin'}
        />
      </>
    )
  }

  const isOrder = page === 'orders'

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="kicker">{content.kicker}</span>
          <h1>{content.title}</h1>
          <p>{content.copy}</p>
        </div>

        {isOrder && <button className="primary-action" type="button">발주 내역</button>}
      </header>

      <section className="panel full-module recommendation-page">
        <div className="forecast-banner">
          <div>
            <span>AI PREDICTION</span>
            <h2>{role === 'admin' ? '이번 주 위험 매장 7곳을 확인했어요' : '내일은 오늘보다 주문이 12% 늘어날 전망이에요'}</h2>
            <p>최근 8주 판매량, 날씨, 요일 데이터를 종합한 결과입니다.</p>
          </div>

          <div className="confidence">
            <strong>98.7%</strong>
            <span>예측 신뢰도</span>
          </div>
        </div>

        <div className="recommendation-table">
          <div className="recommendation-head">
            <span>품목</span>
            <span>현재 재고</span>
            <span>예상 사용량</span>
            <span>AI 추천</span>
            <span>{isOrder ? '발주 수량' : '재고 위험'}</span>
          </div>

          {[
            ['연어', '22 kg', '28 kg', '16 kg', '높음'],
            ['날치알', '45 ea', '35 ea', '10 ea', '보통'],
            ['메밀면', '8.5 kg', '6.2 kg', '0 kg', '안전'],
            ['소스', '18 L', '15 L', '5 L', '안전'],
          ].map((row) => (
            <div className="recommendation-row" key={row[0]}>
              {row.slice(0, 4).map((value, index) => (
                <span key={value}>{index === 0 ? <strong>{value}</strong> : value}</span>
              ))}

              <span>
                {isOrder ? (
                  <input defaultValue={row[3]} />
                ) : (
                  <span className={`risk-tag ${row[4] === '높음' ? 'high' : row[4] === '보통' ? 'medium' : 'low'}`}>
                    {row[4]}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {isOrder && (
          <div className="order-footer">
            <div>
              <span>예상 발주 금액</span>
              <strong>₩428,500</strong>
            </div>

            <button className="primary-action" type="button">
              발주 요청 보내기 <Icon name="arrow" size={17} />
            </button>
          </div>
        )}
      </section>
    </>
  )
}

function UnlinkedStore() {
  return <section className="panel full-module"><h2>연결된 매장이 없습니다</h2><p>이 계정에 매장이 배정되면 운영 데이터를 확인할 수 있습니다.</p></section>
}

function LoadingPreviewPage() {
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="kicker">INTERNAL TEST</span>
          <h1>로딩 화면 모음</h1>
          <p>앱 곳곳에서 쓰는 로딩 상태를 실제 데이터 없이 계속 보면서 점검하는 테스트 탭입니다.</p>
        </div>
      </header>

      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">DASHBOARD SKELETON</span>
            <h2>대시보드 데이터 로딩 (ApiDataState)</h2>
          </div>
        </div>
        <p className="muted" style={{ margin: '4px 0 18px' }}>대시보드/오너 화면 진입 시 첫 데이터를 기다리는 동안 보이는 모습</p>
        <ApiDataState loading error="" retry={() => {}} />
      </section>

      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">LONG-RUNNING TASK</span>
            <h2>생성/계산 중 배너 (GeneratingBanner)</h2>
          </div>
        </div>
        <p className="muted" style={{ margin: '4px 0 0' }}>결과 형태를 미리 알 수 없는, 몇 초~수십 초 걸리는 작업에 사용</p>
        <GeneratingBanner title="AI가 사진을 분석하고 있습니다" detail="현재 3번째 사진 처리 중 · 완료될 때까지 입력 버튼이 잠깁니다." />
        <GeneratingBanner title="상담자료 생성 중…" detail="실제 계산이라 몇 초~수십 초 걸릴 수 있습니다" />
        <GeneratingBanner title="후보지 계산 중…" detail="실제 계산이라 격자점마다 몇 초~수십 초 걸릴 수 있습니다" />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="panel-label">INLINE SKELETON</span>
            <h2>목록/라인 단위 스켈레톤 (.skeleton-block)</h2>
          </div>
        </div>
        <p className="muted" style={{ margin: '4px 0 18px' }}>게시판 목록, 위생 체크리스트 등 짧은 목록 로딩에 사용</p>
        <div className="skeleton-panel-row rows">
          <span className="skeleton-block" style={{ height: 40 }} />
          <span className="skeleton-block" style={{ height: 40 }} />
          <span className="skeleton-block" style={{ height: 40 }} />
        </div>
      </section>
    </>
  )
}

function App() {
  const [account, setAccount] = useState<LoginResponse | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const page = pageFromPathname(location.pathname)
  const detailAddress = page === 'storeDetail' ? addressFromPathname(location.pathname) : null
  function setPage(next: Page) {
    navigate(PAGE_PATHS[next])
  }
  const [storeListInitialSort, setStoreListInitialSort] = useState<'sales' | undefined>(undefined)
  const role: Role | null = account
    ? account.role === 'ADMIN' ? 'admin' : 'owner'
    : null
  const adminHygieneAlerts = useApiData<{ hygieneActions: typeof hygieneActions }>(
    role === 'admin' ? '/api/ui/admin/hygiene' : null,
  )
  const hygieneAlerts = role === 'admin' ? adminHygieneAlerts.data?.hygieneActions ?? [] : []
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  function showToast(message: string) {
    setToastMessage(message)

    window.setTimeout(() => {
      setToastMessage('')
    }, 2200)
  }

  function handleLogout() {
    void logoutAccount()
    setAccount(null)
    setPage('overview')
    setNotificationOpen(false)
    setProfileMenuOpen(false)
  }

  // 2026-08-12: 로그인 상태가 이 useState에만 있어서 새로고침하면 SESSION 쿠키는 그대로
  // 유효한데도 로그인 화면으로 튕기던 문제 — 첫 마운트 시 쿠키로 세션을 복구해본다.
  useEffect(() => {
    let cancelled = false
    getCurrentAccount().then((restored) => {
      if (cancelled) return
      if (restored) setAccount(restored)
      setSessionChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 2026-08-12: 어느 페이지에 있든 탭 제목이 항상 "oh-domi"로 고정돼 있어서 탭을 여러 개
  // 열어두면 구분이 안 됐음.
  useEffect(() => {
    const label = role ? PAGE_TITLE[page] : null
    document.title = label ? `${label} · oh!domi` : 'oh!domi'
  }, [page, role])

  // 로그인 상태에서 "/"로 오거나 인식 못 하는 경로로 오면 대시보드로 정리 — pageFromPathname은
  // 항상 유효한 Page를 돌려주지만(모르는 경로는 overview로 취급) 주소창 자체는 그대로라
  // 실제로 그 경로로 옮겨준다.
  useEffect(() => {
    if (!role) return
    const firstSegment = `/${location.pathname.split('/')[1] ?? ''}`
    if (!(firstSegment in PATH_PAGES)) {
      navigate(PAGE_PATHS[pageFromPathname(location.pathname)], { replace: true })
    }
  }, [role, location.pathname, navigate])

  // 매장 상세를 iframe/새 탭 대신 앱 안(사이드바 유지)에서 보여주기 위한 내비게이션
  // (2026-08-10, "모든 페이지에 사이드바가 빠짐없이 보였으면 좋겠다" 요청).
  function openStoreDetail(address: string) {
    navigate(`${PAGE_PATHS.storeDetail}/${encodeURIComponent(address)}`)
  }

  // 매출 분석의 "가맹점 매출 순위 전체보기" → 전체 매장 목록으로 이동하면서 매출순 정렬로
  // 시작(2026-08-10). 전체 매장 목록이 마운트되는 즉시 소비하고 원래대로 되돌려, 사이드바로
  // 직접 들어올 땐 이 정렬이 남아있지 않도록 함.
  function goToStoreListBySales() {
    setStoreListInitialSort('sales')
    setPage('storeRiskList')
  }

  function openPreparingMessage(label: string) {
    showToast(`${label} 기능은 추후 백엔드 연동 예정입니다.`)
    setNotificationOpen(false)
    setProfileMenuOpen(false)
  }

  function handlePreparingButtonClick(event: ReactMouseEvent<HTMLDivElement>) {
    const clickedButton = (event.target as HTMLElement).closest('button') as HTMLButtonElement | null

    if (!clickedButton || clickedButton.disabled || clickedButton.dataset.backendReady === 'true') {
      return
    }

    const buttonText = clickedButton.textContent?.replace(/\s+/g, ' ').trim() ?? ''

    const preparingButtonLabels = [
      '+ 가맹점 등록',
      '가맹점 등록',
      '리포트 보기',
      '운영 리포트 보기',
      '점주에게 연락',
      '점주 연락',

      '최근 7일',
      '전체 상태',
      '전체 지역',
      '기간 선택',
      '필터',
      '검색',

      '점주에게 안내',
      '재점검 요청',
      '사진 검토하기',
      '사진 선택',
      '점검 시작',
      '조치 등록',
      '개선 안내 발송',

      '발주서 작성',
      '발주 요청 보내기',
      '발주 내역',
      '발주 확정',
      '재고 확인',

      '처리',
      '분석',
      '실행',
      '확인',
      '저장',
      '수정',
      '삭제',
      '다운로드',
    ]

    const matchedLabel = preparingButtonLabels.find((label) => buttonText.includes(label))

    if (!matchedLabel) {
      return
    }

    showToast(`${matchedLabel.replace('+ ', '')} 기능은 추후 백엔드 연동 예정입니다.`)
    setNotificationOpen(false)
    setProfileMenuOpen(false)
  }

  if (!sessionChecked) {
    return (
      <div className="app-boot-loading">
        <span className="brand-mark">O</span>
        <i aria-hidden="true" />
      </div>
    )
  }

  if (!role) {
    return (
      <Login
        onLogin={(loggedInAccount) => {
          setAccount(loggedInAccount)
          setPage('overview')
          setNotificationOpen(false)
          setProfileMenuOpen(false)
        }}
      />
    )
  }

  return (
    <div className="app-layout" onClickCapture={handlePreparingButtonClick}>
      <Sidebar
        role={role}
        page={page}
        setPage={(nextPage) => {
          setPage(nextPage)
          setNotificationOpen(false)
          setProfileMenuOpen(false)
        }}
        logout={handleLogout}
      />

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="메뉴">☰</button>

          <div className="top-search">
            <Icon name="search" size={18} />
            <input placeholder="매장, 메뉴, 리포트 검색" />
          </div>

          <div className="top-actions">
            <div className="topbar-popover-wrap">
              <button
                className={`icon-button ${notificationOpen ? 'active' : ''}`}
                type="button"
                aria-label="알림"
                onClick={() => {
                  setNotificationOpen((prev) => !prev)
                  setProfileMenuOpen(false)
                }}
              >
                <Icon name="bell" />
                <i></i>
              </button>

              {notificationOpen && (
                <div className="notification-popover">
                  <div className="popover-head">
                    <div>
                      <span className="panel-label">NOTIFICATIONS</span>
                      <h3>알림</h3>
                    </div>

                    <button
                      className="text-button"
                      type="button"
                      onClick={() => openPreparingMessage('알림 모두 읽음')}
                    >
                      모두 읽음
                    </button>
                  </div>

                  {role === 'admin' && hygieneAlerts.length ? (
                    <>
                      <div className="notification-list">
                        {hygieneAlerts.slice(0, NOTIFICATION_LIMIT).map((item) => (
                          <button
                            className="notification-item"
                            type="button"
                            key={`${item.store}-${item.action}`}
                            data-backend-ready="true"
                            onClick={() => {
                              setPage('hygiene')
                              setNotificationOpen(false)
                            }}
                          >
                            <span className={`alert-dot ${item.priority === '긴급' ? 'danger' : 'warning'}`}></span>
                            <div>
                              <strong>{item.store} · {item.action}</strong>
                              <p>{item.description}</p>
                              <small>{item.priority}</small>
                            </div>
                          </button>
                        ))}
                      </div>

                      {hygieneAlerts.length > NOTIFICATION_LIMIT && (
                        <button
                          className="popover-wide-button"
                          type="button"
                          onClick={() => {
                            setPage('hygiene')
                            setNotificationOpen(false)
                          }}
                        >
                          더보기 — 위생 점검 페이지에서 전체 보기
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="notification-list">
                        <button
                          className="notification-item"
                          type="button"
                          data-backend-ready="true"
                          onClick={() => {
                            setPage(role === 'admin' ? 'forecast' : 'orders')
                            setNotificationOpen(false)
                          }}
                        >
                          <span className="alert-dot info"></span>
                          <div>
                            <strong>최신 운영 데이터를 확인하세요</strong>
                            <p>저장된 {role === 'admin' ? '매장 위험 정보' : '발주 추천 정보'}로 이동합니다.</p>
                            <small>실시간 데이터</small>
                          </div>
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    className="popover-wide-button"
                    type="button"
                    onClick={() => {
                      setPage(role === 'admin' ? 'forecast' : 'hygiene')
                      setNotificationOpen(false)
                    }}
                  >
                    관련 화면으로 이동
                  </button>
                </div>
              )}
            </div>

            <div className="topbar-popover-wrap">
              <button
                className={`profile profile-button ${profileMenuOpen ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev)
                  setNotificationOpen(false)
                }}
              >
                <span>{account.name.slice(0, 1)}</span>
                <div>
                  <strong>{account.name}</strong>
                  <small>{role === 'admin' ? '본사 관리자' : `가맹점주 · 매장 #${account.storeId ?? '-'}`}</small>
                </div>
                <b>⌄</b>
              </button>

              {profileMenuOpen && (
                <div className="profile-popover">
                  <div className="profile-popover-head">
                    <span>{account.name.slice(0, 1)}</span>

                    <div>
                      <strong>{account.name}</strong>
                      <small>{role === 'admin' ? '본사 관리자' : `매장 #${account.storeId ?? '미배정'}`}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openPreparingMessage('개인정보 수정')}
                  >
                    개인정보 수정
                  </button>

                  <button
                    type="button"
                    onClick={() => openPreparingMessage('계정 설정')}
                  >
                    계정 설정
                  </button>

                  <button
                    className="logout-menu-button"
                    type="button"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          {page === 'overview'
            ? role === 'admin'
              ? <AdminOverview go={setPage} />
              : account.storeId
                ? <OwnerOverview go={setPage} storeId={account.storeId} name={account.name} />
                : <UnlinkedStore />
            : page === 'loadingPreview'
            ? <LoadingPreviewPage />
            : <ModulePage
                page={page}
                role={role}
                account={account}
                detailAddress={detailAddress}
                openStoreDetail={openStoreDetail}
                backToStoreList={() => setPage('storeRiskList')}
                storeListInitialSort={storeListInitialSort}
                onStoreListSortConsumed={() => setStoreListInitialSort(undefined)}
                goToStoreListBySales={goToStoreListBySales}
              />}
        </main>

        <Footer />
      </div>

      {toastMessage && (
        <div className="app-toast">
          <strong>안내</strong>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default App
