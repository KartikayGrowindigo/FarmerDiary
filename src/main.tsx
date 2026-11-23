import React, { useEffect, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LoginScreen from './components/LoginScreen'
import { Backdrop } from './components/ui'
import { AuthProvider, useAuth } from './lib/auth'
import store from './lib/store'
import { startSync, syncNow, useSyncStatus } from './lib/sync'
import './index.css'

function AuthGate() {
  const { state, user } = useAuth()
  // Re-render whenever the local copy changes (e.g. new data downloaded).
  useSyncExternalStore(store.subscribe, store.getVersion)
  const accountId = user?.id || null
  useEffect(() => (accountId ? startSync() : undefined), [accountId])

  if (state.status !== 'signedIn') return <LoginScreen />
  if (store.getFarmers().length === 0) return <NoFarmers />
  return <App />
}

// Shown before the first download finishes, and when no farmers are assigned to this account.
function NoFarmers() {
  const { user, signOut } = useAuth()
  const sync = useSyncStatus()
  const loading = !sync.syncedAt && sync.state !== 'error' && sync.state !== 'offline'
  return (
    <div className="min-h-screen min-h-dvh relative isolate flex items-center justify-center px-margin-edge text-on-surface">
      <Backdrop />
      <div className="card w-full max-w-md p-6 flex flex-col items-center text-center gap-3">
        <span className={`material-symbols-outlined text-[40px] text-emerald-700 ${loading ? 'animate-spin' : ''}`}>
          {loading ? 'progress_activity' : sync.state === 'offline' ? 'cloud_off' : 'group_off'}
        </span>
        <h1 className="text-headline-sm font-extrabold">
          {loading ? 'Loading your farmers…' : sync.state === 'offline' ? 'No signal' : 'No farmers assigned yet'}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {loading
            ? 'Downloading the farmers assigned to you.'
            : sync.state === 'offline'
              ? 'Connect to the internet once to download your farmers. After that the app works offline.'
              : sync.state === 'error'
                ? `Could not load data: ${sync.error}`
                : `Ask an admin to assign farmers to ${user?.email}.`}
        </p>
        {!loading && (
          <div className="w-full flex flex-col gap-2 mt-2">
            <button onClick={() => syncNow()} className="w-full h-12 rounded-2xl bg-emerald-700 text-white font-bold active:scale-[0.97] transition-transform">
              Try again
            </button>
            <button onClick={signOut} className="w-full h-12 rounded-2xl border-2 border-stone-200 text-on-surface-variant font-bold active:scale-[0.97] transition-transform">
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </React.StrictMode>
)
