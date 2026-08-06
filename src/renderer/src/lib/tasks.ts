import { ID, Permission, Query, Role, type Models } from 'appwrite'
import { DATABASE_ID, TASKS_TABLE_ID, tablesDB } from '../appwrite'

export interface TaskRow extends Models.Row {
  userId: string
  title: string
  completed: boolean
}

export async function listTasks(userId: string): Promise<TaskRow[]> {
  try {
    const result = await tablesDB.listRows<TaskRow>({
      databaseId: DATABASE_ID,
      tableId: TASKS_TABLE_ID,
      queries: [Query.equal('userId', userId), Query.orderAsc('$createdAt'), Query.limit(100)]
    })
    return result.rows
  } catch (error) {
    console.error('Failed to load tasks:', error)
    return []
  }
}

export async function createTask(userId: string, title: string): Promise<TaskRow | null> {
  try {
    return await tablesDB.createRow<TaskRow>({
      databaseId: DATABASE_ID,
      tableId: TASKS_TABLE_ID,
      rowId: ID.unique(),
      data: { userId, title, completed: false },
      permissions: [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))]
    })
  } catch (error) {
    console.error('Failed to create task:', error)
    return null
  }
}

export async function updateTaskCompleted(rowId: string, completed: boolean): Promise<void> {
  try {
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TASKS_TABLE_ID,
      rowId,
      data: { completed }
    })
  } catch (error) {
    console.error('Failed to update task:', error)
  }
}

export async function deleteTask(rowId: string): Promise<void> {
  try {
    await tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: TASKS_TABLE_ID, rowId })
  } catch (error) {
    console.error('Failed to delete task:', error)
  }
}
