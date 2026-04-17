import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'

import { db as firestore } from '../../firebase'
import type { Report } from '../../types/report.types'
import type { CompanySettings } from '../../types/settings.types'

const REPORTS_COLLECTION = 'reports'
const SETTINGS_COLLECTION = 'settings'

export async function fetchCloudReports(): Promise<Report[]> {
  const reportsRef = collection(firestore, REPORTS_COLLECTION)
  const q = query(reportsRef, orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Report
    return { ...data, id: data.id || docSnap.id }
  })
}

export async function saveCloudReport(report: Report): Promise<void> {
  await setDoc(doc(firestore, REPORTS_COLLECTION, report.id), report, { merge: true })
}

export async function fetchCloudSettings(): Promise<CompanySettings | null> {
  const snapshot = await getDoc(doc(firestore, SETTINGS_COLLECTION, 'company'))
  return snapshot.exists() ? (snapshot.data() as CompanySettings) : null
}

export async function saveCloudSettings(settings: CompanySettings): Promise<void> {
  await setDoc(doc(firestore, SETTINGS_COLLECTION, 'company'), settings, { merge: true })
}

