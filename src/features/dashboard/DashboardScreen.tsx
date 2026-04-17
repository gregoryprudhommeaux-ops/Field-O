import React from 'react'

import { useLanguage } from '../../app/providers/LanguageProvider'
import { t } from '../../lib/i18n/translations'

interface DashboardScreenProps {
  onNewReport: () => void
  reportsCount: number
  draftsPendingSyncCount: number
  clientProfilesCount: number
  onOpenReports: () => void
  onOpenDraftsPendingSync: () => void
  onOpenClientProfiles: () => void
}

export function DashboardScreen({
  onNewReport,
  reportsCount,
  draftsPendingSyncCount,
  clientProfilesCount,
  onOpenReports,
  onOpenDraftsPendingSync,
  onOpenClientProfiles,
}: DashboardScreenProps) {
  const { language } = useLanguage()

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">{t(language, 'shellDashboardOverview')}</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{t(language, 'shellDashboardTitle')}</h3>
          </div>

          <button
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
            onClick={onNewReport}
          >
            {t(language, 'shellDashboardNewReportCta')}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">{t(language, 'shellDashboardStatus')}</p>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onOpenReports}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:bg-zinc-800/60"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">{t(language, 'shellDashboardReportsMetric')}</p>
            <p className="mt-2 text-2xl font-bold text-white">{reportsCount}</p>
          </button>
          <button
            type="button"
            onClick={onOpenDraftsPendingSync}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:bg-zinc-800/60"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">{t(language, 'shellDashboardDraftsPending')}</p>
            <p className="mt-2 text-2xl font-bold text-orange-300">{draftsPendingSyncCount}</p>
          </button>
          <button
            type="button"
            onClick={onOpenClientProfiles}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:bg-zinc-800/60"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">{t(language, 'shellDashboardClientProfilesMetric')}</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{clientProfilesCount}</p>
          </button>
        </div>
      </div>
    </section>
  )
}

