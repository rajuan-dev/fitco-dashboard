import { useEffect, useState } from 'react'

export function useAsyncData(loader, initialValue) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const result = await loader()
      if (mounted) {
        setData(result)
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [loader])

  return { data, loading }
}
