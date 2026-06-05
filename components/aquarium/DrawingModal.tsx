'use client'

import { useRef, useState } from 'react'
import type { DrawingTool } from '@/lib/aquarium/types'
import DrawingCanvas, { type DrawingCanvasHandle } from './DrawingCanvas'
import FishToolbar from './FishToolbar'

interface DrawingModalProps {
  onAdd: (dataURL: string, facingRight: boolean) => void
  onClose: () => void
}

const DEFAULT_TOOL: DrawingTool = {
  color: '#3b82f6',
  brushSize: 8,
  mode: 'draw',
}

export default function DrawingModal({ onAdd, onClose }: DrawingModalProps) {
  const [tool, setTool] = useState<DrawingTool>(DEFAULT_TOOL)
  const [facingRight, setFacingRight] = useState(true)
  const canvasRef = useRef<DrawingCanvasHandle>(null)

  const handleAdd = () => {
    const dataURL = canvasRef.current?.getDataURL()
    if (dataURL) {
      onAdd(dataURL, facingRight)
      onClose()
    }
  }

  const handleClear = () => {
    canvasRef.current?.clear()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">물고기 그리기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#0d3b6e]">
          <DrawingCanvas ref={canvasRef} tool={tool} facingRight={facingRight} />
        </div>

        <FishToolbar tool={tool} onToolChange={setTool} onClear={handleClear} />

        {/* 방향 선택 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">그림의 머리 방향</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setFacingRight(false)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                !facingRight ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ← 왼쪽
            </button>
            <button
              onClick={() => setFacingRight(true)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                facingRight ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              오른쪽 →
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            수족관에 추가
          </button>
        </div>
      </div>
    </div>
  )
}
