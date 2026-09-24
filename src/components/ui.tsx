import React, { useEffect, useState } from 'react'
import { FieldScene } from './art'

// Landscape hero used at the top of each screen; content cards overlap its lower edge.
export function SceneHeader({
  title,
  subtitle,
  onBack,
  right,
  children,
  tall = false
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  onBack?: () => void
  right?: React.ReactNode
  children?: React.ReactNode
  tall?: boolean
}) {
  return (
    <header className={`relative overflow-hidden text-white ${tall ? 'h-[260px]' : 'h-[190px]'}`}>
      <FieldScene className="absolute inset-0 w-full h-full" compact={!tall} />
      <div className="relative z-10 px-margin-edge pt-5 flex items-start gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="h-11 w-11 -ml-1 shrink-0 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="flex-1 min-w-0 anim-fade-up">
          <h1 className="text-headline-md font-extrabold tracking-tight text-shadow-soft truncate">{title}</h1>
          {subtitle && <div className="text-body-md text-white/85 text-shadow-soft">{subtitle}</div>}
          {children}
        </div>
        {right}
      </div>
    </header>
  )
}

// Slow-moving colour blobs behind every screen.
export function Backdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 field-pattern" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-300/40 blur-3xl anim-blob" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-emerald-300/35 blur-3xl anim-blob" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-sky-300/30 blur-3xl anim-blob" style={{ animationDelay: '-12s' }} />
    </div>
  )
}

export function Initials({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div className={`rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 p-[3px] shadow-lg shrink-0 ${className}`}>
      <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-extrabold text-primary">
        {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
      </div>
    </div>
  )
}

export function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export const stagger = (i: number, base = 0.06) => ({ animationDelay: `${0.1 + i * base}s` })
