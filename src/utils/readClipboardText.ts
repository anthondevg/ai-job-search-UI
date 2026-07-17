/**
 * Reads plain text from the system clipboard.
 * Requires a secure context (HTTPS/localhost) and user permission in Chrome.
 * Returns null when unavailable, denied, or empty.
 */
export async function readClipboardText(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    return null
  }

  try {
    const text = await navigator.clipboard.readText()
    const trimmed = text.trim()
    return trimmed.length > 0 ? trimmed : null
  } catch {
    // NotAllowedError, SecurityError, or unsupported — fail silently
    return null
  }
}
