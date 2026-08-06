import type { Phase } from '../../../preload/types'
import type { PhaseTheme } from '../lib/theme'
import type { Quote } from '../lib/quotes'

interface QuoteBannerProps {
  quote: Quote | null
  phase: Phase
  theme: PhaseTheme
}

function QuoteBanner({ quote, phase, theme }: QuoteBannerProps): React.JSX.Element | null {
  if (!quote) return null
  const stripBg = phase === 'work' ? 'bg-fs-surface' : theme.bg

  return (
    <div
      className={`flex items-center justify-between gap-4 border-t px-9 py-3.5 ${theme.divider} ${stripBg} transition-opacity duration-400`}
    >
      <p className={`text-[12.5px] italic ${theme.text} opacity-85`}>&ldquo;{quote.text}&rdquo;</p>
      <p className={`shrink-0 text-[11px] ${theme.muted}`}>— {quote.author}</p>
    </div>
  )
}

export default QuoteBanner
