import { pdf } from '@react-pdf/renderer'
import CoverLetterPdfDocument from '../components/cv/pdf/CoverLetterPdfDocument'
import type { CoverLetterResult } from '../types/coverLetter'
import type { CVProfile } from '../types/cvProfile'

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export function buildCoverLetterPdfFileName(
  profile: CVProfile,
  coverLetter: CoverLetterResult,
): string {
  const name = sanitizeFileName(profile.personalInfo.name || 'cover-letter')
  const role = sanitizeFileName(coverLetter.roleTitle || 'role')
  const company = coverLetter.companyName
    ? `-${sanitizeFileName(coverLetter.companyName)}`
    : ''
  return `${name}-cover-letter-${role}${company}.pdf`
}

export async function downloadCoverLetterPdf(
  profile: CVProfile,
  coverLetter: CoverLetterResult,
): Promise<void> {
  const blob = await pdf(
    <CoverLetterPdfDocument profile={profile} coverLetter={coverLetter} />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildCoverLetterPdfFileName(profile, coverLetter)
  link.click()
  URL.revokeObjectURL(url)
}
