import React from 'react';
import {
  BookOpen,
  Laptop,
  Microscope,
  Palette,
  Music,
  Trophy,
  Activity,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSiteData } from '../context/SiteContext';

const getIcon = (name) => {
  switch (name) {
    case 'Palette':
      return <Palette className="w-5 h-5" />;
    case 'Music':
      return <Music className="w-5 h-5" />;
    case 'Laptop':
      return <Laptop className="w-5 h-5" />;
    case 'Microscope':
      return <Microscope className="w-5 h-5" />;
    case 'Trophy':
      return <Trophy className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
};

const AcademicsPage = () => {
  const { siteData, navigateTo } = useSiteData();
  const { curriculum } = siteData;

  const academicFeatures = [
    {
      title: 'Individualized Student Mentorship',
      desc: 'With a 25:1 student-to-teacher ratio, our educators provide personalized feedback and academic guidance.',
    },
    {
      title: 'Hands-on Science & STEM Workshops',
      desc: 'Practical lab experimentation and coding exercises bridge abstract theories with tangible discoveries.',
    },
    {
      title: 'Multidisciplinary Creative Arts',
      desc: 'Integrating music, dance, and fine arts into daily curriculum reinforces neuro-cognitive and emotional development.',
    },
    {
      title: 'SEE Rigor & Board Preparation',
      desc: 'Systematic revision cycles, mock tests, and conceptual clinics ensure 100% distinction outcomes in board examinations.',
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
            <span className="text-slate-300">Academics & Curriculum</span>
          </nav>
          
          <h1 className="font-serif-brand font-bold text-3xl sm:text-5xl tracking-tight text-white max-w-2xl">
            A Comprehensive, Modern Curriculum
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            From foundational early childhood reading to advanced secondary STEM laboratories and expressive fine arts, our pedagogical framework nurtures the whole child.
          </p>
        </div>
      </section>

      {/* Curriculum Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
            Disciplines of Excellence
          </span>
          <h2 className="font-serif-brand font-bold text-3xl sm:text-4xl text-slate-900 mt-2">
            6 Specialized Pathways of Discovery
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            Every learner at Alchemist Academy explores balanced intellectual, artistic, and physical pursuits under expert faculty guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {curriculum && curriculum.map((subject) => (
            <div
              key={subject.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Subject Image Cover */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={subject.image}
                  alt={subject.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                  {getIcon(subject.icon)}
                  <span>{subject.badge}</span>
                </div>
              </div>

              {/* Subject Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-brand font-bold text-xl text-slate-900 group-hover:text-amber-600 transition-colors">
                    {subject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
                    {subject.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Nursery – Grade 10</span>
                  <button
                    onClick={() => navigateTo('contact')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inquire Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology & Examination Rigor */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                Pedagogical Rigor
              </span>
              <h2 className="font-serif-brand font-bold text-3xl sm:text-4xl text-slate-900">
                Continuous Evaluation & Proven SEE Results
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Rather than relying solely on high-stakes end-of-year testing, Alchemist Academy implements a continuous assessment framework. Formative projects, practical laboratory assessments, and regular reviews build confidence.
              </p>

              <div className="space-y-4 pt-2">
                {academicFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{feat.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Excellence Benchmark</span>
              </div>
              <h3 className="font-serif-brand font-bold text-2xl text-white">
                Ready to Join Our Academic Community?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Admissions are open for Nursery through Grade 9 for the new academic intake. Schedule a personal interaction with our academic counseling team today.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('contact')}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default AcademicsPage;

