import { SCHEMA_VERSION } from '../../config/cfp/schema'
import { applicableInputs } from './engine'
import { Assessment, Doc, Pathway } from './types'

// Where the emission formulas plug in later. Nothing here calculates anything yet.
//
// Phase 1 (now): assessments collect, validate and store inputs. No engine is registered, so every
// result screen says "Calculation not configured" and nothing pretends to be a number.
// Phase 2: implement CalculationEngine with the supplied methodology, call registerCalculationEngine()
// at start-up, and store each CalculationResult (table public.assessment_results is ready for it).

export type CalculationInput = {
  assessmentId: string
  revision: number
  schemaVersion: string
  pathway: Pathway
  /** CFP farm object: name, country, latitude, longitude, climate, annualAverageTemperature, soilCharacteristic… */
  farm: Doc
  /** CFP-shaped inputData with only applicable answers. Notes are never included. */
  inputData: Doc
}

export type GasBreakdown = { CO2?: number; CH4?: number; N2O?: number; CO2eUnspecified?: number }

export type CalculationResult = {
  engine: string
  engineVersion: string
  calculatedAt: string
  /** kg CO2e for the assessment year. Removals are negative. */
  totals: { emissions: number; removals: number; balance: number }
  /** Per model section (fertiliser, residue, machinery…), optionally split by gas. */
  byCategory: { category: string; emissions: number; removals?: number; gases?: GasBreakdown }[]
  perHectare?: { emissions: number; removals: number; balance: number }
  perTonneProduct?: { emissions: number; removals: number; balance: number }
  byGas?: GasBreakdown
  /** Itemised results (e.g. per fertiliser application or machine) and anything else the methodology returns. */
  details?: Record<string, unknown>
  warnings?: string[]
}

export interface CalculationEngine {
  id: string
  version: string
  calculate(input: CalculationInput): Promise<CalculationResult>
}

let engine: CalculationEngine | null = null

export function registerCalculationEngine(e: CalculationEngine | null) {
  engine = e
}

export function getCalculationEngine() {
  return engine
}

export function prepareCalculationInput(a: Assessment): CalculationInput {
  const { farm, inputData } = applicableInputs(a.inputs, a.pathway)
  return { assessmentId: a.id, revision: a.revision, schemaVersion: a.schemaVersion || SCHEMA_VERSION, pathway: a.pathway, farm, inputData }
}

/** Run the registered engine. Without one, says so instead of returning numbers. */
export async function calculate(a: Assessment): Promise<{ status: 'not_configured' } | { status: 'calculated'; result: CalculationResult } | { status: 'failed'; error: string }> {
  if (!engine) return { status: 'not_configured' }
  try {
    return { status: 'calculated', result: await engine.calculate(prepareCalculationInput(a)) }
  } catch (e: any) {
    return { status: 'failed', error: e?.message || String(e) }
  }
}
