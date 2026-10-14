import React from 'react';
import { Palette, Music, Laptop, Microscope, Trophy, Activity, ArrowUpRight } from 'lucide-react';
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
  const { siteData } = useSiteData();
  const subjects = siteData.curriculum || [];

  return (
    <section id="academics" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-bold uppercase tracking-wider text-xs sm:text-sm">
            Academic Pathways
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold text-slate-900 mt-2 mb-4">
            Curriculum Overview
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
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
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Image Preview with Hover Zoom */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                    {item.badge}
                  </span>

                  {/* Subject icon pill */}
                  <div className="absolute bottom-4 left-4 w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-900 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-serif-brand text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-amber-600">
                    <span>Explore Syllabus</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Curriculum;
