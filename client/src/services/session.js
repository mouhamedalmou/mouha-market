const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'user'
const SESSION_UPDATED_EVENT = 'session-updated'

function dispatchSessionUpdate() {
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT))
}

export function getStoredToken() {
  return typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getStoredToken())
}

export function persistSession({ token, user }) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  dispatchSessionUpdate()
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
  dispatchSessionUpdate()
}

export function subscribeToSessionChanges(callback) {
  const handleChange = () => callback(getStoredUser())

  window.addEventListener(SESSION_UPDATED_EVENT, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(SESSION_UPDATED_EVENT, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}
