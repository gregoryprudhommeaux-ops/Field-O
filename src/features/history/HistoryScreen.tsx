import React from 'react'

import type { Report } from '../../types/report.types'
import { Page } from '../../app/ui/Page'
import { Card } from '../../app/ui/Card'
import { useLanguage } from '../../app/providers/LanguageProvider'
import { t } from '../../lib/i18n/translations'

interface HistoryScreenProps {
  reports: Report[]
  onOpenPreview: (reportId: string) => void
}

export function HistoryScreen({ reports, onOpenPreview }: HistoryScreenProps) {
  const { language } = useLanguage()

  return (
    <Page
      kicker={t(language, 'shellFieldTool')}
      title={t(language, 'shellHistoryTitle')}
      subtitle={t(language, 'shellHistorySubtitle')}
    >
      <Card className="space-y-3 bg-bg p-4 md:p-5">
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-text-secondary">
            {t(language, 'shellHistoryEmpty')}
          </div>
        ) : (
          reports.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpenPreview(r.id)}
              className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary/40 hover:bg-surface/90 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">
                  {r.clientName || t(language, 'shellHistoryClientLabel')}
                </p>
                <h4 className="mt-1 text-lg font-semibold text-text-primary">
                  {r.projectName || t(language, 'shellHistoryReportFallback')}
                </h4>
                <p className="mt-1 text-sm text-text-secondary">
                  {r.reportDate} · {r.operatorName} · {r.status.toUpperCase()}
                </p>
              </div>

              <span className="inline-flex w-fit shrink-0 items-center justify-center self-start rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary md:self-auto">
                {t(language, 'shellHistoryPreview')}
              </span>
            </button>
          ))
        )}
      </Card>
    </Page>
  )
}

