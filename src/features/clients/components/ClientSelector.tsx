import React from 'react'

import { useLanguage } from '../../../app/providers/LanguageProvider'
import { t } from '../../../lib/i18n/translations'

// Intentionally minimal: lets legacy wizard + modular UI share the same selector.
export interface ClientSelectorItem {
  id: string
  name: string
}

interface ClientSelectorProps {
  clients: ClientSelectorItem[]
  selectedClientId?: string
  onSelect: (clientId: string) => void
  onCreateNew?: () => void
}

export function ClientSelector({ clients, selectedClientId, onSelect, onCreateNew }: ClientSelectorProps) {
  const { language } = useLanguage()

  return (
    <div className="space-y-3">
      <select
        value={selectedClientId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
      >
        <option value="">{t(language, 'shellClientSelectorPlaceholder')}</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-300"
        >
          {t(language, 'shellClientSelectorNewButton')}
        </button>
      )}
    </div>
  )
}

