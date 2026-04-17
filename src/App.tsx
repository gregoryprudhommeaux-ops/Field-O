import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Camera, 
  PenTool, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Plus,
  Share2,
  Globe,
  Settings,
  Calendar,
  User,
  HardHat,
  LogOut,
  LogIn,
  History,
  ShieldCheck,
  Cloud,
  CloudOff,
  PlusCircle,
  Trash2,
  RefreshCw,
  Cpu,
  Database,
  Briefcase,
  Layout,
  Eye,
  Download
} from 'lucide-react';
// PDF generation extracted to `features/pdf/services/*`
import { useLiveQuery } from 'dexie-react-hooks';
import { localDb } from './lib/db';
import { COMMON_DEFECTS } from './constants';
import { validateVoltageTolerance } from './lib/utils/voltage';
import { validateReportBeforePreview } from './features/reports/services/report-validation.service';
import { saveDraftOffline, syncOfflineDrafts } from './features/offline/offline.service';
import { generateLegacyReportPdfFile } from './features/pdf/services/pdf-generator.service';
import { clearPdfPreview, downloadPdfFile, openPdfExternally, setPdfPreview } from './features/pdf/services/pdf-preview.service';
import { sharePdfFile } from './features/pdf/services/pdf-share.service';
import { ProjectInfoStep } from './features/reports/steps/ProjectInfoStep';
import { EquipmentUnitsStep } from './features/reports/steps/EquipmentUnitsStep';
import { TechnicalReadingsStep } from './features/reports/steps/TechnicalReadingsStep';
import { ReportWizardNavButtons } from './features/reports/components/ReportWizardNavButtons';
import { ReportPreviewScreen } from './features/reports/screens/ReportPreviewScreen';
import { ROUTES, type AppRoute } from './lib/constants/routes';
import { 
  Language, 
  translations, 
  ChecklistItem, 
  initialChecklist, 
  Translations, 
  Report, 
  CompanySettings,
  EquipmentAsset,
  MeasurementRow,
  UnitSystem,
  ReportTemplate,
  ClientProfile
} from './types.ts';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './firebase.ts';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App({
  embedded = false,
  initialReportLanguage,
  shellLanguage,
}: {
  embedded?: boolean
  initialReportLanguage?: Language
  shellLanguage?: Language
}) {
  // Report + PDF language (EN/ES). When embedded in the shell, this is chosen on "New Report" and is independent of the global UI language.
  const [lang, setLang] = useState<Language>(() => initialReportLanguage ?? 'es');
  const [step, setStep] = useState(0);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(ROUTES.dashboard);
  const t = translations[lang];

  useEffect(() => {
    if (embedded) return
    function onLang(e: Event) {
      const next = (e as CustomEvent).detail?.language;
      if (next === 'en' || next === 'es') setLang(next);
    }

    window.addEventListener('fieldo:language', onLang as any);
    return () => window.removeEventListener('fieldo:language', onLang as any);
  }, [embedded]);

  useEffect(() => {
    if (initialReportLanguage) setLang(initialReportLanguage)
  }, [initialReportLanguage])

  // Auth State
  const [user, setUser] = useState<any>({
    uid: 'mvp-guest-user',
    displayName: 'MVP Technician',
    email: 'guest@field-o.com',
    photoURL: 'https://picsum.photos/seed/guest/100/100'
  });
  const [authReady, setAuthReady] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  // App Data
  const [reports, setReports] = useState<Report[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Field-O Global',
    customFields: [],
    templates: [
      { id: 'turbo', name: 'iTurbo Blower Service', checklist: initialChecklist },
      { id: 'std', name: 'Standard Compressor', checklist: initialChecklist.slice(0, 4) }
    ],
    clients: [
      { 
        id: 'invent', 
        name: 'INVENT PACIFIC', 
        logoUrl: 'https://images.squarespace-cdn.com/content/v1/5e8df3c9a00827284b3d88b4/1586522543596-H8K3KWZXYO3Z8R9X3P3M/INVENT_Logo_RGB.png', // Typical high-quality logo for Invent
        address: 'Meadville, PA, USA',
        contactEmail: 'technical@invent-pacific.com'
      }
    ]
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const drafts = useLiveQuery(() => localDb.drafts.toArray()) || [];
  const [projectName, setProjectName] = useState('');
  const [operator, setOperator] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [signature, setSignature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Advanced Industrial States
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const initialAssetIdRef = useRef(`a${Date.now()}`);
  const [assets, setAssets] = useState<EquipmentAsset[]>([
    { id: initialAssetIdRef.current, name: '', sn: '', model: '', nominalVoltage: 460 },
  ]);
  const [measurementsByAsset, setMeasurementsByAsset] = useState<Record<string, MeasurementRow[]>>(() => ({
    [initialAssetIdRef.current]: [
      {
        id: `${initialAssetIdRef.current}-r0`,
        label: '',
        current: '',
        power: null,
        flow: null,
        pressure: null,
        temp: null,
      },
    ],
  }));

  useEffect(() => {
    setMeasurementsByAsset((prev) => {
      const next: Record<string, MeasurementRow[]> = {};
      for (const id of assets.map((a) => a.id)) {
        next[id] = prev[id] ? [...prev[id]] : [];
      }
      return next;
    });
  }, [assets]);
  const [templateId, setTemplateId] = useState<string>('turbo');
  const [clientId, setClientId] = useState<string>('invent');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signingRole, setSigningRole] = useState<'technician' | 'customer'>('technician');
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);

  // Commissioning tables (Word parity)
  const [inputVoltageRecordings, setInputVoltageRecordings] = useState<{
    rEarth: string;
    wEarth: string;
    bEarth: string;
    rW: string;
    rB: string;
    wB: string;
  }>({ rEarth: '', wEarth: '', bEarth: '', rW: '', rB: '', wB: '' });

  const [inputPowerRecordings, setInputPowerRecordings] = useState<{
    rBVoltage: string;
    rWVoltage: string;
    bWVoltage: string;
    rRmsCurrent: string;
    wRmsCurrent: string;
    bRmsCurrent: string;
  }>({ rBVoltage: '', rWVoltage: '', bWVoltage: '', rRmsCurrent: '', wRmsCurrent: '', bRmsCurrent: '' });

  const [loadedOperationRows, setLoadedOperationRows] = useState<
    Array<{
      id: string;
      svPercent: number;
      motorRpm: string;
      currentRwb: string;
      powerKw: string;
      flowM3Min: string;
      p2Kpa: string;
      deltaPPa: string;
      t1C: string;
      t2C: string;
    }>
  >([
    35, 40, 50, 60, 70, 80, 90
  ].map((sv) => ({
    id: `loaded_${sv}`,
    svPercent: sv,
    motorRpm: '',
    currentRwb: '',
    powerKw: '',
    flowM3Min: '',
    p2Kpa: '',
    deltaPPa: '',
    t1C: '',
    t2C: '',
  })));

  const [scadaChecks, setScadaChecks] = useState<
    Array<{ id: string; label: string; value: 'yes' | 'no' | 'na'; comment: string }>
  >([
    { id: 'scada_1', label: 'SV Signal to Blower (check with change)', value: 'na', comment: '' },
    { id: 'scada_2', label: 'Error Codes to Customer SCADA', value: 'na', comment: '' },
    { id: 'scada_3', label: 'Monitoring Data to Customer SCADA', value: 'na', comment: '' },
    { id: 'scada_4', label: 'Monitoring Data with correct scaling', value: 'na', comment: '' },
  ]);

  const [commissioningResults, setCommissioningResults] = useState<{
    minSv: string;
    maxSv: string;
    minOperatingPressure: string;
    maxOperatingPressure: string;
    airFlowRange: string;
  }>({ minSv: '', maxSv: '', minOperatingPressure: '', maxOperatingPressure: '', airFlowRange: '' });

  const [customerInfo, setCustomerInfo] = useState<{
    plantOwner: string;
    plantName: string;
    plantAddress: string;
    primaryContactName: string;
    primaryContactEmail: string;
  }>({ plantOwner: '', plantName: '', plantAddress: '', primaryContactName: '', primaryContactEmail: '' });

  const [processInfo, setProcessInfo] = useState<{
    numberOfBlowers: string;
    blowerModel: string;
    blowerSNs: string;
    aerationProcess: string;
    waterDepth: string;
    aerationDevice: string;
  }>({ numberOfBlowers: '', blowerModel: '', blowerSNs: '', aerationProcess: '', waterDepth: '', aerationDevice: '' });

  const [commissioningPhotos, setCommissioningPhotos] = useState<{
    blowerHouse: string[];
    headerPiping: string[];
    aerationTanksValves: string[];
  }>({ blowerHouse: [], headerPiping: [], aerationTanksValves: [] });

  // Ensure PDF preview URLs are always revoked when leaving preview/unmounting.
  useEffect(() => {
    if (currentRoute !== ROUTES.reportPreview && pdfBlobUrl) {
      clearPdfPreview();
      setPdfBlobUrl(null);
    }
  }, [currentRoute, pdfBlobUrl]);

  useEffect(() => {
    return () => {
      clearPdfPreview();
    };
  }, []);

  // Auth & Connection Listeners
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Check Admin
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            setIsAdmin(true);
          } else if (u.email === 'Gregory.Prudhommeaux@gmail.com') {
            setIsAdmin(true);
            await setDoc(doc(db, 'users', u.uid), {
              uid: u.uid,
              email: u.email,
              role: 'admin',
              companyId: 'default'
            });
          }
        } catch (e) {
          console.error("Admin check failed", e);
        }
      } else {
        setUser({
          uid: 'mvp-guest-user',
          displayName: 'MVP Technician',
          email: 'guest@field-o.com',
          photoURL: 'https://picsum.photos/seed/guest/100/100'
        });
        setIsAdmin(true);
      }
      setAuthReady(true);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubAuth();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Settings & Reports
  useEffect(() => {
    // In MVP Guest mode, we always use the guest UID if not logged in
    const targetUid = user?.uid || 'mvp-guest-user';

    const q = query(
      collection(db, 'reports'), 
      where('uid', '==', targetUid),
      orderBy('createdAt', 'desc')
    );

    const unsubReports = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reports'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'default'), (snapshot) => {
      if (snapshot.exists()) {
        setCompanySettings(snapshot.data() as CompanySettings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/default'));

    return () => {
      unsubReports();
      unsubSettings();
    };
  }, [user]);

  const login = () => signInWithPopup(auth, googleProvider).then(res => setUser(res.user));
  const logout = () => {
    signOut(auth);
    setUser({
      uid: 'mvp-guest-user',
      displayName: 'MVP Technician',
      email: 'guest@field-o.com',
      photoURL: 'https://picsum.photos/seed/guest/100/100'
    });
  };

  const startNewReport = () => {
    const newAssetId = 'a' + Date.now();
    setProjectName('');
    setOperator(user?.displayName || '');
    setChecklist(initialChecklist.map(i => ({ ...i, status: null })));
    setSignature(null);
    setCustomerSignature(null);
    setSigningRole('technician');
    setPhotos([]);
    setCustomFieldValues({});
    setAssets([{ id: newAssetId, name: '', sn: '', model: '', nominalVoltage: 460 }]);
    setMeasurementsByAsset({
      [newAssetId]: [
        {
          id: `${newAssetId}-r0`,
          label: '',
          current: '',
          power: null,
          flow: null,
          pressure: null,
          temp: null,
        },
      ],
    });
    setUnitSystem('metric');
    setTemplateId('turbo');
    setClientId(companySettings.clients?.[0]?.id || '');
    setCustomerInfo({ plantOwner: '', plantName: '', plantAddress: '', primaryContactName: '', primaryContactEmail: '' });
    setProcessInfo({
      numberOfBlowers: '',
      blowerModel: '',
      blowerSNs: '',
      aerationProcess: '',
      waterDepth: '',
      aerationDevice: '',
    });
    setCommissioningPhotos({ blowerHouse: [], headerPiping: [], aerationTanksValves: [] });
    setInputVoltageRecordings({ rEarth: '', wEarth: '', bEarth: '', rW: '', rB: '', wB: '' });
    setInputPowerRecordings({
      rBVoltage: '',
      rWVoltage: '',
      bWVoltage: '',
      rRmsCurrent: '',
      wRmsCurrent: '',
      bRmsCurrent: '',
    });
    setLoadedOperationRows([35, 40, 50, 60, 70, 80, 90].map((sv) => ({
      id: `loaded_${sv}`,
      svPercent: sv,
      motorRpm: '',
      currentRwb: '',
      powerKw: '',
      flowM3Min: '',
      p2Kpa: '',
      deltaPPa: '',
      t1C: '',
      t2C: '',
    })));
    setScadaChecks([
      { id: 'scada_1', label: 'SV Signal to Blower (check with change)', value: 'na', comment: '' },
      { id: 'scada_2', label: 'Error Codes to Customer SCADA', value: 'na', comment: '' },
      { id: 'scada_3', label: 'Monitoring Data to Customer SCADA', value: 'na', comment: '' },
      { id: 'scada_4', label: 'Monitoring Data with correct scaling', value: 'na', comment: '' },
    ]);
    setCommissioningResults({ minSv: '', maxSv: '', minOperatingPressure: '', maxOperatingPressure: '', airFlowRange: '' });
    setActiveReportId(null);
    setStep(0);
    setCurrentRoute(ROUTES.newReport);
  };

  const startNewReportRef = useRef(startNewReport);
  startNewReportRef.current = startNewReport;

  useEffect(() => {
    const handler = () => {
      startNewReportRef.current();
    };
    window.addEventListener('fieldo:reset-report-wizard', handler);
    return () => window.removeEventListener('fieldo:reset-report-wizard', handler);
  }, []);

  const seedSampleReport = async () => {
    const sampleId = `sample-${Date.now()}`;
    const sample: Report = {
      id: sampleId,
      uid: user.uid,
      projectName: 'PROJECT MEADVILLE 1 (Commissioning)',
      operator: 'Invent Pacific (Technical Team)',
      date: '2023-12-15',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      status: 'draft',
      comments: 'Full commissioning completed for Meadville 1 plant. 5 blowers inspected.',
      customFields: {
        'Blower Model': 'iTB150-10 (High Efficiency)',
        'Input Voltage': '460V / 60Hz',
        'Aeration Process': 'SBR AND DIGESTER',
        'Package SN': '15023005'
      },
      checklist: [
        { id: 'm1', category: 'mechanical', label: { en: 'Motor Level and Secure (<1mm/m)', es: 'Motor Nivelado y Seguro' }, status: 'pass', comment: 'Level checked with precision tool' },
        { id: 'm2', category: 'mechanical', label: { en: 'Motor rotation by hand', es: 'Rotación motor manual' }, status: 'pass', comment: 'Impeller rotates freely' },
        { id: 'm3', category: 'mechanical', label: { en: 'Space Between Scroll and Cone', es: 'Espacio entre Scroll y Cono' }, status: 'pass', comment: 'Gap measured at 7.5mm' },
        { id: 'e1', category: 'electricity', label: { en: 'Input Voltage Recordings', es: 'Voltaje de entrada' }, status: 'pass', comment: 'Measured: R-W: 475V, R-B: 476.5V, W-B: 478.9V' },
        { id: 's1', category: 'security', label: { en: 'Emergency stop functional', es: 'Parada de emergencia funcional' }, status: 'pass' },
        { id: 'h1', category: 'hydraulics', label: { en: 'BOV and Motor cooling lines', es: 'Líneas BOV y enfriamiento' }, status: 'pass', comment: 'All lines secured and tested for leaks' }
      ],
      signature: 'https://picsum.photos/seed/sig/200/100', // Placeholder
      photos: [
        'https://picsum.photos/seed/blower1/800/600',
        'https://picsum.photos/seed/piping/800/600',
        'https://picsum.photos/seed/tanks/800/600'
      ],
      unitSystem: 'metric',
      assets: [
        { id: 'a1', name: 'Blower Unit A', sn: 'SN150-101', model: 'iTB150-10', nominalVoltage: 460, photo: 'https://picsum.photos/seed/asset1/400/300', comment: 'Motor bearings vibration levels nominal' },
        { id: 'a2', name: 'Blower Unit B', sn: 'SN150-102', model: 'iTB150-10', nominalVoltage: 460, photo: 'https://picsum.photos/seed/asset2/400/300', comment: 'Expansion joint alignment verified' }
      ],
      measurementsByAsset: {
        'a1': [
          { id: 'm1', label: '39% LOAD', current: '475', power: 38.7, flow: 36.9, pressure: 56, temp: 23 },
          { id: 'm2', label: '83% LOAD', current: '478', power: 103.8, flow: 83.1, pressure: 58, temp: 24 }
        ],
        'a2': [
          { id: 'm3', label: '39% LOAD', current: '468', power: 37.2, flow: 35.1, pressure: 54, temp: 22 }
        ]
      },
      templateId: 'turbo',
      clientId: 'invent'
    };

    await localDb.drafts.put(sample as Report);
    alert('Professional Sample "Meadville 1" loaded into history!');
  };

  const saveReport = async (status: 'draft' | 'synced') => {
    const targetUid = user?.uid || 'mvp-guest-user';
    const reportId = activeReportId || Math.random().toString(36).substring(7);
    const reportData: Report = {
      id: reportId,
      uid: targetUid,
      projectName,
      operator,
      date,
      checklist,
      signature,
      photos,
      comments: '',
      customFields: customFieldValues,
      status: isOnline ? 'synced' : 'draft',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      unitSystem,
      assets,
      measurementsByAsset,
      templateId,
      clientId,
      commissioning: {
        customerInformation: { ...customerInfo },
        applicationProcessInfo: { ...processInfo },
        photos: {
          blowerHouse: [...commissioningPhotos.blowerHouse],
          headerPiping: [...commissioningPhotos.headerPiping],
          aerationTanksValves: [...commissioningPhotos.aerationTanksValves],
        },
        inputVoltageRecordings: {
          rEarth: inputVoltageRecordings.rEarth ? Number(inputVoltageRecordings.rEarth) : null,
          wEarth: inputVoltageRecordings.wEarth ? Number(inputVoltageRecordings.wEarth) : null,
          bEarth: inputVoltageRecordings.bEarth ? Number(inputVoltageRecordings.bEarth) : null,
          rW: inputVoltageRecordings.rW ? Number(inputVoltageRecordings.rW) : null,
          rB: inputVoltageRecordings.rB ? Number(inputVoltageRecordings.rB) : null,
          wB: inputVoltageRecordings.wB ? Number(inputVoltageRecordings.wB) : null,
        },
        inputPowerRecordings: {
          rBVoltage: inputPowerRecordings.rBVoltage ? Number(inputPowerRecordings.rBVoltage) : null,
          rWVoltage: inputPowerRecordings.rWVoltage ? Number(inputPowerRecordings.rWVoltage) : null,
          bWVoltage: inputPowerRecordings.bWVoltage ? Number(inputPowerRecordings.bWVoltage) : null,
          rRmsCurrent: inputPowerRecordings.rRmsCurrent ? Number(inputPowerRecordings.rRmsCurrent) : null,
          wRmsCurrent: inputPowerRecordings.wRmsCurrent ? Number(inputPowerRecordings.wRmsCurrent) : null,
          bRmsCurrent: inputPowerRecordings.bRmsCurrent ? Number(inputPowerRecordings.bRmsCurrent) : null,
        },
        loadedOperation: loadedOperationRows.map((r) => ({
          id: r.id,
          svPercent: r.svPercent,
          motorRpm: r.motorRpm ? Number(r.motorRpm) : null,
          currentRwb: r.currentRwb ? Number(r.currentRwb) : null,
          powerKw: r.powerKw ? Number(r.powerKw) : null,
          flowM3Min: r.flowM3Min ? Number(r.flowM3Min) : null,
          p2Kpa: r.p2Kpa ? Number(r.p2Kpa) : null,
          deltaPPa: r.deltaPPa ? Number(r.deltaPPa) : null,
          t1C: r.t1C ? Number(r.t1C) : null,
          t2C: r.t2C ? Number(r.t2C) : null,
        })),
        scadaControlChecks: scadaChecks.map((c) => ({ ...c })),
        results: { ...commissioningResults },
        signatures: {
          technicianName: operator || user?.displayName || '',
          customerName: '',
          technicianDate: date,
          customerDate: '',
          technicianSignatureDataUrl: signature || '',
          customerSignatureDataUrl: customerSignature || '',
        },
      },
    };

    try {
      if (isOnline) {
        await setDoc(doc(db, 'reports', reportId), reportData);
        if (activeReportId) {
          await localDb.drafts.delete(activeReportId);
        }
      } else {
        await saveDraftOffline(
          {
            saveDraft: (r) => localDb.drafts.put(r as any),
            deleteDraft: (id) => localDb.drafts.delete(id),
            getAllDrafts: () => localDb.drafts.toArray() as any,
          },
          reportData,
        );
        alert(lang === 'en' ? 'Saved offline as draft' : 'Guardado offline como borrador');
      }
      setActiveReportId(null);
      setCurrentRoute(ROUTES.history);
    } catch (e) {
      if (isOnline) {
        handleFirestoreError(e, OperationType.WRITE, `reports/${reportId}`);
      } else {
        console.error("Local save failed", e);
      }
    }
  };

  const syncDrafts = async () => {
    if (!isOnline || drafts.length === 0 || isSyncing) return;
    setIsSyncing(true);
    
    try {
      await syncOfflineDrafts(
        {
          saveDraft: (r) => localDb.drafts.put(r as any),
          deleteDraft: (id) => localDb.drafts.delete(id),
          getAllDrafts: () => localDb.drafts.toArray() as any,
        },
        {
          syncReport: (r) => setDoc(doc(db, 'reports', r.id), r as any),
        },
      );
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && drafts.length > 0) {
      syncDrafts();
    }
  }, [isOnline, drafts.length]);

  const deleteReport = async (id: string, isDraft: boolean) => {
    if (!confirm('Are you sure?')) return;
    try {
      if (isDraft) {
        await localDb.drafts.delete(id);
      } else {
        await deleteDoc(doc(db, 'reports', id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const steps = [
    { title: t.projectInfo, icon: Settings },
    { title: t.assets, icon: Database },
    { title: t.technicalData, icon: Cpu },
    { title: 'Commissioning', icon: FileText },
    { title: t.checklist, icon: ClipboardCheck },
    { title: t.documentation, icon: Camera },
    { title: t.signature, icon: PenTool },
  ];

  const saveProgressDraft = async () => {
    const targetUid = user?.uid || 'mvp-guest-user';
    const reportId = activeReportId || Math.random().toString(36).substring(7);

    const reportData: Report = {
      id: reportId,
      uid: targetUid,
      projectName,
      operator,
      date,
      checklist,
      signature,
      photos,
      comments: '',
      customFields: customFieldValues,
      status: 'draft',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      unitSystem,
      assets,
      measurementsByAsset,
      templateId,
      clientId,
      commissioning: {
        customerInformation: { ...customerInfo },
        applicationProcessInfo: { ...processInfo },
        photos: {
          blowerHouse: [...commissioningPhotos.blowerHouse],
          headerPiping: [...commissioningPhotos.headerPiping],
          aerationTanksValves: [...commissioningPhotos.aerationTanksValves],
        },
        inputVoltageRecordings: {
          rEarth: inputVoltageRecordings.rEarth ? Number(inputVoltageRecordings.rEarth) : null,
          wEarth: inputVoltageRecordings.wEarth ? Number(inputVoltageRecordings.wEarth) : null,
          bEarth: inputVoltageRecordings.bEarth ? Number(inputVoltageRecordings.bEarth) : null,
          rW: inputVoltageRecordings.rW ? Number(inputVoltageRecordings.rW) : null,
          rB: inputVoltageRecordings.rB ? Number(inputVoltageRecordings.rB) : null,
          wB: inputVoltageRecordings.wB ? Number(inputVoltageRecordings.wB) : null,
        },
        inputPowerRecordings: {
          rBVoltage: inputPowerRecordings.rBVoltage ? Number(inputPowerRecordings.rBVoltage) : null,
          rWVoltage: inputPowerRecordings.rWVoltage ? Number(inputPowerRecordings.rWVoltage) : null,
          bWVoltage: inputPowerRecordings.bWVoltage ? Number(inputPowerRecordings.bWVoltage) : null,
          rRmsCurrent: inputPowerRecordings.rRmsCurrent ? Number(inputPowerRecordings.rRmsCurrent) : null,
          wRmsCurrent: inputPowerRecordings.wRmsCurrent ? Number(inputPowerRecordings.wRmsCurrent) : null,
          bRmsCurrent: inputPowerRecordings.bRmsCurrent ? Number(inputPowerRecordings.bRmsCurrent) : null,
        },
        loadedOperation: loadedOperationRows.map((r) => ({
          id: r.id,
          svPercent: r.svPercent,
          motorRpm: r.motorRpm ? Number(r.motorRpm) : null,
          currentRwb: r.currentRwb ? Number(r.currentRwb) : null,
          powerKw: r.powerKw ? Number(r.powerKw) : null,
          flowM3Min: r.flowM3Min ? Number(r.flowM3Min) : null,
          p2Kpa: r.p2Kpa ? Number(r.p2Kpa) : null,
          deltaPPa: r.deltaPPa ? Number(r.deltaPPa) : null,
          t1C: r.t1C ? Number(r.t1C) : null,
          t2C: r.t2C ? Number(r.t2C) : null,
        })),
        scadaControlChecks: scadaChecks.map((c) => ({ ...c })),
        results: { ...commissioningResults },
        signatures: {
          technicianName: operator || user?.displayName || '',
          customerName: '',
          technicianDate: date,
          customerDate: '',
          technicianSignatureDataUrl: signature || '',
          customerSignatureDataUrl: customerSignature || '',
        },
      },
    };

    try {
      await localDb.drafts.put(reportData as any);
      if (!activeReportId) setActiveReportId(reportId);
    } catch (e) {
      console.warn('Failed to auto-save draft progress', e);
    }
  };

  const nextStep = async () => {
    await saveProgressDraft();
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = async () => {
    await saveProgressDraft();
    if (step > 0) setStep(step - 1);
  };

  const toggleStatus = (id: string, status: 'pass' | 'fail' | 'na') => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status: item.status === status ? null : status } : item
    ));
  };

  const updateItemComment = (id: string, comment: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, comment } : item
    ));
  };

  const handleSignatureStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = ('nativeEvent' in e && 'touches' in e.nativeEvent) ? (e.nativeEvent as TouchEvent).touches[0].clientX - rect.left : (e as any).clientX - rect.left;
    const y = ('nativeEvent' in e && 'touches' in e.nativeEvent) ? (e.nativeEvent as TouchEvent).touches[0].clientY - rect.top : (e as any).clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const handleSignatureMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('nativeEvent' in e && 'touches' in e.nativeEvent) ? (e.nativeEvent as TouchEvent).touches[0].clientX - rect.left : (e as any).clientX - rect.left;
    const y = ('nativeEvent' in e && 'touches' in e.nativeEvent) ? (e.nativeEvent as TouchEvent).touches[0].clientY - rect.top : (e as any).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (signingRole === 'customer') setCustomerSignature(null);
    else setSignature(null);
  };

  // Update checklist when template changes
  useEffect(() => {
    const template = companySettings.templates.find(t => t.id === templateId);
    if (template) {
      setChecklist(template.checklist.map(i => ({ ...i, status: null })));
    }
  }, [templateId, companySettings.templates]);

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    if (signingRole === 'customer') setCustomerSignature(dataUrl);
    else setSignature(dataUrl);
  };

  // PDF generation moved to `features/pdf/services/*`
  const commissioningForPdf = () => ({
    customerInformation: { ...customerInfo },
    applicationProcessInfo: { ...processInfo },
    photos: {
      blowerHouse: [...commissioningPhotos.blowerHouse],
      headerPiping: [...commissioningPhotos.headerPiping],
      aerationTanksValves: [...commissioningPhotos.aerationTanksValves],
    },
    inputVoltageRecordings: {
      rEarth: inputVoltageRecordings.rEarth ? Number(inputVoltageRecordings.rEarth) : null,
      wEarth: inputVoltageRecordings.wEarth ? Number(inputVoltageRecordings.wEarth) : null,
      bEarth: inputVoltageRecordings.bEarth ? Number(inputVoltageRecordings.bEarth) : null,
      rW: inputVoltageRecordings.rW ? Number(inputVoltageRecordings.rW) : null,
      rB: inputVoltageRecordings.rB ? Number(inputVoltageRecordings.rB) : null,
      wB: inputVoltageRecordings.wB ? Number(inputVoltageRecordings.wB) : null,
    },
    inputPowerRecordings: {
      rBVoltage: inputPowerRecordings.rBVoltage ? Number(inputPowerRecordings.rBVoltage) : null,
      rWVoltage: inputPowerRecordings.rWVoltage ? Number(inputPowerRecordings.rWVoltage) : null,
      bWVoltage: inputPowerRecordings.bWVoltage ? Number(inputPowerRecordings.bWVoltage) : null,
      rRmsCurrent: inputPowerRecordings.rRmsCurrent ? Number(inputPowerRecordings.rRmsCurrent) : null,
      wRmsCurrent: inputPowerRecordings.wRmsCurrent ? Number(inputPowerRecordings.wRmsCurrent) : null,
      bRmsCurrent: inputPowerRecordings.bRmsCurrent ? Number(inputPowerRecordings.bRmsCurrent) : null,
    },
    loadedOperation: loadedOperationRows.map((r) => ({
      svPercent: r.svPercent,
      motorRpm: r.motorRpm ? Number(r.motorRpm) : null,
      currentRwb: r.currentRwb ? Number(r.currentRwb) : null,
      powerKw: r.powerKw ? Number(r.powerKw) : null,
      flowM3Min: r.flowM3Min ? Number(r.flowM3Min) : null,
      p2Kpa: r.p2Kpa ? Number(r.p2Kpa) : null,
      deltaPPa: r.deltaPPa ? Number(r.deltaPPa) : null,
      t1C: r.t1C ? Number(r.t1C) : null,
      t2C: r.t2C ? Number(r.t2C) : null,
    })),
    scadaControlChecks: scadaChecks.map((c) => ({ label: c.label, value: c.value, comment: c.comment })),
    results: { ...commissioningResults },
    signatures: {
      technicianName: operator || user?.displayName || '',
      customerName: '',
      technicianDate: date,
      customerDate: '',
      technicianSignatureDataUrl: signature || '',
      customerSignatureDataUrl: customerSignature || '',
    },
  });

  const downloadPDF = () => {
    const file = generateLegacyReportPdfFile({
      lang,
      t,
      date,
      operator,
      projectName,
      customFieldValues,
      unitSystem,
      assets,
      measurementsByAsset,
      checklist,
      signature,
      companySettings,
      clientId,
      commissioning: commissioningForPdf(),
    });
    downloadPdfFile(file);
  };

  const safeReportDownloadBaseName = () =>
    (projectName || 'field-o-report')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'field-o-report';

  const downloadCurrentPreviewPdf = () => {
    if (pdfBlobUrl) {
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = `${safeReportDownloadBaseName()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    downloadPDF();
  };

  const previewPDF = () => {
    // Phase 2: validation is extracted but does not block UX yet.
    try {
      validateReportBeforePreview({
        id: activeReportId || 'legacy',
        clientId,
        clientName: companySettings.clients?.find((c) => c.id === clientId)?.name || '',
        projectName,
        operatorName: operator,
        reportDate: date,
        language: lang,
        templateId,
        status: 'draft',
        syncStatus: isOnline ? 'synced' : 'draft_local',
        unitSystem,
        generalComments: '',
        signatureDataUrl: signature || '',
        customFields: Object.entries(customFieldValues).map(([key, value]) => ({ key, value })),
        equipmentUnits: assets.map((a) => ({
          id: a.id,
          name: a.name,
          model: a.model,
          serialNumber: a.sn,
          nominalVoltage: a.nominalVoltage ?? null,
          notes: a.comment,
          photoUrls: a.photo ? [a.photo] : [],
          checklistItems: checklist.map((ci) => ({
            id: ci.id,
            category: String(ci.category),
            itemLabel: ci.label[lang],
            status: (ci.status || 'na') as any,
            selectedCommonDefect: '',
            comment: ci.comment,
          })),
          technicalReadings: (measurementsByAsset[a.id] || []).map((m) => ({
            id: m.id,
            pointLabel: m.label,
            voltageMeasured: Number(m.current),
          })),
        })),
        attachments: photos.map((url, idx) => ({ id: String(idx), type: 'image', url })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
    } catch (e) {
      console.warn('Pre-preview validation error (non-blocking)', e);
    }

    const file = generateLegacyReportPdfFile({
      lang,
      t,
      date,
      operator,
      projectName,
      customFieldValues,
      unitSystem,
      assets,
      measurementsByAsset,
      checklist,
      signature,
      companySettings,
      clientId,
      commissioning: commissioningForPdf(),
    });
    setPdfBlobUrl(setPdfPreview(file));
    setCurrentRoute(ROUTES.reportPreview);
  };

  const openPDFExternallyLegacy = () => {
    const file = generateLegacyReportPdfFile({
      lang,
      t,
      date,
      operator,
      projectName,
      customFieldValues,
      unitSystem,
      assets,
      measurementsByAsset,
      checklist,
      signature,
      companySettings,
      clientId,
      commissioning: commissioningForPdf(),
    });
    openPdfExternally(file);
  };

  const shareReport = async () => {
    const file = generateLegacyReportPdfFile({
      lang,
      t,
      date,
      operator,
      projectName,
      customFieldValues,
      unitSystem,
      assets,
      measurementsByAsset,
      checklist,
      signature,
      companySettings,
      clientId,
      commissioning: commissioningForPdf(),
    });

    try {
      const result = await sharePdfFile(file);
      if (result === 'downloaded') {
        alert(lang === 'en' ? 'Direct sharing not supported. File downloaded.' : 'Compartir no soportado. Archivo descargado.');
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Sharing failed', e);
        downloadPdfFile(file);
      }
    }
  };

  const openCurrentPreviewExternally = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    openPDFExternallyLegacy();
  };

  const shareCurrentPreview = async () => {
    if (pdfBlobUrl) {
      try {
        const res = await fetch(pdfBlobUrl);
        const blob = await res.blob();
        const file = new File([blob], `${safeReportDownloadBaseName()}.pdf`, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: projectName || 'Report' });
          return;
        }
      } catch (e) {
        console.warn('Share API unavailable, opening preview', e);
      }
      window.open(pdfBlobUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    void shareReport();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop Sidebar */}
      {!embedded && <aside className="sidebar">
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-black tracking-tighter text-primary">FIELD-O</div>
          <div className="group relative">
            <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-primary/50" referrerPolicy="no-referrer" />
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={startNewReport} 
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-bold transition-colors ${currentRoute === ROUTES.newReport ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:bg-surface'}`}
          >
            <PlusCircle size={18} />
            New Report
          </button>
          <button 
            onClick={() => setCurrentRoute(ROUTES.history)} 
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-bold transition-colors ${currentRoute === ROUTES.history || currentRoute === ROUTES.dashboard ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:bg-surface'}`}
          >
            <History size={18} />
            History
          </button>
          {isAdmin && (
            <button 
              onClick={() => setCurrentRoute(ROUTES.settings)} 
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-bold transition-colors ${currentRoute === ROUTES.settings ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:bg-surface'}`}
            >
              <ShieldCheck size={18} />
              Settings
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="flex flex-col gap-2 px-4">
            <div className="text-[11px] font-bold text-text-secondary uppercase">Language</div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary text-text-primary"
            >
              <option value="es">Español (MX)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </aside>}

      {/* Main Content Stage */}
      <main className="main-stage overflow-auto h-full lg:py-0">
        <div className="w-full h-full bg-bg relative">
          {/* Dashboard Home */}
          {(currentRoute === ROUTES.dashboard || currentRoute === ROUTES.history) && (
            <div className="flex flex-col h-full bg-bg">
              <div className="p-6 px-5 flex justify-between items-center bg-bg">
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-primary">Reports History</h1>
                  <button 
                    onClick={seedSampleReport}
                    className="text-[10px] font-bold text-primary hover:underline self-start uppercase tracking-widest mt-1"
                  >
                    + Load Reference Sample (Meadville 1)
                  </button>
                </div>
                <div className="flex gap-2">
                  {drafts.length > 0 && isOnline && (
                    <button 
                      onClick={syncDrafts}
                      disabled={isSyncing}
                      className="bg-success p-2 rounded-xl text-white shadow-lg shadow-success/30 active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <button 
                    onClick={startNewReport}
                    className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/30"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 custom-scrollbar pb-10">
                {[...drafts, ...reports].length === 0 ? (
                  <div className="mt-20 text-center text-text-secondary opacity-40">
                    <History size={60} className="mx-auto mb-4" />
                    <p className="font-bold text-sm">No reports found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...drafts, ...reports].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r) => {
                      const isDraft = r.status === 'draft';
                      const client = companySettings.clients?.find(c => c.id === r.clientId);
                      return (
                        <div key={r.id} className={`bg-surface border p-4 rounded-2xl group transition-all hover:border-primary/50 text-left ${isDraft ? 'border-dashed border-primary/30' : 'border-border'}`}>
                          <div className="flex justify-between items-start mb-2 text-left">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {client?.logoUrl && <img src={client.logoUrl} className="h-4 object-contain opacity-70 grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />}
                                <span className={`text-[8px] font-black uppercase tracking-tighter text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10`}>
                                  {client?.name || 'PRIVATE'}
                                </span>
                              </div>
                              <h3 className="font-bold text-text-primary flex items-center gap-2">
                                {r.projectName}
                                {isDraft && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">Draft</span>}
                              </h3>
                              <p className="text-[10px] text-text-secondary uppercase">{r.date} • {r.operator}</p>
                            </div>
                            <button onClick={() => deleteReport(r.id, isDraft)} className="p-2 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            {isDraft && (
                              <button onClick={() => {
                                setProjectName(r.projectName);
                                setOperator(r.operator);
                                setDate(r.date);
                                setChecklist(r.checklist);
                                setSignature(r.signature);
                                setPhotos(r.photos || []);
                                setCustomFieldValues(r.customFields || {});
                                setAssets(r.assets || []);
                                setMeasurementsByAsset(r.measurementsByAsset || {});
                                setUnitSystem(r.unitSystem || 'metric');
                                setTemplateId(r.templateId || 'turbo');
                                setClientId(r.clientId || '');
                                const comm = (r as any).commissioning || {};
                                setCustomerInfo({
                                  plantOwner: comm.customerInformation?.plantOwner || '',
                                  plantName: comm.customerInformation?.plantName || '',
                                  plantAddress: comm.customerInformation?.plantAddress || '',
                                  primaryContactName: comm.customerInformation?.primaryContactName || '',
                                  primaryContactEmail: comm.customerInformation?.primaryContactEmail || '',
                                });
                                setProcessInfo({
                                  numberOfBlowers: comm.applicationProcessInfo?.numberOfBlowers || '',
                                  blowerModel: comm.applicationProcessInfo?.blowerModel || '',
                                  blowerSNs: comm.applicationProcessInfo?.blowerSNs || '',
                                  aerationProcess: comm.applicationProcessInfo?.aerationProcess || '',
                                  waterDepth: comm.applicationProcessInfo?.waterDepth || '',
                                  aerationDevice: comm.applicationProcessInfo?.aerationDevice || '',
                                });
                                setCommissioningPhotos({
                                  blowerHouse: comm.photos?.blowerHouse || [],
                                  headerPiping: comm.photos?.headerPiping || [],
                                  aerationTanksValves: comm.photos?.aerationTanksValves || [],
                                });
                                setInputVoltageRecordings({
                                  rEarth: comm.inputVoltageRecordings?.rEarth != null ? String(comm.inputVoltageRecordings.rEarth) : '',
                                  wEarth: comm.inputVoltageRecordings?.wEarth != null ? String(comm.inputVoltageRecordings.wEarth) : '',
                                  bEarth: comm.inputVoltageRecordings?.bEarth != null ? String(comm.inputVoltageRecordings.bEarth) : '',
                                  rW: comm.inputVoltageRecordings?.rW != null ? String(comm.inputVoltageRecordings.rW) : '',
                                  rB: comm.inputVoltageRecordings?.rB != null ? String(comm.inputVoltageRecordings.rB) : '',
                                  wB: comm.inputVoltageRecordings?.wB != null ? String(comm.inputVoltageRecordings.wB) : '',
                                });
                                setInputPowerRecordings({
                                  rBVoltage: comm.inputPowerRecordings?.rBVoltage != null ? String(comm.inputPowerRecordings.rBVoltage) : '',
                                  rWVoltage: comm.inputPowerRecordings?.rWVoltage != null ? String(comm.inputPowerRecordings.rWVoltage) : '',
                                  bWVoltage: comm.inputPowerRecordings?.bWVoltage != null ? String(comm.inputPowerRecordings.bWVoltage) : '',
                                  rRmsCurrent: comm.inputPowerRecordings?.rRmsCurrent != null ? String(comm.inputPowerRecordings.rRmsCurrent) : '',
                                  wRmsCurrent: comm.inputPowerRecordings?.wRmsCurrent != null ? String(comm.inputPowerRecordings.wRmsCurrent) : '',
                                  bRmsCurrent: comm.inputPowerRecordings?.bRmsCurrent != null ? String(comm.inputPowerRecordings.bRmsCurrent) : '',
                                });
                                setLoadedOperationRows(
                                  (comm.loadedOperation?.length ? comm.loadedOperation : [35, 40, 50, 60, 70, 80, 90].map((sv: number) => ({ id: `loaded_${sv}`, svPercent: sv }))).map(
                                    (row: any) => ({
                                      id: row.id || `loaded_${row.svPercent || ''}`,
                                      svPercent: Number(row.svPercent ?? 0),
                                      motorRpm: row.motorRpm != null ? String(row.motorRpm) : '',
                                      currentRwb: row.currentRwb != null ? String(row.currentRwb) : '',
                                      powerKw: row.powerKw != null ? String(row.powerKw) : '',
                                      flowM3Min: row.flowM3Min != null ? String(row.flowM3Min) : '',
                                      p2Kpa: row.p2Kpa != null ? String(row.p2Kpa) : '',
                                      deltaPPa: row.deltaPPa != null ? String(row.deltaPPa) : '',
                                      t1C: row.t1C != null ? String(row.t1C) : '',
                                      t2C: row.t2C != null ? String(row.t2C) : '',
                                    })
                                  )
                                );
                                setScadaChecks(
                                  (comm.scadaControlChecks?.length ? comm.scadaControlChecks : scadaChecks).map((c: any, i: number) => ({
                                    id: c.id || `scada_${i}`,
                                    label: c.label,
                                    value: (c.value || 'na') as any,
                                    comment: c.comment || '',
                                  }))
                                );
                                setCommissioningResults({
                                  minSv: comm.results?.minSv || '',
                                  maxSv: comm.results?.maxSv || '',
                                  minOperatingPressure: comm.results?.minOperatingPressure || '',
                                  maxOperatingPressure: comm.results?.maxOperatingPressure || '',
                                  airFlowRange: comm.results?.airFlowRange || '',
                                });
                                setCustomerSignature(comm.signatures?.customerSignatureDataUrl || null);
                                setActiveReportId(r.id);
                                setStep(0);
                                setCurrentRoute(ROUTES.newReport);
                              }} className="flex-1 bg-primary/10 text-primary py-2 px-3 rounded-lg text-[11px] font-bold hover:bg-primary hover:text-white transition-colors uppercase">Edit Draft</button>
                            )}
                            <button onClick={() => {
                              // Populate state and generate PDF
                              setProjectName(r.projectName);
                              setOperator(r.operator);
                              setDate(r.date);
                              setChecklist(r.checklist);
                              setSignature(r.signature);
                              setPhotos(r.photos || []);
                              setCustomFieldValues(r.customFields || {});
                              setAssets(r.assets || []);
                              setMeasurementsByAsset(r.measurementsByAsset || {});
                              setUnitSystem(r.unitSystem || 'metric');
                              setTemplateId(r.templateId || 'turbo');
                              setClientId(r.clientId || '');
                              const comm = (r as any).commissioning || {};
                              setCustomerInfo({
                                plantOwner: comm.customerInformation?.plantOwner || '',
                                plantName: comm.customerInformation?.plantName || '',
                                plantAddress: comm.customerInformation?.plantAddress || '',
                                primaryContactName: comm.customerInformation?.primaryContactName || '',
                                primaryContactEmail: comm.customerInformation?.primaryContactEmail || '',
                              });
                              setProcessInfo({
                                numberOfBlowers: comm.applicationProcessInfo?.numberOfBlowers || '',
                                blowerModel: comm.applicationProcessInfo?.blowerModel || '',
                                blowerSNs: comm.applicationProcessInfo?.blowerSNs || '',
                                aerationProcess: comm.applicationProcessInfo?.aerationProcess || '',
                                waterDepth: comm.applicationProcessInfo?.waterDepth || '',
                                aerationDevice: comm.applicationProcessInfo?.aerationDevice || '',
                              });
                              setCommissioningPhotos({
                                blowerHouse: comm.photos?.blowerHouse || [],
                                headerPiping: comm.photos?.headerPiping || [],
                                aerationTanksValves: comm.photos?.aerationTanksValves || [],
                              });
                              setInputVoltageRecordings({
                                rEarth: comm.inputVoltageRecordings?.rEarth != null ? String(comm.inputVoltageRecordings.rEarth) : '',
                                wEarth: comm.inputVoltageRecordings?.wEarth != null ? String(comm.inputVoltageRecordings.wEarth) : '',
                                bEarth: comm.inputVoltageRecordings?.bEarth != null ? String(comm.inputVoltageRecordings.bEarth) : '',
                                rW: comm.inputVoltageRecordings?.rW != null ? String(comm.inputVoltageRecordings.rW) : '',
                                rB: comm.inputVoltageRecordings?.rB != null ? String(comm.inputVoltageRecordings.rB) : '',
                                wB: comm.inputVoltageRecordings?.wB != null ? String(comm.inputVoltageRecordings.wB) : '',
                              });
                              setInputPowerRecordings({
                                rBVoltage: comm.inputPowerRecordings?.rBVoltage != null ? String(comm.inputPowerRecordings.rBVoltage) : '',
                                rWVoltage: comm.inputPowerRecordings?.rWVoltage != null ? String(comm.inputPowerRecordings.rWVoltage) : '',
                                bWVoltage: comm.inputPowerRecordings?.bWVoltage != null ? String(comm.inputPowerRecordings.bWVoltage) : '',
                                rRmsCurrent: comm.inputPowerRecordings?.rRmsCurrent != null ? String(comm.inputPowerRecordings.rRmsCurrent) : '',
                                wRmsCurrent: comm.inputPowerRecordings?.wRmsCurrent != null ? String(comm.inputPowerRecordings.wRmsCurrent) : '',
                                bRmsCurrent: comm.inputPowerRecordings?.bRmsCurrent != null ? String(comm.inputPowerRecordings.bRmsCurrent) : '',
                              });
                              setLoadedOperationRows(
                                (comm.loadedOperation?.length ? comm.loadedOperation : loadedOperationRows).map((row: any) => ({
                                  id: row.id || `loaded_${row.svPercent || ''}`,
                                  svPercent: Number(row.svPercent ?? 0),
                                  motorRpm: row.motorRpm != null ? String(row.motorRpm) : '',
                                  currentRwb: row.currentRwb != null ? String(row.currentRwb) : '',
                                  powerKw: row.powerKw != null ? String(row.powerKw) : '',
                                  flowM3Min: row.flowM3Min != null ? String(row.flowM3Min) : '',
                                  p2Kpa: row.p2Kpa != null ? String(row.p2Kpa) : '',
                                  deltaPPa: row.deltaPPa != null ? String(row.deltaPPa) : '',
                                  t1C: row.t1C != null ? String(row.t1C) : '',
                                  t2C: row.t2C != null ? String(row.t2C) : '',
                                }))
                              );
                              setScadaChecks(
                                (comm.scadaControlChecks?.length ? comm.scadaControlChecks : scadaChecks).map((c: any, i: number) => ({
                                  id: c.id || `scada_${i}`,
                                  label: c.label,
                                  value: (c.value || 'na') as any,
                                  comment: c.comment || '',
                                }))
                              );
                              setCommissioningResults({
                                minSv: comm.results?.minSv || '',
                                maxSv: comm.results?.maxSv || '',
                                minOperatingPressure: comm.results?.minOperatingPressure || '',
                                maxOperatingPressure: comm.results?.maxOperatingPressure || '',
                                airFlowRange: comm.results?.airFlowRange || '',
                              });
                              setCustomerSignature(comm.signatures?.customerSignatureDataUrl || null);
                              setTimeout(previewPDF, 100);
                            }} className="flex-1 bg-border py-2 px-3 rounded-lg text-[11px] font-bold hover:bg-primary hover:text-white transition-colors uppercase">{isDraft ? 'Preview PDF' : 'View Report'}</button>
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${r.status === 'synced' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                              {r.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF Preview View */}
          {currentRoute === ROUTES.reportPreview && (
            <ReportPreviewScreen
              previewUrl={pdfBlobUrl}
              onBackToForm={() => setCurrentRoute(ROUTES.newReport)}
              onBackToHistory={() => setCurrentRoute(ROUTES.history)}
              onBackToDashboard={() => setCurrentRoute(ROUTES.dashboard)}
              onDownload={downloadCurrentPreviewPdf}
              onShare={() => {
                void shareCurrentPreview();
              }}
              onOpenExternal={openCurrentPreviewExternally}
              hideDashboard
              hideExternal
            />
          )}

          {/* Admin Settings */}
          {currentRoute === ROUTES.settings && (
            <div className="flex flex-col h-full bg-bg p-6 text-left">
              <h1 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                <ShieldCheck className="text-primary" />
                Company Configuration
              </h1>
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider text-left block">Company Logo</label>
                  <div className="flex flex-col gap-4">
                    {companySettings.logoUrl && (
                      <div className="bg-surface p-4 rounded-xl border border-dashed border-border flex justify-center">
                        <img src={companySettings.logoUrl} alt="Preview" className="h-16 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-surface hover:border-primary/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PlusCircle className="w-8 h-8 text-text-secondary mb-2" />
                        <p className="text-[10px] text-text-secondary font-bold uppercase">Upload PNG Logo</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result;
                              if (typeof result === 'string') {
                                setCompanySettings({
                                  ...companySettings, 
                                  logoUrl: result
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Custom Report Fields</label>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={companySettings.customFields?.join(', ') || ''}
                      onChange={(e) => setCompanySettings({...companySettings, customFields: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      placeholder="e.g. Asset ID, Location, Client Name"
                      className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors outline-none"
                    />
                    <p className="text-[10px] text-text-secondary">Separate field names with commas. These will appear in Step 1 of the report.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider text-left block">Default Client Logo (Fallback)</label>
                  <div className="flex flex-col gap-4">
                    {companySettings.defaultClientLogoUrl && (
                      <div className="bg-surface p-4 rounded-xl border border-dashed border-border flex justify-center">
                        <img src={companySettings.defaultClientLogoUrl} alt="Preview" className="h-10 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-xl cursor-pointer hover:bg-surface hover:border-primary/50 transition-all">
                      <div className="flex flex-col items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-text-secondary mb-1" />
                        <p className="text-[9px] text-text-secondary font-bold uppercase">Set Default Client Logo</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result;
                              if (typeof result === 'string') {
                                setCompanySettings({
                                  ...companySettings, 
                                  defaultClientLogoUrl: result
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Client Profiles</label>
                  <div className="space-y-4">
                    {companySettings.clients?.map((client, idx) => (
                      <div key={client.id} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <input 
                            className="bg-transparent font-bold text-sm text-text-primary outline-none focus:border-b border-primary"
                            value={client.name}
                            onChange={(e) => {
                              const newClients = [...(companySettings.clients || [])];
                              newClients[idx].name = e.target.value;
                              setCompanySettings({...companySettings, clients: newClients});
                            }}
                          />
                          <button 
                            onClick={() => {
                              const newClients = (companySettings.clients || []).filter(c => c.id !== client.id);
                              setCompanySettings({...companySettings, clients: newClients});
                            }}
                            className="text-text-secondary hover:text-error transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-10 bg-bg rounded border border-border flex items-center justify-center overflow-hidden">
                            {client.logoUrl ? (
                              <img src={client.logoUrl} className="max-h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Briefcase size={16} className="text-text-secondary opacity-30" />
                            )}
                          </div>
                          <label className="flex-1">
                            <div className="bg-primary/10 text-primary text-[9px] font-black uppercase py-1.5 px-3 rounded text-center cursor-pointer hover:bg-primary hover:text-white transition-all">
                              Change Client Logo
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/png,image/jpeg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result;
                                    if (typeof result === 'string') {
                                      const newClients = [...(companySettings.clients || [])];
                                      newClients[idx].logoUrl = result;
                                      setCompanySettings({...companySettings, clients: newClients});
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const newClient: ClientProfile = {
                          id: Date.now().toString(),
                          name: 'New Client',
                          logoUrl: ''
                        };
                        setCompanySettings({...companySettings, clients: [...(companySettings.clients || []), newClient]});
                      }}
                      className="w-full py-3 border-2 border-dashed border-border rounded-xl text-[10px] font-bold text-text-secondary hover:border-primary/50 hover:text-primary transition-all uppercase"
                    >
                      + Add New Client Profile
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Report Templates</label>
                  <div className="space-y-2">
                    {companySettings.templates.map(tmp => (
                      <div key={tmp.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
                        <div className="flex items-center gap-2">
                          <Layout size={14} className="text-primary" />
                          <span className="text-[11px] font-bold text-text-primary">{tmp.name}</span>
                        </div>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase">{tmp.checklist.length} ITEMS</span>
                      </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-border rounded-lg text-[10px] font-bold text-text-secondary hover:border-primary transition-all uppercase">+ Define New Template</button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={async () => {
                      try {
                        await setDoc(doc(db, 'settings', 'default'), companySettings);
                        alert('Configuration Saved Successfully!');
                      } catch (e) {
                        handleFirestoreError(e, OperationType.WRITE, 'settings/default');
                      }
                    }}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all uppercase text-xs tracking-widest"
                  >
                    Save Professional Branding
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report Form */}
          {currentRoute === ROUTES.newReport && (
            <div className="flex h-full min-h-0 flex-col bg-bg">
              {/* App Header (Internal) */}
              <div className="flex items-center justify-between bg-bg px-4 py-3 lg:px-5 lg:py-6 lg:pb-2">
                <span className="font-extrabold tracking-tighter text-text-primary">FIELD-O</span>
                <button
                  type="button"
                  title={embedded ? 'Report + PDF language' : 'Toggle language'}
                  onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                  className="text-[10px] font-bold bg-surface px-2 py-1 rounded border border-border text-primary uppercase"
                >
                  {embedded ? `PDF ${lang.toUpperCase()}` : `${lang} | ${lang === 'en' ? 'ES' : 'EN'}`}
                </button>
              </div>

              {/* Step Indicator Bars */}
              <div className="flex gap-1.5 bg-bg px-4 py-3 lg:px-5 lg:py-5">
                {steps.map((_, i) => (
                  <div key={i} className={`step-bar ${i <= step ? 'active' : ''}`} />
                ))}
              </div>

              {/* Scrollable Content Area (mobile: step actions scroll at end of body) */}
              <div
                className={`min-h-0 flex-1 overflow-y-auto bg-bg px-4 text-left custom-scrollbar lg:px-5 ${
                  embedded ? 'max-lg:pb-[calc(var(--fieldo-mobile-tab-bar-height)+0.75rem)]' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={embedded ? 'pb-1 lg:pb-8' : 'pb-8 lg:pb-8'}
                  >
                    <h1 className="text-[17px] font-semibold leading-snug text-text-primary lg:text-[18px]">
                      {steps[step].title}
                    </h1>
                    <p className="mb-4 mt-1 text-[12px] tracking-tight text-text-secondary lg:mb-6">
                      {projectName || 'New Report'}
                    </p>

                    {/* Step 1: Project Info & Client */}
                    {step === 0 && (
                      <ProjectInfoStep
                        lang={lang}
                        setLang={setLang}
                        embedded={embedded}
                        shellUiLang={shellLanguage ?? lang}
                        t={t}
                        companySettings={companySettings}
                        setCompanySettings={setCompanySettings}
                        clientId={clientId}
                        setClientId={setClientId}
                        isAddingClient={isAddingClient}
                        setIsAddingClient={setIsAddingClient}
                        newClientName={newClientName}
                        setNewClientName={setNewClientName}
                        projectName={projectName}
                        setProjectName={setProjectName}
                        operator={operator}
                        setOperator={setOperator}
                        date={date}
                        customFieldValues={customFieldValues}
                        setCustomFieldValues={setCustomFieldValues}
                      />
                    )}
                    
                    {/* Step 1: Assets Management */}
                    {step === 1 && (
                      <EquipmentUnitsStep
                        t={t}
                        unitSystem={unitSystem}
                        setUnitSystem={setUnitSystem}
                        templateId={templateId}
                        setTemplateId={setTemplateId}
                        companySettings={companySettings}
                        assets={assets}
                        setAssets={setAssets}
                      />
                    )}

                    {/* Step 2: Technical Readings (Data Grid) */}
                    {step === 2 && (
                      <TechnicalReadingsStep
                        assets={assets}
                        setAssets={setAssets}
                        unitSystem={unitSystem}
                        measurementsByAsset={measurementsByAsset}
                        setMeasurementsByAsset={setMeasurementsByAsset}
                        validateVoltageTolerance={validateVoltageTolerance}
                      />
                    )}

                    {/* Step 3: Commissioning */}
                    {step === 3 && (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Customer Information</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {[
                              ['Plant Owner', 'plantOwner'],
                              ['Plant Name', 'plantName'],
                              ['Primary Contact', 'primaryContactName'],
                              ['Contact Email', 'primaryContactEmail'],
                            ].map(([label, key]) => (
                              <div key={key as string} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</label>
                                <input
                                  value={(customerInfo as any)[key]}
                                  onChange={(e) => setCustomerInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                              </div>
                            ))}
                            <div className="md:col-span-2 space-y-1.5">
                              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Plant Address</label>
                              <input
                                value={customerInfo.plantAddress}
                                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, plantAddress: e.target.value }))}
                                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Application & Process Information</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {[
                              ['Number of Blowers', 'numberOfBlowers'],
                              ['Blower Model', 'blowerModel'],
                              ['Blower SNs', 'blowerSNs'],
                              ['Aeration Process', 'aerationProcess'],
                              ['Water Depth', 'waterDepth'],
                              ['Aeration Device', 'aerationDevice'],
                            ].map(([label, key]) => (
                              <div key={key as string} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</label>
                                <input
                                  value={(processInfo as any)[key]}
                                  onChange={(e) => setProcessInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Photos</h3>
                          {([
                            ['Photo of Blowers / blower house', 'blowerHouse'],
                            ['Photo/Sketch of header piping', 'headerPiping'],
                            ['Photo of aeration tanks and/or control valves', 'aerationTanksValves'],
                          ] as const).map(([label, key]) => (
                            <div key={key} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-text-primary">{label}</div>
                                <label className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-bold text-text-primary hover:bg-bg/60 cursor-pointer">
                                  + Add Photo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(e.currentTarget.files || []) as File[]
                                      if (!files.length) return

                                      files.forEach((file) => {
                                        const reader = new FileReader()
                                        reader.onload = () => {
                                          const result = reader.result
                                          if (typeof result === 'string') {
                                            setCommissioningPhotos((prev) => ({ ...prev, [key]: [...prev[key], result] }))
                                          }
                                        }
                                        reader.readAsDataURL(file)
                                      })

                                      e.currentTarget.value = ''
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="text-xs text-text-secondary">{commissioningPhotos[key].length} photo(s)</div>
                              {commissioningPhotos[key].length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {commissioningPhotos[key].map((src, idx) => (
                                    <div key={`${key}-${idx}`} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
                                      <img src={src} alt="" className="h-full w-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCommissioningPhotos((prev) => ({
                                            ...prev,
                                            [key]: prev[key].filter((_, i) => i !== idx),
                                          }))
                                        }
                                        className="absolute right-1 top-1 rounded bg-error/80 px-2 py-1 text-[10px] font-bold text-white"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Input Voltage Recordings</h3>
                          <div className="grid gap-3 md:grid-cols-3">
                            {[
                              ['R - Earth', 'rEarth'],
                              ['W - Earth', 'wEarth'],
                              ['B - Earth', 'bEarth'],
                              ['R-W', 'rW'],
                              ['R-B', 'rB'],
                              ['W-B', 'wB'],
                            ].map(([label, key]) => (
                              <div key={key as string} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</label>
                                <input
                                  value={(inputVoltageRecordings as any)[key]}
                                  onChange={(e) => setInputVoltageRecordings((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                                  inputMode="decimal"
                                  placeholder="VAC"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Input Power Recordings</h3>
                          <div className="grid gap-3 md:grid-cols-3">
                            {[
                              ['R-B Voltage', 'rBVoltage'],
                              ['R-W Voltage', 'rWVoltage'],
                              ['B-W Voltage', 'bWVoltage'],
                              ['R RMS Current', 'rRmsCurrent'],
                              ['W RMS Current', 'wRmsCurrent'],
                              ['B RMS Current', 'bRmsCurrent'],
                            ].map(([label, key]) => (
                              <div key={key as string} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</label>
                                <input
                                  value={(inputPowerRecordings as any)[key]}
                                  onChange={(e) => setInputPowerRecordings((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                                  inputMode="decimal"
                                  placeholder="Value"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Loaded Operation</h3>
                          <div className="overflow-x-auto rounded-xl border border-border">
                            <table className="min-w-full text-sm">
                              <thead className="bg-bg/60 text-text-secondary">
                                <tr>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">SV%</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">RPM</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">Current</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">kW</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">Flow</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">P2</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">ΔP</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">T1</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">T2</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border bg-surface">
                                {loadedOperationRows.map((row, idx) => (
                                  <tr key={row.id}>
                                    <td className="px-3 py-2 font-bold text-text-primary">{row.svPercent}</td>
                                    {(['motorRpm','currentRwb','powerKw','flowM3Min','p2Kpa','deltaPPa','t1C','t2C'] as const).map((field) => (
                                      <td key={field} className="px-2 py-2">
                                        <input
                                          value={(row as any)[field]}
                                          onChange={(e) => {
                                            const v = e.target.value
                                            setLoadedOperationRows((prev) => prev.map((r, i) => i === idx ? ({ ...r, [field]: v }) : r))
                                          }}
                                          className="w-24 bg-bg border border-border rounded-md px-2 py-1 text-xs text-text-primary outline-none focus:border-primary"
                                          inputMode="decimal"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Customer Communication and Control</h3>
                          <div className="space-y-3">
                            {scadaChecks.map((c, idx) => (
                              <div key={c.id} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div className="text-sm font-medium text-text-primary">{c.label}</div>
                                  <select
                                    value={c.value}
                                    onChange={(e) => {
                                      const v = e.target.value as any
                                      setScadaChecks((prev) => prev.map((x, i) => i === idx ? ({ ...x, value: v }) : x))
                                    }}
                                    className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-bold text-text-primary outline-none focus:border-primary"
                                  >
                                    <option value="na">N/A</option>
                                    <option value="yes">YES</option>
                                    <option value="no">NO</option>
                                  </select>
                                </div>
                                <input
                                  value={c.comment}
                                  onChange={(e) => setScadaChecks((prev) => prev.map((x, i) => i === idx ? ({ ...x, comment: e.target.value }) : x))}
                                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
                                  placeholder="Comment (optional)"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-primary/70">Results</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {[
                              ['Min SV', 'minSv'],
                              ['Max SV', 'maxSv'],
                              ['Min Operating Pressure', 'minOperatingPressure'],
                              ['Max Operating Pressure', 'maxOperatingPressure'],
                              ['Air Flow Range', 'airFlowRange'],
                            ].map(([label, key]) => (
                              <div key={key as string} className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</label>
                                <input
                                  value={(commissioningResults as any)[key]}
                                  onChange={(e) => setCommissioningResults((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Checklist */}
                    {step === 4 && (
                      <div className="space-y-6">
                        {Object.keys(translations.en.categories).map((catKey) => {
                          const items = checklist.filter(i => i.category === catKey);
                          return (
                            <div key={catKey} className="space-y-3">
                              <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary/70">
                                {t.categories[catKey as keyof Translations['categories']]}
                              </h3>
                              {items.map(item => (
                                <div key={item.id} className="check-card">
                                  <span className="text-[14px] font-medium text-text-primary block mb-3">
                                    {item.label[lang]}
                                  </span>
                                  <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => toggleStatus(item.id, 'pass')} className={`choice-btn ${item.status === 'pass' ? 'active-success' : ''}`}>{t.pass}</button>
                                    <button onClick={() => toggleStatus(item.id, 'fail')} className={`choice-btn ${item.status === 'fail' ? 'active-fail' : ''}`}>{t.fail}</button>
                                    <button onClick={() => toggleStatus(item.id, 'na')} className={`choice-btn ${item.status === 'na' ? 'active-na' : ''}`}>{t.na}</button>
                                  </div>

                                  {item.status === 'fail' && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="mt-4 space-y-3 overflow-hidden"
                                    >
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest">{t.commonDefects}</label>
                                        <div className="flex flex-wrap gap-1.5">
                                          {COMMON_DEFECTS[item.category][lang].map(defect => (
                                            <button 
                                              key={defect}
                                              onClick={() => updateItemComment(item.id, defect)}
                                              className="text-[9px] font-bold bg-surface border border-border px-2 py-1 rounded hover:bg-primary/10 hover:border-primary/30 transition-colors text-text-secondary hover:text-primary"
                                            >
                                              {defect}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{t.comments}</label>
                                        <textarea 
                                          value={item.comment || ''}
                                          onChange={(e) => updateItemComment(item.id, e.target.value)}
                                          placeholder="..."
                                          className="w-full bg-bg border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-primary min-h-[60px]"
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-6">
                        <div 
                          onClick={() => {
                            // Simulating photo upload with a random image
                            const newPhoto = `https://picsum.photos/seed/${Math.random()}/800/600`;
                            setPhotos([...photos, newPhoto]);
                          }}
                          className="w-full aspect-video border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text-secondary hover:border-primary transition-colors cursor-pointer bg-surface/30 group"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-2">
                            <Camera size={24} className="text-primary" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">{lang === 'en' ? 'Add Photo Evidence' : 'Añadir Evidencia Foto'}</p>
                          <p className="text-[9px] text-text-secondary mt-1">(Simulated Upload)</p>
                        </div>

                        {photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {photos.map((src, index) => (
                              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                                <img src={src} alt={`Evidence ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                  className="absolute top-2 right-2 p-1.5 bg-error/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">{t.comments}</label>
                          <textarea className="w-full bg-surface border border-border rounded-lg p-3 text-xs focus:outline-none focus:border-primary h-24 text-text-primary" placeholder="..." />
                        </div>
                      </div>
                    )}

                    {step === 6 && (
                      <div className="space-y-6">
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{t.signatureRequired}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSigningRole('technician')
                              clearSignature()
                            }}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                              signingRole === 'technician'
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-border bg-surface text-text-secondary'
                            }`}
                          >
                            Technician
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSigningRole('customer')
                              clearSignature()
                            }}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                              signingRole === 'customer'
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-border bg-surface text-text-secondary'
                            }`}
                          >
                            Customer
                          </button>
                        </div>
                        <div className="bg-surface border border-border rounded-xl overflow-hidden relative">
                          <canvas 
                            ref={canvasRef} 
                            width={400} 
                            height={200} 
                            onMouseDown={handleSignatureStart} 
                            onMouseMove={handleSignatureMove} 
                            onMouseUp={() => { setIsDrawing(false); saveSignature(); }} 
                            onMouseLeave={() => { setIsDrawing(false); saveSignature(); }} 
                            onTouchStart={handleSignatureStart} 
                            onTouchMove={handleSignatureMove} 
                            onTouchEnd={() => { setIsDrawing(false); saveSignature(); }} 
                            className="w-full h-40 touch-none cursor-crosshair" 
                          />
                          <button onClick={clearSignature} className="absolute top-2 right-2 p-1.5 bg-error/20 text-error rounded hover:bg-error/30 transition-colors"><XCircle size={16} /></button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-border bg-surface p-3">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Technician signature</div>
                            <div className="mt-2 text-xs text-text-secondary">{signature ? 'Captured' : 'Pending'}</div>
                          </div>
                          <div className="rounded-xl border border-border bg-surface p-3">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Customer signature</div>
                            <div className="mt-2 text-xs text-text-secondary">{customerSignature ? 'Captured' : 'Pending'}</div>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            await saveProgressDraft();
                            previewPDF();
                          }} 
                          className="w-full bg-primary text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                          <Eye size={18} />
                          VIEW REPORT
                        </button>
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('fieldo:navigate', { detail: { route: 'settings', settingsSubSection: 'clients' } })
                            );
                          }}
                          className="w-full bg-surface border border-border text-text-primary font-bold py-2 rounded-lg text-xs"
                        >
                          Edit Client Data
                        </button>
                        <button 
                          onClick={previewPDF}
                          className="w-full bg-surface border border-border text-text-primary font-bold py-2 rounded-lg text-xs mt-2"
                        >
                          Quick PDF Preview
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 border-t border-border pt-4 lg:hidden">
                  <ReportWizardNavButtons
                    step={step}
                    lastStepIndex={steps.length - 1}
                    backLabel={step === 0 ? 'Cancel' : t.back}
                    nextLabel={t.next}
                    onBack={() => {
                      if (step === 0) {
                        window.dispatchEvent(new CustomEvent('fieldo:navigate', { detail: { route: 'dashboard' } }));
                      } else {
                        void prevStep();
                      }
                    }}
                    onNext={() => void nextStep()}
                  />
                </div>
              </div>

              {/* Desktop: actions stay below scroll area */}
              <div className="hidden border-t border-border bg-bg lg:block lg:static lg:p-5">
                <ReportWizardNavButtons
                  step={step}
                  lastStepIndex={steps.length - 1}
                  backLabel={step === 0 ? 'Cancel' : t.back}
                  nextLabel={t.next}
                  onBack={() => {
                    if (step === 0) {
                      window.dispatchEvent(new CustomEvent('fieldo:navigate', { detail: { route: 'dashboard' } }));
                    } else {
                      void prevStep();
                    }
                  }}
                  onNext={() => void nextStep()}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
