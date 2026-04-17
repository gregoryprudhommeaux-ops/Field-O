import { db } from '../dexie.schema'
import type { ClientProfile } from '../../../types/client.types'

export const clientsRepository = {
  async getAllClients(): Promise<ClientProfile[]> {
    return db.clients.orderBy('name').toArray()
  },

  async getClientById(id: string): Promise<ClientProfile | undefined> {
    return db.clients.get(id)
  },

  async saveClient(client: ClientProfile): Promise<void> {
    await db.clients.put(client)
  },

  async bulkSaveClients(clients: ClientProfile[]): Promise<void> {
    await db.clients.bulkPut(clients)
  },

  async deleteClient(id: string): Promise<void> {
    await db.clients.delete(id)
  },
}

