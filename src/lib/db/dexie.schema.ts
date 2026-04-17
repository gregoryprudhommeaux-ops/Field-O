import Dexie, { type Table } from 'dexie'

import type { Report } from '../../types/report.types'
import type { ClientProfile } from '../../types/client.types'
import type { CompanySettings } from '../../types/settings.types'

export class FieldODatabase extends Dexie {
  drafts!: Table<Report, string>
  clients!: Table<ClientProfile, string>
  settings!: Table<CompanySettings & { id: string }, string>

  constructor() {
    super('fieldo-db')

    this.version(1).stores({
      drafts: 'id, updatedAt, syncStatus, clientId, status',
      clients: 'id, name, updatedAt',
      settings: 'id, updatedAt',
    })
  }
}

export const db = new FieldODatabase()

