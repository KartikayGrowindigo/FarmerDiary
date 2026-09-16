import { Activity } from '../types'
import { FACTORS_V1 } from '../config/factors.v1'

type LeverBreakdown = { lever: string; deltaKg: number }

export function impactForCycle(current: Activity[], prior: Activity[]) {
  // Aggregate helpers
  const sum = (arr: Activity[], key: string) => arr.reduce((s, a) => s + (Number(a.payload?.[key]) || 0), 0)

  const residueCurrentMethod = current.find(a => a.module === 'Residue Management')?.payload?.method
  const residuePriorMethod = prior.find(a => a.module === 'Residue Management')?.payload?.method

  const ureaCurrent = sum(current, 'quantityKgPerAcre') + sum(current.filter(a=>a.payload?.product==='Urea'), 'quantityKgPerAcre')
  const ureaPrior = sum(prior, 'quantityKgPerAcre') + sum(prior.filter(a=>a.payload?.product==='Urea'), 'quantityKgPerAcre')

  const dieselCurrent = sum(current, 'fuelLitres')
  const dieselPrior = sum(prior, 'fuelLitres')

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

  const tillageCurrent = current.find(a => a.module === 'Land Preparation & Sowing')?.payload?.prepMethod
  const tillagePrior = prior.find(a => a.module === 'Land Preparation & Sowing')?.payload?.prepMethod
  const tillageCurrentVal = (tillageCurrent && ['Super Seeder','Happy Seeder','Smart Seeder'].includes(tillageCurrent)) ? FACTORS_V1.tillage.zeroTill : FACTORS_V1.tillage.conventional
  const tillagePriorVal = (tillagePrior && ['Super Seeder','Happy Seeder','Smart Seeder'].includes(tillagePrior)) ? FACTORS_V1.tillage.zeroTill : FACTORS_V1.tillage.conventional

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
