import { useCallback, useEffect, useMemo, useState } from 'react'
import './BoardPage.css'
import { createPost, getPost, getPosts } from '../../api/boardApi'
import type { BoardPost, BoardType } from '../../api/boardApi'

type Props = { userId: number; storeId: number | null; userName: string; isAdmin: boolean }

function BoardPage({ userId, storeId, userName, isAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<BoardType>('NOTICE')
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [selected, setSelected] = useState<BoardPost | null>(null)
  const [writing, setWriting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (type: BoardType) => {
    setLoading(true)
    setError('')
    try {
      const result = await getPosts(type)
      setPosts(result)
      setSelected(result[0] ?? null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '게시글을 불러오지 못했습니다.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(activeTab) }, [activeTab, load])
  const summary = useMemo(() => ({
    total: posts.length,
    pending: posts.filter((p) => p.status === 'PENDING').length,
    urgent: posts.filter((p) => p.isUrgent).length,
  }), [posts])

  async function selectPost(postId: number) {
    try { setSelected(await getPost(postId)); setWriting(false) }
    catch (cause) { setError(cause instanceof Error ? cause.message : '게시글을 불러오지 못했습니다.') }
  }

  return <div className="board-page">
    <section className="board-summary-grid">
      <Metric icon="📌" label={activeTab === 'NOTICE' ? '공지사항' : '문의글'} value={summary.total} />
      <Metric icon="Q" label="답변 대기" value={summary.pending} tone="purple" />
      <Metric icon="!" label="긴급 문의" value={summary.urgent} tone="danger" />
    </section>
    {error && <p className="form-error">{error}</p>}
    <section className="board-layout">
      <article className="panel board-list-panel">
        <div className="board-tabs">
          <button className={activeTab === 'NOTICE' ? 'active' : ''} onClick={() => { setActiveTab('NOTICE'); setWriting(false) }}>공지사항</button>
          <button className={activeTab === 'INQUIRY' ? 'active' : ''} onClick={() => { setActiveTab('INQUIRY'); setWriting(false) }}>문의게시판</button>
        </div>
        <div className="panel-head board-panel-head"><div><span className="panel-label">{activeTab}</span><h2>게시글 목록</h2></div>
          <button className="primary-action" type="button" disabled={activeTab === 'NOTICE' && !isAdmin} onClick={() => setWriting(true)}>글쓰기</button>
        </div>
        {loading ? <div className="skeleton-panel-row rows"><span className="skeleton-block" style={{ height: 40 }} /><span className="skeleton-block" style={{ height: 40 }} /><span className="skeleton-block" style={{ height: 40 }} /></div> : <div className="table-scroll"><table className="data-table selectable board-table"><thead><tr><th>제목</th><th>분류</th><th>작성자</th><th>작성일</th><th>조회</th><th>상태</th></tr></thead><tbody>
          {posts.map((post) => <tr key={post.postId} className={selected?.postId === post.postId && !writing ? 'selected' : ''} onClick={() => void selectPost(post.postId)}>
            <td><div className="board-title-cell">{post.isPinned && <span className="pinned-badge">고정</span>}<strong>{post.title}</strong></div></td><td>{post.category}</td><td>{post.authorName}</td><td>{post.createdAt.slice(0, 10)}</td><td>{post.viewCount}</td><td><Status value={post.status} /></td>
          </tr>)}</tbody></table></div>}
      </article>
      <aside className="panel board-detail-panel">
        {writing ? <WriteForm type={activeTab} userName={userName} disabled={activeTab === 'NOTICE' && !isAdmin} cancel={() => setWriting(false)} submit={async (category, title, content, urgent) => {
          try { const post = await createPost({ authorUserId: userId, storeId, boardType: activeTab, category, title, content, isPinned: false, isUrgent: urgent }); await load(activeTab); setSelected(post); setWriting(false) }
          catch (cause) { setError(cause instanceof Error ? cause.message : '게시글 등록에 실패했습니다.') }
        }} /> : selected ? <Detail post={selected} /> : <p>등록된 게시글이 없습니다.</p>}
      </aside>
    </section>
  </div>
}

function Metric({ icon, label, value, tone = '' }: { icon: string; label: string; value: number; tone?: string }) {
  return <article className="metric-card"><div className={`board-metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}건</strong><small>MySQL 실시간 기준</small></div></article>
}

function Status({ value }: { value: BoardPost['status'] }) {
  const label = value === 'ANSWERED' ? '답변완료' : value === 'PENDING' ? '대기중' : '공지'
  return <span className={`board-status ${value === 'ANSWERED' ? 'done' : value === 'PENDING' ? 'warning' : 'notice'}`}>{label}</span>
}

function Detail({ post }: { post: BoardPost }) {
  return <><div className="panel-head"><div><span className="panel-label">POST DETAIL</span><h2>게시글 상세</h2></div><Status value={post.status} /></div>
    <div className="board-detail-card"><div className="board-detail-title"><h3>{post.title}</h3></div><div className="board-meta"><span>{post.authorName}</span><span>{post.createdAt.slice(0, 10)}</span><span>조회 {post.viewCount}</span><span>{post.category}</span></div><p>{post.content}</p></div>
    {post.answer && <div className="board-answer-box"><span>본사 답변</span><p>{post.answer}</p></div>}</>
}

function WriteForm({ type, userName, disabled, cancel, submit }: { type: BoardType; userName: string; disabled: boolean; cancel: () => void; submit: (category: string, title: string, content: string, urgent: boolean) => Promise<void> }) {
  const [category, setCategory] = useState('시스템'); const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [urgent, setUrgent] = useState(false)
  return <><div className="panel-head"><div><span className="panel-label">WRITE POST</span><h2>{type === 'NOTICE' ? '새 공지 작성' : '새 문의 작성'}</h2></div></div>
    <form className="board-write-form" onSubmit={(e) => { e.preventDefault(); void submit(category, title, content, urgent) }}><label>작성자<input value={userName} readOnly /></label><label>제목<input value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} required /></label><label>분류<select value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabled}><option>발주</option><option>매출</option><option>위생</option><option>설비</option><option>시스템</option></select></label><label>내용<textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={disabled} required /></label>{type === 'INQUIRY' && <label><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> 긴급 문의</label>}<div className="board-write-actions"><button className="outline-button" type="button" onClick={cancel}>취소</button><button className="primary-action" type="submit" disabled={disabled}>등록</button></div></form></>
}

export default BoardPage
