import { useEffect, useState } from 'react'
import type { UpdateStatus } from '../../../preload/types'

export function useAppUpdate(): {
  appVersion: string
  status: UpdateStatus
  checkForUpdates: () => void
  installUpdate: () => void
} {
  const [appVersion, setAppVersion] = useState('')
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' })

  useEffect(() => {
    window.updater.getAppVersion().then(setAppVersion)
    window.updater.getStatus().then(setStatus)
    return window.updater.onStatus(setStatus)
  }, [])

  return {
    appVersion,
    status,
    checkForUpdates: () => window.updater.checkForUpdates(),
    installUpdate: () => window.updater.quitAndInstall()
  }
}
