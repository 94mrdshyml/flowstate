import { ID, Permission, Role, type Models } from 'appwrite'
import { DATABASE_ID, SESSIONS_TABLE_ID, tablesDB } from '../appwrite'
import type { Phase, SessionCompletePayload } from '../../../preload/types'

export interface SessionRow extends Models.Row {
  userId: string
  phase: Phase
  startedAt: string
  endedAt: string
  durationSeconds: number
  completed: boolean
}

export async function logSession(userId: string, payload: SessionCompletePayload): Promise<void> {
  const startedAt = new Date(
    new Date(payload.completedAt).getTime() - payload.durationSeconds * 1000
  ).toISOString()

  try {
    await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: SESSIONS_TABLE_ID,
      rowId: ID.unique(),
      data: {
        userId,
        phase: payload.phase,
        startedAt,
        endedAt: payload.completedAt,
        durationSeconds: payload.durationSeconds,
        completed: payload.completed
      },
      permissions: [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))]
    })
  } catch (error) {
    console.error('Failed to log session:', error)
  }
}
