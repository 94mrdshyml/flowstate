import { useEffect, useState } from 'react'
import { getSessionHistory, type SessionHistory } from '../lib/stats'

const EMPTY_HISTORY: SessionHistory = { dayCounts: {}, hourCounts: new Array(24).fill(0) }

export function useSessionHistory(userId: string | undefined): SessionHistory {
  const [history, setHistory] = useState<SessionHistory>(EMPTY_HISTORY)

  useEffect(() => {
    if (!userId) return
    getSessionHistory(userId).then(setHistory)
    return window.pomodoro.onSessionComplete(() => {
      getSessionHistory(userId).then(setHistory)
    })
  }, [userId])

  return history
}
