import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, AlertTriangle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteData } from '../context/SiteContext';
import { sanitizeText } from '../utils/security';

const AdminLogin = () => {
  const { login, authError } = useAuth();
  const { navigateTo } = useSiteData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const cleanUser = sanitizeText(username);
    if (!cleanUser || !password) {
      setLocalError('Please enter both administrator username and security key.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const ok = login(cleanUser, password);
      setSubmitting(false);
      if (ok) {
        navigateTo('dashboard');
      }
    }, 400); // intentional micro-delay to deter brute-force timing attacks
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Back to public site button */}
      <button
        onClick={() => navigateTo('landing')}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg bg-slate-900 border border-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to School Website</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-serif-brand text-white">
            Administrative Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Authorized staff & academic directors only. Unauthorized access attempts are monitored and recorded.
          </p>
        </div>

        {/* Error notification */}
        {(localError || authError) && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Staff Username
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Administrative Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Verifying Cryptographic Credentials...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Authenticate Session</span>
              </>
            )}
          </button>
        </form>

        {/* Multi-Role Quick Access & Demonstration Panel */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Select Role for Quick Demonstration:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('AlchemistAdmin2026');
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-left transition-all cursor-pointer"
            >
              <div className="font-bold">Superadmin</div>
              <div className="text-[10px] text-slate-400">Full Unrestricted Access</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('editor');
                setPassword('EditorPass2026');
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-blue-500/30 text-blue-300 text-left transition-all cursor-pointer"
            >
              <div className="font-bold">Content Editor</div>
              <div className="text-[10px] text-slate-400">Blogs & Activities only</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('admissions');
                setPassword('AdmissionsPass2026');
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-left transition-all cursor-pointer"
            >
              <div className="font-bold">Admissions Officer</div>
              <div className="text-[10px] text-slate-400">Admissions & Stats only</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('coordinator');
                setPassword('AcademicPass2026');
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-left transition-all cursor-pointer"
            >
              <div className="font-bold">Academic Coord.</div>
              <div className="text-[10px] text-slate-400">Curriculum & About only</div>
            </button>
          </div>
        </div>

      </div>

      <p className="text-center text-[11px] text-slate-600 mt-8">
        © 2026 Alchemist Academy Security Subsystem • Protected by RBAC & Session Cryptography
      </p>
    </div>
  );
};

export default AdminLogin;

