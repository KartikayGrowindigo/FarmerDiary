import React from 'react'
import store from '../lib/store'

export default function ProfileScreen() {
  const farmer = store.getFarmers()[0]
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id)
  const totalAcres = plots.reduce((s, p) => s + p.acres, 0)

  const rows: { label: string; labelPa: string; value: string }[] = [
    { label: "Father's name", labelPa: 'ਪਿਤਾ ਦਾ ਨਾਮ', value: farmer.fatherName },
    { label: 'Village', labelPa: 'ਪਿੰਡ', value: farmer.village },
    { label: 'Contact', labelPa: 'ਸੰਪਰਕ', value: farmer.contact },
    { label: 'Kisan Advisor', labelPa: 'ਕਿਸਾਨ ਸਲਾਹਕਾਰ', value: farmer.kisanAdvisor },
    { label: 'GIPL ID', labelPa: 'GIPL ID', value: farmer.gipl_id || '—' }
  ]

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 flex flex-col">
      <header className="bg-surface shadow-sm sticky top-0 z-40">
        <div className="flex flex-col justify-center w-full px-margin-edge py-stack-md">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">Profile</h1>
        </div>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg flex flex-col gap-stack-lg">
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex items-center gap-4">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center shrink-0">
            <span className="text-headline-sm font-headline-sm text-primary font-bold">
              {farmer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface">{farmer.name}</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">{plots.length} plots · {totalAcres.toFixed(1)} acres</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] divide-y divide-surface-variant">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="block text-body-md font-body-md text-on-surface">{r.label}</span>
                <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{r.labelPa}</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">{r.value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
