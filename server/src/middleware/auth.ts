import { createMiddleware } from 'hono/factory'
import { getSupabaseClient } from '../services/supabaseClient.js'

export type AuthVariables = {
  userId: string
  userEmail: string
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authorization = c.req.header('Authorization')
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

    if (!token) {
      return c.json({ error: 'Authentication is required' }, 401)
    }

    const { data, error } = await getSupabaseClient().auth.getClaims(token)
    const claims = data?.claims
    const userId = typeof claims?.sub === 'string' ? claims.sub : null
    const userEmail =
      typeof claims?.email === 'string' ? claims.email.toLowerCase() : null

    if (error || !userId || !userEmail) {
      return c.json({ error: 'Invalid or expired authentication token' }, 401)
    }

    c.set('userId', userId)
    c.set('userEmail', userEmail)
    await next()
  },
)
