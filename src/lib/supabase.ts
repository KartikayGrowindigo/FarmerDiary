import { createClient } from '@supabase/supabase-js'

// Both values are public (the anon/publishable key only allows what the database's row-level
// security policies allow), so they are safe to ship in the app.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null
