import React, { useState } from 'react';
import {
  Bell,
  PhoneCall,
  Mic,
  Sparkles,
  Shield,
  UserCheck,
  ChevronDown,
  LogOut,
  Menu,
  PhoneForwarded
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OfflineBadge } from './OfflineBadge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenIVR: () => void;
  onOpenDemoTour: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenVoiceAssistant,
  onOpenIVR,
  onOpenDemoTour,
  onToggleSidebar
}) => {
  const { user, switchDemoRole, logout } = useAuth();
  const { t } = useLanguage();
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  const roles: Array<{ role: UserRole; label: string; desc: string }> = [
    { role: 'FARMER', label: 'Farmer (शेतकरी)', desc: 'Report sickness, view livestock, vaccine dues' },
    { role: 'FIELD_VET', label: 'Field Veterinarian (पशुवैद्यक)', desc: 'Clinical triage, case review, lab referral' },
    { role: 'PARA_VET', label: 'Para-Veterinary Worker (पर्यवेक्षक)', desc: 'Field-level survey, vaccination logs' },
    { role: 'LAB_TECH', label: 'Lab Pathologist (प्रयोगशाळा)', desc: 'Sample intake, PCR / ELISA diagnostics' },
    { role: 'DISTRICT_ADMIN', label: 'District AH Officer (जिल्हा अधिकारी)', desc: 'District surveillance, containment advisory' },
    { role: 'STATE_ADMIN', label: 'State Surveillance Director (राज्य संचालक)', desc: 'Statewide GIS hotspots, vaccine allocations' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Maharashtra Official Tricolor Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-saffron-500 via-white to-forest-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Toggle & Brand Emblem */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="PashuRakshak Logo" className="w-9 h-9 flex-shrink-0 drop-shadow-sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base tracking-tight text-gov-900 dark:text-white flex items-center gap-1">
                    PashuRakshak
                    <span className="hidden sm:inline text-xs font-semibold px-1.5 py-0.2 bg-saffron-100 text-saffron-800 dark:bg-saffron-950 dark:text-saffron-300 rounded border border-saffron-300">
                      Maharashtra
                    </span>
                  </h1>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Livestock Health Surveillance & Early-Warning Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline Status Badge */}
            <OfflineBadge />

            {/* SIH Demo Tour Button */}
            <button
              onClick={onOpenDemoTour}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
              title="Launch 8-step SIH Hackathon presentation walkthrough"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH Demo Tour</span>
            </button>

            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoiceAssistant}
              className="p-2 rounded-lg bg-gov-50 hover:bg-gov-100 dark:bg-gov-950 dark:hover:bg-gov-900 text-gov-700 dark:text-gov-300 border border-gov-200 dark:border-gov-800 transition"
              title="Open Multi-lingual Voice Assistant (मराठी/हिन्दी)"
              aria-label="Voice Assistant"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* IVR Helpline Simulator */}
            <button
              onClick={onOpenIVR}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Simulated 24x7 IVR Phone Helpline (1800-180-1551)"
              aria-label="IVR Helpline"
            >
              <PhoneForwarded className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="View Disease Alerts & Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Role Switcher Dropdown (Judge Evaluation Tool) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(prev => !prev)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
              >
                <div className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.role ? user.role.substring(0, 2) : 'US'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold leading-none">
                    {user?.role?.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs font-bold truncate max-w-[110px] leading-tight">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Switch Role (SIH Evaluator)</span>
                    <span className="px-1.5 py-0.2 rounded bg-gov-100 dark:bg-gov-950 text-gov-800 dark:text-gov-300 font-bold">
                      RBAC
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchDemoRole(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition flex items-start gap-2.5 text-xs ${
                          user?.role === r.role
                            ? 'bg-gov-50 dark:bg-gov-950/80 text-gov-900 dark:text-gov-200 font-bold border border-gov-200 dark:border-gov-900'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <UserCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${user?.role === r.role ? 'text-gov-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-semibold">{r.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Reset Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
