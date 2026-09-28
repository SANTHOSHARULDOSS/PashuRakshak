import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ShieldAlert,
  Megaphone,
  Syringe,
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthReport, Outbreak } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface DistrictAdminDashboardProps {
  onSelectCase: (caseId: string) => void;
  onOpenReportModal: () => void;
  onNavigateToOutbreaks: () => void;
}

export const DistrictAdminDashboard: React.FC<DistrictAdminDashboardProps> = ({
  onSelectCase,
  onOpenReportModal,
  onNavigateToOutbreaks
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [talukaFilter, setTalukaFilter] = useState<string>('');
  const [advisoryText, setAdvisoryText] = useState<string>('');
  const [advisorySent, setAdvisorySent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const district = user?.district || 'Pune';

  const talukas = district === 'Pune'
    ? ['All Talukas', 'Shirur', 'Haveli', 'Khed', 'Baramati', 'Daund', 'Junnar', 'Ambegaon', 'Maval', 'Mulshi']
    : ['All Talukas', 'Parner', 'Sangamner', 'Rahata', 'Shrirampur', 'Nagar', 'Kopargaon'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, outbreaksRes] = await Promise.all([
        api.reports.list({
          district,
          taluka: talukaFilter && talukaFilter !== 'All Talukas' ? talukaFilter : undefined
        }),
        api.outbreaks.list({ district })
      ]);

      if (reportsRes.success) setReports(reportsRes.data);
      if (outbreaksRes.success) setOutbreaks(outbreaksRes.data);
    } catch (e) {
      console.warn('Failed to load district data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [talukaFilter, district]);

  const handleBroadcastAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryText) return;

    try {
      await api.alerts.broadcast({
        title: `जिल्हा सतर्कता सूचना: ${district} (${talukaFilter || 'सर्व तालुके'})`,
        message: advisoryText,
        severity: 'CRITICAL',
        target_role: 'FARMER',
        target_district: district,
        target_taluka: talukaFilter && talukaFilter !== 'All Talukas' ? talukaFilter : undefined
      });

      setAdvisorySent(true);
      setAdvisoryText('');
      setTimeout(() => setAdvisorySent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white shadow-xl border border-gov-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>District Animal Husbandry Command — {district} District</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            District Disease Surveillance & Containment Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Oversee taluka veterinary aid polyclinics, rapid containment taskforces, and emergency livestock health broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToOutbreaks}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Manage Outbreak Zones</span>
          </button>
        </div>
      </div>

      {/* Outbreak Alert Banner if active in district */}
      {outbreaks.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/20 rounded-xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase">
                Active Outbreak Cluster Alert
              </span>
              <h3 className="text-base font-extrabold mt-0.5">
                {outbreaks[0].disease} — {outbreaks[0].epicenter_village}, {outbreaks[0].taluka}
              </h3>
              <p className="text-xs text-rose-100">
                {outbreaks[0].active_cases_count} active cases | Containment radius: {outbreaks[0].radius_km} km | Taskforce: {outbreaks[0].assigned_rapid_response_team}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToOutbreaks}
            className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-sm hover:bg-rose-50 transition active:scale-95 flex-shrink-0"
          >
            View Containment Zone →
          </button>
        </div>
      )}

      {/* Taluka Filter & Quick Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cases in District */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Taluka Case Feed ({reports.length})
              </h3>
              <p className="text-xs text-slate-500">Live surveillance reports from field veterinarians</p>
            </div>

            <select
              value={talukaFilter}
              onChange={(e) => setTalukaFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-gov-500 outline-none"
            >
              {talukas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading taluka cases...</div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
                No active disease reports in {talukaFilter || 'this district'}.
              </div>
            ) : (
              reports.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => onSelectCase(caseItem.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-gov-400 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {caseItem.primary_suspected_disease || 'Suspected Health Issue'}
                      </h4>
                      <StatusBadge status={caseItem.status} size="sm" />
                      <StatusBadge status={caseItem.severity} size="sm" />
                    </div>
                    <div className="text-xs text-slate-500">
                      Tag: <strong className="font-mono text-slate-800 dark:text-slate-200">{caseItem.ear_tag_id}</strong> ({caseItem.breed} {caseItem.species}) | {caseItem.village}, {caseItem.taluka}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-xs font-bold text-gov-700 dark:text-gov-400">
                      Inspect →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Instant Farmer Advisory Broadcaster */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-saffron-100 dark:bg-saffron-950 text-saffron-800 dark:text-saffron-300 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Emergency Farmer Advisory
              </h3>
              <p className="text-xs text-slate-500">Instant SMS & In-App broadcast</p>
            </div>
          </div>

          {advisorySent && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Advisory broadcast sent to all registered livestock owners in {district}!</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAdvisory} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Advisory Message (मराठी किंवा इंग्रजी) *
              </label>
              <textarea
                rows={4}
                required
                value={advisoryText}
                onChange={(e) => setAdvisoryText(e.target.value)}
                placeholder="उदा. शिरूर तालुक्यातील शेतकरी बांधवांना आवाहन: लम्पी त्वचा रोगाचा संसर्ग टाळण्यासाठी गोठ्यात डास प्रतिबंधक फवारणी करावी..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-saffron-500 outline-none"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              Target: All livestock owners in <strong>{talukaFilter || district}</strong>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Send Emergency Advisory</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
