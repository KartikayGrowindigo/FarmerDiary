import store from './store'
import { Activity, Farmer, Plot } from '../types'
import {
  SURVEY_SECTIONS, Answers, Ctx, Question, HA_PER_ACRE, cropTotals, exportValue, fieldView, isShown, labelOf, makeCtx, plain, unitOf, valueOf, isAnswered
} from '../config/fatSurvey'
import { REGEN_COLUMNS, CROP_COLUMNS } from '../config/fatColumns'

const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp
const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

// Diary values → questionnaire answer lists.
const FERTILISER_FROM_DIARY: Record<string, string> = { DAP: 'DAP', Urea: 'Urea', MOP: 'MOP (muriate of potash)', Zinc: 'Zinc sulphate', Bio: 'Bio-fertiliser (specify)' }
const FERT_METHOD_FROM_DIARY: Record<string, string> = { Broadcasting: 'Broadcast', Seeder: 'Drilled with seed (basal)', Fertigation: 'Fertigation', Spray: 'Foliar spray' }
const CP_UNIT_FROM_DIARY: Record<string, string> = { ml: 'ml per acre', gm: 'g per acre', L: 'L per acre', kg: 'kg per acre' }
const RESIDUE_FROM_DIARY: Record<string, string> = { Burning: 'Burnt', Incorporation: 'Incorporated into soil', 'Baling & Selling': 'Removed from field (baled / sold / fodder)' }
const TILLAGE_FROM_DIARY: Record<string, string> = { 'Conventional Tillage': 'Conventional (CT)', 'Super Seeder': 'Reduced (RT)', 'Happy Seeder': 'Zero tillage (ZT)', 'Smart Seeder': 'Zero tillage (ZT)', 'Zero Till Drill': 'Zero tillage (ZT)' }
const MACHINE_FROM_DIARY: Record<string, string> = { 'Super Seeder': 'Super seeder', 'Happy Seeder': 'Happy seeder', 'Smart Seeder': 'Smart seeder', 'Zero Till Drill': 'Zero-till drill' }
const LISTED_CROPS = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton']

const latest = (acts: Activity[]) => acts.slice().sort((a, b) => b.date.localeCompare(a.date))[0]
const mostCommon = (values: string[]) => {
  const counts: Record<string, number> = {}
  values.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
}

// Field answers (B–L) we can take from this plot's diary, so the advisor only confirms them.
function prefillField(plot: Plot): Answers {
  const cycles = store.getCropCyclesForPlot(plot.id)
  const cycle = cycles[cycles.length - 1]
  const previous = cycles[cycles.length - 2]
  const acts = cycle ? store.getActivitiesForCropCycle(cycle.id) : []
  const of = (m: string) => acts.filter(a => a.module === m)
  const out: Answers = { B01: plot.id, B04: plot.acres }

  if (cycle) {
    out.B02 = LISTED_CROPS.includes(cycle.crop) ? cycle.crop : 'Other'
    if (cycle.sowingDate) out.B07 = cycle.sowingDate
    if (cycle.harvestDate) out.B08 = cycle.harvestDate
  }
  if (previous) {
    out.E01 = LISTED_CROPS.includes(previous.crop) ? previous.crop : 'Other'
    const residue = latest(store.getActivitiesForCropCycle(previous.id).filter(a => a.module === 'Residue Management'))
    const method = residue && RESIDUE_FROM_DIARY[residue.payload.method]
    if (method) {
      out.E02 = method
      if (residue.payload.quantityQtlPerAcre) out.E03 = round(residue.payload.quantityQtlPerAcre / 10, 2)
      if (method === 'Burnt') out.E04 = plot.acres
    }
  }

  const seed = latest(of('Seed & Sowing'))
  if (seed) {
    if (seed.payload.variety && seed.payload.variety !== 'Other') out.B03 = seed.payload.variety
    if (seed.payload.seedRateKgPerAcre) out.B09 = seed.payload.seedRateKgPerAcre
    out.B10 = seed.payload.seedTreatmentDone ? 'Yes' : 'No'
    if (seed.payload.seedTreatmentDone && seed.payload.treatmentProduct) out.B12 = seed.payload.treatmentProduct
  }

  const prep = of('Land Preparation & Sowing')
  const prepLatest = latest(prep)
  if (prepLatest && TILLAGE_FROM_DIARY[prepLatest.payload.prepMethod]) out.C01 = TILLAGE_FROM_DIARY[prepLatest.payload.prepMethod]
  const machines = prep.filter(a => MACHINE_FROM_DIARY[a.payload.prepMethod]).map(a => ({
    _diary: true,
    D02: MACHINE_FROM_DIARY[a.payload.prepMethod],
    D03: 1,
    D04: 'Diesel',
    ...(a.payload.fuelLitres ? { D05: round(a.payload.fuelLitres / plot.acres, 2) } : {}),
    ...(a.payload.hoursPerAcre ? { D06: a.payload.hoursPerAcre } : {})
  }))
  if (machines.length) {
    out.D01 = 'Yes'
    out.D_machines = machines
  }

  const residue = latest(of('Residue Management'))
  if (residue && RESIDUE_FROM_DIARY[residue.payload.method]) {
    out.E05 = RESIDUE_FROM_DIARY[residue.payload.method]
    if (residue.payload.quantityQtlPerAcre) out.E06 = round(residue.payload.quantityQtlPerAcre / 10, 2)
  }

  const fert = of('Fertilizer & Nutrient Management').filter(a => FERTILISER_FROM_DIARY[a.payload.product])
  if (fert.length) {
    out.F_fertilisers = fert.slice().reverse().map(a => ({
      _diary: true,
      F01: a.date,
      F02: FERTILISER_FROM_DIARY[a.payload.product],
      F04: a.payload.quantityKgPerAcre,
      ...(FERT_METHOD_FROM_DIARY[a.payload.applicationMethod] ? { F06: FERT_METHOD_FROM_DIARY[a.payload.applicationMethod] } : {})
    }))
  }

  // Products logged on the same day are one spray with a tank mix.
  const pest = of('Pest & Disease Management')
  if (pest.length) {
    const byDate = new Map<string, Activity[]>()
    pest.slice().reverse().forEach(a => byDate.set(a.date, [...(byDate.get(a.date) || []), a]))
    out.I01 = 'Yes'
    out.I_sprays = [...byDate.entries()].map(([date, products]) => ({
      _diary: true,
      I02: date,
      I04: plot.acres,
      I_products: products.map(p => ({
        I06: p.payload.cppType,
        ...(p.payload.tradeName ? { I08: p.payload.tradeName } : {}),
        ...(p.payload.quantityPerAcre ? { I09: p.payload.quantityPerAcre } : {}),
        ...(CP_UNIT_FROM_DIARY[p.payload.unit] ? { I10: CP_UNIT_FROM_DIARY[p.payload.unit] } : {})
      }))
    }))
  }

  const water = of('Water Management')
  if (water.length) {
    const method = mostCommon(water.map(a => a.payload.irrigationMethod))
    if (['Flood', 'Sprinkler', 'Drip'].includes(method)) out.J01 = method
    const source = mostCommon(water.map(a => a.payload.waterSource))
    if (source === 'Tubewell' || source === 'Canal') out.J02 = source
    if (water.some(a => Number(a.payload.fuelLitres) > 0)) out.J03 = 'Diesel'
    const w = latest(water)
    if (w.payload.pumpHP) out.J05 = w.payload.pumpHP
    if (w.payload.groundwaterDepthFt) out.J06 = w.payload.groundwaterDepthFt
    out.J_irrigations = water.slice().reverse().map(a => ({
      _diary: true,
      J08: a.date,
      J09: plot.acres,
      ...(a.payload.durationHours ? { J10: a.payload.durationHours } : {}),
      ...(Number(a.payload.fuelLitres) > 0 ? { J11: a.payload.fuelLitres } : {})
    }))
  }

  const harvest = of('Harvesting')
  if (harvest.length) {
    const h = harvest.reduce((best, a) => (Number(a.payload.yieldQtlPerAcre) > Number(best.payload.yieldQtlPerAcre) ? a : best))
    if (h.payload.yieldQtlPerAcre) out.K01 = round(h.payload.yieldQtlPerAcre * plot.acres, 2)
    if (h.payload.moisturePct) out.K02 = h.payload.moisturePct
  }
  return out
}

export function farmerPlots(farmer: Farmer) {
  return store.getPlots().filter(p => p.farmerId === farmer.id)
}

// Answers we can derive from the diary and profile. Field answers sit under `fields[plotId]`.
export function prefillFromDiary(farmer: Farmer): Answers {
  const plots = farmerPlots(farmer)
  const cycle = plots.map(p => store.getCurrentCropCycle(p.id)).find(Boolean)
  const anyActivity = plots.some(p => store.getCropCyclesForPlot(p.id).some(c => store.getActivitiesForCropCycle(c.id).length))
  const gender = cap(farmer.gender)

  const out: Answers = {
    A01: farmer.kisanAdvisor,
    A02: farmer.gipl_id || farmer.id,
    A03: farmer.name,
    A04: farmer.village,
    A11: farmer.contact,
    A13: new Date().toISOString().slice(0, 10),
    'RW-005': ['Farmer diary'],
    'RW-007': round(plots.reduce((s, p) => s + p.acres, 0) * HA_PER_ACRE),
    fields: Object.fromEntries(plots.map(p => [p.id, prefillField(p)]))
  }
  if (gender && ['Male', 'Female', 'Other'].includes(gender)) out.A10 = gender
  if (cycle) {
    out.A08 = cycle.year
    if (['Kharif', 'Rabi', 'Zaid'].includes(cycle.season)) out.A09 = cycle.season
  }
  if (anyActivity) out['RW-064'] = 'Yes'
  return out
}

// Saved answers win; the prefill only fills gaps, field by field.
export function mergePrefill(prefill: Answers, saved: Answers = {}) {
  const gaps = (p: Answers, s: Answers) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'fields' && !isAnswered(s[k])))
  const prefilled: Answers = { ...gaps(prefill, saved), fields: {} }
  const answers: Answers = { ...prefilled, ...saved, fields: { ...saved.fields } }
  for (const [plotId, p] of Object.entries<Answers>(prefill.fields || {})) {
    const s = saved.fields?.[plotId] || {}
    prefilled.fields[plotId] = gaps(p, s)
    answers.fields[plotId] = { ...prefilled.fields[plotId], ...s }
  }
  return { prefilled, answers }
}

function csvCell(v: any) {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(columns: string[], rows: Record<string, any>[]) {
  return [columns, ...rows.map(r => columns.map(c => r[c]))].map(r => r.map(csvCell).join(',')).join('\r\n')
}

// Regen A5.1 (one row) and CROP Survey (one row per crop) in the import file's exact column order.
function buildImportRows(farmer: Farmer, answers: Answers, ctx: Ctx, createdAt?: string) {
  const crops = cropTotals(ctx)
  const externalId = answers.A02 || farmer.gipl_id || farmer.id
  const sum = (vals: (number | null)[]) => (vals.every(v => v === null) ? '' : round(vals.reduce<number>((s, v) => s + (v ?? 0), 0)))
  const ha = (id: string) => (isAnswered(answers[id]) ? Number(answers[id]) : null)
  const produced = crops.filter(t => t.producedKg !== null)
  const totalN = crops.reduce((s, t) => s + t.totalNKg, 0)
  const synthN = crops.reduce((s, t) => s + t.synthNKg, 0)
  const dry = crops.filter(t => t.dryKg !== null)

  const regen: Record<string, any> = {
    Name: 'Grow Indigo Pvt Ltd.',
    ExternalID: externalId,
    'General Infomation - Date Of The Data Collection': answers.A13 || '',
    'General Infomation - Year of reporting': [answers.A08, answers.A09, answers.A09 && 'Crop'].filter(Boolean).join(' '),
    'Farmer Name': answers.A12 || answers.A03 || '',
    'Kisaan Advisor Name': answers.A01 || '',
    'General Infomation - Date of the data creation': (createdAt || new Date().toISOString()).slice(0, 10),
    'Farm - Agricultural Area (All Land) (ha)': sum(['RW-007', 'RW-008', 'RW-009', 'RW-010'].map(ha)),
    'Farm - Crop ': crops.map(t => t.crop).join(', '),
    'Farm - Total produced volume of the year -1 (kg/year) on the farm': produced.length ? round(produced.reduce((s, t) => s + t.producedKg!, 0), 1) : '',
    'Soil - 1.09 Percentage of synthetic N used vs total N': totalN ? round(synthN / totalN) : '',
    'Soil - 1.10 Nitrogen fertilizer productivity': totalN && dry.length ? round(dry.reduce((s, t) => s + t.dryKg!, 0) / totalN) : ''
  }
  // Livestock questions were removed from the final questionnaire.
  REGEN_COLUMNS.filter(c => c.startsWith('Livestock - ')).forEach(c => { regen[c] = 'NA' })
  for (const s of SURVEY_SECTIONS.filter(s => s.scope === 'farm')) {
    for (const q of s.questions) if (q.column) regen[q.column] = exportValue(q, answers, ctx)
  }

  const water = isAnswered(answers['RW-024']) ? answers['RW-024'] : ''
  const crop = crops.map(t => ({
    Name: answers.A03 || farmer.name,
    ExternalID: externalId,
    'Crop - Crop': t.crop,
    'Crop - Area (ha)': t.areaHa,
    'Crop - Yield (t/ha)': t.yieldTHa ?? '',
    'Crop - Dry Matter Content (%)': t.dryMatterPct ?? '',
    'Crop - Synthetic + Organic Nitrogen applied (kg/ha)': t.totalNKgHa,
    'Crop - Synthetic Nitrogen applied (kg/ha)': t.synthNKgHa,
    'Crop - Water applied through irrigation (m3/ha)': water,
    'Crop - Number of  applications of synthetic pesticide': t.pesticideApps ?? ''
  }))
  return { regen: toCsv(REGEN_COLUMNS, [regen]), crop: toCsv(CROP_COLUMNS, crop) }
}

const CFT_COLUMNS = ['Farmer ID', 'Field ID', 'Sheet', 'Section', 'Q ID', 'Question', 'Repeat group', 'Entry', 'Answer', 'Unit']

// Every answer as one row, so repeat groups (machines, sprays, irrigations…) keep their entries.
function buildCftRows(farmer: Farmer, answers: Answers, plots: Plot[], ctx: Ctx) {
  const rows: Record<string, any>[] = []
  const walk = (qs: Question[], v: Answers, base: Record<string, any>, groups: string[], entry: number[]) => {
    for (const q of qs) {
      if (q.type === 'group') {
        if (!isShown(q, v)) continue
        ;(v[q.id] || []).forEach((e: Answers, i: number) => walk(q.questions!, { ...v, ...e }, base, [...groups, labelOf(q, v)], [...entry, i + 1]))
        continue
      }
      const shown = isShown(q, v)
      const val = shown ? valueOf(q, v, ctx) : 'NA'
      rows.push({
        ...base,
        'Q ID': q.id,
        Question: labelOf(q, v),
        'Repeat group': groups.join(' › '),
        Entry: entry.join('.'),
        Answer: isAnswered(val) ? plain(val) : '',
        Unit: unitOf(q, v) || ''
      })
    }
  }
  const farmerId = answers.A02 || farmer.gipl_id || farmer.id
  for (const s of SURVEY_SECTIONS) {
    const base = { 'Farmer ID': farmerId, Sheet: s.sheet, Section: s.title }
    if (s.scope === 'farm') walk(s.questions, answers, { ...base, 'Field ID': '' }, [], [])
    else plots.forEach(p => { const v = fieldView(answers, p.id); walk(s.questions, v, { ...base, 'Field ID': v.B01 || p.id }, [], []) })
  }
  return toCsv(CFT_COLUMNS, rows)
}

export function buildExport(farmer: Farmer, answers: Answers, createdAt?: string) {
  const plots = farmerPlots(farmer)
  const ctx = makeCtx(answers, plots.map(p => p.id))
  return { ...buildImportRows(farmer, answers, ctx, createdAt), cft: buildCftRows(farmer, answers, plots, ctx) }
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
