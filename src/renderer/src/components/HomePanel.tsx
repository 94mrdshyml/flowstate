import { useState } from 'react'
import { PHASE_LABEL, PHASE_THEME, getNextPhase } from '../lib/theme'
import type { PhaseTheme } from '../lib/theme'
import type { TaskRow } from '../lib/tasks'
import { CheckIcon, CloseIcon, PlusIcon } from './icons'
import type { TimerSnapshot } from '../../../preload/types'

interface HomePanelProps {
  snapshot: TimerSnapshot
  todaySessionsCompleted: number
  tasks: TaskRow[]
  activeTaskId: string | null
  onSetActiveTask: (id: string | null) => void
  onAddTask: (title: string) => void
  onToggleTask: (id: string, completed: boolean) => void
  onRemoveTask: (id: string) => void
}

function HomePanel({
  snapshot,
  todaySessionsCompleted,
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleTask,
  onRemoveTask
}: HomePanelProps): React.JSX.Element {
  const { phase, state, sessionsCompletedInCycle, sessionsBeforeLongBreak } = snapshot
  const theme = PHASE_THEME[phase]

  return (
    <div className={`flex min-h-0 flex-col border-l px-6 py-8 ${theme.divider}`}>
      {state === 'idle' ? (
        <>
          <MetaRowPair
            left={{ label: 'Phase', value: PHASE_LABEL[phase] }}
            right={{
              label: 'Session',
              value: `${sessionsCompletedInCycle + 1} / ${sessionsBeforeLongBreak}`
            }}
            theme={theme}
          />
          <MetaRow
            label="Today"
            value={`${todaySessionsCompleted} sessions`}
            theme={theme}
            bordered
          />
        </>
      ) : phase === 'work' ? (
        <>
          <MetaRowPair
            left={{ label: 'Phase', value: PHASE_LABEL[phase] }}
            right={{
              label: 'Session',
              value: `${sessionsCompletedInCycle + 1} / ${sessionsBeforeLongBreak}`
            }}
            theme={theme}
          />
          <MetaRow
            label="Next"
            value={PHASE_LABEL[getNextPhase(snapshot)]}
            theme={theme}
            bordered
          />
        </>
      ) : (
        <MetaRow label="Next" value="Session" theme={theme} bordered />
      )}

      <TaskList
        theme={theme}
        tasks={tasks}
        activeTaskId={activeTaskId}
        onSetActive={onSetActiveTask}
        onAdd={onAddTask}
        onToggle={onToggleTask}
        onRemove={onRemoveTask}
      />
    </div>
  )
}

interface MetaRowProps {
  label: string
  value: string
  theme: PhaseTheme
  bordered?: boolean
}

function MetaRow({ label, value, theme, bordered }: MetaRowProps): React.JSX.Element {
  return (
    <div className={bordered ? `mb-4 border-b pb-4 ${theme.divider}` : ''}>
      <div className={`text-[10px] tracking-wider uppercase ${theme.muted}`}>{label}</div>
      <div className={`mt-1 font-heading text-lg font-extrabold ${theme.text}`}>{value}</div>
    </div>
  )
}

interface MetaRowPairProps {
  left: { label: string; value: string }
  right: { label: string; value: string }
  theme: PhaseTheme
}

function MetaRowPair({ left, right, theme }: MetaRowPairProps): React.JSX.Element {
  return (
    <div className={`mb-4 flex gap-6 border-b pb-4 ${theme.divider}`}>
      <div className="flex-1">
        <div className={`text-[10px] tracking-wider uppercase ${theme.muted}`}>{left.label}</div>
        <div className={`mt-1 font-heading text-lg font-extrabold ${theme.text}`}>{left.value}</div>
      </div>
      <div className="flex-1">
        <div className={`text-[10px] tracking-wider uppercase ${theme.muted}`}>{right.label}</div>
        <div className={`mt-1 font-heading text-lg font-extrabold ${theme.text}`}>
          {right.value}
        </div>
      </div>
    </div>
  )
}

interface TaskListProps {
  theme: PhaseTheme
  tasks: TaskRow[]
  activeTaskId: string | null
  onSetActive: (id: string | null) => void
  onAdd: (title: string) => void
  onToggle: (id: string, completed: boolean) => void
  onRemove: (id: string) => void
}

function TaskList({
  theme,
  tasks,
  activeTaskId,
  onSetActive,
  onAdd,
  onToggle,
  onRemove
}: TaskListProps): React.JSX.Element {
  const [title, setTitle] = useState('')
  const openTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={`text-[10px] tracking-wider uppercase ${theme.muted}`}>Tasks</div>

      <form onSubmit={handleSubmit} className="mt-2 mb-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full border-b bg-transparent py-1 text-sm outline-none ${theme.divider} ${theme.text}`}
        />
        <button
          type="submit"
          aria-label="Add task"
          className={`flex h-6 w-6 shrink-0 items-center justify-center border ${theme.divider} ${theme.text} hover:opacity-70`}
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="fs-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {openTasks.map((task) => {
          const isActive = task.$id === activeTaskId
          return (
            <div
              key={task.$id}
              onClick={() => onSetActive(isActive ? null : task.$id)}
              className={`flex cursor-pointer items-center gap-2 py-1.5 text-sm ${theme.text}`}
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full border ${theme.divider} ${isActive ? theme.ring : ''}`}
              />
              <span className="flex-1 truncate" title={task.title}>
                {task.title}
              </span>
              <button
                type="button"
                aria-label="Complete task"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(task.$id, true)
                }}
                className={`flex h-4 w-4 shrink-0 items-center justify-center border ${theme.divider} hover:opacity-70`}
              >
                <CheckIcon className="h-2.5 w-2.5 opacity-0 hover:opacity-100" />
              </button>
              <button
                type="button"
                aria-label="Delete task"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(task.$id)
                }}
                className={`shrink-0 ${theme.muted} hover:opacity-70`}
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          )
        })}
        {openTasks.length === 0 && (
          <p className={`text-xs ${theme.muted}`}>No open tasks. Add one above.</p>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-4 flex flex-col gap-1 opacity-50">
            {completedTasks.map((task) => (
              <div key={task.$id} className={`flex items-center gap-2 py-1 text-sm ${theme.text}`}>
                <button
                  type="button"
                  aria-label="Reopen task"
                  onClick={() => onToggle(task.$id, false)}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center border ${theme.divider}`}
                >
                  <CheckIcon className="h-2.5 w-2.5" />
                </button>
                <span className="flex-1 truncate line-through" title={task.title}>
                  {task.title}
                </span>
                <button
                  type="button"
                  aria-label="Delete task"
                  onClick={() => onRemove(task.$id)}
                  className={`shrink-0 ${theme.muted} hover:opacity-70`}
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePanel
