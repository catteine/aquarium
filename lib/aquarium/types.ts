export interface Fish {
  id: string
  sprite: HTMLImageElement
  x: number
  y: number
  vx: number        // 렌더링 flip 판단용 (angle+speed에서 파생)
  vy: number
  angle: number     // 진행 방향 (radians)
  speed: number     // 현재 속도 (px/frame)
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
  angle: number
  speed: number
  width: number
  height: number
}
