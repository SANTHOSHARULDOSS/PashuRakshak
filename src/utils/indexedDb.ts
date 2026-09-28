import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SyncItem, Livestock, HealthReport, Alert } from '../types';

interface PashuDB extends DBSchema {
  sync_queue: {
    key: string;
    value: SyncItem;
    indexes: { 'by-status': string };
  };
  cached_animals: {
    key: string;
    value: Livestock;
  };
  cached_reports: {
    key: string;
    value: HealthReport;
  };
  cached_alerts: {
    key: string;
    value: Alert;
  };
}

const DB_NAME = 'pashurakshak_offline_store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PashuDB>> | null = null;

export function getOfflineDB() {
  if (!dbPromise) {
    dbPromise = openDB<PashuDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'localId' });
          queueStore.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('cached_animals')) {
          db.createObjectStore('cached_animals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached_reports')) {
          db.createObjectStore('cached_reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached_alerts')) {
          db.createObjectStore('cached_alerts', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Enqueue operation into offline sync queue
export async function enqueueSyncItem(item: SyncItem): Promise<void> {
  const db = await getOfflineDB();
  await db.put('sync_queue', item);
}

// Get all pending sync items
export async function getSyncQueue(): Promise<SyncItem[]> {
  const db = await getOfflineDB();
  return await db.getAll('sync_queue');
}

// Remove item after successful sync
export async function removeSyncItem(localId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete('sync_queue', localId);
}

// Clear all queue
export async function clearSyncQueue(): Promise<void> {
  const db = await getOfflineDB();
  await db.clear('sync_queue');
}

// Cache Animals locally
export async function cacheAnimals(animals: Livestock[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction('cached_animals', 'readwrite');
  for (const animal of animals) {
    await tx.store.put(animal);
  }
  await tx.done;
}

// Get Cached Animals
export async function getCachedAnimals(): Promise<Livestock[]> {
  const db = await getOfflineDB();
  return await db.getAll('cached_animals');
}

// Cache Reports locally
export async function cacheReports(reports: HealthReport[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction('cached_reports', 'readwrite');
  for (const rep of reports) {
    await tx.store.put(rep);
  }
  await tx.done;
}

// Get Cached Reports
export async function getCachedReports(): Promise<HealthReport[]> {
  const db = await getOfflineDB();
  return await db.getAll('cached_reports');
}

// Save Offline Report immediately for instant optimistic UI
export async function saveOfflineReport(payload: any, localId: string, animal: Livestock): Promise<HealthReport> {
  const db = await getOfflineDB();

  const tempReport: HealthReport = {
    id: localId,
    local_id: localId,
    animal_id: payload.animal_id,
    ear_tag_id: animal.ear_tag_id,
    species: animal.species,
    breed: animal.breed,
    reporter_id: payload.reporter_id || 'local_user',
    symptoms: payload.symptoms || [],
    severity: payload.severity || 'MEDIUM',
    temperature_f: payload.temperature_f ? Number(payload.temperature_f) : undefined,
    photo_url: payload.photo_url || null,
    audio_url: payload.audio_url || null,
    latitude: payload.latitude || animal.latitude || 18.8247,
    longitude: payload.longitude || animal.longitude || 74.3412,
    village: payload.village || animal.village || 'Nighoj',
    taluka: payload.taluka || animal.taluka || 'Shirur',
    district: payload.district || animal.district || 'Pune',
    status: 'OPEN',
    sync_status: 'PENDING',
    created_at: new Date().toISOString(),
    risk_score: payload.symptoms?.includes('Skin lesions') ? 78 : 52,
    risk_level: payload.severity === 'HIGH' || payload.severity === 'CRITICAL' ? 'HIGH' : 'MODERATE',
    primary_suspected_disease: payload.symptoms?.includes('Skin lesions') ? 'Lumpy Skin Disease (LSD)' : 'General Livestock Distress'
  };

  // 1. Put in cached_reports
  await db.put('cached_reports', tempReport);

  // 2. Put in sync_queue
  await enqueueSyncItem({
    localId,
    operation: 'CREATE_REPORT',
    payload: { ...payload, local_id: localId },
    clientVersion: 1,
    timestamp: tempReport.created_at,
    status: 'PENDING'
  });

  return tempReport;
}
