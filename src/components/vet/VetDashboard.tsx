import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  FlaskConical,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Calendar
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface VetDashboardProps {
  onSelectCase: (caseId: string) => void;
  onOpenReportModal: () => void;
}

export const VetDashboard: React.FC<VetDashboardProps> = ({
  onSelectCase,
  onOpenReportModal
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        search: searchTerm || undefined
      });
      if (res.success) {
        setReports(res.data);
      }
    } catch (e) {
      console.warn('Failed to load vet cases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, severityFilter, searchTerm]);

  // Metrics
  const criticalCases = reports.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH');
  const pendingExam = reports.filter(r => r.status === 'OPEN' || r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW');
  const labPending = reports.filter(r => r.status === 'SAMPLE_REQUIRED' || r.status === 'LAB_PENDING');
  const resolved = reports.filter(r => r.status === 'RESOLVED');

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Vet Jurisdiction Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white shadow-xl border border-gov-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Field Veterinary Triage Unit — {user?.taluka || 'Shirur'} Taluka, {user?.district || 'Pune'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Veterinary Clinical Triage & Case Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Prioritize high-risk notifications, conduct clinical examinations, dispatch laboratory samples, and enforce quarantine containment.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition flex-shrink-0"
        >
          <span>+ Report New Field Case</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSeverityFilter('CRITICAL')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm cursor-pointer hover:border-rose-400 transition flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority High-Risk</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{criticalCases.length}</div>
            <div className="text-[10px] text-rose-500 font-medium">Requires immediate visit</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('OPEN')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-gov-400 transition flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Exam</div>
            <div className="text-2xl font-black text-gov-700 dark:text-gov-300 mt-1">{pendingExam.length}</div>
            <div className="text-[10px] text-slate-400">Awaiting clinical review</div>
          </div>
          <div className="p-3 bg-gov-50 dark:bg-gov-950 text-gov-700 dark:text-gov-300 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('LAB_PENDING')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-teal-400 transition flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lab Referrals</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{labPending.length}</div>
            <div className="text-[10px] text-teal-500 font-medium">PCR / ELISA pending</div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 rounded-xl">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-400 transition flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cases Resolved</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{resolved.length}</div>
            <div className="text-[10px] text-emerald-500 font-medium">Fully recovered</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ear Tag, Farmer Name, Village, or Disease..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-gov-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Statuses (सर्व स्थिती)</option>
          <option value="OPEN">Reported (नवीन नोंद)</option>
          <option value="SAMPLE_REQUIRED">Sample Required (नमुना आवश्यक)</option>
          <option value="LAB_PENDING">Lab Analysis Pending (प्रयोगशाळा प्रलंबित)</option>
          <option value="DIAGNOSIS_AVAILABLE">Diagnosis Available (निदान उपलब्ध)</option>
          <option value="TREATMENT_STARTED">Treatment Active (उपचार सुरू)</option>
          <option value="RESOLVED">Resolved (बरे झाले)</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical (अतिगंभीर)</option>
          <option value="HIGH">High (उच्च)</option>
          <option value="MEDIUM">Medium (मध्यम)</option>
          <option value="LOW">Low (कमी)</option>
        </select>
      </div>

      {/* Cases Table / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading cases queue...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            No health cases found matching current filters.
          </div>
        ) : (
          reports.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => onSelectCase(caseItem.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-gov-400 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={caseItem.photo_url || '/logo.svg'}
                    alt={caseItem.breed || 'Livestock'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {caseItem.primary_suspected_disease || 'Suspected Livestock Disease'}
                    </h3>
                    <StatusBadge status={caseItem.status} size="sm" />
                    <StatusBadge status={caseItem.severity} size="sm" />
                    {caseItem.risk_score && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[11px] font-bold">
                        AI Score: {caseItem.risk_score}/100
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Ear Tag: <strong className="text-slate-800 dark:text-slate-200">{caseItem.ear_tag_id}</strong> ({caseItem.breed} {caseItem.species})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {caseItem.village}, {caseItem.taluka}
                    </span>
                    <span>•</span>
                    <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{caseItem.reporter_name}</strong> ({caseItem.reporter_phone})</span>
                  </div>

                  {/* Symptoms pill badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {caseItem.symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {t(`symptoms.${s}`, s)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action side */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Reported</div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(caseItem.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(caseItem.id);
                  }}
                  className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 md:mt-2"
                >
                  <span>Examine Case</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
