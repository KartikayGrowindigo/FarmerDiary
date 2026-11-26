-- Security hardening. Run after 20261110000000_init.sql and 20261120000000_assessments.sql.
-- Safe to run more than once. Changes no existing data.
--
--   1. The access helper functions can no longer be called by signed-out visitors through the API,
--      and farmer_of_plot / farmer_of_cycle only answer for farmers the caller can already see.
--   2. An account's email can't be changed to an address outside @growindigo.co.in
--      (sign-up already refuses them; this closes the email-change route). staff.email follows changes.
--   3. Size limits on free-text and JSON columns, so one account can't fill the database.
--   4. Assessments can no longer be hard-deleted (the app only soft-deletes), so their audit trail stays.

-- ---------- 1. Helper functions ----------

create or replace function public.farmer_of_plot(pid text) returns text
language sql stable security definer set search_path = '' as $$
  select p.farmer_id from public.plots p where p.id = pid and public.can_access_farmer(p.farmer_id)
$$;

create or replace function public.farmer_of_cycle(cid text) returns text
language sql stable security definer set search_path = '' as $$
  select p.farmer_id from public.crop_cycles c join public.plots p on p.id = c.plot_id
  where c.id = cid and public.can_access_farmer(p.farmer_id)
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.can_access_farmer(text) from public, anon;
revoke execute on function public.farmer_of_plot(text) from public, anon;
revoke execute on function public.farmer_of_cycle(text) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_farmer(text) to authenticated;
grant execute on function public.farmer_of_plot(text) to authenticated;
grant execute on function public.farmer_of_cycle(text) to authenticated;

-- ---------- 2. Email changes stay inside the domain ----------

create or replace function public.guard_user_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is null or lower(new.email) not like '%@growindigo.co.in' then
    raise exception 'Only @growindigo.co.in accounts can use Kheti Portal';
  end if;
  update public.staff set email = lower(new.email) where id = new.id;
  return new;
end $$;
revoke execute on function public.guard_user_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  before update of email on auth.users
  for each row when (new.email is distinct from old.email)
  execute function public.guard_user_email();

-- ---------- 3. Size limits (checked on new and changed rows; existing rows are left alone) ----------

alter table public.activities drop constraint if exists activities_size;
alter table public.activities add constraint activities_size check (
  length(module) <= 200 and length(coalesce(notes, '')) <= 10000 and octet_length(payload::text) <= 262144
) not valid;

alter table public.surveys drop constraint if exists surveys_size;
alter table public.surveys add constraint surveys_size check (octet_length(answers::text) <= 2097152) not valid;

alter table public.assessments drop constraint if exists assessments_size;
alter table public.assessments add constraint assessments_size check (
  length(name) <= 500
  and octet_length(inputs::text) <= 2097152
  and octet_length(notes::text) <= 524288
  and octet_length(prefill::text) <= 524288
  and octet_length(section_status::text) <= 65536
) not valid;

alter table public.assessment_submissions drop constraint if exists assessment_submissions_size;
alter table public.assessment_submissions add constraint assessment_submissions_size check (octet_length(snapshot::text) <= 4194304) not valid;

-- ---------- 4. Assessments: soft delete only ----------

drop policy if exists assessments_admin on public.assessments;
drop policy if exists assessments_admin_read on public.assessments;
drop policy if exists assessments_admin_insert on public.assessments;
drop policy if exists assessments_admin_update on public.assessments;
create policy assessments_admin_read on public.assessments for select to authenticated
  using (public.is_admin());
create policy assessments_admin_insert on public.assessments for insert to authenticated
  with check (public.is_admin());
create policy assessments_admin_update on public.assessments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
