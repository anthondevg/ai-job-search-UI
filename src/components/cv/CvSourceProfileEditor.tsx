import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useCvProfileEditor } from '../../hooks/useCvProfileEditor'
import { useTranslation } from '../../hooks/useTranslation'
import type { CVProfile } from '../../types/cvProfile'
import SkillBadge from '../SkillBadge'

type CvSourceProfileEditorProps = {
  recordId: string
  profile: CVProfile
  fileName: string | null
}

type EditingBullet = {
  experienceIndex: number
  bulletIndex: number
}

function normalizeSkill(value: string): string {
  return value.trim()
}

function hasSkill(skills: string[], candidate: string): boolean {
  const normalized = candidate.toLowerCase()
  return skills.some((skill) => skill.toLowerCase() === normalized)
}

function isEditingBullet(
  editing: EditingBullet | null,
  experienceIndex: number,
  bulletIndex: number,
): boolean {
  return (
    editing?.experienceIndex === experienceIndex &&
    editing?.bulletIndex === bulletIndex
  )
}

type ExperienceBulletRowProps = {
  bullet: string
  experienceIndex: number
  bulletIndex: number
  isEditing: boolean
  onStartEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
  onRemove: () => void
}

function ExperienceBulletRow({
  bullet,
  experienceIndex,
  bulletIndex,
  isEditing,
  onStartEdit,
  onChange,
  onCommit,
  onRemove,
}: ExperienceBulletRowProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldEdit = isEditing || !bullet.trim()

  useEffect(() => {
    if (shouldEdit) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [shouldEdit, experienceIndex, bulletIndex])

  if (shouldEdit) {
    return (
      <li className="flex items-start gap-2">
        <input
          ref={inputRef}
          type="text"
          value={bullet}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onCommit()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              onCommit()
            }
          }}
          placeholder={t('pages.cv.preview.bulletPlaceholder')}
          className="match-input match-frame min-w-0 flex-1 rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRemove}
          className="shrink-0 rounded-control border border-border bg-surface-raised px-2 py-2 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
          aria-label={t('pages.cv.preview.removeBullet')}
        >
          ×
        </button>
      </li>
    )
  }

  return (
    <li className="group flex items-start gap-2">
      <button
        type="button"
        onClick={onStartEdit}
        className="min-w-0 flex-1 rounded-control text-left text-sm leading-relaxed text-body transition-colors hover:bg-surface-raised/80 hover:text-heading"
      >
        {bullet}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-control border border-border bg-surface-raised px-2 py-1 text-xs text-muted opacity-0 transition-all group-hover:opacity-100 hover:border-border-muted hover:text-danger"
        aria-label={t('pages.cv.preview.removeBullet')}
      >
        ×
      </button>
    </li>
  )
}

type EditableSummaryProps = {
  summary: string
  isEditing: boolean
  onStartEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
}

function EditableSummary({
  summary,
  isEditing,
  onStartEdit,
  onChange,
  onCommit,
}: EditableSummaryProps) {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus()
      const length = textareaRef.current?.value.length ?? 0
      textareaRef.current?.setSelectionRange(length, length)
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={summary}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onCommit()
          }
        }}
        rows={5}
        className="match-input match-frame mt-2 w-full resize-y rounded-control border-border bg-surface-raised px-3 py-2 text-sm leading-relaxed text-body placeholder:text-muted/70"
        placeholder={t('pages.cv.preview.empty')}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className="mt-2 w-full rounded-control text-left text-sm leading-relaxed transition-colors hover:bg-surface-raised/80"
    >
      {summary ? (
        <span className="text-body">{summary}</span>
      ) : (
        <span className="text-muted">{t('pages.cv.preview.empty')}</span>
      )}
    </button>
  )
}

function SaveStatusBadge({
  status,
  error,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  error: string | null
}) {
  const { t } = useTranslation()

  if (status === 'idle') return null

  if (status === 'saving') {
    return (
      <span className="match-chip match-chip-muted font-mono text-xs">
        {t('pages.cv.preview.saving')}
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="match-chip match-chip-success font-mono text-xs">
        {t('pages.cv.preview.saved')}
      </span>
    )
  }

  return (
    <span
      className="match-chip match-chip-danger font-mono text-xs"
      title={error ?? undefined}
    >
      {t('pages.cv.preview.saveFailed')}
    </span>
  )
}

export default function CvSourceProfileEditor({
  recordId,
  profile,
  fileName,
}: CvSourceProfileEditorProps) {
  const { t } = useTranslation()
  const { draft, updateDraft, profileSaveStatus, profileSaveError } =
    useCvProfileEditor(recordId, profile)
  const [skillInput, setSkillInput] = useState('')
  const [editingBullet, setEditingBullet] = useState<EditingBullet | null>(null)
  const [isEditingSummary, setIsEditingSummary] = useState(false)

  useEffect(() => {
    setEditingBullet(null)
    setIsEditingSummary(false)
  }, [recordId])

  const addSkill = (raw: string) => {
    const skill = normalizeSkill(raw)
    if (!skill || hasSkill(draft.skills, skill)) return

    updateDraft((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }))
    setSkillInput('')
  }

  const onSkillSubmit = (event: FormEvent) => {
    event.preventDefault()
    addSkill(skillInput)
  }

  const onSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSkill(skillInput)
    }
  }

  const removeSkill = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, skillIndex) => skillIndex !== index),
    }))
  }

  const setSummary = (summary: string) => {
    updateDraft((prev) => ({ ...prev, summary }))
  }

  const setBullet = (
    experienceIndex: number,
    bulletIndex: number,
    value: string,
  ) => {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item, itemIndex) =>
        itemIndex === experienceIndex
          ? {
              ...item,
              bullets: item.bullets.map((bullet, currentBulletIndex) =>
                currentBulletIndex === bulletIndex ? value : bullet,
              ),
            }
          : item,
      ),
    }))
  }

  const addBullet = (experienceIndex: number) => {
    const bulletIndex = draft.experience[experienceIndex]?.bullets.length ?? 0

    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item, itemIndex) =>
        itemIndex === experienceIndex
          ? { ...item, bullets: [...item.bullets, ''] }
          : item,
      ),
    }))
    setEditingBullet({ experienceIndex, bulletIndex })
  }

  const removeBullet = (experienceIndex: number, bulletIndex: number) => {
    updateDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((item, itemIndex) =>
        itemIndex === experienceIndex
          ? {
              ...item,
              bullets: item.bullets.filter(
                (_, currentBulletIndex) => currentBulletIndex !== bulletIndex,
              ),
            }
          : item,
      ),
    }))

    if (isEditingBullet(editingBullet, experienceIndex, bulletIndex)) {
      setEditingBullet(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-sm font-semibold text-heading">
            {t('pages.cv.preview.title')}
          </h2>
          {fileName && (
            <p className="mt-0.5 font-mono text-xs text-muted">{fileName}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaveStatusBadge
            status={profileSaveStatus}
            error={profileSaveError}
          />
          <span className="bg-success px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
            {t('pages.cv.preview.sourceOfTruth')}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="match-frame rounded-card border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.personalInfo')}
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">{t('pages.cv.preview.name')}</dt>
              <dd className="font-medium text-heading">
                {draft.personalInfo.name || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t('pages.cv.preview.email')}</dt>
              <dd className="text-body">{draft.personalInfo.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('pages.cv.preview.location')}</dt>
              <dd className="text-body">
                {draft.personalInfo.location || '—'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.summary')}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {t('pages.cv.preview.editSummaryHint')}
          </p>
          <EditableSummary
            summary={draft.summary}
            isEditing={isEditingSummary}
            onStartEdit={() => setIsEditingSummary(true)}
            onChange={setSummary}
            onCommit={() => setIsEditingSummary(false)}
          />
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.skills')}
          </h3>
          {draft.skills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {draft.skills.map((skill, index) => (
                <span key={`${skill}-${index}`} className="inline-flex items-center gap-1">
                  <SkillBadge label={skill} />
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="rounded-control border border-border bg-surface-raised px-1.5 py-0.5 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                    aria-label={t('pages.cv.preview.removeSkill')}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {t('pages.cv.preview.empty')}
            </p>
          )}
          <form onSubmit={onSkillSubmit} className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={onSkillKeyDown}
              placeholder={t('pages.cv.preview.skillPlaceholder')}
              className="match-input match-frame min-w-0 flex-1 rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
            />
            <button
              type="submit"
              disabled={!normalizeSkill(skillInput)}
              className="shrink-0 rounded-control border border-border bg-surface-tab px-3 py-2 text-xs font-medium text-body transition-colors hover:border-border-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('pages.cv.preview.addSkill')}
            </button>
          </form>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.experience')}
          </h3>
          {draft.experience.length > 0 ? (
            <ul className="mt-3 space-y-4">
              {draft.experience.map((item, experienceIndex) => (
                <li
                  key={`${item.company}-${item.role}-${item.startDate}-${experienceIndex}`}
                  className="border-b border-border-muted pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-heading">{item.role}</p>
                      <p className="text-sm text-body">{item.company}</p>
                    </div>
                    <p className="font-mono text-xs text-muted">
                      {item.startDate} – {item.endDate}
                    </p>
                  </div>

                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <ExperienceBulletRow
                        key={`${experienceIndex}-bullet-${bulletIndex}`}
                        bullet={bullet}
                        experienceIndex={experienceIndex}
                        bulletIndex={bulletIndex}
                        isEditing={isEditingBullet(
                          editingBullet,
                          experienceIndex,
                          bulletIndex,
                        )}
                        onStartEdit={() =>
                          setEditingBullet({ experienceIndex, bulletIndex })
                        }
                        onChange={(value) =>
                          setBullet(experienceIndex, bulletIndex, value)
                        }
                        onCommit={() => setEditingBullet(null)}
                        onRemove={() =>
                          removeBullet(experienceIndex, bulletIndex)
                        }
                      />
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => addBullet(experienceIndex)}
                    className="mt-2 rounded-control border border-dashed border-border px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-border-muted"
                  >
                    {t('pages.cv.preview.addBullet')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {t('pages.cv.preview.empty')}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
