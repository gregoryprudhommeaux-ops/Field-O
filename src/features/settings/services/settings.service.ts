import type { CompanySettings } from '../../../types/settings.types'
import { settingsRepository } from '../../../lib/db/repositories/settings.repository'

const defaultSettings: CompanySettings = {
  companyName: 'SOLUCIONES ELECTRONICAS',
  companyAddress: '',
  companyPhone: '',
  companyWebsite: '',
  companyEmail: '',
  companyLogoUrl: '',
  defaultClientLogoUrl: '',
  customReportFields: ['Asset ID', 'Location', 'Client Name'],
  updatedAt: new Date().toISOString(),
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const existing = await settingsRepository.getSettings()
  if (existing) return existing

  await settingsRepository.saveSettings(defaultSettings)
  return (await settingsRepository.getSettings()) ?? { ...defaultSettings }
}

export async function saveCompanySettings(patch: Partial<CompanySettings>): Promise<CompanySettings> {
  const current = await getCompanySettings()
  const next: CompanySettings = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  await settingsRepository.saveSettings(next)
  return next
}

