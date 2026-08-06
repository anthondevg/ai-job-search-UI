import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth.js'
import { createManualJob, getJob, listJobs, setJobState } from '../services/jobMarketService.js'
import type { JobPipelineStatus } from '../types/jobMarket.js'

const PIPELINE_STATUSES = new Set<JobPipelineStatus>(['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'withdrawn', 'archived'])
export const jobRoutes = new Hono<{ Variables: AuthVariables }>()
jobRoutes.use('*', authMiddleware)

jobRoutes.get('/', async (c) => {
  try {
    const cursor = Number(c.req.query('cursor') ?? 0)
    return c.json(await listJobs(c.get('userId'), {
      search: c.req.query('search'), provider: c.req.query('provider'), pipeline: c.req.query('pipeline'),
      cursor: Number.isFinite(cursor) ? cursor : 0, limit: Number(c.req.query('limit') ?? 30), profileId: c.req.query('profileId'),
    }))
  } catch (error) {
    console.error('Job list error:', error)
    return c.json({ error: error instanceof Error ? error.message : 'Failed to load jobs' }, 500)
  }
})

jobRoutes.get('/:id', async (c) => {
  try { return c.json({ job: await getJob(c.get('userId'), c.req.param('id'), c.req.query('profileId')) }) }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load job'
    return c.json({ error: message }, message === 'Job not found' ? 404 : 500)
  }
})

jobRoutes.post('/manual', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>()
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const url = typeof body.url === 'string' ? body.url.trim() : ''
    if (!companyName || !title || !url) return c.json({ error: 'Company, title, and URL are required' }, 400)
    try { new URL(url) } catch { return c.json({ error: 'A valid job URL is required' }, 400) }
    const job = await createManualJob(c.get('userId'), {
      companyName, title, url, location: typeof body.location === 'string' ? body.location : '',
      description: typeof body.description === 'string' ? body.description : '',
    })
    return c.json({ job }, 201)
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to add job' }, 500) }
})

jobRoutes.patch('/:id/state', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>()
    const status = body.status as JobPipelineStatus
    if (!PIPELINE_STATUSES.has(status)) return c.json({ error: 'Invalid pipeline status' }, 400)
    await setJobState(c.get('userId'), c.req.param('id'), status, typeof body.notes === 'string' ? body.notes : '')
    return c.json({ success: true })
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to update job' }, 500) }
})
