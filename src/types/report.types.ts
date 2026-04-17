export type AppLanguage = 'en' | 'es'
export type ReportStatus = 'draft' | 'final'
export type SyncStatus = 'draft_local' | 'pending_sync' | 'synced' | 'sync_failed'
export type ChecklistStatus = 'pass' | 'fail' | 'na'
export type UnitSystem = 'metric' | 'imperial'

export interface ReportCustomFieldValue {
  key: string
  value: string
}

export interface ChecklistItemResult {
  id: string
  category: string
  itemLabel: string
  status: ChecklistStatus
  selectedCommonDefect?: string
  comment?: string
}

export interface TechnicalReading {
  id: string
  pointLabel: string
  speedPercent?: number | null
  rpm?: number | null
  current?: number | null
  power?: number | null
  flow?: number | null
  pressure?: number | null
  voltageMeasured?: number | null
  voltageToleranceStatus?: 'ok' | 'warning' | 'out_of_range' | null
}

export interface CommissioningYesNoCheck {
  id: string
  label: string
  value: 'yes' | 'no' | 'na'
  comment?: string
}

export interface CommissioningVoltageRecordings {
  rEarth?: number | null
  wEarth?: number | null
  bEarth?: number | null
  rW?: number | null
  rB?: number | null
  wB?: number | null
}

export interface CommissioningPowerRecordings {
  rBVoltage?: number | null
  rWVoltage?: number | null
  bWVoltage?: number | null
  rRmsCurrent?: number | null
  wRmsCurrent?: number | null
  bRmsCurrent?: number | null
}

export interface CommissioningLoadedOperationRow {
  id: string
  svPercent?: number | null
  motorRpm?: number | null
  currentRwb?: number | null
  powerKw?: number | null
  flowM3Min?: number | null
  p2Kpa?: number | null
  deltaPPa?: number | null
  t1C?: number | null
  t2C?: number | null
}

export interface CommissioningResults {
  minSv?: string
  maxSv?: string
  minOperatingPressure?: string
  maxOperatingPressure?: string
  tempAlarmSetpoints?: string
  filterAlarmSetpoints?: string
  airFlowRange?: string
  commissionedCpListRecorded?: string
}

export interface CommissioningData {
  customerInformation?: {
    plantOwner?: string
    plantName?: string
    plantAddress?: string
    primaryContactName?: string
    primaryContactEmail?: string
  }
  applicationProcessInfo?: {
    numberOfBlowers?: string
    blowerModel?: string
    blowerSNs?: string
    aerationProcess?: string
    waterDepth?: string
    aerationDevice?: string
  }
  photos?: {
    blowerHouse?: string[]
    headerPiping?: string[]
    aerationTanksValves?: string[]
  }
  prePowerOnChecks?: CommissioningYesNoCheck[]
  initialPowerUpChecks?: CommissioningYesNoCheck[]
  scadaControlChecks?: CommissioningYesNoCheck[]
  inputVoltageRecordings?: CommissioningVoltageRecordings
  inputPowerRecordings?: CommissioningPowerRecordings
  loadedOperation?: CommissioningLoadedOperationRow[]
  results?: CommissioningResults
  notes?: {
    voltageNotes?: string
    powerNotes?: string
    loadedOperationNotes?: string
    scadaNotes?: string
  }
  signatures?: {
    technicianName?: string
    customerName?: string
    technicianSignedAt?: string
    customerSignedAt?: string
  }
}

export interface EquipmentUnit {
  id: string
  name: string
  model?: string
  serialNumber?: string
  nominalVoltage?: number | null
  notes?: string
  photoUrls: string[]
  checklistItems: ChecklistItemResult[]
  technicalReadings: TechnicalReading[]
}

export interface ReportAttachment {
  id: string
  unitId?: string
  type: 'image' | 'file'
  url: string
  caption?: string
}

export interface Report {
  id: string
  clientId?: string
  clientName?: string
  projectName: string
  operatorName: string
  reportDate: string
  language: AppLanguage
  templateId?: string
  status: ReportStatus
  syncStatus: SyncStatus
  unitSystem: UnitSystem
  generalComments?: string
  signatureDataUrl?: string
  customFields: ReportCustomFieldValue[]
  equipmentUnits: EquipmentUnit[]
  attachments: ReportAttachment[]
  commissioning?: CommissioningData
  createdAt: string
  updatedAt: string
}

