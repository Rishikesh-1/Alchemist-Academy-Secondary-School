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
    <section className="relative -mt-8 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-800">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-800/80 gap-1.5">
          <div>
            <span className="text-amber-400 text-[11px] uppercase tracking-widest font-bold">
              Overview
            </span>
            <h3 className="text-xl sm:text-2xl font-serif-brand font-bold text-white tracking-wide">
              School at a Glance
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            Key milestones, enrollment metrics, and student community
          </span>
        </div>

        {/* Compact Metrics Grid (2 columns on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y-0 lg:divide-x divide-slate-800/80">
          {stats.map((stat, idx) => {
            const Icon = icons[idx % icons.length];
            const color = colors[idx % colors.length];
            return (
              <div
                key={stat.id || idx}
                className={`flex flex-col items-center text-center px-2 py-2 transition-all duration-300 hover:-translate-y-0.5 ${
                  idx !== 0 ? 'lg:pl-6' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-md shadow-amber-500/10 mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-0.5 font-serif-brand">
                  {stat.value}
                </span>

                <span className="text-xs sm:text-sm font-semibold text-amber-300 mb-0.5">
                  {stat.label}
                </span>

                <p className="text-[11px] text-slate-400 max-w-[180px] leading-snug line-clamp-2">
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
