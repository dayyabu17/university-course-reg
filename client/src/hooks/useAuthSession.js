import { useMemo } from 'react'
import storageKeys from '../constants/storageKeys.js'

function useAuthSession() {
  const raw = sessionStorage.getItem(storageKeys.auth)
  const auth = raw ? JSON.parse(raw) : null

  const user = useMemo(() => auth?.user || null, [auth])
  const token = useMemo(() => auth?.token || null, [auth])

  const setAuth = (nextAuth) => {
    if (!nextAuth) {
      sessionStorage.removeItem(storageKeys.auth)
      return null
    }
    sessionStorage.setItem(storageKeys.auth, JSON.stringify(nextAuth))
    return nextAuth
  }

  const clearAuth = () => {
    sessionStorage.removeItem(storageKeys.auth)
  }

  return {
    auth,
    user,
    token,
    setAuth,
    clearAuth,
  }
}

export default useAuthSession
