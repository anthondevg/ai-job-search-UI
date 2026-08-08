import { useEffect, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  LocationEligibility,
  ProfileCompatibility,
  WarningFlag,
} from '../../types/compatibility'

type ProfileCompatibilityCardProps = {
  compatibility: ProfileCompatibility
  bare?: boolean
}

const DANGER_FLAGS: WarningFlag[] = [
  'visa_sponsorship_required',
  'us_timezone_restricted',
  'us_only_remote',
  'latam_excluded',
]

const POSITIVE_FLAGS: WarningFlag[] = [
  'global_remote',
  'latam_friendly_remote',
]

function getScoreTone(score: number) {
  if (score >= 75) {
    return { text: 'text-success', bar: 'bg-success' }
  }
  if (score >= 50) {
    return { text: 'text-accent', bar: 'bg-accent' }
  }
  return { text: 'text-danger', bar: 'bg-danger' }
}

function getScoreLabelKey(score: number) {
  if (score >= 75) return 'strong' as const
  if (score >= 50) return 'good' as const
  if (score >= 25) return 'partial' as const
  return 'weak' as const
}

function getEligibilityTone(eligibility: LocationEligibility) {
  switch (eligibility) {
    case 'eligible':
      return {
        panel: 'border-success/35 bg-success/10',
        badge: 'border-success/40 bg-success/15 text-success',
        accent: 'text-success',
      }
    case 'likely_eligible':
      return {
        panel: 'border-accent/35 bg-accent/10',
        badge: 'border-accent/40 bg-accent/15 text-accent',
        accent: 'text-accent',
      }
    case 'unclear':
      return {
        panel: 'border-border bg-surface-muted',
        badge: 'border-border bg-surface-raised text-muted',
        accent: 'text-muted',
      }
    case 'unlikely':
    case 'ineligible':
      return {
        panel: 'border-danger/40 bg-danger/10',
        badge: 'border-danger/40 bg-danger/15 text-danger',
        accent: 'text-danger',
      }
  }
}

function ScoreMetric({
  label,
  helper,
  value,
}: {
  label: string
  helper: string
  value: number
}) {
  const tone = getScoreTone(value)

  return (
    <div className="rounded-control border border-border bg-surface-muted/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </p>
        <strong className={`text-2xl tabular-nums ${tone.text}`}>{value}%</strong>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${tone.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{helper}</p>
    </div>
  )
}

function SignalBadge({ flag }: { flag: WarningFlag }) {
  const { t } = useTranslation()
  const danger = DANGER_FLAGS.includes(flag)
  const positive = POSITIVE_FLAGS.includes(flag)

  return (
    <span
      className={
        danger
          ? 'inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger'
          : positive
            ? 'inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success'
            : 'inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted'
      }
    >
      {danger && <span aria-hidden>!</span>}
      {positive && <span aria-hidden>✓</span>}
      {t(`pages.cv.generate.compatibility.location.flags.${flag}`)}
    </span>
  )
}

export default function ProfileCompatibilityCard({
  compatibility,
  bare = false,
}: ProfileCompatibilityCardProps) {
  const { t } = useTranslation()
  const [animationProgress, setAnimationProgress] = useState(0)
  const { location } = compatibility
  const eligibilityTone = getEligibilityTone(location.eligibility)
  const labelKey = getScoreLabelKey(compatibility.score)
  const animatedScore = Math.round(compatibility.score * animationProgress)
  const animatedSkillsScore = Math.round(
    compatibility.skillsScore * animationProgress,
  )

  useEffect(() => {
    const durationMs = 650
    const start = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      setAnimationProgress(1 - (1 - progress) ** 3)
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }

    setAnimationProgress(0)
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [compatibility.score, compatibility.skillsScore])

  return (
    <section
      className={
        bare
          ? 'space-y-4'
          : 'match-frame space-y-4 rounded-card border-border bg-surface-muted p-4'
      }
    >
      <div className={`rounded-card border p-4 sm:p-5 ${eligibilityTone.panel}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.1em] ${eligibilityTone.accent}`}>
              {t('pages.cv.generate.compatibility.applicationSignal')}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-heading">
              {t(`pages.cv.generate.compatibility.location.eligibility.${location.eligibility}`)}
            </h3>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${eligibilityTone.badge}`}>
            {location.jobLocation || t('pages.cv.generate.compatibility.location.unknown')}
          </span>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          {location.verdict}
        </p>

        {location.warningFlags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {location.warningFlags.map((flag) => (
              <SignalBadge key={flag} flag={flag} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreMetric
          label={t('pages.cv.generate.compatibility.overallMatch')}
          helper={t(`pages.cv.generate.compatibility.level.${labelKey}`)}
          value={animatedScore}
        />
        <ScoreMetric
          label={t('pages.cv.generate.compatibility.skillsScore')}
          helper={t('pages.cv.generate.compatibility.skillsHint')}
          value={animatedSkillsScore}
        />
      </div>

      {compatibility.summary && (
        <p className="rounded-control border-l-2 border-accent bg-surface-muted/50 px-4 py-3 text-sm leading-6 text-muted">
          {compatibility.summary}
        </p>
      )}

      <div className="rounded-control border border-border bg-surface-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {t('pages.cv.generate.compatibility.location.details')}
        </p>
        <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">
              {t('pages.cv.generate.compatibility.location.candidate')}
            </dt>
            <dd className="mt-1 font-medium text-heading">
              {location.candidateLocation || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">
              {t('pages.cv.generate.compatibility.location.remotePolicy')}
            </dt>
            <dd className="mt-1 font-medium leading-5 text-heading">
              {location.remotePolicy || '—'}
            </dd>
          </div>
        </dl>

        {location.companySignalConfidence === 'inferred_from_knowledge' && (
          <p className="mt-3 text-xs leading-5 text-amber-400">
            {t('pages.cv.generate.compatibility.location.signal.inferred_from_knowledge')}
          </p>
        )}
        {location.companySignalConfidence === 'stated_in_posting' && (
          <p className="mt-3 text-xs leading-5 text-accent">
            {t('pages.cv.generate.compatibility.location.signal.stated_in_posting')}
          </p>
        )}

        {location.restrictions.length > 0 && (
          <details className="group mt-4 border-t border-border pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-body marker:content-none [&::-webkit-details-marker]:hidden">
              <span>
                {t('pages.cv.generate.compatibility.location.restrictions')} ({location.restrictions.length})
              </span>
              <span className="text-muted transition-transform group-open:rotate-180">▾</span>
            </summary>
            <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
              {location.restrictions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="shrink-0 text-danger">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {(compatibility.strengths.length > 0 || compatibility.gaps.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {compatibility.strengths.length > 0 && (
            <div className="rounded-control border border-success/25 bg-success/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-success">
                {t('pages.cv.generate.compatibility.strengths')}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-body">
                {compatibility.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0 text-success">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.gaps.length > 0 && (
            <div className="rounded-control border border-border bg-surface-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                {t('pages.cv.generate.compatibility.gaps')}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-muted">
                {compatibility.gaps.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0">–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
