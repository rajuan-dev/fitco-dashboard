import { useEffect, useState } from 'react'

export function navigate(to) {
  if (window.location.pathname === to) {
    return
  }
  window.history.pushState({}, '', to)
  window.dispatchEvent(new Event('popstate'))
}

export function useRouter() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return { path, navigate }
}
