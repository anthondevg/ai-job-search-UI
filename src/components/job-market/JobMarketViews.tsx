import type { Dispatch, FormEvent, RefObject, SetStateAction } from 'react'
import type {
  Company,
  Job,
  JobPipelineStatus,
  JobSearchPreferences,
  JobSource,
} from '../../types/jobMarket'
import JobAnalysisWidget from './JobAnalysisWidget'
import {
  BUTTON_CLASS,
  FIELD_CLASS,
  PIPELINE_STATUSES,
  eligibilityTone,
  formatJobDate,
  type CompanyForm,
  type EligibilityFilter,
  type JobMarketCopy,
  type ManualJobForm,
  type RelevanceFilter,
} from './jobMarketUi'

type JobCardProps = {
  job: Job
  selected: boolean
  copy: JobMarketCopy
  onSelect: () => void
  onState: (status: JobPipelineStatus) => void
}

function JobCard({ job, selected, copy, onSelect, onState }: JobCardProps) {
  return (
    <article
      className={`rounded-card border bg-surface-raised p-4 transition ${
        selected
          ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]'
          : 'border-border hover:border-border-muted'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              {job.companyName}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-heading">
              {job.title}
            </h3>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent">
            {job.match.score}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-1">
            {job.location || 'Location unknown'}
          </span>
          <span className="rounded-full border border-border px-2 py-1">
            {job.provider}
          </span>
          <span className={`rounded-full border px-2 py-1 ${eligibilityTone(job.eligibility)}`}>
            {job.eligibility}
          </span>
          {job.employmentType && (
            <span className="rounded-full border border-border px-2 py-1">
              {job.employmentType}
            </span>
          )}
          {job.pipelineStatus && (
            <span className="rounded-full border border-success/30 bg-success-subtle px-2 py-1 text-success">
              {job.pipelineStatus}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          {job.match.reasons.map((reason) => (
            <span key={reason}>• {reason}</span>
          ))}
        </div>
      </button>

      <div className="mt-4 flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => onState(job.pipelineStatus ?? 'saved')}
          className={BUTTON_CLASS}
        >
          {job.pipelineStatus ?? copy.save}
        </button>
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={BUTTON_CLASS}
        >
          {job.provider === 'remotive' ? 'Remotive ↗' : 'Apply ↗'}
        </a>
      </div>
    </article>
  )
}

type JobDetailProps = {
  job: Job
  copy: JobMarketCopy
  detailRef: RefObject<HTMLElement | null>
  mobileOpen: boolean
  analysisActive: boolean
  analysisAvailable: boolean
  onCloseMobile: () => void
  onCloseAnalysis: () => void
  onAnalyze: () => void
  onPrepare: () => void
  onNotesChange: (notes: string) => void
  onNotesSave: () => void
}

function JobDetail({
  job,
  copy,
  detailRef,
  mobileOpen,
  analysisActive,
  analysisAvailable,
  onCloseMobile,
  onCloseAnalysis,
  onAnalyze,
  onPrepare,
  onNotesChange,
  onNotesSave,
}: JobDetailProps) {
  const eligibilityLabel =
    job.eligibility === 'unknown'
      ? copy.review
      : job.eligibility === 'restricted'
        ? copy.exploreAll
        : copy.applicable

  const scoreFactors = [
    ['Role', job.match.roleScore],
    ['Skills', job.match.skillScore],
    ['Place', job.match.locationScore],
    ['Fresh', job.match.freshnessScore],
  ] as const

  return (
    <aside
      ref={detailRef}
      className={`${
        mobileOpen
          ? 'max-xl:fixed max-xl:inset-3 max-xl:z-[90] max-xl:overflow-y-auto max-xl:shadow-2xl'
          : 'max-xl:hidden'
      } self-start rounded-card border border-border bg-surface p-5 sm:p-6 lg:p-7 xl:h-full xl:overflow-y-auto`}
    >
      <button
        type="button"
        onClick={onCloseMobile}
        className={`${BUTTON_CLASS} mb-4 xl:hidden`}
      >
        {copy.backToResults}
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {job.companyName}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-heading">
        {job.title}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {job.location || 'Location unknown'} · {formatJobDate(job.postedAt, 'Date unknown')}
      </p>
      <p
        className={`mt-2 text-xs font-semibold uppercase tracking-[0.1em] ${
          job.eligibility === 'unknown'
            ? 'text-accent'
            : job.eligibility === 'restricted'
              ? 'text-danger'
              : 'text-success'
        }`}
      >
        {eligibilityLabel}
      </p>

      <div
        role="tablist"
        aria-label={copy.analysisWidget}
        className="mt-5 grid grid-cols-2 rounded-control border border-border bg-surface-muted p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!analysisActive}
          onClick={onCloseAnalysis}
          className={`rounded-control px-3 py-2 text-xs font-semibold transition ${
            !analysisActive
              ? 'bg-surface-raised text-heading shadow-sm'
              : 'text-muted hover:text-body'
          }`}
        >
          {copy.jobTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={analysisActive}
          onClick={onAnalyze}
          className={`rounded-control px-3 py-2 text-xs font-semibold transition ${
            analysisActive
              ? 'bg-accent text-white shadow-sm'
              : 'text-accent hover:bg-accent/10'
          }`}
        >
          {analysisAvailable ? copy.analysisTab : copy.analyze}
        </button>
      </div>

      {analysisAvailable && (
        <div hidden={!analysisActive}>
          <JobAnalysisWidget job={job} copy={copy} />
        </div>
      )}

      <div hidden={analysisActive}>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] uppercase text-muted">
          {scoreFactors.map(([label, value]) => (
            <div key={label} className="rounded-control border border-border p-2">
              <strong className="block text-base text-heading">{value}</strong>
              {label}
            </div>
          ))}
        </div>

        {job.salaryText && (
          <p className="mt-4 rounded-control border border-success/30 bg-success-subtle p-3 text-sm text-success">
            {job.salaryText}
          </p>
        )}

        <section className="mt-6 border-t border-border pt-5">
          <h3 className="mb-4 font-display text-lg font-semibold text-heading">
            {copy.jobDescription}
          </h3>
          <div className="min-h-[30rem] whitespace-pre-wrap pr-3 text-[15px] leading-7 text-body">
            {job.description || 'No description supplied. Open the original posting for details.'}
          </div>
        </section>

        <label className="mt-4 block text-xs font-semibold text-muted">
          {copy.notes}
          <textarea
            value={job.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            onBlur={onNotesSave}
            rows={3}
            className={`${FIELD_CLASS} mt-2 resize-y`}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onPrepare}
          className={`${BUTTON_CLASS} border-accent bg-accent text-white`}
        >
          {copy.prepare}
        </button>
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={`${BUTTON_CLASS} text-center`}
        >
          {copy.open} ↗
        </a>
      </div>

      {job.provider === 'remotive' && (
        <p className="mt-3 text-center text-[11px] text-muted">Source: Remotive</p>
      )}
    </aside>
  )
}

type MarketViewProps = {
  copy: JobMarketCopy
  activeCvName: string | null
  jobs: Job[]
  selectedJob: Job | null
  analysisJob: Job | null
  analysisOpen: boolean
  selectedId: string | null
  nextCursor: string | null
  loading: boolean
  busy: boolean
  search: string
  provider: string
  eligibility: EligibilityFilter
  relevance: RelevanceFilter
  showPreferences: boolean
  preferences: JobSearchPreferences
  mobileDetailOpen: boolean
  detailRef: RefObject<HTMLElement | null>
  onSearchChange: (value: string) => void
  onProviderChange: (value: string) => void
  onEligibilityChange: (value: EligibilityFilter) => void
  onRelevanceChange: (value: RelevanceFilter) => void
  onTogglePreferences: () => void
  onPreferencesChange: Dispatch<SetStateAction<JobSearchPreferences>>
  onPreferencesSubmit: (event: FormEvent) => void
  onSelectJob: (job: Job) => void
  onStateChange: (job: Job, status: JobPipelineStatus) => void
  onLoadMore: () => void
  onCloseMobile: () => void
  onAnalyze: (job: Job) => void
  onCloseAnalysis: () => void
  onPrepare: (job: Job) => void
  onNotesChange: (jobId: string, notes: string) => void
  onNotesSave: (job: Job) => void
}

export function MarketView(props: MarketViewProps) {
  const {
    copy,
    activeCvName,
    jobs,
    selectedJob,
    analysisJob,
    analysisOpen,
    selectedId,
    nextCursor,
    loading,
    busy,
    search,
    provider,
    eligibility,
    relevance,
    showPreferences,
    preferences,
    mobileDetailOpen,
    detailRef,
  } = props

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_10rem_13rem_12rem_auto]">
        <input
          value={search}
          onChange={(event) => props.onSearchChange(event.target.value)}
          placeholder={copy.search}
          className={FIELD_CLASS}
        />
        <select
          value={provider}
          onChange={(event) => props.onProviderChange(event.target.value)}
          className={FIELD_CLASS}
        >
          <option value="all">{copy.allSources}</option>
          {['greenhouse', 'lever', 'ashby', 'remotive', 'external'].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={eligibility}
          onChange={(event) =>
            props.onEligibilityChange(event.target.value as EligibilityFilter)
          }
          className={FIELD_CLASS}
        >
          <option value="eligible">{copy.applicable}</option>
          <option value="review">{copy.review}</option>
          <option value="all">{copy.exploreAll}</option>
        </select>
        <select
          value={relevance}
          onChange={(event) =>
            props.onRelevanceChange(event.target.value as RelevanceFilter)
          }
          className={FIELD_CLASS}
        >
          <option value="matched">{copy.bestMatches}</option>
          <option value="all">{copy.allRoles}</option>
        </select>
        <button
          type="button"
          onClick={props.onTogglePreferences}
          className={BUTTON_CLASS}
        >
          {copy.preferences}
        </button>
      </div>

      {showPreferences && (
        <form
          onSubmit={props.onPreferencesSubmit}
          className="mb-5 grid gap-4 rounded-card border border-border bg-surface p-4 md:grid-cols-2"
        >
          <label className="text-xs font-semibold text-muted">
            {copy.roles}
            <input
              value={preferences.roleFamilies.join(', ')}
              onChange={(event) =>
                props.onPreferencesChange((current) => ({
                  ...current,
                  roleFamilies: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
                }))
              }
              className={`${FIELD_CLASS} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            {copy.skills}
            <input
              value={preferences.skills.join(', ')}
              onChange={(event) =>
                props.onPreferencesChange((current) => ({
                  ...current,
                  skills: event.target.value.split(',').map((value) => value.trim()).filter(Boolean),
                }))
              }
              className={`${FIELD_CLASS} mt-2`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={preferences.remote}
              onChange={(event) =>
                props.onPreferencesChange((current) => ({ ...current, remote: event.target.checked }))
              }
            />
            {copy.remote}
          </label>
          <label className="flex items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={preferences.relocation}
              onChange={(event) =>
                props.onPreferencesChange((current) => ({ ...current, relocation: event.target.checked }))
              }
            />
            {copy.relocation}
          </label>
          <div className="md:col-span-2">
            <button disabled={busy} className={`${BUTTON_CLASS} border-accent text-accent`}>
              {copy.savePrefs}
            </button>
          </div>
        </form>
      )}

      <p className="mb-4 text-xs text-muted">
        {activeCvName ? `${copy.activeCv}: ${activeCvName}` : copy.noCv}
      </p>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted">Loading market…</div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted">{copy.noJobs}</div>
      ) : (
        <div className="grid gap-5 xl:h-[calc(100vh-18rem)] xl:min-h-[36rem] xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.45fr)] xl:overflow-hidden">
          <div className="space-y-3 xl:overflow-y-auto xl:pr-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                copy={copy}
                selected={job.id === selectedId}
                onSelect={() => props.onSelectJob(job)}
                onState={(status) => props.onStateChange(job, status)}
              />
            ))}
            {nextCursor && (
              <button
                type="button"
                disabled={busy}
                onClick={props.onLoadMore}
                className={`${BUTTON_CLASS} w-full`}
              >
                {copy.loadMore}
              </button>
            )}
          </div>

          {selectedJob && (
            <JobDetail
              job={selectedJob}
              copy={copy}
              detailRef={detailRef}
              mobileOpen={mobileDetailOpen}
              analysisActive={analysisOpen && analysisJob?.id === selectedJob.id}
              analysisAvailable={analysisJob?.id === selectedJob.id}
              onCloseMobile={props.onCloseMobile}
              onCloseAnalysis={props.onCloseAnalysis}
              onAnalyze={() => props.onAnalyze(selectedJob)}
              onPrepare={() => props.onPrepare(selectedJob)}
              onNotesChange={(notes) => props.onNotesChange(selectedJob.id, notes)}
              onNotesSave={() => props.onNotesSave(selectedJob)}
            />
          )}
        </div>
      )}
    </div>
  )
}

type PipelineViewProps = {
  copy: JobMarketCopy
  jobs: Job[]
  onSelect: (job: Job) => void
  onStateChange: (job: Job, status: JobPipelineStatus) => void
}

export function PipelineView({ copy, jobs, onSelect, onStateChange }: PipelineViewProps) {
  if (jobs.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{copy.pipelineEmpty}</p>
  }

  return (
    <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-4">
      {PIPELINE_STATUSES.map((status) => {
        const statusJobs = jobs.filter((job) => job.pipelineStatus === status)
        return (
          <section key={status} className="min-h-40 rounded-card border border-border bg-surface p-3">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {status} <span className="text-accent">{statusJobs.length}</span>
            </h2>
            <div className="space-y-2">
              {statusJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => onSelect(job)}
                  className="w-full rounded-control border border-border bg-surface-raised p-3 text-left"
                >
                  <strong className="block text-sm text-heading">{job.title}</strong>
                  <span className="text-xs text-muted">{job.companyName}</span>
                  <select
                    value={status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => onStateChange(job, event.target.value as JobPipelineStatus)}
                    className={`${FIELD_CLASS} mt-2 py-1 text-xs`}
                  >
                    {PIPELINE_STATUSES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

type CompaniesViewProps = {
  copy: JobMarketCopy
  companies: Company[]
  suggestions: Company[]
  onAdd: () => void
  onFollow: (companyId: string) => void
}

export function CompaniesView({ copy, companies, suggestions, onAdd, onFollow }: CompaniesViewProps) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={onAdd} className={BUTTON_CLASS}>+ {copy.addCompany}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[...suggestions, ...companies].map((company) => (
          <div key={`${company.suggested}-${company.id}`} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-heading">{company.name}</h3>
                <p className="mt-1 text-xs text-muted">{company.integrationType} · {company.activeJobCount} jobs</p>
              </div>
              {company.suggested && <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] text-accent">{copy.suggested}</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <a href={company.careersUrl} target="_blank" rel="noreferrer" className={BUTTON_CLASS}>{copy.open} ↗</a>
              {!company.followed && <button type="button" onClick={() => onFollow(company.id)} className={BUTTON_CLASS}>{copy.follow}</button>}
              {company.followed && <span className="px-2 py-2 text-xs text-success">✓ {copy.followed}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type SourcesViewProps = {
  copy: JobMarketCopy
  sources: JobSource[]
  onToggle: (source: JobSource) => void
  onDelete: (sourceId: string) => void
}

export function SourcesView({ copy, sources, onToggle, onDelete }: SourcesViewProps) {
  if (sources.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{copy.noSources}</p>
  }

  return (
    <div className="space-y-3 p-4 sm:p-6">
      {sources.map((source) => (
        <div key={source.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-4">
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-heading">{source.companyName || source.boardKey}</strong>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted">{source.provider}</span>
              <span className={`size-2 rounded-full ${source.status === 'healthy' ? 'bg-success' : source.status === 'error' ? 'bg-danger' : 'bg-muted'}`} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {copy.lastSync}: {formatJobDate(source.lastSyncedAt, copy.never)}
              {source.attribution ? ` · ${copy.attribution}: ${source.attribution}` : ''}
            </p>
            {source.lastError && <p className="mt-1 text-xs text-danger">{source.lastError}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => onToggle(source)} className={BUTTON_CLASS}>{source.enabled ? copy.pause : copy.enable}</button>
            <a href={source.sourceUrl} target="_blank" rel="noreferrer" className={BUTTON_CLASS}>{copy.open} ↗</a>
            {source.provider !== 'remotive' && <button type="button" onClick={() => onDelete(source.id)} className={BUTTON_CLASS}>{copy.delete}</button>}
          </div>
        </div>
      ))}
    </div>
  )
}

type EntryModalProps = {
  copy: JobMarketCopy
  mode: 'job' | 'company'
  busy: boolean
  manualJob: ManualJobForm
  company: CompanyForm
  onManualJobChange: Dispatch<SetStateAction<ManualJobForm>>
  onCompanyChange: Dispatch<SetStateAction<CompanyForm>>
  onSubmit: (event: FormEvent) => void
  onClose: () => void
}

export function EntryModal(props: EntryModalProps) {
  const isJob = props.mode === 'job'
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={props.onSubmit} className="w-full max-w-xl rounded-panel border border-border bg-surface-raised p-5 shadow-2xl">
        <h2 className="font-display text-2xl font-semibold text-heading">{isJob ? props.copy.addJob : props.copy.addCompany}</h2>
        <div className="mt-5 grid gap-4">
          {isJob ? (
            <>
              <ModalInput label={props.copy.company} value={props.manualJob.companyName} onChange={(companyName) => props.onManualJobChange((current) => ({ ...current, companyName }))} />
              <ModalInput label={props.copy.role} value={props.manualJob.title} onChange={(title) => props.onManualJobChange((current) => ({ ...current, title }))} />
              <ModalInput label={props.copy.url} value={props.manualJob.url} type="url" onChange={(url) => props.onManualJobChange((current) => ({ ...current, url }))} />
              <ModalInput label={props.copy.location} value={props.manualJob.location} required={false} onChange={(location) => props.onManualJobChange((current) => ({ ...current, location }))} />
              <label className="text-xs font-semibold text-muted">{props.copy.descriptionLabel}<textarea rows={6} value={props.manualJob.description} onChange={(event) => props.onManualJobChange((current) => ({ ...current, description: event.target.value }))} className={`${FIELD_CLASS} mt-2`} /></label>
            </>
          ) : (
            <>
              <ModalInput label={props.copy.company} value={props.company.name} onChange={(name) => props.onCompanyChange((current) => ({ ...current, name }))} />
              <ModalInput label={props.copy.careersUrl} value={props.company.careersUrl} type="url" onChange={(careersUrl) => props.onCompanyChange((current) => ({ ...current, careersUrl }))} />
              <ModalInput label={props.copy.websiteUrl} value={props.company.websiteUrl} type="url" required={false} onChange={(websiteUrl) => props.onCompanyChange((current) => ({ ...current, websiteUrl }))} />
            </>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={props.onClose} className={BUTTON_CLASS}>{props.copy.cancel}</button>
          <button disabled={props.busy} className={`${BUTTON_CLASS} border-accent bg-accent text-white`}>{props.copy.add}</button>
        </div>
      </form>
    </div>
  )
}

function ModalInput({ label, value, type = 'text', required = true, onChange }: { label: string; value: string; type?: string; required?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold text-muted">
      {label}
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`${FIELD_CLASS} mt-2`} />
    </label>
  )
}
