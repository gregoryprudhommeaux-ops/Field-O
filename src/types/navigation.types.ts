import type { AppRoute } from '../lib/constants/routes'

export interface PreviewNavigationActions {
  onBackToForm: () => void
  onBackToHistory: () => void
  onBackToDashboard: () => void
  onDownload: () => void
  onShare: () => void
  onOpenExternal: () => void
}

export interface AppNavigationState {
  currentRoute: AppRoute
  previousRoute?: AppRoute
}

