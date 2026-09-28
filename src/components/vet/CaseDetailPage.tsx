import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Stethoscope,
  Sparkles,
  FlaskConical,
  ShieldAlert,
  MapPin,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Thermometer,
  Info,
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthReport, CaseStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LabReferralModal } from './LabReferralModal';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Form State
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [vetNotes, setVetNotes] = useState<string>('');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');
  const [quarantineOrdered, setQuarantineOrdered] = useState<boolean>(false);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>('UNDER_REVIEW');

  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      const res = await api.reports.get(caseId);
      if (res.success && res.data) {
        setReport(res.data);
        setDiagnosis(res.data.diagnosis || res.data.primary_suspected_disease || '');
        setVetNotes(res.data.vet_notes || '');
        setTreatmentPlan(res.data.treatment_plan || '');
        setQuarantineOrdered(!!res.data.quarantine_ordered);
        setCaseStatus(res.data.status);
      }
    } catch (e) {
      console.warn('Failed to load case details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [caseId]);

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setSubmitting(true);
    setStatusMsg('');

    try {
      const res = await api.reports.updateAssessment(report.id, {
        status: caseStatus,
        vet_notes: vetNotes,
        diagnosis,
        treatment_plan: treatmentPlan,
        quarantine_ordered: quarantineOrdered ? 1 : 0
      });

      if (res.success) {
        setStatusMsg('Veterinary assessment updated successfully.');
        await fetchCaseDetail();
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-gov-700" />
        <span>Loading clinical case dossier...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Case not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-gov-700 text-white rounded-lg text-xs font-bold">
          Back to Cases
        </button>
      </div>
    );
  }

  const ai = report.riskAssessment;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Case Dossier ID:</span>
          <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
            {report.id}
          </code>
        </div>
      </div>

      {/* Main Hero Card: Animal & Reporter Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
              <img
                src={report.photo_url || '/logo.svg'}
                alt={report.breed || 'Livestock'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {report.breed} ({report.species})
                </h2>
                <StatusBadge status={report.status} size="md" />
                <StatusBadge status={report.severity} size="md" />
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Ear Tag: <strong className="text-slate-800 dark:text-slate-200 font-mono">{report.ear_tag_id}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {report.village}, {report.taluka} ({report.district})
                </span>
                <span>•</span>
                <span>Reported on {new Date(report.created_at).toLocaleString()}</span>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Farmer: <strong className="text-slate-900 dark:text-white">{report.reporter_name}</strong>
                </span>
                <a
                  href={`tel:${report.reporter_phone}`}
                  className="flex items-center gap-1 text-gov-700 dark:text-gov-400 font-bold hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{report.reporter_phone || '+919822012345'}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Order Lab PCR / ELISA</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Symptoms, AI Risk Panel & Differential Diagnosis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical Symptoms Observed */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Field Symptoms Reported
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold"
                >
                  {t(`symptoms.${s}`, s)}
                </span>
              ))}
            </div>

            {report.temperature_f && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Recorded Pyrexia: <strong>{report.temperature_f}°F</strong></span>
              </div>
            )}
          </div>

          {/* AI Explainable Risk Panel */}
          {ai && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-gov-900 via-gov-800 to-gov-950 text-white border border-gov-700 shadow-xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30">
                      AI Clinical Intelligence
                    </span>
                    <span className="text-xs text-slate-300">Deterministic + Statistical Engine</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {ai.primary_suspected_disease}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Risk Level: <strong className="text-rose-400">{ai.risk_level}</strong> | Confidence: <strong>{ai.confidence_percentage}%</strong>
                  </p>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center flex-shrink-0">
                  <div className="text-3xl font-black text-saffron-400">{ai.risk_score}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-300">/100 Risk Score</div>
                </div>
              </div>

              {/* Differential Diagnosis Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-saffron-300">
                  Differential Diagnoses Considered:
                </h4>
                <div className="space-y-2">
                  {ai.differential_diagnoses?.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{diff.disease} ({diff.marathiName})</span>
                          <span className="px-2 py-0.2 rounded bg-white/10 text-saffron-300 text-[10px]">
                            {diff.confidence}% Match
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">{diff.reason}</div>
                        <div className="text-teal-300 text-[11px] font-mono mt-1">
                          Recommended Test: {diff.recommendedTest}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable Contributing Factors */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Contributing Clinical & Epidemiological Factors:
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {ai.contributing_factors?.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-saffron-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weather factor */}
              {ai.weather_factors && (
                <div className="p-3 bg-black/20 rounded-xl text-xs text-slate-300 border border-white/5 flex items-center justify-between">
                  <span>Agro-Climatic Vector Risk:</span>
                  <strong className="text-saffron-300">{ai.weather_factors.vector_risk}</strong>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-amber-200">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>AI-assisted preliminary assessment — veterinary confirmation required.</span>
              </div>
            </div>
          )}

          {/* Diagnostic Lab Tests History on this Case */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>Laboratory Diagnostic Samples ({report.labSamples?.length || 0})</span>
              </h3>
              <button
                onClick={() => setIsLabModalOpen(true)}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dispatch Sample</span>
              </button>
            </div>

            {(!report.labSamples || report.labSamples.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No laboratory samples dispatched yet for this case.
              </p>
            ) : (
              <div className="space-y-3">
                {report.labSamples.map((sample) => (
                  <div
                    key={sample.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white font-mono">{sample.sample_code}</strong>
                        <StatusBadge status={sample.status} size="sm" />
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${sample.result === 'POSITIVE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                          {sample.result}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Test: <strong>{sample.test_type}</strong> ({sample.sample_type})
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Lab: {sample.lab_name}
                      </div>
                      {sample.test_notes && (
                        <p className="text-slate-700 dark:text-slate-300 italic pt-1">
                          "{sample.test_notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Veterinary Action & Treatment Plan Form */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-gov-100 dark:bg-gov-950 text-gov-700 dark:text-gov-300 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Veterinary Action Plan
                </h3>
                <p className="text-xs text-slate-500">Clinical examination & prescription</p>
              </div>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSaveAssessment} className="space-y-4">
              {/* Case Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Case Lifecycle Status *
                </label>
                <select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-gov-500 outline-none"
                >
                  <option value="OPEN">Reported (OPEN)</option>
                  <option value="ASSIGNED">Assigned (ASSIGNED)</option>
                  <option value="UNDER_REVIEW">Under Clinical Review (UNDER_REVIEW)</option>
                  <option value="SAMPLE_REQUIRED">Sample Required (SAMPLE_REQUIRED)</option>
                  <option value="LAB_PENDING">Lab Analysis Pending (LAB_PENDING)</option>
                  <option value="DIAGNOSIS_AVAILABLE">Diagnosis Available (DIAGNOSIS_AVAILABLE)</option>
                  <option value="TREATMENT_STARTED">Treatment Active (TREATMENT_STARTED)</option>
                  <option value="CONTAINMENT">Containment Zone Active (CONTAINMENT)</option>
                  <option value="RESOLVED">Resolved / Recovered (RESOLVED)</option>
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirmed / Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Lumpy Skin Disease (Capripoxvirus)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Veterinarian Examination Notes
                </label>
                <textarea
                  rows={3}
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="Clinical observation, body temperature, ulceration, edema, lung sounds..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gov-500 outline-none"
                />
              </div>

              {/* Treatment Regimen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Prescription & Treatment Plan
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="1. Antipyretic (Meloxicam 0.5mg/kg) 2. Antiseptic wash 3. Fluid therapy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gov-500 outline-none"
                />
              </div>

              {/* Quarantine Checkbox */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="quarantineCheck"
                  checked={quarantineOrdered}
                  onChange={(e) => setQuarantineOrdered(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="quarantineCheck" className="text-xs font-bold text-purple-900 dark:text-purple-300 cursor-pointer">
                  Order Strict Animal Quarantine (विलगीकरण आदेश)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md shadow-gov-700/20 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Veterinary Assessment</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lab Referral Modal */}
      {isLabModalOpen && (
        <LabReferralModal
          isOpen={isLabModalOpen}
          onClose={() => setIsLabModalOpen(false)}
          report={report}
          onSuccess={() => {
            setIsLabModalOpen(false);
            fetchCaseDetail();
          }}
        />
      )}
    </div>
  );
};
