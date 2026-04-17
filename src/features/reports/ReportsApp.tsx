import React from 'react'

import LegacyApp from '../../App'
import type { Language } from '../../types'

interface ReportsAppProps {
  initialReportLanguage: Language
  shellLanguage: Language
}

export default function ReportsApp({ initialReportLanguage, shellLanguage }: ReportsAppProps) {
  return <LegacyApp embedded initialReportLanguage={initialReportLanguage} shellLanguage={shellLanguage} />
}
