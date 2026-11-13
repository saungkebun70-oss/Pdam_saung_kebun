import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '@/firebase-applet-config.json';
import { PdamRecord, INITIAL_RECORDS, DEFAULT_ADMIN_PIN, DEFAULT_VERCEL_URL, MASTER_DATA_VERSION, StatusPemasangan } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'admin'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using cache.');
    }
    return false;
  }
}

const PDAM_COLLECTION = 'pdam_saung_kebun';
const SETTINGS_ADMIN_DOC = 'settings/admin';

// Initialize default settings and sync master 46 LUNAS resident data when needed
let isInitializingSeed = false;
export async function checkAndSeedInitialData(): Promise<void> {
  if (isInitializingSeed) return;
  isInitializingSeed = true;

  try {
    // 1. Check Admin PIN & Data Version
    const adminRef = doc(db, 'settings', 'admin');
    const adminSnap = await getDoc(adminRef);
    const now = new Date().toISOString();

    let existingPin = DEFAULT_ADMIN_PIN;
    let currentDataVersion = 0;

    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        pin: DEFAULT_ADMIN_PIN,
        vercelUrl: DEFAULT_VERCEL_URL,
        dataVersion: MASTER_DATA_VERSION,
        updatedAt: now,
      });
      console.log('Seeded default Admin PIN: 123456');
    } else {
      const adminData = adminSnap.data() || {};
      if (typeof adminData.pin === 'string' && adminData.pin.length === 6) {
        existingPin = adminData.pin;
      }
      currentDataVersion = typeof adminData.dataVersion === 'number' ? adminData.dataVersion : 0;
    }

    // 2. Check PDAM records & sync missing master records cleanly without overwriting user edits
    const pdamCol = collection(db, PDAM_COLLECTION);
    const snap = await getDocs(pdamCol);
    if (snap.empty) {
      console.log('Syncing empty pdam_saung_kebun with 46 master records...');
      const batch = writeBatch(db);

      INITIAL_RECORDS.forEach((rec) => {
        const newDocRef = doc(pdamCol);
        batch.set(newDocRef, {
          nama: rec.nama,
          blok: rec.blok,
          nomor: rec.nomor,
          status: rec.status,
          keterangan: rec.keterangan || 'LUNAS',
          fotoBukti: '',
          createdAt: now,
          updatedAt: now,
        });
      });

      batch.set(
        adminRef,
        {
          pin: existingPin,
          dataVersion: MASTER_DATA_VERSION,
          updatedAt: now,
        },
        { merge: true }
      );

      await batch.commit();
      console.log('Successfully seeded 46 master PDAM records.');
    } else if (currentDataVersion < MASTER_DATA_VERSION) {
      // Non-destructive sync: keep existing records (statuses & photos) and insert any missing master records
      const normalizeKey = (blokVal: string, nomorVal: string) => {
        const b = String(blokVal || '').trim().toUpperCase();
        const rawNo = String(nomorVal || '').trim();
        const num = /^\d+$/.test(rawNo) ? String(parseInt(rawNo, 10)) : rawNo.toLowerCase();
        return `${b}__${num}`;
      };

      const existingKeys = new Set<string>();
      snap.docs.forEach((d) => {
        const data = d.data() || {};
        existingKeys.add(normalizeKey(String(data.blok || ''), String(data.nomor || '')));
      });

      const batch = writeBatch(db);
      let addedCount = 0;

      INITIAL_RECORDS.forEach((rec) => {
        const key = normalizeKey(rec.blok, rec.nomor);
        if (!existingKeys.has(key)) {
          const newDocRef = doc(pdamCol);
          batch.set(newDocRef, {
            nama: rec.nama,
            blok: rec.blok,
            nomor: rec.nomor,
            status: rec.status,
            keterangan: rec.keterangan || 'LUNAS',
            fotoBukti: '',
            createdAt: now,
            updatedAt: now,
          });
          addedCount += 1;
        }
      });

      batch.set(
        adminRef,
        {
          pin: existingPin,
          dataVersion: MASTER_DATA_VERSION,
          updatedAt: now,
        },
        { merge: true }
      );

      await batch.commit();
      console.log(`Synced missing master records: added ${addedCount} record(s).`);
    }
  } catch (error) {
    console.warn('Could not auto-seed data (likely offline or rules):', error);
  } finally {
    isInitializingSeed = false;
  }
}

// Subscribe to real-time records
export function subscribePdamRecords(
  onData: (records: PdamRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PDAM_COLLECTION);
  const q = query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const records: PdamRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        return {
          id: docSnap.id,
          nama: String(d.nama || '').trim(),
          blok: String(d.blok || '').trim(),
          nomor: String(d.nomor || '').trim(),
          status: (d.status as StatusPemasangan) || 'Belum Terpasang',
          keterangan: String(d.keterangan || '').trim(),
          fotoBukti: typeof d.fotoBukti === 'string' ? d.fotoBukti : '',
          createdAt: String(d.createdAt || ''),
          updatedAt: String(d.updatedAt || ''),
        };
      });

      // Sort logically by Blok and Nomor safely
      records.sort((a, b) => {
        const blokA = String(a?.blok || '');
        const blokB = String(b?.blok || '');
        if (blokA !== blokB) return blokA.localeCompare(blokB, undefined, { numeric: true });
        const noA = String(a?.nomor || '');
        const noB = String(b?.nomor || '');
        return noA.localeCompare(noB, undefined, { numeric: true });
      });

      onData(records);

      // If empty on first read, trigger seeding
      if (snapshot.empty) {
        checkAndSeedInitialData();
      }
    },
    (err) => {
      console.error('Subscription error:', err);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

// Subscribe to Admin PIN & Web URL settings
export function subscribeAdminSettings(
  onSettings: (settings: { pin: string; vercelUrl: string }) => void,
  onError?: (err: Error) => void
) {
  const adminDoc = doc(db, 'settings', 'admin');
  return onSnapshot(
    adminDoc,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() || {};
        onSettings({
          pin: typeof data.pin === 'string' && data.pin.length === 6 ? data.pin : DEFAULT_ADMIN_PIN,
          vercelUrl:
            typeof data.vercelUrl === 'string' && data.vercelUrl.trim()
              ? data.vercelUrl.trim()
              : DEFAULT_VERCEL_URL,
        });
      } else {
        onSettings({ pin: DEFAULT_ADMIN_PIN, vercelUrl: DEFAULT_VERCEL_URL });
      }
    },
    (err) => {
      console.error('Admin settings subscription error:', err);
      if (onError) onError(err);
      onSettings({ pin: DEFAULT_ADMIN_PIN, vercelUrl: DEFAULT_VERCEL_URL });
    }
  );
}

// Backwards-compatible PIN subscription
export function subscribeAdminPin(
  onPin: (pin: string) => void,
  onError?: (err: Error) => void
) {
  return subscribeAdminSettings(
    (s) => onPin(s.pin),
    onError
  );
}

// Add new resident PDAM record
export async function addPdamRecord(data: {
  nama: string;
  blok: string;
  nomor: string;
  status: StatusPemasangan;
  keterangan?: string;
  fotoBukti?: string;
}): Promise<string> {
  try {
    const colRef = collection(db, PDAM_COLLECTION);
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      nama: data.nama.trim(),
      blok: data.blok.trim(),
      nomor: data.nomor.trim(),
      status: data.status,
      keterangan: (data.keterangan || '').trim().slice(0, 500),
      fotoBukti: (data.fotoBukti || '').slice(0, 250000),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PDAM_COLLECTION);
    throw error;
  }
}

// Update resident status
export async function updatePdamStatus(id: string, status: StatusPemasangan): Promise<void> {
  const docPath = `${PDAM_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PDAM_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

// Update full record
export async function updatePdamRecord(
  id: string,
  data: Partial<Omit<PdamRecord, 'id'>>
): Promise<void> {
  const docPath = `${PDAM_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PDAM_COLLECTION, id);
    const payload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.nama !== undefined) payload.nama = String(data.nama).trim();
    if (data.blok !== undefined) payload.blok = String(data.blok).trim();
    if (data.nomor !== undefined) payload.nomor = String(data.nomor).trim();
    if (data.status !== undefined) payload.status = data.status;
    if (data.keterangan !== undefined) payload.keterangan = String(data.keterangan).trim().slice(0, 500);
    if (data.fotoBukti !== undefined) payload.fotoBukti = String(data.fotoBukti).slice(0, 250000);

    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

// Delete resident record
export async function deletePdamRecord(id: string): Promise<void> {
  const docPath = `${PDAM_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PDAM_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}

// Change Admin PIN in settings/admin
export async function updateAdminPin(newPin: string): Promise<void> {
  try {
    const adminRef = doc(db, 'settings', 'admin');
    await setDoc(
      adminRef,
      {
        pin: newPin,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_ADMIN_DOC);
    throw error;
  }
}

// Save Vercel Web Link in settings/admin
export async function updateVercelUrl(rawUrl: string, fallbackPin = DEFAULT_ADMIN_PIN): Promise<string> {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  const normalized = trimmed
    ? /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    : '';

  try {
    const adminRef = doc(db, 'settings', 'admin');
    const snap = await getDoc(adminRef);
    const existingPin =
      snap.exists() && typeof snap.data()?.pin === 'string' && snap.data()?.pin.length === 6
        ? snap.data().pin
        : fallbackPin;

    await setDoc(
      adminRef,
      {
        pin: existingPin,
        vercelUrl: normalized.slice(0, 255),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return normalized;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_ADMIN_DOC);
    throw error;
  }
}

// Reset database back to the 46 master records
export async function resetDatabaseToDefault(): Promise<void> {
  try {
    const colRef = collection(db, PDAM_COLLECTION);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    // Delete existing
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    // Re-seed 46 master records
    const now = new Date().toISOString();
    INITIAL_RECORDS.forEach((rec) => {
      const newRef = doc(colRef);
      batch.set(newRef, {
        nama: rec.nama,
        blok: rec.blok,
        nomor: rec.nomor,
        status: rec.status,
        keterangan: rec.keterangan || 'LUNAS',
        fotoBukti: '',
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PDAM_COLLECTION);
    throw error;
  }
}

// Trigger initial check once
testConnection();
checkAndSeedInitialData();
