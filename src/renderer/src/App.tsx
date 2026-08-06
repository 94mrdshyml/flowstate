import { useEffect, useRef, useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Greeting from './components/Greeting'
import HomePanel from './components/HomePanel'
import InsightsPanel from './components/InsightsPanel'
import MusicBar from './components/MusicBar'
import ProfilePanel from './components/ProfilePanel'
import QuoteBanner from './components/QuoteBanner'
import SettingsPanel from './components/SettingsPanel'
import Timer from './components/Timer'
import { BarChartIcon, GearIcon, HomeIcon, UserIcon } from './components/icons'
import { useAppUpdate } from './hooks/useAppUpdate'
import { useAuth } from './hooks/useAuth'
import { useQuotes } from './hooks/useQuotes'
import { useSessionHistory } from './hooks/useSessionHistory'
import { useTasks } from './hooks/useTasks'
import { useTimer } from './hooks/useTimer'
import { useTodayStats } from './hooks/useTodayStats'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { PHASE_THEME } from './lib/theme'
import { mergeSettings } from './lib/settings'
import { MUSIC_PLAYLISTS } from './lib/musicPlaylists'
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
  const [playlistId, setPlaylistId] = useState(MUSIC_PLAYLISTS[0].id)
  const musicContainerRef = useRef<HTMLDivElement>(null)
  const music = useYouTubePlayer(musicContainerRef, playlistId)

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

      <MusicBar
        theme={theme}
        playlistId={playlistId}
        onPlaylistChange={setPlaylistId}
        containerRef={musicContainerRef}
        music={music}
      />

      {snapshot && (
        <div
          className={`grid min-h-0 flex-1 ${
            view !== 'home' || snapshot.phase !== 'long_break' ? 'grid-cols-[13fr_7fr]' : ''
          }`}
        >
          <Timer
            snapshot={snapshot}
            musicPlaying={music.isPlaying}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onSkip={skip}
            onReset={reset}
          />

          {(view !== 'home' || snapshot.phase !== 'long_break') && (
            <>
              {view === 'home' && (
                <HomePanel
                  snapshot={snapshot}
                  todaySessionsCompleted={todayStats.sessionsCompleted}
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onSetActiveTask={setActiveTaskId}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onRemoveTask={removeTask}
                />
              )}
              {view === 'profile' && (
                <ProfilePanel
                  firstName={user.name.split(' ')[0] ?? ''}
                  lastName={user.name.split(' ').slice(1).join(' ')}
                  email={user.email}
                  appVersion={update.appVersion}
                  updateStatus={update.status}
                  onCheckForUpdates={update.checkForUpdates}
                  onInstallUpdate={update.installUpdate}
                  onLogout={logout}
                />
              )}
              {view === 'insights' && (
                <InsightsPanel
                  sessionsCompleted={todayStats.sessionsCompleted}
                  focusedMinutes={todayStats.focusedMinutes}
                  dayCounts={dayCounts}
                  hourCounts={hourCounts}
                />
              )}
              {view === 'settings' && (
                <SettingsPanel settings={mergeSettings(user.prefs)} onSave={handleSaveSettings} />
              )}
            </>
          )}
        </div>
      )}

      <QuoteBanner quote={quote} phase={snapshot?.phase ?? 'work'} theme={theme} />
    </div>
  )
}

export default App
