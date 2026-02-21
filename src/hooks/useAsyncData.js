import { useEffect, useState } from 'react'

export function useAsyncData(loader, initialValue) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await loader()
        if (mounted) {
          setData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [loader])

  return { data, loading, error }
}
