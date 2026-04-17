import React from 'react'

import type { ClientProfile } from '../../../types/client.types'
import { ClientCard } from '../components/ClientCard'
import { useLanguage } from '../../../app/providers/LanguageProvider'
import { t } from '../../../lib/i18n/translations'

interface ClientListScreenProps {
  clients: ClientProfile[]
  onCreateNew: () => void
  onEditClient: (client: ClientProfile) => void
}

export function ClientListScreen({ clients, onCreateNew, onEditClient }: ClientListScreenProps) {
  const { language } = useLanguage()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-text-primary">{t(language, 'shellClientListTitle')}</h3>
          <p className="text-sm text-text-secondary">{t(language, 'shellClientListSubtitle')}</p>
        </div>

        <button className="rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-bg hover:opacity-90" onClick={onCreateNew}>
          {t(language, 'shellClientListAdd')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id}>
            <ClientCard client={client} onEdit={() => onEditClient(client)} />
          </div>
        ))}
      </div>
    </section>
  )
}

