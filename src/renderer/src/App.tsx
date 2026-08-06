import { useEffect, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Greeting from './components/Greeting'
import InsightsPage from './components/InsightsPage'
import ProfilePage from './components/ProfilePage'
import QuoteBanner from './components/QuoteBanner'
import SettingsPage from './components/SettingsPage'
import Timer from './components/Timer'
import { BarChartIcon, GearIcon, HomeIcon, UserIcon } from './components/icons'
import { useAppUpdate } from './hooks/useAppUpdate'
import { useAuth } from './hooks/useAuth'
import { useQuotes } from './hooks/useQuotes'
import { useSessionHistory } from './hooks/useSessionHistory'
import { useTasks } from './hooks/useTasks'
import { useTimer } from './hooks/useTimer'
import { useTodayStats } from './hooks/useTodayStats'
import { PHASE_THEME } from './lib/theme'
import { mergeSettings } from './lib/settings'
import type { TimerSettings } from '../../preload/types'

type View = 'home' | 'profile' | 'insights' | 'settings'

function App(): React.JSX.Element {
  const { user, loading, login, signup, logout, updatePrefs } = useAuth()
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask } = useTasks(
    user?.$id
  )
  const activeTask = tasks.find((t) => t.$id === activeTaskId)
  const { snapshot, start, pause, resume, skip, reset } = useTimer(
    user?.$id,
    activeTask ? { id: activeTask.$id, title: activeTask.title } : null
  )
  const quote = useQuotes()
  const todayStats = useTodayStats(user?.$id)
  const { dayCounts, hourCounts } = useSessionHistory(user?.$id)
  const update = useAppUpdate()
  const [view, setView] = useState<View>('home')

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

  const navButtonClass = (active: boolean): string =>
    `flex h-9 w-9 items-center justify-center border hover:opacity-70 ${
      active
        ? `${theme.ring} ${theme.ringText} border-transparent`
        : `${theme.divider} ${theme.text}`
    }`

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden ${theme.bg} ${theme.text}`}>
      <div className={`flex items-center justify-between border-b px-9 py-5.5 ${theme.divider}`}>
        <Greeting name={user.name.split(' ')[0]} theme={theme} />
        <div className="flex gap-2">
          <button
            onClick={() => setView('home')}
            aria-label="Home"
            className={navButtonClass(view === 'home')}
          >
            <HomeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('profile')}
            aria-label="Profile"
            className={navButtonClass(view === 'profile')}
          >
            <UserIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('insights')}
            aria-label="Insights"
            className={navButtonClass(view === 'insights')}
          >
            <BarChartIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('settings')}
            aria-label="Settings"
            className={navButtonClass(view === 'settings')}
          >
            <GearIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'home' && (
        <>
          {snapshot && (
            <Timer
              snapshot={snapshot}
              todaySessionsCompleted={todayStats.sessionsCompleted}
              onStart={start}
              onPause={pause}
              onResume={resume}
              onSkip={skip}
              onReset={reset}
              tasks={tasks}
              activeTaskId={activeTaskId}
              onSetActiveTask={setActiveTaskId}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onRemoveTask={removeTask}
            />
          )}
          <QuoteBanner quote={quote} phase={snapshot?.phase ?? 'work'} theme={theme} />
        </>
      )}

      {view === 'profile' && (
        <ProfilePage
          firstName={user.name.split(' ')[0] ?? ''}
          lastName={user.name.split(' ').slice(1).join(' ')}
          email={user.email}
          appVersion={update.appVersion}
          updateStatus={update.status}
          onCheckForUpdates={update.checkForUpdates}
          onInstallUpdate={update.installUpdate}
          onBack={() => setView('home')}
          onLogout={logout}
        />
      )}
      {view === 'insights' && (
        <InsightsPage
          sessionsCompleted={todayStats.sessionsCompleted}
          focusedMinutes={todayStats.focusedMinutes}
          dayCounts={dayCounts}
          hourCounts={hourCounts}
          onBack={() => setView('home')}
        />
      )}
      {view === 'settings' && (
        <SettingsPage
          settings={mergeSettings(user.prefs)}
          onSave={handleSaveSettings}
          onBack={() => setView('home')}
        />
      )}
    </div>
  )
}

export default App
