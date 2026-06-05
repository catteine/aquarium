'use client'

import { forwardRef, useEffect, useRef } from 'react'

interface AquariumCanvasProps {
  onResize: (width: number, height: number) => void
}

const AquariumCanvas = forwardRef<HTMLCanvasElement, AquariumCanvasProps>(
  ({ onResize }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const container = containerRef.current
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current
      if (!container || !canvas) return

      const ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
        onResize(width, height)
      })

      ro.observe(container)
      return () => ro.disconnect()
    }, [ref, onResize])

    return (
      <div ref={containerRef} className="w-full h-full">
        <canvas ref={ref} className="w-full h-full" />
      </div>
    )
  },
)

AquariumCanvas.displayName = 'AquariumCanvas'

export default AquariumCanvas
