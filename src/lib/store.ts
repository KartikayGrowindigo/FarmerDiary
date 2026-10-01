import seed from '../data/seed.json'
import { Farmer, Plot, CropCycle, Activity, SurveyResponse } from '../types'

const LS_KEY = 'clearharvest:v1'

type DB = {
  farmers: Farmer[]
  plots: Plot[]
  cropCycles: CropCycle[]
  activities: Activity[]
  surveys: Record<string, SurveyResponse>
}

function load(): DB {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    const db = JSON.parse(raw)
    db.surveys = db.surveys || {}
    return db
  }
  const initial: DB = {
    farmers: seed.farmers,
    plots: seed.plots,
    cropCycles: seed.cropCycles,
    activities: seed.activities || [],
    surveys: {}
  }
  localStorage.setItem(LS_KEY, JSON.stringify(initial))
  return initial
}

function save(db: DB) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

export const store = {
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
  addActivity(activity: Activity) {
    const db = load()
    db.activities.push(activity)
    save(db)
  },
  addActivityToMultiple(cropCycleIds: string[], baseActivity: Activity) {
    const db = load()
    cropCycleIds.forEach(ccId => {
      const copy: Activity = { ...baseActivity, id: baseActivity.id + '-' + ccId, cropCycleId: ccId }
      db.activities.push(copy)
    })
    save(db)
  },
  getSurvey(farmerId: string): SurveyResponse | undefined {
    return load().surveys[farmerId]
  },
  saveSurvey(farmerId: string, answers: Record<string, any>) {
    const db = load()
    const prev = db.surveys[farmerId]
    const now = new Date().toISOString()
    db.surveys[farmerId] = { farmerId, answers, createdAt: prev?.createdAt || now, updatedAt: now }
    save(db)
  }
}

export default store
