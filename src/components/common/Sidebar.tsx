import React from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  FlaskConical,
  Syringe,
  ShieldAlert,
  Megaphone,
  Stethoscope,
  ClipboardList,
  PhoneForwarded,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenDemoTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onCloseMobile,
  onOpenDemoTour
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role || 'FARMER';

  // Define navigation configuration by role
  const getNavItems = () => {
    switch (role) {
      case 'FARMER':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
          { id: 'myAnimals', label: t('nav.myAnimals'), icon: HeartPulse },
          { id: 'reportIssue', label: t('nav.reportIssue'), icon: AlertCircle, highlight: true },
          { id: 'cases', label: t('nav.cases'), icon: FileSpreadsheet },
          { id: 'vaccinations', label: t('nav.vaccinations'), icon: Syringe },
          { id: 'advisories', label: t('nav.advisories'), icon: Megaphone },
          { id: 'vetSupport', label: t('nav.vetSupport'), icon: Stethoscope }
        ];

      case 'FIELD_VET':
      case 'PARA_VET':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
          { id: 'cases', label: t('nav.cases'), icon: FileSpreadsheet, highlight: true },
          { id: 'reportIssue', label: t('nav.reportIssue'), icon: AlertCircle },
          { id: 'gisMap', label: t('nav.gisMap'), icon: MapPin },
          { id: 'labSamples', label: t('nav.labSamples'), icon: FlaskConical },
          { id: 'vaccinations', label: t('nav.vaccinations'), icon: Syringe },
          { id: 'outbreaks', label: t('nav.outbreaks'), icon: ShieldAlert },
          { id: 'advisories', label: t('nav.advisories'), icon: Megaphone }
        ];

      case 'LAB_TECH':
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
          { id: 'labSamples', label: t('nav.labSamples'), icon: FlaskConical, highlight: true },
          { id: 'cases', label: t('nav.cases'), icon: FileSpreadsheet },
          { id: 'gisMap', label: t('nav.gisMap'), icon: MapPin },
          { id: 'advisories', label: t('nav.advisories'), icon: Megaphone }
        ];

      case 'DISTRICT_ADMIN':
      case 'STATE_ADMIN':
      default:
        return [
          { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
          { id: 'gisMap', label: t('nav.gisMap'), icon: MapPin, highlight: true },
          { id: 'outbreaks', label: t('nav.outbreaks'), icon: ShieldAlert },
          { id: 'cases', label: t('nav.cases'), icon: FileSpreadsheet },
          { id: 'labSamples', label: t('nav.labSamples'), icon: FlaskConical },
          { id: 'vaccinations', label: t('nav.vaccinations'), icon: Syringe },
          { id: 'advisories', label: t('nav.advisories'), icon: Megaphone },
          { id: 'reportsExport', label: t('nav.reportsExport'), icon: FileText },
          { id: 'auditLogs', label: t('nav.auditLogs'), icon: ClipboardList }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 md:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {/* User Role Card */}
          <div className="p-3 mb-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gov-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {role.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[10px] text-gov-700 dark:text-gov-400 font-semibold truncate">
                {user?.district ? `${user.village}, ${user.taluka}` : 'Maharashtra Command'}
              </p>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gov-700 text-white shadow-md shadow-gov-700/20'
                    : item.highlight
                    ? 'bg-saffron-50 dark:bg-saffron-950/30 text-saffron-800 dark:text-saffron-300 hover:bg-saffron-100 dark:hover:bg-saffron-900/50 border border-saffron-200 dark:border-saffron-900/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-saffron-600 dark:text-saffron-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* Footer info & helpline */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>पशुसंजीवनी २४x७</span>
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-0.5">
              1800-180-1551 (Toll-Free)
            </div>
          </div>

          <button
            onClick={onOpenDemoTour}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
            <span>SIH 2026 Presentation Tour</span>
          </button>
        </div>
      </aside>
    </>
  );
};
