import React from 'react';
import { Flame, BookCheck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const icons = [Flame, BookCheck, Sparkles];

const CoCurricular = () => {
  const { siteData, navigateTo, isDark } = useSiteData();
  const allActivities = siteData.coCurricular || [];
  const activities = allActivities.slice(0, 3);

  return (
    <section id="activities" className={`py-24 relative transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-500 font-bold uppercase tracking-wider text-xs sm:text-sm">
            Beyond The Classroom
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif-brand font-bold mt-2 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Co-curricular Activities
          </h2>
          <p className={`text-base sm:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            At Alchemist Academy, holistic learning flourishes through vibrant clubs, competitive athletics, and expressive performing arts.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={activity.id || activity.title}
                className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group ${
                  isDark
                    ? 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50/70 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                  
                  {/* Tag */}
                  {activity.tag && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-sm">
                      {activity.tag}
                    </span>
                  )}

                  {/* Icon badge */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold font-serif-brand mb-2 group-hover:text-amber-500 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {activity.title}
                    </h3>
                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {activity.subtitle}
                    </p>

                    {activity.highlights && (
                      <ul className="space-y-3 mb-6">
                        {activity.highlights.map((point, index) => (
                          <li key={index} className={`flex items-start gap-2.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('activities')}
                    className={`inline-flex items-center justify-between w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 shadow-xs group/btn cursor-pointer ${
                      isDark
                        ? 'text-slate-200 bg-slate-900 border border-slate-800 hover:border-amber-400 hover:bg-slate-850 hover:text-white'
                        : 'text-slate-700 bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>Explore Program Details</span>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isDark ? 'bg-slate-800 text-slate-300 group-hover/btn:bg-amber-500 group-hover/btn:text-slate-950' : 'bg-slate-100 group-hover/btn:bg-white/10 group-hover/btn:text-amber-400 text-slate-500'
                    }`}>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Activities Action Button */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => navigateTo('activities')}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-slate-950 hover:bg-slate-900 text-white shadow-slate-950/20'
            }`}
          >
            <Sparkles className={`w-4 h-4 group-hover:rotate-12 transition-transform ${isDark ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Discover All Student Activities</span>
            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isDark ? 'bg-slate-950/20 text-slate-950 border border-slate-950/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
            }`}>
              {allActivities.length} Clubs
            </span>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ml-1 ${
              isDark ? 'bg-slate-950/15 group-hover:bg-slate-950 group-hover:text-white text-slate-900' : 'bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white'
            }`}>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default CoCurricular;
