import { useEffect, useState } from 'react'
import { deletePost, getPost } from '../../api/boardApi'
import type { BoardPost } from '../../types/board'

type Props = {
  postId: number
  onBack: () => void
}

export default function BoardDetail({ postId, onBack }: Props) {
  const [post, setPost] = useState<BoardPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPost(postId)
      .then(setPost)
      .finally(() => setLoading(false))
  }, [postId])

  async function handleDelete() {
    if (!post) return
    if (!confirm('정말 삭제할까요?')) return

    await deletePost(post.postId)
    onBack() // 목록으로 되돌아가기
  }

  if (loading) return <p className="board-empty">불러오는 중…</p>
  if (!post) return <p className="board-empty">글을 찾을 수 없습니다.</p>

  return (
    <article className="board-post">
      <h2>{post.title}</h2>

      <div className="board-post-meta">
        <span>{post.authorName}</span>
        <span>{post.createdAt.slice(0, 10)}</span>
        <span>조회 {post.viewCount}</span>
      </div>

      {/* pre-wrap이 있어야 줄바꿈(\n)이 화면에 반영됩니다 */}
      <div className="board-post-content">{post.content}</div>

      <div className="board-actions">
        <button className="board-btn ghost" onClick={onBack}>
          목록
        </button>
        <button className="board-btn danger" onClick={handleDelete}>
          삭제
        </button>
      </div>
    </article>
  )
}
