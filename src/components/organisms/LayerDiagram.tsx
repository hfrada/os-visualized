import type { KeyboardEvent } from 'react'
import { sketchCircle, sketchRect, stickFigure } from '../../lib/sketch'

export type LayerId = 'user' | 'app' | 'os' | 'hw'
export type DiagramView = 'onion' | 'stack'
export type Lane = 'down' | 'up'

type Point = [number, number]

const layerIds: LayerId[] = ['user', 'app', 'os', 'hw']

const center = 280
const radius: Record<LayerId, number> = { user: 262, app: 200, os: 140, hw: 78 }
const innerRadius: Record<LayerId, number> = { user: 200, app: 140, os: 78, hw: 0 }
const userAngles = [-135, -45, 45, 135]

const box = { x: 40, width: 480, height: 110 }
const boxTop: Record<LayerId, number> = { user: 20, app: 150, os: 280, hw: 410 }
const userColumns = [130, 230, 330, 430]

function polar(distance: number, degrees: number): Point {
  const angle = (degrees * Math.PI) / 180
  return [center + distance * Math.cos(angle), center + distance * Math.sin(angle)]
}

const lanes: Record<DiagramView, Record<LayerId, Record<Lane, Point>>> = {
  onion: {
    user: { down: polar(231, -126), up: polar(231, -150) },
    app: { down: polar(170, -135), up: polar(170, -150) },
    os: { down: polar(109, -135), up: polar(109, -150) },
    hw: { down: polar(48, -120), up: polar(48, -120) },
  },
  stack: {
    user: { down: [104, 48], up: [104, 66] },
    app: { down: [88, 205], up: [120, 205] },
    os: { down: [88, 335], up: [120, 335] },
    hw: { down: [104, 465], up: [104, 465] },
  },
}

const onionRings = (['hw', 'os', 'app', 'user'] as const).map((layer, index) => ({
  main: sketchCircle(center, center, radius[layer], 11 + index),
  faint: sketchCircle(center - 2, center - 3, radius[layer] + 3, 51 + index),
}))

const onionUsers = userAngles.map((degrees, index) => {
  const [x, y] = polar(231, degrees)
  return { x, y, figure: stickFigure(x, y - 6, 80 + index) }
})

const stackBoxes = layerIds.map((layer, index) => ({
  main: sketchRect(box.x, boxTop[layer], box.width, box.height, 21 + index),
  faint: sketchRect(box.x - 3, boxTop[layer] - 3, box.width + 2, box.height + 1, 61 + index),
}))

const stackUsers = userColumns.map((x, index) => ({ x, figure: stickFigure(x, 64, 90 + index) }))

function bandRadius(layer: LayerId) {
  return (innerRadius[layer] + radius[layer]) / 2
}

function Highlight({ view, layer, soft }: { view: DiagramView; layer: LayerId; soft: boolean }) {
  const fill = soft ? 'fill-highlight-soft' : 'fill-highlight'

  if (view === 'stack') {
    return (
      <rect
        x={box.x + 8}
        y={boxTop[layer] + 8}
        width={box.width - 16}
        height={box.height - 16}
        rx="6"
        className={fill}
      />
    )
  }
  if (layer === 'hw') return <circle cx={center} cy={center} r={radius.hw - 5} className={fill} />
  return (
    <circle
      cx={center}
      cy={center}
      r={bandRadius(layer)}
      fill="none"
      strokeWidth={radius[layer] - innerRadius[layer] - 10}
      className={soft ? 'stroke-highlight-soft' : 'stroke-highlight'}
    />
  )
}

function HitShape({ view, layer }: { view: DiagramView; layer: LayerId }) {
  if (view === 'stack') {
    return <rect x={box.x} y={boxTop[layer]} width={box.width} height={box.height} fill="transparent" />
  }
  if (layer === 'hw') return <circle cx={center} cy={center} r={radius.hw} fill="transparent" />
  return (
    <circle
      cx={center}
      cy={center}
      r={bandRadius(layer)}
      fill="none"
      stroke="transparent"
      strokeWidth={radius[layer] - innerRadius[layer]}
      pointerEvents="stroke"
    />
  )
}

function Outline({ main, faint }: { main: string; faint: string }) {
  return (
    <>
      <path d={main} strokeWidth="2" />
      <path d={faint} strokeWidth="1.3" opacity="0.45" />
    </>
  )
}

type LayerDiagramProps = {
  view: DiagramView
  names: Record<LayerId, string>
  userLabels: string[]
  highlighted: LayerId | null
  hovered: LayerId | null
  interactive: boolean
  onHover: (layer: LayerId | null) => void
  onSelect: (layer: LayerId) => void
  dot: { layer: LayerId; lane: Lane } | null
  travelMs: number
}

export function LayerDiagram({
  view,
  names,
  userLabels,
  highlighted,
  hovered,
  interactive,
  onHover,
  onSelect,
  dot,
  travelMs,
}: LayerDiagramProps) {
  const dotPoint = dot && lanes[view][dot.layer][dot.lane]

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, layer: LayerId) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(layer)
  }

  return (
    <svg viewBox="0 0 560 560" className="block h-auto w-full max-w-[600px] select-none">
      {hovered && hovered !== highlighted && <Highlight view={view} layer={hovered} soft />}
      {highlighted && <Highlight view={view} layer={highlighted} soft={false} />}

      <g strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-ink">
        {view === 'onion' ? (
          <>
            {onionRings.map((ring, index) => (
              <Outline key={index} {...ring} />
            ))}
            {onionUsers.map((user, index) => (
              <path key={index} d={user.figure} strokeWidth="1.6" />
            ))}
          </>
        ) : (
          <>
            {stackBoxes.map((rect, index) => (
              <Outline key={index} {...rect} />
            ))}
            {stackUsers.map((user, index) => (
              <path key={index} d={user.figure} strokeWidth="1.6" />
            ))}
          </>
        )}
      </g>

      <g textAnchor="middle" className="fill-ink font-hand">
        {view === 'onion' ? (
          <>
            <text x={center} y={center - 225} fontSize="20">
              {names.user}
            </text>
            <text x={center} y={center - 158} fontSize="18">
              {names.app}
            </text>
            <text x={center} y={center - 103} fontSize="18">
              {names.os}
            </text>
            <text x={center} y={center + 16} fontSize="22" fontWeight="700">
              {names.hw}
            </text>
            {onionUsers.map((user, index) => (
              <text key={index} x={user.x} y={user.y + 28} fontSize="14">
                {userLabels[index]}
              </text>
            ))}
          </>
        ) : (
          <>
            {stackUsers.map((user, index) => (
              <text key={index} x={user.x} y="106" fontSize="14">
                {userLabels[index]}
              </text>
            ))}
            <text x={center} y={boxTop.app + 64} fontSize="24">
              {names.app}
            </text>
            <text x={center} y={boxTop.os + 64} fontSize="24">
              {names.os}
            </text>
            <text x={center} y={boxTop.hw + 64} fontSize="24" fontWeight="700">
              {names.hw}
            </text>
          </>
        )}
      </g>

      {layerIds.map((layer) => (
        <g
          key={layer}
          role="button"
          tabIndex={interactive ? 0 : -1}
          aria-label={names[layer]}
          aria-pressed={highlighted === layer}
          className={interactive ? 'cursor-pointer outline-none' : 'outline-none'}
          onClick={interactive ? () => onSelect(layer) : undefined}
          onKeyDown={interactive ? (event) => handleKeyDown(event, layer) : undefined}
          onPointerEnter={interactive ? () => onHover(layer) : undefined}
          onPointerLeave={() => onHover(null)}
          onFocus={interactive ? () => onHover(layer) : undefined}
          onBlur={() => onHover(null)}
        >
          <HitShape view={view} layer={layer} />
        </g>
      ))}

      {dotPoint && (
        <circle
          r="8"
          pointerEvents="none"
          className="fill-marker transition-transform ease-in-out motion-reduce:transition-none"
          style={{
            transform: `translate(${dotPoint[0]}px, ${dotPoint[1]}px)`,
            transitionDuration: `${travelMs}ms`,
          }}
        />
      )}
    </svg>
  )
}
