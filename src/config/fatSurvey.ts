// Final CFT & Rice-Wheat questionnaire, mirrored from "CFT_RW_Questionnaire_Final_v3 (2).xlsx".
// - Sections A–L come from the "Questionnaire" tab. A is asked once; B–L are filled per field.
// - The whole-farm Regen Ag sections come from the "Koltiva" tab (RW-xxx). Rows marked "Repeated"
//   or "Indirectly repeated" there are not asked again: they are taken from A–L (see lib/survey.ts
//   and the calculated questions below). Livestock rows (RW-052–062) were removed from the final
//   sheet, so their import columns export as NA.
// Question ids are the sheet's Q IDs and are used as answer keys. Ids are unique across all
// sections, so the answers of a field, a repeat entry and the farm can be merged into one view.
// Answer lists are copied from the "Dropdown lists" tab.

export type Answers = Record<string, any>

export type Ctx = { fields: { plotId: string; a: Answers }[] }

export type Question = {
  id: string
  label: string | ((v: Answers) => string)
  help?: string
  type: 'choice' | 'multi' | 'number' | 'integer' | 'text' | 'phone' | 'date' | 'month' | 'calc' | 'group'
  options?: string[]
  // multi: picking one of these clears the other picks.
  exclusive?: string[]
  unit?: string | ((v: Answers) => string)
  min?: number
  max?: number
  step?: number
  // Required unless marked optional (sheet "Required = No", or hard for farmers to answer).
  optional?: boolean
  showIf?: (v: Answers) => boolean
  validate?: (val: any, v: Answers) => string | null
  // Derived from other answers; shown read-only.
  calc?: (v: Answers, ctx: Ctx) => number | string | null
  // Suggested answer used until the advisor picks one.
  derive?: (v: Answers, ctx: Ctx) => any
  // Repeat group: entries are stored as an array under `id`.
  questions?: Question[]
  item?: string
  // 1 when the group is opened by a Yes answer and needs at least one entry.
  minEntries?: number
  // Regen AG5.1 import column this answer exports to.
  column?: string
  toExport?: (val: any, v: Answers) => any
}

export type Section = {
  key: string
  sheet: 'Questionnaire' | 'Koltiva'
  scope: 'farm' | 'field'
  title: string
  titlePa: string
  icon: string
  tone: { from: string; to: string; tint: string; ink: string }
  intro?: string
  questions: Question[]
}

const YES_NO = ['Yes', 'No']
const YES_PARTIAL_NO = ['Yes', 'Partially', 'No']
const SEASON = ['Kharif', 'Rabi', 'Zaid']
const CROP = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Other']
const PREVIOUS_CROP = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Fallow', 'Other']
const ESTABLISHMENT = ['Puddled transplanting (TPR)', 'Wet direct seeding (Wet DSR)', 'Dry direct seeding (Dry DSR)', 'Line sowing – seed drill', 'Zero-till sowing', 'Broadcasting', 'Planting (setts / seedlings)', 'Other']
const TILLAGE = ['Conventional (CT)', 'Reduced (RT)', 'Zero tillage (ZT)']
const MACHINERY = ['MB plough', 'Disc harrow', 'Cultivator', 'Rotavator', 'Suhaga / planker', 'Puddler', 'Laser leveller', 'Seed drill', 'Zero-till drill', 'Happy seeder', 'Super seeder', 'Smart seeder', 'Surface seeder', 'Combine harvester', 'Sugarcane harvester', 'Thresher', 'Shredder / mulcher', 'Straw baler', 'Other']
const FUEL = ['Diesel', 'Petrol', 'Electric']
const RESIDUE_PREVIOUS = ['Incorporated into soil', 'Retained on surface (mulch)', 'Burnt', 'Removed from field (baled / sold / fodder)', 'Not applicable (fallow)']
const RESIDUE_CURRENT = RESIDUE_PREVIOUS.slice(0, 4)
const FERTILISER = ['Urea', 'Ammonium sulphate', 'DAP', 'MOP (muriate of potash)', 'SSP (single super phosphate)', 'Calcium nitrate', 'NPK 10:26:26', 'NPK 12:32:16', 'NPK 15:15:15', 'NPK 20:20:0', 'NPK 24:24:0', 'WSF 19:19:19', 'WSF 12:61:0', 'WSF 17:44:0', 'WSF 13:40:13', 'WSF 13:0:45', 'Nano Urea (liquid)', 'Nano DAP (liquid)', 'Zinc sulphate', 'Bio-fertiliser (specify)', 'Other (specify)']
const FERT_METHOD = ['Broadcast', 'Band / side dressing', 'Drilled with seed (basal)', 'Fertigation', 'Foliar spray']
const FERTIGATION_EQUIPMENT = ['Venturi', 'Fertiliser tank', 'Pump', 'Other']
const ORGANIC_TYPE = ['FYM', 'Compost', 'Vermicompost', 'Other', 'No organic amendment']
const N_FIXING_PRACTICE = ['Legume crop', 'Cover crop', 'None']
const LEGUME_COVER_CROP = ['Soybean', 'Greengram', 'Blackgram', 'Cowpea', 'Groundnut', 'Dhaincha', 'Sunhemp', 'Other (legume)', 'Other (cereal)']
const SPRAYER = ['Manual knapsack', 'Battery-operated', 'Petrol power sprayer', 'Tractor-mounted']
const CP_TYPE = ['Herbicide', 'Insecticide', 'Fungicide', 'Other']
const HERBICIDE_TIMING = ['Pre-emergence', 'Post-emergence']
const CP_UNIT = ['ml per acre', 'L per acre', 'g per acre', 'kg per acre']
const IRRIGATION_METHOD = ['Not irrigated (rainfed)', 'Flood', 'Surface (furrow / check basin)', 'Drip', 'Sprinkler', 'AWD (alternate wetting & drying)']
const WATER_SOURCE = ['Borewell', 'Tubewell', 'Open well', 'Canal', 'Other']
const PUMP_POWER = ['Electric (grid)', 'Diesel', 'Solar', 'No pump (gravity flow)']
const RICE_WATER_REGIME = ['Continuously flooded', 'Single drainage period', 'Multiple drainage periods (AWD)', 'Rainfed – regular', 'Upland']
const VEHICLE = ['Light goods vehicle', 'Heavy goods vehicle', 'Tractor / pickup']
const TREE_MODEL = ['Boundary', 'Block plantation', 'Scattered trees', 'Agroforestry (intercropped)']
const GENDER = ['Male', 'Female', 'Other', 'Prefer not to say']
const SEED_TREATMENT_TYPE = ['Chemical fungicide', 'Chemical insecticide', 'Fungicide + insecticide', 'Bio-agent (Trichoderma, Pseudomonas)', 'Bio-fertiliser (Azotobacter, Rhizobium, PSB)', 'Other']
const CROPS_3YR = ['Rice', 'Wheat', 'Maize', 'Mustard', 'Potato', 'Sugarcane', 'Cotton', 'Greengram', 'Blackgram', 'Lentil', 'Chickpea', 'Pigeon pea', 'Soybean', 'Groundnut', 'Vegetables', 'Fodder crops', 'Cover crop / green manure (counts as one)', 'Other']
const ROTATION_SHARE = ['Not rotated – same crop every season', '1–10%', '11–30%', '31–50%', '51–70%', '71–90%', '91–100%']
const COVER_SHARE = ['0–10%', '11–30%', '31–50%', '51–70%', '71–90%', '91–100%', 'Not possible – less than 2 months between harvest and next sowing']
const COVER_TYPES = ['(a) Grasses / cereals (e.g. oats, sorghum)', '(b) Legumes (e.g. dhaincha, sunhemp, cowpea, greengram)', '(c) Brassicas (e.g. mustard, radish)', '(d) Other broadleaves (e.g. buckwheat, flax)', '(e) Deep-rooted (e.g. sunflower, pigeon pea)', 'No cover crop']
const RESIDUE_SHARE = ['0–50%', '51–60%', '61–70%', '71–80%', '81–90%', '91–100%']
const COVER10_SHARE = ['0–30%', '31–50%', '51–70%', '71–90%', '91–100%']
const SHARE = ['0–10%', '11–30%', '31–50%', '51–70%', '71–90%', '91–100%']
const FOUR_R = ['(a) Right source – product suited to crop and soil', '(b) Right rate – dose based on soil test or crop need', '(c) Right time – split doses when the crop needs them', '(d) Right place – placed near the roots (band, drill, fertigation)']
const IPM = ['(a) Pest & disease monitoring (field scouting, traps)', '(b) Spray only when the pest crosses the damage threshold', '(c) Correct quantity / dose as per label', '(d) Right time (pest stage, waiting period before harvest)', '(e) Right place – spot / targeted spraying only where needed']
const NO_SYNTHETIC_SHARE = ['0–5%', '6–25%', '26–50%', '51–75%', '76–100%']
const HABITAT_SHARE = ['0%', '1–4%', '5–9%', '10–14%', '15% or more']
const PRECISION_TECH = ['(a) Auto-steer / parallel driving in machines', '(b) Section control or variable-rate application of fertiliser or pesticide', '(c) Digital farm decision-support app / advisory tool', '(d) Optical / crop sensors']
const EVIDENCE = ['Farmer diary', 'Fertiliser / pesticide purchase bills', 'Soil Health Card / soil report', 'Procurement receipt', 'Field photos', 'None', 'Other']
// Koltiva rows without a stored list keep the answers seen in the import sheets.
const SOIL_INTERVAL = ['No Analysis', '1 year', '2 years', '3 years', '5 years', 'More than 5 years']
const FAT_IRRIGATION = ['Surface (Flooding, Furrow, Border etc.)', 'Alternate Wetting and Drying (AWD) all season', 'Sprinkler', 'Drip', 'No irrigation']
const NO_WATER_BODY = 'No water body on the farm'
const WATER_DISTANCE = [NO_WATER_BODY, 'Less than 5 m', '5–10 m', 'More than 10 m']

export const HA_PER_ACRE = 0.404686
// N share by weight (kg N per kg, or per litre for the nano liquids).
const N_SHARE: Record<string, number> = {
  Urea: 0.46, 'Ammonium sulphate': 0.206, DAP: 0.18, 'Calcium nitrate': 0.155,
  'NPK 10:26:26': 0.1, 'NPK 12:32:16': 0.12, 'NPK 15:15:15': 0.15, 'NPK 20:20:0': 0.2, 'NPK 24:24:0': 0.24,
  'WSF 19:19:19': 0.19, 'WSF 12:61:0': 0.12, 'WSF 17:44:0': 0.17, 'WSF 13:40:13': 0.13, 'WSF 13:0:45': 0.13,
  'Nano Urea (liquid)': 0.04, 'Nano DAP (liquid)': 0.08
}
// Typical N content of organic manures on a fresh-weight basis.
const ORGANIC_N_SHARE: Record<string, number> = { FYM: 0.005, Compost: 0.005, Vermicompost: 0.015, Other: 0.005 }

export const num = (v: any) => (v === '' || v === null || v === undefined || v === 'NA' ? null : Number(v))
const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (date: string, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const isNano = (product?: string) => !!product && product.startsWith('Nano')

const atMostFieldArea = (val: any, v: Answers) =>
  num(val)! <= 0 ? 'Should be more than 0' : num(v.B04) !== null && num(val)! > num(v.B04)! ? `Cannot be more than the field area (${v.B04} acres)` : null

// Date must fall between sowing minus `before` days and harvest.
const inSeason = (before: number) => (val: string, v: Answers) => {
  if (v.B07 && val < addDays(v.B07, -before)) return `Should be no earlier than ${before} days before sowing (${v.B07})`
  if (v.B08 && val > v.B08) return `Should be on or before the harvest date (${v.B08})`
  return null
}

const count = (val: any) => (Array.isArray(val) ? val.length : 0)
// "Yes" = all principles, "Partially" = the ones ticked.
const principles = (total: number, partial: string) => (val: string, v: Answers) => {
  if (val === 'Yes') return `${total} principles`
  if (val === 'No') return 'None'
  const n = count(v[partial])
  return n ? `${n} principle${n === 1 ? '' : 's'}` : 'None'
}
const partialPicks = (total: number) => (val: any) =>
  count(val) >= total ? `All ${total} ticked – answer "Yes" above instead` : null

// ---- Totals per crop across the farmer's fields (feeds the Koltiva crop questions) ----

function fieldNKg(a: Answers) {
  const fieldAcres = num(a.B04)
  const synth = (a.F_fertilisers || []).reduce((s: number, e: Answers) =>
    s + (num(e.F04) ?? 0) * (N_SHARE[e.F02] ?? 0) * (num(e.F05) ?? fieldAcres ?? 0), 0)
  const organic = a.G01 !== 'Yes' ? 0 : (a.G_manures || []).reduce((s: number, e: Answers) =>
    s + (num(e.G04) ?? 0) * (ORGANIC_N_SHARE[e.G02] ?? 0) * (num(e.G05) ?? 0), 0)
  return { synth, organic }
}

export type CropTotal = {
  crop: string
  areaHa: number
  yieldTHa: number | null
  producedKg: number | null
  totalNKgHa: number
  synthNKgHa: number
  totalNKg: number
  synthNKg: number
  dryKg: number | null
  dryMatterPct: number | null
  pesticideApps: number | null
}

export function cropTotals(ctx: Ctx): CropTotal[] {
  const by = new Map<string, { acres: number; qtl: number; qtlAcres: number; synth: number; organic: number; mSum: number; mAcres: number; sSum: number; sAcres: number }>()
  for (const { a } of ctx.fields) {
    const acres = num(a.B04)
    if (!a.B02 || !acres) continue
    const t = by.get(a.B02) ?? { acres: 0, qtl: 0, qtlAcres: 0, synth: 0, organic: 0, mSum: 0, mAcres: 0, sSum: 0, sAcres: 0 }
    t.acres += acres
    if (num(a.K01) !== null) { t.qtl += num(a.K01)!; t.qtlAcres += acres }
    const n = fieldNKg(a)
    t.synth += n.synth
    t.organic += n.organic
    if (num(a.K02) !== null) { t.mSum += num(a.K02)! * acres; t.mAcres += acres }
    if (a.I01) { t.sSum += (a.I01 === 'Yes' ? (a.I_sprays || []).length : 0) * acres; t.sAcres += acres }
    by.set(a.B02, t)
  }
  return [...by.entries()].map(([crop, t]) => {
    const ha = t.acres * HA_PER_ACRE
    const dm = t.mAcres ? 100 - t.mSum / t.mAcres : null
    return {
      crop,
      areaHa: round(ha),
      yieldTHa: t.qtlAcres ? round((t.qtl * 0.1) / (t.qtlAcres * HA_PER_ACRE), 3) : null,
      producedKg: t.qtlAcres ? round(t.qtl * 100, 1) : null,
      totalNKgHa: round((t.synth + t.organic) / ha, 2),
      synthNKgHa: round(t.synth / ha, 2),
      totalNKg: t.synth + t.organic,
      synthNKg: t.synth,
      dryKg: t.qtlAcres && dm !== null ? t.qtl * 100 * (dm / 100) : null,
      dryMatterPct: dm === null ? null : round(dm, 2),
      pesticideApps: t.sAcres ? Math.round(t.sSum / t.sAcres) : null
    }
  })
}

// One value per crop: a number for a single crop, "Wheat: x · Rice: y" for several.
const perCrop = (pick: (t: CropTotal) => number | null) => (_: Answers, ctx: Ctx) => {
  const rows = cropTotals(ctx).filter(t => pick(t) !== null)
  if (!rows.length) return null
  return rows.length === 1 ? pick(rows[0]) : rows.map(t => `${t.crop}: ${pick(t)!.toLocaleString('en-IN')}`).join(' · ')
}

const FAT_IRRIGATION_FROM_J01: Record<string, string> = {
  'Not irrigated (rainfed)': 'No irrigation',
  Flood: 'Surface (Flooding, Furrow, Border etc.)',
  'Surface (furrow / check basin)': 'Surface (Flooding, Furrow, Border etc.)',
  Drip: 'Drip',
  Sprinkler: 'Sprinkler',
  'AWD (alternate wetting & drying)': 'Alternate Wetting and Drying (AWD) all season'
}

const tone = {
  teal: { from: '#0F766E', to: '#2DD4BF', tint: '#CCFBF1', ink: '#115E59' },
  orange: { from: '#C2410C', to: '#F59E0B', tint: '#FFEDD5', ink: '#9A3412' },
  amber: { from: '#B45309', to: '#FACC15', tint: '#FEF9C3', ink: '#854D0E' },
  brown: { from: '#92400E', to: '#D97706', tint: '#FEF3C7', ink: '#78350F' },
  green: { from: '#15803D', to: '#84CC16', tint: '#ECFCCB', ink: '#166534' },
  emerald: { from: '#047857', to: '#34D399', tint: '#D1FAE5', ink: '#065F46' },
  blue: { from: '#0369A1', to: '#38BDF8', tint: '#E0F2FE', ink: '#075985' },
  rose: { from: '#BE123C', to: '#FB7185', tint: '#FFE4E6', ink: '#9F1239' },
  violet: { from: '#6D28D9', to: '#C084FC', tint: '#F3E8FF', ink: '#5B21B6' },
  indigo: { from: '#4338CA', to: '#818CF8', tint: '#E0E7FF', ink: '#3730A3' }
}

const irrigated = (v: Answers) => !!v.J01 && v.J01 !== 'Not irrigated (rainfed)'
const hasPump = (v: Answers) => irrigated(v) && v.J03 !== 'No pump (gravity flow)'
const organicApplied = (v: Answers) => v.G02 !== 'No organic amendment'
const hasWaterBody = (v: Answers) => !!v['RW-049'] && v['RW-049'] !== NO_WATER_BODY
const HARD = 'Hard for farmers to answer – fill from the soil report if available.'

export const SURVEY_SECTIONS: Section[] = [
  {
    key: 'A', sheet: 'Questionnaire', scope: 'farm',
    title: 'A. Farmer Details', titlePa: 'ਕਿਸਾਨ ਦਾ ਵੇਰਵਾ', icon: 'badge', tone: tone.teal,
    intro: 'Asked once. Pre-filled from the farmer profile where possible.',
    questions: [
      { id: 'A01', label: 'Name of the field staff / Kisan Advisor collecting this data', type: 'text' },
      { id: 'A02', label: 'Farmer ID', help: 'Must match the farmer master.', type: 'text' },
      { id: 'A03', label: "Farmer's full name", type: 'text' },
      { id: 'A04', label: 'Village', type: 'text' },
      { id: 'A05', label: 'Taluka', type: 'text' },
      { id: 'A06', label: 'District', type: 'text' },
      { id: 'A07', label: 'State', type: 'text' },
      { id: 'A08', label: 'Crop year', help: 'YYYY-YY, e.g. 2025-26', type: 'text', validate: val => (/^\d{4}-\d{2}$/.test(val) ? null : 'Use the format YYYY-YY, e.g. 2025-26') },
      { id: 'A09', label: 'Season', type: 'choice', options: SEASON },
      { id: 'A10', label: "Farmer's gender", type: 'choice', options: GENDER },
      { id: 'A11', label: "Farmer's mobile number", help: 'Confirm with the farmer.', type: 'phone' },
      { id: 'A12', label: 'Name of the person interviewed', help: "Defaults to the farmer's name; change it if a family member or farm manager answered.", type: 'text', derive: v => v.A03 || undefined },
      { id: 'A13', label: 'Date of data collection', type: 'date', validate: val => (val > today() ? 'Cannot be in the future' : null) }
    ]
  },
  {
    key: 'B', sheet: 'Questionnaire', scope: 'field',
    title: 'B. Field & Crop', titlePa: 'ਖੇਤ ਅਤੇ ਫ਼ਸਲ', icon: 'grass', tone: tone.amber,
    intro: 'Sections B–L are filled for each field for this crop season. Switch fields above.',
    questions: [
      { id: 'B01', label: 'Field ID', help: 'Must match the field register.', type: 'text' },
      { id: 'B02', label: 'Which crop is grown on this field this season?', type: 'choice', options: CROP },
      { id: 'B03', label: 'Variety sown', type: 'text' },
      { id: 'B04', label: 'Area under this crop in this field', help: 'Used to convert per-acre values to totals.', type: 'number', unit: 'acres', step: 0.01, validate: val => (num(val)! > 0 ? null : 'Should be more than 0') },
      { id: 'B05', label: 'Regenerative acres registered with Grow Indigo in this field', type: 'number', unit: 'acres', min: 0, step: 0.01, validate: (val, v) => (num(v.B04) !== null && num(val)! > num(v.B04)! ? `Cannot be more than the field area (${v.B04} acres)` : null) },
      { id: 'B06', label: 'Crop establishment / sowing method', type: 'choice', options: ESTABLISHMENT },
      { id: 'B07', label: 'Date of sowing / transplanting', type: 'date', validate: (val, v) => (v.B08 && val > v.B08 ? 'Should be on or before the harvest date' : null) },
      { id: 'B08', label: 'Date of harvest', type: 'date', validate: (val, v) => (v.B07 && val < v.B07 ? 'Should be on or after the sowing date' : null) },
      { id: 'B09', label: 'Seed rate', help: "Transplanted crop: seed used in the nursery for this field's area.", type: 'number', unit: 'kg per acre', min: 1, max: 100 },
      { id: 'B10', label: 'Was the seed treated before sowing?', type: 'choice', options: YES_NO },
      { id: 'B11', label: 'Type of seed treatment', type: 'choice', options: SEED_TREATMENT_TYPE, showIf: v => v.B10 === 'Yes' },
      { id: 'B12', label: 'Seed treatment product name and dose', help: 'e.g. Carbendazim 2 g per kg seed', type: 'text', showIf: v => v.B10 === 'Yes' }
    ]
  },
  {
    key: 'C', sheet: 'Questionnaire', scope: 'field',
    title: 'C. Tillage', titlePa: 'ਵਾਹੀ', icon: 'landslide', tone: tone.brown,
    questions: [
      { id: 'C01', label: 'Which tillage practice was followed for this crop?', type: 'choice', options: TILLAGE },
      { id: 'C02', label: 'Approximate depth of tillage', type: 'number', unit: 'cm', min: 0, max: 30, showIf: v => v.C01 !== 'Zero tillage (ZT)' }
    ]
  },
  {
    key: 'D', sheet: 'Questionnaire', scope: 'field',
    title: 'D. Machinery & Fuel', titlePa: 'ਮਸ਼ੀਨਰੀ ਅਤੇ ਬਾਲਣ', icon: 'local_gas_station', tone: tone.indigo,
    intro: 'Covers land preparation, sowing, harvesting, threshing and residue management. Spraying fuel goes in Crop Protection and pump fuel in Irrigation.',
    questions: [
      { id: 'D01', label: 'Was any fuel-powered machinery used on this field this season?', type: 'choice', options: YES_NO },
      {
        id: 'D_machines', label: 'Machinery operations', help: 'One entry per machine. The operation is known from the machine.', type: 'group', item: 'machine', minEntries: 1,
        showIf: v => v.D01 === 'Yes',
        questions: [
          { id: 'D02', label: 'Machine / implement used', type: 'choice', options: MACHINERY },
          { id: 'D03', label: 'Number of passes', type: 'integer', unit: 'passes', min: 1, max: 4 },
          { id: 'D04', label: 'Fuel / power type', type: 'choice', options: FUEL },
          { id: 'D05', label: 'Fuel used for this operation', help: 'If the farmer only knows the total, divide it by the area worked.', type: 'number', unit: 'litres per acre (all passes)', min: 0, max: 40, showIf: v => v.D04 !== 'Electric' },
          { id: 'D06', label: 'Time taken per acre', help: 'Optional. Used to estimate fuel when D05 is not known.', type: 'number', unit: 'hours per acre', min: 0, max: 10, optional: true }
        ]
      }
    ]
  },
  {
    key: 'E', sheet: 'Questionnaire', scope: 'field',
    title: 'E. Crop Residue', titlePa: 'ਫ਼ਸਲ ਦੀ ਰਹਿੰਦ-ਖੂੰਹਦ', icon: 'compost', tone: tone.orange,
    questions: [
      { id: 'E01', label: 'Which crop was grown on this field in the previous season?', type: 'choice', options: PREVIOUS_CROP },
      { id: 'E02', label: v => `How was the residue of the previous crop${v.E01 ? ` (${v.E01})` : ''} managed?`, type: 'choice', options: RESIDUE_PREVIOUS },
      { id: 'E03', label: v => `Quantity of previous-crop${v.E01 ? ` (${v.E01})` : ''} residue`, type: 'number', unit: 'tonnes per acre', min: 0, max: 10, showIf: v => v.E02 !== 'Not applicable (fallow)' },
      { id: 'E04', label: 'Area on which the residue was burnt', type: 'number', unit: 'acres', step: 0.01, showIf: v => v.E02 === 'Burnt', validate: atMostFieldArea },
      { id: 'E05', label: 'How was the residue of the current crop managed after harvest?', type: 'choice', options: RESIDUE_CURRENT },
      { id: 'E06', label: 'Quantity of current-crop residue', type: 'number', unit: 'tonnes per acre', min: 0, max: 10 },
      { id: 'E07', label: 'Percentage of current-crop residue left on or incorporated into the field', help: 'Enter 0 if all residue was removed or burnt.', type: 'number', unit: '%', min: 0, max: 100 }
    ]
  },
  {
    key: 'F', sheet: 'Questionnaire', scope: 'field',
    title: 'F. Fertilisers', titlePa: 'ਖਾਦਾਂ', icon: 'science', tone: tone.emerald,
    intro: 'One entry per product per application, so each split dose and each product in a mix is its own entry. Leave empty if no fertiliser was applied.',
    questions: [
      {
        id: 'F_fertilisers', label: 'Fertiliser applications', type: 'group', item: 'fertiliser',
        questions: [
          { id: 'F01', label: 'Date of application', type: 'date', validate: inSeason(15) },
          { id: 'F02', label: 'Fertiliser product', type: 'choice', options: FERTILISER },
          { id: 'F03', label: 'Product or brand name', type: 'text', showIf: v => v.F02 === 'Bio-fertiliser (specify)' || v.F02 === 'Other (specify)' },
          {
            id: 'F04', label: 'Quantity applied', help: 'Per acre of the area below.', type: 'number',
            unit: v => (isNano(v.F02) ? 'litres per acre' : 'kg per acre'),
            validate: (val, v) => {
              const n = num(val)!
              if (isNano(v.F02)) return n < 0.1 || n > 5 ? 'Should be between 0.1 and 5 litres' : null
              return n < 1 || n > 300 ? 'Should be between 1 and 300 kg' : null
            }
          },
          { id: 'F05', label: 'Area on which this product was applied', help: 'Defaults to the field area.', type: 'number', unit: 'acres', step: 0.01, derive: v => v.B04, validate: atMostFieldArea },
          { id: 'F06', label: 'Application method', type: 'choice', options: FERT_METHOD },
          { id: 'F07', label: 'Fertigation equipment used', type: 'choice', options: FERTIGATION_EQUIPMENT, showIf: v => v.F06 === 'Fertigation' }
        ]
      }
    ]
  },
  {
    key: 'G', sheet: 'Questionnaire', scope: 'field',
    title: 'G. Organic Manures', titlePa: 'ਜੈਵਿਕ ਖਾਦਾਂ', icon: 'eco', tone: tone.green,
    questions: [
      { id: 'G01', label: 'Were organic manures or compost applied to this crop?', type: 'choice', options: YES_NO },
      {
        id: 'G_manures', label: 'Organic manure applications', help: 'One entry per application.', type: 'group', item: 'manure application', minEntries: 1,
        showIf: v => v.G01 === 'Yes',
        questions: [
          { id: 'G02', label: 'Type of organic manure', type: 'choice', options: ORGANIC_TYPE },
          { id: 'G03', label: 'Month of application', type: 'month', showIf: organicApplied },
          { id: 'G04', label: 'Amount applied', type: 'number', unit: 'kg per acre', min: 100, max: 20000, showIf: organicApplied },
          { id: 'G05', label: 'Area on which it was applied', type: 'number', unit: 'acres', step: 0.01, showIf: organicApplied, validate: atMostFieldArea }
        ]
      }
    ]
  },
  {
    key: 'H', sheet: 'Questionnaire', scope: 'field',
    title: 'H. Cover Crops & Legumes', titlePa: 'ਕਵਰ ਫ਼ਸਲਾਂ ਅਤੇ ਦਾਲਾਂ', icon: 'spa', tone: tone.green,
    questions: [
      { id: 'H01', label: 'Was a legume or cover crop grown on this field during the year?', type: 'choice', options: N_FIXING_PRACTICE },
      {
        id: 'H_crops', label: 'Legume / cover crops', help: 'One entry per crop.', type: 'group', item: 'crop', minEntries: 1,
        showIf: v => !!v.H01 && v.H01 !== 'None',
        questions: [
          { id: 'H02', label: 'Which legume / cover crop?', type: 'choice', options: LEGUME_COVER_CROP },
          { id: 'H03', label: 'Sowing date', type: 'date' },
          { id: 'H04', label: 'Harvest or termination date', type: 'date', validate: (val, v) => (v.H03 && val < v.H03 ? 'Should be on or after the sowing date' : null) },
          { id: 'H05', label: 'Area used', type: 'number', unit: 'acres', step: 0.01, validate: atMostFieldArea },
          { id: 'H06', label: 'Production', type: 'number', unit: 'quintals per acre', min: 0, max: 500 }
        ]
      }
    ]
  },
  {
    key: 'I', sheet: 'Questionnaire', scope: 'field',
    title: 'I. Crop Protection', titlePa: 'ਫ਼ਸਲ ਸੁਰੱਖਿਆ', icon: 'pest_control', tone: tone.rose,
    questions: [
      { id: 'I01', label: 'Were any crop protection products (herbicide, insecticide or fungicide) applied to this crop?', type: 'choice', options: YES_NO },
      {
        id: 'I_sprays', label: 'Spray events', help: 'One entry per spraying. The number of applications is counted from these entries.', type: 'group', item: 'spray', minEntries: 1,
        showIf: v => v.I01 === 'Yes',
        questions: [
          { id: 'I02', label: 'Date of spraying', type: 'date', validate: inSeason(15) },
          { id: 'I03', label: 'Type of sprayer used', help: 'Fuel type is worked out from the sprayer.', type: 'choice', options: SPRAYER },
          { id: 'I04', label: 'Area sprayed', type: 'number', unit: 'acres', step: 0.01, validate: atMostFieldArea },
          { id: 'I05', label: 'Fuel used for this spraying', type: 'number', unit: 'litres per acre', min: 0, max: 50, showIf: v => v.I03 === 'Petrol power sprayer' || v.I03 === 'Tractor-mounted' },
          {
            id: 'I_products', label: 'Products in the tank mix', help: 'One entry per product.', type: 'group', item: 'product', minEntries: 1,
            questions: [
              { id: 'I06', label: 'Type of product', type: 'choice', options: CP_TYPE },
              { id: 'I07', label: 'Herbicide timing', type: 'choice', options: HERBICIDE_TIMING, showIf: v => v.I06 === 'Herbicide' },
              { id: 'I08', label: 'Trade name of the product', type: 'text' },
              { id: 'I09', label: 'Quantity applied per acre', help: 'Number only; pick the unit below.', type: 'number', validate: val => (num(val)! > 0 ? null : 'Should be more than 0') },
              { id: 'I10', label: 'Unit of quantity', type: 'choice', options: CP_UNIT }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'J', sheet: 'Questionnaire', scope: 'field',
    title: 'J. Irrigation', titlePa: 'ਸਿੰਚਾਈ', icon: 'water_drop', tone: tone.blue,
    intro: 'The set-up questions are asked once. Add one entry per irrigation.',
    questions: [
      { id: 'J01', label: 'Irrigation method', type: 'choice', options: IRRIGATION_METHOD },
      { id: 'J02', label: 'Source of irrigation water', type: 'choice', options: WATER_SOURCE, showIf: irrigated },
      { id: 'J03', label: 'Power source of the irrigation pump', type: 'choice', options: PUMP_POWER, showIf: irrigated },
      { id: 'J04', label: 'Number of pumps used', type: 'integer', unit: 'pumps', min: 1, max: 5, showIf: hasPump },
      { id: 'J05', label: 'Pump capacity', type: 'number', unit: 'HP', min: 0.5, max: 50, showIf: hasPump },
      { id: 'J06', label: 'Depth from which water is pumped (groundwater table depth)', type: 'number', unit: 'feet', min: 0, max: 500, showIf: v => irrigated(v) && ['Borewell', 'Tubewell', 'Open well'].includes(v.J02) },
      { id: 'J07', label: 'Horizontal distance between the pump and the tubewell / water source', type: 'number', unit: 'metres', min: 0, max: 100, showIf: hasPump },
      {
        id: 'J_irrigations', label: 'Irrigation events', help: 'One entry per irrigation. The number of irrigations is counted from these entries.', type: 'group', item: 'irrigation', minEntries: 1,
        showIf: irrigated,
        questions: [
          { id: 'J08', label: 'Date of irrigation', type: 'date', validate: inSeason(30) },
          { id: 'J09', label: 'Area irrigated', type: 'number', unit: 'acres', step: 0.01, validate: atMostFieldArea },
          { id: 'J10', label: 'Pump running time for this irrigation', help: 'Total hours. Hours per acre is worked out from the area irrigated.', type: 'number', unit: 'hours', min: 0, max: 200, showIf: hasPump },
          { id: 'J11', label: 'Diesel used for this irrigation', type: 'number', unit: 'litres (total)', min: 0, max: 200, showIf: v => irrigated(v) && v.J03 === 'Diesel' }
        ]
      },
      { id: 'J12', label: 'Rice only: water regime during cultivation', help: 'Asked for rainfed rice too.', type: 'choice', options: RICE_WATER_REGIME, showIf: v => v.B02 === 'Rice' }
    ]
  },
  {
    key: 'K', sheet: 'Questionnaire', scope: 'field',
    title: 'K. Harvest & Transport', titlePa: 'ਵਾਢੀ, ਝਾੜ ਅਤੇ ਢੋਆ-ਢੁਆਈ', icon: 'inventory_2', tone: tone.amber,
    questions: [
      { id: 'K01', label: 'Total quantity of main produce harvested from this field', type: 'number', unit: 'quintals (total)', min: 0, step: 0.01 },
      {
        id: 'K01a', label: 'Yield per acre', type: 'calc', unit: 'quintals per acre',
        calc: v => (num(v.K01) === null || !num(v.B04) ? null : round(num(v.K01)! / num(v.B04)!, 2))
      },
      { id: 'K02', label: 'Grain moisture at harvest', type: 'number', unit: '%', min: 5, max: 40 },
      { id: 'K03', label: 'Quantity procured by Grow Indigo', help: 'Enter 0 if none.', type: 'number', unit: 'quintals', min: 0, step: 0.01, validate: (val, v) => (num(v.K01) !== null && num(val)! > num(v.K01)! ? 'Cannot be more than the quantity harvested' : null) },
      { id: 'K04', label: 'Type of vehicle used to transport the produce', type: 'choice', options: VEHICLE },
      { id: 'K05', label: 'Weight of produce transported', type: 'number', unit: 'tonnes', min: 0, max: 50 },
      { id: 'K06', label: 'Distance the produce was transported (to mandi / procurement centre)', type: 'number', unit: 'km', min: 0, max: 2000 }
    ]
  },
  {
    key: 'L', sheet: 'Questionnaire', scope: 'field',
    title: 'L. Trees on Farm', titlePa: 'ਖੇਤ ਵਿੱਚ ਰੁੱਖ', icon: 'park', tone: tone.emerald,
    questions: [
      { id: 'L01', label: 'Have trees or shrubs been planted on this field (boundary, block or agroforestry)?', type: 'choice', options: YES_NO },
      {
        id: 'L_trees', label: 'Tree plantings', help: 'One entry per species and planting year.', type: 'group', item: 'planting', minEntries: 1,
        showIf: v => v.L01 === 'Yes',
        questions: [
          { id: 'L02', label: 'Tree species', type: 'text' },
          { id: 'L03', label: 'Year of planting', type: 'integer', min: 1950, max: new Date().getFullYear() },
          { id: 'L04', label: 'Number of trees of this species on this field', type: 'integer', unit: 'trees', validate: val => (num(val)! > 0 ? null : 'Should be more than 0') },
          { id: 'L05', label: 'Plantation model', type: 'choice', options: TREE_MODEL }
        ]
      }
    ]
  },

  // ---- Koltiva tab: whole farm, once a year (Regen AG5.1) ----
  // RW-001–004 are taken from A13, A08 + A09, A12 and A01 (see lib/survey.ts).
  {
    key: 'rwFarm', sheet: 'Koltiva', scope: 'farm',
    title: 'Farm Profile', titlePa: 'ਫਾਰਮ ਦਾ ਵੇਰਵਾ', icon: 'home_work', tone: tone.teal,
    intro: 'Whole farm, once a year.',
    questions: [
      { id: 'RW-005', label: 'What evidence is available to submit in support of these responses?', type: 'multi', options: EVIDENCE, exclusive: ['None'], column: 'General Infomation - Is there any evidence to submit?' },
      { id: 'RW-006', label: 'Can a photo of the submitted evidence be provided?', type: 'choice', options: YES_NO, column: 'General Infomation - Evidence Photo' },
      { id: 'RW-007', label: 'What is the total area of arable crop land on the farm?', type: 'number', unit: 'ha', min: 0, step: 0.01, column: 'Farm - Arable crop land (ha)' },
      { id: 'RW-008', label: 'What is the area of permanent crop land on the farm (for example fruit orchards, coffee or cocoa)?', type: 'number', unit: 'ha', min: 0, step: 0.01, column: 'Farm - Permanent crop land (ha), e.g. fruit orchards, coffee, cocoa, etc.' },
      { id: 'RW-009', label: 'What is the area of permanent pastures on the farm?', type: 'number', unit: 'ha', min: 0, step: 0.01, column: 'Farm - Permanent pastures (ha)' },
      { id: 'RW-010', label: 'What is the area of natural habitat and natural forest on the farm?', type: 'number', unit: 'ha', min: 0, step: 0.01, column: 'Farm - Natural habitat and natural forest area (ha)' },
      { id: 'RW-011', label: 'How many livestock are kept on the farm?', help: 'Standard Livestock Units. Enter 0 if none.', type: 'number', unit: 'SLU', min: 0, column: 'Farm - Number of livestock (Standard Livestock Units)' },
      { id: 'RW-012', label: 'Which field has been used as the reference field for soil organic matter, being representative of the whole farm?', help: `Field ID. ${HARD}`, type: 'text', optional: true, column: 'Farm - Reference field for soil organic matter (please consider representative field of whole farm)' },
      { id: 'RW-013', label: 'What percentage of soil organic matter was measured in the reference field?', help: HARD, type: 'number', unit: '%', min: 0, max: 100, step: 0.01, optional: true, column: 'Farm - Percentage of Soil Organic Matter in referenced field' },
      { id: 'RW-014', label: 'What was the source of the soil organic matter data?', help: `e.g. Eureka, ICRISAT. ${HARD}`, type: 'text', optional: true, column: 'Farm - Source of the data' },
      { id: 'RW-015', label: 'In which year was the soil analysis carried out?', help: HARD, type: 'integer', min: 2000, max: new Date().getFullYear(), optional: true, column: 'Farm - Year of soil analysis assessment' },
      { id: 'RW-016', label: 'Does the farm hold any production certificates or labels?', type: 'choice', options: YES_NO, column: 'Farm - Certificates/Label Production' },
      { id: 'RW-017', label: 'What is the name of each production certificate or label held by the farm?', type: 'text', showIf: v => v['RW-016'] === 'Yes', column: 'Farm - Name of Certificate / Label' }
    ]
  },
  {
    key: 'rwCrop', sheet: 'Koltiva', scope: 'farm',
    title: 'Crop Details', titlePa: 'ਫ਼ਸਲ ਦਾ ਵੇਰਵਾ', icon: 'grass', tone: tone.amber,
    intro: 'Worked out from the field sections (B, F, G, I, K) and kept in the import units (ha, t/ha, kg N/ha). Fill the fields to see them here.',
    questions: [
      { id: 'RW-018', label: 'Which crop is being reported?', type: 'calc', calc: (_, ctx) => cropTotals(ctx).map(t => t.crop).join(', ') || null },
      { id: 'RW-019', label: 'What area was planted with the crop in the reporting season?', help: 'Sum of field areas (B04).', type: 'calc', unit: 'ha', calc: perCrop(t => t.areaHa) },
      { id: 'RW-020', label: 'What was the yield of the crop?', help: 'Total harvested (K01) ÷ area.', type: 'calc', unit: 't/ha', calc: perCrop(t => t.yieldTHa) },
      { id: 'RW-021', label: 'What is the dry matter content of the harvested crop?', help: '100 − grain moisture at harvest (K02).', type: 'calc', unit: '%', calc: perCrop(t => t.dryMatterPct) },
      { id: 'RW-022', label: 'What total quantity of nitrogen (synthetic plus organic) was applied to the crop during the reporting season?', help: 'From fertiliser (F) and organic manure (G) entries.', type: 'calc', unit: 'kg N/ha', calc: perCrop(t => t.totalNKgHa) },
      { id: 'RW-023', label: 'What quantity of synthetic nitrogen was applied to the crop during the reporting season?', help: 'From fertiliser (F) entries.', type: 'calc', unit: 'kg N/ha', calc: perCrop(t => t.synthNKgHa) },
      { id: 'RW-024', label: 'How much water was applied to the crop through irrigation during the reporting season?', help: 'Hard for farmers to answer – leave blank if not known.', type: 'number', unit: 'm³/ha', min: 0, optional: true },
      { id: 'RW-025', label: 'How many applications of synthetic pesticide were made to the crop during the reporting season?', help: 'Counted from the spray events (I).', type: 'calc', calc: perCrop(t => t.pesticideApps) }
    ]
  },
  {
    key: 'rwSoil', sheet: 'Koltiva', scope: 'farm',
    title: 'Soil', titlePa: 'ਮਿੱਟੀ', icon: 'landslide', tone: tone.brown,
    questions: [
      {
        id: 'RW-026', label: 'On average, how many different types of crops are grown on the same piece of land over a three-year period?', help: 'Tick every crop grown. Cover crops, even mixtures, count as one; intercrops count as extra crops.',
        type: 'multi', options: CROPS_3YR,
        column: 'Soil - 1.01 On average, how many different types of crops do you grow on the same piece of land over a period of 3 years? Cover crops, even multispecies are considered as one crop, whereas intercrops are considered as additional crops',
        toExport: count
      },
      { id: 'RW-027', label: 'What percentage of arable crop land is under a rotation with at least that many crop types, including cover crops and/or intercrops?', type: 'choice', options: ROTATION_SHARE, column: 'Soil - 1.02 What is the percentage of arable crop land subjected to rotations with at least X different types of crops including cover crops and/or intercrops (X=No. Of crops in Q1.01)? (land with X different types of crops in rotation/total crop land)' },
      { id: 'RW-028', label: 'What percentage of arable crop land is planted with cover crops?', type: 'choice', options: COVER_SHARE, column: 'Soil - 1.03 What is the percentage of arable crop land planted with cover crops? (land with cover crop/total crop land x 100)' },
      { id: 'RW-029', label: 'Which cover crop types are included in the cover crop mixture?', help: 'Tick each type used.', type: 'multi', options: COVER_TYPES, exclusive: ['No cover crop'], column: 'Soil - 1.04 How many of these 5 cover crop types you included in the mixture like grasses, legumes, brassicas non-legume broadleaves, deep root', toExport: val => val.filter((o: string) => o !== 'No cover crop').length },
      { id: 'RW-030', label: 'What percentage of crop land receives applications of crop residues, mulch, grass clippings, straw or similar material?', type: 'choice', options: RESIDUE_SHARE, column: 'Soil - 1.05 What is the percentage of crop land with application of crop residues, mulch, grass clipping, straw, etc.? (land with application /total crop land x 100)' },
      { id: 'RW-031', label: 'What percentage of arable crop land is covered for at least 10 months of the year with crops, cover crops, grasses, plant residues or mulch?', type: 'choice', options: COVER10_SHARE, column: 'Soil - 1.06 What is the percentage of arable crop land covered by at least 10 months, with crops, cover crops, grasses, plant residues or mulch?' },
      { id: 'RW-032', label: 'What percentage of arable crop land is managed with minimum tillage?', type: 'choice', options: SHARE, column: 'Soil - 1.07 What is the percentage of arable crop land managed with minimum tillage? (land with minimal till/total crop land x 100)' },
      {
        id: 'RW-033', label: 'Is the fertiliser plan (nutrient balance) calculated on the basis of the 4R Nutrient Stewardship Principles?', help: 'Right source, right rate, right time, right place. "Yes" means all 4.',
        type: 'choice', options: YES_PARTIAL_NO,
        column: 'Soil - 1.08 Do you calculate your fertilizer plan (nutrient balance) on the basis of the 4 R Nutrient Stewardship Principles. If partially yes, how many of the following principles do you apply:  (a) Right Source,  (b) Right Rate, (c) Right Time, (d) Right Place)?',
        toExport: principles(4, 'RW-034')
      },
      { id: 'RW-034', label: 'Which of the 4R principles are applied?', help: 'Partially means fewer than all 4.', type: 'multi', options: FOUR_R, showIf: v => v['RW-033'] === 'Partially', validate: partialPicks(4) },
      { id: 'RW-035', label: 'Is crop residue burned on more than 10% of the field area?', type: 'choice', options: YES_NO, column: 'Soil - 1.11 Do you burn crop residue in more than 10% of your field?',
        derive: (_, ctx) => {
          let acres = 0, burnt = 0, known = false
          for (const { a } of ctx.fields) {
            const area = num(a.B04) ?? 0
            acres += area
            if (a.E02 || a.E05) known = true
            burnt += a.E05 === 'Burnt' ? area : a.E02 === 'Burnt' ? (num(a.E04) ?? area) : 0
          }
          return known && acres ? (burnt / acres > 0.1 ? 'Yes' : 'No') : undefined
        }
      },
      { id: 'RW-036', label: 'On average, how often is the soil analysed for texture, pH, soil organic matter, phosphorus and potassium (excluding nitrogen)?', help: HARD, type: 'choice', options: SOIL_INTERVAL, optional: true, column: 'Soil - 1.12 On average, what is the interval of soil analysis for texture, pH, soil organic matter, phosphorus, potassium (excluding nitrogen)?' },
      { id: 'RW-037', label: 'Has the soil organic matter increased since the last soil analysis?', help: HARD, type: 'choice', options: YES_NO, optional: true, column: 'Soil - 1.14 Has the SOM increased since the last soil analysis?' }
    ]
  },
  {
    key: 'rwBiodiversity', sheet: 'Koltiva', scope: 'farm',
    title: 'Biodiversity & Land Use', titlePa: 'ਜੈਵ ਵਿਭਿੰਨਤਾ ਅਤੇ ਜ਼ਮੀਨ', icon: 'forest', tone: tone.green,
    questions: [
      {
        id: 'RW-038', label: 'Are Integrated Pest Management (IPM) principles followed when applying plant protection products?', help: 'Monitoring, threshold, dose, time, place. "Yes" means all 5.',
        type: 'choice', options: YES_PARTIAL_NO,
        column: 'Biodiversity and Land use - 2.01 Do you follow Integrated Pest Management (IPM) principles when applying plant protection products? If partially yes, how many of the following principles do you apply: (a) Appropriate pest and disease monitoring, (b) Appropriate intervention measures, (c) Appropriate quantity/dose, (d) Appropriate time, (e) Appropriate place',
        toExport: principles(5, 'RW-039')
      },
      { id: 'RW-039', label: 'Which IPM principles are applied?', help: 'Partially means fewer than all 5.', type: 'multi', options: IPM, showIf: v => v['RW-038'] === 'Partially', validate: partialPicks(5) },
      { id: 'RW-040', label: 'What percentage of crop land has no synthetic pest and disease control applied?', type: 'choice', options: NO_SYNTHETIC_SHARE, column: 'Biodiversity and Land use - 2.02 What is the percentage of crop land without synthetic pest and disease control (land without synthetic pest control/ total crop land x 100)' },
      { id: 'RW-041', label: 'What percentage of crop and pasture land has no synthetic herbicide applied?', type: 'choice', options: NO_SYNTHETIC_SHARE, column: 'Biodiversity and Land use - 2.03 What is the percentage of crop and pasture land without synthetic herbicide application? (land without synthetic herbicide control/ total crop land x 100)' },
      { id: 'RW-042', label: 'What percentage of the agricultural area is maintained as biodiversity habitat?', help: 'Hedges, tree alleys, flower strips, natural habitats, green belts, riparian areas or non-farmed area that could be cultivated.', type: 'choice', options: HABITAT_SHARE, column: 'Biodiversity and Land use - 2.04 What is the percentage of agricultural area being biodiversity habitats such as hedge, trees alley, flower strip, natural habitats, green belts, riparian area, non farmed area (that could potentially be cultivated) etc? (agriculture area with biodiversity habitat / total crop land x 100)' },
      { id: 'RW-043', label: 'What percentage of the agricultural area is dedicated to agroforestry?', help: 'Productive areas combining crops or pasture with multiple types of productive bushes and trees.', type: 'number', unit: '%', min: 0, max: 100, column: 'Biodiversity and Land use - 2.05 What is the percentage of agriculture area dedicated to agroforestry (productive areas in a field with combinations of crops or pasture with multiple types of productive bushes & trees)? (agriculture area with agroforestery/total agriculture area x 100)' },
      { id: 'RW-044', label: 'Is a recorded and tracked biodiversity action plan in place at farm scale?', type: 'choice', options: YES_NO, column: 'Biodiversity and Land use - 2.06 Do you have a recorded and tracked Biodiversity action plan in place at farm scale?' }
    ]
  },
  {
    key: 'rwWater', sheet: 'Koltiva', scope: 'farm',
    title: 'Water', titlePa: 'ਪਾਣੀ', icon: 'water', tone: tone.blue,
    questions: [
      {
        id: 'RW-045', label: 'If the crop is irrigated, what is the predominant irrigation system used?', help: 'Suggested from the irrigation method of the fields (J01).', type: 'choice', options: FAT_IRRIGATION,
        column: 'Water - 3.01a If you have to irrigate, select the predominant irrigation system used on irrigated crop',
        derive: (_, ctx) => {
          const acres: Record<string, number> = {}
          for (const { a } of ctx.fields) {
            const fat = FAT_IRRIGATION_FROM_J01[a.J01]
            if (fat) acres[fat] = (acres[fat] || 0) + (num(a.B04) ?? 0)
          }
          const irrigatedOnly = Object.entries(acres).filter(([k]) => k !== 'No irrigation')
          const pool = irrigatedOnly.length ? irrigatedOnly : Object.entries(acres)
          return pool.sort((x, y) => y[1] - x[1])[0]?.[0]
        }
      },
      { id: 'RW-046', label: 'Is water consumption monitored at crop level?', type: 'choice', options: YES_NO },
      {
        id: 'RW-047', label: 'Are records of crop-level water consumption data available?', type: 'choice', options: YES_NO,
        column: 'Water - 3.02 Do you monitor the water consumption at crop level and is data recording available?',
        // The import has one column for monitoring + records.
        toExport: (val, v) => (val === 'Yes' && v['RW-046'] === 'Yes' ? 'Yes' : 'No')
      },
      { id: 'RW-048', label: 'Is irrigation controlled using digital soil moisture sensors?', type: 'choice', options: YES_NO, column: 'Water - 3.03 Do you control irrigation with digital soil moisture sensors?' },
      {
        id: 'RW-049', label: 'If there are water bodies on the farm (such as rivers, ponds or lakes), what is the minimum distance between the field application area for fertiliser/manure and pesticide and the water body?', type: 'choice', options: WATER_DISTANCE,
        column: 'Water - 3.04 If you have water bodies at your farm (eg. rivers, ponds, lakes), what is the minimum distance between field application area (fertilizer/manure and pesticide) and the water body?',
        toExport: val => (val === NO_WATER_BODY ? 'NA' : val.replace(/–/g, '-'))
      },
      { id: 'RW-050', label: "What percentage of the farm's water bodies have riparian buffer strips such as bushes or trees?", type: 'choice', options: SHARE, showIf: hasWaterBody, column: 'Water - 3.05 What is the percentage of water bodies with riparian buffer strips such as bushes, trees, etc.?  (Length of adjacent water body with riparian buffer/ total length of adjacent water body x 100)' },
      { id: 'RW-051', label: "What percentage of the farm's water bodies are fenced off from animal access?", type: 'choice', options: SHARE, showIf: hasWaterBody, column: 'Water - 3.06 What % of your water bodies fenced from animal access? (Length of water body fenced / total length of water body x 100)' }
    ]
  },
  {
    key: 'rwCompetencies', sheet: 'Koltiva', scope: 'farm',
    title: 'Competencies', titlePa: 'ਯੋਗਤਾਵਾਂ', icon: 'school', tone: tone.violet,
    questions: [
      { id: 'RW-063', label: 'Has the farmer understood the main principles of Regenerative Agriculture?', help: 'For example by attending a training session or reading the 4-page RegenAgr material from Nestle.', type: 'choice', options: YES_NO, column: 'Competencies - 5.01 Have you understood the main principles of Regenerative Agriculture? (for example attending training session or reading the 4 pages of RegenAgr in Nestle)' },
      { id: 'RW-064', label: 'Are agricultural management records (such as spray records and fertiliser records) kept?', type: 'choice', options: YES_NO, column: 'Competencies - 5.02 Do you keep agricultural management records (i.e. spray records, fertilizer records, etc.)?' },
      {
        id: 'RW-065', label: 'Are precision farming technologies used?', help: 'Auto-steer, section control / variable-rate application, digital decision-support tools, optical sensors.', type: 'choice', options: YES_NO,
        column: 'Competencies - 5.03 Do you make use of precision farming technologies such as (a) automated parallel driving systems in machines, (b) section control or variable rate application of fertilizers or pesticides, (c) the use of digital farm and/or animal decision support tools and (d) optical sensors? If yes, how many types of technologies do yo make use of?',
        toExport: (val, v) => (val === 'Yes' ? count(v['RW-066']) : 0)
      },
      { id: 'RW-066', label: 'Which of the four types of precision farming technology are used?', type: 'multi', options: PRECISION_TECH, showIf: v => v['RW-065'] === 'Yes' }
    ]
  }
]

// ---- Survey engine ----

export type Tally = { asked: number; done: number; issues: number }

export const labelOf = (q: Question, v: Answers) => (typeof q.label === 'function' ? q.label(v) : q.label)
export const unitOf = (q: Question, v: Answers) => (typeof q.unit === 'function' ? q.unit(v) : q.unit)
export const isShown = (q: Question, v: Answers) => !q.showIf || q.showIf(v)

export function isAnswered(v: any) {
  return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
}

// Answer as entered, else the derived suggestion, else the calculated value.
export function valueOf(q: Question, v: Answers, ctx: Ctx) {
  if (q.type === 'calc') return q.calc!(v, ctx)
  if (isAnswered(v[q.id])) return v[q.id]
  return q.derive ? q.derive(v, ctx) : undefined
}

export function issueOf(q: Question, val: any, v: Answers): string | null {
  if (!isAnswered(val) || q.type === 'calc') return null
  if (q.type === 'number' || q.type === 'integer') {
    const n = Number(val)
    if (q.type === 'integer' && !Number.isInteger(n)) return 'Enter a whole number'
    const low = q.min !== undefined && n < q.min, high = q.max !== undefined && n > q.max
    if (low || high) {
      if (q.min !== undefined && q.max !== undefined) return `Should be between ${q.min} and ${q.max}`
      return low ? `Should be at least ${q.min}` : `Should be at most ${q.max}`
    }
  }
  if (q.type === 'phone' && !/^[6-9]\d{9}$/.test(String(val))) return 'Enter 10 digits starting with 6–9'
  return q.validate?.(val, v) ?? null
}

// Counts required questions (and repeat entries) that are shown, answered, or flagged.
export function tally(qs: Question[], v: Answers, ctx: Ctx, t: Tally = { asked: 0, done: 0, issues: 0 }) {
  for (const q of qs) {
    if (!isShown(q, v) || q.type === 'calc') continue
    if (q.type === 'group') {
      const entries: Answers[] = v[q.id] || []
      if (!entries.length && q.minEntries) t.asked++
      entries.forEach(e => tally(q.questions!, { ...v, ...e }, ctx, t))
      continue
    }
    const val = valueOf(q, v, ctx)
    if (!q.optional) {
      t.asked++
      if (isAnswered(val)) t.done++
    }
    if (issueOf(q, val, v)) t.issues++
  }
  return t
}

export const fieldAnswers = (answers: Answers, plotId: string): Answers => answers.fields?.[plotId] || {}
// Farm answers with one field's answers on top, so field questions can see A and B–L together.
export const fieldView = (answers: Answers, plotId: string): Answers => ({ ...answers, ...fieldAnswers(answers, plotId) })
export const makeCtx = (answers: Answers, plotIds: string[]): Ctx => ({ fields: plotIds.map(plotId => ({ plotId, a: fieldAnswers(answers, plotId) })) })

export function sectionTally(s: Section, answers: Answers, plotIds: string[], ctx: Ctx) {
  if (s.scope === 'farm') return tally(s.questions, answers, ctx)
  const t: Tally = { asked: 0, done: 0, issues: 0 }
  plotIds.forEach(id => tally(s.questions, fieldView(answers, id), ctx, t))
  return t
}

export function surveyProgress(answers: Answers, plotIds: string[]) {
  const ctx = makeCtx(answers, plotIds)
  const t: Tally = { asked: 0, done: 0, issues: 0 }
  for (const s of SURVEY_SECTIONS) {
    const st = sectionTally(s, answers, plotIds, ctx)
    t.asked += st.asked
    t.done += st.done
    t.issues += st.issues
  }
  return t
}

// Value for the import sheet: NA when not asked, '' when unanswered.
export function exportValue(q: Question, v: Answers, ctx: Ctx) {
  if (!isShown(q, v)) return 'NA'
  const val = valueOf(q, v, ctx)
  if (!isAnswered(val)) return ''
  if (q.toExport) return q.toExport(val, v)
  return plain(val)
}

// Import sheets use plain hyphens ("71-90%"); lists join with "; ".
export const plain = (val: any): any =>
  Array.isArray(val) ? val.map(plain).join('; ') : typeof val === 'string' ? val.replace(/–/g, '-') : val
