import type { Report } from '../../types/report.types'
import { sampleReports } from '../sample-data/sample-reports'

let reportHistoryStore: Report[] = [...sampleReports]

export async function getHistoryReports(): Promise<Report[]> {
  return [...reportHistoryStore].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveReportToHistory(report: Report): Promise<void> {
  const existingIndex = reportHistoryStore.findIndex((item) => item.id === report.id)

  if (existingIndex >= 0) {
    reportHistoryStore[existingIndex] = {
      ...report,
      updatedAt: new Date().toISOString(),
    }
    return
  }

  reportHistoryStore = [
    {
      ...report,
      updatedAt: new Date().toISOString(),
    },
    ...reportHistoryStore,
  ]
}

export async function getHistoryReportById(id: string): Promise<Report | undefined> {
  return reportHistoryStore.find((report) => report.id === id)
}

