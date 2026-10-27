import React, { useEffect, useMemo, useRef, useState } from 'react'
import store from '../lib/store'
import { prefillFromDiary, mergePrefill, buildExport, downloadCsv, farmerPlots } from '../lib/survey'
import {
  SURVEY_SECTIONS, Answers, Ctx, Question, Section, fieldAnswers, fieldView, isAnswered, isShown, issueOf, labelOf, makeCtx,
  sectionTally, surveyProgress, tally, unitOf, valueOf
} from '../config/fatSurvey'
import { Plot } from '../types'
import { stagger } from './ui'

const gradient = 'linear-gradient(120deg, var(--from), var(--to))'
const REVIEW = SURVEY_SECTIONS.length
const SHEET_ID = /^([A-L]\d{2}|RW-\d{3})$/

export default function SurveyScreen({ onBack }: { onBack: () => void }) {
  const farmer = store.getFarmers()[0]
  const plots = useMemo(() => farmerPlots(farmer), [farmer.id])
  const plotIds = plots.map(p => p.id)

  // Diary-derived values fill only the gaps; anything already answered wins.
  const [{ prefilled, answers: initial }] = useState(() => mergePrefill(prefillFromDiary(farmer), store.getSurvey(farmer.id)?.answers))
  const [answers, setAnswers] = useState<Answers>(initial)
  const [step, setStep] = useState(0)
  const [plotId, setPlotId] = useState(plotIds[0])
  const activeTab = useRef<HTMLButtonElement>(null)

  useEffect(() => { store.saveSurvey(farmer.id, answers) }, [answers])
  useEffect(() => {
    window.scrollTo(0, 0)
    activeTab.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [step, plotId])

  const ctx = useMemo(() => makeCtx(answers, plotIds), [answers])
  const { asked, done } = surveyProgress(answers, plotIds)
  const pct = asked ? Math.round((done / asked) * 100) : 0

  const section = SURVEY_SECTIONS[step]
  const perField = section?.scope === 'field'
  const fieldNo = plotIds.indexOf(plotId) + 1
  const tone = section?.tone ?? { from: '#0F766E', to: '#16A34A', tint: '#DCFCE7', ink: '#166534' }
  const themeVars = { '--from': tone.from, '--to': tone.to, '--tint': tone.tint, '--ink': tone.ink } as React.CSSProperties

  const setFarm = (id: string, v: any) => setAnswers(a => ({ ...a, [id]: v }))
  const setField = (id: string, v: any) =>
    setAnswers(a => ({ ...a, fields: { ...a.fields, [plotId]: { ...fieldAnswers(a, plotId), [id]: v } } }))

  return (
    <div className="text-on-surface min-h-screen flex flex-col relative pb-32" style={themeVars}>
      <header className="sticky top-0 z-20 overflow-hidden text-white shadow-lg" style={{ background: gradient }}>
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
        <div className="relative flex items-center gap-3 w-full px-margin-edge pt-stack-md">
          <button onClick={onBack} aria-label="Go back" className="h-11 w-11 -ml-1 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[26px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-sm font-extrabold truncate">CFT & Regen Survey</h1>
            <p className="text-punjabi-subtext font-punjabi-subtext text-white/85 truncate">
              {farmer.name}{perField ? ` · Field ${fieldNo}` : ''}
            </p>
          </div>
          <span className="text-right leading-tight">
            <span className="block text-headline-sm font-extrabold">{pct}%</span>
            <span className="block text-label-caps font-label-caps text-white/85">{done}/{asked}</span>
          </span>
        </div>
        <div className="relative mx-margin-edge mt-3 h-1.5 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <nav className="relative flex gap-2 overflow-x-auto hide-scrollbar px-margin-edge py-3">
          {[...SURVEY_SECTIONS, null].map((s, i) => {
            const active = i === step
            return (
              <button
                key={s?.key ?? 'review'}
                ref={active ? activeTab : undefined}
                onClick={() => setStep(i)}
                className={`shrink-0 h-9 px-3 rounded-full flex items-center gap-1.5 text-label-caps font-label-caps transition-colors ${active ? 'bg-white text-[var(--ink)] shadow' : 'bg-white/15 text-white border border-white/25'}`}
              >
                <span className="material-symbols-outlined text-[16px]">{s?.icon ?? 'task_alt'}</span>
                {s?.title ?? 'Review'}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 px-margin-edge py-stack-lg space-y-stack-md">
        {section ? (
          <>
            <div className="flex items-end justify-between gap-3 anim-fade-up">
              <h2 className="text-headline-md font-extrabold text-[var(--ink)]">{section.title}</h2>
              <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant text-right">{section.titlePa}</span>
            </div>
            {perField && <FieldSwitcher plots={plots} active={plotId} onPick={setPlotId} section={section} answers={answers} ctx={ctx} />}
            {section.intro && <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant anim-fade-up">{section.intro}</p>}
            <QuestionList
              key={perField ? `${section.key}:${plotId}` : section.key}
              questions={section.questions}
              view={perField ? fieldView(answers, plotId) : answers}
              values={perField ? fieldAnswers(answers, plotId) : answers}
              prefilled={perField ? prefilled.fields[plotId] || {} : prefilled}
              ctx={ctx}
              onChange={perField ? setField : setFarm}
            />
          </>
        ) : (
          <ReviewStep answers={answers} plotIds={plotIds} ctx={ctx} onJump={setStep} farmerId={farmer.id} />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-margin-edge bg-white/70 backdrop-blur-xl z-20 border-t border-white flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="h-touch-target-min px-5 rounded-2xl bg-white border-2 border-[var(--tint)] text-[var(--ink)] font-extrabold flex items-center gap-1 active:scale-[0.97] transition-transform">
            <span className="material-symbols-outlined">chevron_left</span>
            Back
          </button>
        )}
        <button
          onClick={() => (step < REVIEW ? setStep(step + 1) : onBack())}
          className="flex-1 h-touch-target-min text-white rounded-2xl text-headline-sm font-extrabold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          style={{ background: gradient, boxShadow: `0 12px 24px -10px ${tone.from}` }}
        >
          {step < REVIEW ? (<>Next <span className="material-symbols-outlined">chevron_right</span></>) : (<><span className="material-symbols-outlined">check_circle</span> Done</>)}
        </button>
      </div>
    </div>
  )
}

function FieldSwitcher({ plots, active, onPick, section, answers, ctx }: {
  plots: Plot[]
  active: string
  onPick: (id: string) => void
  section: Section
  answers: Answers
  ctx: Ctx
}) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-margin-edge px-margin-edge anim-fade-up">
      {plots.map((p, i) => {
        const on = p.id === active
        const t = tally(section.questions, fieldView(answers, p.id), ctx)
        const complete = t.asked > 0 && t.done === t.asked
        return (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className={`shrink-0 min-h-[52px] px-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${on ? 'border-transparent text-white shadow-md' : 'border-[var(--tint)] bg-white text-on-surface'}`}
            style={on ? { background: gradient } : undefined}
          >
            <span className="flex items-center gap-1 text-body-md font-extrabold">
              Field {i + 1}
              {complete && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
            </span>
            <span className={`block text-label-caps font-label-caps ${on ? 'text-white/85' : 'text-on-surface-variant'}`}>
              {p.acres} ac · {t.done}/{t.asked}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Renders the questions of one scope (farm, field, or a repeat entry). `view` merges the
// enclosing scopes so show/hide rules can refer to any earlier answer.
function QuestionList({ questions, view, values, prefilled, ctx, onChange, nested }: {
  questions: Question[]
  view: Answers
  values: Answers
  prefilled: Answers
  ctx: Ctx
  onChange: (id: string, v: any) => void
  nested?: boolean
}) {
  return (
    <>
      {questions.filter(q => isShown(q, view)).map((q, i) => {
        const card = q.type === 'group' ? (
          <GroupCard q={q} view={view} entries={values[q.id] || []} ctx={ctx} onChange={v => onChange(q.id, v)} nested={nested} />
        ) : (
          <QuestionCard
            q={q}
            view={view}
            ctx={ctx}
            fromDiary={isAnswered(prefilled[q.id]) && prefilled[q.id] === values[q.id]}
            onChange={v => onChange(q.id, v)}
            nested={nested}
          />
        )
        return nested ? <div key={q.id}>{card}</div> : <div key={q.id} className="anim-fade-up" style={stagger(i, 0.04)}>{card}</div>
      })}
    </>
  )
}

function GroupCard({ q, view, entries, ctx, onChange, nested }: {
  q: Question
  view: Answers
  entries: Answers[]
  ctx: Ctx
  onChange: (entries: Answers[]) => void
  nested?: boolean
}) {
  const item = q.item!
  const Item = item[0].toUpperCase() + item.slice(1)
  const update = (i: number, id: string, v: any) => onChange(entries.map((e, j) => (j === i ? { ...e, [id]: v } : e)))
  const remove = (i: number) => {
    const filled = Object.keys(entries[i]).some(k => k !== '_diary' && isAnswered(entries[i][k]))
    if (!filled || window.confirm(`Remove ${item} ${i + 1}?`)) onChange(entries.filter((_, j) => j !== i))
  }

  return (
    <section className={nested ? 'space-y-3' : 'card p-5 space-y-3'}>
      <QuestionHeader q={q} view={view} />
      {entries.map((e, i) => (
        <div key={i} className="rounded-2xl border-2 border-[var(--tint)] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-body-md font-extrabold text-[var(--ink)]">{Item} {i + 1}</span>
            {e._diary && <Badge icon="menu_book" text="From diary" />}
            <button onClick={() => remove(i)} aria-label={`Remove ${item} ${i + 1}`} className="h-9 w-9 rounded-full bg-[var(--tint)] text-[var(--ink)] flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
          <QuestionList questions={q.questions!} view={{ ...view, ...e }} values={e} prefilled={{}} ctx={ctx} onChange={(id, v) => update(i, id, v)} nested />
        </div>
      ))}
      {!entries.length && (
        <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">
          {q.minEntries ? `Add at least one ${item}.` : `No ${item}s added. Leave empty if none.`}
        </p>
      )}
      <button
        onClick={() => onChange([...entries, {}])}
        className="w-full min-h-[48px] rounded-2xl border-2 border-dashed border-[var(--to)] text-[var(--ink)] font-extrabold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
      >
        <span className="material-symbols-outlined">add</span>
        Add {entries.length ? 'another' : 'a'} {item}
      </button>
    </section>
  )
}

function QuestionHeader({ q, view, badge }: { q: Question; view: Answers; badge?: React.ReactNode }) {
  const unit = unitOf(q, view)
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-2">
        <span className="block text-body-md font-bold text-on-surface">
          {SHEET_ID.test(q.id) && <span className="mr-1.5 text-label-caps font-label-caps text-[var(--ink)]">{q.id}</span>}
          {labelOf(q, view)}{unit ? ` (${unit})` : ''}
        </span>
        {badge}
      </div>
      {(q.help || q.optional) && (
        <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-0.5">
          {q.optional && q.type !== 'group' && <span className="font-bold">Optional. </span>}
          {q.help}
        </span>
      )}
    </div>
  )
}

function QuestionCard({ q, view, ctx, fromDiary, onChange, nested }: {
  q: Question
  view: Answers
  ctx: Ctx
  fromDiary: boolean
  onChange: (v: any) => void
  nested?: boolean
}) {
  const raw = view[q.id]
  const value = valueOf(q, view, ctx)
  const derived = q.type !== 'calc' && !isAnswered(raw) && isAnswered(value)
  const issue = issueOf(q, value, view)
  const shell = nested ? '' : 'card p-5'
  const badge = q.type === 'calc' ? <Badge icon="calculate" text="Calculated" />
    : fromDiary ? <Badge icon="menu_book" text="From diary" />
    : derived ? <Badge icon="auto_awesome" text="Suggested" />
    : null
  const header = <QuestionHeader q={q} view={view} badge={badge} />
  const warning = issue && (
    <p className="mt-2 flex items-start gap-1 text-punjabi-subtext font-bold text-amber-700">
      <span className="material-symbols-outlined text-[18px]">warning</span>
      {issue}
    </p>
  )

  if (q.type === 'calc') {
    return (
      <section className={nested ? 'rounded-2xl p-4' : 'card p-5'} style={{ background: 'var(--tint)' }}>
        {header}
        <div className="text-headline-sm font-extrabold text-[var(--ink)]">
          {value === null ? (
            <span className="text-body-md font-body-md text-on-surface-variant">Fill in the related questions to calculate</span>
          ) : typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 4 }) : value}
        </div>
      </section>
    )
  }

  if (q.type === 'choice' || q.type === 'multi') {
    const multi = q.type === 'multi'
    const picked: string[] = multi ? value || [] : []
    const compact = q.options!.every(o => o.length <= 12)
    const toggle = (opt: string) => {
      if (!multi) return onChange(value === opt ? '' : opt)
      if (picked.includes(opt)) return onChange(picked.filter(o => o !== opt))
      const exclusive = q.exclusive || []
      onChange(exclusive.includes(opt) ? [opt] : [...picked.filter(o => !exclusive.includes(o)), opt])
    }
    return (
      <section className={shell}>
        {header}
        <div className={compact ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
          {q.options!.map(opt => {
            const active = multi ? picked.includes(opt) : value === opt
            const icon = multi ? (active ? 'check_box' : 'check_box_outline_blank') : active ? 'radio_button_checked' : 'radio_button_unchecked'
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                aria-pressed={active}
                className={`min-h-[48px] px-4 py-2 rounded-2xl border-2 text-body-md transition-all active:scale-95 flex items-center gap-2 ${compact ? 'justify-center min-w-[64px]' : 'text-left'} ${active ? 'border-transparent text-white font-extrabold shadow-md' : 'border-[var(--tint)] bg-white text-on-surface-variant'}`}
                style={active ? { background: gradient } : undefined}
              >
                {(!compact || multi) && <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>}
                {opt}
              </button>
            )
          })}
        </div>
        {multi && picked.length > 0 && (
          <p className="mt-2 text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{picked.length} selected</p>
        )}
        {warning}
      </section>
    )
  }

  const numeric = q.type === 'number' || q.type === 'integer'
  const inputType = numeric ? 'number' : q.type === 'phone' ? 'tel' : q.type === 'date' || q.type === 'month' ? q.type : 'text'
  return (
    <section className={nested ? '' : 'card p-5 border-2 focus-within:border-[var(--to)] transition-colors'}>
      {header}
      <input
        className={`w-full h-touch-target-min bg-[var(--tint)] border-2 rounded-2xl px-4 text-body-lg font-body-lg focus:border-[var(--to)] focus:ring-0 outline-none text-on-surface ${issue ? 'border-amber-400' : 'border-[var(--tint)]'}`}
        type={inputType}
        inputMode={q.type === 'integer' ? 'numeric' : q.type === 'number' ? 'decimal' : q.type === 'phone' ? 'tel' : undefined}
        maxLength={q.type === 'phone' ? 10 : undefined}
        value={value ?? ''}
        min={q.min}
        max={q.max}
        step={q.type === 'integer' ? 1 : q.step ?? 'any'}
        onChange={e => onChange(numeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      />
      {warning}
    </section>
  )
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--tint)] text-[var(--ink)] text-label-caps font-label-caps">
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {text}
    </span>
  )
}

function ReviewStep({ answers, plotIds, ctx, onJump, farmerId }: { answers: Answers; plotIds: string[]; ctx: Ctx; onJump: (i: number) => void; farmerId: string }) {
  const rows = useMemo(() => SURVEY_SECTIONS.map(s => ({ s, ...sectionTally(s, answers, plotIds, ctx) })), [answers, ctx])

  function exportCsv() {
    const farmer = store.getFarmers().find(f => f.id === farmerId)!
    const { regen, crop, cft } = buildExport(farmer, answers, store.getSurvey(farmerId)?.createdAt)
    const slug = (answers.A03 || farmer.name).replace(/\s+/g, '_')
    downloadCsv(`RegenA5.1_${slug}.csv`, regen)
    downloadCsv(`CROP_Survey_${slug}.csv`, crop)
    downloadCsv(`CFT_RW_Questionnaire_${slug}.csv`, cft)
  }

  return (
    <>
      <div className="flex items-end justify-between anim-fade-up">
        <h2 className="text-headline-md font-extrabold text-[var(--ink)]">Review</h2>
        <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਸਮੀਖਿਆ</span>
      </div>
      <div className="card divide-y divide-stone-100 overflow-hidden anim-fade-up">
        {rows.map(({ s, asked, done, issues }, i) => {
          const complete = asked === 0 || done === asked
          return (
            <button key={s.key} onClick={() => onJump(i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-stone-50">
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.tone.tint, color: s.tone.ink }}>
                <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-body-md font-bold">{s.title}</span>
                <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">
                  {asked > 0 ? `${done}/${asked} answered` : s.questions.every(q => q.type === 'calc' || q.optional) ? 'Calculated' : 'Optional'}
                  {s.scope === 'field' ? ` · ${plotIds.length} fields` : ''}
                  {issues > 0 && <span className="text-amber-700 font-bold"> · {issues} to check</span>}
                </span>
              </span>
              <span className={`material-symbols-outlined ${issues ? 'text-amber-500' : complete ? 'text-emerald-600' : 'text-amber-500'}`}>
                {issues ? 'warning' : complete ? 'check_circle' : 'pending'}
              </span>
            </button>
          )
        })}
      </div>
      <button onClick={exportCsv} className="card w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform anim-fade-up">
        <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">download</span>
        </span>
        <span className="flex-1">
          <span className="block text-body-md font-bold">Export</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">Regen A5.1 + CROP Survey import sheets, and every questionnaire answer, as CSV</span>
        </span>
      </button>
      <p className="text-punjabi-subtext text-on-surface-variant text-center">Answers save automatically on this device.</p>
    </>
  )
}
