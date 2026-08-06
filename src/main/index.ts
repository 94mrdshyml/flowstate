import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import trayIdleIcon from '../../resources/tray/tray-idle.png?asset'
import trayRunningIcon from '../../resources/tray/tray-running.png?asset'
import trayPausedIcon from '../../resources/tray/tray-paused.png?asset'
import { PomodoroTimer } from './timer'
import type {
  SessionCompletePayload,
  TimerSettings,
  TimerSnapshot,
  UpdateStatus
} from '../preload/types'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let updateReady = false
let updateStatus: UpdateStatus = { state: 'idle' }

const PHASE_LABEL: Record<TimerSnapshot['phase'], string> = {
  work: 'Work',
  short_break: 'Short break',
  long_break: 'Long break'
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const NOTIFICATION_COPY: Record<TimerSnapshot['phase'], { title: string; body: string }> = {
  work: { title: 'Time to focus', body: 'No distractions. You’ve got this.' },
  short_break: {
    title: 'Short break',
    body: 'Step away for a few minutes — stretch, breathe, look away from the screen.'
  },
  long_break: { title: 'Long break — nice work', body: 'A full cycle done. Take your time.' }
}

function notifyPhaseTransition(payload: SessionCompletePayload): void {
  if (!Notification.isSupported()) return
  const copy = NOTIFICATION_COPY[payload.nextPhase]
  new Notification({ title: copy.title, body: copy.body }).show()
}

const timer = new PomodoroTimer(
  (snapshot) => {
    mainWindow?.webContents.send('pomodoro:tick', snapshot)
    updateTray(snapshot)
  },
  (payload) => {
    mainWindow?.webContents.send('pomodoro:session-complete', payload)
    notifyPhaseTransition(payload)
  }
)

function buildTrayMenu(snapshot: TimerSnapshot): Menu {
  return Menu.buildFromTemplate([
    {
      label: mainWindow?.isVisible() ? 'Hide' : 'Show',
      click: () => {
        if (!mainWindow) return
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
        }
      }
    },
    {
      label:
        snapshot.state === 'running' ? 'Pause' : snapshot.state === 'paused' ? 'Resume' : 'Start',
      click: () => {
        if (snapshot.state === 'running') timer.pause()
        else if (snapshot.state === 'paused') timer.resume()
        else timer.start()
      }
    },
    { type: 'separator' },
    ...(updateReady
      ? [{ label: 'Restart & Update', click: () => autoUpdater.quitAndInstall() }]
      : []),
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
}

const TRAY_STATE_ICON: Record<TimerSnapshot['state'], string> = {
  idle: trayIdleIcon,
  running: trayRunningIcon,
  paused: trayPausedIcon
}

function updateTray(snapshot: TimerSnapshot): void {
  if (!tray) return
  const stateLabel = snapshot.state === 'idle' ? 'Ready' : formatTime(snapshot.remainingSeconds)
  tray.setImage(
    nativeImage.createFromPath(TRAY_STATE_ICON[snapshot.state]).resize({ width: 16, height: 16 })
  )
  tray.setToolTip(`Flowstate — ${PHASE_LABEL[snapshot.phase]} — ${stateLabel}`)
  tray.setContextMenu(buildTrayMenu(snapshot))
}

function setUpdateStatus(status: UpdateStatus): void {
  updateStatus = status
  mainWindow?.webContents.send('app:update-status', status)
}

function normalizeReleaseNotes(notes: unknown): string | undefined {
  if (!notes) return undefined
  if (typeof notes === 'string') return notes || undefined
  if (Array.isArray(notes)) {
    const joined = notes
      .map((entry: { note?: string | null }) => entry.note)
      .filter((note): note is string => Boolean(note))
      .join('\n\n')
    return joined || undefined
  }
  return undefined
}

function setupAutoUpdater(): void {
  if (!app.isPackaged) return

  autoUpdater.on('checking-for-update', () => setUpdateStatus({ state: 'checking' }))
  autoUpdater.on('update-available', (info) =>
    setUpdateStatus({
      state: 'available',
      version: info.version,
      releaseNotes: normalizeReleaseNotes(info.releaseNotes)
    })
  )
  autoUpdater.on('update-not-available', () => setUpdateStatus({ state: 'not-available' }))
  autoUpdater.on('download-progress', () =>
    setUpdateStatus({ ...updateStatus, state: 'downloading' })
  )
  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true
    setUpdateStatus({
      state: 'downloaded',
      version: info.version,
      releaseNotes: normalizeReleaseNotes(info.releaseNotes)
    })
    updateTray(timer.getSnapshot())
    if (Notification.isSupported()) {
      new Notification({
        title: 'Update ready',
        body: 'Restart Flowstate to install it.'
      }).show()
    }
  })
  autoUpdater.on('error', (error) => {
    setUpdateStatus({ state: 'error', error: error.message })
    console.error('Auto-update failed:', error)
  })

  autoUpdater.checkForUpdates()
  setInterval(() => autoUpdater.checkForUpdates(), 6 * 60 * 60 * 1000)
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)
  tray.on('click', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  updateTray(timer.getSnapshot())
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 960,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Tray-resident app: closing the window hides it instead of quitting.
  mainWindow.on('close', (event) => {
    if (isQuitting) return
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.flowstate.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('pomodoro:start', () => timer.start())
  ipcMain.on('pomodoro:pause', () => timer.pause())
  ipcMain.on('pomodoro:resume', () => timer.resume())
  ipcMain.on('pomodoro:skip', () => timer.skip())
  ipcMain.on('pomodoro:reset', () => timer.reset())
  ipcMain.on('pomodoro:update-settings', (_event, settings: TimerSettings) =>
    timer.updateSettings(settings)
  )
  ipcMain.handle('pomodoro:get-state', () => timer.getSnapshot())

  ipcMain.handle('app:get-version', () => app.getVersion())
  ipcMain.handle('app:get-update-status', () => updateStatus)
  ipcMain.on('app:check-for-updates', () => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates()
    } else {
      setUpdateStatus({ state: 'not-available' })
    }
  })
  ipcMain.on('app:quit-and-install', () => {
    if (updateReady) autoUpdater.quitAndInstall()
  })

  createWindow()
  createTray()
  setupAutoUpdater()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Tray-resident app: only the tray's explicit Quit action should exit the process.
app.on('before-quit', () => {
  isQuitting = true
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
