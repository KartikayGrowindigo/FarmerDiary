import React from 'react'
import { MODULES } from '../config/modules'
import { ModuleKey } from '../config/modules'

export default function ActivityPicker({ onBack, onSelect }: { onBack: () => void; onSelect: (key: ModuleKey) => void }) {
  return (
    <div className="bg-background text-on-background min-h-screen pb-24 font-body-md antialiased flex flex-col">
      <header className="flex items-center justify-between w-full px-margin-edge py-stack-md bg-surface shadow-sm sticky top-0 z-40">
        <button onClick={onBack} aria-label="Go back" className="h-touch-target-min w-touch-target-min flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors -ml-4">
          <span className="material-symbols-outlined text-on-surface text-2xl">arrow_back</span>
        </button>
        <h1 className="text-headline-sm font-headline-sm text-primary flex-1 text-center pr-touch-target-min">Select Activity</h1>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg">
        <div className="grid grid-cols-2 gap-margin-edge">
          {MODULES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center aspect-square scale-100 active:scale-95 transition-transform duration-150 group ${i === MODULES.length - 1 && MODULES.length % 2 === 1 ? 'col-span-2 max-w-[200px] mx-auto w-full' : ''}`}
            >
              <span className="material-symbols-outlined text-4xl text-primary-container mb-stack-sm group-hover:scale-110 transition-transform">{m.icon}</span>
              <span className="text-body-md font-body-md text-on-surface font-bold leading-tight mb-1">{m.label}</span>
              <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{m.labelPa}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
