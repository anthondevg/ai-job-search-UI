import type { CvPdfLabels } from '../components/cv/pdf/CvPdfDocument'
import type { CvOutputLanguage } from '../types/cvOutputLanguage'

const labelsByLanguage: Record<CvOutputLanguage, CvPdfLabels> = {
  en: {
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    languages: 'Languages',
    languageLevelNative: 'Native',
    certifications: 'Certifications',
  },
  es: {
    summary: 'Resumen profesional',
    skills: 'Habilidades',
    experience: 'Experiencia',
    education: 'Educación',
    languages: 'Idiomas',
    languageLevelNative: 'Nativo',
    certifications: 'Certificaciones',
  },
}

export function getCvPdfLabels(language: CvOutputLanguage): CvPdfLabels {
  return labelsByLanguage[language]
}
