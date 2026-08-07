import type { RiskFactor } from '../../types/risk'

type ShapFactorCardProps = {
  factor: RiskFactor
}

function ShapFactorCard({ factor }: ShapFactorCardProps) {
  const contribution = Number(factor.shapContribution)
  const raisesRisk = contribution >= 0
  const width = Math.min(Math.abs(contribution) * 100, 100)

  return (
    <article className={`shap-factor-card ${raisesRisk ? 'raises-risk' : 'lowers-risk'}`}>
      <div className="shap-factor-heading">
        <div>
          <span>#{factor.factorRank} · {factor.featureName}</span>
          <strong>{factor.category ?? '기타 위험요인'}</strong>
        </div>
        <b>{raisesRisk ? '+' : ''}{contribution.toFixed(4)}</b>
      </div>

      <div className="shap-factor-scale" aria-label={`SHAP 기여도 ${contribution.toFixed(4)}`}>
        <i style={{ width: `${width}%` }} />
      </div>

      {factor.evidence && <p>{factor.evidence}</p>}
      {factor.preventiveAction && (
        <div className="shap-factor-action">
          <span>예방 조치</span>
          <p>{factor.preventiveAction}</p>
        </div>
      )}
    </article>
  )
}

export default ShapFactorCard
