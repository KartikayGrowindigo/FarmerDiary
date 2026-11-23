import store from '../store'
import { mergePrefill, prefillFromDiary } from '../survey'
import { Farmer, Plot } from '../../types'
import { Assessment, Doc, Pathway, PrefillRecord } from './types'
import { setAt, splitKey } from './engine'

// Answers we can take from data the app already holds: the farmer register, the FAT survey (which
// already includes diary-derived values) and the farmer's previous assessment. Only values whose
// meaning and unit match the CFP question are mapped; everything else is left for the admin.
// Prefilled answers are copies: editing them never changes the farmer's records.

type FieldAnswers = Record<string, any>

export type FarmerData = {
  farmer: Farmer
  plots: Plot[]
  /** FAT survey field answers (B01–L…) per selected plot. */
  fields: Record<string, FieldAnswers>
  /** Most recent assessment of this farmer, for re-using farm details (CFP keeps farms separately). */
  previous?: Assessment
}

const num = (v: any) => (v === '' || v === null || v === undefined || v === 'NA' ? null : Number(v))
const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp

// FAT survey product → CFP fertiliser of the same product. Others (NPK grades, SSP 16%, nano liquids…) have no exact match.
export const FERTILISER_MAP: Record<string, string> = {
  Urea: 'Urea - 46% N',
  DAP: 'Diammonium phosphate - 18% N / 46% P2O5',
  'MOP (muriate of potash)': 'Muriate of potash / Potassium chloride - 60% K2O',
  'Calcium nitrate': 'Calcium nitrate - 15.5% N',
  'Ammonium sulphate': 'Ammonium sulphate - 21% N'
}
// FAT survey current-crop residue → CFP residue management (API enum). "Removed from field" can be
// exported, fed on farm or sold, so it is not mapped.
export const RESIDUE_MAP: Record<string, string> = {
  Burnt: 'burning',
  'Incorporated into soil': 'left_on_field',
  'Retained on surface (mulch)': 'left_on_field'
}
// FAT survey rice water regime → CFP water regime during cultivation (IPCC categories).
export const WATER_REGIME_MAP: Record<string, string> = {
  'Continuously flooded': 'Continuously Flooded',
  'Single drainage period': 'Intermittently flooded',
  'Multiple drainage periods (AWD)': 'Intermittently flooded - multiple aeration',
  'Rainfed – regular': 'Rainfed'
}
// Diary crop names that are also CFP annual crop types. Wheat is not mapped: CFP splits Winter wheat and Springwheat.
const CROP_MAP: Record<string, string> = { Maize: 'Maize', Cotton: 'Cotton', Sugarcane: 'Sugarcane' }

export function buildPrefill(data: FarmerData, pathway: Pathway): { inputs: Doc; prefill: Record<string, PrefillRecord> } {
  let inputs: Doc = {}
  const prefill: Record<string, PrefillRecord> = {}
  const put = (key: string, value: any, source: string, detail?: string) => {
    inputs = setAt(inputs, splitKey(key), value)
    prefill[key] = { source, detail, value }
  }
  const { farmer, plots, fields, previous } = data

  // Farm: reuse the previous assessment's farm details, else what the register knows.
  const prevFarm = previous?.inputs?.farm || {}
  for (const k of ['name', 'country', 'latitude', 'longitude', 'climate', 'annualAverageTemperature', 'farmIdentifier', 'soilCharacteristic']) {
    if (prevFarm[k] !== undefined && prevFarm[k] !== '') put(`farm.${k}`, structuredClone(prevFarm[k]), `Assessment ${previous!.displayId}`, 'Farm details of this farmer\'s previous assessment')
  }
  if (!inputs.farm?.name) put('farm.name', `${farmer.name} farm`, 'Farmer register', `Farmer name: ${farmer.name}`)
  if (!inputs.farm?.farmIdentifier && farmer.gipl_id) put('farm.farmIdentifier', farmer.gipl_id, 'Farmer register', 'GIPL ID')

  const answers = plots.map(p => ({ plot: p, a: fields[p.id] || {} }))

  // Growing area in acres (CFP accepts acres, so no conversion).
  const surveyAcres = answers.map(({ a }) => num(a.B04))
  if (plots.length) {
    const fromSurvey = surveyAcres.every(v => v !== null)
    const acres = round(fromSurvey ? surveyAcres.reduce<number>((s, v) => s + v!, 0) : plots.reduce((s, p) => s + p.acres, 0), 4)
    if (acres > 0) put('cropDetails.area', { value: acres, unit: 'acres' }, fromSurvey ? 'FAT survey (B04)' : 'Farmer register (plot acres)', `${plots.length} plot${plots.length === 1 ? '' : 's'}`)
  }

  // Total harvest: quintals → tonnes (1 quintal = 0.1 tonne). Only when every selected plot has it.
  const qtl = answers.map(({ a }) => num(a.K01))
  if (plots.length && qtl.every(v => v !== null)) {
    const total = qtl.reduce<number>((s, v) => s + v!, 0)
    put('cropDetails.cropYield', { value: round(total / 10), unit: 'tonnes' }, 'FAT survey (K01)', `${round(total, 2)} quintals ÷ 10`)
  }

  // Crop type (annual pathway only), when every plot grows the same mapped crop.
  const crops = new Set(answers.map(({ a }) => a.B02).filter(Boolean))
  if (pathway === 'annual_crops' && crops.size === 1) {
    const crop = CROP_MAP[[...crops][0]]
    if (crop) put('cropDetails.cropType', crop, 'FAT survey (B02)')
  }

  // Paddy water regime, when every plot agrees.
  if (pathway === 'paddy_rice') {
    const regimes = new Set(answers.map(({ a }) => WATER_REGIME_MAP[a.J12]))
    const only = [...regimes][0]
    if (regimes.size === 1 && only) put('cropDetails.waterRegime', only, 'FAT survey (J12)')
  }

  // Residue management, when every plot agrees.
  const residues = new Set(answers.map(({ a }) => RESIDUE_MAP[a.E05]))
  const residue = [...residues][0]
  if (plots.length && residues.size === 1 && residue) put('residue.residueManagementPractice', residue, 'FAT survey (E05)')

  // Fertilisers: total product per CFP type across plots, as kg per acre of the whole growing area.
  const totalAcres = num(inputs.cropDetails?.area?.value)
  if (totalAcres) {
    const byType = new Map<string, { kg: number; entries: number }>()
    for (const { a } of answers) {
      for (const e of a.F_fertilisers || []) {
        const type = FERTILISER_MAP[e.F02]
        const perAcre = num(e.F04)
        const acres = num(e.F05) ?? num(a.B04)
        if (!type || perAcre === null || acres === null) continue
        const t = byType.get(type) ?? { kg: 0, entries: 0 }
        t.kg += perAcre * acres
        t.entries++
        byType.set(type, t)
      }
    }
    if (byType.size) {
      const list = [...byType].map(([type, t]) => ({ type, applicationRate: { value: round(t.kg / totalAcres), unit: 'kg per acre' }, weightOrUnit: 'product' }))
      put('fertiliser.fertilisers', list, 'FAT survey (F02, F04, F05)',
        [...byType].map(([type, t]) => `${type}: ${round(t.kg, 2)} kg from ${t.entries} application${t.entries === 1 ? '' : 's'} ÷ ${totalAcres} acres`).join('; '))
    }
  }

  return { inputs, prefill }
}

/** Collects what the app holds for this farmer and plots (reads the local store). */
export function gatherFarmerData(farmer: Farmer, plotIds: string[]): FarmerData {
  const plots = store.getPlots().filter(p => p.farmerId === farmer.id && plotIds.includes(p.id))
  const { answers } = mergePrefill(prefillFromDiary(farmer), store.getSurvey(farmer.id)?.answers)
  const fields: Record<string, FieldAnswers> = {}
  for (const p of plots) fields[p.id] = answers.fields?.[p.id] || {}
  const previous = store.getAssessments()
    .filter(a => a.farmerId === farmer.id && !a.deletedAt)
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt))[0]
  return { farmer, plots, fields, previous }
}
