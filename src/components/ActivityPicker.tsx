import React from 'react'
import { MODULES, MODULE_THEME, ModuleKey } from '../config/modules'
import { ModuleArt } from './art'
import { SceneHeader, stagger } from './ui'

export default function ActivityPicker({ onBack, onSelect }: { onBack: () => void; onSelect: (key: ModuleKey) => void }) {
  return (
    <div className="text-on-background min-h-screen pb-24 font-body-md antialiased flex flex-col">
      <SceneHeader title="Select Activity" onBack={onBack} />

      <main className="relative z-10 -mt-16 flex-1 px-margin-edge">
        <div className="grid grid-cols-2 gap-4">
          {MODULES.map((m, i) => {
            const t = MODULE_THEME[m.key]
            const lone = i === MODULES.length - 1 && MODULES.length % 2 === 1
            return (
              <button
                key={m.key}
                onClick={() => onSelect(m.key)}
                style={{ ...stagger(i), background: `linear-gradient(160deg, #ffffff 30%, ${t.tint})` }}
                className={`anim-fade-up relative overflow-hidden rounded-3xl p-4 pt-5 border border-white shadow-[0_10px_28px_-10px_rgba(60,60,20,0.3)] flex flex-col items-center justify-center text-center aspect-square active:scale-95 hover:-translate-y-1 transition-transform duration-200 group ${lone ? 'col-span-2 max-w-[200px] mx-auto w-full' : ''}`}
              >
                <span className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
                <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: `linear-gradient(90deg, ${t.from}, ${t.to})` }} />
                <span className="anim-float mb-2" style={{ animationDelay: `${i * -0.6}s` }}>
                  <ModuleArt moduleKey={m.key} className="w-16 h-16 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                </span>
                <span className="text-body-md font-extrabold leading-tight mb-0.5" style={{ color: t.ink }}>{m.label}</span>
                <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{m.labelPa}</span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
