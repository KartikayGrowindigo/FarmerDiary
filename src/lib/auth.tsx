import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import store from './store'
import { syncNow } from './sync'

// Sign-in goes through Supabase, because the database only shows a signed-in account the
// farmers assigned to it. For now accounts use email + password and are created by an admin
// (public sign-up is off). Microsoft sign-in can be switched on later in Supabase
// (Authentication → Providers → Azure) and here with VITE_AUTH_MICROSOFT=true.
// The database also refuses to create any account outside this domain.
export const ALLOWED_DOMAIN = 'growindigo.co.in'

export const authConfigured = !!supabase
export const microsoftEnabled = authConfigured && import.meta.env.VITE_AUTH_MICROSOFT === 'true'
// Temporary: lets anyone in with demo data until a database is connected.
export const devBypassAvailable = !authConfigured

// isAdmin mirrors staff.is_admin. It only decides what the app shows: the database's row-level security
// is what actually keeps non-admins out of admin data (e.g. assessments).
export type AuthUser = { id: string; name: string; email: string; isAdmin?: boolean }

/** Admin-only features (CFP assessments). Dev mode (no database configured) counts as admin so they can be tried locally. */
export function canUseAdminFeatures(user: AuthUser | null) {
  if (!user) return false
  if (user.id === '' && devBypassAvailable) return true
  return user.isAdmin === true
}

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut'; error?: string }
  // offline: opened without signal using the account last signed in on this phone; syncs once back online.
  | { status: 'signedIn'; user: AuthUser; offline?: boolean }

type AuthContextValue = {
  state: AuthState
  user: AuthUser | null
  signInWithPassword: (email: string, password: string) => Promise<void>
  signInWithMicrosoft: () => void
  signOut: () => void
  continueInDevMode: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const LAST_USER = 'kheti:lastUser'
const rejection = `Only @${ALLOWED_DOMAIN} accounts can sign in.`

export function isAllowedEmail(email: string) {
  return email.trim().toLowerCase().endsWith('@' + ALLOWED_DOMAIN)
}

function userOf(session: Session): AuthUser {
  const u = session.user
  const email = (u.email || '').toLowerCase()
  return { id: u.id, email, name: u.user_metadata?.full_name || u.user_metadata?.name || email }
}

function lastUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(LAST_USER) || 'null') } catch { return null }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  function accept(session: Session | null) {
    if (!session) return
    const fresh = userOf(session)
    if (!isAllowedEmail(fresh.email)) {
      supabase!.auth.signOut()
      return setState({ status: 'signedOut', error: `${fresh.email} is not allowed. ${rejection}` })
    }
    // Use the role known from last time until the database answers (and when offline).
    const cached = lastUser()
    const user: AuthUser = { ...fresh, isAdmin: cached?.id === fresh.id ? cached.isAdmin : undefined }
    localStorage.setItem(LAST_USER, JSON.stringify(user))
    store.setAccount(user.id)
    store.setAdmin(user.isAdmin === true)
    setState({ status: 'signedIn', user })
    loadRole(user)
  }

  function loadRole(user: AuthUser) {
    supabase!.from('staff').select('is_admin').eq('id', user.id).maybeSingle().then(({ data, error }) => {
      if (error || !data) return
      const isAdmin = data.is_admin === true
      if (isAdmin === user.isAdmin) return
      const next = { ...user, isAdmin }
      localStorage.setItem(LAST_USER, JSON.stringify(next))
      store.setAdmin(isAdmin)
      setState(s => (s.status === 'signedIn' && s.user.id === user.id ? { ...s, user: next } : s))
      if (isAdmin) syncNow() // fetch the admin-only data now that the role is known
    })
  }

  useEffect(() => {
    if (!supabase) return setState({ status: 'signedOut' })
    supabase.auth.getSession().then(({ data, error }) => {
      if (data.session) return accept(data.session)
      // No signal and the saved session couldn't be refreshed: keep working on this phone's copy.
      const cached = lastUser()
      const networkProblem = !navigator.onLine || /fetch|network/i.test(String(error?.message))
      if (cached && networkProblem) {
        store.setAccount(cached.id)
        store.setAdmin(cached.isAdmin === true)
        return setState({ status: 'signedIn', user: cached, offline: true })
      }
      setState({ status: 'signedOut', error: error?.message })
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') accept(session)
      // Session revoked or expired for good (e.g. the account was removed): back to the login page.
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(LAST_USER)
        store.setAccount(null)
        setState(s => (s.status === 'signedIn' ? { status: 'signedOut', error: 'Your session ended. Please sign in again.' } : s))
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    state,
    user: state.status === 'signedIn' ? state.user : null,
    async signInWithPassword(email, password) {
      if (!supabase) return
      if (!isAllowedEmail(email)) return setState({ status: 'signedOut', error: rejection })
      setState({ status: 'loading' })
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        const message =
          error.message === 'Invalid login credentials' ? 'Wrong email or password.' :
          !navigator.onLine || /fetch|network/i.test(error.message) ? 'Can\'t reach the server. Check your internet connection and try again.' :
          error.message
        return setState({ status: 'signedOut', error: message })
      }
      accept(data.session)
    },
    signInWithMicrosoft() {
      if (!supabase) return
      supabase.auth.signInWithOAuth({ provider: 'azure', options: { scopes: 'email', redirectTo: window.location.origin } })
        .then(({ error }) => { if (error) setState({ status: 'signedOut', error: error.message }) })
    },
    async signOut() {
      const waiting = store.pendingCount()
      if (waiting && !window.confirm(`${waiting} change${waiting === 1 ? ' hasn\'t' : 's haven\'t'} uploaded yet. They stay on this phone and upload when you sign in again. Sign out anyway?`)) return
      // Clears only this app's session; the phone's copy stays so offline work isn't lost.
      if (supabase) await supabase.auth.signOut({ scope: 'local' })
      localStorage.removeItem(LAST_USER)
      store.setAccount(null)
      setState({ status: 'signedOut' })
    },
    continueInDevMode() {
      if (!devBypassAvailable) return
      store.setAdmin(true)
      setState({ status: 'signedIn', user: { id: '', name: 'Dev mode', email: 'database not connected', isAdmin: true } })
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
