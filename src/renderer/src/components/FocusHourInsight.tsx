import { GearIcon } from './icons'

interface FocusHourInsightProps {
  hourCounts: number[]
}

function formatHour(hour: number): string {
  const normalized = hour % 24
  const period = normalized < 12 ? 'AM' : 'PM'
  let h = normalized % 12
  if (h === 0) h = 12
  return `${h} ${period}`
}

function formatRange(startHour: number, endHour: number): string {
  const [startNum, startPeriod] = formatHour(startHour).split(' ')
  const [endNum, endPeriod] = formatHour(endHour).split(' ')
  if (startPeriod === endPeriod) return `${startNum}–${endNum} ${endPeriod}`
  return `${startNum} ${startPeriod}–${endNum} ${endPeriod}`
}

function findPeakWindow(hourCounts: number[]): { startHour: number; endHour: number } | null {
  let bestStart = 0
  let bestTotal = 0
  for (let h = 0; h < 23; h++) {
    const total = hourCounts[h] + hourCounts[h + 1]
    if (total > bestTotal) {
      bestTotal = total
      bestStart = h
    }
  }
  return bestTotal > 0 ? { startHour: bestStart, endHour: bestStart + 2 } : null
}

function FocusHourInsight({ hourCounts }: FocusHourInsightProps): React.JSX.Element | null {
  const peak = findPeakWindow(hourCounts)
  if (!peak) return null

  return (
    <div className="flex w-fit items-center gap-3.5 border border-fs-divider px-4.5 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-fs-accent text-fs-accent">
        <GearIcon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-heading text-[15px] font-extrabold text-fs-text">
          You focus best around {formatRange(peak.startHour, peak.endHour)}
        </p>
        <p className="mt-0.5 text-xs text-fs-muted">Based on your last 30 days</p>
      </div>
    </div>
  )
}

export default FocusHourInsight
