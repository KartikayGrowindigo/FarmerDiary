import React from 'react'
import store from '../lib/store'
import { MODULES } from '../config/modules'

const TOTAL_MODULES = MODULES.length
const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function HomeScreen({ onOpenPlot }: { onOpenPlot: (plotId: string) => void }) {
  const farmer = store.getFarmers()[0]
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id)
  const cycle = store.getCurrentCropCycle(plots[0]?.id)

  return (
    <div className="bg-background min-h-screen text-on-surface pb-[90px]">
      <header className="bg-surface shadow-sm sticky top-0 z-40 w-full">
        <div className="flex flex-col justify-center w-full px-margin-edge py-stack-md">
          <div className="flex justify-between items-start mb-stack-sm">
            <div>
              <h1 className="text-headline-md font-headline-md font-bold text-primary">Kheti Portal</h1>
              <p className="text-body-md font-body-md text-on-surface-variant">{farmer.kisanAdvisor} · {farmer.village}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-body-md font-body-md text-primary font-bold">
                {farmer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-caps font-label-caps">
              {cycle ? `${cycle.crop} · ${cycle.season} ${cycle.year}` : 'No active cycle'}
            </span>
          </div>
        </div>
      </header>

      <main className="px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-stack-md">
          {plots.map(plot => {
            const plotCycle = store.getCurrentCropCycle(plot.id)
            const activities = plotCycle ? store.getActivitiesForCropCycle(plotCycle.id) : []
            const completion = Math.min(TOTAL_MODULES, new Set(activities.map(a => a.module)).size)
            const fraction = completion / TOTAL_MODULES
            const dashOffset = CIRCUMFERENCE * (1 - fraction)

            return (
              <button
                key={plot.id}
                onClick={() => onOpenPlot(plot.id)}
                className="w-full bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform duration-150 text-left flex items-center justify-between min-h-[96px] group hover:bg-surface-container-low"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="material-symbols-outlined text-[20px]">agriculture</span>
                    <span className="text-headline-sm font-headline-sm">#{plot.id.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="flex items-baseline gap-1 text-on-surface">
                    <span className="text-headline-md font-headline-md">{plot.acres}</span>
                    <span className="text-body-md font-body-md text-on-surface-variant">
                      Acres <span className="text-punjabi-subtext font-punjabi-subtext ml-1">(ਏਕੜ)</span>
                    </span>
                  </div>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r={RADIUS} strokeWidth="8" />
                    <circle
                      className="text-primary stroke-current progress-ring__circle"
                      cx="50" cy="50" fill="transparent" r={RADIUS}
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                    <span className="text-body-md font-body-md font-bold leading-none">{completion}/{TOTAL_MODULES}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
