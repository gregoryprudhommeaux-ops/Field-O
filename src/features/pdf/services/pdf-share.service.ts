import type { GeneratedPdfFile } from '../../../types/pdf.types'

export async function sharePdfFile(file: GeneratedPdfFile): Promise<'shared' | 'downloaded'> {
  const pdfFile = new File([file.blob], file.fileName, { type: 'application/pdf' })

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }

  if (nav.share && nav.canShare?.({ files: [pdfFile] })) {
    await nav.share({
      title: file.fileName,
      files: [pdfFile],
    })
    return 'shared'
  }

  const anchor = document.createElement('a')
  anchor.href = file.url
  anchor.download = file.fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  return 'downloaded'
}

