interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border bg-[var(--cream-card)] ${className}`}
      style={{
        borderColor: 'var(--border-light)',
        boxShadow: '0 2px 16px rgba(27, 23, 20, 0.05)',
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div
      className={`border-b px-6 py-4 ${className}`}
      style={{ borderColor: 'var(--border-light)' }}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}
