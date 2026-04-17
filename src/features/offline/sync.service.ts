import { draftsRepository } from '../../lib/db/repositories/drafts.repository'
import { fetchCloudReports, saveCloudReport } from '../../lib/firebase/firestore'
import type { Report } from '../../types/report.types'

export interface SyncResult {
  pulled: number
  pushed: number
  failed: number
}

function isNewer(a: Report, b: Report) {
  return a.updatedAt.localeCompare(b.updatedAt) > 0
}

export async function syncReportsWithCloud(): Promise<SyncResult> {
  let pulled = 0
  let pushed = 0
  let failed = 0

  const localDrafts = await draftsRepository.getAllDrafts()

  for (const draft of localDrafts) {
    if (draft.syncStatus === 'synced') continue

    try {
      const next: Report = {
        ...draft,
        syncStatus: 'synced',
        updatedAt: new Date().toISOString(),
      }

      await saveCloudReport(next)
      await draftsRepository.saveDraft(next)
      pushed += 1
    } catch (error) {
      console.error('Failed to push draft to cloud', error)
      failed += 1
    }
  }

  try {
    const cloudReports = await fetchCloudReports()
    if (cloudReports.length) {
      const localById = new Map(localDrafts.map((r) => [r.id, r]))
      const merged: Report[] = []

      for (const cloud of cloudReports) {
        const local = localById.get(cloud.id)
        if (!local || isNewer(cloud, local)) merged.push(cloud)
      }

      if (merged.length) await draftsRepository.bulkSaveDrafts(merged)
      pulled = merged.length
    }
  } catch (error) {
    console.error('Failed to pull cloud reports', error)
    failed += 1
  }

  return { pulled, pushed, failed }
}

export function watchConnectionAndSync(onSync?: (result: SyncResult) => void) {
  async function handleOnline() {
    const result = await syncReportsWithCloud()
    onSync?.(result)
  }

  window.addEventListener('online', handleOnline)

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}

