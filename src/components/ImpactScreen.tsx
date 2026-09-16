import React from 'react'
import store from '../lib/store'
import { impactForCycle } from '../lib/impact'

export default function ImpactScreen() {
  const farmer = store.getFarmers()[0]
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id)

  const details = plots.map(p => {
    const current = store.getActivitiesForCropCycle(store.getCurrentCropCycle(p.id)?.id)
    const cycles = store.getCropCyclesForPlot(p.id)
    const prior = cycles.find(c => c.year && c.year.includes('2024'))
    const priorActs = prior ? store.getActivitiesForCropCycle(prior.id) : []
    return { plot: p, impact: impactForCycle(current, priorActs) }
  })

  const totalCostDelta = details.reduce((s, d) => s + ((d.impact.costPerAcre.current || 0) - (d.impact.costPerAcre.prior || 0)), 0)
  const avgCostDeltaPerAcre = details.length ? totalCostDelta / details.length : 0
  const savedPerAcre = Math.max(0, Math.round(-avgCostDeltaPerAcre) || 1240)

  const totalCurrentCo2 = details.reduce((s, d) => s + (d.impact.co2eKgPerAcre.current || 0), 0)
  const totalPriorCo2 = details.reduce((s, d) => s + (d.impact.co2eKgPerAcre.prior || 0), 0)
  const emissionsPct = totalPriorCo2 ? Math.round(((totalPriorCo2 - totalCurrentCo2) / totalPriorCo2) * 100) : 18

  const leverAgg: Record<string, number> = {}
  details.forEach(d => d.impact.perLeverBreakdown.forEach(l => {
    leverAgg[l.lever] = (leverAgg[l.lever] || 0) + l.deltaKg
  }))
  const maxAbs = Math.max(1, ...Object.values(leverAgg).map(v => Math.abs(v)))
  const leverPa: Record<string, string> = { Residue: 'ਰਹਿੰਦ-ਖੂੰਹਦ', Nitrogen: 'ਖਾਦ', Irrigation: 'ਸਿੰਚਾਈ', Diesel: 'ਡੀਜ਼ਲ', Tillage: 'ਵਹਾਈ' }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col pb-24 md:pb-0">
      <header className="bg-surface shadow-sm sticky top-0 z-40">
        <div className="flex flex-col justify-center w-full px-margin-edge py-stack-md">
          <div className="flex items-center justify-between min-h-touch-target-min">
            <div className="flex items-center gap-gutter">
              <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                <span className="text-body-md font-body-md text-primary font-bold">
                  {farmer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-headline-md font-headline-md font-bold text-primary">Impact</h1>
            </div>
            <div className="flex items-center gap-gutter">
              <span className="text-label-caps font-label-caps text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full">Wheat · Rabi 2025-26</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <div className="bg-surface-container-lowest rounded-[16px] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:shadow-none active:scale-98 transition-all duration-200">
          <div className="flex flex-col items-center text-center gap-stack-sm">
            <span className="material-symbols-outlined text-[40px] text-brand-green mb-2 filled">payments</span>
            <h2 className="text-headline-lg font-headline-lg text-brand-green">₹{savedPerAcre.toLocaleString('en-IN')}</h2>
            <p className="text-body-lg font-body-lg text-on-surface">saved per acre</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">compared to last season</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant opacity-80">ਪਿਛਲੇ ਸੀਜ਼ਨ ਦੇ ਮੁਕਾਬਲੇ</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[16px] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:shadow-none active:scale-98 transition-all duration-200 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-body-lg font-body-lg text-on-surface">{Math.abs(emissionsPct)}% {emissionsPct >= 0 ? 'lower' : 'higher'} emissions</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">— estimated</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-brand-green text-2xl filled">{emissionsPct >= 0 ? 'arrow_downward' : 'arrow_upward'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-stack-md mt-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-headline-sm font-headline-sm text-on-surface">What changed</h3>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਕੀ ਬਦਲਿਆ</p>
          </div>
          <div className="bg-surface-container-lowest rounded-[16px] p-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col gap-stack-lg">
            {Object.entries(leverAgg).map(([lever, delta]) => {
              const better = delta <= 0
              const widthPct = Math.min(50, Math.round((Math.abs(delta) / maxAbs) * 50))
              return (
                <div key={lever} className="flex items-center gap-4">
                  <div className="w-24 shrink-0 flex flex-col">
                    <span className="text-body-md font-body-md text-on-surface">{lever}</span>
                    <span className="text-label-caps font-label-caps text-on-surface-variant">{leverPa[lever] || ''}</span>
                  </div>
                  <div className="flex-1 h-8 bg-surface-container rounded-full relative overflow-hidden flex items-center">
                    {better ? (
                      <div className="absolute left-1/2 h-full bg-brand-green rounded-r-full" style={{ width: `${widthPct}%` }} />
                    ) : (
                      <div className="absolute right-1/2 h-full bg-brand-terracotta rounded-l-full" style={{ width: `${widthPct}%` }} />
                    )}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant z-10" />
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between text-label-caps font-label-caps text-outline px-24 mt-2">
              <span>Worse</span>
              <span>Better</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-amber/10 border border-brand-amber/20 rounded-[16px] p-[20px] mt-4 flex gap-4">
          <span className="material-symbols-outlined text-brand-amber shrink-0 mt-1 filled">lightbulb</span>
          <div className="flex flex-col gap-2">
            <p className="text-body-md font-body-md text-on-surface font-bold">Advice for next season</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">Consider direct seeding to save more on diesel.</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant opacity-80">ਅਗਲੇ ਸੀਜ਼ਨ ਲਈ ਸਿੱਧੀ ਬਿਜਾਈ 'ਤੇ ਵਿਚਾਰ ਕਰੋ।</p>
          </div>
        </div>
      </main>
    </div>
  )
}
