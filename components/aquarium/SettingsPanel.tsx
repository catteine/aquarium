'use client'

import { useEffect, useRef, useState } from 'react'
import type { Fish, StoredFish } from '@/lib/aquarium/types'
import { exportFishJSON, importFishJSON } from '@/lib/aquarium/storage'

interface SettingsPanelProps {
  fishCount: number
  getFish: () => Fish[]
  onImport: (stored: StoredFish[]) => void
}

export default function SettingsPanel({ fishCount, getFish, onImport }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleExport = () => {
    exportFishJSON(getFish())
    setOpen(false)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const stored = await importFishJSON(file)
      onImport(stored)
      setOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : '불러오기 실패')
    } finally {
      e.target.value = ''
    }
  }

  const importDisabled = fishCount > 0

  return (
    <div ref={panelRef} className="absolute top-4 right-4 z-40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-lg flex items-center justify-center transition-colors"
        title="설정"
      >
        ⚙
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={handleExport}
            className="w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            JSON으로 저장
          </button>

          <div className="relative" title={importDisabled ? '아쿠아리움을 비워주세요' : ''}>
            <button
              onClick={importDisabled ? undefined : handleImportClick}
              className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                importDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              JSON 불러오기
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
