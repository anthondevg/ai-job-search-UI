import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useTranslation'
import {
  addCompany,
  addManualJob,
  fetchJobMarketOverview,
  fetchJobPreferences,
  fetchJobs,
  followCompany,
  removeSource,
  saveJobPreferences,
  setSourceEnabled,
  syncJobMarket,
  updateJobState,
} from '../services/jobMarketService'
import { useActiveCvRecord } from '../stores/cvStore'
import { useJobDescriptionStore } from '../stores/jobDescriptionStore'
import type { Job, JobMarketOverview, JobPipelineStatus, JobSearchPreferences } from '../types/jobMarket'
import { DEFAULT_JOB_PREFERENCES } from '../types/jobMarket'

type View = 'market' | 'companies' | 'pipeline' | 'sources'

const COPY = {
  en: {
    eyebrow: 'Market intelligence / 02', title: 'Job Market Board', description: 'Discover authorized Web + AI opportunities, track applications, and prepare focused documents.',
    market: 'Market', companies: 'Companies', pipeline: 'Pipeline', sources: 'Sources', search: 'Search roles, skills, or companies', allSources: 'All sources',
    refresh: 'Refresh sources', refreshing: 'Refreshing…', addJob: 'Add external job', preferences: 'Search preferences', noJobs: 'No opportunities match these filters yet.',
    score: 'match', prepare: 'Prepare application', open: 'Open original', save: 'Save', loadMore: 'Load more', remoteFit: 'Location', source: 'Source',
    company: 'Company', role: 'Role', url: 'Job URL', location: 'Location', descriptionLabel: 'Description (optional)', cancel: 'Cancel', add: 'Add', notes: 'Notes',
    addCompany: 'Add company', careersUrl: 'Careers URL', websiteUrl: 'Website (optional)', followed: 'Following', follow: 'Follow', suggested: 'Suggested from matching jobs',
    noSources: 'No monitored sources yet.', lastSync: 'Last sync', never: 'Never', healthy: 'Healthy', error: 'Error', delete: 'Delete', attribution: 'Attribution',
    roles: 'Target roles', skills: 'Extra skills (comma separated)', remote: 'Prioritize remote', relocation: 'Include relocation', savePrefs: 'Save preferences',
    activeCv: 'Ranking with active CV', noCv: 'No active CV: ranking uses your saved preferences.', pipelineEmpty: 'Save a job to begin your application pipeline.',
  },
  es: {
    eyebrow: 'Inteligencia de mercado / 02', title: 'Tablero de oportunidades', description: 'Descubre oportunidades Web + AI autorizadas, sigue postulaciones y prepara documentos enfocados.',
    market: 'Mercado', companies: 'Empresas', pipeline: 'Pipeline', sources: 'Fuentes', search: 'Buscar roles, skills o empresas', allSources: 'Todas las fuentes',
    refresh: 'Actualizar fuentes', refreshing: 'Actualizando…', addJob: 'Agregar vacante externa', preferences: 'Preferencias de búsqueda', noJobs: 'Aún no hay oportunidades para estos filtros.',
    score: 'match', prepare: 'Preparar postulación', open: 'Abrir original', save: 'Guardar', loadMore: 'Cargar más', remoteFit: 'Ubicación', source: 'Fuente',
    company: 'Empresa', role: 'Cargo', url: 'URL de la vacante', location: 'Ubicación', descriptionLabel: 'Descripción (opcional)', cancel: 'Cancelar', add: 'Agregar', notes: 'Notas',
    addCompany: 'Agregar empresa', careersUrl: 'URL de careers', websiteUrl: 'Sitio web (opcional)', followed: 'Siguiendo', follow: 'Seguir', suggested: 'Sugerida por empleos relevantes',
    noSources: 'Aún no hay fuentes monitoreadas.', lastSync: 'Última sincronización', never: 'Nunca', healthy: 'Saludable', error: 'Error', delete: 'Eliminar', attribution: 'Atribución',
    roles: 'Roles objetivo', skills: 'Skills extra (separadas por coma)', remote: 'Priorizar remoto', relocation: 'Incluir relocation', savePrefs: 'Guardar preferencias',
    activeCv: 'Ranking con CV activo', noCv: 'Sin CV activo: el ranking usa tus preferencias guardadas.', pipelineEmpty: 'Guarda una vacante para iniciar tu pipeline.',
  },
}

const PIPELINE: JobPipelineStatus[] = ['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'withdrawn', 'archived']
const fieldClass = 'w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-body outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'
const buttonClass = 'rounded-control border border-border px-3 py-2 text-xs font-semibold text-body transition hover:border-accent hover:text-heading disabled:cursor-not-allowed disabled:opacity-50'

function formatDate(value: string | null, fallback: string) {
  if (!value) return fallback
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function JobCard({ job, selected, onSelect, onState }: { job: Job; selected: boolean; onSelect: () => void; onState: (status: JobPipelineStatus) => void }) {
  return (
    <article className={`rounded-card border bg-surface-raised p-4 transition ${selected ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]' : 'border-border hover:border-border-muted'}`}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{job.companyName}</p><h3 className="mt-1 font-display text-lg font-semibold text-heading">{job.title}</h3></div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent">{job.match.score}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-1">{job.location || 'Location unknown'}</span>
          <span className="rounded-full border border-border px-2 py-1">{job.provider}</span>
          {job.employmentType && <span className="rounded-full border border-border px-2 py-1">{job.employmentType}</span>}
          {job.pipelineStatus && <span className="rounded-full border border-success/30 bg-success-subtle px-2 py-1 text-success">{job.pipelineStatus}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">{job.match.reasons.map((reason) => <span key={reason}>• {reason}</span>)}</div>
      </button>
      <div className="mt-4 flex gap-2 border-t border-border pt-3">
        <button type="button" onClick={() => onState(job.pipelineStatus ?? 'saved')} className={buttonClass}>{job.pipelineStatus ?? 'Save'}</button>
        <a href={job.sourceUrl} target="_blank" rel="noreferrer" className={buttonClass}>{job.provider === 'remotive' ? 'Remotive ↗' : 'Apply ↗'}</a>
      </div>
    </article>
  )
}

export default function JobScraperMarket() {
  const { language } = useLanguage()
  const c = COPY[language]
  const navigate = useNavigate()
  const activeCv = useActiveCvRecord()
  const currentDescription = useJobDescriptionStore((state) => state.text)
  const setDescription = useJobDescriptionStore((state) => state.setText)
  const [view, setView] = useState<View>('market')
  const [jobs, setJobs] = useState<Job[]>([])
  const [trackedJobs, setTrackedJobs] = useState<Job[]>([])
  const [overview, setOverview] = useState<JobMarketOverview>({ companies: [], suggestions: [], sources: [] })
  const [preferences, setPreferences] = useState<JobSearchPreferences>(DEFAULT_JOB_PREFERENCES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [showCompany, setShowCompany] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [manual, setManual] = useState({ companyName: '', title: '', url: '', location: '', description: '' })
  const [companyForm, setCompanyForm] = useState({ name: '', careersUrl: '', websiteUrl: '' })

  const loadJobs = useCallback(async (append = false, cursor?: string | null) => {
    const data = await fetchJobs({ search, provider, cursor, profileId: activeCv?.id })
    setJobs((current) => append ? [...current, ...data.jobs] : data.jobs)
    setNextCursor(data.nextCursor)
    if (!append) setSelectedId(data.jobs[0]?.id ?? null)
  }, [activeCv?.id, provider, search])

  const loadOverview = useCallback(async () => setOverview(await fetchJobMarketOverview()), [])
  const loadPipeline = useCallback(async () => {
    const data = await fetchJobs({ pipeline: 'tracked', profileId: activeCv?.id, limit: 100 })
    setTrackedJobs(data.jobs)
  }, [activeCv?.id])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([loadJobs(), loadPipeline(), loadOverview(), fetchJobPreferences().then(setPreferences)])
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Failed to load job market'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [loadJobs, loadOverview, loadPipeline])

  const selected = jobs.find((job) => job.id === selectedId) ?? null
  const pipelineJobs = useMemo(() => trackedJobs.filter((job) => job.pipelineStatus), [trackedJobs])

  async function run(action: () => Promise<unknown>, refresh = true) {
    setBusy(true); setError(null)
    try { await action(); if (refresh) await Promise.all([loadJobs(), loadOverview()]) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Request failed') }
    finally { setBusy(false) }
  }

  async function setState(job: Job, status: JobPipelineStatus) {
    await run(() => updateJobState(job.id, status, job.notes), false)
    setJobs((current) => current.map((item) => item.id === job.id ? { ...item, pipelineStatus: status } : item))
    setTrackedJobs((current) => {
      const updated = { ...job, pipelineStatus: status }
      return current.some((item) => item.id === job.id) ? current.map((item) => item.id === job.id ? updated : item) : [updated, ...current]
    })
  }

  async function submitManual(event: FormEvent) {
    event.preventDefault()
    await run(async () => { await addManualJob(manual); setManual({ companyName: '', title: '', url: '', location: '', description: '' }); setShowManual(false) })
  }

  async function submitCompany(event: FormEvent) {
    event.preventDefault()
    await run(async () => { await addCompany(companyForm); setCompanyForm({ name: '', careersUrl: '', websiteUrl: '' }); setShowCompany(false) })
  }

  async function prepare(job: Job) {
    if (currentDescription.trim() && currentDescription.trim() !== job.description.trim()) {
      const replace = window.confirm(language === 'es' ? 'Ya tienes otra oferta en el flujo de CV. ¿Quieres reemplazarla?' : 'Another posting is already in the CV workflow. Replace it?')
      if (!replace) return
    }
    setDescription([job.title, job.companyName, job.location, job.description].filter(Boolean).join('\n\n'))
    await setState(job, 'preparing')
    navigate('/cv?tab=generate')
  }

  const tabs: Array<{ id: View; label: string; count?: number }> = [
    { id: 'market', label: c.market, count: jobs.length }, { id: 'companies', label: c.companies, count: overview.companies.length },
    { id: 'pipeline', label: c.pipeline, count: pipelineJobs.length }, { id: 'sources', label: c.sources, count: overview.sources.length },
  ]

  return (
    <div className="match-page flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <header className="match-page-header mb-6 pb-5 sm:mb-8 sm:pb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{c.eyebrow}</p><h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">{c.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{c.description}</p></div>
          <div className="flex gap-2"><button type="button" onClick={() => setShowManual(true)} className={buttonClass}>+ {c.addJob}</button><button type="button" disabled={busy} onClick={() => run(() => syncJobMarket())} className={`${buttonClass} border-accent bg-accent/10 text-accent`}>{busy ? c.refreshing : c.refresh}</button></div>
        </div>
      </header>

      <div className="match-frame overflow-hidden rounded-panel border border-border bg-surface-raised">
        <div role="tablist" className="flex overflow-x-auto border-b border-border bg-surface-muted/60 p-2">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setView(tab.id)} className={`rounded-control px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] ${view === tab.id ? 'bg-surface-raised text-heading shadow-sm' : 'text-muted hover:text-body'}`}>{tab.label}{tab.count !== undefined && <span className="ml-2 text-accent">{tab.count}</span>}</button>)}
        </div>
        {error && <div role="alert" className="m-4 rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>}

        {view === 'market' && <div className="p-4 sm:p-6">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_11rem_auto]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={c.search} className={fieldClass} />
            <select value={provider} onChange={(event) => setProvider(event.target.value)} className={fieldClass}><option value="all">{c.allSources}</option>{['greenhouse','lever','ashby','remotive','external'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <button type="button" onClick={() => setShowPrefs((value) => !value)} className={buttonClass}>{c.preferences}</button>
          </div>
          {showPrefs && <form onSubmit={(event) => { event.preventDefault(); void run(async () => { setPreferences(await saveJobPreferences(preferences)); await loadJobs() }, false) }} className="mb-5 grid gap-4 rounded-card border border-border bg-surface p-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-muted">{c.roles}<input value={preferences.roleFamilies.join(', ')} onChange={(event) => setPreferences({ ...preferences, roleFamilies: event.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} className={`${fieldClass} mt-2`} /></label>
            <label className="text-xs font-semibold text-muted">{c.skills}<input value={preferences.skills.join(', ')} onChange={(event) => setPreferences({ ...preferences, skills: event.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} className={`${fieldClass} mt-2`} /></label>
            <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={preferences.remote} onChange={(event) => setPreferences({ ...preferences, remote: event.target.checked })} />{c.remote}</label>
            <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={preferences.relocation} onChange={(event) => setPreferences({ ...preferences, relocation: event.target.checked })} />{c.relocation}</label>
            <div className="md:col-span-2"><button disabled={busy} className={`${buttonClass} border-accent text-accent`}>{c.savePrefs}</button></div>
          </form>}
          <p className="mb-4 text-xs text-muted">{activeCv ? `${c.activeCv}: ${activeCv.fileName}` : c.noCv}</p>
          {loading ? <div className="py-16 text-center text-sm text-muted">Loading market…</div> : jobs.length === 0 ? <div className="py-16 text-center text-sm text-muted">{c.noJobs}</div> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
            <div className="space-y-3">{jobs.map((job) => <JobCard key={job.id} job={job} selected={job.id === selectedId} onSelect={() => setSelectedId(job.id)} onState={(status) => void setState(job, status)} />)}{nextCursor && <button type="button" disabled={busy} onClick={() => run(() => loadJobs(true, nextCursor), false)} className={`${buttonClass} w-full`}>{c.loadMore}</button>}</div>
            {selected && <aside className="sticky top-4 self-start rounded-card border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{selected.companyName}</p><h2 className="mt-2 font-display text-2xl font-semibold text-heading">{selected.title}</h2><p className="mt-2 text-sm text-muted">{selected.location || 'Location unknown'} · {formatDate(selected.postedAt, 'Date unknown')}</p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] uppercase text-muted">{[['Role',selected.match.roleScore],['Skills',selected.match.skillScore],['Place',selected.match.locationScore],['Fresh',selected.match.freshnessScore]].map(([label,value]) => <div key={label} className="rounded-control border border-border p-2"><strong className="block text-base text-heading">{value}</strong>{label}</div>)}</div>
              {selected.salaryText && <p className="mt-4 rounded-control border border-success/30 bg-success-subtle p-3 text-sm text-success">{selected.salaryText}</p>}
              <p className="mt-5 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-body">{selected.description || 'No description supplied. Open the original posting for details.'}</p>
              <label className="mt-4 block text-xs font-semibold text-muted">{c.notes}<textarea value={selected.notes} onChange={(event) => setJobs((current) => current.map((item) => item.id === selected.id ? { ...item, notes: event.target.value } : item))} onBlur={() => selected.pipelineStatus && void updateJobState(selected.id, selected.pipelineStatus, selected.notes)} rows={3} className={`${fieldClass} mt-2 resize-y`} /></label>
              <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => void prepare(selected)} className={`${buttonClass} border-accent bg-accent text-white`}>{c.prepare}</button><a href={selected.sourceUrl} target="_blank" rel="noreferrer" className={`${buttonClass} text-center`}>{c.open} ↗</a></div>
              {selected.provider === 'remotive' && <p className="mt-3 text-center text-[11px] text-muted">Source: Remotive</p>}
            </aside>}
          </div>}
        </div>}

        {view === 'pipeline' && <div className="p-4 sm:p-6">{pipelineJobs.length === 0 ? <p className="py-16 text-center text-sm text-muted">{c.pipelineEmpty}</p> : <div className="grid gap-4 lg:grid-cols-4">{PIPELINE.map((status) => <section key={status} className="min-h-40 rounded-card border border-border bg-surface p-3"><h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{status} <span className="text-accent">{pipelineJobs.filter((job) => job.pipelineStatus === status).length}</span></h2><div className="space-y-2">{pipelineJobs.filter((job) => job.pipelineStatus === status).map((job) => <button key={job.id} type="button" onClick={() => { setSelectedId(job.id); setView('market') }} className="w-full rounded-control border border-border bg-surface-raised p-3 text-left"><strong className="block text-sm text-heading">{job.title}</strong><span className="text-xs text-muted">{job.companyName}</span><select value={status} onClick={(event) => event.stopPropagation()} onChange={(event) => void setState(job, event.target.value as JobPipelineStatus)} className={`${fieldClass} mt-2 py-1 text-xs`}>{PIPELINE.map((item) => <option key={item}>{item}</option>)}</select></button>)}</div></section>)}</div>}</div>}

        {view === 'companies' && <div className="p-4 sm:p-6"><div className="mb-5 flex justify-end"><button type="button" onClick={() => setShowCompany(true)} className={buttonClass}>+ {c.addCompany}</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[...overview.suggestions, ...overview.companies].map((company) => <div key={`${company.suggested}-${company.id}`} className="rounded-card border border-border bg-surface p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold text-heading">{company.name}</h3><p className="mt-1 text-xs text-muted">{company.integrationType} · {company.activeJobCount} jobs</p></div>{company.suggested && <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] text-accent">{c.suggested}</span>}</div><div className="mt-4 flex gap-2"><a href={company.careersUrl} target="_blank" rel="noreferrer" className={buttonClass}>{c.open} ↗</a>{!company.followed && <button type="button" onClick={() => run(() => followCompany(company.id))} className={buttonClass}>{c.follow}</button>}{company.followed && <span className="px-2 py-2 text-xs text-success">✓ {c.followed}</span>}</div></div>)}</div></div>}

        {view === 'sources' && <div className="p-4 sm:p-6">{overview.sources.length === 0 ? <p className="py-16 text-center text-sm text-muted">{c.noSources}</p> : <div className="space-y-3">{overview.sources.map((source) => <div key={source.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-4"><div><div className="flex items-center gap-2"><strong className="text-heading">{source.companyName || source.boardKey}</strong><span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted">{source.provider}</span><span className={`size-2 rounded-full ${source.status === 'healthy' ? 'bg-success' : source.status === 'error' ? 'bg-danger' : 'bg-muted'}`} /></div><p className="mt-1 text-xs text-muted">{c.lastSync}: {formatDate(source.lastSyncedAt, c.never)}{source.attribution ? ` · ${c.attribution}: ${source.attribution}` : ''}</p>{source.lastError && <p className="mt-1 text-xs text-danger">{source.lastError}</p>}</div><div className="flex gap-2"><button type="button" onClick={() => run(() => setSourceEnabled(source.id, !source.enabled))} className={buttonClass}>{source.enabled ? 'Pause' : 'Enable'}</button><a href={source.sourceUrl} target="_blank" rel="noreferrer" className={buttonClass}>{c.open} ↗</a>{source.provider !== 'remotive' && <button type="button" onClick={() => run(() => removeSource(source.id))} className={buttonClass}>{c.delete}</button>}</div></div>)}</div>}</div>}
      </div>

      {(showManual || showCompany) && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"><form onSubmit={showManual ? submitManual : submitCompany} className="w-full max-w-xl rounded-panel border border-border bg-surface-raised p-5 shadow-2xl"><h2 className="font-display text-2xl font-semibold text-heading">{showManual ? c.addJob : c.addCompany}</h2><div className="mt-5 grid gap-4">{showManual ? <>
        <label className="text-xs font-semibold text-muted">{c.company}<input required value={manual.companyName} onChange={(event) => setManual({ ...manual, companyName: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.role}<input required value={manual.title} onChange={(event) => setManual({ ...manual, title: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.url}<input required type="url" value={manual.url} onChange={(event) => setManual({ ...manual, url: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.location}<input value={manual.location} onChange={(event) => setManual({ ...manual, location: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.descriptionLabel}<textarea rows={6} value={manual.description} onChange={(event) => setManual({ ...manual, description: event.target.value })} className={`${fieldClass} mt-2`} /></label>
      </> : <><label className="text-xs font-semibold text-muted">{c.company}<input required value={companyForm.name} onChange={(event) => setCompanyForm({ ...companyForm, name: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.careersUrl}<input required type="url" value={companyForm.careersUrl} onChange={(event) => setCompanyForm({ ...companyForm, careersUrl: event.target.value })} className={`${fieldClass} mt-2`} /></label><label className="text-xs font-semibold text-muted">{c.websiteUrl}<input type="url" value={companyForm.websiteUrl} onChange={(event) => setCompanyForm({ ...companyForm, websiteUrl: event.target.value })} className={`${fieldClass} mt-2`} /></label></>}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setShowManual(false); setShowCompany(false) }} className={buttonClass}>{c.cancel}</button><button disabled={busy} className={`${buttonClass} border-accent bg-accent text-white`}>{c.add}</button></div></form></div>}
    </div>
  )
}
