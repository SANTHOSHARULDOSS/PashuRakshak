import React, { useState, useEffect } from 'react';
import { Syringe, Plus, Search, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { Vaccination, VaccinationCampaign } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { VaccinationCampaignModal } from '../admin/VaccinationCampaignModal';

export const VaccinationsView: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [records, setRecords] = useState<Vaccination[]>([]);
  const [campaigns, setCampaigns] = useState<VaccinationCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vaxRes, cmpRes] = await Promise.all([
        api.vaccinations.list(),
        api.vaccinations.campaigns()
      ]);

      if (vaxRes.success) setRecords(vaxRes.data);
      if (cmpRes.success) setCampaigns(cmpRes.data);
    } catch (e) {
      console.warn('Failed to load vaccinations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-gov-900 to-gov-950 text-white shadow-xl border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-2">
            <Syringe className="w-3.5 h-3.5" />
            <span>National Animal Disease Control Programme (NADCP)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Livestock Immunization & Vaccination Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track booster due dates, emergency ring vaccination drives against Lumpy Skin Disease & FMD, and vaccine batch verification.
          </p>
        </div>

        {['DISTRICT_ADMIN', 'STATE_ADMIN', 'FIELD_VET'].includes(user?.role || '') && (
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Vaccination Drive</span>
          </button>
        )}
      </div>

      {/* Active Campaigns Carousel / Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Active State & District Immunization Campaigns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((cmp) => {
            const pct = Math.min(100, Math.round((cmp.achieved_count / cmp.target_count) * 100));
            return (
              <div
                key={cmp.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                      {cmp.district}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {cmp.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Target Pathogen: <strong>{cmp.disease_target}</strong></p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                    {pct}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Administered: <strong className="text-slate-700 dark:text-slate-300">{cmp.achieved_count.toLocaleString()}</strong></span>
                    <span>Target: {cmp.target_count.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Timeline: {cmp.start_date} to {cmp.end_date}</span>
                  <span className="font-semibold text-gov-700 dark:text-gov-400">Active Field Teams</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Administered Vaccinations Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Individual Livestock Vaccination Registry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Ear Tag ID</th>
                <th className="py-3 px-4">Vaccine Name</th>
                <th className="py-3 px-4">Batch No</th>
                <th className="py-3 px-4">Administered Date</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Administered By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading vaccine records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No vaccination records found.</td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {row.ear_tag_id || row.animal_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {row.vaccine_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {row.batch_no}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.administered_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {row.next_due_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.administered_by}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCampaignModalOpen && (
        <VaccinationCampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          onSuccess={() => {
            setIsCampaignModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
