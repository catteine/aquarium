export interface Fish {
  id: string
  sprite: HTMLImageElement
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  facingRight: boolean
}

export interface DrawingTool {
  color: string
  brushSize: number
  mode: 'draw' | 'erase'
}

export interface AquariumDims {
  width: number
  height: number
}

export interface StoredFish {
  id: string
  dataURL: string
  facingRight: boolean
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
}
