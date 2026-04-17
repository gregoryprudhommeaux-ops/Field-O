import type { AppLanguage } from '../../../types/report.types'

export interface ChecklistTemplateItem {
  id: string
  category: string
  label: Record<AppLanguage, string>
}

export interface ChecklistTemplate {
  id: string
  name: Record<AppLanguage, string>
  items: ChecklistTemplateItem[]
}

/**
 * Compatibility export for the current MVP (`src/types.ts`).
 * Keep the exact items and category keys used by the exported wizard today.
 */
export const legacyInitialChecklist = [
  {
    id: 'e1',
    category: 'electricity',
    label: { en: 'Main Panel connection', es: 'Conexión Panel Principal' },
    status: null,
  },
  {
    id: 'e2',
    category: 'electricity',
    label: { en: 'Proper grounding', es: 'Toma de tierra adecuada' },
    status: null,
  },
  {
    id: 's1',
    category: 'security',
    label: { en: 'Emergency stop functional', es: 'Parada de emergencia funcional' },
    status: null,
  },
  {
    id: 's2',
    category: 'security',
    label: { en: 'Warning signs visible', es: 'Señalización visible' },
    status: null,
  },
  {
    id: 'h1',
    category: 'hydraulics',
    label: { en: 'Pressure levels nominal', es: 'Niveles de presión nominales' },
    status: null,
  },
  {
    id: 'm1',
    category: 'mechanical',
    label: { en: 'Vibration levels', es: 'Niveles de vibración' },
    status: null,
  },
] as const

export const checklistTemplates: ChecklistTemplate[] = [
  {
    id: 'iturbo-blower-service',
    name: {
      en: 'iTurbo Blower Service',
      es: 'Servicio de Soplador iTurbo',
    },
    items: [
      {
        id: 'elec-1',
        category: 'electrical',
        label: {
          en: 'Verify incoming voltage',
          es: 'Verificar voltaje de entrada',
        },
      },
      {
        id: 'safety-1',
        category: 'safety',
        label: {
          en: 'Verify safety guards',
          es: 'Verificar protecciones de seguridad',
        },
      },
      {
        id: 'mech-1',
        category: 'mechanical',
        label: {
          en: 'Inspect blower alignment',
          es: 'Inspeccionar alineación del soplador',
        },
      },
      {
        id: 'hyd-1',
        category: 'hydraulic',
        label: {
          en: 'Check lubrication system',
          es: 'Revisar sistema de lubricación',
        },
      },
    ],
  },
  {
    id: 'standard-compressor',
    name: {
      en: 'Standard Compressor',
      es: 'Compresor Estándar',
    },
    items: [
      {
        id: 'elec-2',
        category: 'electrical',
        label: {
          en: 'Check motor wiring',
          es: 'Revisar cableado del motor',
        },
      },
      {
        id: 'safety-2',
        category: 'safety',
        label: {
          en: 'Verify emergency stop',
          es: 'Verificar paro de emergencia',
        },
      },
      {
        id: 'mech-2',
        category: 'mechanical',
        label: {
          en: 'Inspect coupling condition',
          es: 'Inspeccionar condición del acoplamiento',
        },
      },
      {
        id: 'hyd-2',
        category: 'hydraulic',
        label: {
          en: 'Check pressure stability',
          es: 'Revisar estabilidad de presión',
        },
      },
    ],
  },
]

