import { PHASE_THEME, type PhaseTheme } from '../lib/theme'
import { ArrowRightIcon, PauseIcon, PlayIcon, SkipIcon } from './icons'
import type { TimerSnapshot } from '../../../preload/types'

interface TimerProps {
  snapshot: TimerSnapshot
  musicPlaying: boolean
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

const BAR_DELAY_CLASSES = [
  '[animation-delay:0s]',
  '[animation-delay:0.15s]',
  '[animation-delay:0.3s]',
  '[animation-delay:0.45s]'
]

function EqualizerBars({
  active,
  theme
}: {
  active: boolean
  theme: PhaseTheme
}): React.JSX.Element {
  return (
    <div
      className="absolute bottom-8 left-12 flex h-10 items-end gap-1.5 opacity-20"
      aria-hidden="true"
    >
      {BAR_DELAY_CLASSES.map((delayClass, i) => (
        <div
          key={i}
          style={{ transformOrigin: 'bottom' }}
          className={`w-1 rounded-sm ${theme.ring} ${
            active ? `h-10 animate-[fsEqualize_0.9s_ease-in-out_infinite] ${delayClass}` : 'h-2.5'
          }`}
        />
      ))}
    </div>
  )
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Timer({
  snapshot,
  musicPlaying,
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
    <div className="relative flex flex-col items-start justify-center px-12 py-8">
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

      <EqualizerBars active={musicPlaying} theme={theme} />
    </div>
  )
}

export default Timer
