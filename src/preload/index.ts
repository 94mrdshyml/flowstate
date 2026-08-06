import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  PomodoroAPI,
  SessionCompletePayload,
  TimerSnapshot,
  UpdateStatus,
  UpdaterAPI
} from './types'

// Custom APIs for renderer
const api = {}

const pomodoro: PomodoroAPI = {
  start: () => ipcRenderer.send('pomodoro:start'),
  pause: () => ipcRenderer.send('pomodoro:pause'),
  resume: () => ipcRenderer.send('pomodoro:resume'),
  skip: () => ipcRenderer.send('pomodoro:skip'),
  reset: () => ipcRenderer.send('pomodoro:reset'),
  updateSettings: (settings) => ipcRenderer.send('pomodoro:update-settings', settings),
  getState: () => ipcRenderer.invoke('pomodoro:get-state'),
  onTick: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, snapshot: TimerSnapshot): void =>
      callback(snapshot)
    ipcRenderer.on('pomodoro:tick', listener)
    return () => ipcRenderer.removeListener('pomodoro:tick', listener)
  },
  onSessionComplete: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: SessionCompletePayload): void =>
      callback(payload)
    ipcRenderer.on('pomodoro:session-complete', listener)
    return () => ipcRenderer.removeListener('pomodoro:session-complete', listener)
  }
}

const updater: UpdaterAPI = {
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  getStatus: () => ipcRenderer.invoke('app:get-update-status'),
  checkForUpdates: () => ipcRenderer.send('app:check-for-updates'),
  quitAndInstall: () => ipcRenderer.send('app:quit-and-install'),
  onStatus: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus): void =>
      callback(status)
    ipcRenderer.on('app:update-status', listener)
    return () => ipcRenderer.removeListener('app:update-status', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('pomodoro', pomodoro)
    contextBridge.exposeInMainWorld('updater', updater)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.pomodoro = pomodoro
  // @ts-ignore (define in dts)
  window.updater = updater
}
