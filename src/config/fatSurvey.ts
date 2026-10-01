// FAT (Regen Ag 5.1) annual crop survey, mirrored from
// "Wheat Punjab - Regen AG5.1 Annual Crop Import Data.xlsx".
// `column` is the exact header in the import sheet so answers can be exported 1:1.
// Back-office columns (UIDs, versions, approval status, rules) are not asked here.

export type SurveySheet = 'Regen A5.1' | 'CROP Survey'

export type SurveyAnswers = Record<string, any>

export type SurveyQuestion = {
  id: string
  sheet: SurveySheet
  column: string
  label: string
  help?: string
  type: 'choice' | 'number' | 'text' | 'date' | 'calc'
  options?: string[]
  unit?: string
  min?: number
  max?: number
  step?: number
  // Ask only when this returns true; otherwise exported as NA.
  showIf?: (a: SurveyAnswers) => boolean
  // Derived from other answers; shown read-only.
  calc?: (a: SurveyAnswers) => number | null
}

export type SurveySection = {
  key: string
  title: string
  titlePa: string
  icon: string
  tone: { from: string; to: string; tint: string; ink: string }
  questions: SurveyQuestion[]
  // When false the whole section is not applicable and every question exports as NA.
  appliesIf?: (a: SurveyAnswers) => boolean
  naNote?: string
}

const YES_NO = ['Yes', 'No']
// Answer scales as they appear in the import sheet. Confirm against the official FAT template.
const PCT = ['0-10%', '11-30%', '31-50%', '51-70%', '71-90%', '91-100%']
const PCT_PEST = ['0-5%', '6-30%', '31-70%', '71-100%']
const PRINCIPLES_4 = ['None', '1 principle', '2 principles', '3 principles', '4 principles']
const PRINCIPLES_5 = [...PRINCIPLES_4, '5 principles']

const num = (v: any) => (v === '' || v === null || v === undefined || v === 'NA' ? null : Number(v))
const round = (v: number, dp = 6) => Math.round(v * 10 ** dp) / 10 ** dp

const R = 'Regen A5.1' as const
const C = 'CROP Survey' as const

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    key: 'general',
    title: 'General Information',
    titlePa: 'ਆਮ ਜਾਣਕਾਰੀ',
    icon: 'badge',
    tone: { from: '#0F766E', to: '#2DD4BF', tint: '#CCFBF1', ink: '#115E59' },
    questions: [
      { id: 'collectionDate', sheet: R, column: 'General Infomation - Date Of The Data Collection', label: 'Date of data collection', type: 'date' },
      { id: 'reportingYear', sheet: R, column: 'General Infomation - Year of reporting', label: 'Year of reporting', help: 'e.g. 2025-26 Rabi Crop', type: 'text' },
      { id: 'farmerName', sheet: R, column: 'Farmer Name', label: 'Farmer name', type: 'text' },
      { id: 'advisorName', sheet: R, column: 'Kisaan Advisor Name', label: 'Kisaan Advisor name', type: 'text' },
      { id: 'evidence', sheet: R, column: 'General Infomation - Is there any evidence to submit?', label: 'Evidence to submit', help: 'Source of the evidence, e.g. Farmer Dairy', type: 'text' }
    ]
  },
  {
    key: 'farm',
    title: 'Farm',
    titlePa: 'ਖੇਤ',
    icon: 'agriculture',
    tone: { from: '#C2410C', to: '#F59E0B', tint: '#FFEDD5', ink: '#9A3412' },
    questions: [
      { id: 'arableHa', sheet: R, column: 'Farm - Arable crop land (ha)', label: 'Arable crop land', type: 'number', unit: 'ha', min: 0, step: 0.01 },
      { id: 'permanentCropHa', sheet: R, column: 'Farm - Permanent crop land (ha), e.g. fruit orchards, coffee, cocoa, etc.', label: 'Permanent crop land', help: 'e.g. fruit orchards', type: 'number', unit: 'ha', min: 0, step: 0.01 },
      { id: 'pastureHa', sheet: R, column: 'Farm - Permanent pastures (ha)', label: 'Permanent pastures', type: 'number', unit: 'ha', min: 0, step: 0.01 },
      { id: 'habitatHa', sheet: R, column: 'Farm - Natural habitat and natural forest area (ha)', label: 'Natural habitat & forest area', type: 'number', unit: 'ha', min: 0, step: 0.01 },
      {
        id: 'agriAreaHa', sheet: R, column: 'Farm - Agricultural Area (All Land) (ha)', label: 'Agricultural area (all land)', type: 'calc', unit: 'ha',
        calc: a => {
          const parts = [a.arableHa, a.permanentCropHa, a.pastureHa, a.habitatHa].map(num)
          return parts.every(p => p === null) ? null : round(parts.reduce<number>((s, p) => s + (p ?? 0), 0))
        }
      },
      { id: 'livestockUnits', sheet: R, column: 'Farm - Number of livestock (Standard Livestock Units)', label: 'Number of livestock', help: 'Standard Livestock Units. Enter 0 if none.', type: 'number', unit: 'SLU', min: 0 },
      { id: 'somFieldRef', sheet: R, column: 'Farm - Reference field for soil organic matter (please consider representative field of whole farm)', label: 'Reference field for soil organic matter', help: 'Field ID of a field representative of the whole farm', type: 'text' },
      { id: 'somPct', sheet: R, column: 'Farm - Percentage of Soil Organic Matter in referenced field', label: 'Soil organic matter in that field', type: 'number', unit: '%', min: 0, max: 100, step: 0.01 },
      { id: 'somSource', sheet: R, column: 'Farm - Source of the data', label: 'Source of the soil data', help: 'e.g. Eureka', type: 'text' },
      { id: 'somYear', sheet: R, column: 'Farm - Year of soil analysis assessment', label: 'Year of soil analysis', type: 'number', min: 2000, max: 2100 },
      { id: 'certified', sheet: R, column: 'Farm - Certificates/Label Production', label: 'Any certificate or label for production?', type: 'choice', options: YES_NO },
      { id: 'certName', sheet: R, column: 'Farm - Name of Certificate / Label', label: 'Name of certificate / label', type: 'text', showIf: a => a.certified === 'Yes' },
      { id: 'crop', sheet: R, column: 'Farm - Crop ', label: 'Crop', type: 'text' },
      {
        id: 'producedKg', sheet: R, column: 'Farm - Total produced volume of the year -1 (kg/year) on the farm', label: 'Total produced volume', help: 'Crop area × yield', type: 'calc', unit: 'kg/year',
        calc: a => {
          const area = num(a.cropAreaHa), yieldT = num(a.yieldTHa)
          return area === null || yieldT === null ? null : round(area * yieldT * 1000)
        }
      }
    ]
  },
  {
    key: 'crop',
    title: 'Crop Details',
    titlePa: 'ਫ਼ਸਲ ਦਾ ਵੇਰਵਾ',
    icon: 'grass',
    tone: { from: '#B45309', to: '#FACC15', tint: '#FEF9C3', ink: '#854D0E' },
    questions: [
      { id: 'cropAreaHa', sheet: C, column: 'Crop - Area (ha)', label: 'Crop area', type: 'number', unit: 'ha', min: 0, step: 0.01 },
      { id: 'yieldTHa', sheet: C, column: 'Crop - Yield (t/ha)', label: 'Yield', type: 'number', unit: 't/ha', min: 0, step: 0.01 },
      { id: 'dryMatterPct', sheet: C, column: 'Crop - Dry Matter Content (%)', label: 'Dry matter content', help: 'Wheat grain is typically 89%', type: 'number', unit: '%', min: 0, max: 100 },
      { id: 'totalNKgHa', sheet: C, column: 'Crop - Synthetic + Organic Nitrogen applied (kg/ha)', label: 'Total nitrogen applied (synthetic + organic)', type: 'number', unit: 'kg N/ha', min: 0, step: 0.01 },
      { id: 'synthNKgHa', sheet: C, column: 'Crop - Synthetic Nitrogen applied (kg/ha)', label: 'Synthetic nitrogen applied', type: 'number', unit: 'kg N/ha', min: 0, step: 0.01 },
      { id: 'irrigationM3Ha', sheet: C, column: 'Crop - Water applied through irrigation (m3/ha)', label: 'Water applied through irrigation', type: 'number', unit: 'm³/ha', min: 0 },
      { id: 'pesticideApps', sheet: C, column: 'Crop - Number of  applications of synthetic pesticide', label: 'Number of synthetic pesticide applications', type: 'number', min: 0 }
    ]
  },
  {
    key: 'soil',
    title: 'Soil',
    titlePa: 'ਮਿੱਟੀ',
    icon: 'landslide',
    tone: { from: '#92400E', to: '#D97706', tint: '#FEF3C7', ink: '#78350F' },
    questions: [
      { id: 'q1_01', sheet: R, column: 'Soil - 1.01 On average, how many different types of crops do you grow on the same piece of land over a period of 3 years? Cover crops, even multispecies are considered as one crop, whereas intercrops are considered as additional crops', label: '1.01 How many different crops do you grow on the same land over 3 years?', help: 'Cover crops (even multispecies) count as one crop; intercrops count as additional crops.', type: 'number', min: 0 },
      { id: 'q1_02', sheet: R, column: 'Soil - 1.02 What is the percentage of arable crop land subjected to rotations with at least X different types of crops including cover crops and/or intercrops (X=No. Of crops in Q1.01)? (land with X different types of crops in rotation/total crop land)', label: '1.02 What % of arable land is in rotation with at least that many crops?', help: 'X = number of crops from 1.01, including cover crops and intercrops.', type: 'choice', options: PCT },
      { id: 'q1_03', sheet: R, column: 'Soil - 1.03 What is the percentage of arable crop land planted with cover crops? (land with cover crop/total crop land x 100)', label: '1.03 What % of arable land is planted with cover crops?', type: 'choice', options: PCT },
      { id: 'q1_04', sheet: R, column: 'Soil - 1.04 How many of these 5 cover crop types you included in the mixture like grasses, legumes, brassicas non-legume broadleaves, deep root', label: '1.04 How many cover crop types are in the mixture?', help: 'Grasses, legumes, brassicas, non-legume broadleaves, deep root.', type: 'choice', options: ['0', '1', '2', '3', '4', '5'] },
      { id: 'q1_05', sheet: R, column: 'Soil - 1.05 What is the percentage of crop land with application of crop residues, mulch, grass clipping, straw, etc.? (land with application /total crop land x 100)', label: '1.05 What % of crop land gets crop residue, mulch or straw?', type: 'choice', options: PCT },
      { id: 'q1_06', sheet: R, column: 'Soil - 1.06 What is the percentage of arable crop land covered by at least 10 months, with crops, cover crops, grasses, plant residues or mulch?', label: '1.06 What % of arable land stays covered for at least 10 months?', help: 'Covered by crops, cover crops, grasses, plant residues or mulch.', type: 'choice', options: PCT },
      { id: 'q1_07', sheet: R, column: 'Soil - 1.07 What is the percentage of arable crop land managed with minimum tillage? (land with minimal till/total crop land x 100)', label: '1.07 What % of arable land is under minimum tillage?', type: 'choice', options: PCT },
      { id: 'q1_08', sheet: R, column: 'Soil - 1.08 Do you calculate your fertilizer plan (nutrient balance) on the basis of the 4 R Nutrient Stewardship Principles. If partially yes, how many of the following principles do you apply:  (a) Right Source,  (b) Right Rate, (c) Right Time, (d) Right Place)?', label: '1.08 How many 4R nutrient principles do you follow?', help: 'Right Source, Right Rate, Right Time, Right Place.', type: 'choice', options: PRINCIPLES_4 },
      {
        id: 'q1_09', sheet: R, column: 'Soil - 1.09 Percentage of synthetic N used vs total N', label: '1.09 Share of synthetic N in total N', help: 'Synthetic N ÷ total N (from Crop Details)', type: 'calc',
        calc: a => {
          const s = num(a.synthNKgHa), t = num(a.totalNKgHa)
          return s === null || !t ? null : round(s / t)
        }
      },
      {
        id: 'q1_10', sheet: R, column: 'Soil - 1.10 Nitrogen fertilizer productivity', label: '1.10 Nitrogen fertilizer productivity', help: 'Yield (kg/ha) × dry matter ÷ total N (from Crop Details)', type: 'calc',
        calc: a => {
          const y = num(a.yieldTHa), dm = num(a.dryMatterPct), t = num(a.totalNKgHa)
          return y === null || dm === null || !t ? null : round((y * 1000 * dm) / 100 / t)
        }
      },
      { id: 'q1_11', sheet: R, column: 'Soil - 1.11 Do you burn crop residue in more than 10% of your field?', label: '1.11 Do you burn crop residue on more than 10% of your field?', type: 'choice', options: YES_NO },
      { id: 'q1_12', sheet: R, column: 'Soil - 1.12 On average, what is the interval of soil analysis for texture, pH, soil organic matter, phosphorus, potassium (excluding nitrogen)?', label: '1.12 How often is soil analysed, on average?', help: 'Texture, pH, SOM, P, K (not N).', type: 'number', unit: 'years', min: 0 },
      { id: 'q1_13', sheet: R, column: 'Soil - FAT V4 Fertilizer Productivity 113 ', label: '1.13 Fertilizer productivity (FAT V4)', help: 'As calculated by the field team.', type: 'number', min: 0, step: 0.01 },
      { id: 'q1_14', sheet: R, column: 'Soil - 1.14 Has the SOM increased since the last soil analysis?', label: '1.14 Has soil organic matter increased since the last analysis?', type: 'choice', options: YES_NO }
    ]
  },
  {
    key: 'biodiversity',
    title: 'Biodiversity & Land Use',
    titlePa: 'ਜੈਵ ਵਿਭਿੰਨਤਾ ਅਤੇ ਜ਼ਮੀਨ',
    icon: 'forest',
    tone: { from: '#15803D', to: '#84CC16', tint: '#ECFCCB', ink: '#166534' },
    questions: [
      { id: 'q2_01', sheet: R, column: 'Biodiversity and Land use - 2.01 Do you follow Integrated Pest Management (IPM) principles when applying plant protection products? If partially yes, how many of the following principles do you apply: (a) Appropriate pest and disease monitoring, (b) Appropriate intervention measures, (c) Appropriate quantity/dose, (d) Appropriate time, (e) Appropriate place', label: '2.01 How many IPM principles do you follow?', help: 'Monitoring, intervention measures, right dose, right time, right place.', type: 'choice', options: PRINCIPLES_5 },
      { id: 'q2_02', sheet: R, column: 'Biodiversity and Land use - 2.02 What is the percentage of crop land without synthetic pest and disease control (land without synthetic pest control/ total crop land x 100)', label: '2.02 What % of crop land has no synthetic pest & disease control?', type: 'choice', options: PCT_PEST },
      { id: 'q2_03', sheet: R, column: 'Biodiversity and Land use - 2.03 What is the percentage of crop and pasture land without synthetic herbicide application? (land without synthetic herbicide control/ total crop land x 100)', label: '2.03 What % of crop & pasture land has no synthetic herbicide?', type: 'choice', options: PCT_PEST },
      { id: 'q2_04', sheet: R, column: 'Biodiversity and Land use - 2.04 What is the percentage of agricultural area being biodiversity habitats such as hedge, trees alley, flower strip, natural habitats, green belts, riparian area, non farmed area (that could potentially be cultivated) etc? (agriculture area with biodiversity habitat / total crop land x 100)', label: '2.04 What % of the farm is biodiversity habitat?', help: 'Hedges, tree alleys, flower strips, green belts, riparian or non-farmed area.', type: 'number', unit: '%', min: 0, max: 100 },
      { id: 'q2_05', sheet: R, column: 'Biodiversity and Land use - 2.05 What is the percentage of agriculture area dedicated to agroforestry (productive areas in a field with combinations of crops or pasture with multiple types of productive bushes & trees)? (agriculture area with agroforestery/total agriculture area x 100)', label: '2.05 What % of the farm is under agroforestry?', type: 'number', unit: '%', min: 0, max: 100 },
      { id: 'q2_06', sheet: R, column: 'Biodiversity and Land use - 2.06 Do you have a recorded and tracked Biodiversity action plan in place at farm scale?', label: '2.06 Do you have a recorded biodiversity action plan?', type: 'choice', options: YES_NO }
    ]
  },
  {
    key: 'water',
    title: 'Water',
    titlePa: 'ਪਾਣੀ',
    icon: 'water_drop',
    tone: { from: '#0369A1', to: '#38BDF8', tint: '#E0F2FE', ink: '#075985' },
    questions: [
      { id: 'q3_01a', sheet: R, column: 'Water - 3.01a If you have to irrigate, select the predominant irrigation system used on irrigated crop', label: '3.01a Main irrigation system', type: 'choice', options: ['Surface (Flooding, Furrow, Border etc.)', 'Sprinkler', 'Drip', 'No irrigation'] },
      { id: 'q3_02', sheet: R, column: 'Water - 3.02 Do you monitor the water consumption at crop level and is data recording available?', label: '3.02 Do you monitor and record water use per crop?', type: 'choice', options: YES_NO },
      { id: 'q3_03', sheet: R, column: 'Water - 3.03 Do you control irrigation with digital soil moisture sensors?', label: '3.03 Do you use digital soil moisture sensors?', type: 'choice', options: YES_NO },
      { id: 'q3_04', sheet: R, column: 'Water - 3.04 If you have water bodies at your farm (eg. rivers, ponds, lakes), what is the minimum distance between field application area (fertilizer/manure and pesticide) and the water body?', label: '3.04 Distance from sprayed/fertilised area to the nearest water body', help: 'Rivers, ponds, lakes on the farm.', type: 'choice', options: ['Less than 5 m', '5-10 m', 'More than 10 m', 'NA'] },
      { id: 'q3_05', sheet: R, column: 'Water - 3.05 What is the percentage of water bodies with riparian buffer strips such as bushes, trees, etc.?  (Length of adjacent water body with riparian buffer/ total length of adjacent water body x 100)', label: '3.05 What % of water bodies have buffer strips (bushes, trees)?', type: 'choice', options: PCT, showIf: a => !!a.q3_04 && a.q3_04 !== 'NA' },
      { id: 'q3_06', sheet: R, column: 'Water - 3.06 What % of your water bodies fenced from animal access? (Length of water body fenced / total length of water body x 100)', label: '3.06 What % of water bodies are fenced from animals?', type: 'choice', options: PCT, showIf: a => !!a.q3_04 && a.q3_04 !== 'NA' }
    ]
  },
  {
    key: 'livestock',
    title: 'Livestock',
    titlePa: 'ਪਸ਼ੂ ਧਨ',
    icon: 'pets',
    tone: { from: '#BE123C', to: '#FB7185', tint: '#FFE4E6', ink: '#9F1239' },
    appliesIf: a => (num(a.livestockUnits) ?? 0) > 0,
    naNote: 'No livestock recorded in the Farm section, so these questions are marked NA.',
    questions: [
      { id: 'q4_01', sheet: R, column: 'Livestock - 4.01 What is the proportion of protein feed traceable to low risk, non-deforested areas (since year: 2010)? (protein from low risk area /total protein requirement x 100)', label: '4.01 What % of protein feed is traceable to non-deforested areas (since 2010)?', type: 'choice', options: PCT },
      { id: 'q4_02', sheet: R, column: 'Livestock - 4.02 What is the proportion of feed and fodder grown on farm? (DM feed grown on farm/total DM feed used x 100)', label: '4.02 What % of feed and fodder is grown on the farm?', type: 'choice', options: PCT },
      { id: 'q4_03', sheet: R, column: 'Livestock - 4.03 What is the percentage of multispecies pastures/grasslands with at least three species including grasses, legumes and broad leaves? (pastures with multispecies/total pasture x 100)', label: '4.03 What % of pastures have 3+ species?', help: 'Grasses, legumes and broad leaves.', type: 'choice', options: PCT },
      { id: 'q4_04', sheet: R, column: 'Livestock - 4.04 What is the percentage of pasture area under mob grazing and rotational grazing management? (pasture area under mob grazing and rotational grazing/total pasture area x 100)', label: '4.04 What % of pasture is under mob or rotational grazing?', type: 'choice', options: PCT },
      { id: 'q4_05', sheet: R, column: 'Livestock - 4.05 What is the percentage of pastures/grasslands established on minimum tillage or direct seeding practices? (to pastures/grasslands with minimum till or direct seeding/total pastures grasslands x 100)', label: '4.05 What % of pastures were established with minimum till or direct seeding?', type: 'choice', options: PCT },
      { id: 'q4_06', sheet: R, column: 'Livestock - 4.06 What is the average productivity level in the herd? (kg milk/day)', label: '4.06 Average herd productivity', type: 'number', unit: 'kg milk/day', min: 0 },
      { id: 'q4_07', sheet: R, column: 'Livestock - 4.07 Do you track the use of antibiotics and hormones; if yes, how do you use these? (Prevention or treatment)', label: '4.07 Do you track antibiotics and hormones, and how are they used?', type: 'choice', options: ['Not tracked', 'Tracked - prevention', 'Tracked - treatment only'] },
      { id: 'q4_08', sheet: R, column: 'Livestock - 4.08 How do you store your liquid and solid manure?', label: '4.08 How do you store liquid and solid manure?', type: 'text' },
      { id: 'q4_09', sheet: R, column: 'Livestock - 4.09 How do you fertilize your fields?', label: '4.09 How do you fertilise your fields?', type: 'text' },
      { id: 'q4_10', sheet: R, column: 'Livestock - 4.10 How do you handle and treat farm generated waste water?', label: '4.10 How do you handle farm waste water?', type: 'text' }
    ]
  },
  {
    key: 'competencies',
    title: 'Competencies',
    titlePa: 'ਯੋਗਤਾਵਾਂ',
    icon: 'school',
    tone: { from: '#6D28D9', to: '#C084FC', tint: '#F3E8FF', ink: '#5B21B6' },
    questions: [
      { id: 'q5_01', sheet: R, column: 'Competencies - 5.01 Have you understood the main principles of Regenerative Agriculture? (for example attending training session or reading the 4 pages of RegenAgr in Nestle)', label: '5.01 Have you understood the main principles of Regenerative Agriculture?', help: 'e.g. attended a training session.', type: 'choice', options: YES_NO },
      { id: 'q5_02', sheet: R, column: 'Competencies - 5.02 Do you keep agricultural management records (i.e. spray records, fertilizer records, etc.)?', label: '5.02 Do you keep farm records (spray, fertiliser, etc.)?', type: 'choice', options: YES_NO },
      { id: 'q5_03', sheet: R, column: 'Competencies - 5.03 Do you make use of precision farming technologies such as (a) automated parallel driving systems in machines, (b) section control or variable rate application of fertilizers or pesticides, (c) the use of digital farm and/or animal decision support tools and (d) optical sensors? If yes, how many types of technologies do yo make use of?', label: '5.03 How many precision farming technologies do you use?', help: 'Auto-steer, variable-rate application, digital decision tools, optical sensors.', type: 'choice', options: ['0', '1', '2', '3', '4'] }
    ]
  }
]

export const ALL_QUESTIONS = SURVEY_SECTIONS.flatMap(s => s.questions.map(q => ({ ...q, section: s })))

export function isAsked(section: SurveySection, q: SurveyQuestion, a: SurveyAnswers) {
  if (section.appliesIf && !section.appliesIf(a)) return false
  return !q.showIf || q.showIf(a)
}

export function isAnswered(v: any) {
  return v !== undefined && v !== null && v !== ''
}

// Value as it should appear in the import sheet: calculated, answered, or NA.
export function exportValue(section: SurveySection, q: SurveyQuestion, a: SurveyAnswers) {
  if (!isAsked(section, q, a)) return 'NA'
  if (q.type === 'calc') return q.calc!(a) ?? ''
  return isAnswered(a[q.id]) ? a[q.id] : ''
}

export function surveyProgress(a: SurveyAnswers) {
  let asked = 0, done = 0
  for (const s of SURVEY_SECTIONS) {
    for (const q of s.questions) {
      if (q.type === 'calc' || !isAsked(s, q, a)) continue
      asked++
      if (isAnswered(a[q.id])) done++
    }
  }
  return { asked, done }
}
