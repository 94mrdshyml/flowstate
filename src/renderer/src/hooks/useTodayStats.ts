import { useEffect, useState } from 'react'
import { getTodayStats, type TodayStats } from '../lib/stats'

const EMPTY_STATS: TodayStats = { sessionsCompleted: 0, focusedMinutes: 0 }

export function useTodayStats(userId: string | undefined): TodayStats {
  const [stats, setStats] = useState<TodayStats>(EMPTY_STATS)

  useEffect(() => {
    if (!userId) return
    getTodayStats(userId).then(setStats)
    return window.pomodoro.onSessionComplete(() => {
      getTodayStats(userId).then(setStats)
    })
  }, [userId])

  return stats
}
