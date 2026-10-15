import React, { useState } from 'react';
import { School, Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound, UserCheck, LayoutDashboard } from 'lucide-react';
import { useSiteData } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { sanitizeText } from '../../utils/security';

const SMSLoginScreen = ({ onLoginSuccess }) => {
  const { siteData, navigateTo } = useSiteData();
  const { branding } = siteData;
  const { login, authError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    const cleanUser = sanitizeText(username);
    if (!cleanUser || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    const ok = await login(cleanUser, password);
    setSubmitting(false);

    if (ok) {
      onLoginSuccess();
    } else {
      setLocalError(authError || 'Invalid credentials or security rate limiter active.');
    }
  };

  const handleSelectRoleAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

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
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <School className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            {branding.name} ERP
          </span>
          <h1 className="text-2xl font-bold font-serif-brand text-white mt-2">
            School Management System (SMS)
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Authorized administrative gateway for Admissions CRM, Student SIS, CDC Grading, Faculty Rosters, and Cashier Fee Counter.
          </p>
        </div>

        {/* Error notification */}
        {(localError || authError) && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Staff Username / Account ID
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Security Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all pr-11 font-mono"
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
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span>Verifying Administrative Session...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter School Management System</span>
              </>
            )}
          </button>
        </form>

        {/* Role Quick Selector Box for testing all 7 roles */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300">Test Accounts (7 Roles):</span>
              <span className="text-[10px] text-emerald-400 font-mono">Bcrypt & Rate Limiting</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { label: 'Admin', u: 'admin', p: 'Admin@2026' },
                { label: 'Principal', u: 'principal', p: 'Principal@2026' },
                { label: 'Teacher', u: 'teacher', p: 'Teacher@2026' },
                { label: 'Accountant', u: 'accountant', p: 'Accountant@2026' },
                { label: 'Librarian', u: 'librarian', p: 'Librarian@2026' },
                { label: 'Parent', u: 'parent', p: 'Parent@2026' },
                { label: 'Student', u: 'student', p: 'Student@2026' },
              ].map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => handleSelectRoleAccount(acc.u, acc.p)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    username === acc.u
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSLoginScreen;

