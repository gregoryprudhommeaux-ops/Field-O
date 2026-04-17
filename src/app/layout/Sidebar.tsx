import React from 'react'
import { ROUTES, type AppRoute } from '../../lib/constants/routes'
import { useLanguage } from '../providers/LanguageProvider'
import { t } from '../../lib/i18n/translations'
import { BrandMark } from '../ui/BrandMark'

interface SidebarProps {
  currentRoute: AppRoute
  onNavigate: (route: AppRoute) => void
  onQuickNewReport: () => void
  settingsSubSection?: 'clients' | 'profile'
  onSettingsSubSectionChange?: (next: 'clients' | 'profile') => void
}

export function Sidebar({
  currentRoute,
  onNavigate,
  onQuickNewReport,
  settingsSubSection = 'clients',
  onSettingsSubSectionChange,
}: SidebarProps) {
  const { language, setLanguage } = useLanguage()

  const navItems = [
    { label: t(language, 'shellNavDashboard'), route: ROUTES.dashboard },
    { label: t(language, 'shellNavReport'), route: ROUTES.newReport },
    { label: t(language, 'settings'), route: ROUTES.settings },
  ]

  return (
    <aside className="flex h-full min-h-screen flex-col p-5">
      <div>
        <div className="mb-8 flex gap-3">
          <BrandMark imgClassName="h-12 w-12" alt="" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
              {t(language, 'shellFieldOperations')}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-text-primary">FIELD-O</h1>
            <p className="mt-2 text-sm text-text-secondary">{t(language, 'shellTagline')}</p>
          </div>
        </div>

        <button
          className="mb-6 w-full rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-bg hover:opacity-90"
          onClick={onQuickNewReport}
        >
          {t(language, 'shellQuickNewReportBtn')}
        </button>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = currentRoute === item.route
            return (
              <button
                key={item.route}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'border border-transparent text-text-secondary hover:bg-surface/60 hover:text-text-primary'
                }`}
                onClick={() => {
                  onNavigate(item.route)
                  if (item.route === ROUTES.settings) onSettingsSubSectionChange?.('clients')
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {currentRoute === ROUTES.settings && (
          <div className="mt-3 space-y-2 pl-3">
            <button
              type="button"
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                settingsSubSection === 'clients'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'border border-transparent text-text-secondary hover:bg-surface/60 hover:text-text-primary'
              }`}
              onClick={() => {
                onNavigate(ROUTES.settings)
                onSettingsSubSectionChange?.('clients')
              }}
            >
              {t(language, 'shellSubmenuClientsFiles')}
            </button>
            <button
              type="button"
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                settingsSubSection === 'profile'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'border border-transparent text-text-secondary hover:bg-surface/60 hover:text-text-primary'
              }`}
              onClick={() => {
                onNavigate(ROUTES.settings)
                onSettingsSubSectionChange?.('profile')
              }}
            >
              {t(language, 'shellSubmenuUserProfile')}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

