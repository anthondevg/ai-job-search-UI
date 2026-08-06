import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth.js'
import { addCompanySource, deleteJobSource, detectJobSource, followCompany, getJobMarketOverview, getPreferences, savePreferences, setJobSourceEnabled, syncJobSources } from '../services/jobMarketService.js'
import type { JobSearchPreferences } from '../types/jobMarket.js'

export const jobMarketRoutes = new Hono<{ Variables: AuthVariables }>()

jobMarketRoutes.get('/sync/cron', async (c) => {
  const secret = process.env.CRON_SECRET
  if (!secret || c.req.header('Authorization') !== `Bearer ${secret}`) return c.json({ error: 'Invalid cron authorization' }, 401)
  try { return c.json(await syncJobSources(false)) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Sync failed' }, 500) }
})

jobMarketRoutes.use('*', authMiddleware)
jobMarketRoutes.get('/preferences', async (c) => {
  try { return c.json({ preferences: await getPreferences(c.get('userId')) }) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to load preferences' }, 500) }
})
jobMarketRoutes.put('/preferences', async (c) => {
  try {
    const body = await c.req.json<JobSearchPreferences>()
    if (!Array.isArray(body.roleFamilies) || !Array.isArray(body.skills) || !Array.isArray(body.countries)) return c.json({ error: 'Invalid preferences' }, 400)
    return c.json({ preferences: await savePreferences(c.get('userId'), {
      roleFamilies: body.roleFamilies.slice(0, 20), skills: body.skills.slice(0, 50), seniority: Array.isArray(body.seniority) ? body.seniority.slice(0, 10) : [],
      countries: body.countries.slice(0, 20), remote: Boolean(body.remote), relocation: Boolean(body.relocation),
    }) })
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to save preferences' }, 500) }
})
jobMarketRoutes.get('/companies', async (c) => {
  try { return c.json(await getJobMarketOverview(c.get('userId'))) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to load market overview' }, 500) }
})
jobMarketRoutes.post('/companies', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const careersUrl = typeof body.careersUrl === 'string' ? body.careersUrl.trim() : ''
    if (!name || !careersUrl) return c.json({ error: 'Company name and careers URL are required' }, 400)
    try { new URL(careersUrl) } catch { return c.json({ error: 'A valid careers URL is required' }, 400) }
    return c.json({ company: await addCompanySource(c.get('userId'), { name, careersUrl, websiteUrl: typeof body.websiteUrl === 'string' ? body.websiteUrl : undefined }) }, 201)
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to add company' }, 500) }
})
jobMarketRoutes.post('/companies/:id/follow', async (c) => {
  try { await followCompany(c.get('userId'), c.req.param('id')); return c.json({ success: true }) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to follow company' }, 500) }
})
jobMarketRoutes.get('/sources', async (c) => {
  try { return c.json(await getJobMarketOverview(c.get('userId'))) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to load sources' }, 500) }
})
jobMarketRoutes.post('/sources', async (c) => {
  try {
    const body = await c.req.json<{ name?: string; careersUrl?: string; websiteUrl?: string }>()
    if (!body.name || !body.careersUrl) return c.json({ error: 'Company name and careers URL are required' }, 400)
    return c.json({ source: await addCompanySource(c.get('userId'), { name: body.name, careersUrl: body.careersUrl, websiteUrl: body.websiteUrl }) }, 201)
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to add source' }, 500) }
})
jobMarketRoutes.post('/sources/detect', async (c) => {
  try {
    const body = await c.req.json<{ url?: string }>()
    if (!body.url) return c.json({ error: 'URL is required' }, 400)
    return c.json(detectJobSource(body.url))
  } catch { return c.json({ error: 'A valid URL is required' }, 400) }
})
jobMarketRoutes.delete('/sources/:id', async (c) => {
  try { await deleteJobSource(c.req.param('id')); return c.json({ success: true }) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to delete source' }, 500) }
})
jobMarketRoutes.patch('/sources/:id', async (c) => {
  try {
    const body = await c.req.json<{ enabled?: boolean }>()
    if (typeof body.enabled !== 'boolean') return c.json({ error: 'enabled must be a boolean' }, 400)
    await setJobSourceEnabled(c.req.param('id'), body.enabled)
    return c.json({ success: true })
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Failed to update source' }, 500) }
})
jobMarketRoutes.post('/sync', async (c) => {
  try { return c.json(await syncJobSources(false)) }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Sync failed' }, 500) }
})
