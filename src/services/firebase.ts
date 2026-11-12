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
import { PdamRecord, INITIAL_RECORDS, DEFAULT_ADMIN_PIN, StatusPemasangan } from '../types';

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

// Initialize default settings and seed initial 4 data if empty
let isInitializingSeed = false;
export async function checkAndSeedInitialData(): Promise<void> {
  if (isInitializingSeed) return;
  isInitializingSeed = true;

  try {
    // 1. Check Admin PIN
    const adminRef = doc(db, 'settings', 'admin');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        pin: DEFAULT_ADMIN_PIN,
        updatedAt: new Date().toISOString(),
      });
      console.log('Seeded default Admin PIN: 123456');
    }

    // 2. Check PDAM records
    const pdamCol = collection(db, PDAM_COLLECTION);
    const snap = await getDocs(pdamCol);
    if (snap.empty) {
      console.log('Collection pdam_saung_kebun is empty. Seeding 4 default records...');
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      INITIAL_RECORDS.forEach((rec) => {
        const newDocRef = doc(pdamCol);
        batch.set(newDocRef, {
          nama: rec.nama,
          blok: rec.blok,
          nomor: rec.nomor,
          status: rec.status,
          keterangan: 'Data Awal Pengurus',
          createdAt: now,
          updatedAt: now,
        });
      });

      await batch.commit();
      console.log('Successfully seeded 4 initial records.');
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

// Subscribe to Admin PIN
export function subscribeAdminPin(
  onPin: (pin: string) => void,
  onError?: (err: Error) => void
) {
  const adminDoc = doc(db, 'settings', 'admin');
  return onSnapshot(
    adminDoc,
    (snap) => {
      if (snap.exists() && snap.data().pin) {
        onPin(snap.data().pin);
      } else {
        onPin(DEFAULT_ADMIN_PIN);
      }
    },
    (err) => {
      console.error('Admin PIN subscription error:', err);
      if (onError) onError(err);
      onPin(DEFAULT_ADMIN_PIN);
    }
  );
}

// Add new resident PDAM record
export async function addPdamRecord(data: {
  nama: string;
  blok: string;
  nomor: string;
  status: StatusPemasangan;
  keterangan?: string;
}): Promise<string> {
  try {
    const colRef = collection(db, PDAM_COLLECTION);
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      nama: data.nama.trim(),
      blok: data.blok.trim(),
      nomor: data.nomor.trim(),
      status: data.status,
      keterangan: (data.keterangan || '').trim(),
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
    if (data.keterangan !== undefined) payload.keterangan = String(data.keterangan).trim();

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

// Reset database back to the 4 default records
export async function resetDatabaseToDefault(): Promise<void> {
  try {
    const colRef = collection(db, PDAM_COLLECTION);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    // Delete existing
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    // Re-seed 4 initial
    const now = new Date().toISOString();
    INITIAL_RECORDS.forEach((rec) => {
      const newRef = doc(colRef);
      batch.set(newRef, {
        nama: rec.nama,
        blok: rec.blok,
        nomor: rec.nomor,
        status: rec.status,
        keterangan: 'Data Awal Pengurus',
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
