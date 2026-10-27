import { Activity } from '../types'
import { FACTORS_V1 } from '../config/factors.v1'
import { cftPayload } from './diary'

// CFT residue answers → the residue factor keys.
const RESIDUE_FACTOR_KEY: Record<string, string> = {
  Burnt: 'Burning',
  'Incorporated into soil': 'Incorporation',
  'Retained on surface (mulch)': 'Incorporation',
  'Removed from field (baled / sold / fodder)': 'Baling & Selling'
}
const LOW_TILL_MACHINES = ['Happy seeder', 'Super seeder', 'Smart seeder', 'Zero-till drill']
const lowTill = (p: Record<string, any>) => p.C01 === 'Zero tillage (ZT)' || p.C01 === 'Reduced (RT)' || LOW_TILL_MACHINES.includes(p.D02)
// Litres of fuel an entry records: machinery and spraying per acre, pump diesel in total.
// Old entries kept a single fuelLitres figure.
const fuel = (a: Activity) => {
  if (!a.payload?.cft) return Number(a.payload?.fuelLitres) || 0
  const p = a.payload
  return (p.D04 === 'Electric' ? 0 : Number(p.D05) || 0) + (Number(p.I05) || 0) + (Number(p.J11) || 0)
}

type LeverBreakdown = { lever: string; deltaKg: number }

export function impactForCycle(current: Activity[], prior: Activity[]) {
  // Aggregate helpers
  const sum = (arr: Activity[], key: string) => arr.reduce((s, a) => s + (Number(cftPayload(a)[key]) || 0), 0)
  const residueMethod = (arr: Activity[]) => {
    const r = arr.find(a => a.module === 'Residue Management')
    return (r && RESIDUE_FACTOR_KEY[cftPayload(r).E05]) || ''
  }
  const residueCurrentMethod = residueMethod(current)
  const residuePriorMethod = residueMethod(prior)

  const fertiliser = (arr: Activity[]) => arr.filter(a => a.module === 'Fertilizer & Nutrient Management' && cftPayload(a).F02 && !cftPayload(a).F02.startsWith('Nano'))
  const ureaCurrent = sum(fertiliser(current), 'F04') + sum(fertiliser(current).filter(a => cftPayload(a).F02 === 'Urea'), 'F04')
  const ureaPrior = sum(fertiliser(prior), 'F04') + sum(fertiliser(prior).filter(a => cftPayload(a).F02 === 'Urea'), 'F04')

  const dieselCurrent = current.reduce((s, a) => s + fuel(a), 0)
  const dieselPrior = prior.reduce((s, a) => s + fuel(a), 0)

  const irrigationCurrent = current.filter(a => a.module === 'Water Management').length
  const irrigationPrior = prior.filter(a => a.module === 'Water Management').length

  // simple calculations using placeholder factors
  const residueFactors = FACTORS_V1.residue as Record<string, number>
  const residueCurrent = residueFactors[residueCurrentMethod] || 0
  const residuePrior = residueFactors[residuePriorMethod] || 0

  const nitrogenCurrent = ureaCurrent * FACTORS_V1.fertilizer.ureaKg
  const nitrogenPrior = ureaPrior * FACTORS_V1.fertilizer.ureaKg

  const dieselEmissionsCurrent = dieselCurrent * FACTORS_V1.diesel.perLitre
  const dieselEmissionsPrior = dieselPrior * FACTORS_V1.diesel.perLitre

  const tillage = (arr: Activity[]) => {
    const prep = arr.find(a => a.module === 'Land Preparation & Sowing')
    return prep && lowTill(cftPayload(prep)) ? FACTORS_V1.tillage.zeroTill : FACTORS_V1.tillage.conventional
  }
  const tillageCurrentVal = tillage(current)
  const tillagePriorVal = tillage(prior)

  const currentTotal = residueCurrent + nitrogenCurrent + dieselEmissionsCurrent + tillageCurrentVal
  const priorTotal = residuePrior + nitrogenPrior + dieselEmissionsPrior + tillagePriorVal

  const pctChange = priorTotal ? ((currentTotal - priorTotal) / priorTotal) * 100 : 0

  const perLeverBreakdown: LeverBreakdown[] = [
    { lever: 'Residue', deltaKg: residueCurrent - residuePrior },
    { lever: 'Nitrogen', deltaKg: nitrogenCurrent - nitrogenPrior },
    { lever: 'Irrigation', deltaKg: (irrigationCurrent - irrigationPrior) * (FACTORS_V1.irrigation.fuelPerHour || 0) },
    { lever: 'Diesel', deltaKg: dieselEmissionsCurrent - dieselEmissionsPrior },
    { lever: 'Tillage', deltaKg: tillageCurrentVal - tillagePriorVal }
  ]

  return {
    co2eKgPerAcre: { current: currentTotal, prior: priorTotal },
    pctChange,
    perLeverBreakdown,
    costPerAcre: { current: sum(current, 'totalCostPerAcre') || 0, prior: sum(prior, 'totalCostPerAcre') || 0 }
  }
}
