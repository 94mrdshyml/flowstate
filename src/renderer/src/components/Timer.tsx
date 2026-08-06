import { useState } from 'react'
import { PHASE_LABEL, PHASE_THEME, getNextPhase } from '../lib/theme'
import type { PhaseTheme } from '../lib/theme'
import type { TaskRow } from '../lib/tasks'
import {
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkipIcon
} from './icons'
import type { TimerSnapshot } from '../../../preload/types'

interface TimerProps {
  snapshot: TimerSnapshot
  todaySessionsCompleted: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onReset: () => void
  tasks: TaskRow[]
  activeTaskId: string | null
  onSetActiveTask: (id: string | null) => void
  onAddTask: (title: string) => void
  onToggleTask: (id: string, completed: boolean) => void
  onRemoveTask: (id: string) => void
}

const IDLE_CTA_LABEL: Record<TimerSnapshot['phase'], string> = {
  work: 'Start focus',
  short_break: 'Start break',
  long_break: 'Start break'
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Timer({
  snapshot,
  todaySessionsCompleted,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleTask,
  onRemoveTask
}: TimerProps): React.JSX.Element {
  const {
    phase,
    state,
    remainingSeconds,
    totalSeconds,
    sessionsCompletedInCycle,
    sessionsBeforeLongBreak
  } = snapshot
  const theme = PHASE_THEME[phase]
  const elapsedRatio = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0
  const isPaused = state === 'paused'
  const isLongBreak = phase === 'long_break'
  const countdownClass = isPaused ? theme.muted : theme.text
  const barFillClass = isPaused ? theme.mutedBg : theme.ring

  const belowBarText =
    phase === 'work'
      ? state === 'idle'
        ? `Work session · Session ${sessionsCompletedInCycle + 1} of ${sessionsBeforeLongBreak}`
        : isPaused
          ? `Session ${sessionsCompletedInCycle + 1} of ${sessionsBeforeLongBreak}`
          : `Session ${sessionsCompletedInCycle + 1} of ${sessionsBeforeLongBreak} before long break`
      : phase === 'long_break'
        ? 'Four sessions done. Rest well.'
        : null

  return (
    <div className={`grid flex-1 ${isLongBreak ? '' : 'grid-cols-[1fr_260px]'}`}>
      <div className="flex flex-col items-start justify-center px-12 py-8">
        {isPaused && (
          <span
            className={`mb-2 border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${theme.text} ${theme.divider}`}
          >
            Paused
          </span>
        )}
        {phase !== 'work' && (
          <div className={`mb-1.5 text-sm font-extrabold tracking-wide uppercase ${theme.text}`}>
            {phase === 'short_break' ? 'Short break' : 'Long break · Cycle complete'}
          </div>
        )}
        <div
          className={`font-heading font-extrabold leading-none tabular-nums ${countdownClass} ${isLongBreak ? 'text-[7rem]' : 'text-[6.25rem]'}`}
        >
          {formatTime(remainingSeconds)}
        </div>
        <div className={`mt-4 h-1.5 w-full max-w-[420px] ${theme.trackBg}`}>
          <div
            className={`h-full ${barFillClass} transition-[width] duration-1000 ease-linear`}
            style={{ width: `${Math.round(elapsedRatio * 100)}%` }}
          />
        </div>
        {belowBarText && <div className={`mt-3 text-sm ${theme.muted}`}>{belowBarText}</div>}

        <div className="mt-6 flex items-center gap-3">
          {state === 'idle' && (
            <button
              onClick={onStart}
              className={`flex h-[50px] items-center gap-2.5 px-6 font-heading text-[15px] font-extrabold ${theme.ring} ${theme.ringText}`}
            >
              {IDLE_CTA_LABEL[phase]}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
          {state === 'running' && (
            <>
              <button
                onClick={onPause}
                className={`flex h-11 items-center gap-2 border px-5 text-sm ${theme.text} ${theme.divider}`}
              >
                <PauseIcon className="h-3.5 w-3.5" />
                Pause
              </button>
              <button
                onClick={onSkip}
                className={`flex h-11 items-center gap-2 px-4 text-sm ${theme.muted}`}
              >
                <SkipIcon className="h-3.5 w-3.5" />
                Skip
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button
                onClick={onResume}
                className={`flex h-11 items-center gap-2 px-5 font-heading text-sm font-extrabold ${theme.ring} ${theme.ringText}`}
              >
                <PlayIcon className="h-3.5 w-3.5" />
                Resume
              </button>
              <button
                onClick={onSkip}
                className={`flex h-11 items-center gap-2 px-4 text-sm ${theme.muted}`}
              >
                <SkipIcon className="h-3.5 w-3.5" />
                Skip
              </button>
            </>
          )}
        </div>

        {state !== 'idle' && (
          <button
            onClick={onReset}
            className={`mt-4 text-xs underline-offset-2 hover:underline ${theme.muted}`}
          >
            Reset
          </button>
        )}
      </div>

      {!isLongBreak && (
        <div className={`flex h-full flex-col border-l px-6 py-8 ${theme.divider}`}>
          {state === 'idle' ? (
            <>
              <MetaRow label="Phase" value={PHASE_LABEL[phase]} theme={theme} bordered />
              <MetaRow
                label="Session"
                value={`${sessionsCompletedInCycle + 1} / ${sessionsBeforeLongBreak}`}
                theme={theme}
                bordered
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
              <MetaRow label="Phase" value={PHASE_LABEL[phase]} theme={theme} bordered />
              <MetaRow
                label="Session"
                value={`${sessionsCompletedInCycle + 1} / ${sessionsBeforeLongBreak}`}
                theme={theme}
                bordered
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
      )}
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
    <div className="flex flex-1 flex-col overflow-hidden">
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

      <div className="flex flex-col gap-1 overflow-y-auto">
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

export default Timer
