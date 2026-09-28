import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Plus,
  Check,
  RefreshCw,
  AlertTriangle,
  Megaphone,
  Syringe,
  Users,
  Activity
} from 'lucide-react';
import { api } from '../../api/client';
import { Outbreak } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

export const OutbreakManager: React.FC = () => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeclareModal, setShowDeclareModal] = useState<boolean>(false);

  // Form State
  const [disease, setDisease] = useState<string>('Lumpy Skin Disease (LSD)');
  const [district, setDistrict] = useState<string>('Pune');
  const [taluka, setTaluka] = useState<string>('Shirur');
  const [epicenterVillage, setEpicenterVillage] = useState<string>('Nighoj');
  const [radiusKm, setRadiusKm] = useState<number>(8.5);
  const [taskforce, setTaskforce] = useState<string>('Pune Rapid Veterinary Taskforce #3');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { language } = useLanguage();

  const fetchOutbreaks = async () => {
    try {
      setLoading(true);
      const res = await api.outbreaks.list();
      if (res.success) {
        setOutbreaks(res.data);
      }
    } catch (e) {
      console.warn('Failed to load outbreaks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbreaks();
  }, []);

  const handleDeclareOutbreak = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.outbreaks.create({
        disease,
        district,
        taluka,
        epicenter_village: epicenterVillage,
        radius_km: Number(radiusKm),
        assigned_rapid_response_team: taskforce,
        center_lat: district === 'Pune' ? 18.8247 : 18.9812,
        center_lng: district === 'Pune' ? 74.3412 : 74.4124
      });

      setShowDeclareModal(false);
      fetchOutbreaks();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to declare outbreak containment zone.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-gov-950 text-white shadow-xl border border-rose-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Spatiotemporal Outbreak Containment Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Livestock Disease Outbreaks & Containment Zones
          </h2>
          <p className="text-xs sm:text-sm text-rose-200 mt-1 max-w-xl">
            Declare containment boundaries, enforce animal movement bans, deploy mobile rapid response taskforces, and initiate ring vaccination.
          </p>
        </div>

        <button
          onClick={() => setShowDeclareModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 active:scale-95 transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Declare Containment Zone</span>
        </button>
      </div>

      {/* Outbreak List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading outbreak clusters...</div>
        ) : outbreaks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
            No active outbreak clusters detected.
          </div>
        ) : (
          outbreaks.map((cluster) => (
            <div
              key={cluster.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-rose-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-2xl">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cluster.disease}
                      </h3>
                      <StatusBadge status={cluster.risk_level} size="sm" />
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {cluster.containment_zone_active ? 'Containment Active' : 'Zone Lifted'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Code: {cluster.outbreak_code} | Epicenter: <strong>{cluster.epicenter_village}</strong>, {cluster.taluka} ({cluster.district})
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Detected on {cluster.detected_date}
                </div>
              </div>

              {/* Cluster Operational Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Cases</span>
                  <span className="text-lg font-black text-rose-600">{cluster.active_cases_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Containment Radius</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">{cluster.radius_km} km</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Affected Villages</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">{cluster.affected_villages_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mortality Count</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">{cluster.mortality_count}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gov-600 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Deployed Unit: <strong>{cluster.assigned_rapid_response_team}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                    ✓ Ring Vaccination Active
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold">
                    ✓ Cattle Market Suspended
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Declare Outbreak Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="p-5 bg-gradient-to-r from-rose-700 to-rose-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-base">Declare Containment Zone</h3>
                  <p className="text-xs text-rose-100">Statutory Epidemiological Quarantine</p>
                </div>
              </div>
              <button onClick={() => setShowDeclareModal(false)} className="p-1 rounded-lg text-rose-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleDeclareOutbreak} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Outbreak Pathogen *
                </label>
                <input
                  type="text"
                  required
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Ahmednagar">Ahmednagar</option>
                    <option value="Satara">Satara</option>
                    <option value="Kolhapur">Kolhapur</option>
                    <option value="Solapur">Solapur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Taluka *
                  </label>
                  <input
                    type="text"
                    required
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Epicenter Village *
                </label>
                <input
                  type="text"
                  required
                  value={epicenterVillage}
                  onChange={(e) => setEpicenterVillage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Quarantine Containment Radius (किमी) : <strong>{radiusKm} km</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Rapid Response Unit
                </label>
                <input
                  type="text"
                  required
                  value={taskforce}
                  onChange={(e) => setTaskforce(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeclareModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Activate Containment Zone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
