import type { JobPipelineStatus } from '../../types/jobMarket'

export type JobMarketView = 'market' | 'companies' | 'pipeline' | 'sources'
export type EligibilityFilter = 'eligible' | 'review' | 'all'
export type RelevanceFilter = 'matched' | 'all'

export type ManualJobForm = {
  companyName: string
  title: string
  url: string
  location: string
  description: string
}

export type CompanyForm = {
  name: string
  careersUrl: string
  websiteUrl: string
}

export const EMPTY_MANUAL_JOB: ManualJobForm = {
  companyName: '',
  title: '',
  url: '',
  location: '',
  description: '',
}

export const EMPTY_COMPANY: CompanyForm = {
  name: '',
  careersUrl: '',
  websiteUrl: '',
}

export const PIPELINE_STATUSES: JobPipelineStatus[] = [
  'saved',
  'preparing',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
  'archived',
]

export const FIELD_CLASS =
  'w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-body outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20'

export const BUTTON_CLASS =
  'rounded-control border border-border px-3 py-2 text-xs font-semibold text-body transition hover:border-accent hover:text-heading disabled:cursor-not-allowed disabled:opacity-50'

export const JOB_MARKET_COPY = {
  en: {
    eyebrow: 'Market intelligence / 02',
    title: 'Job Market Board',
    description:
      'Discover authorized Web + AI opportunities, track applications, and prepare focused documents.',
    market: 'Market',
    companies: 'Companies',
    pipeline: 'Pipeline',
    sources: 'Sources',
    search: 'Search roles, skills, or companies',
    allSources: 'All sources',
    applicable: 'Applicable from LatAm',
    review: 'Eligibility to confirm',
    exploreAll: 'Explore every location',
    bestMatches: 'Target roles only',
    allRoles: 'Explore adjacent roles',
    refresh: 'Refresh sources',
    refreshing: 'Refreshing…',
    addJob: 'Add external job',
    preferences: 'Search preferences',
    noJobs: 'No opportunities match these filters yet.',
    prepare: 'Prepare application',
    analyze: 'Analyze with CV',
    analysisWidget: 'Job analysis',
    analyzing: 'Analyzing job description…',
    analyzeAgain: 'Analyze again',
    minimize: 'Minimize',
    restore: 'Restore',
    close: 'Close',
    noActiveCvAnalysis:
      'No active CV selected. The role can still be analyzed, but personalized compatibility will be unavailable.',
    open: 'Open original',
    save: 'Save',
    loadMore: 'Load more',
    company: 'Company',
    role: 'Role',
    url: 'Job URL',
    location: 'Location',
    descriptionLabel: 'Description (optional)',
    cancel: 'Cancel',
    add: 'Add',
    notes: 'Notes',
    addCompany: 'Add company',
    careersUrl: 'Careers URL',
    websiteUrl: 'Website (optional)',
    followed: 'Following',
    follow: 'Follow',
    suggested: 'Suggested from matching jobs',
    noSources: 'No monitored sources yet.',
    lastSync: 'Last sync',
    never: 'Never',
    delete: 'Delete',
    attribution: 'Attribution',
    roles: 'Target roles',
    skills: 'Extra skills (comma separated)',
    remote: 'Prioritize remote',
    relocation: 'Include relocation',
    savePrefs: 'Save preferences',
    activeCv: 'Ranking with active CV',
    noCv: 'No active CV: ranking uses your saved preferences.',
    pipelineEmpty: 'Save a job to begin your application pipeline.',
    jobDescription: 'Job description',
    backToResults: '← Back to results',
    pause: 'Pause',
    enable: 'Enable',
  },
  es: {
    eyebrow: 'Inteligencia de mercado / 02',
    title: 'Tablero de oportunidades',
    description:
      'Descubre oportunidades Web + AI autorizadas, sigue postulaciones y prepara documentos enfocados.',
    market: 'Mercado',
    companies: 'Empresas',
    pipeline: 'Pipeline',
    sources: 'Fuentes',
    search: 'Buscar roles, skills o empresas',
    allSources: 'Todas las fuentes',
    applicable: 'Aplicables desde LatAm',
    review: 'Elegibilidad por confirmar',
    exploreAll: 'Explorar todas las ubicaciones',
    bestMatches: 'Solo roles objetivo',
    allRoles: 'Explorar roles cercanos',
    refresh: 'Actualizar fuentes',
    refreshing: 'Actualizando…',
    addJob: 'Agregar vacante externa',
    preferences: 'Preferencias de búsqueda',
    noJobs: 'Aún no hay oportunidades para estos filtros.',
    prepare: 'Preparar postulación',
    analyze: 'Analizar con CV',
    analysisWidget: 'Análisis de vacante',
    analyzing: 'Analizando la descripción…',
    analyzeAgain: 'Analizar de nuevo',
    minimize: 'Minimizar',
    restore: 'Restaurar',
    close: 'Cerrar',
    noActiveCvAnalysis:
      'No hay un CV activo. Puedes analizar el cargo, pero la compatibilidad personalizada no estará disponible.',
    open: 'Abrir original',
    save: 'Guardar',
    loadMore: 'Cargar más',
    company: 'Empresa',
    role: 'Cargo',
    url: 'URL de la vacante',
    location: 'Ubicación',
    descriptionLabel: 'Descripción (opcional)',
    cancel: 'Cancelar',
    add: 'Agregar',
    notes: 'Notas',
    addCompany: 'Agregar empresa',
    careersUrl: 'URL de careers',
    websiteUrl: 'Sitio web (opcional)',
    followed: 'Siguiendo',
    follow: 'Seguir',
    suggested: 'Sugerida por empleos relevantes',
    noSources: 'Aún no hay fuentes monitoreadas.',
    lastSync: 'Última sincronización',
    never: 'Nunca',
    delete: 'Eliminar',
    attribution: 'Atribución',
    roles: 'Roles objetivo',
    skills: 'Skills extra (separadas por coma)',
    remote: 'Priorizar remoto',
    relocation: 'Incluir relocation',
    savePrefs: 'Guardar preferencias',
    activeCv: 'Ranking con CV activo',
    noCv: 'Sin CV activo: el ranking usa tus preferencias guardadas.',
    pipelineEmpty: 'Guarda una vacante para iniciar tu pipeline.',
    jobDescription: 'Descripción del puesto',
    backToResults: '← Volver a resultados',
    pause: 'Pausar',
    enable: 'Activar',
  },
} as const

export type JobMarketCopy = (typeof JOB_MARKET_COPY)[keyof typeof JOB_MARKET_COPY]

export function formatJobDate(value: string | null, fallback: string) {
  if (!value) return fallback
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(value),
  )
}

export function eligibilityTone(eligibility: string) {
  if (eligibility === 'global' || eligibility === 'latam' || eligibility === 'relocation') {
    return 'border-success/30 bg-success-subtle text-success'
  }
  if (eligibility === 'restricted') {
    return 'border-danger/30 bg-danger/10 text-danger'
  }
  return 'border-accent/30 bg-accent/10 text-accent'
}
