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

const chromeExtensionOrigins = (process.env.CHROME_EXTENSION_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)
  .map((id) => `chrome-extension://${id}`)

function resolveCorsOrigin(origin: string): string | undefined {
  if (frontendUrls.includes(origin) || chromeExtensionOrigins.includes(origin)) {
    return origin
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    /^chrome-extension:\/\/[a-p]{32}$/.test(origin)
  ) {
    return origin
  }

  return undefined
}

export const app = new Hono()

app.use('*', secureHeaders())

app.use(
  '*',
  cors({
    origin: resolveCorsOrigin,
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
