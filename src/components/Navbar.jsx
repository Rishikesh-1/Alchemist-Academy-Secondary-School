import React, { useState } from 'react';
import { Menu, X, GraduationCap, Sparkles, BookOpen, Award, Sun, Moon } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

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
  const { siteData, currentRoute, navigateTo, isDark, toggleTheme } = useSiteData();
  const { branding, socials } = siteData;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              {branding.logoType === 'image' && branding.logoImage ? (
                <div className={`w-11 h-11 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border flex items-center justify-center p-1 ${
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
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: branding.logoColor || '#e67300' }}
                >
                  {renderIcon(branding.logoIcon, "w-6 h-6 stroke-[2.2]")}
                </div>
              )}
              <div className="flex flex-col">
                <span className={`font-serif-brand font-bold text-lg sm:text-xl tracking-wider group-hover:text-[#e67300] transition-colors leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {branding.name}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-semibold mt-0.5">
                  {branding.tagline}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Public Dedicated Page Links */}
          <nav className="hidden lg:flex items-center space-x-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isCurrent =
                currentRoute === link.route ||
                (link.route === 'home' && (currentRoute === 'landing' || currentRoute === 'home'));

              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.route)}
                  className={`font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer px-4 py-2 rounded-full ${
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
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Global Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? 'bg-slate-900 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}

            {/* Apply Now Action Button */}
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="inline-flex items-center justify-center px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-full text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ml-1"
              style={{ backgroundColor: branding.logoColor || '#d96500' }}
            >
              {branding.headerApplyButtonText || "Apply Now"}
            </button>
          </div>

          {/* Mobile menu and mobile theme toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors ${
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
