export type Language = 'en' | 'es'

export type CvUploadTranslations = {
  title: string
  description: string
  dropzone: string
  hint: string
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
  generate: string
  generating: string
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

export type CvGenerateTranslations = {
  activeCv: string
  noActiveCv: string
  jobDescription: CvJobDescriptionTranslations
  analysis: CvGenerateAnalysisTranslations
  actions: CvGenerateActionsTranslations
  tailored: CvGenerateTailoredTranslations
  errors: CvGenerateErrorsTranslations
}

export type Translations = {
  app: {
    name: string
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
  | `pages.cv.generate.${Exclude<keyof CvGenerateTranslations, 'jobDescription' | 'analysis' | 'actions' | 'tailored' | 'errors'>}`
  | `pages.cv.generate.jobDescription.${keyof CvJobDescriptionTranslations}`
  | `pages.cv.generate.analysis.${keyof CvGenerateAnalysisTranslations}`
  | `pages.cv.generate.actions.${keyof CvGenerateActionsTranslations}`
  | `pages.cv.generate.tailored.${keyof CvGenerateTailoredTranslations}`
  | `pages.cv.generate.errors.${keyof CvGenerateErrorsTranslations}`
  | `pages.jobScraperMarket.${keyof Translations['pages']['jobScraperMarket']}`
