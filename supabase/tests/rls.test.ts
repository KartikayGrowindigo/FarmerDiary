// Runs the real migrations on an in-memory Postgres (PGlite) set up like Supabase, then checks that
// row-level security keeps signed-out visitors, unassigned staff and non-admins where they belong.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const dir = join(__dirname, '..')
const migrations = readdirSync(join(dir, 'migrations')).sort().map(f => readFileSync(join(dir, 'migrations', f), 'utf8'))
const seed = readFileSync(join(dir, 'seed.sql'), 'utf8')

// The parts of a Supabase database the migrations rely on: auth.users, auth.uid() and the API roles
// with Supabase's default grants (every new table and function in public is granted to anon and authenticated).
const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
`

const ADMIN = '00000000-0000-0000-0000-00000000000a'
const STAFF_A = '00000000-0000-0000-0000-0000000000a1' // assigned to farmer-1
const STAFF_B = '00000000-0000-0000-0000-0000000000b1' // assigned to nobody

let db: PGlite

/** Run SQL as a signed-in account (or signed out when id is null), the way the Supabase API does. */
async function as(id: string | null, sql: string, params: any[] = []) {
  await db.exec(`set role ${id ? 'authenticated' : 'anon'}`)
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [id ?? ''])
  try {
    return await db.query<any>(sql, params)
  } finally {
    await db.exec('reset role')
  }
}

async function denied(p: Promise<unknown>) {
  await expect(p).rejects.toThrow(/permission denied|row-level security|violates/i)
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(SUPABASE_STUB)
  for (const m of migrations) await db.exec(m)
  await db.exec(seed)
  await db.query(`insert into auth.users (id, email) values ($1, 'admin@growindigo.co.in'), ($2, 'a@growindigo.co.in'), ($3, 'b@growindigo.co.in')`, [ADMIN, STAFF_A, STAFF_B])
  await db.query(`update public.staff set is_admin = true where id = $1`, [ADMIN])
  await db.query(`insert into public.farmer_access (staff_id, farmer_id) values ($1, 'farmer-1')`, [STAFF_A])
  await db.query(`insert into public.assessments (id, display_id, name, farmer_id, pathway, schema_version) values ('as-1', 'A-1', 'Test', 'farmer-1', 'annual_crops', 'v1')`)
}, 60_000)

describe('accounts', () => {
  it('refuses accounts outside the company domain', async () => {
    await expect(db.query(`insert into auth.users (email) values ('x@gmail.com')`)).rejects.toThrow(/growindigo/)
    await expect(db.query(`insert into auth.users (email) values ('x@growindigo.co.in.evil.com')`)).rejects.toThrow(/growindigo/)
  })

  it('refuses changing an account email to an outside address, and keeps staff.email in step', async () => {
    await expect(db.query(`update auth.users set email = 'a@gmail.com' where id = $1`, [STAFF_A])).rejects.toThrow(/growindigo/)
    await db.query(`update auth.users set email = 'a.new@growindigo.co.in' where id = $1`, [STAFF_A])
    const { rows } = await db.query<any>(`select email from public.staff where id = $1`, [STAFF_A])
    expect(rows[0].email).toBe('a.new@growindigo.co.in')
  })
})

describe('signed-out visitors (anon key only)', () => {
  it('cannot read or write any table', async () => {
    for (const t of ['staff', 'farmers', 'farmer_access', 'plots', 'crop_cycles', 'activities', 'surveys', 'assessments', 'assessment_events']) {
      await denied(as(null, `select * from public.${t}`))
    }
    await denied(as(null, `insert into public.farmers (id, name) values ('x', 'x')`))
  })

  it('cannot call the access helper functions', async () => {
    await denied(as(null, `select public.farmer_of_plot('de0cbc45')`))
    await denied(as(null, `select public.can_access_farmer('farmer-1')`))
    await denied(as(null, `select public.is_admin()`))
  })
})

describe('privilege escalation', () => {
  it('a staff member cannot make themselves admin', async () => {
    const r = await as(STAFF_B, `update public.staff set is_admin = true where id = $1`, [STAFF_B])
    expect(r.affectedRows).toBe(0)
    const { rows } = await db.query<any>(`select is_admin from public.staff where id = $1`, [STAFF_B])
    expect(rows[0].is_admin).toBe(false)
  })

  it('a staff member cannot create staff rows or assign farmers to themselves', async () => {
    await denied(as(STAFF_B, `insert into public.staff (id, email, is_admin) values (gen_random_uuid(), 'z@growindigo.co.in', true)`))
    await denied(as(STAFF_B, `insert into public.farmer_access (staff_id, farmer_id) values ($1, 'farmer-1')`, [STAFF_B]))
  })

  it('a staff member only sees their own staff row', async () => {
    const r = await as(STAFF_A, `select id from public.staff`)
    expect(r.rows.map(x => x.id)).toEqual([STAFF_A])
  })

  it('assigned staff cannot add or change farmers, plots or crop cycles', async () => {
    await denied(as(STAFF_A, `insert into public.farmers (id, name) values ('f-new', 'x')`))
    expect((await as(STAFF_A, `update public.farmers set name = 'x' where id = 'farmer-1'`)).affectedRows).toBe(0)
    expect((await as(STAFF_A, `update public.plots set acres = 99 where farmer_id = 'farmer-1'`)).affectedRows).toBe(0)
    expect((await as(STAFF_A, `delete from public.crop_cycles`)).affectedRows).toBe(0)
  })

  it('non-admins see no assessments and cannot write them', async () => {
    expect((await as(STAFF_A, `select * from public.assessments`)).rows).toHaveLength(0)
    await denied(as(STAFF_A, `insert into public.assessments (id, display_id, name, farmer_id, pathway, schema_version) values ('as-x', 'A-x', 'x', 'farmer-1', 'annual_crops', 'v1')`))
    await denied(as(STAFF_A, `insert into public.assessment_events (assessment_id, event) values ('as-1', 'forged')`))
  })
})

describe('farmer data belongs to assigned staff only', () => {
  it('unassigned staff see nothing', async () => {
    for (const t of ['farmers', 'plots', 'crop_cycles', 'activities', 'surveys']) {
      expect((await as(STAFF_B, `select * from public.${t}`)).rows).toHaveLength(0)
    }
  })

  it('unassigned staff cannot add, overwrite or delete diary entries', async () => {
    await denied(as(STAFF_B, `insert into public.activities (id, crop_cycle_id, module, date) values ('b-1', 'cc-de0cbc45-2024', 'Harvesting', '2025-04-01')`))
    // The sync upload uses upsert; reusing another farmer's entry ID must not overwrite it.
    await denied(as(STAFF_B, `insert into public.activities (id, crop_cycle_id, module, date) values ('a1', 'cc-de0cbc45-2024', 'x', '2025-01-01')
                              on conflict (id) do update set notes = 'hijacked'`))
    await denied(as(STAFF_B, `insert into public.surveys (farmer_id, answers) values ('farmer-1', '{}')`))
    expect((await as(STAFF_B, `delete from public.activities`)).affectedRows).toBe(0)
    const { rows } = await db.query<any>(`select notes from public.activities where id = 'a1'`)
    expect(rows[0].notes).toBe('Burned after harvest')
  })

  it('unassigned staff cannot learn which farmer a plot or crop cycle belongs to', async () => {
    expect((await as(STAFF_B, `select public.farmer_of_plot('de0cbc45') as f`)).rows[0].f).toBeNull()
    expect((await as(STAFF_B, `select public.farmer_of_cycle('cc-de0cbc45-2024') as f`)).rows[0].f).toBeNull()
  })

  it('assigned staff can read and add entries, and the author is taken from the session', async () => {
    expect((await as(STAFF_A, `select * from public.farmers`)).rows).toHaveLength(1)
    await as(STAFF_A, `insert into public.activities (id, crop_cycle_id, module, date, created_by) values ('a-own', 'cc-de0cbc45-2025', 'Harvesting', '2026-04-01', $1)`, [STAFF_B])
    const { rows } = await db.query<any>(`select created_by from public.activities where id = 'a-own'`)
    expect(rows[0].created_by).toBe(STAFF_A)
    await as(STAFF_A, `insert into public.surveys (farmer_id, answers) values ('farmer-1', '{"A01":"x"}') on conflict (farmer_id) do update set answers = excluded.answers`)
  })

  it('assigned staff cannot move an entry to a farmer they are not assigned', async () => {
    await db.exec(`insert into public.farmers (id, name) values ('farmer-2', 'Other');
                   insert into public.plots (id, farmer_id, acres) values ('p2', 'farmer-2', 1);
                   insert into public.crop_cycles (id, plot_id, crop, season, year) values ('cc-p2', 'p2', 'Wheat', 'Rabi', '2025-26')`)
    await denied(as(STAFF_A, `update public.activities set crop_cycle_id = 'cc-p2' where id = 'a-own'`))
  })

  it('only admins delete diary entries', async () => {
    expect((await as(STAFF_A, `delete from public.activities where id = 'a-own'`)).affectedRows).toBe(0)
    expect((await as(ADMIN, `delete from public.activities where id = 'a-own'`)).affectedRows).toBe(1)
  })

  it('rejects oversized entries', async () => {
    const big = JSON.stringify({ x: 'a'.repeat(300_000) })
    await expect(as(STAFF_A, `insert into public.activities (id, crop_cycle_id, module, date, payload) values ('a-big', 'cc-de0cbc45-2025', 'Harvesting', '2026-04-01', $1::jsonb)`, [big]))
      .rejects.toThrow(/activities_size/)
  })
})

describe('admins', () => {
  it('see everything and manage assignments', async () => {
    expect((await as(ADMIN, `select * from public.farmers`)).rows.length).toBeGreaterThanOrEqual(2)
    await as(ADMIN, `insert into public.farmer_access (staff_id, farmer_id) values ($1, 'farmer-2')`, [STAFF_B])
    expect((await as(STAFF_B, `select * from public.farmers`)).rows).toHaveLength(1)
  })

  it('work with assessments but cannot hard-delete them (soft delete keeps the audit trail)', async () => {
    expect((await as(ADMIN, `select * from public.assessments`)).rows).toHaveLength(1)
    expect((await as(ADMIN, `update public.assessments set deleted_at = now() where id = 'as-1'`)).affectedRows).toBe(1)
    expect((await as(ADMIN, `delete from public.assessments where id = 'as-1'`)).affectedRows).toBe(0)
    const events = await as(ADMIN, `select event from public.assessment_events where assessment_id = 'as-1' order by id`)
    expect(events.rows.map(e => e.event)).toEqual(['created', 'deleted'])
  })

  it('cannot edit submitted snapshots', async () => {
    await as(ADMIN, `insert into public.assessment_submissions (id, assessment_id, revision, schema_version, snapshot) values ('s-1', 'as-1', 1, 'v1', '{}')`)
    // No update policy, so nothing matches; the freeze trigger backs this up for the table owner.
    expect((await as(ADMIN, `update public.assessment_submissions set snapshot = '{"x":1}' where id = 's-1'`)).affectedRows).toBe(0)
    await expect(db.query(`update public.assessment_submissions set snapshot = '{"x":1}' where id = 's-1'`)).rejects.toThrow(/cannot be changed/)
  })
})
