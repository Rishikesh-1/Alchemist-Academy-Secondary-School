import React from 'react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  Music,
  Users,
  Calendar,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Award,
  Heart
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const ActivitiesPage = () => {
  const { siteData, navigateTo, isDark } = useSiteData();
  const { coCurricular } = siteData;

  const clubs = [
    {
      name: 'Robotics & STEM Innovators',
      lead: 'Weekly hands-on coding, electronics, and prototype design.',
      category: 'Science & Technology',
    },
    {
      name: 'Literature & Debate Society',
      lead: 'Weekly parliamentary debates, poetry slams, and elocution clinics.',
      category: 'Literary Arts',
    },
    {
      name: 'Eco-Warriors & Green Campus',
      lead: 'Tree plantation drives, waste sorting, and biodiversity conservation.',
      category: 'Community & Ecology',
    },
    {
      name: 'School Band & Acoustic Ensemble',
      lead: 'Instrumental classical, traditional Nepali, and modern band performance.',
      category: 'Music & Harmony',
    },
    {
      name: 'Junior Theatre & Drama Troupe',
      lead: 'Stage blocking, costume design, monologue training, and annual plays.',
      category: 'Performing Arts',
    },
    {
      name: 'Athletic Squads (Football & Badminton)',
      lead: 'Rigorous coaching, inter-school tournaments, and sportsmanship training.',
      category: 'Sports & Fitness',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Banner */}
      <section className="bg-slate-950 text-white py-8 sm:py-10 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-radial from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">
            <button onClick={() => navigateTo('home')} className="hover:underline cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">Co-Curricular & Student Life</span>
          </nav>
          
          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white max-w-2xl">
            Vibrant Life Beyond the Classroom
          </h1>
          <p className="mt-1.5 text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
            At Alchemist Academy, education extends onto the football pitch, the theatre stage, the editorial room, and community service projects.
          </p>
        </div>
      </section>

      {/* Main Co-curricular Pillars */}
      <section className="py-10 sm:py-16 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="space-y-16">
          {coCurricular && coCurricular.map((act, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={act.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image Showcase */}
                <div className={`lg:col-span-6 ${isReversed ? 'lg:order-2' : ''}`}>
                  <div className={`rounded-3xl overflow-hidden shadow-xl border-4 aspect-[16/10] relative group ${
                    isDark ? 'border-slate-800 bg-slate-900' : 'border-white bg-slate-100'
                  }`}>
                    <img
                      src={act.image}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
                      {act.tag}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`lg:col-span-6 space-y-4 ${isReversed ? 'lg:order-1' : ''}`}>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                    Activity Stream 0{index + 1}
                  </span>
                  <h3 className={`font-serif-brand font-bold text-2xl sm:text-3xl ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {act.title}
                  </h3>
                  <p className={`text-sm sm:text-base leading-relaxed font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {act.subtitle}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {act.highlights && act.highlights.map((item, hIdx) => (
                      <div key={hIdx} className={`flex items-center gap-2.5 text-xs sm:text-sm ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => navigateTo('contact')}
                      className={`group/btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isDark
                          ? 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                          : 'bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950'
                      }`}
                    >
                      <span>Inquire About Activity</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clubs & Student Societies */}
      <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
              Clubs & Student Societies
            </span>
            <h2 className={`font-serif-brand font-bold text-3xl sm:text-4xl mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Discover Your Calling
            </h2>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Students lead and participate in six student-run societies, cultivating autonomy, collaboration, and practical leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isDark
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {club.category}
                  </span>
                  <h4 className={`font-bold text-base mt-3 mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{club.name}</h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{club.lead}</p>
                </div>
                <div className={`pt-4 mt-4 border-t text-[11px] font-semibold flex items-center gap-1 ${
                  isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200/60 text-slate-400'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Every Friday Activity Slot</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-950 hover:bg-slate-900 text-white'
              }`}
            >
              <span>Explore Admissions & Campus Life</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDark ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white'
              }`}>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ActivitiesPage;

