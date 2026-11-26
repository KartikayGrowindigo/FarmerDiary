import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import store, { ServerSnapshot } from './store'
import { Activity, CropCycle, Farmer, Plot, SurveyResponse } from '../types'
import { Assessment, AssessmentSubmission } from './assessment/types'

// Keeps the signed-in account's local copy and the database in step:
// upload queued changes first, then download everything the account can see.

export type SyncStatus = {
  state: 'idle' | 'syncing' | 'offline' | 'error'
  error?: string
}

let status: SyncStatus = { state: 'idle' }
const listeners = new Set<() => void>()
function setStatus(next: SyncStatus) {
  status = next
  listeners.forEach(l => l())
}

const PAGE = 1000 // the API returns at most 1000 rows per request

async function fetchAll<T>(table: string, order: string[]): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    let query = supabase!.from(table).select('*')
    for (const col of order) query = query.order(col)
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data as T[]))
    if (!data || data.length < PAGE) return rows
  }
}

// ---------- Row <-> app shapes ----------

const toFarmer = (r: any): Farmer => ({
  id: r.id, name: r.name, fatherName: r.father_name ?? '', village: r.village ?? '', contact: r.contact ?? '',
  kisanAdvisor: r.kisan_advisor ?? '', gender: r.gender ?? undefined, gipl_id: r.gipl_id ?? undefined
})
const toPlot = (r: any): Plot => ({ id: r.id, farmerId: r.farmer_id, acres: Number(r.acres), village: r.village ?? '' })
const toCycle = (r: any): CropCycle => ({
  id: r.id, plotId: r.plot_id, crop: r.crop, season: r.season, year: r.year,
  sowingDate: r.sowing_date ?? undefined, harvestDate: r.harvest_date ?? undefined
})
const toActivity = (r: any): Activity => ({
  id: r.id, cropCycleId: r.crop_cycle_id, module: r.module, date: r.date, notes: r.notes ?? undefined, payload: r.payload ?? {}
})
const toSurvey = (r: any): SurveyResponse => ({ farmerId: r.farmer_id, answers: r.answers ?? {}, createdAt: r.created_at, updatedAt: r.updated_at })

const activityRow = (a: Activity) => ({
  id: a.id, crop_cycle_id: a.cropCycleId, module: a.module, date: a.date, notes: a.notes ?? null, payload: a.payload
})
const surveyRow = (s: SurveyResponse) => ({ farmer_id: s.farmerId, answers: s.answers })

// Assessments (admin only). Who created, edited and submitted is stamped by the database from the session.
const assessmentRow = (a: Assessment) => ({
  id: a.id, display_id: a.displayId, name: a.name, farmer_id: a.farmerId, plot_ids: a.plotIds, pathway: a.pathway,
  crop_type: a.inputs.cropDetails?.cropType ?? null, assessment_year: a.inputs.cropDetails?.assessmentYear ?? null,
  schema_version: a.schemaVersion, status: a.status, calculation_status: a.calculationStatus,
  inputs: a.inputs, notes: a.notes, section_status: a.sectionStatus, progress: a.progress, prefill: a.prefill,
  revision: a.revision, duplicated_from: a.duplicatedFrom ?? null, submitted_at: a.submittedAt ?? null,
  deleted_at: a.deletedAt ?? null, created_at: a.createdAt, updated_at: a.updatedAt
})
const toAssessment = (r: any): Assessment => ({
  id: r.id, displayId: r.display_id, name: r.name, farmerId: r.farmer_id, plotIds: r.plot_ids ?? [], pathway: r.pathway,
  schemaVersion: r.schema_version, status: r.status, calculationStatus: r.calculation_status, inputs: r.inputs ?? {},
  notes: r.notes ?? {}, sectionStatus: r.section_status ?? {}, progress: Number(r.progress ?? 0), prefill: r.prefill ?? {},
  revision: r.revision ?? 0, duplicatedFrom: r.duplicated_from ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at,
  createdBy: r.created_by ?? undefined, updatedBy: r.updated_by ?? undefined, submittedAt: r.submitted_at ?? undefined,
  submittedBy: r.submitted_by ?? undefined, deletedAt: r.deleted_at ?? undefined
})
const submissionRow = (s: AssessmentSubmission) => ({
  id: s.id, assessment_id: s.assessmentId, revision: s.revision, schema_version: s.schemaVersion, snapshot: s.snapshot, submitted_at: s.submittedAt
})
const toSubmission = (r: any): AssessmentSubmission => ({
  id: r.id, assessmentId: r.assessment_id, revision: r.revision, schemaVersion: r.schema_version, snapshot: r.snapshot,
  submittedAt: r.submitted_at, submittedBy: r.submitted_by ?? undefined
})

// The assessment tables come from a separate migration. Until it has been run, keep syncing everything else.
let assessmentsMissing = false
const tableMissing = (e: any) => ['42P01', 'PGRST205', 'PGRST204'].includes(e?.code) || /does not exist|could not find the table/i.test(String(e?.message))
export const ASSESSMENT_SETUP_HINT = 'Assessment tables not found. Run supabase/migrations/20261120000000_assessments.sql in the Supabase SQL editor.'

// ---------- Upload & download ----------

async function upload() {
  const pending = store.pending()
  const activities = Object.values(pending.activities)
  const surveys = Object.values(pending.surveys)
  if (activities.length) {
    const { error } = await supabase!.from('activities').upsert(activities.map(activityRow))
    if (error) throw error
  }
  for (const s of surveys) {
    const { error } = await supabase!.from('surveys').upsert(surveyRow(s))
    if (error) throw error
  }
  if (activities.length || surveys.length) store.markUploaded({ activities, surveys })

  const assessments = Object.values(pending.assessments || {})
  const submissions = Object.values(pending.submissions || {})
  if (!assessments.length && !submissions.length) return
  if (assessments.length) {
    const { error } = await supabase!.from('assessments').upsert(assessments.map(assessmentRow))
    if (error) throw tableMissing(error) ? new Error(ASSESSMENT_SETUP_HINT) : error
  }
  if (submissions.length) {
    // Snapshots are written once; a repeat upload after a dropped connection is ignored.
    const { error } = await supabase!.from('assessment_submissions').upsert(submissions.map(submissionRow), { onConflict: 'id', ignoreDuplicates: true })
    if (error) throw tableMissing(error) ? new Error(ASSESSMENT_SETUP_HINT) : error
  }
  store.markUploaded({ activities: [], surveys: [], assessments, submissions })
}

async function downloadAssessments(): Promise<Pick<ServerSnapshot, 'assessments' | 'submissions'>> {
  if (!store.isAdmin()) return {}
  try {
    const [rows, subs] = await Promise.all([
      fetchAll<any>('assessments', ['updated_at', 'id']),
      fetchAll<any>('assessment_submissions', ['submitted_at', 'id'])
    ])
    assessmentsMissing = false
    return {
      assessments: Object.fromEntries(rows.map(toAssessment).map(a => [a.id, a])),
      submissions: Object.fromEntries(subs.map(toSubmission).map(s => [s.id, s]))
    }
  } catch (e) {
    if (!tableMissing(e)) throw e
    assessmentsMissing = true
    return {}
  }
}

export const assessmentTablesMissing = () => assessmentsMissing

async function download() {
  const who = store.account()
  const [farmers, plots, cycles, activities, surveys, assessments] = await Promise.all([
    fetchAll('farmers', ['name', 'id']),
    fetchAll('plots', ['created_at', 'id']),
    fetchAll('crop_cycles', ['year', 'id']),
    fetchAll('activities', ['date', 'id']),
    fetchAll('surveys', ['farmer_id']),
    downloadAssessments()
  ])
  const snapshot: ServerSnapshot = {
    farmers: farmers.map(toFarmer),
    plots: plots.map(toPlot),
    cropCycles: cycles.map(toCycle),
    activities: activities.map(toActivity),
    surveys: Object.fromEntries(surveys.map(toSurvey).map(s => [s.farmerId, s])),
    ...assessments
  }
  // Signed out (or switched account) while downloading: don't write this account's data back onto the phone.
  if (store.account() !== who) return
  store.applyServer(snapshot)
}

// ---------- Scheduling ----------

let running: Promise<void> | null = null
let again = false

/** Upload then download. Safe to call often: overlapping calls collapse into one follow-up run. */
export function syncNow(): Promise<void> {
  if (!supabase || !store.account()) return Promise.resolve()
  if (running) {
    again = true
    return running
  }
  running = (async () => {
    do {
      again = false
      if (!navigator.onLine) {
        setStatus({ state: 'offline' })
        break
      }
      setStatus({ state: 'syncing' })
      try {
        await upload()
        await download()
        setStatus({ state: 'idle' })
      } catch (e: any) {
        // A dropped connection looks like a fetch failure; report it as offline, not as an error.
        const offline = !navigator.onLine || /fetch|network/i.test(String(e?.message))
        setStatus(offline ? { state: 'offline' } : { state: 'error', error: e?.message || 'Could not sync.' })
        break
      }
    } while (again)
  })().finally(() => { running = null })
  return running
}

/** Start background syncing for the signed-in account. Returns a function that stops it. */
export function startSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  // Upload shortly after a change; survey typing saves on every keystroke, so wait for a pause.
  const unsubscribe = store.subscribe(() => {
    if (store.pendingCount() === 0) return
    clearTimeout(timer)
    timer = setTimeout(syncNow, 2000)
  })
  const onVisible = () => { if (document.visibilityState === 'visible') syncNow() }
  const onOnline = () => { syncNow() }
  const onOffline = () => setStatus({ state: 'offline' })
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  document.addEventListener('visibilitychange', onVisible)
  const interval = setInterval(syncNow, 60_000)
  syncNow()
  return () => {
    unsubscribe()
    clearTimeout(timer)
    clearInterval(interval)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
    document.removeEventListener('visibilitychange', onVisible)
    setStatus({ state: 'idle' })
  }
}

export function useSyncStatus() {
  useSyncExternalStore(store.subscribe, store.getVersion)
  const s = useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => status)
  return { ...s, pending: store.pendingCount(), syncedAt: store.syncedAt() }
}
