import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import * as R from '../../config/cfp/referenceData'
import { COMPOSE_NPK, RESIDUE_API_ENUM, RESIDUE_OPTIONS, SECTIONS, SECTION_BY_ID, energyUnitsFor, sectionsFor } from '../../config/cfp/schema'
import { applicableInputs, checkAssessment, checkSection, flattenAnswers, isShown, optionsOf, rootCtx, childCtx, setAt } from './engine'
import { createAssessment, duplicateAssessment, editAssessment, restore, softDelete, submitAssessment } from './lifecycle'
import { assessmentCsvRows, assessmentJson } from './export'
import { prepareCalculationInput, calculate, registerCalculationEngine } from './calculation'
import { buildPrefill } from './prefill'
import { canUseAdminFeatures } from '../auth'
import { Doc, Field, Pathway } from './types'

// ---------- Fixtures ----------

const farm = {
  name: 'Sherpur farm', country: 'India', latitude: 30.9, longitude: 75.85, climate: 'Warm Temperate Dry',
  annualAverageTemperature: { value: 24, unit: '°C' }
}

/** A complete rainfed wheat assessment: only the required sections, no irrigation. */
function wheatRainfed(): Doc {
  return {
    farm,
    cropDetails: { cropType: 'Winter wheat', assessmentYear: 2026, area: { value: 3.36, unit: 'hectares' }, cropYield: { value: 18.2, unit: 'tonnes' }, farmGate: { value: 18, unit: 'tonnes' } },
    residue: { residueManagementPractice: 'left_on_field' }
  }
}

const field = (sectionId: string, key: string): Field => SECTION_BY_ID[sectionId].fields.find(f => f.key === key)!
const child = (sectionId: string, groupKey: string, key: string) => field(sectionId, groupKey).fields!.find(f => f.key === key)!

// ---------- Schema ----------

describe('questionnaire schema', () => {
  it('has unique section ids and field keys, and every field has a source and provenance', () => {
    expect(new Set(SECTIONS.map(s => s.id)).size).toBe(SECTIONS.length)
    const walk = (fields: Field[], where: string) => {
      expect(new Set(fields.map(f => f.key)).size, where).toBe(fields.length)
      for (const f of fields) {
        expect(f.provenance.length, `${where}.${f.key}`).toBeGreaterThan(0)
        expect(f.source, `${where}.${f.key}`).toBeTruthy()
        if (f.type === 'group') walk(f.fields!, `${where}.${f.key}`)
      }
    }
    for (const s of SECTIONS) walk(s.fields, s.id)
  })

  it('uses the official reference lists verbatim', () => {
    const ctx = rootCtx('annual_crops', {})
    expect(optionsOf(field('cropDetails', 'cropDetails.cropType'), ctx).map(o => o.value)).toEqual([...R.ANNUAL_CROP_TYPE])
    expect(optionsOf(child('machinery', 'machinery.machineryUse', 'machine'), ctx).map(o => o.value)).toEqual([...R.MACHINE_TYPE])
    expect(optionsOf(child('transport', 'transport.transports', 'type'), ctx).map(o => o.value)).toEqual([...R.TRANSPORT_TYPE])
    expect(optionsOf(child('fertiliser', 'fertiliser.fertilisers', 'type'), ctx).map(o => o.value)).toEqual([...R.FERTILISER_SYNTHETIC, ...R.FERTILISER_ORGANIC])
    expect(R.ANNUAL_CROP_TYPE).toContain('Winter wheat')
    expect(R.MACHINE_TYPE).toHaveLength(76)
  })

  it('stores residue management with the CFP API enum values', () => {
    for (const o of RESIDUE_OPTIONS) expect(RESIDUE_API_ENUM).toContain((o as any).value)
  })

  it('drops deprecated waste water treatment processes', () => {
    const opts = optionsOf(child('wasteWater', 'wasteWater.treatments', 'treatmentProcess'), rootCtx('annual_crops', {}))
    expect(opts.some(o => o.value.includes('DEPRECATED'))).toBe(false)
    expect(opts).toHaveLength(12)
  })

  it('shows pathway-specific sections only where they apply', () => {
    const ids = (p: Pathway) => sectionsFor(p).map(s => s.id)
    expect(ids('annual_crops')).not.toContain('paddy')
    expect(ids('paddy_rice')).toContain('paddy')
    expect(ids('potato')).toEqual(expect.arrayContaining(['potatoProcessing', 'potatoStorage']))
    expect(ids('annual_crops')).not.toContain('potatoStorage')
  })
})

// ---------- Conditional questions ----------

describe('conditional questions', () => {
  it('asks pumping depth and distance only for the depth & distance methodology', () => {
    const f = child('irrigation', 'irrigation.events', 'pumpingDepth')
    const base = rootCtx('annual_crops', {})
    expect(isShown(f, childCtx(base, { calculationMethod: 'Volume only' }))).toBe(false)
    expect(isShown(f, childCtx(base, { calculationMethod: 'Volume, pumping depth & distance' }))).toBe(true)
  })

  it('asks NPK composition only for "Compose your own NPK" and the region only for mineral fertilisers', () => {
    const base = rootCtx('annual_crops', {})
    const n = child('fertiliser', 'fertiliser.fertilisers', 'nAmmonium')
    const region = child('fertiliser', 'fertiliser.fertilisers', 'productionRegion')
    expect(isShown(n, childCtx(base, { type: COMPOSE_NPK }))).toBe(true)
    expect(isShown(n, childCtx(base, { type: 'Urea - 46% N' }))).toBe(false)
    expect(isShown(region, childCtx(base, { type: 'Urea - 46% N' }))).toBe(true)
    expect(isShown(region, childCtx(base, { type: 'Cattle manure - 0.6% N' }))).toBe(false)
  })

  it('offers the nitrification inhibitor for urea/ammonium but not for nitrate-only fertilisers', () => {
    const base = rootCtx('annual_crops', {})
    const f = child('fertiliser', 'fertiliser.fertilisers', 'nitrificationInhibitor')
    expect(isShown(f, childCtx(base, { type: 'Urea - 46% N' }))).toBe(true)
    expect(isShown(f, childCtx(base, { type: 'Calcium nitrate - 15.5% N' }))).toBe(false)
    expect(isShown(f, childCtx(base, { type: COMPOSE_NPK, nUrea: 10 }))).toBe(true)
    expect(isShown(f, childCtx(base, { type: COMPOSE_NPK, nNitrate: 10 }))).toBe(false)
  })

  it('shows refrigerant recovery only when disposed, forest age only for deforestation', () => {
    const base = rootCtx('annual_crops', {})
    expect(isShown(child('refrigerants', 'refrigerants.equipments', 'recoveryPathway'), childCtx(base, { disposed: true }))).toBe(true)
    expect(isShown(child('refrigerants', 'refrigerants.equipments', 'recoveryPathway'), childCtx(base, {}))).toBe(false)
    expect(isShown(child('landUseChangeBiomass', 'landUseChangeBiomass.forestChanges', 'forestAgeWhenRemoved'), childCtx(base, { changeType: 'Reforestation' }))).toBe(false)
  })

  it('lets energy units follow the energy source category', () => {
    expect(energyUnitsFor('Grid electricity')).toEqual(R.ENERGY_UNIT_ENERGY)
    expect(energyUnitsFor('diesel (100% mineral diesel)')).toEqual(R.ENERGY_UNIT_VOLUME)
    expect(energyUnitsFor('fuel wood')).toEqual(R.ENERGY_UNIT_WEIGHT)
  })

  it('does not offer Tier 2 soil carbon for paddy rice', () => {
    const model = field('soilCarbon', 'soilCarbon.model')
    expect(optionsOf(model, rootCtx('paddy_rice', {})).map(o => o.value)).toEqual(['Tier 1'])
    expect(optionsOf(model, rootCtx('annual_crops', {})).map(o => o.value)).toEqual(['Tier 1', 'Tier 2'])
  })

  it('keeps answers hidden by a changed choice but leaves them out of validation and calculation input', () => {
    let doc = wheatRainfed()
    doc = setAt(doc, ['irrigation', 'events'], [{
      method: 'Flooding', waterSource: 'Borehole/well', powerSource: 'Electric', fieldPercentage: 100,
      calculationMethod: 'Volume only', totalWater: { value: 300, unit: 'millimetres' }, pumpingDepth: { value: -5, unit: 'Metres' }
    }])
    expect(doc.irrigation.events[0].pumpingDepth).toBeDefined() // still stored
    expect(checkSection(SECTION_BY_ID.irrigation, doc, 'annual_crops').status).toBe('complete') // not validated
    const { inputData } = applicableInputs(doc, 'annual_crops')
    expect(inputData.irrigation.events[0].pumpingDepth).toBeUndefined()
    expect(inputData.irrigation.events[0].irrigationCalculationType).toBe(2)
  })
})

// ---------- Validation and section status ----------

describe('validation and section status', () => {
  it('marks a complete rainfed wheat assessment ready to submit, with optional sections untouched', () => {
    const report = checkAssessment(wheatRainfed(), 'annual_crops')
    expect(report.blocking).toEqual([])
    expect(report.canSubmit).toBe(true)
    expect(report.statusById.irrigation).toBe('not_started')
    expect(report.statusById.paddy).toBe('not_applicable')
    expect(report.progress).toBe(100)
  })

  it('reports missing required answers in required sections', () => {
    const doc = wheatRainfed()
    delete doc.residue
    delete doc.cropDetails.farmGate
    const report = checkAssessment(doc, 'annual_crops')
    expect(report.canSubmit).toBe(false)
    expect(report.statusById.residue).toBe('not_started')
    expect(report.statusById.cropDetails).toBe('in_progress')
    expect(report.blocking.map(i => i.path.join('.'))).toEqual(expect.arrayContaining(['cropDetails.farmGate', 'residue.residueManagementPractice']))
  })

  it('flags invalid values: percentages, units, numbers, options', () => {
    let doc = wheatRainfed()
    doc = setAt(doc, ['cropDetails', 'area'], { value: 5 }) // no unit
    doc = setAt(doc, ['pesticide', 'applications'], [{ category: 'Pre-emergence', type: 'Herbicide', fieldPercentage: 120, activeIngredientPercentage: 'abc', applicationRate: { value: 1, unit: 'kg per hectare' } }])
    doc = setAt(doc, ['residue', 'residueManagementPractice'], 'eating')
    const report = checkAssessment(doc, 'annual_crops')
    const msg = (p: string) => report.issues.find(i => i.path.join('.') === p)?.message
    expect(msg('cropDetails.area')).toBe('Choose a unit')
    expect(msg('pesticide.applications.0.fieldPercentage')).toBe('Must be between 0 and 100')
    expect(msg('pesticide.applications.0.activeIngredientPercentage')).toBe('Enter a number')
    expect(msg('residue.residueManagementPractice')).toMatch(/not one of the allowed options/)
    expect(report.statusById.pesticide).toBe('invalid')
  })

  it('requires every record field once an optional section is started, but not optional ones', () => {
    const doc = setAt(wheatRainfed(), ['machinery', 'machineryUse'], [{ machine: 'Combine', fuelUse: 'diesel (100% mineral diesel)' }])
    const r = checkSection(SECTION_BY_ID.machinery, doc, 'annual_crops')
    const paths = r.issues.map(i => i.path.join('.'))
    expect(paths).toContain('machinery.machineryUse.0.numberMachineryOperations')
    expect(paths).toContain('cropDetails.soilType') // asked at the top of the section
    expect(paths).not.toContain('machinery.machineryUse.0.label') // optional
    expect(r.status).toBe('in_progress')
  })

  it('stops "compose your own" percentages adding up to more than 100', () => {
    const doc = setAt(wheatRainfed(), ['fertiliser', 'fertilisers'], [{
      type: COMPOSE_NPK, productionRegion: 'S Asia 2014', nAmmonium: 40, nNitrate: 30, nUrea: 20,
      phosphorus: { value: 10, unit: '%P2O5' }, potassium: { value: 10, unit: '%K2O' },
      applicationRate: { value: 100, unit: 'kg per hectare' }, weightOrUnit: 'product'
    }])
    const issues = checkSection(SECTION_BY_ID.fertiliser, doc, 'annual_crops').issues
    expect(issues.find(i => i.kind === 'invalid')?.message).toMatch(/add up to 110%/)
  })

  it('warns, without blocking, about potassium nitrate entered as P2O5', () => {
    const doc = setAt(wheatRainfed(), ['fertiliser', 'fertilisers'], [{
      type: 'Potassium nitrate - prilled (caliche method)', productionRegion: 'Chile 2021 (potassium nitrate caliche method only)',
      applicationRate: { value: 50, unit: 'kg per hectare' }, weightOrUnit: 'unit of P2O5 (P2O5)'
    }])
    const r = checkSection(SECTION_BY_ID.fertiliser, doc, 'annual_crops')
    expect(r.issues.some(i => i.kind === 'warning' && /Potassium nitrate/.test(i.message))).toBe(true)
    expect(r.status).toBe('complete')
  })

  it('needs at least five years of crop history for Tier 2 soil carbon', () => {
    let doc = setAt(wheatRainfed(), ['soilCarbon', 'model'], 'Tier 2')
    doc = setAt(doc, ['cropDetails', 'sandPercentage'], 30)
    doc = setAt(doc, ['steadyStateSoc'], {
      assessmentYear: { tillage: 'No-till', irrigation: 'No' },
      cropHistory: [{ cropType: 'Winter wheat', startYear: 2022, endYear: 2024, cropYield: { value: 5, unit: 'tonnes per hectare' }, tillage: 'Reduced', irrigation: 'No' }]
    })
    const r = checkSection(SECTION_BY_ID.soilCarbon, doc, 'annual_crops')
    expect(r.issues.map(i => i.message)).toContain('Tier 2 needs at least 5 years of crop history (3 entered).')
    doc = setAt(doc, ['steadyStateSoc', 'cropHistory', 0, 'startYear'], 2020)
    expect(checkSection(SECTION_BY_ID.soilCarbon, doc, 'annual_crops').status).toBe('complete')
  })

  it('requires the paddy questions for paddy rice', () => {
    const report = checkAssessment({ ...wheatRainfed(), cropDetails: { ...wheatRainfed().cropDetails, cropType: 'Rice' } }, 'paddy_rice')
    expect(report.canSubmit).toBe(false)
    expect(report.blocking.map(i => i.path.join('.'))).toEqual(expect.arrayContaining(['cropDetails.waterRegime', 'paddy.preSeasonWaterRegime', 'paddy.timeUnderCultivation']))
  })

  it('accepts "use default (IPCC)" as time under cultivation without a number', () => {
    const doc = { ...wheatRainfed(), cropDetails: { ...wheatRainfed().cropDetails, cropType: 'Rice', waterRegime: 'Intermittently flooded' }, paddy: { preSeasonWaterRegime: 'Flooded pre-season (for >30 days)', timeUnderCultivation: { unit: 'use default (IPCC)' } } }
    expect(checkAssessment(doc, 'paddy_rice').canSubmit).toBe(true)
  })
})

// ---------- A full assessment with several records ----------

describe('multi-record maize assessment', () => {
  it('validates several fertilisers, pesticides and machines', () => {
    let doc: Doc = { ...wheatRainfed(), cropDetails: { ...wheatRainfed().cropDetails, cropType: 'Maize', soilType: 'Medium' } }
    doc = setAt(doc, ['fertiliser', 'fertilisers'], [
      { type: 'Urea - 46% N', productionRegion: 'S Asia 2014', applicationRate: { value: 120, unit: 'kg per hectare' }, weightOrUnit: 'product', applicationDate: '2026-02-01', nitrificationInhibitor: true },
      { type: 'Diammonium phosphate - 18% N / 46% P2O5', productionRegion: 'S Asia 2014', applicationRate: { value: 60, unit: 'kg per hectare' }, weightOrUnit: 'product' },
      { type: 'Cattle manure - 0.6% N', applicationRate: { value: 5, unit: 'tonnes per hectare' }, weightOrUnit: 'product' }
    ])
    doc = setAt(doc, ['pesticide', 'applications'], [
      { category: 'Pre-emergence', type: 'Herbicide', fieldPercentage: 100, activeIngredientPercentage: 30, applicationRate: { value: 1, unit: 'litres per hectare' } },
      { category: 'Post-emergence', type: 'Insecticide', fieldPercentage: 50, activeIngredientPercentage: 5, applicationRate: { value: 0.5, unit: 'kg per hectare' } }
    ])
    doc = setAt(doc, ['machinery', 'machineryUse'], [
      { machine: 'Disc harrow', fuelUse: 'diesel (100% mineral diesel)', numberMachineryOperations: 2 },
      { machine: 'Combine', fuelUse: 'diesel (100% mineral diesel)', numberMachineryOperations: 1, label: 'custom hire' }
    ])
    const report = checkAssessment(doc, 'annual_crops')
    expect(report.blocking).toEqual([])
    expect(report.statusById.fertiliser).toBe('complete')
    expect(report.statusById.machinery).toBe('complete')

    const rows = flattenAnswers(doc, 'annual_crops')
    expect(rows.filter(r => r.entry === 'Fertiliser applications #3')).not.toHaveLength(0)
    expect(rows.find(r => r.path === 'fertiliser.fertilisers.0.nitrificationInhibitor')?.value).toBe('Yes')
  })
})

// ---------- Lifecycle ----------

describe('assessment lifecycle', () => {
  it('creates an In Progress assessment with a unique readable ID and no results', () => {
    const taken = new Set<string>()
    const ids = Array.from({ length: 200 }, () => {
      const a = createAssessment({ name: ' Wheat 2026 ', farmerId: 'farmer-1', plotIds: [], pathway: 'annual_crops', assessmentYear: 2026, takenIds: taken })
      taken.add(a.displayId)
      return a
    })
    expect(taken.size).toBe(200)
    expect(ids[0].displayId).toMatch(/^CFA-2026-[2-9A-HJ-NP-Z]{6}$/)
    expect(ids[0].name).toBe('Wheat 2026')
    expect(ids[0].status).toBe('in_progress')
    expect(ids[0].calculationStatus).toBe('not_configured')
    expect(ids[0].inputs.cropDetails.assessmentYear).toBe(2026)
  })

  it('fixes the crop type for the paddy rice pathway', () => {
    expect(createAssessment({ name: 'Rice', farmerId: 'f', plotIds: [], pathway: 'paddy_rice', assessmentYear: 2026 }).inputs.cropDetails.cropType).toBe('Rice')
  })

  it('refuses to submit an incomplete assessment and lists why', () => {
    const a = createAssessment({ name: 'x', farmerId: 'f', plotIds: [], pathway: 'annual_crops', assessmentYear: 2026 })
    const r = submitAssessment(a, 'admin-1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.report.blocking.length).toBeGreaterThan(0)
  })

  it('submits without calculating, keeps a snapshot, and moves to Edit in Progress when edited', () => {
    const a = editAssessment(createAssessment({ name: 'x', farmerId: 'f', plotIds: ['p1'], pathway: 'annual_crops', assessmentYear: 2026 }), { inputs: wheatRainfed(), notes: { residue: 'Straw incorporated with rotavator' } })
    const r = submitAssessment(a, 'admin-1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.assessment.status).toBe('submitted')
    expect(r.assessment.revision).toBe(1)
    expect(r.assessment.calculationStatus).toBe('not_configured')
    expect(r.submission.snapshot.inputs).toEqual(a.inputs)
    expect(r.submission.snapshot.notes.residue).toBe('Straw incorporated with rotavator')

    const edited = editAssessment(r.assessment, { inputs: setAt(r.assessment.inputs, ['cropDetails', 'farmGate', 'value'], 17.5) })
    expect(edited.status).toBe('edit_in_progress')
    expect(r.submission.snapshot.inputs.cropDetails.farmGate.value).toBe(18) // snapshot untouched
    const again = submitAssessment(edited, 'admin-1')
    expect(again.ok && again.assessment.status === 'submitted' && again.assessment.revision === 2).toBe(true)
  })

  it('does not change status when nothing changed', () => {
    const a = createAssessment({ name: 'x', farmerId: 'f', plotIds: [], pathway: 'annual_crops', assessmentYear: 2026 })
    expect(editAssessment(a, { inputs: a.inputs, notes: a.notes })).toBe(a)
  })

  it('duplicates answers and notes into a new In Progress assessment', () => {
    const src = submitAssessment(editAssessment(createAssessment({ name: 'Wheat 25', farmerId: 'f', plotIds: ['p1'], pathway: 'annual_crops', assessmentYear: 2025 }), { inputs: wheatRainfed(), notes: { farm: 'GPS from phone' } }), 'admin')
    if (!src.ok) throw new Error('fixture should submit')
    const copy = duplicateAssessment(src.assessment, { name: 'Wheat 26', assessmentYear: 2027 })
    expect(copy.id).not.toBe(src.assessment.id)
    expect(copy.displayId).not.toBe(src.assessment.displayId)
    expect(copy.status).toBe('in_progress')
    expect(copy.revision).toBe(0)
    expect(copy.submittedAt).toBeUndefined()
    expect(copy.duplicatedFrom).toBe(src.assessment.id)
    expect(copy.notes).toEqual({ farm: 'GPS from phone' })
    expect(copy.inputs.cropDetails.assessmentYear).toBe(2027)
    expect(copy.farmerId).toBe('f')
    copy.inputs.residue.residueManagementPractice = 'burning'
    expect(src.assessment.inputs.residue.residueManagementPractice).toBe('left_on_field') // deep copy
  })

  it('soft-deletes and restores', () => {
    const a = createAssessment({ name: 'x', farmerId: 'f', plotIds: [], pathway: 'annual_crops', assessmentYear: 2026 })
    const d = softDelete(a)
    expect(d.deletedAt).toBeTruthy()
    expect(restore(d).deletedAt).toBeUndefined()
  })
})

// ---------- Notes ----------

describe('section notes', () => {
  it('are optional, per section, and never affect status or calculation input', () => {
    const base = createAssessment({ name: 'x', farmerId: 'f', plotIds: [], pathway: 'annual_crops', assessmentYear: 2026 })
    const a = editAssessment(base, { inputs: wheatRainfed(), notes: {} })
    const withNotes = editAssessment(a, { notes: { cropDetails: 'Yield from mandi slip', irrigation: 'Canal water only' } })
    expect(withNotes.sectionStatus).toEqual(a.sectionStatus)
    expect(withNotes.sectionStatus.irrigation).toBe('not_started')
    expect(submitAssessment(a).ok).toBe(true) // no notes needed
    const input = prepareCalculationInput(withNotes)
    expect(JSON.stringify(input)).not.toContain('mandi slip')
  })

  it('every applicable section can hold its own note', () => {
    for (const p of ['annual_crops', 'paddy_rice', 'potato'] as Pathway[]) {
      const notes = Object.fromEntries(sectionsFor(p).map(s => [s.id, `note for ${s.id}`]))
      const a = editAssessment(createAssessment({ name: 'x', farmerId: 'f', plotIds: [], pathway: p, assessmentYear: 2026 }), { notes })
      expect(Object.keys(a.notes)).toHaveLength(sectionsFor(p).length)
    }
  })
})

// ---------- Export and calculation input ----------

describe('export', () => {
  const a = editAssessment(createAssessment({ name: 'Wheat, Sherpur', farmerId: 'farmer-1', plotIds: ['p1'], pathway: 'annual_crops', assessmentYear: 2026 }), {
    inputs: setAt(wheatRainfed(), ['transport', 'transports'], [
      { type: 'road HGV (average heavy goods vehicle)', boundary: 'Dispatched from farm', weight: { value: 18, unit: 'tonnes' }, distance: { value: 12, unit: 'kilometres' } },
      { type: 'rail', boundary: 'Incoming to Farm for on-farm use', weight: { value: 1, unit: 'tonnes' }, distance: { value: 300, unit: 'kilometres' } }
    ]),
    notes: { transport: 'Mandi trips, "two" loads' }
  })

  it('JSON keeps nested inputs, units, notes, schema version and status — and no results', () => {
    const json = assessmentJson(a)
    expect(json.inputData.transport.transports).toHaveLength(2)
    expect(json.inputData.cropDetails.area).toEqual({ value: 3.36, unit: 'hectares' })
    expect(json.farm.name).toBe('Sherpur farm')
    expect(json.sectionNotes.transport).toBe('Mandi trips, "two" loads')
    expect(json.assessment.schemaVersion).toBeTruthy()
    expect(json.assessment.status).toBe('In Progress')
    expect(JSON.stringify(json)).not.toMatch(/CO2e|emissions/i)
  })

  it('CSV has a row per answer, numbered repeated records, and the notes', () => {
    const rows = assessmentCsvRows([{ a }])
    expect(rows[0]).toContain('field_path')
    const entries = rows.map(r => r[10])
    expect(entries).toContain('Transport #1')
    expect(entries).toContain('Transport #2')
    expect(rows.find(r => r[12] === 'notes.transport')?.[13]).toBe('Mandi trips, "two" loads')
  })

  it('calculation input contains farm + CFP inputData, and nothing is calculated without an engine', async () => {
    const input = prepareCalculationInput(a)
    expect(Object.keys(input.inputData)).toEqual(expect.arrayContaining(['cropDetails', 'residue', 'transport']))
    expect(input.inputData.farm).toBeUndefined()
    expect(input.farm.climate).toBe('Warm Temperate Dry')
    registerCalculationEngine(null)
    expect(await calculate(a)).toEqual({ status: 'not_configured' })
  })
})

// ---------- Prefill ----------

describe('prefill from farmer data', () => {
  const farmer = { id: 'farmer-1', name: 'Manmohan Singh', fatherName: '', village: 'Sherpur', contact: '', kisanAdvisor: '', gipl_id: 'GIPL-001' }
  const plots = [{ id: 'p1', farmerId: 'farmer-1', acres: 3.6, village: '' }, { id: 'p2', farmerId: 'farmer-1', acres: 2.4, village: '' }]

  it('maps only matching meanings and units, with visible conversions', () => {
    const fields = {
      p1: { B02: 'Wheat', B04: 3.6, K01: 72, E05: 'Burnt', F_fertilisers: [{ F02: 'Urea', F04: 50, F05: 3.6 }, { F02: 'NPK 12:32:16', F04: 50 }] },
      p2: { B02: 'Wheat', B04: 2.4, K01: 48, E05: 'Burnt', F_fertilisers: [{ F02: 'Urea', F04: 50 }] }
    }
    const { inputs, prefill } = buildPrefill({ farmer, plots, fields }, 'annual_crops')
    expect(inputs.cropDetails.area).toEqual({ value: 6, unit: 'acres' })
    expect(inputs.cropDetails.cropYield).toEqual({ value: 12, unit: 'tonnes' }) // 120 quintals
    expect(inputs.cropDetails.cropType).toBeUndefined() // wheat: winter or spring?
    expect(inputs.residue.residueManagementPractice).toBe('burning')
    expect(inputs.fertiliser.fertilisers).toEqual([{ type: 'Urea - 46% N', applicationRate: { value: 50, unit: 'kg per acre' }, weightOrUnit: 'product' }])
    expect(inputs.farm).toEqual({ name: 'Manmohan Singh farm', farmIdentifier: 'GIPL-001' })
    expect(prefill['cropDetails.cropYield'].detail).toBe('120 quintals ÷ 10')
  })

  it('skips values the plots disagree on and reuses the previous assessment\'s farm', () => {
    const previous = createAssessment({ name: 'old', farmerId: 'farmer-1', plotIds: [], pathway: 'annual_crops', assessmentYear: 2025, inputs: { farm } })
    const { inputs } = buildPrefill({ farmer, plots, fields: { p1: { E05: 'Burnt' }, p2: { E05: 'Incorporated into soil' } }, previous }, 'annual_crops')
    expect(inputs.residue).toBeUndefined()
    expect(inputs.farm.climate).toBe('Warm Temperate Dry')
    expect(inputs.cropDetails.area).toEqual({ value: 6, unit: 'acres' }) // plot register fallback
  })
})

// ---------- Access control ----------

describe('admin access', () => {
  it('only admins can use assessments', () => {
    expect(canUseAdminFeatures(null)).toBe(false)
    expect(canUseAdminFeatures({ id: 'u1', name: 'Staff', email: 's@growindigo.co.in' })).toBe(false)
    expect(canUseAdminFeatures({ id: 'u1', name: 'Staff', email: 's@growindigo.co.in', isAdmin: false })).toBe(false)
    expect(canUseAdminFeatures({ id: 'u2', name: 'Admin', email: 'a@growindigo.co.in', isAdmin: true })).toBe(true)
  })

  it('the database restricts every assessment table to admins', () => {
    const sql = readFileSync(new URL('../../../supabase/migrations/20261120000000_assessments.sql', import.meta.url), 'utf8')
    for (const t of ['assessments', 'assessment_submissions', 'assessment_events', 'assessment_results']) {
      expect(sql).toContain(`alter table public.${t} enable row level security`)
    }
    const policies = sql.match(/create policy[\s\S]*?;/g) || []
    expect(policies.length).toBeGreaterThanOrEqual(5)
    for (const p of policies) expect(p).toContain('public.is_admin()')
  })
})
