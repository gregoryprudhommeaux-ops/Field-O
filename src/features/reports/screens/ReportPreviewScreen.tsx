import React from 'react'

import { PdfToolbar } from '../../pdf/components/PdfToolbar'
import { PdfPreviewPanel } from '../../pdf/components/PdfPreviewPanel'

interface ReportPreviewScreenProps {
  previewUrl: string | null
  onBackToForm: () => void
  onBackToHistory: () => void
  onBackToDashboard: () => void
  onDownload: () => void
  onShare: () => void
  onOpenExternal: () => void
  hideDashboard?: boolean
  hideExternal?: boolean
}

export function ReportPreviewScreen({
  previewUrl,
  onBackToForm,
  onBackToHistory,
  onBackToDashboard,
  onDownload,
  onShare,
  onOpenExternal,
  hideDashboard,
  hideExternal,
}: ReportPreviewScreenProps) {
  return (
    <section className="flex min-h-screen flex-col bg-bg text-text-primary">
      <PdfToolbar
        onBackToForm={onBackToForm}
        onBackToHistory={onBackToHistory}
        onBackToDashboard={onBackToDashboard}
        onDownload={onDownload}
        onShare={onShare}
        onOpenExternal={onOpenExternal}
        hideDashboard={hideDashboard}
        hideExternal={hideExternal}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <PdfPreviewPanel previewUrl={previewUrl} onOpenExternal={onOpenExternal} onDownload={onDownload} />
      </div>
    </section>
  )
}
