import type { Report, EquipmentUnit, ChecklistItemResult } from '../../../types/report.types'
import { validateVoltageTolerance } from '../../../lib/utils/voltage'

export interface ValidationIssue {
  path: string
  message: string
  severity: 'error' | 'warning'
}

export interface ReportValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
}

function validateChecklistItem(
  item: ChecklistItemResult,
  unitIndex: number,
  itemIndex: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!item.itemLabel?.trim()) {
    issues.push({
      path: `equipmentUnits.${unitIndex}.checklistItems.${itemIndex}.itemLabel`,
      message: 'Checklist item label is required.',
      severity: 'error',
    })
  }

  if (item.status === 'fail' && !item.comment?.trim() && !item.selectedCommonDefect?.trim()) {
    issues.push({
      path: `equipmentUnits.${unitIndex}.checklistItems.${itemIndex}.comment`,
      message: 'A failed checklist item should include a defect selection or a comment.',
      severity: 'warning',
    })
  }

  return issues
}

function validateUnit(unit: EquipmentUnit, unitIndex: number): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!unit.name?.trim()) {
    issues.push({
      path: `equipmentUnits.${unitIndex}.name`,
      message: 'Equipment unit name is required.',
      severity: 'error',
    })
  }

  unit.checklistItems.forEach((item, itemIndex) => {
    issues.push(...validateChecklistItem(item, unitIndex, itemIndex))
  })

  unit.technicalReadings.forEach((reading, readingIndex) => {
    const voltage = validateVoltageTolerance(unit.nominalVoltage, reading.voltageMeasured)

    if (voltage.status === 'out_of_range') {
      issues.push({
        path: `equipmentUnits.${unitIndex}.technicalReadings.${readingIndex}.voltageMeasured`,
        message: `Measured voltage is outside the allowed tolerance for ${unit.name || 'this unit'}.`,
        severity: 'warning',
      })
    }
  })

  return issues
}

export function validateReportBeforePreview(report: Report): ReportValidationResult {
  const issues: ValidationIssue[] = []

  if (!report.projectName?.trim()) {
    issues.push({
      path: 'projectName',
      message: 'Project name is required.',
      severity: 'error',
    })
  }

  if (!report.operatorName?.trim()) {
    issues.push({
      path: 'operatorName',
      message: 'Operator name is required.',
      severity: 'error',
    })
  }

  if (!report.reportDate?.trim()) {
    issues.push({
      path: 'reportDate',
      message: 'Report date is required.',
      severity: 'error',
    })
  }

  if (!report.equipmentUnits.length) {
    issues.push({
      path: 'equipmentUnits',
      message: 'At least one equipment unit is required.',
      severity: 'error',
    })
  }

  report.equipmentUnits.forEach((unit, unitIndex) => {
    issues.push(...validateUnit(unit, unitIndex))
  })

  return {
    isValid: issues.filter((issue) => issue.severity === 'error').length === 0,
    issues,
  }
}

