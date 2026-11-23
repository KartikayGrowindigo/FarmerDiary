import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import store from '../../lib/store'
import { useAuth } from '../../lib/auth'
import { syncNow, useSyncStatus } from '../../lib/sync'
import { SECTION_BY_ID, pathwayLabel, sectionsFor } from '../../config/cfp/schema'
import { AssessmentReport, Path, checkAssessment, rootCtx, setAt } from '../../lib/assessment/engine'
import { STATUS_LABEL, duplicateAssessment, editAssessment, softDelete, submitAssessment } from '../../lib/assessment/lifecycle'
import { getCalculationEngine } from '../../lib/assessment/calculation'
import { assessmentCsvRows, assessmentJson, download, fileSlug, toCsv } from '../../lib/assessment/export'
import { Assessment, Doc, Issue, SectionStatus } from '../../lib/assessment/types'
import { FieldList, fieldDomId } from './FieldInputs'
import { Button, Icon, Modal, ProgressBar, SECTION_STATUS_META, SectionStatusIcon, StatusPill, cx, inputClass } from './AssessmentUi'
import { DeleteDialog, DuplicateDialog } from './AssessmentDialogs'

// The assessment workspace: header, collapsible live summary, the current section's questions, and the
// section navigation on the right (a drawer on phones). Answers save automatically.

type View = 'overview' | 'results' | string // string = section id

const SAVE_DELAY = 600

export default function AssessmentScreen({ assessmentId, initialView, onBack, onOpen }: {
  assessmentId: string
  initialView?: View
  onBack: () => void
  onOpen: (id: string, view?: View) => void
}) {
  useSyncExternalStore(store.subscribe, store.getVersion)
  const { user } = useAuth()
  const saved = store.getAssessment(assessmentId)
  if (!saved || saved.deletedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-margin-edge">
        <div className="card p-6 max-w-md text-center space-y-3">
          <Icon name="search_off" className="text-[40px] text-on-surface-variant" />
          <h1 className="text-headline-sm font-extrabold">Assessment not found</h1>
          <p className="text-body-md text-on-surface-variant">It may have been deleted, or it hasn't downloaded to this device yet.</p>
          <Button kind="primary" onClick={onBack}>Back to assessments</Button>
        </div>
      </div>
    )
  }
  return <Workspace key={saved.id} saved={saved} userId={user?.id || undefined} initialView={initialView} onBack={onBack} onOpen={onOpen} />
}

function Workspace({ saved, userId, initialView, onBack, onOpen }: {
  saved: Assessment
  userId?: string
  initialView?: View
  onBack: () => void
  onOpen: (id: string, view?: View) => void
}) {
  const id = saved.id
  // Local copy of what is being edited; written to the store after a short pause and on navigation.
  const [inputs, setInputs] = useState<Doc>(saved.inputs)
  const [notes, setNotes] = useState<Record<string, string>>(saved.notes)
  const [dirty, setDirty] = useState(false)
  const [view, setView] = useState<View>(initialView ?? firstOpenSection(saved))
  // "Required" messages show after Validate/Submit, or for sections already visited and left.
  const [reveal, setReveal] = useState(false)
  const [visited, setVisited] = useState<Set<string>>(() => new Set())
  const [reportOpen, setReportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [dialog, setDialog] = useState<null | 'duplicate' | 'delete'>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const latest = useRef({ inputs, notes })
  latest.current = { inputs, notes }
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const sections = useMemo(() => sectionsFor(saved.pathway), [saved.pathway])
  const report = useMemo(() => checkAssessment(inputs, saved.pathway), [inputs, saved.pathway])
  const issuesByPath = useMemo(() => {
    const m = new Map<string, Issue[]>()
    for (const i of report.issues) {
      const k = i.path.join('.')
      m.set(k, [...(m.get(k) || []), i])
    }
    return m
  }, [report])

  // ---------- Saving ----------

  const commit = useCallback(() => {
    clearTimeout(timer.current)
    const current = store.getAssessment(id)
    if (!current) return
    const next = editAssessment(current, latest.current, userId)
    if (next !== current) store.saveAssessment(next)
    setDirty(false)
  }, [id, userId])

  useEffect(() => {
    if (!dirty) return
    clearTimeout(timer.current)
    timer.current = setTimeout(commit, SAVE_DELAY)
  }, [inputs, notes, dirty, commit])

  // Save on leaving: unmount, tab hidden, page closing.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') commit() }
    window.addEventListener('pagehide', commit)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', commit)
      document.removeEventListener('visibilitychange', onHide)
      commit()
    }
  }, [commit])

  const onSet = useCallback((path: Path, value: any) => {
    setInputs(doc => setAt(doc, path, value))
    setDirty(true)
  }, [])
  const setNote = (sectionId: string, text: string) => {
    setNotes(n => {
      const next = { ...n }
      if (text.trim() === '' && !text) delete next[sectionId]
      else next[sectionId] = text
      return next
    })
    setDirty(true)
  }

  const go = (v: View, focusPath?: Path) => {
    commit()
    if (v !== view && SECTION_BY_ID[view]) setVisited(s => new Set(s).add(view))
    setView(v)
    setDrawerOpen(false)
    if (focusPath) {
      setTimeout(() => {
        const el = document.getElementById(fieldDomId(focusPath)) || document.getElementById(`${fieldDomId(focusPath)}-unit`)
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        el?.focus({ preventScroll: true })
      }, 60)
    } else window.scrollTo({ top: 0 })
  }

  const current = store.getAssessment(id) ?? saved
  const farmer = store.getFarmers().find(f => f.id === current.farmerId)

  const submit = () => {
    commit()
    const fresh = store.getAssessment(id)!
    const result = submitAssessment(fresh, userId)
    if (!result.ok) {
      setReveal(true)
      setReportOpen(true)
      return
    }
    store.saveAssessment(result.assessment, result.submission)
    setFlash(`Submitted (revision ${result.submission.revision}). ${getCalculationEngine() ? '' : 'Results will be available once the calculation methodology is integrated.'}`)
    go('overview')
  }

  const sectionIndex = sections.findIndex(s => s.id === view)
  const section = sectionIndex >= 0 ? sections[sectionIndex] : null

  return (
    <div className="min-h-screen min-h-dvh text-on-surface pb-[calc(6rem_+_env(safe-area-inset-bottom))] lg:pb-12">
      <Header
        a={current}
        farmerName={farmer?.name}
        dirty={dirty}
        onBack={() => { commit(); onBack() }}
        onValidate={() => { commit(); setReveal(true); setReportOpen(true) }}
        onSubmit={submit}
        canSubmit={report.canSubmit}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {flash && (
          <div role="status" className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 flex items-start gap-2">
            <Icon name="check_circle" className="text-emerald-700" />
            <span className="flex-1 text-body-md">{flash}</span>
            <button type="button" onClick={() => setFlash(null)} aria-label="Dismiss" className="w-8 h-8 rounded-full hover:bg-emerald-100 flex items-center justify-center"><Icon name="close" className="text-[18px]" /></button>
          </div>
        )}
        <LiveSummary open={summaryOpen} onToggle={() => setSummaryOpen(o => !o)} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <main className="min-w-0">
          {view === 'overview' && (
            <Overview
              a={current}
              farmerName={farmer?.name}
              report={report}
              onOpen={go}
              onDuplicate={() => setDialog('duplicate')}
              onDelete={() => setDialog('delete')}
              onExport={kind => exportOne(current, farmer, kind)}
              onReport={() => { setReveal(true); setReportOpen(true) }}
            />
          )}
          {view === 'results' && <Results a={current} />}
          {section && (
            <section aria-labelledby="section-title" className="card p-5 sm:p-7">
              <div className="flex items-start gap-3 mb-1">
                <span className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0"><Icon name={section.icon} /></span>
                <div className="flex-1 min-w-0">
                  <span className="block text-label-caps font-label-caps text-emerald-700 uppercase">{section.group} · {sectionIndex + 1} of {sections.length}</span>
                  <h2 id="section-title" className="text-headline-md font-extrabold leading-tight">{section.title}</h2>
                </div>
                <span className={cx('shrink-0 px-2.5 py-1 rounded-full text-label-caps font-label-caps', report.sections[sectionIndex].required ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600')}>
                  {report.sections[sectionIndex].required ? 'Required section' : 'Optional section'}
                </span>
              </div>
              <SectionState status={report.sections[sectionIndex].status} issues={report.sections[sectionIndex].issues} reveal={reveal || visited.has(section.id)} />
              {section.intro && <p className="mt-3 mb-5 text-body-md text-on-surface-variant bg-stone-50 rounded-2xl p-3.5">{section.intro}</p>}
              <FieldList
                fields={section.fields}
                ctx={rootCtx(current.pathway, inputs)}
                base={[]}
                scope={inputs}
                onSet={onSet}
                issues={issuesByPath}
                reveal={reveal || visited.has(section.id)}
                prefill={current.prefill}
              />
              <div className="mt-8 pt-6 border-t border-stone-100">
                <label htmlFor={`notes-${section.id}`} className="block text-body-md font-bold mb-1">User Notes <span className="font-medium text-on-surface-variant">(Optional)</span></label>
                <p id={`notes-${section.id}-help`} className="text-punjabi-subtext text-on-surface-variant mb-2">Saved with this section only. Never required, and not used in calculations.</p>
                <textarea
                  id={`notes-${section.id}`}
                  aria-describedby={`notes-${section.id}-help`}
                  className={cx(inputClass, 'border-stone-200 py-3 min-h-[110px]')}
                  placeholder="Add any additional information, clarification or observations related to this section..."
                  value={notes[section.id] ?? ''}
                  onChange={e => setNote(section.id, e.target.value)}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-2 justify-between">
                <Button icon="chevron_left" onClick={() => go(sectionIndex > 0 ? sections[sectionIndex - 1].id : 'overview')}>
                  {sectionIndex > 0 ? sections[sectionIndex - 1].title : 'Overview'}
                </Button>
                {sectionIndex < sections.length - 1 ? (
                  <Button kind="primary" onClick={() => go(sections[sectionIndex + 1].id)}>
                    {sections[sectionIndex + 1].title} <Icon name="chevron_right" />
                  </Button>
                ) : (
                  <Button kind="primary" icon="fact_check" onClick={() => go('overview')}>Review & submit</Button>
                )}
              </div>
            </section>
          )}
        </main>

        <aside className="hidden lg:block sticky top-[104px]" aria-label="Assessment sections">
          <SectionNav a={current} report={report} view={view} onGo={go} />
        </aside>
      </div>

      {/* Phones and tablets: section list in a drawer, opened from the bottom bar. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] flex items-center gap-2">
        <Button icon="menu" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-label={`Sections, current: ${section ? section.title : view === 'results' ? 'Results' : 'Overview'}`} className="flex-1">
          <span className="truncate">{section ? section.title : view === 'results' ? 'Results' : 'Overview'}</span>
          {section && <SectionStatusIcon status={report.sections[sectionIndex].status} />}
        </Button>
        <Button kind="primary" icon="send" onClick={submit}>Submit</Button>
      </div>
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-900/40" onMouseDown={e => { if (e.target === e.currentTarget) setDrawerOpen(false) }}>
          <div role="dialog" aria-modal="true" aria-label="Assessment sections" className="absolute right-0 top-0 bottom-0 w-[min(340px,88vw)] bg-white shadow-2xl overflow-y-auto p-4 pt-[calc(1rem_+_env(safe-area-inset-top))]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-headline-sm font-extrabold">Sections</span>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close sections" className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center"><Icon name="close" /></button>
            </div>
            <SectionNav a={current} report={report} view={view} onGo={go} />
          </div>
        </div>
      )}

      {reportOpen && <ValidationReport report={report} onClose={() => setReportOpen(false)} onGo={(sid, path) => { setReportOpen(false); go(sid, path) }} onSubmit={report.canSubmit ? () => { setReportOpen(false); submit() } : undefined} />}
      {dialog === 'duplicate' && (
        <DuplicateDialog
          source={current}
          onClose={() => setDialog(null)}
          onConfirm={(name, year) => {
            commit()
            const copy = duplicateAssessment(store.getAssessment(id)!, { name, assessmentYear: year, userId, takenIds: new Set(store.getAssessments().map(a => a.displayId)) })
            store.saveAssessment(copy)
            setDialog(null)
            onOpen(copy.id, 'overview')
          }}
        />
      )}
      {dialog === 'delete' && (
        <DeleteDialog
          a={current}
          onClose={() => setDialog(null)}
          onConfirm={() => {
            commit()
            store.saveAssessment(softDelete(store.getAssessment(id)!, userId))
            setDialog(null)
            onBack()
          }}
        />
      )}
    </div>
  )
}

function firstOpenSection(a: Assessment): View {
  const s = sectionsFor(a.pathway).find(s => a.sectionStatus[s.id] !== 'complete' && (s.required === true || a.sectionStatus[s.id] === 'in_progress' || a.sectionStatus[s.id] === 'invalid'))
  return a.status === 'submitted' ? 'overview' : s?.id ?? 'overview'
}

export function exportOne(a: Assessment, farmer: ReturnType<typeof store.getFarmers>[number] | undefined, kind: 'json' | 'csv') {
  if (kind === 'json') download(`${fileSlug(a)}.json`, JSON.stringify(assessmentJson(a, farmer), null, 2), 'application/json')
  else download(`${fileSlug(a)}.csv`, toCsv(assessmentCsvRows([{ a, farmer }])), 'text/csv;charset=utf-8')
}

// ---------- Header ----------

function SaveState({ a, dirty }: { a: Assessment; dirty: boolean }) {
  const sync = useSyncStatus()
  const signedIn = !!store.account()
  const pending = store.isAssessmentPending(a.id)
  let state: { icon: string; text: string; tone: string; retry?: boolean; spin?: boolean }
  if (dirty) state = { icon: 'progress_activity', text: 'Saving…', tone: 'text-sky-700', spin: true }
  else if (!signedIn) state = { icon: 'save', text: 'Saved on this device', tone: 'text-emerald-700' }
  else if (!pending) state = { icon: 'cloud_done', text: 'All changes saved', tone: 'text-emerald-700' }
  else if (sync.state === 'error') state = { icon: 'error', text: `Save failed: ${sync.error}`, tone: 'text-rose-700', retry: true }
  else if (sync.state === 'offline') state = { icon: 'cloud_off', text: 'Saved on this device · uploads when back online', tone: 'text-amber-700' }
  else state = { icon: 'progress_activity', text: 'Saving…', tone: 'text-sky-700', spin: true }
  return (
    <span role="status" aria-live="polite" className={cx('inline-flex items-center gap-1 text-punjabi-subtext font-bold min-w-0', state.tone)}>
      <Icon name={state.icon} className={cx('text-[18px]', state.spin && 'animate-spin')} />
      <span className="truncate max-w-[60vw] sm:max-w-none">{state.text}</span>
      {state.retry && <button type="button" onClick={() => syncNow()} className="underline ml-1">Retry</button>}
    </span>
  )
}

function Header({ a, farmerName, dirty, onBack, onValidate, onSubmit, canSubmit }: {
  a: Assessment; farmerName?: string; dirty: boolean; onBack: () => void; onValidate: () => void; onSubmit: () => void; canSubmit: boolean
}) {
  const crop = a.inputs.cropDetails?.cropType
  const year = a.inputs.cropDetails?.assessmentYear
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200 pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to assessments" className="w-11 h-11 rounded-full hover:bg-stone-100 flex items-center justify-center shrink-0">
          <Icon name="arrow_back" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-headline-sm font-extrabold truncate max-w-full">{a.name}</h1>
            <StatusPill status={a.status} />
          </div>
          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-punjabi-subtext text-on-surface-variant">
            <span className="font-bold text-on-surface tracking-wide" title="Assessment ID">{a.displayId}</span>
            <span>{farmerName ?? a.farmerId}</span>
            <span>{pathwayLabel(a.pathway)}{crop ? ` · ${crop}` : ''}{year ? ` · ${year}` : ''}</span>
            <SaveState a={a} dirty={dirty} />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Button icon="fact_check" onClick={onValidate}>Validate</Button>
          <Button kind="primary" icon="send" onClick={onSubmit} title={canSubmit ? 'Submit assessment' : 'Shows what is missing'}>Submit assessment</Button>
        </div>
      </div>
    </header>
  )
}

function LiveSummary({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const configured = !!getCalculationEngine()
  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50">
        <Icon name="monitoring" className="text-emerald-700" />
        <span className="flex-1 font-extrabold">Live Summary</span>
        <span className="text-punjabi-subtext text-on-surface-variant">{configured ? 'Emissions and removals' : 'Calculation not configured'}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-body-md text-on-surface-variant">
          Results pending methodology integration. Emissions and removals per model will appear here once the calculation formulas are added; no figures are estimated in the meantime.
        </div>
      )}
    </div>
  )
}

// ---------- Right-side navigation ----------

function SectionNav({ a, report, view, onGo }: { a: Assessment; report: AssessmentReport; view: View; onGo: (v: View) => void }) {
  let lastGroup = ''
  const item = (key: View, content: React.ReactNode, active: boolean) => (
    <li key={key}>
      <button
        type="button"
        onClick={() => onGo(key)}
        aria-current={active ? 'page' : undefined}
        className={cx('w-full min-h-[44px] px-3 py-2 rounded-2xl flex items-center gap-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600', active ? 'bg-emerald-700 text-white shadow' : 'hover:bg-stone-100 text-on-surface')}
      >
        {content}
      </button>
    </li>
  )
  return (
    <nav className="card p-3 max-h-[calc(100dvh-120px)] overflow-y-auto">
      <div className="px-2 pb-3">
        <div className="flex items-center justify-between text-punjabi-subtext font-bold mb-1.5">
          <span>Completion</span><span>{report.progress}%</span>
        </div>
        <ProgressBar value={report.progress} />
      </div>
      <ul className="space-y-0.5">
        {item('overview', <><Icon name="dashboard" className="text-[20px]" /><span className="flex-1 font-bold">Overview</span></>, view === 'overview')}
        {report.sections.map(r => {
          const s = r.section
          const header = s.group !== lastGroup ? s.group : null
          lastGroup = s.group
          const active = view === s.id
          const count = r.issues.filter(i => i.kind !== 'warning').length
          return (
            <React.Fragment key={s.id}>
              {header && <li role="presentation" className="px-3 pt-3 pb-1 text-label-caps font-label-caps uppercase text-on-surface-variant">{header}</li>}
              {item(s.id, (
                <>
                  <span className="flex-1 min-w-0">
                    <span className="block text-body-md font-bold truncate">{s.title}</span>
                    {(r.required || count > 0) && (
                      <span className={cx('block text-[12px] leading-4', active ? 'text-white/85' : 'text-on-surface-variant')}>
                        {r.required ? 'Required' : 'Optional'}{count > 0 && (r.started || r.required) ? ` · ${count} to fix` : ''}
                      </span>
                    )}
                  </span>
                  <SectionStatusIcon status={r.status} className={active ? '!text-white' : ''} />
                </>
              ), active)}
            </React.Fragment>
          )
        })}
        <li role="presentation" className="pt-2" />
        {item('results', <><Icon name="bar_chart" className="text-[20px]" /><span className="flex-1 font-bold">Results</span></>, view === 'results')}
      </ul>
      <p className="px-3 pt-3 text-[12px] leading-4 text-on-surface-variant">{a.schemaVersion}</p>
    </nav>
  )
}

function SectionState({ status, issues, reveal }: { status: SectionStatus; issues: Issue[]; reveal: boolean }) {
  const blocking = issues.filter(i => i.kind !== 'warning' && (reveal || i.kind === 'invalid'))
  if (status === 'complete') return <p className="mt-2 inline-flex items-center gap-1 text-punjabi-subtext font-bold text-emerald-700"><Icon name="check_circle" className="text-[18px]" /> Complete</p>
  if (!blocking.length) return null
  return (
    <p className="mt-2 inline-flex items-center gap-1 text-punjabi-subtext font-bold text-amber-700">
      <Icon name={SECTION_STATUS_META[status].icon} className="text-[18px]" /> {blocking.length} {blocking.length === 1 ? 'answer needs' : 'answers need'} attention
    </p>
  )
}

// ---------- Overview, results, validation report ----------

function Overview({ a, farmerName, report, onOpen, onDuplicate, onDelete, onExport, onReport }: {
  a: Assessment; farmerName?: string; report: AssessmentReport; onOpen: (v: View) => void; onDuplicate: () => void; onDelete: () => void; onExport: (k: 'json' | 'csv') => void; onReport: () => void
}) {
  const next = report.sections.find(r => r.status !== 'complete' && (r.required || r.started))
  const prefilled = Object.entries(a.prefill)
  const meta: [string, React.ReactNode][] = [
    ['Assessment ID', <span className="font-extrabold tracking-wide">{a.displayId}</span>],
    ['Farmer', farmerName ?? a.farmerId],
    ['Pathway', pathwayLabel(a.pathway)],
    ['Crop', a.inputs.cropDetails?.cropType ?? '—'],
    ['Assessment year', a.inputs.cropDetails?.assessmentYear ?? '—'],
    ['Status', STATUS_LABEL[a.status]],
    ['Created', new Date(a.createdAt).toLocaleString()],
    ['Last updated', new Date(a.updatedAt).toLocaleString()],
    ['Submitted', a.submittedAt ? `${new Date(a.submittedAt).toLocaleString()} (revision ${a.revision})` : 'Not yet'],
    ['Questionnaire', a.schemaVersion]
  ]
  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-7">
        <div className="flex items-start gap-3 flex-wrap">
          <h2 className="flex-1 text-headline-md font-extrabold">Overview</h2>
          <div className="flex flex-wrap gap-2">
            <Button icon="content_copy" onClick={onDuplicate}>Duplicate</Button>
            <Button icon="delete" onClick={onDelete} className="!text-rose-700 hover:!border-rose-400">Delete assessment</Button>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {meta.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-stone-100 pb-2">
              <dt className="text-on-surface-variant text-body-md">{k}</dt>
              <dd className="text-body-md text-right min-w-0 break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <div className="flex justify-between text-body-md font-bold mb-1.5"><span>Completion</span><span>{report.progress}%</span></div>
          <ProgressBar value={report.progress} />
          <p className="mt-2 text-punjabi-subtext text-on-surface-variant">Counts required sections and any optional section you have started.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {next && <Button kind="primary" icon="edit" onClick={() => onOpen(next.section.id)}>Continue editing</Button>}
          {!next && <Button icon="edit" onClick={() => onOpen(report.sections[0].section.id)}>Edit answers</Button>}
          <Button icon="fact_check" onClick={onReport}>Validation report</Button>
          <Button icon="data_object" onClick={() => onExport('json')}>Export JSON</Button>
          <Button icon="table_view" onClick={() => onExport('csv')}>Export CSV</Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-headline-sm font-extrabold">Sections</h3>
          <span className={cx('text-punjabi-subtext font-bold', report.canSubmit ? 'text-emerald-700' : 'text-amber-700')}>
            {report.canSubmit ? 'Ready to submit' : `${report.blocking.length} answer${report.blocking.length === 1 ? '' : 's'} to complete or fix`}
          </span>
        </div>
        <ul className="divide-y divide-stone-100">
          {report.sections.map(r => {
            const n = r.issues.filter(i => i.kind !== 'warning').length
            const warn = r.issues.filter(i => i.kind === 'warning').length
            return (
              <li key={r.section.id}>
                <button type="button" onClick={() => onOpen(r.section.id)} className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-stone-50">
                  <SectionStatusIcon status={r.status} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-body-md font-bold">{r.section.title}</span>
                    <span className="block text-punjabi-subtext text-on-surface-variant">
                      {SECTION_STATUS_META[r.status].label}{r.required ? ' · required' : ' · optional'}
                      {n > 0 && (r.started || r.required) ? ` · ${n} to complete` : ''}{warn ? ` · ${warn} warning${warn === 1 ? '' : 's'}` : ''}
                      {a.notes[r.section.id]?.trim() ? ' · has notes' : ''}
                    </span>
                  </span>
                  <Icon name="chevron_right" className="text-on-surface-variant" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {prefilled.length > 0 && (
        <div className="card p-5">
          <h3 className="text-headline-sm font-extrabold mb-1">Prefilled from farmer data</h3>
          <p className="text-punjabi-subtext text-on-surface-variant mb-3">Copied when the assessment was created. Editing them here does not change the farmer's records.</p>
          <ul className="space-y-1.5">
            {prefilled.map(([path, p]) => (
              <li key={path} className="text-body-md flex flex-wrap gap-x-2">
                <span className="font-bold">{labelForPath(path)}</span>
                <span className="text-on-surface-variant">— {p.source}{p.detail ? ` (${p.detail})` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function labelForPath(path: string) {
  for (const s of Object.values(SECTION_BY_ID)) for (const f of s.fields) if (f.key === path) return `${s.title}: ${f.label}`
  return path
}

function Results({ a }: { a: Assessment }) {
  const submissions = store.getSubmissions(a.id)
  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-7">
        <h2 className="text-headline-md font-extrabold">Results</h2>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center">
          <Icon name="pending_actions" className="text-[40px] text-on-surface-variant" />
          <p className="mt-2 text-body-lg font-extrabold">Calculation not configured</p>
          <p className="mt-1 text-body-md text-on-surface-variant max-w-prose mx-auto">
            Results pending methodology integration. When the formulas are added, this page will show total emissions, removals and net balance in CO2e, by category and gas, per hectare and per tonne of product. No values are shown until then.
          </p>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="text-headline-sm font-extrabold mb-3">Submission history</h3>
        {submissions.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Not submitted yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {submissions.map(s => (
              <li key={s.id} className="py-2.5 flex justify-between gap-3 text-body-md">
                <span className="font-bold">Revision {s.revision}</span>
                <span className="text-on-surface-variant">{new Date(s.submittedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ValidationReport({ report, onClose, onGo, onSubmit }: { report: AssessmentReport; onClose: () => void; onGo: (sectionId: string, path: Path) => void; onSubmit?: () => void }) {
  const bySection = report.sections.filter(r => r.issues.length && (r.required || r.started || r.issues.some(i => i.kind !== 'warning')))
  return (
    <Modal
      title="Validation report"
      wide
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          {onSubmit && <Button kind="primary" icon="send" onClick={onSubmit}>Submit assessment</Button>}
        </>
      }
    >
      {report.canSubmit ? (
        <p className="flex items-center gap-2 text-body-md font-bold text-emerald-700 mb-3"><Icon name="check_circle" /> All required inputs are complete and valid. You can submit.</p>
      ) : (
        <p className="text-body-md text-on-surface-variant mb-3">
          {report.blocking.length} answer{report.blocking.length === 1 ? '' : 's'} must be completed or fixed before submitting. Optional sections you haven't started are not checked. Select an item to go to it.
        </p>
      )}
      <div className="space-y-4">
        {bySection.map(r => (
          <div key={r.section.id}>
            <h3 className="flex items-center gap-2 text-body-md font-extrabold mb-1.5"><SectionStatusIcon status={r.status} /> {r.section.title}</h3>
            <ul className="space-y-1">
              {r.issues.map((i, n) => (
                <li key={n}>
                  <button type="button" onClick={() => onGo(r.section.id, i.path)} className="w-full text-left rounded-xl px-3 py-2 hover:bg-stone-50 flex items-start gap-2">
                    <Icon name={i.kind === 'warning' ? 'warning' : i.kind === 'missing' ? 'radio_button_unchecked' : 'error'} className={cx('text-[18px] mt-0.5', i.kind === 'warning' ? 'text-amber-600' : 'text-rose-600')} />
                    <span className="flex-1">
                      <span className="font-bold">{describePath(i)}</span>
                      <span className="text-on-surface-variant"> — {i.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  )
}

function describePath(i: Issue) {
  const numbers = i.path.filter(p => typeof p === 'number') as number[]
  return numbers.length ? `${i.label} (#${numbers.map(n => n + 1).join(' › #')})` : i.label
}
