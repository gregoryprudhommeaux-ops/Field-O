import React, { useMemo } from 'react'
import { ROUTES, type AppRoute } from '../../lib/constants/routes'
import { useLanguage } from '../providers/LanguageProvider'
import { t } from '../../lib/i18n/translations'

interface MobileBottomNavProps {
  currentRoute: AppRoute
  onNavigate: (route: AppRoute) => void
}

export function MobileBottomNav({ currentRoute, onNavigate }: MobileBottomNavProps) {
  const { language } = useLanguage()
  const items = useMemo(
    () => [
      { label: t(language, 'shellMobileHome'), route: ROUTES.dashboard },
      { label: t(language, 'shellMobileNew'), route: ROUTES.newReport },
      { label: t(language, 'shellMobileSettings'), route: ROUTES.settings },
    ],
    [language]
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg px-2 pt-2 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const active = currentRoute === item.route
          return (
            <button
              key={item.route}
              className={`min-w-0 rounded-xl px-2 py-3 text-center text-xs font-medium leading-tight ${
                active ? 'bg-text-primary text-bg' : 'text-text-secondary'
              }`}
              onClick={() => onNavigate(item.route)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

