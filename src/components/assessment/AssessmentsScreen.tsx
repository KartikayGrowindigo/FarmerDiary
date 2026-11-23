import React, { useMemo, useState, useSyncExternalStore } from 'react'
import store from '../../lib/store'
import { useAuth } from '../../lib/auth'
import { assessmentTablesMissing, ASSESSMENT_SETUP_HINT } from '../../lib/sync'
import { PATHWAYS, pathwayLabel } from '../../config/cfp/schema'
import { STATUS_LABEL, duplicateAssessment, restore, softDelete } from '../../lib/assessment/lifecycle'
import { assessmentCsvRows, download, toCsv } from '../../lib/assessment/export'
import { Assessment, AssessmentStatus, Pathway } from '../../lib/assessment/types'
import { Button, Icon, ProgressBar, StatusPill, cx, inputClass } from './AssessmentUi'
import { CreateAssessmentDialog, DeleteDialog, DuplicateDialog } from './AssessmentDialogs'

type Sort = 'updated' | 'created' | 'name' | 'year' | 'progress'
const PREF_KEY = 'kheti:assessments:view'

function loadView(): 'list' | 'cards' {
  try { return localStorage.getItem(PREF_KEY) === 'cards' ? 'cards' : 'list' } catch { return 'list' }
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export default function AssessmentsScreen({ onOpen }: { onOpen: (id: string, view?: 'overview') => void }) {
  useSyncExternalStore(store.subscribe, store.getVersion)
  const { user } = useAuth()
  const userId = user?.id || undefined
  const farmers = store.getFarmers()
  const farmerName = (id: string) => farmers.find(f => f.id === id)?.name ?? id

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | AssessmentStatus>('')
  const [pathway, setPathway] = useState<'' | Pathway>('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState<Sort>('updated')
  const [showDeleted, setShowDeleted] = useState(false)
  const [view, setView] = useState<'list' | 'cards'>(loadView)
  const [creating, setCreating] = useState(false)
  const [dup, setDup] = useState<Assessment | null>(null)
  const [del, setDel] = useState<Assessment | null>(null)

  const all = store.getAssessments()
  const years = [...new Set(all.map(a => a.inputs.cropDetails?.assessmentYear).filter(Boolean))].sort((a, b) => b - a)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = all.filter(a =>
      (showDeleted ? !!a.deletedAt : !a.deletedAt) &&
      (!status || a.status === status) &&
      (!pathway || a.pathway === pathway) &&
      (!year || String(a.inputs.cropDetails?.assessmentYear) === year) &&
      (!q || [a.name, a.displayId, farmerName(a.farmerId), a.inputs.cropDetails?.cropType, a.inputs.farm?.name].some(v => String(v ?? '').toLowerCase().includes(q)))
    )
    const by: Record<Sort, (a: Assessment, b: Assessment) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      created: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name),
      year: (a, b) => (b.inputs.cropDetails?.assessmentYear ?? 0) - (a.inputs.cropDetails?.assessmentYear ?? 0),
      progress: (a, b) => b.progress - a.progress
    }
    return rows.sort(by[sort])
  }, [all, query, status, pathway, year, sort, showDeleted])

  const setViewPref = (v: 'list' | 'cards') => {
    setView(v)
    try { localStorage.setItem(PREF_KEY, v) } catch {}
  }
  const exportList = () => {
    const rows = assessmentCsvRows(list.map(a => ({ a, farmer: farmers.find(f => f.id === a.farmerId) })))
    download(`assessments_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows), 'text/csv;charset=utf-8')
  }
  const filtered = !!(query || status || pathway || year)
  const missingTables = assessmentTablesMissing()

  return (
    <div className="min-h-screen min-h-dvh text-on-surface pb-[calc(8rem_+_env(safe-area-inset-bottom))]">
      <header className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 text-white pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <span className="text-label-caps font-label-caps text-white/80 tracking-widest">ADMIN · COOL FARM PLATFORM</span>
            <h1 className="text-headline-lg font-extrabold">Assessments</h1>
            <p className="text-body-md text-white/85">Crop greenhouse-gas assessments, structured like the Cool Farm Platform.</p>
          </div>
          <Button kind="secondary" icon="add" onClick={() => setCreating(true)} className="!border-white">Create New Assessment</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 space-y-4">
        {missingTables && (
          <div role="alert" className="card p-4 border-2 border-amber-300 flex gap-2 text-amber-900">
            <Icon name="database" /> <span className="text-body-md">{ASSESSMENT_SETUP_HINT} Until then assessments stay on this device.</span>
          </div>
        )}
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input aria-label="Search assessments" className={cx(inputClass, 'border-stone-200 pl-10')} placeholder="Search name, ID, farmer, crop…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div role="group" aria-label="Layout" className="flex rounded-2xl border-2 border-stone-200 overflow-hidden">
              {(['list', 'cards'] as const).map(v => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setViewPref(v)} className={cx('h-11 px-3 inline-flex items-center gap-1 font-bold', view === v ? 'bg-emerald-700 text-white' : 'text-on-surface-variant hover:bg-stone-50')}>
                  <Icon name={v === 'list' ? 'view_list' : 'grid_view'} className="text-[20px]" />
                  <span className="sr-only sm:not-sr-only">{v === 'list' ? 'List' : 'Cards'}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select aria-label="Filter by status" className={cx(inputClass, 'border-stone-200')} value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABEL) as AssessmentStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <select aria-label="Filter by pathway" className={cx(inputClass, 'border-stone-200')} value={pathway} onChange={e => setPathway(e.target.value as any)}>
              <option value="">All pathways</option>
              {PATHWAYS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select aria-label="Filter by assessment year" className={cx(inputClass, 'border-stone-200')} value={year} onChange={e => setYear(e.target.value)}>
              <option value="">All years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select aria-label="Sort by" className={cx(inputClass, 'border-stone-200')} value={sort} onChange={e => setSort(e.target.value as Sort)}>
              <option value="updated">Last updated</option>
              <option value="created">Created date</option>
              <option value="name">Name</option>
              <option value="year">Assessment year</option>
              <option value="progress">Completion</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-body-md cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-emerald-700" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
              Show deleted
            </label>
            <span className="text-punjabi-subtext text-on-surface-variant">{list.length} assessment{list.length === 1 ? '' : 's'}</span>
            <Button kind="ghost" icon="download" onClick={exportList} disabled={!list.length}>Export CSV</Button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="card p-8 text-center flex flex-col items-center gap-3">
            <span className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center"><Icon name={filtered || showDeleted ? 'filter_alt_off' : 'assignment_add'} className="text-[34px]" /></span>
            <h2 className="text-headline-sm font-extrabold">{showDeleted ? 'No deleted assessments' : filtered ? 'No assessments match' : 'No assessments yet'}</h2>
            <p className="text-body-md text-on-surface-variant max-w-md">
              {showDeleted ? 'Deleted assessments appear here and can be restored.' : filtered ? 'Try a different search or clear the filters.' : 'Create the first assessment to collect a farmer\'s crop data section by section, as in the Cool Farm Platform.'}
            </p>
            {!filtered && !showDeleted && <Button kind="primary" icon="add" onClick={() => setCreating(true)}>Create New Assessment</Button>}
          </div>
        ) : view === 'list' ? (
          <div className="card overflow-hidden">
            <table className="w-full text-left hidden md:table">
              <thead className="bg-stone-50 text-label-caps font-label-caps uppercase text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 min-w-[180px]">Assessment</th>
                  <th scope="col" className="px-4 py-3">Farmer / farm</th>
                  <th scope="col" className="px-4 py-3">Crop · year</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 w-36">Completion</th>
                  <th scope="col" className="px-4 py-3">Dates</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {list.map(a => (
                  <tr key={a.id} className="align-top hover:bg-stone-50/70">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => onOpen(a.id, 'overview')} className="text-left font-extrabold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded" disabled={!!a.deletedAt}>{a.name}</button>
                      <span className="block text-punjabi-subtext text-on-surface-variant tracking-wide whitespace-nowrap">{a.displayId}</span>
                    </td>
                    <td className="px-4 py-3 text-body-md">
                      {farmerName(a.farmerId)}
                      <span className="block text-punjabi-subtext text-on-surface-variant">{a.inputs.farm?.name ?? '—'}{a.inputs.farm?.farmIdentifier ? ` · ${a.inputs.farm.farmIdentifier}` : ''}</span>
                    </td>
                    <td className="px-4 py-3 text-body-md">
                      {a.inputs.cropDetails?.cropType ?? '—'}
                      <span className="block text-punjabi-subtext text-on-surface-variant">{pathwayLabel(a.pathway)} · {a.inputs.cropDetails?.assessmentYear ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={a.status} deleted={!!a.deletedAt} /></td>
                    <td className="px-4 py-3"><span className="block text-punjabi-subtext font-bold mb-1">{a.progress}%</span><ProgressBar value={a.progress} /></td>
                    <td className="px-4 py-3 text-punjabi-subtext text-on-surface-variant whitespace-nowrap">Created {fmtDate(a.createdAt)}<br />Updated {fmtDate(a.updatedAt)}</td>
                    <td className="px-4 py-3"><Actions a={a} onOpen={onOpen} onDup={setDup} onDel={setDel} userId={userId} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="md:hidden divide-y divide-stone-100">
              {list.map(a => <li key={a.id} className="p-4"><CardBody a={a} farmer={farmerName(a.farmerId)} onOpen={onOpen} onDup={setDup} onDel={setDel} userId={userId} /></li>)}
            </ul>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(a => <li key={a.id} className="card p-4"><CardBody a={a} farmer={farmerName(a.farmerId)} onOpen={onOpen} onDup={setDup} onDel={setDel} userId={userId} /></li>)}
          </ul>
        )}
      </main>

      {creating && <CreateAssessmentDialog userId={userId} onClose={() => setCreating(false)} onCreated={a => { setCreating(false); onOpen(a.id) }} />}
      {dup && (
        <DuplicateDialog
          source={dup}
          onClose={() => setDup(null)}
          onConfirm={(name, y) => {
            const copy = duplicateAssessment(dup, { name, assessmentYear: y, userId, takenIds: new Set(all.map(a => a.displayId)) })
            store.saveAssessment(copy)
            setDup(null)
            onOpen(copy.id, 'overview')
          }}
        />
      )}
      {del && <DeleteDialog a={del} onClose={() => setDel(null)} onConfirm={() => { store.saveAssessment(softDelete(del, userId)); setDel(null) }} />}
    </div>
  )
}

type ActionProps = { a: Assessment; onOpen: (id: string, view?: 'overview') => void; onDup: (a: Assessment) => void; onDel: (a: Assessment) => void; userId?: string }

function Actions({ a, onOpen, onDup, onDel, userId }: ActionProps) {
  if (a.deletedAt) {
    return <div className="flex justify-end"><Button icon="restore_from_trash" onClick={() => store.saveAssessment(restore(a, userId))}>Restore</Button></div>
  }
  const btn = (icon: string, label: string, onClick: () => void, danger?: boolean) => (
    <button type="button" onClick={onClick} aria-label={`${label} ${a.name}`} title={label} className={cx('w-10 h-10 rounded-full inline-flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600', danger ? 'text-rose-700 hover:bg-rose-50' : 'text-on-surface-variant hover:bg-stone-100')}>
      <Icon name={icon} className="text-[20px]" />
    </button>
  )
  return (
    <div className="flex justify-end gap-0.5">
      {btn('visibility', 'View', () => onOpen(a.id, 'overview'))}
      {btn('edit', 'Edit', () => onOpen(a.id))}
      {btn('content_copy', 'Duplicate', () => onDup(a))}
      {btn('delete', 'Delete', () => onDel(a), true)}
    </div>
  )
}

function CardBody({ a, farmer, ...rest }: ActionProps & { farmer: string }) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <button type="button" onClick={() => rest.onOpen(a.id, 'overview')} disabled={!!a.deletedAt} className="text-left text-body-lg font-extrabold hover:underline break-words">{a.name}</button>
          <span className="block text-punjabi-subtext text-on-surface-variant tracking-wide">{a.displayId}</span>
        </div>
        <StatusPill status={a.status} deleted={!!a.deletedAt} />
      </div>
      <p className="text-body-md">{farmer}<span className="text-on-surface-variant"> · {a.inputs.cropDetails?.cropType ?? 'No crop yet'} · {a.inputs.cropDetails?.assessmentYear ?? '—'}</span></p>
      <p className="text-punjabi-subtext text-on-surface-variant">{pathwayLabel(a.pathway)} · updated {fmtDate(a.updatedAt)}</p>
      <div className="flex items-center gap-2"><ProgressBar value={a.progress} className="flex-1" /><span className="text-punjabi-subtext font-bold">{a.progress}%</span></div>
      <div className="mt-auto pt-1"><Actions a={a} {...rest} /></div>
    </div>
  )
}
