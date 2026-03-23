'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties & { '--hover-bg'?: string }> = {
  primary: {},
  secondary: {},
  outline: {},
  ghost: {},
  danger: {},
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--forest)] text-[var(--cream-card)] hover:bg-[var(--forest-mid)] focus-visible:ring-[var(--forest)]',
  secondary:
    'bg-[var(--cream-card)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--border-light)] focus-visible:ring-[var(--border)]',
  outline:
    'border border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest-pale)] focus-visible:ring-[var(--forest)]',
  ghost:
    'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--border-light)] focus-visible:ring-[var(--border)]',
  danger:
    'bg-[var(--clay)] text-white hover:opacity-90 focus-visible:ring-[var(--clay)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs tracking-wide',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm tracking-wide',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
