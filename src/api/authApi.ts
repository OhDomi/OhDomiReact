const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export type RegisterRequest = {
  loginId: string
  password: string
  name: string
  phone: string
  privacyConsent: boolean
  captchaToken: string
  captchaAnswer: string
}

export type CaptchaChallenge = {
  question: string
  token: string
}

export type RegisterResponse = {
  userId: number
  loginId: string
  name: string
  role: 'OWNER'
  phone: string
  createdAt: string
}

export type LoginRequest = {
  loginId: string
  password: string
  role: 'OWNER' | 'ADMIN'
}

export type LoginResponse = {
  userId: number
  loginId: string
  name: string
  role: 'OWNER' | 'ADMIN'
  phone: string
  storeId: number | null
}

type ApiErrorResponse = {
  message?: string
}

export async function getCaptcha(): Promise<CaptchaChallenge> {
  const response = await fetch(`${API_BASE_URL}/api/auth/captcha`, { credentials: 'include' })
  if (!response.ok) throw new Error('캡챠를 불러오지 못했습니다.')
  return response.json() as Promise<CaptchaChallenge>
}

export async function registerAccount(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(request),
      credentials: 'include',
    })
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. Spring 서버가 실행 중인지 확인해 주세요.')
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(error.message ?? '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }

  return response.json() as Promise<RegisterResponse>
}

export async function loginAccount(request: LoginRequest): Promise<LoginResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(request),
      credentials: 'include',
    })
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. Spring 서버가 실행 중인지 확인해 주세요.')
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(error.message ?? '로그인에 실패했습니다.')
  }

  return response.json() as Promise<LoginResponse>
}

// 2026-08-12: 새로고침하면 SESSION 쿠키는 여전히 유효한데 React 상태(useState)는
// 초기화돼 로그인 화면으로 돌아가던 문제 — 앱 첫 로드 시 이걸로 세션을 복구한다.
// 로그인 안 돼 있으면(401) null만 반환, 에러를 던지지 않음.
export async function getCurrentAccount(): Promise<LoginResponse | null> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
  } catch {
    return null
  }
  if (!response.ok) return null
  return response.json() as Promise<LoginResponse>
}

export async function logoutAccount(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    credentials: 'include',
  }).catch(() => {})
}
