import type { ClientProfile } from '../../types/client.types'

const now = new Date().toISOString()

export const sampleClients: ClientProfile[] = [
  {
    id: 'client-invent-pacific',
    name: 'INVENT PACIFIC',
    logoUrl: '',
    defaultContactName: 'Technical Service',
    defaultContactEmail: 'service@inventpacific.example',
    location: 'Meadville, PA, USA',
    notes: 'Default reference client for commissioning sample reports.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'client-commissioning-demo',
    name: 'COMMISSIONING DEMO CLIENT',
    logoUrl: '',
    defaultContactName: 'Operations Manager',
    defaultContactEmail: 'ops@demo-client.example',
    location: 'Querétaro, MX',
    notes: 'Second reference client for commissioning report example (Report A).',
    createdAt: now,
    updatedAt: now,
  },
]

