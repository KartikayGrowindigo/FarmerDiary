import React from 'react'
import store from '../lib/store'
import { PlotArt } from './art'
import { SceneHeader, Initials, stagger } from './ui'

export default function ProfileScreen() {
  const farmer = store.getFarmers()[0]
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id)
  const totalAcres = plots.reduce((s, p) => s + p.acres, 0)

  const rows: { label: string; labelPa: string; value: string; icon: string; tone: string }[] = [
    { label: "Father's name", labelPa: 'ਪਿਤਾ ਦਾ ਨਾਮ', value: farmer.fatherName, icon: 'family_restroom', tone: 'bg-orange-100 text-orange-700' },
    { label: 'Village', labelPa: 'ਪਿੰਡ', value: farmer.village, icon: 'holiday_village', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'Contact', labelPa: 'ਸੰਪਰਕ', value: farmer.contact, icon: 'call', tone: 'bg-sky-100 text-sky-700' },
    { label: 'Kisan Advisor', labelPa: 'ਕਿਸਾਨ ਸਲਾਹਕਾਰ', value: farmer.kisanAdvisor, icon: 'support_agent', tone: 'bg-violet-100 text-violet-700' },
    { label: 'GIPL ID', labelPa: 'GIPL ID', value: farmer.gipl_id || '—', icon: 'badge', tone: 'bg-amber-100 text-amber-700' }
  ]

  return (
    <div className="text-on-surface min-h-screen pb-32 flex flex-col">
      <SceneHeader title="Profile" />

      <main className="relative z-10 -mt-20 flex-1 px-margin-edge flex flex-col gap-stack-lg">
        <div className="card anim-fade-up p-5 flex items-center gap-4 overflow-hidden relative" style={stagger(0)}>
          <div className="absolute right-0 top-0 bottom-0 w-28 opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]">
            <PlotArt variant={1} className="w-full h-full" />
          </div>
          <Initials name={farmer.name} className="w-16 h-16 text-headline-sm" />
          <div className="relative">
            <h2 className="text-headline-sm font-extrabold text-on-surface">{farmer.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-label-caps font-label-caps">{plots.length} plots</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-caps font-label-caps">{totalAcres.toFixed(1)} acres</span>
            </div>
          </div>
        </div>

        <div className="card anim-fade-up divide-y divide-stone-100 overflow-hidden" style={stagger(1)}>
          {rows.map((r, i) => (
            <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-3.5 anim-fade-up" style={stagger(i + 2)}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${r.tone}`}>
                  <span className="material-symbols-outlined text-[22px]">{r.icon}</span>
                </span>
                <div className="min-w-0">
                  <span className="block text-body-md font-bold text-on-surface">{r.label}</span>
                  <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{r.labelPa}</span>
                </div>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
