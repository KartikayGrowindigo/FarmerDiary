import React from 'react'
import store from '../lib/store'
import { themeFor } from '../config/modules'
import { Activity } from '../types'
import { ModuleArt } from './art'
import { SceneHeader, stagger } from './ui'

function groupByMonth(activities: Activity[]) {
  const groups: { label: string; labelPa: string; items: Activity[] }[] = []
  const monthNamesPa: Record<string, string> = {
    January: 'ਜਨਵਰੀ', February: 'ਫਰਵਰੀ', March: 'ਮਾਰਚ', April: 'ਅਪ੍ਰੈਲ', May: 'ਮਈ', June: 'ਜੂਨ',
    July: 'ਜੁਲਾਈ', August: 'ਅਗਸਤ', September: 'ਸਤੰਬਰ', October: 'ਅਕਤੂਬਰ', November: 'ਨਵੰਬਰ', December: 'ਦਸੰਬਰ'
  }
  for (const a of activities) {
    const d = new Date(a.date)
    const monthName = d.toLocaleString('en-US', { month: 'long' })
    const label = `${monthName} ${d.getFullYear()}`
    let group = groups.find(g => g.label === label)
    if (!group) {
      group = { label, labelPa: `${monthNamesPa[monthName] || monthName} ${d.getFullYear()}`, items: [] }
      groups.push(group)
    }
    group.items.push(a)
  }
  return groups
}

export default function PlotDetailScreen({ plotId, onBack, onAdd }: { plotId: string; onBack: () => void; onAdd: () => void }) {
  const plot = store.getPlotById(plotId)
  const cycle = store.getCurrentCropCycle(plotId)
  const activities = cycle ? store.getActivitiesForCropCycle(cycle.id) : []
  const groups = groupByMonth(activities)
  let n = 0

  return (
    <div className="text-on-surface font-sans min-h-screen pb-28">
      <SceneHeader
        title={`Plot #${plot.id.slice(0, 3).toUpperCase()}`}
        onBack={onBack}
        subtitle={
          <span className="flex items-center gap-1">
            <span>{plot.acres} Acres</span>
            <span className="mx-1 opacity-60">/</span>
            <span className="text-punjabi-subtext font-punjabi-subtext">{plot.acres} ਏਕੜ</span>
          </span>
        }
      />

      <main className="relative z-10 -mt-12 px-margin-edge">
        {groups.length === 0 && (
          <div className="card anim-fade-up text-center text-on-surface-variant py-12 px-6 flex flex-col items-center">
            <ModuleArt moduleKey="Seed & Sowing" className="w-20 h-20 mb-3 anim-float" />
            No activities logged yet.
          </div>
        )}

        {groups.map((group, gi) => (
          <div key={group.label} className="mb-stack-lg">
            <h2 className="inline-flex items-center gap-2 mb-stack-md px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-white shadow-sm text-label-caps font-label-caps text-emerald-800 uppercase anim-fade-up">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>{group.label}</span>
              <span className="text-on-surface-variant">/</span>
              <span className="font-punjabi-subtext text-on-surface-variant normal-case">{group.labelPa}</span>
            </h2>
            <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[23px] before:w-1 before:rounded-full before:bg-gradient-to-b before:from-emerald-300 before:via-amber-300 before:to-sky-300">
              {group.items.map((a, i) => {
                const t = themeFor(a.module)
                const isFirstOverall = gi === 0 && i === 0
                return (
                  <div key={a.id} className="relative pl-14 anim-fade-up" style={stagger(n++)}>
                    <div
                      className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full border-4 border-white z-10 shadow"
                      style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                    >
                      {isFirstOverall && <span className="absolute inset-0 rounded-full anim-pulse-ring" style={{ background: t.to }} />}
                    </div>
                    <div className="card p-3 pr-4 flex items-center justify-between min-h-touch-target-min active:scale-[0.98] transition-transform cursor-pointer overflow-hidden relative">
                      <span className="absolute left-0 inset-y-0 w-1.5" style={{ background: `linear-gradient(180deg, ${t.from}, ${t.to})` }} />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: t.tint }}>
                          <ModuleArt moduleKey={a.module} className="w-9 h-9" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body-md font-bold text-on-surface">{a.module}</h3>
                          {a.notes && <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{a.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-label-caps font-label-caps px-2 py-0.5 rounded-full" style={{ background: t.tint, color: t.ink }}>
                          {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      <button onClick={onAdd} aria-label="Add activity" className="fixed bottom-6 right-margin-edge w-16 h-16 z-40">
        <span className="absolute inset-0 rounded-full bg-amber-400 anim-pulse-ring" />
        <span className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/40 flex items-center justify-center hover:scale-105 active:scale-90 transition-transform text-white">
          <span className="material-symbols-outlined text-[32px]">add</span>
        </span>
      </button>
    </div>
  )
}
