import { createMiddleware } from 'hono/factory'

const SESSION_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type SessionVariables = {
  sessionId: string
}

export const sessionMiddleware = createMiddleware<{ Variables: SessionVariables }>(
  async (c, next) => {
    const sessionId = c.req.header('X-Session-Id')

    if (!sessionId || !SESSION_ID_REGEX.test(sessionId)) {
      return c.json({ error: 'A valid session ID is required' }, 400)
    }

    c.set('sessionId', sessionId)
    await next()
  },
)
