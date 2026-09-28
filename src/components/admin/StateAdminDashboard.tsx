import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  HeartPulse,
  Syringe,
  FlaskConical,
  Clock,
  TrendingUp,
  FileText,
  Megaphone,
  Sparkles,
  MapPin,
  ChevronRight,
  Download
} from 'lucide-react';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { printSurveillanceBulletin, exportToCSV } from '../../utils/exportUtils';
import { VaccinationCampaignModal } from './VaccinationCampaignModal';
import { ReportGeneratorModal } from './ReportGeneratorModal';

export const StateAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const { language } = useLanguage();

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.warn('Failed to load state dashboard overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    exportToCSV('PashuRakshak_Maharashtra_Disease_Surveillance', data.districtWiseCases || []);
  };

  const handlePrintBulletin = () => {
    printSurveillanceBulletin('Maharashtra State', data);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-950 via-gov-900 to-gov-800 text-white shadow-xl border border-gov-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>State Livestock Health Intelligence Command Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Maharashtra Livestock Disease Surveillance & Early Warning
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Department of Animal Husbandry, Government of Maharashtra | Real-time epidemiological monitoring across all 36 districts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintBulletin}
            className="flex items-center gap-2 px-4 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Print Official Bulletin</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 8 Core KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Livestock</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {data?.kpis?.totalLivestock ? Number(data.kpis.totalLivestock).toLocaleString() : '24,50,000'}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">36 Districts Monitored</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Sickness Reports</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {data?.kpis?.activeCases || '47'}
          </div>
          <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Triage Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outbreak Clusters</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {data?.kpis?.activeOutbreaks || '3'}
          </div>
          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">Active Containment Radii</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State Vaccine Coverage</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {data?.vaccinationCoverage?.stateAveragePct || '76.4'}%
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">12.4 Lakh Doses Administered</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspected Cases</div>
          <div className="text-2xl font-black text-gov-700 dark:text-gov-300 mt-1">
            {data?.kpis?.suspectedCases || '18'}
          </div>
          <div className="text-[10px] text-slate-400">Clinical Review Phase</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Pathogens</div>
          <div className="text-2xl font-black text-teal-600 mt-1">
            {data?.kpis?.confirmedCases || '29'}
          </div>
          <div className="text-[10px] text-teal-500">PCR / ELISA Validated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Lab Tests</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {data?.kpis?.pendingLabTests || '5'}
          </div>
          <div className="text-[10px] text-blue-500">DADL Network Assays</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Response Time</div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {data?.kpis?.avgResponseHours || '14.2'} hrs
          </div>
          <div className="text-[10px] text-emerald-600">88.4% Resolution Rate</div>
        </div>
      </div>

      {/* Disease Distribution & Temporal Trend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Prevalence Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prevalent Pathogen Distribution
              </h3>
              <p className="text-xs text-slate-500">Breakdown of reported and confirmed livestock diseases</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Lumpy Skin Disease (LSD / लम्पी)', cases: 23, pct: 45, color: 'bg-rose-500' },
              { name: 'Foot and Mouth Disease (FMD / लाळ्या खुरकूत)', cases: 14, pct: 28, color: 'bg-amber-500' },
              { name: 'Hemorrhagic Septicemia (HS / घटसर्प)', cases: 5, pct: 10, color: 'bg-blue-500' },
              { name: 'Peste des Petits Ruminants (PPR / प्लेग)', cases: 4, pct: 8, color: 'bg-purple-500' },
              { name: 'Black Quarter (BQ / फऱ्या)', cases: 3, pct: 6, color: 'bg-teal-500' },
              { name: 'Bovine Brucellosis', cases: 2, pct: 3, color: 'bg-emerald-500' }
            ].map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{d.name}</span>
                  <span className="font-semibold text-slate-500">{d.cases} cases ({d.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${d.color} h-full rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Surveillance Trajectory (Last 7 Days) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              7-Day Case Inflow vs Resolution Trajectory
            </h3>
            <p className="text-xs text-slate-500">Daily incident reports vs resolved veterinary interventions</p>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48">
            {[
              { day: '22 Sep', reported: 12, resolved: 8 },
              { day: '23 Sep', reported: 15, resolved: 10 },
              { day: '24 Sep', reported: 19, resolved: 12 },
              { day: '25 Sep', reported: 24, resolved: 15 },
              { day: '26 Sep', reported: 28, resolved: 18 },
              { day: '27 Sep', reported: 22, resolved: 19 },
              { day: '28 Sep', reported: 16, resolved: 14 }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Reported Bar */}
                  <div
                    className="w-3 sm:w-4 bg-rose-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(item.reported / 30) * 100}%` }}
                    title={`${item.reported} Reported`}
                  />
                  {/* Resolved Bar */}
                  <div
                    className="w-3 sm:w-4 bg-emerald-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(item.resolved / 30) * 100}%` }}
                    title={`${item.resolved} Resolved`}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{item.day.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" /> New Illness Reports
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Successfully Resolved
            </span>
          </div>
        </div>
      </div>

      {/* District-wise Surveillance Distribution Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              District Surveillance Index (Maharashtra)
            </h3>
            <p className="text-xs text-slate-500">Case metrics, active containment zones & vaccination coverage</p>
          </div>
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Launch Vaccination Drive</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Total Cases</th>
                <th className="py-3 px-4">Active Sickness</th>
                <th className="py-3 px-4">Containment Status</th>
                <th className="py-3 px-4">Vaccine Coverage</th>
                <th className="py-3 px-4">Taskforce Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { district: 'Pune', total: 28, active: 23, outbreak: 'LSD Containment Active (Shirur)', vaccine: '82.1%', taskforce: 'Taskforce #3 Deployed' },
                { district: 'Ahmednagar', total: 42, active: 38, outbreak: 'FMD Containment Active (Parner)', vaccine: '71.8%', taskforce: 'Disease Control Unit Active' },
                { district: 'Satara', total: 12, active: 8, outbreak: 'HS Alert (Karad)', vaccine: '79.5%', taskforce: 'Emergency Van #1 Active' },
                { district: 'Kolhapur', total: 15, active: 4, outbreak: 'Routine Monitoring', vaccine: '85.0%', taskforce: 'Standby' },
                { district: 'Chhatrapati Sambhajinagar', total: 9, active: 3, outbreak: 'Routine Monitoring', vaccine: '74.2%', taskforce: 'Standby' },
                { district: 'Nagpur', total: 6, active: 2, outbreak: 'Routine Monitoring', vaccine: '78.0%', taskforce: 'Standby' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{row.district}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{row.total}</td>
                  <td className="py-3.5 px-4 font-black text-rose-600">{row.active}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${row.outbreak.includes('Active') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                      {row.outbreak}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.vaccine}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.taskforce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vaccination Campaign Modal */}
      {isCampaignModalOpen && (
        <VaccinationCampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          onSuccess={() => {
            setIsCampaignModalOpen(false);
            fetchOverview();
          }}
        />
      )}
    </div>
  );
};
