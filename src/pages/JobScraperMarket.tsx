import { useTranslation } from '../hooks/useTranslation'

export default function JobScraperMarket() {
  const { t } = useTranslation()

  return (
    <div className="match-page flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <header className="match-page-header mb-6 pb-5 sm:mb-8 sm:pb-7">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Market intelligence / 02</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-heading sm:text-4xl">
          {t('pages.jobScraperMarket.title')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t('pages.jobScraperMarket.description')}
        </p>
      </header>

      <div className="match-rail match-rail-success flex min-h-[280px] flex-1 items-center justify-center rounded-panel border border-dashed border-border bg-surface-raised p-6 sm:p-10 lg:p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-card border-2 border-success/30 bg-success-subtle text-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-body">
            {t('pages.jobScraperMarket.placeholderTitle')}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t('pages.jobScraperMarket.placeholderDescription')}
          </p>
        </div>
      </div>
    </div>
  )
}
