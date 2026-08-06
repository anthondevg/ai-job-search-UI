import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyEligibility, detectJobSource, normalizeSourcePayload, textFromHtml } from './jobMarketService.js'

test('removes executable and markup content from descriptions', () => {
  assert.equal(textFromHtml('<p>Hello &amp; welcome</p><script>alert(1)</script>'), 'Hello & welcome')
})

test('classifies global, LatAm, relocation, restricted, and unknown locations', () => {
  assert.equal(classifyEligibility('Remote worldwide'), 'global')
  assert.equal(classifyEligibility('Latin America'), 'latam')
  assert.equal(classifyEligibility('Berlin', 'Visa sponsorship available'), 'relocation')
  assert.equal(classifyEligibility('Remote - US only'), 'restricted')
  assert.equal(classifyEligibility('Hybrid'), 'unknown')
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
