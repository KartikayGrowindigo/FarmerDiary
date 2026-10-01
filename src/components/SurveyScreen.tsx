import React, { useEffect, useMemo, useRef, useState } from 'react'
import store from '../lib/store'
import { prefillFromDiary, buildExport, downloadCsv } from '../lib/survey'
import { SURVEY_SECTIONS, SurveyQuestion, SurveyAnswers, SurveySection, isAsked, isAnswered, surveyProgress } from '../config/fatSurvey'
import { stagger } from './ui'

const gradient = 'linear-gradient(120deg, var(--from), var(--to))'
const REVIEW = SURVEY_SECTIONS.length

export default function SurveyScreen({ onBack }: { onBack: () => void }) {
  const farmer = store.getFarmers()[0]
  const saved = store.getSurvey(farmer.id)

  // Diary-derived values fill only the gaps; anything already answered wins.
  const [prefilled] = useState(() => {
    const p = prefillFromDiary(farmer)
    return Object.fromEntries(Object.entries(p).filter(([k]) => !isAnswered(saved?.answers[k])))
  })
  const [answers, setAnswers] = useState<SurveyAnswers>(() => ({ ...prefilled, ...saved?.answers }))
  const [step, setStep] = useState(0)
  const activeTab = useRef<HTMLButtonElement>(null)

  useEffect(() => { store.saveSurvey(farmer.id, answers) }, [answers])
  useEffect(() => {
    window.scrollTo(0, 0)
    activeTab.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [step])

  const setAnswer = (id: string, v: any) => setAnswers(a => ({ ...a, [id]: v }))
  const { asked, done } = surveyProgress(answers)
  const pct = asked ? Math.round((done / asked) * 100) : 0

  const section = SURVEY_SECTIONS[step]
  const tone = section?.tone ?? { from: '#0F766E', to: '#16A34A', tint: '#DCFCE7', ink: '#166534' }
  const themeVars = { '--from': tone.from, '--to': tone.to, '--tint': tone.tint, '--ink': tone.ink } as React.CSSProperties

  return (
    <div className="text-on-surface min-h-screen flex flex-col relative pb-32" style={themeVars}>
      <header className="sticky top-0 z-20 overflow-hidden text-white shadow-lg" style={{ background: gradient }}>
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15" />
        <div className="relative flex items-center gap-3 w-full px-margin-edge pt-stack-md">
          <button onClick={onBack} aria-label="Go back" className="h-11 w-11 -ml-1 shrink-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[26px]">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-headline-sm font-extrabold truncate">FAT Survey</h1>
            <p className="text-punjabi-subtext font-punjabi-subtext text-white/85 truncate">{farmer.name}</p>
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
          <SectionStep section={section} answers={answers} prefilled={prefilled} onChange={setAnswer} />
        ) : (
          <ReviewStep answers={answers} onJump={setStep} farmerId={farmer.id} />
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

function SectionStep({ section, answers, prefilled, onChange }: {
  section: SurveySection
  answers: SurveyAnswers
  prefilled: SurveyAnswers
  onChange: (id: string, v: any) => void
}) {
  const applies = !section.appliesIf || section.appliesIf(answers)
  return (
    <>
      <div className="flex items-end justify-between anim-fade-up">
        <h2 className="text-headline-md font-extrabold text-[var(--ink)]">{section.title}</h2>
        <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{section.titlePa}</span>
      </div>
      {!applies ? (
        <div className="card p-6 text-center text-on-surface-variant flex flex-col items-center gap-2 anim-fade-up">
          <span className="material-symbols-outlined text-[40px] text-[var(--ink)]">block</span>
          {section.naNote}
        </div>
      ) : (
        section.questions.filter(q => isAsked(section, q, answers)).map((q, i) => (
          <div key={q.id} className="anim-fade-up" style={stagger(i, 0.04)}>
            <QuestionCard
              q={q}
              answers={answers}
              fromDiary={isAnswered(prefilled[q.id]) && prefilled[q.id] === answers[q.id]}
              onChange={v => onChange(q.id, v)}
            />
          </div>
        ))
      )}
    </>
  )
}

function QuestionCard({ q, answers, fromDiary, onChange }: { q: SurveyQuestion; answers: SurveyAnswers; fromDiary: boolean; onChange: (v: any) => void }) {
  const value = answers[q.id]
  const header = (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-2">
        <span className="block text-body-md font-bold text-on-surface">{q.label}{q.unit ? ` (${q.unit})` : ''}</span>
        {fromDiary && <Badge icon="menu_book" text="From diary" />}
        {q.type === 'calc' && <Badge icon="calculate" text="Calculated" />}
      </div>
      {q.help && <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant mt-0.5">{q.help}</span>}
    </div>
  )

  if (q.type === 'calc') {
    const v = q.calc!(answers)
    return (
      <section className="card p-5" style={{ background: 'var(--tint)' }}>
        {header}
        <div className="text-headline-sm font-extrabold text-[var(--ink)]">
          {v === null ? <span className="text-body-md font-body-md text-on-surface-variant">Fill in the inputs above to calculate</span> : v.toLocaleString('en-IN', { maximumFractionDigits: 4 })}
        </div>
      </section>
    )
  }

  if (q.type === 'choice') {
    const compact = q.options!.every(o => o.length <= 12)
    return (
      <section className="card p-5">
        {header}
        <div className={compact ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
          {q.options!.map(opt => {
            const active = value === opt
            return (
              <button
                key={opt}
                onClick={() => onChange(active ? '' : opt)}
                className={`min-h-[48px] px-4 rounded-2xl border-2 text-body-md transition-all active:scale-95 flex items-center gap-2 ${compact ? 'justify-center min-w-[64px]' : 'text-left'} ${active ? 'border-transparent text-white font-extrabold shadow-md' : 'border-[var(--tint)] bg-white text-on-surface-variant'}`}
                style={active ? { background: gradient } : undefined}
              >
                {!compact && <span className="material-symbols-outlined text-[20px]">{active ? 'radio_button_checked' : 'radio_button_unchecked'}</span>}
                {opt}
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="card p-5 border-2 focus-within:border-[var(--to)] transition-colors">
      {header}
      <input
        className="w-full h-touch-target-min bg-[var(--tint)] border-2 border-[var(--tint)] rounded-2xl px-4 text-body-lg font-body-lg focus:border-[var(--to)] focus:ring-0 outline-none text-on-surface"
        type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}
        inputMode={q.type === 'number' ? 'decimal' : undefined}
        value={value ?? ''}
        min={q.min}
        max={q.max}
        step={q.step ?? 'any'}
        onChange={e => onChange(q.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
      />
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

function ReviewStep({ answers, onJump, farmerId }: { answers: SurveyAnswers; onJump: (i: number) => void; farmerId: string }) {
  const rows = useMemo(() => SURVEY_SECTIONS.map(s => {
    const qs = s.questions.filter(q => q.type !== 'calc' && isAsked(s, q, answers))
    return { s, asked: qs.length, done: qs.filter(q => isAnswered(answers[q.id])).length }
  }), [answers])

  function exportCsv() {
    const farmer = store.getFarmers().find(f => f.id === farmerId)!
    const { regen, crop } = buildExport(farmer, answers, store.getSurvey(farmerId)?.createdAt)
    const slug = (answers.farmerName || farmer.name).replace(/\s+/g, '_')
    downloadCsv(`RegenA5.1_${slug}.csv`, regen)
    downloadCsv(`CROP_Survey_${slug}.csv`, crop)
  }

  return (
    <>
      <div className="flex items-end justify-between anim-fade-up">
        <h2 className="text-headline-md font-extrabold text-[var(--ink)]">Review</h2>
        <span className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਸਮੀਖਿਆ</span>
      </div>
      <div className="card divide-y divide-stone-100 overflow-hidden anim-fade-up">
        {rows.map(({ s, asked, done }, i) => {
          const complete = asked === 0 || done === asked
          return (
            <button key={s.key} onClick={() => onJump(i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-stone-50">
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.tone.tint, color: s.tone.ink }}>
                <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-body-md font-bold">{s.title}</span>
                <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">{asked === 0 ? 'Not applicable' : `${done}/${asked} answered`}</span>
              </span>
              <span className={`material-symbols-outlined ${complete ? 'text-emerald-600' : 'text-amber-500'}`}>{complete ? 'check_circle' : 'pending'}</span>
            </button>
          )
        })}
      </div>
      <button onClick={exportCsv} className="card w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform anim-fade-up">
        <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">download</span>
        </span>
        <span className="flex-1">
          <span className="block text-body-md font-bold">Export for import</span>
          <span className="block text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">Regen A5.1 + CROP Survey sheets as CSV</span>
        </span>
      </button>
      <p className="text-punjabi-subtext text-on-surface-variant text-center">Answers save automatically on this device.</p>
    </>
  )
}
