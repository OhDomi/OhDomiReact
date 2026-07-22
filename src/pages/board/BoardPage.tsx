import { useMemo, useState } from 'react'
import './BoardPage.css'
import {
  boardPosts,
  boardSummary,
  type BoardPost,
  type BoardType,
} from './boardDummy'

type BoardPageProps = {
  userName: string
  isAdmin: boolean
}

function BoardPage({ userName, isAdmin }: BoardPageProps) {
  const [activeTab, setActiveTab] = useState<BoardType>('notice')
  const [selectedPost, setSelectedPost] = useState<BoardPost>(boardPosts[0])
  const [isWriting, setIsWriting] = useState(false)

  const filteredPosts = useMemo(
    () => boardPosts.filter((post) => post.type === activeTab),
    [activeTab],
  )

  function changeTab(tab: BoardType) {
    setActiveTab(tab)
    setIsWriting(false)

    const firstPost = boardPosts.find((post) => post.type === tab)
    if (firstPost) {
      setSelectedPost(firstPost)
    }
  }

  return (
    <div className="board-page">
      <section className="board-summary-grid">
        <article className="metric-card">
          <div className="board-metric-icon">📌</div>
          <div>
            <span>공지사항</span>
            <strong>{boardSummary.notices}건</strong>
            <small>본사 공지 기준</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="board-metric-icon purple">Q</div>
          <div>
            <span>문의글</span>
            <strong>{boardSummary.inquiries}건</strong>
            <small>전체 가맹점 문의</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="board-metric-icon orange">!</div>
          <div>
            <span>답변 대기</span>
            <strong>{boardSummary.pending}건</strong>
            <small>본사 확인 필요</small>
          </div>
        </article>

        <article className="metric-card">
          <div className="board-metric-icon danger">!</div>
          <div>
            <span>긴급 문의</span>
            <strong>{boardSummary.urgent}건</strong>
            <small>우선 처리 대상</small>
          </div>
        </article>
      </section>

      <section className="board-layout">
        <article className="panel board-list-panel">
          <div className="board-tabs">
            <button
              className={activeTab === 'notice' ? 'active' : ''}
              type="button"
              onClick={() => changeTab('notice')}
            >
              공지사항
            </button>

            <button
              className={activeTab === 'inquiry' ? 'active' : ''}
              type="button"
              onClick={() => changeTab('inquiry')}
            >
              문의게시판
            </button>
          </div>

          <div className="panel-head board-panel-head">
            <div>
              <span className="panel-label">
                {activeTab === 'notice' ? 'NOTICE' : 'INQUIRY'}
              </span>
              <h2>{activeTab === 'notice' ? '공지사항 목록' : '문의게시판 목록'}</h2>
            </div>

            <div className="board-actions">
              <button className="select-button" type="button">
                최신순
              </button>

              <button
                className="primary-action"
                type="button"
                onClick={() => setIsWriting(true)}
              >
                글쓰기
              </button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table selectable board-table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>분류</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th>조회</th>
                  <th>상태</th>
                </tr>
              </thead>

              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={selectedPost.id === post.id && !isWriting ? 'selected' : ''}
                    onClick={() => {
                      setSelectedPost(post)
                      setIsWriting(false)
                    }}
                  >
                    <td>
                      <div className="board-title-cell">
                        {post.pinned && <span className="pinned-badge">고정</span>}
                        <strong>{post.title}</strong>
                      </div>
                    </td>
                    <td>{post.category}</td>
                    <td>{post.writer}</td>
                    <td>{post.date}</td>
                    <td>{post.views}</td>
                    <td>
                      <span className={`board-status ${getStatusClass(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel board-detail-panel">
          {isWriting ? (
            <BoardWriteForm
              userName={userName}
              activeTab={activeTab}
              isAdmin={isAdmin}
              cancel={() => setIsWriting(false)}
            />
          ) : (
            <BoardDetail post={selectedPost} isAdmin={isAdmin} />
          )}
        </aside>

        <article className="panel board-guide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">BOARD GUIDE</span>
              <h2>게시판 운영 안내</h2>
            </div>
          </div>

          <div className="board-guide-grid">
            <div>
              <strong>공지사항</strong>
              <p>본사 정책, 신메뉴, 위생 기준, 설비 점검 안내를 가맹점에 전달합니다.</p>
            </div>

            <div>
              <strong>문의게시판</strong>
              <p>가맹점주는 발주, 매출, 위생, 시스템 관련 문의를 등록할 수 있습니다.</p>
            </div>

            <div>
              <strong>긴급 문의</strong>
              <p>POS 오류, 위생 이슈, 발주 지연 등 즉시 조치가 필요한 건을 우선 확인합니다.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

function BoardDetail({ post, isAdmin }: { post: BoardPost; isAdmin: boolean }) {
  const actionLabel =
    post.type === 'notice'
      ? isAdmin
        ? '공지 수정'
        : '확인'
      : isAdmin
        ? '답변 등록'
        : '문의 수정'

  return (
    <>
      <div className="panel-head">
        <div>
          <span className="panel-label">POST DETAIL</span>
          <h2>게시글 상세</h2>
        </div>

        <span className={`board-status ${getStatusClass(post.status)}`}>
          {post.status}
        </span>
      </div>

      <div className="board-detail-card">
        <div className="board-detail-title">
          {post.pinned && <span className="pinned-badge">고정</span>}
          <h3>{post.title}</h3>
        </div>

        <div className="board-meta">
          <span>{post.writer}</span>
          <span>{post.date}</span>
          <span>조회 {post.views}</span>
          <span>{post.category}</span>
        </div>

        <p>{post.content}</p>
      </div>

      {post.type === 'inquiry' && (
        <div className="board-answer-box">
          <span>{post.status === '답변완료' ? '본사 답변' : '답변 상태'}</span>

          {post.status === '답변완료' ? (
            <p>
              문의하신 내용 확인했습니다. AI 발주 추천 수량은 최근 판매량과 내일 예상 주문 수를 기준으로 산정됩니다.
            </p>
          ) : (
            <p>
              아직 답변 대기 중입니다. 본사 운영팀 확인 후 답변이 등록됩니다.
            </p>
          )}
        </div>
      )}

      <div className="board-detail-actions">
        <button className="outline-button" type="button">
          목록
        </button>

        <button className="primary-action" type="button">
          {actionLabel}
        </button>
      </div>
    </>
  )
}

function BoardWriteForm({
  userName,
  activeTab,
  isAdmin,
  cancel,
}: {
  userName: string
  activeTab: BoardType
  isAdmin: boolean
  cancel: () => void
}) {
  const title =
    activeTab === 'notice'
      ? isAdmin
        ? '새 공지 작성'
        : '공지사항은 본사만 작성할 수 있습니다'
      : '새 문의 작성'

  return (
    <>
      <div className="panel-head">
        <div>
          <span className="panel-label">WRITE POST</span>
          <h2>{title}</h2>
        </div>
      </div>

      <form className="board-write-form">
        <label>
          작성자
          <input value={userName} readOnly />
        </label>

        <label>
          제목
          <input
            placeholder={
              activeTab === 'notice'
                ? '공지 제목을 입력하세요'
                : '문의 제목을 입력하세요'
            }
            disabled={activeTab === 'notice' && !isAdmin}
          />
        </label>

        <label>
          분류
          <select disabled={activeTab === 'notice' && !isAdmin}>
            <option>발주</option>
            <option>매출</option>
            <option>위생</option>
            <option>설비</option>
            <option>시스템</option>
          </select>
        </label>

        <label>
          내용
          <textarea
            placeholder="내용을 입력하세요"
            disabled={activeTab === 'notice' && !isAdmin}
          />
        </label>

        {activeTab === 'notice' && !isAdmin && (
          <p className="board-form-guide">
            공지사항은 본사 관리자만 작성할 수 있습니다. 가맹점주는 문의게시판을 이용해 주세요.
          </p>
        )}

        <div className="board-write-actions">
          <button className="outline-button" type="button" onClick={cancel}>
            취소
          </button>

          <button
            className="primary-action"
            type="button"
            disabled={activeTab === 'notice' && !isAdmin}
          >
            등록
          </button>
        </div>
      </form>
    </>
  )
}

function getStatusClass(status: string) {
  if (status === '긴급') return 'danger'
  if (status === '대기중') return 'warning'
  if (status === '답변완료') return 'done'
  return 'notice'
}

export default BoardPage