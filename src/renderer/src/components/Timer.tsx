import { PHASE_LABEL, PHASE_THEME, getNextPhase } from '../lib/theme'
import type { PhaseTheme } from '../lib/theme'
import { ArrowRightIcon, PauseIcon, PlayIcon, SkipIcon } from './icons'
import type { TimerSnapshot } from '../../../preload/types'

interface TimerProps {
  snapshot: TimerSnapshot
  todaySessionsCompleted: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onReset: () => void
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
  onReset
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
    <div className={`grid flex-1 ${isLongBreak ? '' : 'grid-cols-[1fr_190px]'}`}>
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
        <div className={`flex flex-col border-l px-6 py-8 ${theme.divider}`}>
          {state === 'idle' ? (
            <>
              <MetaRow label="Phase" value={PHASE_LABEL[phase]} theme={theme} bordered />
              <MetaRow
                label="Session"
                value={`${sessionsCompletedInCycle + 1} / ${sessionsBeforeLongBreak}`}
                theme={theme}
                bordered
              />
              <MetaRow label="Today" value={`${todaySessionsCompleted} sessions`} theme={theme} />
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
              <MetaRow label="Next" value={PHASE_LABEL[getNextPhase(snapshot)]} theme={theme} />
            </>
          ) : (
            <MetaRow label="Next" value="Session" theme={theme} />
          )}
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

export default Timer
