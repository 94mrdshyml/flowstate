import { Query } from 'appwrite'
import { DATABASE_ID, SESSIONS_TABLE_ID, tablesDB } from '../appwrite'
import type { SessionRow } from './sessions'

export interface TodayStats {
  sessionsCompleted: number
  focusedMinutes: number
}

export async function getTodayStats(userId: string): Promise<TodayStats> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  try {
    const result = await tablesDB.listRows<SessionRow>({
      databaseId: DATABASE_ID,
      tableId: SESSIONS_TABLE_ID,
      queries: [
        Query.equal('userId', userId),
        Query.equal('phase', 'work'),
        Query.equal('completed', true),
        Query.greaterThanEqual('startedAt', startOfDay.toISOString()),
        Query.limit(100)
      ]
    })
    const focusedSeconds = result.rows.reduce((sum, row) => sum + row.durationSeconds, 0)
    return {
      sessionsCompleted: result.rows.length,
      focusedMinutes: Math.round(focusedSeconds / 60)
    }
  } catch (error) {
    console.error('Failed to load today stats:', error)
    return { sessionsCompleted: 0, focusedMinutes: 0 }
  }
}

const PAGE_SIZE = 100

export interface SessionHistory {
  dayCounts: Record<string, number>
  hourCounts: number[]
}

export async function getSessionHistory(userId: string): Promise<SessionHistory> {
  const oneYearAgo = new Date()
  oneYearAgo.setDate(oneYearAgo.getDate() - 365)
  oneYearAgo.setHours(0, 0, 0, 0)

  const dayCounts: Record<string, number> = {}
  const hourCounts = new Array(24).fill(0) as number[]

  try {
    let cursor: string | undefined
    let hasMore = true

    while (hasMore) {
      const queries = [
        Query.equal('userId', userId),
        Query.equal('phase', 'work'),
        Query.equal('completed', true),
        Query.greaterThanEqual('startedAt', oneYearAgo.toISOString()),
        Query.orderAsc('startedAt'),
        Query.limit(PAGE_SIZE)
      ]
      if (cursor) queries.push(Query.cursorAfter(cursor))

      const result = await tablesDB.listRows<SessionRow>({
        databaseId: DATABASE_ID,
        tableId: SESSIONS_TABLE_ID,
        queries
      })

      for (const row of result.rows) {
        const startedAt = new Date(row.startedAt)
        const day = row.startedAt.slice(0, 10)
        dayCounts[day] = (dayCounts[day] ?? 0) + 1
        hourCounts[startedAt.getHours()] += 1
      }

      hasMore = result.rows.length === PAGE_SIZE
      cursor = result.rows[result.rows.length - 1]?.$id
    }
  } catch (error) {
    console.error('Failed to load session history:', error)
  }

  return { dayCounts, hourCounts }
}
