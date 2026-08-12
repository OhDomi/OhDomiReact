import { useEffect, useId, useRef, useState } from 'react'
import './TrendLineChart.css'

type TrendPoint = { label: string; value: number }

type ChartPoint = TrendPoint & { x: number; y: number }

type TrendLineChartProps = {
  data: TrendPoint[]
  height?: number
  color?: string
  formatValue?: (value: number) => string
  showBars?: boolean
}

const LEFT_GUTTER = 46
const BOTTOM_BAND = 28
const TOP_PAD = 30
const BAR_WIDTH = 18
const MARKER_R = 5
const DEFAULT_WIDTH = 720
// Keeps the first/last point off the plot edges — without it a point (and its
// bar) sits exactly on the boundary, half of it clipped by the chart's own edge.
const SIDE_PAD = 28

// "Nice" round tick step (1/2/5 × 10^n) so axis values read as clean numbers,
// never raw floating-point noise.
function niceStep(max: number, tickCount = 4) {
  if (max <= 0) return 1
  const rough = max / tickCount
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10
  return step * magnitude
}

function roundedTopBarPath(x: number, y: number, width: number, bottomY: number, radius: number) {
  const barHeight = bottomY - y
  const r = Math.min(radius, width / 2, Math.max(barHeight, 0))
  if (r <= 0) return `M ${x} ${bottomY} L ${x + width} ${bottomY} L ${x + width} ${y} L ${x} ${y} Z`
  return `M ${x} ${bottomY} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${bottomY} Z`
}

// Monotone cubic Hermite interpolation (Fritsch–Carlson), the same curve family
// dashboards like Linear/Vercel Analytics use for trend lines — smooth between
// points but, unlike a naive Catmull-Rom spline, never overshoots past a local
// min/max and invents a bump the data doesn't have.
function monotonePath(points: ChartPoint[]) {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M ${points[0].x} ${points[0].y}`

  const dx: number[] = []
  const dy: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = points[i + 1].x - points[i].x
    dy[i] = points[i + 1].y - points[i].y
    slope[i] = dx[i] === 0 ? 0 : dy[i] / dx[i]
  }

  const tangent: number[] = new Array(n).fill(0)
  tangent[0] = slope[0]
  tangent[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i += 1) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const alpha = tangent[i] / slope[i]
    const beta = tangent[i + 1] / slope[i]
    const magnitude = alpha * alpha + beta * beta
    if (magnitude > 9) {
      const tau = 3 / Math.sqrt(magnitude)
      tangent[i] = tau * alpha * slope[i]
      tangent[i + 1] = tau * beta * slope[i]
    }
  }

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < n - 1; i += 1) {
    const cp1x = points[i].x + dx[i] / 3
    const cp1y = points[i].y + (tangent[i] * dx[i]) / 3
    const cp2x = points[i + 1].x - dx[i] / 3
    const cp2y = points[i + 1].y - (tangent[i + 1] * dx[i]) / 3
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`
  }
  return d
}

// Measures the wrapper's real pixel width so the SVG viewBox can match it 1:1 —
// avoids preserveAspectRatio="none" stretch, which would render circles as
// ellipses and distort text whenever the container isn't exactly the design width.
function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width
      if (measured) setWidth(measured)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

function TrendLineChart({ data, height = 240, color = '#6246e5', formatValue = String, showBars = false }: TrendLineChartProps) {
  const gradientId = useId()
  const barGradientId = useId()
  const [wrapRef, width] = useMeasuredWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  if (data.length === 0) return null

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 0)
  const step = niceStep(maxValue)
  const axisMax = Math.max(step, Math.ceil(maxValue / step) * step)
  const ticks: number[] = []
  for (let t = 0; t <= axisMax + step * 0.001; t += step) ticks.push(Math.round(t * 100) / 100)

  const plotLeft = LEFT_GUTTER
  const plotRight = width
  const plotWidth = Math.max(1, plotRight - plotLeft)
  const plotBottom = height - BOTTOM_BAND
  const plotHeight = plotBottom - TOP_PAD

  const dataLeft = plotLeft + SIDE_PAD
  const dataRight = Math.max(dataLeft, plotRight - SIDE_PAD)
  const dataWidth = dataRight - dataLeft
  const stepX = data.length > 1 ? dataWidth / (data.length - 1) : 0

  const valueToY = (value: number) => plotBottom - (value / axisMax) * plotHeight
  const points: ChartPoint[] = data.map((d, i) => ({
    x: dataLeft + (data.length > 1 ? i * stepX : dataWidth / 2),
    y: valueToY(d.value),
    ...d,
  }))

  const linePath = monotonePath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`

  const maxIndex = values.indexOf(maxValue)
  const lastIndex = points.length - 1
  const labeledIndexes = new Set([lastIndex, maxIndex])

  function nearestIndexAt(clientX: number) {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const relX = clientX - rect.left
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })
    return nearest
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div className="trend-line-chart">
      <div className="trend-line-svg-wrap" ref={wrapRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={data.map((d) => `${d.label} ${formatValue(d.value)}`).join(', ')}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.24" />
              <stop offset="55%" stopColor={color} stopOpacity="0.07" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => {
            const y = valueToY(tick)
            return (
              <g key={tick}>
                <line x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="#e7ebf1" strokeWidth="1" />
                <text x={plotLeft - 8} y={y} textAnchor="end" dominantBaseline="middle" className="trend-axis-label">
                  {formatValue(tick)}
                </text>
              </g>
            )
          })}

          {showBars && points.map((p, i) => (
            <path
              key={`bar-${p.label}`}
              className="trend-bar"
              style={{ animationDelay: `${i * 55}ms`, transformOrigin: `${p.x}px ${plotBottom}px` }}
              d={roundedTopBarPath(p.x - BAR_WIDTH / 2, p.y, BAR_WIDTH, plotBottom, 4)}
              fill={`url(#${barGradientId})`}
            />
          ))}
          {!showBars && <path className="trend-area" d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}

          <path
            className="trend-line"
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
          />

          {hovered && (
            <line x1={hovered.x} y1={TOP_PAD - 10} x2={hovered.x} y2={plotBottom} stroke="#c3c2b7" strokeWidth="1" />
          )}

          {points.map((p, i) => (
            <g
              key={p.label}
              className={`trend-marker ${hoverIndex === i ? 'is-hovered' : ''}`}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            >
              <circle cx={p.x} cy={p.y} r={MARKER_R + 2} fill="#fff" />
              <circle cx={p.x} cy={p.y} r={MARKER_R} fill={color} />
            </g>
          ))}

          {points.map((p, i) => labeledIndexes.has(i) && (
            <text key={`label-${p.label}`} x={p.x} y={p.y - MARKER_R - 8} textAnchor="middle" className="trend-value-label">
              {formatValue(p.value)}
            </text>
          ))}

          {points.map((p) => (
            <text key={`x-${p.label}`} x={p.x} y={height - 6} textAnchor="middle" className="trend-axis-label">
              {p.label}
            </text>
          ))}

          <rect
            x={plotLeft} y={0} width={plotWidth} height={height}
            fill="transparent"
            onPointerMove={(event) => setHoverIndex(nearestIndexAt(event.clientX))}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>

        <div
          className={`trend-tooltip ${hovered ? 'is-visible' : ''}`}
          style={hovered ? {
            left: `${width ? (hovered.x / width) * 100 : 50}%`,
            top: `${Math.max(0, (hovered.y / height) * 100 - 12)}%`,
          } : undefined}
        >
          {hovered && (
            <>
              <strong>{formatValue(hovered.value)}</strong>
              <span>{hovered.label}</span>
            </>
          )}
        </div>
      </div>

      <button type="button" className="trend-table-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? '표 접기' : '표로 보기'}
      </button>

      {showTable && (
        <table className="trend-table">
          <thead>
            <tr>
              <th scope="col">구간</th>
              <th scope="col">값</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{formatValue(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TrendLineChart
