type ApiDataStateProps = {
  loading: boolean
  error: string
  retry: () => void
}

function ApiDataState({ loading, error, retry }: ApiDataStateProps) {
  return (
    <section className="panel" style={{ margin: '40px', textAlign: 'center' }}>
      <h2>{loading ? 'MySQL 데이터를 불러오는 중입니다' : '데이터를 불러오지 못했습니다'}</h2>
      {error && <p className="form-error">{error}</p>}
      {!loading && <button className="primary-action" type="button" onClick={retry}>다시 시도</button>}
    </section>
  )
}

export default ApiDataState
