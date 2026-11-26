# Security test results (2026-11-26)

Run with `npm test` (from a path with an upper-case drive letter on Windows, e.g. `C:\Users\…`; Vitest 0.34 finds no tests when the path starts with `c:`). Result: **3 files, 60 tests, all passed.** Type check (`tsc --noEmit`) and production build pass.

## Database access rules – `supabase/tests/rls.test.ts` (real migrations + seed on PGlite Postgres, with Supabase's default grants and roles)

| Scenario | Result |
|---|---|
| Account outside @growindigo.co.in cannot be created (incl. `x@growindigo.co.in.evil.com`) | PASS |
| Account email cannot be changed to an outside address; `staff.email` follows a valid change | PASS |
| Signed-out visitor cannot read any of 9 tables or insert | PASS |
| Signed-out visitor cannot call `farmer_of_plot`, `can_access_farmer`, `is_admin` | PASS |
| Staff cannot set their own `is_admin` | PASS |
| Staff cannot insert `staff` rows or assign themselves farmers | PASS |
| Staff see only their own `staff` row | PASS |
| Assigned staff cannot add/change farmers, plots, crop cycles | PASS |
| Non-admins see no assessments, cannot create them or forge audit events | PASS |
| Unassigned staff see no farmers/plots/cycles/activities/surveys | PASS |
| Unassigned staff cannot insert, upsert-overwrite (reused ID), survey-write or delete another farmer's data | PASS |
| Unassigned staff get NULL from `farmer_of_plot` / `farmer_of_cycle` | PASS |
| Assigned staff can read and add entries; `created_by` is taken from the session even if a different one is sent | PASS |
| Assigned staff cannot move an entry to an unassigned farmer | PASS |
| Only admins delete diary entries | PASS |
| Oversized entry (300 KB payload) rejected | PASS |
| Admins see everything and manage assignments | PASS |
| Admins soft-delete assessments; hard delete affects 0 rows; audit trail = created, deleted | PASS |
| Submitted snapshots cannot be edited (RLS, and trigger for the table owner) | PASS |

## CSV export – `src/lib/csv.test.ts`

| Scenario | Result |
|---|---|
| `=HYPERLINK(…)`, `+cmd|`, `-2+3`, `@SUM(A1)`, tab-prefixed text are neutralised | PASS |
| Numbers/dates/plain text unchanged (`-5`, `+2.5`, `-1.5e3`, `2025-04-01`) | PASS |
| Commas, quotes, CR/LF quoted correctly | PASS |

## Browser checks (production build served with the `vercel.json` headers, headless Chrome via DevTools protocol)

| Scenario | Result |
|---|---|
| Control: an inline `<script>` is blocked by the CSP | PASS (blocked, violation logged) |
| Login page renders with no CSP violations or JS errors | PASS |
| Dev-mode build: Home, Impact, Assessments, Profile, CFT & Regen Survey, Add Activity render with no CSP violations or JS errors | PASS |
| Built `index.html` has no inline scripts; no source maps emitted | PASS |

## Scans

| Scan | Result |
|---|---|
| `npm audit --omit=dev` (what ships to users) | 0 vulnerabilities |
| `npm audit` (incl. dev tools) | 5 remain: esbuild/vite dev server, tinypool/vitest – dev machines only; fixes need major upgrades |
| Git history for Supabase service keys, JWTs, `sb_secret_`, passwords | None found |
| `.env` ever committed | No (only `.env.example`) |
| Key in local `.env` | Publishable key (correct); no service-role key |
| Production bundle contains demo farmer details | Present, but confirmed fictional (F2) |

## NOT TESTED

| Item | Why |
|---|---|
| Live Supabase project settings (sign-up disabled, email confirmation, password policy, redirect URLs) and whether the migrations are applied there | Project host in `.env` does not resolve in DNS |
| Microsoft sign-in end to end (PKCE redirect) | Azure provider not configured yet |
| Live Vercel response headers | Not deployed from this branch; check after deploy (see checklist) |
| Sign-out clearing local data (F10) | Manual check only; no automated browser test for it |
| Supabase Auth rate limits | Provider-managed; not load-tested |
