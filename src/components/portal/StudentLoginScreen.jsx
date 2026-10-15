import React, { useState } from 'react';
import { GraduationCap, Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound, UserCheck } from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';
import { useSchoolData } from '../../context/SchoolDataContext';

const StudentLoginScreen = ({ onLoginSuccess }) => {
  const { siteData, navigateTo } = useSiteData();
  const { branding } = siteData;
  const { schoolData } = useSchoolData();
  const { student, classRoster } = schoolData;

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanId || !cleanPin) {
      setErrorMessage('Please provide both student identification and access PIN.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Check default student Aarav Sharma
      const isDefaultMatch =
        cleanId === student.registrationNo.toLowerCase() ||
        cleanId === String(student.rollNo) ||
        cleanId === student.id.toLowerCase() ||
        cleanId === 'aarav' ||
        cleanId === '14';

      // Or check any student in class roster
      const rosterMatch = classRoster?.find(
        (s) =>
          String(s.rollNo) === cleanId ||
          (s.id && s.id.toLowerCase() === cleanId) ||
          s.name.toLowerCase().includes(cleanId)
      );

      // Accepted PINs: '2083' (Nepali year), '1234', '1049', or matching dob
      const isPinValid =
        cleanPin === '2083' ||
        cleanPin === '1234' ||
        cleanPin === '1049' ||
        cleanPin === student.dob ||
        cleanPin === '2010';

      if ((isDefaultMatch || rosterMatch) && isPinValid) {
        sessionStorage.setItem(
          '_aa_student_auth_session',
          JSON.stringify({
            authenticated: true,
            studentId: rosterMatch?.id || student.id,
            studentName: rosterMatch?.name || student.name,
            timestamp: Date.now(),
          })
        );
        setSubmitting(false);
        onLoginSuccess();
      } else {
        setSubmitting(false);
        setErrorMessage('Invalid Student ID or PIN. Please check your credentials and try again.');
      }
    }, 450);
  };

  const handleAutoFill = () => {
    setIdentifier(student.registrationNo || 'AA-2026-1049');
    setPin('2083');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

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
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            {branding.name}
          </span>
          <h1 className="text-2xl font-bold font-serif-brand text-white mt-2">
            Student & Parent Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Secure digital access for attendance, terminal report cards, bus live transit, homework & fee invoices.
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
              Registration No or Roll Number
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. AA-2026-1049 or Roll 14"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Access PIN / Security Passcode
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN (e.g. 2083)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all pr-11 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Verifying Student Token...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Access Student Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Demo Access Verification:</span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[11px] font-bold text-amber-400 underline hover:text-amber-300 cursor-pointer"
              >
                [Auto-Fill Demo]
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-left">
              Reg No: <span className="text-amber-400 font-bold">AA-2026-1049</span> (or Roll <span className="text-amber-400 font-bold">14</span>) • PIN: <span className="text-amber-400 font-bold">2083</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginScreen;
