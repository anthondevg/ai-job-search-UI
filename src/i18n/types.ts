export type Language = 'en' | 'es'

export type CvUploadTranslations = {
  title: string
  description: string
  collapsedSummary: string
  dropzone: string
  dropzoneShort: string
  hint: string
  browse: string
  emptyLibraryHint: string
  parsing: string
  replace: string
  errors: {
    invalidType: string
    tooLarge: string
    empty: string
    parseFailed: string
  }
}

export type CvLibraryTranslations = {
  title: string
  description: string
  loading: string
  empty: string
  active: string
  delete: string
  errors: {
    loadFailed: string
    deleteFailed: string
  }
}

export type CvPreviewTranslations = {
  title: string
  sourceOfTruth: string
  personalInfo: string
  name: string
  email: string
  location: string
  summary: string
  skills: string
  experience: string
  empty: string
}

export type CvTabsTranslations = {
  label: string
  import: string
  generate: string
}

export type CvJobDescriptionTranslations = {
  title: string
  description: string
  label: string
  placeholder: string
  hint: string
  clear: string
  characterCountLabel: string
}

export type CvGenerateAnalysisTranslations = {
  title: string
  description: string
  roleTitle: string
  seniority: string
  keywords: string
  requiredSkills: string
  preferredSkills: string
}

export type CvGenerateActionsTranslations = {
  analyze: string
  analyzing: string
  analyzingHint: string
  generate: string
  generating: string
  generatingHint: string
}

export type CvGenerateTailoredTranslations = {
  badge: string
  matchedSkills: string
  matchedKeywords: string
  adaptationNotes: string
  missingFromCv: string
  missingFromCvHint: string
}

export type CvGenerateErrorsTranslations = {
  jobDescriptionTooShort: string
  analyzeFailed: string
  analysisRequired: string
  generateFailed: string
}

export type CvGenerateStepsTranslations = {
  label: string
  offer: string
  analysis: string
  tailored: string
  current: string
  progress: string
  statusOffer: string
  statusAnalysis: string
  statusTailored: string
}

export type CvGenerateEmptyTranslations = {
  analysisTitle: string
  analysisDescription: string
  tailoredTitle: string
  tailoredDescription: string
}

export type CvGenerateInsightsTranslations = {
  title: string
  description: string
}

export type CvGenerateHintsTranslations = {
  noActiveCv: string
  analysisRequired: string
  jobDescriptionTooShort: string
}

export type CvGeneratePdfTranslations = {
  previewTitle: string
  previewDescription: string
  download: string
  downloading: string
  downloadFailed: string
  loadingPreview: string
  summary: string
  skills: string
  experience: string
  education: string
  languages: string
  certifications: string
}

export type CvGenerateOutputLanguageTranslations = {
  label: string
  hint: string
  en: string
  es: string
}

export type CvGenerateCompatibilityLocationTranslations = {
  title: string
  candidate: string
  job: string
  remotePolicy: string
  eligibility: {
    eligible: string
    likely_eligible: string
    unclear: string
    unlikely: string
    ineligible: string
  }
}

export type CvGenerateCompatibilityTranslations = {
  title: string
  match: string
  skillsScore: string
  strengths: string
  gaps: string
  level: {
    strong: string
    good: string
    partial: string
    weak: string
  }
  location: CvGenerateCompatibilityLocationTranslations
}

export type CvGenerateTranslations = {
  activeCv: string
  noActiveCv: string
  devMockBanner: string
  jobDescription: CvJobDescriptionTranslations
  outputLanguage: CvGenerateOutputLanguageTranslations
  compatibility: CvGenerateCompatibilityTranslations
  analysis: CvGenerateAnalysisTranslations
  actions: CvGenerateActionsTranslations
  tailored: CvGenerateTailoredTranslations
  pdf: CvGeneratePdfTranslations
  errors: CvGenerateErrorsTranslations
  steps: CvGenerateStepsTranslations
  empty: CvGenerateEmptyTranslations
  insights: CvGenerateInsightsTranslations
  hints: CvGenerateHintsTranslations
}

export type Translations = {
  app: {
    name: string
    tagline: string
    version: string
  }
  nav: {
    cv: string
    jobScraperMarket: string
  }
  sidebar: {
    expand: string
    collapse: string
    closeMenu: string
  }
  layout: {
    openMenu: string
  }
  language: {
    label: string
    en: string
    es: string
  }
  pages: {
    cv: {
      title: string
      description: string
      tabs: CvTabsTranslations
      upload: CvUploadTranslations
      library: CvLibraryTranslations
      preview: CvPreviewTranslations
      generate: CvGenerateTranslations
    }
    jobScraperMarket: {
      title: string
      description: string
      placeholderTitle: string
      placeholderDescription: string
    }
  }
}

export type TranslationKey =
  | `app.${keyof Translations['app']}`
  | `nav.${keyof Translations['nav']}`
  | `sidebar.${keyof Translations['sidebar']}`
  | `layout.${keyof Translations['layout']}`
  | `language.${keyof Translations['language']}`
  | `pages.cv.${Exclude<keyof Translations['pages']['cv'], 'upload' | 'library' | 'preview' | 'tabs' | 'generate'>}`
  | `pages.cv.tabs.${keyof CvTabsTranslations}`
  | `pages.cv.upload.${keyof CvUploadTranslations}`
  | `pages.cv.upload.errors.${keyof CvUploadTranslations['errors']}`
  | `pages.cv.library.${keyof CvLibraryTranslations}`
  | `pages.cv.library.errors.${keyof CvLibraryTranslations['errors']}`
  | `pages.cv.preview.${keyof CvPreviewTranslations}`
  | `pages.cv.generate.${Exclude<keyof CvGenerateTranslations, 'jobDescription' | 'outputLanguage' | 'compatibility' | 'analysis' | 'actions' | 'tailored' | 'pdf' | 'errors' | 'steps' | 'empty' | 'insights' | 'hints'>}`
  | `pages.cv.generate.jobDescription.${keyof CvJobDescriptionTranslations}`
  | `pages.cv.generate.outputLanguage.${keyof CvGenerateOutputLanguageTranslations}`
  | `pages.cv.generate.compatibility.${Exclude<keyof CvGenerateCompatibilityTranslations, 'level' | 'location'>}`
  | `pages.cv.generate.compatibility.level.${keyof CvGenerateCompatibilityTranslations['level']}`
  | `pages.cv.generate.compatibility.location.${Exclude<keyof CvGenerateCompatibilityLocationTranslations, 'eligibility'>}`
  | `pages.cv.generate.compatibility.location.eligibility.${keyof CvGenerateCompatibilityLocationTranslations['eligibility']}`
  | `pages.cv.generate.analysis.${keyof CvGenerateAnalysisTranslations}`
  | `pages.cv.generate.actions.${keyof CvGenerateActionsTranslations}`
  | `pages.cv.generate.tailored.${keyof CvGenerateTailoredTranslations}`
  | `pages.cv.generate.pdf.${keyof CvGeneratePdfTranslations}`
  | `pages.cv.generate.errors.${keyof CvGenerateErrorsTranslations}`
  | `pages.cv.generate.steps.${keyof CvGenerateStepsTranslations}`
  | `pages.cv.generate.empty.${keyof CvGenerateEmptyTranslations}`
  | `pages.cv.generate.insights.${keyof CvGenerateInsightsTranslations}`
  | `pages.cv.generate.hints.${keyof CvGenerateHintsTranslations}`
  | `pages.jobScraperMarket.${keyof Translations['pages']['jobScraperMarket']}`
