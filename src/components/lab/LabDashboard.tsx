import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
  Plus,
  Play,
  TestTube2
} from 'lucide-react';
import { api } from '../../api/client';
import { LabSample } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { SampleTestModal } from './SampleTestModal';

export const LabDashboard: React.FC = () => {
  const [samples, setSamples] = useState<LabSample[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSample, setActiveSample] = useState<LabSample | null>(null);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await api.lab.listSamples({
        status: statusFilter || undefined,
        search: searchTerm || undefined
      });
      if (res.success) {
        setSamples(res.data);
      }
    } catch (e) {
      console.warn('Failed to load lab samples:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [statusFilter, searchTerm]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.lab.updateStatus(id, newStatus);
      fetchSamples();
    } catch (e) {
      console.error(e);
    }
  };

  const incomingCount = samples.filter(s => s.status === 'DISPATCHED' || s.status === 'COLLECTED').length;
  const testingCount = samples.filter(s => s.status === 'LAB_RECEIVED' || s.status === 'TESTING').length;
  const positiveCount = samples.filter(s => s.result === 'POSITIVE').length;
  const completedCount = samples.filter(s => s.status === 'RESULT_AVAILABLE' || s.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-gov-950 text-white shadow-xl border border-teal-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>District Animal Disease Diagnostic Laboratory (DADL), Pune</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          Diagnostic Pathology & Molecular Assay Workflow
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
          Real-time Capripoxvirus PCR, FMD ELISA, Anthrax microscopy, and bacterial culture testing.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incoming Samples</div>
            <div className="text-2xl font-black text-gov-700 dark:text-gov-300 mt-1">{incomingCount}</div>
            <div className="text-[10px] text-slate-400">Cold-chain transit</div>
          </div>
          <div className="p-3 bg-gov-50 dark:bg-gov-950 text-gov-700 dark:text-gov-300 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In-Testing Assay</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{testingCount}</div>
            <div className="text-[10px] text-teal-500 font-medium">PCR / ELISA Running</div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-xl">
            <TestTube2 className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pathogen Positive</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{positiveCount}</div>
            <div className="text-[10px] text-rose-500 font-medium">Outbreak suspect alerts</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Reports</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</div>
            <div className="text-[10px] text-emerald-500 font-medium">Synced with field vets</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Sample Code (e.g. LAB-PUN-2026-089), Ear Tag, or Disease..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option value="">All Lifecycle Stages</option>
          <option value="DISPATCHED">Dispatched from Field</option>
          <option value="LAB_RECEIVED">Received at Lab</option>
          <option value="TESTING">Testing / Extraction</option>
          <option value="RESULT_AVAILABLE">Result Available</option>
        </select>
      </div>

      {/* Samples Queue */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading diagnostic samples...</div>
        ) : samples.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            No diagnostic samples found matching current filter.
          </div>
        ) : (
          samples.map((sample) => (
            <div
              key={sample.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-teal-700 dark:text-teal-400">
                    {sample.sample_code}
                  </span>
                  <StatusBadge status={sample.status} size="sm" />
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      sample.result === 'POSITIVE'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : sample.result === 'NEGATIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Result: {sample.result}
                  </span>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                  Suspected: {sample.disease_suspected} | Specimen: {sample.sample_type}
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                  <span>Ear Tag: <strong className="font-mono">{sample.ear_tag_id}</strong></span>
                  <span>•</span>
                  <span>Test: <strong>{sample.test_type}</strong></span>
                  <span>•</span>
                  <span>Collected by: {sample.collected_by}</span>
                </div>

                {sample.test_notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1">
                    "{sample.test_notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons based on lifecycle */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                {sample.status === 'DISPATCHED' && (
                  <button
                    onClick={() => handleUpdateStatus(sample.id, 'LAB_RECEIVED')}
                    className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                  >
                    Mark Sample Received
                  </button>
                )}

                {sample.status === 'LAB_RECEIVED' && (
                  <button
                    onClick={() => handleUpdateStatus(sample.id, 'TESTING')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                  >
                    Begin PCR / Assay
                  </button>
                )}

                {(sample.status === 'TESTING' || sample.status === 'LAB_RECEIVED') && (
                  <button
                    onClick={() => setActiveSample(sample)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                  >
                    Record Diagnostic Result
                  </button>
                )}

                {sample.status === 'RESULT_AVAILABLE' && (
                  <button
                    onClick={() => setActiveSample(sample)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    Edit / Re-validate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Result Entry Modal */}
      {activeSample && (
        <SampleTestModal
          isOpen={!!activeSample}
          onClose={() => setActiveSample(null)}
          sample={activeSample}
          onSuccess={() => {
            setActiveSample(null);
            fetchSamples();
          }}
        />
      )}
    </div>
  );
};
