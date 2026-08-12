import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { error: Error | null }

// 2026-08-12: 렌더링 중 에러가 나면 React가 트리 전체를 언마운트해 흰 화면만 남았음 —
// 최상위에 하나 둬서 "새로고침" 버튼이 있는 화면으로라도 복구되게 함.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="app-boot-loading" style={{ flexDirection: 'column', gap: 18 }}>
        <section className="panel" style={{ maxWidth: 420, textAlign: 'center' }}>
          <h2>문제가 발생했습니다</h2>
          <p className="form-error" style={{ margin: '8px 0 18px' }}>
            화면을 표시하는 중 오류가 났습니다. 새로고침하면 대부분 복구됩니다.
          </p>
          <button className="primary-action" type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </section>
      </div>
    )
  }
}

export default ErrorBoundary
