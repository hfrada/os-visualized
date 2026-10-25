type Point = [number, number]

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

export function sketchCircle(cx: number, cy: number, r: number, seed: number) {
  const random = createRandom(seed)
  const segments = 16
  const start = random() * Math.PI * 2
  const sweep = Math.PI * 2 + 0.12 + random() * 0.15
  const points: Point[] = []
  for (let i = 0; i <= segments; i++) {
    const angle = start + (i / segments) * sweep
    const wobble = r * (1 + (random() - 0.5) * 0.035)
    points.push([cx + wobble * Math.cos(angle), cy + wobble * 0.985 * Math.sin(angle)])
  }
  return smoothPath(points)
}

function sketchLine(x1: number, y1: number, x2: number, y2: number, random: () => number) {
  const length = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / length
  const uy = (y2 - y1) / length
  const sx = x1 - ux * 6 * random()
  const sy = y1 - uy * 6 * random()
  const ex = x2 + ux * 6 * random()
  const ey = y2 + uy * 6 * random()
  const bow = (random() - 0.5) * length * 0.02
  const mx = (sx + ex) / 2 - uy * bow
  const my = (sy + ey) / 2 + ux * bow
  const jitter = () => (random() - 0.5) * 3
  const startX = sx + jitter()
  const startY = sy + jitter()
  const endX = ex + jitter()
  const endY = ey + jitter()
  return `M${round(startX)},${round(startY)} Q${round(mx)},${round(my)} ${round(endX)},${round(endY)}`
}

export function sketchRect(x: number, y: number, width: number, height: number, seed: number) {
  const random = createRandom(seed)
  return [
    sketchLine(x, y, x + width, y, random),
    sketchLine(x + width, y, x + width, y + height, random),
    sketchLine(x + width, y + height, x, y + height, random),
    sketchLine(x, y + height, x, y, random),
  ].join(' ')
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
