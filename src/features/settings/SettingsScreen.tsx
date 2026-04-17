import React, { useEffect, useMemo, useState } from 'react'

import type { CompanySettings } from '../../types/settings.types'
import type { ClientProfile } from '../../types/client.types'
import type { Report } from '../../types/report.types'
import { useLanguage } from '../../app/providers/LanguageProvider'
import { t, type TranslationKey } from '../../lib/i18n/translations'
import { getClients, createClient, updateClient } from '../clients/services/client.service'
import { ClientFormScreen } from '../clients/screens/ClientFormScreen'
import { getUnifiedHistory } from '../history/history.repository'
import { saveCompanySettings } from './services/settings.service'

interface SettingsScreenProps {
  settings: CompanySettings | null
  reports: Report[]
  onOpenPreview: (reportId: string) => void
  activeSubSection?: 'clients' | 'profile'
  onRequestSubSection?: (next: 'clients' | 'profile') => void
}

export function SettingsScreen({
  settings,
  reports,
  onOpenPreview,
  activeSubSection = 'clients',
  onRequestSubSection,
}: SettingsScreenProps) {
  const { language, setLanguage } = useLanguage()
  const ui = (key: TranslationKey) => t(language, key)

  const [clients, setClients] = useState<ClientProfile[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientMode, setClientMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null)

  const [historyReports, setHistoryReports] = useState<Report[]>(reports)

  const [companyDraft, setCompanyDraft] = useState<CompanySettings | null>(settings)
  const [savingCompany, setSavingCompany] = useState(false)

  useEffect(() => {
    setCompanyDraft(settings)
  }, [settings])

  useEffect(() => {
    setHistoryReports(reports)
  }, [reports])

  useEffect(() => {
    let alive = true

    void (async () => {
      try {
        const loaded = await getClients()
        if (alive) setClients(loaded)
        const h = await getUnifiedHistory()
        if (alive) setHistoryReports(h)
      } finally {
        if (alive) setClientsLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const reportsByClientId = useMemo(() => {
    const map = new Map<string, Report[]>()
    for (const r of historyReports) {
      const id = r.clientId || ''
      if (!id) continue
      const arr = map.get(id) || []
      arr.push(r)
      map.set(id, arr)
    }
    for (const [id, list] of map.entries()) {
      map.set(
        id,
        [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      )
    }
    return map
  }, [historyReports])

  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-border bg-bg p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-text-primary">{ui('shellSettingsTitle')}</h3>
            <p className="mt-1 text-sm text-text-secondary">{ui('shellSettingsSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mobile-only quick switches (sidebar submenu exists on desktop). */}
        <div className="flex flex-wrap gap-2 lg:hidden">
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeSubSection === 'clients'
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-border bg-surface text-text-secondary'
            }`}
            onClick={() => onRequestSubSection?.('clients')}
          >
            {ui('shellSettingsClientsTab')}
          </button>
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeSubSection === 'profile'
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-border bg-surface text-text-secondary'
            }`}
            onClick={() => onRequestSubSection?.('profile')}
          >
            {ui('shellSettingsProfileTab')}
          </button>
        </div>

        {activeSubSection === 'profile' && (
          <div className="rounded-3xl border border-border bg-bg p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-text-primary">{ui('shellSettingsUserProfileTitle')}</h4>
              <button
                className="rounded-xl border border-border px-3 py-2 text-sm text-text-primary hover:bg-surface"
                onClick={() => onRequestSubSection?.('clients')}
              >
                {ui('shellSettingsClose')}
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-text-secondary">
                  {ui('shellSettingsCompanyIntro').replace(
                    '{name}',
                    companyDraft?.companyName || ui('shellSettingsCompanyNameFallback')
                  )}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {ui('shellSettingsUiLanguageLabel')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="es">ESP (MX)</option>
                  <option value="en">EN</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {ui('shellSettingsCompanyName')}
                  </label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyName || ''}
                    onChange={(e) =>
                      setCompanyDraft((s) =>
                        s
                          ? { ...s, companyName: e.target.value }
                          : {
                              companyName: e.target.value,
                              customReportFields: [],
                              updatedAt: new Date().toISOString(),
                            }
                      )
                    }
                    placeholder={ui('shellSettingsPlaceholderCompanyLegal')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{ui('shellSettingsPhone')}</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyPhone || ''}
                    onChange={(e) => setCompanyDraft((s) => (s ? { ...s, companyPhone: e.target.value } : s))}
                    placeholder={ui('shellSettingsPlaceholderPhone')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{ui('shellSettingsEmail')}</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyEmail || ''}
                    onChange={(e) => setCompanyDraft((s) => (s ? { ...s, companyEmail: e.target.value } : s))}
                    placeholder={ui('shellSettingsPlaceholderEmail')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{ui('shellSettingsWebsite')}</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyWebsite || ''}
                    onChange={(e) => setCompanyDraft((s) => (s ? { ...s, companyWebsite: e.target.value } : s))}
                    placeholder={ui('shellSettingsPlaceholderWebsite')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{ui('shellSettingsAddress')}</label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyAddress || ''}
                    onChange={(e) => setCompanyDraft((s) => (s ? { ...s, companyAddress: e.target.value } : s))}
                    placeholder={ui('shellSettingsPlaceholderAddress')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {ui('shellSettingsCompanyLogoUrl')}
                  </label>
                  <input
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                    value={companyDraft?.companyLogoUrl || ''}
                    onChange={(e) => setCompanyDraft((s) => (s ? { ...s, companyLogoUrl: e.target.value } : s))}
                    placeholder={ui('shellSettingsPlaceholderLogo')}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {ui('shellSettingsCustomFields')}
                </label>
                <input
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
                  value={(companyDraft?.customReportFields || []).join(', ')}
                  onChange={(e) => {
                    const next = e.target.value
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean)
                    setCompanyDraft((s) =>
                      s ? { ...s, customReportFields: next } : { companyName: '', customReportFields: next, updatedAt: new Date().toISOString() }
                    )
                  }}
                  placeholder={ui('shellSettingsPlaceholderCustomFields')}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="rounded-xl border border-border px-4 py-3 text-sm text-text-primary hover:bg-surface"
                  onClick={() => setCompanyDraft(settings)}
                >
                  {ui('shellSettingsReset')}
                </button>
                <button
                  disabled={savingCompany}
                  className="rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-bg disabled:opacity-50"
                  onClick={async () => {
                    if (!companyDraft) return
                    setSavingCompany(true)
                    try {
                      await saveCompanySettings(companyDraft)
                        onRequestSubSection?.('clients')
                    } finally {
                      setSavingCompany(false)
                    }
                  }}
                >
                  {savingCompany ? ui('shellSettingsSaving') : ui('shellSettingsSave')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubSection === 'clients' && (
          <div className="rounded-3xl border border-border bg-bg p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-text-primary">{ui('shellSettingsClientsFilesTitle')}</h4>
                  <p className="mt-1 text-sm text-text-secondary">{ui('shellSettingsClientsFilesSubtitle')}</p>
                </div>

                <button
                  className="rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-bg hover:opacity-90"
                  onClick={() => {
                    setClientMode('create')
                    setEditingClient(null)
                  }}
                >
                  {ui('shellSettingsNewClient')}
                </button>
              </div>

              {clientsLoading ? (
                <div className="mt-6 text-sm text-text-secondary">{ui('shellSettingsLoadingClients')}</div>
              ) : (
                <div className="mt-6 space-y-3">
                  {clientMode !== 'list' ? (
                    <div className="space-y-4">
                      <button
                        className="rounded-xl border border-border px-4 py-3 text-sm text-text-primary hover:bg-surface"
                        onClick={() => {
                          setClientMode('list')
                          setEditingClient(null)
                        }}
                      >
                        {ui('shellSettingsBackToClients')}
                      </button>

                      <ClientFormScreen
                        initialValue={clientMode === 'edit' ? editingClient ?? undefined : undefined}
                        onSubmit={async (value) => {
                          if (clientMode === 'edit' && editingClient) {
                            await updateClient(editingClient.id, value)
                          } else {
                            await createClient(value)
                          }
                          const next = await getClients()
                          setClients(next)
                          setClientMode('list')
                          setEditingClient(null)
                        }}
                        submitLabel={clientMode === 'edit' ? ui('shellSettingsSubmitSaveClient') : ui('shellSettingsSubmitCreateClient')}
                      />
                    </div>
                  ) : (
                    clients.map((client) => {
                      const clientReports = reportsByClientId.get(client.id) || []
                      const expanded = expandedClientId === client.id

                      return (
                        <div key={client.id} className="rounded-2xl border border-border bg-surface">
                          <button
                            className="flex w-full items-center justify-between gap-3 p-4 text-left"
                            onClick={() => setExpandedClientId(expanded ? null : client.id)}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text-primary">{client.name}</p>
                              <p className="mt-1 text-sm text-text-secondary">
                                {client.location || '—'} ·{' '}
                                {clientReports.length === 1
                                  ? ui('shellSettingsReportCountOne').replace('{n}', String(clientReports.length))
                                  : ui('shellSettingsReportCountMany').replace('{n}', String(clientReports.length))}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary hover:bg-bg/50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingClient(client)
                                  setClientMode('edit')
                                }}
                              >
                                {ui('shellSettingsEdit')}
                              </button>
                            </div>
                          </button>

                          {expanded && (
                            <div className="border-t border-border p-4">
                              {clientReports.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border bg-bg p-4 text-sm text-text-secondary">
                                  {ui('shellSettingsNoReportsForClient')}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {clientReports.map((r) => (
                                    <button
                                      key={r.id}
                                      type="button"
                                      onClick={() => onOpenPreview(r.id)}
                                      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-bg p-3 text-left transition hover:border-primary/40 hover:bg-surface/80 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex-row md:items-center md:justify-between"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-text-primary">{r.projectName}</p>
                                        <p className="mt-1 text-xs text-text-secondary">
                                          {r.reportDate} · {r.operatorName} · {r.status.toUpperCase()}
                                        </p>
                                      </div>
                                      <span className="inline-flex w-fit shrink-0 self-start rounded-lg border border-border px-4 py-2 text-sm text-text-primary md:self-auto">
                                        {ui('shellHistoryPreview')}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  )
}

