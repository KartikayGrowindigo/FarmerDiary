import React from 'react'
import { useAuth, authConfigured, devBypassAvailable, ALLOWED_DOMAIN } from '../lib/auth'
import { FieldScene, Logo } from './art'
import { Backdrop } from './ui'

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 21 21" className="w-5 h-5" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

export default function LoginScreen() {
  const { state, signIn, continueInDevMode } = useAuth()
  const loading = state.status === 'loading'
  const error = state.status === 'signedOut' ? state.error : undefined

  return (
    <div className="min-h-screen relative isolate text-on-surface">
      <Backdrop />
      <header className="relative overflow-hidden h-[300px]">
        <FieldScene className="absolute inset-0 w-full h-full" />
      </header>

      <main className="relative z-10 -mt-24 px-margin-edge pb-10">
        <div className="card anim-fade-up p-6 flex flex-col items-center text-center gap-4">
          <Logo className="w-16 h-16 drop-shadow-md" />
          <div>
            <h1 className="text-headline-md font-extrabold">Kheti Portal</h1>
            <p className="text-punjabi-subtext font-punjabi-subtext text-on-surface-variant">ਖੇਤੀ ਪੋਰਟਲ</p>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Sign in with your Grow Indigo Microsoft account.
          </p>

          {authConfigured && (
            <button
              onClick={signIn}
              disabled={loading}
              className="w-full h-touch-target-min rounded-2xl bg-white border-2 border-stone-200 shadow-sm flex items-center justify-center gap-3 text-body-lg font-extrabold active:scale-[0.97] transition-transform disabled:opacity-60"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <MicrosoftMark />}
              {loading ? 'Checking sign-in…' : 'Sign in with Microsoft'}
            </button>
          )}

          {!authConfigured && (
            <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 p-4 text-left text-body-md text-amber-900">
              Sign-in is not configured. Set <code className="font-bold">VITE_AZURE_CLIENT_ID</code> in <code className="font-bold">.env</code> (see README).
            </div>
          )}

          {devBypassAvailable && (
            <button onClick={continueInDevMode} className="w-full h-12 rounded-2xl border-2 border-dashed border-stone-300 text-on-surface-variant font-bold active:scale-[0.97] transition-transform">
              Continue in dev mode
            </button>
          )}

          {error && (
            <div role="alert" className="w-full rounded-2xl bg-rose-50 border border-rose-200 p-4 text-left text-body-md text-rose-800 flex gap-2">
              <span className="material-symbols-outlined shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <p className="text-label-caps font-label-caps text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            ONLY @{ALLOWED_DOMAIN.toUpperCase()} ACCOUNTS
          </p>
        </div>
      </main>
    </div>
  )
}
