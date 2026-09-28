import React from 'react';
import { AlertTriangle, Check, ShieldAlert, ArrowRight } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export const ConflictResolutionModal: React.FC = () => {
  const { unresolvedConflicts, resolveConflict } = useOfflineSync();

  if (!unresolvedConflicts || unresolvedConflicts.length === 0) return null;

  const currentConflict = unresolvedConflicts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-amber-500 text-white flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base">Offline Sync Conflict Detected</h3>
            <p className="text-xs text-amber-100">
              Record was modified on the server while you were offline. Choose how to merge.
            </p>
          </div>
        </div>

        {/* Content Diff */}
        <div className="p-6 space-y-6">
          <div className="text-xs text-slate-500">
            Entity: <strong className="text-slate-800 dark:text-slate-200">{currentConflict.entity_type}</strong> | ID: <code>{currentConflict.entity_id}</code>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Server Version */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-gov-700 dark:text-gov-400 uppercase tracking-wider block mb-2">
                Server Version (v{currentConflict.server_version})
              </span>
              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                {JSON.stringify(currentConflict.server_payload, null, 2)}
              </pre>
            </div>

            {/* Local Offline Version */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-2">
                Your Offline Edit (v{currentConflict.local_version})
              </span>
              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                {JSON.stringify(currentConflict.local_payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => resolveConflict(currentConflict.id, 'SERVER_WINS')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Keep Server Version
            </button>
            <button
              onClick={() => resolveConflict(currentConflict.id, 'LOCAL_WINS')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Overwrite with Local Version
            </button>
            <button
              onClick={() => resolveConflict(currentConflict.id, 'MERGED')}
              className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Merge Changes (Recommended)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
