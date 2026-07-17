import { useCallback, useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  useJobDescription,
} from '../../hooks/useJobDescription'
import { useCvGeneration } from '../../hooks/useCvGeneration'

const MIN_PASTE_ANALYZE_LENGTH = 50

export default function JobDescriptionInput() {
  const { t } = useTranslation()
  const { isBusy, analyzeJobDescription } = useCvGeneration()
  const {
    text,
    hasText,
    characterCount,
    maxLength,
    isPasting,
    handleTextChange,
    clearText,
    pasteFromClipboard,
  } = useJobDescription()

  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)

  const showPasteFeedback = useCallback((message: string) => {
    setPasteFeedback(message)
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setPasteFeedback(null)
      feedbackTimerRef.current = null
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  const pasteAndAnalyze = useCallback(
    async (options?: { onlyIfEmpty?: boolean }) => {
      const result = await pasteFromClipboard(options)
      if (result === 'pasted') {
        void analyzeJobDescription()
        return
      }
      if (options?.onlyIfEmpty) return
      if (result === 'unavailable') {
        showPasteFeedback(t('pages.cv.generate.jobDescription.pasteUnavailable'))
        return
      }
      if (result === 'too_short') {
        showPasteFeedback(t('pages.cv.generate.jobDescription.pasteTooShort'))
      }
    },
    [analyzeJobDescription, pasteFromClipboard, showPasteFeedback, t],
  )

  const handlePasteClick = useCallback(() => {
    void pasteAndAnalyze()
  }, [pasteAndAnalyze])

  // Ctrl+V / right-click paste → fill and analyze immediately
  const handleNativePaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = event.clipboardData.getData('text').trim()
      if (pasted.length < MIN_PASTE_ANALYZE_LENGTH) return

      event.preventDefault()
      handleTextChange(pasted.slice(0, JOB_DESCRIPTION_MAX_LENGTH))
      void analyzeJobDescription()
    },
    [analyzeJobDescription, handleTextChange],
  )

  // When switching back from LinkedIn/etc., fill empty box and analyze.
  useEffect(() => {
    if (isBusy) return

    const tryAutoPaste = () => {
      if (document.visibilityState !== 'visible') return
      void pasteAndAnalyze({ onlyIfEmpty: true })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryAutoPaste()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', tryAutoPaste)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', tryAutoPaste)
    }
  }, [isBusy, pasteAndAnalyze])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-heading">
            {t('pages.cv.generate.jobDescription.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('pages.cv.generate.jobDescription.description')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePasteClick}
            disabled={isBusy || isPasting}
            className="match-frame rounded-control border-border px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-border-muted hover:bg-surface-raised disabled:pointer-events-none disabled:opacity-50"
          >
            {isPasting
              ? t('pages.cv.generate.jobDescription.pasting')
              : t('pages.cv.generate.jobDescription.pasteFromClipboard')}
          </button>
          {hasText && (
            <button
              type="button"
              onClick={clearText}
              disabled={isBusy}
              className="match-frame rounded-control border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-muted hover:text-body disabled:pointer-events-none disabled:opacity-50"
            >
              {t('pages.cv.generate.jobDescription.clear')}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="job-description" className="sr-only">
          {t('pages.cv.generate.jobDescription.label')}
        </label>
        <textarea
          id="job-description"
          name="job-description"
          value={text}
          onChange={(event) => handleTextChange(event.target.value)}
          onPaste={handleNativePaste}
          placeholder={t('pages.cv.generate.jobDescription.placeholder')}
          rows={20}
          maxLength={maxLength}
          disabled={isBusy}
          aria-busy={isBusy || isPasting}
          className="match-input match-frame min-h-80 w-full resize-y rounded-card border-border bg-surface-raised px-4 py-3 text-sm leading-relaxed text-body placeholder:text-muted/70 disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-96"
        />
        <p className="text-xs text-muted">
          {t('pages.cv.generate.jobDescription.hint')}
        </p>
        {pasteFeedback && (
          <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
            {pasteFeedback}
          </p>
        )}
        <p className="text-right font-mono text-xs text-muted">
          {t('pages.cv.generate.jobDescription.characterCountLabel')}:{' '}
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
        </p>
      </div>
    </section>
  )
}
