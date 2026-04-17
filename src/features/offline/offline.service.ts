import type { Report } from '../../types'

export interface OfflineDraftRepository {
  getAllDrafts: () => Promise<Report[]>
  saveDraft: (report: Report) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
}

export interface RemoteReportRepository {
  syncReport: (report: Report) => Promise<void>
}

export async function saveDraftOffline(repository: OfflineDraftRepository, report: Report): Promise<void> {
  await repository.saveDraft({
    ...report,
    status: 'draft',
    createdAt: report.createdAt || new Date().toISOString(),
  })
}

export async function deleteOfflineDraft(repository: OfflineDraftRepository, draftId: string): Promise<void> {
  await repository.deleteDraft(draftId)
}

export async function syncOfflineDrafts(
  localRepository: OfflineDraftRepository,
  remoteRepository: RemoteReportRepository
): Promise<{ synced: number; failed: number }> {
  const drafts = await localRepository.getAllDrafts()

  let synced = 0
  let failed = 0

  for (const draft of drafts) {
    try {
      await remoteRepository.syncReport({
        ...draft,
        status: 'synced',
      })

      await localRepository.deleteDraft(draft.id)
      synced += 1
    } catch (error) {
      console.error(`Failed to sync draft ${draft.id}`, error)
      failed += 1
    }
  }

  return { synced, failed }
}

