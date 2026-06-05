import type { Fish, StoredFish } from './types'

const STORAGE_KEY = 'aquarium-fish'

export function serializeFish(fish: Fish[]): StoredFish[] {
  return fish.map((f) => ({
    id: f.id,
    dataURL: f.sprite.src,
    facingRight: f.facingRight,
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    width: f.width,
    height: f.height,
  }))
}

export function saveFishToStorage(fish: Fish[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeFish(fish)))
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

export function loadFishFromStorage(): StoredFish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function storedFishToFish(stored: StoredFish): Promise<Fish> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () =>
      resolve({
        id: stored.id,
        sprite: img,
        facingRight: stored.facingRight,
        x: stored.x,
        y: stored.y,
        vx: stored.vx,
        vy: stored.vy,
        width: stored.width,
        height: stored.height,
      })
    img.src = stored.dataURL
  })
}

export function exportFishJSON(fish: Fish[]): void {
  const data = JSON.stringify(serializeFish(fish), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aquarium-fish-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFishJSON(file: File): Promise<StoredFish[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('Invalid format')
        resolve(parsed as StoredFish[])
      } catch {
        reject(new Error('JSON 파일을 읽을 수 없습니다'))
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsText(file)
  })
}
