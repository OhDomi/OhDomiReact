type ApiDataStateProps = {
  loading: boolean
  error: string
  retry: () => void
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

  return (
    <section className="panel" style={{ margin: '40px', textAlign: 'center' }}>
      <h2>데이터를 불러오지 못했습니다</h2>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-action" type="button" onClick={retry}>다시 시도</button>
    </section>
  )
}

export default ApiDataState
