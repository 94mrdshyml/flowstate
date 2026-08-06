import { useState } from 'react'
import { ArrowLeftIcon, CheckIcon } from './icons'
import type { TimerSettings } from '../../../preload/types'

interface SettingsPageProps {
  settings: TimerSettings
  onSave: (settings: TimerSettings) => Promise<void>
  onBack: () => void
}

function SettingsPage({ settings, onSave, onBack }: SettingsPageProps): React.JSX.Element {
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
    <div className="flex flex-1 flex-col overflow-y-auto bg-fs-surface px-9 py-8 text-fs-text">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-fs-muted hover:opacity-70"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4.5">
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
          className="h-11 w-fit bg-fs-accent px-6 font-heading text-sm font-extrabold text-fs-accent-text disabled:opacity-45"
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
    </div>
  )
}

export default SettingsPage
