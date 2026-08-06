import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth.js'
import { parseCvFromPdf } from '../services/geminiService.js'
import {
  claimLegacyCvProfiles,
  createCvProfile,
  deleteCvProfile,
  listCvProfiles,
  updateCvProfile,
} from '../services/cvProfileService.js'
import { validateCvProfile } from '../validators/validateCvProfile.js'

// Vercel Functions cap the complete request payload at 4.5 MB. Keep enough
// headroom for multipart/form-data headers and boundaries.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024
const LEGACY_SESSION_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const cvRoutes = new Hono<{ Variables: AuthVariables }>()

cvRoutes.use('*', authMiddleware)

cvRoutes.get('/', async (c) => {
  try {
    const legacySessionId = c.req.header('X-Legacy-Session-Id')
    if (legacySessionId && LEGACY_SESSION_ID_REGEX.test(legacySessionId)) {
      await claimLegacyCvProfiles(c.get('userId'), legacySessionId)
    }

    const records = await listCvProfiles(c.get('userId'))
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
      return c.json({ error: 'PDF file must be 4 MB or smaller' }, 400)
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer())
    if (pdfBuffer.length === 0) {
      return c.json({ error: 'The uploaded PDF file is empty' }, 400)
    }

    if (pdfBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return c.json({ error: 'The uploaded file is not a valid PDF' }, 400)
    }

    const profile = await parseCvFromPdf(pdfBuffer, file.type)
    const record = await createCvProfile(c.get('userId'), file.name, profile)

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

cvRoutes.patch('/:id', async (c) => {
  try {
    const body = await c.req.json()
    const profile = validateCvProfile(body.profile)
    const record = await updateCvProfile(
      c.get('userId'),
      c.req.param('id'),
      profile,
    )

    return c.json({ record })
  } catch (error) {
    console.error('CV update error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to update CV profile'

    if (message === 'CV profile not found') {
      return c.json({ error: message }, 404)
    }

    if (message.includes('Invalid CV profile') || message.includes('Could not extract')) {
      return c.json({ error: message }, 400)
    }

    if (message.includes('SUPABASE')) {
      return c.json({ error: 'Server is missing Supabase configuration' }, 500)
    }

    return c.json({ error: message }, 500)
  }
})

cvRoutes.delete('/:id', async (c) => {
  try {
    await deleteCvProfile(c.get('userId'), c.req.param('id'))
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
