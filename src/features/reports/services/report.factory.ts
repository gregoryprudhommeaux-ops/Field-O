import type { Report } from '../../../types/report.types'
import { createReportFromTemplate, updateReportTimestamp } from '../state/report-form.helpers'

export function createNewDraftReport(templateId?: string, language: 'en' | 'es' = 'en'): Report {
  return createReportFromTemplate(templateId, language)
}

export function cloneReportForEditing(report: Report): Report {
  return {
    ...structuredClone(report),
    updatedAt: new Date().toISOString(),
  }
}

export function markReportAsFinal(report: Report): Report {
  return updateReportTimestamp({
    ...report,
    status: 'final',
  })
}

export function markReportAsPendingSync(report: Report): Report {
  return updateReportTimestamp({
    ...report,
    syncStatus: 'pending_sync',
  })
}

export function markReportAsSynced(report: Report): Report {
  return updateReportTimestamp({
    ...report,
    syncStatus: 'synced',
  })
}

export function markReportAsSyncFailed(report: Report): Report {
  return updateReportTimestamp({
    ...report,
    syncStatus: 'sync_failed',
  })
}

