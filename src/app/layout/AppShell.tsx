import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileBottomNav } from './MobileBottomNav'
import type { AppRoute } from '../../lib/constants/routes'

interface AppShellProps {
  children: React.ReactNode
  currentRoute: AppRoute
  onNavigate: (route: AppRoute) => void
  onQuickNewReport: () => void
  settingsSubSection?: 'clients' | 'profile'
  onSettingsSubSectionChange?: (next: 'clients' | 'profile') => void
}

export function AppShell({
  children,
  currentRoute,
  onNavigate,
  onQuickNewReport,
  settingsSubSection,
  onSettingsSubSectionChange,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden w-72 shrink-0 border-r border-border bg-bg lg:block">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={onNavigate}
            onQuickNewReport={onQuickNewReport}
            settingsSubSection={settingsSubSection}
            onSettingsSubSectionChange={onSettingsSubSectionChange}
          />
        </div>

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar currentRoute={currentRoute} />
          <main className="flex min-h-0 flex-1 flex-col px-4 py-4 pb-[var(--fieldo-mobile-tab-bar-height)] md:px-6 md:py-6 lg:px-8 lg:pb-6">
            {children}
          </main>
        </div>
      </div>

      <div className="lg:hidden">
        <MobileBottomNav currentRoute={currentRoute} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

