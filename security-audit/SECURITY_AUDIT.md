# Kheti Portal – Security Audit (2026-11-26)

Branch: `security-hardening`. Scope: this repository and read-only checks against the configured Supabase project. The checklist used was written for a food-ordering site; items that do not exist in this app (payments, Razorpay, webhooks, GPS tracking, file uploads, multi-tenant, real-time channels) are marked not applicable.

## Architecture

| Part | What it is |
|---|---|
| Frontend | React 18 + Vite 4 + TypeScript, static SPA, offline-first (data copy in `localStorage`) |
| Hosting | Vercel (static files only, no server code) |
| Backend | Supabase: Postgres with row-level security (RLS), Supabase Auth; no Edge Functions, Storage, Realtime or RPC calls from the app |
| Sign-in | Email + password (accounts created by an admin; sign-up meant to be off). Microsoft (Azure) via Supabase OAuth, pending IT setup |
| Secrets in app | Only the Supabase URL and publishable/anon key (public by design). Verified: local `.env` holds a *publishable* key, no service-role key; no secrets in git history |

## Trust boundaries and attack surface

- The browser is untrusted. Anyone can take the public key from the JS bundle and call the Supabase REST API (`/rest/v1/<table>`, `/rest/v1/rpc/<function>`) and Auth API directly. **All authorisation is therefore in Postgres RLS**, which is where this audit concentrated.
- Roles: signed-out (`anon`) → nothing; staff → only farmers assigned in `farmer_access`; admin (`staff.is_admin`) → everything. Admin can only be granted by someone with database/dashboard access.
- Exports (CSV/JSON) leave the app and are opened in Excel/Sheets.
- The phone/browser holds a copy of the assigned farmers' data for offline use.

## Threat model (relevant attackers)

Anonymous internet user with the public key; an outsider trying to create an account; a staff member trying to see other staff's farmers or become admin; a stolen/lost phone; a compromised admin password; a malicious value typed into a form that reaches someone else's spreadsheet.

## Findings

| ID | Severity | Finding | Location | Status |
|---|---|---|---|---|
| F1 | High | **GitHub repository is public** (`KartikayGrowindigo/FarmerDiary`, readable without login). It contains internal documents (`Farmer dairy.pdf`, `CFT comments.xlsx`, questionnaire workbook, `pg1`–`pg5` HTML pages) and the demo farmer's details in seed data (confirmed fictional). | repo | **Open – owner decision** |
| F2 | Info | Demo farmer (name, phone) is compiled into every production JS bundle and readable without signing in. Owner confirmed the farmer is made up, so no personal data is exposed. | `src/data/seed.json`, `src/lib/store.ts:1`, `supabase/seed.sql` | Accepted (fictional data) |
| F3 | Medium | SECURITY DEFINER helper functions (`is_admin`, `can_access_farmer`, `farmer_of_plot`, `farmer_of_cycle`) were executable by signed-out visitors via `/rest/v1/rpc/…`; `farmer_of_plot`/`farmer_of_cycle` bypass RLS and reveal which farmer owns any plot/crop cycle to anyone holding the public key. | `20261110000000_init.sql:144-163` | Fixed (migration) |
| F4 | Medium | The @growindigo.co.in rule was enforced only when an account is created; an account's email could later be changed to any address (e.g. a personal Gmail), so a departed employee could keep a working account tied to a personal mailbox. | `auth.users` | Fixed (trigger) |
| F5 | Medium | CSV formula injection: text typed into the app (names, notes, answers) starting with `=`, `+`, `-`, `@` ran as a formula when the exported CSV was opened in Excel/Sheets. | `src/lib/survey.ts`, `src/lib/assessment/export.ts` | Fixed |
| F6 | Medium | No HTTP security headers: no Content-Security-Policy (session tokens live in `localStorage`, so any XSS = account takeover), no clickjacking protection, no HSTS. | hosting | Fixed (`vercel.json`) |
| F7 | Low | Admins could hard-delete assessments through the API, which cascades and erases the submission history and audit events. The app itself only soft-deletes. | `20261120000000_assessments.sql:377` | Fixed |
| F8 | Low | No size limits on free-text/JSON columns; one account could store very large rows. | activities, surveys, assessments | Fixed (new/changed rows) |
| F9 | Low | Supabase client used the implicit OAuth flow (tokens in the URL fragment). | `src/lib/supabase.ts` | Fixed (PKCE) |
| F10 | Low | After sign-out, the farmers' data stayed in the browser even when nothing was waiting to upload; a download finishing after sign-out could also write it back. | `src/lib/auth.tsx`, `src/lib/sync.ts` | Fixed |
| F11 | Low (dev machines only) | Vulnerable dev tooling: Vite 4/esbuild dev server (other websites can read dev-server responses while `npm run dev` runs), Vitest 0.34/tinypool. **Production dependencies: 0 known vulnerabilities.** | `package.json` | Partly fixed (postcss, source-map-js); rest open |
| F12 | Info | The Supabase project URL in the local `.env` does not resolve in DNS (project deleted/paused, or production uses another project). Live dashboard settings could not be checked. | `.env` | **Open – check** |

### Verified as correct (no change needed)
- RLS is enabled on every table; `anon` has all table privileges revoked.
- Staff cannot set `is_admin`, insert `staff` rows, assign themselves farmers, or see other staff rows.
- Unassigned staff cannot read, insert, overwrite (including via the sync upsert with a reused ID), or delete another farmer's entries.
- `created_by` / `updated_by` / `submitted_by` are stamped from the session, not from the app.
- Submitted assessment snapshots cannot be edited; audit events cannot be forged.
- The admin flag in the app (`localStorage`) only changes what is shown; tampering with it gives no data because RLS decides.
- No `dangerouslySetInnerHTML`, `eval`, or raw HTML rendering; React escapes all output.
- No source maps in the production build; no inline scripts in `index.html`.

## Not applicable to this app
Payments/Razorpay, webhooks, refunds, coupons, GPS/location tracking (the browser geolocation API is not used, and is now disabled by Permissions-Policy), file uploads, WebSockets/Realtime, multi-tenancy, server-side URL fetching, server code (there is none).
