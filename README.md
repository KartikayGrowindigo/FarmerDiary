# ClearHarvest Farmer Diary (prototype)

Mobile-first React + Vite + TypeScript prototype for a farmer diary used by wheat farmers in Punjab.

Run

```bash
npm install
npm run dev
```

Sign-in (Microsoft, @growindigo.co.in only)
- growindigo.co.in mail is on Microsoft 365, so login uses Microsoft Entra ID via MSAL (`src/lib/auth.tsx`).
- Register an app in the Grow Indigo Entra tenant: platform "Single-page application", redirect URIs `http://localhost:5173` and the deployed URL. No secret is needed.
- Copy `.env.example` to `.env` and set `VITE_AZURE_CLIENT_ID` (and `VITE_AZURE_TENANT_ID` if you want the tenant GUID).
- The authority is the Grow Indigo tenant, and any account whose email is not `@growindigo.co.in` (e.g. B2B guests) is rejected.
- Without a client ID, `npm run dev` shows a "Continue in dev mode" button. Production builds never show it.
- This is a client-side gate. Once data moves to a backend, the backend must validate the Microsoft ID token too.

FAT survey (Regen Ag 5.1)
- Questions come from `Wheat Punjab - Regen AG5.1 Annual Crop Import Data.xlsx` and live in `src/config/fatSurvey.ts`, each tagged with its exact sheet column.
- Opened from the FAT Survey card on Home or Profile. Answers autosave per farmer in localStorage.
- Values the diary already knows (area, yield, synthetic N from Urea/DAP, pesticide sprays, residue burning, irrigation method) are pre-filled and marked "From diary".
- Calculated columns follow the sample rows: agricultural area, total produced volume (area × yield × 1000), 1.09 (synthetic N ÷ total N), 1.10 (yield kg/ha × dry matter ÷ total N).
- Review → "Export for import" downloads the Regen A5.1 and CROP Survey rows as CSV in the sheet's column order (`src/config/fatColumns.ts`).

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
