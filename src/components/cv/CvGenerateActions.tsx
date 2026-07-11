import { useTranslation } from '../../hooks/useTranslation'
import { useCvGeneration } from '../../hooks/useCvGeneration'

export default function CvGenerateActions() {
  const { t } = useTranslation()
  const {
    canAnalyze,
    canGenerate,
    isAnalyzing,
    isGenerating,
    analyzeJobDescription,
    generateTailoredCv,
  } = useCvGeneration()

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => void analyzeJobDescription()}
        disabled={!canAnalyze}
        className="rounded-lg bg-surface-tab px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAnalyzing
          ? t('pages.cv.generate.actions.analyzing')
          : t('pages.cv.generate.actions.analyze')}
      </button>

      <button
        type="button"
        onClick={() => void generateTailoredCv()}
        disabled={!canGenerate}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? t('pages.cv.generate.actions.generating')
          : t('pages.cv.generate.actions.generate')}
      </button>
    </div>
  )
}
