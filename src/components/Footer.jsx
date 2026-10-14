import React from 'react';
import { MapPin, Phone, Mail, Clock, GraduationCap, ChevronRight, Lock } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const Footer = () => {
  const { siteData, navigateTo } = useSiteData();
  const { branding, footer } = siteData;

  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: School Identity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {branding.logoType === 'image' && branding.logoImage ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white border border-slate-800 flex items-center justify-center p-1">
                  <img
                    src={branding.logoImage}
                    alt={branding.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: branding.logoColor || '#e67300' }}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}
              <span className="font-serif-brand font-bold text-2xl tracking-wider text-white">
                {branding.name}
              </span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {footer.tagline}
            </p>

            {footer.hours && (
              <div className="pt-2 flex items-center gap-2 text-xs text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Office Hours: {footer.hours}</span>
              </div>
            )}
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif-brand font-semibold text-white text-base tracking-wide uppercase border-b border-slate-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  About Our School
                </a>
              </li>
              <li>
                <a href="#academics" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  Curriculum & Academics
                </a>
              </li>
              <li>
                <a href="#activities" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  Co-curricular Activities
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  School Blog & News
                </a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  Enrollment & Admissions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif-brand font-semibold text-white text-base tracking-wide uppercase border-b border-slate-800 pb-2">
              Get in Touch
            </h4>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  {footer.address}
                </span>
              </div>

              {footer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                  <a href={`tel:${footer.phone}`} className="text-slate-300 hover:text-white transition-colors">
                    {footer.phone}
                  </a>
                </div>
              )}

              {footer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                  <a href={`mailto:${footer.email}`} className="text-slate-300 hover:text-white transition-colors break-all">
                    {footer.email}
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright notice & discrete Staff Access button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {footer.copyrightYear || new Date().getFullYear()} {branding.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Crafted for Young Learners in Nepal</span>
            <span>•</span>
            {/* Discrete, lock-gated staff link routing strictly to the authentication portal */}
            <button
              onClick={() => navigateTo('admin-login')}
              className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
              title="Staff Portal (Authentication Required)"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Access</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
