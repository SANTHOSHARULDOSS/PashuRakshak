import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  MapPin,
  Megaphone,
  Syringe,
  ChevronRight,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';

interface DemoScenarioRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (view: string, caseId?: string) => void;
}

export const DemoScenarioRunner: React.FC<DemoScenarioRunnerProps> = ({
  isOpen,
  onClose,
  onNavigateTo
}) => {
  const { switchDemoRole } = useAuth();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [demoReportId, setDemoReportId] = useState<string>('rep_lsd_001');

  const steps = [
    {
      step: 1,
      role: 'FARMER' as const,
      title: 'Farmer Reports Illness (शेतकरी आजार नोंदणी)',
      description: 'Farmer Ramesh Patil in Nighoj, Shirur notices high fever and skin nodules on Gir cow (MH-PUN-001892).',
      actionLabel: 'Submit Health Report via AI Triage',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
    },
    {
      step: 2,
      role: 'FARMER' as const,
      title: 'AI Clinical Risk Triage (AI जोखीम विश्लेषण)',
      description: 'AI Engine analyzes symptoms, overdue vaccine status & weather factors, outputting Risk Score 84/100 (HIGH) for Lumpy Skin Disease.',
      actionLabel: 'View AI Risk Explanation',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />
    },
    {
      step: 3,
      role: 'FIELD_VET' as const,
      title: 'Field Vet Triage & Examination (पशुवैद्यकीय तपासणी)',
      description: 'Dr. Anand Deshmukh receives high-risk emergency alert, conducts clinical exam, orders isolation, and requests PCR lab test.',
      actionLabel: 'Vet Clinical Exam & Dispatch Lab Sample',
      icon: <Stethoscope className="w-5 h-5 text-blue-500" />
    },
    {
      step: 4,
      role: 'LAB_TECH' as const,
      title: 'Diagnostic Lab PCR Confirmation (प्रयोगशाळा निदान)',
      description: 'District Disease Diagnostic Lab processes scab biopsy via Capripoxvirus Real-time PCR and confirms POSITIVE.',
      actionLabel: 'Record Lab PCR Positive Result',
      icon: <FlaskConical className="w-5 h-5 text-teal-500" />
    },
    {
      step: 5,
      role: 'DISTRICT_ADMIN' as const,
      title: 'Spatiotemporal Outbreak Cluster (GIS रोग नकाशा)',
      description: 'Surveillance engine detects 23 cases within 8.5 km radius across 7 Shirur villages (>3.8x baseline surge).',
      actionLabel: 'Inspect GIS Outbreak Containment Zone',
      icon: <MapPin className="w-5 h-5 text-rose-500" />
    },
    {
      step: 6,
      role: 'DISTRICT_ADMIN' as const,
      title: 'Broadcast Containment Advisory (सतर्कता सूचना)',
      description: 'District Collectorate sends automated SMS & WhatsApp advisory to 2,400 livestock farmers in 10 km radius.',
      actionLabel: 'Broadcast Emergency Farmer Advisory',
      icon: <Megaphone className="w-5 h-5 text-orange-500" />
    },
    {
      step: 7,
      role: 'STATE_ADMIN' as const,
      title: 'Emergency Ring Vaccination Campaign (रिंग लसीकरण)',
      description: 'State Commissionerate deploys Rapid Response Taskforce and allocates 50,000 Goat Pox vaccine doses for Pune/Ahmednagar border.',
      actionLabel: 'Activate Ring Vaccination Campaign',
      icon: <Syringe className="w-5 h-5 text-emerald-500" />
    },
    {
      step: 8,
      role: 'FIELD_VET' as const,
      title: 'Case Resolution & Surveillance Recovery (बरे झाले)',
      description: 'Supportive therapy completed, secondary infections prevented, animal fully recovered and declared HEALTHY.',
      actionLabel: 'Mark Case Resolved & Conclude Tour',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    }
  ];

  const executeCurrentStep = async () => {
    setLoading(true);
    const stepData = steps[currentStep - 1];

    try {
      // 1. Switch Role
      await switchDemoRole(stepData.role);

      // 2. Perform backend action if needed
      if (currentStep === 1) {
        onNavigateTo('reportIssue');
      } else if (currentStep === 2) {
        onNavigateTo('caseDetail', demoReportId);
      } else if (currentStep === 3) {
        await api.reports.updateAssessment(demoReportId, {
          status: 'SAMPLE_REQUIRED',
          vet_notes: 'Demonstration clinical examination: Generalized cutaneous nodular eruptions. Ordered PCR lab sample.',
          quarantine_ordered: 1
        });
        onNavigateTo('caseDetail', demoReportId);
      } else if (currentStep === 4) {
        onNavigateTo('labSamples');
      } else if (currentStep === 5) {
        onNavigateTo('gisMap');
      } else if (currentStep === 6) {
        await api.alerts.broadcast({
          title: 'लम्पी त्वचा रोग सतर्कता सूचना (SIH Demo Advisory)',
          message: 'शिरूर तालुक्यातील शेतकरी बांधवांना आवाहन: जनावरांमध्ये गाठी किंवा ताप आढळल्यास त्वरित पशुवैद्यकीय दवाखान्याशी संपर्क साधावा.',
          severity: 'CRITICAL',
          target_role: 'FARMER',
          target_district: 'Pune',
          target_taluka: 'Shirur'
        });
        onNavigateTo('advisories');
      } else if (currentStep === 7) {
        onNavigateTo('vaccinations');
      } else if (currentStep === 8) {
        await api.reports.updateAssessment(demoReportId, {
          status: 'RESOLVED',
          vet_notes: 'Animal has recovered completely with no active lesions.',
          quarantine_ordered: 0
        });
        onNavigateTo('dashboard');
      }

      // Advance step
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        onClose();
      }
    } catch (e) {
      console.error('Demo step error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-gov-500 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white flex items-center justify-between border-b border-gov-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-saffron-500 text-white rounded-xl shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-saffron-400/20 text-saffron-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-saffron-400/30">
                  SIH 2026 Presentation Mode
                </span>
                <span className="text-xs text-slate-300">Problem Statement SIH26128</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                End-to-End Livestock Intelligence Live Walkthrough
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {currentStep} of {steps.length}</span>
            <span className="text-gov-600 dark:text-gov-400 font-bold">
              Chain: REPORT → ASSESS → TRIAGE → REFER → DIAGNOSE → ALERT → CONTAIN → RESOLVE
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-saffron-500 to-gov-600 h-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Active Step Details */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gov-50/50 dark:bg-gov-950/40 border border-gov-200 dark:border-gov-900">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              {steps[currentStep - 1].icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-gov-200 dark:bg-gov-900 text-gov-800 dark:text-gov-300 text-xs font-bold">
                  Role: {steps[currentStep - 1].role}
                </span>
                <span className="text-xs text-slate-400">Step {currentStep}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {/* Steps Overview Mini Grid */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  currentStep === s.step
                    ? 'bg-gov-100 dark:bg-gov-950 border-gov-500 text-gov-900 dark:text-gov-200 font-bold shadow-sm'
                    : s.step < currentStep
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span>Step {s.step}</span>
                  {s.step < currentStep && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="text-[11px] truncate">{s.role}</div>
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40"
            >
              ← Previous Step
            </button>
            <button
              onClick={executeCurrentStep}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gov-700 to-gov-800 hover:from-gov-800 hover:to-gov-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-gov-700/20 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Scenario Step...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{steps[currentStep - 1].actionLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
