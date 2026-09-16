export type ModuleKey =
  | 'Land Preparation & Sowing'
  | 'Seed & Sowing'
  | 'Fertilizer & Nutrient Management'
  | 'Pest & Disease Management'
  | 'Water Management'
  | 'Harvesting'
  | 'Residue Management'

export const MODULES: { key: ModuleKey; icon: string; label: string; labelPa: string }[] = [
  { key: 'Land Preparation & Sowing', icon: 'agriculture', label: 'Land Preparation', labelPa: 'ਭੋਂ ਤਿਆਰੀ' },
  { key: 'Seed & Sowing', icon: 'spa', label: 'Seed & Sowing', labelPa: 'ਬੀਜ ਅਤੇ ਬਿਜਾਈ' },
  { key: 'Fertilizer & Nutrient Management', icon: 'science', label: 'Fertilizer', labelPa: 'ਖਾਦ' },
  { key: 'Pest & Disease Management', icon: 'bug_report', label: 'Pest & Disease', labelPa: 'ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀਆਂ' },
  { key: 'Water Management', icon: 'water_drop', label: 'Water', labelPa: 'ਪਾਣੀ' },
  { key: 'Harvesting', icon: 'eco', label: 'Harvest', labelPa: 'ਵਾਢੀ' },
  { key: 'Residue Management', icon: 'recycling', label: 'Residue', labelPa: 'ਪਰਾਲੀ/ਰਹਿਤ-ਖੂਹੰਦ' }
]

export function moduleByKey(key: string) {
  return MODULES.find(m => m.key === key)
}
