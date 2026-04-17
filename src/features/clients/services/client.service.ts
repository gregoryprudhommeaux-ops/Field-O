import type { ClientProfile } from '../../../types/client.types'
import { sampleClients } from '../../sample-data/sample-clients'

import { clientsRepository } from '../../../lib/db/repositories/clients.repository'

export async function getClients(): Promise<ClientProfile[]> {
  const existing = await clientsRepository.getAllClients()
  if (existing.length) return existing

  await clientsRepository.bulkSaveClients(sampleClients)
  return await clientsRepository.getAllClients()
}

export async function getClientById(id: string): Promise<ClientProfile | undefined> {
  const existing = await clientsRepository.getClientById(id)
  if (existing) return existing

  // Fallback for sample clients if DB isn't seeded yet
  return sampleClients.find((c) => c.id === id)
}

export async function createClient(
  input: Omit<ClientProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ClientProfile> {
  const now = new Date().toISOString()

  const client: ClientProfile = {
    id: `client_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: now,
    updatedAt: now,
    ...input,
  }

  await clientsRepository.saveClient(client)
  return client
}

export async function updateClient(id: string, patch: Partial<ClientProfile>): Promise<ClientProfile | null> {
  const existing = await clientsRepository.getClientById(id)
  if (!existing) return null

  const nextClient: ClientProfile = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  await clientsRepository.saveClient(nextClient)
  return nextClient
}

