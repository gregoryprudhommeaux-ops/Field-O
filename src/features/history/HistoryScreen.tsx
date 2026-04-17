import React from 'react'

import type { Report } from '../../types/report.types'
import { Page } from '../../app/ui/Page'
import { Card } from '../../app/ui/Card'
import { Button } from '../../app/ui/Button'
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
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
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

              <div className="flex gap-2">
                <Button onClick={() => onOpenPreview(r.id)}>{t(language, 'shellHistoryPreview')}</Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </Page>
  )
}

