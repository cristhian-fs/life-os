import { useCallback, useEffect, useState } from 'react'

/**
 * useState backed by localStorage, JSON-serialized under `key`. Syncs across
 * tabs/windows via the native `storage` event. Reads/writes are wrapped in
 * try/catch — private browsing, quota limits, or another tab writing a
 * malformed value all fall back to `defaultValue` instead of throwing.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? defaultValue : (JSON.parse(stored) as T)
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // private browsing, quota exceeded, etc. — value still updates in-memory
        }
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        setValue(
          e.newValue === null ? defaultValue : (JSON.parse(e.newValue) as T),
        )
      } catch {
        // ignore malformed value written by another tab
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // defaultValue is intentionally omitted — it's a fallback, not a reactive input.
  }, [key])

  return [value, setStoredValue] as const
}
