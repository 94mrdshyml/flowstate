import { useCallback, useEffect, useState } from 'react'
import { ID, type Models } from 'appwrite'
import { account } from '../appwrite'
import type { AppPrefs } from '../lib/settings'

export function useAuth(): {
  user: Models.User<AppPrefs> | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updatePrefs: (prefs: AppPrefs) => Promise<void>
} {
  const [user, setUser] = useState<Models.User<AppPrefs> | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setUser(await account.get<AppPrefs>())
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    account
      .get<AppPrefs>()
      .then(setUser, () => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      await account.createEmailPasswordSession({ email, password })
      await refresh()
    },
    [refresh]
  )

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await account.create({ userId: ID.unique(), email, password, name })
      await account.createEmailPasswordSession({ email, password })
      await refresh()
    },
    [refresh]
  )

  const logout = useCallback(async () => {
    await account.deleteSession({ sessionId: 'current' })
    setUser(null)
  }, [])

  const updatePrefs = useCallback(async (prefs: AppPrefs) => {
    setUser(await account.updatePrefs<AppPrefs>({ prefs }))
  }, [])

  return { user, loading, login, signup, logout, updatePrefs }
}
