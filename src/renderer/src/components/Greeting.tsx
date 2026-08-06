import type { PhaseTheme } from '../lib/theme'

interface GreetingProps {
  name: string
  theme: PhaseTheme
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Greeting({ name, theme }: GreetingProps): React.JSX.Element {
  const now = new Date()
  const hour = now.getHours()
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div>
      <p className={`font-heading text-lg font-extrabold ${theme.text}`}>
        {greetingForHour(hour)}
        {name ? `, ${name}` : ''}.
      </p>
      <p className={`mt-1.5 text-[13px] ${theme.muted}`}>{dateLabel}</p>
    </div>
  )
}

export default Greeting
