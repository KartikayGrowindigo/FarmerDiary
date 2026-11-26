# Production checklist

Tick each item before staff start using the app with real farmer data.

## 1. Supabase project
- [ ] Confirm which Supabase project production uses. The one in the local `.env` does not resolve (deleted or paused?). If it is paused, restore it; Supabase pauses free projects after a week without activity, which would stop field staff syncing, so use a paid plan for production.
- [ ] SQL Editor: run `supabase/migrations/20261126000000_security_hardening.sql` (after the two earlier migrations). Safe to re-run.
- [ ] Database → Advisors → Security Advisor: no errors remaining.
- [ ] Only run `supabase/seed.sql` in production if you want the (fictional) demo farmer there.

## 2. Supabase Auth (Authentication settings)
- [ ] "Allow new users to sign up" is **off**. Accounts are created by an admin.
- [ ] Email provider: "Confirm email" on, "Secure email change" on.
- [ ] Password policy: minimum length 10 or more, require letters and digits. Turn on leaked-password protection if your plan has it.
- [ ] URL Configuration: Site URL = the production URL. Redirect URLs = only the exact production (and staging) URLs, no `*` wildcards.
- [ ] Keep the default JWT expiry (1 hour).
- [ ] Use strong, unique passwords for admin accounts, and keep the number of admins small. Admins can see every farmer.

## 3. Microsoft sign-in (when IT sets it up)
- [ ] The Entra app registration is **single-tenant**. In Supabase, Azure Tenant URL = `https://login.microsoftonline.com/<grow-indigo-tenant-id>`, not `common` or `organizations`.
- [ ] Follow Supabase's Azure guide on verified emails (the `xms_edov` optional claim), so only verified company emails are accepted.
- [ ] Decide how first-time Microsoft users get accounts. With sign-up off, Supabase will not create new users from a Microsoft login. Either pre-create each user (same email), or turn sign-up on. If sign-up is on, the database still refuses non-company emails, and new users see nothing until assigned farmers.
- [ ] Have IT require MFA (Conditional Access) for this app. Admins should then sign in with Microsoft only.
- [ ] Set `VITE_AUTH_MICROSOFT=true` in Vercel and redeploy. Test sign-in on a phone.

## 4. Vercel
- [ ] Environment variables: only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key) and `VITE_AUTH_MICROSOFT`. **Never** put a service-role or secret key in a `VITE_` variable, because it would ship to every browser.
- [ ] After deploying this branch, run `curl -I https://<your-domain>`. You should see `content-security-policy`, `strict-transport-security`, `x-frame-options: DENY`. Then sign in, add an activity, export a CSV, and check the browser console for CSP errors.
- [ ] HTTPS only (Vercel default). Custom domain certificate valid.
- [ ] Vercel team: 2FA on for everyone with access. Remove people who don't need it.

## 5. GitHub
- [ ] **Make the repository private** (Settings → General → Danger zone → Change visibility). It is public today.
- [ ] If any committed documents are confidential: they remain in history and in any existing forks or clones even after making it private. Treat them as already disclosed, and decide whether to tell the people affected.
- [ ] Don't commit the untracked `*Regen AG5.1 Annual Crop Import Data*.xlsx` files if they contain farmer data.
- [ ] Protect `main`: require a pull request, and block force-push.
- [ ] Turn on Dependabot alerts and secret scanning.

## 6. Operations
- [ ] Offboarding: when staff leave, delete their user in Supabase Authentication → Users. Disabling their Microsoft account alone does not end an email/password login.
- [ ] Review `staff` (who is admin) and `farmer_access` monthly.
- [ ] Backups: enable daily backups or PITR (paid plans), and test a restore once.
- [ ] Phones: require a screen lock on phones used for the app. Farmer data with unsynced changes stays on the device.
