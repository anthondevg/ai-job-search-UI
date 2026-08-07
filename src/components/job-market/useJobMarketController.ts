import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useTranslation'
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
} from '../../services/jobMarketService'
import { useActiveCvRecord } from '../../stores/cvStore'
import { useJobDescriptionStore } from '../../stores/jobDescriptionStore'
import type {
  Job,
  JobMarketOverview,
  JobPipelineStatus,
  JobSearchPreferences,
  JobSource,
} from '../../types/jobMarket'
import { DEFAULT_JOB_PREFERENCES } from '../../types/jobMarket'
import {
  EMPTY_COMPANY,
  EMPTY_MANUAL_JOB,
  JOB_MARKET_COPY,
  type EligibilityFilter,
  type JobMarketView,
  type RelevanceFilter,
} from './jobMarketUi'

type EntryModalMode = 'job' | 'company' | null

const EMPTY_OVERVIEW: JobMarketOverview = {
  companies: [],
  suggestions: [],
  sources: [],
}

export function useJobMarketController() {
  const { language } = useLanguage()
  const copy = JOB_MARKET_COPY[language]
  const navigate = useNavigate()
  const activeCv = useActiveCvRecord()
  const detailRef = useRef<HTMLElement>(null)

  const currentDescription = useJobDescriptionStore((state) => state.text)
  const setDescription = useJobDescriptionStore((state) => state.setText)

  const [view, setView] = useState<JobMarketView>('market')
  const [jobs, setJobs] = useState<Job[]>([])
  const [trackedJobs, setTrackedJobs] = useState<Job[]>([])
  const [overview, setOverview] = useState<JobMarketOverview>(EMPTY_OVERVIEW)
  const [preferences, setPreferences] =
    useState<JobSearchPreferences>(DEFAULT_JOB_PREFERENCES)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [eligibility, setEligibility] =
    useState<EligibilityFilter>('eligible')
  const [relevance, setRelevance] = useState<RelevanceFilter>('matched')
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [analysisJob, setAnalysisJob] = useState<Job | null>(null)

  const [modal, setModal] = useState<EntryModalMode>(null)
  const [manualJob, setManualJob] = useState(EMPTY_MANUAL_JOB)
  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY)

  const loadJobs = useCallback(
    async (append = false, cursor?: string | null) => {
      const data = await fetchJobs({
        search,
        provider,
        eligibility,
        relevance,
        cursor,
        profileId: activeCv?.id,
      })
      setJobs((current) => (append ? [...current, ...data.jobs] : data.jobs))
      setNextCursor(data.nextCursor)
      if (!append) setSelectedId(data.jobs[0]?.id ?? null)
    },
    [activeCv?.id, eligibility, provider, relevance, search],
  )

  const loadPipeline = useCallback(async () => {
    const data = await fetchJobs({
      pipeline: 'tracked',
      profileId: activeCv?.id,
      limit: 100,
    })
    setTrackedJobs(data.jobs)
  }, [activeCv?.id])

  const loadOverview = useCallback(async () => {
    setOverview(await fetchJobMarketOverview())
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      loadJobs(),
      loadPipeline(),
      loadOverview(),
      fetchJobPreferences().then(setPreferences),
    ])
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Failed to load job market')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadJobs, loadOverview, loadPipeline])

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null
  const pipelineJobs = useMemo(
    () => trackedJobs.filter((job) => job.pipelineStatus),
    [trackedJobs],
  )

  async function run(action: () => Promise<unknown>, refresh = true) {
    setBusy(true)
    setError(null)
    try {
      await action()
      if (refresh) await Promise.all([loadJobs(), loadOverview()])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  function selectJob(job: Job) {
    setJobs((current) =>
      current.some((item) => item.id === job.id) ? current : [job, ...current],
    )
    setSelectedId(job.id)
    requestAnimationFrame(() => {
      if (window.innerWidth < 1280) setMobileDetailOpen(true)
      else detailRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async function changeJobState(job: Job, status: JobPipelineStatus) {
    await run(() => updateJobState(job.id, status, job.notes), false)
    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, pipelineStatus: status } : item,
      ),
    )
    setTrackedJobs((current) => {
      const updated = { ...job, pipelineStatus: status }
      return current.some((item) => item.id === job.id)
        ? current.map((item) => (item.id === job.id ? updated : item))
        : [updated, ...current]
    })
  }

  async function prepareApplication(job: Job) {
    const hasDifferentPosting =
      currentDescription.trim() &&
      currentDescription.trim() !== job.description.trim()

    if (hasDifferentPosting) {
      const message = language === 'es'
        ? 'Ya tienes otra oferta en el flujo de CV. ¿Quieres reemplazarla?'
        : 'Another posting is already in the CV workflow. Replace it?'
      if (!window.confirm(message)) return
    }

    setDescription(
      [job.title, job.companyName, job.location, job.description]
        .filter(Boolean)
        .join('\n\n'),
    )
    await changeJobState(job, 'preparing')
    navigate('/cv?tab=generate')
  }

  function updateJobNotes(jobId: string, notes: string) {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, notes } : job)),
    )
  }

  async function submitPreferences(event: FormEvent) {
    event.preventDefault()
    await run(async () => {
      setPreferences(await saveJobPreferences(preferences))
      await loadJobs()
    }, false)
  }

  async function submitEntry(event: FormEvent) {
    event.preventDefault()
    if (modal === 'job') {
      await run(async () => {
        await addManualJob(manualJob)
        setManualJob(EMPTY_MANUAL_JOB)
        setModal(null)
      })
    } else if (modal === 'company') {
      await run(async () => {
        await addCompany(companyForm)
        setCompanyForm(EMPTY_COMPANY)
        setModal(null)
      })
    }
  }

  function selectPipelineJob(job: Job) {
    setView('market')
    selectJob(job)
  }

  function toggleSource(source: JobSource) {
    void run(() => setSourceEnabled(source.id, !source.enabled))
  }

  return {
    language,
    copy,
    detailRef,
    view,
    setView,
    jobs,
    pipelineJobs,
    overview,
    selectedJob,
    selectedId,
    nextCursor,
    loading,
    busy,
    error,
    search,
    setSearch,
    provider,
    setProvider,
    eligibility,
    setEligibility,
    relevance,
    setRelevance,
    preferences,
    setPreferences,
    showPreferences,
    togglePreferences: () => setShowPreferences((current) => !current),
    mobileDetailOpen,
    closeMobileDetail: () => setMobileDetailOpen(false),
    activeCvName: activeCv?.fileName ?? null,
    analysisJob,
    openAnalysis: (job: Job) => setAnalysisJob(job),
    closeAnalysis: () => setAnalysisJob(null),
    modal,
    openJobModal: () => setModal('job'),
    openCompanyModal: () => setModal('company'),
    closeModal: () => setModal(null),
    manualJob,
    setManualJob,
    companyForm,
    setCompanyForm,
    refreshSources: () => run(() => syncJobMarket()),
    loadMore: () => run(() => loadJobs(true, nextCursor), false),
    selectJob,
    selectPipelineJob,
    changeJobState,
    prepareApplication,
    updateJobNotes,
    saveJobNotes: (job: Job) =>
      job.pipelineStatus
        ? updateJobState(job.id, job.pipelineStatus, job.notes)
        : Promise.resolve(),
    submitPreferences,
    submitEntry,
    followCompany: (companyId: string) => run(() => followCompany(companyId)),
    toggleSource,
    deleteSource: (sourceId: string) => run(() => removeSource(sourceId)),
  }
}
