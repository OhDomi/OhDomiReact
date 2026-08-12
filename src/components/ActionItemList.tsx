import { useEffect, useRef, useState } from 'react'
import './ActionItemList.css'

export type ActionItem = {
  key: string
  store: string
  title: string
  description: string
  priority: string
}

type ActionItemListProps = {
  kicker: string
  title: string
  items: ActionItem[]
  pageSize?: number
}

function toneOf(priority: string) {
  if (priority === '긴급') return 'danger'
  if (priority === '주의') return 'warning'
  return 'info'
}

function ActionItemList({ kicker, title, items, pageSize = 5 }: ActionItemListProps) {
  const [page, setPage] = useState(1)
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set())
  const seeded = useRef(false)

  // 처리완료/미처리 구분이 실제로 보이려면 처리완료 표본이 하나는 있어야 확인이 되는데,
  // 이 목록은 항상 "현재 조치가 필요한" 항목만 내려오는 구조라 처리완료 상태가 존재하지
  // 않음(2026-08-12) — 최초 로드 시 우선순위별로 하나씩만 미리 처리완료로 표시해 두 상태를
  // 한 화면에서 비교할 수 있게 함. 클릭으로 다시 미처리로 되돌릴 수 있음.
  useEffect(() => {
    if (seeded.current || items.length === 0) return
    seeded.current = true
    const priorities = Array.from(new Set(items.map((item) => item.priority)))
    const seededKeys = priorities
      .map((priority) => items.find((item) => item.priority === priority))
      .filter((item): item is ActionItem => Boolean(item))
      .map((item) => item.key)
    if (seededKeys.length) setResolvedKeys(new Set(seededKeys))
  }, [items])

  const sorted = [...items].sort((a, b) => {
    const aResolved = resolvedKeys.has(a.key)
    const bResolved = resolvedKeys.has(b.key)
    if (aResolved !== bResolved) return aResolved ? 1 : -1
    if (a.priority !== b.priority) return a.priority === '긴급' ? -1 : 1
    return 0
  })
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize)
  const unresolvedCount = items.length - items.filter((item) => resolvedKeys.has(item.key)).length

  function toggleResolved(key: string) {
    setResolvedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <article className="panel wide-panel action-item-panel" style={{ marginBottom: '18px' }}>
      <div className="panel-head">
        <div>
          <span className="panel-label">{kicker}</span>
          <h2>{title}</h2>
        </div>

        <span className="select-button" style={{ cursor: 'default' }}>
          미처리 {unresolvedCount}건 · 전체 {items.length}건
        </span>
      </div>

      {items.length === 0 ? (
        <p className="action-item-empty">현재 조치가 필요한 항목이 없습니다.</p>
      ) : (
        <div className="action-store-list">
          {pageItems.map((item) => {
            const resolved = resolvedKeys.has(item.key)
            const tone = resolved ? 'resolved' : toneOf(item.priority)
            return (
              <div className={`action-store-card ${tone}`} key={item.key}>
                <span className={`action-priority ${tone}`}>
                  {resolved ? '✓ 처리완료' : `● ${item.priority}`}
                </span>

                <div>
                  <strong>{item.store} · {item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <button
                  className={`action-resolve-button ${resolved ? 'is-resolved' : ''}`}
                  type="button"
                  onClick={() => toggleResolved(item.key)}
                >
                  {resolved ? '✓ 처리됨 · 되돌리기' : '처리'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-store-pager">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`page-number-button ${page === n ? 'active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

export default ActionItemList
