# Incident response

Write down times and actions as you go. Don't delete logs or data until the incident is understood.

## Staff or admin account compromised (or phone lost)
1. Supabase → Authentication → Users → the user → **Delete user**, or ban them. This ends their sessions within the token lifetime (≤ 1 hour). If Microsoft sign-in is used, IT should also reset the Entra account and revoke its sessions.
2. If it was an admin: `select email, is_admin from public.staff;` remove any unexpected admins (`update public.staff set is_admin = false where …`), and check `farmer_access` for unexpected assignments.
3. Check what changed: `select * from public.activities where created_by = '<user id>' order by updated_at desc;` and `select * from public.assessment_events where actor = '<user id>';`. Also check Supabase → Logs → Auth for sign-ins from unusual places.
4. Re-create the account with a new password once it's safe.

## Key leaked
- **Publishable/anon key:** this key is public by design, so no emergency. Make sure RLS is in place (run the migrations).
- **Service-role / secret key or database password** (these bypass all access rules): rotate immediately. Project Settings → API keys → roll the secret key; Database → reset the password. Then review the Logs for use you don't recognise, and look for changed data (`updated_at` around the time of the leak).
- Remove the key from wherever it leaked (repo, chat, screenshot). A key that was ever pushed to a public repo counts as compromised even after deletion.

## Farmer data exposed
1. Close the hole (wrong policy, public file, shared export) and record what data, how many farmers, and for how long.
2. Tell Grow Indigo management and legal/compliance. Under India's DPDP Act 2023, personal data breaches may have to be reported to the Data Protection Board and the people affected. Let legal decide; don't assume either way.
3. If the exposure was through the public GitHub repo, make it private, and accept that clones may exist.

## Outage / sync not working
1. Check status.supabase.com and vercel-status.com.
2. Supabase dashboard: is the project paused, or over its quota?
3. Field staff can keep working offline. Changes stay on their phones and upload when the service is back, so tell them not to sign out (signing out with pending changes asks first).
4. A bad deploy: in Vercel, promote the previous deployment (Instant Rollback).
