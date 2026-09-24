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

// Colour identity per activity: gradient pair, soft tint for backgrounds, and ink for text on the tint.
export const MODULE_THEME: Record<ModuleKey, { from: string; to: string; tint: string; ink: string }> = {
  'Land Preparation & Sowing': { from: '#C2410C', to: '#F59E0B', tint: '#FFEDD5', ink: '#9A3412' },
  'Seed & Sowing': { from: '#15803D', to: '#84CC16', tint: '#ECFCCB', ink: '#166534' },
  'Fertilizer & Nutrient Management': { from: '#6D28D9', to: '#C084FC', tint: '#F3E8FF', ink: '#5B21B6' },
  'Pest & Disease Management': { from: '#BE123C', to: '#FB7185', tint: '#FFE4E6', ink: '#9F1239' },
  'Water Management': { from: '#0369A1', to: '#38BDF8', tint: '#E0F2FE', ink: '#075985' },
  Harvesting: { from: '#B45309', to: '#FACC15', tint: '#FEF9C3', ink: '#854D0E' },
  'Residue Management': { from: '#0F766E', to: '#2DD4BF', tint: '#CCFBF1', ink: '#115E59' }
}

export function themeFor(key: string) {
  return MODULE_THEME[key as ModuleKey] || MODULE_THEME['Seed & Sowing']
}
