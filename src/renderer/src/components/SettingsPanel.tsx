import { useState } from 'react'
import { CheckIcon } from './icons'
import type { TimerSettings } from '../../../preload/types'

interface SettingsPanelProps {
  settings: TimerSettings
  onSave: (settings: TimerSettings) => Promise<void>
}

function SettingsPanel({ settings, onSave }: SettingsPanelProps): React.JSX.Element {
  const [workMinutes, setWorkMinutes] = useState(settings.workMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes)
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    settings.sessionsBeforeLongBreak
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await onSave({ workMinutes, shortBreakMinutes, longBreakMinutes, sessionsBeforeLongBreak })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const fieldClass =
    'w-20 bg-fs-surface border border-fs-divider px-2 py-1 text-sm text-fs-text outline-none focus:border-fs-accent'

  return (
    <form
      onSubmit={handleSubmit}
      className="fs-scroll flex min-h-0 flex-col gap-4.5 overflow-y-auto border-l border-fs-divider bg-fs-surface px-6 py-8 text-fs-text"
    >
      <h2 className="font-heading text-[22px] font-extrabold">Settings</h2>

      <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
        Work duration
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min={1}
            value={workMinutes}
            onChange={(e) => setWorkMinutes(Number(e.target.value))}
            className={fieldClass}
          />
          <span className="text-[13px] text-fs-muted">minutes</span>
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
        Short break
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min={1}
            value={shortBreakMinutes}
            onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
            className={fieldClass}
          />
          <span className="text-[13px] text-fs-muted">minutes</span>
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
        Long break
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min={1}
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
            className={fieldClass}
          />
          <span className="text-[13px] text-fs-muted">minutes</span>
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
        Sessions before long break
        <input
          type="number"
          min={1}
          value={sessionsBeforeLongBreak}
          onChange={(e) => setSessionsBeforeLongBreak(Number(e.target.value))}
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="h-11 bg-fs-accent font-heading text-sm font-extrabold text-fs-accent-text disabled:opacity-45"
      >
        Save
      </button>
      {saved && (
        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-fs-text">
          <CheckIcon className="h-3.5 w-3.5" />
          Saved
        </div>
      )}
    </form>
  )
}

export default SettingsPanel
