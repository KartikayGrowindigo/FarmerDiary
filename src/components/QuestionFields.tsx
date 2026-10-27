import React from 'react'
import { Answers, Ctx, Question, isAnswered, isShown, issueOf, labelOf, unitOf, valueOf } from '../config/fatSurvey'
import { OptionArt, hasOptionArt } from './art'
import { stagger } from './ui'

// Question cards shared by the survey and the diary's activity forms. They read the screen's
// --from / --to / --tint / --ink colour variables.

const gradient = 'linear-gradient(120deg, var(--from), var(--to))'
const SHEET_ID = /^([A-L]\d{2}|RW-\d{3})$/

// Renders the questions of one scope (farm, field, or a repeat entry). `view` merges the
// enclosing scopes so show/hide rules can refer to any earlier answer.
export function QuestionList({ questions, view, values, prefilled, ctx, onChange, nested }: {
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
        <div className={compact ? 'flex flex-wrap gap-2' : q.options!.length > 8 ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
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
                {hasOptionArt(opt) ? (
                  <span className="w-9 h-9 -ml-1.5 rounded-xl bg-white/90 flex items-center justify-center shrink-0">
                    <OptionArt value={opt} className="w-7 h-7" />
                  </span>
                ) : (!compact || multi) && <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>}
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

export function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--tint)] text-[var(--ink)] text-label-caps font-label-caps">
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {text}
    </span>
  )
}
