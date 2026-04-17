import React from 'react'

import type { ClientProfile } from '../../../types/client.types'
import { useLanguage } from '../../../app/providers/LanguageProvider'
import { t } from '../../../lib/i18n/translations'

interface ClientCardProps {
  client: ClientProfile
  onEdit?: () => void
  onSelect?: () => void
}

export function ClientCard({ client, onEdit, onSelect }: ClientCardProps) {
  const { language } = useLanguage()

  return (
    <div className="rounded-2xl border border-border bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">{client.name}</p>
          <p className="mt-1 text-sm text-text-secondary">{client.location || t(language, 'shellClientCardNoLocation')}</p>
          {client.defaultContactName && (
            <p className="mt-1 text-xs text-text-secondary">
              {t(language, 'shellClientCardContact')}: {client.defaultContactName}
            </p>
          )}
        </div>

        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={`${client.name} logo`}
            className="h-12 w-12 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border text-[10px] uppercase text-text-secondary">
            {t(language, 'shellClientCardNoLogo')}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {onSelect && (
          <button className="rounded-lg bg-text-primary px-3 py-2 text-sm font-semibold text-bg hover:opacity-90" onClick={onSelect}>
            {t(language, 'shellClientCardSelect')}
          </button>
        )}
        {onEdit && (
          <button className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface" onClick={onEdit}>
            {t(language, 'shellSettingsEdit')}
          </button>
        )}
      </div>
    </div>
  )
}

