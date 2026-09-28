import React, { useState } from 'react';
import { X, FlaskConical, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { HealthReport } from '../../types';

interface LabReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HealthReport;
  onSuccess: () => void;
}

export const LabReferralModal: React.FC<LabReferralModalProps> = ({
  isOpen,
  onClose,
  report,
  onSuccess
}) => {
  const [diseaseSuspected, setDiseaseSuspected] = useState<string>(
    report.primary_suspected_disease || 'Lumpy Skin Disease (LSD)'
  );
  const [sampleType, setSampleType] = useState<string>('Skin Scab & EDTA Blood');
  const [testType, setTestType] = useState<string>('Capripoxvirus Real-time PCR');
  const [labName, setLabName] = useState<string>(
    'District Animal Disease Diagnostic Laboratory, Aundh, Pune'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const sampleTypeOptions = [
    'Skin Scab & EDTA Blood',
    'Epithelial Tissue & Vesicular Fluid',
    'Nasal / Oropharyngeal Swab',
    'Whole Blood in EDTA & Serum',
    'Milk Sample (Bulk / Quarter)',
    'Aspirate from Swelling Muscle',
    'Tissue Biopsy'
  ];

  const testTypeOptions = [
    'Capripoxvirus Real-time PCR (LSD Confirmation)',
    'FMD Antigen Sandwich ELISA (Serotype O/A/Asia-1)',
    'Rose Bengal Plate Test (RBPT) & ELISA (Brucellosis)',
    'Pasteurella multocida Culture & PCR (HS)',
    'Clostridium chauvoei Fluorescent Antibody Test (BQ)',
    'Competitive ELISA (PPR Morbillivirus)',
    'Real-time RT-PCR (Avian Influenza H5N1)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.lab.createSample({
        report_id: report.id,
        animal_id: report.animal_id,
        disease_suspected: diseaseSuspected,
        sample_type: sampleType,
        test_type: testType,
        lab_name: labName
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch lab sample referral.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Diagnostic Laboratory Referral</h3>
              <p className="text-xs text-teal-100">Cold Chain Specimen Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Case ID:</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">{report.id}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ear Tag ID:</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">{report.ear_tag_id}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Suspected Disease / Pathogen *
            </label>
            <input
              type="text"
              required
              value={diseaseSuspected}
              onChange={(e) => setDiseaseSuspected(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Sample Type (नमुन्याचा प्रकार) *
            </label>
            <select
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {sampleTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Diagnostic Test Protocol Requested *
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {testTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Destination Testing Laboratory *
            </label>
            <input
              type="text"
              required
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            />
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
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Dispatch Sample Referral</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
