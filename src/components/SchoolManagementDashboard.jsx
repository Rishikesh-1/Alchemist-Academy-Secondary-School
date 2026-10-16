import React, { useState } from 'react';
import {
  School,
  Users,
  UserPlus,
  GraduationCap,
  Award,
  Calendar,
  CreditCard,
  FileCheck,
  Clock,
  Layers,
  BookOpen,
  Activity,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  UserCheck,
  ShieldCheck,
  Video,
  Building2,
  Bell,
  HeartHandshake,
  FolderOpen,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { useSchoolData } from '../context/SchoolDataContext';

// Modular Tabs (12 Core Modules + Operations & Audit)
import BranchSwitcher from './dashboard/tabs/BranchSwitcher';
import LanguageToggle from './dashboard/tabs/LanguageToggle';
import SchoolOverviewTab from './dashboard/tabs/SchoolOverviewTab';
import FrontOfficeTab from './dashboard/tabs/FrontOfficeTab';
import SisTab from './dashboard/tabs/SisTab';
import ElearningLiveTab from './dashboard/tabs/ElearningLiveTab';
import MultiBranchTab from './dashboard/tabs/MultiBranchTab';
import BehaviorRecordsTab from './dashboard/tabs/BehaviorRecordsTab';
import FinanceFeesTab from './dashboard/tabs/FinanceFeesTab';
import ExaminationsTab from './dashboard/tabs/ExaminationsTab';
import AttendanceTab from './dashboard/tabs/AttendanceTab';
import AcademicsLessonPlanTab from './dashboard/tabs/AcademicsLessonPlanTab';
import HumanResourceTab from './dashboard/tabs/HumanResourceTab';
import CommunicateTab from './dashboard/tabs/CommunicateTab';
import AdmissionsMeritTab from './dashboard/tabs/AdmissionsMeritTab';
import OperationsTab from './dashboard/tabs/OperationsTab';
import AuditTrailTab from './dashboard/tabs/AuditTrailTab';
import MediaLibraryManager from './MediaLibraryManager';

import DigitalStudentIDModal from './portal/DigitalStudentIDModal';
import SMSLoginScreen from './portal/SMSLoginScreen';
import { getTranslation } from '../utils/translations';
import { formatDualDate } from '../utils/nepaliCalendar';

const SchoolManagementDashboard = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const { branding } = siteData;
  const { currentUser, isAuthenticated, logout, ROLES, lang, currentBranch } = useAuth();
  const { schoolData } = useSchoolData();
  const { classRoster = [] } = schoolData || {};

  // Active Tab: default 'overview'
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);

  // If user not authenticated, show SMS Login Screen
  if (!isAuthenticated) {
    return <SMSLoginScreen onLoginSuccess={() => {}} />;
  }

  // Navigation Items with RBAC Mapping: 12 Enterprise Modules
  const allNavItems = [
    {
      id: 'overview',
      label: getTranslation('overview', lang),
      icon: LayoutDashboard,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'accountant'],
    },
    {
      id: 'front-office',
      label: getTranslation('front_office', lang),
      icon: ShieldCheck,
      roles: ['superadmin', 'admin', 'principal', 'teacher'],
    },
    {
      id: 'student-info',
      label: getTranslation('student_info', lang),
      icon: Users,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'librarian', 'parent', 'student'],
    },
    {
      id: 'elearning',
      label: getTranslation('elearning', lang),
      icon: Video,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'student'],
    },
    {
      id: 'multi-branch',
      label: getTranslation('multi_branch', lang),
      icon: Building2,
      roles: ['superadmin', 'admin', 'principal'],
    },
    {
      id: 'behavior',
      label: getTranslation('behavior', lang),
      icon: Award,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'parent'],
    },
    {
      id: 'finance-fees',
      label: getTranslation('finance_fees', lang),
      icon: CreditCard,
      roles: ['superadmin', 'admin', 'principal', 'accountant', 'parent'],
    },
    {
      id: 'examinations',
      label: getTranslation('examinations', lang),
      icon: FileCheck,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'parent', 'student'],
    },
    {
      id: 'attendance',
      label: getTranslation('attendance_all', lang),
      icon: Calendar,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'parent', 'student'],
    },
    {
      id: 'academics',
      label: getTranslation('academics', lang),
      icon: BookOpen,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'student'],
    },
    {
      id: 'hr',
      label: getTranslation('hr', lang),
      icon: UserCheck,
      roles: ['superadmin', 'admin', 'principal', 'accountant'],
    },
    {
      id: 'communicate',
      label: getTranslation('communicate', lang),
      icon: Bell,
      roles: ['superadmin', 'admin', 'principal', 'teacher', 'parent', 'student'],
    },
    {
      id: 'operations',
      label: lang === 'ne' ? 'पुस्तकालय तथा यातायात' : 'Library & Transit',
      icon: Layers,
      roles: ['superadmin', 'admin', 'principal', 'librarian', 'accountant', 'student'],
    },
    {
      id: 'media',
      label: lang === 'ne' ? 'मिडिया लाइब्रेरी' : 'Media Library',
      icon: FolderOpen,
      roles: ['superadmin', 'admin', 'principal', 'teacher'],
    },
    {
      id: 'audit-trail',
      label: getTranslation('audit', lang),
      icon: Activity,
      roles: ['superadmin', 'admin', 'principal'],
    },
  ];

  // Filter tabs accessible to current user role
  const userRole = currentUser?.role || 'admin';
  const navItems = allNavItems.filter((item) =>
    userRole === 'superadmin' || item.roles.includes(userRole)
  );

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Banner Navigation */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between border-b transition-colors duration-300 ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-brand font-bold text-base sm:text-lg leading-tight">
                {branding.name} SMS
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {getTranslation('academic_session', lang)} 2026 AD / 2083 BS • {currentBranch?.name || 'Main Campus'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Branch Switcher (Requirement 1) */}
          <BranchSwitcher isDark={isDark} />

          {/* Language Switcher (EN / Nepali) */}
          <LanguageToggle isDark={isDark} />

          {/* Light/Dark Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Current Staff User Indicator */}
          <div
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">{currentUser?.name || 'Staff User'}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {getTranslation(userRole, lang)}
            </span>
          </div>

          {/* Teacher Cockpit Quick Launch */}
          <button
            type="button"
            onClick={() => navigateTo('teacher-portal')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            title="Open Teacher Cockpit & Attendance Workspace"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ne' ? 'शिक्षक ककपिट' : 'Teacher Cockpit'}</span>
          </button>

          {/* Website CMS */}
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 font-semibold text-xs transition-all cursor-pointer"
            title="Open School Website CMS"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getTranslation('website_cms', lang)}</span>
          </button>

          {/* Public Site */}
          <button
            type="button"
            onClick={() => {
              const publicSiteUrl = `${window.location.origin}${window.location.pathname}`;
              window.open(publicSiteUrl, '_blank', 'noopener,noreferrer');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
            title="Open Public School Website"
          >
            <span className="hidden sm:inline">{getTranslation('public_site', lang)}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              logout();
              navigateTo('home');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all cursor-pointer"
            title="Terminate Staff Session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">{getTranslation('sign_out', lang)}</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`w-full md:w-64 lg:w-72 border-r p-4 space-y-2 shrink-0 overflow-y-auto transition-colors duration-300 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Active Role Clearance Card */}
          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {lang === 'ne' ? 'सक्रिय प्रयोगकर्ता भूमिका' : 'Role Authorization:'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                  ROLES[userRole]?.badgeColor || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {getTranslation(userRole, lang)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {ROLES[userRole]?.description || 'Authorized access to assigned institutional operations.'}
            </p>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider px-3 pt-2 mb-1 text-slate-400">
            {lang === 'ne' ? `व्यवस्थापन मोड्युलहरू (${navItems.length})` : `Operations Modules (${navItems.length})`}
          </div>

          {/* Navigation Tab Buttons */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'opacity-70'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Pane */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-colors duration-300 ${
            isDark ? 'bg-slate-900' : 'bg-slate-100/70'
          }`}
        >
          {activeTab === 'overview' && (
            <SchoolOverviewTab isDark={isDark} onNavigateTab={(t) => setActiveTab(t)} />
          )}

          {activeTab === 'front-office' && <FrontOfficeTab isDark={isDark} />}

          {(activeTab === 'student-info' || activeTab === 'sis') && (
            <SisTab
              isDark={isDark}
              onSelectStudentForID={(st) => setSelectedStudentForID(st)}
              classRoster={classRoster}
            />
          )}

          {activeTab === 'elearning' && <ElearningLiveTab isDark={isDark} />}

          {activeTab === 'multi-branch' && <MultiBranchTab isDark={isDark} />}

          {activeTab === 'behavior' && <BehaviorRecordsTab isDark={isDark} />}

          {(activeTab === 'finance-fees' || activeTab === 'cashier') && (
            <FinanceFeesTab isDark={isDark} />
          )}

          {(activeTab === 'examinations' || activeTab === 'cdc-grading') && (
            <ExaminationsTab isDark={isDark} />
          )}

          {activeTab === 'attendance' && <AttendanceTab isDark={isDark} />}

          {activeTab === 'academics' && <AcademicsLessonPlanTab isDark={isDark} />}

          {activeTab === 'hr' && <HumanResourceTab isDark={isDark} />}

          {activeTab === 'communicate' && <CommunicateTab isDark={isDark} />}

          {activeTab === 'crm' && <AdmissionsMeritTab isDark={isDark} />}

          {activeTab === 'operations' && <OperationsTab isDark={isDark} />}

          {activeTab === 'media' && <MediaLibraryManager isDark={isDark} />}

          {activeTab === 'audit-trail' && <AuditTrailTab isDark={isDark} />}
        </main>
      </div>

      {/* Digital Student ID Card Modal */}
      {selectedStudentForID && (
        <DigitalStudentIDModal
          isOpen={Boolean(selectedStudentForID)}
          onClose={() => setSelectedStudentForID(null)}
          student={selectedStudentForID}
          schoolBranding={branding}
        />
      )}
    </div>
  );
};

export default SchoolManagementDashboard;
