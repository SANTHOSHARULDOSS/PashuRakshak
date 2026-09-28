import React, { useState } from 'react';
import { X, FlaskConical, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { LabSample } from '../../types';

interface SampleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: LabSample;
  onSuccess: () => void;
}

export const SampleTestModal: React.FC<SampleTestModalProps> = ({
  isOpen,
  onClose,
  sample,
  onSuccess
}) => {
  const [result, setResult] = useState<'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'>(
    sample.result === 'POSITIVE' || sample.result === 'NEGATIVE' ? sample.result : 'POSITIVE'
  );
  const [confirmedDisease, setConfirmedDisease] = useState<string>(
    sample.confirmed_disease || sample.disease_suspected
  );
  const [testNotes, setTestNotes] = useState<string>(
    sample.test_notes || 'Real-time PCR cycle threshold Ct value: 24.2. High viral DNA load detected. Diagnostic positive.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.lab.recordResult(sample.id, {
        result,
        confirmed_disease: confirmedDisease,
        test_notes: testNotes
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record diagnostic test result.');
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
              <h3 className="font-bold text-base">Record Diagnostic Test Result</h3>
              <p className="text-xs text-teal-100">Sample Code: {sample.sample_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10">
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
            <div>Test Protocol: <strong className="text-slate-900 dark:text-white">{sample.test_type}</strong></div>
            <div>Specimen: <strong className="text-slate-700 dark:text-slate-300">{sample.sample_type}</strong></div>
          </div>

          {/* Result Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Pathogen Diagnostic Finding *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResult('POSITIVE')}
                className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  result === 'POSITIVE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🔴 POSITIVE</span>
                <span className="text-[10px] font-normal opacity-90">Pathogen Confirmed</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('NEGATIVE')}
                className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  result === 'NEGATIVE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🟢 NEGATIVE</span>
                <span className="text-[10px] font-normal opacity-90">Non-pathogenic</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('INCONCLUSIVE')}
                className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  result === 'INCONCLUSIVE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🟡 INCONCLUSIVE</span>
                <span className="text-[10px] font-normal opacity-90">Repeat Assay</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Confirmed Disease / Serotype
            </label>
            <input
              type="text"
              required
              value={confirmedDisease}
              onChange={(e) => setConfirmedDisease(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Laboratory Pathologist Notes & Findings
            </label>
            <textarea
              rows={3}
              required
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
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
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Certify & Publish Result</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
