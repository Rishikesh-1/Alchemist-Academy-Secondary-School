import React from 'react';
import { Languages } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const LanguageToggle = ({ isDark }) => {
  const { lang, toggleLanguage } = useAuth();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
        isDark
          ? 'bg-slate-900 border-slate-700 text-teal-400 hover:bg-slate-800'
          : 'bg-white border-slate-300 text-teal-700 hover:bg-slate-50 shadow-xs'
      }`}
      title="Toggle English / Nepali Language"
    >
      <Languages className="w-3.5 h-3.5" />
      <span className="font-mono text-[11px] font-bold">
        {lang === 'en' ? 'EN / नेपाली' : 'नेपाली / EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
