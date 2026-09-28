import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const options: Array<{ code: Language; label: string; native: string }> = [
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'en', label: 'English', native: 'English' }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
      <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          className={`px-2 py-1 rounded font-medium transition ${
            language === opt.code
              ? 'bg-gov-700 text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {opt.native}
        </button>
      ))}
    </div>
  );
};
