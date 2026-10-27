import { Activity } from '../types'
import { Answers } from '../config/fatSurvey'
import { FERTILISER } from '../config/moduleFields'

// New diary entries store CFT answers by question id and are marked `cft: 1`. Entries saved before
// the forms switched to the CFT questions use the old field names; this maps them across.

const FERTILISER_FROM_OLD: Record<string, string> = { DAP: 'DAP', Urea: 'Urea', MOP: 'MOP (muriate of potash)', Zinc: 'Zinc sulphate', Bio: 'Bio-fertiliser (specify)' }
const FERT_METHOD_FROM_OLD: Record<string, string> = { Broadcasting: 'Broadcast', Seeder: 'Drilled with seed (basal)', Fertigation: 'Fertigation', Spray: 'Foliar spray' }
const CP_UNIT_FROM_OLD: Record<string, string> = { ml: 'ml per acre', gm: 'g per acre', L: 'L per acre', kg: 'kg per acre' }
const RESIDUE_FROM_OLD: Record<string, string> = { Burning: 'Burnt', Incorporation: 'Incorporated into soil', 'Baling & Selling': 'Removed from field (baled / sold / fodder)' }
const TILLAGE_FROM_OLD: Record<string, string> = { 'Conventional Tillage': 'Conventional (CT)', 'Super Seeder': 'Reduced (RT)', 'Happy Seeder': 'Zero tillage (ZT)', 'Smart Seeder': 'Zero tillage (ZT)', 'Zero Till Drill': 'Zero tillage (ZT)' }
const MACHINE_FROM_OLD: Record<string, string> = { 'Super Seeder': 'Super seeder', 'Happy Seeder': 'Happy seeder', 'Smart Seeder': 'Smart seeder', 'Zero Till Drill': 'Zero-till drill' }
const IRRIGATION_FROM_OLD = ['Flood', 'Sprinkler', 'Drip']
const SOURCE_FROM_OLD = ['Tubewell', 'Canal']

const pick = (entries: [string, any][]) => Object.fromEntries(entries.filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 0))

// CFT answers of a diary entry. `acres` converts old whole-plot totals to per-acre values.
export function cftPayload(a: Activity, acres?: number): Answers {
  const p = a.payload || {}
  if (p.cft) return p
  switch (a.module) {
    case 'Land Preparation & Sowing':
      return pick([
        ['C01', TILLAGE_FROM_OLD[p.prepMethod]],
        ['D02', MACHINE_FROM_OLD[p.prepMethod]],
        ['D03', MACHINE_FROM_OLD[p.prepMethod] && 1],
        ['D04', MACHINE_FROM_OLD[p.prepMethod] && 'Diesel'],
        ['D05', p.fuelLitres && acres ? Math.round((p.fuelLitres / acres) * 100) / 100 : undefined],
        ['D06', p.hoursPerAcre],
        ['totalCostPerAcre', p.totalCostPerAcre]
      ])
    case 'Seed & Sowing':
      return pick([
        ['B03', p.variety !== 'Other' ? p.variety : undefined],
        ['B09', p.seedRateKgPerAcre],
        ['B10', p.seedTreatmentDone === undefined ? undefined : p.seedTreatmentDone ? 'Yes' : 'No'],
        ['B12', p.seedTreatmentDone ? p.treatmentProduct : undefined]
      ])
    case 'Fertilizer & Nutrient Management':
      return pick([['kind', FERTILISER], ['F02', FERTILISER_FROM_OLD[p.product]], ['F04', p.quantityKgPerAcre], ['F06', FERT_METHOD_FROM_OLD[p.applicationMethod]]])
    case 'Pest & Disease Management':
      return { I_products: [pick([['I06', p.cppType], ['I08', p.tradeName], ['I09', p.quantityPerAcre], ['I10', CP_UNIT_FROM_OLD[p.unit]]])] }
    case 'Water Management':
      return pick([
        ['J01', IRRIGATION_FROM_OLD.includes(p.irrigationMethod) ? p.irrigationMethod : undefined],
        ['J02', SOURCE_FROM_OLD.includes(p.waterSource) ? p.waterSource : undefined],
        ['J03', Number(p.fuelLitres) > 0 ? 'Diesel' : undefined],
        ['J05', p.pumpHP],
        ['J06', p.groundwaterDepthFt],
        ['J10', p.durationHours],
        ['J11', p.fuelLitres]
      ])
    case 'Harvesting':
      return pick([['K01pa', p.yieldQtlPerAcre], ['K02', p.moisturePct]])
    case 'Residue Management':
      return pick([['E05', RESIDUE_FROM_OLD[p.method]], ['E06', p.quantityQtlPerAcre ? p.quantityQtlPerAcre / 10 : undefined]])
    default:
      return {}
  }
}
