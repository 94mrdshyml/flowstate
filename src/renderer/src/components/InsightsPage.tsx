import FocusHourInsight from './FocusHourInsight'
import Heatmap from './Heatmap'
import StatsPanel from './StatsPanel'
import { ArrowLeftIcon } from './icons'

interface InsightsPageProps {
  sessionsCompleted: number
  focusedMinutes: number
  dayCounts: Record<string, number>
  hourCounts: number[]
  onBack: () => void
}

function InsightsPage({
  sessionsCompleted,
  focusedMinutes,
  dayCounts,
  hourCounts,
  onBack
}: InsightsPageProps): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-fs-bg px-9 py-8 text-fs-text">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-fs-muted hover:opacity-70"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <h2 className="font-heading text-[22px] font-extrabold">Your focus</h2>

        <StatsPanel sessionsCompleted={sessionsCompleted} focusedMinutes={focusedMinutes} />
        <Heatmap counts={dayCounts} />
        <FocusHourInsight hourCounts={hourCounts} />
      </div>
    </div>
  )
}

export default InsightsPage
