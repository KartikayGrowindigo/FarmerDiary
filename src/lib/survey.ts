import store from './store'
import { Farmer, Plot } from '../types'
import {
  SURVEY_SECTIONS, Answers, Ctx, Question, HA_PER_ACRE, cropTotals, exportValue, fieldView, isShown, labelOf, makeCtx, plain, unitOf, valueOf, isAnswered
} from '../config/fatSurvey'
import { REGEN_COLUMNS, CROP_COLUMNS } from '../config/fatColumns'
import { MANURE } from '../config/moduleFields'
import { cftPayload } from './diary'

const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp
const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

const LISTED_CROPS = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton']

const copy = (from: Answers | undefined, ids: string[]) =>
  Object.fromEntries(ids.filter(id => from && isAnswered(from[id])).map(id => [id, from![id]]))

// Field answers (B–L) we can take from this plot's diary, so the advisor only confirms them.
function prefillField(plot: Plot): Answers {
  const cycles = store.getCropCyclesForPlot(plot.id)
  const cycle = cycles[cycles.length - 1]
  const previous = cycles[cycles.length - 2]
  // Diary entries of one activity as CFT answers, oldest first.
  const entries = (cycleId: string, module: string) => store.getActivitiesForCropCycle(cycleId)
    .filter(a => a.module === module)
    .reverse()
    .map(a => ({ date: a.date, old: !a.payload?.cft, p: cftPayload(a, plot.acres) }))
  const of = (module: string) => (cycle ? entries(cycle.id, module) : [])
  const last = (list: { p: Answers }[]) => list[list.length - 1]?.p
  const out: Answers = { B01: plot.id, B04: plot.acres }

  if (cycle) out.B02 = LISTED_CROPS.includes(cycle.crop) ? cycle.crop : 'Other'
  if (previous) {
    out.E01 = LISTED_CROPS.includes(previous.crop) ? previous.crop : 'Other'
    const residue = last(entries(previous.id, 'Residue Management'))
    if (residue?.E05) {
      out.E02 = residue.E05
      if (residue.E06) out.E03 = residue.E06
      if (residue.E05 === 'Burnt') out.E04 = plot.acres
    }
  }

  const seed = of('Seed & Sowing')
  Object.assign(out, copy(last(seed), ['B03', 'B06', 'B09', 'B10', 'B11', 'B12']))
  const sown = cycle?.sowingDate || seed[0]?.date
  if (sown) out.B07 = sown

  const prep = of('Land Preparation & Sowing')
  Object.assign(out, copy(last(prep), ['C01', 'C02']))
  const machines = prep.filter(e => e.p.D02).map(e => ({ _diary: true, ...copy(e.p, ['D02', 'D03', 'D04', 'D05', 'D06']) }))
  if (machines.length) {
    out.D01 = 'Yes'
    out.D_machines = machines
  }

  Object.assign(out, copy(last(of('Residue Management')), ['E05', 'E06', 'E07']))

  const nutrients = of('Fertilizer & Nutrient Management')
  const fertilisers = nutrients.filter(e => e.p.kind !== MANURE && e.p.F02)
    .map(e => ({ _diary: true, F01: e.date, ...copy(e.p, ['F02', 'F03', 'F04', 'F05', 'F06', 'F07']) }))
  if (fertilisers.length) out.F_fertilisers = fertilisers
  const manures = nutrients.filter(e => e.p.kind === MANURE && e.p.G02)
    .map(e => ({ _diary: true, G02: e.p.G02, G03: e.date.slice(0, 7), G05: e.p.G05 ?? plot.acres, ...copy(e.p, ['G04']) }))
  if (manures.length) {
    out.G01 = 'Yes'
    out.G_manures = manures
  }

  // Old entries held one product each: products logged the same day were one spray.
  const pest = of('Pest & Disease Management')
  if (pest.length) {
    const sprays: Answers[] = []
    const oldByDate = new Map<string, Answers>()
    for (const e of pest) {
      const merged = e.old && oldByDate.get(e.date)
      if (merged) {
        merged.I_products.push(...(e.p.I_products || []))
        continue
      }
      const spray = { _diary: true, I02: e.date, I04: e.p.I04 ?? plot.acres, ...copy(e.p, ['I03', 'I05']), I_products: [...(e.p.I_products || [])] }
      sprays.push(spray)
      if (e.old) oldByDate.set(e.date, spray)
    }
    out.I01 = 'Yes'
    out.I_sprays = sprays
  }

  const water = of('Water Management')
  if (water.length) {
    Object.assign(out, copy(last(water), ['J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J07', 'J12']))
    out.J_irrigations = water.map(e => ({ _diary: true, J08: e.date, J09: e.p.J09 ?? plot.acres, ...copy(e.p, ['J10', 'J11']) }))
  }

  const harvest = of('Harvesting')
  if (harvest.length) {
    const best = Math.max(...harvest.map(e => Number(e.p.K01pa) || 0))
    if (best) out.K01 = round(best * plot.acres, 2)
    Object.assign(out, copy(last(harvest), ['K02', 'K04', 'K06']))
  }
  const harvested = cycle?.harvestDate || harvest[harvest.length - 1]?.date
  if (harvested) out.B08 = harvested
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
