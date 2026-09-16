import React, { useState } from 'react'
import { ModuleKey, moduleByKey } from '../config/modules'
import { MODULE_FIELDS, FieldSpec } from '../config/moduleFields'
import store from '../lib/store'
import { Activity } from '../types'

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

function fieldDefault(f: FieldSpec) {
  return f.default ?? (f.type === 'number' || f.type === 'stepper' ? 0 : f.type === 'toggle' ? false : '')
}

export default function ActivityForm({
  moduleKey,
  plotCount,
  onSave,
  onBack
}: {
  moduleKey: ModuleKey
  plotCount: number
  onSave: (payload: Record<string, any>, applyAll: boolean) => void
  onBack: () => void
}) {
  const mod = moduleByKey(moduleKey)!
  const fields = MODULE_FIELDS[moduleKey]
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {}
    fields.forEach(f => { v[f.key] = fieldDefault(f) })
    return v
  })
  const [applyAll, setApplyAll] = useState(false)

  const setField = (key: string, val: any) => setValues(v => ({ ...v, [key]: val }))

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative pb-32">
      <header className="bg-surface shadow-sm sticky top-0 z-10">
        <div className="flex flex-col justify-center w-full px-margin-edge py-stack-md">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="h-touch-target-min w-touch-target-min flex items-center justify-center -ml-2 text-primary active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[28px]">arrow_back</span>
            </button>
            <div>
              <h1 className="text-headline-sm font-headline-sm text-primary">Add {mod.label}</h1>
              <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{mod.labelPa} ਸ਼ਾਮਲ ਕਰੋ</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg space-y-stack-lg">
        <section>
          <div className="bg-surface-container-lowest rounded-xl shadow-soft-elevation p-5 border-2 border-transparent focus-within:border-primary transition-colors">
            <label className="flex justify-between items-end mb-2">
              <div>
                <span className="block text-body-md font-body-md text-on-surface">Date</span>
                <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਮਿਤੀ</span>
              </div>
            </label>
            <div className="relative">
              <input
                className="w-full h-touch-target-min bg-surface-container-low border-2 border-outline-variant rounded-lg px-4 text-body-lg font-body-lg focus:border-primary focus:ring-0 outline-none text-on-surface appearance-none"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </div>
        </section>

        {fields.map(f => (
          <FieldBlock key={f.key} field={f} value={values[f.key]} onChange={val => setField(f.key, val)} />
        ))}

        <section className="bg-surface-container-lowest rounded-xl shadow-soft-elevation p-5 flex items-center justify-between">
          <div>
            <span className="block text-body-lg font-body-lg text-on-surface font-bold">Apply to all {plotCount} plots</span>
            <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">ਸਾਰੇ {plotCount} ਪਲਾਟਾਂ 'ਤੇ ਲਾਗੂ ਕਰੋ</span>
          </div>
          <button
            aria-pressed={applyAll}
            onClick={() => setApplyAll(a => !a)}
            className={`w-14 h-8 rounded-full relative p-1 flex items-center transition-colors group ${applyAll ? 'bg-primary' : 'bg-surface-variant'}`}
          >
            <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${applyAll ? 'translate-x-6 bg-on-primary' : 'bg-on-surface-variant'}`} />
          </button>
        </section>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-margin-edge bg-surface/90 backdrop-blur-md z-20 border-t border-surface-variant">
        <button
          onClick={() => onSave({ ...values, date }, applyAll)}
          className="w-full h-touch-target-min bg-primary text-on-primary rounded-xl text-headline-sm font-headline-sm flex items-center justify-center gap-3 active:scale-98 transition-transform shadow-lg"
        >
          <span className="material-symbols-outlined">save</span>
          Save Entry
        </button>
      </div>
    </div>
  )
}

function FieldBlock({ field, value, onChange }: { field: FieldSpec; value: any; onChange: (v: any) => void }) {
  if (field.type === 'chips') {
    return (
      <section>
        <div className="mb-stack-sm flex justify-between items-end">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">{field.label}</h2>
          <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-margin-edge px-margin-edge snap-x">
          {field.options!.map(opt => {
            const active = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`snap-start flex-shrink-0 h-touch-target-min px-6 rounded-xl border-2 flex flex-col justify-center items-center active:scale-95 transition-transform ${active ? 'border-primary bg-primary text-on-primary shadow-soft-elevation' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'}`}
              >
                <span className={`text-body-lg font-body-lg ${active ? 'font-bold' : ''}`}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (field.type === 'grid') {
    return (
      <section>
        <div className="mb-stack-sm flex justify-between items-end">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">{field.label}</h2>
          <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field.options!.map(opt => {
            const active = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`h-24 rounded-xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform relative overflow-hidden ${active ? 'bg-primary-container/10 border-2 border-primary' : 'bg-surface-container-lowest shadow-soft-elevation border-2 border-transparent text-on-surface-variant'}`}
              >
                {active && <div className="absolute inset-0 bg-primary opacity-5" />}
                <span className={`material-symbols-outlined text-[28px] ${active ? 'filled text-primary' : ''}`}>{opt.icon}</span>
                <span className={`text-body-md font-body-md text-center leading-tight ${active ? 'font-bold text-primary' : ''}`}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (field.type === 'stepper') {
    return (
      <section className="bg-surface-container-lowest rounded-xl shadow-soft-elevation p-6">
        <div className="text-center mb-6">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">{field.label}{field.unitLabel ? ` (${field.unitLabel})` : ''}</h2>
          <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</p>
        </div>
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-2 border-2 border-outline-variant">
          <button onClick={() => onChange(Math.max(field.min ?? 0, Number(value) - 1))} className="w-16 h-16 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary active:scale-95 transition-transform shadow-sm">
            <span className="material-symbols-outlined text-[32px] font-bold">remove</span>
          </button>
          <div className="text-center w-24">
            <span className="text-[40px] font-bold leading-none text-primary-container">{value}</span>
          </div>
          <button onClick={() => onChange(Number(value) + 1)} className="w-16 h-16 rounded-lg bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform shadow-sm">
            <span className="material-symbols-outlined text-[32px] font-bold">add</span>
          </button>
        </div>
      </section>
    )
  }

  if (field.type === 'toggle') {
    return (
      <section className="bg-surface-container-lowest rounded-xl shadow-soft-elevation p-5 flex items-center justify-between">
        <div>
          <span className="block text-body-lg font-body-lg text-on-surface font-bold">{field.label}</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">{field.labelPa}</span>
        </div>
        <button
          aria-pressed={!!value}
          onClick={() => onChange(!value)}
          className={`w-14 h-8 rounded-full relative p-1 flex items-center transition-colors ${value ? 'bg-primary' : 'bg-surface-variant'}`}
        >
          <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${value ? 'translate-x-6 bg-on-primary' : 'bg-on-surface-variant'}`} />
        </button>
      </section>
    )
  }

  // text and number share a simple input layout
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-soft-elevation p-5 border-2 border-transparent focus-within:border-primary transition-colors">
      <label className="flex justify-between items-end mb-2">
        <div>
          <span className="block text-body-md font-body-md text-on-surface">{field.label}{field.unitLabel ? ` (${field.unitLabel})` : ''}</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
      </label>
      <input
        className="w-full h-touch-target-min bg-surface-container-low border-2 border-outline-variant rounded-lg px-4 text-body-lg font-body-lg focus:border-primary focus:ring-0 outline-none text-on-surface"
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </section>
  )
}
