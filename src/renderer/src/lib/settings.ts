import type { TimerSettings } from '../../../preload/types'

export type AppPrefs = Partial<TimerSettings>

export const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4
}

export function mergeSettings(prefs: AppPrefs | undefined): TimerSettings {
  return { ...DEFAULT_SETTINGS, ...prefs }
}
