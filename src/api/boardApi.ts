import type { BoardPost, BoardType, BoardPostCreateRequest } from '../types/board'



const STORAGE_KEY = 'board_posts'

const SEED: BoardPost[] = [
  {
    postId: 1,
    boardType: 'NOTICE',
    title: '7월 신메뉴 출시 안내',
    content: '7월 20일부터 여름 한정 메뉴가 추가됩니다.\n발주 품목이 3개 늘어나니 확인 바랍니다.',
    authorName: '본사 운영팀',
    isPinned: true,
    viewCount: 42,
    createdAt: '2026-07-10T09:00:00',
  },
  {
    postId: 2,
    boardType: 'NOTICE',
    title: '설비 점검 주기 변경 공지',
    content: '냉장고 점검 주기가 90일에서 60일로 단축됩니다.',
    authorName: '본사 운영팀',
    isPinned: false,
    viewCount: 17,
    createdAt: '2026-07-08T14:30:00',
  },
  {
    postId: 3,
    boardType: 'INQUIRY',
    title: '발주 승인이 3일째 안 됩니다',
    content: '지난주 금요일에 올린 발주서가 아직 대기 상태입니다. 확인 부탁드립니다.',
    authorName: '강남점 김점주',
    isPinned: false,
    viewCount: 5,
    createdAt: '2026-07-12T11:20:00',
  },
]

function readAll(): BoardPost[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
    return SEED
  }
  return JSON.parse(raw) as BoardPost[]
}

function writeAll(posts: BoardPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── 목록 조회 ──
export async function getPosts(boardType: BoardType): Promise<BoardPost[]> {
  await delay()
  return readAll()
    .filter((post) => post.boardType === boardType)
    .sort((a, b) => {
      // 고정글이 항상 위, 그 다음 최신순
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })
}

// ── 상세 조회 (조회수 +1) ──
export async function getPost(postId: number): Promise<BoardPost | null> {
  await delay()
  const posts = readAll()
  const target = posts.find((post) => post.postId === postId)
  if (!target) return null

  target.viewCount += 1
  writeAll(posts)
  return target
}

// ── 글쓰기 ──
export async function createPost(
  request: BoardPostCreateRequest,
  authorName: string,
): Promise<BoardPost> {
  await delay()
  const posts = readAll()

  const newPost: BoardPost = {
    postId: posts.length === 0 ? 1 : Math.max(...posts.map((post) => post.postId)) + 1,
    boardType: request.boardType,
    title: request.title,
    content: request.content,
    authorName,
    isPinned: request.isPinned, // ★ 폼에서 받은 값 사용
    viewCount: 0,
    createdAt: new Date().toISOString(),
  }

  writeAll([...posts, newPost])
  return newPost
}

// ── 고정 토글 ──
export async function togglePin(postId: number): Promise<void> {
  await delay()
  const posts = readAll()
  const target = posts.find((post) => post.postId === postId)
  if (!target) return

  target.isPinned = !target.isPinned
  writeAll(posts)
}

// ── 삭제 ──
export async function deletePost(postId: number): Promise<void> {
  await delay()
  writeAll(readAll().filter((post) => post.postId !== postId))
}
