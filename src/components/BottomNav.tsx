import React from 'react'

export type NavKey = 'home' | 'add' | 'impact' | 'profile'

const ITEMS: { key: NavKey; icon: string; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'add', icon: 'add', label: 'Add' },
  { key: 'impact', icon: 'insights', label: 'Impact' },
  { key: 'profile', icon: 'person', label: 'Profile' }
]

export default function BottomNav({ active, onNavigate }: { active: NavKey; onNavigate: (k: NavKey) => void }) {
  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 h-[68px] px-2 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_12px_32px_-8px_rgba(20,60,40,0.35)] flex justify-around items-center">
      {ITEMS.map(item => {
        const isActive = item.key === active

        if (item.key === 'add') {
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)} aria-label={item.label} className="relative -mt-8 flex flex-col items-center">
              <span className="absolute top-0 w-14 h-14 rounded-full bg-amber-400 anim-pulse-ring" />
              <span className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/40 border-4 border-white flex items-center justify-center active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-[30px]">{item.icon}</span>
              </span>
              <span className={`text-label-caps font-label-caps mt-1 ${isActive ? 'text-orange-600' : 'text-on-surface-variant'}`}>{item.label}</span>
            </button>
          )
        }

        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl active:scale-90 transition-all duration-300 ${isActive ? 'bg-emerald-100 text-emerald-800' : 'text-on-surface-variant'}`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'anim-pop' : ''}`}>{item.icon}</span>
            <span className="text-label-caps font-label-caps mt-0.5">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
