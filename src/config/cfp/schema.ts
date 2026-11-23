import * as R from './referenceData'
import { Field, OptionList, Pathway, Provenance, RuleCtx, SectionDef } from '../../lib/assessment/types'

// The Cool Farm Platform (CFP 3.0) crop assessment questionnaire.
//
// Questions, wording and options follow the official "Cool Farm Platform 3.0 - Annual Crops Data Input
// Table" (CFP30-CropsDataInputs.xlsx, "a list of all data points required to complete an annual crop
// assessment"), in its order. Storage keys follow the CFP API's inputData object where the CFP API User
// Guide shows them (cropDetails, residue, machinery.machineryUse, wasteWater.treatments, …); elsewhere the
// key is our own and marked apiKey: 'provisional'. Anything not backed by an official source is marked
// PROVISIONAL. See docs/cfp-assessment/VERIFICATION_REPORT.md.
//
// Bump SCHEMA_VERSION whenever a question, option or rule changes, so saved assessments record
// which questionnaire they were answered against.

export const SCHEMA_VERSION = 'cfp3-crops-2026.11.1'

export const PATHWAYS: { id: Pathway; label: string; description: string; provenance: Provenance[] }[] = [
  { id: 'annual_crops', label: 'Annual Crops', description: 'Wheat, maize, barley, pulses, oilseeds, upland rice and other annual field crops.', provenance: ['VERIFIED_GUIDE'] },
  { id: 'paddy_rice', label: 'Paddy Rice', description: 'Flooded rice. Adds the paddy water-regime and organic-amendment questions.', provenance: ['VERIFIED_GUIDE'] },
  { id: 'potato', label: 'Potato', description: 'Adds on-farm processing and storage questions.', provenance: ['VERIFIED_GUIDE'] }
]
// Perennial Crops, Dairy and Beef pathways exist in CFP but have different data tables; not built yet.

const G: Provenance[] = ['VERIFIED_GUIDE']
const GS: Provenance[] = ['VERIFIED_GUIDE', 'VERIFIED_SCHEMA']
const P: Provenance[] = ['PROVISIONAL']
const row = (n: number | string) => `Annual Crops Data Input Table, row ${n}`

// ---------- Shared units (from the Data Input Table's "Answer Type" column) ----------
const AREA_UNITS = ['hectares', 'acres'] // API example: "hectares"
const TEMPERATURE_UNITS = ['°C', '°F'] // API example: "°C"
const DISTANCE_UNITS = ['kilometres', 'miles']
const WIDTH_UNITS = ['metres', 'feet']
const DENSITY_UNITS = ['per hectare', 'per acre']
const OXYGEN_DEMAND_UNITS = ['kg/litre', 'mg/litre', 'g/litre'] // API example stores "kg per litre"
const YES_NO = ['Yes', 'No']
const TILLAGE_T2 = ['Conventional', 'Reduced', 'No-till']
const TILLAGE_T1 = ['full', 'reduced', 'no-till']
const BIOMASS_LEFT = ['left in field', 'burned', 'n/a']

const grouped = (groups: [string, readonly string[]][]): OptionList =>
  groups.flatMap(([group, values]) => values.map(v => ({ value: v, label: v, group })))

// Residue management: the API accepts these enum values; labels are the Data Input Table's wording.
export const RESIDUE_OPTIONS: OptionList = [
  { value: 'exporting', label: 'Exporting' },
  { value: 'burning', label: 'Burning' },
  { value: 'composting_forced_aeration', label: 'Composting - forced aeration' },
  { value: 'composting_non_forced_aeration', label: 'Composting - non-forced aeration' },
  { value: 'left_in_heaps_or_pits', label: 'Left in heaps or pits' },
  { value: 'left_on_field', label: 'Left on field' }
]
// The API also accepts 'chipping_and_spreading', which the annual-crop table does not list (perennial pathway).
export const RESIDUE_API_ENUM = [
  'burning', 'left_in_heaps_or_pits', 'composting_forced_aeration', 'composting_non_forced_aeration', 'left_on_field', 'exporting', 'chipping_and_spreading'
] as const

const FERTILISER_OPTIONS = grouped([['Mineral', R.FERTILISER_SYNTHETIC], ['Organic inputs', R.FERTILISER_ORGANIC]])
const ENERGY_SOURCE_OPTIONS = grouped([['By volume', R.ENERGY_SOURCE_VOLUME], ['By weight', R.ENERGY_SOURCE_WEIGHT], ['By energy', R.ENERGY_SOURCE_ENERGY]])
const ALL_ENERGY_SOURCES: string[] = [...R.ENERGY_SOURCE_VOLUME, ...R.ENERGY_SOURCE_WEIGHT, ...R.ENERGY_SOURCE_ENERGY]
const HISTORY_CROP_OPTIONS = grouped([['Annual crop type', R.ANNUAL_CROP_TYPE], ['Perennial crop type', R.PERENNIAL_CROP_TYPE], ['Potato', ['Potato']]])

export const COMPOSE_NPK = 'Compose your own NPK'
const isMineral = (t?: string) => !!t && (R.FERTILISER_SYNTHETIC as readonly string[]).includes(t)
const num = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v))

/** Units of the energy used, following the source's "by volume / by weight / by energy" category. */
export function energyUnitsFor(source?: string): readonly string[] {
  if (!source) return []
  if ((R.ENERGY_SOURCE_VOLUME as readonly string[]).includes(source)) return R.ENERGY_UNIT_VOLUME
  if ((R.ENERGY_SOURCE_WEIGHT as readonly string[]).includes(source)) return R.ENERGY_UNIT_WEIGHT
  if ((R.ENERGY_SOURCE_ENERGY as readonly string[]).includes(source)) return R.ENERGY_UNIT_ENERGY
  return []
}

/**
 * The Data Input Table offers the nitrification inhibitor tick "only for non-nitrate Nitrogen containing
 * fertilisers (e.g. ammonia, urea)"; the Lay Guide says ammonium-, urea- or excreta-based. Which list
 * entries qualify is our reading of those names (PROVISIONAL).
 */
export function inhibitorApplies(item: Record<string, any>): boolean {
  const t: string = item.type || ''
  if (!t) return false
  if (t === COMPOSE_NPK) return (num(item.nAmmonium) ?? 0) > 0 || (num(item.nUrea) ?? 0) > 0
  if (/urea|ammoni/i.test(t)) return true
  return /manure|slurry|digestate|litter/i.test(t)
}

// Nutrient units that make sense for each fertiliser (hidden reference sheet), used only for a warning.
const NUTRIENT_OF_UNIT: Record<string, string> = {
  'unit of K (K)': 'k', 'unit of K2O (K2O)': 'k2o', 'unit of P2O5 (P2O5)': 'p2o5', 'unit of nitrogen (N)': 'n',
  'unit of phosphorus (P)': 'p', 'unit of CaO (CAO)': 'cao', 'unit of SO3 (SO3)': 'so3', 'unit of MgO (MGO)': 'mgo',
  'unit of carbon (C)': 'c', 'unit of CaCO3 (CACO3)': 'caco3'
}

// ---------- Field builders ----------

type Base = Omit<Field, 'type' | 'provenance' | 'apiKey' | 'source'> & { provenance?: Provenance[]; apiKey?: Field['apiKey']; source: string }
const f = (type: Field['type']) => (key: string, label: string, rest: Omit<Base, 'key' | 'label'>): Field => ({
  provenance: G,
  apiKey: 'provisional',
  ...rest,
  key,
  label,
  type
})
const text = f('text')
const number = f('number')
const integer = f('integer')
const percent = f('percent')
const year = f('year')
const date = f('date')
const select = f('select')
const radio = f('radio')
const checkbox = f('checkbox')
const quantity = f('quantity')
const pair = f('pair')
const group = f('group')

const inPaddy = (c: RuleCtx) => c.pathway === 'paddy_rice'

// Cover-crop questions, asked for the assessment year and for each crop history period (Tier 2).
const coverCropFields = (srcRows: [number, number, number, number, number, number]): Field[] => [
  select('species', 'Species', { options: R.COVER_CROP_SPECIES, source: row(srcRows[0]) }),
  percent('coveragePercent', '% of cover crop coverage', { source: row(srcRows[1]) }),
  quantity('height', 'Height of cover crop', { units: R.TREE_MEASUREMENT_UNIT, source: row(srcRows[2]) }),
  percent('biomassLeftPercent', '% of biomass left in field', { source: row(srcRows[3]) }),
  radio('managementLeft', 'Management of biomass left in field', { options: BIOMASS_LEFT, source: row(srcRows[4]) }),
  select('managementRemoved', 'Management of biomass removed', { options: R.COVER_CROP_BIOMASS_REMOVED, source: row(srcRows[5]) })
]

// ---------- Sections, in the Data Input Table's order ----------

export const SECTIONS: SectionDef[] = [
  {
    id: 'farm',
    title: 'Farm',
    group: 'Farm',
    icon: 'agriculture',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: true,
    intro: 'Farm details influence several emission calculations. Use a separate farm (and assessment) when country, climate zone or weather differ significantly.',
    provenance: GS,
    source: 'Data Input Table rows 7-13; API farm object; Quick Start Guide ("Creating a farm"); Lay Guide 3.1',
    fields: [
      text('farm.name', 'Farm name', { apiKey: 'verified', provenance: GS, source: row(8) }),
      text('farm.country', 'Country where farm is located', { apiKey: 'verified', provenance: GS, source: row(9), help: 'Full country name, e.g. India.' }),
      number('farm.latitude', 'Latitude', { apiKey: 'verified', provenance: GS, source: row(10), allowNegative: true, min: -90, max: 90, placeholder: 'e.g. 30.901', help: 'Decimal degrees. In CFP you can also click the farm on a map.' }),
      number('farm.longitude', 'Longitude', { apiKey: 'verified', provenance: GS, source: row(10), allowNegative: true, min: -180, max: 180, placeholder: 'e.g. 75.857' }),
      select('farm.climate', 'Climate', {
        options: R.CLIMATE, apiKey: 'verified', provenance: GS, source: row(11),
        help: 'IPCC climate zone. CFP links the IPCC climate map from this question\'s tooltip.'
      }),
      quantity('farm.annualAverageTemperature', 'Annual average temperature', { units: TEMPERATURE_UNITS, allowNegative: true, apiKey: 'verified', provenance: GS, source: row(12) }),
      text('farm.farmIdentifier', 'Farm identifier', { optional: true, apiKey: 'verified', provenance: GS, source: row(13), help: 'Optional text or number.' })
    ]
  },
  {
    id: 'cropDetails',
    title: 'Crop details',
    group: 'Crop details',
    icon: 'grass',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: true,
    intro: 'Each crop needs its own assessment. If your crop type is missing, select the closest option ("Other …").',
    provenance: GS,
    source: 'Data Input Table rows 16-24; API inputData.cropDetails (required section)',
    fields: [
      select('cropDetails.cropType', 'Crop type', {
        apiKey: 'verified', provenance: GS, source: row(19),
        options: c => (c.pathway === 'paddy_rice' ? ['Rice'] : c.pathway === 'potato' ? ['Potato'] : R.ANNUAL_CROP_TYPE),
        help: 'Crop type affects residue and pesticide emissions. Not listed? Choose an "Other …" type; you then need your own residue estimate.'
      }),
      select('cropDetails.waterRegime', 'Water regime during cultivation', {
        options: R.WATER_REGIME_CULTIVATION, showIf: inPaddy, source: row(20) + ' (rice only)'
      }),
      year('cropDetails.assessmentYear', 'Assessment year', { apiKey: 'verified', provenance: GS, source: row(21) }),
      quantity('cropDetails.area', 'Growing area', {
        units: AREA_UNITS, apiKey: 'verified', provenance: GS, source: row(22),
        validate: v => (num(v?.value) === 0 ? 'Must be more than 0' : null),
        help: 'The field area used for this crop only. Include buffer strips, field margins and hedgerows; exclude nearby land not used for the crop.'
      }),
      quantity('cropDetails.cropYield', 'Total harvest amount', {
        units: R.YIELD_UNIT, apiKey: 'verified', provenance: GS, source: row(23),
        help: 'Total fresh harvested amount. Used to estimate the residues created at harvest.'
      }),
      quantity('cropDetails.farmGate', 'Farm gate ready amount', {
        units: R.YIELD_UNIT, apiKey: 'verified', provenance: GS, source: row(24),
        help: 'Quantity that leaves the farm / is sold (as on invoices). Used for emissions per tonne of product. Can be less than the total harvest after drying or sorting.'
      })
    ]
  },
  {
    id: 'coProducts',
    title: 'Co-products',
    group: 'Crop details',
    icon: 'call_split',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Only if you use or sell co-products of this crop (e.g. straw). This shares the impact between the products. CFP recommends skipping this unless needed; straw used on your own farm belongs in Crop residues.',
    provenance: G,
    source: 'Data Input Table rows 25-31; Lay Guide 3.2 (Co-products)',
    fields: [
      text('coProducts.mainProductLabel', 'Main product label', {
        source: row(27), requiredIf: c => (c.doc.coProducts?.items || []).length > 0
      }),
      group('coProducts.items', 'Co-products', {
        item: 'co-product', source: row('28-31'),
        fields: [
          text('type', 'Type of co-product', { source: row(29), placeholder: 'e.g. straw, sugar beet pulp' }),
          percent('percentage', 'Co-product percentage', { source: row(30) }),
          radio('allocationMethod', 'Allocation method', { options: ['Economic', 'Mass', 'Other'], source: row(31) })
        ]
      })
    ]
  },
  {
    id: 'residue',
    title: 'Crop residues',
    group: 'Crop management',
    icon: 'compost',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: true,
    intro: 'Above-ground residues are the stalks and leaves left after harvest. Below-ground residues are estimated from crop type and yield.',
    provenance: GS,
    source: 'Data Input Table rows 32-34; API inputData.residue (required section); Lay Guide 3.3',
    fields: [
      quantity('residue.aboveGroundResidue', 'Above ground residue - dry weight', {
        units: R.WEIGHT_PER_AREA, optional: true, apiKey: 'verified', provenance: GS, source: row(33),
        help: 'Optional, only if known. Without it CFP uses a default from crop type and yield. Enter dry matter.'
      }),
      select('residue.residueManagementPractice', 'Residue management', {
        options: RESIDUE_OPTIONS, apiKey: 'verified', provenance: GS, source: row(34) + '; API enum',
        help: 'Burning, heaps/pits and composting release CH4 and N2O. "Left on field" includes incorporated or mulched residues. Exported residues carry no emissions here.'
      })
    ]
  },
  {
    id: 'paddy',
    title: 'Paddy',
    group: 'Crop details',
    icon: 'water',
    pathways: ['paddy_rice'],
    required: true,
    intro: 'Flooded rice fields produce methane. CFP combines these water-regime answers with regional values. Upland (non-flooded) rice does not need them.',
    provenance: G,
    source: 'Data Input Table rows 36-43 (rice only); Lay Guide 3.2 (Paddy rice-specific pathway)',
    fields: [
      select('paddy.preSeasonWaterRegime', 'Pre-season water regime', { options: R.PRE_SEASON_WATER_REGIME, source: row(37) }),
      quantity('paddy.timeUnderCultivation', 'Time under cultivation', {
        units: R.TIME_UNDER_CULTIVATION_UNIT, noValueUnits: ['use default (IPCC)'], source: row(38),
        help: 'Enter the time, or pick "use default (IPCC)" as the unit.'
      }),
      group('paddy.organicAmendments', 'Organic amendments applied', {
        item: 'organic amendment', source: row('39-43'),
        fields: [
          select('type', 'Organic amendment type', { options: R.ORGANIC_AMENDMENT_TYPE, source: row(40) }),
          quantity('applicationRate', 'Application rate', { units: R.APPLICATION_RATE_UNIT, source: row(41) })
        ]
      })
    ]
  },
  {
    id: 'wasteWater',
    title: 'Waste water',
    group: 'Crop management',
    icon: 'water_damage',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Skip this section if pools of standing waste water are not managed or your average annual temperature is less than 15°C.',
    provenance: GS,
    source: 'Data Input Table rows 44-48; API inputData.wasteWater.treatments; Lay Guide 3.3',
    fields: [
      group('wasteWater.treatments', 'Waste water treatments', {
        item: 'treatment', apiKey: 'verified', provenance: GS, source: row('44-48'),
        fields: [
          radio('oxygenDemandType', 'Oxygen demand type', { options: ['Biochemical', 'Chemical'], apiKey: 'verified', provenance: GS, source: row(45), help: 'BOD: oxygen aerobic microbes need to break down organic matter. COD: oxygen needed to chemically break down organic and inorganic matter.' }),
          select('treatmentProcess', 'Treatment process', { options: R.WASTE_WATER_TREATMENT.filter(t => !t.includes('DEPRECATED')), apiKey: 'verified', provenance: GS, source: row(46) }),
          quantity('wasteWaterVolume', 'Waste water volume', { units: R.WASTE_WATER_VOLUME_UNIT, apiKey: 'verified', provenance: GS, source: row(47) }),
          quantity('oxygenDemand', 'Oxygen demand', { units: OXYGEN_DEMAND_UNITS, apiKey: 'verified', provenance: GS, source: row(48) })
        ]
      })
    ]
  },
  {
    id: 'pesticide',
    title: 'Pesticides',
    group: 'Inputs',
    icon: 'pest_control',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'One entry per product application. Leave empty if no crop protection products were used.',
    provenance: GS,
    source: 'Data Input Table rows 49-64; API inputData.pesticide.applications; Lay Guide 3.4',
    fields: [
      group('pesticide.applications', 'Pesticide applications', {
        item: 'pesticide', apiKey: 'verified', provenance: GS, source: row('50-64'),
        fields: [
          select('category', 'Category', { options: R.PESTICIDE_CATEGORY, source: row(50) }),
          select('type', 'Type', { options: R.PESTICIDE_TYPE, source: row(51) }),
          percent('fieldPercentage', 'Percentage of the field the product was applied to', { source: row(52), validate: v => (num(v) === 0 ? 'Must be more than 0' : null) }),
          percent('activeIngredientPercentage', 'Active ingredients', {
            source: row(53), validate: v => (num(v) === 0 ? 'Must be more than 0' : null),
            help: 'Percentage of active ingredient in the product. If you know the quantity of active ingredient instead, enter that quantity per area as the application rate and 100% here.'
          }),
          quantity('applicationRate', 'Application rate', {
            units: R.APPLICATION_RATE_UNIT, source: row(54), validate: v => (num(v?.value) === 0 ? 'Must be more than 0' : null),
            help: 'CFP has no liquid function yet: it treats 1 litre as 1 kg.'
          })
        ]
      })
    ]
  },
  {
    id: 'fertiliser',
    title: 'Fertilisers',
    group: 'Inputs',
    icon: 'science',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Include fertiliser applications to the growing area and any associated catch/cover crops or managed field boundaries. Machinery used to apply inputs goes under Fuel & energy.',
    provenance: GS,
    source: 'Data Input Table rows 65-90; API inputData.fertiliser.fertilisers; Lay Guide 3.4; KB "Compose Your Own Fertiliser - Summation Exceeds 100%"',
    fields: [
      group('fertiliser.fertilisers', 'Fertiliser applications', {
        item: 'fertiliser', apiKey: 'verified', provenance: GS, source: row('67-90'),
        fields: [
          select('type', 'Fertiliser type', { options: FERTILISER_OPTIONS, source: row(67) }),
          select('productionRegion', 'Fertiliser production region', {
            source: row(68),
            provenance: ['VERIFIED_GUIDE', 'PROVISIONAL'],
            help: 'Where the fertiliser was manufactured. Asked for mineral fertilisers only (CFP assumes zero production emissions for manures).',
            showIf: c => isMineral(c.item.type),
            options: c => R.FERTILISER_REGION.filter(r => !r.startsWith('Chile') || /caliche/i.test(c.item.type || ''))
          }),
          percent('nAmmonium', '%N (as ammonium N)', { source: row(70), showIf: c => c.item.type === COMPOSE_NPK, help: 'Nitrogen content (N-equivalent), not the compound. Enter 0 if none.' }),
          percent('nNitrate', '%N (as nitrate N)', { source: row(71), showIf: c => c.item.type === COMPOSE_NPK, help: 'Enter 0 if none.' }),
          percent('nUrea', '%N (as urea-N)', { source: row(72), showIf: c => c.item.type === COMPOSE_NPK, help: 'Enter 0 if none.' }),
          quantity('phosphorus', '%P2O5 OR %P', { units: ['%P2O5', '%P'], max: 100, source: row(73), showIf: c => c.item.type === COMPOSE_NPK, help: 'Enter 0 if none.' }),
          quantity('potassium', '%K2O OR %K', { units: ['%K2O', '%K'], max: 100, source: row(74), showIf: c => c.item.type === COMPOSE_NPK, help: 'Enter 0 if none.' }),
          quantity('applicationRate', 'Application rate', { units: R.APPLICATION_RATE_UNIT, source: row(75), validate: v => (num(v?.value) === 0 ? 'Must be more than 0' : null) }),
          select('weightOrUnit', 'Fertiliser weight, or units?', {
            options: R.FERTILISER_WEIGHT_OR_UNIT, source: row(76),
            help: '"product" = the application rate is the weight of the whole product; otherwise it is the weight of the nutrient named.',
            warn: (v, c) => {
              const t: string = c.item.type || ''
              if (/potassium nitrate/i.test(t) && v === 'unit of P2O5 (P2O5)') return 'Potassium nitrate should not be entered with fertiliser weight/unit "P2O5" (CFP knowledge base).'
              const nutrient = NUTRIENT_OF_UNIT[v]
              const ingredients = R.FERTILISER_INGREDIENTS[t]
              if (nutrient && ingredients && t !== COMPOSE_NPK && !ingredients.includes(nutrient)) return `${t} does not list this nutrient. Check the unit.`
              return null
            }
          }),
          date('applicationDate', 'Date of application', { optional: true, source: row(77) }),
          checkbox('nitrificationInhibitor', 'Nitrification inhibitor used', {
            optional: true, source: row(78), provenance: ['VERIFIED_GUIDE', 'PROVISIONAL'],
            help: 'Only for non-nitrate nitrogen fertilisers (e.g. ammonia, urea, ammonium, manure).',
            showIf: c => inhibitorApplies(c.item)
          })
        ],
        validateItem: item => {
          if (item.type !== COMPOSE_NPK) return null
          const parts = [num(item.nAmmonium), num(item.nNitrate), num(item.nUrea), num(item.phosphorus?.value), num(item.potassium?.value)]
          const total = parts.reduce<number>((s, v) => s + (v ?? 0), 0)
          return total > 100 ? { key: 'nAmmonium', message: `The nutrient percentages add up to ${+total.toFixed(2)}%. %N + %P + %K must stay below 100%.` } : null
        }
      })
    ]
  },
  {
    id: 'refrigerants',
    title: 'Refrigerants',
    group: 'Refrigerants',
    icon: 'ac_unit',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Refrigeration and air-conditioning equipment used for this crop. Energy used to run it belongs under Fuel & energy.',
    provenance: GS,
    source: 'Data Input Table rows 91-101; API inputData.refrigerants.equipments; Lay Guide 3.5',
    fields: [
      group('refrigerants.equipments', 'Equipment', {
        item: 'equipment', apiKey: 'verified', provenance: GS, source: row('93-101'),
        fields: [
          select('equipmentType', 'Equipment type', { options: R.REFRIGERANT_EQUIPMENT, source: row(93) }),
          integer('numberOfUnits', 'Number of identical equipment units (same age)', { min: 1, source: row(94) }),
          select('refrigerantType', 'Refrigerant type', { options: R.REFRIGERANT_TYPE, source: row(95) }),
          integer('age', 'Age of equipment (years)', { optional: true, source: row(96), help: 'Optional, if not default.' }),
          checkbox('disposed', 'These equipment units were disposed of within the assessment period', { optional: true, source: row(97) }),
          select('recoveryPathway', 'Refrigerant recovery pathway', { options: R.REFRIGERANT_RECOVERY, source: row(98), showIf: c => c.item.disposed === true }),
          quantity('initialAmount', 'Initial refrigerant amount', { units: R.WEIGHT_UNIT, optional: true, source: row(99), help: 'Optional, if not default.' }),
          select('allocationMethod', 'Allocation method', { options: R.ALLOCATION_METHOD_REFRIGERANT, optional: true, source: row(100), help: 'Optional, if not default. Physical allocation is preferred where space and time of use can be split.' }),
          percent('allocationPercentage', 'Allocation percentage', { optional: true, source: row(101), help: 'Optional, if not default.' })
        ]
      })
    ]
  },
  {
    id: 'seedProduction',
    title: 'Seeds',
    group: 'Seeds',
    icon: 'spa',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Seed or plugs bought for this crop. Optional in CFP, but needed for a complete cradle-to-farm-gate footprint.',
    provenance: GS,
    source: 'Data Input Table rows 102-110; API inputData.seedProduction.seedBought; Lay Guide 3.6',
    fields: [
      radio('seedProduction.seedBought.purchaseType', 'Purchase type for the production of this crop', { options: ['Plugs', 'Seed'], source: row(103) }),
      integer('seedProduction.seedBought.plugsPurchased', 'Number of plugs purchased in assessment year', { source: row(106), showIf: c => c.doc.seedProduction?.seedBought?.purchaseType === 'Plugs' }),
      checkbox('seedProduction.seedBought.plugsInPeat', 'Plugs came in peat soil', { optional: true, source: row(107), showIf: c => c.doc.seedProduction?.seedBought?.purchaseType === 'Plugs' }),
      quantity('seedProduction.seedBought.seedMass', 'Mass of seed', { units: R.WEIGHT_UNIT, source: row(109), showIf: c => c.doc.seedProduction?.seedBought?.purchaseType === 'Seed' }),
      radio('seedProduction.seedBought.seedSource', 'Seed source', { options: ['Hybrid seed (from breeder)', 'Single variety'], source: row(110), showIf: c => c.doc.seedProduction?.seedBought?.purchaseType === 'Seed' })
    ]
  },
  {
    id: 'fuelEnergy',
    title: 'Fuel & energy',
    group: 'Fuel & energy',
    icon: 'local_gas_station',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Total electricity and fuels used for crop production and on-farm processing (storage, lighting, ventilation, machinery…). Off-farm transport goes under Transport. If you enter all in-field energy here, skip Machinery operations (and transport covered by this fuel) to avoid double counting.',
    provenance: GS,
    source: 'Data Input Table rows 111-124; API inputData.fuelEnergy.usages; Lay Guide 3.7; KB "If I have entered fuel consumption…"',
    fields: [
      group('fuelEnergy.usages', 'Energy uses', {
        item: 'energy use', apiKey: 'verified', provenance: GS, source: row('113-124'),
        fields: [
          select('energySource', 'Energy source', { options: ENERGY_SOURCE_OPTIONS, source: row(113) }),
          quantity('energyUsed', 'Energy used', {
            units: c => energyUnitsFor(c.item.energySource), source: row(114),
            help: 'Units follow the source: by volume, by weight or by energy.'
          }),
          select('boundary', 'Boundary', { options: R.BOUNDARY, source: row(115) }),
          radio('category', 'Category', { options: ['Field', 'Facility (Processing)'], source: row(116) })
        ]
      })
    ]
  },
  {
    id: 'irrigation',
    title: 'Irrigation',
    group: 'Fuel & energy',
    icon: 'water_drop',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Energy used for irrigation. Leave empty for rainfed crops, or if irrigation energy is already in Fuel & energy. "Volume only" is simpler; pumping depth and distance give a more accurate estimate.',
    provenance: GS,
    source: 'Data Input Table rows 125-135; API inputData.irrigation.events; Lay Guide 3.7; KB "Volume-only Irrigation via the API"',
    fields: [
      group('irrigation.events', 'Irrigation events', {
        item: 'irrigation event', apiKey: 'verified', provenance: GS, source: row('127-135'),
        fields: [
          select('method', 'Method', { options: R.IRRIGATION_METHOD, source: row(127), help: 'Hose and pump systems: see the CFP knowledge base article on classifying them.' }),
          select('waterSource', 'Water source', { options: R.WATER_SOURCE, source: row(128) }),
          select('powerSource', 'Power source', { options: R.POWER_SOURCE, source: row(129) }),
          percent('fieldPercentage', '% field irrigated', { source: row(130), validate: v => (num(v) === 0 ? 'Must be more than 0' : null) }),
          radio('calculationMethod', 'Calculation methodology', { options: ['Volume, pumping depth & distance', 'Volume only'], source: row(131) }),
          quantity('totalWater', 'Total water added', { units: R.IRRIGATION_WATER_UNIT, source: row(132) }),
          quantity('pumpingDepth', 'Pumping depth / height', { units: R.PUMPING_DEPTH_UNIT, source: row(134), showIf: c => c.item.calculationMethod === 'Volume, pumping depth & distance' }),
          quantity('horizontalDistance', 'Horizontal distance', { units: R.HORIZONTAL_DISTANCE_UNIT, source: row(135), showIf: c => c.item.calculationMethod === 'Volume, pumping depth & distance' })
        ]
      })
    ]
  },
  {
    id: 'transport',
    title: 'Transport',
    group: 'Fuel & energy',
    icon: 'local_shipping',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Inbound transport of inputs used for this crop (fertilisers, pesticides, seeds…) should be included even if you don\'t operate the vehicles. You can also include outbound transport of the crop and co-products to processing or storage.',
    provenance: GS,
    source: 'Data Input Table rows 136-147; API inputData.transport.transports; Lay Guide 3.7',
    fields: [
      group('transport.transports', 'Transport', {
        item: 'transport', apiKey: 'verified', provenance: GS, source: row('138-147'),
        fields: [
          select('type', 'Type', { options: R.TRANSPORT_TYPE, source: row(138) }),
          radio('boundary', 'Boundary', { options: ['Incoming to Farm for on-farm use', 'Within Farm', 'Dispatched from farm'], source: row(139) }),
          quantity('weight', 'Weight', { units: R.WEIGHT_UNIT, source: row(140) }),
          quantity('distance', 'Distance', { units: DISTANCE_UNITS, source: row(141) }),
          text('label', 'Label', { optional: true, source: row(142) })
        ]
      })
    ]
  },
  {
    id: 'machinery',
    title: 'Machinery operations',
    group: 'Fuel & energy',
    icon: 'agriculture',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Only if you lack exact fuel/energy figures: list operations to estimate fuel use. If all in-field energy is under Fuel & energy, skip this to avoid double counting.',
    provenance: GS,
    source: 'Data Input Table rows 148-161; API inputData.machinery.machineryUse and cropDetails.soilType',
    fields: [
      radio('cropDetails.soilType', 'Soil type', {
        options: R.SOIL_TYPE.map(s => ({ value: s[0].toUpperCase() + s.slice(1), label: s })),
        apiKey: 'verified', provenance: GS, source: row(150),
        help: 'Soil texture changes the fuel needed for field operations.'
      }),
      group('machinery.machineryUse', 'Machines', {
        item: 'machine', apiKey: 'verified', provenance: GS, source: row('151-161'),
        fields: [
          select('machine', 'Machine type', { options: R.MACHINE_TYPE, apiKey: 'verified', provenance: GS, source: row(151) }),
          select('fuelUse', 'Fuel type', { options: R.MACHINE_FUEL, apiKey: 'verified', provenance: GS, source: row(152) }),
          integer('numberMachineryOperations', 'Number of operations', { min: 1, apiKey: 'verified', provenance: GS, source: row(153) }),
          text('label', 'Label', { optional: true, apiKey: 'verified', provenance: GS, source: row(154) })
        ]
      })
    ]
  },
  {
    id: 'potatoProcessing',
    title: 'Processing',
    group: 'Fuel & energy',
    icon: 'conveyor_belt',
    pathways: ['potato'],
    required: false,
    intro: 'Potato only: energy for washing and grading the harvested product on farm.',
    provenance: G,
    source: 'Data Input Table rows 162-165 (potato only); Lay Guide 3.7',
    fields: [
      percent('potatoProcessing.percentProcessed', 'Percentage (%) of total harvest processed', { source: row(163) }),
      radio('potatoProcessing.processingType', 'Processing type', { options: ['Washing', 'Grading'], source: row(164) }),
      select('potatoProcessing.energySource', 'Energy source', { options: ENERGY_SOURCE_OPTIONS, source: row(165) })
    ]
  },
  {
    id: 'potatoStorage',
    title: 'Storage',
    group: 'Fuel & energy',
    icon: 'warehouse',
    pathways: ['potato'],
    required: false,
    intro: 'Potato only: loading/unloading, temperature control, ventilation and sprout suppression in store.',
    provenance: G,
    source: 'Data Input Table rows 166-174 (potato only); Lay Guide 3.7',
    fields: [
      percent('potatoStorage.percentStored', 'Percentage (%) of total harvest stored', { source: row(167) }),
      select('potatoStorage.energyLoading', 'Energy source for loading', { options: ALL_ENERGY_SOURCES, source: row(168) }),
      select('potatoStorage.energyUnloading', 'Energy source for unloading', { options: ALL_ENERGY_SOURCES, source: row(169) }),
      select('potatoStorage.energyTemperatureControl', 'Energy source for temperature control', { options: ALL_ENERGY_SOURCES, source: row(170) }),
      quantity('potatoStorage.timeInStorage', 'Time in storage', { units: R.STORAGE_TIME_UNIT, source: row(171) }),
      quantity('potatoStorage.temperatureDifference', 'Temperature difference', {
        units: TEMPERATURE_UNITS, allowNegative: true, source: row(172), provenance: ['VERIFIED_GUIDE', 'PROVISIONAL'],
        help: 'The table says "Number + unit" without listing units; °C / °F is our assumption.'
      }),
      integer('potatoStorage.cipcApplications', 'CIPC applications', { source: row(173) }),
      number('potatoStorage.cipcDose', 'CIPC dose per treatment (grams/tonne)', { source: row(174), showIf: c => (num(c.doc.potatoStorage?.cipcApplications) ?? 0) > 0 })
    ]
  },
  {
    id: 'nonCrop',
    title: 'Non-crop biomass (estimated)',
    group: 'Carbon changes',
    icon: 'forest',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Simple estimate for permanent trees within or next to the field planted in the last 20 years: intercrops, shade trees and hedges. Not for timber forestry, orchards or unmanaged forest.',
    provenance: GS,
    source: 'Data Input Table rows 175-188; API inputData.nonCrop (hedges, intercrops, shadeTrees); Lay Guide 3.8',
    fields: [
      group('nonCrop.intercrops', 'Intercrops', {
        item: 'intercrop', apiKey: 'verified', provenance: GS, source: row('177-180'),
        fields: [
          select('type', 'Intercrop type', { options: R.INTERCROP_TYPE, source: row(178) }),
          percent('percentageOccupied', 'Percentage occupied', { source: row(179) }),
          quantity('plantingDensity', 'Planting density', { units: DENSITY_UNITS, source: row(180) })
        ]
      }),
      group('nonCrop.shadeTrees', 'Shade trees', {
        item: 'shade tree', apiKey: 'verified', provenance: GS, source: row('181-184'),
        fields: [
          select('type', 'Tree type', { options: R.SHADE_TREE_TYPE, source: row(182), help: 'Not listed? Choose the closest type: it drives the biomass estimate.' }),
          percent('percentageOccupied', 'Percentage occupied', { source: row(183) }),
          quantity('plantingDensity', 'Planting density', { units: DENSITY_UNITS, source: row(184) })
        ]
      }),
      group('nonCrop.hedges', 'Hedges', {
        item: 'hedge', apiKey: 'verified', provenance: GS, source: row('185-188'),
        fields: [
          select('type', 'Hedge type', { options: R.HEDGE_TYPE, source: row(186) }),
          quantity('width', 'Hedge width', { units: WIDTH_UNITS, source: row(187) }),
          quantity('length', 'Hedge length', { units: R.HEDGE_LENGTH_UNIT, source: row(188) })
        ]
      })
    ]
  },
  {
    id: 'nonCropMeasured',
    title: 'Non-crop biomass (measured)',
    group: 'Carbon changes',
    icon: 'straighten',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Use if you know trees per hectare and the average tree size for this year and last year. Measurement depends on species: diameter at 15 cm, diameter at breast height, or tree height. Enter older and newly planted trees separately.',
    provenance: GS,
    source: 'Data Input Table rows 190-213; API validation report category "nonCropMeasured"; Lay Guide 3.8',
    fields: [
      group('nonCropMeasured.trees', 'Tree species', {
        item: 'tree species', source: row('192-213'),
        fields: [
          select('treeType', 'Tree type', { options: R.TREE_TYPE, source: row(192) }),
          integer('netTreesChange', 'Net number of trees planted (+) or removed (-)', { allowNegative: true, source: row(193) }),
          percent('percentageOccupiedPrevious', 'Percentage occupied (previous year)', { source: row(194) }),
          quantity('plantDensityPrevious', 'Plant density (previous year)', { units: DENSITY_UNITS, source: row(195) }),
          quantity('measurementPrevious', 'Sample tree measurement (previous year)', { units: R.TREE_MEASUREMENT_UNIT, source: row(197) }),
          number('sdPrevious', 'Standard deviation (previous year)', { optional: true, source: row(198), help: 'Only if your measurement format includes a standard deviation.' }),
          integer('sampleSizePrevious', 'Sample size (previous year)', { optional: true, source: row(199), requiredIf: c => num(c.item.sdPrevious) !== null }),
          quantity('measurementCurrent', 'Sample tree measurement (current year)', { units: R.TREE_MEASUREMENT_UNIT, source: row(200) }),
          number('sdCurrent', 'Standard deviation (current year)', { optional: true, source: row(201) }),
          integer('sampleSizeCurrent', 'Sample size (current year)', { optional: true, source: row(202), requiredIf: c => num(c.item.sdCurrent) !== null })
        ]
      })
    ]
  },
  {
    id: 'landUseChangeBiomass',
    title: 'Re-/deforestation',
    group: 'Carbon changes',
    icon: 'nature',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Any de- or reforestation within the bounds of your growing area during the lifecycle of the assessed crop (tree biomass emissions or removals, spread over 20 years).',
    provenance: GS,
    source: 'Data Input Table rows 214-220; API inputData.landUseChangeBiomass.forestChanges; Lay Guide 3.8',
    fields: [
      group('landUseChangeBiomass.forestChanges', 'Forest changes', {
        item: 'forest change', apiKey: 'verified', provenance: GS, source: row('216-220'),
        fields: [
          radio('changeType', 'Type of change', {
            options: ['Deforestation', 'Reforestation'], source: 'Not in the table (it says "fill the following only if deforested")', provenance: P,
            help: 'Added so the "age of forest" question can appear only for deforestation.'
          }),
          select('forestType', 'Forest type', { options: R.FOREST_TYPE, source: row(216) }),
          integer('yearsAgo', 'How many years ago did the land use change happen?', { source: row(217) }),
          quantity('area', 'Area re-/deforested', { units: AREA_UNITS, source: row(218) }),
          integer('forestAgeWhenRemoved', 'Age of forest when removed (years)', { source: row(220), showIf: c => c.item.changeType === 'Deforestation' })
        ]
      })
    ]
  },
  {
    id: 'soilCarbon',
    title: 'Soil carbon changes',
    group: 'Carbon changes',
    icon: 'layers',
    pathways: ['annual_crops', 'paddy_rice', 'potato'],
    required: false,
    intro: 'Choose a model. Tier 1 (IPCC) tracks land use and management changes in the past 20 years and is the only option for land use change. Tier 2 (steady-state SOC) models management only, needs land that has been cropland for 20+ years and at least 5 years of history, and does not cover paddy rice.',
    provenance: GS,
    source: 'Data Input Table rows 221-257; Lay Guide 3.8 (Tier 1 vs Tier 2 table); KB "Soil characteristics…" (questions depend on the model you choose); API cropDetails.sandPercentage, farm.soilCharacteristic, inputData.steadyStateSoc',
    fields: [
      radio('soilCarbon.model', 'Soil carbon model', {
        options: c => (c.pathway === 'paddy_rice' ? ['Tier 1'] : ['Tier 1', 'Tier 2']),
        optional: true, source: 'KB: soil data "is dependent on the model you choose"; Lay Guide 3.8', provenance: ['VERIFIED_GUIDE', 'PROVISIONAL'],
        help: 'Skip the section if there were no land use or management changes in the past 20 years.'
      }),
      // ----- Tier 1 -----
      select('farm.soilCharacteristic', 'Soil classification', {
        options: R.SOIL_CHARACTERISTIC, apiKey: 'verified', provenance: GS, source: row(223) + '; API farm.soilCharacteristic; Quick Start (moved to Tier 1)',
        help: 'IPCC soil class. If unknown, choose high activity clay. CFP can look it up from the farm coordinates (soil-characteristic endpoint).',
        showIf: c => c.doc.soilCarbon?.model === 'Tier 1'
      }),
      group('soilCarbon.tier1.changes', 'Changes (most recent first)', {
        item: 'change', minItems: 1, source: row('224-229'),
        showIf: c => c.doc.soilCarbon?.model === 'Tier 1',
        fields: [
          year('yearOfChange', 'Year of change', { source: row(225) }),
          pair('landUse', 'Land use change', { options: R.LAND_USE, pairLabels: ['Previous state', 'New state'], source: row(226) }),
          pair('tillage', 'Tillage', { options: TILLAGE_T1, pairLabels: ['Previous state', 'New state'], source: row(227) }),
          pair('carbonInputs', 'Carbon inputs', { options: R.CARBON_INPUT, pairLabels: ['Previous state', 'New state'], source: row(228) }),
          percent('fieldPercentage', 'Percentage of field change applies to', { source: row(229) })
        ],
        validateList: (items, c) => {
          const yr = num(c.doc.cropDetails?.assessmentYear)
          if (yr === null) return null
          const old = items.find(i => num(i.yearOfChange) !== null && yr - num(i.yearOfChange)! > 20)
          return old ? 'Tier 1 covers changes in the past 20 years.' : null
        }
      }),
      // ----- Tier 2 -----
      percent('cropDetails.sandPercentage', 'Percentage of sand in soil', {
        apiKey: 'verified', provenance: GS, source: row(232) + ' ("not needed for rice"); API cropDetails.sandPercentage',
        showIf: c => c.doc.soilCarbon?.model === 'Tier 2'
      }),
      radio('steadyStateSoc.assessmentYear.tillage', 'Assessment year: tillage', { options: TILLAGE_T2, source: row(233), showIf: c => c.doc.soilCarbon?.model === 'Tier 2' }),
      radio('steadyStateSoc.assessmentYear.irrigation', 'Assessment year: irrigation', { options: YES_NO, source: row(234), showIf: c => c.doc.soilCarbon?.model === 'Tier 2' }),
      group('steadyStateSoc.assessmentYear.coverCrops', 'Assessment year: cover crops', {
        item: 'cover crop', source: row('235-241'), showIf: c => c.doc.soilCarbon?.model === 'Tier 2',
        fields: coverCropFields([236, 237, 238, 239, 240, 241])
      }),
      group('steadyStateSoc.cropHistory', 'Crop history', {
        item: 'crop history period', minItems: 1, source: row('242-257'),
        showIf: c => c.doc.soilCarbon?.model === 'Tier 2',
        fields: [
          select('cropType', 'Crop type', { options: HISTORY_CROP_OPTIONS, source: row(242) }),
          year('startYear', 'Start year of crop cycle', { source: row(243) }),
          year('endYear', 'End year of crop cycle', {
            source: row(243),
            validate: (v, c) => (num(c.item.startYear) !== null && num(v)! < num(c.item.startYear)! ? 'Must be the same as or after the start year' : null)
          }),
          quantity('cropYield', 'Crop yield (average if several years)', {
            units: R.WEIGHT_PER_AREA, source: row(244), showIf: c => (R.ANNUAL_CROP_TYPE as readonly string[]).includes(c.item.cropType)
          }),
          checkbox('residuesLeft', 'Residues were left on the field', { optional: true, source: row(245) }),
          radio('tillage', 'Tillage', { options: TILLAGE_T2, source: row(246) }),
          radio('irrigation', 'Irrigation', { options: YES_NO, source: row(247) }),
          group('organicInputs', 'Organic inputs', {
            item: 'organic input', source: row('248-250'),
            fields: [
              select('type', 'Organic input type', {
                options: R.FERTILISER_ORGANIC, source: row(249), provenance: ['VERIFIED_GUIDE', 'PROVISIONAL'],
                help: 'The table says "select from list" without naming it; the Organic inputs fertiliser list is our assumption.'
              }),
              quantity('amount', 'Amount of organic input', { units: R.APPLICATION_RATE_UNIT, source: row(250) })
            ]
          }),
          group('coverCrops', 'Cover crops', { item: 'cover crop', source: row('251-257'), fields: coverCropFields([252, 253, 254, 255, 256, 257]) })
        ],
        validateList: items => {
          const years = items.reduce((s, i) => {
            const a = num(i.startYear), b = num(i.endYear)
            return a !== null && b !== null && b >= a ? s + (b - a + 1) : s
          }, 0)
          return years > 0 && years < 5 ? `Tier 2 needs at least 5 years of crop history (${years} entered).` : null
        }
      })
    ]
  }
]

export const SECTION_BY_ID: Record<string, SectionDef> = Object.fromEntries(SECTIONS.map(s => [s.id, s]))

export function sectionsFor(pathway: Pathway) {
  return SECTIONS.filter(s => s.pathways.includes(pathway))
}

export function isSectionRequired(s: SectionDef, pathway: Pathway) {
  return typeof s.required === 'function' ? s.required(pathway) : s.required
}

export function pathwayLabel(p: Pathway) {
  return PATHWAYS.find(x => x.id === p)?.label ?? p
}
