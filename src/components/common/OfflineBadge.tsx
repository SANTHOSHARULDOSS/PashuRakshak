import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { useLanguage } from '../../context/LanguageContext';

export const OfflineBadge: React.FC = () => {
  const { isOnline, syncStatus, pendingCount, triggerSync, toggleSimulatedOffline, isSimulatedOffline } = useOfflineSync();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {/* Network Status Badge */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          syncStatus === 'SYNCING'
            ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800'
            : syncStatus === 'CONFLICT'
            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
            : isOnline
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 animate-pulse'
        }`}
      >
        {syncStatus === 'SYNCING' ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : syncStatus === 'CONFLICT' ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        ) : isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        )}

        <span>
          {syncStatus === 'SYNCING'
            ? t('offline.syncing')
            : syncStatus === 'CONFLICT'
            ? t('offline.conflictAlert')
            : isOnline
            ? t('offline.online')
            : t('offline.offline')}
        </span>

        {pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Manual Sync Button if pending items */}
      {pendingCount > 0 && isOnline && (
        <button
          onClick={() => triggerSync()}
          disabled={syncStatus === 'SYNCING'}
          className="flex items-center gap-1 px-2.5 py-1 bg-gov-700 hover:bg-gov-800 text-white rounded-md text-xs font-medium shadow-sm transition active:scale-95 disabled:opacity-50"
          title="Synchronize offline queue now"
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>{t('offline.syncNow')}</span>
        </button>
      )}

      {/* Simulator Toggle for judges & demonstration */}
      <button
        onClick={toggleSimulatedOffline}
        className={`px-2 py-1 text-[11px] rounded border font-medium transition ${
          isSimulatedOffline
            ? 'bg-rose-600 text-white border-rose-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
        }`}
        title="Toggle simulated network disconnection to test offline reporting & queueing"
      >
        {isSimulatedOffline ? '🔴 Simulating Offline' : '📶 Test Offline'}
      </button>
    </div>
  );
};
