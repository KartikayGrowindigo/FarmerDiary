import React from 'react'

export type NavKey = 'home' | 'add' | 'impact' | 'profile'

const ITEMS: { key: NavKey; icon: string; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'add', icon: 'add_circle', label: 'Add' },
  { key: 'impact', icon: 'leaderboard', label: 'Impact' },
  { key: 'profile', icon: 'person', label: 'Profile' }
]

export default function BottomNav({ active, onNavigate }: { active: NavKey; onNavigate: (k: NavKey) => void }) {
  return (
    <nav className="bg-surface-container-lowest shadow-[0_-4px_12px_rgba(0,0,0,0.06)] fixed bottom-0 w-full z-50 flex justify-around items-center h-touch-target-min px-margin-edge pb-2 pt-2 rounded-t-xl">
      {ITEMS.map(item => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center justify-center scale-98 active:scale-95 transition-all duration-200 hover:bg-primary-fixed-dim/20 px-4 py-1 rounded-xl relative ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
            <span className="text-label-caps font-label-caps mt-1">{item.label}</span>
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </button>
        )
      })}
    </nav>
  )
}
