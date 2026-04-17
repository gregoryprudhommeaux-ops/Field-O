import React from 'react'

import type { ClientProfile } from '../../../types/client.types'
import { ClientForm } from '../components/ClientForm'

interface ClientFormScreenProps {
  initialValue?: Partial<ClientProfile>
  onSubmit: (value: {
    name: string
    logoUrl?: string
    defaultContactName?: string
    defaultContactEmail?: string
    location?: string
    notes?: string
  }) => Promise<void> | void
  submitLabel?: string
}

export function ClientFormScreen({ initialValue, onSubmit, submitLabel }: ClientFormScreenProps) {
  return (
    <section className="mx-auto max-w-3xl">
      <ClientForm initialValue={initialValue} onSubmit={onSubmit} submitLabel={submitLabel} />
    </section>
  )
}

