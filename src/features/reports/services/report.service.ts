import type { Report } from '../../../types/report.types'
import { createNewDraftReport, markReportAsFinal } from './report.factory'
import { validateReportBeforePreview } from './report-validation.service'
import { draftsRepository } from '../../../lib/db/repositories/drafts.repository'
import { generateBrandedReportPdf } from '../../pdf/services/pdf-generator.service'
import { setPdfPreview } from '../../pdf/services/pdf-preview.service'
import type { CompanySettings } from '../../../types/settings.types'
import type { ClientProfile } from '../../../types/client.types'

interface DraftRepository {
  getAllDrafts: () => Promise<Report[]>
  saveDraft: (report: Report) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
}

export function createInitialReport(templateId?: string, language: 'en' | 'es' = 'en'): Report {
  return createNewDraftReport(templateId, language)
}

export async function saveDraftReport(report: Report, draftRepository?: DraftRepository): Promise<Report> {
  const nextReport: Report = {
    ...report,
    status: 'draft',
    syncStatus: 'draft_local',
    updatedAt: new Date().toISOString(),
  }

  await (draftRepository?.saveDraft ? draftRepository.saveDraft(nextReport) : draftsRepository.saveDraft(nextReport))

  return nextReport
}

export async function prepareReportPreview(
  report: Report,
  options?: {
    companySettings?: CompanySettings | null
    clientProfile?: ClientProfile | null
  }
): Promise<{ previewUrl: string; finalReport: Report }> {
  const validation = validateReportBeforePreview(report)

  if (!validation.isValid) {
    const firstError = validation.issues.find((issue) => issue.severity === 'error')
    throw new Error(firstError?.message || 'Report validation failed.')
  }

  const finalReport = markReportAsFinal(report)
  const generatedPdf = await generateBrandedReportPdf(finalReport, options)
  const previewUrl = setPdfPreview(generatedPdf)

  await draftsRepository.saveDraft({
    ...finalReport,
    syncStatus: finalReport.syncStatus === 'synced' ? 'synced' : 'pending_sync',
    updatedAt: new Date().toISOString(),
  })

  return {
    previewUrl,
    finalReport,
  }
}

