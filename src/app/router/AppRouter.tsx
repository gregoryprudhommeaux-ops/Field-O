import React, { useEffect, useMemo, useState } from 'react'

import { AppShell } from '../layout/AppShell'
import { ROUTES, type AppRoute } from '../../lib/constants/routes'
import { HistoryScreen } from '../../features/history/HistoryScreen'
import { SettingsScreen } from '../../features/settings/SettingsScreen'
import { NewReportScreen } from '../../features/reports/screens/NewReportScreen'
import { ReportPreviewScreen } from '../../features/reports/screens/ReportPreviewScreen'

import { getClients, getClientById } from '../../features/clients/services/client.service'
import { getCompanySettings } from '../../features/settings/services/settings.service'
import { prepareReportPreview } from '../../features/reports/services/report.service'
import { getUnifiedHistory, getUnifiedHistoryReportById } from '../../features/history/history.repository'
import { watchConnectionAndSync } from '../../features/offline/sync.service'
import { clearPdfPreview } from '../../features/pdf/services/pdf-preview.service'
import type { ClientProfile } from '../../types/client.types'
import type { Report } from '../../types/report.types'
import type { CompanySettings } from '../../types/settings.types'
import { useLanguage } from '../providers/LanguageProvider'
import { t } from '../../lib/i18n/translations'

function NewReportPlaceholder() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center text-zinc-300">
      New Report screen will be mounted here from the existing report wizard.
    </section>
  )
}

export default function AppRouter() {
  const { language } = useLanguage()
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(ROUTES.dashboard)
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [historyReports, setHistoryReports] = useState<Report[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [settingsSubSection, setSettingsSubSection] = useState<'clients' | 'profile'>('clients')

  useEffect(() => {
    if (currentRoute !== ROUTES.reportPreview && previewUrl) {
      try {
        if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      } catch {
        /* ignore */
      }
      clearPdfPreview()
      setPreviewUrl(null)
    }
  }, [currentRoute, previewUrl])

  useEffect(() => {
    void (async () => {
      const [c, s, h] = await Promise.all([getClients(), getCompanySettings(), getUnifiedHistory()])
      setClients(c)
      setCompanySettings(s)
      setHistoryReports(h)
    })()

    const stopWatching = watchConnectionAndSync(async () => {
      const nextHistory = await getUnifiedHistory()
      setHistoryReports(nextHistory)
    })

    function onNavigate(e: Event) {
      const detail = (e as CustomEvent).detail || {}
      const route = detail.route as AppRoute | undefined
      const sub = detail.settingsSubSection as 'clients' | 'profile' | undefined

      if (sub) setSettingsSubSection(sub)
      if (route) {
        if (route === ROUTES.newReport) {
          window.dispatchEvent(new CustomEvent('fieldo:start-new-report'))
        }
        setCurrentRoute(route)
      }
    }

    window.addEventListener('fieldo:navigate', onNavigate as any)

    return () => {
      stopWatching()
      window.removeEventListener('fieldo:navigate', onNavigate as any)
    }
  }, [])

  const screen = useMemo(() => {
    switch (currentRoute) {
      case ROUTES.dashboard:
        return (
          <HistoryScreen
            reports={historyReports}
            onOpenPreview={async (reportId) => {
              try {
                const report = historyReports.find((r) => r.id === reportId) ?? (await getUnifiedHistoryReportById(reportId))
                if (!report) return

                const client = report.clientId ? await getClientById(report.clientId) : undefined
                const { previewUrl: url } = await prepareReportPreview(report, {
                  companySettings,
                  clientProfile: client ?? null,
                })

                setPreviewUrl(url)
                setCurrentRoute(ROUTES.reportPreview)
              } catch (error) {
                console.error('Failed to open report preview', error)
                alert(t(language, 'shellPreviewOpenFailed'))
              }
            }}
          />
        )
      case ROUTES.newReport:
        return <NewReportScreen />
      case ROUTES.settings:
        return (
          <SettingsScreen
            settings={companySettings}
            reports={historyReports}
            activeSubSection={settingsSubSection}
            onRequestSubSection={setSettingsSubSection}
            onOpenPreview={async (reportId) => {
              try {
                const report = historyReports.find((r) => r.id === reportId) ?? (await getUnifiedHistoryReportById(reportId))
                if (!report) return

                const client = report.clientId ? await getClientById(report.clientId) : undefined
                const { previewUrl: url } = await prepareReportPreview(report, {
                  companySettings,
                  clientProfile: client ?? null,
                })

                setPreviewUrl(url)
                setCurrentRoute(ROUTES.reportPreview)
              } catch (error) {
                console.error('Failed to open report preview', error)
                alert(t(language, 'shellPreviewOpenFailed'))
              }
            }}
          />
        )
      case ROUTES.reportPreview:
        return (
          <ReportPreviewScreen
            previewUrl={previewUrl}
            onBackToForm={() => setCurrentRoute(ROUTES.newReport)}
            onBackToHistory={() => setCurrentRoute(ROUTES.dashboard)}
            onBackToDashboard={() => setCurrentRoute(ROUTES.dashboard)}
            onDownload={() => {
              if (!previewUrl) return
              const a = document.createElement('a')
              a.href = previewUrl
              a.download = 'field-o-report.pdf'
              document.body.appendChild(a)
              a.click()
              a.remove()
            }}
            onShare={() => {
              void (async () => {
                if (!previewUrl) return
                try {
                  const res = await fetch(previewUrl)
                  const blob = await res.blob()
                  const file = new File([blob], 'field-o-report.pdf', { type: 'application/pdf' })
                  if (navigator.share && navigator.canShare?.({ files: [file] })) {
                    await navigator.share({ files: [file], title: t(language, 'shellShareNativeTitle') })
                    return
                  }
                } catch {
                  /* fall through */
                }
                window.open(previewUrl, '_blank', 'noopener,noreferrer')
              })()
            }}
            onOpenExternal={() => {
              window.open(previewUrl || '', '_blank', 'noopener,noreferrer')
            }}
            hideDashboard
            hideExternal
          />
        )
      default:
        return <NewReportPlaceholder />
    }
  }, [clients, companySettings, currentRoute, historyReports, previewUrl, settingsSubSection, language])

  function navigate(route: AppRoute) {
    if (route === ROUTES.newReport) {
      window.dispatchEvent(new CustomEvent('fieldo:start-new-report'))
    }
    setCurrentRoute(route)
  }

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={navigate}
      onQuickNewReport={() => navigate(ROUTES.newReport)}
      settingsSubSection={settingsSubSection}
      onSettingsSubSectionChange={(next) => {
        setSettingsSubSection(next)
        setCurrentRoute(ROUTES.settings)
      }}
    >
      {screen}
    </AppShell>
  )
}

