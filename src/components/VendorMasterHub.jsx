import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Layers,
  DollarSign,
  Users,
  Search,
  Filter,
  ExternalLink,
  Plus,
  Key,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Globe,
  Database,
  RefreshCw,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  Lock,
  Unlock,
  Settings,
  Sliders,
  Share2,
  CheckSquare,
  Square,
  Award,
  ChevronRight,
  TrendingUp,
  Cpu,
  LogOut,
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { initialVendorData } from '../data/vendorData';
import VendorLoginScreen from './portal/VendorLoginScreen';

const VendorMasterHub = () => {
  const { siteData, navigateTo, isDark, toggleTheme } = useSiteData();
  const { currentUser, isAuthenticated: isSuperadminAuthenticated } = useAuth();

  // Master Vendor Authentication Gate (Exclusively for Rishi Kesh Rana)
  const [isVendorAuthenticated, setIsVendorAuthenticated] = useState(() => {
    try {
      const sess = sessionStorage.getItem('_aa_vendor_auth_session');
      return sess ? JSON.parse(sess)?.authenticated : false;
    } catch (e) {
      return false;
    }
  });

  const handleVendorLogout = () => {
    sessionStorage.removeItem('_aa_vendor_auth_session');
    setIsVendorAuthenticated(false);
  };

  // Active View Tab: 'fleet' | 'tiers' | 'license-generator' | 'analytics'
  const [activeTab, setActiveTab] = useState('fleet');

  // Vendor Data State with localStorage persistence
  const [vendorData, setVendorData] = useState(() => {
    try {
      const saved = localStorage.getItem('alchemist_vendor_master_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialVendorData;
  });

  const { vendorInfo, plans, clientSchools } = vendorData;

  // Search & Filter state for client instances
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Copy status tooltip
  const [copiedKey, setCopiedKey] = useState('');

  // Selected school for remote module management modal
  const [editingSchool, setEditingSchool] = useState(null);

  // License Generator Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newPlan, setNewPlan] = useState('pro');
  const [newBillingCycle, setNewBillingCycle] = useState('monthly');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [generatedLicenseResult, setGeneratedLicenseResult] = useState(null);

  // Save changes helper
  const updateVendorData = (newData) => {
    setVendorData(newData);
    try {
      localStorage.setItem('alchemist_vendor_master_v1', JSON.stringify(newData));
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle school active/suspended status (Remote Killswitch)
  const handleToggleSchoolStatus = (schoolId) => {
    const updated = clientSchools.map((school) => {
      if (school.id === schoolId) {
        const nextStatus = school.status === 'active' ? 'suspended' : 'active';
        return {
          ...school,
          status: nextStatus,
          modulesEnabled: {
            ...school.modulesEnabled,
            cms: nextStatus === 'active',
          },
        };
      }
      return school;
    });

    updateVendorData({
      ...vendorData,
      clientSchools: updated,
    });
  };

  // Toggle granular module for a school
  const handleToggleModule = (schoolId, moduleKey) => {
    const updated = clientSchools.map((school) => {
      if (school.id === schoolId) {
        return {
          ...school,
          modulesEnabled: {
            ...school.modulesEnabled,
            [moduleKey]: !school.modulesEnabled[moduleKey],
          },
        };
      }
      return school;
    });

    updateVendorData({
      ...vendorData,
      clientSchools: updated,
    });

    if (editingSchool && editingSchool.id === schoolId) {
      setEditingSchool({
        ...editingSchool,
        modulesEnabled: {
          ...editingSchool.modulesEnabled,
          [moduleKey]: !editingSchool.modulesEnabled[moduleKey],
        },
      });
    }
  };

  // Upgrade or change school subscription plan tier
  const handleChangeSchoolPlan = (schoolId, newPlanId) => {
    const planObj = plans.find((p) => p.id === newPlanId);
    const updated = clientSchools.map((school) => {
      if (school.id === schoolId) {
        return {
          ...school,
          plan: newPlanId,
          billingCycle:
            newPlanId === 'lifetime'
              ? 'Perpetual (One-Time NPR 160,000)'
              : newPlanId === 'pro'
              ? 'Monthly (NPR 5,500/mo)'
              : newPlanId === 'intermediate'
              ? 'Yearly (NPR 38,000/yr)'
              : 'Monthly (NPR 2,000/mo)',
          nextRenewal:
            newPlanId === 'lifetime'
              ? 'Never (Lifetime Perpetual)'
              : '2027-10-15',
          modulesEnabled: {
            cms: true,
            attendance: newPlanId !== 'basic',
            assignments: newPlanId !== 'basic',
            reportCard: newPlanId !== 'basic',
            billing: newPlanId === 'pro' || newPlanId === 'lifetime',
            paymentGateway: newPlanId === 'pro' || newPlanId === 'lifetime',
            smsGateway: newPlanId === 'pro' || newPlanId === 'lifetime',
          },
        };
      }
      return school;
    });

    updateVendorData({
      ...vendorData,
      clientSchools: updated,
    });

    if (editingSchool && editingSchool.id === schoolId) {
      setEditingSchool(updated.find((s) => s.id === schoolId));
    }
  };

  // Handle License Generation
  const handleGenerateLicense = (e) => {
    e.preventDefault();
    if (!newSchoolName || !newDomain) return;

    const prefix = newSchoolName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'SCH');
    const tierCode = newPlan.slice(0, 3).toUpperCase();
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedToken = `LIC-${prefix}-${tierCode}-2026-${randPart}-RJR`;

    const newInstance = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      name: newSchoolName,
      domain: newDomain.toLowerCase().replace(/https?:\/\//, ''),
      location: 'Nepal',
      principal: newPrincipal || 'Authorized Principal',
      contact: '01-4XXXXXX',
      plan: newPlan,
      status: 'active',
      billingCycle:
        newPlan === 'lifetime'
          ? 'Perpetual (One-Time NPR 160,000)'
          : newBillingCycle === 'yearly'
          ? `Yearly (NPR ${(plans.find((p) => p.id === newPlan)?.priceYearlyNPR || 0).toLocaleString()})`
          : `Monthly (NPR ${(plans.find((p) => p.id === newPlan)?.priceMonthlyNPR || 0).toLocaleString()}/mo)`,
      licenseKey: generatedToken,
      studentsCount: 150,
      teachersCount: 12,
      storageUsedGB: 1.5,
      storageLimitGB: newPlan === 'pro' || newPlan === 'lifetime' ? 50.0 : 25.0,
      lastActive: 'Just now (Provisioned)',
      nextRenewal: newPlan === 'lifetime' ? 'Never (Lifetime Perpetual)' : '2027-10-15',
      modulesEnabled: {
        cms: true,
        attendance: newPlan !== 'basic',
        assignments: newPlan !== 'basic',
        reportCard: newPlan !== 'basic',
        billing: newPlan === 'pro' || newPlan === 'lifetime',
        paymentGateway: newPlan === 'pro' || newPlan === 'lifetime',
        smsGateway: newPlan === 'pro' || newPlan === 'lifetime',
      },
    };

    updateVendorData({
      ...vendorData,
      clientSchools: [newInstance, ...clientSchools],
    });

    setGeneratedLicenseResult(newInstance);
    setNewSchoolName('');
    setNewDomain('');
    setNewPrincipal('');
  };

  // Clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Filtered Client Instances
  const filteredSchools = clientSchools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.licenseKey.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = selectedPlanFilter === 'all' || school.plan === selectedPlanFilter;
    const matchesStatus = selectedStatusFilter === 'all' || school.status === selectedStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate fleet stats
  const totalSchools = clientSchools.length;
  const activeSchools = clientSchools.filter((s) => s.status === 'active').length;
  const totalStudents = clientSchools.reduce((acc, s) => acc + (s.studentsCount || 0), 0);
  const totalStorage = clientSchools.reduce((acc, s) => acc + (s.storageUsedGB || 0), 0).toFixed(1);

  if (!isVendorAuthenticated) {
    return <VendorLoginScreen onLoginSuccess={() => setIsVendorAuthenticated(true)} />;
  }

  return (
    <div
      className={`min-h-screen w-full font-sans transition-colors duration-300 pb-20 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner Navigation */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Left: Hub Title & Return to Site */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Website</span>
              </button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">
                      Vendor Master Hub
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">
                      Rishi Kesh Rana
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Multi-Tenant Cloud Licensing & Client Domain Fleet Controller
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick actions & Portfolio connection */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Portfolio Link button */}
              <a
                href={vendorInfo.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>rishikeshrana.com.np</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Secure Session Lock Button */}
              <button
                type="button"
                onClick={handleVendorLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
                title="Lock Master Console & Terminate Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Lock Console</span>
              </button>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Overview & High-level Metrics */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6">
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 border-slate-800 text-white'
              : 'bg-gradient-to-br from-white via-indigo-50/20 to-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  SaaS Vendor Command Console
                </span>
                <span className="text-xs text-slate-400">
                  {vendorInfo.currentVersion}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                School Client Fleet & Licensing Manager
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Central command console for Rishi Kesh Rana to provision, monitor, and enforce
                subscriptions across all deployed school & college domains in Nepal.
              </p>
            </div>

            {/* Quick Action: Provision New School */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('license-generator')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New School</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tiers')}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Pricing Plans</span>
              </button>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            {/* Tile 1: Active Deployments */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Deployed Schools</span>
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                {activeSchools} / {totalSchools}
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                All Domains Monitored
              </div>
            </div>

            {/* Tile 2: Total Students Served */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Active Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold mt-1 text-blue-400">
                {totalStudents.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Across {totalSchools} Institutions
              </div>
            </div>

            {/* Tile 3: Cloud Storage Footprint */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Media Storage</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold mt-1 text-amber-400">
                {totalStorage} GB
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Cloud CDN & Backups
              </div>
            </div>

            {/* Tile 4: Server Health & Uptime */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Network Health</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold mt-1 text-emerald-500">
                99.98%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                0 Active Incidents
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {[
            { id: 'fleet', label: 'Client Schools Fleet', icon: Server, badge: clientSchools.length },
            { id: 'tiers', label: 'Subscription Tiers & Features', icon: Layers },
            { id: 'license-generator', label: 'Provision School License', icon: Key },
            { id: 'pitch', label: 'Sales Pitch & Client Presentation', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white text-purple-600'
                        : isDark
                        ? 'bg-slate-800 text-purple-400'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6">
        {/* ================= 1. CLIENT SCHOOLS FLEET ================= */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            {/* Search & Filter Controls */}
            <div
              className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by school name, domain (e.g. alchemist.edu.np), or license key..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm outline-none border transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Plan Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="pro">Pro</option>
                  <option value="lifetime">Lifetime Buy</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="renewal_due">Renewal Due</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Client Schools Table / Grid */}
            <div className="space-y-4">
              {filteredSchools.map((school) => {
                const isActive = school.status === 'active';
                const isRenewalDue = school.status === 'renewal_due';
                const isSuspended = school.status === 'suspended';

                return (
                  <div
                    key={school.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isSuspended
                        ? isDark
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-rose-50/50 border-rose-200'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* Left: School Identity */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 truncate">
                            {school.name}
                          </h3>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              school.plan === 'lifetime'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : school.plan === 'pro'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : school.plan === 'intermediate'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {school.plan}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isRenewalDue
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </>
                            ) : isRenewalDue ? (
                              <>
                                <AlertTriangle className="w-3 h-3" /> Renewal Due
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Suspended
                              </>
                            )}
                          </span>
                        </div>

                        {/* Meta details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                          <div>
                            <span className="text-slate-400">Custom Domain:</span>{' '}
                            <a
                              href={`https://${school.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-purple-400 hover:underline inline-flex items-center gap-1"
                            >
                              {school.domain} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-400">Principal:</span>{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {school.principal}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Enrollment:</span>{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {school.studentsCount} Students • {school.teachersCount} Teachers
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Storage Used:</span>{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {school.storageUsedGB} / {school.storageLimitGB} GB
                            </span>
                          </div>
                        </div>

                        {/* License Key with Copy Button */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">License Token:</span>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 select-all">
                            {school.licenseKey}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(school.licenseKey)}
                            className="p-1 text-slate-400 hover:text-purple-400 cursor-pointer"
                            title="Copy License Key"
                          >
                            {copiedKey === school.licenseKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Remote Controls & Actions */}
                      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                        {/* Remote Feature Modules Manager */}
                        <button
                          type="button"
                          onClick={() => setEditingSchool(school)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isDark
                              ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          <span>Manage Modules</span>
                        </button>

                        {/* Remote Killswitch / Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleSchoolStatus(school.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                          title={
                            isActive
                              ? 'Remotely suspend school access'
                              : 'Reactivate delinquent school'
                          }
                        >
                          {isActive ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Active Remote Modules Badges */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400">Active Modules:</span>
                        {Object.entries(school.modulesEnabled).map(([modKey, isEnabled]) => (
                          <span
                            key={modKey}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              isEnabled
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'
                            }`}
                          >
                            {modKey}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Billing: <strong className="text-slate-700 dark:text-slate-300">{school.billingCycle}</strong> • Renewal: {school.nextRenewal}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 2. SUBSCRIPTION TIERS & PRICING ================= */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Commercial Matrix
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1">
                Institutional Subscription Tiers & One-Time Buy
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Designed to be displayed directly on <strong>rishikeshrana.com.np</strong> when pitching to school boards and college owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isPro = plan.id === 'pro';
                const isLifetime = plan.id === 'lifetime';

                return (
                  <div
                    key={plan.id}
                    className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                      isLifetime
                        ? isDark
                          ? 'bg-gradient-to-b from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                          : 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300 shadow-md'
                        : isPro
                        ? isDark
                          ? 'bg-gradient-to-b from-purple-950/30 to-slate-900 border-purple-500/40 shadow-lg shadow-purple-500/5'
                          : 'bg-gradient-to-b from-purple-50/50 to-white border-purple-300 shadow-md'
                        : isDark
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Plan Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{plan.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                          {plan.badge}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="my-5">
                        {isLifetime ? (
                          <>
                            <div className="text-3xl font-bold font-mono text-emerald-500">
                              NPR 160,000
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              One-Time Purchase ($1,250 USD) • 0 Recurring Fees
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold font-mono text-purple-400">
                              NPR {plan.priceMonthlyNPR?.toLocaleString()}
                              <span className="text-sm font-normal text-slate-400">/mo</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Billed Yearly: NPR {plan.priceYearlyNPR?.toLocaleString()} (${plan.priceUSD} USD/yr)
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        {plan.description}
                      </p>

                      {/* Included Features */}
                      <div className="space-y-2.5 text-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Included Features:
                        </div>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                          </div>
                        ))}

                        {/* Excluded Features (if any) */}
                        {plan.excluded?.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                            {plan.excluded.map((ex, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-slate-400">
                                <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span className="line-through">{ex}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setNewPlan(plan.id);
                          setActiveTab('license-generator');
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          isLifetime
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : isPro
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        Provision {plan.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 3. PROVISION LICENSE KEY GENERATOR ================= */}
        {activeTab === 'license-generator' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Generate Institution License Token</h3>
                  <p className="text-xs text-slate-400">
                    Onboard a new client school with bound domain and subscription tier
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateLicense} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    School / College Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="e.g. Kathmandu Model Secondary School"
                    className={`w-full rounded-xl border p-3 text-xs sm:text-sm outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Binding Custom Domain (.edu.np / .com)
                    </label>
                    <input
                      type="text"
                      required
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="e.g. kmcollege.edu.np"
                      className={`w-full rounded-xl border p-3 text-xs sm:text-sm outline-none font-mono ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Principal / Academic Director
                    </label>
                    <input
                      type="text"
                      value={newPrincipal}
                      onChange={(e) => setNewPrincipal(e.target.value)}
                      placeholder="e.g. Dr. Nabina Shrestha"
                      className={`w-full rounded-xl border p-3 text-xs sm:text-sm outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Subscription Plan
                    </label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className={`w-full rounded-xl border p-3 text-xs sm:text-sm outline-none font-semibold cursor-pointer ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="basic">Basic (Website + CMS)</option>
                      <option value="intermediate">Intermediate (+ Attendance, Grades)</option>
                      <option value="pro">Pro Enterprise (+ eSewa, SMS, ERP)</option>
                      <option value="lifetime">Lifetime Purchase (Perpetual Unlocked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Billing Schedule
                    </label>
                    <select
                      value={newBillingCycle}
                      onChange={(e) => setNewBillingCycle(e.target.value)}
                      disabled={newPlan === 'lifetime'}
                      className={`w-full rounded-xl border p-3 text-xs sm:text-sm outline-none font-semibold cursor-pointer ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="monthly">Monthly Recurring</option>
                      <option value="yearly">Yearly Advance (10% Discount)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Generate Cryptographic License & Deploy Instance</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Output Display of Provisioned License */}
            {generatedLicenseResult && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                  isDark
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                    : 'bg-emerald-50 border-emerald-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">License Provisioned Successfully!</h4>
                    <p className="text-xs text-slate-400">
                      Deliver this key to the client school administrator for activation.
                    </p>
                  </div>
                </div>

                <div
                  className={`my-4 p-4 rounded-2xl border font-mono text-xs space-y-2 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-400">School:</span>
                    <span className="font-bold">{generatedLicenseResult.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Domain:</span>
                    <span className="text-purple-400">{generatedLicenseResult.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="uppercase font-bold text-emerald-400">{generatedLicenseResult.plan}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">License Key:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold select-all">
                        {generatedLicenseResult.licenseKey}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedLicenseResult.licenseKey)}
                        className="p-1 hover:text-emerald-400 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('fleet')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  View in School Fleet
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= 4. SALES PITCH & CLIENT PRESENTATION ================= */}
        {activeTab === 'pitch' && (
          <div className="space-y-6">
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Product Showcase for rishikeshrana.com.np
                  </span>
                  <h3 className="text-2xl font-bold mt-1">
                    Why Schools & Colleges Choose Rishi's Ecosystem
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Key differentiators to pitch directly to school owners and education committees
                  </p>
                </div>

                <a
                  href="https://rishikeshrana.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer self-start"
                >
                  <span>Open Portfolio Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base">Independent Domain Ownership</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Schools are NOT trapped in a generic shared URL. Each school operates on their own
                    official institutional domain (e.g. <strong className="text-purple-400">alchemist.edu.np</strong>) with dedicated branding and files.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base">Local Payment Gateways</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Direct integration with Nepal's primary digital payment ecosystem: <strong className="text-emerald-500">eSewa</strong>, <strong className="text-purple-400">Khalti</strong>, and interbank <strong className="text-rose-500">Fonepay QR</strong> for fee collection.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Key className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base">One-Time Lifetime Option</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Unlike foreign SaaS platforms with endless monthly bills, Rishi offers an exclusive
                    <strong className="text-amber-500"> Lifetime Purchase License</strong> with 100% source code handover and self-hosting freedom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: REMOTE MODULES & PLAN MANAGEMENT ================= */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Remote Instance Manager
                </span>
                <h3 className="font-bold text-lg mt-0.5">{editingSchool.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{editingSchool.domain}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-5">
              {/* Change Plan Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subscription Tier Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['basic', 'intermediate', 'pro', 'lifetime'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChangeSchoolPlan(editingSchool.id, t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        editingSchool.plan === t
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : isDark
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Specific Remote Modules */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Remote Feature Flags (Killswitch Toggles)
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'cms', label: 'Public Website & Headless CMS', desc: 'Allows school to post blogs and edit homepage' },
                    { key: 'attendance', label: 'Daily Attendance System', desc: 'Allows teachers to take roll calls and logs' },
                    { key: 'assignments', label: 'Homework & Digital Assignments', desc: 'Enables student file turn-in' },
                    { key: 'reportCard', label: 'Terminal Marks & Grade Sheets', desc: 'Generates official report cards' },
                    { key: 'billing', label: 'Student Fee Invoicing', desc: 'Itemized tuition & bus fee ledger' },
                    { key: 'paymentGateway', label: 'eSewa & Khalti Online Checkout', desc: 'Direct digital transactions' },
                    { key: 'smsGateway', label: 'Automated SMS Alerts to Parents', desc: 'Triggers on absence or payment receipt' },
                  ].map((mod) => {
                    const isModActive = editingSchool.modulesEnabled[mod.key];
                    return (
                      <div
                        key={mod.key}
                        onClick={() => handleToggleModule(editingSchool.id, mod.key)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isModActive
                            ? isDark
                              ? 'bg-purple-950/20 border-purple-500/40 text-white'
                              : 'bg-purple-50/50 border-purple-200 text-slate-900'
                            : isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{mod.label}</div>
                          <div className="text-[10px] text-slate-400">{mod.desc}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isModActive
                              ? 'bg-purple-600 text-white'
                              : 'border border-slate-400 dark:border-slate-600'
                          }`}
                        >
                          {isModActive && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save Instance Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMasterHub;

