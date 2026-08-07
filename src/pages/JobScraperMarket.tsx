import {
  CompaniesView,
  EntryModal,
  MarketView,
  PipelineView,
  SourcesView,
} from '../components/job-market/JobMarketViews'
import { BUTTON_CLASS, type JobMarketView } from '../components/job-market/jobMarketUi'
import { useJobMarketController } from '../components/job-market/useJobMarketController'

export default function JobScraperMarket() {
  const market = useJobMarketController()

  const tabs = [
    { id: 'market', label: market.copy.market, count: market.jobs.length },
    {
      id: 'companies',
      label: market.copy.companies,
      count: market.overview.companies.length,
    },
    {
      id: 'pipeline',
      label: market.copy.pipeline,
      count: market.pipelineJobs.length,
    },
    {
      id: 'sources',
      label: market.copy.sources,
      count: market.overview.sources.length,
    },
  ] satisfies Array<{ id: JobMarketView; label: string; count: number }>

  return (
    <div className="match-page flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <header className="match-page-header mb-6 pb-5 sm:mb-8 sm:pb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              {market.copy.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
              {market.copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {market.copy.description}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={market.openJobModal}
              className={BUTTON_CLASS}
            >
              + {market.copy.addJob}
            </button>
            <button
              type="button"
              disabled={market.busy}
              onClick={() => void market.refreshSources()}
              className={`${BUTTON_CLASS} border-accent bg-accent/10 text-accent`}
            >
              {market.busy ? market.copy.refreshing : market.copy.refresh}
            </button>
          </div>
        </div>
      </header>

      <div className="match-frame overflow-hidden rounded-panel border border-border bg-surface-raised">
        <div
          role="tablist"
          className="flex overflow-x-auto border-b border-border bg-surface-muted/60 p-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => market.setView(tab.id)}
              className={`rounded-control px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] ${
                market.view === tab.id
                  ? 'bg-surface-raised text-heading shadow-sm'
                  : 'text-muted hover:text-body'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-accent">{tab.count}</span>
            </button>
          ))}
        </div>

        {market.error && (
          <div
            role="alert"
            className="m-4 rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          >
            {market.error}
          </div>
        )}

        {market.view === 'market' && (
          <MarketView
            copy={market.copy}
            activeCvName={market.activeCvName}
            jobs={market.jobs}
            selectedJob={market.selectedJob}
            analysisJob={market.analysisJob}
            analysisOpen={market.analysisOpen}
            selectedId={market.selectedId}
            nextCursor={market.nextCursor}
            loading={market.loading}
            busy={market.busy}
            search={market.search}
            provider={market.provider}
            eligibility={market.eligibility}
            relevance={market.relevance}
            showPreferences={market.showPreferences}
            preferences={market.preferences}
            mobileDetailOpen={market.mobileDetailOpen}
            detailRef={market.detailRef}
            onSearchChange={market.setSearch}
            onProviderChange={market.setProvider}
            onEligibilityChange={market.setEligibility}
            onRelevanceChange={market.setRelevance}
            onTogglePreferences={market.togglePreferences}
            onPreferencesChange={market.setPreferences}
            onPreferencesSubmit={(event) => void market.submitPreferences(event)}
            onSelectJob={market.selectJob}
            onStateChange={(job, status) =>
              void market.changeJobState(job, status)
            }
            onLoadMore={() => void market.loadMore()}
            onCloseMobile={market.closeMobileDetail}
            onAnalyze={market.openAnalysis}
            onCloseAnalysis={market.closeAnalysis}
            onPrepare={(job) => void market.prepareApplication(job)}
            onNotesChange={market.updateJobNotes}
            onNotesSave={(job) => void market.saveJobNotes(job)}
          />
        )}

        {market.view === 'pipeline' && (
          <PipelineView
            copy={market.copy}
            jobs={market.pipelineJobs}
            onSelect={market.selectPipelineJob}
            onStateChange={(job, status) =>
              void market.changeJobState(job, status)
            }
          />
        )}

        {market.view === 'companies' && (
          <CompaniesView
            copy={market.copy}
            companies={market.overview.companies}
            suggestions={market.overview.suggestions}
            onAdd={market.openCompanyModal}
            onFollow={(companyId) => void market.followCompany(companyId)}
          />
        )}

        {market.view === 'sources' && (
          <SourcesView
            copy={market.copy}
            sources={market.overview.sources}
            onToggle={market.toggleSource}
            onDelete={(sourceId) => void market.deleteSource(sourceId)}
          />
        )}
      </div>

      {market.mobileDetailOpen && (
        <button
          type="button"
          aria-label={
            market.language === 'es' ? 'Cerrar detalle' : 'Close details'
          }
          onClick={market.closeMobileDetail}
          className="fixed inset-0 z-[80] bg-black/60 xl:hidden"
        />
      )}

      {market.modal && (
        <EntryModal
          copy={market.copy}
          mode={market.modal}
          busy={market.busy}
          manualJob={market.manualJob}
          company={market.companyForm}
          onManualJobChange={market.setManualJob}
          onCompanyChange={market.setCompanyForm}
          onSubmit={(event) => void market.submitEntry(event)}
          onClose={market.closeModal}
        />
      )}

    </div>
  )
}
