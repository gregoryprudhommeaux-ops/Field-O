import React, { useState } from 'react'

import type { ClientProfile } from '../../../types/client.types'
import { useLanguage } from '../../../app/providers/LanguageProvider'
import { t } from '../../../lib/i18n/translations'

interface ClientFormProps {
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

export function ClientForm({ initialValue, onSubmit, submitLabel }: ClientFormProps) {
  const { language } = useLanguage()
  const defaultSubmit = t(language, 'shellClientFormSaveDefault')
  const resolvedSubmit = submitLabel ?? defaultSubmit
  const [name, setName] = useState(initialValue?.name || '')
  const [logoUrl, setLogoUrl] = useState(initialValue?.logoUrl || '')
  const [defaultContactName, setDefaultContactName] = useState(initialValue?.defaultContactName || '')
  const [defaultContactEmail, setDefaultContactEmail] = useState(initialValue?.defaultContactEmail || '')
  const [location, setLocation] = useState(initialValue?.location || '')
  const [notes, setNotes] = useState(initialValue?.notes || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        name,
        logoUrl: logoUrl || undefined,
        defaultContactName: defaultContactName || undefined,
        defaultContactEmail: defaultContactEmail || undefined,
        location: location || undefined,
        notes: notes || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-bg p-5 md:p-6">
      <div>
        <h3 className="text-2xl font-bold text-text-primary">{t(language, 'shellClientFormTitle')}</h3>
        <p className="mt-1 text-sm text-text-secondary">{t(language, 'shellClientFormSubtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
          placeholder={t(language, 'shellClientFormPlaceholderName')}
          required
        />
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
          placeholder={t(language, 'shellClientFormPlaceholderLogo')}
        />
        <input
          value={defaultContactName}
          onChange={(e) => setDefaultContactName(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
          placeholder={t(language, 'shellClientFormPlaceholderContactName')}
        />
        <input
          value={defaultContactEmail}
          onChange={(e) => setDefaultContactEmail(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
          placeholder={t(language, 'shellClientFormPlaceholderContactEmail')}
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary md:col-span-2"
          placeholder={t(language, 'shellClientFormPlaceholderLocation')}
        />
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
        placeholder={t(language, 'shellClientFormPlaceholderNotes')}
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-bg disabled:opacity-50"
      >
        {loading ? t(language, 'shellClientFormSaving') : resolvedSubmit}
      </button>
    </form>
  )
}

