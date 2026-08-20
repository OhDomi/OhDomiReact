import { useCallback, useEffect, useState } from 'react'
import { isAdminSession } from './session'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ''

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** 실패 응답에서 사람이 읽을 에러 문구를 뽑는다. 관리자 로그인 세션에서만
 * error_code를 노출 — 가맹점주에게는 원인을 숨기고 일반 안내 문구만 보여준다
 * (2026-08-20, "에러코드를 관리자만 볼 수 있게" 요청). */
export async function describeApiError(response: Response, fallback: string): Promise<string> {
  let body: Record<string, unknown> | null = null
  try {
    body = await response.json()
  } catch {
    // 응답 본문이 JSON이 아님
  }
  // closure-risk-model은 {detail:{error_code,message}}, Spring은 최상위 {error_code,message} —
  // 두 백엔드 응답 형태가 달라 둘 다 지원.
  const detail = body?.detail as { error_code?: string; message?: string } | string | undefined
  const code = (typeof detail === 'object' ? detail.error_code : undefined) ?? (body?.error_code as string | undefined)
  const message =
    (typeof detail === 'object' ? detail.message : typeof detail === 'string' ? detail : undefined) ??
    (body?.message as string | undefined)

  if (isAdminSession() && code) return `${code}: ${message ?? ''}`
  return message || fallback
}

type ApiDataState<T> = {
  data: T | null
  error: string
  loading: boolean
  retry: () => void
}

export function useApiData<T>(path: string | null): ApiDataState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => setRequestVersion((version) => version + 1), [])

  useEffect(() => {
    if (!path) {
      setData(null)
      setLoading(false)
      setError('')
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError('')

    fetch(apiUrl(path), { signal: controller.signal, credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await describeApiError(response, `데이터 요청에 실패했습니다. (${response.status})`))
        }
        return response.json() as Promise<T>
      })
      .then(setData)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : '데이터를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [path, requestVersion])

  return { data, error, loading, retry }
}
