# CFP assessment — field inventory

Generated from `src/config/cfp/schema.ts` by `npm run cfp:inventory` (questionnaire version `cfp3-crops-2026.11.1`). Do not edit by hand.

- **Path**: where the answer is stored in the assessment's `inputs` (CFP `inputData` shape; `farm.*` is the CFP farm object). `[]` marks a repeatable record.
- **Required**: "required once the section is started" applies to optional sections: they may stay empty, but every non-optional answer is needed once any answer is given. Notes are never required.
- **Provenance**: VERIFIED_GUIDE = official CFP guide (mostly the *Annual Crops Data Input Table*); VERIFIED_SCHEMA = CFP API User Guide; PROVISIONAL = not confirmed. **API key**: whether the storage key is a confirmed CFP API key.
- Every section also has an optional **User Notes** text box (stored in `notes.<sectionId>`, outside `inputs`).

## Sections (navigation order)

| # | Section | Group | Pathways | Status | Provenance | Source |
|---|---|---|---|---|---|---|
| 1 | Farm | Farm | Annual Crops, Paddy Rice, Potato | required | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 7-13; API farm object; Quick Start Guide ("Creating a farm"); Lay Guide 3.1 |
| 2 | Crop details | Crop details | Annual Crops, Paddy Rice, Potato | required | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 16-24; API inputData.cropDetails (required section) |
| 3 | Co-products | Crop details | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE | Data Input Table rows 25-31; Lay Guide 3.2 (Co-products) |
| 4 | Crop residues | Crop management | Annual Crops, Paddy Rice, Potato | required | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 32-34; API inputData.residue (required section); Lay Guide 3.3 |
| 5 | Paddy | Crop details | Paddy Rice | required | VERIFIED_GUIDE | Data Input Table rows 36-43 (rice only); Lay Guide 3.2 (Paddy rice-specific pathway) |
| 6 | Waste water | Crop management | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 44-48; API inputData.wasteWater.treatments; Lay Guide 3.3 |
| 7 | Pesticides | Inputs | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 49-64; API inputData.pesticide.applications; Lay Guide 3.4 |
| 8 | Fertilisers | Inputs | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 65-90; API inputData.fertiliser.fertilisers; Lay Guide 3.4; KB "Compose Your Own Fertiliser - Summation Exceeds 100%" |
| 9 | Refrigerants | Refrigerants | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 91-101; API inputData.refrigerants.equipments; Lay Guide 3.5 |
| 10 | Seeds | Seeds | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 102-110; API inputData.seedProduction.seedBought; Lay Guide 3.6 |
| 11 | Fuel & energy | Fuel & energy | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 111-124; API inputData.fuelEnergy.usages; Lay Guide 3.7; KB "If I have entered fuel consumption…" |
| 12 | Irrigation | Fuel & energy | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 125-135; API inputData.irrigation.events; Lay Guide 3.7; KB "Volume-only Irrigation via the API" |
| 13 | Transport | Fuel & energy | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 136-147; API inputData.transport.transports; Lay Guide 3.7 |
| 14 | Machinery operations | Fuel & energy | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 148-161; API inputData.machinery.machineryUse and cropDetails.soilType |
| 15 | Processing | Fuel & energy | Potato | optional | VERIFIED_GUIDE | Data Input Table rows 162-165 (potato only); Lay Guide 3.7 |
| 16 | Storage | Fuel & energy | Potato | optional | VERIFIED_GUIDE | Data Input Table rows 166-174 (potato only); Lay Guide 3.7 |
| 17 | Non-crop biomass (estimated) | Carbon changes | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 175-188; API inputData.nonCrop (hedges, intercrops, shadeTrees); Lay Guide 3.8 |
| 18 | Non-crop biomass (measured) | Carbon changes | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 190-213; API validation report category "nonCropMeasured"; Lay Guide 3.8 |
| 19 | Re-/deforestation | Carbon changes | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 214-220; API inputData.landUseChangeBiomass.forestChanges; Lay Guide 3.8 |
| 20 | Soil carbon changes | Carbon changes | Annual Crops, Paddy Rice, Potato | optional | VERIFIED_GUIDE, VERIFIED_SCHEMA | Data Input Table rows 221-257; Lay Guide 3.8 (Tier 1 vs Tier 2 table); KB "Soil characteristics…" (questions depend on the model you choose); API cropDetails.sandPercentage, farm.soilCharacteristic, inputData.steadyStateSoc |

## Questions

| Section | Question | Path | Type | Units | Options | Required | Shown when | Provenance | API key | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Farm | Farm name | `farm.name` | text |  |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 8 |
| Farm | Country where farm is located | `farm.country` | text |  |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 9 |
| Farm | Latitude | `farm.latitude` | number |  |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 10 |
| Farm | Longitude | `farm.longitude` | number |  |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 10 |
| Farm | Climate | `farm.climate` | select |  | 10 options — see [Climate](#climate) | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 11 |
| Farm | Annual average temperature | `farm.annualAverageTemperature` | quantity | °C, °F |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 12 |
| Farm | Farm identifier | `farm.farmIdentifier` | text |  |  | optional |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 13 |
| Crop details | Crop type | `cropDetails.cropType` | select |  | Annual Crops: 32 options — see [Crop type (Annual Crops)](#crop-type-annual-crops); Paddy Rice: Rice; Potato: Potato | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 19 |
| Crop details | Water regime during cultivation | `cropDetails.waterRegime` | select |  | Continuously Flooded, Intermittently flooded, Intermittently flooded - multiple aeration, Rainfed, Drought prone, Deep water | required | c.pathway === "paddy_rice" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 20 (rice only) |
| Crop details | Assessment year | `cropDetails.assessmentYear` | year |  |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 21 |
| Crop details | Growing area | `cropDetails.area` | quantity | hectares, acres |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 22 |
| Crop details | Total harvest amount | `cropDetails.cropYield` | quantity | tonnes, tons long, tons short |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 23 |
| Crop details | Farm gate ready amount | `cropDetails.farmGate` | quantity | tonnes, tons long, tons short |  | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 24 |
| Co-products | Main product label | `coProducts.mainProductLabel` | text |  |  | when: (c.doc.coProducts?.items \|\| []).length > 0 |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 27 |
| Co-products | Co-products | `coProducts.items` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 28-31 |
| Co-products | ↳ Type of co-product | `coProducts.items[].type` | text |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 29 |
| Co-products | ↳ Co-product percentage | `coProducts.items[].percentage` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 30 |
| Co-products | ↳ Allocation method | `coProducts.items[].allocationMethod` | radio |  | Economic, Mass, Other | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 31 |
| Crop residues | Above ground residue - dry weight | `residue.aboveGroundResidue` | quantity | kg per hectare, tonnes per hectare, lb per acre, tons short per acre, tons long per acre, kg per acre |  | optional |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 33 |
| Crop residues | Residue management | `residue.residueManagementPractice` | select |  | Exporting, Burning, Composting - forced aeration, Composting - non-forced aeration, Left in heaps or pits, Left on field | required |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 34; API enum |
| Paddy | Pre-season water regime | `paddy.preSeasonWaterRegime` | select |  | Not flooded pre-season (for <180 days), Not flooded pre-season (for >180 days), Not flooded pre-season (for >365 days), Flooded pre-season (for >30 days) | required |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 37 |
| Paddy | Time under cultivation | `paddy.timeUnderCultivation` | quantity | years, months, weeks, days, use default (IPCC) |  | required |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 38 |
| Paddy | Organic amendments applied | `paddy.organicAmendments` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 39-43 |
| Paddy | ↳ Organic amendment type | `paddy.organicAmendments[].type` | select |  | Straw incorporation more than 30 days before cultivation, Rice straw incorporation less than 30 days before cultivation, Farmyard manure, Green manure, Compost | required |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 40 |
| Paddy | ↳ Application rate | `paddy.organicAmendments[].applicationRate` | quantity | 8 options — see [Application rate](#application-rate) |  | required |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 41 |
| Waste water | Waste water treatments | `wasteWater.treatments` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 44-48 |
| Waste water | ↳ Oxygen demand type | `wasteWater.treatments[].oxygenDemandType` | radio |  | Biochemical, Chemical | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 45 |
| Waste water | ↳ Treatment process | `wasteWater.treatments[].treatmentProcess` | select |  | 12 options — see [Treatment process](#treatment-process) | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 46 |
| Waste water | ↳ Waste water volume | `wasteWater.treatments[].wasteWaterVolume` | quantity | litres, cubic metres, acre inches |  | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 47 |
| Waste water | ↳ Oxygen demand | `wasteWater.treatments[].oxygenDemand` | quantity | kg/litre, mg/litre, g/litre |  | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 48 |
| Pesticides | Pesticide applications | `pesticide.applications` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 50-64 |
| Pesticides | ↳ Category | `pesticide.applications[].category` | select |  | Soil treatment, Pre-emergence, Post-emergence, Other | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 50 |
| Pesticides | ↳ Type | `pesticide.applications[].type` | select |  | Pesticide, Fungicide, Herbicide, Insecticide | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 51 |
| Pesticides | ↳ Percentage of the field the product was applied to | `pesticide.applications[].fieldPercentage` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 52 |
| Pesticides | ↳ Active ingredients | `pesticide.applications[].activeIngredientPercentage` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 53 |
| Pesticides | ↳ Application rate | `pesticide.applications[].applicationRate` | quantity | 8 options — see [Application rate](#application-rate) |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 54 |
| Fertilisers | Fertiliser applications | `fertiliser.fertilisers` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 67-90 |
| Fertilisers | ↳ Fertiliser type | `fertiliser.fertilisers[].type` | select |  | 45 options — see [Fertiliser type](#fertiliser-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 67 |
| Fertilisers | ↳ Fertiliser production region | `fertiliser.fertilisers[].productionRegion` | select |  | 13 options — see [Fertiliser production region](#fertiliser-production-region) | required once the section is started | isMineral(c.item.type) | VERIFIED_GUIDE, PROVISIONAL | provisional | Annual Crops Data Input Table, row 68 |
| Fertilisers | ↳ %N (as ammonium N) | `fertiliser.fertilisers[].nAmmonium` | percent |  |  | required once the section is started | c.item.type === COMPOSE_NPK | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 70 |
| Fertilisers | ↳ %N (as nitrate N) | `fertiliser.fertilisers[].nNitrate` | percent |  |  | required once the section is started | c.item.type === COMPOSE_NPK | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 71 |
| Fertilisers | ↳ %N (as urea-N) | `fertiliser.fertilisers[].nUrea` | percent |  |  | required once the section is started | c.item.type === COMPOSE_NPK | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 72 |
| Fertilisers | ↳ %P2O5 OR %P | `fertiliser.fertilisers[].phosphorus` | quantity | %P2O5, %P |  | required once the section is started | c.item.type === COMPOSE_NPK | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 73 |
| Fertilisers | ↳ %K2O OR %K | `fertiliser.fertilisers[].potassium` | quantity | %K2O, %K |  | required once the section is started | c.item.type === COMPOSE_NPK | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 74 |
| Fertilisers | ↳ Application rate | `fertiliser.fertilisers[].applicationRate` | quantity | 8 options — see [Application rate](#application-rate) |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 75 |
| Fertilisers | ↳ Fertiliser weight, or units? | `fertiliser.fertilisers[].weightOrUnit` | select |  | 11 options — see [Fertiliser weight, or units?](#fertiliser-weight-or-units) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 76 |
| Fertilisers | ↳ Date of application | `fertiliser.fertilisers[].applicationDate` | date |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 77 |
| Fertilisers | ↳ Nitrification inhibitor used | `fertiliser.fertilisers[].nitrificationInhibitor` | checkbox |  |  | optional | inhibitorApplies(c.item) | VERIFIED_GUIDE, PROVISIONAL | provisional | Annual Crops Data Input Table, row 78 |
| Refrigerants | Equipment | `refrigerants.equipments` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 93-101 |
| Refrigerants | ↳ Equipment type | `refrigerants.equipments[].equipmentType` | select |  | 11 options — see [Equipment type](#equipment-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 93 |
| Refrigerants | ↳ Number of identical equipment units (same age) | `refrigerants.equipments[].numberOfUnits` | integer |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 94 |
| Refrigerants | ↳ Refrigerant type | `refrigerants.equipments[].refrigerantType` | select |  | 94 options — see [Refrigerant type](#refrigerant-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 95 |
| Refrigerants | ↳ Age of equipment (years) | `refrigerants.equipments[].age` | integer |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 96 |
| Refrigerants | ↳ These equipment units were disposed of within the assessment period | `refrigerants.equipments[].disposed` | checkbox |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 97 |
| Refrigerants | ↳ Refrigerant recovery pathway | `refrigerants.equipments[].recoveryPathway` | select |  | Landfill, Partial refrigerant recovery, Full refrigerant recovery, Unknown | required once the section is started | c.item.disposed === true | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 98 |
| Refrigerants | ↳ Initial refrigerant amount | `refrigerants.equipments[].initialAmount` | quantity | tonnes, kg, tons short, tons long, lb |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 99 |
| Refrigerants | ↳ Allocation method | `refrigerants.equipments[].allocationMethod` | select |  | Economic, Mass, Physical, Other | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 100 |
| Refrigerants | ↳ Allocation percentage | `refrigerants.equipments[].allocationPercentage` | percent |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 101 |
| Seeds | Purchase type for the production of this crop | `seedProduction.seedBought.purchaseType` | radio |  | Plugs, Seed | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 103 |
| Seeds | Number of plugs purchased in assessment year | `seedProduction.seedBought.plugsPurchased` | integer |  |  | required once the section is started | c.doc.seedProduction?.seedBought?.purchaseType === "Plugs" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 106 |
| Seeds | Plugs came in peat soil | `seedProduction.seedBought.plugsInPeat` | checkbox |  |  | optional | c.doc.seedProduction?.seedBought?.purchaseType === "Plugs" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 107 |
| Seeds | Mass of seed | `seedProduction.seedBought.seedMass` | quantity | tonnes, kg, tons short, tons long, lb |  | required once the section is started | c.doc.seedProduction?.seedBought?.purchaseType === "Seed" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 109 |
| Seeds | Seed source | `seedProduction.seedBought.seedSource` | radio |  | Hybrid seed (from breeder), Single variety | required once the section is started | c.doc.seedProduction?.seedBought?.purchaseType === "Seed" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 110 |
| Fuel & energy | Energy uses | `fuelEnergy.usages` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 113-124 |
| Fuel & energy | ↳ Energy source | `fuelEnergy.usages[].energySource` | select |  | 29 options — see [Energy source](#energy-source) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 113 |
| Fuel & energy | ↳ Energy used | `fuelEnergy.usages[].energyUsed` | quantity | depends on the record (energyUnitsFor(c.item.energySource)) |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 114 |
| Fuel & energy | ↳ Boundary | `fuelEnergy.usages[].boundary` | select |  | Incoming to farm for on-farm use, Within farm operations, Dispatched from farm, Unknown | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 115 |
| Fuel & energy | ↳ Category | `fuelEnergy.usages[].category` | radio |  | Field, Facility (Processing) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 116 |
| Irrigation | Irrigation events | `irrigation.events` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 127-135 |
| Irrigation | ↳ Method | `irrigation.events[].method` | select |  | Center pivot, Rain gun, sprinkler, Flooding, Drip irrigation | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 127 |
| Irrigation | ↳ Water source | `irrigation.events[].waterSource` | select |  | Natural lake/pond, Reservoir, River/stream/ditch, On farm Storage pond/reservoir/tank, Borehole/well, Main supply | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 128 |
| Irrigation | ↳ Power source | `irrigation.events[].powerSource` | select |  | Electric, diesel (average biofuel blend), Diesel (100% mineral diesel), Gravity | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 129 |
| Irrigation | ↳ % field irrigated | `irrigation.events[].fieldPercentage` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 130 |
| Irrigation | ↳ Calculation methodology | `irrigation.events[].calculationMethod` | radio |  | Volume, pumping depth & distance, Volume only | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 131 |
| Irrigation | ↳ Total water added | `irrigation.events[].totalWater` | quantity | inches, millimetres, litres, cubic metres, acre inches |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 132 |
| Irrigation | ↳ Pumping depth / height | `irrigation.events[].pumpingDepth` | quantity | Metres, Centimetres, Inches, Feet, Millimitres |  | required once the section is started | c.item.calculationMethod === "Volume, pumping depth & distance" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 134 |
| Irrigation | ↳ Horizontal distance | `irrigation.events[].horizontalDistance` | quantity | 7 options — see [Horizontal distance](#horizontal-distance) |  | required once the section is started | c.item.calculationMethod === "Volume, pumping depth & distance" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 135 |
| Transport | Transport | `transport.transports` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 138-147 |
| Transport | ↳ Type | `transport.transports[].type` | select |  | 19 options — see [Type](#type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 138 |
| Transport | ↳ Boundary | `transport.transports[].boundary` | radio |  | Incoming to Farm for on-farm use, Within Farm, Dispatched from farm | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 139 |
| Transport | ↳ Weight | `transport.transports[].weight` | quantity | tonnes, kg, tons short, tons long, lb |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 140 |
| Transport | ↳ Distance | `transport.transports[].distance` | quantity | kilometres, miles |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 141 |
| Transport | ↳ Label | `transport.transports[].label` | text |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 142 |
| Machinery operations | Soil type | `cropDetails.soilType` | radio |  | fine, medium, coarse | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 150 |
| Machinery operations | Machines | `machinery.machineryUse` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 151-161 |
| Machinery operations | ↳ Machine type | `machinery.machineryUse[].machine` | select |  | 76 options — see [Machine type](#machine-type) | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 151 |
| Machinery operations | ↳ Fuel type | `machinery.machineryUse[].fuelUse` | select |  | diesel (average biofuel blend), diesel (100% mineral diesel), Biodiesel ME, Biodiesel HVO | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 152 |
| Machinery operations | ↳ Number of operations | `machinery.machineryUse[].numberMachineryOperations` | integer |  |  | required once the section is started |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 153 |
| Machinery operations | ↳ Label | `machinery.machineryUse[].label` | text |  |  | optional |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 154 |
| Processing | Percentage (%) of total harvest processed | `potatoProcessing.percentProcessed` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 163 |
| Processing | Processing type | `potatoProcessing.processingType` | radio |  | Washing, Grading | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 164 |
| Processing | Energy source | `potatoProcessing.energySource` | select |  | 29 options — see [Energy source](#energy-source) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 165 |
| Storage | Percentage (%) of total harvest stored | `potatoStorage.percentStored` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 167 |
| Storage | Energy source for loading | `potatoStorage.energyLoading` | select |  | 29 options — see [Energy source for loading](#energy-source-for-loading) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 168 |
| Storage | Energy source for unloading | `potatoStorage.energyUnloading` | select |  | 29 options — see [Energy source for unloading](#energy-source-for-unloading) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 169 |
| Storage | Energy source for temperature control | `potatoStorage.energyTemperatureControl` | select |  | 29 options — see [Energy source for temperature control](#energy-source-for-temperature-control) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 170 |
| Storage | Time in storage | `potatoStorage.timeInStorage` | quantity | years, months, weeks, days |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 171 |
| Storage | Temperature difference | `potatoStorage.temperatureDifference` | quantity | °C, °F |  | required once the section is started |  | VERIFIED_GUIDE, PROVISIONAL | provisional | Annual Crops Data Input Table, row 172 |
| Storage | CIPC applications | `potatoStorage.cipcApplications` | integer |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 173 |
| Storage | CIPC dose per treatment (grams/tonne) | `potatoStorage.cipcDose` | number |  |  | required once the section is started | (num(c.doc.potatoStorage?.cipcApplications) ?? 0) > 0 | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 174 |
| Non-crop biomass (estimated) | Intercrops | `nonCrop.intercrops` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 177-180 |
| Non-crop biomass (estimated) | ↳ Intercrop type | `nonCrop.intercrops[].type` | select |  | Avocado, Cashew, Jackfruit, Rubber, Durian | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 178 |
| Non-crop biomass (estimated) | ↳ Percentage occupied | `nonCrop.intercrops[].percentageOccupied` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 179 |
| Non-crop biomass (estimated) | ↳ Planting density | `nonCrop.intercrops[].plantingDensity` | quantity | per hectare, per acre |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 180 |
| Non-crop biomass (estimated) | Shade trees | `nonCrop.shadeTrees` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 181-184 |
| Non-crop biomass (estimated) | ↳ Tree type | `nonCrop.shadeTrees[].type` | select |  | Tropical shade trees in wet area - canopy trees, Tropical shade trees in wet area - understory, Tropical shade trees in dry area, Temperate conifers, Temperate broadleaf trees, Temperate shrubs | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 182 |
| Non-crop biomass (estimated) | ↳ Percentage occupied | `nonCrop.shadeTrees[].percentageOccupied` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 183 |
| Non-crop biomass (estimated) | ↳ Planting density | `nonCrop.shadeTrees[].plantingDensity` | quantity | per hectare, per acre |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 184 |
| Non-crop biomass (estimated) | Hedges | `nonCrop.hedges` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 185-188 |
| Non-crop biomass (estimated) | ↳ Hedge type | `nonCrop.hedges[].type` | select |  | Ash, Maple, Poplar, Oak, Species mix | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 186 |
| Non-crop biomass (estimated) | ↳ Hedge width | `nonCrop.hedges[].width` | quantity | metres, feet |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 187 |
| Non-crop biomass (estimated) | ↳ Hedge length | `nonCrop.hedges[].length` | quantity | m, km, mi, ft |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 188 |
| Non-crop biomass (measured) | Tree species | `nonCropMeasured.trees` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 192-213 |
| Non-crop biomass (measured) | ↳ Tree type | `nonCropMeasured.trees[].treeType` | select |  | 12 options — see [Tree type](#tree-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 192 |
| Non-crop biomass (measured) | ↳ Net number of trees planted (+) or removed (-) | `nonCropMeasured.trees[].netTreesChange` | integer |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 193 |
| Non-crop biomass (measured) | ↳ Percentage occupied (previous year) | `nonCropMeasured.trees[].percentageOccupiedPrevious` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 194 |
| Non-crop biomass (measured) | ↳ Plant density (previous year) | `nonCropMeasured.trees[].plantDensityPrevious` | quantity | per hectare, per acre |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 195 |
| Non-crop biomass (measured) | ↳ Sample tree measurement (previous year) | `nonCropMeasured.trees[].measurementPrevious` | quantity | cm, m, in, ft |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 197 |
| Non-crop biomass (measured) | ↳ Standard deviation (previous year) | `nonCropMeasured.trees[].sdPrevious` | number |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 198 |
| Non-crop biomass (measured) | ↳ Sample size (previous year) | `nonCropMeasured.trees[].sampleSizePrevious` | integer |  |  | when: num(c.item.sdPrevious) !== null |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 199 |
| Non-crop biomass (measured) | ↳ Sample tree measurement (current year) | `nonCropMeasured.trees[].measurementCurrent` | quantity | cm, m, in, ft |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 200 |
| Non-crop biomass (measured) | ↳ Standard deviation (current year) | `nonCropMeasured.trees[].sdCurrent` | number |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 201 |
| Non-crop biomass (measured) | ↳ Sample size (current year) | `nonCropMeasured.trees[].sampleSizeCurrent` | integer |  |  | when: num(c.item.sdCurrent) !== null |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 202 |
| Re-/deforestation | Forest changes | `landUseChangeBiomass.forestChanges` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 216-220 |
| Re-/deforestation | ↳ Type of change | `landUseChangeBiomass.forestChanges[].changeType` | radio |  | Deforestation, Reforestation | required once the section is started |  | PROVISIONAL | provisional | Not in the table (it says "fill the following only if deforested") |
| Re-/deforestation | ↳ Forest type | `landUseChangeBiomass.forestChanges[].forestType` | select |  | 15 options — see [Forest type](#forest-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 216 |
| Re-/deforestation | ↳ How many years ago did the land use change happen? | `landUseChangeBiomass.forestChanges[].yearsAgo` | integer |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 217 |
| Re-/deforestation | ↳ Area re-/deforested | `landUseChangeBiomass.forestChanges[].area` | quantity | hectares, acres |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 218 |
| Re-/deforestation | ↳ Age of forest when removed (years) | `landUseChangeBiomass.forestChanges[].forestAgeWhenRemoved` | integer |  |  | required once the section is started | c.item.changeType === "Deforestation" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 220 |
| Soil carbon changes | Soil carbon model | `soilCarbon.model` | radio |  | Annual Crops: Tier 1, Tier 2; Paddy Rice: Tier 1; Potato: Tier 1, Tier 2 | optional |  | VERIFIED_GUIDE, PROVISIONAL | provisional | KB: soil data "is dependent on the model you choose"; Lay Guide 3.8 |
| Soil carbon changes | Soil classification | `farm.soilCharacteristic` | select |  | Low activity clay, High activity clay, Sandy soils, Spodic soils, Volcanic soils, Wetland soils | required once the section is started | c.doc.soilCarbon?.model === "Tier 1" | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 223; API farm.soilCharacteristic; Quick Start (moved to Tier 1) |
| Soil carbon changes | Changes (most recent first) | `soilCarbon.tier1.changes` | group |  |  | list, at least 1 | c.doc.soilCarbon?.model === "Tier 1" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 224-229 |
| Soil carbon changes | ↳ Year of change | `soilCarbon.tier1.changes[].yearOfChange` | year |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 225 |
| Soil carbon changes | ↳ Land use change | `soilCarbon.tier1.changes[].landUse` | pair |  | Native, Set aside, Cultivated, Paddy, Perennial | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 226 |
| Soil carbon changes | ↳ Tillage | `soilCarbon.tier1.changes[].tillage` | pair |  | full, reduced, no-till | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 227 |
| Soil carbon changes | ↳ Carbon inputs | `soilCarbon.tier1.changes[].carbonInputs` | pair |  | Low, Medium, High without manure, High  with manure | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 228 |
| Soil carbon changes | ↳ Percentage of field change applies to | `soilCarbon.tier1.changes[].fieldPercentage` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 229 |
| Soil carbon changes | Percentage of sand in soil | `cropDetails.sandPercentage` | percent |  |  | required once the section is started | c.doc.soilCarbon?.model === "Tier 2" | VERIFIED_GUIDE, VERIFIED_SCHEMA | verified | Annual Crops Data Input Table, row 232 ("not needed for rice"); API cropDetails.sandPercentage |
| Soil carbon changes | Assessment year: tillage | `steadyStateSoc.assessmentYear.tillage` | radio |  | Conventional, Reduced, No-till | required once the section is started | c.doc.soilCarbon?.model === "Tier 2" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 233 |
| Soil carbon changes | Assessment year: irrigation | `steadyStateSoc.assessmentYear.irrigation` | radio |  | Yes, No | required once the section is started | c.doc.soilCarbon?.model === "Tier 2" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 234 |
| Soil carbon changes | Assessment year: cover crops | `steadyStateSoc.assessmentYear.coverCrops` | group |  |  | list (may be empty) | c.doc.soilCarbon?.model === "Tier 2" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 235-241 |
| Soil carbon changes | ↳ Species | `steadyStateSoc.assessmentYear.coverCrops[].species` | select |  | 10 options — see [Species](#species) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 236 |
| Soil carbon changes | ↳ % of cover crop coverage | `steadyStateSoc.assessmentYear.coverCrops[].coveragePercent` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 237 |
| Soil carbon changes | ↳ Height of cover crop | `steadyStateSoc.assessmentYear.coverCrops[].height` | quantity | cm, m, in, ft |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 238 |
| Soil carbon changes | ↳ % of biomass left in field | `steadyStateSoc.assessmentYear.coverCrops[].biomassLeftPercent` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 239 |
| Soil carbon changes | ↳ Management of biomass left in field | `steadyStateSoc.assessmentYear.coverCrops[].managementLeft` | radio |  | left in field, burned, n/a | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 240 |
| Soil carbon changes | ↳ Management of biomass removed | `steadyStateSoc.assessmentYear.coverCrops[].managementRemoved` | select |  | left in heaps or pits, Composting forced aeration, Composting non-forced aeration, Exporting, n/a | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 241 |
| Soil carbon changes | Crop history | `steadyStateSoc.cropHistory` | group |  |  | list, at least 1 | c.doc.soilCarbon?.model === "Tier 2" | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 242-257 |
| Soil carbon changes | ↳ Crop type | `steadyStateSoc.cropHistory[].cropType` | select |  | 42 options — see [Crop type](#crop-type) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 242 |
| Soil carbon changes | ↳ Start year of crop cycle | `steadyStateSoc.cropHistory[].startYear` | year |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 243 |
| Soil carbon changes | ↳ End year of crop cycle | `steadyStateSoc.cropHistory[].endYear` | year |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 243 |
| Soil carbon changes | ↳ Crop yield (average if several years) | `steadyStateSoc.cropHistory[].cropYield` | quantity | kg per hectare, tonnes per hectare, lb per acre, tons short per acre, tons long per acre, kg per acre |  | required once the section is started | __vite_ssr_import_0__.ANNUAL_CROP_TYPE.includes(c.item.cropType) | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 244 |
| Soil carbon changes | ↳ Residues were left on the field | `steadyStateSoc.cropHistory[].residuesLeft` | checkbox |  |  | optional |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 245 |
| Soil carbon changes | ↳ Tillage | `steadyStateSoc.cropHistory[].tillage` | radio |  | Conventional, Reduced, No-till | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 246 |
| Soil carbon changes | ↳ Irrigation | `steadyStateSoc.cropHistory[].irrigation` | radio |  | Yes, No | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 247 |
| Soil carbon changes | ↳ Organic inputs | `steadyStateSoc.cropHistory[].organicInputs` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 248-250 |
| Soil carbon changes | ↳ ↳ Organic input type | `steadyStateSoc.cropHistory[].organicInputs[].type` | select |  | 22 options — see [Organic input type](#organic-input-type) | required once the section is started |  | VERIFIED_GUIDE, PROVISIONAL | provisional | Annual Crops Data Input Table, row 249 |
| Soil carbon changes | ↳ ↳ Amount of organic input | `steadyStateSoc.cropHistory[].organicInputs[].amount` | quantity | 8 options — see [Amount of organic input](#amount-of-organic-input) |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 250 |
| Soil carbon changes | ↳ Cover crops | `steadyStateSoc.cropHistory[].coverCrops` | group |  |  | list (may be empty) |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 251-257 |
| Soil carbon changes | ↳ ↳ Species | `steadyStateSoc.cropHistory[].coverCrops[].species` | select |  | 10 options — see [Species](#species) | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 252 |
| Soil carbon changes | ↳ ↳ % of cover crop coverage | `steadyStateSoc.cropHistory[].coverCrops[].coveragePercent` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 253 |
| Soil carbon changes | ↳ ↳ Height of cover crop | `steadyStateSoc.cropHistory[].coverCrops[].height` | quantity | cm, m, in, ft |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 254 |
| Soil carbon changes | ↳ ↳ % of biomass left in field | `steadyStateSoc.cropHistory[].coverCrops[].biomassLeftPercent` | percent |  |  | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 255 |
| Soil carbon changes | ↳ ↳ Management of biomass left in field | `steadyStateSoc.cropHistory[].coverCrops[].managementLeft` | radio |  | left in field, burned, n/a | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 256 |
| Soil carbon changes | ↳ ↳ Management of biomass removed | `steadyStateSoc.cropHistory[].coverCrops[].managementRemoved` | select |  | left in heaps or pits, Composting forced aeration, Composting non-forced aeration, Exporting, n/a | required once the section is started |  | VERIFIED_GUIDE | provisional | Annual Crops Data Input Table, row 257 |

## Option lists

### Climate

- Tropical Montane
- Tropical Wet
- Tropical Moist
- Tropical Dry
- Warm Temperate Moist
- Warm Temperate Dry
- Cool Temperate Moist
- Cool Temperate Dry
- Boreal Moist
- Boreal Dry

### Crop type (Annual Crops)

- Alfalfa
- Barley
- Clover
- Cotton
- DryBean
- Grass-clover mix
- Maize
- Millet
- Oats
- Peanut
- Perennial grass
- Rye
- Sorghum
- Soyabean
- Springwheat
- Tomato
- Vegetable-above ground
- Winter wheat
- Other grain
- Other legume
- Other N-fixing forage
- Other Non-N-fixing forage
- Other root crops
- Other tuber crop
- Other annual crop
- Strawberry
- Rapeseed
- Canola
- Hops
- Sugarcane
- Vegetable-root
- Upland Rice

### Application rate

- kg per hectare
- litres per hectare
- tonnes per hectare
- lb per acre
- tons short per acre
- tons long per acre
- kg per acre
- liters per acre

### Treatment process

- None - unspecified aquatic environment
- None - stagnant sewer
- None - fast flowing sewer
- Centralized aerobic treatment plant
- Anaerobic reactor
- Anaerobic lagoon - depth < 2m
- Anaerobic lagoon - depth > 2m
- None - other than reservoirs, lakes and estuaries
- None - reservoirs, lakes and estuaries
- Constructed Wetlands - Surface Flow
- Constructed Wetlands - Horizontal Subsurface Flow
- Constructed Wetlands - Vertical Subsurface Flow

### Fertiliser type

- Compose your own NPK
- Ammonium nitrate - 33.5% N (granulated)
- Ammonium nitrate - 33.5% N (prilled)
- Ammonium sulphate - 21% N
- Ammonium sulphate nitrate - 26%N
- Anhydrous ammonia - 82% N
- Calcium ammonium nitrate - 27% N
- Calcium nitrate - 15.5% N
- Compound NPK - 15% N / 15% K2O / 15% P2O5 (mixed-acid process)
- Compound NPK - 15% N / 15% K2O / 15% P2O5 (nitrophosphate process)
- Diammonium phosphate - 18% N / 46% P2O5
- Monoammonium phosphate - 11% N / 52% P2O5
- Muriate of potash / Potassium chloride - 60% K2O
- Phosphate/Rock Phosphate - 32% P2O5
- Polyhalite - 48% SO3 / 14% K2O / 6% MgO / 17% CaO
- Potassium nitrate - crystallized (caliche method)
- Potassium nitrate - prilled (caliche method)
- Potassium sulphate - 50% K2O / 45% SO3
- Super phosphate - 21% P2O5
- Triple super phosphate - 48% P2O5
- Urea - 46% N
- Urea ammonium nitrate solution - 32% N
- Limestone - 55% CaCO3 / 29%CaO
- Compost - 1% N
- Compost (zero emissions) - 1% N
- Peat
- Horse digestate - 0.7% N
- Pig digestate - 0.36% N
- Pig digestate - 0.7% N
- Poultry layer digestate - 1.9% N
- Sheep digestate - 0.7% N
- Broiler/Turkey litter - 3% N
- Cattle manure - 0.6% N
- Cattle slurry - 0.26% N
- Horse manure - 0.5% N
- Pig manure - 0.7% N
- Pig slurry - 0.36% N
- Poultry layer manure - 1.9% N
- Separated pig slurry (liquid part) 0.36% N
- Separated pig slurry (solid part) - 0.5% N
- Sheep manure - 0.7% N
- Cattle digestate - 0.26% N
- Cattle digestate - 0.6% N
- Straw (Production emissions included)
- Straw (Zero emissions)

### Fertiliser production region

- Africa 2014
- China 2014
- Europe 2014
- Middle East 2014
- N America 2014
- S America 2014
- Russia (CIS countries) 2014
- SE Asia 2014
- S Asia 2014
- Oceania 2014
- World 2014
- World 2019
- Default

### Fertiliser weight, or units?

- product
- unit of K (K)
- unit of K2O (K2O)
- unit of P2O5 (P2O5)
- unit of nitrogen (N)
- unit of phosphorus (P)
- unit of CaO (CAO)
- unit of SO3 (SO3)
- unit of MgO (MGO)
- unit of carbon (C)
- unit of CaCO3 (CACO3)

### Equipment type

- Domestic refrigeration
- Commercial refrigeration (standalone)
- Commercial refrigeration (medium and large)
- Transport refrigeration
- Industrial refrigeration
- Chillers
- Stationary air conditioning
- Mobile air conditioning- maritime
- Mobile air conditioning- railway
- Mobile air conditioning- busses
- Mobile air conditioning- other

### Refrigerant type

- Unknown
- R-400(50/50)
- R-400(60/40)
- R-401A
- R-401B
- R-401C
- R-402A
- R-402B
- R-403A
- R-403B
- R-404A
- R-405A
- R-406A
- R-407A
- R-407B
- R-407C
- R-407D
- R-407E
- R-408A
- R-409A
- R-409B
- R-410A
- R-410B
- R-411A
- R-411B
- R-411C
- R-412A
- R-413A
- R-414A
- R-414B
- R-415A
- R-415B
- R-416A
- R-417A
- R-418A
- R-419A
- R-420A
- R-421A
- R-422A
- R-422B
- R-422C
- R-500
- R-501
- R-502
- R-503
- R-504
- R-505
- R-506
- R-507
- R-508A
- R-508B
- R-509A
- HFC-23
- HFC-32
- HFC-41
- HFC-125
- HFC-134
- HFC-134a
- HFC-143
- HFC-143a
- HFC-152
- HFC-152a
- HFC-161
- HFC-227ca
- HFC-227ea
- HFC-236cb
- HFC-236ea
- HFC-236fa
- HFC-245ca
- HFC-245cb
- HFC-245ea
- HFC-245eb
- HFC-245fa
- HFC-263fb
- HFC-272ca
- HFC-329p
- HFC-365mfc
- HFC-43-10mee
- HCFC-142b
- CFC-114
- CFC-115
- CFC-12
- CFC-13
- HC-1270
- HC-290
- HC-600
- HC-600a
- HCFC-124
- HCFC-22
- HCFC-31
- HE-E170
- PFC-116
- PFC-218
- PFC-318

### Energy source

- Biodiesel HVO
- Biodiesel ME
- Bioethanol
- diesel (100% mineral diesel)
- diesel (average biofuel blend)
- petrol (100% mineral petrol)
- petrol (average biofuel blend)
- gas (by volume)
- Oil (by volume)
- Propane
- coal (by weight)
- fuel wood
- gas (by weight)
- wood pellets
- Grid electricity
- Electricity(hydroelectric)
- Electricity(photo-voltaic)
- Electricity(wind)
- CHP import(biogas)
- CHP import-electricity(natural gas)
- CHP import-heat(natural gas)
- CHP export-(biogas)
- CHP export-electricity(natural gas)
- CHP export-heat(natural gas)
- CHP onsite(biogas)
- CHP onsite(natural gas)
- Gas (by energy)
- Coal (by energy)
- Oil (by energy)

### Horizontal distance

- Metres
- Kilometres
- Centimetres
- Miles
- Inches
- Feet
- Millimitres

### Type

- car diesel
- car petrol
- motorbike
- road HGV (average heavy goods vehicle)
- road LGV diesel (light goods vehicle <3.5t)
- road LGV petrol (light goods vehicle <3.5t)
- road LGV CNG/LPG (<3.5t)
- rail
- air very short haul (<800km)
- air short haul (800 - 3700km)
- air long haul (>3700km)
- ship small tanker (~1000t)
- ship large container vessel (2,000+ TEU)
- ship very large tanker (>60000t)
- ship small bulk carrier (~2000t)
- ship large bulk carrier (~15 000t)
- ship very large bulk carrier (~70 000t)
- ship small container vessel (0-1999 TEU)
- ship large container vessel (~20 000t)

### Machine type

- All-around weeder
- Baler
- Baler (250 kg round bale)
- Baler (250 kg square bale)
- Beet harvester
- Biocide spraying
- Chisel plough
- Chopping wine wood
- Combination rotary harrow/ sower
- Combination spike drum/sower
- Combine
- Combine harrow (harrow + seed drill)
- Corn combine
- Crop protection - syringe (orchards)
- Crop protection - syringe (viniculture)
- Disc harrow
- Fertiliser boom spraying
- Fertiliser spraying (orchards)
- Fertiliser spreading
- Flaming
- Foliage cut
- Forage harvester
- Forage harvester - corn hoeing with chipper
- Forage harvester - grassland
- Grain drill
- Grain drill-notill
- Grape harvester
- Grass seeding
- Grooming
- Grubbing
- Herbicide spraying
- Hilling of mounds
- Hoe drill
- Hoeing and grooming
- Liming
- Manure spreader
- Milling
- Moldboard plough
- Mower/grader
- Mower/grader - rotary mower - cultivation
- Mower-conditioner
- Mowing - disc mower
- Mulching - flail mulcher (orchards)
- Mulching - flail mulcher (viniculture)
- Mulching - seeding - corn
- Peas harvester
- Pneumatic drill
- Potato harvester
- Potato lifter loader
- Potato planting
- Potato planting - potato planter - semiautomatic
- Potato windrower
- Pressing of dry crop (straw/hay) high-density pick-up baler (13 kg/bale)
- Pump tank truck - drag hose
- Rod weeder
- Roller harrow
- Roller packer
- Rotary cultivation of tramlines
- Rotary hoe/bed tiller
- Row crop cultivator
- Row crop planter
- Scrubbing
- Self-propelling potato harvester
- Self-propelling potato lifter loader
- Subsoiler
- Subsoiling (viniculture)
- Sweep plough
- Tine harrow/seed handling transport
- Tomato harvester
- Tooth harrow
- Vacuum tanker
- Wagon for ventilated hay
- Wagon for wilted material
- Windrower/swather
- Winter cut - flail mulcher
- Wrapping of bales

### Energy source for loading

- Biodiesel HVO
- Biodiesel ME
- Bioethanol
- diesel (100% mineral diesel)
- diesel (average biofuel blend)
- petrol (100% mineral petrol)
- petrol (average biofuel blend)
- gas (by volume)
- Oil (by volume)
- Propane
- coal (by weight)
- fuel wood
- gas (by weight)
- wood pellets
- Grid electricity
- Electricity(hydroelectric)
- Electricity(photo-voltaic)
- Electricity(wind)
- CHP import(biogas)
- CHP import-electricity(natural gas)
- CHP import-heat(natural gas)
- CHP export-(biogas)
- CHP export-electricity(natural gas)
- CHP export-heat(natural gas)
- CHP onsite(biogas)
- CHP onsite(natural gas)
- Gas (by energy)
- Coal (by energy)
- Oil (by energy)

### Energy source for unloading

- Biodiesel HVO
- Biodiesel ME
- Bioethanol
- diesel (100% mineral diesel)
- diesel (average biofuel blend)
- petrol (100% mineral petrol)
- petrol (average biofuel blend)
- gas (by volume)
- Oil (by volume)
- Propane
- coal (by weight)
- fuel wood
- gas (by weight)
- wood pellets
- Grid electricity
- Electricity(hydroelectric)
- Electricity(photo-voltaic)
- Electricity(wind)
- CHP import(biogas)
- CHP import-electricity(natural gas)
- CHP import-heat(natural gas)
- CHP export-(biogas)
- CHP export-electricity(natural gas)
- CHP export-heat(natural gas)
- CHP onsite(biogas)
- CHP onsite(natural gas)
- Gas (by energy)
- Coal (by energy)
- Oil (by energy)

### Energy source for temperature control

- Biodiesel HVO
- Biodiesel ME
- Bioethanol
- diesel (100% mineral diesel)
- diesel (average biofuel blend)
- petrol (100% mineral petrol)
- petrol (average biofuel blend)
- gas (by volume)
- Oil (by volume)
- Propane
- coal (by weight)
- fuel wood
- gas (by weight)
- wood pellets
- Grid electricity
- Electricity(hydroelectric)
- Electricity(photo-voltaic)
- Electricity(wind)
- CHP import(biogas)
- CHP import-electricity(natural gas)
- CHP import-heat(natural gas)
- CHP export-(biogas)
- CHP export-electricity(natural gas)
- CHP export-heat(natural gas)
- CHP onsite(biogas)
- CHP onsite(natural gas)
- Gas (by energy)
- Coal (by energy)
- Oil (by energy)

### Tree type

- Coffee(arabica)
- Shade(Cordia alliodora, Juglans olanchana, inga tonduzzi, I. punctata)
- Tropical Moist hardwood
- Tropical wet hardwood
- Temperate/tropical pines
- Temperate US eastern hardwood
- Palm(Chrysophylla sp)
- Palm(Attalea cohune)
- Palm(Sabal sp)
- Palm(Attalea phalarata)
- Palm(Euterpe precatoria)
- Palm(Phenakospermun guialanensis)

### Forest type

- subtropical dry forest
- subtropical mountain system
- tropical dry forest
- tropical moist deciduous forest
- tropical mountain systems
- tropical rainforest
- tropical shrubland
- boreal coniferous forest
- boreal mountain system
- boreal tundra woodland
- subtropical humid forest
- subtropical steppe
- temperate continental forest
- temperate mountain systems
- temperate oceanic forest

### Species

- Black oats
- Common vetch
- Fodder radish
- Phacella
- White mustard
- Tagetes
- Mix with legumes
- Mix without legumes
- Other legume
- Other non-legume

### Crop type

- Alfalfa
- Barley
- Clover
- Cotton
- DryBean
- Grass-clover mix
- Maize
- Millet
- Oats
- Peanut
- Perennial grass
- Rye
- Sorghum
- Soyabean
- Springwheat
- Tomato
- Vegetable-above ground
- Winter wheat
- Other grain
- Other legume
- Other N-fixing forage
- Other Non-N-fixing forage
- Other root crops
- Other tuber crop
- Other annual crop
- Strawberry
- Rapeseed
- Canola
- Hops
- Sugarcane
- Vegetable-root
- Upland Rice
- Apple
- Citrus
- Cocoa - high density
- Cocoa - low density
- Coffee - shaded
- Coffee - monocrop
- Almonds
- Tea
- Oil Palm
- Potato

### Organic input type

- Compost - 1% N
- Compost (zero emissions) - 1% N
- Peat
- Horse digestate - 0.7% N
- Pig digestate - 0.36% N
- Pig digestate - 0.7% N
- Poultry layer digestate - 1.9% N
- Sheep digestate - 0.7% N
- Broiler/Turkey litter - 3% N
- Cattle manure - 0.6% N
- Cattle slurry - 0.26% N
- Horse manure - 0.5% N
- Pig manure - 0.7% N
- Pig slurry - 0.36% N
- Poultry layer manure - 1.9% N
- Separated pig slurry (liquid part) 0.36% N
- Separated pig slurry (solid part) - 0.5% N
- Sheep manure - 0.7% N
- Cattle digestate - 0.26% N
- Cattle digestate - 0.6% N
- Straw (Production emissions included)
- Straw (Zero emissions)

### Amount of organic input

- kg per hectare
- litres per hectare
- tonnes per hectare
- lb per acre
- tons short per acre
- tons long per acre
- kg per acre
- liters per acre
