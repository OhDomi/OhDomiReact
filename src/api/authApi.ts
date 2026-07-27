const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export type RegisterRequest = {
  loginId: string
  password: string
  name: string
  phone: string
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

export async function registerAccount(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
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
