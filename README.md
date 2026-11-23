# ClearHarvest Farmer Diary (prototype)

Mobile-first React + Vite + TypeScript prototype for a farmer diary used by wheat farmers in Punjab.

Run

```bash
npm install
npm run dev
```

Database & sign-in (Supabase)
- Data lives in a Supabase (Postgres) database. Schema and access rules: `supabase/migrations/20261110000000_init.sql`; demo data: `supabase/seed.sql`.
- Each account has a row in `staff` (made automatically when the account is created). Staff see and edit only the farmers assigned to them in `farmer_access`; admins (`staff.is_admin`) see and manage everything. Only admins add farmers, plots and crop cycles or delete entries. The database refuses to create any account outside @growindigo.co.in.
- Offline first: the app reads and writes a copy on the phone (`src/lib/store.ts`) and `src/lib/sync.ts` uploads queued changes and downloads updates when there is signal (after each change, when signal returns, when the app is reopened, and every minute). Profile shows the sync status.
- Without `VITE_SUPABASE_URL` the app runs on local demo data with a "Continue in dev mode" button, as before.

Set up a Supabase project
1. Create a project at supabase.com (region: Mumbai). Keep the database password.
2. SQL Editor -> New query: paste and run `supabase/migrations/20261110000000_init.sql`, then `supabase/seed.sql` (once each).
3. Authentication -> Sign In / Providers: turn off "Allow new users to sign up" (keep Email enabled).
4. Authentication -> Users -> Add user -> Create new user: @growindigo.co.in email + password, tick "Auto Confirm User".
5. SQL Editor: make the first account admin and give it the demo farmer:
   ```sql
   update public.staff set is_admin = true where email = 'you@growindigo.co.in';
   insert into public.farmer_access (staff_id, farmer_id)
   select id, 'farmer-1' from public.staff where email = 'you@growindigo.co.in';
   ```
6. Project Settings -> API: copy the Project URL and the anon/publishable key into `.env` (see `.env.example`) and into the Vercel project's environment variables, then redeploy.

Adding staff and farmers (for now, in the Supabase dashboard)
- New staff: Authentication -> Users -> Add user (as in step 4), then assign farmers in Table Editor -> `farmer_access`.
- New farmers / plots / crop cycles: Table Editor -> `farmers`, `plots`, `crop_cycles` (any unique text `id`).

Microsoft sign-in (later)
- Needs an app registration in the Grow Indigo Entra tenant (IT has to create it): platform "Web", redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, plus a client secret.
- In Supabase: Authentication -> Providers -> Azure: paste the client ID and secret, Azure Tenant URL `https://login.microsoftonline.com/<tenant-id>`. Add the app's URL under Authentication -> URL Configuration.
- Set `VITE_AUTH_MICROSOFT=true` to show the "Sign in with Microsoft" button.

FAT survey (Regen Ag 5.1)
- Questions come from `Wheat Punjab - Regen AG5.1 Annual Crop Import Data.xlsx` and live in `src/config/fatSurvey.ts`, each tagged with its exact sheet column.
- Opened from the FAT Survey card on Home or Profile. Answers autosave per farmer on the phone and sync to the database.
- Values the diary already knows (area, yield, synthetic N from Urea/DAP, pesticide sprays, residue burning, irrigation method) are pre-filled and marked "From diary".
- Calculated columns follow the sample rows: agricultural area, total produced volume (area × yield × 1000), 1.09 (synthetic N ÷ total N), 1.10 (yield kg/ha × dry matter ÷ total N).
- Review → "Export for import" downloads the Regen A5.1 and CROP Survey rows as CSV in the sheet's column order (`src/config/fatColumns.ts`).

CFP assessments (admins only)
- Crop greenhouse-gas assessments structured like the Cool Farm Platform (cfp.coolfarm.org): Annual Crops, Paddy Rice and Potato pathways, 20 sections with the section list on the right (a drawer on phones), autosave, per-section optional User Notes, validation report, submit / duplicate / soft delete, JSON and CSV export. Opened from the "Assess" tab or the Profile card, shown only to admins.
- Setup: run `supabase/migrations/20261120000000_assessments.sql` in the SQL editor once. The tables are admin-only through row-level security. Until the migration is run, assessments stay on the device and the list shows a notice.
- Questions and dropdowns come from the official CFP 3.0 Annual Crops Data Input Table (`src/config/cfp/schema.ts`, `referenceData.ts`). Each question records its source and whether it is verified; see `docs/cfp-assessment/VERIFICATION_REPORT.md`. Run `npm run cfp:inventory` to regenerate `docs/cfp-assessment/FIELD_INVENTORY.md` after changing the schema.
- No emission formulas yet: `src/lib/assessment/calculation.ts` is where an engine plugs in (`registerCalculationEngine`). Until one is registered, results show "Calculation not configured", never numbers.
- Code: `src/lib/assessment/` (engine = rules and validation, lifecycle = status changes, prefill = mapping from farmer data, export), `src/components/assessment/` (screens). Tests: `npm test`.
- Dev mode (no database configured) counts as admin so the module can be tried locally.

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
- Dev mode is seeded from `src/data/seed.json` and kept in `localStorage` (`clearharvest:v1`); signed-in accounts keep their copy under `kheti:data:<user id>`.
- The store abstraction is in `src/lib/store.ts` to allow swapping for a backend later.

Critical UX: "Apply to all my plots" is implemented in the Add Activity flow — it writes the same activity to all current crop cycles for the farmer.
