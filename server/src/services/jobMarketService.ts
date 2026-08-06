import { createHash, randomUUID } from 'node:crypto'
import type { CVProfile } from '../types/cvProfile.js'
import {
  DEFAULT_JOB_PREFERENCES,
  type JobEligibility,
  type JobPipelineStatus,
  type JobProvider,
  type JobSearchPreferences,
  type NormalizedJob,
} from '../types/jobMarket.js'
import { getSupabaseClient } from './supabaseClient.js'

type SourceRow = {
  id: string
  company_id: string | null
  provider: JobProvider
  board_key: string
  source_url: string
  attribution: string | null
  enabled: boolean
  status: string
  min_sync_minutes: number
  last_synced_at: string | null
  last_error: string | null
  companies: { name: string } | Array<{ name: string }> | null
}

type JobRow = {
  id: string
  source_id: string | null
  company_id: string | null
  created_by_user_id: string | null
  provider: JobProvider
  external_id: string
  company_name: string
  title: string
  description: string
  location: string
  workplace_type: string | null
  employment_type: string | null
  salary_text: string | null
  apply_url: string
  source_url: string
  posted_at: string | null
  first_seen_at: string
  last_seen_at: string
  status: 'active' | 'expired'
  eligibility: JobEligibility
}

const ROLE_TERMS: Record<string, string[]> = {
  Frontend: ['frontend', 'front-end', 'react', 'ui engineer', 'web developer'],
  'Full Stack': ['full stack', 'full-stack', 'fullstack'],
  'Backend JS/TS': ['backend', 'back-end', 'node.js', 'nodejs', 'typescript engineer'],
  'AI Engineer': ['ai engineer', 'artificial intelligence engineer', 'machine learning engineer'],
  'Applied AI': ['applied ai', 'ai product', 'generative ai'],
  'LLM Engineer': ['llm', 'large language model', 'prompt engineer'],
}

function companyName(source: SourceRow): string {
  if (source.provider === 'remotive') return source.attribution ?? 'Remotive'
  if (Array.isArray(source.companies)) return source.companies[0]?.name ?? source.board_key
  return source.companies?.name ?? source.board_key
}

export function textFromHtml(value: unknown): string {
  if (typeof value !== 'string') return ''
  let decoded = value
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    if (next === decoded) break
    decoded = next
  }
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|h[1-6]|li|ul|ol|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 50_000)
}

export function classifyEligibility(location: string, description = ''): JobEligibility {
  const locationValue = location.toLowerCase().replace(/\s+/g, ' ').trim()
  const descriptionValue = description.toLowerCase().replace(/\s+/g, ' ').trim()
  const value = `${locationValue} ${descriptionValue}`
  const explicitGlobal = /^(worldwide|global|anywhere)$/.test(locationValue) || /remote\s*[-–—|/]?\s*(worldwide|global|anywhere)|worldwide\s*[-–—|/]?\s*remote|open to (candidates|applicants) (from )?(anywhere|worldwide)|work from anywhere|can be based anywhere/.test(value)
  if (explicitGlobal) return 'global'
  if (/latin america|latam|south america|remote[^.]{0,30}americas|americas[^.]{0,30}remote/.test(value)) return 'latam'
  if (/visa sponsor(ship)? (is )?(available|offered|provided)|we (can |do )?sponsor visas|immigration sponsorship (is )?(available|offered)|work visa support (is )?(available|offered)/.test(descriptionValue)) return 'relocation'
  if (/relocation (support|assistance|package|available|offered)/.test(descriptionValue)) return 'unknown'
  const crossLocationReview = /applying for this role from a different location|candidates? from other locations|other hiring locations|location may be flexible|additional locations may be considered/.test(descriptionValue)
  if (crossLocationReview) return 'unknown'
  if (/us only|united states only|must (reside|be based|live) in|work authorization required|no (visa )?sponsorship|remote within|only (hire|hiring) in/.test(value)) return 'restricted'
  const genericLocation = /^(remote|hybrid|multiple locations|various locations|)$/.test(locationValue)
  if (locationValue && !genericLocation) return 'restricted'
  return 'unknown'
}

function fingerprint(job: Pick<NormalizedJob, 'companyName' | 'title' | 'location'>): string {
  const normalized = [job.companyName, job.title, job.location]
    .map((part) => part.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
    .join('|')
  return createHash('sha256').update(normalized).digest('hex')
}

function canonicalUrl(value: string): string {
  try {
    const url = new URL(value)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gh_src|lever-source)/i.test(key)) url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return value
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'MatchCV/0.1 job-market-aggregator' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`)
  return response.json()
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function normalizeSourcePayload(provider: JobProvider, boardKey: string, name: string, rawPayload: unknown): NormalizedJob[] {
  if (provider === 'greenhouse') {
    const payload = asRecord(rawPayload)
    return (Array.isArray(payload.jobs) ? payload.jobs : []).map((item) => {
      const job = asRecord(item)
      const description = textFromHtml(job.content)
      const location = asString(asRecord(job.location).name)
      return {
        provider: 'greenhouse', externalId: `${boardKey}:${String(job.id)}`, companyName: name,
        title: asString(job.title), description, location, workplaceType: /remote/i.test(location) ? 'remote' : null,
        employmentType: null, salaryText: null, applyUrl: asString(job.absolute_url), sourceUrl: asString(job.absolute_url),
        postedAt: asString(job.updated_at) || null, eligibility: classifyEligibility(location, description),
      }
    })
  }
  if (provider === 'lever') {
    const payload = rawPayload
    return (Array.isArray(payload) ? payload : []).map((item) => {
      const job = asRecord(item)
      const categories = asRecord(job.categories)
      const description = textFromHtml(job.descriptionPlain || job.description)
      const location = asString(categories.location)
      return {
        provider: 'lever', externalId: `${boardKey}:${asString(job.id)}`, companyName: name,
        title: asString(job.text), description, location, workplaceType: asString(job.workplaceType) || null,
        employmentType: asString(categories.commitment) || null, salaryText: null,
        applyUrl: asString(job.applyUrl || job.hostedUrl), sourceUrl: asString(job.hostedUrl || job.applyUrl),
        postedAt: typeof job.createdAt === 'number' ? new Date(job.createdAt).toISOString() : null,
        eligibility: classifyEligibility(location, description),
      }
    })
  }
  if (provider === 'ashby') {
    const payload = asRecord(rawPayload)
    return (Array.isArray(payload.jobs) ? payload.jobs : []).map((item) => {
      const job = asRecord(item)
      const description = textFromHtml(job.descriptionPlain || job.descriptionHtml)
      const location = asString(job.location)
      const applyUrl = asString(job.applyUrl || job.jobUrl)
      return {
        provider: 'ashby', externalId: `${boardKey}:${asString(job.id || job.jobUrl)}`, companyName: name,
        title: asString(job.title), description, location, workplaceType: asString(job.workplaceType) || null,
        employmentType: asString(job.employmentType) || null,
        salaryText: asString(asRecord(job.compensation).scrapeableCompensationSalarySummary || job.compensationTierSummary) || null,
        applyUrl, sourceUrl: asString(job.jobUrl || applyUrl), postedAt: asString(job.publishedAt) || null,
        eligibility: classifyEligibility(location, description),
      }
    })
  }
  if (provider === 'remotive') {
    const payload = asRecord(rawPayload)
    return (Array.isArray(payload.jobs) ? payload.jobs : []).map((item) => {
      const job = asRecord(item)
      const description = textFromHtml(job.description)
      const location = asString(job.candidate_required_location)
      return {
        provider: 'remotive', externalId: `remote-jobs:${String(job.id)}`, companyName: asString(job.company_name),
        title: asString(job.title), description, location, workplaceType: 'remote',
        employmentType: asString(job.job_type) || null, salaryText: asString(job.salary) || null,
        applyUrl: asString(job.url), sourceUrl: asString(job.url), postedAt: asString(job.publication_date) || null,
        eligibility: classifyEligibility(location, description),
      }
    })
  }
  return []
}

async function fetchSourceJobs(source: SourceRow): Promise<NormalizedJob[]> {
  const url = source.provider === 'greenhouse'
    ? `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(source.board_key)}/jobs?content=true`
    : source.provider === 'lever'
      ? `https://api.lever.co/v0/postings/${encodeURIComponent(source.board_key)}?mode=json`
      : source.provider === 'ashby'
        ? `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(source.board_key)}?includeCompensation=true`
        : source.provider === 'remotive'
          ? 'https://remotive.com/api/remote-jobs'
          : ''
  if (!url) return []
  return normalizeSourcePayload(source.provider, source.board_key, companyName(source), await fetchJson(url))
}

async function syncSource(source: SourceRow) {
  const supabase = getSupabaseClient()
  await supabase.from('job_sources').update({ status: 'syncing', last_error: null }).eq('id', source.id)
  try {
    const incoming = (await fetchSourceJobs(source)).filter((job) => job.title && job.companyName && job.applyUrl)
    const seen = new Set(incoming.map((job) => job.externalId))
    const now = new Date().toISOString()
    const rows = incoming.map((job) => {
      const url = canonicalUrl(job.applyUrl)
      const jobFingerprint = fingerprint(job)
      return {
        source_id: source.id, company_id: source.company_id, provider: job.provider, external_id: job.externalId,
        fingerprint: jobFingerprint, company_name: job.companyName, title: job.title, description: job.description,
        location: job.location, workplace_type: job.workplaceType, employment_type: job.employmentType,
        salary_text: job.salaryText, apply_url: url, source_url: canonicalUrl(job.sourceUrl), posted_at: job.postedAt,
        last_seen_at: now, missing_syncs: 0, status: 'active', eligibility: job.eligibility,
        raw_data: {},
      }
    })

    const duplicateByUrl = new Map<string, { id: string; provider: string; external_id: string }>()
    const duplicateByFingerprint = new Map<string, { id: string; provider: string; external_id: string }>()
    for (let index = 0; index < rows.length; index += 75) {
      const batch = rows.slice(index, index + 75)
      const [{ data: urlMatches, error: urlError }, { data: fingerprintMatches, error: fingerprintError }] = await Promise.all([
        supabase.from('jobs').select('id,provider,external_id,apply_url').in('apply_url', batch.map((row) => row.apply_url)),
        supabase.from('jobs').select('id,provider,external_id,fingerprint').in('fingerprint', batch.map((row) => row.fingerprint)),
      ])
      if (urlError || fingerprintError) throw new Error(urlError?.message ?? fingerprintError?.message)
      for (const match of urlMatches ?? []) duplicateByUrl.set(match.apply_url as string, match as { id: string; provider: string; external_id: string })
      for (const match of fingerprintMatches ?? []) duplicateByFingerprint.set(match.fingerprint as string, match as { id: string; provider: string; external_id: string })
    }

    const duplicateIds = new Set<string>()
    const rowsToUpsert = rows.filter((row) => {
      const duplicate = duplicateByUrl.get(row.apply_url) ?? duplicateByFingerprint.get(row.fingerprint)
      if (!duplicate || (duplicate.provider === row.provider && duplicate.external_id === row.external_id)) return true
      duplicateIds.add(duplicate.id)
      return false
    })
    if (duplicateIds.size) {
      const { error } = await supabase.from('jobs').update({ last_seen_at: now, status: 'active', missing_syncs: 0 }).in('id', [...duplicateIds])
      if (error) throw new Error(error.message)
    }
    for (let index = 0; index < rowsToUpsert.length; index += 50) {
      const { error } = await supabase.from('jobs').upsert(rowsToUpsert.slice(index, index + 50), { onConflict: 'provider,external_id' })
      if (error) throw new Error(error.message)
    }

    const { data: existing, error: listError } = await supabase.from('jobs').select('id, external_id, missing_syncs').eq('source_id', source.id).limit(5000)
    if (listError) throw new Error(listError.message)
    for (const row of existing ?? []) {
      if (seen.has(row.external_id as string)) continue
      const missing = Number(row.missing_syncs ?? 0) + 1
      const { error } = await supabase.from('jobs').update({ missing_syncs: missing, status: missing >= 2 ? 'expired' : 'active' }).eq('id', row.id)
      if (error) throw new Error(error.message)
    }
    await supabase.from('job_sources').update({ status: 'healthy', last_synced_at: now, last_error: null }).eq('id', source.id)
    return { sourceId: source.id, ok: true, count: incoming.length }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error'
    await supabase.from('job_sources').update({ status: 'error', last_error: message.slice(0, 500) }).eq('id', source.id)
    return { sourceId: source.id, ok: false, count: 0, error: message }
  }
}

export async function syncJobSources(force = false) {
  const supabase = getSupabaseClient()
  const { data: acquired, error: lockError } = await supabase.rpc('acquire_job_market_sync_lock')
  if (lockError) throw new Error(lockError.message)
  if (!acquired) return { attempted: 0, skipped: 0, locked: true, results: [] }
  try {
    const { data, error } = await supabase.from('job_sources').select('*, companies(name)').eq('enabled', true).neq('provider', 'external')
    if (error) throw new Error(error.message)
    const now = Date.now()
    const sources = (data ?? []) as SourceRow[]
    const eligible = sources.filter((source) => force || !source.last_synced_at || now - Date.parse(source.last_synced_at) >= source.min_sync_minutes * 60_000)
    const results = []
    for (const source of eligible) results.push(await syncSource(source))
    return { attempted: eligible.length, skipped: sources.length - eligible.length, locked: false, results }
  } finally {
    await supabase.rpc('release_job_market_sync_lock')
  }
}

export function detectJobSource(urlValue: string): { provider: JobProvider; boardKey: string } {
  const url = new URL(urlValue)
  const parts = url.pathname.split('/').filter(Boolean)
  if (/greenhouse\.io$/i.test(url.hostname)) {
    const boardsIndex = parts.findIndex((part) => part === 'boards')
    return { provider: 'greenhouse', boardKey: boardsIndex >= 0 ? parts[boardsIndex + 1] ?? '' : parts[0] ?? '' }
  }
  if (/lever\.co$/i.test(url.hostname)) return { provider: 'lever', boardKey: parts[0] ?? '' }
  if (/ashbyhq\.com$/i.test(url.hostname)) return { provider: 'ashby', boardKey: parts[0] ?? '' }
  return { provider: 'external', boardKey: url.hostname }
}

async function preferencesFor(userId: string): Promise<JobSearchPreferences> {
  const { data, error } = await getSupabaseClient().from('job_search_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return DEFAULT_JOB_PREFERENCES
  return {
    roleFamilies: data.role_families as string[], skills: data.skills as string[], seniority: data.seniority as string[],
    countries: data.countries as string[], remote: data.remote as boolean, relocation: data.relocation as boolean,
  }
}

function containsTerm(text: string, term: string) {
  const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()
  const normalizedText = ` ${normalize(text)} `
  const normalizedTerm = normalize(term)
  return Boolean(normalizedTerm) && normalizedText.includes(` ${normalizedTerm} `)
}

export function scoreJob(job: JobRow, preferences: JobSearchPreferences, cvSkills: string[]) {
  const titleText = job.title.toLowerCase()
  const optionalSection = job.description.search(/bonus points|nice to have|preferred qualifications|preferred skills|desirable|what would make you stand out/i)
  const requiredDescription = optionalSection >= 0 ? job.description.slice(0, optionalSection) : job.description
  const optionalDescription = optionalSection >= 0 ? job.description.slice(optionalSection) : ''
  const requiredHaystack = `${job.title} ${requiredDescription}`.toLowerCase()
  const optionalHaystack = optionalDescription.toLowerCase()
  const selectedTerms = preferences.roleFamilies.flatMap((role) => ROLE_TERMS[role] ?? [role.toLowerCase()])
  const roleScore = selectedTerms.some((term) => containsTerm(titleText, term)) ? 35 : 0
  const skills = [...new Set([...preferences.skills, ...cvSkills])].filter(Boolean)
  const requiredMatchedSkills = skills.filter((skill) => containsTerm(requiredHaystack, skill))
  const optionalMatchedSkills = skills.filter((skill) => !requiredMatchedSkills.includes(skill) && containsTerm(optionalHaystack, skill))
  const matchedSkills = [...requiredMatchedSkills, ...optionalMatchedSkills]
  const weightedMatches = requiredMatchedSkills.length + optionalMatchedSkills.length * 0.1
  const skillScore = skills.length ? Math.min(35, Math.round(35 * weightedMatches / Math.min(skills.length, 8))) : 18
  const locationScore = job.eligibility === 'global' || job.eligibility === 'latam' ? (preferences.remote ? 20 : 10)
    : job.eligibility === 'relocation' && preferences.relocation ? 18 : job.eligibility === 'restricted' ? 0 : 4
  const ageDays = Math.max(0, (Date.now() - Date.parse(job.posted_at ?? job.first_seen_at)) / 86_400_000)
  const freshnessScore = ageDays <= 3 ? 10 : ageDays <= 14 ? 7 : ageDays <= 30 ? 4 : 1
  const reasons = []
  if (roleScore) reasons.push('Target role match')
  if (requiredMatchedSkills.length) reasons.push(`${requiredMatchedSkills.length} required skill${requiredMatchedSkills.length === 1 ? '' : 's'} matched`)
  if (optionalMatchedSkills.length) reasons.push(`${optionalMatchedSkills.length} optional skill${optionalMatchedSkills.length === 1 ? '' : 's'} matched`)
  if (locationScore >= 18) reasons.push(job.eligibility === 'relocation' ? 'Relocation signal' : 'Remote location fit')
  if (freshnessScore >= 7) reasons.push('Recently posted')
  return { score: Math.min(100, roleScore + skillScore + locationScore + freshnessScore), roleScore, skillScore, locationScore, freshnessScore, matchedSkills, reasons }
}

async function cvSkillsFor(userId: string, profileId?: string | null): Promise<string[]> {
  let query = getSupabaseClient().from('cv_profiles').select('profile').eq('user_id', userId)
  query = profileId ? query.eq('id', profileId) : query.order('created_at', { ascending: false }).limit(1)
  const { data } = await query.maybeSingle()
  return ((data?.profile as CVProfile | undefined)?.skills ?? []).filter(Boolean)
}

function mapJob(row: JobRow, state: { status: JobPipelineStatus; notes: string } | undefined, match: ReturnType<typeof scoreJob>) {
  return {
    id: row.id, sourceId: row.source_id, provider: row.provider, externalId: row.external_id,
    companyId: row.company_id, companyName: row.company_name, title: row.title, description: row.description,
    location: row.location, workplaceType: row.workplace_type, employmentType: row.employment_type,
    salaryText: row.salary_text, applyUrl: row.apply_url, sourceUrl: row.source_url,
    attribution: row.provider === 'remotive' ? 'Remotive' : null, postedAt: row.posted_at,
    firstSeenAt: row.first_seen_at, lastSeenAt: row.last_seen_at, status: row.status, eligibility: row.eligibility,
    pipelineStatus: state?.status ?? null, notes: state?.notes ?? '', match,
  }
}

export async function listJobs(userId: string, options: { search?: string; provider?: string; pipeline?: string; eligibility?: string; relevance?: string; cursor?: number; limit?: number; profileId?: string | null }) {
  const supabase = getSupabaseClient()
  let jobsQuery = supabase.from('jobs').select('*').order('posted_at', { ascending: false, nullsFirst: false }).limit(1000)
  if (!options.pipeline || options.pipeline === 'all') jobsQuery = jobsQuery.eq('status', 'active')
  const [{ data: jobs, error }, { data: states }, preferences, cvSkills] = await Promise.all([
    jobsQuery,
    supabase.from('user_job_states').select('job_id,status,notes').eq('user_id', userId),
    preferencesFor(userId), cvSkillsFor(userId, options.profileId),
  ])
  if (error) throw new Error(error.message)
  const stateMap = new Map((states ?? []).map((state) => [state.job_id as string, { status: state.status as JobPipelineStatus, notes: state.notes as string }]))
  const search = options.search?.trim().toLowerCase()
  let mapped = ((jobs ?? []) as JobRow[])
    .filter((job) => !job.created_by_user_id || job.created_by_user_id === userId)
    .filter((job) => !options.provider || options.provider === 'all' || job.provider === options.provider)
    .filter((job) => !options.eligibility || options.eligibility === 'all'
      || (options.eligibility === 'eligible' && ['global', 'latam', 'relocation'].includes(job.eligibility))
      || (options.eligibility === 'review' && job.eligibility === 'unknown'))
    .filter((job) => !search || `${job.title} ${job.company_name} ${job.location} ${job.description}`.toLowerCase().includes(search))
    .map((job) => {
      const description = textFromHtml(job.description)
      const classifiedJob = { ...job, description, eligibility: classifyEligibility(job.location, description) }
      return mapJob(classifiedJob, stateMap.get(job.id), scoreJob(classifiedJob, preferences, cvSkills))
    })
    .filter((job) => !options.relevance || options.relevance === 'all' || (options.relevance === 'matched' && job.match.roleScore > 0))
    .filter((job) => !options.pipeline || options.pipeline === 'all' || (options.pipeline === 'tracked' ? Boolean(job.pipelineStatus) : job.pipelineStatus === options.pipeline))
    .sort((a, b) => b.match.score - a.match.score || Date.parse(b.postedAt ?? b.firstSeenAt) - Date.parse(a.postedAt ?? a.firstSeenAt))
  const total = mapped.length
  const cursor = Math.max(0, options.cursor ?? 0)
  const limit = Math.min(100, Math.max(1, options.limit ?? 30))
  mapped = mapped.slice(cursor, cursor + limit)
  return { jobs: mapped, total, nextCursor: cursor + limit < total ? String(cursor + limit) : null }
}

export async function getJob(userId: string, id: string, profileId?: string | null) {
  const supabase = getSupabaseClient()
  const [{ data, error }, { data: state }, preferences, cvSkills] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', id).single(),
    supabase.from('user_job_states').select('status,notes').eq('user_id', userId).eq('job_id', id).maybeSingle(),
    preferencesFor(userId), cvSkillsFor(userId, profileId),
  ])
  if (error || !data) throw new Error('Job not found')
  const storedRow = data as JobRow
  const description = textFromHtml(storedRow.description)
  const row = { ...storedRow, description, eligibility: classifyEligibility(storedRow.location, description) }
  if (row.created_by_user_id && row.created_by_user_id !== userId) throw new Error('Job not found')
  return mapJob(row, state ? { status: state.status as JobPipelineStatus, notes: state.notes as string } : undefined, scoreJob(row, preferences, cvSkills))
}

export async function createManualJob(userId: string, input: { companyName: string; title: string; url: string; location?: string; description?: string }) {
  const supabase = getSupabaseClient()
  const externalId = `manual:${userId}:${randomUUID()}`
  const description = textFromHtml(input.description ?? '')
  const normalized: NormalizedJob = {
    provider: 'external', externalId, companyName: input.companyName.trim(), title: input.title.trim(),
    description, location: input.location?.trim() ?? '', workplaceType: null, employmentType: null, salaryText: null,
    applyUrl: canonicalUrl(input.url), sourceUrl: canonicalUrl(input.url), postedAt: new Date().toISOString(),
    eligibility: classifyEligibility(input.location ?? '', description),
  }
  const { data, error } = await supabase.from('jobs').insert({
    provider: normalized.provider, external_id: externalId, created_by_user_id: userId, fingerprint: fingerprint(normalized), company_name: normalized.companyName,
    title: normalized.title, description, location: normalized.location, apply_url: normalized.applyUrl,
    source_url: normalized.sourceUrl, posted_at: normalized.postedAt, eligibility: normalized.eligibility,
  }).select('id').single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to add job')
  await setJobState(userId, data.id as string, 'saved', '')
  return getJob(userId, data.id as string)
}

export async function setJobState(userId: string, jobId: string, status: JobPipelineStatus, notes: string) {
  const { error } = await getSupabaseClient().from('user_job_states').upsert({
    user_id: userId, job_id: jobId, status, notes: notes.slice(0, 5000), updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,job_id' })
  if (error) throw new Error(error.message)
}

export async function getPreferences(userId: string) { return preferencesFor(userId) }

export async function savePreferences(userId: string, input: JobSearchPreferences) {
  const value = {
    user_id: userId, role_families: input.roleFamilies, skills: input.skills, seniority: input.seniority,
    countries: input.countries, remote: input.remote, relocation: input.relocation, updated_at: new Date().toISOString(),
  }
  const { error } = await getSupabaseClient().from('job_search_preferences').upsert(value, { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
  return input
}

export async function getJobMarketOverview(userId: string) {
  const supabase = getSupabaseClient()
  const { data: remotiveJobs } = await supabase.from('jobs').select('company_name,source_url,title').eq('provider', 'remotive').eq('status', 'active').limit(300)
  const rolePattern = /frontend|front-end|full.?stack|backend|node|typescript|ai engineer|applied ai|llm|machine learning/i
  const candidateSuggestions = new Map<string, { url: string; title: string }>()
  for (const job of remotiveJobs ?? []) {
    if (rolePattern.test(String(job.title)) && !candidateSuggestions.has(String(job.company_name))) {
      candidateSuggestions.set(String(job.company_name), { url: String(job.source_url), title: String(job.title) })
    }
  }
  for (const [name, value] of [...candidateSuggestions].slice(0, 12)) {
    await supabase.from('company_suggestions').upsert({
      user_id: userId, company_name: name, careers_url: value.url, reason: `Matching Remotive role: ${value.title}`,
    }, { onConflict: 'user_id,company_name', ignoreDuplicates: true })
  }
  const [{ data: companies, error }, { data: sources }, { data: followed }, { data: suggestions }, { data: jobs }] = await Promise.all([
    supabase.from('companies').select('*').order('name'),
    supabase.from('job_sources').select('*, companies(name)').order('created_at'),
    supabase.from('followed_companies').select('company_id').eq('user_id', userId),
    supabase.from('company_suggestions').select('*').eq('user_id', userId).eq('dismissed', false),
    supabase.from('jobs').select('company_id').eq('status', 'active'),
  ])
  if (error) throw new Error(error.message)
  const followedIds = new Set((followed ?? []).map((row) => row.company_id as string))
  const counts = new Map<string, number>()
  for (const job of jobs ?? []) if (job.company_id) counts.set(job.company_id as string, (counts.get(job.company_id as string) ?? 0) + 1)
  const mappedCompanies = (companies ?? []).map((company) => ({
    id: company.id, name: company.name, websiteUrl: company.website_url, careersUrl: company.careers_url,
    integrationType: company.integration_type, followed: followedIds.has(company.id as string), suggested: false,
    activeJobCount: counts.get(company.id as string) ?? 0,
  }))
  return {
    companies: mappedCompanies,
    suggestions: (suggestions ?? []).map((item) => ({ id: item.id, name: item.company_name, websiteUrl: null, careersUrl: item.careers_url ?? '', integrationType: 'external_only', followed: false, suggested: true, activeJobCount: 0 })),
    sources: ((sources ?? []) as SourceRow[]).map((source) => ({
      id: source.id, companyId: source.company_id, companyName: companyName(source), provider: source.provider,
      boardKey: source.board_key, sourceUrl: source.source_url, attribution: source.attribution, enabled: source.enabled,
      status: source.status, lastSyncedAt: source.last_synced_at, lastError: source.last_error,
    })),
  }
}

export async function addCompanySource(userId: string, input: { name: string; careersUrl: string; websiteUrl?: string }) {
  const detected = detectJobSource(input.careersUrl)
  const integrationType = detected.provider === 'external' ? 'external_only' : detected.provider
  const supabase = getSupabaseClient()
  const { data: company, error } = await supabase.from('companies').upsert({
    name: input.name.trim(), website_url: input.websiteUrl || null, careers_url: input.careersUrl, integration_type: integrationType,
  }, { onConflict: 'name' }).select('id').single()
  if (error || !company) throw new Error(error?.message ?? 'Failed to add company')
  await supabase.from('followed_companies').upsert({ user_id: userId, company_id: company.id }, { onConflict: 'user_id,company_id' })
  if (detected.provider !== 'external' && detected.boardKey) {
    const { error: sourceError } = await supabase.from('job_sources').upsert({
      company_id: company.id, provider: detected.provider, board_key: detected.boardKey,
      source_url: input.careersUrl, attribution: null, min_sync_minutes: 360,
    }, { onConflict: 'provider,board_key' })
    if (sourceError) throw new Error(sourceError.message)
  }
  return { id: company.id, provider: detected.provider, boardKey: detected.boardKey }
}

export async function deleteJobSource(id: string) {
  const { error } = await getSupabaseClient().from('job_sources').delete().eq('id', id).neq('provider', 'remotive')
  if (error) throw new Error(error.message)
}

export async function setJobSourceEnabled(id: string, enabled: boolean) {
  const { error } = await getSupabaseClient().from('job_sources').update({ enabled, status: enabled ? 'idle' : 'idle' }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function followCompany(userId: string, companyId: string) {
  const supabase = getSupabaseClient()
  let resolvedCompanyId = companyId
  const { data: company } = await supabase.from('companies').select('id').eq('id', companyId).maybeSingle()
  if (!company) {
    const { data: suggestion, error: suggestionError } = await supabase.from('company_suggestions').select('*').eq('id', companyId).eq('user_id', userId).single()
    if (suggestionError || !suggestion) throw new Error('Company suggestion not found')
    const { data: created, error: createError } = await supabase.from('companies').upsert({
      name: suggestion.company_name, careers_url: suggestion.careers_url || 'https://remotive.com/remote-jobs', integration_type: 'external_only',
    }, { onConflict: 'name' }).select('id').single()
    if (createError || !created) throw new Error(createError?.message ?? 'Failed to approve company')
    resolvedCompanyId = created.id as string
    await supabase.from('company_suggestions').delete().eq('id', companyId).eq('user_id', userId)
  }
  const { error } = await supabase.from('followed_companies').upsert({ user_id: userId, company_id: resolvedCompanyId }, { onConflict: 'user_id,company_id' })
  if (error) throw new Error(error.message)
}
