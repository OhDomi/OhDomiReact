import { useCallback, useEffect, useState } from 'react'

type ApiDataState<T> = {
  data: T | null
  error: string
  loading: boolean
  retry: () => void
}

export function useApiData<T>(path: string): ApiDataState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => setRequestVersion((version) => version + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { message?: string }
          throw new Error(body.message ?? `데이터 요청에 실패했습니다. (${response.status})`)
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
