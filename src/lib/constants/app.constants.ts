import type { AppLanguage, UnitSystem } from '../../types/report.types'

export const APP_NAME = 'FIELD-O'

export const DEFAULT_LANGUAGE: AppLanguage = 'en'
export const DEFAULT_UNIT_SYSTEM: UnitSystem = 'metric'

export const REPORT_STATUSES = {
  draft: 'draft',
  final: 'final',
} as const

export const SYNC_STATUSES = {
  draftLocal: 'draft_local',
  pendingSync: 'pending_sync',
  synced: 'synced',
  syncFailed: 'sync_failed',
} as const

export const CHECKLIST_STATUSES = {
  pass: 'pass',
  fail: 'fail',
  na: 'na',
} as const

export const REPORT_STEPS = [
  'project-info',
  'equipment-units',
  'checklist',
  'documentation',
  'technical-readings',
  'signature-review',
  'generate',
] as const

export type ReportStep = (typeof REPORT_STEPS)[number]

