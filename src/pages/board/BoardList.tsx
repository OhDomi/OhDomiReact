import { useCallback, useEffect, useState } from 'react'
import { getPosts, togglePin } from '../../api/boardApi'
import type { BoardPost, BoardType } from '../../types/board'

type Props = {
  boardType: BoardType
  isAdmin: boolean
  onSelect: (postId: number) => void
  onWrite: () => void
}

export default function BoardList({ boardType, isAdmin, onSelect, onWrite }: Props) {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)


  const loadPosts = useCallback(() => {
    setLoading(true)
    getPosts(boardType)
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [boardType])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  async function handleTogglePin(postId: number) {
    await togglePin(postId)
    loadPosts() 
  }


  const canWrite = boardType === 'INQUIRY' || isAdmin

  const showNumber = boardType === 'INQUIRY'

  const normalPosts = posts.filter((post) => !post.isPinned)

  if (loading) return <p className="board-empty">불러오는 중…</p>

  return (
    <>
      <div className="board-toolbar">
        <h2>{boardType === 'NOTICE' ? '공지사항' : '문의게시판'}</h2>
        {canWrite && (
          <button className="board-btn" onClick={onWrite}>
            글쓰기
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="board-empty">아직 글이 없습니다.</p>
      ) : (
        <table className="board-table">
          <thead>
            <tr>
              {showNumber && <th style={{ width: 60 }}>번호</th>}
              <th>제목</th>
              <th style={{ width: 140 }}>작성자</th>
              <th style={{ width: 110 }}>작성일</th>
              <th style={{ width: 60 }}>조회</th>
              {isAdmin && <th style={{ width: 70 }}>고정</th>}
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId} className={post.isPinned ? 'pinned' : ''}>
                {showNumber && (
                  <td>
                    {post.isPinned ? '—' : normalPosts.length - normalPosts.indexOf(post)}
                  </td>
                )}

                <td className="board-title-cell">
                  {post.isPinned && <span className="board-pin-badge">고정</span>}
                  <button onClick={() => onSelect(post.postId)}>{post.title}</button>
                </td>

                <td>{post.authorName}</td>
                <td>{post.createdAt.slice(0, 10)}</td>
                <td>{post.viewCount}</td>

                {isAdmin && (
                  <td>
                    <button
                      className={`board-pin-toggle ${post.isPinned ? 'on' : ''}`}
                      onClick={() => handleTogglePin(post.postId)}
                      title={post.isPinned ? '고정 해제' : '상단 고정'}
                    >
                      📌
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}