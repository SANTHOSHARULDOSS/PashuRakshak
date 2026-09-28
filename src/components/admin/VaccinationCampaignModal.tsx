import React, { useState } from 'react';
import { X, Syringe, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface VaccinationCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VaccinationCampaignModal: React.FC<VaccinationCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState<string>('Mission PashuSuraksha: Emergency LSD Ring Vaccination Drive');
  const [diseaseTarget, setDiseaseTarget] = useState<string>('Lumpy Skin Disease (LSD)');
  const [district, setDistrict] = useState<string>('Pune');
  const [targetCount, setTargetCount] = useState<number>(50000);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.vaccinations.createCampaign({
        title,
        disease_target: diseaseTarget,
        district,
        target_count: Number(targetCount),
        start_date: startDate,
        end_date: endDate,
        talukas: ['Shirur', 'Haveli', 'Khed', 'Daund']
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate vaccination campaign.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        <div className="p-5 bg-gradient-to-r from-gov-800 to-gov-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Launch Targeted Vaccination Drive</h3>
              <p className="text-xs text-gov-200">Ring Immunization & NADCP Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Disease *
              </label>
              <select
                value={diseaseTarget}
                onChange={(e) => setDiseaseTarget(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
              >
                <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                <option value="Foot and Mouth Disease (FMD)">Foot & Mouth Disease (FMD)</option>
                <option value="Hemorrhagic Septicemia (HS)">Hemorrhagic Septicemia (HS)</option>
                <option value="Peste des Petits Ruminants (PPR)">PPR (Goat/Sheep)</option>
                <option value="Black Quarter (BQ)">Black Quarter (BQ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                District Jurisdiction *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
              >
                <option value="Pune">Pune District</option>
                <option value="Ahmednagar">Ahmednagar District</option>
                <option value="Satara">Satara District</option>
                <option value="Kolhapur">Kolhapur District</option>
                <option value="Maharashtra (All 36 Districts)">All 36 Districts (Statewide)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Vaccination Target Animals (खुराक संख्या) *
            </label>
            <input
              type="number"
              required
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-gov-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Authorize Campaign & Allocate Vaccines</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
