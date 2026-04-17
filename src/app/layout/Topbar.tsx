import React from 'react'
import type { AppRoute } from '../../lib/constants/routes'
import { useLanguage } from '../providers/LanguageProvider'
import type { AppLanguage } from '../../types/report.types'
import { t } from '../../lib/i18n/translations'

interface TopbarProps {
  currentRoute: AppRoute
  onQuickNewReport: () => void
}

function getTitle(route: AppRoute, language: AppLanguage): string {
  switch (route) {
    case 'dashboard':
      return t(language, 'shellPageReports')
    case 'new-report':
      return t(language, 'shellPageNewReport')
    case 'settings':
      return t(language, 'shellPageSettings')
    case 'report-preview':
      return t(language, 'shellPageReportPreview')
    default:
      return 'FIELD-O'
  }
}

export function Topbar({ currentRoute, onQuickNewReport }: TopbarProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{t(language, 'shellFieldTool')}</p>
          <h2 className="text-lg font-semibold text-text-primary">{getTitle(currentRoute, language)}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-3 py-2 text-xs font-semibold tracking-wide ${
                language === 'es'
                  ? 'bg-bg/60 text-text-primary'
                  : 'text-text-secondary hover:bg-bg/40 hover:text-text-primary'
              }`}
              aria-label="Español (MX)"
              title="Español (MX)"
            >
              🇲🇽
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 text-xs font-semibold tracking-wide ${
                language === 'en'
                  ? 'bg-bg/60 text-text-primary'
                  : 'text-text-secondary hover:bg-bg/40 hover:text-text-primary'
              }`}
              aria-label="English"
              title="English"
            >
              🇺🇸
            </button>
          </div>

          <button
            className="rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 lg:hidden"
            onClick={onQuickNewReport}
          >
            {t(language, 'shellMobileQuickNew')}
          </button>
        </div>
      </div>
    </header>
  )
}

