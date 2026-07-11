import { Hono } from 'hono'
import { sessionMiddleware, type SessionVariables } from '../middleware/session.js'
import {
  analyzeJobDescription,
  generateTailoredCv,
} from '../services/geminiService.js'
import type { CVProfile } from '../types/cvProfile.js'
import type { JobDescriptionAnalysis } from '../types/jobDescription.js'
import { validateCvProfile } from '../validators/validateCvProfile.js'
import { validateJobDescriptionAnalysis } from '../validators/validateGeneration.js'

export const generateRoutes = new Hono<{ Variables: SessionVariables }>()

generateRoutes.use('*', sessionMiddleware)

generateRoutes.post('/analyze-job', async (c) => {
  try {
    const body = await c.req.json<{ jobDescription?: string }>()
    const jobDescription = body.jobDescription

    if (typeof jobDescription !== 'string') {
      return c.json({ error: 'jobDescription text is required' }, 400)
    }

    const analysis = await analyzeJobDescription(jobDescription)
    return c.json({ analysis })
  } catch (error) {
    console.error('Job description analyze error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to analyze job description'

    if (message.includes('GEMINI_API_KEY')) {
      return c.json({ error: 'Server is missing Gemini API configuration' }, 500)
    }

    if (message.includes('too short') || message.includes('maximum length')) {
      return c.json({ error: message }, 400)
    }

    return c.json({ error: message }, 500)
  }
})

generateRoutes.post('/tailor', async (c) => {
  try {
    const body = await c.req.json<{
      sourceProfile?: CVProfile
      jobDescription?: string
      analysis?: JobDescriptionAnalysis
    }>()

    if (!body.sourceProfile) {
      return c.json({ error: 'sourceProfile is required' }, 400)
    }

    if (typeof body.jobDescription !== 'string') {
      return c.json({ error: 'jobDescription text is required' }, 400)
    }

    if (!body.analysis) {
      return c.json({ error: 'analysis is required' }, 400)
    }

    const sourceProfile = validateCvProfile(body.sourceProfile)
    const analysis = validateJobDescriptionAnalysis(body.analysis)

    const result = await generateTailoredCv(
      sourceProfile,
      body.jobDescription,
      analysis,
    )

    return c.json({ result })
  } catch (error) {
    console.error('Tailored CV generate error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to generate tailored CV'

    if (message.includes('GEMINI_API_KEY')) {
      return c.json({ error: 'Server is missing Gemini API configuration' }, 500)
    }

    if (message.includes('too short') || message.includes('maximum length')) {
      return c.json({ error: message }, 400)
    }

    return c.json({ error: message }, 500)
  }
})
