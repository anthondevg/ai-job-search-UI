export type CoverLetterResult = {
  roleTitle: string
  companyName: string
  /** Full letter ready to copy-paste (greeting + body + closing). */
  body: string
}

export type CoverLetterResponse = {
  result: CoverLetterResult
}
