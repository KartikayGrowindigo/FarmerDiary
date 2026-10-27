import React, { useMemo } from 'react'
import store from '../lib/store'
import { MODULES, MODULE_THEME, ModuleKey } from '../config/modules'
import { Activity } from '../types'
import { ModuleArt } from './art'
import { SceneHeader, stagger } from './ui'

const shortDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

// Activities logged this season, for one plot or (from the bottom nav) for all of the farmer's plots.
function seasonActivities(plotId: string | null): Activity[] {
  const farmerId = store.getFarmers()[0].id
  const plots = plotId ? [store.getPlotById(plotId)] : store.getPlots().filter(p => p.farmerId === farmerId)
  return plots.flatMap(p => {
    const cycle = store.getCurrentCropCycle(p.id)
    return cycle ? store.getActivitiesForCropCycle(cycle.id) : []
  })
}

export default function ActivityPicker({ plotId, onBack, onSelect }: { plotId: string | null; onBack: () => void; onSelect: (key: ModuleKey) => void }) {
  const logged = useMemo(() => {
    const by: Partial<Record<ModuleKey, { count: number; last: string }>> = {}
    for (const a of seasonActivities(plotId)) {
      const k = a.module as ModuleKey
      const prev = by[k]
      by[k] = { count: (prev?.count ?? 0) + 1, last: prev && prev.last > a.date ? prev.last : a.date }
    }
    return by
  }, [plotId])

  const plot = plotId ? store.getPlotById(plotId) : null
  const cycle = plotId ? store.getCurrentCropCycle(plotId) : null
  const subtitle = plot
    ? `Plot #${plot.id.slice(0, 3).toUpperCase()} · ${plot.acres} acres${cycle ? ` · ${cycle.crop}` : ''}`
    : 'Choose what you did in the field'

  return (
    <div className="text-on-background min-h-screen pb-24 font-body-md antialiased flex flex-col">
      <SceneHeader title="Add Activity" subtitle={subtitle} onBack={onBack} />

      <main className="relative z-10 -mt-16 flex-1 px-margin-edge">
        <section className="card p-2 anim-fade-up">
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Crop season</span>
            <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਕੰਮ ਚੁਣੋ</span>
          </div>

          <ol>
            {MODULES.map((m, i) => {
              const t = MODULE_THEME[m.key]
              const next = MODULES[i + 1] && MODULE_THEME[MODULES[i + 1].key]
              const log = logged[m.key]
              return (
                <li key={m.key} className="relative anim-fade-up" style={stagger(i, 0.05)}>
                  {/* Connector to the next step, centred under the tile. */}
                  {next && (
                    <span
                      aria-hidden
                      className="absolute left-[35px] top-[60px] h-4 w-0.5 rounded-full opacity-40"
                      style={{ background: `linear-gradient(${t.to}, ${next.from})` }}
                    />
                  )}
                  <button
                    onClick={() => onSelect(m.key)}
                    style={{ '--tint': t.tint } as React.CSSProperties}
                    className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-2xl text-left transition-colors duration-200 active:bg-[var(--tint)] md:hover:bg-[var(--tint)]"
                  >
                    <span
                      className="relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-active:scale-95 md:group-hover:-rotate-3"
                      style={{ background: `linear-gradient(145deg, #ffffff 15%, ${t.tint})`, boxShadow: `inset 0 0 0 1.5px ${t.tint}, 0 6px 14px -8px ${t.from}` }}
                    >
                      <ModuleArt moduleKey={m.key} className="w-9 h-9" />
                      <span
                        className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center ring-2 ring-white"
                        style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                      >
                        {i + 1}
                      </span>
                    </span>

                    <span className="flex-1 min-w-0 leading-tight">
                      <span className="block text-body-md font-extrabold truncate" style={{ color: t.ink }}>{m.label}</span>
                      <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface truncate">{m.labelPa}</span>
                      <span className="block text-[12px] text-on-surface-variant/80 truncate">{m.hint}</span>
                    </span>

                    {log ? (
                      <span className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-label-caps font-label-caps" style={{ background: t.tint, color: t.ink }}>
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {log.count > 1 ? `${log.count} · ` : ''}{shortDate(log.last)}
                      </span>
                    ) : (
                      <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 md:group-hover:translate-x-0.5" style={{ background: t.tint, color: t.ink }}>
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      </main>
    </div>
  )
}
