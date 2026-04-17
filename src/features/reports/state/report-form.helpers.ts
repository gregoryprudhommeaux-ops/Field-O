import type {
  AppLanguage,
  EquipmentUnit,
  Report,
  TechnicalReading,
  ChecklistItemResult,
  ChecklistStatus,
} from '../../../types/report.types'
import { CHECKLIST_STATUSES, DEFAULT_LANGUAGE, DEFAULT_UNIT_SYSTEM } from '../../../lib/constants/app.constants'
import { checklistTemplates } from '../constants/checklistTemplates'

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptyChecklistItem(category = 'general', itemLabel = ''): ChecklistItemResult {
  return {
    id: createId('check'),
    category,
    itemLabel,
    status: CHECKLIST_STATUSES.na as ChecklistStatus,
    selectedCommonDefect: '',
    comment: '',
  }
}

export function createEmptyTechnicalReading(): TechnicalReading {
  return {
    id: createId('reading'),
    pointLabel: '',
    speedPercent: null,
    rpm: null,
    current: null,
    power: null,
    flow: null,
    pressure: null,
    voltageMeasured: null,
    voltageToleranceStatus: null,
  }
}

export function createEmptyEquipmentUnit(): EquipmentUnit {
  return {
    id: createId('unit'),
    name: '',
    model: '',
    serialNumber: '',
    nominalVoltage: null,
    notes: '',
    photoUrls: [],
    checklistItems: [],
    technicalReadings: [],
  }
}

export function createReportFromTemplate(
  templateId?: string,
  language: AppLanguage = DEFAULT_LANGUAGE
): Report {
  const now = new Date().toISOString()
  const selectedTemplate = checklistTemplates.find((template) => template.id === templateId)

  const defaultUnit = createEmptyEquipmentUnit()

  if (selectedTemplate) {
    defaultUnit.checklistItems = selectedTemplate.items.map((item) => ({
      id: item.id,
      category: item.category,
      itemLabel: item.label[language],
      status: CHECKLIST_STATUSES.na,
      selectedCommonDefect: '',
      comment: '',
    }))
  }

  return {
    id: createId('report'),
    clientId: '',
    clientName: '',
    projectName: '',
    operatorName: '',
    reportDate: now.slice(0, 10),
    language,
    templateId: templateId ?? '',
    status: 'draft',
    syncStatus: 'draft_local',
    unitSystem: DEFAULT_UNIT_SYSTEM,
    generalComments: '',
    signatureDataUrl: '',
    customFields: [],
    equipmentUnits: [defaultUnit],
    attachments: [],
    commissioning: {
      prePowerOnChecks: [
        { id: createId('precheck'), label: 'Power to blower is present, Blower ELCB OFF.', value: 'na', comment: '' },
        {
          id: createId('precheck'),
          label: 'Input voltage within +/- 10% of nameplate (otherwise keep ELCB OFF).',
          value: 'na',
          comment: '',
        },
      ],
      initialPowerUpChecks: [
        { id: createId('pwrcheck'), label: 'Main CB Operation OK, Blower ELCB ON', value: 'na', comment: '' },
        { id: createId('pwrcheck'), label: 'HMI display boots up, correct graphics', value: 'na', comment: '' },
        { id: createId('pwrcheck'), label: 'Unload check, motor(s) rotation', value: 'na', comment: '' },
      ],
      inputVoltageRecordings: {
        rEarth: null,
        wEarth: null,
        bEarth: null,
        rW: null,
        rB: null,
        wB: null,
      },
      inputPowerRecordings: {
        rBVoltage: null,
        rWVoltage: null,
        bWVoltage: null,
        rRmsCurrent: null,
        wRmsCurrent: null,
        bRmsCurrent: null,
      },
      loadedOperation: [35, 40, 50, 60, 70, 80, 90].map((sv) => ({
        id: createId('loaded'),
        svPercent: sv,
        motorRpm: null,
        currentRwb: null,
        powerKw: null,
        flowM3Min: null,
        p2Kpa: null,
        deltaPPa: null,
        t1C: null,
        t2C: null,
      })),
      scadaControlChecks: [
        { id: createId('scada'), label: 'SV signal to blower (check with change)', value: 'na', comment: '' },
        { id: createId('scada'), label: 'Error codes to customer SCADA', value: 'na', comment: '' },
        { id: createId('scada'), label: 'Monitoring data to customer SCADA', value: 'na', comment: '' },
        { id: createId('scada'), label: 'Monitoring data with correct scaling', value: 'na', comment: '' },
      ],
      results: {
        minSv: '',
        maxSv: '',
        minOperatingPressure: '',
        maxOperatingPressure: '',
        tempAlarmSetpoints: '',
        filterAlarmSetpoints: '',
        airFlowRange: '',
        commissionedCpListRecorded: '',
      },
      notes: {
        voltageNotes: '',
        powerNotes: '',
        loadedOperationNotes: '',
        scadaNotes: '',
      },
      signatures: {
        technicianName: '',
        customerName: '',
        technicianSignedAt: '',
        customerSignedAt: '',
      },
    },
    createdAt: now,
    updatedAt: now,
  }
}

export function updateReportTimestamp(report: Report): Report {
  return {
    ...report,
    updatedAt: new Date().toISOString(),
  }
}

export function applyTemplateToUnit(unit: EquipmentUnit, templateId: string, language: AppLanguage): EquipmentUnit {
  const selectedTemplate = checklistTemplates.find((template) => template.id === templateId)

  if (!selectedTemplate) return unit

  return {
    ...unit,
    checklistItems: selectedTemplate.items.map((item) => ({
      id: item.id,
      category: item.category,
      itemLabel: item.label[language],
      status: CHECKLIST_STATUSES.na,
      selectedCommonDefect: '',
      comment: '',
    })),
  }
}

export function getStepIndex(step: string, steps: readonly string[]): number {
  return steps.findIndex((value) => value === step)
}

export function getNextStep(currentStep: string, steps: readonly string[]): string {
  const index = getStepIndex(currentStep, steps)
  if (index < 0 || index === steps.length - 1) return currentStep
  return steps[index + 1]
}

export function getPreviousStep(currentStep: string, steps: readonly string[]): string {
  const index = getStepIndex(currentStep, steps)
  if (index <= 0) return currentStep
  return steps[index - 1]
}

