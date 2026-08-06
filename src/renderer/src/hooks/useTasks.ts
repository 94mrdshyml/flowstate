import { useEffect, useState } from 'react'
import { createTask, deleteTask, listTasks, updateTaskCompleted, type TaskRow } from '../lib/tasks'

export function useTasks(userId: string | undefined): {
  tasks: TaskRow[]
  activeTaskId: string | null
  setActiveTaskId: (id: string | null) => void
  addTask: (title: string) => Promise<void>
  toggleTask: (rowId: string, completed: boolean) => Promise<void>
  removeTask: (rowId: string) => Promise<void>
} {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    listTasks(userId).then(setTasks)
  }, [userId])

  const addTask = async (title: string): Promise<void> => {
    if (!userId) return
    const task = await createTask(userId, title)
    if (task) setTasks((prev) => [...prev, task])
  }

  const toggleTask = async (rowId: string, completed: boolean): Promise<void> => {
    setTasks((prev) => prev.map((t) => (t.$id === rowId ? { ...t, completed } : t)))
    if (completed && activeTaskId === rowId) setActiveTaskId(null)
    await updateTaskCompleted(rowId, completed)
  }

  const removeTask = async (rowId: string): Promise<void> => {
    setTasks((prev) => prev.filter((t) => t.$id !== rowId))
    if (activeTaskId === rowId) setActiveTaskId(null)
    await deleteTask(rowId)
  }

  return { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask }
}
