import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { useTranslation } from '../hooks/useTranslation'

type ProfileMetadata = {
  full_name?: string
  target_role?: string
  location?: string
  linkedin_url?: string
  portfolio_url?: string
}

const inputClassName = 'match-frame match-input mt-2 w-full rounded-control bg-surface px-3 py-2.5 text-sm text-heading outline-none placeholder:text-muted'

export default function Profile() {
  const { session, updateUser } = useAuth()
  const { t } = useTranslation()
  const user = session?.user
  const metadata = (user?.user_metadata ?? {}) as ProfileMetadata
  const [profile, setProfile] = useState<ProfileMetadata>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState<'profile' | 'email' | 'password' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setProfile({
      full_name: metadata.full_name ?? '',
      target_role: metadata.target_role ?? '',
      location: metadata.location ?? '',
      linkedin_url: metadata.linkedin_url ?? '',
      portfolio_url: metadata.portfolio_url ?? '',
    })
    setEmail(user?.email ?? '')
  }, [
    user?.id,
    user?.email,
    metadata.full_name,
    metadata.target_role,
    metadata.location,
    metadata.linkedin_url,
    metadata.portfolio_url,
  ])

  const initials = useMemo(() => {
    const source = profile.full_name || user?.email || ''
    return source.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '—'
  }, [profile.full_name, user?.email])

  const save = async (kind: 'profile' | 'email' | 'password', event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    if (kind === 'password' && password.length < 8) {
      setError(t('pages.profile.errors.passwordLength'))
      return
    }
    setSaving(kind)
    try {
      if (kind === 'profile') await updateUser({ data: { ...metadata, ...profile } })
      if (kind === 'email') await updateUser({ email: email.trim() })
      if (kind === 'password') {
        await updateUser({ password })
        setPassword('')
      }
      setNotice(kind === 'email' ? t('pages.profile.emailConfirmation') : t('pages.profile.saved'))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('pages.profile.errors.save'))
    } finally {
      setSaving(null)
    }
  }

  if (!user) return null

  return (
    <div className="match-page mx-auto w-full max-w-6xl px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <header className="match-page-header pb-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Account / 01</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-heading">{t('pages.profile.title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{t('pages.profile.description')}</p>
      </header>

      {(notice || error) && <div role={error ? 'alert' : 'status'} className={`mt-6 border-l-4 px-4 py-3 text-sm ${error ? 'border-danger bg-danger-subtle text-danger' : 'border-success bg-success-subtle text-success'}`}>{error || notice}</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="match-rail match-rail-accent rounded-panel bg-surface-raised p-5 sm:p-7">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <div aria-label={t('pages.profile.initials')} className="flex size-14 items-center justify-center rounded-card border-2 border-accent bg-accent font-mono text-lg font-bold text-accent-foreground">{initials}</div>
            <div><h2 className="font-display text-2xl font-semibold text-heading">{t('pages.profile.identity')}</h2><p className="mt-1 text-sm text-muted">{user.email}</p></div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={(event) => void save('profile', event)}>
            <Field label={t('pages.profile.fullName')} value={profile.full_name ?? ''} onChange={(value) => setProfile((current) => ({ ...current, full_name: value }))} />
            <Field label={t('pages.profile.role')} value={profile.target_role ?? ''} onChange={(value) => setProfile((current) => ({ ...current, target_role: value }))} />
            <Field label={t('pages.profile.location')} value={profile.location ?? ''} onChange={(value) => setProfile((current) => ({ ...current, location: value }))} />
            <Field label={t('pages.profile.linkedin')} type="url" value={profile.linkedin_url ?? ''} onChange={(value) => setProfile((current) => ({ ...current, linkedin_url: value }))} />
            <Field label={t('pages.profile.portfolio')} type="url" value={profile.portfolio_url ?? ''} onChange={(value) => setProfile((current) => ({ ...current, portfolio_url: value }))} />
            <SaveButton label={t('pages.profile.saveProfile')} saving={saving === 'profile'} />
          </form>
        </section>

        <section className="match-rail match-rail-warm rounded-panel bg-surface-raised p-5 sm:p-7">
          <h2 className="font-display text-2xl font-semibold text-heading">{t('pages.profile.account')}</h2>
          <form className="mt-6 border-b border-border pb-7" onSubmit={(event) => void save('email', event)}>
            <Field label={t('pages.profile.email')} type="email" value={email} onChange={setEmail} required />
            <p className="mt-2 text-xs leading-5 text-muted">{t('pages.profile.emailHint')}</p>
            <SaveButton label={t('pages.profile.saveEmail')} saving={saving === 'email'} />
          </form>
          <form className="mt-7" onSubmit={(event) => void save('password', event)}>
            <Field label={t('pages.profile.newPassword')} type="password" value={password} onChange={setPassword} autoComplete="new-password" />
            <p className="mt-2 text-xs leading-5 text-muted">{t('pages.profile.passwordHint')}</p>
            <SaveButton label={t('pages.profile.savePassword')} saving={saving === 'password'} />
          </form>
        </section>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string }) {
  return <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}<input className={inputClassName} type={type} value={value} required={required} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} /></label>
}

function SaveButton({ label, saving }: { label: string; saving: boolean }) {
  const { t } = useTranslation()
  return <button type="submit" disabled={saving} className="match-button mt-6 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60">{saving ? t('pages.profile.saving') : label}</button>
}
