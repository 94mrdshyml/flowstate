interface StatsPanelProps {
  sessionsCompleted: number
  focusedMinutes: number
}

function formatFocusedTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`
}

function StatsPanel({ sessionsCompleted, focusedMinutes }: StatsPanelProps): React.JSX.Element {
  return (
    <div className="flex gap-12 border-b border-fs-divider pb-6">
      <div>
        <p className="font-heading text-[52px] leading-none font-extrabold tabular-nums text-fs-text">
          {sessionsCompleted}
        </p>
        <p className="mt-1 text-xs text-fs-muted">sessions today</p>
      </div>
      <div>
        <p className="font-heading text-[52px] leading-none font-extrabold text-fs-text">
          {formatFocusedTime(focusedMinutes)}
        </p>
        <p className="mt-1 text-xs text-fs-muted">focused today</p>
      </div>
    </div>
  )
}

export default StatsPanel
