'use client'

// 8領域レーダーチャート（SVGベース、外部ライブラリ不要）

const DOMAINS = [
  { key: 'attention',          label: '集中' },
  { key: 'working_memory',     label: '記憶' },
  { key: 'processing_speed',   label: 'スピード' },
  { key: 'motivation_emotion', label: 'やる気' },
  { key: 'study_habits',       label: '習慣' },
  { key: 'sensory',            label: '感覚' },
  { key: 'math_calculation',   label: '算数' },
  { key: 'kanji_literacy',     label: '国語' },
]

type DomainData = {
  score: number
  level: string
}

interface RadarChartProps {
  domains: Record<string, DomainData>
}

const CX = 200
const CY = 200
const R = 140   // 最大半径
const N = DOMAINS.length

function polarToXY(angle: number, r: number) {
  // 上（-90度）を基準に時計回り
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  }
}

function pointsToPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + ' Z'
}

const LEVEL_COLORS: Record<string, string> = {
  high:   '#43A047',
  middle: '#2196F3',
  low:    '#FB8C00',
}

export default function RadarChart({ domains }: RadarChartProps) {
  const angleStep = 360 / N

  // グリッド（25 / 50 / 75 / 100）
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  // スコアを 0〜100 として正規化（score フィールドを使用）
  const scores = DOMAINS.map(({ key }) => {
    const d = domains[key]
    const score = d?.score ?? 50
    return Math.min(100, Math.max(0, score))
  })

  // データポリゴン頂点
  const dataPoints = DOMAINS.map((_, i) => {
    const angle = i * angleStep
    const ratio = scores[i] / 100
    return polarToXY(angle, R * ratio)
  })

  // 平均スコア（中央表示用）
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / N)

  // dominant level 色
  const highCount  = DOMAINS.filter(({ key }) => domains[key]?.level === 'high').length
  const lowCount   = DOMAINS.filter(({ key }) => domains[key]?.level === 'low').length
  const accentColor = highCount >= lowCount ? LEVEL_COLORS.high : lowCount > 0 ? LEVEL_COLORS.low : LEVEL_COLORS.middle

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-xs"
        aria-label="8領域レーダーチャート"
      >
        {/* グリッド六角形（多角形） */}
        {gridLevels.map((level) => {
          const pts = DOMAINS.map((_, i) => polarToXY(i * angleStep, R * level))
          return (
            <polygon
              key={level}
              points={pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}
              fill="none"
              stroke="#E0E7EF"
              strokeWidth={level === 1.0 ? 1.5 : 1}
            />
          )
        })}

        {/* 軸線 */}
        {DOMAINS.map((_, i) => {
          const outer = polarToXY(i * angleStep, R)
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={outer.x.toFixed(2)}
              y2={outer.y.toFixed(2)}
              stroke="#E0E7EF"
              strokeWidth={1}
            />
          )
        })}

        {/* データポリゴン（塗りつぶし） */}
        <path
          d={pointsToPath(dataPoints)}
          fill={accentColor}
          fillOpacity={0.18}
          stroke={accentColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 頂点の丸 */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x.toFixed(2)}
            cy={p.y.toFixed(2)}
            r={4}
            fill={accentColor}
          />
        ))}

        {/* 中央：平均スコア */}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize={26} fontWeight="bold" fill={accentColor}>
          {avg}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize={11} fill="#6B7280">
          平均スコア
        </text>

        {/* 軸ラベル */}
        {DOMAINS.map(({ label }, i) => {
          const angle = i * angleStep
          const labelR = R + 26
          const pos = polarToXY(angle, labelR)

          // ラベルのアンカーを位置によって調整
          const absAngle = ((angle % 360) + 360) % 360
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          if (absAngle > 20 && absAngle < 160)  anchor = 'start'
          if (absAngle > 200 && absAngle < 340) anchor = 'end'

          const domain = domains[DOMAINS[i].key]
          const color = LEVEL_COLORS[domain?.level ?? 'middle']

          return (
            <text
              key={i}
              x={pos.x.toFixed(2)}
              y={pos.y.toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight="600"
              fill={color}
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* 凡例 */}
      <div className="flex gap-4 mt-1 text-xs text-gray-500">
        {Object.entries(LEVEL_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {level === 'high' ? '強み' : level === 'middle' ? '標準的' : 'のびしろ'}
          </span>
        ))}
      </div>
    </div>
  )
}
