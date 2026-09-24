import React, { useState } from 'react'
import { ModuleKey, moduleByKey, themeFor } from '../config/modules'
import { MODULE_FIELDS, FieldSpec } from '../config/moduleFields'
import store from '../lib/store'
import { Activity } from '../types'
import { ModuleArt, OptionArt, hasOptionArt } from './art'
import { stagger } from './ui'

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

function fieldDefault(f: FieldSpec) {
  return f.default ?? (f.type === 'number' || f.type === 'stepper' ? 0 : f.type === 'toggle' ? false : '')
}

const gradient = 'linear-gradient(120deg, var(--from), var(--to))'

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

  const t = themeFor(moduleKey)
  const themeVars = { '--from': t.from, '--to': t.to, '--tint': t.tint, '--ink': t.ink } as React.CSSProperties

  return (
    <div className="text-on-surface min-h-screen flex flex-col relative pb-32" style={themeVars}>
      <header className="sticky top-0 z-20 overflow-hidden text-white shadow-lg" style={{ background: gradient }}>
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
        <span className="absolute right-16 -bottom-12 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3 w-full px-margin-edge py-stack-md">
          <button onClick={onBack} aria-label="Go back" className="h-11 w-11 -ml-1 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[26px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0 anim-fade-up">
            <h1 className="text-headline-sm font-extrabold truncate">Add {mod.label}</h1>
            <p className="text-punjabi-subtext font-punjabi-subtext text-white/85">{mod.labelPa} ਸ਼ਾਮਲ ਕਰੋ</p>
          </div>
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center anim-float">
            <ModuleArt moduleKey={moduleKey} className="w-12 h-12" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg space-y-stack-lg">
        <section className="anim-fade-up" style={stagger(0)}>
          <div className="card p-5 border-2 focus-within:border-[var(--to)] transition-colors">
            <label className="flex justify-between items-end mb-2">
              <div>
                <span className="block text-body-md font-bold text-on-surface">Date</span>
                <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਮਿਤੀ</span>
              </div>
            </label>
            <div className="relative">
              <input
                className="w-full h-touch-target-min bg-[var(--tint)] border-2 border-[var(--tint)] rounded-2xl px-4 text-body-lg font-body-lg focus:border-[var(--to)] focus:ring-0 outline-none text-on-surface appearance-none"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink)]">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </div>
        </section>

        {fields.map((f, i) => (
          <div key={f.key} className="anim-fade-up" style={stagger(i + 1)}>
            <FieldBlock field={f} value={values[f.key]} onChange={val => setField(f.key, val)} />
          </div>
        ))}

        <section className="card anim-fade-up p-5 flex items-center justify-between" style={stagger(fields.length + 1)}>
          <div>
            <span className="block text-body-lg font-body-lg text-on-surface font-bold">Apply to all {plotCount} plots</span>
            <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">ਸਾਰੇ {plotCount} ਪਲਾਟਾਂ 'ਤੇ ਲਾਗੂ ਕਰੋ</span>
          </div>
          <Toggle on={applyAll} onClick={() => setApplyAll(a => !a)} />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-margin-edge bg-white/70 backdrop-blur-xl z-20 border-t border-white">
        <button
          onClick={() => onSave({ ...values, date }, applyAll)}
          className="shimmer w-full h-touch-target-min text-white rounded-2xl text-headline-sm font-extrabold flex items-center justify-center gap-3 active:scale-[0.97] transition-transform"
          style={{ background: gradient, boxShadow: `0 12px 24px -10px ${t.from}` }}
        >
          <span className="material-symbols-outlined">check_circle</span>
          Save Entry
        </button>
      </div>
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      aria-pressed={on}
      onClick={onClick}
      className="w-16 h-9 rounded-full relative p-1 flex items-center transition-colors shrink-0"
      style={{ background: on ? gradient : '#E4E2E1' }}
    >
      <div className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] flex items-center justify-center ${on ? 'translate-x-7' : ''}`}>
        {on && <span className="material-symbols-outlined text-[18px] text-[var(--ink)]">check</span>}
      </div>
    </button>
  )
}

function FieldBlock({ field, value, onChange }: { field: FieldSpec; value: any; onChange: (v: any) => void }) {
  if (field.type === 'chips') {
    return (
      <section>
        <div className="mb-stack-sm flex justify-between items-end">
          <h2 className="text-headline-sm font-extrabold text-on-surface">{field.label}</h2>
          <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-margin-edge px-margin-edge snap-x">
          {field.options!.map(opt => {
            const active = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`snap-start flex-shrink-0 h-touch-target-min px-6 rounded-2xl border-2 flex flex-col justify-center items-center active:scale-95 transition-all ${active ? 'border-transparent text-white shadow-lg anim-pop' : 'border-white bg-white/85 text-on-surface-variant shadow-sm'}`}
                style={active ? { background: gradient } : undefined}
              >
                <span className={`text-body-lg font-body-lg ${active ? 'font-extrabold' : ''}`}>{opt.label}</span>
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
          <h2 className="text-headline-sm font-extrabold text-on-surface">{field.label}</h2>
          <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field.options!.map(opt => {
            const active = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`min-h-[120px] rounded-3xl p-3 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden border-2 ${active ? 'border-[var(--to)] bg-[var(--tint)] shadow-lg anim-pop' : 'border-white bg-white/85 shadow-sm text-on-surface-variant'}`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full text-white flex items-center justify-center bg-[var(--from)]">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </span>
                )}
                {hasOptionArt(opt.value)
                  ? <OptionArt value={opt.value} className={`w-14 h-14 transition-all duration-300 ${active ? 'scale-110' : 'grayscale-[35%] opacity-90'}`} />
                  : <span className={`material-symbols-outlined text-[36px] ${active ? 'text-[var(--ink)]' : ''}`}>{opt.icon}</span>}
                <span className={`text-body-md font-body-md text-center leading-tight ${active ? 'font-extrabold text-[var(--ink)]' : ''}`}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (field.type === 'stepper') {
    return (
      <section className="card p-6 relative overflow-hidden">
        <span className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-60 bg-[var(--tint)]" />
        <div className="relative text-center mb-6">
          <h2 className="text-headline-sm font-extrabold text-on-surface">{field.label}{field.unitLabel ? ` (${field.unitLabel})` : ''}</h2>
          <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</p>
        </div>
        <div className="relative flex items-center justify-between bg-[var(--tint)] rounded-3xl p-2">
          <button onClick={() => onChange(Math.max(field.min ?? 0, Number(value) - 1))} className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[var(--ink)] active:scale-90 transition-transform shadow-sm">
            <span className="material-symbols-outlined text-[32px] font-bold">remove</span>
          </button>
          <div className="text-center w-24">
            <span key={value} className="inline-block text-[44px] font-extrabold leading-none text-[var(--ink)] anim-pop">{value}</span>
          </div>
          <button onClick={() => onChange(Number(value) + 1)} className="w-16 h-16 rounded-2xl text-white flex items-center justify-center active:scale-90 transition-transform shadow-md" style={{ background: gradient }}>
            <span className="material-symbols-outlined text-[32px] font-bold">add</span>
          </button>
        </div>
      </section>
    )
  }

  if (field.type === 'toggle') {
    return (
      <section className="card p-5 flex items-center justify-between">
        <div>
          <span className="block text-body-lg font-body-lg text-on-surface font-bold">{field.label}</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">{field.labelPa}</span>
        </div>
        <Toggle on={!!value} onClick={() => onChange(!value)} />
      </section>
    )
  }

  // text and number share a simple input layout
  return (
    <section className="card p-5 border-2 focus-within:border-[var(--to)] transition-colors">
      <label className="flex justify-between items-end mb-2">
        <div>
          <span className="block text-body-md font-bold text-on-surface">{field.label}{field.unitLabel ? ` (${field.unitLabel})` : ''}</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{field.labelPa}</span>
        </div>
      </label>
      <input
        className="w-full h-touch-target-min bg-[var(--tint)] border-2 border-[var(--tint)] rounded-2xl px-4 text-body-lg font-body-lg focus:border-[var(--to)] focus:ring-0 outline-none text-on-surface"
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
