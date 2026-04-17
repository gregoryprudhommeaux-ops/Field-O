import type { Report } from '../../types/report.types'
import { draftsRepository } from '../../lib/db/repositories/drafts.repository'
import { fetchCloudReports } from '../../lib/firebase/firestore'
import { sampleReports } from '../sample-data/sample-reports'

export async function getUnifiedHistory(): Promise<Report[]> {
  const localReports = await draftsRepository.getAllDrafts()

  let cloudReports: Report[] = []
  try {
    cloudReports = await fetchCloudReports()
  } catch (error) {
    console.warn('Cloud history unavailable, fallback to local/sample only', error)
  }

  const merged = [...sampleReports, ...localReports, ...cloudReports]
  const byId = new Map<string, Report>()

  for (const report of merged) {
    const existing = byId.get(report.id)
    if (!existing || existing.updatedAt < report.updatedAt) {
      byId.set(report.id, report)
    }
  }

  return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getUnifiedHistoryReportById(id: string): Promise<Report | undefined> {
  const all = await getUnifiedHistory()
  return all.find((r) => r.id === id)
}

