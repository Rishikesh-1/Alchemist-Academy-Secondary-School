import React from 'react';
import { Users, Award, Trophy, GraduationCap } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const Stats = () => {
  const { siteData } = useSiteData();
  const stats = siteData.stats || [];

  const icons = [Users, Award, Trophy, GraduationCap];
  const colors = [
    'from-amber-500 to-amber-600',
    'from-yellow-500 to-amber-500',
    'from-orange-500 to-amber-600',
    'from-amber-600 to-slate-800',
  ];

  return (
    <section className="relative -mt-10 sm:-mt-14 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-amber-400 text-xs sm:text-sm uppercase tracking-widest font-semibold mb-2">
            Overview
          </p>
          <h3 className="text-2xl sm:text-3xl font-serif-brand font-bold text-white">
            School at a Glance
          </h3>
        </div>

        {/* 4-column Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {stats.map((stat, idx) => {
            const Icon = icons[idx % icons.length];
            const color = colors[idx % colors.length];
            return (
              <div
                key={stat.id || idx}
                className={`flex flex-col items-center text-center p-4 transition-all duration-300 hover:-translate-y-1 ${
                  idx !== 0 ? 'pt-8 sm:pt-4 sm:pl-8' : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-lg shadow-amber-500/10 mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 font-serif-brand">
                  {stat.value}
                </span>

                <span className="text-base sm:text-lg font-semibold text-amber-200 mb-1">
                  {stat.label}
                </span>

                <p className="text-xs text-slate-400 max-w-[200px]">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Stats;
