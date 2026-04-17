import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { GeneratedPdfFile } from '../../../types/pdf.types'
import { translations as legacyTranslations } from '../../../types'
import type { ChecklistItem, CompanySettings, EquipmentAsset, Language, MeasurementRow, UnitSystem } from '../../../types'
import type { Report as ModularReport } from '../../../types/report.types'
import type { CompanySettings as ModularCompanySettings } from '../../../types/settings.types'
import type { ClientProfile as ModularClientProfile } from '../../../types/client.types'

export type LegacyPdfInput = {
  lang: Language
  t: {
    projectInfo: string
    projectName: string
    assets: string
    technicalData: string
    checklist: string
    signature: string
  }
  date: string
  operator: string
  projectName: string
  customFieldValues: Record<string, string>
  unitSystem: UnitSystem
  assets: EquipmentAsset[]
  measurementsByAsset: Record<string, MeasurementRow[]>
  checklist: ChecklistItem[]
  signature: string | null
  companySettings: CompanySettings
  clientId: string
  commissioning?: {
    customerInformation?: Record<string, string | undefined>
    applicationProcessInfo?: Record<string, string | undefined>
    photos?: {
      blowerHouse?: string[]
      headerPiping?: string[]
      aerationTanksValves?: string[]
    }
    inputVoltageRecordings?: {
      rEarth?: number | null
      wEarth?: number | null
      bEarth?: number | null
      rW?: number | null
      rB?: number | null
      wB?: number | null
    }
    inputPowerRecordings?: {
      rBVoltage?: number | null
      rWVoltage?: number | null
      bWVoltage?: number | null
      rRmsCurrent?: number | null
      wRmsCurrent?: number | null
      bRmsCurrent?: number | null
    }
    loadedOperation?: Array<{
      svPercent?: number | null
      motorRpm?: number | null
      currentRwb?: number | null
      powerKw?: number | null
      flowM3Min?: number | null
      p2Kpa?: number | null
      deltaPPa?: number | null
      t1C?: number | null
      t2C?: number | null
    }>
    scadaControlChecks?: Array<{ label: string; value: 'yes' | 'no' | 'na'; comment?: string }>
    results?: Record<string, string | undefined>
    notes?: Record<string, string | undefined>
    signatures?: {
      technicianName?: string
      customerName?: string
      technicianDate?: string
      customerDate?: string
      technicianSignatureDataUrl?: string
      customerSignatureDataUrl?: string
    }
  }
}

function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateLegacyReportPdfFile(input: LegacyPdfInput): GeneratedPdfFile {
  const doc = new jsPDF()
  const accentColor: [number, number, number] = [249, 115, 22]
  const grayColor: [number, number, number] = [100, 100, 100]
  const isImageDataUrl = (value: string) => /^data:image\/(png|jpeg|jpg);base64,/i.test(value)

  // Header Background
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(0, 0, 210, 45, 'F')

  // Logo if exists
  if (input.companySettings.logoUrl) {
    try {
      doc.addImage(input.companySettings.logoUrl, 'PNG', 160, 5, 35, 35)
    } catch (e) {
      console.warn('Failed to add company logo', e)
    }
  }

  // Client Logo
  const currentClient = input.companySettings.clients?.find((c) => c.id === input.clientId)
  const clientLogo = currentClient?.logoUrl || input.companySettings.defaultClientLogoUrl

  if (clientLogo) {
    try {
      doc.addImage(clientLogo, 'PNG', 165, 35, 25, 10)
    } catch (e) {
      console.warn('Failed to add client logo', e)
    }
  }

  doc.setFontSize(26)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(input.companySettings.companyName.toUpperCase(), 20, 22)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`REPORT ID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 20, 30)
  doc.text(`DATE: ${input.date} | OPERATOR: ${input.operator.toUpperCase()}`, 20, 36)

  // Section 1: Project Details
  let nextY = 60
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(input.t.projectInfo.toUpperCase(), 20, nextY)

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setLineWidth(0.5)
  doc.line(20, nextY + 2, 60, nextY + 2)

  nextY += 12
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`${input.t.projectName.toUpperCase()}:`, 20, nextY)
  doc.setFont('helvetica', 'normal')
  doc.text(input.projectName, 65, nextY)

  // Custom Fields
  nextY += 8
  if (Object.keys(input.customFieldValues).length > 0) {
    Object.entries(input.customFieldValues).forEach(([key, val]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${key.toUpperCase()}:`, 20, nextY)
      doc.setFont('helvetica', 'normal')
      doc.text(String(val), 65, nextY)
      nextY += 7
    })
  }

  // Asset List
  nextY += 10
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(input.t.assets.toUpperCase(), 20, nextY)
  nextY += 8

  input.assets.forEach((asset, idx) => {
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text(`${idx + 1}. ${asset.name}`, 20, nextY)
    doc.setFont('helvetica', 'normal')
    doc.text(`Model: ${asset.model} | S/N: ${asset.sn} | Nom. Voltage: ${asset.nominalVoltage}V`, 65, nextY)
    nextY += 6

    if (asset.comment) {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'italic')
      const splitComment = doc.splitTextToSize(`Note: ${asset.comment}`, 120)
      doc.text(splitComment, 65, nextY)
      nextY += splitComment.length * 4
    }

    if (asset.photo) {
      try {
        doc.addImage(asset.photo, 'JPEG', 65, nextY, 40, 25)
        nextY += 28
      } catch (e) {
        console.warn('Failed to add asset photo', e)
      }
    }

    nextY += 2
  })

  // Technical Data Tables (per asset)
  nextY += 10
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(input.t.technicalData.toUpperCase(), 20, nextY)
  nextY += 5

  input.assets.forEach((asset) => {
    const assetMeasurements = input.measurementsByAsset[asset.id] ?? []

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const unitTitle = [asset.name?.trim(), asset.sn?.trim()].filter(Boolean).join(' · ') || 'Unit'
    doc.text(`> Readings for ${unitTitle}`, 20, nextY + 5)

    autoTable(doc, {
      startY: nextY + 8,
      head: [['LOAD POINT', 'VOLTAGE (V)', 'POWER (kW)', `FLOW (${input.unitSystem === 'metric' ? 'm3/m' : 'SCFM'})`]],
      body: assetMeasurements.map((m) => [m.label || '', m.current || '', m.power ?? '', m.flow ?? '']),
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60], fontSize: 8 },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
    })

    nextY = (doc as any).lastAutoTable.finalY + 10
    if (nextY > 260) {
      doc.addPage()
      nextY = 20
    }
  })

  // Checklist Table
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(input.t.checklist.toUpperCase(), 20, nextY)

  const tableData = input.checklist.map((item) => [
    String(item.category).toUpperCase(),
    item.label[input.lang],
    item.status?.toUpperCase() || 'PENDING',
    item.comment || '',
  ])

  autoTable(doc, {
    startY: nextY + 5,
    head: [[input.t.checklist.toUpperCase(), 'ITEM', 'STATUS', 'COMMENTS']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: accentColor, fontSize: 9 },
    columnStyles: { 0: { cellWidth: 30 }, 2: { halign: 'center' } },
    styles: { fontSize: 8 },
    margin: { left: 20, right: 20 },
  })

  // Signature Area
  if (input.signature) {
    const finalY = (doc as any).lastAutoTable.finalY + 20
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(input.t.signature.toUpperCase(), 20, finalY)

    if (isImageDataUrl(input.signature)) {
      try {
        const fmt: 'PNG' | 'JPEG' = input.signature.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG'
        doc.addImage(input.signature, fmt, 20, finalY + 8, 60, 30)
      } catch (e) {
        console.warn('Failed to add signature image', e)
      }
    }

    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.setFontSize(9)
    doc.text(`Electronically signed by ${input.operator} on ${input.date}`, 20, finalY + 45)
  }

  // Commissioning Addendum (tables aligned with the historical Word reports)
  if (input.commissioning) {
    const ensureSpace = (needed: number) => {
      if (nextY + needed > 270) {
        doc.addPage()
        nextY = 20
      }
    }

    const sectionTitle = (label: string) => {
      ensureSpace(20)
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(label.toUpperCase(), 20, nextY)
      nextY += 6
    }

    const fmt = (v: any) => (v === null || v === undefined || v === '' ? '' : String(v))

    if (input.commissioning.customerInformation) {
      sectionTitle('Customer Information')
      const c = input.commissioning.customerInformation
      autoTable(doc, {
        startY: nextY,
        head: [['Field', 'Value']],
        body: Object.entries(c).map(([k, v]) => [k, fmt(v)]),
        theme: 'striped',
        headStyles: { fillColor: accentColor, fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    if (input.commissioning.applicationProcessInfo) {
      sectionTitle('Application & Process Information')
      const a = input.commissioning.applicationProcessInfo
      autoTable(doc, {
        startY: nextY,
        head: [['Field', 'Value']],
        body: Object.entries(a).map(([k, v]) => [k, fmt(v)]),
        theme: 'striped',
        headStyles: { fillColor: accentColor, fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    if (input.commissioning.photos) {
      sectionTitle('Photos')

      const categories: Array<[string, string[]]> = [
        ['Blower house', input.commissioning.photos.blowerHouse || []],
        ['Header piping', input.commissioning.photos.headerPiping || []],
        ['Aeration tanks / control valves', input.commissioning.photos.aerationTanksValves || []],
      ]

      const inferFormat = (dataUrl: string): 'PNG' | 'JPEG' => (dataUrl.includes('image/png') ? 'PNG' : 'JPEG')

      for (const [label, images] of categories) {
        if (!images.length) continue

        ensureSpace(18)
        doc.setTextColor(60, 60, 60)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(label, 20, nextY)
        nextY += 6

        const imgW = 82
        const imgH = 55
        const gap = 6
        const leftX = 20
        const rightX = leftX + imgW + gap

        let col = 0
        for (const src of images) {
          ensureSpace(imgH + 8)
          const x = col === 0 ? leftX : rightX
          try {
            doc.addImage(src, inferFormat(src), x, nextY, imgW, imgH)
          } catch (e) {
            console.warn('Failed to add commissioning photo', e)
            // Fallback: render a visible placeholder so missing images are obvious in preview.
            doc.setDrawColor(180, 180, 180)
            doc.setFillColor(245, 245, 245)
            doc.rect(x, nextY, imgW, imgH, 'FD')
            doc.setTextColor(120, 120, 120)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.text('Photo unavailable', x + imgW / 2, nextY + imgH / 2, { align: 'center' })
          }
          col = (col + 1) % 2
          if (col === 0) nextY += imgH + gap
        }

        if (col !== 0) nextY += imgH + gap
        nextY += 4
      }
    }

    // Input Voltage Recordings
    if (input.commissioning.inputVoltageRecordings) {
      sectionTitle('Input Voltage Recordings')

      const v = input.commissioning.inputVoltageRecordings
      autoTable(doc, {
        startY: nextY,
        head: [['Point', 'VAC']],
        body: [
          ['R - Earth', fmt(v.rEarth)],
          ['W - Earth', fmt(v.wEarth)],
          ['B - Earth', fmt(v.bEarth)],
          ['R-W', fmt(v.rW)],
          ['R-B', fmt(v.rB)],
          ['W-B', fmt(v.wB)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], fontSize: 9 },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    // Input Power Recordings
    if (input.commissioning.inputPowerRecordings) {
      sectionTitle('Input Power Recordings')
      const p = input.commissioning.inputPowerRecordings
      autoTable(doc, {
        startY: nextY,
        head: [['Point', 'Value']],
        body: [
          ['R-B Voltage', fmt(p.rBVoltage)],
          ['R-W Voltage', fmt(p.rWVoltage)],
          ['B-W Voltage', fmt(p.bWVoltage)],
          ['R (RMS Current)', fmt(p.rRmsCurrent)],
          ['W RMS Current', fmt(p.wRmsCurrent)],
          ['B RMS Current', fmt(p.bRmsCurrent)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], fontSize: 9 },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    // Loaded Operation table
    if (input.commissioning.loadedOperation?.length) {
      sectionTitle('Loaded Operation')
      autoTable(doc, {
        startY: nextY,
        head: [
          [
            'SV (%)',
            'Motor (rpm)',
            'Current (RWB)',
            'Power (kW)',
            'Flow (m3/min)',
            'P2 (kPa)',
            '∆P (Pa)',
            'T1 (°C)',
            'T2 (°C)',
          ],
        ],
        body: input.commissioning.loadedOperation.map((r) => [
          fmt(r.svPercent),
          fmt(r.motorRpm),
          fmt(r.currentRwb),
          fmt(r.powerKw),
          fmt(r.flowM3Min),
          fmt(r.p2Kpa),
          fmt(r.deltaPPa),
          fmt(r.t1C),
          fmt(r.t2C),
        ]),
        theme: 'grid',
        headStyles: { fillColor: accentColor, fontSize: 8 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    // SCADA / Control checks
    if (input.commissioning.scadaControlChecks?.length) {
      sectionTitle('Customer Communication and Control')
      autoTable(doc, {
        startY: nextY,
        head: [['Check Point', 'YES/NO', 'Comment']],
        body: input.commissioning.scadaControlChecks.map((c) => [
          c.label,
          c.value.toUpperCase(),
          c.comment || '',
        ]),
        theme: 'striped',
        headStyles: { fillColor: accentColor, fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 10
    }

    if (input.commissioning.signatures) {
      sectionTitle('Signatures')
      const s = input.commissioning.signatures
      autoTable(doc, {
        startY: nextY,
        head: [['Role', 'Name', 'Date']],
        body: [
          ['Technician', fmt(s.technicianName), fmt(s.technicianDate)],
          ['Customer', fmt(s.customerName), fmt(s.customerDate)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60], fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
      })
      nextY = (doc as any).lastAutoTable.finalY + 8

      ensureSpace(50)
      try {
        if (s.technicianSignatureDataUrl) doc.addImage(s.technicianSignatureDataUrl, 'PNG', 20, nextY, 60, 25)
      } catch (e) {
        console.warn('Failed to add technician signature', e)
      }
      try {
        if (s.customerSignatureDataUrl) doc.addImage(s.customerSignatureDataUrl, 'PNG', 120, nextY, 60, 25)
      } catch (e) {
        console.warn('Failed to add customer signature', e)
      }
      nextY += 32
    }
  }

  // Footer with Page Number
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount} | Field-O Professional Systems`, 105, 285, { align: 'center' })
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const fileName = `report-${safeFileName(input.projectName || 'report')}.pdf`

  return {
    blob,
    fileName,
    url,
  }
}

function toLegacyCategory(value: string | undefined): ChecklistItem['category'] {
  const v = String(value || '').toLowerCase()
  if (v.includes('elect')) return 'electricity'
  if (v.includes('secur')) return 'security'
  if (v.includes('hydra')) return 'hydraulics'
  if (v.includes('mech')) return 'mechanical'
  return 'electricity'
}

/**
 * Pack 9: Use the legacy branded PDF layout (orange header + logos)
 * for modular `Report` previews until the modular generator reaches parity.
 */
export async function generateBrandedReportPdf(
  report: ModularReport,
  options?: {
    companySettings?: ModularCompanySettings | null
    clientProfile?: ModularClientProfile | null
  }
): Promise<GeneratedPdfFile> {
  const lang: Language = report.language === 'es' ? 'es' : 'en'
  const t = legacyTranslations[lang]

  const legacyCompanySettings: CompanySettings = {
    companyName: options?.companySettings?.companyName || 'FIELD-O',
    logoUrl: options?.companySettings?.companyLogoUrl || '',
    defaultClientLogoUrl: options?.companySettings?.defaultClientLogoUrl || '',
    customFields: options?.companySettings?.customReportFields || [],
    templates: [],
    clients: options?.clientProfile
      ? [
          {
            id: options.clientProfile.id,
            name: options.clientProfile.name,
            logoUrl: options.clientProfile.logoUrl,
            contactEmail: options.clientProfile.defaultContactEmail,
            address: options.clientProfile.location,
          },
        ]
      : [],
  }

  const assets: EquipmentAsset[] = report.equipmentUnits.map((unit) => ({
    id: unit.id,
    name: unit.name,
    sn: unit.serialNumber || '',
    model: unit.model || '',
    nominalVoltage: Number(unit.nominalVoltage || 0),
    comment: unit.notes,
    photo: unit.photoUrls?.[0],
  }))

  const measurementsByAsset: Record<string, MeasurementRow[]> = {}
  for (const unit of report.equipmentUnits) {
    measurementsByAsset[unit.id] = unit.technicalReadings.map((r) => ({
      id: r.id,
      label: r.pointLabel || '',
      current: String(r.voltageMeasured ?? ''),
      power: Number(r.power ?? 0),
      flow: Number(r.flow ?? 0),
      pressure: Number(r.pressure ?? 0),
      temp: 0,
    }))
  }

  const checklist: ChecklistItem[] = report.equipmentUnits.flatMap((unit) =>
    unit.checklistItems.map((item) => ({
      id: item.id,
      category: toLegacyCategory(item.category),
      label: {
        en: item.itemLabel,
        es: item.itemLabel,
      },
      status: item.status,
      comment: item.comment,
    }))
  )

  const customFieldValues: Record<string, string> = {}
  for (const cf of report.customFields || []) {
    if (cf.key) customFieldValues[cf.key] = cf.value || ''
  }

  return generateLegacyReportPdfFile({
    lang,
    t: {
      projectInfo: t.projectInfo,
      projectName: t.projectName,
      assets: t.assets,
      technicalData: t.technicalData,
      checklist: t.checklist,
      signature: t.signature,
    },
    date: report.reportDate,
    operator: report.operatorName,
    projectName: report.projectName,
    customFieldValues,
    unitSystem: report.unitSystem,
    assets,
    measurementsByAsset,
    checklist,
    signature: report.signatureDataUrl || null,
    companySettings: legacyCompanySettings,
    clientId: report.clientId || options?.clientProfile?.id || '',
    commissioning: report.commissioning
      ? {
          customerInformation: report.commissioning.customerInformation
            ? {
                PlantOwner: report.commissioning.customerInformation.plantOwner,
                PlantName: report.commissioning.customerInformation.plantName,
                PlantAddress: report.commissioning.customerInformation.plantAddress,
                PrimaryContact: report.commissioning.customerInformation.primaryContactName,
                ContactEmail: report.commissioning.customerInformation.primaryContactEmail,
              }
            : undefined,
          applicationProcessInfo: report.commissioning.applicationProcessInfo
            ? {
                NumberOfBlowers: report.commissioning.applicationProcessInfo.numberOfBlowers,
                BlowerModel: report.commissioning.applicationProcessInfo.blowerModel,
                BlowerSNs: report.commissioning.applicationProcessInfo.blowerSNs,
                AerationProcess: report.commissioning.applicationProcessInfo.aerationProcess,
                WaterDepth: report.commissioning.applicationProcessInfo.waterDepth,
                AerationDevice: report.commissioning.applicationProcessInfo.aerationDevice,
              }
            : undefined,
          photos: report.commissioning.photos
            ? {
                blowerHouse: report.commissioning.photos.blowerHouse || [],
                headerPiping: report.commissioning.photos.headerPiping || [],
                aerationTanksValves: report.commissioning.photos.aerationTanksValves || [],
              }
            : undefined,
          inputVoltageRecordings: report.commissioning.inputVoltageRecordings,
          inputPowerRecordings: report.commissioning.inputPowerRecordings,
          loadedOperation: report.commissioning.loadedOperation?.map((r) => ({
            svPercent: r.svPercent ?? null,
            motorRpm: r.motorRpm ?? null,
            currentRwb: r.currentRwb ?? null,
            powerKw: r.powerKw ?? null,
            flowM3Min: r.flowM3Min ?? null,
            p2Kpa: r.p2Kpa ?? null,
            deltaPPa: r.deltaPPa ?? null,
            t1C: r.t1C ?? null,
            t2C: r.t2C ?? null,
          })),
          scadaControlChecks: report.commissioning.scadaControlChecks?.map((c) => ({
            label: c.label,
            value: c.value,
            comment: c.comment,
          })),
          results: report.commissioning.results
            ? {
                MinSV: report.commissioning.results.minSv,
                MaxSV: report.commissioning.results.maxSv,
                MinOperatingPressure: report.commissioning.results.minOperatingPressure,
                MaxOperatingPressure: report.commissioning.results.maxOperatingPressure,
                AirFlowRange: report.commissioning.results.airFlowRange,
              }
            : undefined,
          signatures: report.commissioning.signatures
            ? {
                technicianName: report.commissioning.signatures.technicianName,
                customerName: report.commissioning.signatures.customerName,
                technicianDate: report.commissioning.signatures.technicianSignedAt,
                customerDate: report.commissioning.signatures.customerSignedAt,
                technicianSignatureDataUrl: report.signatureDataUrl || '',
              }
            : undefined,
        }
      : undefined,
  })
}

function safeFileNameModular(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildFileName(report: ModularReport): string {
  const base = report.projectName || report.clientName || 'field-o-report'
  return `${safeFileNameModular(base)}-${report.reportDate || 'report'}.pdf`
}

/**
 * Pack 7+ modular PDF generator.
 * Intentionally simple; does not replace the legacy branded PDF.
 */
export async function generateReportPdf(
  report: ModularReport,
  options?: {
    companySettings?: ModularCompanySettings | null
    clientProfile?: ModularClientProfile | null
  }
): Promise<GeneratedPdfFile> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const companyName = options?.companySettings?.companyName || 'FIELD-O'
  const clientName = options?.clientProfile?.name || report.clientName || 'Client'
  const fileName = buildFileName(report)

  doc.setFillColor(20, 20, 24)
  doc.rect(0, 0, 210, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(companyName, 14, 15)

  doc.setTextColor(33, 33, 33)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Commissioning Report', 14, 34)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Client: ${clientName}`, 14, 42)
  doc.text(`Project: ${report.projectName || '-'}`, 14, 48)
  doc.text(`Operator: ${report.operatorName || '-'}`, 14, 54)
  doc.text(`Date: ${report.reportDate || '-'}`, 14, 60)
  doc.text(`Language: ${report.language.toUpperCase()}`, 14, 66)

  let currentY = 78

  report.equipmentUnits.forEach((unit, unitIndex) => {
    if (currentY > 240) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`Unit ${unitIndex + 1}: ${unit.name || 'Unnamed Unit'}`, 14, currentY)

    currentY += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Model: ${unit.model || '-'}`, 14, currentY)
    currentY += 5
    doc.text(`Serial: ${unit.serialNumber || '-'}`, 14, currentY)
    currentY += 5
    doc.text(`Nominal Voltage: ${unit.nominalVoltage ?? '-'}`, 14, currentY)
    currentY += 7

    doc.setFont('helvetica', 'bold')
    doc.text('Checklist', 14, currentY)
    currentY += 5

    unit.checklistItems.forEach((item) => {
      if (currentY > 275) {
        doc.addPage()
        currentY = 20
      }

      doc.setFont('helvetica', 'normal')
      doc.text(`- ${item.itemLabel}: ${item.status.toUpperCase()}${item.comment ? ` | ${item.comment}` : ''}`, 16, currentY)
      currentY += 5
    })

    if (unit.technicalReadings.length) {
      currentY += 2
      doc.setFont('helvetica', 'bold')
      doc.text('Technical Readings', 14, currentY)
      currentY += 5

      unit.technicalReadings.forEach((reading) => {
        if (currentY > 275) {
          doc.addPage()
          currentY = 20
        }

        doc.setFont('helvetica', 'normal')
        doc.text(
          `- ${reading.pointLabel || 'Point'} | RPM: ${reading.rpm ?? '-'} | Current: ${reading.current ?? '-'} | Voltage: ${reading.voltageMeasured ?? '-'}`,
          16,
          currentY,
        )
        currentY += 5
      })
    }

    if (unit.notes) {
      currentY += 2
      doc.setFont('helvetica', 'bold')
      doc.text('Unit Notes', 14, currentY)
      currentY += 5
      doc.setFont('helvetica', 'normal')
      doc.text(unit.notes, 16, currentY, { maxWidth: 170 })
      currentY += 10
    }

    currentY += 6
  })

  if (report.generalComments) {
    if (currentY > 255) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text('General Comments', 14, currentY)
    currentY += 6
    doc.setFont('helvetica', 'normal')
    doc.text(report.generalComments, 14, currentY, { maxWidth: 180 })
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)

  return {
    blob,
    fileName,
    url,
  }
}

