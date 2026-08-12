import './ApiDataState.css'

type ApiDataStateProps = {
  loading: boolean
  error: string
  retry: () => void
}

function AlertIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 16.5v.01" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function MetricSkeleton() {
  return (
    <article className="metric-card">
      <div className="metric-icon skeleton-block" />
      <div>
        <span className="skeleton-block skeleton-line" style={{ width: 70, height: 10 }} />
        <strong><span className="skeleton-block skeleton-line" style={{ width: 90, height: 20, margin: '6px 0' }} /></strong>
      </div>
    </article>
  )
}

function ApiDataState({ loading, error, retry }: ApiDataStateProps) {
  if (loading) {
    return (
      <>
        <section className="metrics-grid" aria-busy="true" aria-label="데이터를 불러오는 중">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </section>

        <section className="dashboard-grid">
          <article className="panel" style={{ height: 300 }}>
            <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
            <div className="skeleton-panel-row" style={{ height: 220, marginTop: 22 }}>
              {[40, 65, 50, 80, 60, 90, 55].map((h, i) => (
                <span key={i} className="skeleton-block" style={{ flex: 1, height: `${h}%` }} />
              ))}
            </div>
          </article>

          <article className="panel">
            <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
            <div className="skeleton-panel-row rows" style={{ marginTop: 22 }}>
              <span className="skeleton-block" style={{ height: 44 }} />
              <span className="skeleton-block" style={{ height: 44 }} />
              <span className="skeleton-block" style={{ height: 44 }} />
            </div>
          </article>

          <article className="panel">
            <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
            <div style={{ display: 'flex', gap: 25, marginTop: 22, alignItems: 'center' }}>
              <span className="skeleton-block" style={{ width: 100, height: 100, borderRadius: '50%', flex: '0 0 100px' }} />
              <div style={{ flex: 1 }}>
                <span className="skeleton-block skeleton-line" style={{ width: '80%', height: 12, marginBottom: 10 }} />
                <span className="skeleton-block skeleton-line" style={{ width: '60%', height: 12 }} />
              </div>
            </div>
          </article>

          <article className="panel">
            <span className="skeleton-block skeleton-line" style={{ width: 120 }} />
            <div className="skeleton-panel-row rows" style={{ marginTop: 22 }}>
              <span className="skeleton-block" style={{ height: 40 }} />
              <span className="skeleton-block" style={{ height: 40 }} />
            </div>
          </article>
        </section>
      </>
    )
  }

  // 세션이 끊긴 상태(401)면 "다시 시도"를 눌러도 같은 요청이 같은 이유로 또 실패할 뿐이라
  // 별도로 안내한다 — 새로고침해야 세션 복구 로직(App.tsx의 /api/auth/me 확인)이 다시 돎.
  const isAuthError = /로그인이 필요|권한이 필요/.test(error)

  return (
    <section className="panel api-error-state">
      <div className={`api-error-icon ${isAuthError ? 'auth' : ''}`}>
        {isAuthError ? <LockIcon /> : <AlertIcon />}
      </div>
      <h2>{isAuthError ? '로그인이 필요합니다' : '데이터를 불러오지 못했습니다'}</h2>
      <p>{isAuthError ? '세션이 만료되었거나 로그아웃된 상태입니다. 새로고침하면 로그인 화면으로 이동합니다.' : (error || '잠시 후 다시 시도해 주세요.')}</p>
      <div className="api-error-actions">
        {isAuthError ? (
          <button className="primary-action" type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        ) : (
          <button className="primary-action" type="button" onClick={retry}>다시 시도</button>
        )}
      </div>
    </section>
  )
}

export default ApiDataState
