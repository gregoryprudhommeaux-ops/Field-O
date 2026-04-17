import React from 'react'

import { useLanguage } from '../../../app/providers/LanguageProvider'
import { previewPdfToolbarLabels } from '../i18n/preview-pdf.strings'

interface PdfToolbarProps {
  title?: string
  subtitle?: string
  onBackToForm: () => void
  onBackToHistory: () => void
  onBackToDashboard: () => void
  onDownload: () => void
  onShare: () => void
  onOpenExternal: () => void
  hideDashboard?: boolean
  hideExternal?: boolean
}

export function PdfToolbar({
  title: titleOverride,
  subtitle: subtitleOverride,
  onBackToForm,
  onBackToHistory,
  onBackToDashboard,
  onDownload,
  onShare,
  onOpenExternal,
  hideDashboard = false,
  hideExternal = false,
}: PdfToolbarProps) {
  const { language } = useLanguage()
  const t = previewPdfToolbarLabels(language)
  const title = titleOverride ?? t.title
  const subtitle = subtitleOverride ?? t.subtitle

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-bg px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-base font-semibold text-text-primary md:text-lg">{title}</h2>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface"
          onClick={onBackToForm}
        >
          {t.backToForm}
        </button>
        <button
          className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface"
          onClick={onBackToHistory}
        >
          {t.history}
        </button>
        {!hideDashboard && (
          <button
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface"
            onClick={onBackToDashboard}
          >
            {t.dashboard}
          </button>
        )}
        {!hideExternal && (
          <button
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            onClick={onOpenExternal}
          >
            {t.external}
          </button>
        )}
        <button
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success hover:bg-success/20"
          onClick={onDownload}
        >
          {t.download}
        </button>
        <button className="rounded-lg bg-text-primary px-3 py-2 text-sm font-semibold text-bg hover:opacity-90" onClick={onShare}>
          {t.share}
        </button>
      </div>
    </div>
  )
}
