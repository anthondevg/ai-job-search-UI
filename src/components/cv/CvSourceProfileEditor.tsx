import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useCvProfileEditor } from '../../hooks/useCvProfileEditor'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  CVProfile,
  EducationItem,
  LanguageLevel,
  ProjectItem,
} from '../../types/cvProfile'
import { LANGUAGE_LEVELS } from '../../utils/cvLanguages'
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
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null)
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)
  const [languageInput, setLanguageInput] = useState('')
  const [languageLevel, setLanguageLevel] = useState<LanguageLevel>('')
  const [certificationInput, setCertificationInput] = useState('')

  useEffect(() => {
    setEditingBullet(null)
    setIsEditingSummary(false)
    setEditingEducationIndex(null)
    setEditingProjectIndex(null)
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

  const addLanguage = (raw: string) => {
    const lang = normalizeSkill(raw)
    if (
      !lang ||
      draft.languages.some((item) => item.name.toLowerCase() === lang.toLowerCase())
    ) return
    updateDraft((prev) => ({
      ...prev,
      languages: [...prev.languages, { name: lang, level: languageLevel }],
    }))
    setLanguageInput('')
    setLanguageLevel('')
  }

  const setLanguageItemLevel = (index: number, level: LanguageLevel) => {
    updateDraft((prev) => ({
      ...prev,
      languages: prev.languages.map((item, i) =>
        i === index ? { ...item, level } : item,
      ),
    }))
  }

  const removeLanguage = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }))
  }

  const addCertification = (raw: string) => {
    const cert = normalizeSkill(raw)
    if (!cert || hasSkill(draft.certifications, cert)) return
    updateDraft((prev) => ({
      ...prev,
      certifications: [...prev.certifications, cert],
    }))
    setCertificationInput('')
  }

  const removeCertification = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }))
  }

  const setEducationField = (index: number, field: keyof EducationItem, value: string) => {
    updateDraft((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addEducationItem = () => {
    const newIndex = draft.education.length
    updateDraft((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', startDate: '', endDate: '' },
      ],
    }))
    setEditingEducationIndex(newIndex)
  }

  const removeEducationItem = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
    if (editingEducationIndex === index) setEditingEducationIndex(null)
  }

  const setProjectField = (index: number, field: keyof ProjectItem, value: string) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addProjectItem = () => {
    const newIndex = draft.projects.length
    updateDraft((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', url: '', startDate: '', endDate: '' },
      ],
    }))
    setEditingProjectIndex(newIndex)
  }

  const removeProjectItem = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }))
    if (editingProjectIndex === index) setEditingProjectIndex(null)
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

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.education')}
          </h3>
          {draft.education.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {draft.education.map((item, index) => (
                <li
                  key={`${item.institution}-${item.degree}-${index}`}
                  className="border-b border-border-muted pb-3 last:border-b-0 last:pb-0"
                >
                  {editingEducationIndex === index ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <input
                        type="text"
                        value={item.institution}
                        onChange={(e) => setEducationField(index, 'institution', e.target.value)}
                        placeholder={t('pages.cv.preview.institution')}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.degree}
                        onChange={(e) => setEducationField(index, 'degree', e.target.value)}
                        placeholder={t('pages.cv.preview.degree')}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.startDate}
                        onChange={(e) => setEducationField(index, 'startDate', e.target.value)}
                        placeholder={t('pages.cv.preview.education') + ' (start)'}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.endDate}
                        onChange={(e) => setEducationField(index, 'endDate', e.target.value)}
                        placeholder={t('pages.cv.preview.education') + ' (end)'}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingEducationIndex(null)}
                          className="rounded-control bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducationItem(index)}
                          className="rounded-control border border-border bg-surface-raised px-3 py-2 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                        >
                          {t('pages.cv.preview.removeEducation')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-heading">{item.institution || '—'}</p>
                        <p className="text-sm text-body">{item.degree || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-muted">
                          {item.startDate || '?'} – {item.endDate || '?'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingEducationIndex(index)}
                          className="rounded-control border border-border bg-surface-raised px-2 py-1 text-xs text-muted transition-colors hover:border-border-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducationItem(index)}
                          className="rounded-control border border-border bg-surface-raised px-2 py-1 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {t('pages.cv.preview.empty')}
            </p>
          )}
          <button
            type="button"
            onClick={addEducationItem}
            className="mt-3 rounded-control border border-dashed border-border px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-border-muted"
          >
            {t('pages.cv.preview.addEducation')}
          </button>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.languages')}
          </h3>
          {draft.languages.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {draft.languages.map((lang, index) => (
                <span key={`${lang.name}-${index}`} className="inline-flex items-center gap-1">
                  <span className="match-chip match-chip-muted">{lang.name}</span>
                  <select
                    value={lang.level}
                    onChange={(event) =>
                      setLanguageItemLevel(index, event.target.value as LanguageLevel)
                    }
                    aria-label={`${t('pages.cv.preview.languageLevel')}: ${lang.name}`}
                    className="match-input match-frame rounded-control border-border bg-surface-raised px-2 py-1 text-xs text-body"
                  >
                    {LANGUAGE_LEVELS.map((level) => (
                      <option key={level || 'none'} value={level}>
                        {level === ''
                          ? t('pages.cv.preview.languageLevel')
                          : level === 'Native'
                            ? t('pages.cv.preview.languageLevelNative')
                            : level}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="rounded-control border border-border bg-surface-raised px-1.5 py-0.5 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                    aria-label={t('pages.cv.preview.removeLanguage')}
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
          <form
            onSubmit={(e) => { e.preventDefault(); addLanguage(languageInput) }}
            className="mt-3 flex flex-wrap gap-2"
          >
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLanguage(languageInput)
                }
              }}
              placeholder={t('pages.cv.preview.languagePlaceholder')}
              className="match-input match-frame min-w-0 flex-1 rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
            />
            <select
              value={languageLevel}
              onChange={(event) => setLanguageLevel(event.target.value as LanguageLevel)}
              aria-label={t('pages.cv.preview.languageLevel')}
              className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body"
            >
              {LANGUAGE_LEVELS.map((level) => (
                <option key={level || 'none'} value={level}>
                  {level === ''
                    ? t('pages.cv.preview.languageLevel')
                    : level === 'Native'
                      ? t('pages.cv.preview.languageLevelNative')
                      : level}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!normalizeSkill(languageInput)}
              className="shrink-0 rounded-control border border-border bg-surface-tab px-3 py-2 text-xs font-medium text-body transition-colors hover:border-border-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('pages.cv.preview.addLanguage')}
            </button>
          </form>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.projects')}
          </h3>
          {draft.projects.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {draft.projects.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="border-b border-border-muted pb-3 last:border-b-0 last:pb-0"
                >
                  {editingProjectIndex === index ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setProjectField(index, 'name', e.target.value)}
                        placeholder={t('pages.cv.preview.projectName')}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => setProjectField(index, 'url', e.target.value)}
                        placeholder={t('pages.cv.preview.projectUrl')}
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.startDate}
                        onChange={(e) => setProjectField(index, 'startDate', e.target.value)}
                        placeholder="Start date"
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <input
                        type="text"
                        value={item.endDate}
                        onChange={(e) => setProjectField(index, 'endDate', e.target.value)}
                        placeholder="End date"
                        className="match-input match-frame rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => setProjectField(index, 'description', e.target.value)}
                        placeholder={t('pages.cv.preview.projectDescription')}
                        rows={3}
                        className="match-input match-frame col-span-2 rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
                      />
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProjectIndex(null)}
                          className="rounded-control bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProjectItem(index)}
                          className="rounded-control border border-border bg-surface-raised px-3 py-2 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                        >
                          {t('pages.cv.preview.removeProject')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-heading">{item.name || '—'}</p>
                        {item.description && (
                          <p className="mt-0.5 text-sm leading-relaxed text-body">{item.description}</p>
                        )}
                        {item.url && (
                          <p className="mt-0.5 text-xs text-link">{item.url}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="shrink-0 font-mono text-xs text-muted">
                          {item.startDate || '?'} – {item.endDate || '?'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingProjectIndex(index)}
                          className="rounded-control border border-border bg-surface-raised px-2 py-1 text-xs text-muted transition-colors hover:border-border-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProjectItem(index)}
                          className="rounded-control border border-border bg-surface-raised px-2 py-1 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {t('pages.cv.preview.empty')}
            </p>
          )}
          <button
            type="button"
            onClick={addProjectItem}
            className="mt-3 rounded-control border border-dashed border-border px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-border-muted"
          >
            {t('pages.cv.preview.addProject')}
          </button>
        </section>

        <section className="match-frame rounded-card border-border bg-surface-muted p-4 sm:col-span-2">
          <h3 className="text-sm font-semibold text-heading">
            {t('pages.cv.preview.certifications')}
          </h3>
          {draft.certifications.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {draft.certifications.map((cert, index) => (
                <span key={`${cert}-${index}`} className="inline-flex items-center gap-1">
                  <span className="match-chip match-chip-accent">{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="rounded-control border border-border bg-surface-raised px-1.5 py-0.5 text-xs text-muted transition-colors hover:border-border-muted hover:text-danger"
                    aria-label={t('pages.cv.preview.removeCertification')}
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
          <form
            onSubmit={(e) => { e.preventDefault(); addCertification(certificationInput) }}
            className="mt-3 flex flex-wrap gap-2"
          >
            <input
              type="text"
              value={certificationInput}
              onChange={(e) => setCertificationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCertification(certificationInput)
                }
              }}
              placeholder={t('pages.cv.preview.certificationPlaceholder')}
              className="match-input match-frame min-w-0 flex-1 rounded-control border-border bg-surface-raised px-3 py-2 text-sm text-body placeholder:text-muted/70"
            />
            <button
              type="submit"
              disabled={!normalizeSkill(certificationInput)}
              className="shrink-0 rounded-control border border-border bg-surface-tab px-3 py-2 text-xs font-medium text-body transition-colors hover:border-border-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('pages.cv.preview.addCertification')}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
