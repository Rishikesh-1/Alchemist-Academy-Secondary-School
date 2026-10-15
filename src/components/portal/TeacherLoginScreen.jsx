import React, { useState } from 'react';
import { BookOpen, Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound, UserCheck } from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';
import { useSchoolData } from '../../context/SchoolDataContext';

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

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = emailOrId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMessage('Please provide both faculty identity and security password.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const isTeacherMatch =
        cleanInput === (teacher?.email || '').toLowerCase() ||
        cleanInput === (teacher?.id || '').toLowerCase() ||
        cleanInput === 'rj.rana' ||
        cleanInput === 'rana' ||
        cleanInput === 'teacher';

      // Accepted PINs: '2083', 'teacher123', 'admin', 'admin123'
      const isPassValid =
        cleanPass === '2083' ||
        cleanPass === 'teacher123' ||
        cleanPass === 'admin' ||
        cleanPass === 'admin123';

      if (isTeacherMatch && isPassValid) {
        sessionStorage.setItem(
          '_aa_teacher_auth_session',
          JSON.stringify({
            authenticated: true,
            teacherId: teacher?.id || 'TCH-102',
            teacherName: teacher?.name || 'RJ Rana',
            timestamp: Date.now(),
          })
        );
        setSubmitting(false);
        onLoginSuccess();
      } else {
        setSubmitting(false);
        setErrorMessage('Invalid Faculty ID or Password. Only authorized instructors can access the Cockpit.');
      }
    }, 450);
  };

  const handleAutoFill = () => {
    setEmailOrId(teacher?.email || 'rj.rana@alchemist.edu.np');
    setPassword('2083');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to public site button */}
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to School Website</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
            {branding.name} Faculty Workspace
          </span>
          <h1 className="text-2xl font-bold font-serif-brand text-white mt-2">
            Teacher Cockpit Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Restricted access for academic guides. Roll call attendance, terminal marks entry, syllabus tracker & doubts resolution.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Faculty ID or Institutional Email
            </label>
            <input
              type="text"
              required
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              placeholder="e.g. rj.rana@alchemist.edu.np or TCH-102"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Faculty Security Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all pr-11 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Authenticating Faculty Credential...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Faculty Cockpit</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Demo Faculty Credentials:</span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[11px] font-bold text-blue-400 underline hover:text-blue-300 cursor-pointer"
              >
                [Auto-Fill Demo]
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-left">
              ID: <span className="text-blue-400 font-bold">TCH-102</span> (or <span className="text-blue-400 font-bold">rj.rana@alchemist.edu.np</span>) • PIN: <span className="text-blue-400 font-bold">2083</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginScreen;

