import React, { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import PlotDetailScreen from './components/PlotDetailScreen'
import ActivityPicker from './components/ActivityPicker'
import ActivityForm from './components/ActivityForm'
import ImpactScreen from './components/ImpactScreen'
import ProfileScreen from './components/ProfileScreen'
import BottomNav, { NavKey } from './components/BottomNav'
import store from './lib/store'
import { Activity } from './types'
import { ModuleKey } from './config/modules'

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

type Screen =
  | { name: 'home' }
  | { name: 'plot'; plotId: string }
  | { name: 'picker'; plotId: string | null }
  | { name: 'form'; plotId: string | null; moduleKey: ModuleKey }
  | { name: 'impact' }
  | { name: 'profile' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  const activeNav: NavKey =
    screen.name === 'impact' ? 'impact' :
    screen.name === 'profile' ? 'profile' :
    screen.name === 'picker' || screen.name === 'form' ? 'add' :
    'home'

  const showBottomNav = screen.name === 'home' || screen.name === 'impact' || screen.name === 'profile'

  function handleNav(key: NavKey) {
    if (key === 'home') setScreen({ name: 'home' })
    else if (key === 'impact') setScreen({ name: 'impact' })
    else if (key === 'profile') setScreen({ name: 'profile' })
    else if (key === 'add') setScreen({ name: 'picker', plotId: null })
  }

  function handleSaveActivity(moduleKey: ModuleKey, plotId: string | null, payload: Record<string, any>, applyAll: boolean) {
    const farmer = store.getFarmers()[0]
    const allPlots = store.getPlots().filter(p => p.farmerId === farmer.id)
    const targetPlots = applyAll || !plotId ? allPlots : allPlots.filter(p => p.id === plotId)

    const base: Activity = {
      id: genId(),
      cropCycleId: '',
      module: moduleKey,
      date: payload.date,
      notes: '',
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
    <div className="min-h-screen w-full bg-surface-container flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen bg-background md:shadow-xl">
        {screen.name === 'home' && <HomeScreen onOpenPlot={plotId => setScreen({ name: 'plot', plotId })} />}

        {screen.name === 'plot' && (
          <PlotDetailScreen
            plotId={screen.plotId}
            onBack={() => setScreen({ name: 'home' })}
            onAdd={() => setScreen({ name: 'picker', plotId: screen.plotId })}
          />
        )}

        {screen.name === 'picker' && (
          <ActivityPicker
            onBack={() => setScreen(screen.plotId ? { name: 'plot', plotId: screen.plotId } : { name: 'home' })}
            onSelect={moduleKey => setScreen({ name: 'form', plotId: screen.plotId, moduleKey })}
          />
        )}

        {screen.name === 'form' && (
          <ActivityForm
            moduleKey={screen.moduleKey}
            plotCount={store.getPlots().filter(p => p.farmerId === store.getFarmers()[0].id).length}
            onBack={() => setScreen({ name: 'picker', plotId: screen.plotId })}
            onSave={(payload, applyAll) => handleSaveActivity(screen.moduleKey, screen.plotId, payload, applyAll)}
          />
        )}

        {screen.name === 'impact' && <ImpactScreen />}
        {screen.name === 'profile' && <ProfileScreen />}

        {showBottomNav && <BottomNav active={activeNav} onNavigate={handleNav} />}
      </div>
    </div>
  )
}
