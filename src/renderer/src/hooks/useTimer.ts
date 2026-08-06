import { useEffect, useRef, useState } from 'react'
import type { Phase, TimerSnapshot } from '../../../preload/types'
import sessionStartSound from '../assets/sounds/session-start.wav'
import breakStartSound from '../assets/sounds/break-start.wav'
import longBreakStartSound from '../assets/sounds/long-break-start.wav'
import { logSession } from '../lib/sessions'

const SOUND_BY_NEXT_PHASE: Record<Phase, string> = {
  work: sessionStartSound,
  short_break: breakStartSound,
  long_break: longBreakStartSound
}

export function useTimer(userId?: string): {
  snapshot: TimerSnapshot | null
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  reset: () => void
} {
  const [snapshot, setSnapshot] = useState<TimerSnapshot | null>(null)
  const userIdRef = useRef(userId)

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    window.pomodoro.getState().then(setSnapshot)
    const unsubscribeTick = window.pomodoro.onTick(setSnapshot)
    const unsubscribeComplete = window.pomodoro.onSessionComplete((payload) => {
      new Audio(SOUND_BY_NEXT_PHASE[payload.nextPhase]).play().catch(() => {})
      if (userIdRef.current) {
        logSession(userIdRef.current, payload)
      }
    })
    return () => {
      unsubscribeTick()
      unsubscribeComplete()
    }
  }, [])

  return {
    snapshot,
    start: () => window.pomodoro.start(),
    pause: () => window.pomodoro.pause(),
    resume: () => window.pomodoro.resume(),
    skip: () => window.pomodoro.skip(),
    reset: () => window.pomodoro.reset()
  }
}
