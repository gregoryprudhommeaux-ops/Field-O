import React, { useEffect } from 'react'

import ReportsApp from '../ReportsApp'
import { useLanguage } from '../../../app/providers/LanguageProvider'

/**
 * Hosts the legacy MVP wizard inside the modular shell.
 * Report / PDF language is chosen on step "General information" (under Project name), not on a separate screen.
 */
export function NewReportScreen() {
  const { language: shellLanguage } = useLanguage()

  useEffect(() => {
    const reset = () => window.dispatchEvent(new CustomEvent('fieldo:reset-report-wizard'))
    window.addEventListener('fieldo:start-new-report', reset)
    reset()
    return () => window.removeEventListener('fieldo:start-new-report', reset)
  }, [])

  return <ReportsApp initialReportLanguage={shellLanguage} shellLanguage={shellLanguage} />
}
