import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { analyzeJobDescription } from '../../services/cvGenerateService'
import { useActiveCvRecord } from '../../stores/cvStore'
import type { ProfileCompatibility } from '../../types/compatibility'
import type { JobDescriptionAnalysis } from '../../types/jobDescription'
import type { Job } from '../../types/jobMarket'
import CvGenerateInsightsPanel from '../cv/CvGenerateInsightsPanel'
import { BUTTON_CLASS, type JobMarketCopy } from './jobMarketUi'

type WidgetPosition = { x: number; y: number }

type JobAnalysisWidgetProps = {
  job: Job | null
  copy: JobMarketCopy
  onClose: () => void
}

const VIEWPORT_GAP = 16

function buildAnalysisText(job: Job) {
  return [job.title, job.companyName, job.location, job.description]
    .filter(Boolean)
    .join('\n\n')
}

export default function JobAnalysisWidget({
  job,
  copy,
  onClose,
}: JobAnalysisWidgetProps) {
  const activeCv = useActiveCvRecord()
  const panelRef = useRef<HTMLElement>(null)
  const requestIdRef = useRef(0)
  const dragRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const [position, setPosition] = useState<WidgetPosition>({ x: 24, y: 72 })
  const [positioned, setPositioned] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null)
  const [compatibility, setCompatibility] =
    useState<ProfileCompatibility | null>(null)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>(
    'idle',
  )
  const [error, setError] = useState<string | null>(null)

  const clampPosition = useCallback((next: WidgetPosition) => {
    const panel = panelRef.current
    const width = panel?.offsetWidth ?? Math.min(704, window.innerWidth - 32)
    const height = panel?.offsetHeight ?? 96

    return {
      x: Math.max(
        VIEWPORT_GAP,
        Math.min(next.x, window.innerWidth - width - VIEWPORT_GAP),
      ),
      y: Math.max(
        VIEWPORT_GAP,
        Math.min(next.y, window.innerHeight - height - VIEWPORT_GAP),
      ),
    }
  }, [])

  const runAnalysis = useCallback(async () => {
    if (!job) return

    const requestId = ++requestIdRef.current
    setStatus('analyzing')
    setError(null)
    setAnalysis(null)
    setCompatibility(null)

    try {
      const result = await analyzeJobDescription(
        buildAnalysisText(job),
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
  }, [activeCv?.profile, job])

  useEffect(() => {
    if (!job) {
      requestIdRef.current += 1
      return
    }

    setMinimized(false)
    void runAnalysis()
  }, [job, runAnalysis])

  useEffect(() => {
    if (!job || positioned) return
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      setPosition(
        clampPosition({
          x: window.innerWidth - panel.offsetWidth - 32,
          y: 72,
        }),
      )
      setPositioned(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [clampPosition, job, positioned])

  useEffect(() => {
    const keepInViewport = () => setPosition((current) => clampPosition(current))
    window.addEventListener('resize', keepInViewport)
    return () => window.removeEventListener('resize', keepInViewport)
  }, [clampPosition])

  useEffect(() => {
    if (!job) setPositioned(false)
  }, [job])

  function startDrag(event: ReactPointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button, a, input, textarea')) return
    const bounds = panelRef.current?.getBoundingClientRect()
    if (!bounds) return

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveWidget(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setPosition(
      clampPosition({
        x: event.clientX - drag.offsetX,
        y: event.clientY - drag.offsetY,
      }),
    )
  }

  function stopDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  if (!job) return null

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-label={copy.analysisWidget}
      aria-live="polite"
      style={{ left: position.x, top: position.y }}
      className={`fixed z-[110] overflow-hidden rounded-card border border-border bg-surface-raised shadow-2xl ${
        minimized
          ? 'w-[min(24rem,calc(100vw-2rem))]'
          : 'flex max-h-[calc(100vh-2rem)] w-[min(44rem,calc(100vw-2rem))] flex-col'
      }`}
    >
      <header
        onPointerDown={startDrag}
        onPointerMove={moveWidget}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        className="flex touch-none cursor-move items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3 select-none"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            {copy.analysisWidget}
          </p>
          <p className="truncate text-sm font-semibold text-heading">
            {job.title} · {job.companyName}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={minimized ? copy.restore : copy.minimize}
            title={minimized ? copy.restore : copy.minimize}
            onClick={() => {
              setMinimized((current) => !current)
              requestAnimationFrame(() =>
                setPosition((current) => clampPosition(current)),
              )
            }}
            className={`${BUTTON_CLASS} px-2 py-1 font-mono text-base`}
          >
            {minimized ? '□' : '—'}
          </button>
          <button
            type="button"
            aria-label={copy.close}
            title={copy.close}
            onClick={onClose}
            className={`${BUTTON_CLASS} px-2 py-1 font-mono text-base`}
          >
            ×
          </button>
        </div>
      </header>

      {!minimized && (
        <div className="overflow-y-auto p-4 sm:p-5">
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
            <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              {error}
            </div>
          )}

          {status === 'ready' && (
            <CvGenerateInsightsPanel
              analysis={analysis}
              compatibility={compatibility}
            />
          )}
        </div>
      )}
    </section>
  )
}
