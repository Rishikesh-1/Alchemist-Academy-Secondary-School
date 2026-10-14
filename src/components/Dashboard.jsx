import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Compass,
  FileText,
  RotateCcw,
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
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck } from 'lucide-react';
import ImageFieldWithPicker from './ImageFieldWithPicker';
import MediaLibraryManager from './MediaLibraryManager';

const Dashboard = () => {
  const { siteData, setSiteData, resetToDefault, navigateTo, isDark, toggleTheme } = useSiteData();
  const { currentUser, logout, canAccessSection, users, addUser, updateUser, deleteUser, ROLES } = useAuth();
  
  // Navigation Items with RBAC permissions
  const allNavItems = [
    { id: 'branding', label: 'Branding & Logo', icon: Palette },
    { id: 'hero', label: 'Hero Banner & BG', icon: ImageIcon },
    { id: 'about', label: 'About School', icon: Compass },
    { id: 'stats', label: 'Stats Grid', icon: Users },
    { id: 'headmaster', label: "Leadership Messages (Home/About)", icon: MessageSquare },
    { id: 'curriculum', label: 'Curriculum Subjects', icon: BookOpen },
    { id: 'cocurricular', label: 'Co-curricular Activities', icon: Sparkles },
    { id: 'blogs', label: 'Blog & Articles', icon: FileText },
    { id: 'admissions', label: 'Admissions CTA', icon: Phone },
    { id: 'footer', label: 'Footer & Address', icon: LayoutDashboard },
    { id: 'media', label: 'Media Library', icon: FolderOpen },
    { id: 'users', label: 'Staff & Team Access', icon: ShieldCheck, superadminOnly: true },
  ];

  // Filter based on currently logged-in user permissions
  const allowedNavItems = allNavItems.filter((item) => {
    if (item.superadminOnly) {
      return currentUser?.role === 'superadmin';
    }
    return canAccessSection(item.id);
  });

  const [activeSection, setActiveSection] = useState(
    allowedNavItems[0]?.id || 'blogs'
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [blogAddedNotice, setBlogAddedNotice] = useState(false);

  // Form local state clone for seamless editing
  const [formData, setFormData] = useState(siteData);

  // Keep formData in sync if siteData changes externally
  const handleSave = () => {
    setSiteData(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
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
              Alchemist Academy CMS
            </h1>
            <p className="text-xs text-amber-500 font-medium">
              Live Customizer & Site Dashboard
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {savedNotice && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-pulse">
              <Check className="w-3.5 h-3.5" />
              Changes Saved Live!
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

          <button
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title="Reset to original default school values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply</span>
          </button>

          {/* Current Admin Session User Indicator */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium">{currentUser?.name || 'Administrator'}</span>
            <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {currentUser?.role || 'Superadmin'}
            </span>
          </div>

          <button
            onClick={() => {
              handleSave();
              navigateTo('landing');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Site</span>
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

          <div className={`text-[11px] font-bold uppercase tracking-wider px-3 mb-2 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Permitted Modules ({allowedNavItems.length})
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
              <div>
                <h2 className="text-2xl font-bold font-serif-brand text-white">Co-curricular Activities</h2>
                <p className="text-sm text-slate-400 mt-1">Customize feature cards for athletics, publications, and performing arts.</p>
              </div>

              <div className="space-y-6">
                {formData.coCurricular.map((act, idx) => (
                  <div key={act.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Activity #{idx + 1}: {act.title}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => {
                            const newAct = [...formData.coCurricular];
                            newAct[idx].title = e.target.value;
                            setFormData({ ...formData, coCurricular: newAct });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={act.subtitle}
                          onChange={(e) => {
                            const newAct = [...formData.coCurricular];
                            newAct[idx].subtitle = e.target.value;
                            setFormData({ ...formData, coCurricular: newAct });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        />
                      </div>
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
                        placeholder="e.g. Ramesh Shrestha"
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
                        placeholder="e.g. ramesh"
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

        </main>
      </div>
    </div>
  );
};

export default Dashboard;

