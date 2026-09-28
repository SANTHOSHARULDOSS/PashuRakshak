import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { api } from '../../api/client';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entityFilter, setEntityFilter] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.audit.list({
        entity: entityFilter || undefined
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white shadow-xl border border-gov-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Statutory Compliance & Security Log</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          System Operational Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Immutable logging of clinical updates, lab result certifications, containment declarations, and offline synchronizations.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Showing <strong>{logs.length}</strong> recorded audit events
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Entities (सर्व नोंदी)</option>
          <option value="HealthReport">Health Reports</option>
          <option value="LabSample">Lab Samples</option>
          <option value="Livestock">Livestock</option>
          <option value="Outbreak">Outbreak Containment</option>
          <option value="SyncQueue">Offline Sync Batches</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details / Delta</th>
                <th className="py-3 px-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-slate-500 font-sans text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold font-sans text-slate-900 dark:text-white whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gov-100 text-gov-800 dark:bg-gov-950 dark:text-gov-300 font-bold text-[10px]">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gov-700 dark:text-gov-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-sans">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.new_value || log.prev_value || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
