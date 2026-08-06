import FocusHourInsight from './FocusHourInsight'
import Heatmap from './Heatmap'
import StatsPanel from './StatsPanel'
import { CloseIcon } from './icons'

interface InsightsDrawerProps {
  sessionsCompleted: number
  focusedMinutes: number
  dayCounts: Record<string, number>
  hourCounts: number[]
  onClose: () => void
}

function InsightsDrawer({
  sessionsCompleted,
  focusedMinutes,
  dayCounts,
  hourCounts,
  onClose
}: InsightsDrawerProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-10 bg-fs-text/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 flex w-90 flex-col gap-6 overflow-y-auto border-l border-fs-divider bg-fs-bg px-7.5 py-8 text-fs-text"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[22px] font-extrabold">Your focus</h2>
          <button type="button" onClick={onClose} aria-label="Close insights">
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <StatsPanel sessionsCompleted={sessionsCompleted} focusedMinutes={focusedMinutes} />
        <Heatmap counts={dayCounts} />
        <FocusHourInsight hourCounts={hourCounts} />
      </div>
    </div>
  )
}

export default InsightsDrawer
