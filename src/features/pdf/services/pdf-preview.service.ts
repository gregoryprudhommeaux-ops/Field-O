import type { GeneratedPdfFile } from '../../../types/pdf.types'

let currentPreviewUrl: string | null = null

export function setPdfPreview(file: GeneratedPdfFile): string {
  clearPdfPreview()
  currentPreviewUrl = file.url
  return currentPreviewUrl
}

export function getPdfPreviewUrl(): string | null {
  return currentPreviewUrl
}

export function openPdfExternally(file: GeneratedPdfFile): void {
  window.open(file.url, '_blank', 'noopener,noreferrer')
}

export function downloadPdfFile(file: GeneratedPdfFile): void {
  const anchor = document.createElement('a')
  anchor.href = file.url
  anchor.download = file.fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function clearPdfPreview(): void {
  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl)
    currentPreviewUrl = null
  }
}

