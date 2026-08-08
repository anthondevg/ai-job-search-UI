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
  education: string
  institution: string
  degree: string
  addEducation: string
  removeEducation: string
  languages: string
  addLanguage: string
  languagePlaceholder: string
  removeLanguage: string
  projects: string
  projectName: string
  projectDescription: string
  projectUrl: string
  addProject: string
  removeProject: string
  certifications: string
  addCertification: string
  certificationPlaceholder: string
  removeCertification: string
  empty: string
  addSkill: string
  skillPlaceholder: string
  removeSkill: string
  addBullet: string
  bulletPlaceholder: string
  removeBullet: string
  saving: string
  saved: string
  saveFailed: string
  editSummaryHint: string
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
  pasteFromClipboard: string
  pasting: string
  pasteUnavailable: string
  pasteTooShort: string
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
  generateCoverLetter: string
  generatingCoverLetter: string
  generatingCoverLetterHint: string
}

export type CvGenerateCoverLetterTranslations = {
  title: string
  description: string
  badge: string
  copy: string
  copied: string
  copyFailed: string
  pdfPreviewTitle: string
  pdfPreviewDescription: string
  pdfDownload: string
  pdfDownloading: string
  pdfDownloadFailed: string
  pdfLoadingPreview: string
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
  coverLetterFailed: string
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
  coverLetterTitle: string
  coverLetterDescription: string
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
  details: string
  candidate: string
  job: string
  unknown: string
  remotePolicy: string
  restrictions: string
  eligibility: {
    eligible: string
    likely_eligible: string
    unclear: string
    unlikely: string
    ineligible: string
  }
  flags: {
    visa_sponsorship_required: string
    us_timezone_restricted: string
    us_only_remote: string
    latam_excluded: string
    global_remote: string
    latam_friendly_remote: string
  }
  signal: {
    stated_in_posting: string
    inferred_from_knowledge: string
    none: string
  }
}

export type CvGenerateCompatibilityTranslations = {
  title: string
  match: string
  overallMatch: string
  applicationSignal: string
  skillsScore: string
  skillsHint: string
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
  coverLetter: CvGenerateCoverLetterTranslations
  pdf: CvGeneratePdfTranslations
  errors: CvGenerateErrorsTranslations
  steps: CvGenerateStepsTranslations
  empty: CvGenerateEmptyTranslations
  insights: CvGenerateInsightsTranslations
  hints: CvGenerateHintsTranslations
}

export type ProfileTranslations = {
  title: string
  description: string
  identity: string
  account: string
  fullName: string
  role: string
  location: string
  linkedin: string
  portfolio: string
  email: string
  emailHint: string
  password: string
  passwordHint: string
  newPassword: string
  saveProfile: string
  saveEmail: string
  savePassword: string
  saving: string
  saved: string
  emailConfirmation: string
  initials: string
  errors: {
    save: string
    passwordLength: string
  }
}

export type Translations = {
  app: {
    name: string
    tagline: string
    version: string
  }
  auth: {
    title: string
    description: string
    email: string
    password: string
    signIn: string
    signingIn: string
    signInFailed: string
    signOut: string
    loading: string
    eyebrow: string
    statement: string
    secureAccess: string
    analyze: string
    adapt: string
    apply: string
    landingEyebrow: string
    landingTitle: string
    landingDescription: string
    sourceTitle: string
    sourceDescription: string
    matchTitle: string
    matchDescription: string
    documentsTitle: string
    documentsDescription: string
    privacyTitle: string
    privacyDescription: string
  }
  nav: {
    cv: string
    jobScraperMarket: string
    profile: string
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
    profile: ProfileTranslations
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
  | `auth.${keyof Translations['auth']}`
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
  | `pages.cv.generate.${Exclude<keyof CvGenerateTranslations, 'jobDescription' | 'outputLanguage' | 'compatibility' | 'analysis' | 'actions' | 'tailored' | 'coverLetter' | 'pdf' | 'errors' | 'steps' | 'empty' | 'insights' | 'hints'>}`
  | `pages.cv.generate.jobDescription.${keyof CvJobDescriptionTranslations}`
  | `pages.cv.generate.outputLanguage.${keyof CvGenerateOutputLanguageTranslations}`
  | `pages.cv.generate.compatibility.${Exclude<keyof CvGenerateCompatibilityTranslations, 'level' | 'location'>}`
  | `pages.cv.generate.compatibility.level.${keyof CvGenerateCompatibilityTranslations['level']}`
  | `pages.cv.generate.compatibility.location.${Exclude<keyof CvGenerateCompatibilityLocationTranslations, 'eligibility' | 'flags' | 'signal'>}`
  | `pages.cv.generate.compatibility.location.eligibility.${keyof CvGenerateCompatibilityLocationTranslations['eligibility']}`
  | `pages.cv.generate.compatibility.location.flags.${keyof CvGenerateCompatibilityLocationTranslations['flags']}`
  | `pages.cv.generate.compatibility.location.signal.${keyof CvGenerateCompatibilityLocationTranslations['signal']}`
  | `pages.cv.generate.analysis.${keyof CvGenerateAnalysisTranslations}`
  | `pages.cv.generate.actions.${keyof CvGenerateActionsTranslations}`
  | `pages.cv.generate.tailored.${keyof CvGenerateTailoredTranslations}`
  | `pages.cv.generate.coverLetter.${keyof CvGenerateCoverLetterTranslations}`
  | `pages.cv.generate.pdf.${keyof CvGeneratePdfTranslations}`
  | `pages.cv.generate.errors.${keyof CvGenerateErrorsTranslations}`
  | `pages.cv.generate.steps.${keyof CvGenerateStepsTranslations}`
  | `pages.cv.generate.empty.${keyof CvGenerateEmptyTranslations}`
  | `pages.cv.generate.insights.${keyof CvGenerateInsightsTranslations}`
  | `pages.cv.generate.hints.${keyof CvGenerateHintsTranslations}`
  | `pages.profile.${Exclude<keyof ProfileTranslations, 'errors'>}`
  | `pages.profile.errors.${keyof ProfileTranslations['errors']}`
  | `pages.jobScraperMarket.${keyof Translations['pages']['jobScraperMarket']}`
