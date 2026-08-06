import { useEffect, useState } from 'react'
import { fetchRandomQuote, type Quote } from '../lib/quotes'

const MIN_INTERVAL_MS = 5 * 60 * 1000
const MAX_INTERVAL_MS = 10 * 60 * 1000

export function useQuotes(): Quote | null {
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNext = (): void => {
      const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
      timeoutId = setTimeout(() => {
        fetchRandomQuote().then((next) => {
          if (next) setQuote(next)
        })
        scheduleNext()
      }, delay)
    }

    fetchRandomQuote().then((first) => {
      if (first) setQuote(first)
    })
    scheduleNext()

    return () => clearTimeout(timeoutId)
  }, [])

  return quote
}
