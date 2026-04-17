import type { AppLanguage } from '../../../types/report.types'

type CommonDefectLibrary = Record<string, Record<AppLanguage, string[]>>

/**
 * Compatibility export for the current MVP.
 * Keep the exact category keys and strings used by `src/App.tsx` today.
 */
export const COMMON_DEFECTS: CommonDefectLibrary = {
  electricity: {
    en: ['Corrosion detected', 'Loose wiring', 'Overtemperature', 'Incorrect grounding'],
    es: ['Corrosión detectada', 'Cableado suelto', 'Sobretemperatura', 'Toma de tierra incorrecta'],
  },
  security: {
    en: ['Missing safety guard', 'Obstruction in walkway', 'Emergency stop unresponsive', 'Worn signage'],
    es: ['Falta protección de seguridad', 'Obstrucción en el paso', 'Parada de emergencia no responde', 'Señalización desgastada'],
  },
  hydraulics: {
    en: ['Seal leak detected', 'Low system pressure', 'Damaged hydraulic hose', 'Contaminated fluid'],
    es: ['Fuga en sello detectada', 'Baja presión del sistema', 'Manguera hidráulica dañada', 'Fluido contaminado'],
  },
  mechanical: {
    en: ['Excessive vibration', 'Abnormal noise', 'Drive misalignment', 'Insufficient lubrication'],
    es: ['Vibración excesiva', 'Ruido anormal', 'Desalineación de transmisión', 'Lubricación insuficiente'],
  },
}

export const commonDefectsByCategory: CommonDefectLibrary = {
  electrical: {
    en: [
      'Loose wiring',
      'Voltage out of tolerance',
      'Breaker not labeled',
      'Phase imbalance detected',
      'Damaged terminal',
    ],
    es: [
      'Cableado flojo',
      'Voltaje fuera de tolerancia',
      'Interruptor sin etiqueta',
      'Desbalance de fases detectado',
      'Terminal dañado',
    ],
  },
  safety: {
    en: [
      'Guard missing',
      'Emergency stop not verified',
      'Unsafe access area',
      'Warning label missing',
      'Lockout tagout issue',
    ],
    es: [
      'Protección faltante',
      'Paro de emergencia no verificado',
      'Área de acceso insegura',
      'Etiqueta de advertencia faltante',
      'Problema de bloqueo y etiquetado',
    ],
  },
  hydraulic: {
    en: [
      'Oil leak',
      'Pressure unstable',
      'Valve not responding',
      'Hose damage detected',
      'Fluid level too low',
    ],
    es: [
      'Fuga de aceite',
      'Presión inestable',
      'Válvula sin respuesta',
      'Daño en manguera detectado',
      'Nivel de fluido demasiado bajo',
    ],
  },
  mechanical: {
    en: [
      'Abnormal vibration',
      'Bearing noise',
      'Misalignment detected',
      'Loose fasteners',
      'Excessive clearance',
    ],
    es: [
      'Vibración anormal',
      'Ruido en rodamiento',
      'Desalineación detectada',
      'Sujetadores flojos',
      'Holgura excesiva',
    ],
  },
}

export function getCommonDefects(category: string, language: AppLanguage): string[] {
  const normalized = category.toLowerCase()
  return commonDefectsByCategory[normalized]?.[language] ?? COMMON_DEFECTS[normalized]?.[language] ?? []
}

