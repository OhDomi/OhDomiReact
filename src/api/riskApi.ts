import type { RiskAssessment, RiskLevel } from '../types/risk'
import { apiUrl } from './useApiData'

type ApiErrorResponse = {
  message?: string
}

export async function getLatestRiskAssessments(
  level?: RiskLevel,
  signal?: AbortSignal,
): Promise<RiskAssessment[]> {
  const query = level ? `?level=${level}` : ''
  let response: Response
  try {
    response = await fetch(apiUrl(`/api/risk-assessments/latest${query}`), { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('위험 예측 API에 연결할 수 없습니다.')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.message ?? `위험 예측 조회에 실패했습니다. (${response.status})`)
  }
  return response.json() as Promise<RiskAssessment[]>
}
