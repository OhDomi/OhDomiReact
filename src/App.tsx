import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

type Role = 'owner' | 'admin'
type Page = 'overview' | 'stores' | 'hygiene' | 'sales' | 'forecast' | 'orders'

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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

const salesData = [
  { day: '월', value: 62 }, { day: '화', value: 72 }, { day: '수', value: 55 },
  { day: '목', value: 83 }, { day: '금', value: 68 }, { day: '토', value: 96 }, { day: '일', value: 78 },
]

const alerts = [
  { level: '긴급', tone: 'danger', title: '강남역점 위생 점검 필요', detail: 'AI 사진 분석에서 조리대 오염 가능성이 감지되었습니다.', time: '10분 전' },
  { level: '주의', tone: 'warning', title: '연어 재고 부족 예상', detail: '내일 예상 사용량 대비 현재 재고가 18% 부족합니다.', time: '32분 전' },
  { level: '안내', tone: 'info', title: '주간 매출 리포트 도착', detail: '전주 대비 전체 매출이 8.4% 증가했습니다.', time: '1시간 전' },
]

const stores = [
  { name: '강남역점', owner: '김도윤', sales: '₩4,820,000', score: 72, risk: '높음', phone: '010-4820-1593', address: '서울 강남구 테헤란로 18길 12', opened: '2023. 04. 18', contract: '2027. 04. 17', orders: '582건', lastCheck: '오늘 09:40' },
  { name: '성수점', owner: '이서준', sales: '₩5,140,000', score: 94, risk: '안전', phone: '010-7412-8850', address: '서울 성동구 연무장길 42', opened: '2022. 11. 02', contract: '2027. 11. 01', orders: '634건', lastCheck: '오늘 08:55' },
  { name: '잠실점', owner: '박지우', sales: '₩3,760,000', score: 86, risk: '보통', phone: '010-3387-2140', address: '서울 송파구 올림픽로 35길 10', opened: '2024. 01. 12', contract: '2027. 01. 11', orders: '461건', lastCheck: '어제 18:20' },
  { name: '여의도점', owner: '최하늘', sales: '₩4,250,000', score: 91, risk: '안전', phone: '010-9061-3724', address: '서울 영등포구 국제금융로 8길 16', opened: '2023. 08. 25', contract: '2026. 08. 24', orders: '518건', lastCheck: '오늘 10:15' },
]

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>('owner')
  const [error, setError] = useState('')
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (!form.get('email') || !form.get('password')) return setError('아이디와 비밀번호를 입력해 주세요.')
    onLogin(role)
  }

  return <main className="login-page">
    <section className="login-story">
      <a className="brand brand-light" href="#top"><span className="brand-mark">O</span><span>oh!domi</span></a>
      <div className="story-copy">
        <span className="kicker light">SMART FRANCHISE PARTNER</span>
        <h1>매장의 오늘을 읽고,<br/>내일을 준비합니다.</h1>
        <p>AI 기반 위생 점검부터 매출·발주 예측까지.<br/>오도미가 매장 운영의 모든 순간을 함께합니다.</p>
        <div className="story-stats">
          <div><strong>98.7%</strong><span>예측 정확도</span></div>
          <div><strong>24h</strong><span>실시간 모니터링</span></div>
          <div><strong>126</strong><span>함께하는 매장</span></div>
        </div>
      </div>
      <p className="login-copyright">© 2026 OhDomi. Better stores, together.</p>
    </section>
    <section className="login-side">
      <div className="login-card">
        <span className="mobile-brand brand"><span className="brand-mark">O</span><span>oh!domi</span></span>
        <span className="kicker">WELCOME BACK</span>
        <h2>다시 만나 반가워요</h2>
        <p className="muted">계정 정보를 입력해 대시보드로 이동하세요.</p>
        <div className="role-switch" role="group" aria-label="로그인 유형">
          <button className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}>가맹점주</button>
          <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>관리자</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>아이디<input name="email" placeholder="아이디를 입력하세요" defaultValue="demo" /></label>
          <label>비밀번호<input name="password" type="password" placeholder="비밀번호를 입력하세요" defaultValue="1234" /></label>
          <div className="form-options"><label className="check-label"><input type="checkbox"/> 로그인 유지</label><button type="button" className="text-button">비밀번호 찾기</button></div>
          {error && <p className="form-error">{error}</p>}
          <button className="login-button" type="submit">로그인 <Icon name="arrow" size={18}/></button>
        </form>
        <p className="signup-copy">처음 방문하셨나요? <button className="text-button">회원가입</button></p>
        <div className="demo-note">데모: 유형을 선택한 뒤 바로 로그인해 보세요.</div>
      </div>
    </section>
  </main>
}

function Sidebar({ role, page, setPage, logout }: { role: Role; page: Page; setPage: (p: Page) => void; logout: () => void }) {
  const ownerNav: {id: Page; label: string; icon: string}[] = [
    { id: 'overview', label: '대시보드', icon: 'overview' }, { id: 'hygiene', label: '위생·품질 점검', icon: 'hygiene' },
    { id: 'sales', label: '매출 현황', icon: 'sales' }, { id: 'forecast', label: '수요·발주 예측', icon: 'forecast' }, { id: 'orders', label: '발주 관리', icon: 'orders' },
  ]
  const adminNav: {id: Page; label: string; icon: string}[] = [
    { id: 'overview', label: '통합 대시보드', icon: 'overview' }, { id: 'stores', label: '가맹점 관리', icon: 'stores' },
    { id: 'hygiene', label: '위생 점검', icon: 'hygiene' }, { id: 'sales', label: '매출 분석', icon: 'sales' }, { id: 'forecast', label: '리스크 예측', icon: 'forecast' },
  ]
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">O</span><span>oh!domi</span></div>
    <div className="workspace-label">{role === 'admin' ? '본사 관리자' : '강남역점'}</div>
    <nav>{(role === 'admin' ? adminNav : ownerNav).map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}><Icon name={item.icon}/><span>{item.label}</span>{item.id === 'hygiene' && <i>2</i>}</button>)}</nav>
    <div className="sidebar-help"><span>?</span><strong>도움이 필요하신가요?</strong><small>운영지원팀 02-1234-5678</small></div>
    <button className="logout-button" onClick={logout}><Icon name="logout"/><span>로그아웃</span></button>
  </aside>
}

function Metric({ label, value, change, icon, tone = '' }: { label: string; value: string; change: string; icon: string; tone?: string }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon name={icon}/></div><div><span>{label}</span><strong>{value}</strong><small>{change}</small></div></article>
}

function SalesChart() {
  return <div className="chart-wrap"><div className="chart-scale"><span>200만</span><span>150만</span><span>100만</span><span>50만</span><span>0</span></div><div className="bar-chart">{salesData.map((item, index) => <div className="bar-column" key={item.day}><div className="bar-value" style={{height: `${item.value}%`}}>{index === 5 && <span>₩1.92M</span>}</div><small>{item.day}</small></div>)}</div></div>
}

function OwnerOverview({ go }: { go: (p: Page) => void }) {
  return <>
    <header className="page-heading"><div><span className="kicker">2026년 7월 21일 화요일</span><h1>좋은 아침이에요, 김도윤 점주님</h1><p>강남역점의 오늘 운영 현황을 한눈에 확인하세요.</p></div><button className="primary-action" onClick={() => go('orders')}>+ 빠른 발주</button></header>
    <section className="metrics-grid"><Metric label="오늘 예상 매출" value="₩1,580,000" change="↑ 7.4% 어제보다" icon="sales"/><Metric label="예상 주문" value="198건" change="↑ 12건 어제보다" icon="orders" tone="purple"/><Metric label="위생 점수" value="92점" change="양호 · 최근 점검 09:40" icon="hygiene" tone="green"/><Metric label="발주 필요 품목" value="2개" change="오늘 확인 필요" icon="bell" tone="orange"/></section>
    <section className="dashboard-grid">
      <article className="panel chart-panel"><div className="panel-head"><div><span className="panel-label">SALES OVERVIEW</span><h2>이번 주 매출</h2></div><button className="select-button">최근 7일⌄</button></div><SalesChart/><div className="chart-summary"><span>주간 누적 매출</span><strong>₩10,420,000</strong><em>+8.4%</em></div></article>
      <article className="panel order-preview"><div className="panel-head"><div><span className="panel-label">SMART ORDER</span><h2>AI 발주 추천</h2></div><button className="link-button" onClick={() => go('forecast')}>전체 보기 <Icon name="arrow" size={16}/></button></div>
        <div className="stock-item critical"><div className="stock-icon">🐟</div><div><strong>연어</strong><span>현재 22L · 예상 28L</span></div><b>+16L</b></div>
        <div className="stock-item"><div className="stock-icon">🥚</div><div><strong>날치알</strong><span>현재 45개 · 예상 35개</span></div><b>+10개</b></div>
        <div className="stock-item safe"><div className="stock-icon">🍜</div><div><strong>메밀면</strong><span>현재 8.5kg · 예상 6.2kg</span></div><b>충분</b></div>
        <button className="wide-button" onClick={() => go('orders')}>추천 수량으로 발주하기 <Icon name="arrow" size={17}/></button>
      </article>
      <article className="panel hygiene-preview"><div className="panel-head"><div><span className="panel-label">QUALITY CHECK</span><h2>위생·품질 점검</h2></div><span className="status-pill success">● 정상</span></div><div className="hygiene-score"><div className="score-ring"><strong>92</strong><small>/ 100</small></div><div><strong>매장 상태가 양호해요</strong><p>마지막 AI 점검: 오늘 09:40</p><div className="mini-checks"><span><Icon name="check" size={15}/>조리대</span><span><Icon name="check" size={15}/>냉장고</span><span><Icon name="check" size={15}/>홀</span></div></div></div><button className="outline-button" onClick={() => go('hygiene')}><Icon name="camera" size={18}/> 새 사진으로 점검하기</button></article>
      <article className="panel alerts-preview"><div className="panel-head"><div><span className="panel-label">NOTIFICATIONS</span><h2>오늘의 알림</h2></div><span className="count-badge">3</span></div>{alerts.slice(0,2).map(a => <div className="mini-alert" key={a.title}><span className={`alert-dot ${a.tone}`}></span><div><strong>{a.title}</strong><small>{a.time}</small></div></div>)}</article>
    </section>
  </>
}

function AdminOverview({ go }: { go: (p: Page) => void }) {
  return <><header className="page-heading"><div><span className="kicker">HEADQUARTERS CONTROL CENTER</span><h1>통합 운영 현황</h1><p>126개 가맹점의 핵심 지표와 위험 신호를 확인하세요.</p></div><button className="primary-action" onClick={() => go('stores')}>가맹점 리포트</button></header>
    <section className="metrics-grid"><Metric label="전체 가맹점" value="126개" change="+3개 이번 달" icon="stores"/><Metric label="오늘 통합 매출" value="₩186.4M" change="↑ 8.4% 지난주 대비" icon="sales" tone="purple"/><Metric label="위생 점검 완료" value="118 / 126" change="8개 매장 확인 필요" icon="hygiene" tone="green"/><Metric label="위험 알림" value="7건" change="긴급 2 · 주의 5" icon="bell" tone="orange"/></section>
    <section className="admin-grid"><article className="panel alert-center"><div className="panel-head"><div><span className="panel-label">LIVE ALERTS</span><h2>통합 알림함</h2></div><button className="link-button">모두 읽음</button></div>{alerts.map(a => <div className="alert-row" key={a.title}><span className={`alert-level ${a.tone}`}>{a.level}</span><div><strong>{a.title}</strong><p>{a.detail}</p></div><time>{a.time}</time></div>)}</article>
    <article className="panel risk-summary"><div className="panel-head"><div><span className="panel-label">RISK MONITOR</span><h2>가맹점 위험 분포</h2></div></div><div className="donut"><div><strong>126</strong><span>전체 매장</span></div></div><div className="legend"><span><i className="safe"></i>안전 <b>102</b></span><span><i className="warning"></i>주의 <b>17</b></span><span><i className="danger"></i>위험 <b>7</b></span></div><button className="outline-button" onClick={() => go('stores')}>상세 리스크 보기</button></article>
    <article className="panel store-table wide"><div className="panel-head"><div><span className="panel-label">STORE STATUS</span><h2>가맹점 현황</h2></div><button className="link-button" onClick={() => go('stores')}>전체 보기 <Icon name="arrow" size={16}/></button></div><StoreTable compact/></article></section>
  </>
}

function StoreTable({ compact = false, onSelect, selected }: { compact?: boolean; onSelect?: (store: typeof stores[number]) => void; selected?: string }) {
  const shown = compact ? stores.slice(0,3) : stores
  return <div className="table-scroll"><table className={`data-table ${onSelect ? 'selectable' : ''}`}><thead><tr><th>가맹점</th><th>점주</th><th>오늘 매출</th><th>위생 점수</th><th>리스크</th><th></th></tr></thead><tbody>{shown.map(store => <tr className={selected === store.name ? 'selected' : ''} key={store.name} onClick={() => onSelect?.(store)}><td><span className="store-avatar">{store.name[0]}</span><strong>{store.name}</strong></td><td>{store.owner}</td><td>{store.sales}</td><td><b>{store.score}</b>점</td><td><span className={`risk-tag ${store.risk === '높음' ? 'high' : store.risk === '보통' ? 'medium' : 'low'}`}>{store.risk}</span></td><td><button className="detail-button" onClick={(event) => { event.stopPropagation(); onSelect?.(store) }}>{onSelect ? '상세' : '•••'}</button></td></tr>)}</tbody></table></div>
}

function StoreDetail({ store, close }: { store: typeof stores[number]; close: () => void }) {
  return <div className="detail-backdrop" onClick={close}><aside className="store-detail" onClick={(event) => event.stopPropagation()} aria-label={`${store.name} 상세정보`}>
    <div className="detail-top"><div className="detail-store-icon">{store.name[0]}</div><div><span className="panel-label">STORE PROFILE</span><h2>{store.name}</h2><p>{store.address}</p></div><button className="detail-close" onClick={close} aria-label="닫기">×</button></div>
    <div className="detail-status"><span className={`risk-tag ${store.risk === '높음' ? 'high' : store.risk === '보통' ? 'medium' : 'low'}`}>리스크 {store.risk}</span><span className="status-pill success">● 정상 운영</span></div>
    <section className="detail-section"><h3>가맹점 기본 정보</h3><dl className="detail-list"><div><dt>점주명</dt><dd>{store.owner}</dd></div><div><dt>연락처</dt><dd>{store.phone}</dd></div><div><dt>오픈일</dt><dd>{store.opened}</dd></div><div><dt>계약 만료일</dt><dd>{store.contract}</dd></div></dl></section>
    <section className="detail-section"><h3>오늘 운영 현황</h3><div className="detail-metrics"><div><span>매출</span><strong>{store.sales}</strong></div><div><span>주문</span><strong>{store.orders}</strong></div><div><span>위생 점수</span><strong>{store.score}점</strong></div><div><span>최근 점검</span><strong>{store.lastCheck}</strong></div></div></section>
    <section className="detail-section"><div className="detail-title-row"><h3>최근 특이사항</h3><button className="link-button">전체 이력</button></div><div className="detail-notice"><span className={`alert-dot ${store.risk === '높음' ? 'danger' : 'info'}`}></span><div><strong>{store.risk === '높음' ? '위생 개선 확인이 필요합니다' : '특이사항 없이 정상 운영 중입니다'}</strong><p>{store.risk === '높음' ? '조리대 점검 사진에서 청결도 저하 가능성이 감지되었습니다.' : '최근 점검 및 운영 지표가 기준 범위 내에 있습니다.'}</p></div></div></section>
    <div className="detail-actions"><button className="outline-button">점주에게 연락</button><button className="primary-action">운영 리포트 보기</button></div>
  </aside></div>
}

function ModulePage({ page, role }: { page: Page; role: Role }) {
  const [selectedStore, setSelectedStore] = useState<typeof stores[number] | null>(null)
  const content = useMemo(() => ({
    stores: { kicker: 'FRANCHISE NETWORK', title: '가맹점 관리', copy: '매장별 운영 현황과 재계약 리스크를 한곳에서 관리하세요.' },
    hygiene: { kicker: 'AI QUALITY INSPECTION', title: '위생·품질 점검', copy: role === 'admin' ? '가맹점 점검 사진과 AI 분석 결과를 확인하세요.' : '매장 사진을 올리면 AI가 위생 상태를 바로 분석합니다.' },
    sales: { kicker: 'SALES ANALYTICS', title: '매출 현황', copy: role === 'admin' ? '전체 가맹점의 매출 흐름과 성과를 비교하세요.' : '일별·주별 매출 흐름과 주문 추이를 확인하세요.' },
    forecast: { kicker: 'AI DEMAND FORECAST', title: role === 'admin' ? '리스크 예측' : '수요·발주 예측', copy: '판매 데이터와 현재 재고를 기반으로 다음 수요를 예측합니다.' },
    orders: { kicker: 'ORDER MANAGEMENT', title: '발주 관리', copy: 'AI 추천 수량을 검토하고 필요한 식자재를 발주하세요.' },
    overview: { kicker: '', title: '', copy: '' },
  })[page], [page, role])
  if (page === 'stores') return <><header className="page-heading"><div><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.copy}</p></div><button className="primary-action">+ 가맹점 등록</button></header><section className="panel full-module"><div className="module-toolbar"><div className="search-box"><Icon name="search" size={18}/><input placeholder="가맹점명 또는 점주 검색"/></div><button className="select-button">전체 리스크⌄</button></div><StoreTable onSelect={setSelectedStore} selected={selectedStore?.name}/></section>{selectedStore && <StoreDetail store={selectedStore} close={() => setSelectedStore(null)}/>}</>
  if (page === 'hygiene' && role === 'admin') return <><header className="page-heading"><div><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.copy}</p></div><button className="select-button">최근 7일⌄</button></header><section className="metrics-grid three"><Metric label="오늘 점검 완료" value="118개" change="전체 126개 매장" icon="hygiene" tone="green"/><Metric label="검토 필요" value="8개" change="긴급 2 · 주의 6" icon="bell" tone="orange"/><Metric label="평균 위생 점수" value="89.4점" change="↑ 1.8점 지난주 대비" icon="forecast" tone="purple"/></section><section className="panel full-module"><div className="panel-head"><div><span className="panel-label">STORE INSPECTIONS</span><h2>가맹점별 최근 점검</h2></div><div className="search-box"><Icon name="search" size={17}/><input placeholder="가맹점 검색"/></div></div><div className="inspection-grid">{stores.map((store, index) => <article className="inspection-store-card" key={store.name}><div className={`inspection-photo photo-${index + 1}`}><span><Icon name="camera" size={20}/>{index === 0 ? '조리대 점검 사진' : '매장 점검 사진'}</span></div><div className="inspection-card-body"><div><span className="store-avatar">{store.name[0]}</span><div><strong>{store.name}</strong><small>{store.lastCheck}</small></div><b className={store.score < 80 ? 'score-low' : ''}>{store.score}점</b></div><p>{index === 0 ? '조리대 청결 상태 재확인이 필요합니다.' : 'AI 분석 결과 기준 범위 내 정상입니다.'}</p><button className="outline-button" onClick={() => setSelectedStore(store)}>가맹점 상세정보</button></div></article>)}</div></section>{selectedStore && <StoreDetail store={selectedStore} close={() => setSelectedStore(null)}/>}</>
  if (page === 'hygiene') return <><header className="page-heading"><div><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.copy}</p></div></header><section className="module-columns"><article className="panel upload-panel"><div className="upload-zone"><div className="upload-icon"><Icon name="camera" size={28}/></div><h2>점검 사진 업로드</h2><p>조리대, 냉장고, 홀 사진을 선명하게 촬영해 주세요.</p><button className="primary-action">사진 선택하기</button><small>JPG, PNG · 최대 10MB</small></div></article><article className="panel inspection-result"><span className="panel-label">LATEST ANALYSIS</span><h2>최근 AI 분석 결과</h2><div className="large-score"><strong>92</strong><span>점</span></div><div className="analysis-list"><p><Icon name="check" size={18}/><span><b>조리대 청결</b>오염 요소가 발견되지 않았습니다.</span></p><p><Icon name="check" size={18}/><span><b>식자재 보관</b>분리 보관 상태가 양호합니다.</span></p><p className="warn"><Icon name="bell" size={18}/><span><b>바닥 상태</b>출입구 주변 정리가 필요합니다.</span></p></div></article></section></>
  if (page === 'sales') return <><header className="page-heading"><div><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.copy}</p></div><button className="select-button">2026년 7월⌄</button></header><section className="metrics-grid three"><Metric label="누적 매출" value={role === 'admin' ? '₩3.82B' : '₩38,520,000'} change="↑ 8.4% 전월 대비" icon="sales"/><Metric label="총 주문" value={role === 'admin' ? '486,230건' : '4,762건'} change="↑ 6.8% 전월 대비" icon="orders" tone="purple"/><Metric label="평균 객단가" value="₩8,090" change="↑ 1.2% 전월 대비" icon="forecast" tone="green"/></section><article className="panel full-module"><div className="panel-head"><div><span className="panel-label">REVENUE TREND</span><h2>매출 추이</h2></div><div className="tab-set"><button>일간</button><button className="active">주간</button><button>월간</button></div></div><SalesChart/></article></>
  const isOrder = page === 'orders'
  return <><header className="page-heading"><div><span className="kicker">{content.kicker}</span><h1>{content.title}</h1><p>{content.copy}</p></div>{isOrder && <button className="primary-action">발주 내역</button>}</header><section className="panel full-module recommendation-page"><div className="forecast-banner"><div><span>AI PREDICTION</span><h2>{role === 'admin' ? '이번 주 위험 매장 7곳을 확인했어요' : '내일은 오늘보다 주문이 12% 늘어날 전망이에요'}</h2><p>최근 8주 판매량, 날씨, 요일 데이터를 종합한 결과입니다.</p></div><div className="confidence"><strong>98.7%</strong><span>예측 신뢰도</span></div></div><div className="recommendation-table"><div className="recommendation-head"><span>품목</span><span>현재 재고</span><span>예상 사용량</span><span>AI 추천</span><span>{isOrder ? '발주 수량' : '재고 위험'}</span></div>{[['연어','22 kg','28 kg','16 kg','높음'],['날치알','45 ea','35 ea','10 ea','보통'],['메밀면','8.5 kg','6.2 kg','0 kg','안전'],['소스','18 L','15 L','5 L','안전']].map(row => <div className="recommendation-row" key={row[0]}>{row.slice(0,4).map((v,i)=><span key={v}>{i===0?<strong>{v}</strong>:v}</span>)}<span>{isOrder ? <input defaultValue={row[3]}/> : <span className={`risk-tag ${row[4] === '높음' ? 'high' : row[4] === '보통' ? 'medium' : 'low'}`}>{row[4]}</span>}</span></div>)}</div>{isOrder && <div className="order-footer"><div><span>예상 발주 금액</span><strong>₩428,500</strong></div><button className="primary-action">발주 요청 보내기 <Icon name="arrow" size={17}/></button></div>}</section></>
}

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [page, setPage] = useState<Page>('overview')
  if (!role) return <Login onLogin={(nextRole) => { setRole(nextRole); setPage('overview') }}/>
  return <div className="app-layout"><Sidebar role={role} page={page} setPage={setPage} logout={() => setRole(null)}/><div className="app-main"><header className="topbar"><button className="mobile-menu" aria-label="메뉴">☰</button><div className="top-search"><Icon name="search" size={18}/><input placeholder="매장, 메뉴, 리포트 검색"/></div><div className="top-actions"><button className="icon-button"><Icon name="bell"/><i></i></button><div className="profile"><span>{role === 'admin' ? '관' : '김'}</span><div><strong>{role === 'admin' ? '본사 관리자' : '김도윤'}</strong><small>{role === 'admin' ? '운영관리팀' : '강남역점 점주'}</small></div><b>⌄</b></div></div></header><main className="content">{page === 'overview' ? (role === 'admin' ? <AdminOverview go={setPage}/> : <OwnerOverview go={setPage}/>) : <ModulePage page={page} role={role}/>}</main></div></div>
}

export default App
