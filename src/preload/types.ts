export type Phase = 'work' | 'short_break' | 'long_break'
export type TimerState = 'idle' | 'running' | 'paused'

export interface TimerSnapshot {
  phase: Phase
  state: TimerState
  remainingSeconds: number
  totalSeconds: number
  sessionsCompletedInCycle: number
  sessionsBeforeLongBreak: number
}

export interface SessionCompletePayload {
  phase: Phase
  nextPhase: Phase
  durationSeconds: number
  completedAt: string
  completed: boolean
}

export interface TimerSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsBeforeLongBreak: number
}

export interface PomodoroAPI {
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  reset: () => void
  updateSettings: (settings: TimerSettings) => void
  getState: () => Promise<TimerSnapshot>
  onTick: (callback: (snapshot: TimerSnapshot) => void) => () => void
  onSessionComplete: (callback: (payload: SessionCompletePayload) => void) => () => void
}

export type UpdateState =
  'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error'

export interface UpdateStatus {
  state: UpdateState
  version?: string
  error?: string
}

export interface UpdaterAPI {
  getAppVersion: () => Promise<string>
  getStatus: () => Promise<UpdateStatus>
  checkForUpdates: () => void
  quitAndInstall: () => void
  onStatus: (callback: (status: UpdateStatus) => void) => () => void
}
