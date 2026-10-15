import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, GraduationCap, Sparkles, BookOpen, Award, Sun, Moon, ChevronDown, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const renderIcon = (name, className = "w-6 h-6") => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Award':
      return <Award className={className} />;
    default:
      return <GraduationCap className={className} />;
  }
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { siteData, currentRoute, navigateTo, isDark, toggleTheme } = useSiteData();
  const { isAuthenticated, currentUser } = useAuth();
  const { branding, socials } = siteData;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', route: 'home' },
    { name: 'About', route: 'about' },
    { name: 'Academics', route: 'academics' },
    { name: 'Activities', route: 'activities' },
    { name: 'Blog', route: 'blog' },
    { name: 'Contact', route: 'contact' },
  ];

  const handleNavClick = (route) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-slate-950/95 border-slate-800/90 text-white shadow-lg shadow-black/20' 
        : 'bg-white/95 border-slate-100 text-slate-900 shadow-sm'
    }`}>
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer min-w-0"
            >
              {branding.logoType === 'image' && branding.logoImage ? (
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border flex items-center justify-center p-1 shrink-0 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <img
                    src={branding.logoImage}
                    alt={branding.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0"
                  style={{ backgroundColor: branding.logoColor || '#e67300' }}
                >
                  {renderIcon(branding.logoIcon, "w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]")}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className={`font-serif-brand font-bold text-base sm:text-lg lg:text-xl tracking-wider group-hover:text-[#e67300] transition-colors leading-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {branding.name}
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 font-semibold mt-0.5 truncate max-w-[150px] sm:max-w-none">
                  {branding.tagline}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Public Dedicated Page Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isCurrent =
                currentRoute === link.route ||
                (link.route === 'home' && (currentRoute === 'landing' || currentRoute === 'home'));

              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.route)}
                  className={`font-semibold text-xs xl:text-sm tracking-wide transition-all duration-200 cursor-pointer px-3 xl:px-4 py-2 rounded-full whitespace-nowrap ${
                    isCurrent
                      ? isDark
                        ? 'text-amber-400 bg-amber-500/10 font-bold border border-amber-500/30 shadow-xs'
                        : 'text-[#e67300] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-slate-900'
                      : 'text-slate-600 hover:text-[#e67300] hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right: Theme Toggle + Public Social Links + Apply Now Button */}
          <div className="hidden sm:flex items-center space-x-2 xl:space-x-2.5 shrink-0">
            {/* Global Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700 shadow-inner'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
            </button>

            {socials?.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Twitter / X"
                className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-colors shrink-0 ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {socials?.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Facebook"
                className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-colors shrink-0 ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Instagram"
                className={`hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-colors shrink-0 ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}

            {/* Portals Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                  portalDropdownOpen || ['student-portal', 'teacher-portal', 'dashboard', 'admin-login'].includes(currentRoute)
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : isDark
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300'
                    : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-800'
                }`}
                title="School Portals & ERP Workspace"
                aria-expanded={portalDropdownOpen}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                <span>Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${portalDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl ${
                  isDark
                    ? 'bg-slate-950/95 border-slate-800 text-white shadow-black/70'
                    : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80'
                }`}>
                  <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
                    isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    Institutional Digital Portals
                  </div>

                  {/* 1. Student & Parent Portal */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick('student-portal');
                      setPortalDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-colors text-left group cursor-pointer ${
                      currentRoute === 'student-portal'
                        ? isDark ? 'bg-slate-900 text-amber-400' : 'bg-amber-50 text-amber-700'
                        : isDark ? 'hover:bg-slate-900/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight">Student & Parent Portal</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Live bus GPS, fees, admit cards & grades
                      </p>
                    </div>
                  </button>

                  {/* 2. Teacher Cockpit */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick('teacher-portal');
                      setPortalDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-colors text-left group cursor-pointer ${
                      currentRoute === 'teacher-portal'
                        ? isDark ? 'bg-slate-900 text-amber-400' : 'bg-amber-50 text-amber-700'
                        : isDark ? 'hover:bg-slate-900/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight">Teacher Cockpit</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Roll call, marks entry & homework grading
                      </p>
                    </div>
                  </button>

                  {/* 3. Staff Administration & ERP */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick(isAuthenticated ? 'dashboard' : 'admin-login');
                      setPortalDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-colors text-left group cursor-pointer ${
                      currentRoute === 'dashboard' || currentRoute === 'admin-login'
                        ? isDark ? 'bg-slate-900 text-amber-400' : 'bg-amber-50 text-amber-700'
                        : isDark ? 'hover:bg-slate-900/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight">
                          Staff Administration & ERP
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isAuthenticated ? `Logged in: ${currentUser?.name || 'Administrator'}` : 'Admissions CRM, fee counter & site CMS'}
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Apply Now Action Button */}
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="inline-flex items-center justify-center px-4 xl:px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-full text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ml-1 shrink-0 whitespace-nowrap"
              style={{ backgroundColor: branding.logoColor || '#d96500' }}
            >
              {branding.headerApplyButtonText || "Apply Now"}
            </button>
          </div>

          {/* Mobile menu and mobile theme toggle */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors sm:hidden ${
                isDark ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t px-4 pt-3 pb-6 shadow-xl transition-all ${
          isDark ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-100 bg-white text-slate-900'
        }`}>
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isCurrent =
                currentRoute === link.route ||
                (link.route === 'home' && (currentRoute === 'landing' || currentRoute === 'home'));

              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.route)}
                  className={`text-left font-medium py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent
                      ? isDark
                        ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                        : 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                      : isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-slate-900'
                      : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}

            {/* Institutional Digital Portals on Mobile */}
            <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} space-y-1.5`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Institutional Portals
              </div>
              
              <button
                type="button"
                onClick={() => handleNavClick('student-portal')}
                className={`w-full flex items-center justify-between text-left font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer border ${
                  currentRoute === 'student-portal'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-amber-400'
                    : 'bg-amber-50/70 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">Student & Parent Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('teacher-portal')}
                className={`w-full flex items-center justify-between text-left font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer border ${
                  currentRoute === 'teacher-portal'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-blue-400'
                    : 'bg-blue-50/70 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs">Teacher Cockpit</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => handleNavClick(isAuthenticated ? 'dashboard' : 'admin-login')}
                className={`w-full flex items-center justify-between text-left font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer border ${
                  currentRoute === 'dashboard' || currentRoute === 'admin-login'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-emerald-400'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs">Staff Administration & ERP</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
            
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Theme</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-amber-400 border border-slate-200 dark:border-slate-700"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="mt-3 w-full text-center py-3 px-4 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow hover:opacity-95 transition-opacity cursor-pointer"
              style={{ backgroundColor: branding.logoColor || '#d96500' }}
            >
              {branding.headerApplyButtonText || "Apply Now"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
