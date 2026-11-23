# CFP assessment: verification report

What the admin assessment module was checked against, what is confirmed, and what still needs checking against the live Cool Farm Platform. The field-by-field list is in [FIELD_INVENTORY.md](FIELD_INVENTORY.md). Every question in `src/config/cfp/schema.ts` carries a `provenance` and `source`.

## 1. Access to the reference

| Source | Result |
|---|---|
| https://cfp.coolfarm.org/ (assessment screens) | Login required. Not inspected, so **no field is marked VERIFIED_UI**. |
| https://cfp.coolfarm.org/api-docs (OpenAPI) | Redirects to sign-in. Per the API guide, any CFP account can open it in read-only mode with schemas and enums. Not inspected. |
| [CFP Quick Start Guide](https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cfp-quick-start-guide) | Read. Navigation, statuses, autosave, Live Summary, overview, delete location, results. |
| [CFP API User Guide](https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cfp-api-user-guide) | Read. `inputData` example (top-level keys; cropDetails, residue, machineryUse, wasteWater keys), residue enum, required sections, response structure. |
| [CFP 3.0 Annual Crops Data Input Table](https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cool-farm-tool-3-0-annual-crops-data-input-table) (`CFP30-CropsDataInputs.xlsx`) | Read. **Primary source**: "a list of all data points required to complete an annual crop assessment". It gives every question, answer type, unit and dropdown list, including the rice-only and potato-only rows. Option lists were extracted programmatically into `src/config/cfp/referenceData.ts`. |
| [CFP 3.0 Annual Crop Lay Guide](https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cool-farm-platform-3-0-annual-crops-lay-guide) (Aug 2026) | Read. Section grouping, field meaning, paddy pathway, Tier 1 vs Tier 2 rules, results content. |
| CFP knowledge-base articles | Read: volume-only irrigation (`irrigationCalculationType = 2`), compose-your-own "summation exceeds 100%", potassium nitrate vs P2O5, liquids treated as 1 L = 1 kg, soil data depends on the chosen model, fuel vs machinery double counting, crop residue defaults. |

## 2. Confirmed and implemented

- **Questions, wording, input types, units, dropdown options:** all from the Data Input Table (VERIFIED_GUIDE). Option values are verbatim, including the source's spelling (e.g. "Millimitres", "High  with manure").
- **Pathway differences:**
  - *Paddy Rice* adds water regime during cultivation, pre-season water regime, time under cultivation and organic amendments.
  - *Potato* adds processing and storage.
  - Tier 2 soil carbon is not offered for paddy rice (Lay Guide).
- **Required sections:** Crop details and Residue (API guide). Farm details are needed to create a CFP assessment. Paddy questions are required for paddy rice (Lay Guide). All other sections are optional.
- **Confirmed API keys (VERIFIED_SCHEMA):**
  - Top-level `inputData` objects: `cropDetails`, `residue`, `fertiliser.fertilisers`, `pesticide.applications`, `irrigation.events`, `machinery.machineryUse`, `fuelEnergy.usages`, `transport.transports`, `wasteWater.treatments`, `refrigerants.equipments`, `seedProduction.seedBought`, `nonCrop.{hedges,intercrops,shadeTrees}`, `steadyStateSoc`, `landUseChangeBiomass.forestChanges`.
  - `cropDetails.{area,cropType,farmGate,soilType,cropYield,assessmentYear,sandPercentage}`.
  - `residue.{aboveGroundResidue,residueManagementPractice}`, with the full enum.
  - `machineryUse[].{label,fuelUse,machine,numberMachineryOperations}`.
  - `treatments[].{oxygenDemand,oxygenDemandType,treatmentProcess,wasteWaterVolume}`.
  - The farm object: `name, farmIdentifier, country, latitude, longitude, climate, soilCharacteristic, annualAverageTemperature`.
- **Behaviour from the Quick Start Guide:**
  - Section tabs on the right with complete / missing / not-filled indicators.
  - Inputs save when moving between sections.
  - Live Summary is hidden at first and expands.
  - Error report from a top-right button, which also pops up on submit.
  - Statuses In Progress / Submitted / Edit in progress.
  - Duplicate.
  - Delete from inside the assessment overview (also offered in the list, as requested).
  - Unique assessment ID in the top bar.
  - Results exportable as JSON/CSV.
- **Rules from guides:**
  - Compose-your-own N + P + K must stay below 100%.
  - Tier 2 needs at least 5 years of crop history.
  - Tier 1 covers changes in the past 20 years.
  - Pumping depth and distance are hidden for volume-only irrigation.
  - Volume-only irrigation is sent as `irrigationCalculationType: 2`.
  - Warning for potassium nitrate entered as P2O5.
  - Deprecated waste water treatment ("Sludge anaerobic digestion - DEPRECATED") is not offered.

## 3. Unresolved: check these in the live CFP

### 3.1 Interface details (need VERIFIED_UI)
1. The exact **tab names and order** in the right-hand navigation. We use the Data Input Table's order and the Lay Guide's headings (Farm, Crop details, Crop management, Inputs, Refrigerants, Seeds, Fuel & energy, Carbon changes).
2. The exact on-screen **labels, tooltips and help text**. Our help text paraphrases the Lay Guide and table notes. CFP tooltips (e.g. the IPCC climate map link) were not seen.
3. Which fields CFP marks **mandatory inside optional sections**. We require every field that the table does not mark "optional", once the section is started.
4. **Validation messages** and limits (e.g. maximum years, allowed ranges). Ours are generic: required, number, 0-100%, unit, allowed option.
5. Whether co-products, paddy and potato questions are separate tabs or sit inside other tabs. We use separate sections.
6. The **Farm** flow: CFP keeps farms as separate records chosen when starting an assessment. We store farm details inside each assessment and copy them from the farmer's previous assessment.

### 3.2 Storage keys not confirmed by the API (`apiKey: provisional`)
All these keys are our own names:
- Questions inside pesticide, fertiliser, refrigerant, fuel/energy, irrigation, transport, non-crop and forest-change records.
- `cropDetails.waterRegime`, `coProducts.*`, `paddy.*`, `seedBought.*` inner fields, `potatoProcessing.*`, `potatoStorage.*`, `nonCropMeasured.trees`, `soilCarbon.*`, and the inner structure of `steadyStateSoc`.

The API example shows `steadyStateSoc.landUseHistory.changes`. It is unclear whether that holds Tier 1 changes (we store those under `soilCarbon.tier1.changes`) or Tier 2 history.

The CFP API schema (Get Schemas endpoint, or the API docs page in read-only mode) would settle all of these. Map them in a CFP-export adapter rather than renaming stored data.

### 3.3 Value formats not confirmed
- Unit strings: the API example uses "hectares", "tonnes", "litres" and "kg per litre", while the table writes "kg/litre", "mg/litre" and "g/litre". We store the table's wording except where the API example shows a value.
- Soil type: the API example has "Fine" and the table has "fine". We store "Fine"/"Medium"/"Coarse".
- Whether selects send labels or ids (the Data Input Table's hidden sheet lists numeric ids for machines, fertilisers, transport and treatments).

### 3.4 Provisional rules and controls (marked PROVISIONAL in the form)
| Item | Why |
|---|---|
| Soil carbon model selector (Tier 1 / Tier 2) | The guides say the questions depend on "the model you choose"; the control itself is unseen. |
| Fertiliser production region shown only for mineral fertilisers | The table asks for it on every row. Manure production emissions are zero per the Lay Guide. |
| "Chile 2021" region offered only for caliche potassium nitrate | Inferred from the option's own name. |
| Nitrification inhibitor shown for urea/ammonium/manure-type products | Interpreted from "non-nitrate N fertilisers (e.g. ammonia, urea)" and "ammonium-, urea- or excreta-based". |
| Deforestation / Reforestation question | The table says "fill only if deforested" but has no question for which it is. |
| Crop type fixed to "Rice" (Paddy Rice) and "Potato" (Potato) | Neither is in the annual crop list. Upland rice uses the annual list. |
| Temperature difference units °C/°F (potato storage) | The table says only "Number + unit". |
| Tier 2 organic input types = fertiliser "Organic inputs" list | The table says only "Select from list". |
| Standard deviation needs a sample size | Implied by the table's grouping. |

### 3.5 Source inconsistencies
- Compose-your-own NPK: the table says the percentages "need to sum up to 100%", while the knowledge base says to keep the total below 100%. We block totals above 100%.
- In CFP, "Submitted" means results were calculated. Here it means the inputs passed validation and a snapshot was stored. Calculation status is tracked separately and stays "not configured".

## 4. Not built in this phase
- Perennial Crops, Dairy and Beef pathways. They have their own data tables, which are published in the same knowledge-base category.
- Map picker for coordinates, the IPCC climate map, automatic soil classification lookup, and default COD values for common waste waters.
- Custom emission factors (fertiliser production, grid electricity) with evidence upload.
- Tier 2 default scenarios.
- Aggregation groups, the assessment compare view, and "old runs".
- Any CFP API connection (not authorised).
- **All calculations.** `src/lib/assessment/calculation.ts` is the integration point, and the `assessment_results` table is ready for its output.

## 5. How to close the gaps quickly
1. Sign in to cfp.coolfarm.org with any account and open **API Docs** in read-only mode. Export the OpenAPI JSON from Schemas, or from the browser's network tab. With that file, every key, enum and required flag can be checked and the `apiKey: provisional` marks resolved.
2. Create one Annual Crops and one Paddy Rice assessment, and screenshot each tab and its tooltips. This covers 3.1.
