# Security fixes (branch `security-hardening`)

| Finding | Change | Files | Compatibility |
|---|---|---|---|
| F3 | Revoke EXECUTE on the four access helpers from `public`/`anon`, grant to `authenticated`. `farmer_of_plot`/`farmer_of_cycle` now return NULL for farmers the caller can't access (policies behave the same, because `can_access_farmer(NULL)` is false for non-admins). | `supabase/migrations/20261126000000_security_hardening.sql` | No app change. Slightly more work per row in RLS checks; negligible at this data size. |
| F4 | `BEFORE UPDATE OF email ON auth.users` trigger refuses non-@growindigo.co.in addresses and keeps `staff.email` in step. | same migration | Changing a user to an outside email (dashboard or API) now fails with "Only @growindigo.co.in accounts…". |
| F7 | Replaced the `for all` assessments policy with select/insert/update policies (no delete). | same migration | The app never hard-deletes assessments. A real removal now needs the SQL editor. |
| F8 | `CHECK … NOT VALID` size limits: activity notes ≤ 10 000 chars, payload ≤ 256 KB; survey answers ≤ 2 MB; assessment inputs ≤ 2 MB, notes/prefill ≤ 512 KB; snapshots ≤ 4 MB. | same migration | `NOT VALID` = existing rows are not checked, so the migration can't fail on old data. Limits are far above normal use. |
| F5 | New shared `csvCell()` prefixes `'` to text starting with `= + - @ tab CR` unless it is a plain number (so `-5` stays `-5`). Also quotes `\r` in the survey export. | `src/lib/csv.ts`, `src/lib/survey.ts`, `src/lib/assessment/export.ts` | Only affects cells that begin with those characters and aren't numbers. |
| F6 | Security headers for every Vercel response: CSP (`script-src 'self'`, Supabase + Google Fonts allowed, `frame-ancestors 'none'`), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (camera/mic/geolocation/payment off), HSTS (2 years), COOP. | `vercel.json` | `style-src` keeps `'unsafe-inline'` (low risk; styles only). If you ever add a script from another domain, add it to `script-src`. |
| F9 | `flowType: 'pkce'` for Supabase Auth. | `src/lib/supabase.ts` | Password sign-in unchanged. Microsoft sign-in must return to the same browser it started in (normal). |
| F10 | Sign-out removes this account's local copy when nothing is pending (it downloads again at next sign-in); a download that finishes after sign-out/account switch is discarded. | `src/lib/store.ts`, `src/lib/auth.tsx`, `src/lib/sync.ts` | Pending (unsynced) work is still kept, as before. |
| F11 | `postcss` 8.4.23 → ^8.5.33 (fixes postcss + source-map-js advisories). | `package.json`, `package-lock.json` | Build verified. |
| Tests | Added `@electric-sql/pglite` (dev only) to run the real migrations on Postgres in tests. | `supabase/tests/rls.test.ts`, `src/lib/csv.test.ts` | Dev dependency only, not in the app bundle. |

## Rollback
- App changes: revert the commit(s) on this branch.
- Database: the migration only adds/replaces functions, a trigger, constraints and policies. To undo: `drop trigger on_auth_user_email_changed on auth.users;` drop the four `*_size` constraints; recreate `assessments_admin` (`for all … using (public.is_admin()) with check (public.is_admin())`); re-run the original function definitions from the init migration.
