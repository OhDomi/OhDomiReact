export type BoardType = 'NOTICE' | 'INQUIRY'

export type BoardPost = {
  postId: number
  boardType: BoardType
  title: string
  content: string
  authorName: string
  isPinned: boolean
  viewCount: number
  createdAt: string
}

export type BoardPostCreateRequest = {
  boardType: BoardType
  title: string
  content: string
  isPinned: boolean
}
