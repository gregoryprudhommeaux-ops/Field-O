import type { Language } from '../../../types'

export function previewPdfToolbarLabels(lang: Language) {
  if (lang === 'es') {
    return {
      title: 'Vista previa del informe',
      subtitle: 'Revise antes de descargar o compartir',
      backToForm: 'Volver al formulario',
      history: 'Historial',
      dashboard: 'Panel',
      external: 'Externo',
      download: 'Descargar',
      share: 'Compartir informe',
    }
  }
  return {
    title: 'Report Preview',
    subtitle: 'Review before download or sharing',
    backToForm: 'Back to Form',
    history: 'History',
    dashboard: 'Dashboard',
    external: 'External',
    download: 'Download',
    share: 'Share Report',
  }
}

export function previewPanelLabels(lang: Language) {
  if (lang === 'es') {
    return {
      unavailable: 'Vista previa no disponible en este navegador o no se generó la URL.',
      blocked: 'Su navegador bloqueó la vista previa del PDF incrustado.',
      openFull: 'Abrir informe completo',
      downloadPdf: 'Descargar PDF',
      embedAria: 'Vista previa del PDF',
    }
  }
  return {
    unavailable: 'Preview unavailable in this browser or no preview URL was generated.',
    blocked: 'Your browser blocked the embedded PDF preview.',
    openFull: 'Open Full Report',
    downloadPdf: 'Download PDF',
    embedAria: 'PDF preview',
  }
}
