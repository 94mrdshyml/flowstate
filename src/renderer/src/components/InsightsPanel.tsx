import FocusHourInsight from './FocusHourInsight'
import Heatmap from './Heatmap'
import StatsPanel from './StatsPanel'

interface InsightsPanelProps {
  sessionsCompleted: number
  focusedMinutes: number
  dayCounts: Record<string, number>
  hourCounts: number[]
}

function InsightsPanel({
  sessionsCompleted,
  focusedMinutes,
  dayCounts,
  hourCounts
}: InsightsPanelProps): React.JSX.Element {
  return (
    <div className="fs-scroll flex min-h-0 flex-col gap-6 overflow-y-auto border-l border-fs-divider bg-fs-bg px-6 py-8 text-fs-text">
      <h2 className="font-heading text-[22px] font-extrabold">Your focus</h2>

      <StatsPanel sessionsCompleted={sessionsCompleted} focusedMinutes={focusedMinutes} />
      <Heatmap counts={dayCounts} />
      <FocusHourInsight hourCounts={hourCounts} />
    </div>
  )
}

export default InsightsPanel
