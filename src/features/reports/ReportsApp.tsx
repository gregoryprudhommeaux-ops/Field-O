import React from 'react'

import LegacyApp from '../../App'
import type { Language } from '../../types'

interface ReportsAppProps {
  initialReportLanguage: Language
  shellLanguage: Language
}

export default function ReportsApp({ initialReportLanguage, shellLanguage }: ReportsAppProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <LegacyApp embedded initialReportLanguage={initialReportLanguage} shellLanguage={shellLanguage} />
    </div>
  )
}
