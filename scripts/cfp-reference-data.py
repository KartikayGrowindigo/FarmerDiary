# Regenerates src/config/cfp/referenceData.ts from the official CFP 3.0 Annual Crops Data Input Table
# (CFP30-CropsDataInputs.xlsx, attached to the CFP knowledge-base article
# "Cool Farm Platform 3.0 - Annual Crops Data Input Table"). Needs openpyxl.
#   python scripts/cfp-reference-data.py CFP30-CropsDataInputs.xlsx src/config/cfp/referenceData.ts
import openpyxl, json, sys
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
ws = wb['Reference Data']
def col(c, a, b):
    out = []
    for r in range(a, b + 1):
        v = ws[f'{c}{r}'].value
        if v is None: continue
        v = str(v).strip()
        if v: out.append(v)
    return out
L = {
 'CLIMATE': col('B',3,12), 'SOIL_CHARACTERISTIC': col('C',3,8), 'ANNUAL_CROP_TYPE': col('D',3,34),
 'SOIL_TYPE': col('E',3,5), 'YIELD_UNIT': col('F',3,5), 'RESIDUE_MANAGEMENT': col('G',3,8),
 'WEIGHT_PER_AREA': col('H',3,9), 'WATER_REGIME_CULTIVATION': col('I',3,8), 'PRE_SEASON_WATER_REGIME': col('J',3,6),
 'TIME_UNDER_CULTIVATION_UNIT': col('J',10,14), 'ORGANIC_AMENDMENT_TYPE': col('J',17,21),
 'WASTE_WATER_VOLUME_UNIT': col('K',3,5), 'WASTE_WATER_TREATMENT': col('L',3,15),
 'PESTICIDE_CATEGORY': col('M',3,6), 'PESTICIDE_TYPE': col('M',9,12),
 'FERTILISER_SYNTHETIC': col('N',3,25), 'FERTILISER_ORGANIC': col('N',27,48),
 'FERTILISER_REGION': col('O',3,16), 'APPLICATION_RATE_UNIT': col('P',3,10), 'FERTILISER_WEIGHT_OR_UNIT': col('Q',3,13),
 'REFRIGERANT_EQUIPMENT': col('R',3,13), 'REFRIGERANT_TYPE': col('S',3,96), 'REFRIGERANT_RECOVERY': col('U',3,6),
 'ALLOCATION_METHOD_REFRIGERANT': col('U',9,12), 'WEIGHT_UNIT': col('V',3,7),
 'ENERGY_SOURCE_VOLUME': col('W',4,13), 'ENERGY_SOURCE_WEIGHT': col('W',15,18), 'ENERGY_SOURCE_ENERGY': col('W',20,34),
 'ENERGY_UNIT_VOLUME': col('X',4,7), 'ENERGY_UNIT_WEIGHT': col('X',9,13), 'ENERGY_UNIT_ENERGY': col('X',15,18),
 'BOUNDARY': col('Y',3,6), 'IRRIGATION_METHOD': col('Z',3,6), 'WATER_SOURCE': col('AA',3,8),
 'PUMPING_DEPTH_UNIT': col('AB',3,7), 'HORIZONTAL_DISTANCE_UNIT': col('AC',3,9), 'POWER_SOURCE': col('AD',3,6),
 'IRRIGATION_WATER_UNIT': col('AE',3,7), 'TRANSPORT_TYPE': col('AF',3,21), 'MACHINE_TYPE': col('AG',3,78),
 'MACHINE_FUEL': col('AI',3,6), 'STORAGE_TIME_UNIT': col('AJ',3,6), 'FOREST_TYPE': col('AK',3,17),
 'INTERCROP_TYPE': col('AL',3,7), 'SHADE_TREE_TYPE': col('AM',3,8), 'HEDGE_TYPE': col('AN',3,7), 'HEDGE_LENGTH_UNIT': col('AN',10,13),
 'TREE_TYPE': col('AO',3,14), 'TREE_MEASUREMENT_UNIT': col('AP',3,6), 'LAND_USE': col('AQ',3,7), 'CARBON_INPUT': col('AQ',11,14),
 'COVER_CROP_SPECIES': col('AR',3,12), 'COVER_CROP_BIOMASS_REMOVED': col('AR',15,19), 'PERENNIAL_CROP_TYPE': col('AS',3,12),
}
# ingredients of fertilisers from the hidden reference sheet (name -> ingredient codes)
hs = wb['Sheet1']
ingr = {}
for r in range(129, 177):
    n, f = hs[f'E{r}'].value, hs[f'F{r}'].value
    if n and f: ingr[str(n).strip()] = [x.strip() for x in str(f).split(',')]
out = ['// Generated from the official "CFP30-CropsDataInputs.xlsx" (Cool Farm Platform 3.0 - Annual Crops',
       '// Data Input Table, "Reference Data" tab). Values are copied verbatim, including the source\'s own spelling.',
       '// Source: https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cool-farm-tool-3-0-annual-crops-data-input-table',
       '// Regenerate rather than hand-edit: python scripts/cfp-reference-data.py <CFP30-CropsDataInputs.xlsx> src/config/cfp/referenceData.ts', '']
for k, v in L.items():
    out.append(f'export const {k} = {json.dumps(v, ensure_ascii=False)} as const')
out.append('')
out.append('// Hidden "Sheet1" of the same workbook: nutrient ingredients of each fertiliser (used only to narrow')
out.append('// the "Fertiliser weight, or units?" choices). Names that differ from the visible list are absent.')
out.append(f'export const FERTILISER_INGREDIENTS: Record<string, string[]> = {json.dumps(ingr, ensure_ascii=False, indent=1)}')
open(sys.argv[2], 'w', encoding='utf-8').write('\n'.join(out) + '\n')
for k, v in L.items(): print(k, len(v), v[:3], v[-1:])
