import type { Fish, AquariumDims } from './types'
import { BORDER_PAD, SAND_HEIGHT } from './renderAquarium'

// ── 상수 ──────────────────────────────────────────────
export const BASE_SPEED = 2.0          // 기본 속도 (px/frame)
const WANDER_STRENGTH = 0.12           // 프레임당 최대 방향 변화 (radians)
const WALL_AVOID_DIST = 90             // 벽 회피 시작 거리 (px)
const WALL_FORCE = 0.55                // 벽 반발력 크기
const Y_DAMPING = 0.45                 // 수직 속도 감쇠 비율 (좌우 위주 이동)
const SPEED_LERP = 0.06               // 속도 보간 계수 (부드러운 가감속)
const SPEED_MIN = 1.0
const SPEED_MAX = 3.2

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function updateFish(fish: Fish, dims: AquariumDims): void {
  const left   = BORDER_PAD
  const right  = dims.width  - BORDER_PAD - fish.width
  const top    = BORDER_PAD
  const bottom = dims.height - SAND_HEIGHT - fish.height

  // 1. Wander — 매 프레임 방향을 조금씩 랜덤하게 틈
  const wanderAngle = fish.angle + (Math.random() - 0.5) * WANDER_STRENGTH * 2

  // 2. Wall avoidance — 벽 근처에서 밀어내는 힘 벡터
  let fx = 0
  let fy = 0
  if (fish.x - left   < WALL_AVOID_DIST) fx += (1 - (fish.x - left)   / WALL_AVOID_DIST) * WALL_FORCE
  if (right - fish.x  < WALL_AVOID_DIST) fx -= (1 - (right - fish.x)  / WALL_AVOID_DIST) * WALL_FORCE
  if (fish.y - top    < WALL_AVOID_DIST) fy += (1 - (fish.y - top)    / WALL_AVOID_DIST) * WALL_FORCE
  if (bottom - fish.y < WALL_AVOID_DIST) fy -= (1 - (bottom - fish.y) / WALL_AVOID_DIST) * WALL_FORCE

  // 3. Wander 방향 벡터 + 벽 반발력 합산 → 새 angle 계산
  const wx = Math.cos(wanderAngle) * fish.speed + fx
  const wy = Math.sin(wanderAngle) * fish.speed * Y_DAMPING + fy
  fish.angle = Math.atan2(wy, wx)

  // 4. Speed variation — 목표 속도를 향해 서서히 수렴 (가감속)
  const targetSpeed = BASE_SPEED + (Math.random() - 0.5) * 0.6
  fish.speed += (targetSpeed - fish.speed) * SPEED_LERP
  fish.speed = clamp(fish.speed, SPEED_MIN, SPEED_MAX)

  // 5. 속도 벡터 적용 (Y축 감쇠)
  fish.vx = Math.cos(fish.angle) * fish.speed
  fish.vy = Math.sin(fish.angle) * fish.speed * Y_DAMPING

  fish.x += fish.vx
  fish.y += fish.vy

  // 6. 최후 경계 클램프 (벽 뚫기 방지)
  fish.x = clamp(fish.x, left, right)
  fish.y = clamp(fish.y, top, bottom)
}

export function randomAngle(): number {
  return Math.random() * Math.PI * 2
}
