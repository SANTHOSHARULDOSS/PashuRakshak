import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CaseStatus, HealthStatus, VaccinationStatus, ReportSeverity } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus | HealthStatus | VaccinationStatus | ReportSeverity | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();

  const getStyle = () => {
    switch (status) {
      // Severities & Urgent states
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/80 dark:text-yellow-300 dark:border-yellow-800';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';

      // Health & Case Statuses
      case 'HEALTHY':
      case 'RESOLVED':
      case 'UP_TO_DATE':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'SICK':
      case 'OVERDUE':
      case 'UNVACCINATED':
      case 'OPEN':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      case 'ISOLATED':
      case 'CONTAINMENT':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800 font-semibold';
      case 'UNDER_TREATMENT':
      case 'TREATMENT_STARTED':
      case 'UNDER_REVIEW':
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
      case 'SAMPLE_REQUIRED':
      case 'LAB_PENDING':
      case 'DUE_SOON':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800';
      case 'DIAGNOSIS_AVAILABLE':
        return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  const localizedText = t(`status.${status}`, t(`severity.${status}`, status.replace(/_/g, ' ')));

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${sizeClasses[size]} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {localizedText}
    </span>
  );
};
