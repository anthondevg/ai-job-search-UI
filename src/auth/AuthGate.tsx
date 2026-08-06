import { useState, type FormEvent } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import AppLogo from '../components/AppLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from './useAuth'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { session, isLoading, configurationError, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-surface-muted px-6 text-muted">
        <div className="mr-3 size-3 animate-pulse bg-accent" />
        <span className="font-mono text-xs uppercase tracking-[0.18em]">
          {t('auth.loading')}
        </span>
      </div>
    )
  }

  if (session) return children

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await signIn(email.trim(), password)
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : t('auth.signInFailed'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-surface-muted">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(#2a2f3a 1px, transparent 1px), linear-gradient(90deg, #2a2f3a 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div aria-hidden className="absolute -left-16 top-[14%] -z-10 size-44 bg-accent-subtle" />
      <div aria-hidden className="absolute bottom-0 right-[9%] -z-10 h-24 w-48 bg-warm-subtle" />
      <div aria-hidden className="absolute right-[6%] top-[9%] -z-10 size-10 bg-accent" />

      <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8">
        <AppLogo />
        <div className="w-28">
          <LanguageSwitcher compact />
        </div>
      </div>

      <div className="flex min-h-svh px-4 pb-16 pt-24 sm:px-8 sm:pt-28">
      <section className="m-auto grid w-full max-w-5xl overflow-hidden bg-surface-raised shadow-[0_32px_90px_rgba(0,0,0,0.38)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[590px] overflow-hidden bg-accent-subtle p-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              <span className="size-2 bg-accent" />
              {t('auth.eyebrow')}
            </div>
            <p className="max-w-md font-display text-4xl font-semibold leading-[1.08] text-heading">
              {t('auth.statement')}
            </p>
          </div>

          <div aria-hidden className="relative h-64 w-full max-w-md">
            <div className="absolute bottom-0 left-0 h-40 w-40 border-2 border-accent/50" />
            <div className="absolute bottom-8 left-24 h-36 w-52 bg-surface-raised" />
            <div className="absolute bottom-24 left-12 h-20 w-28 bg-accent" />
            <div className="absolute bottom-0 left-48 h-24 w-24 bg-warm" />
            <div className="absolute bottom-40 left-64 size-12 bg-success" />
            <div className="absolute bottom-[86px] left-[306px] h-0.5 w-24 bg-accent/60" />
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <span>{t('auth.analyze')}</span>
            <span className="h-px flex-1 bg-border" />
            <span>{t('auth.adapt')}</span>
            <span className="h-px flex-1 bg-border" />
            <span>{t('auth.apply')}</span>
          </div>
        </div>

        <div className="flex min-h-[540px] flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="size-3 bg-accent" />
            <div className="h-px flex-1 bg-border" />
            <div className="size-3 bg-warm" />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            {t('auth.secureAccess')}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-heading">
            {t('auth.title')}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            {t('auth.description')}
          </p>

          <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
            <label className="block font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
              {t('auth.email')}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-border bg-transparent px-0 py-3 font-sans text-base normal-case tracking-normal text-heading outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </label>

            <label className="block font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
              {t('auth.password')}
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border-0 border-b-2 border-border bg-transparent px-0 py-3 font-sans text-base normal-case tracking-normal text-heading outline-none transition-colors focus:border-accent"
              />
            </label>

            {(configurationError || error) && (
              <div role="alert" className="flex items-start gap-3 bg-danger-subtle px-4 py-3 text-sm text-danger">
                <span className="mt-1 size-2 shrink-0 bg-danger" />
                <p>{configurationError || error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || Boolean(configurationError)}
              className="mt-2 w-full bg-accent px-5 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
              }}
            >
              {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>
        </div>
      </section>
      </div>

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-8 sm:pb-32 sm:pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {t('auth.landingEyebrow')}
            </p>
            <h2 className="mt-5 max-w-md font-display text-3xl font-semibold leading-tight text-heading sm:text-4xl">
              {t('auth.landingTitle')}
            </h2>
          </div>

          <div className="flex items-end">
            <p className="max-w-xl text-base leading-7 text-muted">
              {t('auth.landingDescription')}
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <article className="relative min-h-64 overflow-hidden bg-surface-raised p-7">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-accent" />
            <span className="font-mono text-xs tracking-[0.18em] text-accent">01</span>
            <h3 className="mt-10 font-display text-xl font-semibold text-heading">
              {t('auth.sourceTitle')}
            </h3>
            <p className="mt-4 text-sm leading-6 text-muted">
              {t('auth.sourceDescription')}
            </p>
            <div aria-hidden className="absolute bottom-0 right-0 size-10 bg-accent-subtle" />
          </article>

          <article className="relative min-h-64 overflow-hidden bg-surface-raised p-7">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-warm" />
            <span className="font-mono text-xs tracking-[0.18em] text-warm">02</span>
            <h3 className="mt-10 font-display text-xl font-semibold text-heading">
              {t('auth.matchTitle')}
            </h3>
            <p className="mt-4 text-sm leading-6 text-muted">
              {t('auth.matchDescription')}
            </p>
            <div aria-hidden className="absolute bottom-0 right-0 size-10 bg-warm-subtle" />
          </article>

          <article className="relative min-h-64 overflow-hidden bg-surface-raised p-7">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-success" />
            <span className="font-mono text-xs tracking-[0.18em] text-success">03</span>
            <h3 className="mt-10 font-display text-xl font-semibold text-heading">
              {t('auth.documentsTitle')}
            </h3>
            <p className="mt-4 text-sm leading-6 text-muted">
              {t('auth.documentsDescription')}
            </p>
            <div aria-hidden className="absolute bottom-0 right-0 size-10 bg-success-subtle" />
          </article>
        </div>

        <div className="mt-4 grid overflow-hidden bg-accent-subtle md:grid-cols-[180px_1fr]">
          <div className="flex min-h-36 items-center justify-center bg-accent p-8 text-accent-foreground">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden className="size-16">
              <rect x="14" y="23" width="36" height="29" stroke="currentColor" strokeWidth="3" />
              <path d="M22 23v-7a10 10 0 0 1 20 0v7" stroke="currentColor" strokeWidth="3" />
              <rect x="29" y="34" width="6" height="9" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col justify-center px-7 py-9 sm:px-10">
            <h3 className="font-display text-2xl font-semibold text-heading">
              {t('auth.privacyTitle')}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {t('auth.privacyDescription')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
