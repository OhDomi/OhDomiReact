import { useEffect, useMemo, useState } from 'react'
import ApiDataState from '../../api/ApiDataState'
import { getLatestRiskAssessments } from '../../api/riskApi'
import type { RiskAssessment, RiskLevel } from '../../types/risk'
import ShapFactorCard from './ShapFactorCard'
import './AdminRiskPrediction.css'

function AdminRiskPrediction() {
  const [risks, setRisks] = useState<RiskAssessment[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [level, setLevel] = useState<RiskLevel | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    getLatestRiskAssessments(level, controller.signal)
      .then((data) => {
        setRisks(data)
        setSelectedId((current) => data.some((risk) => risk.riskAssessmentId === current)
          ? current
          : data[0]?.riskAssessmentId ?? null)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : '위험 예측을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [level, requestVersion])

  const selectedRisk = useMemo(
    () => risks?.find((risk) => risk.riskAssessmentId === selectedId) ?? risks?.[0] ?? null,
    [risks, selectedId],
  )

  if (!risks) {
    return (
      <ApiDataState
        loading={loading}
        error={error}
        retry={() => setRequestVersion((version) => version + 1)}
      />
    )
  }

  const highRiskCount = risks.filter((risk) => risk.riskLevel >= 4).length
  const averageScore = risks.length
    ? risks.reduce((sum, risk) => sum + Number(risk.riskScore), 0) / risks.length
    : 0

  return (
    <div className="admin-risk-page">
      <header className="page-heading">
        <div>
          <span className="kicker">AI CLOSURE RISK</span>
          <h1>위험 예측</h1>
          <p>폐점 위험 모델의 점수와 SHAP 근거를 운영 현황과 분리해 확인합니다.</p>
        </div>

        <label className="risk-level-filter">
          <span>위험 등급</span>
          <select
            value={level ?? ''}
            onChange={(event) => setLevel(event.target.value
              ? Number(event.target.value) as RiskLevel
              : undefined)}
          >
            <option value="">전체</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option value={value} key={value}>{value}단계</option>
            ))}
          </select>
        </label>
      </header>

      <section className="risk-model-summary">
        <SummaryCard label="평가 매장" value={`${risks.length}곳`} />
        <SummaryCard label="고위험(4~5단계)" value={`${highRiskCount}곳`} tone="danger" />
        <SummaryCard label="평균 위험 점수" value={`${averageScore.toFixed(1)}점`} />
        <SummaryCard label="최신 모델" value={risks[0]?.modelVersion ?? '-'} compact />
      </section>

      {risks.length === 0 || !selectedRisk ? (
        <section className="panel risk-empty-state">
          <h2>조건에 맞는 위험 평가가 없습니다</h2>
          <p>모델 갱신이 완료되거나 다른 등급을 선택하면 결과가 표시됩니다.</p>
        </section>
      ) : (
        <section className="admin-risk-layout">
          <article className="panel shap-factors-panel">
            <div className="panel-head">
              <div>
                <span className="panel-label">SHAP RISK FACTORS</span>
                <h2>{selectedRisk.storeName} 위험요인</h2>
              </div>
              <small>양수는 위험 증가, 음수는 위험 완화 방향입니다.</small>
            </div>

            {selectedRisk.riskFactors.length ? (
              <div className="shap-factor-grid">
                {(() => {
                  const maxAbsContribution = Math.max(
                    ...selectedRisk.riskFactors.map((factor) => Math.abs(Number(factor.shapContribution))),
                  )
                  return selectedRisk.riskFactors.map((factor) => (
                    <ShapFactorCard factor={factor} maxAbsContribution={maxAbsContribution} key={factor.riskFactorId} />
                  ))
                })()}
              </div>
            ) : (
              <p className="risk-no-factors">저장된 SHAP 위험요인이 없습니다.</p>
            )}
          </article>

          <article className="panel admin-risk-table-panel">
            <div className="panel-head">
              <div>
                <span className="panel-label">LATEST ASSESSMENTS</span>
                <h2>매장별 최신 위험 평가</h2>
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table selectable">
                <thead>
                  <tr>
                    <th>가맹점</th>
                    <th>지역</th>
                    <th>위험 점수</th>
                    <th>위험 등급</th>
                    <th>모델 판단</th>
                    <th>평가 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((risk) => (
                    <tr
                      key={risk.riskAssessmentId}
                      className={selectedRisk.riskAssessmentId === risk.riskAssessmentId ? 'selected' : ''}
                      onClick={() => setSelectedId(risk.riskAssessmentId)}
                    >
                      <td>
                        <span className="store-avatar">{risk.storeName[0]}</span>
                        <strong>{risk.storeName}</strong>
                      </td>
                      <td>{risk.region}</td>
                      <td><b>{Number(risk.riskScore).toFixed(1)}</b>점</td>
                      <td><RiskLevelBadge level={risk.riskLevel} /></td>
                      <td>{risk.classificationDetail ?? '-'}</td>
                      <td>{formatDateTime(risk.assessedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="panel selected-risk-panel">
            <div className="panel-head">
              <div>
                <span className="panel-label">SELECTED STORE</span>
                <h2>{selectedRisk.storeName}</h2>
              </div>
              <RiskLevelBadge level={selectedRisk.riskLevel} />
            </div>

            <div className="selected-risk-score">
              <div className={`risk-score-ring ${riskClass(selectedRisk.riskLevel)}`}>
                <strong>{Number(selectedRisk.riskScore).toFixed(0)}</strong>
                <span>risk score</span>
              </div>
              <div>
                <span className="risk-detail-label">주요 판단 근거</span>
                <strong>{selectedRisk.mainReason ?? '주요 판단 근거가 없습니다.'}</strong>
                <p>{selectedRisk.ownerName} 점주 · {selectedRisk.region}</p>
              </div>
            </div>

            <dl className="selected-risk-info">
              <div>
                <dt>위험 등급</dt>
                <dd>{selectedRisk.riskLevel} / 5</dd>
              </div>
              <div>
                <dt>입지 위험 점수</dt>
                <dd>{selectedRisk.locationRiskScore == null ? '-' : `${Number(selectedRisk.locationRiskScore).toFixed(1)}점`}</dd>
              </div>
            </dl>

            <div className="risk-prediction-box">
              <span>모델 예측</span>
              <strong>{selectedRisk.prediction ?? selectedRisk.classificationDetail ?? '-'}</strong>
              <p>{selectedRisk.recommendedAction ?? '등록된 권고 조치가 없습니다.'}</p>
            </div>
          </aside>
        </section>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone = '',
  compact = false,
}: {
  label: string
  value: string
  tone?: string
  compact?: boolean
}) {
  return (
    <article className={`panel risk-model-summary-card ${tone} ${compact ? 'compact' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return <span className={`risk-level ${riskClass(level)}`}>{level}단계 · {riskLevelLabel(level)}</span>
}

function riskClass(level: RiskLevel) {
  if (level >= 4) return 'danger'
  if (level === 3) return 'warning'
  return 'safe'
}

function riskLevelLabel(level: RiskLevel) {
  if (level >= 4) return '높음'
  if (level === 3) return '주의'
  return '안정'
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default AdminRiskPrediction
