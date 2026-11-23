import React, { useEffect, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import PlotDetailScreen from './components/PlotDetailScreen'
import ActivityPicker from './components/ActivityPicker'
import ActivityForm from './components/ActivityForm'
import ImpactScreen from './components/ImpactScreen'
import ProfileScreen from './components/ProfileScreen'
import SurveyScreen from './components/SurveyScreen'
import BottomNav, { NavKey } from './components/BottomNav'
import { Backdrop } from './components/ui'
import store from './lib/store'
import { canUseAdminFeatures, useAuth } from './lib/auth'
import { Activity } from './types'
import { ModuleKey } from './config/modules'

// Admin-only screens load on demand so the farmer-facing app stays small.
const AssessmentsScreen = React.lazy(() => import('./components/assessment/AssessmentsScreen'))
const AssessmentScreen = React.lazy(() => import('./components/assessment/AssessmentScreen'))

// Entries made on different phones end up in one database, so IDs must never collide.
const genId = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 12)

type Screen =
  | { name: 'home' }
  | { name: 'plot'; plotId: string }
  | { name: 'picker'; plotId: string | null }
  | { name: 'form'; plotId: string | null; moduleKey: ModuleKey }
  | { name: 'impact' }
  | { name: 'profile' }
  | { name: 'survey'; from: 'home' | 'profile' }
  // Admin only (CFP-style crop assessments).
  | { name: 'assessments' }
  | { name: 'assessment'; id: string; view?: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const { user } = useAuth()
  const isAdmin = canUseAdminFeatures(user)

  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  const activeNav: NavKey =
    screen.name === 'impact' ? 'impact' :
    screen.name === 'profile' ? 'profile' :
    screen.name === 'picker' || screen.name === 'form' ? 'add' :
    screen.name === 'assessments' ? 'assessments' :
    'home'

  const showBottomNav = screen.name === 'home' || screen.name === 'impact' || screen.name === 'profile' || screen.name === 'assessments'

  function handleNav(key: NavKey) {
    if (key === 'home') setScreen({ name: 'home' })
    else if (key === 'impact') setScreen({ name: 'impact' })
    else if (key === 'profile') setScreen({ name: 'profile' })
    else if (key === 'add') setScreen({ name: 'picker', plotId: null })
    else if (key === 'assessments' && isAdmin) setScreen({ name: 'assessments' })
  }

  const adminOnly = (node: React.ReactNode) =>
    isAdmin ? <React.Suspense fallback={<Loading />}>{node}</React.Suspense> : <AdminOnly onBack={() => setScreen({ name: 'home' })} />

  function handleSaveActivity(moduleKey: ModuleKey, plotId: string | null, payload: Record<string, any>, applyAll: boolean, notes: string) {
    const farmer = store.getFarmers()[0]
    const allPlots = store.getPlots().filter(p => p.farmerId === farmer.id)
    const targetPlots = applyAll || !plotId ? allPlots : allPlots.filter(p => p.id === plotId)

    const base: Activity = {
      id: genId(),
      cropCycleId: '',
      module: moduleKey,
      date: payload.date,
      notes,
      payload
    }

    const cycleIds = targetPlots.map(p => store.getCurrentCropCycle(p.id)?.id).filter(Boolean) as string[]
    if (cycleIds.length > 1) {
      store.addActivityToMultiple(cycleIds, base)
    } else if (cycleIds.length === 1) {
      store.addActivity({ ...base, cropCycleId: cycleIds[0] })
    }

    setScreen(plotId ? { name: 'plot', plotId } : { name: 'home' })
  }

  return (
    <div className="min-h-screen min-h-dvh relative isolate">
      <Backdrop />
      <div key={screen.name + ('plotId' in screen ? screen.plotId : '')} className="anim-screen">
      {screen.name === 'home' && (
        <HomeScreen
          onOpenPlot={plotId => setScreen({ name: 'plot', plotId })}
          onOpenSurvey={() => setScreen({ name: 'survey', from: 'home' })}
        />
      )}

      {screen.name === 'plot' && (
        <PlotDetailScreen
          plotId={screen.plotId}
          onBack={() => setScreen({ name: 'home' })}
          onAdd={() => setScreen({ name: 'picker', plotId: screen.plotId })}
        />
      )}

      {screen.name === 'picker' && (
        <ActivityPicker
          plotId={screen.plotId}
          onBack={() => setScreen(screen.plotId ? { name: 'plot', plotId: screen.plotId } : { name: 'home' })}
          onSelect={moduleKey => setScreen({ name: 'form', plotId: screen.plotId, moduleKey })}
        />
      )}

      {screen.name === 'form' && (
        <ActivityForm
          moduleKey={screen.moduleKey}
          plotId={screen.plotId}
          plotCount={store.getPlots().filter(p => p.farmerId === store.getFarmers()[0].id).length}
          onBack={() => setScreen({ name: 'picker', plotId: screen.plotId })}
          onSave={(payload, applyAll, notes) => handleSaveActivity(screen.moduleKey, screen.plotId, payload, applyAll, notes)}
        />
      )}

      {screen.name === 'impact' && <ImpactScreen />}
      {screen.name === 'profile' && (
        <ProfileScreen
          onOpenSurvey={() => setScreen({ name: 'survey', from: 'profile' })}
          onOpenAssessments={isAdmin ? () => setScreen({ name: 'assessments' }) : undefined}
        />
      )}
      {screen.name === 'survey' && <SurveyScreen onBack={() => setScreen(screen.from === 'home' ? { name: 'home' } : { name: 'profile' })} />}
      {screen.name === 'assessments' && adminOnly(<AssessmentsScreen onOpen={(id, view) => setScreen({ name: 'assessment', id, view })} />)}
      {screen.name === 'assessment' && adminOnly(
        <AssessmentScreen
          assessmentId={screen.id}
          initialView={screen.view}
          onBack={() => setScreen({ name: 'assessments' })}
          onOpen={(id, view) => setScreen({ name: 'assessment', id, view })}
        />
      )}
      </div>

      {showBottomNav && <BottomNav active={activeNav} onNavigate={handleNav} showAssessments={isAdmin} />}
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <span className="material-symbols-outlined text-[40px] text-emerald-700 animate-spin">progress_activity</span>
    </div>
  )
}

function AdminOnly({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center px-margin-edge">
      <div className="card p-6 max-w-md text-center flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">lock</span>
        <h1 className="text-headline-sm font-extrabold">Admins only</h1>
        <p className="text-body-md text-on-surface-variant">Assessments are available to admin accounts.</p>
        <button onClick={onBack} className="h-12 px-6 rounded-2xl bg-emerald-700 text-white font-bold">Back to home</button>
      </div>
    </div>
  )
}
