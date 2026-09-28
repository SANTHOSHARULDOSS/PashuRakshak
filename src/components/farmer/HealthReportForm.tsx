import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  MapPin,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  Check,
  RefreshCw,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { Livestock, RiskAssessment, ReportSeverity } from '../../types';
import { saveOfflineReport } from '../../utils/indexedDb';
import { startVoiceRecognition } from '../../utils/audioUtils';

interface HealthReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reportId?: string) => void;
  preselectedAnimalId?: string;
}

export const HealthReportForm: React.FC<HealthReportFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedAnimalId
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { isOnline } = useOfflineSync();

  const [step, setStep] = useState<number>(1);
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<ReportSeverity>('HIGH');
  const [temperatureF, setTemperatureF] = useState<string>('104.5');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80');
  const [voiceNote, setVoiceNote] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number>(18.8247);
  const [longitude, setLongitude] = useState<number>(74.3412);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<RiskAssessment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const availableSymptoms = [
    'Fever',
    'Skin lesions',
    'Swelling',
    'Cough',
    'Nasal discharge',
    'Excessive salivation',
    'Reduced milk production',
    'Loss of appetite',
    'Diarrhea',
    'Lameness',
    'Weakness',
    'Sudden mortality',
    'Abortion',
    'Neurological symptoms'
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAiResult(null);
      setErrorMsg('');

      // Fetch user's livestock list
      api.animals.list().then(res => {
        if (res.success && res.data.length > 0) {
          setAnimals(res.data);
          setSelectedAnimalId(preselectedAnimalId || res.data[0].id);
        }
      }).catch(() => {});

      // Auto-capture GPS
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);
          },
          () => {}
        );
      }
    }
  }, [isOpen, preselectedAnimalId]);

  const toggleSymptom = (sym: string) => {
    setSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startVoiceRecognition(
        language,
        (text) => {
          setVoiceNote(text);
          // auto detect symptoms
          const lower = text.toLowerCase();
          if (lower.includes('ताप') || lower.includes('fever') || lower.includes('bukhar')) toggleSymptom('Fever');
          if (lower.includes('गाठ') || lower.includes('lump') || lower.includes('skin')) toggleSymptom('Skin lesions');
          if (lower.includes('लाळ') || lower.includes('saliva')) toggleSymptom('Excessive salivation');
          if (lower.includes('लंगड') || lower.includes('limp')) toggleSymptom('Lameness');
          if (lower.includes('दूध') || lower.includes('milk')) toggleSymptom('Reduced milk production');
        },
        () => setIsRecording(false)
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnimalId || symptoms.length === 0) {
      setErrorMsg('Please select an animal and at least one symptom.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const animal = animals.find(a => a.id === selectedAnimalId);

    const payload = {
      local_id: `loc_rep_${Date.now()}`,
      animal_id: selectedAnimalId,
      symptoms,
      severity,
      temperature_f: temperatureF ? parseFloat(temperatureF) : undefined,
      photo_url: photoUrl,
      audio_url: voiceNote || undefined,
      latitude,
      longitude,
      village: animal?.village || user?.village || 'Nighoj',
      taluka: animal?.taluka || user?.taluka || 'Shirur',
      district: animal?.district || user?.district || 'Pune'
    };

    try {
      if (!isOnline) {
        // Offline submission: Save directly to IndexedDB queue
        const offlineReport = await saveOfflineReport(payload, payload.local_id, animal!);
        setAiResult(offlineReport.riskAssessment || {
          id: `local_risk_${Date.now()}`,
          report_id: payload.local_id,
          risk_score: symptoms.includes('Skin lesions') ? 82 : 65,
          risk_level: 'HIGH',
          primary_suspected_disease: symptoms.includes('Skin lesions') ? 'Lumpy Skin Disease (LSD)' : 'General Bovine Distress',
          confidence_percentage: 80,
          differential_diagnoses: [
            { disease: 'Lumpy Skin Disease (LSD)', marathiName: 'लम्पी त्वचा रोग', code: 'LSD', confidence: 80, reason: 'Skin nodules & pyrexia reported.', recommendedTest: 'Real-time PCR' }
          ],
          contributing_factors: ['Saved locally in offline queue. Will synchronize when internet connects.'],
          recommended_action: 'Isolate animal immediately in screened pen and await veterinary visit.',
          cluster_alert_flag: 0,
          created_at: new Date().toISOString()
        });
        setStep(3); // show result step
      } else {
        // Online API submission
        const res = await api.reports.create(payload);
        if (res.success) {
          setAiResult(res.data.riskAssessment);
          setStep(3); // show result step
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit health report.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {language === 'mr' ? 'आजारी जनावराची नोंदणी व AI विश्लेषण' : 'Livestock Disease Report & AI Triage'}
              </h3>
              <p className="text-xs text-rose-100">
                {language === 'mr' ? 'शिरूर पशुवैद्यकीय विभागाकडे तात्काळ पाठवले जाईल' : 'Immediate dispatch to Field Veterinary Taskforce'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
          <span className={step === 1 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>1. Select Animal & Symptoms</span>
          <span>→</span>
          <span className={step === 2 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}>2. Photo, Temp & Severity</span>
          <span>→</span>
          <span className={step === 3 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''}>3. AI Triage Assessment</span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Animal & Symptoms */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Select Livestock */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Affected Animal (आजारी जनावर निवडा) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {animals.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setSelectedAnimalId(a.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                        selectedAnimalId === a.id
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        <img src={a.photo_url || '/logo.svg'} alt={a.breed} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {a.breed} ({a.species})
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          Tag: <strong className="text-slate-700 dark:text-slate-300">{a.ear_tag_id}</strong>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Checklist with Voice Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Observed Clinical Symptoms (लक्षणे निवडा) *
                  </label>
                  <button
                    type="button"
                    onClick={handleVoiceRecord}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-saffron-100 dark:bg-saffron-950/80 text-saffron-800 dark:text-saffron-300 hover:bg-saffron-200'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'ऐकत आहे...' : 'बोलून लक्षणे सांगा'}</span>
                  </button>
                </div>

                {voiceNote && (
                  <div className="p-2.5 mb-2 bg-saffron-50 dark:bg-slate-950 rounded-xl text-xs italic text-slate-700 dark:text-slate-300 border border-saffron-200 dark:border-slate-800">
                    Voice Note: "{voiceNote}"
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSymptoms.map((sym) => {
                    const isSelected = symptoms.includes(sym);
                    return (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm font-bold'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{t(`symptoms.${sym}`, sym)}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAnimalId || symptoms.length === 0) {
                      setErrorMsg('Please select an animal and at least one symptom.');
                      return;
                    }
                    setErrorMsg('');
                    setStep(2);
                  }}
                  className="px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <span>Next: Clinical Details & Photo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Severity, Temp, Photo */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Severity Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Clinical Severity Level (तीव्रता पातळी) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ReportSeverity[]).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                        severity === sev
                          ? sev === 'CRITICAL'
                            ? 'bg-red-600 text-white border-red-600 shadow-md animate-pulse'
                            : sev === 'HIGH'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-gov-700 text-white border-gov-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {t(`severity.${sev}`, sev)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Body Temperature (अंगातील तापमान °F)
                  </label>
                  <div className="relative">
                    <Thermometer className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      value={temperatureF}
                      onChange={(e) => setTemperatureF(e.target.value)}
                      placeholder="e.g. 104.5"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Animal Photo (जनावराचा फोटो)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
                      title="Camera snapshot"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* GPS Confirmation */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Location: </span>
                    <span className="text-slate-500">
                      {selectedAnimal?.village || 'Nighoj'}, {selectedAnimal?.taluka || 'Shirur'} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                    </span>
                  </div>
                </div>
                {!isOnline && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Offline Queue Mode
                  </span>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running AI Clinical Triage...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isOnline ? 'Submit & Calculate AI Risk' : 'Save Offline to Local Queue'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI Result & Confirmation */}
          {step === 3 && aiResult && (
            <div className="space-y-5 animate-in fade-in zoom-in-95">
              {/* Primary AI Diagnosis Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white border border-gov-700 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 uppercase tracking-wider">
                      AI Triage Assessment
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {aiResult.primary_suspected_disease}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Confidence: <strong>{aiResult.confidence_percentage}%</strong> | Risk Level: <strong className="text-rose-400">{aiResult.risk_level}</strong>
                    </p>
                  </div>

                  {/* Circular Risk Score Meter */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white/10 rounded-2xl border border-white/10 flex-shrink-0">
                    <span className="text-2xl font-black text-saffron-400">{aiResult.risk_score}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-300">/100 Risk</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-200">
                  <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>AI-assisted preliminary assessment — veterinary confirmation required.</span>
                </div>
              </div>

              {/* Explainable Contributing Factors */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                  AI Explainability Factors (जोखीम वाढवणारे घटक):
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {aiResult.contributing_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gov-600 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Vet Action */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  Recommended Immediate Protocol (तात्काळ कृती):
                </h4>
                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                  {aiResult.recommended_action}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Done / View on Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
