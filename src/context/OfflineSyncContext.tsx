import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSyncQueue, removeSyncItem, clearSyncQueue } from '../utils/indexedDb';
import { api } from '../api/client';
import { SyncItem, SyncConflict } from '../types';

interface OfflineSyncContextType {
  isOnline: boolean;
  syncStatus: 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'CONFLICT';
  pendingCount: number;
  unresolvedConflicts: SyncConflict[];
  triggerSync: () => Promise<void>;
  resolveConflict: (conflictId: string, strategy: 'SERVER_WINS' | 'LOCAL_WINS' | 'MERGED') => Promise<void>;
  lastSyncedTime: string | null;
  toggleSimulatedOffline: () => void;
  isSimulatedOffline: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'CONFLICT'>('ONLINE');
  const [unresolvedConflicts, setUnresolvedConflicts] = useState<SyncConflict[]>([]);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(new Date().toLocaleTimeString());

  // Check queue count
  const refreshQueueCount = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    } catch (e) {
      console.warn('Could not read sync queue:', e);
    }
  }, []);

  // Perform Synchronization
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSimulatedOffline) {
      setSyncStatus('OFFLINE');
      return;
    }

    setSyncStatus('SYNCING');
    try {
      const queue = await getSyncQueue();
      if (queue.length === 0) {
        setSyncStatus('SYNCED');
        return;
      }

      const res = await api.sync.syncBatch(queue);
      if (res.success) {
        // Remove successfully synced items from IndexedDB
        for (const item of res.results.synced) {
          await removeSyncItem(item.localId);
        }

        // Handle any conflicts
        if (res.results.conflicts && res.results.conflicts.length > 0) {
          setSyncStatus('CONFLICT');
          const conflictList = await api.sync.getConflicts();
          setUnresolvedConflicts(conflictList.data || []);
        } else {
          setSyncStatus('SYNCED');
        }

        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[Sync Error]', err);
      setSyncStatus('OFFLINE');
    } finally {
      await refreshQueueCount();
    }
  }, [isSimulatedOffline, refreshQueueCount]);

  const resolveConflict = async (conflictId: string, strategy: 'SERVER_WINS' | 'LOCAL_WINS' | 'MERGED') => {
    try {
      await api.sync.resolveConflict(conflictId, strategy);
      const conflictList = await api.sync.getConflicts();
      setUnresolvedConflicts(conflictList.data || []);
      if ((conflictList.data || []).length === 0) {
        setSyncStatus('SYNCED');
      }
    } catch (e) {
      console.error('Failed to resolve conflict:', e);
    }
  };

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => {
      const nextState = !prev;
      if (nextState) {
        setSyncStatus('OFFLINE');
      } else {
        setSyncStatus('ONLINE');
        setTimeout(() => triggerSync(), 300);
      }
      return nextState;
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      if (!isSimulatedOffline) {
        setIsOnline(true);
        setSyncStatus('ONLINE');
        triggerSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, triggerSync, refreshQueueCount]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline: isOnline && !isSimulatedOffline,
        syncStatus,
        pendingCount,
        unresolvedConflicts,
        triggerSync,
        resolveConflict,
        lastSyncedTime,
        toggleSimulatedOffline,
        isSimulatedOffline
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return context;
};
