import './HygieneCheck.css'
import type {
  hygieneItems,
  hygieneSummary,
  improvementTasks,
  recentInspections,
} from './hygieneCheckDummy'
import { useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'

type HygieneData = {
  hygieneItems: typeof hygieneItems
  hygieneSummary: typeof hygieneSummary
  improvementTasks: typeof improvementTasks
  recentInspections: typeof recentInspections
}

function HygieneCheck({ storeId }: { storeId: number }) {
  const api = useApiData<HygieneData>(`/api/ui/stores/${storeId}/hygiene`)
  if (!api.data) return <ApiDataState loading={api.loading} error={api.error} retry={api.retry} />
  const { hygieneItems, hygieneSummary, improvementTasks, recentInspections } = api.data

  return (
    <div className="hygiene-page">
      <header className="page-heading">
        <div>
          <span className="kicker">AI QUALITY INSPECTION</span>
          <h1>위생·품질 점검</h1>
          <p>매장 사진을 업로드하고 AI 분석 결과와 개선 필요 항목을 확인하세요.</p>
        </div>

        <button className="primary-action" type="button">
          새 점검 시작
        </button>
      </header>

      <article className="panel wide-panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">IMPROVEMENT TASKS</span>
            <h2>개선 필요 항목</h2>
          </div>

          <button className="outline-button compact-button" type="button">
            재점검 요청
          </button>
        </div>

        <div className="improvement-list">
          {improvementTasks.map((task) => (
            <div className="improvement-card" key={task.title}>
              <span className={`task-priority ${task.priority === '주의' ? 'warning' : 'info'}`}>
                {task.priority}
              </span>

              <div>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>

              <button className="detail-button" type="button">
                확인
              </button>
            </div>
          ))}
        </div>
      </article>

      <section className="hygiene-layout">
        <article className="panel upload-panel advanced-upload">
          <div className="upload-zone">
            <div className="upload-icon">📷</div>
            <h2>점검 사진 업로드</h2>
            <p>조리대, 냉장고, 홀, 출입구 사진을 선명하게 촬영해 주세요.</p>

            <button className="primary-action" type="button">
              사진 선택하기
            </button>

            <small>JPG, PNG · 최대 10MB</small>
          </div>

          <div className="upload-guide">
            <strong>촬영 가이드</strong>
            <ul>
              <li>조리대 전체가 보이도록 촬영</li>
              <li>냉장고 내부 식자재 보관 상태 촬영</li>
              <li>홀 바닥과 출입구 주변 정리 상태 촬영</li>
            </ul>
          </div>
        </article>

        <article className="panel ai-result-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">AI ANALYSIS RESULT</span>
              <h2>AI 분석 결과</h2>
            </div>

            <span className="status-pill success">● 양호</span>
          </div>

          <div className="hygiene-score-box">
            <div className="score-ring big-score">
              <strong>{hygieneSummary.score}</strong>
              <small>/ 100</small>
            </div>

            <div>
              <strong>매장 위생 상태가 양호해요</strong>
              <p>
                대부분의 점검 항목이 기준을 충족했습니다.
                다만 출입구 주변 정리 상태는 한 번 더 확인이 필요합니다.
              </p>
            </div>
          </div>

          <div className="recent-inspection-list">
            {recentInspections.map((item) => (
              <div key={item.date}>
                <span>{item.date}</span>
                <strong>{item.score}점</strong>
                <em className={item.result === '주의' ? 'warning' : ''}>{item.result}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">CHECK ITEMS</span>
              <h2>점검 항목별 상태</h2>
            </div>

            <button className="select-button" type="button">
              전체 항목
            </button>
          </div>

          <div className="hygiene-item-grid">
            {hygieneItems.map((item) => (
              <div className="hygiene-item-card" key={item.name}>
                <div className="hygiene-item-top">
                  <strong>{item.name}</strong>
                  <span className={`hygiene-status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="hygiene-progress">
                  <div style={{ width: `${Math.min(item.score, 100)}%` }}></div>
                </div>

                <div className="hygiene-item-bottom">
                  <span>{item.score}점</span>
                  <p>{item.memo}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === '정상') return 'safe'
  if (status === '주의') return 'warning'
  return 'danger'
}

export default HygieneCheck