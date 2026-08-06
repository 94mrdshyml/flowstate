import type {
  Phase,
  SessionCompletePayload,
  TimerSettings,
  TimerSnapshot,
  TimerState
} from '../preload/types'

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4
}

function durationFor(phase: Phase, settings: TimerSettings): number {
  const minutesByPhase: Record<Phase, number> = {
    work: settings.workMinutes,
    short_break: settings.shortBreakMinutes,
    long_break: settings.longBreakMinutes
  }
  return minutesByPhase[phase] * 60
}

export class PomodoroTimer {
  private settings: TimerSettings = { ...DEFAULT_SETTINGS }
  private phase: Phase = 'work'
  private state: TimerState = 'idle'
  private remainingSeconds = durationFor('work', DEFAULT_SETTINGS)
  private sessionsCompletedInCycle = 0
  private intervalId: NodeJS.Timeout | null = null

  constructor(
    private onUpdate: (snapshot: TimerSnapshot) => void,
    private onComplete: (payload: SessionCompletePayload) => void
  ) {}

  getSnapshot(): TimerSnapshot {
    return {
      phase: this.phase,
      state: this.state,
      remainingSeconds: this.remainingSeconds,
      totalSeconds: durationFor(this.phase, this.settings),
      sessionsCompletedInCycle: this.sessionsCompletedInCycle,
      sessionsBeforeLongBreak: this.settings.sessionsBeforeLongBreak
    }
  }

  private emit(): void {
    this.onUpdate(this.getSnapshot())
  }

  private clearTick(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private tick(): void {
    this.remainingSeconds -= 1
    if (this.remainingSeconds <= 0) {
      this.completePhase(true)
      return
    }
    this.emit()
  }

  private completePhase(natural: boolean): void {
    this.clearTick()
    const finishedPhase = this.phase
    const totalForPhase = durationFor(finishedPhase, this.settings)
    const durationSeconds = natural ? totalForPhase : totalForPhase - this.remainingSeconds

    if (finishedPhase === 'work') {
      this.sessionsCompletedInCycle += 1
      if (this.sessionsCompletedInCycle >= this.settings.sessionsBeforeLongBreak) {
        this.phase = 'long_break'
        this.sessionsCompletedInCycle = 0
      } else {
        this.phase = 'short_break'
      }
    } else {
      this.phase = 'work'
    }

    this.onComplete({
      phase: finishedPhase,
      nextPhase: this.phase,
      durationSeconds,
      completedAt: new Date().toISOString(),
      completed: natural
    })

    this.state = 'idle'
    this.remainingSeconds = durationFor(this.phase, this.settings)
    this.emit()
  }

  start(): void {
    if (this.state !== 'idle') return
    this.state = 'running'
    this.intervalId = setInterval(() => this.tick(), 1000)
    this.emit()
  }

  pause(): void {
    if (this.state !== 'running') return
    this.clearTick()
    this.state = 'paused'
    this.emit()
  }

  resume(): void {
    if (this.state !== 'paused') return
    this.state = 'running'
    this.intervalId = setInterval(() => this.tick(), 1000)
    this.emit()
  }

  skip(): void {
    if (this.state === 'idle') return
    this.completePhase(false)
  }

  reset(): void {
    this.clearTick()
    this.phase = 'work'
    this.state = 'idle'
    this.sessionsCompletedInCycle = 0
    this.remainingSeconds = durationFor('work', this.settings)
    this.emit()
  }

  updateSettings(settings: TimerSettings): void {
    this.settings = { ...settings }
    if (this.state === 'idle') {
      this.remainingSeconds = durationFor(this.phase, this.settings)
    }
    this.emit()
  }
}
