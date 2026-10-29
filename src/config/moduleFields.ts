import { ModuleKey } from './modules'
import { Answers, Question, findQuestion } from './fatSurvey'

// Each diary activity asks the CFT questionnaire's own questions (same ids, answer lists, units and
// show/hide rules), so an entry feeds the survey directly. The entry's date stands in for the
// questionnaire's date questions (F01, G03, I02, J08).

function q(id: string): Question {
  const found = findQuestion(id)
  if (!found) throw new Error(`Unknown CFT question ${id}`)
  return found
}
const when = (cond: (v: Answers) => boolean, base: Question): Question => ({ ...base, showIf: v => cond(v) && (!base.showIf || base.showIf(v)) })
// Area questions default to the plot's area.
const plotArea = (base: Question): Question => ({ ...base, derive: v => v.B04 })

const COST: Question = {
  id: 'totalCostPerAcre', label: 'Cost of this work', help: 'For your diary only – not part of the CFT survey.',
  type: 'number', unit: '₹ per acre', min: 0, optional: true
}

export const FERTILISER = 'Fertiliser (synthetic / bio)'
export const MANURE = 'Organic manure / compost'
const isFertiliser = (v: Answers) => v.kind === FERTILISER
const isManure = (v: Answers) => v.kind === MANURE
export const PREVIOUS_RESIDUE = 'Previous crop (before sowing)'
export const CURRENT_RESIDUE = 'This crop (after harvest)'
const isPreviousResidue = (v: Answers) => v.residueOf === PREVIOUS_RESIDUE
const isCurrentResidue = (v: Answers) => v.residueOf !== PREVIOUS_RESIDUE
const irrigated = (v: Answers) => !!v.J01 && v.J01 !== 'Not irrigated (rainfed)'

export type ModuleForm = {
  questions: Question[]
  // Starting answers for a new entry.
  initial?: Answers
  // Set-up answers copied from the farmer's last entry of the same activity.
  carry?: string[]
  // Areas and field totals, dropped when one entry is saved to several plots so each plot falls back
  // to its own area.
  areaIds?: string[]
  // One-line note shown on the plot timeline.
  summary: (p: Answers) => string
}

const join = (...parts: any[]) => parts.filter(p => p !== undefined && p !== null && p !== '').join(' · ')

export const MODULE_FORMS: Record<ModuleKey, ModuleForm> = {
  'Land Preparation & Sowing': {
    questions: [q('C01'), q('C02'), q('D02'), q('D03'), q('D04'), q('D05'), q('D06'), COST],
    carry: ['C01', 'C02'],
    summary: p => join(p.D02, p.C01)
  },
  'Seed & Sowing': {
    questions: [q('B03'), q('B06'), q('B09'), q('B10'), q('B11'), q('B12'), COST],
    summary: p => join(p.B03, p.B09 && `${p.B09} kg/acre`)
  },
  'Fertilizer & Nutrient Management': {
    questions: [
      { id: 'kind', label: 'What was applied?', type: 'choice', options: [FERTILISER, MANURE] },
      when(isFertiliser, q('F02')),
      when(isFertiliser, q('F03')),
      when(isFertiliser, q('F04')),
      when(isFertiliser, plotArea(q('F05'))),
      when(isFertiliser, q('F06')),
      when(isFertiliser, q('F07')),
      when(isManure, { ...q('G02'), options: q('G02').options!.filter(o => o !== 'No organic amendment') }),
      when(isManure, q('G04')),
      when(isManure, plotArea(q('G05'))),
      COST
    ],
    initial: { kind: FERTILISER },
    areaIds: ['F05', 'G05'],
    summary: p => (p.kind === MANURE ? join(p.G02, p.G04 && `${p.G04} kg/acre`) : join(p.F03 || p.F02, p.F04 && `${p.F04} ${p.F02?.startsWith('Nano') ? 'L' : 'kg'}/acre`))
  },
  'Pest & Disease Management': {
    questions: [q('I03'), plotArea(q('I04')), q('I05'), q('I_products'), COST],
    initial: { I_products: [{}] },
    carry: ['I03'],
    areaIds: ['I04'],
    summary: p => join(...(p.I_products || []).map((x: Answers) => x.I08 || x.I06))
  },
  'Water Management': {
    questions: [
      q('J01'), q('J02'), q('J03'), q('J04'), q('J05'), q('J06'), q('J07'),
      when(irrigated, plotArea(q('J09'))),
      when(irrigated, q('J10')),
      when(irrigated, q('J11')),
      q('J12'),
      COST
    ],
    carry: ['J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J07', 'J12'],
    areaIds: ['J09'],
    summary: p => join(p.J01, p.J10 && `${p.J10} h`)
  },
  Harvesting: {
    questions: [
      { id: 'K01pa', label: 'Main produce harvested', help: 'Per acre. The field total (K01) is worked out from the plot area.', type: 'number', unit: 'quintals per acre', min: 0, step: 0.01 },
      q('K02'), q('K03'), q('K04'), q('K05'), q('K06'), COST
    ],
    areaIds: ['K03', 'K05'],
    summary: p => join(p.K01pa && `${p.K01pa} q/acre`, p.K02 && `${p.K02}% moisture`)
  },
  'Residue Management': {
    questions: [
      { id: 'residueOf', label: 'Residue of which crop?', type: 'choice', options: [CURRENT_RESIDUE, PREVIOUS_RESIDUE] },
      when(isPreviousResidue, q('E01')),
      when(isPreviousResidue, q('E02')),
      when(isPreviousResidue, q('E03')),
      when(isPreviousResidue, plotArea(q('E04'))),
      when(isCurrentResidue, q('E05')),
      when(isCurrentResidue, q('E06')),
      when(isCurrentResidue, q('E07')),
      COST
    ],
    initial: { residueOf: CURRENT_RESIDUE },
    areaIds: ['E04'],
    summary: p => (p.residueOf === PREVIOUS_RESIDUE
      ? join(p.E01 && `${p.E01} residue`, p.E02, p.E03 && `${p.E03} t/acre`)
      : join(p.E05, p.E06 && `${p.E06} t/acre`))
  },
  'Cover Crop & Legume': {
    questions: [
      { ...q('H01'), options: q('H01').options!.filter(o => o !== 'None') },
      q('H02'), q('H03'), q('H04'), plotArea(q('H05')), q('H06'), COST
    ],
    areaIds: ['H05'],
    summary: p => join(p.H02, p.H06 && `${p.H06} q/acre`)
  },
  'Tree Planting': {
    questions: [q('L02'), q('L03'), q('L04'), q('L05'), COST],
    areaIds: ['L04'],
    summary: p => join(p.L02, p.L04 && `${p.L04} trees`, p.L05)
  }
}
