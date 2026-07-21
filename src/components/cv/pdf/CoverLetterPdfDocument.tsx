import { Document, Link, Page, Text, View } from '@react-pdf/renderer'
import type { CoverLetterResult } from '../../../types/coverLetter'
import type { CVProfile } from '../../../types/cvProfile'
import { coverLetterPdfStyles as styles } from './coverLetterPdfStyles'

type CoverLetterPdfDocumentProps = {
  profile: CVProfile
  coverLetter: CoverLetterResult
}

function ContactLine({ profile }: { profile: CVProfile }) {
  const { personalInfo } = profile
  const parts: string[] = []

  if (personalInfo.email) parts.push(personalInfo.email)
  if (personalInfo.phone) parts.push(personalInfo.phone)
  if (personalInfo.location) parts.push(personalInfo.location)

  return (
    <View>
      {parts.length > 0 && (
        <Text style={styles.contactRow}>{parts.join('  |  ')}</Text>
      )}
      {personalInfo.linkedin && (
        <Text style={styles.contactRow}>
          <Link src={personalInfo.linkedin} style={styles.link}>
            {personalInfo.linkedin}
          </Link>
        </Text>
      )}
      {personalInfo.website && (
        <Text style={styles.contactRow}>
          <Link src={personalInfo.website} style={styles.link}>
            {personalInfo.website}
          </Link>
        </Text>
      )}
    </View>
  )
}

export default function CoverLetterPdfDocument({
  profile,
  coverLetter,
}: CoverLetterPdfDocumentProps) {
  const { personalInfo } = profile
  const paragraphs = coverLetter.body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)

  const titleParts = [coverLetter.roleTitle, coverLetter.companyName].filter(
    Boolean,
  )

  return (
    <Document
      title={
        titleParts.length
          ? `Cover Letter — ${titleParts.join(' · ')}`
          : 'Cover Letter'
      }
      author={personalInfo.name || undefined}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.name || 'Cover Letter'}
          </Text>
          <ContactLine profile={profile} />
          {titleParts.length > 0 && (
            <Text style={styles.metaLine}>{titleParts.join(' · ')}</Text>
          )}
        </View>

        <View style={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <Text key={`${index}-${paragraph.slice(0, 24)}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
}
