type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-[var(--forest-pale)] text-[var(--forest)]',
  blue:   'bg-[#EBF0F8] text-[#3B5F8A]',
  gray:   'bg-[var(--border-light)] text-[var(--ink-muted)]',
  yellow: 'bg-[#F5EFD6] text-[#7A6020]',
  red:    'bg-[var(--clay-pale)] text-[var(--clay)]',
  purple: 'bg-[#EEE8F5] text-[#6B4A8A]',
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
