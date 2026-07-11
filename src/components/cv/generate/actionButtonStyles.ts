export function actionButtonClassName({
  loading,
  unavailable,
  variant,
}: {
  loading: boolean
  unavailable: boolean
  variant: 'secondary' | 'primary'
}) {
  const base =
    'inline-flex min-w-36 items-center justify-center gap-2 rounded-control border px-4 py-2 text-sm font-medium transition-colors sm:min-w-40'

  if (loading) {
    return variant === 'primary'
      ? `${base} pointer-events-none cursor-wait border-accent bg-accent text-accent-foreground opacity-100 ring-2 ring-accent/40`
      : `${base} pointer-events-none cursor-wait border-accent/50 bg-surface-tab text-heading opacity-100 ring-2 ring-accent/30`
  }

  if (unavailable) {
    return variant === 'primary'
      ? `${base} pointer-events-none border-accent/60 bg-accent/60 text-accent-foreground opacity-50`
      : `${base} pointer-events-none border-border bg-surface-tab text-body opacity-50`
  }

  return variant === 'primary'
    ? `${base} border-accent bg-accent text-accent-foreground hover:bg-accent-hover`
    : `${base} border-border bg-surface-tab text-body hover:border-border-muted hover:bg-surface-muted`
}
