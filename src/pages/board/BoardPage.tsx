import { useState } from 'react'
import BoardList from './BoardList'
import BoardDetail from './BoardDetail'
import BoardWrite from './BoardWrite'
import type { BoardType } from '../../types/board'
import './Board.css'

type View =
  | { name: 'list' }
  | { name: 'detail'; postId: number }
  | { name: 'write' }

type Props = {
  userName: string
  isAdmin: boolean
}

export default function BoardPage({ userName, isAdmin }: Props) {
  const [boardType, setBoardType] = useState<BoardType>('NOTICE')
  const [view, setView] = useState<View>({ name: 'list' })

  function changeBoard(next: BoardType) {
    setBoardType(next)
    setView({ name: 'list' })
  }

  return (
    <div className="board">
      <nav className="board-tabs">
        <button
          className={boardType === 'NOTICE' ? 'active' : ''}
          onClick={() => changeBoard('NOTICE')}
        >
          공지사항
        </button>
        <button
          className={boardType === 'INQUIRY' ? 'active' : ''}
          onClick={() => changeBoard('INQUIRY')}
        >
          문의게시판
        </button>
      </nav>

      {view.name === 'list' && (
        <BoardList
          boardType={boardType}
          isAdmin={isAdmin}
          onSelect={(postId) => setView({ name: 'detail', postId })}
          onWrite={() => setView({ name: 'write' })}
        />
      )}

      {view.name === 'detail' && (
        <BoardDetail postId={view.postId} onBack={() => setView({ name: 'list' })} />
      )}

      {view.name === 'write' && (
        <BoardWrite
          boardType={boardType}
          userName={userName}
          isAdmin={isAdmin}
          onDone={() => setView({ name: 'list' })}
        />
      )}
    </div>
  )
}
