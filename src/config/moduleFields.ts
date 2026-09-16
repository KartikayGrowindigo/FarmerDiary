import { ModuleKey } from './modules'

export type FieldType = 'chips' | 'grid' | 'number' | 'stepper' | 'text' | 'toggle' | 'select'

export type FieldOption = { value: string; label: string; labelPa?: string; icon?: string }

export type FieldSpec = {
  key: string
  label: string
  labelPa: string
  type: FieldType
  unitLabel?: string
  options?: FieldOption[]
  default?: any
  min?: number
  max?: number
  step?: number
}

export const MODULE_FIELDS: Record<ModuleKey, FieldSpec[]> = {
  'Land Preparation & Sowing': [
    {
      key: 'prepMethod', label: 'Method', labelPa: 'ਢੰਗ', type: 'grid', default: 'Conventional Tillage',
      options: [
        { value: 'Conventional Tillage', label: 'Conventional', icon: 'agriculture' },
        { value: 'Happy Seeder', label: 'Happy Seeder', icon: 'grass' },
        { value: 'Super Seeder', label: 'Super Seeder', icon: 'compost' },
        { value: 'Smart Seeder', label: 'Smart Seeder', icon: 'psychology' },
        { value: 'Zero Till Drill', label: 'Zero Till', icon: 'eco' }
      ]
    },
    { key: 'equipment', label: 'Equipment used', labelPa: 'ਸੰਦ', type: 'text' },
    { key: 'hoursPerAcre', label: 'Hours per acre', labelPa: 'ਘੰਟੇ/ਏਕੜ', type: 'number', unitLabel: 'hrs/acre', default: 0, min: 0, step: 0.5 },
    { key: 'fuelLitres', label: 'Diesel used', labelPa: 'ਡੀਜ਼ਲ', type: 'number', unitLabel: 'litres', default: 0, min: 0 },
    { key: 'totalCostPerAcre', label: 'Total cost', labelPa: 'ਕੁੱਲ ਖਰਚਾ', type: 'number', unitLabel: '₹/acre', default: 0, min: 0 }
  ],
  'Seed & Sowing': [
    {
      key: 'variety', label: 'Variety', labelPa: 'ਕਿਸਮ', type: 'chips', default: 'HD-2967',
      options: [
        { value: 'HD-2967', label: 'HD-2967' },
        { value: 'PBW-725', label: 'PBW-725' },
        { value: 'WH-1105', label: 'WH-1105' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { key: 'seedRateKgPerAcre', label: 'Seed rate', labelPa: 'ਬੀਜ ਦੀ ਦਰ', type: 'stepper', unitLabel: 'kg/acre', default: 45, min: 0 },
    { key: 'seedTreatmentDone', label: 'Seed treatment done', labelPa: 'ਬੀਜ ਸੋਧ ਕੀਤੀ', type: 'toggle', default: false },
    { key: 'treatmentProduct', label: 'Treatment product', labelPa: 'ਸੋਧ ਉਤਪਾਦ', type: 'text' }
  ],
  'Fertilizer & Nutrient Management': [
    {
      key: 'product', label: 'Product', labelPa: 'ਉਤਪਾਦ', type: 'chips', default: 'DAP',
      options: [
        { value: 'DAP', label: 'DAP' },
        { value: 'Urea', label: 'Urea' },
        { value: 'MOP', label: 'MOP' },
        { value: 'Zinc', label: 'Zinc' },
        { value: 'Bio', label: 'Bio' }
      ]
    },
    { key: 'quantityKgPerAcre', label: 'Quantity', labelPa: 'ਮਾਤਰਾ', type: 'stepper', unitLabel: 'kg/acre', default: 50, min: 0 },
    {
      key: 'applicationMethod', label: 'Method', labelPa: 'ਢੰਗ', type: 'grid', default: 'Broadcasting',
      options: [
        { value: 'Broadcasting', label: 'Broadcast', icon: 'scatter_plot' },
        { value: 'Seeder', label: 'Seeder', icon: 'agriculture' },
        { value: 'Fertigation', label: 'Fertigation', icon: 'water_drop' },
        { value: 'Spray', label: 'Spray', icon: 'cloud_download' },
        { value: 'Drenching', label: 'Drenching', icon: 'opacity' }
      ]
    },
    { key: 'costINR', label: 'Cost', labelPa: 'ਖਰਚਾ', type: 'number', unitLabel: '₹', default: 0, min: 0 },
    { key: 'otherCostINR', label: 'Other cost', labelPa: 'ਹੋਰ ਖਰਚਾ', type: 'number', unitLabel: '₹', default: 0, min: 0 }
  ],
  'Pest & Disease Management': [
    {
      key: 'cppType', label: 'Type', labelPa: 'ਕਿਸਮ', type: 'chips', default: 'Insecticide',
      options: [
        { value: 'Insecticide', label: 'Insecticide' },
        { value: 'Fungicide', label: 'Fungicide' },
        { value: 'Herbicide', label: 'Herbicide' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { key: 'tradeName', label: 'Trade name', labelPa: 'ਵਪਾਰਕ ਨਾਮ', type: 'text' },
    { key: 'targetPest', label: 'Target pest/disease', labelPa: 'ਨਿਸ਼ਾਨਾ ਕੀੜਾ/ਬਿਮਾਰੀ', type: 'text' },
    { key: 'quantityPerAcre', label: 'Quantity per acre', labelPa: 'ਮਾਤਰਾ/ਏਕੜ', type: 'number', default: 0, min: 0 },
    {
      key: 'unit', label: 'Unit', labelPa: 'ਇਕਾਈ', type: 'chips', default: 'ml',
      options: [
        { value: 'ml', label: 'ml' },
        { value: 'gm', label: 'gm' },
        { value: 'L', label: 'L' },
        { value: 'kg', label: 'kg' }
      ]
    },
    { key: 'fuelLitres', label: 'Diesel used', labelPa: 'ਡੀਜ਼ਲ', type: 'number', unitLabel: 'litres', default: 0, min: 0 },
    { key: 'costINR', label: 'Cost', labelPa: 'ਖਰਚਾ', type: 'number', unitLabel: '₹', default: 0, min: 0 }
  ],
  'Water Management': [
    {
      key: 'irrigationMethod', label: 'Method', labelPa: 'ਢੰਗ', type: 'grid', default: 'Flood',
      options: [
        { value: 'Flood', label: 'Flood', icon: 'water' },
        { value: 'Sprinkler', label: 'Sprinkler', icon: 'water_drop' },
        { value: 'Drip', label: 'Drip', icon: 'opacity' }
      ]
    },
    {
      key: 'waterSource', label: 'Source', labelPa: 'ਸਰੋਤ', type: 'chips', default: 'Tubewell',
      options: [
        { value: 'Tubewell', label: 'Tubewell' },
        { value: 'Canal', label: 'Canal' },
        { value: 'Rain', label: 'Rain' }
      ]
    },
    { key: 'groundwaterDepthFt', label: 'Groundwater depth', labelPa: 'ਧਰਤੀ ਹੇਠਲੇ ਪਾਣੀ ਦੀ ਡੂੰਘਾਈ', type: 'number', unitLabel: 'ft', default: 0, min: 0 },
    { key: 'durationHours', label: 'Duration', labelPa: 'ਸਮਾਂ', type: 'number', unitLabel: 'hrs', default: 0, min: 0, step: 0.5 },
    { key: 'irrigationNumber', label: 'Irrigation number', labelPa: 'ਸਿੰਚਾਈ ਨੰਬਰ', type: 'stepper', default: 1, min: 1 },
    { key: 'pumpHP', label: 'Pump HP', labelPa: 'ਪੰਪ HP', type: 'number', default: 0, min: 0 },
    { key: 'fuelLitres', label: 'Diesel used', labelPa: 'ਡੀਜ਼ਲ', type: 'number', unitLabel: 'litres', default: 0, min: 0 }
  ],
  Harvesting: [
    { key: 'yieldQtlPerAcre', label: 'Yield', labelPa: 'ਝਾੜ', type: 'stepper', unitLabel: 'qtl/acre', default: 20, min: 0 },
    { key: 'moisturePct', label: 'Moisture', labelPa: 'ਨਮੀ', type: 'number', unitLabel: '%', default: 0, min: 0, max: 100 },
    { key: 'priceINRPerQtl', label: 'Price', labelPa: 'ਭਾਅ', type: 'number', unitLabel: '₹/qtl', default: 0, min: 0 },
    { key: 'fuelLitres', label: 'Diesel used', labelPa: 'ਡੀਜ਼ਲ', type: 'number', unitLabel: 'litres', default: 0, min: 0 },
    { key: 'otherExpensesINR', label: 'Other expenses', labelPa: 'ਹੋਰ ਖਰਚੇ', type: 'number', unitLabel: '₹', default: 0, min: 0 }
  ],
  'Residue Management': [
    {
      key: 'method', label: 'Method', labelPa: 'ਢੰਗ', type: 'grid', default: 'Incorporation',
      options: [
        { value: 'Burning', label: 'Burning', icon: 'local_fire_department' },
        { value: 'Incorporation', label: 'Incorporation', icon: 'compost' },
        { value: 'Baling & Selling', label: 'Baling & Selling', icon: 'inventory_2' }
      ]
    },
    { key: 'quantityQtlPerAcre', label: 'Quantity', labelPa: 'ਮਾਤਰਾ', type: 'number', unitLabel: 'qtl/acre', default: 0, min: 0 },
    { key: 'fuelLitres', label: 'Diesel used', labelPa: 'ਡੀਜ਼ਲ', type: 'number', unitLabel: 'litres', default: 0, min: 0 },
    { key: 'costINR', label: 'Cost', labelPa: 'ਖਰਚਾ', type: 'number', unitLabel: '₹', default: 0, min: 0 }
  ]
}
