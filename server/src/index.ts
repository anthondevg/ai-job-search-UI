import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { cvRoutes } from './routes/cv.js'
import { generateRoutes } from './routes/generate.js'
import { jobRoutes } from './routes/jobs.js'
import { jobMarketRoutes } from './routes/jobMarket.js'

const frontendUrls = (
  process.env.FRONTEND_URLS ??
  process.env.FRONTEND_URL ??
  'http://localhost:5173'
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

export const app = new Hono()

app.use('*', secureHeaders())

app.use(
  '*',
  cors({
    origin: frontendUrls,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Legacy-Session-Id'],
  }),
)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/cv', cvRoutes)
app.route('/api/cv', generateRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/job-market', jobMarketRoutes)

export default app
