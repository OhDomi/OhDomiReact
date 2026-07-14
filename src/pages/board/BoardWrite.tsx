import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPost } from '../../api/boardApi'
import type { BoardType } from '../../types/board'

type Props = {
  boardType: BoardType
  userName: string
  isAdmin: boolean
  onDone: () => void
}

export default function BoardWrite({ boardType, userName, isAdmin, onDone }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError('제목을 입력하세요.')
      return
    }
    if (!content.trim()) {
      setError('내용을 입력하세요.')
      return
    }

    setSubmitting(true)
    await createPost({ boardType, title, content, isPinned }, userName)
    setSubmitting(false)
    onDone()
  }

  return (
    <div className="board-post">
      <h2>{boardType === 'NOTICE' ? '공지사항' : '문의'} 작성</h2>

      <form className="board-form" onSubmit={handleSubmit}>
        <label htmlFor="board-title">제목</label>
        <input
          id="board-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        {isAdmin && (
          <label className="board-checkbox">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
            />
            <span>상단 고정</span>
          </label>
        )}

        <label htmlFor="board-content">내용</label>
        <textarea
          id="board-content"
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        {error ? <p className="board-error">{error}</p> : null}

        <div className="board-actions">
          <button type="button" className="board-btn ghost" onClick={onDone}>
            취소
          </button>
          <button type="submit" className="board-btn" disabled={submitting}>
            {submitting ? '등록 중…' : '등록'}
          </button>
        </div>
      </form>
    </div>
  )
}