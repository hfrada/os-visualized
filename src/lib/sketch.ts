type Point = [number, number]
type Segment = [number, number, number, number]

function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (value: number) => value.toFixed(1)

function smoothPath(points: Point[]) {
  let path = `M${round(points[0][0])},${round(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    path += ` C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(p2[0])},${round(p2[1])}`
  }
  return path
}

export function sketchBlob(seed: number) {
  const random = createRandom(seed)
  const count = 14
  const start = random() * Math.PI * 2
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const angle = start + (i / count) * Math.PI * 2
    const r = 0.47 * (1 + (random() - 0.5) * 0.07)
    points.push([0.5 + r * Math.cos(angle), 0.5 + r * Math.sin(angle)])
  }

  const at = (i: number) => points[(i + count) % count]
  const format = (value: number) => value.toFixed(4)
  let path = `M${format(points[0][0])},${format(points[0][1])}`
  for (let i = 0; i < count; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    path += ` C${format(c1x)},${format(c1y)} ${format(c2x)},${format(c2y)} ${format(p2[0])},${format(p2[1])}`
  }
  return `${path}Z`
}

export function sketchEllipse(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const random = createRandom(seed)
  const segments = 16
  const start = random() * Math.PI * 2
  const sweep = Math.PI * 2 + 0.12 + random() * 0.15
  const points: Point[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = start + (i / segments) * sweep
    const wobble = 1 + (random() - 0.5) * 0.035
    points.push([cx + rx * wobble * Math.cos(angle), cy + ry * wobble * 0.985 * Math.sin(angle)])
  }
  return smoothPath(points)
}

export function sketchCircle(cx: number, cy: number, r: number, seed: number) {
  return sketchEllipse(cx, cy, r, r, seed)
}

export function sketchArc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, seed: number) {
  const random = createRandom(seed)
  const points: Point[] = []
  for (let i = 0; i <= 10; i++) {
    const angle = from + (i / 10) * (to - from)
    const wobble = 1 + (random() - 0.5) * 0.04
    points.push([cx + rx * wobble * Math.cos(angle), cy + ry * wobble * Math.sin(angle)])
  }
  return smoothPath(points)
}

function roughLine(x1: number, y1: number, x2: number, y2: number, random: () => number, overshoot = 6) {
  const length = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / length
  const uy = (y2 - y1) / length
  const sx = x1 - ux * overshoot * random()
  const sy = y1 - uy * overshoot * random()
  const ex = x2 + ux * overshoot * random()
  const ey = y2 + uy * overshoot * random()
  const bow = (random() - 0.5) * length * 0.02
  const mx = (sx + ex) / 2 - uy * bow
  const my = (sy + ey) / 2 + ux * bow
  const spread = Math.min(3, overshoot * 0.6)
  const jitter = () => (random() - 0.5) * spread
  const startX = sx + jitter()
  const startY = sy + jitter()
  const endX = ex + jitter()
  const endY = ey + jitter()
  return `M${round(startX)},${round(startY)} Q${round(mx)},${round(my)} ${round(endX)},${round(endY)}`
}

export function sketchLine(x1: number, y1: number, x2: number, y2: number, seed: number, overshoot = 6) {
  return roughLine(x1, y1, x2, y2, createRandom(seed), overshoot)
}

export function sketchSegments(segments: Segment[], seed: number) {
  const random = createRandom(seed)
  const jitter = () => (random() - 0.5) * 1.2
  return segments
    .map(([x1, y1, x2, y2]) => `M${round(x1 + jitter())},${round(y1 + jitter())} L${round(x2 + jitter())},${round(y2 + jitter())}`)
    .join(' ')
}

export function sketchArrow(x1: number, y1: number, x2: number, y2: number, seed: number) {
  const random = createRandom(seed)
  const length = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / length
  const uy = (y2 - y1) / length
  const bow = (random() - 0.5) * length * 0.08
  const mx = (x1 + x2) / 2 - uy * bow
  const my = (y1 + y2) / 2 + ux * bow
  const tail = Math.hypot(x2 - mx, y2 - my)
  const ex = (x2 - mx) / tail
  const ey = (y2 - my) / tail
  const head = (angle: number) => {
    const hx = x2 - (ex * Math.cos(angle) - ey * Math.sin(angle)) * 11
    const hy = y2 - (ex * Math.sin(angle) + ey * Math.cos(angle)) * 11
    return `M${round(hx)},${round(hy)} L${round(x2)},${round(y2)}`
  }
  return `M${round(x1)},${round(y1)} Q${round(mx)},${round(my)} ${round(x2)},${round(y2)} ${head(0.45)} ${head(-0.45)}`
}

export function sketchRect(x: number, y: number, width: number, height: number, seed: number, overshoot = 6) {
  const random = createRandom(seed)
  return [
    roughLine(x, y, x + width, y, random, overshoot),
    roughLine(x + width, y, x + width, y + height, random, overshoot),
    roughLine(x + width, y + height, x, y + height, random, overshoot),
    roughLine(x, y + height, x, y, random, overshoot),
  ].join(' ')
}

export function sketchSquiggle(x1: number, x2: number, y: number, seed: number, amplitude = 2.2, step = 6) {
  const random = createRandom(seed)
  const points: Point[] = []
  for (let x = x1, i = 0; x <= x2; x += step, i++) {
    points.push([x, y + (i % 2 ? -1 : 1) * amplitude * (0.6 + random() * 0.6)])
  }
  return points.length < 2 ? '' : smoothPath(points)
}

export function sketchScribble(x: number, y: number, width: number, height: number, seed: number) {
  const random = createRandom(seed)
  const turns = 8
  const points: Point[] = []
  for (let i = 0; i <= turns; i++) {
    const px = x + (width * i) / turns + (random() - 0.5) * 6
    const py = i % 2 ? y + height * (0.05 + random() * 0.15) : y + height * (0.8 + random() * 0.15)
    points.push([px, py])
  }
  return smoothPath(points)
}

export function sketchProcessor(cx: number, cy: number, size: number, seed: number) {
  const half = size / 2
  const pin = Math.max(5, size * 0.12)
  const pins: Segment[] = []
  for (let i = 1; i <= 3; i++) {
    const offset = -half + (size * i) / 4
    pins.push(
      [cx + offset, cy - half, cx + offset, cy - half - pin],
      [cx + offset, cy + half, cx + offset, cy + half + pin],
      [cx - half, cy + offset, cx - half - pin, cy + offset],
      [cx + half, cy + offset, cx + half + pin, cy + offset],
    )
  }
  return `${sketchRect(cx - half, cy - half, size, size, seed, 3)} ${sketchSegments(pins, seed + 9)}`
}

export function sketchCylinder(cx: number, top: number, rx: number, ry: number, height: number, seed: number) {
  const sides: Segment[] = [
    [cx - rx, top, cx - rx, top + height],
    [cx + rx, top, cx + rx, top + height],
  ]
  return [
    sketchEllipse(cx, top, rx, ry, seed),
    sketchSegments(sides, seed + 1),
    sketchArc(cx, top + height, rx, ry, 0, Math.PI, seed + 2),
  ].join(' ')
}

export function sketchBug(x: number, y: number, seed: number) {
  const body = `${sketchEllipse(x, y + 2, 6.5, 8.5, seed)} ${sketchCircle(x, y - 9, 3.6, seed + 1)}`
  const legs = [-4, 2, 8]
    .map((dy, index) => {
      const tip = y + dy - 3 + (index - 1) * 3
      return `M${round(x - 6)},${round(y + dy)} L${round(x - 12)},${round(tip)} M${round(x + 6)},${round(y + dy)} L${round(x + 12)},${round(tip)}`
    })
    .join(' ')
  const antennae = `M${round(x - 1.5)},${round(y - 12)} Q${round(x - 4)},${round(y - 17)} ${round(x - 7.5)},${round(y - 17)} M${round(x + 1.5)},${round(y - 12)} Q${round(x + 4)},${round(y - 17)} ${round(x + 7.5)},${round(y - 17)}`
  const split = `M${round(x)},${round(y - 5)} L${round(x)},${round(y + 10)}`
  return { body, legs: `${legs} ${antennae} ${split}` }
}

export function sketchCurtain(left: number, right: number, top: number, bottom: number, seed: number) {
  const random = createRandom(seed)
  const pleats = 16
  const width = (right - left) / pleats
  let body = `M${round(left)},${round(top)} L${round(right)},${round(top)} L${round(right)},${round(bottom)}`
  for (let i = pleats; i > 0; i--) {
    const from = left + i * width
    const to = left + (i - 1) * width
    body += ` Q${round((from + to) / 2)},${round(bottom + 10 + random() * 3)} ${round(to)},${round(bottom + (random() - 0.5) * 2)}`
  }
  const folds: string[] = []
  for (let i = 1; i < pleats; i++) {
    const x = left + i * width
    const points: Point[] = []
    for (let y = top + 2; y < bottom; y += 18) points.push([x + (random() - 0.5) * 3, y])
    points.push([x + (random() - 0.5) * 3, bottom])
    folds.push(smoothPath(points))
  }
  return { body: `${body} Z`, folds: folds.join(' ') }
}

export function stickFigure(x: number, y: number, seed: number) {
  const random = createRandom(seed)
  const jitter = () => (random() - 0.5) * 1.5
  const head = sketchCircle(x, y - 24, 7, seed)
  const body = `M${round(x + jitter())},${round(y - 16)} L${round(x + jitter())},${round(y + 2)}`
  const arms = `M${round(x - 9 + jitter())},${round(y - 9 + jitter())} L${round(x + 9 + jitter())},${round(y - 10 + jitter())}`
  const legs = `M${round(x - 7 + jitter())},${round(y + 14)} L${round(x + jitter())},${round(y + 2)} L${round(x + 7 + jitter())},${round(y + 14)}`
  return `${head} ${body} ${arms} ${legs}`
}
