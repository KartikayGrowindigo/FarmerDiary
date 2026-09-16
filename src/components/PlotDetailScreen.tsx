import React from 'react'
import store from '../lib/store'
import { moduleByKey } from '../config/modules'
import { Activity } from '../types'

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

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen pb-touch-target-min">
      <header className="sticky top-0 z-40 bg-surface shadow-sm">
        <div className="px-margin-edge py-stack-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} aria-label="Go back" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <div>
              <h1 className="text-headline-sm font-headline-sm text-on-surface">Plot #{plot.id.slice(0, 3).toUpperCase()}</h1>
              <div className="flex items-center gap-1">
                <span className="text-body-md font-body-md text-on-surface-variant">{plot.acres} Acres</span>
                <span className="text-on-surface-variant mx-1">/</span>
                <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{plot.acres} ਏਕੜ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-margin-edge py-stack-lg">
        {groups.length === 0 && (
          <div className="text-center text-on-surface-variant py-16">
            <span className="material-symbols-outlined text-5xl mb-2 block">event_note</span>
            No activities logged yet.
          </div>
        )}

        {groups.map((group, gi) => (
          <div key={group.label} className="mb-stack-lg">
            <h2 className="text-label-caps font-label-caps text-primary uppercase mb-stack-md flex items-center gap-2">
              <span>{group.label}</span>
              <span className="text-on-surface-variant">/</span>
              <span className="font-punjabi-subtext text-on-surface-variant normal-case">{group.labelPa}</span>
            </h2>
            <div className="space-y-stack-sm relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-surface-variant">
              {group.items.map((a, i) => {
                const mod = moduleByKey(a.module)
                const isFirstOverall = gi === 0 && i === 0
                return (
                  <div key={a.id} className="relative pl-12">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-surface z-10 ${isFirstOverall ? 'bg-primary' : 'bg-surface-variant'}`} />
                    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between min-h-touch-target-min active:scale-98 transition-transform cursor-pointer">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isFirstOverall ? 'bg-primary-fixed-dim/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined" style={isFirstOverall ? { fontVariationSettings: "'FILL' 1" } : undefined}>{mod?.icon || 'event_note'}</span>
                        </div>
                        <div>
                          <h3 className="text-body-md font-body-md text-on-surface">{a.module}</h3>
                          {a.notes && <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{a.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-label-caps font-label-caps text-on-surface-variant">
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

      <button onClick={onAdd} className="fixed bottom-[24px] right-margin-edge w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 text-on-primary">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  )
}
