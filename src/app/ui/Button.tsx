import React from 'react'
import { cn } from './ui'

type ButtonVariant = 'default' | 'primary' | 'soft' | 'success' | 'ghost'

export function Button({
  variant = 'default',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none'

  const styles: Record<ButtonVariant, string> = {
    default: 'border border-border text-text-primary hover:bg-surface',
    primary: 'bg-text-primary text-bg hover:opacity-90',
    soft: 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
    success: 'border border-success/30 bg-success/10 text-success hover:bg-success/20',
    ghost: 'border border-transparent text-text-secondary hover:bg-surface/60 hover:text-text-primary',
  }

  return <button className={cn(base, styles[variant], className)} {...props} />
}

