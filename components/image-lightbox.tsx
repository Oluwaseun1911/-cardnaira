"use client"

import { useEffect, useRef, useState } from "react"
import { Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react"

export function ImageLightbox({ src, alt, onClose }: { src: string | null; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(5, s + 0.5))
      if (e.key === "-") setScale((s) => Math.max(1, s - 0.5))
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [src, onClose])

  if (!src) return null

  const zoom = (delta: number) => {
    setScale((s) => {
      const next = Math.min(5, Math.max(1, s + delta))
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={alt}>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="truncate text-sm font-medium text-white/80">{Math.round(scale * 100)}%</p>
        <div className="flex items-center gap-1">
          <button onClick={() => zoom(-0.5)} className="rounded-full p-2.5 text-white hover:bg-white/10" aria-label="Zoom out">
            <ZoomOut className="size-5" />
          </button>
          <button onClick={() => zoom(0.5)} className="rounded-full p-2.5 text-white hover:bg-white/10" aria-label="Zoom in">
            <ZoomIn className="size-5" />
          </button>
          <button onClick={reset} className="rounded-full p-2.5 text-white hover:bg-white/10" aria-label="Reset zoom">
            <RotateCcw className="size-5" />
          </button>
          <a href={src} download="card-image.jpg" className="rounded-full p-2.5 text-white hover:bg-white/10" aria-label="Download image">
            <Download className="size-5" />
          </a>
          <button onClick={onClose} className="rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label="Close preview">
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div
        className="relative flex flex-1 touch-none items-center justify-center overflow-hidden"
        onWheel={(e) => zoom(e.deltaY < 0 ? 0.25 : -0.25)}
        onDoubleClick={() => (scale > 1 ? reset() : setScale(2.5))}
        onPointerDown={(e) => {
          if (scale === 1) return
          drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
        }}
        onPointerUp={() => (drag.current = null)}
        style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-100"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        />
      </div>
      <p className="p-3 text-center text-xs text-white/60">Double-tap or scroll to zoom. Drag to move when zoomed.</p>
    </div>
  )
}
