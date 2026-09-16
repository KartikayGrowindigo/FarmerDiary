# ClearHarvest Farmer Diary (prototype)

Mobile-first React + Vite + TypeScript prototype for a farmer diary used by wheat farmers in Punjab.

Run

```bash
npm install
npm run dev
```

Data model
- Farmer: id, name, fatherName, village, contact, kisanAdvisor, gender, gipl_id
- Plot: id, farmerId, acres, village
- CropCycle: id, plotId, crop, season, year, sowingDate, harvestDate
- Activity: id, cropCycleId, module, date, notes, payload (fields vary by module)

Module -> fields mapping
- Land Preparation & Sowing: prepMethod (single-select), equipment, hoursPerAcre, fuelLitres, totalCostPerAcre
- Seed & Sowing: variety (single-select), seedRateKgPerAcre, seedTreatmentDone, treatmentProduct
- Fertilizer & Nutrient Management: product (single-select), quantityKgPerAcre, applicationMethod, costINR, otherCostINR
- Pest & Disease Management: cppType, tradeName, quantityPerAcre, unit, targetPest, fuelLitres, costINR
- Water Management: irrigationMethod, waterSource, groundwaterDepthFt, durationHours, irrigationNumber, pumpHP, fuelLitres
- Harvesting: yieldQtlPerAcre, moisturePct, priceINRPerQtl, fuelLitres, otherExpensesINR
- Residue Management: method, quantityQtlPerAcre, fuelLitres, costINR

Notes
- All emission factors are placeholders in `src/config/factors.v1.ts`. Values are provisional and must be signed off by the agronomy team. UI labels show "estimated" for impact results.
- Data is seeded from `src/data/seed.json` and persisted to `localStorage` (`clearharvest:v1`).
- The store abstraction is in `src/lib/store.ts` to allow swapping for a backend later.

Critical UX: "Apply to all my plots" is implemented in the Add Activity flow — it writes the same activity to all current crop cycles for the farmer.
