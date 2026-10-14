import React from 'react';
import {
  Compass,
  CheckCircle,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  MapPin,
  ChevronRight,
  ArrowRight,
  Heart,
  Target,
  Sparkles
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';
import HeadmasterQuote from '../components/HeadmasterQuote';
import Stats from '../components/Stats';

const AboutPage = () => {
  const { siteData, navigateTo, isDark } = useSiteData();
  const { about, branding, footer } = siteData;

  const corePillars = [
    {
      title: 'Intellectual Rigor',
      description: 'Cultivating analytical discernment, scientific curiosity, and academic mastery from Nursery to Grade 10.',
      icon: BookOpen,
    },
    {
      title: 'Moral & Character Integrity',
      description: 'Instilling ethical foundations, empathy, civic responsibility, and respect for cultural traditions.',
      icon: Heart,
    },
    {
      title: 'Creative Self-Expression',
      description: 'Empowering children through studio fine arts, instrumental music, choreography, and dramatic literature.',
      icon: Sparkles,
    },
    {
      title: 'Physical Well-being & Agility',
      description: 'Promoting stamina, team sportsmanship, discipline, and healthy lifelong recreational habits.',
      icon: Award,
    },
  ];

  const milestones = [
    {
      stage: 'Early Childhood Wing',
      grades: 'Nursery to Kindergarten',
      desc: 'Play-based sensory discovery, foundational literacy, and social development in safe, nurturing spaces.',
    },
    {
      stage: 'Primary Schooling',
      grades: 'Grades 1 to 5',
      desc: 'Building conceptual fluency in languages, mathematics, social studies, and experiential sciences.',
    },
    {
      stage: 'Middle School',
      grades: 'Grades 6 to 8',
      desc: 'Fostering independent research, computer coding, lab experiments, and collaborative problem-solving.',
    },
    {
      stage: 'Secondary Wing',
      grades: 'Grades 9 & 10',
      desc: 'Advanced academic preparation for the Secondary Education Examination (SEE) and higher educational readiness.',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Page Header / Breadcrumb Banner */}
      <section className="bg-slate-950 text-white py-8 sm:py-10 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-radial from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wider">
            <button onClick={() => navigateTo('home')} className="hover:underline cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">About Our Institution</span>
          </nav>
          
          <h1 className="font-serif-brand font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white max-w-2xl">
            Nurturing Potential, Shaping Character
          </h1>
          <p className="mt-1.5 text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
            Discover the heritage, principles, and holistic educational philosophy that guide Alchemist Academy in Jorpati, Kathmandu.
          </p>
        </div>
      </section>

      {/* Campus Narrative Section */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Campus Feature Image */}
          <div className="lg:col-span-6 relative">
            <div className={`rounded-3xl overflow-hidden shadow-2xl border-4 aspect-[4/3] ${isDark ? 'border-slate-800 bg-slate-900' : 'border-white bg-slate-200'}`}>
              <img
                src={about.image}
                alt="Alchemist Academy Campus"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating Location Badge */}
            <div className={`absolute -bottom-6 -right-4 sm:right-6 p-5 rounded-2xl shadow-xl max-w-xs flex items-start gap-3 ${
              isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-100 text-slate-900'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{about.locationBadgeTitle}</h4>
                <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{about.locationBadgeDesc}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Mission & Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isDark ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-700'
            }`}>
              <Compass className="w-3.5 h-3.5" />
              <span>{about.badge || 'About Our Institution'}</span>
            </div>

            <h2 className={`font-serif-brand font-bold text-3xl sm:text-4xl leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {about.title}
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.description1}
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.description2}
            </p>

            {/* Core Values Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {about.values && about.values.map((val, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 text-xs sm:text-sm font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{val}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Visit Our Campus</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('academics')}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Explore Academics</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Key Numbers / Stats Component */}
      <Stats />

      {/* 4 Core Pillars of Excellence */}
      <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
              Foundational Principles
            </span>
            <h2 className={`font-serif-brand font-bold text-3xl sm:text-4xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              The Four Pillars of Alchemist Academy
            </h2>
            <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Balancing scholarship, ethical conduct, creative discovery, and athletic vigor in harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                      : 'bg-slate-50 border-slate-200/80 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className={`font-serif-brand font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {pillar.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Vision & Leadership Message (e.g., Vice Principal or About Leaders) */}
      <HeadmasterQuote page="about" />

      {/* Grade Stages Progression */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500">
            Educational Trajectory
          </span>
          <h2 className={`font-serif-brand font-bold text-3xl sm:text-4xl mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            From First Steps to Grade 10 Graduation
          </h2>
          <p className={`text-sm mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            A continuous, developmentally responsive pathway supporting every milestone of childhood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((item, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-3xl font-serif-brand font-bold text-amber-500/30 mb-2">
                0{i + 1}
              </div>
              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 ${
                isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.grades}
              </span>
              <h4 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.stage}</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ready to Experience Alchemist Academy CTA Banner */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-center text-white relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Join Our Community</span>
          <h3 className="font-serif-brand font-bold text-2xl sm:text-3xl mt-2 mb-4">Experience Alchemist Academy in Person</h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto mb-8">
            Schedule a private campus tour, meet our faculty, and discover how our child-centered approach unlocks your child's highest potential.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Schedule Campus Visit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('academics')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Explore Curriculum</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

