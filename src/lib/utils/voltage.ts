export interface VoltageValidationResult {
  nominalVoltage: number | null
  measuredVoltage: number | null
  tolerancePercent: number
  deviationPercent: number | null
  status: 'ok' | 'warning' | 'out_of_range' | null
}

export function calculateVoltageDeviationPercent(
  nominalVoltage?: number | null,
  measuredVoltage?: number | null
): number | null {
  if (!nominalVoltage || !measuredVoltage) return null
  if (nominalVoltage === 0) return null

  return ((measuredVoltage - nominalVoltage) / nominalVoltage) * 100
}

export function validateVoltageTolerance(
  nominalVoltage?: number | null,
  measuredVoltage?: number | null,
  tolerancePercent = 10
): VoltageValidationResult {
  const deviation = calculateVoltageDeviationPercent(nominalVoltage, measuredVoltage)

  if (!nominalVoltage || !measuredVoltage || deviation === null) {
    return {
      nominalVoltage: nominalVoltage ?? null,
      measuredVoltage: measuredVoltage ?? null,
      tolerancePercent,
      deviationPercent: null,
      status: null,
    }
  }

  const absoluteDeviation = Math.abs(deviation)

  let status: 'ok' | 'warning' | 'out_of_range' = 'ok'

  if (absoluteDeviation > tolerancePercent) {
    status = 'out_of_range'
  } else if (absoluteDeviation > tolerancePercent * 0.8) {
    status = 'warning'
  }

  return {
    nominalVoltage,
    measuredVoltage,
    tolerancePercent,
    deviationPercent: Number(deviation.toFixed(2)),
    status,
  }
}

