import { db } from '../dexie.schema'
import type { CompanySettings } from '../../../types/settings.types'

const SETTINGS_ID = 'company-settings'

export const settingsRepository = {
  async getSettings(): Promise<CompanySettings | null> {
    const settings = await db.settings.get(SETTINGS_ID)
    if (!settings) return null

    const { id: _id, ...rest } = settings
    return rest
  },

  async saveSettings(settings: CompanySettings): Promise<void> {
    await db.settings.put({
      id: SETTINGS_ID,
      ...settings,
      updatedAt: new Date().toISOString(),
    })
  },
}

