export const ROUTES = {
  dashboard: 'dashboard',
  newReport: 'new-report',
  history: 'history',
  settings: 'settings',
  reportPreview: 'report-preview',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

