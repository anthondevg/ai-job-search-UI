import { pdf } from '@react-pdf/renderer'
import CvPdfDocument, { type CvPdfLabels } from '../components/cv/pdf/CvPdfDocument'
import type { CVProfile } from '../types/cvProfile'

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export function buildCvPdfFileName(profile: CVProfile, roleTitle?: string): string {
  const name = sanitizeFileName(profile.personalInfo.name || 'cv')
  const role = roleTitle ? sanitizeFileName(roleTitle) : 'tailored'
  return `${name}-${role}.pdf`
}

export async function downloadCvPdf(
  profile: CVProfile,
  labels: CvPdfLabels,
  roleTitle?: string,
): Promise<void> {
  const blob = await pdf(
    <CvPdfDocument profile={profile} labels={labels} />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildCvPdfFileName(profile, roleTitle)
  link.click()
  URL.revokeObjectURL(url)
}
