import React from 'react';
import { Palette, Music, Laptop, Microscope, Trophy, Activity, ArrowUpRight, ArrowRight, BookOpen } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const iconMap = {
  Palette,
  Music,
  Laptop,
  Microscope,
  Trophy,
  Activity,
};

const Curriculum = () => {
  const { siteData, navigateTo, isDark } = useSiteData();
  const allSubjects = siteData.curriculum || [];
  const subjects = allSubjects.slice(0, 6);

  return (
    <section id="academics" className={`py-24 relative transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 font-bold uppercase tracking-wider text-xs sm:text-sm">
            Academic Pathways
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold mt-2 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Curriculum Overview
          </h2>
          <p className={`text-base sm:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Our multi-dimensional curriculum integrates rigorous core studies with enriching co-disciplines to foster comprehensive intellectual, aesthetic, and kinesthetic growth.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((item) => {
            const Icon = iconMap[item.icon] || Palette;
            return (
              <div
                key={item.id || item.title}
                onClick={() => navigateTo('academics')}
                className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800 hover:border-amber-500/50'
                    : 'bg-white border border-slate-200/80 hover:border-amber-400/50'
                }`}
              >
                {/* Image Preview with Hover Zoom */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                    {item.badge}
                  </span>

                  {/* Subject icon pill */}
                  <div className={`absolute bottom-4 left-4 w-11 h-11 rounded-xl shadow-md flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 ${
                    isDark ? 'bg-slate-800 text-amber-400' : 'bg-white text-slate-900'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-xl font-bold font-serif-brand group-hover:text-amber-500 transition-colors mb-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
                    isDark ? 'border-slate-800 text-slate-400 group-hover:text-amber-400' : 'border-slate-100 text-slate-500 group-hover:text-amber-600'
                  }`}>
                    <span>Explore Full Syllabus</span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isDark ? 'bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950' : 'bg-slate-100 group-hover:bg-amber-100 group-hover:text-amber-700'
                    }`}>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Curriculum Action Button */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => navigateTo('academics')}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
              isDark
                ? 'bg-slate-900 text-white border border-slate-800 hover:border-amber-400 hover:text-amber-400'
                : 'bg-white text-slate-900 border border-slate-200/90 hover:border-amber-400 hover:text-amber-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Explore All Academic Pathways</span>
            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-500/10 text-amber-800 border-amber-500/20'
            }`}>
              {allSubjects.length} Streams
            </span>
            <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors ml-1">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Curriculum;
