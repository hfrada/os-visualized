import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  sketchArc,
  sketchArrow,
  sketchBug,
  sketchCircle,
  sketchCurtain,
  sketchCylinder,
  sketchEllipse,
  sketchLine,
  sketchProcessor,
  sketchRect,
  sketchScribble,
  sketchSegments,
  sketchSquiggle,
} from '../../lib/sketch'

export type RoleId = 'referee' | 'illusionist' | 'glue'
export type AppId = 'editor' | 'chat' | 'music'

export type RoleLabels = {
  apps: Record<AppId, string>
  os: string
  cpu: string
  memory: string
  disk: string
  paintedCpu: string
  paintedMemory: string
  word: string
  file: string
  curtain: string
}

export type RoleScene =
  | { role: 'referee'; crashed: AppId[]; isolated: AppId[]; isolateDelayMs: number; restarts: Record<AppId, number> }
  | { role: 'illusionist'; curtainOpen: boolean; turn: AppId | null; memoryFocus: boolean }
  | { role: 'glue'; level: number }

export type OsFlash = {
  key: string
  delayMs: number
}

type Point = [number, number]

const apps: AppId[] = ['editor', 'chat', 'music']
const windowTop = 14
const windowWidth = 176
const windowHeight = 118
const windowLeft: Record<AppId, number> = { editor: 20, chat: 232, music: 444 }
const band = { x: 20, y: 160, width: 600, height: 60 }
const cpu = { x: 108, y: 304, size: 56 }
const memory = { x: 220, y: 288, width: 200, height: 32 }
const memoryShare: Record<AppId, [number, number]> = { editor: [220, 282], chat: [282, 336], music: [336, 394] }
const disk = { x: 532, top: 286, rx: 36, ry: 9, height: 40 }
const labelY = 366
const rodY = 244
const curtain = { left: 14, right: 626, top: 246, bottom: 394, lift: 170 }
const clipboard = { x: 300, y: 168, width: 56, height: 46 }
const barSeconds: Record<AppId, number> = { editor: 11.8, chat: 15.4, music: 9.1 }
const barHead: Record<AppId, number> = { editor: 0.2, chat: 0.55, music: 0.8 }
const bugReach: Record<AppId, number> = { editor: 49, chat: -73, music: -73 }
const fileIcon = 'M0,-8 L8,-8 L12,-4 L12,8 L0,8 Z M8,-8 L8,-4 L12,-4 M3,0 L9,0 M3,3.5 L8,3.5'

const middle = (app: AppId) => windowLeft[app] + windowWidth / 2

const windows = apps.map((app, index) => {
  const x = windowLeft[app]
  return {
    main: sketchRect(x, windowTop, windowWidth, windowHeight, 31 + index),
    faint: sketchRect(x - 3, windowTop - 3, windowWidth + 2, windowHeight + 1, 71 + index),
    titleBar: sketchLine(x, windowTop + 28, x + windowWidth, windowTop + 28, 111 + index, 3),
    buttons: [0, 1, 2].map((k) => sketchCircle(x + windowWidth - 14 - k * 12, windowTop + 14, 3.2, 141 + index * 3 + k)).join(' '),
    bar: sketchRect(x + 14, windowTop + 94, windowWidth - 28, 10, 121 + index, 2),
    scribble: sketchScribble(x + 20, windowTop + 40, windowWidth - 40, 44, 131 + index),
    fence: sketchRect(x - 10, windowTop - 10, windowWidth + 20, windowHeight + 20, 161 + index, 4),
    bug: sketchBug(middle(app) + 12, windowTop + 62, 151 + index * 4),
    arrow: sketchArrow(cpu.x, cpu.y - cpu.size / 2 - 11, middle(app), windowTop + windowHeight + 9, 571 + index),
  }
})

const editorText = [
  sketchSquiggle(windowLeft.editor + 14, windowLeft.editor + 150, windowTop + 45, 501),
  sketchSquiggle(windowLeft.editor + 14, windowLeft.editor + 124, windowTop + 60, 505),
  sketchSquiggle(windowLeft.editor + 14, windowLeft.editor + 140, windowTop + 75, 506),
].join(' ')

const editorDraft = [
  sketchSquiggle(windowLeft.editor + 14, windowLeft.editor + 150, windowTop + 74, 503),
  sketchSquiggle(windowLeft.editor + 14, windowLeft.editor + 112, windowTop + 90, 504),
].join(' ')

const chatIncoming = [
  sketchRect(windowLeft.chat + 12, windowTop + 36, 92, 18, 511, 2),
  sketchSquiggle(windowLeft.chat + 20, windowLeft.chat + 96, windowTop + 45, 512, 1.8),
].join(' ')

const chatReply = [
  sketchRect(windowLeft.chat + windowWidth - 90, windowTop + 60, 78, 18, 513, 2),
  sketchSquiggle(windowLeft.chat + windowWidth - 82, windowLeft.chat + windowWidth - 20, windowTop + 69, 514, 1.8),
].join(' ')

const musicHead = sketchEllipse(windowLeft.music + 30, windowTop + 72, 5.5, 4, 521)
const musicLines = [
  `M${windowLeft.music + 35},${windowTop + 71} L${windowLeft.music + 35.5},${windowTop + 49} Q${windowLeft.music + 42},${windowTop + 52} ${windowLeft.music + 43},${windowTop + 59}`,
  sketchSquiggle(windowLeft.music + 56, windowLeft.music + 158, windowTop + 62, 522, 5, 8),
].join(' ')

const osOutline = {
  main: sketchRect(band.x, band.y, band.width, band.height, 301),
  faint: sketchRect(band.x - 3, band.y - 3, band.width + 2, band.height + 1, 302),
}

const clipboardShape = {
  board: sketchRect(clipboard.x, clipboard.y, clipboard.width, clipboard.height, 311, 3),
  clip: sketchRect(clipboard.x + clipboard.width / 2 - 10, clipboard.y - 5, 20, 9, 312, 2),
  lines: sketchSegments(
    [
      [clipboard.x + 10, clipboard.y + 18, clipboard.x + clipboard.width - 10, clipboard.y + 18],
      [clipboard.x + 10, clipboard.y + 27, clipboard.x + clipboard.width - 14, clipboard.y + 27],
      [clipboard.x + 10, clipboard.y + 36, clipboard.x + clipboard.width - 18, clipboard.y + 36],
    ],
    313,
  ),
}

const hardware = {
  processor: sketchProcessor(cpu.x, cpu.y, cpu.size, 401),
  die: sketchRect(cpu.x - 14, cpu.y - 14, 28, 28, 402, 2),
  memory: sketchRect(memory.x, memory.y, memory.width, memory.height, 411, 4),
  memoryFaint: sketchRect(memory.x - 3, memory.y - 3, memory.width + 2, memory.height + 1, 412, 4),
  cells: sketchSegments(
    Array.from({ length: 7 }, (_, i) => {
      const x = memory.x + 25 * (i + 1)
      return [x, memory.y + 5, x, memory.y + memory.height - 5] as [number, number, number, number]
    }),
    413,
  ),
  shares: sketchSegments(
    apps.map((app) => {
      const x = memoryShare[app][1]
      return [x, memory.y + 1, x, memory.y + memory.height - 1] as [number, number, number, number]
    }),
    414,
  ),
  disk: sketchCylinder(disk.x, disk.top, disk.rx, disk.ry, disk.height, 421),
  diskRing: sketchArc(disk.x, disk.top + disk.height * 0.45, disk.rx, disk.ry, 0, Math.PI, 424),
}

const curtainShape = sketchCurtain(curtain.left, curtain.right, curtain.top - 2, curtain.bottom, 531)
const rod = {
  bar: sketchLine(8, rodY, 632, rodY, 561, 2),
  knobs: `${sketchCircle(8, rodY, 4.5, 562)} ${sketchCircle(632, rodY, 4.5, 563)}`,
}

const painted = apps.map((app, index) => {
  const x = middle(app) - 72
  const y = 332
  return {
    processor: sketchProcessor(middle(app), 290, 40, 541 + index),
    memory: [
      sketchLine(x + 112, y, x, y, 551 + index * 3, 3),
      sketchLine(x, y, x, y + 18, 552 + index * 3, 3),
      sketchLine(x, y + 18, x + 112, y + 18, 553 + index * 3, 3),
    ].join(' '),
    endless: `M${x + 117},${y} L${x + 150},${y} M${x + 117},${y + 18} L${x + 150},${y + 18}`,
  }
})

function useTextWidth(text: string) {
  const ref = useRef<SVGTextElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    let active = true
    const measure = () => {
      if (active) setWidth(element.getComputedTextLength())
    }
    measure()
    document.fonts.ready.then(measure)
    return () => {
      active = false
    }
  }, [text])

  return [ref, width] as const
}

function OsBand({ label, withClipboard, flash }: { label: string; withClipboard: boolean; flash: OsFlash | null }) {
  return (
    <>
      {flash && (
        <rect
          key={flash.key}
          x={band.x + 5}
          y={band.y + 5}
          width={band.width - 10}
          height={band.height - 10}
          rx="6"
          className="animate-flash fill-highlight"
          style={{ animationDelay: `${flash.delayMs}ms` }}
        />
      )}
      <path d={osOutline.main} strokeWidth="2" className="fill-none stroke-ink" />
      <path d={osOutline.faint} strokeWidth="1.3" opacity="0.45" className="fill-none stroke-ink" />
      <text x={band.x + band.width - 16} y={band.y + 37} fontSize="19" textAnchor="end" className="fill-ink font-hand">
        {label}
      </text>
      {withClipboard && (
        <>
          <rect x={clipboard.x} y={clipboard.y} width={clipboard.width} height={clipboard.height} className="fill-paper" />
          <path d={clipboardShape.board} strokeWidth="1.8" className="fill-none stroke-ink" />
          <rect x={clipboard.x + clipboard.width / 2 - 10} y={clipboard.y - 5} width="20" height="9" className="fill-paper" />
          <path d={clipboardShape.clip} strokeWidth="1.6" className="fill-none stroke-ink" />
          <path d={clipboardShape.lines} strokeWidth="1.3" opacity="0.45" className="fill-none stroke-ink" />
        </>
      )}
    </>
  )
}

function Hardware({ labels, shared, memoryFocus }: { labels: RoleLabels; shared: boolean; memoryFocus: boolean }) {
  return (
    <>
      <rect x={cpu.x - cpu.size / 2} y={cpu.y - cpu.size / 2} width={cpu.size} height={cpu.size} className="fill-paper" />
      {shared && (
        <rect
          x={memory.x + 3}
          y={memory.y + 3}
          width={memory.width - 6}
          height={memory.height - 6}
          rx="4"
          className={`fill-highlight transition-opacity duration-200 ${memoryFocus ? '' : 'opacity-0'}`}
        />
      )}
      <g className="fill-none stroke-ink">
        <path d={hardware.processor} strokeWidth="2" />
        <path d={hardware.die} strokeWidth="1.3" opacity="0.45" />
        <path d={hardware.memory} strokeWidth="2" />
        <path d={hardware.memoryFaint} strokeWidth="1.3" opacity="0.45" />
        {shared ? <path d={hardware.shares} strokeWidth="1.6" /> : <path d={hardware.cells} strokeWidth="1.2" opacity="0.45" />}
        <path d={hardware.disk} strokeWidth="2" />
        <path d={hardware.diskRing} strokeWidth="1.3" opacity="0.45" />
      </g>
      <g textAnchor="middle" className="fill-ink font-hand">
        {shared &&
          apps.map((app) => (
            <text key={app} x={(memoryShare[app][0] + memoryShare[app][1]) / 2} y={memory.y + 21} fontSize="12">
              {labels.apps[app]}
            </text>
          ))}
        <text x={cpu.x} y={labelY} fontSize="17">
          {labels.cpu}
        </text>
        <text x={memory.x + memory.width / 2} y={labelY} fontSize="17">
          {labels.memory}
        </text>
        <text x={disk.x} y={labelY} fontSize="17">
          {labels.disk}
        </text>
      </g>
    </>
  )
}

type CurtainProps = {
  open: boolean
  labels: RoleLabels
  interactive: boolean
  onToggle: () => void
}

function Curtain({ open, labels, interactive, onToggle }: CurtainProps) {
  function handleKeyDown(event: KeyboardEvent<SVGRectElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onToggle()
  }

  return (
    <>
      <g clipPath="url(#os-roles-hardware)">
        <g
          className="transition-transform duration-1000 ease-[cubic-bezier(.65,.05,.35,1)] motion-reduce:transition-none"
          style={{ transform: `translateY(${open ? -curtain.lift : 0}px)` }}
        >
          <path d={curtainShape.body} className="fill-paper" />
          <path d={curtainShape.folds} strokeWidth="1.2" opacity="0.3" className="fill-none stroke-ink" />
          <path d={curtainShape.body} strokeWidth="2" className="fill-none stroke-ink" />
          {apps.map((app, index) => (
            <g key={app}>
              <rect x={middle(app) - 20} y="270" width="40" height="40" className="fill-paper" />
              <rect x={middle(app) - 72} y="332" width="150" height="18" className="fill-paper" />
              <g className="fill-none stroke-ink">
                <path d={painted[index].processor} strokeWidth="1.8" />
                <path d={painted[index].memory} strokeWidth="1.8" />
                <path d={painted[index].endless} strokeWidth="1.8" strokeDasharray="4 5" />
              </g>
              <g textAnchor="middle" className="fill-ink font-hand">
                <text x={middle(app)} y="295" fontSize="13">
                  {labels.paintedCpu}
                </text>
                <text x={middle(app) - 16} y="345.5" fontSize="12">
                  {labels.paintedMemory}
                </text>
              </g>
            </g>
          ))}
        </g>
      </g>
      <path d={rod.bar} strokeWidth="3.2" className="fill-none stroke-ink" />
      <path d={rod.knobs} className="fill-ink" />
      <rect
        x={curtain.left}
        y={curtain.top}
        width={curtain.right - curtain.left}
        height={curtain.bottom - curtain.top + 12}
        role="button"
        tabIndex={interactive ? 0 : -1}
        aria-label={labels.curtain}
        aria-pressed={open}
        className={`outline-none transition-colors duration-150 ${interactive ? 'cursor-pointer fill-transparent hover:fill-highlight-soft focus-visible:fill-highlight-soft' : 'fill-transparent'}`}
        onClick={interactive ? onToggle : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
      />
    </>
  )
}

function ProgressBar({ app, index, running, crashed, fresh }: { app: AppId; index: number; running: boolean; crashed: boolean; fresh: boolean }) {
  const x = windowLeft[app]
  return (
    <>
      <rect
        x={x + 15}
        y={windowTop + 95}
        width={windowWidth - 30}
        height="8"
        className={`origin-left transform-fill ${crashed ? 'fill-marker opacity-80' : 'fill-ink opacity-45'}`}
        style={{
          animationName: 'bar-fill',
          animationDuration: `${barSeconds[app]}s`,
          animationTimingFunction: 'linear',
          animationDelay: `${fresh ? 0 : -barHead[app] * barSeconds[app]}s`,
          animationIterationCount: 'infinite',
          animationPlayState: running ? 'running' : 'paused',
        }}
      />
      <path d={windows[index].bar} strokeWidth="1.5" className="fill-none stroke-ink" />
    </>
  )
}

function AppContent({ app, role }: { app: AppId; role: RoleId }) {
  if (app === 'editor') return <path d={role === 'glue' ? editorDraft : editorText} strokeWidth="1.4" />
  if (app === 'chat') {
    return (
      <>
        <path d={chatIncoming} strokeWidth="1.4" />
        {role !== 'glue' && <path d={chatReply} strokeWidth="1.4" />}
      </>
    )
  }
  return (
    <>
      <path d={musicHead} className="fill-ink stroke-none" />
      <path d={musicLines} strokeWidth="1.6" />
    </>
  )
}

type AppWindowProps = {
  app: AppId
  index: number
  role: RoleId
  name: string
  crashed: boolean
  isolated: boolean
  isolateDelayMs: number
  restartKey: number
  turn: AppId | null
  interactive: boolean
  onToggle: (app: AppId) => void
}

function AppWindow({ app, index, role, name, crashed, isolated, isolateDelayMs, restartKey, turn, interactive, onToggle }: AppWindowProps) {
  const x = windowLeft[app]
  const shapes = windows[index]
  const referee = role === 'referee'
  const clickable = referee && interactive
  const running = !crashed && (turn === null || turn === app)
  const highlight =
    turn === app
      ? 'fill-highlight'
      : clickable
        ? 'fill-transparent group-hover:fill-highlight-soft group-focus-visible:fill-highlight-soft'
        : 'fill-transparent'
  const motion = crashed ? 'animate-crash' : restartKey > 0 ? 'animate-reopen' : ''

  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onToggle(app)
  }

  return (
    <g
      role={referee ? 'button' : undefined}
      tabIndex={referee ? (clickable ? 0 : -1) : undefined}
      aria-label={referee ? name : undefined}
      aria-pressed={referee ? crashed : undefined}
      className={`group outline-none ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? () => onToggle(app) : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
    >
      <g key={restartKey} className={`origin-center transform-fill motion-reduce:animate-none ${motion}`}>
        <rect x={x} y={windowTop} width={windowWidth} height={windowHeight} className="fill-paper" />
        <rect
          x={x + 5}
          y={windowTop + 32}
          width={windowWidth - 10}
          height={windowHeight - 37}
          rx="6"
          className={`transition-colors duration-150 ${highlight}`}
        />
        <g className="fill-none stroke-ink">
          <path d={shapes.main} strokeWidth="2" />
          <path d={shapes.faint} strokeWidth="1.3" opacity="0.45" />
          <path d={shapes.titleBar} strokeWidth="1.5" />
          <path d={shapes.buttons} strokeWidth="1.3" />
        </g>
        <text x={x + 12} y={windowTop + 20} fontSize="15" className="fill-ink font-hand">
          {name}
        </text>
        <g className={`fill-none stroke-ink transition-opacity duration-300 ${crashed ? 'opacity-30' : ''}`}>
          <AppContent app={app} role={role} />
        </g>
        {role !== 'glue' && <ProgressBar app={app} index={index} running={running} crashed={crashed} fresh={restartKey > 0} />}
        {referee && (
          <path
            d={shapes.scribble}
            pathLength={1}
            strokeWidth="1.6"
            strokeDasharray="1"
            className={`fill-none stroke-ink transition-[stroke-dashoffset,opacity] duration-500 ease-out motion-reduce:transition-none ${crashed ? 'opacity-60' : 'opacity-0'}`}
            style={{ strokeDashoffset: crashed ? 0 : 1 }}
          />
        )}
      </g>
      {referee && crashed && (
        <g className="animate-fade-in">
          <g
            className={isolated ? 'animate-bump motion-reduce:animate-none' : ''}
            style={{ '--bump-x': `${bugReach[app]}px`, animationDelay: `${isolateDelayMs}ms` } as CSSProperties}
          >
            <path d={shapes.bug.body} strokeWidth="1.6" className="fill-paper stroke-marker" />
            <path d={shapes.bug.legs} strokeWidth="1.5" className="fill-none stroke-marker" />
          </g>
        </g>
      )}
      {referee && isolated && (
        <path
          d={shapes.fence}
          strokeWidth="2.4"
          strokeDasharray="9 6"
          className="animate-fade-in fill-none stroke-marker"
          style={{ animationDelay: `${isolateDelayMs}ms` }}
        />
      )}
    </g>
  )
}

type TravelChipProps = {
  label: string
  width: number
  path: Point[]
  seed: number
  file?: boolean
}

function TravelChip({ label, width, path, seed, file = false }: TravelChipProps) {
  const from = path[0]
  const to = path[path.length - 1]
  const via = path.length > 2 ? path[1] : null
  const style = {
    transform: `translate(${to[0]}px, ${to[1]}px)`,
    '--from-x': `${from[0]}px`,
    '--from-y': `${from[1]}px`,
    '--via-x': via ? `${via[0]}px` : undefined,
    '--via-y': via ? `${via[1]}px` : undefined,
    '--to-x': `${to[0]}px`,
    '--to-y': `${to[1]}px`,
  } as CSSProperties

  return (
    <g style={style} className={`${via ? 'animate-travel-via' : 'animate-travel'} motion-reduce:animate-fade-in`}>
      <rect x={-width / 2} y="-13" width={width} height="26" rx="7" className="fill-paper" />
      <path d={sketchRect(-width / 2, -13, width, 26, seed, 2)} strokeWidth="1.6" className="fill-none stroke-ink" />
      {file && (
        <path d={fileIcon} transform={`translate(${-width / 2 + 10} 0)`} strokeWidth="1.3" className="fill-none stroke-ink" />
      )}
      <text
        x={file ? -width / 2 + 28 : 0}
        y={file ? 4.5 : 5.5}
        fontSize={file ? 13 : 17}
        textAnchor={file ? 'start' : 'middle'}
        className="fill-ink font-hand"
      >
        {label}
      </text>
    </g>
  )
}

function GlueLayer({ level, word, file }: { level: number; word: string; file: string }) {
  const [wordRef, wordWidth] = useTextWidth(word)
  const [fileRef, fileWidth] = useTextWidth(file)
  const editorX = windowLeft.editor
  const chatRight = windowLeft.chat + windowWidth - 12
  const wordChip = wordWidth + 22
  const fileChip = fileWidth + 41
  const spots: Record<string, Point> = {
    word: [editorX + 14 + wordWidth / 2, windowTop + 49],
    clipboard: [clipboard.x + clipboard.width / 2, clipboard.y + clipboard.height / 2 + 2],
    pasted: [chatRight - wordChip / 2, windowTop + 71],
    saved: [middle('editor'), windowTop + 100],
    saveVia: [196, 190],
    disk: [disk.x, 306],
    openVia: [420, 190],
    opened: [chatRight - fileChip / 2, windowTop + 99],
  }
  const rest = sketchSquiggle(editorX + 24 + wordWidth, editorX + 150, windowTop + 50, 502)

  return (
    <>
      <rect
        x={editorX + 10}
        y={windowTop + 39}
        width={wordWidth + 8}
        height="21"
        rx="3"
        className={`fill-highlight transition-opacity duration-200 ${level >= 1 ? '' : 'opacity-0'}`}
      />
      <text ref={wordRef} x={editorX + 14} y={windowTop + 55} fontSize="17" className="fill-ink font-hand">
        {word}
      </text>
      {rest && <path d={rest} strokeWidth="1.4" className="fill-none stroke-ink" />}
      <text ref={fileRef} fontSize="13" visibility="hidden" className="font-hand">
        {file}
      </text>
      {wordWidth > 0 && level >= 2 && <TravelChip label={word} width={wordChip} path={[spots.word, spots.clipboard]} seed={581} />}
      {wordWidth > 0 && level >= 3 && <TravelChip label={word} width={wordChip} path={[spots.clipboard, spots.pasted]} seed={582} />}
      {fileWidth > 0 && level >= 4 && (
        <TravelChip label={file} width={fileChip} path={[spots.saved, spots.saveVia, spots.disk]} seed={583} file />
      )}
      {fileWidth > 0 && level >= 5 && (
        <TravelChip label={file} width={fileChip} path={[spots.disk, spots.openVia, spots.opened]} seed={584} file />
      )}
    </>
  )
}

type RoleDiagramProps = {
  scene: RoleScene
  labels: RoleLabels
  interactive: boolean
  osFlash: OsFlash | null
  onAppToggle: (app: AppId) => void
  onCurtainToggle: () => void
}

export function RoleDiagram({ scene, labels, interactive, osFlash, onAppToggle, onCurtainToggle }: RoleDiagramProps) {
  const referee = scene.role === 'referee' ? scene : null
  const illusionist = scene.role === 'illusionist' ? scene : null
  const turn = illusionist?.turn ?? null

  return (
    <svg viewBox="0 0 640 410" className="block h-auto w-full max-w-[660px] select-none">
      <defs>
        <clipPath id="os-roles-hardware">
          <rect x="0" y={curtain.top} width="640" height="170" />
        </clipPath>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        <OsBand label={labels.os} withClipboard={scene.role === 'glue'} flash={osFlash} />
        <Hardware labels={labels} shared={illusionist !== null} memoryFocus={illusionist?.memoryFocus ?? false} />
        {illusionist && (
          <>
            <Curtain open={illusionist.curtainOpen} labels={labels} interactive={interactive} onToggle={onCurtainToggle} />
            {apps.map((app, index) => (
              <path
                key={app}
                d={windows[index].arrow}
                strokeWidth="2.4"
                className={`fill-none stroke-marker transition-opacity duration-200 ${turn === app ? '' : 'opacity-0'}`}
              />
            ))}
          </>
        )}
        {apps.map((app, index) => (
          <AppWindow
            key={app}
            app={app}
            index={index}
            role={scene.role}
            name={labels.apps[app]}
            crashed={referee?.crashed.includes(app) ?? false}
            isolated={referee?.isolated.includes(app) ?? false}
            isolateDelayMs={referee?.isolateDelayMs ?? 0}
            restartKey={referee?.restarts[app] ?? 0}
            turn={turn}
            interactive={interactive}
            onToggle={onAppToggle}
          />
        ))}
        {scene.role === 'glue' && <GlueLayer level={scene.level} word={labels.word} file={labels.file} />}
      </g>
    </svg>
  )
}
