import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LoginScreen from './components/LoginScreen'
import { AuthProvider, useAuth } from './lib/auth'
import './index.css'

function AuthGate() {
  const { state } = useAuth()
  return state.status === 'signedIn' ? <App /> : <LoginScreen />
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </React.StrictMode>
)
