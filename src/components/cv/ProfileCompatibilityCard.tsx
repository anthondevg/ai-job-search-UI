import { useEffect, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  LocationEligibility,
  ProfileCompatibility,
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

function getEligibilityTone(eligibility: LocationEligibility) {
  switch (eligibility) {
    case 'eligible':
      return 'match-rail match-rail-success bg-success-subtle text-success'
    case 'likely_eligible':
      return 'match-rail match-rail-accent bg-accent-subtle text-accent'
    case 'unclear':
      return 'match-frame border-border bg-surface-raised text-muted'
    case 'unlikely':
    case 'ineligible':
      return 'match-rail match-rail-danger bg-danger-subtle text-danger'
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
  const locationTone = getEligibilityTone(location.eligibility)
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

          <div className={`rounded-control p-3 ${locationTone}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              {t('pages.cv.generate.compatibility.location.title')}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {t(
                `pages.cv.generate.compatibility.location.eligibility.${location.eligibility}`,
              )}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{location.verdict}</p>

            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="opacity-70">
                  {t('pages.cv.generate.compatibility.location.candidate')}
                </dt>
                <dd className="font-medium">{location.candidateLocation}</dd>
              </div>
              <div>
                <dt className="opacity-70">
                  {t('pages.cv.generate.compatibility.location.job')}
                </dt>
                <dd className="font-medium">
                  {location.jobLocation || '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="opacity-70">
                  {t('pages.cv.generate.compatibility.location.remotePolicy')}
                </dt>
                <dd className="font-medium">
                  {location.remotePolicy || '—'}
                </dd>
              </div>
            </dl>

            {location.restrictions.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs leading-relaxed">
                {location.restrictions.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
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
