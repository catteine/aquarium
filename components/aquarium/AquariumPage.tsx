'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Fish, AquariumDims, StoredFish } from '@/lib/aquarium/types'
import { randomAngle, BASE_SPEED } from '@/lib/aquarium/fishPhysics'
import { BORDER_PAD, SAND_HEIGHT } from '@/lib/aquarium/renderAquarium'
import { startGameLoop } from '@/lib/aquarium/gameLoop'
import {
  loadFishFromStorage,
  saveFishToStorage,
  storedFishToFish,
} from '@/lib/aquarium/storage'
import AquariumCanvas from './AquariumCanvas'
import DrawingModal from './DrawingModal'
import SettingsPanel from './SettingsPanel'

export default function AquariumPage() {
  const fishRef = useRef<Fish[]>([])
  const dimsRef = useRef<AquariumDims>({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)
  const [fishCount, setFishCount] = useState(0)

  const handleResize = useCallback((width: number, height: number) => {
    dimsRef.current = { width, height }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cancel = startGameLoop(
      canvas,
      () => fishRef.current,
      () => dimsRef.current,
    )

    const stored = loadFishFromStorage()
    Promise.all(stored.map((s) => storedFishToFish(s, dimsRef.current))).then((fish) => {
      fishRef.current.push(...fish)
      setFishCount(fish.length)
    })

    return cancel
  }, [])

  const handleAddFish = useCallback((dataURL: string, facingRight: boolean) => {
    const img = new Image()
    img.onload = () => {
      const dims = dimsRef.current
      const angle = randomAngle()
      const speed = BASE_SPEED + (Math.random() - 0.5) * 0.6
      fishRef.current.push({
        id: `fish-${Date.now()}`,
        sprite: img,
        x: BORDER_PAD + Math.random() * Math.max(dims.width - BORDER_PAD * 2 - 80, 0),
        y: BORDER_PAD + Math.random() * Math.max(dims.height - BORDER_PAD - SAND_HEIGHT - 60, 0),
        angle,
        speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.45,
        width: 80,
        height: 60,
        facingRight,
      })
      saveFishToStorage(fishRef.current)
      setFishCount((n) => n + 1)
    }
    img.src = dataURL
  }, [])

  const handleClearAll = useCallback(() => {
    fishRef.current = []
    saveFishToStorage([])
    setFishCount(0)
    setConfirmStep(0)
  }, [])

  const handleImportFish = useCallback((stored: StoredFish[]) => {
    Promise.all(stored.map((s) => storedFishToFish(s, dimsRef.current))).then((fish) => {
      fishRef.current.push(...fish)
      saveFishToStorage(fishRef.current)
      setFishCount((n) => n + fish.length)
    })
  }, [])

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* 상단 */}
      <div className="shrink-0 flex justify-end p-3">
        <SettingsPanel
          fishCount={fishCount}
          getFish={() => fishRef.current}
          onImport={handleImportFish}
        />
      </div>

      {/* 어항 */}
      <div className="flex-1 flex items-center justify-center px-10 pb-4 min-h-0">
        <div className="w-full max-w-[900px]" style={{ aspectRatio: '16/9' }}>
          <AquariumCanvas ref={canvasRef} onResize={handleResize} />
        </div>
      </div>

      {/* 하단 툴바 */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-t border-zinc-200">
        <span className="text-zinc-400 text-sm">물고기 {fishCount}마리</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmStep(1)}
            disabled={fishCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 text-zinc-500 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            전체 삭제
          </button>
          <button
            onClick={() => setModalOpen(true)}
            title="물고기 추가"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg transition-colors"
          >
            {/* 물고기 실루엣 */}
            <svg width="26" height="18" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26 11 L32 4 L32 18 Z" fill="white" opacity="0.9"/>
              <ellipse cx="14" cy="11" rx="13" ry="8" fill="white"/>
              <circle cx="5" cy="9" r="2" fill="#6366f1"/>
              <circle cx="5" cy="9" r="1" fill="white"/>
            </svg>
            {/* + */}
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <DrawingModal onAdd={handleAddFish} onClose={() => setModalOpen(false)} />
      )}

      {confirmStep === 1 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setConfirmStep(0)}
        >
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 w-full max-w-sm mx-4 flex flex-col gap-5">
            <p className="text-base font-semibold text-zinc-800">물고기가 삭제됩니다.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmStep(0)}
                className="px-5 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setConfirmStep(2)}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmStep === 2 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setConfirmStep(0)}
        >
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 w-full max-w-sm mx-4 flex flex-col gap-5">
            <p className="text-base font-semibold text-zinc-800">정말 삭제하시겠습니까?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmStep(0)}
                className="px-5 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleClearAll}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
