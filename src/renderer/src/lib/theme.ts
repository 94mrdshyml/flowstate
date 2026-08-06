import type { Phase, TimerSnapshot } from '../../../preload/types'

export interface PhaseTheme {
  bg: string
  text: string
  muted: string
  mutedBg: string
  divider: string
  trackBg: string
  ring: string
  ringText: string
}

export const PHASE_THEME: Record<Phase, PhaseTheme> = {
  work: {
    bg: 'bg-fs-bg',
    text: 'text-fs-text',
    muted: 'text-fs-muted',
    mutedBg: 'bg-fs-muted',
    divider: 'border-fs-divider',
    trackBg: 'bg-fs-divider',
    ring: 'bg-fs-accent',
    ringText: 'text-fs-accent-text'
  },
  short_break: {
    bg: 'bg-fs-shortbreak-bg',
    text: 'text-fs-shortbreak-text',
    muted: 'text-fs-shortbreak-text/60',
    mutedBg: 'bg-fs-shortbreak-text/60',
    divider: 'border-fs-shortbreak-divider',
    trackBg: 'bg-fs-shortbreak-divider',
    ring: 'bg-fs-shortbreak-ring',
    ringText: 'text-fs-shortbreak-bg'
  },
  long_break: {
    bg: 'bg-fs-longbreak-bg',
    text: 'text-fs-longbreak-text',
    muted: 'text-fs-longbreak-text/75',
    mutedBg: 'bg-fs-longbreak-text/75',
    divider: 'border-white/30',
    trackBg: 'bg-white/30',
    ring: 'bg-fs-longbreak-ring',
    ringText: 'text-fs-longbreak-bg'
  }
}

export const PHASE_LABEL: Record<Phase, string> = {
  work: 'Work',
  short_break: 'Short break',
  long_break: 'Long break'
}

export function getNextPhase(
  snapshot: Pick<TimerSnapshot, 'phase' | 'sessionsCompletedInCycle' | 'sessionsBeforeLongBreak'>
): Phase {
  if (snapshot.phase !== 'work') return 'work'
  const willCompleteCycle =
    snapshot.sessionsCompletedInCycle + 1 >= snapshot.sessionsBeforeLongBreak
  return willCompleteCycle ? 'long_break' : 'short_break'
}
