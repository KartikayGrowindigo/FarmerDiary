import React, { createContext, useContext, useEffect, useState } from 'react'
import { AccountInfo, PublicClientApplication } from '@azure/msal-browser'

// growindigo.co.in mail runs on Microsoft 365, so sign-in goes through Microsoft Entra ID.
// The authority is the Grow Indigo tenant, and every account is also checked for the email domain.
export const ALLOWED_DOMAIN = 'growindigo.co.in'

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined
const tenant = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) || ALLOWED_DOMAIN

export const authConfigured = !!clientId
// Temporary: lets anyone in until an Entra app is registered. Disappears once VITE_AZURE_CLIENT_ID is set.
export const devBypassAvailable = !authConfigured

const msal = authConfigured
  ? new PublicClientApplication({
      auth: {
        clientId: clientId!,
        authority: `https://login.microsoftonline.com/${tenant}`,
        redirectUri: window.location.origin
      },
      cache: { cacheLocation: 'localStorage' }
    })
  : null

export type AuthUser = { name: string; email: string }

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut'; error?: string }
  | { status: 'signedIn'; user: AuthUser }

type AuthContextValue = {
  state: AuthState
  user: AuthUser | null
  signIn: () => void
  signOut: () => void
  continueInDevMode: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function isAllowedEmail(email: string) {
  return email.trim().toLowerCase().endsWith('@' + ALLOWED_DOMAIN)
}

// Guests in the tenant have a #EXT# username, so prefer the real email claims.
function emailOf(account: AccountInfo) {
  const claims = (account.idTokenClaims || {}) as Record<string, any>
  return String(claims.email || claims.preferred_username || account.username || '')
}

const rejection = `Only @${ALLOWED_DOMAIN} accounts can sign in.`

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  async function accept(account: AccountInfo | null | undefined) {
    if (!account) return setState({ status: 'signedOut' })
    const email = emailOf(account)
    if (!isAllowedEmail(email)) {
      await msal!.clearCache({ account })
      return setState({ status: 'signedOut', error: `${email} is not allowed. ${rejection}` })
    }
    msal!.setActiveAccount(account)
    setState({ status: 'signedIn', user: { name: account.name || email, email } })
  }

  useEffect(() => {
    if (!msal) return setState({ status: 'signedOut' })
    ;(async () => {
      try {
        await msal.initialize()
        const result = await msal.handleRedirectPromise()
        await accept(result?.account ?? msal.getActiveAccount() ?? msal.getAllAccounts()[0])
      } catch (e: any) {
        setState({ status: 'signedOut', error: e?.errorMessage || e?.message || 'Sign-in failed.' })
      }
    })()
  }, [])

  const value: AuthContextValue = {
    state,
    user: state.status === 'signedIn' ? state.user : null,
    signIn() {
      if (!msal) return
      msal.loginRedirect({ scopes: ['openid', 'profile', 'email'], prompt: 'select_account', domainHint: ALLOWED_DOMAIN })
        .catch((e: any) => setState({ status: 'signedOut', error: e?.errorMessage || e?.message }))
    },
    async signOut() {
      // Clears this app's session only, so the user stays signed in to Outlook/Teams.
      if (msal) await msal.clearCache()
      setState({ status: 'signedOut' })
    },
    continueInDevMode() {
      if (devBypassAvailable) setState({ status: 'signedIn', user: { name: 'Dev mode', email: 'sign-in not configured' } })
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
