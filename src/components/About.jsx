import React from 'react';
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const About = () => {
  const { siteData } = useSiteData();
  const { about } = siteData;

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-50 rounded-full blur-2xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Primary Image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={about.image}
                  alt="Students engaged in learning at Alchemist Academy"
                  className="w-full h-80 sm:h-96 lg:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Highlight Card */}
              {about.locationBadgeTitle && (
                <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{about.locationBadgeTitle}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {about.locationBadgeDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Decorative Pill Badge */}
              {about.gradePill && (
                <div className="absolute -top-4 -left-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{about.gradePill}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="lg:col-span-6 space-y-6">
            {about.badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                {about.badge}
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-slate-900 leading-tight">
              {about.title}
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              {about.description1}
            </p>

            {about.description2 && (
              <p className="text-base text-slate-600 leading-relaxed">
                {about.description2}
              </p>
            )}

            {/* Core Values List */}
            {about.values && about.values.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {about.values.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Secondary Action Button */}
            <div className="pt-4">
              <a
                href="#quote"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm group"
              >
                <span>{about.buttonText || "Know More About Us"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
