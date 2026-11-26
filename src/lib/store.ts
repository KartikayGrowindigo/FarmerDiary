import seed from '../data/seed.json'
import { Farmer, Plot, CropCycle, Activity, SurveyResponse } from '../types'
import { Assessment, AssessmentSubmission } from './assessment/types'

// The app always reads and writes this local copy, so it keeps working without signal.
// Signed in to the database, each account has its own copy plus a queue of changes
// waiting to upload (see sync.ts). Without a database (dev mode) it's the seeded demo data.

const DEMO_KEY = 'clearharvest:v1'
const accountKey = (id: string) => `kheti:data:${id}`

type Pending = {
  activities: Record<string, Activity>
  surveys: Record<string, SurveyResponse>
  // Admin-only CFP assessments (see src/lib/assessment).
  assessments?: Record<string, Assessment>
  submissions?: Record<string, AssessmentSubmission>
}

type DB = {
  farmers: Farmer[]
  plots: Plot[]
  cropCycles: CropCycle[]
  activities: Activity[]
  surveys: Record<string, SurveyResponse>
  assessments?: Record<string, Assessment>
  submissions?: Record<string, AssessmentSubmission>
  pending?: Pending
  syncedAt?: string
}

export type ServerSnapshot = Pick<DB, 'farmers' | 'plots' | 'cropCycles' | 'activities' | 'surveys'> & {
  /** Missing when the account isn't an admin or the assessment tables aren't set up: keep the local copy. */
  assessments?: Record<string, Assessment>
  submissions?: Record<string, AssessmentSubmission>
}

let account: string | null = null
// Whether the signed-in account is an admin (staff.is_admin). Set by auth.tsx; the database enforces it too.
let admin = false
let cache: DB | null = null
let version = 0
const listeners = new Set<() => void>()

function storageKey() {
  return account ? accountKey(account) : DEMO_KEY
}

function emptyPending(): Pending {
  return { activities: {}, surveys: {} }
}

function load(): DB {
  if (cache) return cache
  const raw = localStorage.getItem(storageKey())
  if (raw) {
    cache = JSON.parse(raw) as DB
    cache.surveys = cache.surveys || {}
  } else if (account) {
    cache = { farmers: [], plots: [], cropCycles: [], activities: [], surveys: {}, pending: emptyPending() }
  } else {
    cache = {
      farmers: seed.farmers,
      plots: seed.plots,
      cropCycles: seed.cropCycles,
      activities: seed.activities || [],
      surveys: {}
    }
    localStorage.setItem(DEMO_KEY, JSON.stringify(cache))
  }
  return cache
}

function save(db: DB) {
  cache = db
  localStorage.setItem(storageKey(), JSON.stringify(db))
  notify()
}

function notify() {
  version++
  listeners.forEach(l => l())
}

function queue(db: DB): Pending | null {
  if (!account) return null
  return (db.pending ||= emptyPending())
}

// Another tab of the app saved: drop the in-memory copy so the next read picks it up.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === storageKey()) {
      cache = null
      notify()
    }
  })
}

export const store = {
  // ---------- Account & change notifications ----------

  /** Switch to a signed-in account's local copy, or back to the demo data with null. */
  setAccount(id: string | null) {
    if (id === account) return
    account = id
    admin = false // the new account's role is set by auth.tsx once known
    cache = null
    notify()
  },
  account() {
    return account
  },
  /** Remove the signed-in account's copy from this phone (farmer names, contacts, answers). Only call when nothing is waiting to upload. */
  forgetAccount() {
    if (!account) return
    localStorage.removeItem(accountKey(account))
    cache = null
  },
  setAdmin(value: boolean) {
    if (value === admin) return
    admin = value
    notify()
  },
  isAdmin() {
    return admin
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  getVersion() {
    return version
  },

  // ---------- Reads ----------

  getFarmers(): Farmer[] {
    return load().farmers
  },
  getPlots(): Plot[] {
    return load().plots
  },
  getPlotById(id: string) {
    return load().plots.find(p => p.id === id)!
  },
  getCropCyclesForPlot(plotId: string) {
    return load().cropCycles.filter(c => c.plotId === plotId)
  },
  getCurrentCropCycle(plotId: string) {
    const cycles = load().cropCycles.filter(c => c.plotId === plotId)
    // assume latest year string sort
    return cycles[cycles.length - 1]
  },
  getActivitiesForCropCycle(cropCycleId: string) {
    return load().activities.filter(a => a.cropCycleId === cropCycleId).sort((a,b)=>b.date.localeCompare(a.date))
  },
  getSurvey(farmerId: string): SurveyResponse | undefined {
    return load().surveys[farmerId]
  },
  /** All assessments on this device, including soft-deleted ones. */
  getAssessments(): Assessment[] {
    return Object.values(load().assessments || {})
  },
  getAssessment(id: string): Assessment | undefined {
    return load().assessments?.[id]
  },
  getSubmissions(assessmentId: string): AssessmentSubmission[] {
    return Object.values(load().submissions || {}).filter(s => s.assessmentId === assessmentId).sort((a, b) => b.revision - a.revision)
  },

  // ---------- Writes (queued for upload when signed in) ----------

  addActivity(activity: Activity) {
    const db = load()
    db.activities.push(activity)
    const q = queue(db)
    if (q) q.activities[activity.id] = activity
    save(db)
  },
  addActivityToMultiple(cropCycleIds: string[], baseActivity: Activity) {
    const db = load()
    const q = queue(db)
    cropCycleIds.forEach(ccId => {
      const copy: Activity = { ...baseActivity, id: baseActivity.id + '-' + ccId, cropCycleId: ccId }
      db.activities.push(copy)
      if (q) q.activities[copy.id] = copy
    })
    save(db)
  },
  saveSurvey(farmerId: string, answers: Record<string, any>) {
    const db = load()
    const prev = db.surveys[farmerId]
    // Opening the survey saves too; skip when nothing changed so it doesn't queue an upload.
    if (prev && JSON.stringify(prev.answers) === JSON.stringify(answers)) return
    const now = new Date().toISOString()
    const survey = { farmerId, answers, createdAt: prev?.createdAt || now, updatedAt: now }
    db.surveys[farmerId] = survey
    const q = queue(db)
    if (q) q.surveys[farmerId] = survey
    save(db)
  },
  /** Save an assessment (and optionally a submission snapshot). Skips unchanged saves. */
  saveAssessment(assessment: Assessment, submission?: AssessmentSubmission) {
    const db = load()
    const prev = db.assessments?.[assessment.id]
    if (!submission && prev && JSON.stringify(prev) === JSON.stringify(assessment)) return
    db.assessments = { ...(db.assessments || {}), [assessment.id]: assessment }
    if (submission) db.submissions = { ...(db.submissions || {}), [submission.id]: submission }
    const q = queue(db)
    if (q) {
      q.assessments = { ...(q.assessments || {}), [assessment.id]: assessment }
      if (submission) q.submissions = { ...(q.submissions || {}), [submission.id]: submission }
    }
    save(db)
  },

  // ---------- Sync support ----------

  pending(): Pending {
    return load().pending || emptyPending()
  },
  pendingCount() {
    const p = store.pending()
    return Object.keys(p.activities).length + Object.keys(p.surveys).length + Object.keys(p.assessments || {}).length + Object.keys(p.submissions || {}).length
  },
  isAssessmentPending(id: string) {
    const p = store.pending()
    return !!p.assessments?.[id] || Object.values(p.submissions || {}).some(s => s.assessmentId === id)
  },
  /** Clear uploaded entries, unless they were edited again while uploading. */
  markUploaded(uploaded: { activities: Activity[]; surveys: SurveyResponse[]; assessments?: Assessment[]; submissions?: AssessmentSubmission[] }) {
    const db = load()
    const q = db.pending
    if (!q) return
    for (const a of uploaded.activities) if (q.activities[a.id] === a || JSON.stringify(q.activities[a.id]) === JSON.stringify(a)) delete q.activities[a.id]
    for (const s of uploaded.surveys) {
      const now = q.surveys[s.farmerId]
      if (now && now.updatedAt === s.updatedAt && JSON.stringify(now.answers) === JSON.stringify(s.answers)) delete q.surveys[s.farmerId]
    }
    for (const a of uploaded.assessments || []) if (q.assessments && JSON.stringify(q.assessments[a.id]) === JSON.stringify(a)) delete q.assessments[a.id]
    for (const s of uploaded.submissions || []) if (q.submissions?.[s.id]) delete q.submissions[s.id]
    save(db)
  },
  /** Replace the local copy with what the server has, keeping changes that haven't uploaded yet. */
  applyServer(snapshot: ServerSnapshot) {
    const db = load()
    const q = db.pending || emptyPending()
    const activities = snapshot.activities.filter(a => !q.activities[a.id]).concat(Object.values(q.activities))
    const surveys = { ...snapshot.surveys, ...q.surveys }
    const assessments = snapshot.assessments ? { ...snapshot.assessments, ...q.assessments } : db.assessments
    const submissions = snapshot.submissions ? { ...snapshot.submissions, ...q.submissions } : db.submissions
    save({ ...snapshot, activities, surveys, assessments, submissions, pending: q, syncedAt: new Date().toISOString() })
  },
  syncedAt(): string | undefined {
    return load().syncedAt
  }
}

export default store
