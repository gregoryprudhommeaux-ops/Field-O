
import { legacyTranslations } from './lib/i18n/translations';
import { legacyInitialChecklist } from './features/reports/constants/checklistTemplates';

export type Language = 'en' | 'es';
export type UnitSystem = 'metric' | 'imperial';

export interface ClientProfile {
  id: string;
  name: string;
  logoUrl?: string;
  contactEmail?: string;
  address?: string;
}

export interface EquipmentAsset {
  id: string;
  name: string; // e.g., iTB150-10 (A)
  sn: string;
  model: string;
  nominalVoltage: number; // For automated validation
  photo?: string; // Specific photo for this asset/table
  comment?: string; // Specific comment for this asset
}

export interface MeasurementRow {
  id: string;
  label: string; // e.g., "39% (25000 rpm)"
  current: string; // R/W/B
  power: number | null; // kW
  flow: number | null; // m3/min
  pressure: number | null; // kPa
  temp: number | null; // oC
}

export interface ReportTemplate {
  id: string;
  name: string;
  checklist: ChecklistItem[];
}

export interface Translations {
  welcome: string;
  newReport: string;
  projectInfo: string;
  projectName: string;
  date: string;
  operator: string;
  next: string;
  back: string;
  checklist: string;
  documentation: string;
  signature: string;
  review: string;
  generatePdf: string;
  pass: string;
  fail: string;
  na: string;
  commonDefects: string;
  comments: string;
  signatureRequired: string;
  reportGenerated: string;
  shareReport: string;
  technicalData: string;
  assets: string;
  unitSystem: string;
  client: string;
  newClient: string;
  categories: {
    electricity: string;
    security: string;
    hydraulics: string;
    mechanical: string;
  };
}

export const translations: Record<Language, Translations> = legacyTranslations as any;

export interface ChecklistItem {
  id: string;
  category: keyof Translations['categories'];
  label: Record<Language, string>;
  status: 'pass' | 'fail' | 'na' | null;
  comment?: string;
}

export interface Report {
  id: string;
  uid: string;
  projectName: string;
  operator: string;
  date: string;
  checklist: ChecklistItem[];
  signature: string | null;
  photos?: string[];
  comments: string;
  customFields?: Record<string, string>;
  status: 'draft' | 'synced';
  companyId: string;
  createdAt: string;
  // Advanced features
  unitSystem: UnitSystem;
  assets: EquipmentAsset[];
  measurementsByAsset: Record<string, MeasurementRow[]>; // Key is Asset ID
  templateId: string;
  clientId: string;
  commissioning?: {
    customerInformation?: {
      plantOwner?: string;
      plantName?: string;
      plantAddress?: string;
      primaryContactName?: string;
      primaryContactEmail?: string;
    };
    applicationProcessInfo?: {
      numberOfBlowers?: string;
      blowerModel?: string;
      blowerSNs?: string;
      aerationProcess?: string;
      waterDepth?: string;
      aerationDevice?: string;
    };
    photos?: {
      blowerHouse?: string[];
      headerPiping?: string[];
      aerationTanksValves?: string[];
    };
    inputVoltageRecordings?: {
      rEarth?: number | null;
      wEarth?: number | null;
      bEarth?: number | null;
      rW?: number | null;
      rB?: number | null;
      wB?: number | null;
    };
    inputPowerRecordings?: {
      rBVoltage?: number | null;
      rWVoltage?: number | null;
      bWVoltage?: number | null;
      rRmsCurrent?: number | null;
      wRmsCurrent?: number | null;
      bRmsCurrent?: number | null;
    };
    loadedOperation?: Array<{
      id: string;
      svPercent?: number | null;
      motorRpm?: number | null;
      currentRwb?: number | null;
      powerKw?: number | null;
      flowM3Min?: number | null;
      p2Kpa?: number | null;
      deltaPPa?: number | null;
      t1C?: number | null;
      t2C?: number | null;
    }>;
    scadaControlChecks?: Array<{
      id: string;
      label: string;
      value: 'yes' | 'no' | 'na';
      comment?: string;
    }>;
    results?: {
      minSv?: string;
      maxSv?: string;
      minOperatingPressure?: string;
      maxOperatingPressure?: string;
      airFlowRange?: string;
    };
    signatures?: {
      technicianName?: string;
      customerName?: string;
      technicianDate?: string;
      customerDate?: string;
      technicianSignatureDataUrl?: string;
      customerSignatureDataUrl?: string;
    };
  };
}

export interface CompanySettings {
  companyName: string;
  logoUrl?: string;
  defaultClientLogoUrl?: string;
  customFields?: string[];
  templates: ReportTemplate[];
  clients: ClientProfile[];
}

export const initialChecklist: ChecklistItem[] = legacyInitialChecklist as any;
