import { ElectronAPI } from '@electron-toolkit/preload'
import type { PomodoroAPI } from './types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    pomodoro: PomodoroAPI
  }
}
