import store from './store'
import { Activity, Farmer } from '../types'
import { SURVEY_SECTIONS, SurveyAnswers, exportValue } from '../config/fatSurvey'
import { REGEN_COLUMNS, CROP_COLUMNS } from '../config/fatColumns'

const HA_PER_ACRE = 0.404686
const T_HA_PER_QTL_ACRE = 0.1 / HA_PER_ACRE
// N content of fertilizer products logged in the diary.
const N_SHARE: Record<string, number> = { Urea: 0.46, DAP: 0.18 }

const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp

function currentPlotData(farmer: Farmer) {
  return store.getPlots()
    .filter(p => p.farmerId === farmer.id)
    .map(plot => {
      const cycle = store.getCurrentCropCycle(plot.id)
      return { plot, cycle, activities: cycle ? store.getActivitiesForCropCycle(cycle.id) : [] }
    })
}

// Acre-weighted average of a per-plot value, over plots that have one.
function weighted(rows: { acres: number; value: number | null }[]) {
  const withData = rows.filter(r => r.value !== null)
  const acres = withData.reduce((s, r) => s + r.acres, 0)
  return acres ? withData.reduce((s, r) => s + r.value! * r.acres, 0) / acres : null
}

const distinctDates = (acts: Activity[]) => new Set(acts.map(a => a.date)).size

// Answers we can derive from the diary and profile, so the advisor only confirms them.
export function prefillFromDiary(farmer: Farmer): SurveyAnswers {
  const rows = currentPlotData(farmer)
  const cycle = rows.find(r => r.cycle)?.cycle
  const all = rows.flatMap(r => r.activities)
  const byModule = (m: string) => all.filter(a => a.module === m)
  const totalHa = round(rows.reduce((s, r) => s + r.plot.acres, 0) * HA_PER_ACRE)

  const out: SurveyAnswers = {
    collectionDate: new Date().toISOString().slice(0, 10),
    farmerName: farmer.name,
    advisorName: farmer.kisanAdvisor,
    evidence: 'Farmer Dairy',
    arableHa: totalHa,
    cropAreaHa: totalHa,
    dryMatterPct: 89
  }
  if (cycle) {
    out.reportingYear = `${cycle.year} ${cycle.season} Crop`
    out.crop = cycle.crop
  }

  const yieldQtlAcre = weighted(rows.map(r => {
    const h = r.activities.filter(a => a.module === 'Harvesting')
    return { acres: r.plot.acres, value: h.length ? Math.max(...h.map(a => Number(a.payload.yieldQtlPerAcre) || 0)) : null }
  }))
  if (yieldQtlAcre) out.yieldTHa = round(yieldQtlAcre * T_HA_PER_QTL_ACRE)

  const nKgAcre = weighted(rows.map(r => {
    const f = r.activities.filter(a => a.module === 'Fertilizer & Nutrient Management')
    return {
      acres: r.plot.acres,
      value: f.length ? f.reduce((s, a) => s + (Number(a.payload.quantityKgPerAcre) || 0) * (N_SHARE[a.payload.product] || 0), 0) : null
    }
  }))
  if (nKgAcre) {
    out.synthNKgHa = round(nKgAcre / HA_PER_ACRE)
    out.totalNKgHa = out.synthNKgHa
  }

  const pest = byModule('Pest & Disease Management')
  if (pest.length) out.pesticideApps = distinctDates(pest)

  const residue = byModule('Residue Management')
  if (residue.length) out.q1_11 = residue.some(a => a.payload.method === 'Burning') ? 'Yes' : 'No'

  const water = byModule('Water Management')
  if (water.length) {
    const counts: Record<string, number> = {}
    water.forEach(a => { counts[a.payload.irrigationMethod] = (counts[a.payload.irrigationMethod] || 0) + 1 })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    out.q3_01a = top === 'Flood' ? 'Surface (Flooding, Furrow, Border etc.)' : top
  }

  if (all.length) out.q5_02 = 'Yes'
  return out
}

function csvCell(v: any) {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(columns: string[], row: Record<string, any>) {
  return [columns.map(csvCell).join(','), columns.map(c => csvCell(row[c])).join(',')].join('\r\n')
}

// One row per sheet, in the import file's exact column order.
export function buildExport(farmer: Farmer, answers: SurveyAnswers, createdAt?: string) {
  const regen: Record<string, any> = {
    Name: 'Grow Indigo Pvt Ltd.',
    ExternalID: farmer.gipl_id || farmer.id,
    'General Infomation - Date of the data creation': (createdAt || new Date().toISOString()).slice(0, 10)
  }
  const crop: Record<string, any> = { Name: answers.farmerName || farmer.name, ExternalID: farmer.gipl_id || farmer.id }
  for (const s of SURVEY_SECTIONS) {
    for (const q of s.questions) {
      ;(q.sheet === 'CROP Survey' ? crop : regen)[q.column] = exportValue(s, q, answers)
    }
  }
  crop['Crop - Crop'] = answers.crop || ''
  return { regen: toCsv(REGEN_COLUMNS, regen), crop: toCsv(CROP_COLUMNS, crop) }
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
