'use client'

import type { DrawingTool } from '@/lib/aquarium/types'

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ffffff',
  '#1a1a1a',
]

interface FishToolbarProps {
  tool: DrawingTool
  onToolChange: (tool: DrawingTool) => void
  onClear: () => void
}

export default function FishToolbar({ tool, onToolChange, onClear }: FishToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg flex-wrap">
      <div className="flex gap-1.5 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onToolChange({ ...tool, color, mode: 'draw' })}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: tool.color === color && tool.mode === 'draw' ? '#6366f1' : '#d1d5db',
              transform: tool.color === color && tool.mode === 'draw' ? 'scale(1.2)' : undefined,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">크기</span>
        <input
          type="range"
          min={2}
          max={30}
          value={tool.brushSize}
          onChange={(e) => onToolChange({ ...tool, brushSize: Number(e.target.value) })}
          className="w-24"
        />
        <span className="text-xs text-gray-500 w-5">{tool.brushSize}</span>
      </div>

      <button
        onClick={() => onToolChange({ ...tool, mode: tool.mode === 'erase' ? 'draw' : 'erase' })}
        className={`px-3 py-1 text-sm rounded border transition-colors ${
          tool.mode === 'erase'
            ? 'bg-indigo-500 text-white border-indigo-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        지우개
      </button>

      <button
        onClick={onClear}
        className="px-3 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
