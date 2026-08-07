export type RiskLevel = 1 | 2 | 3 | 4 | 5

export type RiskFactor = {
  riskFactorId: number
  modelVersion: string | null
  factorRank: number
  featureName: string
  category: string | null
  shapContribution: number
  evidence: string | null
  preventiveAction: string | null
  clauseTemplate: string | null
}

export type RiskAssessment = {
  riskAssessmentId: number
  storeId: number
  storeName: string
  ownerName: string
  region: string
  modelVersion: string | null
  riskScore: number
  riskLevel: RiskLevel
  locationRiskScore: number | null
  classificationDetail: string | null
  mainReason: string | null
  prediction: string | null
  recommendedAction: string | null
  assessedAt: string
  riskFactors: RiskFactor[]
}
