import { Hono } from 'hono'
import { sessionMiddleware, type SessionVariables } from '../middleware/session.js'
import { parseCvFromPdf } from '../services/geminiService.js'
import {
  createCvProfile,
  deleteCvProfile,
  listCvProfiles,
} from '../services/cvProfileService.js'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const cvRoutes = new Hono<{ Variables: SessionVariables }>()

cvRoutes.use('*', sessionMiddleware)

cvRoutes.get('/', async (c) => {
  try {
    const records = await listCvProfiles(c.get('sessionId'))
    return c.json({ records })
  } catch (error) {
    console.error('CV list error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to load CV profiles'

    if (message.includes('SUPABASE')) {
      return c.json({ error: 'Server is missing Supabase configuration' }, 500)
    }

    return c.json({ error: message }, 500)
  }
})

cvRoutes.post('/parse', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.file

    if (!(file instanceof File)) {
      return c.json({ error: 'A PDF file is required' }, 400)
    }

    if (file.type !== 'application/pdf') {
      return c.json({ error: 'Only PDF files are supported' }, 400)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return c.json({ error: 'PDF file must be 10 MB or smaller' }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    if (pdfBuffer.length === 0) {
      return c.json({ error: 'The uploaded PDF file is empty' }, 400)
    }

    const profile = await parseCvFromPdf(pdfBuffer, file.type)
    const record = await createCvProfile(c.get('sessionId'), file.name, profile)

    return c.json({ record })
  } catch (error) {
    console.error('CV parse error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to parse CV from PDF'

    if (message.includes('GEMINI_API_KEY')) {
      return c.json({ error: 'Server is missing Gemini API configuration' }, 500)
    }

    if (message.includes('SUPABASE')) {
      return c.json({ error: 'Server is missing Supabase configuration' }, 500)
    }

    return c.json({ error: message }, 500)
  }
})

cvRoutes.delete('/:id', async (c) => {
  try {
    await deleteCvProfile(c.get('sessionId'), c.req.param('id'))
    return c.json({ success: true })
  } catch (error) {
    console.error('CV delete error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to delete CV profile'

    if (message === 'CV profile not found') {
      return c.json({ error: message }, 404)
    }

    return c.json({ error: message }, 500)
  }
})
