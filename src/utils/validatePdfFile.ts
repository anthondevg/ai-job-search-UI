const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024

export type PdfValidationError = 'invalidType' | 'tooLarge' | 'empty'

export function validatePdfFile(file: File): PdfValidationError | null {
  if (file.type !== 'application/pdf') {
    return 'invalidType'
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return 'tooLarge'
  }

  if (file.size === 0) {
    return 'empty'
  }

  return null
}
