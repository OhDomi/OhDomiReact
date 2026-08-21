import { useEffect, useMemo, useRef, useState } from 'react'
import './HygieneCheck.css'
import type {
  hygieneItems,
  hygieneSummary,
  improvementTasks,
  recentInspections,
} from './hygieneCheckDummy'
import { apiUrl, describeApiError, useApiData } from '../../api/useApiData'
import ApiDataState from '../../api/ApiDataState'
import GeneratingBanner from '../../api/GeneratingBanner'

type HygieneData = {
  hygieneItems: typeof hygieneItems
  hygieneSummary: typeof hygieneSummary
  improvementTasks: typeof improvementTasks
  recentInspections: typeof recentInspections
}

type ChecklistItem = {
  itemId: string
  zone: string
  shootingItem: string
  aiCheckPoint: string
  checkType: string
  maxScore: number
  optional: boolean
}

type ChecklistApiItem = Partial<ChecklistItem> & {
  item_id?: string
  shooting_item?: string
  ai_check_point?: string
  check_type?: string
  max_score?: number
}

type ChecklistGroup = {
  key: string
  zone: string
  shootingItem: string
  aiCheckPoint: string
  optional: boolean
  items: ChecklistItem[]
}

type AiResult = {
  itemId: string
  zone: string
  shootingItem: string
  grade: 'GOOD' | 'FAIR' | 'POOR' | 'UNJUDGEABLE' | 'NEEDS_HUMAN_REVIEW'
  score: number | null
  status: string | null
  findings: string[] | null
  improvement: string | null
  recheckReason: string | null
  retakeCount: number
}

type AnalysisResponse = {
  inspection: {
    inspection: {
      inspectionId: number
      score: number
      status: string
      summary: string
    }
    images: Array<{ imageId: number; imageUrl: string }>
  }
  aiResult: AiResult
}

type PreviewState = { group: ChecklistGroup; file: File; url: string }

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function HygieneCheck({ storeId }: { storeId: number }) {
  const api = useApiData<HygieneData>(`/api/ui/stores/${storeId}/hygiene`)
  const checklistApi = useApiData<ChecklistApiItem[]>('/api/hygiene-inspections/check-items')
  const checklistGroups = useMemo(() => groupChecklist(normalizeChecklist(checklistApi.data ?? [])), [checklistApi.data])
  const uploadPanel = useRef<HTMLElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({})
  const [analysisByItem, setAnalysisByItem] = useState<Record<string, AnalysisResponse>>({})
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url)
  }, [preview])

  if (!api.data) return <ApiDataState loading={api.loading} error={api.error} retry={api.retry} />
  const { hygieneItems, hygieneSummary, improvementTasks, recentInspections } = api.data
  const currentResult = analysis?.aiResult
  const displayScore = currentResult?.score ?? hygieneSummary.score
  const displayStatus = currentResult ? gradeLabel(currentResult.grade) : hygieneSummary.status
  const displaySummary = currentResult
    ? currentResult.improvement
      || currentResult.findings?.join(' ')
      || currentResult.recheckReason
      || 'AI 분석이 완료되었습니다.'
    : '최근 저장된 점검 결과입니다. 항목별 사진을 첨부한 뒤 AI 점검을 실행해 주세요.'
  const selectedCount = Object.keys(selectedFiles).length

  function chooseFile(group: ChecklistGroup, file: File | undefined) {
    setUploadError('')
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError(`${group.shootingItem}: ${file.name}은 JPG, PNG 또는 WebP 이미지가 아닙니다.`)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError(`${group.shootingItem}: ${file.name}은 10MB를 초과합니다.`)
      return
    }
    setSelectedFiles((files) => ({ ...files, [group.key]: file }))
    setAnalysisByItem((results) => {
      const next = { ...results }
      group.items.forEach((item) => delete next[item.itemId])
      return next
    })
    if (preview?.group.key === group.key) setPreview(null)
  }

  function openPreview(group: ChecklistGroup) {
    const file = selectedFiles[group.key]
    if (!file) return
    setPreview({ group, file, url: URL.createObjectURL(file) })
  }

  function resetUpload() {
    setSelectedFiles({})
    setAnalysisByItem({})
    setAnalysis(null)
    setPreview(null)
    setUploadError('')
    setUploadProgress('')
    uploadPanel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function requestAnalysis(itemId: string, image: File, retakeCount: number) {
    const body = new FormData()
    body.append('storeId', String(storeId))
    body.append('itemId', itemId)
    body.append('retakeCount', String(retakeCount))
    body.append('image', image)
    const response = await fetch(apiUrl('/api/hygiene-inspections/analyze'), {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body,
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(await describeApiError(response, `AI 분석 요청에 실패했습니다. (${response.status})`))
    }
    return response.json() as Promise<AnalysisResponse>
  }

  async function analyzeOneItem(item: ChecklistItem, file: File, group: ChecklistGroup, failures: string[]) {
    try {
      const response = await requestAnalysis(item.itemId, file, analysisByItem[item.itemId] ? 1 : 0)
      setAnalysisByItem((results) => ({ ...results, [item.itemId]: response }))
      setAnalysis(response)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 분석 요청에 실패했습니다.'
      failures.push(`${group.shootingItem} · ${file.name}: ${message}`)
      return false
    }
  }

  async function analyzeImages() {
    const entries = Object.entries(selectedFiles) as Array<[string, File]>
    if (entries.length === 0) {
      setUploadError('한 개 이상의 점검 사진을 첨부해 주세요.')
      return
    }

    setUploading(true)
    setUploadError('')
    const failures: string[] = []
    let completed = 0
    for (const [index, [groupKey, file]] of entries.entries()) {
      const group = checklistGroups.find((candidate) => candidate.key === groupKey)
      if (!group) continue
      setUploadProgress(`${index + 1} / ${entries.length}`)
      for (const item of group.items) {
        if (await analyzeOneItem(item, file, group, failures)) completed += 1
      }
    }
    if (completed > 0) api.retry()
    if (failures.length > 0) setUploadError(failures.join('\n'))
    setUploadProgress('')
    setUploading(false)
  }

  return (
    <div className="hygiene-page">
      <header className="page-heading">
        <div>
          <span className="kicker">AI QUALITY INSPECTION</span>
          <h1>위생·품질 점검</h1>
          <p>점검 항목별 사진을 첨부하고 AI 분석 결과와 개선 필요 항목을 확인하세요.</p>
        </div>
        <button className="primary-action" type="button" data-backend-ready="true" disabled={uploading} onClick={resetUpload}>
          업로드 초기화
        </button>
      </header>

      <article className="panel wide-panel" style={{ marginBottom: '18px' }}>
        <div className="panel-head">
          <div>
            <span className="panel-label">IMPROVEMENT TASKS</span>
            <h2>개선 필요 항목</h2>
          </div>
        </div>
        <div className="improvement-list">
          {improvementTasks.length === 0 && <p className="hygiene-empty">현재 열린 개선 항목이 없습니다.</p>}
          {improvementTasks.map((task) => (
            <div className="improvement-card" key={task.title}>
              <span className={`task-priority ${task.priority === '주의' ? 'warning' : 'info'}`}>{task.priority}</span>
              <div><strong>{task.title}</strong><p>{task.description}</p></div>
            </div>
          ))}
        </div>
      </article>

      <section className="hygiene-layout">
        <article className="panel checklist-upload-panel wide-panel" ref={uploadPanel}>
          <div className="checklist-upload-head">
            <div>
              <span className="panel-label">PHOTO INSPECTION CHECKLIST</span>
              <h2>점검 사진 입력</h2>
              <p>각 점검 항목에 맞는 사진을 첨부하세요. 선택 항목은 필요한 경우에만 촬영하면 됩니다.</p>
            </div>
            <div className="upload-count">
              <strong>{selectedCount} / {checklistGroups.length}</strong><span>개 첨부</span>
            </div>
          </div>

          {uploading && (
            <GeneratingBanner
              title="AI가 사진을 분석하고 있습니다"
              detail={`현재 ${uploadProgress}번째 사진 처리 중 · 완료될 때까지 입력 버튼이 잠깁니다.`}
            />
          )}

          {checklistApi.loading && (
            <div className="skeleton-panel-row rows">
              <span className="skeleton-block" style={{ height: 32 }} />
              <span className="skeleton-block" style={{ height: 32 }} />
              <span className="skeleton-block" style={{ height: 32 }} />
            </div>
          )}
          {checklistApi.error && (
            <div className="checklist-message error">
              <span>{checklistApi.error}</span>
              <button type="button" onClick={checklistApi.retry}>다시 시도</button>
            </div>
          )}

          <div className="photo-checklist" aria-busy={uploading}>
            {checklistGroups.map((group, index) => {
              const file = selectedFiles[group.key]
              const savedResults = group.items
                .map((item) => analysisByItem[item.itemId]?.aiResult)
                .filter((result): result is AiResult => Boolean(result))
              const savedScore = averageScore(savedResults)
              const savedGrade = worstGrade(savedResults)
              return (
                <div className={`photo-check-row ${file ? 'attached' : ''}`} key={group.key}>
                  <span className="check-number">{index + 1}</span>
                  <div className="check-description">
                    <div>
                      <span className="check-zone">{group.zone}</span>
                      <strong>{group.shootingItem}</strong>
                      {group.optional && <em>선택</em>}
                    </div>
                    <p>{group.aiCheckPoint}</p>
                    {file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)}MB</small>}
                  </div>
                  {savedGrade && (
                    <span className={`row-analysis-status ${statusClass(savedGrade)}`}>
                      {savedScore == null ? gradeLabel(savedGrade) : `${savedScore}점`}
                    </span>
                  )}
                  <label className="row-attach-button">
                    <span>📎 {file ? '변경' : '첨부'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={(event) => {
                        chooseFile(group, event.target.files?.[0])
                        event.target.value = ''
                      }}
                    />
                  </label>
                  <button
                    className="row-preview-button"
                    type="button"
                    data-backend-ready="true"
                    disabled={!file || uploading}
                    onClick={() => openPreview(group)}
                  >
                    ▣ 미리보기
                  </button>
                </div>
              )
            })}
          </div>

          {uploadError && <p className="upload-error checklist-error" role="alert">{uploadError}</p>}
          <div className="checklist-submit-bar">
            <div>
              <strong>{selectedCount} / {checklistGroups.length}개 항목 사진 선택됨</strong>
              <span>JPG, PNG, WebP · 파일당 최대 10MB</span>
            </div>
            <button
              className="primary-action checklist-submit"
              type="button"
              data-backend-ready="true"
              disabled={uploading || selectedCount === 0}
              onClick={analyzeImages}
            >
              {uploading ? `AI 점검 중 ${uploadProgress}` : 'AI 점검 시작'}
            </button>
          </div>
        </article>

        <article className="panel ai-result-panel wide-panel">
          <div className="panel-head">
            <div><span className="panel-label">AI ANALYSIS RESULT</span><h2>최근 AI 분석 결과</h2></div>
            <span className={`status-pill ${statusClass(currentResult?.grade)}`}>● {displayStatus}</span>
          </div>
          <div className="hygiene-score-box">
            <div className="score-ring big-score">
              <strong>{currentResult?.score == null && currentResult ? '-' : displayScore}</strong>
              <small>/ 100</small>
            </div>
            <div>
              <strong>{currentResult ? `${currentResult.shootingItem} 분석 완료` : '최근 매장 위생 점수'}</strong>
              <p>{displaySummary}</p>
              {analysis && <small>점검 #{analysis.inspection.inspection.inspectionId}로 이미지와 결과가 저장되었습니다.</small>}
            </div>
          </div>
          {currentResult?.findings && currentResult.findings.length > 0 && (
            <ul className="analysis-findings">
              {currentResult.findings.map((finding) => <li key={finding}>{finding}</li>)}
            </ul>
          )}
          <div className="recent-inspection-list">
            {recentInspections.map((item, index) => (
              <div key={`${item.date}-${index}`}>
                <span>{item.date}</span><strong>{item.score}점</strong>
                <em className={item.result === '주의' ? 'warning' : ''}>{item.result}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel wide-panel">
          <div className="panel-head"><div><span className="panel-label">CHECK ITEMS</span><h2>점검 항목별 상태</h2></div></div>
          <div className="hygiene-item-grid">
            {hygieneItems.map((item) => (
              <div className="hygiene-item-card" key={item.name}>
                <div className="hygiene-item-top">
                  <strong>{item.name}</strong>
                  <span className={`hygiene-status ${getStatusClass(item.status)}`}>{item.status}</span>
                </div>
                <div className="hygiene-progress"><div style={{ width: `${Math.min(item.score, 100)}%` }} /></div>
                <div className="hygiene-item-bottom"><span>{item.score}점</span><p>{item.memo}</p></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {preview && (
        <div className="photo-preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <div className="photo-preview-modal" role="dialog" aria-modal="true" aria-label={`${preview.group.shootingItem} 사진 미리보기`} onClick={(event) => event.stopPropagation()}>
            <div>
              <span>점검 종목</span>
              <h2>{preview.group.shootingItem} 미리보기</h2>
            </div>
            <button type="button" aria-label="미리보기 닫기" onClick={() => setPreview(null)}>×</button>
            <img src={preview.url} alt={`${preview.group.shootingItem} 점검 사진`} />
            <small className="preview-file-name">{preview.file.name}</small>
            <p>{preview.group.aiCheckPoint}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function groupChecklist(items: ChecklistItem[]): ChecklistGroup[] {
  return items.map((item) => ({
    key: item.itemId,
    zone: item.zone,
    shootingItem: item.shootingItem,
    optional: item.optional,
    items: [item],
    aiCheckPoint: item.aiCheckPoint,
  }))
}

function normalizeChecklist(items: ChecklistApiItem[]): ChecklistItem[] {
  return items.map((item) => ({
    itemId: item.itemId ?? item.item_id ?? '',
    zone: item.zone ?? '',
    shootingItem: item.shootingItem ?? item.shooting_item ?? '',
    aiCheckPoint: item.aiCheckPoint ?? item.ai_check_point ?? '',
    checkType: item.checkType ?? item.check_type ?? 'visual',
    maxScore: item.maxScore ?? item.max_score ?? 0,
    optional: Boolean(item.optional),
  })).filter((item) => item.itemId !== '' && item.shootingItem !== '')
}

function averageScore(results: AiResult[]) {
  const scores = results.flatMap((result) => result.score == null ? [] : [result.score])
  return scores.length === 0 ? null : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

function worstGrade(results: AiResult[]): AiResult['grade'] | undefined {
  const priority: AiResult['grade'][] = ['NEEDS_HUMAN_REVIEW', 'UNJUDGEABLE', 'POOR', 'FAIR', 'GOOD']
  return priority.find((grade) => results.some((result) => result.grade === grade))
}

function gradeLabel(grade: AiResult['grade']) {
  return ({ GOOD: '양호', FAIR: '주의', POOR: '긴급', UNJUDGEABLE: '재촬영 필요', NEEDS_HUMAN_REVIEW: '검토 필요' })[grade]
}

function statusClass(grade?: AiResult['grade']) {
  if (grade === 'POOR') return 'danger'
  if (grade && grade !== 'GOOD') return 'warning'
  return 'success'
}

function getStatusClass(status: string) {
  if (status === '정상') return 'safe'
  if (status === '주의') return 'warning'
  return 'danger'
}

export default HygieneCheck
