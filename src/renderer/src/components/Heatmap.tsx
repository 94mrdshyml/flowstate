interface HeatmapProps {
  counts: Record<string, number>
}

interface Day {
  date: string
  count: number
}

const LEVEL_CLASSES = [
  'bg-[#eae7e7] dark:bg-[#444141]',
  'bg-[#ffe0d9] dark:bg-[#7c1405]',
  'bg-[#ff9783] dark:bg-[#dd2b0f]',
  'bg-[#dd2b0f] dark:bg-[#ff563c]',
  'bg-[#7c1405] dark:bg-[#ffc4b8]'
]

function levelForCount(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

function buildWeeks(counts: Record<string, number>): Day[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - 370)
  start.setDate(start.getDate() - start.getDay())

  const weeks: Day[][] = []
  const cursor = new Date(start)
  while (cursor <= today) {
    const week: Day[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      week.push({ date: dateStr, count: counts[dateStr] ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function Heatmap({ counts }: HeatmapProps): React.JSX.Element {
  const weeks = buildWeeks(counts)

  return (
    <div>
      <div className="mb-2.5 text-[11px] tracking-wide text-fs-muted uppercase">Past year</div>
      <div className="flex gap-0.75 overflow-x-auto">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-0.75">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} session${day.count === 1 ? '' : 's'}`}
                className={`h-2.25 w-2.25 ${LEVEL_CLASSES[levelForCount(day.count)]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-fs-muted">
        <span>Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`h-2.25 w-2.25 ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default Heatmap
