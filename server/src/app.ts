import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cvRoutes } from './routes/cv.js'

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const app = new Hono()

app.use(
  '*',
  cors({
    origin: frontendUrl,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Session-Id'],
  }),
)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/cv', cvRoutes)
