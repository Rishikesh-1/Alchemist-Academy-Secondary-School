import React from 'react';
import {
  Lock,
  ShieldAlert,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw,
  Unlock,
  Key,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';

const LicenseLockScreen = () => {
  const { currentSchoolInstance, setSchoolLicenseStatus } = useSchoolData();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-xl rounded-3xl border border-rose-500/30 bg-slate-900/90 shadow-2xl p-6 sm:p-10 text-center backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Red Glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
          Scheduled Institutional Renewal Notice
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold mt-4 tracking-tight">
          Cloud Services Paused
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
          Access to this educational domain instance (<strong>alchemist.edu.np</strong>) is temporarily
          suspended pending annual subscription renewal or license verification.
        </p>

        {/* License Token Badge */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Institution:</span>
            <span className="text-slate-200 font-bold">Alchemist Academy Secondary School</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Domain Node:</span>
            <span className="text-purple-400">alchemist.edu.np</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">License ID:</span>
            <span className="text-amber-400 font-bold">{currentSchoolInstance?.licenseKey || 'LIC-ALCH-PRO-2026-X81A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Remote Status:</span>
            <span className="text-rose-400 uppercase font-bold">SUSPENDED BY VENDOR COMMAND</span>
          </div>
        </div>

        {/* Contact Rishi Kesh Rana */}
        <div className="space-y-3">
          <a
            href="https://rishikeshrana.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Contact Developer Rishi Kesh Rana</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Instant Unlock Button for Demonstration */}
          <button
            type="button"
            onClick={() => setSchoolLicenseStatus('CLI-01', 'active')}
            className="w-full py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Unlock className="w-4 h-4" />
            <span>Instant Demo Unlock / Restore License</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseLockScreen;

