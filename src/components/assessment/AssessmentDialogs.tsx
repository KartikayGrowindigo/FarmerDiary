import React, { useMemo, useState } from 'react'
import store from '../../lib/store'
import { PATHWAYS } from '../../config/cfp/schema'
import { buildPrefill, gatherFarmerData } from '../../lib/assessment/prefill'
import { createAssessment } from '../../lib/assessment/lifecycle'
import { Assessment, Pathway } from '../../lib/assessment/types'
import { Button, Icon, Modal, SearchSelect, cx, inputClass } from './AssessmentUi'

const THIS_YEAR = new Date().getFullYear()
const validYear = (y: string) => /^\d{4}$/.test(y) && +y >= 1990 && +y <= THIS_YEAR + 1

function Labeled({ id, label, error, hint, children }: { id: string; label: string; error?: string | null; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-body-md font-bold mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-punjabi-subtext text-on-surface-variant">{hint}</p>}
      {error && <p className="mt-1 text-punjabi-subtext font-bold text-rose-700 flex items-center gap-1"><Icon name="error" className="text-[18px]" />{error}</p>}
    </div>
  )
}

export function CreateAssessmentDialog({ userId, onClose, onCreated }: { userId?: string; onClose: () => void; onCreated: (a: Assessment) => void }) {
  const farmers = store.getFarmers()
  const [name, setName] = useState('')
  const [farmerId, setFarmerId] = useState<string | undefined>(farmers.length === 1 ? farmers[0].id : undefined)
  const [pathway, setPathway] = useState<Pathway>('annual_crops')
  const [year, setYear] = useState(String(THIS_YEAR))
  const plots = useMemo(() => store.getPlots().filter(p => p.farmerId === farmerId), [farmerId])
  const [plotIds, setPlotIds] = useState<string[] | null>(null) // null = all plots of the farmer
  const selectedPlots = plotIds ?? plots.map(p => p.id)
  const [usePrefill, setUsePrefill] = useState(true)
  const [tried, setTried] = useState(false)

  const farmer = farmers.find(f => f.id === farmerId)
  const preview = useMemo(() => (farmer && usePrefill ? buildPrefill(gatherFarmerData(farmer, selectedPlots), pathway) : null), [farmer, usePrefill, selectedPlots.join(), pathway])

  const errors = {
    name: !name.trim() ? 'Give the assessment a name' : null,
    farmer: !farmerId ? 'Choose the farmer' : null,
    year: !validYear(year) ? `Enter a year between 1990 and ${THIS_YEAR + 1}` : null
  }
  const valid = !errors.name && !errors.farmer && !errors.year

  const create = () => {
    setTried(true)
    if (!valid || !farmer) return
    const a = createAssessment({
      name, farmerId: farmer.id, plotIds: selectedPlots, pathway, assessmentYear: +year,
      inputs: preview?.inputs, prefill: preview?.prefill, userId,
      takenIds: new Set(store.getAssessments().map(x => x.displayId))
    })
    store.saveAssessment(a)
    onCreated(a)
  }

  return (
    <Modal
      title="Create new assessment"
      wide
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" icon="add" onClick={create}>Create assessment</Button></>}
    >
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); create() }}>
        <Labeled id="new-name" label="Assessment name" error={tried ? errors.name : null} hint="e.g. wheat_sherpur_2026">
          <input id="new-name" className={cx(inputClass, tried && errors.name ? 'border-rose-400' : 'border-stone-200')} value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
        </Labeled>

        <Labeled id="new-farmer" label="Farmer" error={tried ? errors.farmer : null} hint="Linked to the existing farmer record; the assessment keeps its own copy of any values used.">
          <SearchSelect
            id="new-farmer"
            value={farmerId}
            invalid={tried && !!errors.farmer}
            options={farmers.map(f => ({ value: f.id, label: `${f.name}${f.village ? ' · ' + f.village : ''}${f.gipl_id ? ' · ' + f.gipl_id : ''}` }))}
            onChange={v => { setFarmerId(v); setPlotIds(null) }}
            placeholder="Search farmers…"
          />
        </Labeled>

        {farmer && (
          <fieldset>
            <legend className="text-body-md font-bold mb-1.5">Fields (plots) covered</legend>
            {plots.length === 0 ? (
              <p className="text-punjabi-subtext text-on-surface-variant">This farmer has no plots registered.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {plots.map(p => {
                  const on = selectedPlots.includes(p.id)
                  return (
                    <label key={p.id} className={cx('min-h-[44px] px-3 rounded-2xl border-2 inline-flex items-center gap-2 cursor-pointer', on ? 'border-emerald-700 bg-emerald-50' : 'border-stone-200')}>
                      <input type="checkbox" className="w-4 h-4 accent-emerald-700" checked={on} onChange={() => setPlotIds(on ? selectedPlots.filter(x => x !== p.id) : [...selectedPlots, p.id])} />
                      Plot {p.id.slice(0, 6).toUpperCase()} · {p.acres} acres
                    </label>
                  )
                })}
              </div>
            )}
            <p className="mt-1 text-punjabi-subtext text-on-surface-variant">Fields in one assessment should share similar management and soil.</p>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-body-md font-bold mb-1.5">Assessment pathway</legend>
          <div className="grid sm:grid-cols-3 gap-2">
            {PATHWAYS.map(p => (
              <label key={p.id} className={cx('rounded-2xl border-2 p-3 cursor-pointer flex gap-2 items-start', pathway === p.id ? 'border-emerald-700 bg-emerald-50' : 'border-stone-200 hover:border-emerald-600')}>
                <input type="radio" name="pathway" className="mt-1 accent-emerald-700" checked={pathway === p.id} onChange={() => setPathway(p.id)} />
                <span>
                  <span className="block font-extrabold">{p.label}</span>
                  <span className="block text-punjabi-subtext text-on-surface-variant">{p.description}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-punjabi-subtext text-on-surface-variant">Perennial crops and livestock pathways are not available yet.</p>
        </fieldset>

        <Labeled id="new-year" label="Assessment year" error={tried ? errors.year : null}>
          <input id="new-year" inputMode="numeric" className={cx(inputClass, 'max-w-[160px]', tried && errors.year ? 'border-rose-400' : 'border-stone-200')} value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </Labeled>

        {farmer && (
          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-violet-700" checked={usePrefill} onChange={e => setUsePrefill(e.target.checked)} />
              <span>
                <span className="block font-extrabold text-violet-900">Prefill from this farmer's data</span>
                <span className="block text-punjabi-subtext text-violet-900/80">Only answers whose meaning and unit match are copied. They stay editable and are marked "From farmer data".</span>
              </span>
            </label>
            {usePrefill && preview && (
              Object.keys(preview.prefill).length ? (
                <ul className="mt-3 space-y-1 text-punjabi-subtext text-violet-900">
                  {Object.entries(preview.prefill).map(([k, p]) => (
                    <li key={k} className="flex gap-1.5"><Icon name="check" className="text-[16px] mt-0.5" /><span><b>{k}</b> — {p.source}{p.detail ? ` (${p.detail})` : ''}</span></li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-punjabi-subtext text-violet-900/80">Nothing to prefill for this selection.</p>
            )}
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

export function DuplicateDialog({ source, onClose, onConfirm }: { source: Assessment; onClose: () => void; onConfirm: (name: string, year: number) => void }) {
  const [name, setName] = useState(`Copy of ${source.name}`)
  const [year, setYear] = useState(String(source.inputs.cropDetails?.assessmentYear ?? THIS_YEAR))
  const [tried, setTried] = useState(false)
  const nameError = !name.trim() ? 'Give the copy a name' : null
  const yearError = !validYear(year) ? `Enter a year between 1990 and ${THIS_YEAR + 1}` : null
  const go = () => { setTried(true); if (!nameError && !yearError) onConfirm(name, +year) }
  return (
    <Modal title="Duplicate assessment" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" icon="content_copy" onClick={go}>Duplicate</Button></>}>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); go() }}>
        <p className="text-body-md text-on-surface-variant">Copies all answers and section notes from <b>{source.displayId}</b> into a new assessment that starts as In Progress. Submission history and results are not copied.</p>
        <Labeled id="dup-name" label="Name" error={tried ? nameError : null}>
          <input id="dup-name" className={cx(inputClass, 'border-stone-200')} value={name} onChange={e => setName(e.target.value)} />
        </Labeled>
        <Labeled id="dup-year" label="Assessment year" error={tried ? yearError : null}>
          <input id="dup-year" inputMode="numeric" className={cx(inputClass, 'border-stone-200 max-w-[160px]')} value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </Labeled>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

export function DeleteDialog({ a, onClose, onConfirm }: { a: Assessment; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Delete assessment?" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button kind="danger" icon="delete" onClick={onConfirm}>Delete assessment</Button></>}>
      <div className="rounded-2xl bg-stone-50 p-4 mb-3">
        <p className="text-body-lg font-extrabold break-words">{a.name}</p>
        <p className="text-body-md text-on-surface-variant tracking-wide">{a.displayId}</p>
      </div>
      <p className="text-body-md text-on-surface-variant">The assessment disappears from the list. An admin can restore it from "Show deleted"; its submission history is kept.</p>
    </Modal>
  )
}
