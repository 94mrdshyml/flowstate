import { useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Greeting from './components/Greeting'
import InsightsDrawer from './components/InsightsDrawer'
import ProfileDrawer from './components/ProfileDrawer'
import QuoteBanner from './components/QuoteBanner'
import SettingsPanel from './components/SettingsPanel'
import Timer from './components/Timer'
import { BarChartIcon, GearIcon, UserIcon } from './components/icons'
import { useAuth } from './hooks/useAuth'
import { useQuotes } from './hooks/useQuotes'
import { useSessionHistory } from './hooks/useSessionHistory'
import { useTimer } from './hooks/useTimer'
import { useTodayStats } from './hooks/useTodayStats'
import { PHASE_THEME } from './lib/theme'
import { mergeSettings } from './lib/settings'
import type { TimerSettings } from '../../preload/types'

function App(): React.JSX.Element {
  const { user, loading, login, signup, logout, updatePrefs } = useAuth()
  const { snapshot, start, pause, resume, skip, reset } = useTimer(user?.$id)
  const quote = useQuotes()
  const todayStats = useTodayStats(user?.$id)
  const { dayCounts, hourCounts } = useSessionHistory(user?.$id)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    window.pomodoro.updateSettings(mergeSettings(user.prefs))
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center bg-fs-bg px-24 text-fs-text">
        <div>
          <div className="mb-4.5 font-heading text-2xl font-extrabold opacity-55">FLOWSTATE</div>
          <div className="flex gap-2">
            <div className="h-2 w-2 animate-[fsPulse_1.2s_ease-in-out_infinite] bg-fs-accent" />
            <div className="h-2 w-2 animate-[fsPulse_1.2s_ease-in-out_infinite] bg-fs-accent [animation-delay:0.2s]" />
            <div className="h-2 w-2 animate-[fsPulse_1.2s_ease-in-out_infinite] bg-fs-accent [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onLogin={login} onSignup={signup} />
  }

  const handleSaveSettings = async (settings: TimerSettings): Promise<void> => {
    await updatePrefs(settings)
    window.pomodoro.updateSettings(settings)
  }

  const theme = PHASE_THEME[snapshot?.phase ?? 'work']

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden ${theme.bg} ${theme.text}`}>
      <div className={`flex items-center justify-between border-b px-9 py-5.5 ${theme.divider}`}>
        <Greeting name={user.name.split(' ')[0]} theme={theme} />
        <div className="flex gap-2">
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Profile"
            className={`flex h-9 w-9 items-center justify-center border hover:opacity-70 ${theme.divider} ${theme.text}`}
          >
            <UserIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setInsightsOpen(true)}
            aria-label="Insights"
            className={`flex h-9 w-9 items-center justify-center border hover:opacity-70 ${theme.divider} ${theme.text}`}
          >
            <BarChartIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className={`flex h-9 w-9 items-center justify-center border hover:opacity-70 ${theme.divider} ${theme.text}`}
          >
            <GearIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {snapshot && (
        <Timer
          snapshot={snapshot}
          todaySessionsCompleted={todayStats.sessionsCompleted}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onSkip={skip}
          onReset={reset}
        />
      )}

      <QuoteBanner quote={quote} phase={snapshot?.phase ?? 'work'} theme={theme} />

      {settingsOpen && (
        <SettingsPanel
          settings={mergeSettings(user.prefs)}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {insightsOpen && (
        <InsightsDrawer
          sessionsCompleted={todayStats.sessionsCompleted}
          focusedMinutes={todayStats.focusedMinutes}
          dayCounts={dayCounts}
          hourCounts={hourCounts}
          onClose={() => setInsightsOpen(false)}
        />
      )}
      {profileOpen && (
        <ProfileDrawer
          firstName={user.name.split(' ')[0] ?? ''}
          lastName={user.name.split(' ').slice(1).join(' ')}
          email={user.email}
          onClose={() => setProfileOpen(false)}
          onLogout={logout}
        />
      )}
    </div>
  )
}

export default App
