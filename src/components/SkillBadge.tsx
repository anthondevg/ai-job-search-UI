import { getSkillBadgeToneClass } from '../utils/skillBadgeTone'

export type SkillBadgeVariant = 'skill' | 'matched' | 'keyword' | 'missing'

type SkillBadgeProps = {
  label: string
  variant?: SkillBadgeVariant
}

function getVariantClass(label: string, variant: SkillBadgeVariant): string {
  switch (variant) {
    case 'matched':
      return 'match-skill-badge-matched'
    case 'keyword':
      return 'match-skill-badge-keyword'
    case 'missing':
      return 'match-skill-badge-missing'
    case 'skill':
    default:
      return getSkillBadgeToneClass(label)
  }
}

export default function SkillBadge({
  label,
  variant = 'skill',
}: SkillBadgeProps) {
  return (
    <span className={`match-skill-badge ${getVariantClass(label, variant)}`}>
      {label}
    </span>
  )
}
