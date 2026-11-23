import { SCHEMA_VERSION } from '../../config/cfp/schema'
import { checkAssessment } from './engine'
import { Assessment, AssessmentSubmission, Doc, Pathway, PrefillRecord } from './types'

// State changes of an assessment. Pure functions: the caller saves the result (see store.ts).

const newId = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 12)

// Unambiguous characters for IDs people read out (no 0/O, 1/I/L).
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
export function newDisplayId(year = new Date().getFullYear(), taken: Set<string> = new Set()): string {
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(6))
    const id = `CFA-${year}-${Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')}`
    if (!taken.has(id)) return id
  }
}

/** Recompute the stored section statuses and progress after the answers change. */
export function withDerived(a: Assessment): Assessment {
  const report = checkAssessment(a.inputs, a.pathway)
  return { ...a, sectionStatus: report.statusById, progress: report.progress }
}

export function createAssessment(opts: {
  name: string
  farmerId: string
  plotIds: string[]
  pathway: Pathway
  assessmentYear: number
  inputs?: Doc
  prefill?: Record<string, PrefillRecord>
  userId?: string
  takenIds?: Set<string>
}): Assessment {
  const now = new Date().toISOString()
  const inputs: Doc = { ...(opts.inputs || {}) }
  inputs.cropDetails = { ...(inputs.cropDetails || {}), assessmentYear: opts.assessmentYear }
  // Paddy Rice and Potato pathways have a single crop type.
  if (opts.pathway === 'paddy_rice') inputs.cropDetails.cropType = 'Rice'
  if (opts.pathway === 'potato') inputs.cropDetails.cropType = 'Potato'
  return withDerived({
    id: newId(),
    displayId: newDisplayId(opts.assessmentYear, opts.takenIds),
    name: opts.name.trim(),
    farmerId: opts.farmerId,
    plotIds: opts.plotIds,
    pathway: opts.pathway,
    schemaVersion: SCHEMA_VERSION,
    status: 'in_progress',
    calculationStatus: 'not_configured',
    inputs,
    notes: {},
    sectionStatus: {},
    progress: 0,
    prefill: opts.prefill || {},
    revision: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: opts.userId,
    updatedBy: opts.userId
  })
}

/** Apply edited answers/notes. A submitted assessment becomes "Edit in progress" until resubmitted. */
export function editAssessment(a: Assessment, change: { inputs?: Doc; notes?: Record<string, string>; name?: string }, userId?: string): Assessment {
  const inputsChanged = change.inputs !== undefined && JSON.stringify(change.inputs) !== JSON.stringify(a.inputs)
  const notesChanged = change.notes !== undefined && JSON.stringify(change.notes) !== JSON.stringify(a.notes)
  const nameChanged = change.name !== undefined && change.name.trim() !== a.name
  if (!inputsChanged && !notesChanged && !nameChanged) return a
  const next: Assessment = {
    ...a,
    inputs: change.inputs ?? a.inputs,
    notes: change.notes ?? a.notes,
    name: nameChanged ? change.name!.trim() : a.name,
    status: a.status === 'submitted' ? 'edit_in_progress' : a.status,
    // Results (when an engine exists) belong to the submitted revision, not to unsent edits.
    calculationStatus: a.status === 'submitted' && a.calculationStatus === 'calculated' ? 'pending' : a.calculationStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: userId ?? a.updatedBy
  }
  return inputsChanged ? withDerived(next) : next
}

export type SubmitResult =
  | { ok: true; assessment: Assessment; submission: AssessmentSubmission }
  | { ok: false; report: ReturnType<typeof checkAssessment> }

/** Validate every applicable section; when all pass, mark submitted and keep a snapshot. No calculation runs here. */
export function submitAssessment(a: Assessment, userId?: string): SubmitResult {
  const report = checkAssessment(a.inputs, a.pathway)
  if (!report.canSubmit) return { ok: false, report }
  const now = new Date().toISOString()
  const revision = a.revision + 1
  const assessment: Assessment = {
    ...a,
    status: 'submitted',
    revision,
    submittedAt: now,
    submittedBy: userId,
    updatedAt: now,
    updatedBy: userId ?? a.updatedBy,
    sectionStatus: report.statusById,
    progress: report.progress
  }
  const submission: AssessmentSubmission = {
    id: `${a.id}:r${revision}`,
    assessmentId: a.id,
    revision,
    schemaVersion: a.schemaVersion,
    snapshot: {
      name: a.name,
      pathway: a.pathway,
      farmerId: a.farmerId,
      plotIds: a.plotIds,
      inputs: structuredClone(a.inputs),
      notes: { ...a.notes }
    },
    submittedAt: now,
    submittedBy: userId
  }
  return { ok: true, assessment, submission }
}

/** Copy answers and notes into a new In Progress assessment. Results and submission history are not copied. */
export function duplicateAssessment(src: Assessment, opts: { name: string; assessmentYear: number; userId?: string; takenIds?: Set<string> }): Assessment {
  const now = new Date().toISOString()
  const inputs = structuredClone(src.inputs)
  inputs.cropDetails = { ...(inputs.cropDetails || {}), assessmentYear: opts.assessmentYear }
  return withDerived({
    ...src,
    id: newId(),
    displayId: newDisplayId(opts.assessmentYear, opts.takenIds),
    name: opts.name.trim(),
    schemaVersion: SCHEMA_VERSION, // copied answers are re-checked against the current questionnaire
    status: 'in_progress',
    calculationStatus: 'not_configured',
    inputs,
    notes: { ...src.notes },
    prefill: {},
    revision: 0,
    duplicatedFrom: src.id,
    createdAt: now,
    updatedAt: now,
    createdBy: opts.userId,
    updatedBy: opts.userId,
    submittedAt: undefined,
    submittedBy: undefined,
    deletedAt: undefined
  })
}

export const softDelete = (a: Assessment, userId?: string): Assessment => ({ ...a, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: userId ?? a.updatedBy })
export const restore = (a: Assessment, userId?: string): Assessment => ({ ...a, deletedAt: undefined, updatedAt: new Date().toISOString(), updatedBy: userId ?? a.updatedBy })

export const STATUS_LABEL: Record<Assessment['status'], string> = {
  in_progress: 'In Progress',
  submitted: 'Submitted',
  edit_in_progress: 'Edit in Progress'
}
