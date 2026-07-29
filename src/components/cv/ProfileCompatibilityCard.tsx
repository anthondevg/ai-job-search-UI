import { useEffect, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  LocationEligibility,
  ProfileCompatibility,
  WarningFlag,
} from '../../types/compatibility'

const RING_RADIUS = 54
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type ProfileCompatibilityCardProps = {
  compatibility: ProfileCompatibility
  bare?: boolean
}

function getScoreTone(score: number) {
  if (score >= 75) {
    return {
      ring: 'stroke-success',
      text: 'text-success',
      glow: 'shadow-[0_0_24px_rgba(142,196,180,0.2)]',
    }
  }

  if (score >= 50) {
    return {
      ring: 'stroke-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_24px_rgba(154,175,217,0.18)]',
    }
  }

  return {
    ring: 'stroke-danger',
    text: 'text-danger',
    glow: 'shadow-[0_0_24px_rgba(200,176,184,0.14)]',
  }
}

function getScoreLabelKey(score: number) {
  if (score >= 75) return 'strong' as const
  if (score >= 50) return 'good' as const
  if (score >= 25) return 'partial' as const
  return 'weak' as const
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

function isDangerFlag(flag: WarningFlag): boolean {
  return DANGER_FLAGS.includes(flag)
}

function isPositiveFlag(flag: WarningFlag): boolean {
  return POSITIVE_FLAGS.includes(flag)
}

function getEligibilityBadge(eligibility: LocationEligibility) {
  switch (eligibility) {
    case 'eligible':
      return 'bg-success/20 text-success border border-success/40'
    case 'likely_eligible':
      return 'bg-accent/20 text-accent border border-accent/40'
    case 'unclear':
      return 'bg-surface-tab text-muted border border-border'
    case 'unlikely':
    case 'ineligible':
      return 'bg-danger/20 text-danger border border-danger/40'
  }
}

function getEligibilityRail(eligibility: LocationEligibility) {
  switch (eligibility) {
    case 'eligible':
      return 'border-l-success'
    case 'likely_eligible':
      return 'border-l-accent'
    case 'unclear':
      return 'border-l-border'
    case 'unlikely':
    case 'ineligible':
      return 'border-l-danger'
  }
}

export default function ProfileCompatibilityCard({
  compatibility,
  bare = false,
}: ProfileCompatibilityCardProps) {
  const { t } = useTranslation()
  const [animatedScore, setAnimatedScore] = useState(0)
  const targetScore = compatibility.score
  const tone = getScoreTone(targetScore)
  const labelKey = getScoreLabelKey(targetScore)
  const ringOffset =
    RING_CIRCUMFERENCE - (animatedScore / 100) * RING_CIRCUMFERENCE
  const { location } = compatibility
  const showSkillsBreakdown = compatibility.skillsScore !== compatibility.score

  useEffect(() => {
    const durationMs = 900
    const start = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      setAnimatedScore(Math.round(targetScore * eased))

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    setAnimatedScore(0)
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [targetScore])

  return (
    <section
      className={
        bare
          ? 'space-y-5'
          : `match-frame rounded-card border-border bg-surface-muted p-4 transition-shadow duration-700 ${tone.glow}`
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto flex size-36 shrink-0 items-center justify-center sm:mx-0">
          <svg
            className="-rotate-90"
            width="144"
            height="144"
            viewBox="0 0 144 144"
            aria-hidden
          >
            <circle
              cx="72"
              cy="72"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-border"
            />
            <circle
              cx="72"
              cy="72"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={`${tone.ring} transition-[stroke-dashoffset] duration-150`}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-semibold tabular-nums ${tone.text}`}>
              {animatedScore}%
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              {t('pages.cv.generate.compatibility.match')}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            {!bare && (
              <h2 className="font-display text-base font-semibold text-heading">
                {t('pages.cv.generate.compatibility.title')}
              </h2>
            )}
            <p className={`text-sm font-medium text-body ${bare ? '' : 'mt-1'}`}>
              {t(`pages.cv.generate.compatibility.level.${labelKey}`)}
            </p>
            {showSkillsBreakdown && (
              <p className="mt-1 text-xs text-muted">
                {t('pages.cv.generate.compatibility.skillsScore')}:{' '}
                <span className="font-medium text-body">
                  {compatibility.skillsScore}%
                </span>
              </p>
            )}
            {compatibility.summary && (
              <p className="mt-2 text-sm text-muted">{compatibility.summary}</p>
            )}
          </div>

          <div className="match-frame rounded-card border-border bg-surface-muted/80">
            <div className={`border-l-4 rounded-l-[calc(0.875rem-1px)] ${getEligibilityRail(location.eligibility)}`}>
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {t('pages.cv.generate.compatibility.location.title')}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${getEligibilityBadge(location.eligibility)}`}>
                        {t(`pages.cv.generate.compatibility.location.eligibility.${location.eligibility}`)}
                      </span>
                      <span className="text-xs text-muted">
                        {location.jobLocation && `${location.jobLocation}`}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-body">
                  {location.verdict}
                </p>

                {location.warningFlags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {location.warningFlags.map((flag) => {
                      const danger = isDangerFlag(flag)
                      const positive = isPositiveFlag(flag)
                      return (
                        <span
                          key={flag}
                          className={
                            danger
                              ? 'inline-flex items-center gap-1 rounded border border-danger/30 bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger'
                              : positive
                                ? 'inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success'
                                : 'inline-flex items-center gap-1 rounded border border-border bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted'
                          }
                        >
                          {danger && <span className="text-[10px]">⚠</span>}
                          {positive && <span className="text-[10px]">✓</span>}
                          {t(`pages.cv.generate.compatibility.location.flags.${flag}`)}
                        </span>
                      )
                    })}
                  </div>
                )}

                {location.companySignalConfidence === 'inferred_from_knowledge' && (
                  <p className="mt-3 text-xs leading-relaxed text-amber-400">
                    {t('pages.cv.generate.compatibility.location.signal.inferred_from_knowledge')}
                  </p>
                )}
                {location.companySignalConfidence === 'stated_in_posting' && (
                  <p className="mt-3 text-xs leading-relaxed text-accent">
                    {t('pages.cv.generate.compatibility.location.signal.stated_in_posting')}
                  </p>
                )}

                <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">
                      {t('pages.cv.generate.compatibility.location.candidate')}
                    </p>
                    <p className="mt-0.5 font-medium text-heading">
                      {location.candidateLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">
                      {t('pages.cv.generate.compatibility.location.remotePolicy')}
                    </p>
                    <p className="mt-0.5 font-medium text-heading">
                      {location.remotePolicy || '—'}
                    </p>
                  </div>
                </div>

                {location.restrictions.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Restrictions
                    </p>
                    <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-body">
                      {location.restrictions.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-0.5 shrink-0 text-muted">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {compatibility.strengths.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-success">
                {t('pages.cv.generate.compatibility.strengths')}
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-body">
                {compatibility.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-success">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.gaps.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t('pages.cv.generate.compatibility.gaps')}
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-muted">
                {compatibility.gaps.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span>−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
