import { db } from '../dexie.schema'
import type { Report } from '../../../types/report.types'

export const draftsRepository = {
  async getAllDrafts(): Promise<Report[]> {
    return db.drafts.orderBy('updatedAt').reverse().toArray()
  },

  async getDraftById(id: string): Promise<Report | undefined> {
    return db.drafts.get(id)
  },

  async saveDraft(report: Report): Promise<void> {
    await db.drafts.put(report)
  },

  async deleteDraft(id: string): Promise<void> {
    await db.drafts.delete(id)
  },

  async bulkSaveDrafts(reports: Report[]): Promise<void> {
    await db.drafts.bulkPut(reports)
  },
}

