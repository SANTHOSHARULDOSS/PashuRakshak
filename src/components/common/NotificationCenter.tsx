import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, ShieldAlert, Syringe, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { Alert } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, onSelectCase }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useLanguage();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.alerts.list();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (e) {
      console.warn('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await api.alerts.markRead(id);
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_read: 1 } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string, severity: string) => {
    if (severity === 'CRITICAL') return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    if (type.includes('VACCINATION')) return <Syringe className="w-5 h-5 text-blue-600" />;
    if (type.includes('LAB')) return <FileText className="w-5 h-5 text-teal-600" />;
    return <AlertTriangle className="w-5 h-5 text-amber-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gov-100 dark:bg-gov-950 text-gov-800 dark:text-gov-300 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Disease Alerts & Notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time surveillance updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-medium">No active disease alerts in your area</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.is_read
                      ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-80'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900'
                      : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(alert.alert_type, alert.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {alert.title}
                        </h4>
                        {!alert.is_read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                        <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-2">
                          {alert.related_report_id && onSelectCase && (
                            <button
                              onClick={() => {
                                onSelectCase(alert.related_report_id!);
                                onClose();
                              }}
                              className="text-gov-700 dark:text-gov-400 font-semibold hover:underline"
                            >
                              View Case →
                            </button>
                          )}
                          {!alert.is_read && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-white"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
