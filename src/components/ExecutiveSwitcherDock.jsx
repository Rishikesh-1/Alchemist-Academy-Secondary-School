import React, { useState } from 'react';
import {
  Globe,
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  Server,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  School,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useSchoolData } from '../context/SchoolDataContext';

const ExecutiveSwitcherDock = () => {
  const { currentRoute, navigateTo, isDark } = useSiteData();
  const { currentSchoolInstance, setSchoolLicenseStatus } = useSchoolData();
  const [collapsed, setCollapsed] = useState(false);

  const isSuspended = currentSchoolInstance?.status === 'suspended';

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* License Status Pill / Banner */}
      <div
        className={`mb-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-md flex items-center gap-1.5 transition-all backdrop-blur-md ${
          isSuspended
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
            : isDark
            ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/40'
            : 'bg-white/90 text-emerald-600 border-emerald-300'
        }`}
      >
        {isSuspended ? (
          <>
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>License Suspended (Remote Lock Active)</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Alchemist Pro SaaS • Verified</span>
          </>
        )}

        {/* Quick Remote Killswitch Demo Toggle */}
        <button
          type="button"
          onClick={() =>
            setSchoolLicenseStatus('CLI-01', isSuspended ? 'active' : 'suspended')
          }
          className="ml-1 text-[10px] underline hover:text-white cursor-pointer opacity-80 hover:opacity-100"
          title="Simulate remote suspension from Vendor Hub"
        >
          [{isSuspended ? 'Unsuspend' : 'Test Lock'}]
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      <div
        className={`rounded-2xl border shadow-2xl backdrop-blur-md transition-all overflow-hidden ${
          isDark
            ? 'bg-slate-950/90 border-slate-800 text-white shadow-black/40'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
        }`}
      >
        {/* Toggle Collapse Bar */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className={`px-3 py-1.5 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer border-b ${
            isDark ? 'border-slate-800/80 bg-slate-900/60 text-slate-300' : 'border-slate-100 bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ecosystem Persona Switcher</span>
          </div>
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>

        {/* Portal Buttons Row */}
        {!collapsed && (
          <div className="p-1.5 flex items-center gap-1 flex-wrap sm:flex-nowrap">
            {/* 1. Public Website */}
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'home' || currentRoute === 'landing'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Public School Website"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>Website</span>
            </button>

            {/* 2. Student Portal */}
            <button
              type="button"
              onClick={() => navigateTo('student-portal')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'student-portal'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Student & Parent Portal"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Student</span>
            </button>

            {/* 3. Teacher Cockpit */}
            <button
              type="button"
              onClick={() => navigateTo('teacher-portal')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'teacher-portal'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Teacher Cockpit (RJ Rana)"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Teacher</span>
            </button>

            {/* 4. Cashier & CMS */}
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'dashboard'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Staff CMS & Cashier Counter"
            >
              <CreditCard className="w-3.5 h-3.5 text-teal-400" />
              <span>CMS</span>
            </button>

            {/* 5. School Management System (SMS ERP) */}
            <button
              type="button"
              onClick={() => navigateTo('sms')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'sms' || currentRoute === 'sms-dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDark
                  ? 'text-emerald-300 hover:bg-slate-800'
                  : 'text-emerald-700 hover:bg-slate-100'
              }`}
              title="Enterprise School Management System (SMS ERP)"
            >
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>SMS ERP</span>
            </button>

            {/* 6. Vendor Hub */}
            <button
              type="button"
              onClick={() => navigateTo('vendor-hub')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRoute === 'vendor-hub'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isDark
                  ? 'text-purple-300 hover:bg-slate-800'
                  : 'text-purple-700 hover:bg-slate-100'
              }`}
              title="Rishi's Vendor SaaS Fleet Command"
            >
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Vendor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveSwitcherDock;

