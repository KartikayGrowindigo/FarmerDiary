import { createClient } from '@supabase/supabase-js'

// Both values are public (the anon/publishable key only allows what the database's row-level
// security policies allow), so they are safe to ship in the app.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && anonKey
  ? createClient(url, anonKey, // PKCE: Microsoft sign-in returns a one-time code instead of putting the tokens in the page address.
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } })
  : null
