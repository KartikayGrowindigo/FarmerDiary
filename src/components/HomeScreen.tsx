import React from 'react'
import store from '../lib/store'
import { MODULES } from '../config/modules'
import { Logo, PlotArt } from './art'
import { SceneHeader, Initials, stagger } from './ui'

const TOTAL_MODULES = MODULES.length
const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function HomeScreen({ onOpenPlot }: { onOpenPlot: (plotId: string) => void }) {
  const farmer = store.getFarmers()[0]
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id)
  const cycle = store.getCurrentCropCycle(plots[0]?.id)

  return (
    <div className="min-h-screen text-on-surface pb-32">
      <svg width={0} height={0} className="absolute" aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>

      <SceneHeader
        tall
        title={
          <span className="flex items-center gap-2.5">
            <Logo className="w-9 h-9 shrink-0 drop-shadow-md" />
            Kheti Portal
          </span>
        }
        subtitle={<span className="block mt-1">{farmer.kisanAdvisor} · {farmer.village}</span>}
        right={<Initials name={farmer.name} className="w-12 h-12 text-body-md" />}
      >
        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-label-caps font-label-caps">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          {cycle ? `${cycle.crop} · ${cycle.season} ${cycle.year}` : 'No active cycle'}
        </span>
      </SceneHeader>

      <main className="relative z-10 -mt-14 px-margin-edge flex flex-col gap-stack-md">
        {plots.map((plot, idx) => {
          const plotCycle = store.getCurrentCropCycle(plot.id)
          const activities = plotCycle ? store.getActivitiesForCropCycle(plotCycle.id) : []
          const completion = Math.min(TOTAL_MODULES, new Set(activities.map(a => a.module)).size)
          const fraction = completion / TOTAL_MODULES
          const dashOffset = CIRCUMFERENCE * (1 - fraction)

          return (
            <button
              key={plot.id}
              onClick={() => onOpenPlot(plot.id)}
              style={stagger(idx, 0.08)}
              className="card anim-fade-up w-full p-3 pr-4 text-left flex items-center gap-4 min-h-[96px] active:scale-[0.98] hover:-translate-y-0.5 transition-transform duration-200 group"
            >
              <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 shadow-inner ring-1 ring-black/5">
                <PlotArt variant={idx} className="w-full h-full group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-label-caps font-label-caps text-emerald-700 tracking-widest">PLOT #{plot.id.slice(0, 3).toUpperCase()}</span>
                <div className="flex items-baseline gap-1 text-on-surface">
                  <span className="text-headline-md font-extrabold">{plot.acres}</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">
                    Acres <span className="text-punjabi-subtext font-punjabi-subtext ml-1">(ਏਕੜ)</span>
                  </span>
                </div>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0" style={stagger(idx, 0.08)}>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="stroke-emerald-100" cx="50" cy="50" fill="transparent" r={RADIUS} strokeWidth="9" />
                  <circle
                    className="progress-ring__circle"
                    stroke="url(#ring-grad)"
                    cx="50" cy="50" fill="transparent" r={RADIUS}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeWidth="9"
                    style={{ ['--ring-c' as any]: CIRCUMFERENCE }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-800">
                  <span className="text-body-md font-extrabold leading-none">{completion}/{TOTAL_MODULES}</span>
                </div>
              </div>
            </button>
          )
        })}
      </main>
    </div>
  )
}
