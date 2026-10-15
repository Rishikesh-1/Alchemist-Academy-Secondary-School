import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Compass,
  FileText,
  Save,
  Check,
  Eye,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  Palette,
  Sliders,
  UserX,
  Lock,
  X,
  Key,
  FolderOpen,
  Sun,
  Moon,
  CreditCard,
  LogOut,
  UserCheck,
  GraduationCap,
  Crown,
  UserPlus,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  FileCheck,
  CheckCircle2,
  Printer,
  QrCode,
  TrendingUp,
  School,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { useSchoolData } from '../context/SchoolDataContext';
import ImageFieldWithPicker from './ImageFieldWithPicker';
import MediaLibraryManager from './MediaLibraryManager';
import CashierFeeCollector from './CashierFeeCollector';
import DigitalStudentIDModal from './portal/DigitalStudentIDModal';
import { saveSiteSettings } from '../services/api';

const Dashboard = () => {
  const { siteData, setSiteData, updateFullSiteData, resetToDefault, navigateTo, isDark, toggleTheme } = useSiteData();
  const { currentUser, logout, canAccessSection, users, addUser, updateUser, deleteUser, ROLES } = useAuth();
  const { schoolData } = useSchoolData();
  const { classRoster = [], teacher = {}, bills = {}, timetable = [] } = schoolData || {};

  // 3-in-1 Workspace Switcher: 'cms' | 'erp' | 'finance'
  const [currentWorkspace, setCurrentWorkspace] = useState('cms');
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);

  // CRM State
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem('alchemist_crm_leads_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'LD-101', studentName: 'Rohan Shrestha', parentName: 'Bikash Shrestha', phone: '9851122334', email: 'bikash.sh@gmail.com', grade: 'Grade 10', date: '2026-10-14', status: 'Campus Visit', notes: 'Interested in STEM lab & scholarship criteria' },
      { id: 'LD-102', studentName: 'Anushka Bajracharya', parentName: 'Kishor Bajracharya', phone: '9841889900', email: 'kbajra@gmail.com', grade: 'Grade 8', date: '2026-10-15', status: 'New', notes: 'Online inquiry from website contact form' },
      { id: 'LD-103', studentName: 'Kritesh Basnet', parentName: 'Mina Basnet', phone: '9813554433', email: 'mina.basnet@outlook.com', grade: 'Grade 5', date: '2026-10-13', status: 'Contacted', notes: 'Requested school bus route info for Jorpati area' },
      { id: 'LD-104', studentName: 'Samir Acharya', parentName: 'Dev Acharya', phone: '9849223311', email: 'dev.acharya@hotmail.com', grade: 'Grade 10', date: '2026-10-11', status: 'Enrolled', notes: 'Completed registration & paid admission token' },
      { id: 'LD-105', studentName: 'Pooja Timilsina', parentName: 'Ramesh Timilsina', phone: '9860112233', email: 'ramesh.t@gmail.com', grade: 'Grade 9', date: '2026-10-16', status: 'New', notes: 'Transferring from Pokhara, inquiries about hostel facilities' },
    ];
  });
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [crmSearch, setCrmSearch] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    grade: 'Grade 10',
    notes: '',
  });

  // SIS Search state
  const [sisSearch, setSisSearch] = useState('');

  // Persist leads
  useEffect(() => {
    try {
      localStorage.setItem('alchemist_crm_leads_v2', JSON.stringify(leads));
    } catch (e) {}
  }, [leads]);

  // Navigation Items defined per Workspace
  const cmsNavItems = [
    { id: 'branding', label: 'Branding & Logo', icon: Palette },
    { id: 'hero', label: 'Hero Banner & BG', icon: ImageIcon },
    { id: 'about', label: 'About School', icon: Compass },
    { id: 'stats', label: 'Stats Grid', icon: Users },
    { id: 'headmaster', label: "Leadership Messages", icon: MessageSquare },
    { id: 'curriculum', label: 'Curriculum Subjects', icon: BookOpen },
    { id: 'cocurricular', label: 'Co-curricular Activities', icon: Sparkles },
    { id: 'blogs', label: 'Blog & Articles', icon: FileText },
    { id: 'admissions', label: 'Admissions CTA', icon: Phone },
    { id: 'footer', label: 'Footer & Address', icon: LayoutDashboard },
    { id: 'media', label: 'Media Library', icon: FolderOpen },
    { id: 'users', label: 'Staff & Team Access', icon: ShieldCheck, superadminOnly: true },
  ];

  const erpNavItems = [
    { id: 'crm', label: 'Admissions & Leads CRM', icon: UserPlus },
    { id: 'sis', label: 'Student SIS & ID Cards', icon: Users },
    { id: 'faculty', label: 'Faculty & Roster', icon: GraduationCap },
    { id: 'cdc-grading', label: 'CDC & NEB Grading Engine', icon: Award },
    { id: 'attendance', label: 'Attendance & Timetable', icon: Calendar },
  ];

  const financeNavItems = [
    { id: 'cashier', label: 'Cashier Terminal', icon: CreditCard },
    { id: 'fee-structures', label: 'Fee Structures & Tariffs', icon: FileCheck },
    { id: 'audit-trail', label: 'Payment Receipts & Ledger', icon: Clock },
  ];

  const getCurrentWorkspaceItems = () => {
    let items = cmsNavItems;
    if (currentWorkspace === 'erp') items = erpNavItems;
    if (currentWorkspace === 'finance') items = financeNavItems;

    return items.filter((item) => {
      if (item.superadminOnly) {
        return currentUser?.role === 'superadmin';
      }
      return canAccessSection(item.id);
    });
  };

  const allowedNavItems = getCurrentWorkspaceItems();

  const [activeSection, setActiveSection] = useState('branding');

  const switchWorkspace = (ws) => {
    setCurrentWorkspace(ws);
    if (ws === 'cms') setActiveSection('branding');
    if (ws === 'erp') setActiveSection('crm');
    if (ws === 'finance') setActiveSection('cashier');
  };

  const [savedNotice, setSavedNotice] = useState(false);
  const [blogAddedNotice, setBlogAddedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form local state clone for seamless editing
  const [formData, setFormData] = useState(siteData);

  // Keep formData in sync if siteData changes or loads from MySQL server
  useEffect(() => {
    if (siteData) {
      setFormData(siteData);
    }
  }, [siteData]);

  const handleSave = async () => {
    setIsSaving(true);
    updateFullSiteData(formData);
    try {
      const res = await saveSiteSettings(formData);
      if (res && res.success) {
        setSavedNotice('Saved Live to MySQL Database & All Devices!');
      } else {
        setSavedNotice('Changes Saved Live!');
      }
    } catch (e) {
      setSavedNotice('Changes Saved Live!');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavedNotice(false), 3500);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to restore default template settings? Any customizations will be overwritten.')) {
      resetToDefault();
      setSavedNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Helper for 1-level deep updates
  const updateField = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // New staff form state (for Superadmin)
  const [newStaffUser, setNewStaffUser] = useState({
    username: '',
    name: '',
    role: 'editor',
    password: '',
    department: 'Academics',
    status: 'active',
  });

  // Editing state for maintaining existing staff members
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    name: '',
    role: 'editor',
    password: '',
    department: '',
    status: 'active',
  });

  return (
    <div className={`dashboard-root min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Bar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
        isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`font-serif-brand font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentWorkspace === 'erp' ? 'Academic ERP Command' : currentWorkspace === 'finance' ? 'Finance & Billing Counter' : 'Alchemist Academy CMS'}
            </h1>
            <p className="text-xs text-amber-500 font-medium">
              {currentWorkspace === 'erp' ? 'Admissions CRM, SIS, Grading & Roster' : currentWorkspace === 'finance' ? 'Cashier Terminal, Tariffs & Receipts' : 'Live Customizer & Content Modules'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {savedNotice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {typeof savedNotice === 'string' ? savedNotice : 'Changes Saved Live!'}
            </span>
          )}

          {/* Global Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 shadow-xs'
            }`}
            title={isDark ? "Switch Dashboard to Light Mode" : "Switch Dashboard to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {currentWorkspace === 'cms' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : 'Save & Apply'}</span>
            </button>
          )}

          {/* Current Admin Session User Indicator */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">
              {(() => {
                const rawName = currentUser?.name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Academic Director';
                return /super\s*admin/i.test(rawName) ? 'Academic Director' : rawName;
              })()}
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {currentUser?.role || 'Superadmin'}
            </span>
          </div>

          {/* Superadmin Multi-School SaaS Console Direct Switcher */}
          {currentUser?.role === 'superadmin' && (
            <button
              type="button"
              onClick={() => navigateTo('vendor-hub')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              title="Open Multi-School SaaS Console (Vendor Fleets, Licenses & Remote Lock)"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span className="hidden md:inline">Vendor SaaS Console</span>
              <span className="md:hidden">SaaS</span>
            </button>
          )}

          <button
            onClick={() => {
              handleSave();
              const publicSiteUrl = `${window.location.origin}${window.location.pathname}`;
              window.open(publicSiteUrl, '_blank', 'noopener,noreferrer');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow transition-all cursor-pointer"
            title="Open Public School Website in New Tab"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            onClick={() => {
              logout();
              navigateTo('landing');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            title="Terminate Session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-64 lg:w-72 border-r p-4 space-y-1.5 shrink-0 overflow-y-auto transition-colors duration-300 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Role badge & access indicator */}
          <div className={`mb-4 p-3 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Active Access Tier:
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${ROLES[currentUser?.role]?.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                {ROLES[currentUser?.role]?.title || 'Staff'}
              </span>
            </div>
            <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {ROLES[currentUser?.role]?.description}
            </p>
          </div>

          {/* 3-in-1 Workspace Switcher Tabs */}
          <div className="mb-4">
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Workspace Environment
            </div>
            <div className={`p-1 rounded-2xl border flex flex-col gap-1 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {/* 1. Website CMS */}
              <button
                type="button"
                onClick={() => switchWorkspace('cms')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentWorkspace === 'cms'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Website CMS</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  currentWorkspace === 'cms' ? 'bg-black/20 text-slate-950' : 'bg-slate-700/30 text-slate-400'
                }`}>
                  12
                </span>
              </button>

              {/* 2. Academic ERP */}
              <button
                type="button"
                onClick={() => switchWorkspace('erp')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentWorkspace === 'erp'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Academic ERP</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  currentWorkspace === 'erp' ? 'bg-white/20 text-white' : 'bg-slate-700/30 text-slate-400'
                }`}>
                  5
                </span>
              </button>

              {/* 3. Finance & Billing */}
              <button
                type="button"
                onClick={() => switchWorkspace('finance')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentWorkspace === 'finance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Finance & Billing</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  currentWorkspace === 'finance' ? 'bg-white/20 text-white' : 'bg-slate-700/30 text-slate-400'
                }`}>
                  3
                </span>
              </button>
            </div>
          </div>

          <div className={`text-[11px] font-bold uppercase tracking-wider px-3 mb-2 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {currentWorkspace === 'cms' ? 'CMS Visual Modules' : currentWorkspace === 'erp' ? 'ERP Academic Operations' : 'Accounts & Counter Modules'} ({allowedNavItems.length})
          </div>

          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className={`pt-6 border-t mt-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`rounded-2xl p-4 border text-xs space-y-2 ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="font-bold text-amber-500 block uppercase tracking-wider text-[10px]">
                Instant Local Storage
              </span>
              <p>
                Every change you make updates the React app and persists in your browser storage automatically.
              </p>
            </div>
          </div>
        </aside>

        {/* Form Body */}
        <main className={`flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-5xl transition-colors duration-300 ${
          isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100/70 text-slate-900'
        }`}>
          
          {/* 1. BRANDING & LOGO */}
          {activeSection === 'branding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Branding & Navigation Settings</h2>
                <p className="text-sm text-slate-400 mt-1">Configure your institution's name, tagline, logo icon, and color theme.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Academy Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.branding.name}
                      onChange={(e) => updateField('branding', 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Tagline / Motto
                    </label>
                    <input
                      type="text"
                      value={formData.branding.tagline}
                      onChange={(e) => updateField('branding', 'tagline', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Brand Logo Presentation Mode */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Brand Logo Display Mode
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Choose whether to display a curated vector icon badge or upload an official school crest / logo image.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateField('branding', 'logoType', 'icon')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          formData.branding.logoType !== 'image'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Vector Icon
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('branding', 'logoType', 'image')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          formData.branding.logoType === 'image'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Custom Logo Image
                      </button>
                    </div>
                  </div>

                  {formData.branding.logoType === 'image' ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                      <ImageFieldWithPicker
                        label="Official Brand Logo / School Crest Image"
                        value={formData.branding.logoImage || ''}
                        onChange={(url) => {
                          updateField('branding', 'logoImage', url);
                          updateField('branding', 'logoType', 'image');
                        }}
                        category="Logos & Badges"
                        placeholder="e.g. ./logo.png, data:image/png..., or pick from library"
                        helpText="Recommended: Transparent background PNG, SVG, or WebP logo file (square or crest proportion)."
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Logo Icon Style
                        </label>
                        <select
                          value={formData.branding.logoIcon}
                          onChange={(e) => updateField('branding', 'logoIcon', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="GraduationCap">Graduation Cap</option>
                          <option value="Sparkles">Sparkles Star</option>
                          <option value="BookOpen">Open Book</option>
                          <option value="Award">Award Shield</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Logo Accent Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.branding.logoColor}
                            onChange={(e) => updateField('branding', 'logoColor', e.target.value)}
                            className="w-12 h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={formData.branding.logoColor}
                            onChange={(e) => updateField('branding', 'logoColor', e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Browser Tab Icon (Favicon) */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Browser Tab Icon (Favicon)
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Displays in the browser tab next to the school page title.
                      </p>
                    </div>

                    {formData.branding.logoImage && (
                      <button
                        type="button"
                        onClick={() => updateField('branding', 'favicon', formData.branding.logoImage)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium cursor-pointer"
                      >
                        Use Brand Logo as Favicon
                      </button>
                    )}
                  </div>

                  <ImageFieldWithPicker
                    label="Favicon File"
                    value={formData.branding.favicon || ''}
                    onChange={(url) => updateField('branding', 'favicon', url)}
                    category="Logos & Badges"
                    placeholder="e.g. ./favicon.png, favicon.ico, or choose from Media Library"
                    helpText="Recommended: 32x32 or 64x64 transparent square PNG, SVG, or ICO icon."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Header Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.branding.headerApplyButtonText}
                      onChange={(e) => updateField('branding', 'headerApplyButtonText', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Header Button Target Link
                    </label>
                    <input
                      type="text"
                      value={formData.branding.headerApplyButtonLink}
                      onChange={(e) => updateField('branding', 'headerApplyButtonLink', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Media Placeholders</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Twitter / X</label>
                      <input
                        type="url"
                        value={formData.socials?.twitter || ''}
                        onChange={(e) => updateField('socials', 'twitter', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={formData.socials?.facebook || ''}
                        onChange={(e) => updateField('socials', 'facebook', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={formData.socials?.instagram || ''}
                        onChange={(e) => updateField('socials', 'instagram', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. HERO BANNER & BACKGROUND IMAGE */}
          {activeSection === 'hero' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Hero Section & Background</h2>
                <p className="text-sm text-slate-400 mt-1">Change background image URL, overlay dark tint, headings, and CTA buttons.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <ImageFieldWithPicker
                    label="Hero Background Image"
                    value={formData.hero.bgImage}
                    onChange={(url) => updateField('hero', 'bgImage', url)}
                    category="Campus & Events"
                    placeholder="e.g. ./hero-cultural.webp or choose from Media Library"
                    helpText="Appears full-width across the header viewport with radial gradient overlay."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-slate-400 py-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('hero', 'bgImage', './hero-cultural.webp');
                        updateField('hero', 'bgOverlayOpacity', 50);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium transition-colors"
                    >
                      🌟 School Event Photo (Cultural Incense)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('hero', 'bgImage', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80');
                        updateField('hero', 'bgOverlayOpacity', 85);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 font-medium transition-colors"
                    >
                      🏫 Campus Classrooms
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Tip: You can use any external image link, file link, or local path like <code className="text-amber-400 font-mono">./hero-cultural.webp</code>.
                  </p>
                </div>

                {/* Background Image Preview */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                  <img
                    src={formData.hero.bgImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/30">
                      Live Background Image Preview
                    </span>
                  </div>
                </div>

                {/* Dark Overlay Opacity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Dark Tint Overlay Opacity
                    </label>
                    <span className="text-xs font-bold text-amber-400">
                      {formData.hero.bgOverlayOpacity || 85}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={formData.hero.bgOverlayOpacity || 85}
                    onChange={(e) => updateField('hero', 'bgOverlayOpacity', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Top Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.hero.badge}
                      onChange={(e) => updateField('hero', 'badge', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Subheading / Quote
                    </label>
                    <input
                      type="text"
                      value={formData.hero.subheading}
                      onChange={(e) => updateField('hero', 'subheading', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Main Heading Part 1
                    </label>
                    <input
                      type="text"
                      value={formData.hero.titlePart1}
                      onChange={(e) => updateField('hero', 'titlePart1', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Heading Amber Highlight
                    </label>
                    <input
                      type="text"
                      value={formData.hero.titleHighlight}
                      onChange={(e) => updateField('hero', 'titleHighlight', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.hero.primaryBtnText}
                      onChange={(e) => updateField('hero', 'primaryBtnText', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.hero.secondaryBtnText}
                      onChange={(e) => updateField('hero', 'secondaryBtnText', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Hero Key Features (3 Points Bar on Banner) */}
                <div className="pt-6 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Banner Key Highlights & Badges
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        These points display in the bottom strip of the hero banner on the homepage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const curFeatures = Array.isArray(formData.hero?.features)
                          ? [...formData.hero.features]
                          : [
                              { text: "Government Recognized Excellence", icon: "Award" },
                              { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
                              { text: "Holistic Student Development", icon: "BookOpen" },
                            ];
                        curFeatures.push({ text: "New School Highlight", icon: "CheckCircle2" });
                        updateField('hero', 'features', curFeatures);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Highlight</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(formData.hero?.features || [
                      { text: "Government Recognized Excellence", icon: "Award" },
                      { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
                      { text: "Holistic Student Development", icon: "BookOpen" },
                    ]).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div className="w-44 shrink-0">
                          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Icon</label>
                          <select
                            value={feat.icon || 'Sparkles'}
                            onChange={(e) => {
                              const cur = Array.isArray(formData.hero?.features)
                                ? [...formData.hero.features]
                                : [
                                    { text: "Government Recognized Excellence", icon: "Award" },
                                    { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
                                    { text: "Holistic Student Development", icon: "BookOpen" },
                                  ];
                              cur[fIdx] = { ...cur[fIdx], icon: e.target.value };
                              updateField('hero', 'features', cur);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="Award">🏆 Award</option>
                            <option value="Sparkles">✨ Sparkles</option>
                            <option value="BookOpen">📖 Book Open</option>
                            <option value="ShieldCheck">🛡️ Shield Check</option>
                            <option value="CheckCircle2">✅ Check Circle</option>
                            <option value="Star">⭐ Star</option>
                            <option value="GraduationCap">🎓 Graduation Cap</option>
                            <option value="Users">👥 Users</option>
                            <option value="Heart">❤️ Heart</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Highlight Text</label>
                          <input
                            type="text"
                            value={feat.text}
                            onChange={(e) => {
                              const cur = Array.isArray(formData.hero?.features)
                                ? [...formData.hero.features]
                                : [
                                    { text: "Government Recognized Excellence", icon: "Award" },
                                    { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
                                    { text: "Holistic Student Development", icon: "BookOpen" },
                                  ];
                              cur[fIdx] = { ...cur[fIdx], text: e.target.value };
                              updateField('hero', 'features', cur);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                            placeholder="e.g. Government Recognized Excellence"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const cur = Array.isArray(formData.hero?.features)
                              ? [...formData.hero.features]
                              : [
                                  { text: "Government Recognized Excellence", icon: "Award" },
                                  { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
                                  { text: "Holistic Student Development", icon: "BookOpen" },
                                ];
                            cur.splice(fIdx, 1);
                            updateField('hero', 'features', cur);
                          }}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer mt-4"
                          title="Remove Highlight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. ABOUT SCHOOL */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">About Section Details</h2>
                <p className="text-sm text-slate-400 mt-1">Edit school introduction, campus photos, and core educational pillars.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    About Section Heading
                  </label>
                  <input
                    type="text"
                    value={formData.about.title}
                    onChange={(e) => updateField('about', 'title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <ImageFieldWithPicker
                  label="Campus Feature Image"
                  value={formData.about.image}
                  onChange={(url) => updateField('about', 'image', url)}
                  category="Campus & Events"
                  placeholder="e.g. https://images.unsplash.com/... or choose from Media Library"
                  helpText="Hero photo showcased alongside the institution's values and background narrative."
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    First Paragraph (Primary Description)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.about.description1}
                    onChange={(e) => updateField('about', 'description1', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Second Paragraph (Holistic Approach)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.about.description2}
                    onChange={(e) => updateField('about', 'description2', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Location Badge Title
                    </label>
                    <input
                      type="text"
                      value={formData.about.locationBadgeTitle}
                      onChange={(e) => updateField('about', 'locationBadgeTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Grade Pill Tag
                    </label>
                    <input
                      type="text"
                      value={formData.about.gradePill}
                      onChange={(e) => updateField('about', 'gradePill', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Core Pillars / 4 Highlights List */}
                <div className="pt-6 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Core Values & Highlights (About Grid Points)
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        These points display with green checkmarks in the 2-column grid inside the About section.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const curValues = Array.isArray(formData.about?.values)
                          ? [...formData.about.values]
                          : [
                              "Holistic Curriculum Approach",
                              "Dedicated & Caring Mentors",
                              "Strong Ethical Foundations",
                              "Co-curricular Excellence",
                            ];
                        curValues.push("New Core Value");
                        updateField('about', 'values', curValues);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Value Point</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(formData.about?.values || [
                      "Holistic Curriculum Approach",
                      "Dedicated & Caring Mentors",
                      "Strong Ethical Foundations",
                      "Co-curricular Excellence",
                    ]).map((val, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                        <span className="text-emerald-400 text-xs font-bold shrink-0">✓</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const cur = Array.isArray(formData.about?.values)
                              ? [...formData.about.values]
                              : [
                                  "Holistic Curriculum Approach",
                                  "Dedicated & Caring Mentors",
                                  "Strong Ethical Foundations",
                                  "Co-curricular Excellence",
                                ];
                            cur[vIdx] = e.target.value;
                            updateField('about', 'values', cur);
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Holistic Curriculum Approach"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = Array.isArray(formData.about?.values)
                              ? [...formData.about.values]
                              : [
                                  "Holistic Curriculum Approach",
                                  "Dedicated & Caring Mentors",
                                  "Strong Ethical Foundations",
                                  "Co-curricular Excellence",
                                ];
                            cur.splice(vIdx, 1);
                            updateField('about', 'values', cur);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove Point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. STATS GRID */}
          {activeSection === 'stats' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">School at a Glance (Stats)</h2>
                <p className="text-sm text-slate-400 mt-1">Configure the 4-column key metrics and counters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {formData.stats.map((stat, idx) => (
                  <div key={stat.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Metric #{idx + 1}
                    </span>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Value (e.g. 400+, 10+)</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[idx].value = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[idx].label = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={stat.description}
                        onChange={(e) => {
                          const newStats = [...formData.stats];
                          newStats[idx].description = e.target.value;
                          setFormData({ ...formData, stats: newStats });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. LEADERSHIP MESSAGES (HEADMASTER & VICE PRINCIPAL) */}
          {activeSection === 'headmaster' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand text-white">Leadership Quotes & Messages</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage quotes from the Headmaster, Vice Principal, and Directors. Select which page each quote appears on (Home, About, or Both).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentQuotes = Array.isArray(formData.leadershipQuotes) && formData.leadershipQuotes.length > 0
                        ? formData.leadershipQuotes
                        : [
                            {
                              id: 'quote-headmaster',
                              ...(formData.headmaster || {}),
                              targetPage: 'home',
                            }
                          ];
                      const newQuote = {
                        id: 'quote-' + Date.now(),
                        badge: "Vice Principal's Message",
                        quote: "“True education harmonizes academic rigor with empathetic mentorship. We empower every learner to discover their unique voice, question boldly, and build purposeful lives.”",
                        name: "Suman Shrestha",
                        role: "Vice Principal",
                        location: "Alchemist Academy, Kathmandu",
                        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
                        targetPage: "about",
                      };
                      const updated = [...currentQuotes, newQuote];
                      const primaryHomeQuote = updated.find(q => q.targetPage === 'home' || q.targetPage === 'both') || updated[0];
                      setFormData({
                        ...formData,
                        leadershipQuotes: updated,
                        headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Leadership Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Quotes Cards List */}
              <div className="space-y-6">
                {(() => {
                  const quotes = Array.isArray(formData.leadershipQuotes) && formData.leadershipQuotes.length > 0
                    ? formData.leadershipQuotes
                    : [
                        {
                          id: 'quote-headmaster',
                          ...(formData.headmaster || {}),
                          targetPage: formData.headmaster?.targetPage || 'home',
                        }
                      ];

                  return quotes.map((q, idx) => (
                    <div key={q.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Leader Message #{idx + 1}: {q.name || q.role}
                          </span>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            q.targetPage === 'home'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : q.targetPage === 'about'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {q.targetPage === 'home' ? '🏠 Shows on Home Page' : q.targetPage === 'about' ? 'ℹ️ Shows on About Section' : '🌐 Shows on Both Views'}
                          </span>
                        </div>

                        {quotes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete quote for ${q.name || q.role}?`)) {
                                const updated = quotes.filter((_, i) => i !== idx);
                                const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                                setFormData({
                                  ...formData,
                                  leadershipQuotes: updated,
                                  headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                                });
                              }
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Quote</span>
                          </button>
                        )}
                      </div>

                      {/* Where should this quote appear */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Display Location Target
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, targetPage: 'home' } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              q.targetPage === 'home'
                                ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold shadow'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            <span className="text-xl">🏠</span>
                            <div>
                              <div className="text-xs font-bold">Home Page Only</div>
                              <div className="text-[10px] opacity-70">Main Landing Page message</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, targetPage: 'about' } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              q.targetPage === 'about'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-300 font-bold shadow'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            <span className="text-xl">ℹ️</span>
                            <div>
                              <div className="text-xs font-bold">About Section Only</div>
                              <div className="text-[10px] opacity-70">Appears on About Us page</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, targetPage: 'both' } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              q.targetPage === 'both'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold shadow'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            <span className="text-xl">🌐</span>
                            <div>
                              <div className="text-xs font-bold">Both Home & About</div>
                              <div className="text-[10px] opacity-70">Available across both views</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Leader details inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Leader Name
                          </label>
                          <input
                            type="text"
                            value={q.name || ''}
                            onChange={(e) => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, name: e.target.value } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                            placeholder="e.g. Karmendra Vimal / Suman Shrestha"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Role / Designation
                          </label>
                          <input
                            type="text"
                            value={q.role || ''}
                            onChange={(e) => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, role: e.target.value } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                            placeholder="e.g. Headmaster / Vice Principal"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                            Badge Tag
                          </label>
                          <input
                            type="text"
                            value={q.badge || ''}
                            onChange={(e) => {
                              const updated = quotes.map((item, i) => i === idx ? { ...item, badge: e.target.value } : item);
                              const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                              setFormData({
                                ...formData,
                                leadershipQuotes: updated,
                                headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                            placeholder="e.g. Headmaster's Desk / Vice Principal's Message"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Location / Campus Subtitle
                        </label>
                        <input
                          type="text"
                          value={q.location || ''}
                          onChange={(e) => {
                            const updated = quotes.map((item, i) => i === idx ? { ...item, location: e.target.value } : item);
                            const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                            setFormData({
                              ...formData,
                              leadershipQuotes: updated,
                              headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="e.g. Alchemist Academy, Kathmandu"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Quote Body Text
                        </label>
                        <textarea
                          rows={3}
                          value={q.quote || ''}
                          onChange={(e) => {
                            const updated = quotes.map((item, i) => i === idx ? { ...item, quote: e.target.value } : item);
                            const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                            setFormData({
                              ...formData,
                              leadershipQuotes: updated,
                              headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-400"
                          placeholder="Enter leadership message or vision statement..."
                        />
                      </div>

                      <ImageFieldWithPicker
                        label={`${q.role || 'Leader'} Official Portrait`}
                        value={q.image || ''}
                        onChange={(url) => {
                          const updated = quotes.map((item, i) => i === idx ? { ...item, image: url } : item);
                          const primaryHomeQuote = updated.find(item => item.targetPage === 'home' || item.targetPage === 'both') || updated[0];
                          setFormData({
                            ...formData,
                            leadershipQuotes: updated,
                            headmaster: primaryHomeQuote ? { ...primaryHomeQuote } : formData.headmaster,
                          });
                        }}
                        category="Leadership & Staff"
                        placeholder="e.g. https://... or choose from Media Library"
                        helpText="Displayed in the circular avatar block beside the vision statement."
                      />
                    </div>
                  ));
                })()}
              </div>

              {/* Bottom save bar */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Leadership Messages</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. CURRICULUM OVERVIEW */}
          {activeSection === 'curriculum' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Curriculum Overview Subjects</h2>
                <p className="text-sm text-slate-400 mt-1">Manage interactive subject cards (Fine Arts, Music, Computer Science, etc.).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {formData.curriculum.map((subj, idx) => (
                  <div key={subj.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {subj.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {subj.badge}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Subject Title</label>
                      <input
                        type="text"
                        value={subj.title}
                        onChange={(e) => {
                          const newCurriculum = [...formData.curriculum];
                          newCurriculum[idx].title = e.target.value;
                          setFormData({ ...formData, curriculum: newCurriculum });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={subj.badge}
                        onChange={(e) => {
                          const newCurriculum = [...formData.curriculum];
                          newCurriculum[idx].badge = e.target.value;
                          setFormData({ ...formData, curriculum: newCurriculum });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <ImageFieldWithPicker
                      label="Subject Cover Image"
                      value={subj.image}
                      onChange={(url) => {
                        const newCurriculum = [...formData.curriculum];
                        newCurriculum[idx].image = url;
                        setFormData({ ...formData, curriculum: newCurriculum });
                      }}
                      category="Academics & STEM"
                      placeholder="e.g. https://... or select from Media Library"
                    />

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={subj.description}
                        onChange={(e) => {
                          const newCurriculum = [...formData.curriculum];
                          newCurriculum[idx].description = e.target.value;
                          setFormData({ ...formData, curriculum: newCurriculum });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. CO-CURRICULAR */}
          {activeSection === 'cocurricular' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand text-white">Co-curricular Activities</h2>
                  <p className="text-sm text-slate-400 mt-1">Customize feature cards, category tags, banner photos, and key bullet points.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newAct = {
                      id: Date.now(),
                      title: "New Student Activity",
                      subtitle: "Developing creativity, leadership, and athletic skill",
                      tag: "Student Club",
                      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
                      highlights: [
                        "Dedicated weekly coaching and mentoring",
                        "Inter-school competitions and festivals",
                        "Creative exploration and teamwork",
                      ],
                    };
                    const cur = Array.isArray(formData.coCurricular) ? [...formData.coCurricular] : [];
                    setFormData({ ...formData, coCurricular: [newAct, ...cur] });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Activity</span>
                </button>
              </div>

              <div className="space-y-6">
                {(Array.isArray(formData.coCurricular) ? formData.coCurricular : []).map((act, idx) => (
                  <div key={act.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Activity #{idx + 1}:
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {act.title || 'Untitled Activity'}
                        </span>
                        {act.tag && (
                          <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            {act.tag}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete activity "${act.title}"?`)) {
                            const newActs = formData.coCurricular.filter((_, i) => i !== idx);
                            setFormData({ ...formData, coCurricular: newActs });
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Activity Title</label>
                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => {
                            const newAct = [...formData.coCurricular];
                            newAct[idx].title = e.target.value;
                            setFormData({ ...formData, coCurricular: newAct });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Tag / Badge</label>
                        <input
                          type="text"
                          value={act.tag || ''}
                          onChange={(e) => {
                            const newAct = [...formData.coCurricular];
                            newAct[idx].tag = e.target.value;
                            setFormData({ ...formData, coCurricular: newAct });
                          }}
                          placeholder="e.g. Physical Health, Literary & Media"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtitle / Short Description</label>
                      <input
                        type="text"
                        value={act.subtitle}
                        onChange={(e) => {
                          const newAct = [...formData.coCurricular];
                          newAct[idx].subtitle = e.target.value;
                          setFormData({ ...formData, coCurricular: newAct });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <ImageFieldWithPicker
                      label="Activity Banner Image"
                      value={act.image}
                      onChange={(url) => {
                        const newAct = [...formData.coCurricular];
                        newAct[idx].image = url;
                        setFormData({ ...formData, coCurricular: newAct });
                      }}
                      category="Campus & Events"
                      placeholder="e.g. https://... or select from Media Library"
                    />

                    {/* Highlights / Points Editor */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Key Highlights / Feature Points ({Array.isArray(act.highlights) ? act.highlights.length : 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newAct = [...formData.coCurricular];
                            const curHighlights = Array.isArray(newAct[idx].highlights) ? [...newAct[idx].highlights] : [];
                            curHighlights.push("New highlight point");
                            newAct[idx] = { ...newAct[idx], highlights: curHighlights };
                            setFormData({ ...formData, coCurricular: newAct });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Point</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(Array.isArray(act.highlights) ? act.highlights : []).map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                            <span className="text-emerald-400 text-xs font-bold shrink-0">✓</span>
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => {
                                const newAct = [...formData.coCurricular];
                                const curHighlights = [...(newAct[idx].highlights || [])];
                                curHighlights[pIdx] = e.target.value;
                                newAct[idx] = { ...newAct[idx], highlights: curHighlights };
                                setFormData({ ...formData, coCurricular: newAct });
                              }}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              placeholder="e.g. Inter-school track and field tournaments"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newAct = [...formData.coCurricular];
                                const curHighlights = [...(newAct[idx].highlights || [])];
                                curHighlights.splice(pIdx, 1);
                                newAct[idx] = { ...newAct[idx], highlights: curHighlights };
                                setFormData({ ...formData, coCurricular: newAct });
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Remove Point"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. BLOG & ARTICLES */}
          {activeSection === 'blogs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand text-white">School Blog & News Articles</h2>
                  <p className="text-sm text-slate-400 mt-1">Publish news, edit campus articles, change images, and authors.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newBlog = {
                        id: Date.now(),
                        title: "New School Announcement",
                        category: "Campus Events",
                        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        author: "Administration",
                        readTime: "3 min read",
                        summary: "A fresh update on upcoming events, academic notices, and school activities.",
                        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
                        content: "Full announcement content details here. You can add paragraphs explaining the update to parents and students.",
                      };
                      const currentBlogs = Array.isArray(formData.blogs) ? formData.blogs : [];
                      setFormData({ ...formData, blogs: [newBlog, ...currentBlogs] });
                      setBlogAddedNotice(true);
                      setTimeout(() => setBlogAddedNotice(false), 6000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Article</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {blogAddedNotice && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>New draft article added to the top! You can fill in the title, content, and image below, then click "Save Changes" to publish.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBlogAddedNotice(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer ml-3"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {(() => {
                  const blogsList = Array.isArray(formData.blogs) ? formData.blogs : [];
                  if (blogsList.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-3xl p-6">
                        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-slate-300">No blog articles yet</h4>
                        <p className="text-xs text-slate-500 mt-1">Click "Add New Article" above to create your first article.</p>
                      </div>
                    );
                  }

                  return blogsList.map((post, idx) => (
                    <div key={post.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Article #{idx + 1}: {post.title || 'Untitled'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${post.title || 'this article'}"?`)) {
                              const filtered = blogsList.filter((_, i) => i !== idx);
                              setFormData({ ...formData, blogs: filtered });
                            }
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Article</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={post.title || ''}
                            onChange={(e) => {
                              const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, title: e.target.value } : b);
                              setFormData({ ...formData, blogs: newBlogs });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Category</label>
                          <input
                            type="text"
                            value={post.category || ''}
                            onChange={(e) => {
                              const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, category: e.target.value } : b);
                              setFormData({ ...formData, blogs: newBlogs });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Date</label>
                          <input
                            type="text"
                            value={post.date || ''}
                            onChange={(e) => {
                              const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, date: e.target.value } : b);
                              setFormData({ ...formData, blogs: newBlogs });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Author</label>
                          <input
                            type="text"
                            value={post.author || ''}
                            onChange={(e) => {
                              const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, author: e.target.value } : b);
                              setFormData({ ...formData, blogs: newBlogs });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Read Time</label>
                          <input
                            type="text"
                            value={post.readTime || ''}
                            onChange={(e) => {
                              const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, readTime: e.target.value } : b);
                              setFormData({ ...formData, blogs: newBlogs });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <ImageFieldWithPicker
                        label="Featured Article Image"
                        value={post.image || ''}
                        onChange={(url) => {
                          const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, image: url } : b);
                          setFormData({ ...formData, blogs: newBlogs });
                        }}
                        category="Campus & Events"
                        placeholder="e.g. https://... or select from Media Library"
                      />

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Summary (Short Intro)</label>
                        <textarea
                          rows={2}
                          value={post.summary || ''}
                          onChange={(e) => {
                            const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, summary: e.target.value } : b);
                            setFormData({ ...formData, blogs: newBlogs });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Article Content</label>
                        <textarea
                          rows={4}
                          value={post.content || ''}
                          onChange={(e) => {
                            const newBlogs = blogsList.map((b, i) => i === idx ? { ...b, content: e.target.value } : b);
                            setFormData({ ...formData, blogs: newBlogs });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          placeholder="Type full article content and paragraphs here..."
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Bottom save bar */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Blog Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* 9. ADMISSIONS CTA */}
          {activeSection === 'admissions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Admissions Call-to-Action</h2>
                <p className="text-sm text-slate-400 mt-1">Configure the enrollment prompt, hotlines, and callout banner.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Banner Title Question
                  </label>
                  <input
                    type="text"
                    value={formData.admissions.title}
                    onChange={(e) => updateField('admissions', 'title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Description Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={formData.admissions.description}
                    onChange={(e) => updateField('admissions', 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Admissions Phone
                    </label>
                    <input
                      type="text"
                      value={formData.admissions.phone}
                      onChange={(e) => updateField('admissions', 'phone', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Admissions Email
                    </label>
                    <input
                      type="email"
                      value={formData.admissions.email}
                      onChange={(e) => updateField('admissions', 'email', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.admissions.btnText}
                    onChange={(e) => updateField('admissions', 'btnText', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

              </div>
            </div>
          )}

          {/* 10. FOOTER & ADDRESS */}
          {activeSection === 'footer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Footer & Contact Information</h2>
                <p className="text-sm text-slate-400 mt-1">Update physical school address, operational hours, and contact details.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Official Physical Address
                  </label>
                  <input
                    type="text"
                    value={formData.footer.address}
                    onChange={(e) => updateField('footer', 'address', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Office Telephone
                    </label>
                    <input
                      type="text"
                      value={formData.footer.phone}
                      onChange={(e) => updateField('footer', 'phone', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      School Email
                    </label>
                    <input
                      type="email"
                      value={formData.footer.email}
                      onChange={(e) => updateField('footer', 'email', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    value={formData.footer.hours}
                    onChange={(e) => updateField('footer', 'hours', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Google Maps Configuration */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                      Google Maps & Location Integration
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure your direct Google Maps location URL and optional interactive map embed for the Contact Us page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Google Maps Direct Link / Share URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=Alchemist+Academy"
                      value={formData.footer.googleMapsUrl || ''}
                      onChange={(e) => updateField('footer', 'googleMapsUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Used when visitors click "Open in Google Maps" or "Get Driving Directions".
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Interactive Google Maps Embed URL / Iframe Code
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. https://www.google.com/maps/embed?pb=... or full <iframe src='...'></iframe>"
                      value={formData.footer.mapEmbedUrl || ''}
                      onChange={(e) => {
                        let val = e.target.value;
                        const srcMatch = val.match(/src=["']([^"']+)["']/);
                        if (srcMatch && srcMatch[1]) {
                          val = srcMatch[1];
                        }
                        updateField('footer', 'mapEmbedUrl', val);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Paste the Google Maps embed code or URL. If provided, an interactive map appears on the Contact Us page (automatically extracts the URL if you paste a full iframe code).
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Footer Statement / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer.tagline}
                    onChange={(e) => updateField('footer', 'tagline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

              </div>
            </div>
          )}

          {/* 11. CENTRAL MEDIA LIBRARY & ASSETS */}
          {activeSection === 'media' && (
            <MediaLibraryManager />
          )}

          {/* 12. STAFF & TEAM ACCESS (Role-Based Team Management - Superadmin Only) */}
          {activeSection === 'users' && currentUser?.role === 'superadmin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand text-white">Staff Team & Role-Based Access</h2>
                  <p className="text-sm text-slate-400 mt-1">Manage team members, assign granular access tiers, or issue new credentials.</p>
                </div>
              </div>

              {/* Roles Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(ROLES).map(([roleKey, roleInfo]) => (
                  <div key={roleKey} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roleInfo.badgeColor}`}>
                        {roleInfo.title}
                      </span>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {roleInfo.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-900 text-[10px] text-amber-400 font-semibold">
                      Allowed Modules: {roleInfo.allowedSections.length}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Staff Member Form */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Provision New Staff Account</span>
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const cleanUsername = (newStaffUser.username || '').toLowerCase().trim();
                    if (!cleanUsername || !newStaffUser.password || !newStaffUser.name) {
                      alert('Please provide staff name, username, and password.');
                      return;
                    }
                    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
                      alert(`Username "${cleanUsername}" is already in use. Please choose another username.`);
                      return;
                    }

                    addUser({
                      ...newStaffUser,
                      username: cleanUsername,
                      status: 'active',
                    });

                    setNewStaffUser({
                      username: '',
                      name: '',
                      role: 'editor',
                      password: '',
                      department: 'Academics',
                      status: 'active',
                    });
                    alert(`New staff member "${newStaffUser.name}" created successfully with ${ROLES[newStaffUser.role]?.title} permissions.`);
                  }}
                  className="space-y-4 pt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Staff Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RJ Rana"
                        value={newStaffUser.name}
                        onChange={(e) => setNewStaffUser({ ...newStaffUser, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Username (Login ID)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. rjrana"
                        value={newStaffUser.username}
                        onChange={(e) => setNewStaffUser({ ...newStaffUser, username: e.target.value.toLowerCase().trim() })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Assigned Role Tier</label>
                      <select
                        value={newStaffUser.role}
                        onChange={(e) => setNewStaffUser({ ...newStaffUser, role: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        <option value="editor">Content Editor (Blogs, Activities)</option>
                        <option value="admissions">Admissions Officer (Inquiries, Stats)</option>
                        <option value="academic">Academic Coordinator (Curriculum, About)</option>
                        <option value="superadmin">Super Administrator (Full Access)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Science & Technology"
                        value={newStaffUser.department}
                        onChange={(e) => setNewStaffUser({ ...newStaffUser, department: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Security Key / Password</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. StaffPass2026"
                        value={newStaffUser.password}
                        onChange={(e) => setNewStaffUser({ ...newStaffUser, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Staff Account</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Accounts Maintenance Table */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Manage & Maintain Accounts ({users.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      As Superadmin, you can modify roles, reset passwords, change departments, suspend access, or revoke accounts.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 px-3">Name & Department</th>
                        <th className="pb-3 px-3">Username</th>
                        <th className="pb-3 px-3">Role Tier</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3">Password / Key</th>
                        <th className="pb-3 px-3 text-right">Maintain & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map((u) => {
                        const isRoot = u.username === 'admin';
                        const isSelf = currentUser?.id === u.id;
                        const isSuspended = u.status === 'suspended';

                        return (
                          <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">{u.department}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-amber-300">
                              {u.username}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${ROLES[u.role]?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                                {ROLES[u.role]?.title || u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {isSuspended ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
                                  <UserX className="w-3 h-3" /> Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              {u.password}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit / Maintain button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUser(u);
                                    setEditFormData({
                                      name: u.name,
                                      username: u.username,
                                      role: u.role,
                                      password: u.password,
                                      department: u.department || '',
                                      status: u.status || 'active',
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                                  title="Edit role, details, or password"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                {/* Suspend / Activate toggle */}
                                {!isRoot && !isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextStatus = isSuspended ? 'active' : 'suspended';
                                      updateUser(u.id, { status: nextStatus });
                                    }}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                                      isSuspended
                                        ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800'
                                        : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800'
                                    }`}
                                    title={isSuspended ? 'Reactivate account' : 'Temporarily suspend account'}
                                  >
                                    {isSuspended ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                                  </button>
                                )}

                                {/* Revoke / Delete button */}
                                {isRoot ? (
                                  <span className="text-[10px] text-slate-500 italic px-2">Protected Root</span>
                                ) : isSelf ? (
                                  <span className="text-[10px] text-slate-500 italic px-2">Current Session</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to completely delete account "${u.name}" (@${u.username})? This action cannot be undone.`)) {
                                        deleteUser(u.id);
                                      }
                                    }}
                                    className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 p-1 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                                    title="Revoke and delete account permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Superadmin User Maintenance Modal */}
              {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Edit2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Maintain Staff Account</h4>
                          <p className="text-xs text-slate-400">Editing @{editingUser.username} ({editingUser.name})</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const cleanUsername = editFormData.username.toLowerCase().trim();
                        if (!cleanUsername || !editFormData.name || !editFormData.password) {
                          alert('Please fill out all required fields.');
                          return;
                        }

                        // Check username clash
                        const clash = users.some(
                          (u) => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername
                        );
                        if (clash) {
                          alert(`Username "${cleanUsername}" is already taken by another account.`);
                          return;
                        }

                        // Prevent locking out superadmins
                        if (
                          editingUser.role === 'superadmin' &&
                          editFormData.role !== 'superadmin' &&
                          users.filter((u) => u.role === 'superadmin').length <= 1
                        ) {
                          alert('You cannot demote the only remaining Super Administrator account.');
                          return;
                        }

                        updateUser(editingUser.id, {
                          ...editFormData,
                          username: cleanUsername,
                        });

                        setEditingUser(null);
                        alert(`Account details for ${editFormData.name} successfully updated.`);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Staff Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Username (Login ID)
                          </label>
                          <input
                            type="text"
                            required
                            disabled={editingUser.username === 'admin'}
                            value={editFormData.username}
                            onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value.toLowerCase().trim() })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none disabled:opacity-50"
                          />
                          {editingUser.username === 'admin' && (
                            <span className="text-[10px] text-slate-500">Root username cannot be renamed.</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Assigned Role Tier
                          </label>
                          <select
                            value={editFormData.role}
                            disabled={editingUser.username === 'admin'}
                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
                          >
                            <option value="superadmin">Super Administrator (Full Unconstrained Access)</option>
                            <option value="editor">Content Editor (Blogs, Activities, Curriculum)</option>
                            <option value="admissions">Admissions Officer (Inquiries, Enrollment, Stats)</option>
                            <option value="academic">Academic Coordinator (Curriculum, Faculty, About)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Account Status
                          </label>
                          <select
                            value={editFormData.status}
                            disabled={editingUser.username === 'admin' || currentUser?.id === editingUser.id}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none disabled:opacity-50"
                          >
                            <option value="active">Active (Can Log In)</option>
                            <option value="suspended">Suspended (Access Blocked)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            value={editFormData.department}
                            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Password / Security Key
                          </label>
                          <input
                            type="text"
                            required
                            value={editFormData.password}
                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
                        <Key className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-200">Role Preview: </span>
                          {ROLES[editFormData.role]?.description}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================================
              2. ACADEMIC ERP WORKSPACE MODULES
              ========================================================================= */}

          {/* ERP 1. ADMISSIONS & LEADS CRM */}
          {activeSection === 'crm' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand">Admissions & Enrollment CRM</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Track prospective student inquiries, follow-up calls, campus visits, and new enrollments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Inquiry</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Total Inquiries</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold font-serif-brand">{leads.length}</div>
                  <div className="text-[10px] text-amber-500 font-medium mt-1">2026 Academic Batch</div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>New Leads</span>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-serif-brand text-blue-400">
                    {leads.filter((l) => l.status === 'New').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Requires initial call</div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Campus Visits</span>
                    <Compass className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-serif-brand text-purple-400">
                    {leads.filter((l) => l.status === 'Campus Visit').length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Scheduled appointments</div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Enrolled</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-serif-brand text-emerald-400">
                    {leads.filter((l) => l.status === 'Enrolled').length}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 font-medium mt-1">Admitted & registered</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    placeholder="Search candidate, parent, phone..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-amber-500 transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {['all', 'New', 'Contacted', 'Campus Visit', 'Enrolled'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setLeadStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        leadStatusFilter === status
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {status === 'all' ? 'All Leads' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              } shadow-sm`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Student & Grade</th>
                        <th className="py-3 px-4">Parent Details</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Inquiry Notes</th>
                        <th className="py-3 px-4">Pipeline Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {leads
                        .filter((l) => {
                          const matchesFilter = leadStatusFilter === 'all' || l.status === leadStatusFilter;
                          const matchesSearch =
                            l.studentName.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            l.parentName.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            l.phone.includes(crmSearch) ||
                            l.notes.toLowerCase().includes(crmSearch.toLowerCase());
                          return matchesFilter && matchesSearch;
                        })
                        .map((lead) => {
                          const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                          return (
                            <tr key={lead.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}>
                              <td className="py-3.5 px-4 font-semibold">
                                <div className="text-sm font-bold">{lead.studentName}</div>
                                <div className="text-[11px] text-amber-500">{lead.grade}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-medium">{lead.parentName}</div>
                                <div className="text-[10px] text-slate-400">{lead.email}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </a>
                              </td>
                              <td className="py-3.5 px-4 max-w-xs text-slate-400">
                                <span className="line-clamp-2">{lead.notes || '—'}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  value={lead.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    setLeads(leads.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)));
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                    lead.status === 'Enrolled'
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : lead.status === 'Campus Visit'
                                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                      : lead.status === 'Contacted'
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  }`}
                                >
                                  <option value="New" className="bg-slate-900 text-white">New</option>
                                  <option value="Contacted" className="bg-slate-900 text-white">Contacted</option>
                                  <option value="Campus Visit" className="bg-slate-900 text-white">Campus Visit</option>
                                  <option value="Enrolled" className="bg-slate-900 text-white">Enrolled</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href={`https://wa.me/977${cleanPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                                    title="WhatsApp Parent"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Delete lead record for ${lead.studentName}?`)) {
                                        setLeads(leads.filter((l) => l.id !== lead.id));
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Delete Lead"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ERP 2. STUDENT SIS & ID CARDS */}
          {activeSection === 'sis' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand">Student Information System (SIS)</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active student directory, parent contacts, terminal exam records & instant PVC digital ID badges.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Class 10 - Section A • {classRoster.length} Active Students
                  </span>
                </div>
              </div>

              {/* SIS Search */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sisSearch}
                    onChange={(e) => setSisSearch(e.target.value)}
                    placeholder="Search by student name, roll no, or ID..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-amber-500 transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-400 hidden sm:block">
                  Class Teacher: <span className="font-semibold text-amber-500">RJ Rana</span>
                </div>
              </div>

              {/* SIS Roster Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              } shadow-sm`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Roll</th>
                        <th className="py-3 px-4">Student ID & Name</th>
                        <th className="py-3 px-4">Gender</th>
                        <th className="py-3 px-4">Guardian & Phone</th>
                        <th className="py-3 px-4">Terminal Exam</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {classRoster
                        .filter((student) => {
                          const query = sisSearch.toLowerCase();
                          return (
                            student.name.toLowerCase().includes(query) ||
                            (student.id && student.id.toLowerCase().includes(query)) ||
                            String(student.rollNo).includes(query) ||
                            (student.guardian && student.guardian.toLowerCase().includes(query))
                          );
                        })
                        .map((student) => (
                          <tr key={student.id || student.rollNo} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}>
                            <td className="py-3.5 px-4 font-bold text-amber-500">
                              #{student.rollNo}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-sm">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{student.id}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">{student.gender || '—'}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium">{student.guardian || 'Guardian'}</div>
                              <a href={`tel:${student.contact}`} className="text-[10px] text-emerald-400 font-mono hover:underline">
                                {student.contact}
                              </a>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-200">
                                {(student.examTheory || 70) + (student.examPractical || 24)}/100
                              </span>
                              <span className="ml-1 text-[10px] text-emerald-400 font-bold">
                                (A)
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                student.attendanceStatus === 'present'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : student.attendanceStatus === 'late'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}>
                                {student.attendanceStatus || 'present'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentForID({
                                      id: student.id || `STU-100${student.rollNo}`,
                                      name: student.name,
                                      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
                                      grade: 'Grade 10',
                                      section: 'Section A',
                                      rollNo: student.rollNo,
                                      registrationNo: `AA-2026-${student.rollNo < 10 ? '0' + student.rollNo : student.rollNo}`,
                                      academicYear: '2026 / 2083 BS',
                                      bloodGroup: 'O+',
                                      dob: '2010-04-18',
                                      guardianName: student.guardian || 'Sunita Sharma',
                                      guardianPhone: student.contact || '+977 9841234567',
                                      address: 'Jorpati, Kathmandu, Nepal',
                                      busRoute: 'Route 3 (Eastern Belt)',
                                      classTeacher: 'RJ Rana (Senior Academic Guide)',
                                      emergencyContact: student.contact || '+977 9841234567',
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow transition-all cursor-pointer"
                                  title="Generate Digital PVC Student Badge"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>PVC ID Card</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentProfile(student)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                                  title="View Quick Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ERP 3. FACULTY & ROSTER */}
          {activeSection === 'faculty' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand">Faculty & Academic Guides</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Teaching staff, departmental coordinators, classroom allocations and teacher cockpit access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('teacher-portal')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch Teacher Cockpit</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>

              {/* Lead Faculty Member Spotlight */}
              <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                    alt="RJ Rana"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">RJ Rana</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Senior Academic Guide
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mathematics & STEM Sciences Coordinator • Class Teacher (Grade 10-A)
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                      <span>Room: 104</span>
                      <span>•</span>
                      <span>+977 9851098765</span>
                      <span>•</span>
                      <span>rj.rana@alchemist.edu.np</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl border text-center ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-lg font-bold text-amber-500">42</div>
                    <div className="text-[10px] text-slate-400">Class Students</div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-center ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-lg font-bold text-emerald-400">95.2%</div>
                    <div className="text-[10px] text-slate-400">Attendance</div>
                  </div>
                </div>
              </div>

              {/* Department Faculty Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Dr. Sita Poudel', dept: 'Science & Technology HOD', room: 'Physics Lab 102', email: 'sita.p@alchemist.edu.np', classes: 'Grade 9, 10' },
                  { name: 'Bikram Sharma', dept: 'English Language & Literature', room: 'Faculty 105', email: 'bikram.s@alchemist.edu.np', classes: 'Grade 8, 9, 10' },
                  { name: 'Anish Tamang', dept: 'Computer Science & AI Lab', room: 'Robotics Lab 201', email: 'anish.t@alchemist.edu.np', classes: 'Grade 7, 8, 9, 10' },
                ].map((f, i) => (
                  <div key={i} className={`p-5 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{f.name}</span>
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xs text-amber-500 font-medium">{f.dept}</div>
                    <div className="text-[11px] text-slate-400">{f.room} • {f.classes}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{f.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERP 4. CDC & NEB GRADING ENGINE */}
          {activeSection === 'cdc-grading' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand">Nepal CDC & NEB Grading Engine</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Standard Curriculum Development Center (CDC) 8-point letter grading scale and SEE Secondary level weighting system.
                </p>
              </div>

              {/* CDC Scale Matrix Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              } shadow-sm`}>
                <div className={`p-4 border-b font-bold text-xs flex items-center justify-between ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span>Official CDC 8-Point Grading Matrix (Grades 1 to 10)</span>
                  <span className="text-amber-500 font-mono">NEB Standards • 2083 BS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Score Range</th>
                        <th className="py-3 px-4">Letter Grade</th>
                        <th className="py-3 px-4">Grade Point (GPA)</th>
                        <th className="py-3 px-4">Performance Descriptor</th>
                        <th className="py-3 px-4">NEB Remarks</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {[
                        { range: '90% and above', grade: 'A+', gpa: '4.0', desc: 'Outstanding', remarks: 'Exceptional mastery across theoretical & practical rubrics', color: 'text-emerald-400' },
                        { range: '80% to below 90%', grade: 'A', gpa: '3.6', desc: 'Excellent', remarks: 'Superior conceptual understanding and problem solving', color: 'text-emerald-400' },
                        { range: '70% to below 80%', grade: 'B+', gpa: '3.2', desc: 'Very Good', remarks: 'High proficiency in learning competencies', color: 'text-blue-400' },
                        { range: '60% to below 70%', grade: 'B', gpa: '2.8', desc: 'Good', remarks: 'Satisfactory application of required syllabus benchmarks', color: 'text-blue-400' },
                        { range: '50% to below 60%', grade: 'C+', gpa: '2.4', desc: 'Satisfactory', remarks: 'Adequate grasp of core concepts with room for progress', color: 'text-amber-400' },
                        { range: '40% to below 50%', grade: 'C', gpa: '2.0', desc: 'Acceptable', remarks: 'Meets minimum grade advancement requirements', color: 'text-amber-400' },
                        { range: '35% to below 40%', grade: 'D', gpa: '1.6', desc: 'Basic', remarks: 'Elementary level achievement; requires remedial guidance', color: 'text-orange-400' },
                        { range: 'Below 35%', grade: 'NG', gpa: '0.0', desc: 'Non-Graded', remarks: 'Not qualified for credit certification; mandatory re-exam', color: 'text-rose-400' },
                      ].map((row, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}>
                          <td className="py-3 px-4 font-mono font-medium">{row.range}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-bold font-mono ${row.color}`}>{row.grade}</span>
                          </td>
                          <td className="py-3 px-4 font-bold font-mono">{row.gpa}</td>
                          <td className="py-3 px-4 font-semibold">{row.desc}</td>
                          <td className="py-3 px-4 text-slate-400 max-w-sm">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Theory + Practical Weightage Rules */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
                <h4 className="font-bold text-sm text-amber-500">NEB Secondary Assessment Weights (Class 9 & 10)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold mb-1">Theoretical Evaluation (75 Marks)</div>
                    <p className="text-slate-400 leading-relaxed">
                      Assessed through 3-hour terminal examinations covering knowledge, comprehension, application, and higher-ability reasoning. A minimum of 35% (26.25 marks) is strictly required to pass theory.
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold mb-1">Internal / Practical Evaluation (25 Marks)</div>
                    <p className="text-slate-400 leading-relaxed">
                      Formative continuous assessment composed of laboratory records (10 marks), attendance & punctuality (4 marks), project work & presentations (6 marks), and terminal terminal tests (5 marks). Minimum 40% (10 marks) required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ERP 5. ATTENDANCE & TIMETABLE */}
          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand">Attendance Analytics & Timetable</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Today's roll call status, Nepali calendar (Bikram Sambat 2083) logs and period schedules.
                  </p>
                </div>
                <div className="text-xs font-mono px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  Today: Ashwin 28, 2083 BS • Punctuality 95.2%
                </div>
              </div>

              {/* Class Timetable Grid */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              } shadow-sm`}>
                <div className={`p-4 border-b font-bold text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  Class 10-A Daily Academic Timetable
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { period: 'Period 1 (09:45 - 10:30)', subject: 'Compulsory Mathematics', teacher: 'RJ Rana', room: 'Room 104' },
                    { period: 'Period 2 (10:30 - 11:15)', subject: 'Science & Technology', teacher: 'Dr. Sita Poudel', room: 'Physics Lab' },
                    { period: 'Period 3 (11:15 - 12:00)', subject: 'English Communication', teacher: 'Bikram Sharma', room: 'Room 104' },
                    { period: 'Break (12:00 - 12:45)', subject: 'Lunch & Social Hub', teacher: 'Campus Grounds', room: 'Cafeteria' },
                    { period: 'Period 4 (12:45 - 01:30)', subject: 'Social Studies & Culture', teacher: 'Shila Shrestha', room: 'Room 104' },
                    { period: 'Period 5 (01:30 - 02:15)', subject: 'Optional Mathematics', teacher: 'RJ Rana', room: 'Room 104' },
                    { period: 'Period 6 (02:15 - 03:00)', subject: 'Computer & AI Science', teacher: 'Anish Tamang', room: 'IT Lab 2' },
                    { period: 'Period 7 (03:00 - 03:45)', subject: 'ECA / Sports & Library', teacher: 'Sports Coaches', room: 'Playground' },
                  ].map((p, idx) => (
                    <div key={idx} className={`p-3.5 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="text-[10px] text-amber-500 font-bold uppercase">{p.period}</div>
                      <div className="text-xs font-bold mt-1">{p.subject}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.teacher} • {p.room}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. FINANCE & BILLING WORKSPACE MODULES
              ========================================================================= */}

          {/* FINANCE 1. CASHIER TERMINAL */}
          {activeSection === 'cashier' && <CashierFeeCollector />}

          {/* FINANCE 2. FEE STRUCTURES & TARIFFS */}
          {activeSection === 'fee-structures' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif-brand">Fee Structures & Tariffs</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Approved institutional fee schedules for Academic Session 2026 / 2083 BS.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Wing */}
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                    <h3 className="font-bold text-base">Primary Wing (Grades 1 - 5)</h3>
                    <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                      Foundation
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Monthly Tuition:</span>
                      <span className="font-bold font-mono">NPR 4,500</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Terminal Exam Fee:</span>
                      <span className="font-bold font-mono">NPR 1,200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">ECA & Activity Charge:</span>
                      <span className="font-bold font-mono">NPR 800</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Annual Development:</span>
                      <span className="font-bold font-mono">NPR 6,000</span>
                    </div>
                  </div>
                </div>

                {/* Lower Secondary */}
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                    <h3 className="font-bold text-base">Lower Secondary (Grades 6 - 8)</h3>
                    <span className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                      Intermediate
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Monthly Tuition:</span>
                      <span className="font-bold font-mono">NPR 6,200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Computer & Robotics Lab:</span>
                      <span className="font-bold font-mono">NPR 1,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Terminal Exam Fee:</span>
                      <span className="font-bold font-mono">NPR 1,500</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Annual Development:</span>
                      <span className="font-bold font-mono">NPR 7,500</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Level */}
                <div className={`p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                    <h3 className="font-bold text-base">Secondary Wing (Grades 9 - 10)</h3>
                    <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      SEE Batch
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Monthly Tuition:</span>
                      <span className="font-bold font-mono">NPR 8,500</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Science & STEM Lab:</span>
                      <span className="font-bold font-mono">NPR 2,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Pre-Board & Terminal Exam:</span>
                      <span className="font-bold font-mono">NPR 2,500</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Annual Development:</span>
                      <span className="font-bold font-mono">NPR 9,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transit Bus Routes */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h4 className="font-bold text-sm text-amber-500 mb-3">Bus Transit Monthly Subscriptions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold">Zone 1: Local Eastern Belt</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Jorpati, Gokarna, Dakshinkali Hub</div>
                    <div className="font-bold font-mono text-amber-500 mt-2">NPR 2,200 / month</div>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold">Zone 2: Ring Road Corridor</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Bouddha, Chabahil, Gaushala, Sukedhara</div>
                    <div className="font-bold font-mono text-amber-500 mt-2">NPR 2,800 / month</div>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-bold">Zone 3: Extended Express Belt</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Baneshwor, Koteshwor, Maharajgunj</div>
                    <div className="font-bold font-mono text-amber-500 mt-2">NPR 3,400 / month</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINANCE 3. AUDIT TRAIL & PAYMENT RECEIPTS */}
          {activeSection === 'audit-trail' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif-brand">Payment Receipts & Reconciliation</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Live digital receipt log across eSewa, Khalti, FonePay QR, and cash counters.
                  </p>
                </div>
                <div className="text-xs font-mono px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  Total Cleared Today: NPR 34,000
                </div>
              </div>

              {/* Transactions Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
              } shadow-sm`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Receipt ID</th>
                        <th className="py-3 px-4">Student & Invoice</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Ref Number</th>
                        <th className="py-3 px-4 text-right">Amount Paid</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                      {(bills?.paymentHistory || [
                        { id: 'PAY-1049', invoiceNo: 'INV-2026-09', description: 'Bhadra Tuition & Transport', date: '2026-09-08', amount: 8500, method: 'eSewa Mobile Wallet', refNo: 'ESEWA-98418902', status: 'paid' },
                        { id: 'PAY-1032', invoiceNo: 'INV-2026-08', description: 'Shrawan Tuition & Labs', date: '2026-08-05', amount: 8500, method: 'FonePay QR', refNo: 'FONE-44921029', status: 'paid' },
                        { id: 'PAY-1011', invoiceNo: 'INV-2026-07', description: 'Ashad Tuition Fee', date: '2026-07-06', amount: 8500, method: 'Cash Counter', refNo: 'CSH-00291', status: 'paid' },
                      ]).map((item, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'}>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-500">{item.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold">Aarav Sharma (STU-1001)</div>
                            <div className="text-[10px] text-slate-400">{item.description} • {item.invoiceNo}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{item.date}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-300">{item.method}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{item.refNo}</td>
                          <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-400">
                            NPR {item.amount?.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              Cleared
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: Digital Student ID Badge */}
      {selectedStudentForID && (
        <DigitalStudentIDModal
          student={selectedStudentForID}
          onClose={() => setSelectedStudentForID(null)}
        />
      )}

      {/* MODAL 2: Student Quick Profile */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Student Academic Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 font-bold text-xl flex items-center justify-center border border-amber-500/40">
                  {selectedStudentProfile.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold">{selectedStudentProfile.name}</h4>
                  <p className="text-slate-400">Roll #{selectedStudentProfile.rollNo} • Class 10 (Section A)</p>
                  <p className="text-amber-500 font-mono mt-0.5">{selectedStudentProfile.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Guardian</span>
                  <span className="font-bold text-xs">{selectedStudentProfile.guardian || 'Sunita Sharma'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
                  <a href={`tel:${selectedStudentProfile.contact}`} className="font-bold text-emerald-400 font-mono text-xs hover:underline">
                    {selectedStudentProfile.contact}
                  </a>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Terminal Marks</span>
                  <span className="font-bold text-xs">
                    {(selectedStudentProfile.examTheory || 70) + (selectedStudentProfile.examPractical || 24)} / 100
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attendance</span>
                  <span className="font-bold text-emerald-400 uppercase text-xs">
                    {selectedStudentProfile.attendanceStatus || 'present'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Academic Guidance Note</span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  {selectedStudentProfile.remarks || 'Active classroom participation and strong conceptual discipline in mathematics.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Lead */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">New Admission Inquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newLeadForm.studentName || !newLeadForm.phone) return;
                const newLead = {
                  id: `LD-${Date.now().toString().slice(-4)}`,
                  studentName: newLeadForm.studentName,
                  parentName: newLeadForm.parentName,
                  phone: newLeadForm.phone,
                  email: newLeadForm.email,
                  grade: newLeadForm.grade,
                  date: new Date().toISOString().split('T')[0],
                  status: 'New',
                  notes: newLeadForm.notes,
                };
                setLeads([newLead, ...leads]);
                setShowAddLeadModal(false);
                setNewLeadForm({
                  studentName: '',
                  parentName: '',
                  phone: '',
                  email: '',
                  grade: 'Grade 10',
                  notes: '',
                });
              }}
              className="py-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student / Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.studentName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, studentName: e.target.value })}
                  placeholder="e.g. Sambridh Gautam"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={newLeadForm.parentName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, parentName: e.target.value })}
                    placeholder="e.g. Madhav Gautam"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Class Applying For</label>
                  <select
                    value={newLeadForm.grade}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, grade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="parent@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inquiry / Consultation Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="e.g. Inquired about school bus to Jorpati, hostel, and science scholarship..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

