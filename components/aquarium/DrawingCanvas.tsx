'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { DrawingTool } from '@/lib/aquarium/types'

export interface DrawingCanvasHandle {
  getDataURL: () => string
  clear: () => void
}

interface DrawingCanvasProps {
  tool: DrawingTool
  facingRight: boolean
}

const CANVAS_W = 400
const CANVAS_H = 300

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ tool, facingRight }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    clear: () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    isDrawing.current = true
    const { x, y } = getPos(e)

    ctx.globalCompositeOperation = tool.mode === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = tool.color
    ctx.lineWidth = tool.brushSize

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 0.1, y + 0.1)
    ctx.stroke()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => {
    isDrawing.current = false
  }

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full rounded border border-gray-300 cursor-crosshair touch-none"
        style={{ background: 'transparent' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      {/* 방향 가이드 오버레이 */}
      <div
        className="pointer-events-none absolute bottom-2 text-white/50 text-xs flex items-center gap-1 select-none"
        style={{ [facingRight ? 'right' : 'left']: '8px' }}
      >
        {facingRight ? (
          <>머리 방향 <span className="text-base">→</span></>
        ) : (
          <><span className="text-base">←</span> 머리 방향</>
        )}
      </div>
    </div>
  )
})

DrawingCanvas.displayName = 'DrawingCanvas'

export default DrawingCanvas
