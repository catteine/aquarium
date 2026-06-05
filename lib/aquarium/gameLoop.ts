import type { Fish, AquariumDims } from './types'
import { updateFish } from './fishPhysics'
import { drawFrame } from './renderAquarium'

export function startGameLoop(
  canvas: HTMLCanvasElement,
  getFish: () => Fish[],
  getDims: () => AquariumDims,
): () => void {
  let rafId: number

  const tick = () => {
    const fish = getFish()
    const dims = getDims()
    for (const f of fish) updateFish(f, dims)
    drawFrame(canvas, fish)
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}
