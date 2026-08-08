import {
  Document,
  Link,
  Page,
  Text,
  View,
} from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { CVProfile } from '../../../types/cvProfile'
import { formatLanguageItem } from '../../../utils/cvLanguages'
import { cvPdfStyles as styles } from './cvPdfStyles'

export type CvPdfLabels = {
  summary: string
  skills: string
  experience: string
  education: string
  languages: string
  languageLevelNative: string
  certifications: string
}

type CvPdfDocumentProps = {
  profile: CVProfile
  labels: CvPdfLabels
}

function ContactLine({ profile }: { profile: CVProfile }) {
  const { personalInfo } = profile
  const parts: string[] = []

  if (personalInfo.email) parts.push(personalInfo.email)
  if (personalInfo.phone) parts.push(personalInfo.phone)
  if (personalInfo.location) parts.push(personalInfo.location)

  if (!parts.length && !personalInfo.linkedin && !personalInfo.website) {
    return null
  }

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

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

export default function CvPdfDocument({ profile, labels }: CvPdfDocumentProps) {
  const { personalInfo } = profile

  return (
    <Document
      title={personalInfo.name || 'CV'}
      author={personalInfo.name || undefined}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name || 'Curriculum Vitae'}</Text>
          <ContactLine profile={profile} />
        </View>

        {profile.summary && (
          <Section title={labels.summary}>
            <Text style={styles.paragraph}>{profile.summary}</Text>
          </Section>
        )}

        {profile.skills.length > 0 && (
          <Section title={labels.skills}>
            <Text style={styles.skillsLine}>{profile.skills.join(' • ')}</Text>
          </Section>
        )}

        {profile.experience.length > 0 && (
          <Section title={labels.experience}>
            {profile.experience.map((item) => (
              <View
                key={`${item.company}-${item.role}-${item.startDate}`}
                style={styles.experienceItem}
              >
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.role}>{item.role}</Text>
                    <Text style={styles.company}>{item.company}</Text>
                  </View>
                  <Text style={styles.dates}>
                    {item.startDate} – {item.endDate}
                  </Text>
                </View>
                {item.bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {item.bullets.map((bullet) => (
                      <Text key={bullet} style={styles.bullet}>
                        • {bullet}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {profile.education.length > 0 && (
          <Section title={labels.education}>
            {profile.education.map((item) => (
              <View
                key={`${item.institution}-${item.degree}-${item.startDate}`}
                style={styles.educationItem}
              >
                <Text style={styles.role}>{item.degree}</Text>
                <Text style={styles.company}>
                  {item.institution}
                  {item.startDate || item.endDate
                    ? `  |  ${item.startDate} – ${item.endDate}`
                    : ''}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {profile.languages.length > 0 && (
          <Section title={labels.languages}>
            <Text style={styles.mutedLine}>
              {profile.languages
                .map((language) => formatLanguageItem(language, labels.languageLevelNative))
                .join(' • ')}
            </Text>
          </Section>
        )}

        {profile.certifications.length > 0 && (
          <Section title={labels.certifications}>
            {profile.certifications.map((cert) => (
              <Text key={cert} style={styles.mutedLine}>
                • {cert}
              </Text>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  )
}
