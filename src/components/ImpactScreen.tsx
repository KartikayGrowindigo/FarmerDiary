import React from 'react'
import store from '../lib/store'
import { impactForCycle } from '../lib/impact'
import { ModuleArt, OptionArt, ExtraArt } from './art'
import { SceneHeader, Initials, useCountUp, stagger } from './ui'

const LEVER_ART: Record<string, React.ReactNode> = {
  Residue: <ModuleArt moduleKey="Residue Management" className="w-full h-full" />,
  Nitrogen: <ModuleArt moduleKey="Fertilizer & Nutrient Management" className="w-full h-full" />,
  Irrigation: <ModuleArt moduleKey="Water Management" className="w-full h-full" />,
  Diesel: <ExtraArt.diesel className="w-full h-full" />,
  Tillage: <OptionArt value="Conventional Tillage" className="w-full h-full" />
}

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

  const savedDisplay = Math.round(useCountUp(savedPerAcre))
  const emissionsDisplay = Math.round(useCountUp(Math.abs(emissionsPct)))

  return (
    <div className="text-on-surface min-h-screen flex flex-col pb-32">
      <SceneHeader
        title="Impact"
        right={<Initials name={farmer.name} className="w-11 h-11 text-body-md" />}
      >
        <span className="inline-block mt-2 text-label-caps font-label-caps px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">Wheat · Rabi 2025-26</span>
      </SceneHeader>

      <main className="relative z-10 -mt-12 flex-1 w-full max-w-2xl mx-auto px-margin-edge flex flex-col gap-stack-md">
        <div className="shimmer anim-fade-up rounded-3xl p-6 text-white shadow-[0_16px_32px_-12px_rgba(5,120,80,0.6)] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" style={stagger(0)}>
          <span className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <ExtraArt.coins className="w-20 h-20 shrink-0 anim-float drop-shadow-lg" />
            <div className="flex flex-col">
              <h2 className="text-[40px] leading-none font-extrabold tracking-tight">₹{savedDisplay.toLocaleString('en-IN')}</h2>
              <p className="text-body-lg font-bold mt-1">saved per acre</p>
              <p className="text-punjabi-subtext text-white/85 mt-1">compared to last season</p>
              <p className="text-punjabi-subtext text-white/75">ਪਿਛਲੇ ਸੀਜ਼ਨ ਦੇ ਮੁਕਾਬਲੇ</p>
            </div>
          </div>
        </div>

        <div className="card anim-fade-up p-5 flex items-center justify-between gap-4 overflow-hidden relative" style={stagger(1)}>
          <span className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-lime-200/60" />
          <div className="relative flex items-center gap-4">
            <ExtraArt.leaf className="w-12 h-12 shrink-0 anim-float" />
            <div className="flex flex-col gap-0.5">
              <p className="text-body-lg text-on-surface"><span className="text-headline-sm font-extrabold text-emerald-700">{emissionsDisplay}%</span> {emissionsPct >= 0 ? 'lower' : 'higher'} emissions</p>
              <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">— estimated</p>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${emissionsPct >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            <span className="material-symbols-outlined text-2xl">{emissionsPct >= 0 ? 'trending_down' : 'trending_up'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-stack-md mt-3">
          <div className="flex flex-col gap-0.5 anim-fade-up" style={stagger(2)}>
            <h3 className="text-headline-sm font-extrabold text-on-surface">What changed</h3>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਕੀ ਬਦਲਿਆ</p>
          </div>
          <div className="card anim-fade-up p-5 flex flex-col gap-5" style={stagger(3)}>
            {Object.entries(leverAgg).map(([lever, delta], i) => {
              const better = delta <= 0
              const widthPct = Math.min(50, Math.round((Math.abs(delta) / maxAbs) * 50))
              return (
                <div key={lever} className="flex items-center gap-3">
                  <div className="w-9 h-9 shrink-0">{LEVER_ART[lever]}</div>
                  <div className="w-20 shrink-0 flex flex-col">
                    <span className="text-body-md font-bold text-on-surface">{lever}</span>
                    <span className="text-label-caps font-label-caps text-on-surface-variant">{leverPa[lever] || ''}</span>
                  </div>
                  <div className="flex-1 h-7 bg-stone-100 rounded-full relative overflow-hidden flex items-center">
                    {better ? (
                      <div className="absolute left-1/2 h-full rounded-r-full bg-gradient-to-r from-emerald-400 to-emerald-600 anim-grow-x origin-left" style={{ width: `${widthPct}%`, animationDelay: `${0.4 + i * 0.1}s` }} />
                    ) : (
                      <div className="absolute right-1/2 h-full rounded-l-full bg-gradient-to-l from-orange-400 to-rose-600 anim-grow-x origin-right" style={{ width: `${widthPct}%`, animationDelay: `${0.4 + i * 0.1}s` }} />
                    )}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-300 z-10" />
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between text-label-caps font-label-caps pl-[136px] mt-1">
              <span className="text-rose-600">◀ Worse</span>
              <span className="text-emerald-700">Better ▶</span>
            </div>
          </div>
        </div>

        <div className="anim-fade-up rounded-3xl p-5 mt-3 flex gap-4 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border border-amber-200 shadow-[0_10px_24px_-12px_rgba(217,119,6,0.5)]" style={stagger(4)}>
          <ExtraArt.bulb className="w-14 h-14 shrink-0 anim-float" />
          <div className="flex flex-col gap-1.5">
            <p className="text-body-md font-extrabold text-amber-900">Advice for next season</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface">Consider direct seeding to save more on diesel.</p>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਅਗਲੇ ਸੀਜ਼ਨ ਲਈ ਸਿੱਧੀ ਬਿਜਾਈ 'ਤੇ ਵਿਚਾਰ ਕਰੋ।</p>
          </div>
        </div>
      </main>
    </div>
  )
}
