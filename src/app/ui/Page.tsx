import React from 'react'

export function Page({
  kicker,
  title,
  subtitle,
  right,
  children,
}: {
  kicker?: string
  title: string
  subtitle?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-border bg-bg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {kicker ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">{kicker}</p>
            ) : null}
            <h3 className="mt-2 text-2xl font-black tracking-tight text-text-primary md:text-3xl">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-text-secondary">{subtitle}</p> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </header>
      {children}
    </section>
  )
}

