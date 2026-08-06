import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyEligibility, detectJobSource, normalizeSourcePayload, scoreJob, textFromHtml } from './jobMarketService.js'
import { DEFAULT_JOB_PREFERENCES } from '../types/jobMarket.js'

test('removes executable and markup content from descriptions', () => {
  assert.equal(textFromHtml('<p>Hello &amp; welcome</p><script>alert(1)</script>'), 'Hello & welcome')
  assert.equal(textFromHtml('&lt;h2&gt;About Stripe&lt;/h2&gt;&lt;p&gt;Build things.&lt;/p&gt;'), 'About Stripe\nBuild things.')
  assert.equal(textFromHtml('&amp;lt;p&amp;gt;Double encoded&amp;lt;/p&amp;gt;'), 'Double encoded')
})

test('classifies global, LatAm, relocation, restricted, and unknown locations', () => {
  assert.equal(classifyEligibility('Remote worldwide'), 'global')
  assert.equal(classifyEligibility('Latin America'), 'latam')
  assert.equal(classifyEligibility('Berlin', 'Visa sponsorship available'), 'relocation')
  assert.equal(classifyEligibility('Remote - US only'), 'restricted')
  assert.equal(classifyEligibility('Hybrid'), 'unknown')
  assert.equal(classifyEligibility('Barcelona'), 'restricted')
  assert.equal(classifyEligibility('Spain (Remote)'), 'restricted')
  assert.equal(classifyEligibility('Spain (Remote)', 'If you are applying for this role from a different location, your recruiter will discuss your market range.'), 'unknown')
  assert.equal(classifyEligibility('Spain (Remote)', 'We are a global company with a 100% remote culture.'), 'restricted')
  assert.equal(classifyEligibility('Los Angeles', 'Relocation assistance is available.'), 'unknown')
  assert.equal(classifyEligibility('Los Angeles', 'Visa sponsorship is available.'), 'relocation')
})

test('detects supported ATS boards without fetching their pages', () => {
  assert.deepEqual(detectJobSource('https://boards.greenhouse.io/acme/jobs/123'), { provider: 'greenhouse', boardKey: 'acme' })
  assert.deepEqual(detectJobSource('https://jobs.lever.co/acme'), { provider: 'lever', boardKey: 'acme' })
  assert.deepEqual(detectJobSource('https://jobs.ashbyhq.com/acme'), { provider: 'ashby', boardKey: 'acme' })
  assert.deepEqual(detectJobSource('https://example.com/careers'), { provider: 'external', boardKey: 'example.com' })
})

test('normalizes Greenhouse, Lever, Ashby, and Remotive fixtures', () => {
  const greenhouse = normalizeSourcePayload('greenhouse', 'acme', 'Acme', { jobs: [{ id: 1, title: 'Frontend Engineer', content: '<p>React</p>', location: { name: 'Remote' }, absolute_url: 'https://example.com/1', updated_at: '2026-01-01' }] })
  const lever = normalizeSourcePayload('lever', 'acme', 'Acme', [{ id: '2', text: 'Full Stack Engineer', descriptionPlain: 'Node', categories: { location: 'LATAM', commitment: 'Full-time' }, hostedUrl: 'https://example.com/2', createdAt: 1_767_225_600_000 }])
  const ashby = normalizeSourcePayload('ashby', 'acme', 'Acme', { jobs: [{ id: '3', title: 'AI Engineer', descriptionPlain: 'LLMs', location: 'Worldwide', jobUrl: 'https://example.com/3', applyUrl: 'https://example.com/3/apply' }] })
  const remotive = normalizeSourcePayload('remotive', 'remote-jobs', 'Remotive', { jobs: [{ id: 4, company_name: 'Acme', title: 'Backend Engineer', description: '<p>TypeScript</p>', candidate_required_location: 'Latin America', url: 'https://remotive.com/job/4' }] })
  assert.equal(greenhouse[0]?.externalId, 'acme:1')
  assert.equal(lever[0]?.employmentType, 'Full-time')
  assert.equal(ashby[0]?.eligibility, 'global')
  assert.equal(remotive[0]?.companyName, 'Acme')
  assert.equal(remotive[0]?.description, 'TypeScript')
})

test('scores the role from the title and downweights skills mentioned only as bonuses', () => {
  const match = scoreJob({
    id: '1', source_id: 'source', company_id: null, created_by_user_id: null, provider: 'greenhouse', external_id: 'grafana:1',
    company_name: 'Grafana Labs', title: 'Senior Software Engineer - k6 Core',
    description: 'Strong production experience in Go and concurrency. Bonus Points For: JavaScript and TypeScript.',
    location: 'Spain (Remote)', workplace_type: 'remote', employment_type: 'full-time', salary_text: null,
    apply_url: 'https://example.com', source_url: 'https://example.com', posted_at: '2026-08-05',
    first_seen_at: '2026-08-05', last_seen_at: '2026-08-05', status: 'active', eligibility: 'unknown',
  }, DEFAULT_JOB_PREFERENCES, ['TypeScript'])
  assert.equal(match.roleScore, 0)
  assert.ok(match.skillScore < 5)
  assert.ok(match.reasons.includes('1 optional skill matched'))
})

test('does not match short skill names inside unrelated words', () => {
  const match = scoreJob({
    id: '2', source_id: 'source', company_id: null, created_by_user_id: null, provider: 'greenhouse', external_id: 'example:2',
    company_name: 'Example', title: 'Operations Manager', description: 'Maintaining customer systems and daily operations.',
    location: 'Worldwide', workplace_type: 'remote', employment_type: 'full-time', salary_text: null,
    apply_url: 'https://example.com/2', source_url: 'https://example.com/2', posted_at: '2026-08-05',
    first_seen_at: '2026-08-05', last_seen_at: '2026-08-05', status: 'active', eligibility: 'global',
  }, DEFAULT_JOB_PREFERENCES, ['AI'])
  assert.equal(match.roleScore, 0)
  assert.equal(match.skillScore, 0)
})
