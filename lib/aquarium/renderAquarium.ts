import type { Fish } from './types'

export const BORDER_PAD = 14
export const SAND_HEIGHT = 45

// ── 오프스크린 decor 캐시 ──────────────────────────────
let decorCache: HTMLCanvasElement | null = null
let cacheW = 0
let cacheH = 0

// ── 스케치 유틸 ──────────────────────────────────────
type Ctx2D = CanvasRenderingContext2D

/** 두 점 사이를 흔들리는 선으로 그림 (생성 시점에만 random 사용) */
function roughLine(ctx: Ctx2D, x1: number, y1: number, x2: number, y2: number, jitter = 3) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy)
  const steps = Math.max(2, Math.ceil(dist / 55))

  ctx.beginPath()
  ctx.moveTo(x1 + (Math.random() - 0.5) * 2, y1 + (Math.random() - 0.5) * 2)
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    ctx.lineTo(
      x1 + dx * t + (Math.random() - 0.5) * jitter * 2,
      y1 + dy * t + (Math.random() - 0.5) * jitter * 2,
    )
  }
  ctx.lineTo(x2 + (Math.random() - 0.5) * 2, y2 + (Math.random() - 0.5) * 2)
  ctx.stroke()
}

/** 4변을 각각 2회 roughLine으로 그려 겹친 스케치 테두리 */
function drawSketchyBorder(ctx: Ctx2D, w: number, h: number) {
  const p = BORDER_PAD
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const sides: [number, number, number, number][] = [
    [p, p, w - p, p],           // 상
    [w - p, p, w - p, h - p],   // 우
    [w - p, h - p, p, h - p],   // 하
    [p, h - p, p, p],           // 좌
  ]

  for (let pass = 0; pass < 2; pass++) {
    for (const [x1, y1, x2, y2] of sides) {
      roughLine(ctx, x1, y1, x2, y2, pass === 0 ? 2.5 : 1.5)
    }
  }
}

/** 울퉁불퉁한 모래 바닥 */
function drawSketchySand(ctx: Ctx2D, w: number, h: number) {
  const sandY = h - SAND_HEIGHT
  const p = BORDER_PAD

  // bumpy 실루엣 path
  ctx.beginPath()
  ctx.moveTo(p, h - p)
  ctx.lineTo(p, sandY)

  let x = p
  while (x < w - p) {
    const bumpW = 12 + Math.random() * 18
    const bumpH = 4 + Math.random() * 12
    const cx = x + bumpW / 2
    const nx = Math.min(x + bumpW, w - p)
    ctx.quadraticCurveTo(cx, sandY - bumpH, nx, sandY + (Math.random() - 0.5) * 4)
    x = nx
  }

  ctx.lineTo(w - p, h - p)
  ctx.closePath()

  // 모래 fill
  ctx.fillStyle = 'rgba(195, 168, 118, 0.38)'
  ctx.fill()

  // 실루엣 아웃라인
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'

  // 윗 라인만 다시 stroke (bumpy 부분)
  ctx.beginPath()
  ctx.moveTo(p, sandY)
  x = p
  while (x < w - p) {
    const bumpW = 12 + Math.random() * 18
    const bumpH = 4 + Math.random() * 10
    const cx = x + bumpW / 2
    const nx = Math.min(x + bumpW, w - p)
    ctx.quadraticCurveTo(cx, sandY - bumpH, nx, sandY)
    x = nx
  }
  ctx.stroke()
}

/** 오프스크린 decor canvas 빌드 */
function buildDecor(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')
  if (!ctx) return c
  drawSketchyBorder(ctx, width, height)
  drawSketchySand(ctx, width, height)
  return c
}

function getDecorCanvas(width: number, height: number): HTMLCanvasElement {
  if (decorCache && cacheW === width && cacheH === height) return decorCache
  decorCache = buildDecor(width, height)
  cacheW = width
  cacheH = height
  return decorCache
}

// ── 메인 렌더 ────────────────────────────────────────
export function drawFrame(canvas: HTMLCanvasElement, fish: Fish[]): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 스케치 배경 stamp
  ctx.drawImage(getDecorCanvas(canvas.width, canvas.height), 0, 0)

  // 물고기
  for (const f of fish) {
    ctx.save()
    const shouldFlip = (f.vx > 0) !== f.facingRight
    if (shouldFlip) {
      ctx.translate(f.x + f.width, f.y)
      ctx.scale(-1, 1)
      ctx.drawImage(f.sprite, 0, 0, f.width, f.height)
    } else {
      ctx.drawImage(f.sprite, f.x, f.y, f.width, f.height)
    }
    ctx.restore()
  }
}
