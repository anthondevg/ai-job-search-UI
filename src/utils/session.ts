export const SESSION_ID_STORAGE_KEY = 'ai-job-search-session-id'

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_ID_STORAGE_KEY)
  if (existing) return existing

  const sessionId = crypto.randomUUID()
  localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId)
  return sessionId
}
