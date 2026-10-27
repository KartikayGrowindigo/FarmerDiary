import React, { useState } from 'react'
import { ModuleKey, moduleByKey, themeFor } from '../config/modules'
import { MODULE_FORMS } from '../config/moduleFields'
import { Answers, Ctx, effectiveAnswers, tally } from '../config/fatSurvey'
import store from '../lib/store'
import { cftPayload } from '../lib/diary'
import { ModuleArt } from './art'
import { QuestionList } from './QuestionFields'
import { stagger } from './ui'

const gradient = 'linear-gradient(120deg, var(--from), var(--to))'
const NO_FIELDS: Ctx = { fields: [] }

// Set-up answers (pump, sprayer, tillage…) from the farmer's latest entry of this activity.
function carriedAnswers(moduleKey: ModuleKey, ids: string[] = []): Answers {
  if (!ids.length) return {}
  const farmerId = store.getFarmers()[0].id
  const last = store.getPlots()
    .filter(p => p.farmerId === farmerId)
    .flatMap(p => store.getCropCyclesForPlot(p.id).flatMap(c => store.getActivitiesForCropCycle(c.id)))
    .filter(a => a.module === moduleKey)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  if (!last) return {}
  const p = cftPayload(last)
  return Object.fromEntries(ids.filter(id => p[id] !== undefined).map(id => [id, p[id]]))
}

export default function ActivityForm({
  moduleKey,
  plotId,
  plotCount,
  onSave,
  onBack
}: {
  moduleKey: ModuleKey
  plotId: string | null
  plotCount: number
  onSave: (payload: Record<string, any>, applyAll: boolean, notes: string) => void
  onBack: () => void
}) {
  const mod = moduleByKey(moduleKey)!
  const form = MODULE_FORMS[moduleKey]
  const plot = plotId ? store.getPlotById(plotId) : null
  const cycle = store.getCurrentCropCycle(plotId ?? store.getPlots()[0].id)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [carried] = useState(() => carriedAnswers(moduleKey, form.carry))
  const [values, setValues] = useState<Answers>(() => ({ ...form.initial, ...carried }))
  const [applyAll, setApplyAll] = useState(false)

  // Saved to several plots: leave out area answers so each plot uses its own area.
  const severalPlots = applyAll || !plot
  const questions = severalPlots ? form.questions.filter(q => !form.areaIds?.includes(q.id)) : form.questions
  // Plot context the CFT rules and defaults refer to (area, crop, season dates).
  const view: Answers = { B02: cycle?.crop, B04: severalPlots ? undefined : plot!.acres, B07: cycle?.sowingDate, B08: cycle?.harvestDate, ...values }
  const { asked, done, issues } = tally(questions, view, NO_FIELDS)

  const setField = (id: string, v: any) => setValues(prev => ({ ...prev, [id]: v }))
  function save() {
    const payload = { ...effectiveAnswers(questions, view, NO_FIELDS), cft: 1, date }
    onSave(payload, applyAll, form.summary(payload))
  }

  const t = themeFor(moduleKey)
  const themeVars = { '--from': t.from, '--to': t.to, '--tint': t.tint, '--ink': t.ink } as React.CSSProperties

  return (
    <div className="text-on-surface min-h-screen flex flex-col relative pb-36" style={themeVars}>
      <header className="sticky top-0 z-20 overflow-hidden text-white shadow-lg" style={{ background: gradient }}>
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
        <span className="absolute right-16 -bottom-12 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3 w-full px-margin-edge py-stack-md">
          <button onClick={onBack} aria-label="Go back" className="h-11 w-11 -ml-1 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[26px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0 anim-fade-up">
            <h1 className="text-headline-sm font-extrabold truncate">Add {mod.label}</h1>
            <p className="text-punjabi-subtext font-punjabi-subtext text-white/85 truncate">
              {mod.labelPa} ਸ਼ਾਮਲ ਕਰੋ{plot ? ` · Plot #${plot.id.slice(0, 3).toUpperCase()}` : ''}
            </p>
          </div>
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/90 shadow-lg flex items-center justify-center anim-float">
            <ModuleArt moduleKey={moduleKey} className="w-12 h-12" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg space-y-stack-md">
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
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink)]">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </div>
        </section>

        <QuestionList questions={questions} view={view} values={values} prefilled={carried} ctx={NO_FIELDS} onChange={setField} />

        {plot ? (
          <section className="card anim-fade-up p-5 flex items-center justify-between gap-3">
            <div>
              <span className="block text-body-lg font-body-lg text-on-surface font-bold">Apply to all {plotCount} plots</span>
              <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-1">ਸਾਰੇ {plotCount} ਪਲਾਟਾਂ 'ਤੇ ਲਾਗੂ ਕਰੋ</span>
            </div>
            <Toggle on={applyAll} onClick={() => setApplyAll(a => !a)} />
          </section>
        ) : (
          <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant text-center anim-fade-up">
            Saved to all {plotCount} plots · ਸਾਰੇ ਪਲਾਟਾਂ ਲਈ
          </p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-margin-edge bg-white/70 backdrop-blur-xl z-20 border-t border-white">
        {(asked > done || issues > 0) && (
          <p className="mb-2 text-center text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">
            {asked > done && `${asked - done} question${asked - done === 1 ? '' : 's'} left`}
            {asked > done && issues > 0 && ' · '}
            {issues > 0 && <span className="text-amber-700 font-bold">{issues} to check</span>}
            {' · you can still save'}
          </p>
        )}
        <button
          onClick={save}
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
