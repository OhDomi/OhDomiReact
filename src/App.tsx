import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
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
import RegisterPage from './pages/Auth/RegisterPage'
import { loginAccount } from './api/authApi'
import type { LoginResponse } from './api/authApi'
import { useApiData } from './api/useApiData'
import ApiDataState from './api/ApiDataState'

type Role = 'owner' | 'admin'
type Page = 'overview' | 'stores' | 'hygiene' | 'sales' | 'forecast' | 'orders' | 'board'

const icons: Record<string, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  stores: <><path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M8 20v-6h4v6"/><path d="M3 10c0 2 4 2 4 0 0 2 5 2 5 0 0 2 5 2 5 0 0 2 4 2 4 0"/></>,
  hygiene: <><path d="M12 3l7 3v5c0 4.8-3 8.4-7 10-4-1.6-7-5.2-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/></>,
  sales: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
  forecast: <><path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/></>,
  orders: <><path d="M6 7h14l-2 9H8L6 4H3"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></>,
  bell: <><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  arrow: <><path d="M5 12h14"/><path d="M14 7l5 5-5 5"/></>,
  camera: <><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></>,
  check: <path d="M5 12l4 4L19 6"/>,
  logout: <><path d="M10 5V3H4v18h6v-2"/><path d="M13 8l5 4-5 4"/><path d="M18 12H8"/></>,
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
  hygiene: { adminHygieneSummary: { checkedStores: number; pendingStores: number } }
  sales: { adminSalesSummary: { todayTotalSales: string } }
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
                pattern="[A-Za-z0-9._-]+"
                required
              />
            </label>

            <label>
              비밀번호
              <input
                name="password"
                type="password"
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
  ]

  const adminNav: { id: Page; label: string; icon: string }[] = [
    { id: 'overview', label: '통합 대시보드', icon: 'overview' },
    { id: 'stores', label: '가맹점 관리', icon: 'stores' },
    { id: 'hygiene', label: '위생 점검', icon: 'hygiene' },
    { id: 'sales', label: '매출 분석', icon: 'sales' },
    { id: 'forecast', label: '리스크 예측', icon: 'forecast' },
    { id: 'board', label: '공지/문의게시판', icon: 'bell' },
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
        <Metric label="예상 주문" value={`${orders.orderSummary.expectedOrders}건`} change="MySQL 주문 집계" icon="orders" tone="purple" />
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
        <Metric label="전체 가맹점" value={`${totalStores}개`} change="MySQL 등록 매장" icon="stores" />
        <Metric label="오늘 통합 매출" value={sales.adminSalesSummary.todayTotalSales} change="전체 주문 집계" icon="sales" tone="purple" />
        <Metric label="위생 점검 완료" value={`${hygiene.adminHygieneSummary.checkedStores} / ${totalStores}`} change={`${hygiene.adminHygieneSummary.pendingStores}개 매장 확인 필요`} icon="hygiene" tone="green" />
        <Metric label="위험 알림" value={`${risks.riskSummary.highRiskStores + risks.riskSummary.warningStores}건`} change={`긴급 ${risks.riskSummary.highRiskStores} · 주의 ${risks.riskSummary.warningStores}`} icon="bell" tone="orange" />
      </section>

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

          <button className="outline-button" type="button" onClick={() => go('stores')}>
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

function ModulePage({ page, role, account }: { page: Page; role: Role; account: LoginResponse }) {
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
    return <AdminSalesAnalysis />
  }

  if (role === 'admin' && page === 'forecast') {
    return <AdminRiskPrediction />
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
  return <section className="panel full-module"><h2>연결된 매장이 없습니다</h2><p>이 계정에 매장이 배정되면 MySQL의 운영 데이터를 확인할 수 있습니다.</p></section>
}

function App() {
  const [account, setAccount] = useState<LoginResponse | null>(null)
  const [page, setPage] = useState<Page>('overview')
  const role: Role | null = account
    ? account.role === 'ADMIN' ? 'admin' : 'owner'
    : null

  if (!role) {
    return (
      <Login
        onLogin={(loggedInAccount) => {
          setAccount(loggedInAccount)
          setPage('overview')
        }}
      />
    )
  }

  return (
    <div className="app-layout">
      <Sidebar
        role={role}
        page={page}
        setPage={setPage}
        logout={() => setAccount(null)}
      />

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="메뉴">☰</button>

          <div className="top-search">
            <Icon name="search" size={18} />
            <input placeholder="매장, 메뉴, 리포트 검색" />
          </div>

          <div className="top-actions">
            <button className="icon-button" type="button">
              <Icon name="bell" />
              <i></i>
            </button>

            <div className="profile">
              <span>{account?.name.slice(0, 1) ?? '?'}</span>
              <div>
                <strong>{account?.name}</strong>
                <small>{role === 'admin' ? '본사 관리자' : `가맹점주 · 매장 #${account?.storeId ?? '-'}`}</small>
              </div>
              <b>⌄</b>
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
            : <ModulePage page={page} role={role} account={account} />}
        </main>
      </div>
    </div>
  )
}

export default App
