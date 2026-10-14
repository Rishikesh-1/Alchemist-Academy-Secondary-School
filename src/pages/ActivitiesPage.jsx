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
  const { siteData, navigateTo } = useSiteData();
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
    <div className="bg-slate-50 min-h-screen">
      {/* Banner */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-radial from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-3 uppercase tracking-wider">
            <button onClick={() => navigateTo('home')} className="hover:underline cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">Co-Curricular & Student Life</span>
          </nav>
          
          <h1 className="font-serif-brand font-bold text-3xl sm:text-5xl tracking-tight text-white max-w-2xl">
            Vibrant Life Beyond the Classroom
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            At Alchemist Academy, education extends onto the football pitch, the theatre stage, the editorial room, and community service projects.
          </p>
        </div>
      </section>

      {/* Main Co-curricular Pillars */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 aspect-[16/10] relative group">
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
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    Activity Stream 0{index + 1}
                  </span>
                  <h3 className="font-serif-brand font-bold text-2xl sm:text-3xl text-slate-900">
                    {act.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                    {act.subtitle}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {act.highlights && act.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => navigateTo('contact')}
                      className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950 text-xs font-bold transition-all duration-300 cursor-pointer"
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
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
              Clubs & Student Societies
            </span>
            <h2 className="font-serif-brand font-bold text-3xl sm:text-4xl text-slate-900 mt-2">
              Discover Your Calling
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Students lead and participate in six student-run societies, cultivating autonomy, collaboration, and practical leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    {club.category}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 mt-3 mb-1.5">{club.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{club.lead}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
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
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-950 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-slate-900 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <span>Explore Admissions & Campus Life</span>
              <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-white transition-colors">
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

