import type { Fish, AquariumDims } from './types'
import { BORDER_PAD, SAND_HEIGHT } from './renderAquarium'

// ── 상수 ──────────────────────────────────────────────
export const BASE_SPEED = 2.0          // 기본 속도 (px/frame)
const DIR_CHANGE_INTERVAL = 300        // 방향 전환 주기 (frames, ~5초 @ 60fps)
const DIR_CHANGE_CHANCE = 0.5          // 전환 발생 확률
const WANDER_STRENGTH = 0.28           // 프레임당 최대 방향 변화 (radians)
const WALL_AVOID_DIST = 90             // 벽 회피 시작 거리 (px)
const WALL_FORCE = 0.55                // 벽 반발력 크기
const Y_DAMPING = 0.5                  // 수직 속도 감쇠 비율
const SPEED_LERP = 0.04               // 속도 보간 계수
const SPEED_MIN = 0.6
const SPEED_MAX = 4.0

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function updateFish(fish: Fish, dims: AquariumDims): void {
  const left   = BORDER_PAD
  const right  = dims.width  - BORDER_PAD - fish.width
  const top    = BORDER_PAD
  const bottom = dims.height - SAND_HEIGHT - fish.height

  // 1. 주기적 방향 전환 (O/X 체크)
  fish.dirTimer--
  if (fish.dirTimer <= 0) {
    fish.dirTimer = DIR_CHANGE_INTERVAL + Math.floor(Math.random() * 120 - 60)
    if (Math.random() < DIR_CHANGE_CHANCE) {
      // 좌우 반전 + 상하 랜덤 추가
      fish.angle = Math.PI - fish.angle + (Math.random() - 0.5) * 1.0
    }
  }

  // 2. Wander
  const wanderAngle = fish.angle + (Math.random() - 0.5) * WANDER_STRENGTH * 2

  // 3. Wall avoidance
  let fx = 0
  let fy = 0
  if (fish.x - left   < WALL_AVOID_DIST) fx += (1 - (fish.x - left)   / WALL_AVOID_DIST) * WALL_FORCE
  if (right - fish.x  < WALL_AVOID_DIST) fx -= (1 - (right - fish.x)  / WALL_AVOID_DIST) * WALL_FORCE
  if (fish.y - top    < WALL_AVOID_DIST) fy += (1 - (fish.y - top)    / WALL_AVOID_DIST) * WALL_FORCE
  if (bottom - fish.y < WALL_AVOID_DIST) fy -= (1 - (bottom - fish.y) / WALL_AVOID_DIST) * WALL_FORCE

  // 4. Wander + wall force → new angle
  const wx = Math.cos(wanderAngle) * fish.speed + fx
  const wy = Math.sin(wanderAngle) * fish.speed * Y_DAMPING + fy
  fish.angle = Math.atan2(wy, wx)

  // 4. Speed variation — 목표 속도를 향해 서서히 수렴 (가감속)
  const targetSpeed = BASE_SPEED + (Math.random() - 0.5) * 2.4
  fish.speed += (targetSpeed - fish.speed) * SPEED_LERP
  fish.speed = clamp(fish.speed, SPEED_MIN, SPEED_MAX)

  // 5. 속도 벡터 적용 (Y축 감쇠)
  fish.vx = Math.cos(fish.angle) * fish.speed
  fish.vy = Math.sin(fish.angle) * fish.speed * Y_DAMPING

  fish.x += fish.vx
  fish.y += fish.vy

  // 6. 최후 경계 클램프 + 벽 고착 방지 (steering이 실패할 때 강제 반전)
  if (fish.x < left)   { fish.x = left;   fish.vx =  Math.abs(fish.vx) || fish.speed; }
  if (fish.x > right)  { fish.x = right;  fish.vx = -Math.abs(fish.vx) || -fish.speed; }
  if (fish.y < top)    { fish.y = top;     fish.vy =  Math.abs(fish.vy) || fish.speed * Y_DAMPING; }
  if (fish.y > bottom) { fish.y = bottom;  fish.vy = -Math.abs(fish.vy) || -fish.speed * Y_DAMPING; }
  fish.angle = Math.atan2(fish.vy, fish.vx)
}

export function randomAngle(): number {
  return Math.random() * Math.PI * 2
}
