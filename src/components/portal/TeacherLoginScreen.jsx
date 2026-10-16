import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  UserCheck,
  Sparkles,
  GraduationCap,
  ChevronRight,
  School,
  CheckCircle2,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';
import { useSchoolData } from '../../context/SchoolDataContext';

const FACULTY_MEMBERS = [
  {
    id: 'TCH-102',
    name: 'RJ Rana',
    email: 'rj.rana@alchemist.edu.np',
    role: 'Senior Academic Guide & Mathematics Coordinator',
    subject: 'Compulsory Mathematics',
    secondarySubject: 'Optional Mathematics',
    primaryClass: 'Grade 10 - Section A',
    assignedClasses: ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    color: 'from-blue-600 to-indigo-700',
    tag: 'Math Lead',
  },
  {
    id: 'TCH-103',
    name: 'Mandira Adhikari',
    email: 'mandira.adhikari@alchemist.edu.np',
    role: 'Department Head & Senior Nepali Faculty',
    subject: 'Nepali Language & Literature',
    secondarySubject: 'Nepali Grammar',
    primaryClass: 'Grade 10 - Section B',
    assignedClasses: ['Grade 10 - Section A', 'Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    color: 'from-amber-600 to-rose-600',
    tag: 'Nepali Specialist',
  },
  {
    id: 'TCH-104',
    name: 'Bikram Karki',
    email: 'bikram.karki@alchemist.edu.np',
    role: 'Science Laboratory In-Charge & Class Mentor',
    subject: 'Compulsory Science & Technology',
    secondarySubject: 'Environmental Science',
    primaryClass: 'Grade 9 - Section A',
    assignedClasses: ['Grade 9 - Section A', 'Grade 10 - Section A', 'Grade 10 - Section B'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    color: 'from-emerald-600 to-teal-700',
    tag: 'Science Lead',
  },
  {
    id: 'TCH-105',
    name: 'Dr. K. Acharya',
    email: 'dr.acharya@alchemist.edu.np',
    role: 'Higher Secondary Academic Coordinator',
    subject: 'Physics & Advanced STEM',
    secondarySubject: 'Applied Chemistry',
    primaryClass: 'Grade 11 - Section A (Bio-Math)',
    assignedClasses: ['Grade 11 - Section A (Bio-Math)', 'Grade 12 - Section A (Accounts & Eco)'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    color: 'from-purple-600 to-indigo-800',
    tag: '+2 Science Head',
  },
  {
    id: 'TCH-106',
    name: 'Suman Shrestha',
    email: 'suman.shrestha@alchemist.edu.np',
    role: 'Social Studies & Moral Education Lead',
    subject: 'Social Studies & Life Skills',
    secondarySubject: 'Civics',
    primaryClass: 'Grade 10 - Section B',
    assignedClasses: ['Grade 10 - Section B', 'Grade 9 - Section A'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    color: 'from-cyan-600 to-blue-700',
    tag: 'Social Studies',
  },
];

const TeacherLoginScreen = ({ onLoginSuccess }) => {
  const { siteData, navigateTo } = useSiteData();
  const { branding } = siteData;
  const { schoolData } = useSchoolData();
  const { teacher } = schoolData;

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = (faculty) => {
    sessionStorage.setItem(
      '_aa_teacher_auth_session',
      JSON.stringify({
        authenticated: true,
        teacherId: faculty.id,
        teacherName: faculty.name,
        teacherEmail: faculty.email,
        teacherRole: faculty.role,
        teacherSubject: faculty.subject,
        teacherAvatar: faculty.avatar,
        primaryClass: faculty.primaryClass,
        assignedClasses: faculty.assignedClasses || [faculty.primaryClass],
        timestamp: Date.now(),
      })
    );
    if (onLoginSuccess) {
      onLoginSuccess(faculty);
    }
  };

  const handleInstantLaunch = (faculty = FACULTY_MEMBERS[0]) => {
    executeLogin(faculty);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = emailOrId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setErrorMessage('Please provide faculty name, ID, or institutional email.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Find matching faculty or fallback to RJ Rana
      const matched = FACULTY_MEMBERS.find(
        (f) =>
          cleanInput === f.id.toLowerCase() ||
          cleanInput === f.email.toLowerCase() ||
          cleanInput === f.name.toLowerCase() ||
          cleanInput.includes(f.name.toLowerCase().split(' ')[0]) ||
          f.name.toLowerCase().includes(cleanInput)
      ) || FACULTY_MEMBERS[0];

      setSubmitting(false);
      executeLogin(matched);
    }, 300);
  };

  const handleAutoFill = () => {
    setEmailOrId('rj.rana@alchemist.edu.np');
    setPassword('2083');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 z-10 px-2">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>School Website</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('sms')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 cursor-pointer shadow-sm"
        >
          <School className="w-4 h-4" />
          <span>SMS Management System</span>
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        {/* Left Column: Quick 1-Click Faculty Picker */}
        <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Instant 1-Click Faculty Launch</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif-brand text-white leading-tight">
              Teacher Cockpit Gateway
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Select any faculty member below to enter their personalized academic cockpit. Roll call attendance, daily period routine, homework grading, and terminal marksheets.
            </p>

            {/* Quick 1-Click Launch Button for Primary Lead */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={FACULTY_MEMBERS[0].avatar}
                  alt={FACULTY_MEMBERS[0].name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-400/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{FACULTY_MEMBERS[0].name}</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      Primary Faculty
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-300 font-medium">{FACULTY_MEMBERS[0].subject}</p>
                  <p className="text-[10px] text-slate-400">{FACULTY_MEMBERS[0].primaryClass}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleInstantLaunch(FACULTY_MEMBERS[0])}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch Cockpit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Other Faculty Cards Grid */}
            <div className="mt-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Or Switch & Enter as Another Instructor:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FACULTY_MEMBERS.slice(1).map((faculty) => (
                  <button
                    key={faculty.id}
                    type="button"
                    onClick={() => handleInstantLaunch(faculty)}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 text-left transition-all group cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={faculty.avatar}
                      alt={faculty.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-blue-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate group-hover:text-blue-300">
                          {faculty.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {faculty.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{faculty.subject}</p>
                      <p className="text-[10px] text-slate-500 truncate">{faculty.primaryClass}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time sync with School Management System</span>
            </span>
            <span className="font-mono text-slate-500">Academic Year 2083 BS</span>
          </div>
        </div>

        {/* Right Column: Direct Sign-in Form */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-white">Manual Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter any faculty email or ID to access their cockpit dashboard.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 mt-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Faculty Name, ID or Email
                </label>
                <input
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="e.g. RJ Rana, Mandira, or TCH-102"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Faculty PIN / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. 2083 or any password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {submitting ? (
                  <span>Authenticating Faculty...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter Cockpit</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Demo Quick-Fill:</span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="font-bold text-blue-400 underline hover:text-blue-300 cursor-pointer"
              >
                Auto-fill RJ Rana (2083)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginScreen;
