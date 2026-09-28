import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  PlusCircle,
  HeartPulse,
  Syringe,
  Mic,
  PhoneCall,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { Livestock, HealthReport, Alert } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface FarmerDashboardProps {
  onNavigate: (view: string, caseId?: string) => void;
  onOpenReportModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenVoiceAssistant: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  onOpenReportModal,
  onOpenRegisterModal,
  onOpenVoiceAssistant
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [animalsRes, reportsRes, alertsRes] = await Promise.all([
          api.animals.list(),
          api.reports.list(),
          api.alerts.list()
        ]);

        if (animalsRes.success) setAnimals(animalsRes.data);
        if (reportsRes.success) setReports(reportsRes.data);
        if (alertsRes.success) setAlerts(alertsRes.data);
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sickAnimalsCount = animals.filter(a => a.health_status === 'SICK' || a.health_status === 'UNDER_TREATMENT').length;
  const overdueVaccinesCount = animals.filter(a => a.vaccination_status === 'OVERDUE' || a.vaccination_status === 'DUE_SOON').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner with Voice Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white p-6 sm:p-8 shadow-xl border border-gov-700">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user?.village || 'Nighoj'}, {user?.taluka || 'Shirur'} (पुणे)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {language === 'mr' ? `राम राम, ${user?.full_name?.split(' ')[0]}!` : `Namaste, ${user?.full_name?.split(' ')[0]}!`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {language === 'mr'
                ? 'आपल्या पशुधनाचे आरोग्य सुरक्षित ठेवण्यासाठी पशुरक्षक २४x७ कार्यरत आहे. काही लक्षणे दिसल्यास तात्काळ नोंदवा.'
                : 'PashuRakshak is monitoring your livestock health. Report any clinical symptoms immediately for prompt veterinary aid.'}
            </p>
          </div>

          {/* Quick Voice Assistant Trigger */}
          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition shadow-lg active:scale-95 flex-shrink-0"
          >
            <div className="p-2 rounded-xl bg-saffron-500 text-white">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <div>{language === 'mr' ? 'व्हॉईस सहाय्यक' : 'Voice Assistant'}</div>
              <div className="text-[10px] text-slate-300 font-normal">
                {language === 'mr' ? 'माईक दाबून बोला' : 'Tap to speak symptoms'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Large Touch Targets for Farmers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Report Sick Animal (Main Hero CTA) */}
        <button
          onClick={onOpenReportModal}
          className="group p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/25 transition-all active:scale-95 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertCircle className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
              AI Triage
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-base sm:text-lg leading-tight">
              {language === 'mr' ? 'आजारी जनावराची नोंद करा' : 'Report Sick Livestock'}
            </h3>
            <p className="text-xs text-rose-100 mt-1">
              {language === 'mr' ? 'फोटो व लक्षणे टाकून तात्काळ सल्ला मिळवा' : 'Upload photo & symptoms for instant triage'}
            </p>
          </div>
        </button>

        {/* Register New Animal */}
        <button
          onClick={onOpenRegisterModal}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 text-left flex flex-col justify-between"
        >
          <div className="p-3 bg-gov-50 dark:bg-gov-950 text-gov-700 dark:text-gov-300 rounded-xl w-fit">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'mr' ? 'नवीन जनावर नोंदणी' : 'Register New Animal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'mr' ? 'कान टॅग (Ear Tag ID) सह नोंदवा' : 'Add cattle, buffalo, goat with Ear Tag'}
            </p>
          </div>
        </button>

        {/* Vaccination Due Schedule */}
        <button
          onClick={() => onNavigate('vaccinations')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl w-fit">
              <Syringe className="w-7 h-7" />
            </div>
            {overdueVaccinesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                {overdueVaccinesCount} Due
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'mr' ? 'लसीकरण वेळापत्रक' : 'Vaccination Status'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'mr' ? 'लम्पी व लाळ्या-खुरकूत लसीकरण तपासा' : 'Check LSD & FMD vaccination booster dates'}
            </p>
          </div>
        </button>

        {/* 24x7 Veterinary Ambulance / Hospital */}
        <button
          onClick={() => onNavigate('vetSupport')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/20 rounded-xl">
              <PhoneCall className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
              24x7 Emergency
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-extrabold text-base sm:text-lg leading-tight">
              {language === 'mr' ? 'पशुवैद्यकीय रुग्णवाहिका १९६२' : 'Mobile Vet Clinic 1962'}
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              {language === 'mr' ? 'शिरूर शासकीय पशुवैद्यकीय दवाखाना' : 'Emergency doctor & ambulance on call'}
            </p>
          </div>
        </button>
      </div>

      {/* Regional Disease Alert Strip if any alert exists */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {alerts[0].title}
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-200 mt-0.5 line-clamp-2">
              {alerts[0].message}
            </p>
          </div>
          <button
            onClick={() => onNavigate('advisories')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition self-center flex-shrink-0"
          >
            {language === 'mr' ? 'सविस्तर पहा' : 'View Advisory'}
          </button>
        </div>
      )}

      {/* My Livestock Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'माझे पशुधन (My Animals)' : 'Registered Livestock'}
            </h3>
            <p className="text-xs text-slate-500">
              {animals.length} {language === 'mr' ? 'नोंदणीकृत जनावरे' : 'livestock registered in your farm'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('myAnimals')}
            className="text-xs font-bold text-gov-700 dark:text-gov-400 hover:underline flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'सर्व जनावरे पहा' : 'View All Animals'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.slice(0, 3).map((animal) => (
            <div
              key={animal.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-gov-400 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={animal.photo_url || '/logo.svg'}
                      alt={animal.breed}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{animal.breed} ({animal.species})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Ear Tag: <strong className="text-slate-800 dark:text-slate-200">{animal.ear_tag_id}</strong>
                    </div>
                  </div>
                </div>
                <StatusBadge status={animal.health_status} size="sm" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  Vaccine: <StatusBadge status={animal.vaccination_status} size="sm" />
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition"
                >
                  Report Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Health Reports / Treatment Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'सक्रिय उपचार व आजार नोंदी' : 'Active Health Reports & Vet Visits'}
            </h3>
            <p className="text-xs text-slate-500">
              Track live veterinarian visits, laboratory PCR results, and treatment instructions
            </p>
          </div>
          <button
            onClick={() => onNavigate('cases')}
            className="text-xs font-bold text-gov-700 dark:text-gov-400 hover:underline flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'सर्व केसेस पहा' : 'View All Cases'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No sick livestock reported. All animals are healthy!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onNavigate('caseDetail', rep.id)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-gov-400 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rep.primary_suspected_disease || 'Livestock Health Issue'}
                      </h4>
                      <StatusBadge status={rep.status} size="sm" />
                      {rep.sync_status === 'PENDING' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                          Saved Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ear Tag: <strong>{rep.ear_tag_id || rep.animal_id}</strong> | Reported on {new Date(rep.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rep.symptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {t(`symptoms.${s}`, s)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Assigned Vet</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {rep.assigned_vet_name || 'Dr. Anand Deshmukh'}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gov-700 dark:text-gov-400 hover:underline flex items-center gap-1 sm:mt-2">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
