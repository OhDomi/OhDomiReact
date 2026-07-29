const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
export type BoardType = 'NOTICE' | 'INQUIRY'

export type BoardPost = {
  postId: number
  boardType: BoardType
  category: string
  title: string
  content: string
  authorName: string
  storeId: number | null
  status: 'PUBLISHED' | 'PENDING' | 'ANSWERED'
  isPinned: boolean
  isUrgent: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  answer: string | null
}

export type CreateBoardPost = {
  authorUserId: number
  storeId: number | null
  boardType: BoardType
  category: string
  title: string
  content: string
  isPinned: boolean
  isUrgent: boolean
}

type ApiRequest = { method?: string; headers?: Record<string, string>; body?: string }

async function api<T>(path: string, init?: ApiRequest): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, init)
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? '게시판 요청에 실패했습니다.')
  }
  return response.json() as Promise<T>
}

export const getPosts = (type: BoardType) =>
  api<BoardPost[]>(`/api/board/posts?boardType=${type}`)

export const getPost = (postId: number) => api<BoardPost>(`/api/board/posts/${postId}`)

export const createPost = (request: CreateBoardPost) =>
  api<BoardPost>('/api/board/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
