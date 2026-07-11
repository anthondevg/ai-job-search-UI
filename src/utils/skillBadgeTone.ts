const SKILL_BADGE_TONES = ['coral', 'mint', 'cyan', 'yellow', 'lavender'] as const

export type SkillBadgeTone = (typeof SKILL_BADGE_TONES)[number]

export function getSkillBadgeTone(label: string): SkillBadgeTone {
  let hash = 0

  for (let i = 0; i < label.length; i += 1) {
    hash = (hash + label.charCodeAt(i) * (i + 1)) % SKILL_BADGE_TONES.length
  }

  return SKILL_BADGE_TONES[Math.abs(hash) % SKILL_BADGE_TONES.length]
}

export function getSkillBadgeToneClass(label: string): string {
  return `match-skill-badge-${getSkillBadgeTone(label)}`
}
