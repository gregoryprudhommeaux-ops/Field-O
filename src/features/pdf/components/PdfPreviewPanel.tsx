import React from 'react'

import { useLanguage } from '../../../app/providers/LanguageProvider'
import { previewPanelLabels } from '../i18n/preview-pdf.strings'

interface PdfPreviewPanelProps {
  previewUrl: string | null
  onOpenExternal: () => void
  onDownload: () => void
}

export function PdfPreviewPanel({ previewUrl, onOpenExternal, onDownload }: PdfPreviewPanelProps) {
  const { language } = useLanguage()
  const t = previewPanelLabels(language)

  if (!previewUrl) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
        <p className="mb-4 text-sm text-text-secondary">{t.unavailable}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            onClick={onOpenExternal}
          >
            {t.openFull}
          </button>
          <button
            className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success"
            onClick={onDownload}
          >
            {t.downloadPdf}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <object data={previewUrl} type="application/pdf" className="h-[72vh] w-full" aria-label={t.embedAria}>
        <div className="flex min-h-[420px] flex-col items-center justify-center bg-bg p-6 text-center">
          <p className="mb-4 text-sm text-text-secondary">{t.blocked}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
              onClick={onOpenExternal}
            >
              {t.openFull}
            </button>
            <button
              className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success"
              onClick={onDownload}
            >
              {t.downloadPdf}
            </button>
          </div>
        </div>
      </object>
    </div>
  )
}

