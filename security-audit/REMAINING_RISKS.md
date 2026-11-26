# Remaining risks

| Risk | Why it remains | Recommendation |
|---|---|---|
| Public GitHub repo with internal documents (F1) | Repo visibility is the owner's decision | Make private; treat what was published as already disclosed |
| Live Supabase configuration unverified (F12) | Project host doesn't resolve | Work through `PRODUCTION_CHECKLIST.md` §1–2 |
| Admin accounts are password-only until Microsoft sign-in + Entra MFA is set up | Needs IT | Strong unique passwords; few admins; switch admins to Microsoft + MFA |
| Session tokens and offline farmer data live in browser `localStorage` | Needed for offline use; any XSS or anyone with an unlocked phone can read them | CSP now limits XSS; phone screen locks; data is removed at sign-out when nothing is pending |
| Dev tooling advisories (Vite 4/esbuild dev server, Vitest 0.34) | Fix needs Vite 6+ and Vitest 3+ (major upgrades) | Upgrade in a separate change; meanwhile don't run `npm run dev` with untrusted sites open. Doesn't affect the deployed app |
| Staff can edit any entry of a farmer assigned to them, including ones another staffer made | By design (shared farmers) | `created_by` records the original author; ask if edits should be author-only |
| Survey answers are saved whole; two staff editing the same farmer's survey offline can overwrite each other | Data integrity, not access control | Consider per-question merge later |
| `style-src 'unsafe-inline'` in CSP | Tailwind/React inline styles | Low risk (no script execution) |
| No application-level audit log for diary edits (only `created_by`/`updated_at`) | Not built | Add an activity history table if edits need to be traceable |

## Assumptions
- Supabase Auth's built-in rate limiting and password hashing (bcrypt) are relied on; not load-tested.
- The test database copies Supabase's default grants and roles, but it is PGlite, not the hosted Supabase. Run the Security Advisor on the real project after applying the migration.

## Recommended next steps
1. Do the checklist, then have someone outside the team try the live site with a staff account: try to see other staff's farmers and become admin. The repo tests cover this, but the live configuration may differ.
2. If the app grows (more admins, farmers' own access, payments), get an independent penetration test.
