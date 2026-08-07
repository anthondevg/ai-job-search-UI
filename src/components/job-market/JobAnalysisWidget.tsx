import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeJobDescription } from '../../services/cvGenerateService'
import { useActiveCvRecord } from '../../stores/cvStore'
import type { ProfileCompatibility } from '../../types/compatibility'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'
import type { Job } from '../../types/jobMarket'
import CvGenerateInsightsPanel from '../cv/CvGenerateInsightsPanel'
import { BUTTON_CLASS, type JobMarketCopy } from './jobMarketUi'

type JobAnalysisWidgetProps = {
  job: Job
  copy: JobMarketCopy
}

function buildAnalysisText(job: Job) {
  return [job.title, job.companyName, job.location, job.description]
    .filter(Boolean)
    .join('\n\n')
}

export default function JobAnalysisWidget({
  job,
  copy,
}: JobAnalysisWidgetProps) {
  const activeCv = useActiveCvRecord()
  const analysisText = buildAnalysisText(job)
  const requestIdRef = useRef(0)
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null)
  const [compatibility, setCompatibility] =
    useState<ProfileCompatibility | null>(null)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setStatus('analyzing')
    setError(null)
    setAnalysis(null)
    setCompatibility(null)

    try {
      const result = await analyzeJobDescription(
        analysisText,
        activeCv?.profile,
      )
      if (requestId !== requestIdRef.current) return
      setAnalysis(result.analysis)
      setCompatibility(result.compatibility)
      setStatus('ready')
    } catch (reason) {
      if (requestId !== requestIdRef.current) return
      setError(reason instanceof Error ? reason.message : 'Analysis failed')
      setStatus('error')
    }
  }, [activeCv?.profile, analysisText])

  useEffect(() => {
    void runAnalysis()
    return () => {
      requestIdRef.current += 1
    }
  }, [runAnalysis])

  return (
    <section
      aria-label={copy.analysisWidget}
      aria-live="polite"
      className="mt-4 border-t border-border pt-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {activeCv
            ? `${copy.activeCv}: ${activeCv.fileName}`
            : copy.noActiveCvAnalysis}
        </p>
        <button
          type="button"
          disabled={status === 'analyzing'}
          onClick={() => void runAnalysis()}
          className={BUTTON_CLASS}
        >
          {copy.analyzeAgain}
        </button>
      </div>

      {status === 'analyzing' && (
        <div className="rounded-control border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          {copy.analyzing}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-control border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {status === 'ready' && (
        <CvGenerateInsightsPanel
          analysis={analysis}
          compatibility={compatibility}
        />
      )}
    </section>
  )
}
