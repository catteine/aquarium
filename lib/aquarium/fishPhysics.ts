import type { Fish, AquariumDims } from './types'
import { BORDER_PAD, SAND_HEIGHT } from './renderAquarium'

export function updateFish(fish: Fish, dims: AquariumDims): void {
  fish.x += fish.vx
  fish.y += fish.vy

  const left = BORDER_PAD
  const right = dims.width - BORDER_PAD - fish.width
  const top = BORDER_PAD
  const bottom = dims.height - SAND_HEIGHT - fish.height

  if (fish.x <= left) { fish.vx = Math.abs(fish.vx); fish.x = left }
  if (fish.x >= right) { fish.vx = -Math.abs(fish.vx); fish.x = right }
  if (fish.y <= top) { fish.vy = Math.abs(fish.vy); fish.y = top }
  if (fish.y >= bottom) { fish.vy = -Math.abs(fish.vy); fish.y = bottom }
}

export function randomVelocity(): number {
  const speeds = [-2, -1.5, -1, 1, 1.5, 2]
  return speeds[Math.floor(Math.random() * speeds.length)]
}
