export interface Quote {
  text: string
  author: string
}

export async function fetchRandomQuote(): Promise<Quote | null> {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random')
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as Record<string, unknown>).quote !== 'string' ||
      typeof (data as Record<string, unknown>).author !== 'string'
    ) {
      return null
    }
    const { quote, author } = data as { quote: string; author: string }
    return { text: quote, author }
  } catch {
    return null
  }
}
