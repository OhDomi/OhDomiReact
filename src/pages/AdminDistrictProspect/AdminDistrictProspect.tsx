import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../../api/useApiData'
import { downloadMarkdown, stripMarkdownSymbols } from '../riskTool/riskToolShared'
import GeneratingBanner from '../../api/GeneratingBanner'
import { describeApiError } from '../../api/useApiData'
import './AdminDistrictProspect.css'


// closure-risk-model의 prospect-district.html을 React로 재구현(2026-08-10, iframe 제거
// 요청) — 서울 25개 구 SVG 지도로 구 선택 → 격자 후보지(영업지역 게이트+상권 적합도) →
// 선택한 후보지의 신규가맹 상담자료까지 3단계. 지도/후보지 데이터는 원본과 동일한 정적
// 파일(seoul_districts.json/hangang.json, /risk-tool/ 정션 경유)과 API(/risk-api)를 쓴다.

interface DistrictShape {
  name: string
  path: string
  cx: number
  cy: number
}

interface DistrictGeo {
  viewBox: string
  districts: DistrictShape[]
}

interface DistrictPreview {
  gu: string
  fit_overall?: string
  error?: string
}

interface FitIndicator {
  value: number | null
  grade: string
  percentile: number | null
}

interface Candidate {
  gate_passed: boolean
  reason?: string
  trdar_name?: string
  trdar_type?: string
  fit_overall?: string
  fit_indicators?: Record<string, FitIndicator>
  lat: number
  lon: number
  sgg_cd?: string
}

interface TradePriceResult {
  available: boolean
  reason?: string
  deal_ymd?: string
  sample_count?: number
  avg_price_per_pyeong_manwon?: number
}

const LABEL_NUDGE: Record<string, [number, number]> = {
  종로구: [-12, 0],
  양천구: [0, 12],
}

function previewClass(preview: DistrictPreview | undefined): string {
  if (!preview || preview.error || !preview.fit_overall) return 'preview-unknown'
  if (preview.fit_overall === '양호') return 'preview-good'
  if (preview.fit_overall === '조건부 적합') return 'preview-caution'
  return 'preview-poor'
}

const GRADE_LABEL: Record<string, string> = {
  양호: '가장 무난',
  '조건부 적합': '조건부',
  '재검토 권고': '재검토 필요',
}

function gradeText(indicators: Record<string, FitIndicator> | undefined, key: string) {
  const ind = indicators?.[key]
  if (!ind || ind.value == null) return `${key}: 데이터 없음`
  return `${key}: ${ind.grade} (백분위 ${ind.percentile != null ? ind.percentile.toFixed(0) : '-'})`
}

function mapLinks(title: string, lat: number, lon: number) {
  const encTitle = encodeURIComponent(title)
  return {
    kakao: `https://map.kakao.com/link/map/${encTitle},${lat},${lon}`,
    naver: `https://map.naver.com/p?title=${encTitle}&lat=${lat}&lng=${lon}`,
  }
}

function AdminDistrictProspect() {
  const [geo, setGeo] = useState<DistrictGeo | null>(null)
  const [riverPath, setRiverPath] = useState<string | null>(null)
  const [preview, setPreview] = useState<Record<string, DistrictPreview>>({})
  const [selectedGu, setSelectedGu] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [candidatesError, setCandidatesError] = useState('')
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null)
  const [tradePrice, setTradePrice] = useState<TradePriceResult | null>(null)
  type DocState = { md: string } | { error: string } | 'loading' | null
  const [doc, setDoc] = useState<DocState>(null)
  const [salesDoc, setSalesDoc] = useState<DocState>(null)

  /** 실패 원인을 사람이 읽을 수 있는 문자열로 뽑아낸다(관리자 세션에서만 error_code 노출 —
   * `describeApiError` 참고). 네트워크 자체가 끊긴 경우만 이 함수에서 별도 처리. */
  async function describeFetchError(resp: Response | null, err: unknown): Promise<string> {
    if (resp) return describeApiError(resp, `HTTP_${resp.status}`)
    return err instanceof Error ? `네트워크 오류: ${err.message}` : '네트워크 오류'
  }

  useEffect(() => {
    fetch('/risk-tool/hangang.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((v: { path?: string } | null) => setRiverPath(v?.path ?? null))
      .catch(() => {})
    fetch('/risk-tool/seoul_districts.json').then((r) => r.json()).then(setGeo).catch(() => {})
    fetch(apiUrl('/risk-api/district-preview'))
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: DistrictPreview[]) => setPreview(Object.fromEntries((rows || []).map((r) => [r.gu, r]))))
      .catch(() => {})
  }, [])

  const step = selectedCandidateIndex !== null ? 3 : selectedGu ? 2 : 1

  async function selectGu(name: string) {
    setSelectedGu(name)
    setSelectedCandidateIndex(null)
    setDoc(null)
    setSalesDoc(null)
    setCandidates(null)
    setCandidatesError('')
    setCandidatesLoading(true)
    setTradePrice(null)
    try {
      const resp = await fetch(apiUrl('/risk-api/district-grid'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gu: name }),
      })
      if (!resp.ok) throw new Error((await resp.json().catch(() => null))?.detail || '요청 실패')
      const data = await resp.json()
      const list: Candidate[] = data.candidates
      setCandidates(list)
      const firstSgg = list[0]?.sgg_cd
      if (firstSgg) loadTradePrice(firstSgg)
    } catch (e) {
      setCandidatesError(e instanceof Error ? e.message : '후보지를 불러오지 못했습니다.')
    } finally {
      setCandidatesLoading(false)
    }
  }

  async function loadTradePrice(sggCd: string) {
    setTradePrice(null)
    try {
      const resp = await fetch(apiUrl('/risk-api/district-trade-price'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sgg_cd: sggCd }),
      })
      setTradePrice(await resp.json())
    } catch {
      setTradePrice({ available: false, reason: '요청 실패' })
    }
  }

  async function selectCandidate(index: number, candidate: Candidate) {
    setSelectedCandidateIndex(index)
    setDoc('loading')
    setSalesDoc('loading')
    const body = JSON.stringify({
      brand_nm: '김가네', lat: candidate.lat, lon: candidate.lon,
      candidate_area_sqm: 45.0, sbiz_category: '김밥/만두/분식',
    })
    try {
      const resp = await fetch(apiUrl('/risk-api/packets/new-franchisee'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      })
      if (!resp.ok) { setDoc({ error: await describeFetchError(resp, null) }); }
      else {
        const data = await resp.json()
        setDoc({ md: data.new_franchisee_md || '(내용 없음)' })
      }
    } catch (e) {
      setDoc({ error: await describeFetchError(null, e) })
    }
    try {
      const resp = await fetch(apiUrl('/risk-api/packets/expected-sales-certificate'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      })
      if (!resp.ok) { setSalesDoc({ error: await describeFetchError(resp, null) }); }
      else {
        const data = await resp.json()
        setSalesDoc({ md: data.expected_sales_md || '(내용 없음)' })
      }
    } catch (e) {
      setSalesDoc({ error: await describeFetchError(null, e) })
    }
  }

  const districtOptions = useMemo(() => geo?.districts.map((d) => d.name) ?? [], [geo])

  return (
    <div className="admin-district-page">
      <header className="page-heading">
        <div>
          <h1>희망상권 탐색 — 예비창업자용</h1>
          <p>왼쪽 단계 표시를 따라 진행하세요.</p>
        </div>
      </header>

      <div className="district-step-layout">
        <nav className="district-step-rail" aria-label="진행 단계">
          <div className={`district-rail-item ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}><span>1</span>구 선택</div>
          <div className={`district-rail-item ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`}><span>2</span>후보지</div>
          <div className={`district-rail-item ${step === 3 ? 'active' : ''}`}><span>3</span>상담자료</div>
        </nav>

        <div className="district-main">
          <section className="panel">
            <h2>구 선택</h2>
            {geo && (
              <div className="district-map-wrap">
                <svg className="district-map" viewBox={geo.viewBox} role="group" aria-label="서울 25개 구 (클릭해서 선택)">
                  {riverPath && <path d={riverPath} className="hangang-shape" fillRule="evenodd" aria-label="한강 (선택할 수 없는 지역)" />}
                  {geo.districts.map((d) => {
                    const [nudgeX, nudgeY] = LABEL_NUDGE[d.name] || [0, 0]
                    return (
                      <g key={d.name}>
                        <path
                          d={d.path}
                          className={`gu-shape ${previewClass(preview[d.name])}`}
                          role="button"
                          tabIndex={0}
                          aria-pressed={selectedGu === d.name}
                          aria-label={d.name}
                          onClick={() => selectGu(d.name)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectGu(d.name) }
                          }}
                        />
                        <text x={d.cx + nudgeX} y={d.cy + nudgeY} className="gu-label" pointerEvents="none">{d.name}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}
            <p className="district-map-caption">※ 통계청 행정구역 경계 공개 데이터를 단순 투영한 실제 자치구 모양입니다(카카오맵 등 실시간 지도 연동은 아님). 색은 그 구 중심점 기준 사전 계산된 상권 적합도 미리보기입니다(아래 범례 참고), 실제 후보지 순위는 구를 선택한 뒤 격자로 다시 계산합니다.</p>
            <div className="district-map-legend">
              <span><i className="swatch good" />양호</span>
              <span><i className="swatch caution" />조건부 적합</span>
              <span><i className="swatch poor" />재검토 권고</span>
              <span><i className="swatch unknown" />미리보기 없음</span>
            </div>
            <div className="district-gu-select-row">
              <label htmlFor="gu-select">또는 목록에서 선택:</label>
              <select id="gu-select" value={selectedGu ?? ''} onChange={(e) => { if (e.target.value) selectGu(e.target.value) }}>
                <option value="">-- 구 선택 --</option>
                {districtOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </section>

          {selectedGu && (
            <section className="panel district-candidates-section">
              <h2>{selectedGu} 후보지</h2>
              <p className="district-explain">격자 후보지를 영업지역 게이트(기존 가맹점 침해 여부) 통과 여부와 상권 적합도로 랭킹했습니다. 게이트 판정은 실제 김가네 매장 216곳 위치 기준입니다. <strong>참고:</strong> 팀 실 데이터베이스 연동 전까지 쓰는 스냅샷이라 그 이후 신규/폐점 매장은 반영 안 될 수 있습니다. 게이트를 통과한 후보지는 상권 적합도까지 실시간으로 계산하므로(정부 공개 데이터 조회) 매장 수에 따라 몇 초~몇 분 걸릴 수 있습니다.</p>

              {tradePrice && (
                <div className="district-listing-note">
                  <div className="district-listing-label">매물 확인 참고</div>
                  {tradePrice.available ? (
                    <p>
                      이 지역 상업용 부동산 최근 실거래가(국토교통부 공공데이터, <strong>{tradePrice.deal_ymd?.slice(0, 4)}년 {Number(tradePrice.deal_ymd?.slice(4))}월 기준 {tradePrice.sample_count}건 평균 평당 {tradePrice.avg_price_per_pyeong_manwon?.toLocaleString('ko-KR')}만원</strong>) — 실제 매물 목록이 아니라 과거 거래 기록 참고치입니다. 지금 임대 가능한 매물은 아래 후보지 카드의 지도 링크로 이동해 직접 확인해 주세요.
                    </p>
                  ) : (
                    <p>이 지역은 최근 상업용 부동산 실거래 기록을 찾지 못했습니다({tradePrice.reason || '데이터 없음'}) — 매물 확인은 아래 지도 링크로 이동해 직접 검색해 주세요.</p>
                  )}
                </div>
              )}

              {candidatesLoading && <GeneratingBanner title="후보지 계산 중…" detail="실제 계산이라 격자점마다 몇 초~수십 초 걸릴 수 있습니다" />}
              {candidatesError && <div className="results-error">후보지를 불러오지 못했습니다. ({candidatesError})</div>}

              {candidates && !candidatesLoading && (
                candidates.length === 0
                  ? <p className="district-empty-hint">후보지가 없습니다.</p>
                  : (
                    <div className="district-candidate-list">
                      {candidates.map((c, i) => {
                        const placeLabel = c.trdar_name ? `${c.trdar_name}(${c.trdar_type})` : '이름 미상 상권'
                        const title = c.gate_passed
                          ? `${placeLabel} — ${GRADE_LABEL[c.fit_overall ?? ''] || c.fit_overall}`
                          : `${placeLabel} (영업지역 게이트 차단)`
                        const links = mapLinks(`${selectedGu} ${title}`, c.lat, c.lon)
                        return (
                          <article
                            key={i}
                            className={`district-candidate-card ${i === selectedCandidateIndex ? 'is-selected' : ''} ${c.gate_passed ? '' : 'blocked'}`}
                            onClick={() => c.gate_passed && selectCandidate(i, c)}
                          >
                            <div className="district-candidate-head">
                              <span className="district-candidate-title">{title}</span>
                              <span className="district-candidate-coords">좌표 {c.lat.toFixed(5)}, {c.lon.toFixed(5)}</span>
                            </div>
                            {c.gate_passed ? (
                              <div className="district-indicator-row">
                                <span>{gradeText(c.fit_indicators, '유동인구')}</span>
                                <span>{gradeText(c.fit_indicators, '배후인구')}</span>
                                <span>{gradeText(c.fit_indicators, '경쟁밀도(반경 500m)')}</span>
                              </div>
                            ) : (
                              <p className="district-candidate-reason">{c.reason}</p>
                            )}
                            <div className="district-map-links" onClick={(e) => e.stopPropagation()}>
                              <a href={links.kakao} target="_blank" rel="noopener noreferrer">카카오맵에서 보기</a>
                              <a href={links.naver} target="_blank" rel="noopener noreferrer">네이버지도에서 보기</a>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )
              )}
            </section>
          )}

          {selectedCandidateIndex !== null && (
            <section className="panel district-doc-section">
              <h2>선택한 후보지 상담자료</h2>
              {doc === 'loading' && <GeneratingBanner title="상담자료 생성 중…" detail="실제 계산이라 몇 초~수십 초 걸릴 수 있습니다" />}
              {doc && typeof doc === 'object' && 'error' in doc && (
                <div className="results-error">상담자료를 만들지 못했습니다. ({doc.error})</div>
              )}
              {doc && typeof doc === 'object' && 'md' in doc && (
                <>
                  <PdfMdDownloadButtons
                    markdown={doc.md}
                    filenameBase={`${(selectedGu || '').replace(/[\\/:*?"<>|]/g, '_')}_후보지_신규가맹상담자료`}
                  />
                  <pre className="packet-md">{stripMarkdownSymbols(doc.md)}</pre>
                </>
              )}
            </section>
          )}

          {selectedCandidateIndex !== null && (
            <section className="panel district-doc-section">
              <h2>예상매출액 산정서 (공정위 표준양식)</h2>
              <p className="district-explain">공정거래위원회 「예상매출액 산정서의 표준양식에 관한 규정」 별지 서식 구조에 맞춘 법정 서면입니다 — 위 상담자료의 "3. 예상매출액 산정서"와 계산은 동일하고, 문서 구조만 표준양식에 맞춰 별도로 다운로드할 수 있게 한 것입니다.</p>
              {salesDoc === 'loading' && <GeneratingBanner title="산정서 생성 중…" detail="실제 계산이라 몇 초~수십 초 걸릴 수 있습니다" />}
              {salesDoc && typeof salesDoc === 'object' && 'error' in salesDoc && (
                <div className="results-error">예상매출액 산정서를 만들지 못했습니다. ({salesDoc.error})</div>
              )}
              {salesDoc && typeof salesDoc === 'object' && 'md' in salesDoc && (
                <>
                  <PdfMdDownloadButtons
                    markdown={salesDoc.md}
                    filenameBase={`${(selectedGu || '').replace(/[\\/:*?"<>|]/g, '_')}_예상매출액산정서`}
                  />
                  <pre className="packet-md">{stripMarkdownSymbols(salesDoc.md)}</pre>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// PDF/.md 두 형식으로 다운로드(2026-08-11, "pdf와 .md파일 두개의 형식으로 다운받을수 있도록"
// 요청). .md는 클라이언트에서 바로 Blob으로 내려주고, PDF는 서버가 그 자리에서 실제 변환해
// 응답하는 /export/pdf(closure-risk-model, 헤드리스 Chrome 재사용)를 그대로 쓴다.
function PdfMdDownloadButtons({ markdown, filenameBase }: { markdown: string; filenameBase: string }) {
  const [pdfBusy, setPdfBusy] = useState(false)
  const [error, setError] = useState('')

  async function downloadPdf() {
    setPdfBusy(true)
    setError('')
    try {
      const resp = await fetch(apiUrl('/risk-api/export/pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, filename: filenameBase }),
      })
      if (!resp.ok) throw new Error(await describeApiError(resp, `HTTP_${resp.status}`))
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filenameBase}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(`PDF 다운로드에 실패했습니다. (${e instanceof Error ? e.message : '알 수 없는 오류'})`)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="doc-actions">
      <button type="button" className="check-btn" data-backend-ready="true" onClick={() => downloadMarkdown(`${filenameBase}.md`, markdown)}>
        다운로드 (.md)
      </button>
      <button type="button" className="check-btn" data-backend-ready="true" disabled={pdfBusy} onClick={downloadPdf}>
        {pdfBusy ? 'PDF 생성 중…' : '다운로드 (PDF)'}
      </button>
      {error && <p className="download-menu-error">{error}</p>}
    </div>
  )
}

export default AdminDistrictProspect
